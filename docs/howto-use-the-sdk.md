# How to use the Rust SDK

Drive a talea server from Rust with `TaleaClient` — the typed client that implements the same `LedgerApi` trait as the server's in-process service. Result: posting, reading, and streaming with retries and idempotency handled for you.

## Prerequisites

- A running talea server ([tutorial](tutorial-first-ledger.md) or [Postgres how-to](howto-run-on-postgres.md))
- Your API token (in `.env` as `TALEA_API_TOKEN` after `talead init`)
- A tokio async runtime in your project

Add the dependency (path or git while unpublished):

```toml
[dependencies]
talea-client = { path = "../talea/talea-client" }
talea-core   = { path = "../talea/talea-core" }
tokio = { version = "1", features = ["rt-multi-thread", "macros"] }
futures = "0.3"
```

## Steps

1. Build a client:

   ```rust
   use std::time::Duration;
   use talea_client::{RetryPolicy, TaleaClient};

   let client = TaleaClient::builder("http://127.0.0.1:8080")
       .bearer_token(std::env::var("TALEA_TOKEN")?)
       .timeout(Duration::from_secs(30))      // per-request; not applied to subscriptions
       .retry(RetryPolicy::default())          // 3 attempts, exponential 200ms..5s
       .build()?;                              // validates the URL; no network I/O yet
   ```

   The default retry policy retries `503`, `429`, `408`, and transport errors, honoring `Retry-After`. That is safe for *every* operation because posts carry idempotency keys and registry writes are idempotent. `RetryPolicy::none()` disables it.

2. Register an asset and open accounts (both idempotent — run them at startup unconditionally):

   ```rust
   use talea_core::api::*;

   client.register_asset(AssetDraft {
       id: "USD".into(), class: "fiat".into(),
       network: None, native_id: None,
       precision: 2, name: "US Dollar".into(),
   }).await?;

   client.open_account(AccountDraft {
       book: "demo".into(), path: "cash".into(), asset: "USD".into(),
       kind: "asset".into(),
       normal_side: Some(talea_core::types::Direction::Debit),
       min_balance: Some(0),   // never overdraw
   }).await?;
   ```

3. Post a transaction. The idempotency key is yours to choose — derive it from the business event (an order id, a deposit txid), never generate it per attempt:

   ```rust
   let posted = client.post(TransactionDraft {
       book: "demo".into(),
       idempotency_key: format!("deposit-{order_id}"),
       postings: vec![
           PostingDraft {
               account: "cash".into(),
               amount: WireAmount { minor: 100_000, asset: "USD".into() },
               direction: talea_core::types::Direction::Debit,
           },
           PostingDraft {
               account: "equity".into(),
               amount: WireAmount { minor: 100_000, asset: "USD".into() },
               direction: talea_core::types::Direction::Credit,
           },
       ],
       external_refs: vec![],
       metadata: serde_json::json!({"channel": "wire"}),
       occurred_at: None,      // business time; None = server now
   }).await?;

   println!("seq {} deduplicated {}", posted.seq, posted.deduplicated);
   ```

   Re-running this with the same key returns the original commit with `deduplicated: true` — call it again on any doubt.

4. Post a batch. Use `post_batch` when you have multiple independent transactions to commit — bulk ingestion, backfills, processing a queue of events — and want to minimize round-trips. Do not use it on interactive paths where each draft depends on the result of the previous one; client-side batching adds client-side latency that the caller has to absorb.

   ```rust
   let results: Vec<ApiResult<Posted>> = client.post_batch(vec![
       TransactionDraft { book: "demo".into(), idempotency_key: "batch-a".into(), /* ... */ },
       TransactionDraft { book: "fees".into(), idempotency_key: "batch-b".into(), /* ... */ },
   ]).await;

   for (i, result) in results.iter().enumerate() {
       match result {
           Ok(posted) => println!("slot {i}: seq {} deduplicated {}", posted.seq, posted.deduplicated),
           Err(e) => eprintln!("slot {i}: {:?}", e),
       }
   }
   ```

   - `results[i]` always corresponds to `drafts[i]`. A failure in one slot does not affect any other slot.
   - Drafts may span different books. Each draft's idempotency key deduplicates independently, as it would through `post`.
   - An empty input returns an empty `Vec` immediately without any network call.
   - **Whole-request failure** — a `401`, `415`, `400`, or transport error that prevents the server from processing the batch at all is replicated into every slot as the same `Err`. You can detect this because all slots carry an identical error. Retrying the whole batch is safe: any draft that already committed returns `deduplicated: true` rather than double-posting.

