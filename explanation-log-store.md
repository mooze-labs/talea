# Why the append-log store works this way

The design rationale for `talea-store-log`, the embedded append-log backend. For the file formats and tunables see the [crate reference](../talea-store-log/README.md); for deployment see the [how-to](howto-run-on-the-log-store.md); for the ledger-wide design decisions this backend inherits, see [Architecture & design](explanation-architecture.md).

## The problem

A ledger commit must be durable before it is acknowledged — an acked-then-lost commit is the one failure a ledger cannot have. Durability costs an fsync, and an fsync costs milliseconds (~3 ms `F_FULLFSYNC` on a laptop, sub-millisecond on server NVMe). Paying it per request caps a writer at a few hundred commits per second no matter how fast everything else is.

The SQL backends pay that cost *plus* network round-trips, lock acquisition, and SQL execution — measured on the same laptop, Postgres peaks around 810 commits/s on one book. The question this backend answers: how much of that ceiling is essential, and how much is paying for capabilities (multi-instance coordination, SQL access) a single-node deployment doesn't use?

## The approach

### The log is the ledger

talea is already event-sourced: every write is an event, and balances are projections ([why](explanation-architecture.md#event-sourcing-with-projections-in-the-same-transaction)). The SQL backends store the events in a database and maintain projections in the same transaction. This backend takes the idea literally: the event log *is* the storage — one append-only file sequence per book — and the projections live in memory, rebuilt from the log at startup. There is no second source of truth to keep consistent, so there is no transaction to coordinate. What the SQL backends get from ACID, this backend gets from a write protocol:

```
            per-book writer task
  ┌──────────────────────────────────────┐
  │ drain queued commits (group)         │
  │ validate against in-memory state     │   rejects reply per-draft,
  │ append CRC-framed events             │   never poison batchmates
  │ fsync — ONCE for the whole batch     │
  │ apply to in-memory state             │
  │ ack callers, publish to subscribers  │
  └──────────────────────────────────────┘
```

The order is the invariant: **nothing is acknowledged before its bytes are synced, and nothing is applied to readable state before it is durable.** A failed fsync kills the writer rather than continuing into unknowable disk state — callers see an error and retry with the same idempotency key, which is always safe.

### One writer per book

The SQL backends keep sequences gapless with a per-book counter-row lock — the database serializes writers across instances. This backend has no database, so the arbiter moves into the process: one Tokio task owns each book, and *all* writes flow through it. Sequence assignment is a local increment; idempotency checks are a map lookup; min-balance validation reads memory. The single-writer model is also why commit timestamps stay monotonic with sequence numbers without any clock coordination.

**Trade-off:** the arbiter being in-process is exactly why this backend is single-process (enforced by a directory lock). Two processes can't share an in-memory arbiter. Multi-instance deployments belong on Postgres, where the database is the arbiter every instance can see.

### Group commit is the whole performance story

Throughput = batch size ÷ fsync latency. One lone committer pays a full fsync (~3 ms → ~330 commits/s — the measured c1 floor). Sixty-four concurrent committers share one fsync and the same hardware does ~6,600/s; at c128, ~9,500/s. Nothing about the disk changed — the batches got fuller. This is the same group-commit idea the server's write router applies to SQL transactions, applied at the fsync instead.

**Trade-off:** worst-case latency is best-case batching. A solo commit can't amortize anything and pays the full fsync alone.

### Recovery trusts CRCs, not luck

Every event is a length-prefixed, CRC-checked frame, which makes crash states classifiable instead of mysterious:

- **A damaged tail on the *final* segment is a torn write.** Truncate to the last good frame and continue. Safe by the ack-after-fsync invariant: bytes past the last completed fsync were never acknowledged, so dropping them breaks no promise.
- **Damage anywhere in a *sealed* segment is corruption.** Sealed segments are immutable after rotation; a bad CRC there means the storage lied. Startup refuses, naming the segment and offset. No silent repair of acked history, ever.

Snapshots bound startup time (replay from the snapshot's sequence instead of genesis) but carry no authority: they're written atomically, validated on load, and a bad one just means a longer replay. The same principle applies to the idempotency index's spill files and Bloom filter — disk-resident caches are either CRC-valid or rebuilt from the log. Nothing the store cannot rebuild is ever trusted.

## Trade-offs

- **Single-process.** The arbiter is in-process; the directory lock enforces it. This is the capability you give up relative to Postgres.
- **Memory grows with book size.** Balances, posting history, and the transaction index stay in memory. The idempotency index is the bounded exception (hot cap + disk spill).
- **Reads stop at the durability watermark.** Log-scanning reads (`read_events`, point-in-time trial balance, subscriptions) withhold frames newer than the last applied batch — durable-and-applied or invisible, never a dirty read.
- **Disk only grows.** Segments are never deleted; the log is the audit trail, same policy as the SQL backends.
- **Lifetime trial-balance sums saturate** at `i64::MAX` (with a logged warning) instead of failing after an fsync; per-account balances still reject overflow at validation time.

## Alternatives considered

- **A lock-free ring buffer (LMAX Disruptor) for the writer queue.** The Disruptor solves inter-thread handoff costs measured in microseconds; this writer's budget is dominated by a multi-millisecond fsync and HTTP request handling. A plain channel into one task captures the LMAX architecture's actual win here — single-writer business logic over in-memory state — without the machinery. Revisit only if the fsync and request path ever stop dominating.
- **Relaxed durability (periodic fsync).** Higher throughput, but an acked commit could vanish in a crash. Rejected without discussion — this is a ledger.
- **Compaction/pruning of old segments.** Reclaims disk by destroying the audit trail; the SQL backends keep every event too. Rejected. Operators who truly need to archive can do it out-of-band, deliberately.
- **A real embedded database (e.g. an LSM library) instead of hand-rolled segments.** Would supply files and recovery for free, but hides the fsync schedule — the one thing this backend exists to control — and brings its own compaction (see above). The frame/segment layer is ~600 lines and exhaustively crash-tested; the trade was judged worth it.

## Related

- [`talea-store-log` reference](../talea-store-log/README.md) — formats, tunables, measured numbers, known limits
- [How to run on the append-log store](howto-run-on-the-log-store.md) — deployment, backups, troubleshooting
- [Architecture & design](explanation-architecture.md) — the ledger-wide invariants every backend implements
