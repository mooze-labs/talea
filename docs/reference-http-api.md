# HTTP API reference

The complete wire protocol for a running talea server. Every claim here is generated-from or checked-against the code; the same contract is machine-readable at `GET /openapi.json` and browsable at `GET /docs` (Swagger UI).

For *why* the API behaves this way, see [Architecture & design](explanation-architecture.md). For a guided first session, see the [tutorial](tutorial-first-ledger.md).

## Conventions

- Base path: all ledger routes live under `/v1`.
- Requests and responses are JSON (`Content-Type: application/json` on POSTs).
- Amounts are integer **minor units** (`i64`): cents, satoshis. Rendered decimals (e.g. `"1000.00"`) use the asset's registered precision.
- Timestamps are RFC 3339 UTC. Commit times come from the database clock with microsecond precision.
- `seq` is a gapless per-book sequence (`i64`, starting at 1). Every committed event has one.

## Authentication

When any token is configured (`TALEA_API_TOKEN`, `TALEA_TOKENS_FILE`, or both), every `/v1` route requires:

```
Authorization: Bearer <token>
```

The scheme is case-insensitive per RFC 7235 (`bearer`, `BEARER` both work); the token is compared in constant time. Missing or wrong token → `401 {"error":"unauthorized"}`. With neither variable set the server runs in open mode (dev) and the header is ignored. `/health`, `/docs`, and `/openapi.json` are always open.

### Scoped tokens

`TALEA_TOKENS_FILE` points at a TOML file that confines each token to a set of books with `ro` or `rw` access:

```toml
[tokens.payments]
token = "s3cret-1"
books = ["payments"]   # exact book names, or ["*"] for all books
access = "rw"          # "ro" = read-only
```

A valid token used outside its scope answers `403 {"error":"forbidden","book":"..."}` — distinct from `401` (bad token). The book is checked where it appears in the request: the path for reads and SSE, the request body for `POST /v1/accounts` and `POST /v1/transactions`. These `403`s only echo a name the caller supplied, so they reveal nothing about what exists. `GET /v1/transactions/{tx_id}` is the exception: the book is only known after the load, so an out-of-scope transaction answers `404` exactly like an unknown id — a `403` there would confirm the id exists and name a book the token cannot see. Registering assets requires an `rw` token scoped `["*"]` (the registry is global; the `403` carries `"book":"*"`). `TALEA_API_TOKEN` remains equivalent to an unnamed all-books `rw` entry.

## Routes

### `POST /v1/assets` — register an asset

Idempotent on `id`: re-registering an identical definition is a no-op; a *different* definition for the same id is `409 already_exists`.

Request (`AssetDraft`):

```json
{
  "id": "USD",
  "class": "fiat",
  "network": null,
  "native_id": null,
  "precision": 2,
  "name": "US Dollar"
}
```

- `class`: `"fiat"` or `"crypto"`. Fiat assets must not set `network`/`native_id`; crypto assets require `network` (e.g. `"ethereum"`) and may set `native_id` (contract address / chain asset id).
- `precision`: decimal places used to render balances. **Immutable once set.**

Responses: `204` on success · `400 invalid_draft` · `401` · `403 forbidden` (requires an `rw` token scoped `["*"]`) · `409 already_exists` · `415` (content-type is not `application/json`).

### `POST /v1/accounts` — open an account

Idempotent on `book` + `path`.

Request (`AccountDraft`):

```json
{
  "book": "onramp",
  "path": "treasury:btc",
  "asset": "BTC",
  "kind": "asset",
  "normal_side": "debit",
  "min_balance": 0
}
```

- `kind`: `asset` | `liability` | `income` | `expense` | `equity` | `clearing`.
- `normal_side`: `"debit"` or `"credit"`; omit for `clearing` accounts.
- `min_balance`: optional commit-time floor on the normal-side-adjusted balance. `0` means "never overdraw" for every account kind. Omit for unconstrained.
- Account paths may contain `:`. Book names starting with `_` are reserved for the ledger.

