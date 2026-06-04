# talea-server Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement `talea-server` — the `LedgerApi` service over `Arc<dyn Store>` with an axum REST + SSE transport — including the `talea-core` contract fixes and `Store` trait read extensions it requires.

**Architecture:** Three layers built bottom-up: (1) `talea-core` contract fixes (`format_minor`, `ApiError` variants, `LedgerApi` signatures, `EventStream` → `EventEnvelope`) and `Store` read extensions (`asset`, `account_history`, `transaction`, `trial_balance`, `balance` → `BalanceSnapshot`) implemented in both stores with conformance tests; (2) `LedgerService` — pure validation/translation implementing `LedgerApi`, no SQL, testable over an in-memory SQLite store; (3) axum HTTP layer — thin handlers, SSE with `Last-Event-ID` resume, bearer-token middleware, tower admission control (concurrency limit + load shed + timeout), URL-scheme store selection in `main`.

**Tech Stack:** Rust (edition 2024), axum 0.8, tower 0.5, sqlx 0.9, tokio, async-stream, serde/serde_json, chrono, uuid v7.

**Spec:** `docs/superpowers/specs/2026-06-04-talea-server-design.md` (approved). Key locked decisions: posting `account` strings are paths within the draft's book; `BalanceView.balance` is a precision-formatted decimal string; SSE `?from=`/`Last-Event-ID` both mean "last seen" (stream starts at value+1, header wins); DB row lock stays the write arbiter — admission control at the HTTP edge, no in-process write channels; reads accept `_`-books (events of `_system` are legitimately readable), writes reject them.

---

## File Structure

```
talea-core/src/api/mod.rs                — modify: LedgerApi signatures, EventStream→EventEnvelope, format_minor
talea-core/src/api/error.rs              — modify: InvalidDraft, NotFound, AssetMismatch reshape
talea-core/src/api/requests.rs           — modify: TransactionDraft.occurred_at
talea-core/src/store.rs                  — modify: BalanceSnapshot, PostingRecord, StoredTransaction,
                                           TrialBalanceRow, 4 new trait methods, balance return change
talea-store-conformance/src/lib.rs       — modify: balance call sites, 5 new conformance fns
talea-store-sqlite/src/lib.rs            — modify: balance snapshot, decode_asset refactor, 4 new reads
talea-store-sqlite/tests/conformance.rs  — modify: 5 new test invocations
talea-store-postgres/src/lib.rs          — modify: same as sqlite, $n/native types
talea-store-postgres/tests/conformance.rs— modify: 5 new test invocations
talea-server/Cargo.toml                  — rewrite: full dependency set
talea-server/src/lib.rs                  — create: pub mod config/service/http
talea-server/src/main.rs                 — rewrite: env config, store selection, serve
talea-server/src/config.rs               — create: Config::from_env / from_lookup
talea-server/src/service.rs              — create: LedgerService (impl LedgerApi)
talea-server/src/http/mod.rs             — create: pub mod auth/error/handlers/routes/sse
talea-server/src/http/error.rs           — create: ApiFailure (ApiError → HTTP response)
talea-server/src/http/auth.rs            — create: bearer middleware
talea-server/src/http/handlers.rs        — create: REST handlers
talea-server/src/http/sse.rs             — create: events endpoint
talea-server/src/http/routes.rs          — create: router + tower layers
talea-server/src/api.rs                  — DELETE (replaced by service.rs)
talea-server/src/server.rs               — DELETE (dead stub)
talea-server/tests/service.rs            — create: service-level tests
talea-server/tests/http.rs               — create: router-level tests
```

---

### Task 1: `talea-core` — `format_minor`

**Files:**
- Modify: `talea-core/src/api/mod.rs`

- [ ] **Step 1: Write the failing test**

