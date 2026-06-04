# talea

A multi-currency, double-entry ledger built for cryptocurrency operations. Rust workspace, event-sourced core, Postgres or SQLite storage, REST + SSE server, typed client SDK, and two binaries: `talead` (run the ledger) and `talea` (talk to it).

Every write is an event in an append-only log with a gapless per-book sequence. Balances, postings, and registries are projections of that log, maintained in the same database transaction. Commits are idempotent: retrying a transaction with the same idempotency key can never double-post, which makes the whole system safe to drive over an unreliable network.

## Quickstart

Fastest path, no external services (SQLite):

```bash
cargo run -p talead -- init        # migrates sqlite://talea.db, generates an API token, writes .env
cargo run -p talead -- serve       # serves http://127.0.0.1:8080 using .env
```

In another shell:

```bash
export TALEA_TOKEN=$(grep TALEA_API_TOKEN .env | cut -d= -f2)

cargo run -p talea-client --bin talea -- asset register --id USD --class fiat --precision 2 --name "US Dollar"
cargo run -p talea-client --bin talea -- account open --book demo --path cash   --asset USD --kind asset  --normal-side debit
cargo run -p talea-client --bin talea -- account open --book demo --path equity --asset USD --kind equity --normal-side credit

cargo run -p talea-client --bin talea -- post --book demo --idem seed \
    --credit equity:USD:100000 --debit cash:USD:100000

cargo run -p talea-client --bin talea -- balance --book demo --path cash
# { "account": "demo:cash", "asset": "USD", "balance": "1000.00", "updated_seq": 3, ... }
```

For Postgres, start the bundled compose file and point `init` at it:

```bash
docker compose up -d
cargo run -p talead -- init --db-url postgres://talea:talea@localhost:5432/talea
cargo run -p talead -- serve
```

`talead init` also applies a declarative seed when `talea.seed.toml` exists (see `talea.seed.example.toml`): assets and accounts in TOML, applied idempotently on every run.

## Workspace layout

| Crate | What it is |
|---|---|
| `talea-core` | Domain types (books, accounts, assets, transactions), the `Store` trait (persistence contract), and the `LedgerApi` trait (server/client contract) |
| `talea-store-postgres` | `Store` over Postgres. LISTEN/NOTIFY for live subscriptions |
| `talea-store-sqlite` | `Store` over SQLite (WAL). In-process broadcast for subscriptions |
| `talea-store-conformance` | One backend-agnostic test suite both stores must pass; the contract in executable form |
| `talea-server` | `LedgerService` (implements `LedgerApi` over any `Store`) + axum REST/SSE transport with bearer auth and admission control |
| `talead` | Daemon binary: `init` (migrate, token, seed, `.env`) and `serve` |
| `talea-client` | `TaleaClient` SDK (also implements `LedgerApi`) + the `talea` CLI binary |

The trait symmetry is the point: `LedgerService` (in-process) and `TaleaClient` (remote) implement the same `LedgerApi`, so code written against the trait runs against either. There is a test that proves it.

## Concepts

- **Book**: an isolated namespace (`"onramp"`, `"gateway"`). Each book has its own dense event sequence `1..N`. A transaction lives in exactly one book and can only touch that book's accounts. Names starting with `_` are reserved (`_system` holds asset-registration events).
- **Account**: `book:path`, e.g. `onramp:treasury:btc`. Holds exactly one asset. Has a kind (asset, liability, income, expense, equity, clearing), an optional normal side, and an optional `min_balance` enforced at commit time.
- **Asset**: registry entry with an id (`USD`, `BTC`, `USDT-ETH`), a class (fiat, or crypto with network and optional contract id), and an immutable decimal precision. All amounts are integer minor units; the API renders decimals using the registered precision (`150000` minor at precision 2 is `"1500.00"`).
- **Transaction**: a set of postings that must balance per asset (debits == credits), an idempotency key (unique per book), optional metadata and external refs (`btc_txid`, `ln_preimage`, ...). The server assigns a UUIDv7 id; replaying the same key returns the original result with `deduplicated: true`.
- **Balances**: stored raw as debits minus credits; reported normal-side adjusted, so a liability holding 100 reads `+100` and `min_balance: 0` means "never overdraw" for every account kind. Point-in-time balances (`as_of`) replay by commit time.

## HTTP API

All `/v1` routes require `Authorization: Bearer <token>` when `TALEA_API_TOKEN` is set. Errors are a tagged JSON envelope: `{"error":"unbalanced", ...}`.

| Route | What it does |
|---|---|
| `POST /v1/assets` | Register an asset (idempotent on id) |
| `POST /v1/accounts` | Open an account (idempotent on book+path) |
| `POST /v1/transactions` | Post a balanced transaction (idempotent on key) |
| `GET /v1/books/{book}/accounts/{path}/balance?as_of=` | Current or point-in-time balance |
| `GET /v1/books/{book}/accounts/{path}/history?after_seq=&limit=` | Paginated postings |
| `GET /v1/transactions/{tx_id}` | Committed transaction by id |
| `GET /v1/books/{book}/trial-balance?as_of=` | Per-asset debit/credit sums |
| `GET /v1/books/{book}/events?from=` | SSE event stream; resume via `Last-Event-ID` |
| `GET /health` | Liveness (open, but inside the load-shed limits: 503 means busy, not dead) |
| `GET /docs` | Swagger UI (open, like `/health`) |
| `GET /openapi.json` | OpenAPI 3 document, generated from the code at compile time |

