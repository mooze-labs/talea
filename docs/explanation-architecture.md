# Architecture & design

Why talea is shaped the way it is. This is the rationale document — for the wire contract see the [HTTP API reference](reference-http-api.md); for hands-on use see the [tutorial](tutorial-first-ledger.md).

## The problem

A ledger for cryptocurrency operations has to stay correct under three hostile conditions at once:

1. **Unreliable networks.** Clients time out, retry, and crash mid-request. A naive ledger double-posts a deposit because the first request succeeded but its response was lost.
2. **Concurrency.** Many writers hit the same book at the same time — from multiple server instances. Orderings must stay consistent and auditable after the fact.
3. **Audit requirements.** "What was the balance at 14:02 UTC?" must have exactly one answer, derivable from records that cannot be silently rewritten.

Most of talea's design falls out of refusing to compromise on any of these.

## The approach

### Event sourcing with projections in the same transaction

Every write is an event in an append-only log. Balances, postings, and registries are *projections* of that log — but unlike classic eventually-consistent event sourcing, talea maintains the projections in the **same database transaction** that appends the event.

```
            one DB transaction
  ┌─────────────────────────────────────┐
  │ append event (seq N)                │
  │ insert postings                     │
  │ upsert balances (+ min_balance gate)│
  │ record idempotency key              │
  └─────────────────────────────────────┘
            commit → NOTIFY subscribers
```

You get event-sourced auditability without read-your-writes anomalies: the moment a commit returns, every read reflects it.

**Trade-off:** projections-in-transaction serializes writes per book and makes commits heavier than a bare append. talea accepts the write ceiling and addresses it with group commit (below) rather than giving up immediate consistency.

### Gapless per-book sequences via a single write arbiter

Each book has a dense sequence `1..N` with no gaps, ever. On the database backends, the implementation is a per-book counter row that the committing transaction locks and increments. That row lock is the **write arbiter**: it serializes commits to a book across threads, processes, *and server instances*, because the database is the single point of coordination. The embedded append-log backend gets the same property from a different arbiter: one in-process writer task per book assigns sequences (single-process by construction, enforced with a directory lock).

**Trade-off:** one hot book = one lock = a throughput ceiling per book. This is deliberate — gaplessness is an audit property worth more than write parallelism within a book. Books are the scaling unit: different books commit fully in parallel.

### Idempotency keys make every retry safe

Every transaction carries a caller-supplied idempotency key, unique per book. Replaying a key returns the original commit (`"deduplicated": true`) instead of posting again. The key is recorded inside the commit transaction, so there is no window where a retry can double-post.

This is the load-bearing decision for the whole system's failure story: timeouts (`408 timeout`), queue backpressure (`429 overloaded`), and admission shedding (`503 overloaded`) are all safe to answer with "retry the same request" — overload degrades to *retry later*, never *maybe applied twice*. The SDK encodes this: its retry policy retries 503/408/transport errors automatically.

The CLI never auto-generates keys (`--idem` is required): a generated key would defeat the purpose, because a retried CLI invocation would generate a *different* key.

### Balances are normal-side-adjusted projections

Raw storage is debits-minus-credits. Reporting adjusts by the account's normal side, so a liability holding 100 reads `+100` rather than `-100`. The payoff is a uniform constraint semantics: `min_balance: 0` means "never overdraw" for **every** account kind, checked at commit time inside the transaction.

### `as_of` replays by commit time, on the database clock

Point-in-time queries (`balance`, `trial-balance` with `?as_of=`) replay postings by *commit* time. Commit timestamps come from the **database clock** (`clock_timestamp()` on Postgres), captured under the counter lock — so they are monotonic with respect to `seq` within a book even when several server instances with skewed clocks share one database. Timestamps are truncated to microseconds because that is what the database stores; what you read back is exactly what was committed.

**Trade-off:** commit time is not business time. `occurred_at` exists for business time, but `as_of` deliberately keys on commit order — the only order the ledger can guarantee was observed.

### Per-book write router with group commit

Inside one server instance, posts to the same book are routed to a per-book committer task with a bounded queue (`TALEA_WRITE_QUEUE_DEPTH`, default 256). The committer drains up to `TALEA_WRITE_BATCH_MAX` (default 64) drafts and commits them in **one** storage transaction — one counter-lock acquisition amortized across the batch.

```
posts ──► per-book queue ──► committer ──► group commit (1 txn, N drafts)
              │ full?
              └──► 429 overloaded + Retry-After (caller retries, same key)
```

A full queue is backpressure, not failure. Validation rejections inside a batch are isolated with savepoints so one bad draft doesn't poison its batchmates.

### Admission control, and why `/health` is inside it

A global in-flight limit (`TALEA_MAX_INFLIGHT`, default 256) sheds excess load immediately as `503` + `Retry-After: 1` instead of queueing toward collapse. `/health` deliberately sits **inside** that limit: a 503 from `/health` is a real load signal. Wire it to load-balancer *readiness* (stop sending traffic) and not *liveness* (restart the instance), or saturation will eject healthy instances exactly when you need them.

### Three stores, one executable contract

`Store` is the persistence trait; Postgres (production, LISTEN/NOTIFY subscriptions), SQLite (embedded, in-process broadcast), and the append-log store (embedded, group commit with strict ack-after-fsync — see [`talea-store-log`](../talea-store-log/README.md)) all implement it. One backend-agnostic conformance suite runs against all three — idempotency, gapless sequences, constraint enforcement, pagination, subscribe catch-up — so "the stores behave identically" is a tested claim, not a hope. The known divergence is documented: the embedded backends' subscriptions only see commits from the same process.

### Trait symmetry: `LedgerService` and `TaleaClient`

`LedgerApi` is implemented twice: by `LedgerService` (in-process, over a `Store`) and by `TaleaClient` (remote, over HTTP). Code written against the trait runs against either — a test proves it. This keeps the HTTP layer honest (it can't grow semantics the trait doesn't have) and makes the SDK's behavior the server's behavior.

## Alternatives considered

- **Optimistic insert with unique-violation retry** instead of the counter-row lock: avoids the lock but produces gaps on conflict and makes cross-instance commit timestamps racy. Rejected — gaplessness is the audit anchor. (A per-book writer actor with the DB lock retained as arbiter was spec'd as the upgrade path and later shipped as the write router.)
- **Async projections** (classic CQRS): higher write throughput, but introduces read-your-writes anomalies and a reconciliation surface. Rejected — a ledger's reads must be trustworthy immediately.
- **Server-generated idempotency keys**: removes a caller burden but defeats retry safety, since a retry would carry a fresh key. Rejected at every layer including the CLI.

## Related

- [HTTP API reference](reference-http-api.md) — the wire contract these decisions produce
- [How to run on Postgres](howto-run-on-postgres.md) — the operational consequences (LB config, PgBouncer, pool sizing)
- [Why the append-log store works this way](explanation-log-store.md) — how the embedded backend meets the same invariants without a database
- [README — Design notes and limits](../README.md#design-notes-and-limits) — accepted limitations in brief