Responses: `204` · `400 invalid_draft` · `401` · `403 forbidden` (token scope does not cover the draft's book) · `404 unknown_asset` · `409 already_exists` · `415`.

### `POST /v1/transactions` — post a transaction

Idempotent on `idempotency_key` (unique per book): replaying a key returns the original commit with `"deduplicated": true` and never double-posts.

Request (`TransactionDraft`):

```json
{
  "book": "onramp",
  "idempotency_key": "deposit-7f3a",
  "postings": [
    {"account": "cash",     "amount": {"minor": 100000, "asset": "USD"}, "direction": "debit"},
    {"account": "deposits", "amount": {"minor": 100000, "asset": "USD"}, "direction": "credit"}
  ],
  "external_refs": [{"kind": "btc_txid", "value": "4a5e..."}],
  "metadata": {"channel": "wire"},
  "occurred_at": "2026-06-04T12:00:00Z"
}
```

- Postings must balance **per asset** (sum of debits == sum of credits), all amounts > 0.
- `occurred_at` is business time; omit to default to server now. Commit time is always server-assigned.
- `external_refs` and `metadata` are optional.

Response `200` (`Posted`):

```json
{
  "tx_id": "0190c8a4-...",
  "seq": 3,
  "at": "2026-06-04T12:00:00.123456Z",
  "deduplicated": false
}
```

Other responses: `400 unbalanced | invalid_amount | invalid_draft` · `401` · `403 forbidden` (token scope does not cover the draft's book) · `404 unknown_account` · `409 constraint_violation` · `415` · `429 overloaded` (+ `Retry-After: 1` — the per-book write queue is full; retry with the **same** idempotency key).

### `GET /v1/books/{book}/accounts/{path}/balance?as_of=`

Current balance, or point-in-time when `as_of` (RFC 3339) is given — replayed by commit time.

Response `200` (`BalanceView`):

```json
{
  "account": "onramp:cash",
  "asset": "USD",
  "balance": "1000.00",
  "as_of": null,
  "updated_seq": 3
}
```

`balance` is normal-side adjusted (a liability holding 100 reads `"+100"`, not `-100`) and rendered with the asset's precision. Other responses: `401` · `403 forbidden` (book outside the token's scope) · `404 unknown_account`.

### `GET /v1/books/{book}/accounts/{path}/history?after_seq=&limit=`

Paginated postings for one account, seq-ascending. `limit` defaults to 100 (clamped to 1..1000); `after_seq` is exclusive — pass the previous page's `next`.

Response `200` (`Paged<PostingView>`):

```json
{
  "items": [
    {
      "seq": 3,
      "tx_id": "0190c8a4-...",
      "account": "onramp:cash",
      "amount": {"minor": 100000, "asset": "USD"},
      "direction": "debit",
      "at": "2026-06-04T12:00:00.123456Z"
    }
  ],
  "next": null
}
```

`next` is the cursor for the following page, `null` when exhausted. One transaction's postings never split across pages. Other responses: `400 invalid_draft` (bad `after_seq`/`limit`) · `401` · `403 forbidden` (book outside the token's scope) · `404 unknown_account`.

### `GET /v1/transactions/{tx_id}`

