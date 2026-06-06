# talea — integration guide for AI coding agents

> You are integrating [talea](https://github.com/mooze-labs/talea) — a multi-currency, double-entry ledger — into a codebase. This file is self-contained and vendorable: copy it into your repo, or read the canonical copy at <https://mooze-labs.github.io/talea/AGENTS-INTEGRATION.md>. Exact wire shapes are machine-readable at `GET /openapi.json` on any running instance (Swagger UI at `GET /docs`).

talea is event-sourced and append-only: every committed event gets a gapless per-book sequence number (`seq`), every write is idempotent, and a retry with the same idempotency key can never double-post. The server (`talead`) speaks REST + SSE over HTTP; storage is Postgres, SQLite, or an embedded append-log — invisible to clients.

## Pick your surface

- **Rust codebase** → use the `talea-client` crate ([SDK quickstart](#sdk-quickstart-rust)): a typed client implementing the same `LedgerApi` trait as the server's in-process service, with retries (`Retry-After`-aware) and SSE auto-resume built in.
- **Any other language** → call the HTTP API directly ([HTTP quickstart](#http-quickstart-any-language)). The route surface is small (see [Endpoints](#endpoints)); hand-rolled HTTP is fine. The OpenAPI 3 document at `/openapi.json` is generator-clean (servers entry, correct path/query parameter placement) if you prefer a generated client.

## Rules

Violating any of these is a bug in your integration:

1. **Amounts are integer minor units** (`i64`) — cents, satoshis. Never floats, never decimal strings on the wire. Responses render decimals (e.g. `"1000.00"`) using the asset's registered `precision`.
2. **Idempotency keys are caller-supplied and deterministic.** Derive each transaction's `idempotency_key` from the business event (order id, deposit txid) — never generate one per attempt. Replaying a key returns the original commit with `"deduplicated": true`; it never double-posts. When in doubt, send it again.
3. **Transactions must balance per asset:** for each asset, debit sum == credit sum, and every amount > 0.
4. **Retry `408`, `429`, and `503` with the same draft and the same key.** `429`/`503` carry `Retry-After: 1`; all three mean "busy", never "maybe applied twice". `409 constraint_violation` is a business rejection — do NOT retry it.
5. **Registry writes are idempotent — run them unconditionally at startup.** `POST /v1/assets` dedupes on `id`; `POST /v1/accounts` on `book` + `path`. Re-submitting an identical definition is a no-op; a *different* definition for the same identity is `409 already_exists`.
6. **Timestamps are RFC 3339 UTC.** Commit time (`at`) is server-assigned with microsecond precision. `occurred_at` is optional business time — omit it for server-now.
7. **`seq` is the per-book gapless event sequence, starting at 1.** Asset registrations live in the reserved `_system` book, so your book's first events are typically its account openings.
8. **Event delivery is at-least-once — dedupe on `seq`.** Resume an SSE stream with `Last-Event-ID: <last seq you processed>` (or `?from=`; the header wins).
9. **Auth is `Authorization: Bearer <token>`** on every `/v1` route whenever the server has any token configured; with none it runs in open dev mode. Tokens may be book-scoped: out-of-scope requests answer `403 {"error":"forbidden","book":"..."}` (and out-of-scope transaction ids read as `404`, by design). `/health`, `/docs`, and `/openapi.json` are always open.
10. **Every error is a JSON envelope** `{"error":"<tag>", ...fields}` — branch on the tag, not on prose or status text. Full tag table: [HTTP API reference](https://mooze-labs.github.io/talea/reference-http-api.md).

## Endpoints

All ledger routes live under `/v1`; requests and responses are JSON (`Content-Type: application/json` on POSTs).

<!-- drift-guard:endpoints — this table is asserted against the OpenAPI
     document by talea-server/tests/agent_docs_drift.rs; change both together.
     Columns 1-2 must remain Method, Path (the test parses them by position). -->

| Method | Path | Purpose | Idempotency |
|---|---|---|---|
| POST | `/v1/assets` | Register an asset (fiat or crypto; `precision` is immutable) | on `id` |
| POST | `/v1/accounts` | Open an account (`kind`, `normal_side`, optional `min_balance` floor) | on `book` + `path` |
| POST | `/v1/transactions` | Post one balanced transaction | on caller `idempotency_key` |
| POST | `/v1/transactions/batch` | Post an array of drafts; positional results, per-slot errors | per-draft `idempotency_key` |
| GET | `/v1/transactions/{tx_id}` | Fetch a committed transaction by UUID | read |
| GET | `/v1/books/{book}/accounts/{path}/balance` | Balance, live or point-in-time (`?as_of=`) | read |
| GET | `/v1/books/{book}/accounts/{path}/history` | Paginated postings (`?after_seq=&limit=`, `next` cursor) | read |
| GET | `/v1/books/{book}/trial-balance` | Per-asset debit/credit sums (`?as_of=`) | read |
| GET | `/v1/books/{book}/events` | SSE stream: catch-up then live tail; resume via `Last-Event-ID` | read |

Utility routes (outside the OpenAPI document): `GET /health` (open; `503` under load — wire to *readiness*, not liveness), `GET /docs` (Swagger UI), `GET /openapi.json`, and `GET /metrics` (Prometheus, separate listener, only when `TALEA_METRICS_BIND` is set).

## SDK quickstart (Rust)

```toml
[dependencies]
talea-client = { git = "https://github.com/mooze-labs/talea" }
talea-core   = { git = "https://github.com/mooze-labs/talea" }
tokio = { version = "1", features = ["rt-multi-thread", "macros"] }
futures = "0.3"
```

```rust
use std::time::Duration;
use talea_client::{RetryPolicy, TaleaClient};
use talea_core::api::*;

let client = TaleaClient::builder("http://127.0.0.1:8080") // base URL WITHOUT /v1
    .bearer_token(std::env::var("TALEA_TOKEN")?)
    .timeout(Duration::from_secs(30))
    .retry(RetryPolicy::default()) // retries 503/429/408/transport, honors Retry-After
    .build()?;

// idempotent registry writes — safe to run at every startup
client.register_asset(AssetDraft {
    id: "USD".into(), class: "fiat".into(),
    network: None, native_id: None,
    precision: 2, name: "US Dollar".into(),
}).await?;
client.open_account(AccountDraft {
    book: "demo".into(), path: "cash".into(), asset: "USD".into(),
    kind: "asset".into(),
    normal_side: Some(talea_core::types::Direction::Debit),
    min_balance: Some(0), // never overdraw
}).await?;

// post — key derived from the business event, NOT generated per attempt
let posted = client.post(TransactionDraft {
    book: "demo".into(),
    idempotency_key: format!("deposit-{order_id}"),
    postings: vec![
        PostingDraft { account: "cash".into(),
            amount: WireAmount { minor: 100_000, asset: "USD".into() },
            direction: talea_core::types::Direction::Debit },
        PostingDraft { account: "equity".into(),
            amount: WireAmount { minor: 100_000, asset: "USD".into() },
            direction: talea_core::types::Direction::Credit },
    ],
    external_refs: vec![],
    metadata: serde_json::json!({}),
    occurred_at: None,
}).await?;

// read + stream
let bal = client.balance("demo", "cash", None).await?;
use futures::StreamExt;
let mut stream = client.subscribe("demo", 1).await?; // auto-resumes across drops
while let Some(item) = stream.next().await {
    match item {
        Ok(env) => { /* dedupe on env.seq */ }
        Err(_) => break, // persistent failure only — resubscribe from last seq + 1
    }
}
```

Error handling: everything is `talea_core::api::ApiError`. `ConstraintViolation` = business rejection, don't retry; `Overloaded`/`Transport` after the policy's retries = back off and re-post with the same key; the rest are draft bugs — fix the draft. Depth (batches, pagination, error matrix): [SDK how-to](https://mooze-labs.github.io/talea/howto-use-the-sdk.md).

## HTTP quickstart (any language)

```bash
BASE=http://127.0.0.1:8080
AUTH="Authorization: Bearer $TALEA_TOKEN"
JSON="Content-Type: application/json"

# 1. register an asset (204; idempotent on id)
curl -fs -X POST $BASE/v1/assets -H "$AUTH" -H "$JSON" -d '{
  "id":"USD","class":"fiat","network":null,"native_id":null,
  "precision":2,"name":"US Dollar"}'

# 2. open two accounts (204 each; idempotent on book+path)
curl -fs -X POST $BASE/v1/accounts -H "$AUTH" -H "$JSON" -d '{
  "book":"demo","path":"cash","asset":"USD",
  "kind":"asset","normal_side":"debit","min_balance":0}'
curl -fs -X POST $BASE/v1/accounts -H "$AUTH" -H "$JSON" -d '{
  "book":"demo","path":"equity","asset":"USD",
  "kind":"equity","normal_side":"credit"}'

# 3. post a balanced transaction (200 → Posted)
curl -fs -X POST $BASE/v1/transactions -H "$AUTH" -H "$JSON" -d '{
  "book":"demo","idempotency_key":"deposit-7f3a",
  "postings":[
    {"account":"cash","amount":{"minor":100000,"asset":"USD"},"direction":"debit"},
    {"account":"equity","amount":{"minor":100000,"asset":"USD"},"direction":"credit"}]}'
# → {"tx_id":"0190...","seq":3,"at":"2026-...Z","deduplicated":false}

# 4. read the balance
curl -fs $BASE/v1/books/demo/accounts/cash/balance -H "$AUTH"
# → {"account":"demo:cash","asset":"USD","balance":"1000.00","as_of":null,"updated_seq":3}

# 5. stream events (SSE; resume by sending your last processed seq)
curl -Ns $BASE/v1/books/demo/events -H "$AUTH" -H "Last-Event-ID: 0"
```

## Common mistakes

| Mistake | Consequence | Fix |
|---|---|---|
| Float or decimal-string amounts | `400 invalid_draft`, or silent precision loss upstream | integer minor units everywhere |
| Fresh idempotency key per retry attempt | duplicate ledger entries | derive the key from the business event; reuse it on every retry |
| One key reused across *different* drafts | the second draft silently resolves to the first commit (`deduplicated: true`) | one key ↔ one business event |
| Treating `429`/`503` as fatal | dropped writes that would have committed | back off per `Retry-After`, retry the same draft + key |
| Retrying `409 constraint_violation` | retry loop on a permanent business rejection | surface it to the caller |
| Polling `history` for new activity | latency and load | subscribe to `/v1/books/{book}/events`, checkpoint `seq` |
| Base URL containing `/v1` (SDK) | doubled prefix → 404s | base URL is scheme://host[:port][/proxy-prefix] only |

## Verify your integration

Stand up a real local instance (SQLite, no Docker) and run your integration against it:

```bash
git clone https://github.com/mooze-labs/talea && cd talea
cargo run -p talead -- init    # creates talea.db, writes .env with TALEA_API_TOKEN
cargo run -p talead -- serve   # listens on 127.0.0.1:8080 — leave running
```

In another shell, from the same directory:

```bash
export TALEA_TOKEN=$(grep TALEA_API_TOKEN .env | cut -d= -f2)
curl -fs http://127.0.0.1:8080/health   # → ok
```

Then run steps 1–4 of the [HTTP quickstart](#http-quickstart-any-language) (or your own code) and check:

- the post returns `"deduplicated": false` and a `seq`;
- re-running the **same** post returns `"deduplicated": true` with the **same** `seq`;
- the balance reads `"1000.00"`.

That round-trip — post, replay-dedupes, balance matches — is the proof your integration handles talea's contract correctly.

## Going deeper

- [HTTP API reference](https://mooze-labs.github.io/talea/reference-http-api.md) — every shape, error tag, and server config knob
- [SDK how-to](https://mooze-labs.github.io/talea/howto-use-the-sdk.md) — batches, pagination, error matrix, trait-based test seam
- [Tutorial](https://mooze-labs.github.io/talea/tutorial-first-ledger.md) — the same flow via the `talea` CLI, human-paced
- [Run on Postgres](https://mooze-labs.github.io/talea/howto-run-on-postgres.md) — production deployment
- [Architecture & design](https://mooze-labs.github.io/talea/explanation-architecture.md) — why retry-with-same-key is always safe
