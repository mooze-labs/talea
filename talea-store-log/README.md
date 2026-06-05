# talea-store-log

Append-only event-log implementation of the `Store` trait from `talea-core`, for the [talea](https://github.com/mooze-labs/talea) ledger. No database required: one CRC-framed JSON log file per book, fsynced on every commit batch.

- **One writer task per book over in-memory state.** All writes to a book are serialised through a single Tokio task; `BookState` (balances, idempotency index, posting history) lives entirely in memory and is updated only after a successful fsync.
- **Strict ack-after-fsync.** No reply leaves the writer until `sync_all` returns `Ok` for the batch containing it. A failed fsync kills the writer permanently — the process retrying with the same idempotency key is always safe.
- **Group commit.** The writer drains all pending jobs before calling fsync once. At high concurrency many client requests share one fsync, so throughput scales with batch size rather than per-request fsync rate.
- **In-memory projection.** Balances, posting history, and the idempotency index are rebuilt from the log (or from a snapshot + log tail) at startup. Reads never touch disk on the hot path.

```rust
use talea_store_log::LogTaleaStore;

let store = LogTaleaStore::open(std::path::Path::new("./data")).await?;
```

## Selection

Pass `log://<dir>` as `TALEA_DB_URL` (or `--db-url`):

```bash
cargo run -p talead -- init  --db-url log://./data
cargo run -p talead -- serve
```

Three env tunables apply only when the `log://` backend is active:

| Variable | Default | Meaning |
|---|---|---|
| `TALEA_LOG_SNAPSHOT_EVERY` | `100000` | Events between automatic snapshots; `0` disables |
| `TALEA_LOG_IDEM_HOT_CAP` | `1000000` | Max idempotency keys held in memory before spilling to disk |
| `TALEA_LOG_SEGMENT_MAX` | `134217728` (128 MiB) | Rotate to a new segment file when the active file reaches this size |

## On-disk layout

```
<dir>/
  LOCK                              ← exclusive advisory lock, held for process lifetime
  books/
    _system/                        ← system book (asset registrations)
      segment-00000000000000000001.log
      snapshot-00000000000000000042.snap
      idem-000000.run
    <book>/
      segment-<seq:020>.log         ← one or more segment files
      snapshot-<seq:020>.snap       ← zero, one, or two retained snapshots
      idem-<n:06>.run               ← zero or more spill-run files
```

Segment files are named by the base sequence of their first event. Snapshot files are named by the sequence of the last event they capture. Idem run files are named by an incrementing counter.

## Durability and recovery

**Frame format.** Each event is a `u32-LE payload_len | u32-LE crc32(payload) | JSON payload` frame. The 8-byte header makes torn-write detection deterministic.

**Torn tail on the final segment** is repaired automatically at startup: the segment is truncated to the last complete good frame. This is the only safe repair. A decode failure in any sealed (non-final) segment is treated as corruption and refuses startup with an error naming the segment and byte offset.

**Snapshots** are written atomically (tmp → sync → rename → dir-fsync). They are an optimisation that bounds startup replay time — the log is the truth. A corrupt or missing snapshot causes a full replay from genesis; startup never requires a valid snapshot. Two snapshots are retained after each write; older ones are pruned.

**Idem spill runs** hold idempotency keys that have been evicted from the hot in-memory map. The Bloom filter is rebuilt purely from run file contents at `attach_dir` time — nothing bloom-related is persisted, eliminating staleness windows. A run with a CRC failure triggers a full log scan to rebuild the index from scratch.

**Segments are never deleted** — the same keep-everything policy as the SQL backends. Clean up old segments with an out-of-band operator process after verifying the data is no longer needed.

## Performance

Group commit means throughput is roughly proportional to batch size: a burst of concurrent writers shares one `F_FULLFSYNC` (~3 ms on the dev laptop) rather than paying per request.

Measured on the dev laptop (Apple Silicon, NVMe), `post-one-book` scenario, 30-second run:

| Concurrency | Throughput | p50 | p99 |
|---|---|---|---|
| c64 | ~6 600 tx/s | ~9.5 ms | ~17 ms |
| c128 | ~9 500 tx/s | ~13 ms | ~19 ms |

For comparison: the Postgres baseline on the same machine is ~810 tx/s. The single-commit floor (one request, no batching peers) is one `F_FULLFSYNC` ≈ 3 ms.

## Known limits

- **Single-process only.** The `LOCK` file is an advisory exclusive lock (fs4). A second `open` on the same directory — from the same or a different process — returns an error. Use Postgres for multi-instance deployments.
- **In-memory state grows with book size.** Account balances, per-account posting history, and the txid index are all held in memory for the lifetime of the process. The idempotency index is bounded by `TALEA_LOG_IDEM_HOT_CAP`; older keys spill to on-disk run files.
- **Lifetime trial-balance sums saturate.** The `trial_balance` debit/credit lifetime sums are `i64` and saturate at `i64::MAX` rather than failing after an fsync. A warning is logged at saturation; individual account balances continue to enforce overflow rejection at commit time.
- **Subscribe and read consistency = durability watermark.** `subscribe`, `read_events`, and `trial_balance` filter out frames that are page-cache-visible but not yet fsynced. The ceiling is `next_seq - 1`; any frame with `seq > ceiling` is a dirty read and is withheld until the next batch applies it. This is the same guarantee as the SQL backends.

## Conformance

This crate passes the shared [`talea-store-conformance`](../talea-store-conformance/README.md) suite:

```bash
cargo test -p talea-store-log
```

See the [workspace README](../README.md) for the full picture.
