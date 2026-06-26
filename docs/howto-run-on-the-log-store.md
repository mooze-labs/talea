# How to run talea on the append-log store

Run a single-node talea with no external services at all: storage is a directory of append-only log files, durability is an fsync per commit batch, and single-book write throughput is roughly 10× the Postgres backend on the same hardware. Result: one `talead` instance you can put real traffic on, as long as one instance is all you need.

**Choose this backend when** you want embedded deployment (no database to operate) with the highest single-book write throughput. **Choose Postgres instead when** you need multiple server instances, SQL access to the ledger, or operational tooling you already have for a database. The [SQLite path](tutorial-first-ledger.md) remains the zero-setup default for development.

## Prerequisites

- Rust toolchain (builds the workspace)
- The repo checked out; commands run from its root
- Nothing else — no Docker, no database

## Steps

1. Initialize: create the data directory, generate an API token, write `.env`:

   ```bash
   cargo run -p talead -- init --db-url log://./talea-data
   ```

   This writes `TALEA_DB_URL`, `TALEA_API_TOKEN`, and `TALEA_BIND` to `.env`. There are no migrations to run — the store creates its layout on first open. If `talea.seed.toml` exists, its assets and accounts are applied idempotently. Re-running `init` is safe; `--force` regenerates the token.

2. Serve:

   ```bash
   cargo run -p talead -- serve
   ```

   `serve` loads `.env` from the working directory; real environment variables take priority. The defaults to revisit for production:

   | Variable | Default | Set it when |
   |---|---|---|
   | `TALEA_BIND` | `127.0.0.1:8080` | Exposing beyond localhost |
   | `TALEA_MAX_INFLIGHT` | `256` | Tuning the shed point — this is also the practical batch-size ceiling for group commit |
   | `TALEA_WRITE_QUEUE_DEPTH` / `TALEA_WRITE_BATCH_MAX` | `256` / `64` | Hot-book write tuning |
   | `TALEA_LOG_SNAPSHOT_EVERY` | `100000` | Trading startup time against snapshot frequency; `0` disables snapshots (startup replays the whole log) |
   | `TALEA_LOG_IDEM_HOT_CAP` | `1000000` | Bounding idempotency-index memory; older keys spill to disk |
   | `TALEA_LOG_SEGMENT_MAX` | 128 MiB | Segment file rotation size |
   | `TALEA_METRICS_BIND` | unset | You want Prometheus metrics (note: the DB pool gauges read 0 — there is no pool) |

3. (Recommended) Scope tokens per service, exactly as on Postgres — the tokens file works identically on every backend. Follow [step 4 of the Postgres how-to](howto-run-on-postgres.md); nothing about it is backend-specific.

4. Configure your load balancer against `/health` as **readiness, not liveness** — same rule as every backend ([why](explanation-architecture.md#admission-control-and-why-health-is-inside-it)).

## Verification

```bash
export TALEA_TOKEN=$(grep TALEA_API_TOKEN .env | cut -d= -f2)
curl -i http://127.0.0.1:8080/health
# HTTP/1.1 200 OK
# x-talea-backend: log
cargo run -p talea-cli -- trial-balance --book demo
```

`x-talea-backend: log` confirms you're on the store you think you're on.

## One process, one directory

The store takes an exclusive advisory lock on `<dir>/LOCK` for the life of the process. A second `talead` against the same directory fails at startup with `data dir already locked`. This is the design, not a limitation to work around: the write arbiter that keeps sequences gapless lives *inside* the process ([why](explanation-log-store.md#one-writer-per-book)). The lock is released by the OS when the process exits, however it exits — a crash never leaves a stale lock.

Multi-instance deployments need a write arbiter every instance can see; that's the database backends. See [How to run on Postgres](howto-run-on-postgres.md).

## Backups

The data directory is the ledger. Two safe ways to copy it:

- **Stop the process, copy the directory.** Exact and simple.
- **Filesystem snapshots** (APFS, ZFS, LVM): a snapshot taken while the server runs is a crash image — on restore, startup repairs the (possibly torn) tail of each book's final segment and recovers every acked commit that reached disk.

Avoid a plain `cp`/`rsync` of a *live* directory: files copied at different moments can disagree (a half-copied sealed segment looks like real corruption and the copy will refuse to start). If you can't stop the process and don't have filesystem snapshots, copy via a brief maintenance window.

Segments are never deleted by the server. Disk usage grows with ledger history — the same keep-everything policy as the SQL backends' event tables.

## Troubleshooting

- **`data dir already locked by another process`** — another `talead` (or any process holding the store) has the directory open. One process per directory; point the second instance at its own directory or use Postgres.
- **Startup fails with `corrupt frame in sealed segment ... at offset ...`** — real corruption in an immutable segment (bad disk, truncated copy). This is not auto-repaired; restore the directory from a backup. Only the *final* segment's torn tail is ever repaired automatically.
- **Slow startup on a large ledger** — snapshots bound replay time. If you set `TALEA_LOG_SNAPSHOT_EVERY=0`, startup replays every event from genesis; re-enable snapshots.
- **`429 {"error":"overloaded"}` on posts** — one book's write queue is full. Retrying with the same idempotency key is always safe. The per-book ceiling on this backend is the fsync rate × batch size; raise `TALEA_WRITE_BATCH_MAX` / `TALEA_MAX_INFLIGHT` so batches fill, or split traffic across books.
- **Memory grows over time** — expected: balances, posting history, and the transaction index live in memory and grow with book size. The idempotency index is the exception — it's bounded by `TALEA_LOG_IDEM_HOT_CAP`. See [known limits](../talea-store-log/README.md#known-limits).

## Related

- [`talea-store-log` reference](../talea-store-log/README.md) — file formats, recovery rules, tunables, measured throughput
- [Why the log store works this way](explanation-log-store.md) — group commit, ack-after-fsync, the recovery contract
- [How to run on Postgres](howto-run-on-postgres.md) — the multi-instance path, scoped tokens in full
- [HTTP API reference](reference-http-api.md) — the wire contract is identical on every backend