Committed transaction by UUID. Response `200` (`TransactionView`): `tx_id`, `book`, `seq`, `at`, `postings` (as above), `external_refs`, `metadata`. Other responses: `400 invalid_draft` (not a UUID) · `401` · `404 not_found` (unknown id, or a transaction whose book is outside the token's scope — indistinguishable by design, so the endpoint is not an existence oracle for transaction ids).

### `GET /v1/books/{book}/trial-balance?as_of=`

Per-asset debit/credit sums for a book, optionally point-in-time.

Response `200` (`TrialBalance`):

```json
{
  "book": "onramp",
  "as_of": null,
  "lines": [
    {"asset": "USD", "debits": 100000, "credits": 100000}
  ]
}
```

Every line balances when the ledger does. Other responses: `401` · `403 forbidden` (book outside the token's scope).

### `GET /v1/books/{book}/events?from=` — SSE event stream

Server-Sent Events (`text/event-stream`). Catch-up from storage, then live tail. `?from=` and the `Last-Event-ID` header both mean **last seen seq** (header wins); the stream starts at that cursor + 1. Omit both to receive everything from seq 1. (The CLI's `talea tail --from` is the inclusive variant: it sends `from - 1` as the cursor.)

Each event:

```
id: 3
data: {"seq":3,"at":"2026-06-04T12:00:00.123456Z","kind":"transaction_posted","payload":{...}}
```

Resume: reconnect with `Last-Event-ID` set to the last seq you processed. Delivery is at-least-once — dedupe on `seq`. A stream error arrives as an SSE `error` event followed by close; reconnect with your cursor. A malformed `?from=` returns a `400 invalid_draft` envelope; a book outside the token's scope returns `403 forbidden` before any stream output.

On Postgres, each subscription pins one database connection for its lifetime (LISTEN/NOTIFY) — size `TALEA_DB_POOL` accordingly. On SQLite, subscriptions only see commits made by the **same process**.

### `GET /health`

Open route. `200 ok` with an `X-Talea-Backend: postgres | sqlite` header identifying the store. **Sits inside the admission limits**: under saturation it returns `503` like everything else, so wire it to load-balancer *readiness* (busy), not *liveness* (dead) — see [Run on Postgres](howto-run-on-postgres.md).

### `GET /docs`, `GET /openapi.json`

Swagger UI and the OpenAPI 3 document, generated from the code at compile time. Both open.

### `GET /metrics` (separate listener)

Prometheus metrics, exposed only when `TALEA_METRICS_BIND` is set — on that bind, not the API port. The metric catalogue lives in the [README's Metrics section](../README.md#metrics).

## Errors

Every error — including malformed JSON, bad query parameters, wrong content type, and middleware failures — is a tagged JSON envelope: `{"error": "<code>", ...fields}`.

| `error` code | HTTP | Extra fields | Meaning |
|---|---|---|---|
| `invalid_draft` | 400 / 415 | `field`, `reason` | Malformed or rejected request |
| `unbalanced` | 400 | `asset`, `debit`, `credit` | Per-asset debits ≠ credits |
| `invalid_amount` | 400 | `amount` | Amount ≤ 0 or overflow |
| `asset_mismatch` | 400 | `account`, `account_asset`, `asset` | Posting's asset ≠ account's asset |
| `unauthorized` | 401 | — | Missing/invalid bearer token |
| `forbidden` | 403 | `book` | Valid token, but its scope does not cover this book (`"*"` = the global asset registry) |
| `unknown_asset` | 404 | `asset` | Asset not registered |
| `unknown_account` | 404 | `account` | Account not open |
| `not_found` | 404 | `what` | Transaction id not found |
| `already_exists` | 409 | `what` | Conflicting re-registration |
| `constraint_violation` | 409 | `account`, `min_balance`, `would_be` | Commit would breach `min_balance` |
| `timeout` | 408 | — | Request exceeded the 30 s server deadline; safe to retry with the same idempotency key |
| `overloaded` | 429 | — | Per-book write queue full; carries `Retry-After: 1` |
| `overloaded` | 503 | — | Admission shed (`TALEA_MAX_INFLIGHT` exceeded); carries `Retry-After: 1` — same envelope, the status code carries the distinction |
| `internal` | 500 | `message` | Server bug — never used for user error |

All shedding and timeouts assume clients retry with the same idempotency key — that retry is always safe; overload degrades to "retry later", never "maybe applied twice".

## Server configuration

| Env var | Default | Effect |
|---|---|---|
| `TALEA_DB_URL` | — (required) | `postgres://...` or `sqlite://path.db` (`:memory:` is rejected) |
| `TALEA_BIND` | `127.0.0.1:8080` | API listener |
| `TALEA_API_TOKEN` | unset (open mode) | Bearer token for `/v1`; equivalent to an unnamed all-books `rw` entry |
| `TALEA_TOKENS_FILE` | unset | TOML file of per-book scoped tokens (see [Authentication](#authentication)) |
| `TALEA_DB_POOL` | `10` | DB pool size; each Postgres SSE subscriber pins one connection |
| `TALEA_MAX_INFLIGHT` | `256` | Admission limit; excess sheds `503` |
| `TALEA_WRITE_QUEUE_DEPTH` | `256` | Per-book write queue; full → `429` |
| `TALEA_WRITE_BATCH_MAX` | `64` | Max drafts per group commit |
| `TALEA_METRICS_BIND` | unset | Optional Prometheus listener |

`talead serve` loads these from `.env` in the working directory; real environment variables win. See the [README Configuration table](../README.md#configuration) for the same list in context.

## Related

- [Tutorial: your first ledger](tutorial-first-ledger.md) — zero to posted transaction
- [How to use the Rust SDK](howto-use-the-sdk.md) — the typed client over this API
- [How to run on Postgres](howto-run-on-postgres.md) — production deployment
- [Architecture & design](explanation-architecture.md) — why the API is shaped this way
