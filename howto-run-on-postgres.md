# How to run talea on Postgres

Run a production-shaped talea: Postgres storage, bearer auth, metrics, and the load-balancer settings that match the server's shedding behavior. Result: a `talead` instance (or several) you can put real traffic on.

## Prerequisites

- Rust toolchain (builds the workspace)
- Docker (for the bundled Postgres compose file) **or** any Postgres 14+ you manage yourself
- The repo checked out; commands run from its root

## Steps

1. Start Postgres. The bundled compose file runs Postgres 17 with a `talea/talea` user and database:

   ```bash
   docker compose up -d
   ```

   Wait for healthy: `docker compose ps` shows `healthy` on the postgres service.

2. Initialize: migrate the schema, generate an API token, write `.env`:

   ```bash
   cargo run -p talead -- init --db-url postgres://talea:talea@localhost:5432/talea
   ```

   This writes `TALEA_DB_URL`, `TALEA_API_TOKEN`, and `TALEA_BIND` to `.env`. If `talea.seed.toml` exists, its assets and accounts are applied idempotently (see `talea.seed.example.toml`). Re-running `init` is safe; `--force` regenerates the token.

3. Serve:

   ```bash
   cargo run -p talead -- serve
   ```

   `serve` loads `.env` from the working directory; real environment variables take priority. The defaults to revisit for production:

   | Variable | Default | Set it when |
   |---|---|---|
   | `TALEA_BIND` | `127.0.0.1:8080` | Exposing beyond localhost |
   | `TALEA_DB_POOL` | `10` | You expect SSE subscribers — each pins one Postgres connection for its lifetime; size for subscribers + commit workers |
   | `TALEA_MAX_INFLIGHT` | `256` | Tuning the shed point |
   | `TALEA_WRITE_QUEUE_DEPTH` / `TALEA_WRITE_BATCH_MAX` | `256` / `64` | Hot-book write tuning |
   | `TALEA_METRICS_BIND` | unset | You want Prometheus metrics (separate listener) |

4. (Recommended) Scope tokens per service. The `init` token can do everything; production services should each hold a token confined to their own book(s). Write a tokens file and point the server at it:

   ```toml
   # /etc/talea/tokens.toml
   [tokens.payments]
   token = "..."          # the secret the payments service presents
   books = ["payments"]   # exact book names, or ["*"] for all books
   access = "rw"          # "ro" = read-only (reporting, dashboards)

   [tokens.reporting]
   token = "..."
   books = ["*"]
   access = "ro"
   ```

   ```bash
   TALEA_TOKENS_FILE=/etc/talea/tokens.toml cargo run -p talead -- serve
   ```

   A leaked `payments` token now cannot touch any other book: out-of-scope requests answer `403 {"error":"forbidden","book":...}` — except `GET /v1/transactions/{tx_id}`, which answers `404` exactly like an unknown id, so a scoped token cannot probe which transaction ids exist. Registering assets needs an `rw` token scoped `["*"]`. `TALEA_API_TOKEN` keeps working alongside the file as an unnamed all-books `rw` token — drop it from `.env` once every service has a scoped token. Rotation = edit the file, restart (the file is read once at startup; a syntactically broken or empty file fails startup rather than silently opening the API).

5. Configure your load balancer against `/health` — as **readiness, not liveness**. `/health` sits inside the admission limits on purpose: under saturation it returns `503`, which means *busy*, not *dead*. Treating it as liveness will restart healthy instances exactly under load. ([Why](explanation-architecture.md#admission-control-and-why-health-is-inside-it).)

6. (Optional) Metrics + dashboards. With `TALEA_METRICS_BIND=0.0.0.0:9100` set, the compose `metrics` profile gives you Prometheus and a provisioned Grafana dashboard:

   ```bash
   docker compose --profile metrics up -d
   open http://localhost:3000   # Grafana "talea" dashboard (dev stack, anonymous login)
   ```

## Verification

```bash
export TALEA_TOKEN=$(grep TALEA_API_TOKEN .env | cut -d= -f2)
curl -i http://127.0.0.1:8080/health
# HTTP/1.1 200 OK
# x-talea-backend: postgres
cargo run -p talea-client --bin talea -- trial-balance --book demo
```

`X-Talea-Backend: postgres` confirms you're on the store you think you're on.

## Running more than one instance

Multiple `talead` instances against one Postgres are correct by construction: the per-book counter-row lock in the database is the write arbiter, commit timestamps come from the database clock, and idempotency keys dedup across instances. Subscribers on instance A receive commits made through instance B (LISTEN/NOTIFY). Two-instance integration tests cover all of this.

One real caveat — **PgBouncer**: LISTEN/NOTIFY requires session-mode pooling. In transaction mode, subscriptions silently miss notifications. Point subscriptions at session-mode pools or directly at Postgres. See the [README's Horizontal scaling section](../README.md#horizontal-scaling).

## Troubleshooting

- **`503` from `/health` or any route, `Retry-After: 1`** — admission shedding, the instance is saturated. Retry (the SDK does automatically); scale out or raise `TALEA_MAX_INFLIGHT` if sustained.
- **`429 {"error":"overloaded"}` on posts** — one book's write queue is full. Retrying with the same idempotency key is always safe. Sustained 429s on one book are the per-book ceiling: raise `TALEA_WRITE_BATCH_MAX`, or split traffic across books.
- **`503`s on reads while SSE subscribers are connected** — pool starvation: each Postgres subscription holds a connection. Raise `TALEA_DB_POOL`.
- **Subscriptions connect but never deliver** — PgBouncer in transaction mode (see above).
- **`init` fails against an existing database** — migrations are sqlx-tracked; a database initialized by a different talea version may need migrating forward, never sideways. Use one `init` source of truth per database.

## Related

- [HTTP API reference](reference-http-api.md) — config table, error envelope, status codes
- [Architecture & design](explanation-architecture.md) — why shedding, group commit, and the lock work this way
- [Tutorial: your first ledger](tutorial-first-ledger.md) — the zero-dependency SQLite path