Overload returns `503` + `Retry-After`. Retrying with the same idempotency key is always safe; the server's shedding design assumes clients do exactly that, and the SDK does it automatically.

## The `talea` CLI

```
talea asset register --id BTC --class crypto --network bitcoin --precision 8 --name Bitcoin
talea account open   --book b --path cash --asset USD --kind asset --normal-side debit
talea post           --book b --idem k1 --debit cash:USD:1000 --credit deposits:USD:1000
talea post           --book b --idem k2 --draft tx.json        # or --draft - for stdin
talea balance        --book b --path cash [--as-of 2026-06-04T12:00:00Z]
talea history        --book b --path cash [--after-seq 3] [--limit 100]
talea tx             <tx_id>
talea trial-balance  --book b
talea tail           --book b [--from 1]                       # SSE as JSON lines
```

`--url` / `TALEA_URL` (default `http://127.0.0.1:8080`) and `--token` / `TALEA_TOKEN` apply to every command. Posting syntax is `<account>:<asset>:<minor>`, parsed from the right, so account paths containing `:` (like `treasury:btc`) work. `--idem` is required and never auto-generated: a generated key would defeat retry safety.

## The SDK

```rust
use talea_client::{TaleaClient, LedgerApi, TransactionDraft};

let client = TaleaClient::builder("http://127.0.0.1:8080")
    .bearer_token("...")
    .build()?;

let posted = client.post(draft).await?;          // bounded auto-retry on 503/transport errors
let mut events = client.subscribe("onramp", 1).await?;  // auto-reconnects, resumes by cursor
```

`subscribe` returns an unbroken stream of events: disconnects are retried with backoff and resumed from the last seen sequence via `Last-Event-ID`. The retry budget resets on every received event, so long-lived streams survive transient drops indefinitely while persistent failure surfaces a final error.

## Configuration

Server (`talead serve` / `talea-server`, via env or `.env`):

| Variable | Default | Meaning |
|---|---|---|
| `TALEA_DB_URL` | required | `postgres://...` or `sqlite://path.db` (`:memory:` is rejected) |
| `TALEA_BIND` | `127.0.0.1:8080` | Listen address |
| `TALEA_API_TOKEN` | unset | Bearer token; unset means OPEN dev mode (logged loudly) |
| `TALEA_DB_POOL` | `10` | Connection pool size. On Postgres each SSE subscriber pins one connection: size for subscribers + workers |
| `TALEA_MAX_INFLIGHT` | `256` | In-flight request cap; excess sheds as 503 |
| `TALEA_METRICS_BIND` | unset | Optional Prometheus listener (e.g. `127.0.0.1:9100`); unset = no metrics endpoint |

Client (`talea` CLI): `TALEA_URL`, `TALEA_TOKEN`.

## Metrics

Set `TALEA_METRICS_BIND` to expose Prometheus metrics on a separate listener (`GET /metrics`). Labels never carry user-controlled values: route labels are the route templates (`/v1/books/{book}/...`), so cardinality stays bounded no matter how many books exist.

| Metric | Type | Labels |
|---|---|---|
| `talea_http_requests_total` | counter | `method`, `route`, `status` |
| `talea_http_request_duration_seconds` | histogram | `method`, `route` |
| `talea_commits_total` | counter | `result` = `committed` \| `deduplicated` \| `rejected` |
| `talea_commit_duration_seconds` | histogram | — |
| `talea_shed_total` | counter | — (503s from admission control) |
| `talea_sse_subscribers` | gauge | — (live event-stream connections; each pins a DB connection on Postgres) |
| `talea_db_pool_connections` | gauge | `state` = `size` \| `idle` |

To scrape locally, the compose file ships an opt-in Prometheus (config in `prometheus.yml`):

```bash
TALEA_METRICS_BIND=0.0.0.0:9100 cargo run -p talead -- serve   # 0.0.0.0 so the container can reach the host - dev only
docker compose --profile metrics up -d                          # plain `up` still starts only postgres
open http://localhost:9090                                      # query any talea_* series
```

## Development

```bash
cargo test --workspace                 # everything; Postgres conformance skips without a DB
TALEA_TEST_PG_URL=postgres://postgres:dev@localhost:5432 \
    cargo test -p talea_store_postgres # the same conformance suite, live
cargo clippy --workspace --all-targets
```

The conformance crate is the contract: both stores run the identical suite (idempotency, gapless sequences, normal-side balance enforcement, pagination that never splits a transaction across pages, subscribe catch-up + live delivery). Client tests run against the real server router on an ephemeral port, not mocks.

## Design notes and limits

- **The log is the truth.** `transactions`, `postings`, and `balances` are projections written in the same DB transaction as the event. Reads like point-in-time balances aggregate projections; the full transaction payload is read back from the event log itself.
- **Gapless per-book sequences** come from a counter-row lock, which also serializes writers per book. That is the write ceiling: roughly one commit per commit-latency per book, unbounded across books. The lock is the arbiter across any number of server instances; admission control lives at the HTTP edge.
- **`as_of` filters on commit time**, not client-supplied `occurred_at` (which is metadata for backdating business time).
- **SQLite subscriptions are same-process only** (no cross-connection notify). Use Postgres when subscribers and writers are separate processes.
- **Auth is a single static bearer token** for now. Per-book tokens, TLS, and rate limiting are deployment concerns or future work.
