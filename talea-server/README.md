# talea-server

Ledger service and HTTP transport for the [talea](https://github.com/mooze-labs/talea) ledger.

Two layers, deliberately separate:

- **`service::LedgerService`** — implements the `LedgerApi` trait from `talea-core` over any `Store`. Pure validation and translation; no HTTP anywhere. This is the same trait `talea-client`'s `TaleaClient` implements, so code written against `LedgerApi` runs in-process or over the network unchanged.
- **`http`** — an axum REST + SSE transport over the service, with bearer auth and admission control (in-flight cap, load-shedding as `503` + `Retry-After`).

## Routes

All `/v1` routes require `Authorization: Bearer <token>` when `TALEA_API_TOKEN` is set; unset means OPEN dev mode, logged loudly. Errors are a tagged JSON envelope: `{"error":"unbalanced", ...}`.

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

## Running

The crate ships a `talea-server` binary configured purely from the environment, and `run::run(Config)` is callable from any other binary (`talead` uses it):

| Variable | Default | Meaning |
|---|---|---|
| `TALEA_DB_URL` | required | `postgres://...` or `sqlite://path.db` (`:memory:` is rejected) |
| `TALEA_BIND` | `127.0.0.1:8080` | Listen address |
| `TALEA_API_TOKEN` | unset | Bearer token; unset means OPEN dev mode |
| `TALEA_DB_POOL` | `10` | Pool size. On Postgres each SSE subscriber pins one connection: size for subscribers + workers |
| `TALEA_MAX_INFLIGHT` | `256` | In-flight request cap; excess sheds as 503 |

Store selection is by URL scheme. The server owns pool sizing so admission control (acquire timeout → 503) is configurable in one place. Overload responses pair with the idempotency design: retrying with the same key is always safe, and the client SDK does it automatically.

For the batteries-included daemon (`init` + `serve` + seeding), use [`talead`](../talead/README.md). See the [workspace README](../README.md) for the full picture.
