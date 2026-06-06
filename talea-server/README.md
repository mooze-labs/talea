# talea-server

Ledger service and HTTP transport for the [talea](https://github.com/mooze-labs/talea) ledger.

Two layers, deliberately separate:

- **`service::LedgerService`** — implements the `LedgerApi` trait from `talea-core` over any `Store`. Pure validation and translation; no HTTP anywhere. This is the same trait `talea-client`'s `TaleaClient` implements, so code written against `LedgerApi` runs in-process or over the network unchanged.
- **`http`** — an axum REST + SSE transport over the service, with bearer auth and admission control (in-flight cap, load-shedding as `503` + `Retry-After`).

## Routes

All `/v1` routes require `Authorization: Bearer <token>` when a token is configured — `TALEA_API_TOKEN` (one all-books token) or `TALEA_TOKENS_FILE` (per-book scoped tokens; out-of-scope requests answer `403 forbidden`). Neither set means OPEN dev mode, logged loudly. Errors are a tagged JSON envelope: `{"error":"unbalanced", ...}`.

| Route | What it does |
|---|---|
| `POST /v1/assets` | Register an asset (idempotent on id) |
| `POST /v1/accounts` | Open an account (idempotent on book+path) |
| `POST /v1/transactions` | Post a balanced transaction (idempotent on key) |
| `POST /v1/transactions/batch` | Post an array of drafts; one positional result per draft (mixed books OK; per-draft errors in-slot) |
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
| `TALEA_DB_URL` | required | `postgres://...`, `sqlite://path.db` (`:memory:` is rejected), or `log://<dir>` |
| `TALEA_BIND` | `127.0.0.1:8080` | Listen address |
| `TALEA_API_TOKEN` | unset | Bearer token; equivalent to an unnamed all-books `rw` entry |
| `TALEA_TOKENS_FILE` | unset | TOML file of per-book scoped tokens (see the workspace README's "Scoped tokens") |
| `TALEA_DB_POOL` | `10` | Pool size. On Postgres each SSE subscriber pins one connection: size for subscribers + workers |
| `TALEA_MAX_INFLIGHT` | `256` | In-flight request cap; excess sheds as 503 |
| `TALEA_WRITE_QUEUE_DEPTH` | `256` | Per-book write queue length; a full queue answers 429 + `Retry-After` |
| `TALEA_WRITE_BATCH_MAX` | `64` | Max drafts group-committed in one DB transaction per book |
| `TALEA_HTTP_BATCH_MAX` | `500` | Max drafts per `POST /v1/transactions/batch` request; excess is rejected with 400 (must be ≥ 1) |
| `TALEA_METRICS_BIND` | unset | Optional Prometheus listener; unset = no metrics endpoint |
| `TALEA_LOG_SNAPSHOT_EVERY` / `TALEA_LOG_IDEM_HOT_CAP` / `TALEA_LOG_SEGMENT_MAX` | unset | Append-log store tuning; only read for `log://` URLs — see [`talea-store-log`](../talea-store-log/README.md) |

Store selection is by URL scheme. The server owns pool sizing so admission control (acquire timeout → 503) is configurable in one place. Overload responses pair with the idempotency design: retrying with the same key is always safe, and the client SDK does it automatically.

For the batteries-included daemon (`init` + `serve` + seeding), use [`talead`](../talead/README.md). See the [workspace README](../README.md) for the full picture.