Append to `talea-core/src/api/mod.rs`:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn format_minor_renders_decimal_strings() {
        assert_eq!(format_minor(150000, 2), "1500.00");
        assert_eq!(format_minor(150000, 8), "0.00150000");
        assert_eq!(format_minor(-1500, 2), "-15.00");
        assert_eq!(format_minor(5, 2), "0.05");
        assert_eq!(format_minor(0, 2), "0.00");
        assert_eq!(format_minor(42, 0), "42");
        assert_eq!(format_minor(-42, 0), "-42");
        assert_eq!(format_minor(i64::MIN, 2), "-92233720368547758.08");
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cargo test -p talea_core format_minor`
Expected: COMPILE ERROR — `cannot find function 'format_minor'`

- [ ] **Step 3: Implement**

Add to `talea-core/src/api/mod.rs` (above the test module):

```rust
/// Render minor units as a decimal string using the asset's precision.
/// Pure string arithmetic — safe for any precision, no 10^p overflow.
pub fn format_minor(minor: i64, precision: u8) -> String {
    let precision = precision as usize;
    if precision == 0 {
        return minor.to_string();
    }
    let sign = if minor < 0 { "-" } else { "" };
    let digits = minor.unsigned_abs().to_string();
    if digits.len() > precision {
        let (whole, frac) = digits.split_at(digits.len() - precision);
        format!("{sign}{whole}.{frac}")
    } else {
        format!("{sign}0.{digits:0>precision$}")
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cargo test -p talea_core format_minor`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add talea-core/src/api/mod.rs
git commit -m "feat(core): format_minor decimal renderer for minor units"
```

---

### Task 2: `talea-core` — api contract fixes

`ApiError` gains `InvalidDraft`/`NotFound` and `AssetMismatch` is reshaped; `TransactionDraft` gains `occurred_at`; `LedgerApi` signatures align with the stores; `EventStream` yields `EventEnvelope`. Nothing implements `LedgerApi` yet, so no downstream breakage.

**Files:**
- Modify: `talea-core/src/api/error.rs`
- Modify: `talea-core/src/api/requests.rs`
- Modify: `talea-core/src/api/mod.rs`

- [ ] **Step 1: Write the failing test**

Append to the test module created in Task 1 (`talea-core/src/api/mod.rs`):

```rust
    #[test]
    fn api_error_new_variants_serialize_tagged() {
        let e = ApiError::InvalidDraft {
            field: "class".into(),
            reason: "unknown asset class".into(),
        };
        let json = serde_json::to_string(&e).unwrap();
        assert!(json.contains("\"error\":\"invalid_draft\""), "got: {json}");

        let e = ApiError::NotFound { what: "transaction x".into() };
        let json = serde_json::to_string(&e).unwrap();
        assert!(json.contains("\"error\":\"not_found\""), "got: {json}");

        let e = ApiError::AssetMismatch {
            account: "onramp:cash".into(),
            account_asset: "USD".into(),
            asset: "EUR".into(),
        };
        let json = serde_json::to_string(&e).unwrap();
        assert!(json.contains("\"asset\":\"EUR\""), "got: {json}");
    }

    #[test]
    fn transaction_draft_occurred_at_defaults_to_none() {
        let draft: TransactionDraft = serde_json::from_str(
            r#"{"book":"b","idempotency_key":"k","postings":[]}"#,
        )
        .unwrap();
        assert!(draft.occurred_at.is_none());
    }
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cargo test -p talea_core api_error_new_variants`
Expected: COMPILE ERROR — no variant `InvalidDraft`, no field `occurred_at`

- [ ] **Step 3: Apply the contract changes**

In `talea-core/src/api/error.rs`, replace the `AssetMismatch` variant and add two new variants (rest of the enum unchanged):

```rust
    AssetMismatch {
        account: String,
        account_asset: String,
        asset: String,
    },
```

and after `AlreadyExists`:

```rust
    InvalidDraft {
        field: String,
        reason: String,
    },
    NotFound {
        what: String,
    },
```

In `talea-core/src/api/requests.rs`, add to the top imports `use chrono::{DateTime, Utc};` and to `TransactionDraft` (after `metadata`):

```rust
    /// Business/event time; the server defaults it to now when absent.
    #[serde(default)]
    pub occurred_at: Option<DateTime<Utc>>,
```

In `talea-core/src/api/mod.rs`, change the `EventStream` alias and the `LedgerApi` trait to exactly:

```rust
pub type ApiResult<T> = Result<T, ApiError>;
pub type EventStream = BoxStream<'static, ApiResult<EventEnvelope>>;

/// The full server contract. Each transport adapter is a thin translation
/// onto it.
#[async_trait]
pub trait LedgerApi: Send + Sync {
    // --- registry (idempotent on id) ---
    async fn register_asset(&self, draft: AssetDraft) -> ApiResult<()>;
    async fn open_account(&self, draft: AccountDraft) -> ApiResult<()>;

    // --- write (idempotent on idempotency_key) ---
    async fn post(&self, draft: TransactionDraft) -> ApiResult<Posted>;

    // --- reads ---
    async fn balance(
        &self,
        book: &str,
        path: &str,
        as_of: Option<DateTime<Utc>>,
    ) -> ApiResult<BalanceView>;
    async fn account_history(
        &self,
        book: &str,
        path: &str,
        page: Page,
    ) -> ApiResult<Paged<PostingView>>;
    async fn transaction(&self, tx_id: &str) -> ApiResult<TransactionView>;
    async fn trial_balance(
        &self,
        book: &str,
        as_of: Option<DateTime<Utc>>,
    ) -> ApiResult<TrialBalance>;

    // --- stream (at least once; resume from a cursor) ---
    async fn subscribe(&self, book: &str, from: Seq) -> ApiResult<EventStream>;
}
```

Add `use chrono::{DateTime, Utc};` to `mod.rs` imports if not present, and remove the now-unused `LedgerEvent` import (the stream yields envelopes).

- [ ] **Step 4: Run tests and workspace check**

Run: `cargo test -p talea_core && cargo check --workspace`
Expected: PASS / success (warnings OK)

- [ ] **Step 5: Commit**

```bash
git add talea-core/src/api
git commit -m "feat(core): api contract fixes - InvalidDraft/NotFound, EventEnvelope stream, aligned signatures"
```

---

### Task 3: `talea-core` + stores — Store read types, trait methods, BalanceSnapshot

The trait gains four read methods (stubbed `todo!()` in both stores for now) and `balance` changes its return type (implemented for real in both stores immediately, since existing conformance tests depend on it).

**Files:**
- Modify: `talea-core/src/store.rs`
- Modify: `talea-store-sqlite/src/lib.rs`
- Modify: `talea-store-postgres/src/lib.rs`
- Modify: `talea-store-conformance/src/lib.rs` (mechanical call-site updates)

- [ ] **Step 1: Extend `talea-core/src/store.rs`**

Change the `balance` signature in the `Store` trait and add the four new methods (other methods unchanged):

```rust
    /// Current balance (projection) or point-in-time (replay from log).
    /// `as_of` filters on commit time. The amount is the normal-side-adjusted
    /// effective balance; `updated_seq` is the last seq that touched the
    /// account (0 if never posted to).
    async fn balance(
        &self,
        account: &AccountId,
        as_of: Option<DateTime<Utc>>,
    ) -> Result<BalanceSnapshot, StoreError>;

    /// Registry read; Ok(None) for unregistered ids.
    async fn asset(&self, id: &AssetId) -> Result<Option<AssetDef>, StoreError>;

    /// Postings for one account, seq-ascending. `after_seq` is EXCLUSIVE
    /// (None = from the beginning); resume by passing the last seen seq.
    /// `limit` counts distinct seqs (transactions), so postings of one
    /// transaction are never split across pages.
    async fn account_history(
        &self,
        account: &AccountId,
        after_seq: Option<Seq>,
        limit: usize,
    ) -> Result<Vec<PostingRecord>, StoreError>;

    /// Committed transaction by id; Ok(None) if unknown.
    async fn transaction(&self, txid: &TxId) -> Result<Option<StoredTransaction>, StoreError>;

    /// Per-asset debit/credit sums for a book, optionally as of commit time.
    async fn trial_balance(
        &self,
        book: &Book,
        as_of: Option<DateTime<Utc>>,
    ) -> Result<Vec<TrialBalanceRow>, StoreError>;
```

Add the new types (near `Committed`):

```rust
#[derive(Debug, Clone, PartialEq)]
pub struct BalanceSnapshot {
    pub amount: Amount,
    pub updated_seq: Seq,
}

#[derive(Debug, Clone)]
pub struct PostingRecord {
    pub seq: Seq,
    pub txid: TxId,
    pub account: AccountId,
    pub amount: Amount,
    pub direction: Direction,
    pub at: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub struct StoredTransaction {
    pub transaction: Transaction,
    pub seq: Seq,
    pub at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TrialBalanceRow {
    pub asset: AssetId,
    pub debits: i64,
    pub credits: i64,
}
```

- [ ] **Step 2: Update SQLite `balance` and stub the new methods**

In `talea-store-sqlite/src/lib.rs`, replace the `balance` method body (keep the existing comments) with:

```rust
    async fn balance(
        &self,
        account: &AccountId,
        as_of: Option<DateTime<Utc>>,
    ) -> Result<BalanceSnapshot, StoreError> {
        let key = account.to_key();
        // Two pool reads without a transaction: safe because account metadata
        // (asset, normal_side) is immutable after open_account and the balance
        // read is a single atomic statement. Revisit if accounts become editable.
        let acct = load_account(&self.pool, &key)
            .await?
            .ok_or_else(|| StoreError::UnknownAccount(account.clone()))?;

        let (raw, updated_seq): (i64, i64) = match as_of {
            // current balance: the projection row (0 if never posted to)
            None => sqlx::query(
                "SELECT balance, updated_seq FROM balances WHERE account_key = ?1",
            )
            .bind(&key)
            .fetch_optional(&self.pool)
            .await
            .map_err(io_err)?
            .map(|r| (r.get("balance"), r.get("updated_seq")))
            .unwrap_or((0, 0)),
            // point-in-time: aggregate the postings projection by commit time
            Some(t) => {
                let r = sqlx::query(
                    "SELECT COALESCE(SUM(CASE WHEN direction = 'D' THEN minor ELSE -minor END), 0) AS raw,
                            COALESCE(MAX(seq), 0) AS updated_seq
                     FROM postings WHERE account_key = ?1 AND committed_at <= ?2",
                )
                .bind(&key)
                .bind(t)
                .fetch_one(&self.pool)
                .await
                .map_err(io_err)?;
                (r.get("raw"), r.get("updated_seq"))
            }
        };

        Ok(BalanceSnapshot {
            amount: Amount::new(effective(raw, &acct.normal_side), acct.asset),
            updated_seq,
        })
    }
```

Add the four stubs to the same `impl Store for SqliteTaleaStore` block:

```rust
    async fn asset(&self, id: &AssetId) -> Result<Option<AssetDef>, StoreError> {
        todo!()
    }

    async fn account_history(
        &self,
        account: &AccountId,
        after_seq: Option<Seq>,
        limit: usize,
    ) -> Result<Vec<PostingRecord>, StoreError> {
        todo!()
    }

    async fn transaction(&self, txid: &TxId) -> Result<Option<StoredTransaction>, StoreError> {
        todo!()
    }

    async fn trial_balance(
        &self,
        book: &Book,
        as_of: Option<DateTime<Utc>>,
    ) -> Result<Vec<TrialBalanceRow>, StoreError> {
        todo!()
    }
```

- [ ] **Step 3: Update Postgres `balance` and stub the new methods**

In `talea-store-postgres/src/lib.rs`, replace the `balance` method body (keep the existing comments) with:

```rust
    async fn balance(
        &self,
        account: &AccountId,
        as_of: Option<DateTime<Utc>>,
    ) -> Result<BalanceSnapshot, StoreError> {
        let key = account.to_key();
        // Two pool reads without a transaction: safe because account metadata
        // (asset, normal_side) is immutable after open_account and the balance
        // read is a single atomic statement. Revisit if accounts become editable.
        let acct = load_account(&self.pool, &key)
            .await?
            .ok_or_else(|| StoreError::UnknownAccount(account.clone()))?;

        let (raw, updated_seq): (i64, i64) = match as_of {
            // current balance: the projection row (0 if never posted to)
            None => sqlx::query(
                "SELECT balance, updated_seq FROM balances WHERE account_key = $1",
            )
            .bind(&key)
            .fetch_optional(&self.pool)
            .await
            .map_err(io_err)?
            .map(|r| (r.get("balance"), r.get("updated_seq")))
            .unwrap_or((0, 0)),
            // point-in-time: aggregate the postings projection by commit time.
            // SUM(BIGINT) returns NUMERIC in Postgres => cast back to BIGINT.
            Some(t) => {
                let r = sqlx::query(
                    "SELECT COALESCE(SUM(CASE WHEN direction = 'D' THEN minor ELSE -minor END), 0)::BIGINT AS raw,
                            COALESCE(MAX(seq), 0) AS updated_seq
                     FROM postings WHERE account_key = $1 AND committed_at <= $2",
                )
                .bind(&key)
                .bind(t)
                .fetch_one(&self.pool)
                .await
                .map_err(io_err)?;
                (r.get("raw"), r.get("updated_seq"))
            }
        };

        Ok(BalanceSnapshot {
            amount: Amount::new(effective(raw, &acct.normal_side), acct.asset),
            updated_seq,
        })
    }
```

Add the same four `todo!()` stubs (identical signatures) to `impl Store for PgTaleaStore`.

- [ ] **Step 4: Mechanical conformance call-site updates**

In `talea-store-conformance/src/lib.rs`, `Store::balance` now returns `BalanceSnapshot`. Update every call site:

- `commit_is_idempotent`: `bal.minor()` → `bal.amount.minor()`
- `concurrent_same_key_commits_once`: `bal.minor()` → `bal.amount.minor()`
- `min_balance_blocks_overdraft`: `bal.minor()` → `bal.amount.minor()`
- `min_balance_is_normal_side_adjusted`: both `bal.minor()` occurrences → `bal.amount.minor()`
- `balance_as_of_point_in_time`: `now_bal.minor()` → `now_bal.amount.minor()`, `now_bal.asset()` → `now_bal.amount.asset()`, `then_bal.minor()` → `then_bal.amount.minor()`

- [ ] **Step 5: Verify everything still passes**

Run: `cargo test --workspace`
Expected: all green — SQLite 15/15, core tests, helpers tests (Postgres skips without env; if `TALEA_TEST_PG_URL` is set in your environment, those 15 must pass too)

- [ ] **Step 6: Commit**

```bash
git add talea-core/src/store.rs talea-store-sqlite/src/lib.rs talea-store-postgres/src/lib.rs talea-store-conformance/src/lib.rs
git commit -m "feat(core): Store read extensions and BalanceSnapshot return type"
```

---

### Task 4: conformance — five new test functions

**Files:**
- Modify: `talea-store-conformance/src/lib.rs`

- [ ] **Step 1: Append the new conformance functions**

Add a new section at the end of `talea-store-conformance/src/lib.rs`:

```rust
// --- read extensions ----------------------------------------------------

pub async fn asset_lookup(store: &impl Store) {
    let id = unique("USD");
    store.register_asset(&asset(&id)).await.unwrap();
    let found = store
        .asset(&AssetId::new(&id))
        .await
        .unwrap()
        .expect("registered asset must be found");
    assert_eq!(found, asset(&id));
    assert!(store.asset(&AssetId::new(unique("NOPE"))).await.unwrap().is_none());
}

pub async fn balance_snapshot_updated_seq(store: &impl Store) {
    let (book, asset_id) = setup_book(store).await;
    // never posted: zero balance, seq 0
    let empty = store.balance(&account_id(&book, "cash"), None).await.unwrap();
    assert_eq!(empty.amount.minor(), 0);
    assert_eq!(empty.updated_seq, 0);

    store.commit(&transfer(&book, "u1", "deposits", "cash", &asset_id, 100)).await.unwrap();
    tokio::time::sleep(Duration::from_millis(20)).await;
    let mid = Utc::now();
    tokio::time::sleep(Duration::from_millis(20)).await;
    store.commit(&transfer(&book, "u2", "deposits", "cash", &asset_id, 50)).await.unwrap();

    // seqs 1,2 = account_opened; 3,4 = the two commits
    let now = store.balance(&account_id(&book, "cash"), None).await.unwrap();
    assert_eq!(now.updated_seq, 4);
    let then = store.balance(&account_id(&book, "cash"), Some(mid)).await.unwrap();
    assert_eq!(then.updated_seq, 3);
    assert_eq!(then.amount.minor(), 100);
}

pub async fn account_history_pages_exclusively(store: &impl Store) {
    let (book, asset_id) = setup_book(store).await;
    for i in 0..3i64 {
        store
            .commit(&transfer(&book, &format!("h{i}"), "deposits", "cash", &asset_id, 10 + i))
            .await
            .unwrap();
    }
    let cash = account_id(&book, "cash");
    let first = store.account_history(&cash, None, 2).await.unwrap();
    assert_eq!(first.len(), 2);
    assert_eq!((first[0].seq, first[1].seq), (3, 4));
    assert_eq!(first[0].amount.minor(), 10);
    assert_eq!(first[0].direction, Direction::Debit);
    assert_eq!(first[0].account, cash);
    // after_seq is exclusive: resume with the last seen seq
    let rest = store.account_history(&cash, Some(first[1].seq), 10).await.unwrap();
    assert_eq!(rest.len(), 1);
    assert_eq!(rest[0].seq, 5);
    assert_eq!(rest[0].amount.minor(), 12);
    // the credit side sees its own postings
    let dep = store.account_history(&account_id(&book, "deposits"), None, 10).await.unwrap();
    assert_eq!(dep.len(), 3);
    assert_eq!(dep[0].direction, Direction::Credit);
}

pub async fn transaction_round_trip(store: &impl Store) {
    let (book, asset_id) = setup_book(store).await;
    let tx = transfer(&book, "tr1", "deposits", "cash", &asset_id, 777);
    let committed = store.commit(&tx).await.unwrap();

    let stored = store
        .transaction(&tx.id)
        .await
        .unwrap()
        .expect("committed tx must be found");
    assert_eq!(stored.seq, committed.seq);
    // timestamp round-trips through the backend's encoding; allow tiny drift
    assert!((stored.at - committed.at).num_milliseconds().abs() < 5);
    assert_eq!(stored.transaction.id, tx.id);
    assert_eq!(stored.transaction.idempotency_key, tx.idempotency_key);
    assert_eq!(stored.transaction.postings.len(), 2);

    let missing = store.transaction(&TxId(Uuid::new_v4())).await.unwrap();
    assert!(missing.is_none());
}

pub async fn trial_balance_sums_per_asset(store: &impl Store) {
    let (book, asset_a) = setup_book(store).await;
    // a second asset with its own account pair in the same book
    let asset_b = unique("EUR");
    store.register_asset(&asset(&asset_b)).await.unwrap();
    let (cash_b, cash_b_cfg) = open_spec(&book, "cash-eur", &asset_b, AccountKind::Asset);
    store.open_account(&cash_b, &cash_b_cfg).await.unwrap();
    let (dep_b, dep_b_cfg) = open_spec(&book, "deposits-eur", &asset_b, AccountKind::Liability);
    store.open_account(&dep_b, &dep_b_cfg).await.unwrap();

    store.commit(&transfer(&book, "ta", "deposits", "cash", &asset_a, 100)).await.unwrap();
    tokio::time::sleep(Duration::from_millis(20)).await;
    let mid = Utc::now();
    tokio::time::sleep(Duration::from_millis(20)).await;
    store.commit(&transfer(&book, "tb", "deposits-eur", "cash-eur", &asset_b, 40)).await.unwrap();

    let all = store.trial_balance(&Book(book.clone()), None).await.unwrap();
    assert_eq!(all.len(), 2);
    let row_a = all.iter().find(|r| r.asset.as_str() == asset_a).unwrap();
    assert_eq!((row_a.debits, row_a.credits), (100, 100));
    let row_b = all.iter().find(|r| r.asset.as_str() == asset_b).unwrap();
    assert_eq!((row_b.debits, row_b.credits), (40, 40));

    // as_of cuts the second commit off
    let early = store.trial_balance(&Book(book.clone()), Some(mid)).await.unwrap();
    assert_eq!(early.len(), 1);
    assert_eq!(early[0].asset.as_str(), asset_a);
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cargo check -p talea-store-conformance`
Expected: success

- [ ] **Step 3: Commit**

```bash
git add talea-store-conformance
git commit -m "feat(conformance): read-extension test functions"
```

---

### Task 5: `talea-store-sqlite` — implement the four reads

**Files:**
- Modify: `talea-store-sqlite/src/lib.rs`
- Modify: `talea-store-sqlite/tests/conformance.rs`

- [ ] **Step 1: Add the failing tests**

Append to `talea-store-sqlite/tests/conformance.rs`:

```rust
sqlite_test!(asset_lookup);
sqlite_test!(balance_snapshot_updated_seq);
sqlite_test!(account_history_pages_exclusively);
sqlite_test!(transaction_round_trip);
sqlite_test!(trial_balance_sums_per_asset);
```

Run: `cargo test -p talea-store-sqlite`
Expected: `balance_snapshot_updated_seq` PASSES (implemented in Task 3); the other four FAIL with `not yet implemented`

- [ ] **Step 2: Add the `decode_asset` helper and refactor `register_asset` to use it**

Add near the other free helpers in `talea-store-sqlite/src/lib.rs`:

```rust
fn decode_asset(id: AssetId, r: &sqlx::sqlite::SqliteRow) -> AssetDef {
    let class: String = r.get("class");
    AssetDef {
        id,
        class: match class.as_str() {
            "fiat" => AssetClass::Fiat,
            _ => AssetClass::Crypto {
                network: Network::new(r.get::<Option<String>, _>("network").unwrap_or_default()),
                native_id: r.get("native_id"),
            },
        },
        precision: r.get::<i64, _>("precision") as u8,
        name: r.get("name"),
    }
}
```

In `register_asset`, replace the inline `let existing = AssetDef { ... }` construction (the whole `let class: String = row.get("class"); let existing = AssetDef { ... };` block) with:

```rust
            let existing = decode_asset(asset.id.clone(), &row);
```

- [ ] **Step 3: Implement the four reads**

Replace the four `todo!()` stubs in `impl Store for SqliteTaleaStore`:

```rust
    async fn asset(&self, id: &AssetId) -> Result<Option<AssetDef>, StoreError> {
        let row = sqlx::query(
            "SELECT class, network, native_id, precision, name FROM assets WHERE id = ?1",
        )
        .bind(id.as_str())
        .fetch_optional(&self.pool)
        .await
        .map_err(io_err)?;
        Ok(row.map(|r| decode_asset(id.clone(), &r)))
    }

    async fn account_history(
        &self,
        account: &AccountId,
        after_seq: Option<Seq>,
        limit: usize,
    ) -> Result<Vec<PostingRecord>, StoreError> {
        let key = account.to_key();
        if load_account(&self.pool, &key).await?.is_none() {
            return Err(StoreError::UnknownAccount(account.clone()));
        }
        // limit counts distinct seqs so one transaction's postings are never
        // split across pages (multiple postings to one account share a seq)
        let rows = sqlx::query(
            "SELECT seq, tx_id, asset, minor, direction, committed_at
             FROM postings
             WHERE account_key = ?1 AND seq > ?2
               AND seq <= (SELECT COALESCE(MAX(seq), 0) FROM (
                     SELECT DISTINCT seq FROM postings
                     WHERE account_key = ?1 AND seq > ?2
                     ORDER BY seq LIMIT ?3) AS s)
             ORDER BY seq, idx",
        )
        .bind(&key)
        .bind(after_seq.unwrap_or(0))
        .bind(limit as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(io_err)?;
        rows.into_iter()
            .map(|r| {
                let txid = uuid::Uuid::parse_str(&r.get::<String, _>("tx_id")).map_err(io_err)?;
                let direction = Direction::from_db(&r.get::<String, _>("direction"))
                    .ok_or_else(|| StoreError::Io("corrupt direction column".into()))?;
                Ok(PostingRecord {
                    seq: r.get("seq"),
                    txid: TxId(txid),
                    account: account.clone(),
                    amount: Amount::new(r.get("minor"), AssetId::new(r.get::<String, _>("asset"))),
                    direction,
                    at: r.get("committed_at"),
                })
            })
            .collect()
    }

    async fn transaction(&self, txid: &TxId) -> Result<Option<StoredTransaction>, StoreError> {
        let Some(row) = sqlx::query(
            "SELECT book, seq, committed_at FROM transactions WHERE tx_id = ?1",
        )
        .bind(txid.0.to_string())
        .fetch_optional(&self.pool)
        .await
        .map_err(io_err)?
        else {
            return Ok(None);
        };
        let book: String = row.get("book");
        let seq: Seq = row.get("seq");
        let at: DateTime<Utc> = row.get("committed_at");

        // the log is the truth: the full Transaction lives in the event payload
        let events = fetch_events(&self.pool, &Book(book), seq, 1).await?;
        match events.into_iter().next() {
            Some(Sequenced {
                event: LedgerEvent::TransactionPosted(transaction),
                ..
            }) if transaction.id == *txid => Ok(Some(StoredTransaction { transaction, seq, at })),
            _ => Err(StoreError::Io(
                format!("event log missing transaction_posted for tx {}", txid.0).into(),
            )),
        }
    }

    async fn trial_balance(
        &self,
        book: &Book,
        as_of: Option<DateTime<Utc>>,
    ) -> Result<Vec<TrialBalanceRow>, StoreError> {
        let rows = sqlx::query(
            "SELECT asset,
                    COALESCE(SUM(CASE WHEN direction = 'D' THEN minor ELSE 0 END), 0) AS debits,
                    COALESCE(SUM(CASE WHEN direction = 'C' THEN minor ELSE 0 END), 0) AS credits
             FROM postings
             WHERE book = ?1 AND (?2 IS NULL OR committed_at <= ?2)
             GROUP BY asset ORDER BY asset",
        )
        .bind(&book.0)
        .bind(as_of)
        .fetch_all(&self.pool)
        .await
        .map_err(io_err)?;
        Ok(rows
            .into_iter()
            .map(|r| TrialBalanceRow {
                asset: AssetId::new(r.get::<String, _>("asset")),
                debits: r.get("debits"),
                credits: r.get("credits"),
            })
            .collect())
    }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cargo test -p talea-store-sqlite`
Expected: all 20 tests PASS

- [ ] **Step 5: Commit**

```bash
git add talea-store-sqlite
git commit -m "feat(sqlite): asset/account_history/transaction/trial_balance reads"
```

---

### Task 6: `talea-store-postgres` — implement the four reads

Mirror of Task 5 with `$n` params, native `Uuid` binds, `::BIGINT` casts on SUMs, and `i16` precision. **No live Postgres assumed** — verify by compile + skip-mode run + parity with the SQLite twin; the owner runs `TALEA_TEST_PG_URL=... cargo test -p talea_store_postgres` afterwards.

**Files:**
- Modify: `talea-store-postgres/src/lib.rs`
- Modify: `talea-store-postgres/tests/conformance.rs`

- [ ] **Step 1: Add the gated tests**

Append to `talea-store-postgres/tests/conformance.rs`:

```rust
pg_test!(asset_lookup);
pg_test!(balance_snapshot_updated_seq);
pg_test!(account_history_pages_exclusively);
pg_test!(transaction_round_trip);
pg_test!(trial_balance_sums_per_asset);
```

- [ ] **Step 2: Add the `decode_asset` helper and refactor `register_asset` to use it**

Add near the other free helpers in `talea-store-postgres/src/lib.rs`:

```rust
fn decode_asset(id: AssetId, r: &sqlx::postgres::PgRow) -> AssetDef {
    let class: String = r.get("class");
    AssetDef {
        id,
        class: match class.as_str() {
            "fiat" => AssetClass::Fiat,
            _ => AssetClass::Crypto {
                network: Network::new(r.get::<Option<String>, _>("network").unwrap_or_default()),
                native_id: r.get("native_id"),
            },
        },
        precision: r.get::<i16, _>("precision") as u8,
        name: r.get("name"),
    }
}
```

In `register_asset`, replace the inline `let existing = AssetDef { ... }` construction with:

```rust
            let existing = decode_asset(asset.id.clone(), &row);
```

- [ ] **Step 3: Implement the four reads**

Replace the four `todo!()` stubs in `impl Store for PgTaleaStore`:

```rust
    async fn asset(&self, id: &AssetId) -> Result<Option<AssetDef>, StoreError> {
        let row = sqlx::query(
            "SELECT class, network, native_id, precision, name FROM assets WHERE id = $1",
        )
        .bind(id.as_str())
        .fetch_optional(&self.pool)
        .await
        .map_err(io_err)?;
        Ok(row.map(|r| decode_asset(id.clone(), &r)))
    }

    async fn account_history(
        &self,
        account: &AccountId,
        after_seq: Option<Seq>,
        limit: usize,
    ) -> Result<Vec<PostingRecord>, StoreError> {
        let key = account.to_key();
        if load_account(&self.pool, &key).await?.is_none() {
            return Err(StoreError::UnknownAccount(account.clone()));
        }
        // limit counts distinct seqs so one transaction's postings are never
        // split across pages (multiple postings to one account share a seq)
        let rows = sqlx::query(
            "SELECT seq, tx_id, asset, minor, direction, committed_at
             FROM postings
             WHERE account_key = $1 AND seq > $2
               AND seq <= (SELECT COALESCE(MAX(seq), 0) FROM (
                     SELECT DISTINCT seq FROM postings
                     WHERE account_key = $1 AND seq > $2
                     ORDER BY seq LIMIT $3) AS s)
             ORDER BY seq, idx",
        )
        .bind(&key)
        .bind(after_seq.unwrap_or(0))
        .bind(limit as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(io_err)?;
        rows.into_iter()
            .map(|r| {
                let direction = Direction::from_db(&r.get::<String, _>("direction"))
                    .ok_or_else(|| StoreError::Io("corrupt direction column".into()))?;
                Ok(PostingRecord {
                    seq: r.get("seq"),
                    txid: TxId(r.get::<Uuid, _>("tx_id")),
                    account: account.clone(),
                    amount: Amount::new(r.get("minor"), AssetId::new(r.get::<String, _>("asset"))),
                    direction,
                    at: r.get("committed_at"),
                })
            })
            .collect()
    }

    async fn transaction(&self, txid: &TxId) -> Result<Option<StoredTransaction>, StoreError> {
        let Some(row) = sqlx::query(
            "SELECT book, seq, committed_at FROM transactions WHERE tx_id = $1",
        )
        .bind(txid.0)
        .fetch_optional(&self.pool)
        .await
        .map_err(io_err)?
        else {
            return Ok(None);
        };
        let book: String = row.get("book");
        let seq: Seq = row.get("seq");
        let at: DateTime<Utc> = row.get("committed_at");

        // the log is the truth: the full Transaction lives in the event payload
        let events = fetch_events(&self.pool, &Book(book), seq, 1).await?;
        match events.into_iter().next() {
            Some(Sequenced {
                event: LedgerEvent::TransactionPosted(transaction),
                ..
            }) if transaction.id == *txid => Ok(Some(StoredTransaction { transaction, seq, at })),
            _ => Err(StoreError::Io(
                format!("event log missing transaction_posted for tx {}", txid.0).into(),
            )),
        }
    }

    async fn trial_balance(
        &self,
        book: &Book,
        as_of: Option<DateTime<Utc>>,
    ) -> Result<Vec<TrialBalanceRow>, StoreError> {
        let rows = sqlx::query(
            "SELECT asset,
                    COALESCE(SUM(CASE WHEN direction = 'D' THEN minor ELSE 0 END), 0)::BIGINT AS debits,
                    COALESCE(SUM(CASE WHEN direction = 'C' THEN minor ELSE 0 END), 0)::BIGINT AS credits
             FROM postings
             WHERE book = $1 AND ($2::TIMESTAMPTZ IS NULL OR committed_at <= $2)
             GROUP BY asset ORDER BY asset",
        )
        .bind(&book.0)
        .bind(as_of)
        .fetch_all(&self.pool)
        .await
        .map_err(io_err)?;
        Ok(rows
            .into_iter()
            .map(|r| TrialBalanceRow {
                asset: AssetId::new(r.get::<String, _>("asset")),
                debits: r.get("debits"),
                credits: r.get("credits"),
            })
            .collect())
    }
```

- [ ] **Step 4: Verify**

Run: `cargo test -p talea_store_postgres && cargo check --workspace`
Expected: compiles; tests pass (via skip when `TALEA_TEST_PG_URL` unset, for real when set)

- [ ] **Step 5: Commit**

```bash
git add talea-store-postgres
git commit -m "feat(postgres): asset/account_history/transaction/trial_balance reads"
```

---

### Task 7: `talea-server` — crate scaffolding + config

**Files:**
- Rewrite: `talea-server/Cargo.toml`
- Create: `talea-server/src/lib.rs`
- Create: `talea-server/src/config.rs`
- Rewrite: `talea-server/src/main.rs` (placeholder; full wiring in Task 13)
- Delete: `talea-server/src/api.rs`, `talea-server/src/server.rs`

- [ ] **Step 1: Rewrite `talea-server/Cargo.toml`**

```toml
[package]
name = "talea-server"
version = "0.1.0"
edition = "2024"

[dependencies]
async-stream = "0.3"
async-trait = "0.1.89"
axum = "0.8.9"
chrono = { version = "0.4.44", features = ["serde"] }
futures = "0.3.32"
serde = { version = "1.0.228", features = ["derive"] }
serde_json = "1.0.150"
sqlx = { version = "0.9.0", features = ["postgres", "sqlite", "chrono", "uuid", "json", "runtime-tokio"] }
talea_core = { path = "../talea-core/" }
talea_store_postgres = { path = "../talea-store-postgres/" }
talea-store-sqlite = { path = "../talea-store-sqlite/" }
thiserror = "2.0.18"
tokio = { version = "1.52.3", features = ["full"] }
tower = { version = "0.5", features = ["limit", "load-shed", "timeout", "util"] }
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter"] }
uuid = { version = "1.23.2", features = ["v7", "serde"] }

[dev-dependencies]
http-body-util = "0.1"
```

- [ ] **Step 2: Create `talea-server/src/lib.rs`, delete dead files, placeholder main**

`talea-server/src/lib.rs`:

```rust
pub mod config;
pub mod http;
pub mod service;
```

Delete `talea-server/src/api.rs` and `talea-server/src/server.rs` (`git rm talea-server/src/api.rs talea-server/src/server.rs`).

`talea-server/src/main.rs` (placeholder until Task 13):

```rust
fn main() {
    println!("talea-server: wiring lands in a later task");
}
```

Create empty module shells so the crate compiles (filled by Tasks 8–13):

`talea-server/src/service.rs`:

```rust
//! LedgerApi implementation over a Store backend. Implemented in later tasks.
```

`talea-server/src/http/mod.rs`:

```rust
pub mod auth;
pub mod error;
pub mod handlers;
pub mod routes;
pub mod sse;
```

And empty placeholder files `talea-server/src/http/{auth,error,handlers,routes,sse}.rs`, each containing only a doc comment line, e.g. `//! Implemented in a later task.`

- [ ] **Step 3: Write the failing config test**

`talea-server/src/config.rs`:

```rust
use std::net::SocketAddr;
use std::time::Duration;

#[derive(Debug, Clone)]
pub struct Config {
    pub db_url: String,
    pub bind: SocketAddr,
    pub api_token: Option<String>,
    pub db_pool: u32,
    pub max_inflight: usize,
}

#[derive(Debug, thiserror::Error)]
pub enum ConfigError {
    #[error("TALEA_DB_URL is required (postgres://... or sqlite://...)")]
    MissingDbUrl,
    #[error("invalid {var}: {reason}")]
    Invalid { var: &'static str, reason: String },
}

impl Config {
    pub const DB_ACQUIRE_TIMEOUT: Duration = Duration::from_secs(3);
    pub const REQUEST_TIMEOUT: Duration = Duration::from_secs(30);

    pub fn from_env() -> Result<Self, ConfigError> {
        Self::from_lookup(|k| std::env::var(k).ok())
    }

    /// Testable core: takes a lookup fn instead of mutating process env
    /// (env-var mutation races under the parallel test runner).
    pub fn from_lookup(get: impl Fn(&str) -> Option<String>) -> Result<Self, ConfigError> {
        todo!()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    fn cfg(vars: &[(&str, &str)]) -> Result<Config, ConfigError> {
        let map: HashMap<String, String> = vars
            .iter()
            .map(|(k, v)| (k.to_string(), v.to_string()))
            .collect();
        Config::from_lookup(|k| map.get(k).cloned())
    }

    #[test]
    fn db_url_is_required() {
        assert!(matches!(cfg(&[]), Err(ConfigError::MissingDbUrl)));
    }

    #[test]
    fn defaults_apply() {
        let c = cfg(&[("TALEA_DB_URL", "sqlite://x.db")]).unwrap();
        assert_eq!(c.bind, "127.0.0.1:8080".parse().unwrap());
        assert_eq!(c.db_pool, 10);
        assert_eq!(c.max_inflight, 256);
        assert!(c.api_token.is_none());
    }

    #[test]
    fn overrides_apply() {
        let c = cfg(&[
            ("TALEA_DB_URL", "postgres://h/db"),
            ("TALEA_BIND", "0.0.0.0:9000"),
            ("TALEA_API_TOKEN", "secret"),
            ("TALEA_DB_POOL", "32"),
            ("TALEA_MAX_INFLIGHT", "512"),
        ])
        .unwrap();
        assert_eq!(c.bind, "0.0.0.0:9000".parse().unwrap());
        assert_eq!(c.api_token.as_deref(), Some("secret"));
        assert_eq!(c.db_pool, 32);
        assert_eq!(c.max_inflight, 512);
    }

    #[test]
    fn garbage_values_are_rejected() {
        assert!(matches!(
            cfg(&[("TALEA_DB_URL", "sqlite://x.db"), ("TALEA_BIND", "nope")]),
            Err(ConfigError::Invalid { var: "TALEA_BIND", .. })
        ));
        assert!(matches!(
            cfg(&[("TALEA_DB_URL", "sqlite://x.db"), ("TALEA_DB_POOL", "many")]),
            Err(ConfigError::Invalid { var: "TALEA_DB_POOL", .. })
        ));
    }
}
```

Run: `cargo test -p talea-server config`
Expected: tests FAIL with `not yet implemented`

- [ ] **Step 4: Implement `from_lookup`**

Replace the `todo!()`:

```rust
    pub fn from_lookup(get: impl Fn(&str) -> Option<String>) -> Result<Self, ConfigError> {
        let db_url = get("TALEA_DB_URL").ok_or(ConfigError::MissingDbUrl)?;
        let bind = get("TALEA_BIND")
            .unwrap_or_else(|| "127.0.0.1:8080".to_string())
            .parse()
            .map_err(|e| ConfigError::Invalid {
                var: "TALEA_BIND",
                reason: format!("{e}"),
            })?;
        let db_pool = get("TALEA_DB_POOL")
            .map(|v| v.parse())
            .transpose()
            .map_err(|e| ConfigError::Invalid {
                var: "TALEA_DB_POOL",
                reason: format!("{e}"),
            })?
            .unwrap_or(10);
        let max_inflight = get("TALEA_MAX_INFLIGHT")
            .map(|v| v.parse())
            .transpose()
            .map_err(|e| ConfigError::Invalid {
                var: "TALEA_MAX_INFLIGHT",
                reason: format!("{e}"),
            })?
            .unwrap_or(256);
        Ok(Self {
            db_url,
            bind,
            api_token: get("TALEA_API_TOKEN"),
            db_pool,
            max_inflight,
        })
    }
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cargo test -p talea-server && cargo check --workspace`
Expected: 4 config tests PASS; workspace compiles

- [ ] **Step 6: Commit**

```bash
git add talea-server Cargo.lock
git commit -m "feat(server): crate scaffolding, env config with testable lookup"
```

---

### Task 8: `talea-server` — LedgerService writes (register/open/post)

**Files:**
- Rewrite: `talea-server/src/service.rs`
- Create: `talea-server/tests/service.rs`

- [ ] **Step 1: Write the failing tests**

`talea-server/tests/service.rs`:

```rust
use std::sync::Arc;

use sqlx::sqlite::SqlitePoolOptions;
use talea_core::api::*;
use talea_core::types::Direction;
use talea_server::service::LedgerService;
use talea_store_sqlite::SqliteTaleaStore;

async fn svc() -> LedgerService {
    let pool = SqlitePoolOptions::new()
        .max_connections(1)
        .connect("sqlite::memory:")
        .await
        .unwrap();
    let store = SqliteTaleaStore::new(pool);
    store.migrate().await.unwrap();
    LedgerService::new(Arc::new(store))
}

fn usd_draft(id: &str) -> AssetDraft {
    AssetDraft {
        id: id.into(),
        class: "fiat".into(),
        network: None,
        native_id: None,
        precision: 2,
        name: "US Dollar".into(),
    }
}

fn account_draft(
    book: &str,
    path: &str,
    asset: &str,
    kind: &str,
    normal_side: Option<Direction>,
) -> AccountDraft {
    AccountDraft {
        book: book.into(),
        path: path.into(),
        asset: asset.into(),
        kind: kind.into(),
        normal_side,
        min_balance: None,
    }
}

fn posting(account: &str, asset: &str, minor: i64, direction: Direction) -> PostingDraft {
    PostingDraft {
        account: account.into(),
        amount: WireAmount { minor, asset: asset.into() },
        direction,
    }
}

fn tx_draft(book: &str, idem: &str, postings: Vec<PostingDraft>) -> TransactionDraft {
    TransactionDraft {
        book: book.into(),
        idempotency_key: idem.into(),
        postings,
        external_refs: vec![],
        metadata: serde_json::json!({}),
        occurred_at: None,
    }
}

/// Registers USD and opens onramp:{cash (asset), deposits (liability)}.
async fn funded_svc() -> LedgerService {
    let svc = svc().await;
    svc.register_asset(usd_draft("USD")).await.unwrap();
    svc.open_account(account_draft("onramp", "cash", "USD", "asset", Some(Direction::Debit)))
        .await
        .unwrap();
    svc.open_account(account_draft("onramp", "deposits", "USD", "liability", Some(Direction::Credit)))
        .await
        .unwrap();
    svc
}

fn balanced(amount: i64) -> Vec<PostingDraft> {
    vec![
        posting("deposits", "USD", amount, Direction::Credit),
        posting("cash", "USD", amount, Direction::Debit),
    ]
}

#[tokio::test]
async fn post_round_trip_and_dedup() {
    let svc = funded_svc().await;
    let draft = tx_draft("onramp", "t1", balanced(1000));
    let first = svc.post(draft.clone()).await.unwrap();
    assert!(!first.deduplicated);
    assert_eq!(first.seq, 3); // seqs 1,2 = the two account_opened events

    let second = svc.post(draft).await.unwrap();
    assert!(second.deduplicated);
    assert_eq!(second.tx_id, first.tx_id);
    assert_eq!(second.seq, first.seq);
}

#[tokio::test]
async fn unbalanced_rejected() {
    let svc = funded_svc().await;
    let draft = tx_draft("onramp", "u1", vec![
        posting("deposits", "USD", 1000, Direction::Credit),
        posting("cash", "USD", 900, Direction::Debit),
    ]);
    match svc.post(draft).await {
        Err(ApiError::Unbalanced { debit, credit, asset }) => {
            assert_eq!((debit, credit, asset.as_str()), (900, 1000, "USD"));
        }
        other => panic!("expected Unbalanced, got {other:?}"),
    }
}

#[tokio::test]
async fn non_positive_amount_rejected() {
    let svc = funded_svc().await;
    let draft = tx_draft("onramp", "n1", vec![
        posting("deposits", "USD", 0, Direction::Credit),
        posting("cash", "USD", 0, Direction::Debit),
    ]);
    match svc.post(draft).await {
        Err(ApiError::InvalidAmount { amount: 0 }) => {}
        other => panic!("expected InvalidAmount, got {other:?}"),
    }
}

#[tokio::test]
async fn malformed_drafts_rejected() {
    let svc = svc().await;
    // unknown asset class
    let mut bad_class = usd_draft("EUR");
    bad_class.class = "shells".into();
    assert!(matches!(
        svc.register_asset(bad_class).await,
        Err(ApiError::InvalidDraft { field, .. }) if field == "class"
    ));
    // crypto without network
    let coin = AssetDraft {
        id: "BTC".into(),
        class: "crypto".into(),
        network: None,
        native_id: None,
        precision: 8,
        name: "Bitcoin".into(),
    };
    assert!(matches!(
        svc.register_asset(coin).await,
        Err(ApiError::InvalidDraft { field, .. }) if field == "network"
    ));
    // unknown account kind
    svc.register_asset(usd_draft("USD")).await.unwrap();
    assert!(matches!(
        svc.open_account(account_draft("b", "x", "USD", "wallet", None)).await,
        Err(ApiError::InvalidDraft { field, .. }) if field == "kind"
    ));
    // reserved book
    assert!(matches!(
        svc.open_account(account_draft("_system", "x", "USD", "asset", None)).await,
        Err(ApiError::InvalidDraft { field, .. }) if field == "book"
    ));
    // empty idempotency key
    assert!(matches!(
        svc.post(tx_draft("onramp", "", balanced(1))).await,
        Err(ApiError::InvalidDraft { field, .. }) if field == "idempotency_key"
    ));
    // empty postings
    assert!(matches!(
        svc.post(tx_draft("onramp", "k", vec![])).await,
        Err(ApiError::InvalidDraft { field, .. }) if field == "postings"
    ));
}

#[tokio::test]
async fn store_errors_map_to_api_errors() {
    let svc = funded_svc().await;
    // unknown account
    let draft = tx_draft("onramp", "m1", vec![
        posting("deposits", "USD", 10, Direction::Credit),
        posting("ghost", "USD", 10, Direction::Debit),
    ]);
    assert!(matches!(
        svc.post(draft).await,
        Err(ApiError::UnknownAccount { account }) if account == "onramp:ghost"
    ));
    // asset mismatch: EUR postings against USD accounts
    svc.register_asset(usd_draft("EUR")).await.unwrap();
    let draft = tx_draft("onramp", "m2", vec![
        posting("deposits", "EUR", 10, Direction::Credit),
        posting("cash", "EUR", 10, Direction::Debit),
    ]);
    assert!(matches!(
        svc.post(draft).await,
        Err(ApiError::AssetMismatch { asset, .. }) if asset == "EUR"
    ));
    // conflicting re-registration
    let mut conflicting = usd_draft("USD");
    conflicting.precision = 8;
    assert!(matches!(
        svc.register_asset(conflicting).await,
        Err(ApiError::AlreadyExists { .. })
    ));
}
```

Run: `cargo test -p talea-server --test service`
Expected: COMPILE ERROR — `LedgerService` does not exist

- [ ] **Step 2: Implement the service (writes + mapping; reads stay `todo!()`)**

Rewrite `talea-server/src/service.rs`:

```rust
//! LedgerApi implementation: pure validation and translation over a Store.

use std::collections::HashMap;
use std::sync::Arc;

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use futures::StreamExt;
use talea_core::api::*;
use talea_core::store::{AccountCfg, Store, StoreError};
use talea_core::types::*;
use uuid::Uuid;

pub struct LedgerService {
    store: Arc<dyn Store>,
}

impl LedgerService {
    pub fn new(store: Arc<dyn Store>) -> Self {
        Self { store }
    }
}

// --- draft parsing --------------------------------------------------------

fn invalid(field: &str, reason: impl Into<String>) -> ApiError {
    ApiError::InvalidDraft { field: field.into(), reason: reason.into() }
}

/// Writes reject reserved books; reads use parse_book_lax (events of _system
/// are legitimately readable).
fn parse_book(name: &str) -> ApiResult<Book> {
    let book = parse_book_lax(name)?;
    if book.is_reserved() {
        return Err(invalid("book", "names starting with '_' are reserved"));
    }
    Ok(book)
}

fn parse_book_lax(name: &str) -> ApiResult<Book> {
    if name.is_empty() {
        return Err(invalid("book", "must not be empty"));
    }
    Ok(Book(name.to_string()))
}

fn parse_asset_draft(draft: AssetDraft) -> ApiResult<AssetDef> {
    if draft.id.is_empty() {
        return Err(invalid("id", "must not be empty"));
    }
    let class = match draft.class.as_str() {
        "fiat" => {
            if draft.network.is_some() || draft.native_id.is_some() {
                return Err(invalid("network", "fiat assets have no network or native_id"));
            }
            AssetClass::Fiat
        }
        "crypto" => AssetClass::Crypto {
            network: Network::new(
                draft.network.ok_or_else(|| invalid("network", "crypto assets require a network"))?,
            ),
            native_id: draft.native_id,
        },
        other => {
            return Err(invalid("class", format!("unknown asset class '{other}' (expected 'fiat' or 'crypto')")));
        }
    };
    Ok(AssetDef {
        id: AssetId::new(draft.id),
        class,
        precision: draft.precision,
        name: draft.name,
    })
}

/// The cfg (normal_side, min_balance) comes from the draft verbatim;
/// `kind` is classification only.
fn parse_account_draft(draft: AccountDraft) -> ApiResult<(AccountDef, AccountCfg)> {
    let book = parse_book(&draft.book)?;
    if draft.path.is_empty() {
        return Err(invalid("path", "must not be empty"));
    }
    let kind = AccountKind::from_db(&draft.kind)
        .ok_or_else(|| invalid("kind", format!("unknown account kind '{}'", draft.kind)))?;
    let cfg = AccountCfg {
        normal_side: draft.normal_side,
        min_balance: draft.min_balance,
    };
    let def = AccountDef {
        id: AccountId { book, path: draft.path },
        asset: AssetId::new(draft.asset),
        kind,
    };
    Ok((def, cfg))
}

// --- error mapping ----------------------------------------------------------

fn map_store_err(e: StoreError) -> ApiError {
    match e {
        StoreError::ConstraintViolation { account, min_balance, would_be } => {
            ApiError::ConstraintViolation { account: account.to_key(), min_balance, would_be }
        }
        StoreError::UnknownAccount(a) => ApiError::UnknownAccount { account: a.to_key() },
        StoreError::UnknownAsset(a) => ApiError::UnknownAsset { asset: a.as_str().to_string() },
        StoreError::AssetMismatch { account, account_asset, asset } => ApiError::AssetMismatch {
            account: account.to_key(),
            account_asset: account_asset.as_str().to_string(),
            asset: asset.as_str().to_string(),
        },
        StoreError::AlreadyExists { what } => ApiError::AlreadyExists { what },
        StoreError::InvalidBook(b) => invalid("book", format!("book {:?} is reserved", b.0)),
        StoreError::Io(e) => {
            tracing::error!(error = %e, "store backend error");
            ApiError::Internal { message: "storage backend error".into() }
        }
    }
}

#[async_trait]
impl LedgerApi for LedgerService {
    async fn register_asset(&self, draft: AssetDraft) -> ApiResult<()> {
        let def = parse_asset_draft(draft)?;
        self.store.register_asset(&def).await.map_err(map_store_err)
    }

    async fn open_account(&self, draft: AccountDraft) -> ApiResult<()> {
        let (def, cfg) = parse_account_draft(draft)?;
        self.store.open_account(&def, &cfg).await.map_err(map_store_err)
    }

    async fn post(&self, draft: TransactionDraft) -> ApiResult<Posted> {
        let book = parse_book(&draft.book)?;
        if draft.idempotency_key.is_empty() {
            return Err(invalid("idempotency_key", "must not be empty"));
        }
        if draft.postings.is_empty() {
            return Err(invalid("postings", "must not be empty"));
        }

        let mut postings = Vec::with_capacity(draft.postings.len());
        let mut totals: HashMap<String, (i64, i64)> = HashMap::new(); // asset -> (debits, credits)
        for p in &draft.postings {
            if p.amount.minor <= 0 {
                return Err(ApiError::InvalidAmount { amount: p.amount.minor });
            }
            if p.account.is_empty() {
                return Err(invalid("postings.account", "must not be empty"));
            }
            let entry = totals.entry(p.amount.asset.clone()).or_insert((0, 0));
            let side = match p.direction {
                Direction::Debit => &mut entry.0,
                Direction::Credit => &mut entry.1,
            };
            *side = side
                .checked_add(p.amount.minor)
                .ok_or(ApiError::InvalidAmount { amount: p.amount.minor })?;
            postings.push(Posting {
                account: AccountId { book: book.clone(), path: p.account.clone() },
                amount: Amount::new(p.amount.minor, AssetId::new(&p.amount.asset)),
                direction: p.direction.clone(),
            });
        }
        for (asset, (debit, credit)) in &totals {
            if debit != credit {
                return Err(ApiError::Unbalanced { asset: asset.clone(), debit: *debit, credit: *credit });
            }
        }

        let id = TxId(Uuid::now_v7());
        let transaction = Transaction {
            id: id.clone(),
            book,
            postings,
            idempotency_key: IdempotencyKey(draft.idempotency_key),
            external_refs: draft.external_refs,
            metadata: draft.metadata,
            occurred_at: draft.occurred_at.unwrap_or_else(Utc::now),
        };
        let committed = self.store.commit(&transaction).await.map_err(map_store_err)?;
        Ok(Posted {
            tx_id: committed.txid.0.to_string(),
            seq: committed.seq,
            at: committed.at,
            // a dedup hit returns the prior transaction's id, not ours
            deduplicated: committed.txid != id,
        })
    }

    async fn balance(
        &self,
        book: &str,
        path: &str,
        as_of: Option<DateTime<Utc>>,
    ) -> ApiResult<BalanceView> {
        todo!()
    }

    async fn account_history(
        &self,
        book: &str,
        path: &str,
        page: Page,
    ) -> ApiResult<Paged<PostingView>> {
        todo!()
    }

    async fn transaction(&self, tx_id: &str) -> ApiResult<TransactionView> {
        todo!()
    }

    async fn trial_balance(
        &self,
        book: &str,
        as_of: Option<DateTime<Utc>>,
    ) -> ApiResult<TrialBalance> {
        todo!()
    }

    async fn subscribe(&self, book: &str, from: Seq) -> ApiResult<EventStream> {
        todo!()
    }
}
```

- [ ] **Step 3: Run tests to verify they pass**

Run: `cargo test -p talea-server --test service`
Expected: all 5 tests PASS

- [ ] **Step 4: Commit**

```bash
git add talea-server
git commit -m "feat(server): LedgerService writes - draft validation, dedup flag, error mapping"
```

---

### Task 9: `talea-server` — LedgerService reads + subscribe

**Files:**
- Modify: `talea-server/src/service.rs`
- Modify: `talea-server/tests/service.rs`

- [ ] **Step 1: Write the failing tests**

Append to `talea-server/tests/service.rs`:

```rust
#[tokio::test]
async fn balance_view_formats_decimal() {
    let svc = funded_svc().await;
    svc.post(tx_draft("onramp", "b1", balanced(1000))).await.unwrap();

    let view = svc.balance("onramp", "cash", None).await.unwrap();
    assert_eq!(view.balance, "10.00"); // 1000 minor at precision 2
    assert_eq!(view.asset, "USD");
    assert_eq!(view.account, "onramp:cash");
    assert_eq!(view.updated_seq, 3);
    assert!(view.as_of.is_none());

    // unknown account → 404-shaped error
    assert!(matches!(
        svc.balance("onramp", "ghost", None).await,
        Err(ApiError::UnknownAccount { .. })
    ));
}

#[tokio::test]
async fn account_history_pages() {
    let svc = funded_svc().await;
    for i in 0..3 {
        svc.post(tx_draft("onramp", &format!("h{i}"), balanced(100))).await.unwrap();
    }
    let page = svc
        .account_history("onramp", "cash", Page { after_seq: None, limit: 2 })
        .await
        .unwrap();
    assert_eq!(page.items.len(), 2);
    assert_eq!(page.items[0].seq, 3);
    assert_eq!(page.items[0].amount.minor, 100);
    assert_eq!(page.next, Some(4));

    let rest = svc
        .account_history("onramp", "cash", Page { after_seq: page.next, limit: 10 })
        .await
        .unwrap();
    assert_eq!(rest.items.len(), 1);
    assert_eq!(rest.items[0].seq, 5);
    assert!(rest.next.is_none()); // short page => no further cursor
}

#[tokio::test]
async fn transaction_view_and_not_found() {
    let svc = funded_svc().await;
    let posted = svc.post(tx_draft("onramp", "tv1", balanced(250))).await.unwrap();

    let view = svc.transaction(&posted.tx_id).await.unwrap();
    assert_eq!(view.tx_id, posted.tx_id);
    assert_eq!(view.book, "onramp");
    assert_eq!(view.seq, posted.seq);
    assert_eq!(view.postings.len(), 2);

    // unknown id → NotFound; garbage id → InvalidDraft
    let missing = uuid::Uuid::now_v7().to_string();
    assert!(matches!(
        svc.transaction(&missing).await,
        Err(ApiError::NotFound { .. })
    ));
    assert!(matches!(
        svc.transaction("not-a-uuid").await,
        Err(ApiError::InvalidDraft { field, .. }) if field == "tx_id"
    ));
}

#[tokio::test]
async fn trial_balance_view() {
    let svc = funded_svc().await;
    svc.post(tx_draft("onramp", "tb1", balanced(500))).await.unwrap();

    let tb = svc.trial_balance("onramp", None).await.unwrap();
    assert_eq!(tb.book, "onramp");
    assert_eq!(tb.lines.len(), 1);
    assert_eq!(tb.lines[0].asset, "USD");
    assert_eq!((tb.lines[0].debits, tb.lines[0].credits), (500, 500));
}

#[tokio::test]
async fn subscribe_yields_envelopes() {
    use futures::StreamExt;

    let svc = funded_svc().await;
    svc.post(tx_draft("onramp", "s1", balanced(10))).await.unwrap();

    let mut stream = svc.subscribe("onramp", 3).await.unwrap();
    let env = tokio::time::timeout(std::time::Duration::from_secs(5), stream.next())
        .await
        .expect("timed out")
        .expect("stream ended")
        .unwrap();
    assert_eq!(env.seq, 3);
    assert_eq!(env.kind, "transaction_posted");
    assert_eq!(env.payload["kind"], "transaction_posted");
}
```

Run: `cargo test -p talea-server --test service`
Expected: the 5 new tests FAIL with `not yet implemented`

- [ ] **Step 2: Implement the reads**

Replace the five `todo!()` methods in `talea-server/src/service.rs`:

```rust
    async fn balance(
        &self,
        book: &str,
        path: &str,
        as_of: Option<DateTime<Utc>>,
    ) -> ApiResult<BalanceView> {
        let account = AccountId { book: parse_book_lax(book)?, path: path.to_string() };
        let snapshot = self.store.balance(&account, as_of).await.map_err(map_store_err)?;
        let asset = self
            .store
            .asset(snapshot.amount.asset())
            .await
            .map_err(map_store_err)?
            .ok_or_else(|| {
                tracing::error!(
                    asset = snapshot.amount.asset().as_str(),
                    account = account.to_key(),
                    "account references an unregistered asset"
                );
                ApiError::Internal { message: "ledger inconsistency".into() }
            })?;
        Ok(BalanceView {
            account: account.to_key(),
            asset: asset.id.as_str().to_string(),
            balance: format_minor(snapshot.amount.minor(), asset.precision),
            as_of,
            updated_seq: snapshot.updated_seq,
        })
    }

    async fn account_history(
        &self,
        book: &str,
        path: &str,
        page: Page,
    ) -> ApiResult<Paged<PostingView>> {
        let account = AccountId { book: parse_book_lax(book)?, path: path.to_string() };
        let limit = (page.limit as usize).clamp(1, 1000);
        let records = self
            .store
            .account_history(&account, page.after_seq, limit)
            .await
            .map_err(map_store_err)?;
        // limit counts distinct seqs; fewer rows than limit can still mean a
        // full page, so the cursor closes only when the page came back short
        let next = if records.len() < limit { None } else { records.last().map(|r| r.seq) };
        let items = records
            .into_iter()
            .map(|r| PostingView {
                seq: r.seq,
                tx_id: r.txid.0.to_string(),
                account: r.account.to_key(),
                amount: WireAmount {
                    minor: r.amount.minor(),
                    asset: r.amount.asset().as_str().to_string(),
                },
                direction: r.direction,
                at: r.at,
            })
            .collect();
        Ok(Paged { items, next })
    }

    async fn transaction(&self, tx_id: &str) -> ApiResult<TransactionView> {
        let id = Uuid::parse_str(tx_id)
            .map_err(|e| invalid("tx_id", format!("not a uuid: {e}")))?;
        let stored = self
            .store
            .transaction(&TxId(id))
            .await
            .map_err(map_store_err)?
            .ok_or_else(|| ApiError::NotFound { what: format!("transaction {tx_id}") })?;
        let t = stored.transaction;
        Ok(TransactionView {
            tx_id: t.id.0.to_string(),
            book: t.book.0.clone(),
            seq: stored.seq,
            at: stored.at,
            postings: t
                .postings
                .iter()
                .map(|p| PostingView {
                    seq: stored.seq,
                    tx_id: t.id.0.to_string(),
                    account: p.account.to_key(),
                    amount: WireAmount {
                        minor: p.amount.minor(),
                        asset: p.amount.asset().as_str().to_string(),
                    },
                    direction: p.direction.clone(),
                    at: stored.at,
                })
                .collect(),
            external_refs: t.external_refs,
            metadata: t.metadata,
        })
    }

    async fn trial_balance(
        &self,
        book: &str,
        as_of: Option<DateTime<Utc>>,
    ) -> ApiResult<TrialBalance> {
        let b = parse_book_lax(book)?;
        let rows = self.store.trial_balance(&b, as_of).await.map_err(map_store_err)?;
        Ok(TrialBalance {
            book: b.0,
            as_of,
            lines: rows
                .into_iter()
                .map(|r| TrialBalanceLine {
                    asset: r.asset.as_str().to_string(),
                    debits: r.debits,
                    credits: r.credits,
                })
                .collect(),
        })
    }

    async fn subscribe(&self, book: &str, from: Seq) -> ApiResult<EventStream> {
        let b = parse_book_lax(book)?;
        let stream = self.store.subscribe(&b, from);
        Ok(Box::pin(stream.map(|item| {
            let s = item.map_err(map_store_err)?;
            let kind = s.event.kind().to_string();
            let payload = serde_json::to_value(&s.event).map_err(|e| {
                tracing::error!(error = %e, "event serialization failed");
                ApiError::Internal { message: "event serialization failed".into() }
            })?;
            Ok(EventEnvelope { seq: s.seq, at: s.at, kind, payload })
        })))
    }
```

- [ ] **Step 3: Run tests to verify they pass**

Run: `cargo test -p talea-server --test service`
Expected: all 10 tests PASS

- [ ] **Step 4: Commit**

```bash
git add talea-server
git commit -m "feat(server): LedgerService reads and subscribe with EventEnvelope mapping"
```

---

### Task 10: `talea-server` — HTTP error responses + bearer auth

**Files:**
- Rewrite: `talea-server/src/http/error.rs`
- Rewrite: `talea-server/src/http/auth.rs`

- [ ] **Step 1: Write `http/error.rs` with its unit test**

```rust
//! ApiError -> HTTP response mapping. Bodies are the serialized ApiError
//! (already a tagged serde enum: {"error": "unbalanced", ...}).

use axum::Json;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use talea_core::api::ApiError;

pub struct ApiFailure(pub ApiError);

impl From<ApiError> for ApiFailure {
    fn from(e: ApiError) -> Self {
        Self(e)
    }
}

impl IntoResponse for ApiFailure {
    fn into_response(self) -> Response {
        let status = match &self.0 {
            ApiError::Unbalanced { .. }
            | ApiError::InvalidAmount { .. }
            | ApiError::InvalidDraft { .. }
            | ApiError::AssetMismatch { .. } => StatusCode::BAD_REQUEST,
            ApiError::Unauthorized => StatusCode::UNAUTHORIZED,
            ApiError::UnknownAsset { .. }
            | ApiError::UnknownAccount { .. }
            | ApiError::NotFound { .. } => StatusCode::NOT_FOUND,
            ApiError::AlreadyExists { .. } | ApiError::ConstraintViolation { .. } => {
                StatusCode::CONFLICT
            }
            ApiError::Internal { .. } => StatusCode::INTERNAL_SERVER_ERROR,
        };
        (status, Json(self.0)).into_response()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn statuses_match_contract() {
        let cases = [
            (ApiError::InvalidDraft { field: "x".into(), reason: "y".into() }, StatusCode::BAD_REQUEST),
            (ApiError::Unauthorized, StatusCode::UNAUTHORIZED),
            (ApiError::NotFound { what: "t".into() }, StatusCode::NOT_FOUND),
            (ApiError::AlreadyExists { what: "a".into() }, StatusCode::CONFLICT),
            (
                ApiError::ConstraintViolation { account: "a".into(), min_balance: 0, would_be: -1 },
                StatusCode::CONFLICT,
            ),
            (ApiError::Internal { message: "m".into() }, StatusCode::INTERNAL_SERVER_ERROR),
        ];
        for (err, expected) in cases {
            assert_eq!(ApiFailure(err).into_response().status(), expected);
        }
    }
}
```

- [ ] **Step 2: Write `http/auth.rs`**

```rust
//! Static bearer-token middleware. Token unset => open mode (dev).

use axum::extract::{Request, State};
use axum::middleware::Next;
use axum::response::Response;
use talea_core::api::ApiError;

use crate::http::error::ApiFailure;

#[derive(Clone)]
pub struct AuthConfig {
    pub token: Option<String>,
}

pub async fn require_bearer(
    State(auth): State<AuthConfig>,
    req: Request,
    next: Next,
) -> Result<Response, ApiFailure> {
    let Some(expected) = &auth.token else {
        return Ok(next.run(req).await);
    };
    let provided = req
        .headers()
        .get(axum::http::header::AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "));
    match provided {
        Some(token) if constant_time_eq(token.as_bytes(), expected.as_bytes()) => {
            Ok(next.run(req).await)
        }
        _ => Err(ApiFailure(ApiError::Unauthorized)),
    }
}

/// Constant-time comparison (length is not secret).
fn constant_time_eq(a: &[u8], b: &[u8]) -> bool {
    if a.len() != b.len() {
        return false;
    }
    a.iter().zip(b).fold(0u8, |acc, (x, y)| acc | (x ^ y)) == 0
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn constant_time_eq_basics() {
        assert!(constant_time_eq(b"secret", b"secret"));
        assert!(!constant_time_eq(b"secret", b"secreT"));
        assert!(!constant_time_eq(b"secret", b"secre"));
    }
}
```

- [ ] **Step 3: Verify**

Run: `cargo test -p talea-server`
Expected: error/auth unit tests PASS alongside the existing ones (auth's middleware path is integration-tested in Task 11)

- [ ] **Step 4: Commit**

```bash
git add talea-server/src/http
git commit -m "feat(server): ApiError HTTP mapping and bearer-token middleware"
```

---

### Task 11: `talea-server` — handlers + router (REST, no SSE yet)

**Files:**
- Rewrite: `talea-server/src/http/handlers.rs`
- Rewrite: `talea-server/src/http/routes.rs`
- Create: `talea-server/tests/http.rs`

- [ ] **Step 1: Write the failing HTTP tests**

`talea-server/tests/http.rs`:

```rust
use std::sync::Arc;

use axum::body::Body;
use axum::http::{Request, StatusCode, header};
use http_body_util::BodyExt;
use sqlx::sqlite::SqlitePoolOptions;
use talea_server::http::auth::AuthConfig;
use talea_server::service::LedgerService;
use talea_store_sqlite::SqliteTaleaStore;
use tower::ServiceExt;

async fn app(token: Option<&str>) -> axum::Router {
    let pool = SqlitePoolOptions::new()
        .max_connections(1)
        .connect("sqlite::memory:")
        .await
        .unwrap();
    let store = SqliteTaleaStore::new(pool);
    store.migrate().await.unwrap();
    let service = Arc::new(LedgerService::new(Arc::new(store)));
    talea_server::http::routes::router(
        service,
        AuthConfig { token: token.map(String::from) },
        256,
    )
}

async fn send(
    app: &axum::Router,
    method: &str,
    path: &str,
    auth: Option<&str>,
    body: Option<serde_json::Value>,
) -> (StatusCode, serde_json::Value) {
    let mut req = Request::builder().method(method).uri(path);
    if let Some(token) = auth {
        req = req.header(header::AUTHORIZATION, format!("Bearer {token}"));
    }
    let req = match body {
        Some(json) => req
            .header(header::CONTENT_TYPE, "application/json")
            .body(Body::from(json.to_string()))
            .unwrap(),
        None => req.body(Body::empty()).unwrap(),
    };
    let res = app.clone().oneshot(req).await.unwrap();
    let status = res.status();
    let bytes = res.into_body().collect().await.unwrap().to_bytes();
    let json = if bytes.is_empty() {
        serde_json::json!(null)
    } else {
        serde_json::from_slice(&bytes).unwrap_or(serde_json::json!(null))
    };
    (status, json)
}

fn usd() -> serde_json::Value {
    serde_json::json!({"id":"USD","class":"fiat","precision":2,"name":"US Dollar"})
}

fn account(path: &str, kind: &str, side: &str) -> serde_json::Value {
    serde_json::json!({"book":"onramp","path":path,"asset":"USD","kind":kind,"normal_side":side})
}

fn transfer_body(idem: &str, minor: i64) -> serde_json::Value {
    serde_json::json!({
        "book": "onramp",
        "idempotency_key": idem,
        "postings": [
            {"account":"deposits","amount":{"minor":minor,"asset":"USD"},"direction":"credit"},
            {"account":"cash","amount":{"minor":minor,"asset":"USD"},"direction":"debit"}
        ]
    })
}

/// register USD + open both accounts; asserts the 204s.
async fn setup(app: &axum::Router) {
    let (s, _) = send(app, "POST", "/v1/assets", None, Some(usd())).await;
    assert_eq!(s, StatusCode::NO_CONTENT);
    let (s, _) = send(app, "POST", "/v1/accounts", None, Some(account("cash", "asset", "debit"))).await;
    assert_eq!(s, StatusCode::NO_CONTENT);
    let (s, _) = send(app, "POST", "/v1/accounts", None, Some(account("deposits", "liability", "credit"))).await;
    assert_eq!(s, StatusCode::NO_CONTENT);
}

#[tokio::test]
async fn full_rest_round_trip() {
    let app = app(None).await;
    setup(&app).await;

    // post a transaction
    let (s, posted) = send(&app, "POST", "/v1/transactions", None, Some(transfer_body("t1", 1000))).await;
    assert_eq!(s, StatusCode::OK);
    assert_eq!(posted["seq"], 3);
    assert_eq!(posted["deduplicated"], false);

    // balance
    let (s, bal) = send(&app, "GET", "/v1/books/onramp/accounts/cash/balance", None, None).await;
    assert_eq!(s, StatusCode::OK);
    assert_eq!(bal["balance"], "10.00");
    assert_eq!(bal["updated_seq"], 3);

    // history
    let (s, page) = send(&app, "GET", "/v1/books/onramp/accounts/cash/history?limit=10", None, None).await;
    assert_eq!(s, StatusCode::OK);
    assert_eq!(page["items"].as_array().unwrap().len(), 1);

    // transaction view
    let tx_id = posted["tx_id"].as_str().unwrap();
    let (s, view) = send(&app, "GET", &format!("/v1/transactions/{tx_id}"), None, None).await;
    assert_eq!(s, StatusCode::OK);
    assert_eq!(view["book"], "onramp");

    // trial balance
    let (s, tb) = send(&app, "GET", "/v1/books/onramp/trial-balance", None, None).await;
    assert_eq!(s, StatusCode::OK);
    assert_eq!(tb["lines"][0]["debits"], 1000);

    // health
    let (s, _) = send(&app, "GET", "/health", None, None).await;
    assert_eq!(s, StatusCode::OK);
}

#[tokio::test]
async fn error_statuses() {
    let app = app(None).await;
    setup(&app).await;

    // 400 unbalanced
    let mut bad = transfer_body("e1", 1000);
    bad["postings"][1]["amount"]["minor"] = serde_json::json!(900);
    let (s, body) = send(&app, "POST", "/v1/transactions", None, Some(bad)).await;
    assert_eq!(s, StatusCode::BAD_REQUEST);
    assert_eq!(body["error"], "unbalanced");

    // 404 unknown account balance
    let (s, body) = send(&app, "GET", "/v1/books/onramp/accounts/ghost/balance", None, None).await;
    assert_eq!(s, StatusCode::NOT_FOUND);
    assert_eq!(body["error"], "unknown_account");

    // 404 unknown transaction
    let missing = uuid::Uuid::now_v7();
    let (s, body) = send(&app, "GET", &format!("/v1/transactions/{missing}"), None, None).await;
    assert_eq!(s, StatusCode::NOT_FOUND);
    assert_eq!(body["error"], "not_found");

    // 409 conflicting asset re-registration
    let mut conflict = usd();
    conflict["precision"] = serde_json::json!(8);
    let (s, body) = send(&app, "POST", "/v1/assets", None, Some(conflict)).await;
    assert_eq!(s, StatusCode::CONFLICT);
    assert_eq!(body["error"], "already_exists");
}

#[tokio::test]
async fn auth_gate() {
    let app = app(Some("sekrit")).await;

    // missing token → 401
    let (s, body) = send(&app, "POST", "/v1/assets", None, Some(usd())).await;
    assert_eq!(s, StatusCode::UNAUTHORIZED);
    assert_eq!(body["error"], "unauthorized");

    // wrong token → 401
    let (s, _) = send(&app, "POST", "/v1/assets", Some("nope"), Some(usd())).await;
    assert_eq!(s, StatusCode::UNAUTHORIZED);

    // right token → 204
    let (s, _) = send(&app, "POST", "/v1/assets", Some("sekrit"), Some(usd())).await;
    assert_eq!(s, StatusCode::NO_CONTENT);

    // health stays open
    let (s, _) = send(&app, "GET", "/health", None, None).await;
    assert_eq!(s, StatusCode::OK);
}
```

Run: `cargo test -p talea-server --test http`
Expected: COMPILE ERROR — `router` does not exist

- [ ] **Step 2: Write `http/handlers.rs`**

```rust
//! Thin handlers: parse -> LedgerApi -> JSON. No logic beyond extraction.

use axum::Json;
use axum::extract::{Path, Query, State};
use axum::http::StatusCode;
use chrono::{DateTime, Utc};
use serde::Deserialize;
use talea_core::api::*;

use crate::http::error::ApiFailure;
use crate::http::routes::AppState;

#[derive(Deserialize)]
pub struct AsOfQuery {
    pub as_of: Option<DateTime<Utc>>,
}

#[derive(Deserialize)]
pub struct HistoryQuery {
    pub after_seq: Option<i64>,
    pub limit: Option<u32>,
}

pub async fn register_asset(
    State(state): State<AppState>,
    Json(draft): Json<AssetDraft>,
) -> Result<StatusCode, ApiFailure> {
    state.service.register_asset(draft).await.map_err(ApiFailure)?;
    Ok(StatusCode::NO_CONTENT)
}

pub async fn open_account(
    State(state): State<AppState>,
    Json(draft): Json<AccountDraft>,
) -> Result<StatusCode, ApiFailure> {
    state.service.open_account(draft).await.map_err(ApiFailure)?;
    Ok(StatusCode::NO_CONTENT)
}

pub async fn post_transaction(
    State(state): State<AppState>,
    Json(draft): Json<TransactionDraft>,
) -> Result<Json<Posted>, ApiFailure> {
    Ok(Json(state.service.post(draft).await.map_err(ApiFailure)?))
}

pub async fn get_balance(
    State(state): State<AppState>,
    Path((book, path)): Path<(String, String)>,
    Query(q): Query<AsOfQuery>,
) -> Result<Json<BalanceView>, ApiFailure> {
    Ok(Json(state.service.balance(&book, &path, q.as_of).await.map_err(ApiFailure)?))
}

pub async fn get_history(
    State(state): State<AppState>,
    Path((book, path)): Path<(String, String)>,
    Query(q): Query<HistoryQuery>,
) -> Result<Json<Paged<PostingView>>, ApiFailure> {
    let page = Page {
        after_seq: q.after_seq,
        limit: q.limit.unwrap_or(100).min(1000),
    };
    Ok(Json(state.service.account_history(&book, &path, page).await.map_err(ApiFailure)?))
}

pub async fn get_transaction(
    State(state): State<AppState>,
    Path(tx_id): Path<String>,
) -> Result<Json<TransactionView>, ApiFailure> {
    Ok(Json(state.service.transaction(&tx_id).await.map_err(ApiFailure)?))
}

pub async fn get_trial_balance(
    State(state): State<AppState>,
    Path(book): Path<String>,
    Query(q): Query<AsOfQuery>,
) -> Result<Json<TrialBalance>, ApiFailure> {
    Ok(Json(state.service.trial_balance(&book, q.as_of).await.map_err(ApiFailure)?))
}
```

- [ ] **Step 3: Write `http/routes.rs`** (SSE route and tower layers land in Tasks 12–13)

```rust
//! Router assembly. Admission-control layers are added in a later task.

use std::sync::Arc;

use axum::Router;
use axum::routing::{get, post};

use crate::http::auth::{self, AuthConfig};
use crate::http::handlers;
use crate::service::LedgerService;

#[derive(Clone)]
pub struct AppState {
    pub service: Arc<LedgerService>,
}

pub fn router(service: Arc<LedgerService>, auth: AuthConfig, max_inflight: usize) -> Router {
    let _ = max_inflight; // consumed by the admission-control task
    let api = Router::new()
        .route("/assets", post(handlers::register_asset))
        .route("/accounts", post(handlers::open_account))
        .route("/transactions", post(handlers::post_transaction))
        .route("/transactions/{tx_id}", get(handlers::get_transaction))
        .route("/books/{book}/accounts/{path}/balance", get(handlers::get_balance))
        .route("/books/{book}/accounts/{path}/history", get(handlers::get_history))
        .route("/books/{book}/trial-balance", get(handlers::get_trial_balance))
        .layer(axum::middleware::from_fn_with_state(auth, auth::require_bearer))
        .with_state(AppState { service });

    Router::new()
        .nest("/v1", api)
        .route("/health", get(|| async { "ok" }))
}
```

(`use talea_core::api::LedgerApi;` must be in scope in `handlers.rs` via the `talea_core::api::*` glob for the trait methods to resolve.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `cargo test -p talea-server --test http`
Expected: all 3 tests PASS

- [ ] **Step 5: Commit**

```bash
git add talea-server
git commit -m "feat(server): REST handlers and router with auth middleware"
```

---

### Task 12: `talea-server` — SSE endpoint

**Files:**
- Rewrite: `talea-server/src/http/sse.rs`
- Modify: `talea-server/src/http/routes.rs`
- Modify: `talea-server/tests/http.rs`

- [ ] **Step 1: Write the failing test**

Append to `talea-server/tests/http.rs`:

```rust
#[tokio::test]
async fn sse_streams_envelopes_with_ids() {
    use futures::StreamExt;
    use std::time::Duration;

    let app = app(None).await;
    setup(&app).await;
    let (s, _) = send(&app, "POST", "/v1/transactions", None, Some(transfer_body("sse1", 100))).await;
    assert_eq!(s, StatusCode::OK);

    // from=2 means "last seen seq 2": stream starts at 3 (the transaction)
    let res = app
        .clone()
        .oneshot(
            Request::builder()
                .uri("/v1/books/onramp/events?from=2")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);
    assert_eq!(
        res.headers()[header::CONTENT_TYPE].to_str().unwrap(),
        "text/event-stream"
    );

    let mut body = res.into_body().into_data_stream();
    let first = tokio::time::timeout(Duration::from_secs(5), body.next())
        .await
        .expect("timed out waiting for first SSE chunk")
        .expect("body ended")
        .unwrap();
    let text = String::from_utf8(first.to_vec()).unwrap();
    assert!(text.contains("id: 3"), "got: {text}");
    assert!(text.contains("transaction_posted"), "got: {text}");
}
```

Run: `cargo test -p talea-server --test http sse_streams`
Expected: FAIL — 404 (route not mounted)

- [ ] **Step 2: Write `http/sse.rs`**

```rust
//! SSE event stream: catch-up + live tail per book. Each event carries
//! id: <seq>; reconnects resume via Last-Event-ID (wins) or ?from=,
//! both meaning "last seen seq" — the stream starts at value + 1.

use axum::extract::{Path, Query, State};
use axum::http::HeaderMap;
use axum::response::sse::{Event, KeepAlive, Sse};
use futures::{Stream, StreamExt};
use serde::Deserialize;
use talea_core::api::LedgerApi;

use crate::http::error::ApiFailure;
use crate::http::routes::AppState;

#[derive(Deserialize)]
pub struct EventsQuery {
    pub from: Option<i64>,
}

pub async fn events(
    State(state): State<AppState>,
    Path(book): Path<String>,
    headers: HeaderMap,
    Query(q): Query<EventsQuery>,
) -> Result<Sse<impl Stream<Item = Result<Event, std::convert::Infallible>>>, ApiFailure> {
    let last_seen = headers
        .get("last-event-id")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.parse::<i64>().ok())
        .or(q.from);
    let from = last_seen.map(|s| s + 1).unwrap_or(1);

    let mut inner = state.service.subscribe(&book, from).await.map_err(ApiFailure)?;
    let stream = async_stream::stream! {
        while let Some(item) = inner.next().await {
            match item {
                Ok(env) => match Event::default().id(env.seq.to_string()).json_data(&env) {
                    Ok(ev) => yield Ok::<_, std::convert::Infallible>(ev),
                    Err(e) => {
                        tracing::error!(error = %e, "sse serialization failed");
                        yield Ok(Event::default().event("error").data("serialization failure"));
                        return;
                    }
                },
                // a store-stream error ends the connection; the client
                // reconnects with its cursor
                Err(e) => {
                    yield Ok(Event::default().event("error").data(
                        serde_json::to_string(&e).unwrap_or_else(|_| "\"internal\"".into()),
                    ));
                    return;
                }
            }
        }
    };
    Ok(Sse::new(stream).keep_alive(KeepAlive::default()))
}
```

- [ ] **Step 3: Mount the route**

In `talea-server/src/http/routes.rs`, add to the `api` router (with the other routes, before the auth layer):

```rust
        .route("/books/{book}/events", get(crate::http::sse::events))
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cargo test -p talea-server --test http`
Expected: all 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add talea-server
git commit -m "feat(server): SSE event stream with Last-Event-ID resume"
```

---

### Task 13: `talea-server` — admission control + main wiring

**Files:**
- Modify: `talea-server/src/http/routes.rs`
- Rewrite: `talea-server/src/main.rs`
- Modify: `talea-server/tests/http.rs`

- [ ] **Step 1: Write the failing tests**

Append to `talea-server/tests/http.rs`:

```rust
#[tokio::test]
async fn overload_maps_to_503_with_retry_after() {
    let resp = talea_server::http::routes::handle_middleware_error(Box::new(
        tower::load_shed::error::Overloaded::new(),
    ))
    .await;
    assert_eq!(resp.status(), StatusCode::SERVICE_UNAVAILABLE);
    assert!(resp.headers().contains_key(header::RETRY_AFTER));
}

/// Exercises the exact middleware stack routes.rs installs, around a slow
/// service: with one in-flight slot taken, the concurrent request sheds.
#[tokio::test]
async fn load_shed_sheds_when_saturated() {
    use std::time::Duration;
    use tower::{Service, ServiceBuilder, ServiceExt, service_fn};

    let svc = ServiceBuilder::new()
        .layer(axum::error_handling::HandleErrorLayer::new(
            talea_server::http::routes::handle_middleware_error,
        ))
        .load_shed()
        .concurrency_limit(1)
        .service(service_fn(|_req: Request<Body>| async {
            tokio::time::sleep(Duration::from_millis(200)).await;
            Ok::<_, std::convert::Infallible>(axum::response::Response::new(Body::empty()))
        }));

    let slow = {
        let mut svc = svc.clone();
        async move {
            svc.ready().await.unwrap();
            svc.call(Request::builder().body(Body::empty()).unwrap()).await
        }
    };
    let shed = {
        let mut svc = svc.clone();
        async move {
            tokio::time::sleep(Duration::from_millis(50)).await;
            svc.ready().await.unwrap();
            svc.call(Request::builder().body(Body::empty()).unwrap()).await
        }
    };
    let (a, b) = tokio::join!(slow, shed);
    assert_eq!(a.unwrap().status(), StatusCode::OK);
    assert_eq!(b.unwrap().status(), StatusCode::SERVICE_UNAVAILABLE);
}
```

Run: `cargo test -p talea-server --test http overload`
Expected: COMPILE ERROR — `handle_middleware_error` does not exist

(If `Overloaded::new()` is not public in the tower version that resolves, delete the `overload_maps_to_503_with_retry_after` test — `load_shed_sheds_when_saturated` covers the mapping end-to-end through the real stack.)

- [ ] **Step 2: Add the layers and error mapper to `http/routes.rs`**

Replace `routes.rs` content with:

```rust
//! Router assembly with admission control: requests beyond the in-flight
//! limit shed immediately as 503 + Retry-After; the DB row lock remains the
//! write arbiter (correct across instances) — see the spec's Part 4.5.

use std::sync::Arc;

use axum::Router;
use axum::error_handling::HandleErrorLayer;
use axum::http::{StatusCode, header};
use axum::response::{IntoResponse, Response};
use axum::routing::{get, post};
use tower::ServiceBuilder;

use crate::config::Config;
use crate::http::auth::{self, AuthConfig};
use crate::http::handlers;
use crate::service::LedgerService;

#[derive(Clone)]
pub struct AppState {
    pub service: Arc<LedgerService>,
}

pub async fn handle_middleware_error(err: tower::BoxError) -> Response {
    if err.is::<tower::load_shed::error::Overloaded>() {
        (
            StatusCode::SERVICE_UNAVAILABLE,
            [(header::RETRY_AFTER, "1")],
            "overloaded; retry with the same idempotency key",
        )
            .into_response()
    } else if err.is::<tower::timeout::error::Elapsed>() {
        (StatusCode::REQUEST_TIMEOUT, "request timed out").into_response()
    } else {
        tracing::error!(error = %err, "middleware failure");
        (StatusCode::INTERNAL_SERVER_ERROR, "internal error").into_response()
    }
}

pub fn router(service: Arc<LedgerService>, auth: AuthConfig, max_inflight: usize) -> Router {
    let state = AppState { service };

    // SSE is long-lived: no request timeout. Everything else gets one.
    let rest = Router::new()
        .route("/assets", post(handlers::register_asset))
        .route("/accounts", post(handlers::open_account))
        .route("/transactions", post(handlers::post_transaction))
        .route("/transactions/{tx_id}", get(handlers::get_transaction))
        .route("/books/{book}/accounts/{path}/balance", get(handlers::get_balance))
        .route("/books/{book}/accounts/{path}/history", get(handlers::get_history))
        .route("/books/{book}/trial-balance", get(handlers::get_trial_balance))
        .layer(
            ServiceBuilder::new()
                .layer(HandleErrorLayer::new(handle_middleware_error))
                .timeout(Config::REQUEST_TIMEOUT),
        );

    let streaming = Router::new().route("/books/{book}/events", get(crate::http::sse::events));

    let api = rest
        .merge(streaming)
        .layer(axum::middleware::from_fn_with_state(auth, auth::require_bearer))
        .with_state(state);

    Router::new()
        .nest("/v1", api)
        .route("/health", get(|| async { "ok" }))
        .layer(
            ServiceBuilder::new()
                .layer(HandleErrorLayer::new(handle_middleware_error))
                .load_shed()
                .concurrency_limit(max_inflight),
        )
}
```

- [ ] **Step 3: Rewrite `talea-server/src/main.rs`**

```rust
use std::sync::Arc;

use talea_core::store::{Store, StoreError};
use talea_server::config::Config;
use talea_server::http::auth::AuthConfig;
use talea_server::http::routes::router;
use talea_server::service::LedgerService;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info".into()),
        )
        .init();

    let config = Config::from_env()?;
    let store = connect_store(&config).await?;
    if config.api_token.is_none() {
        tracing::warn!("TALEA_API_TOKEN not set - the API is OPEN (dev mode)");
    }

    let service = Arc::new(LedgerService::new(store));
    let app = router(
        service,
        AuthConfig { token: config.api_token.clone() },
        config.max_inflight,
    );

    let listener = tokio::net::TcpListener::bind(config.bind).await?;
    tracing::info!(bind = %config.bind, "talea-server listening");
    axum::serve(listener, app)
        .with_graceful_shutdown(async {
            tokio::signal::ctrl_c().await.ok();
            tracing::info!("shutting down");
        })
        .await?;
    Ok(())
}

/// URL-scheme store selection. The server owns pool sizing so admission
/// control (acquire_timeout -> 503) is configurable in one place.
async fn connect_store(config: &Config) -> Result<Arc<dyn Store>, Box<dyn std::error::Error>> {
    if config.db_url.starts_with("postgres://") || config.db_url.starts_with("postgresql://") {
        let pool = sqlx::postgres::PgPoolOptions::new()
            .max_connections(config.db_pool)
            .acquire_timeout(Config::DB_ACQUIRE_TIMEOUT)
            .connect(&config.db_url)
            .await?;
        let store = talea_store_postgres::PgTaleaStore::new(pool);
        store.migrate().await.map_err(box_store_err)?;
        Ok(Arc::new(store))
    } else if config.db_url.starts_with("sqlite:") {
        use sqlx::sqlite::{SqliteConnectOptions, SqliteJournalMode, SqlitePoolOptions};
        use std::str::FromStr;

        let opts = SqliteConnectOptions::from_str(&config.db_url)?
            .create_if_missing(true)
            .journal_mode(SqliteJournalMode::Wal)
            .busy_timeout(std::time::Duration::from_secs(5))
            .foreign_keys(true);
        let pool = SqlitePoolOptions::new()
            .max_connections(config.db_pool)
            .acquire_timeout(Config::DB_ACQUIRE_TIMEOUT)
            .connect_with(opts)
            .await?;
        let store = talea_store_sqlite::SqliteTaleaStore::new(pool);
        store.migrate().await.map_err(box_store_err)?;
        Ok(Arc::new(store))
    } else {
        Err(format!(
            "unsupported TALEA_DB_URL scheme: {} (expected postgres://... or sqlite://...)",
            config.db_url
        )
        .into())
    }
}

fn box_store_err(e: StoreError) -> Box<dyn std::error::Error> {
    Box::new(e)
}
```

- [ ] **Step 4: Run all tests**

Run: `cargo test -p talea-server`
Expected: config + error/auth unit tests, 10 service tests, 6 http tests — all PASS

- [ ] **Step 5: Manual smoke test**

```bash
TALEA_DB_URL=sqlite://./talea-dev.db cargo run -p talea-server &
sleep 2
curl -s -X POST localhost:8080/v1/assets -H 'content-type: application/json' \
  -d '{"id":"USD","class":"fiat","precision":2,"name":"US Dollar"}' -i | head -1
curl -s -X POST localhost:8080/v1/accounts -H 'content-type: application/json' \
  -d '{"book":"demo","path":"cash","asset":"USD","kind":"asset","normal_side":"debit"}' -i | head -1
curl -s -X POST localhost:8080/v1/accounts -H 'content-type: application/json' \
  -d '{"book":"demo","path":"equity","asset":"USD","kind":"equity","normal_side":"credit"}' -i | head -1
curl -s -X POST localhost:8080/v1/transactions -H 'content-type: application/json' \
  -d '{"book":"demo","idempotency_key":"seed","postings":[{"account":"equity","amount":{"minor":100000,"asset":"USD"},"direction":"credit"},{"account":"cash","amount":{"minor":100000,"asset":"USD"},"direction":"debit"}]}'
curl -s localhost:8080/v1/books/demo/accounts/cash/balance
kill %1 && rm -f talea-dev.db talea-dev.db-shm talea-dev.db-wal
```

Expected: two `HTTP/1.1 204`, one Posted JSON with `"seq":3`, balance JSON with `"balance":"1000.00"`.

- [ ] **Step 6: Commit**

```bash
git add talea-server
git commit -m "feat(server): admission control layers and binary wiring"
```

---

### Task 14: Final verification

**Files:** none (verification only; fix what it surfaces)

- [ ] **Step 1: Full workspace check**

Run: `cargo test --workspace`
Expected: all PASS (Postgres conformance skips without `TALEA_TEST_PG_URL`; run gated when available)

- [ ] **Step 2: Lint**

Run: `cargo clippy --workspace --all-targets`
Expected: no errors; fix any warnings this work introduced. The pre-existing `talea-core/src/api/requests.rs` unused-`AssetClass` import should now be either used (by `parse_asset_draft`'s types living in core) or removed — remove it if still unused.

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "chore: lint fixes for talea-server"
```

(Skip if nothing changed.)

---

## Self-Review Notes

- **Spec coverage:** Part 1 contract fixes (Tasks 1–2), Part 2 store reads + BalanceSnapshot (Tasks 3–6), Part 3 service (Tasks 8–9), Part 4 HTTP incl. SSE + auth + status mapping (Tasks 10–12), Part 4.5 admission control (Task 13), Part 5 wiring (Task 13), Part 6 testing woven through every task. Out-of-scope items stay out.
- **Known API-drift risks:** axum 0.8 `{param}` path syntax, `HandleErrorLayer` location, `Sse`/`Event::json_data`, `into_data_stream`, tower 0.5 `load_shed`/`concurrency_limit` builder methods, `Overloaded::new()` visibility. All steps using them say "adapt mechanically and report" — semantics stand regardless.
- **`history` cursor semantics:** store-level `limit` counts distinct seqs (postings of one tx never split); service closes the cursor only on a short page. The conformance and service tests pin both behaviors.
- **SSE resume:** `Last-Event-ID` and `?from=` both mean "last seen" (stream starts at value+1) — pinned by the `?from=2` → first event seq 3 test.
- **Auth in tests:** the SSE and REST routers share one auth layer; `auth_gate` covers enabled/disabled and `/health` exemption.