5. Read:

   ```rust
   let bal = client.balance("demo", "cash", None).await?;       // live
   let then = client.balance("demo", "cash", Some(ts)).await?;  // as-of commit time

   // paginate history: `after_seq` is the previous page's `next`
   let mut cursor = None;
   loop {
       let page = client.account_history("demo", "cash", Page { after_seq: cursor, limit: 100 }).await?;
       for p in &page.items { /* ... */ }
       match page.next { Some(n) => cursor = Some(n), None => break }
   }
   ```

6. Stream events. `subscribe` resumes automatically across disconnects (cursor via `Last-Event-ID`), and its retry budget resets on every received event, so long-lived streams survive unlimited transient drops:

   ```rust
   use futures::StreamExt;

   let mut stream = client.subscribe("demo", 1).await?;   // from = first seq, inclusive
   while let Some(item) = stream.next().await {
       match item {
           Ok(env) => println!("seq {} kind {}", env.seq, env.kind),
           Err(e) => { eprintln!("stream ended: {e:?}"); break }   // persistent failure only
       }
   }
   ```

   Delivery is at-least-once: dedupe on `env.seq` if you checkpoint.

7. Match errors where it matters. Everything is one enum:

   ```rust
   use talea_core::api::ApiError;

   match client.post(draft).await {
       Ok(posted) => { /* committed (or deduplicated) */ }
       Err(ApiError::ConstraintViolation { account, min_balance, would_be }) => {
           // business rejection: balance would breach the floor — do NOT retry
       }
       Err(ApiError::Overloaded) => { /* already retried by policy; back off at your layer */ }
       Err(ApiError::Transport { message }) => { /* network/budget exhausted: safe to re-post, same key */ }
       Err(e) => { /* validation errors: unbalanced, unknown_account, ... — fix the draft */ }
   }
   ```

## Verification

The trait symmetry gives you a free integration seam: write your code against `talea_core::api::LedgerApi` and it runs identically against `TaleaClient` (remote) or `LedgerService` (in-process, e.g. SQLite in tests). With a live server:

```bash
cargo run --example your_integration   # or: talea balance --book demo --path cash
```

A `balance` matching what you posted is the round-trip proof.

## Troubleshooting

- **`ApiError::Unauthorized`** — token missing/wrong; the builder needs `.bearer_token(...)` whenever the server has any token configured (`TALEA_API_TOKEN` or `TALEA_TOKENS_FILE`).
- **`ApiError::Forbidden { book }`** — the token is valid but scoped to other books (`TALEA_TOKENS_FILE`). Not retried; fix the token's scope or use the right token for that book.
- **`ApiError::NotFound` on a transaction id you know exists** — same scope problem in disguise: `GET /v1/transactions/{tx_id}` answers `404` (never `403`) when the transaction's book is outside the token's scope, so out-of-scope ids are indistinguishable from unknown ones. Check the token's `books` list before chasing the id.
- **`ApiError::Transport` after several seconds** — retry budget exhausted against an unreachable or saturated server. Posting again with the same idempotency key is safe.
- **Stream ends with `Transport`** — persistent (not transient) failure; reconnect by calling `subscribe` again from your last processed `seq + 1`.
- **Base URL with a path prefix** — supported: a client built for `http://host/api` calls `/api/v1/...`. Don't include `/v1` yourself.

## Related

- [HTTP API reference](reference-http-api.md) — wire shapes behind every method
- [Architecture & design](explanation-architecture.md) — why retry-with-same-key is always safe
- [`talea-client` README](../talea-client/README.md) — SDK summary
- [`talea-cli` README](../talea-cli/README.md) — the `talea` command-line client
