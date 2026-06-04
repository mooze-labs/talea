# talea-bench

Capacity benchmark suite for `talea-server`. Five scenarios, each
isolating one capacity dimension; every write scenario ends with a
ledger-consistency verification (trial balance + event-count
accounting via probe transactions).

## Caveats — read first

1. **Closed-loop load understates latency at saturation** (coordinated
   omission). Treat results as ceilings and curve shapes, not SLO
   evidence.
2. **Postgres under Docker Desktop on macOS skews commit latency**
   (VM + fsync behavior). Treat absolute numbers as indicative only.

## Setup (Postgres)

```bash
docker compose up -d
cargo run -p talead -- init --db-url postgres://talea:talea@localhost:5432/talea
# Size the pool: each SSE subscriber pins one connection.
# For the default mixed scenario (4 subscribers): subscribers + workers.
TALEA_DB_POOL=24 cargo run -p talead -- serve
```

In another shell:

```bash
export TALEA_TOKEN=$(grep TALEA_API_TOKEN .env | cut -d= -f2)
```

## Run the scenarios in order

```bash
cargo run --release -p talea-bench -- post-one-book
cargo run --release -p talea-bench -- post-many-books
cargo run --release -p talea-bench -- reads          # seeds 20k txs once; re-runs are free
cargo run --release -p talea-bench -- mixed
cargo run --release -p talea-bench -- overload       # concurrency should be ~4x TALEA_MAX_INFLIGHT
```

Always `--release`: a debug-build harness can itself become the
bottleneck. `--url`/`TALEA_URL` and `--token`/`TALEA_TOKEN` work like
the `talea` CLI. `--warmup-secs` (default 5) and `--duration-secs`
(default 30) apply per step. Results: human table on stdout, JSON under
`bench-results/` (gitignored) embedding config + git SHA for later
comparison.

## Reading the curves

- **post-one-book**: throughput should plateau almost immediately
  (the per-book counter-row lock serializes commits); p99 grows with
  queue depth. The plateau is your per-book ceiling, ~1/commit-latency.
- **post-many-books**: aggregate throughput should scale with book
  count until pool/Postgres/fsync saturates. That knee answers "is the
  DB the bottleneck" — and where.
- **reads**: read QPS per endpoint against a 20k-deep book.
- **mixed**: the realistic blend; compare per-op latencies here with
  their isolated curves to see interference. `sse-lag` is commit→
  delivery latency to live subscribers.
- **overload**: `raw-503` shows shedding behavior (goodput must hold);
  `retry-to-success` shows what production clients experience.

During runs, watch where saturation lives:

```bash
docker stats                          # container CPU
docker compose exec postgres psql -U talea -c \
  "SELECT state, wait_event_type, count(*) FROM pg_stat_activity GROUP BY 1,2;"
```

`Lock` waits on the counter row = per-book ceiling. Pool exhaustion in
the server = raise TALEA_DB_POOL. CPU-bound postgres = the DB itself.

## A step is marked [INVALID] when

its non-503 error rate exceeds 1% — its numbers are not trustworthy.
503s are not errors: they are the admission-control design working, and
are reported in their own column.

## Verification

After every write scenario the bench fails (non-zero exit) if any
touched book's trial balance does not balance, or if the book's event
count does not match the number of successful commits (with a
documented tolerance for ambiguous transport outcomes, which are
reported as warnings).

## Smoke tests

`cargo test -p talea-bench` runs every scenario at tiny scale against
the real server router over file-backed SQLite — no Postgres needed.
