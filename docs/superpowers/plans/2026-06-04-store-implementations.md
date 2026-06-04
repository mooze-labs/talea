# Talea Store Implementations (Postgres + SQLite) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the `Store` trait for Postgres and SQLite with an append-only per-book event log as source of truth, normalized postings/balances projections, idempotent commits, and live subscriptions — verified by a shared conformance test suite.

**Architecture:** `talea-core` is extended first (accessors, serde derives, registry methods on `Store`, new error variants). A new `talea-store-conformance` crate holds a backend-agnostic test suite built on `&impl Store`. Each store crate then implements the trait against an identical logical schema: `events` (truth) + `transactions`/`postings`/`balances` (projections) + `books` (per-book gapless seq counter), all written in one DB transaction. Postgres notifies via `pg_notify`/`PgListener`; SQLite via an in-process `tokio::sync::broadcast` channel. Notifications are wake-ups only — subscribers always read rows from the `events` table.

**Tech Stack:** Rust (edition 2024), sqlx 0.9 (postgres / sqlite), tokio, async-stream, serde/serde_json, chrono, uuid.

**Spec:** `docs/superpowers/specs/2026-06-04-store-implementations-design.md` (approved). Key locked decisions: per-book gapless `Seq`; `as_of` filters on commit time; reserved `_system` book for `AssetRegistered` events; raw balance = Σdebits − Σcredits, effective balance is normal-side-adjusted; `read_events` `from` is **inclusive**; idempotency keys unique per `(book, idempotency_key)`.

---

## File Structure

```
Cargo.toml                                       — modify: add talea-store-conformance member
talea-core/src/types/assets.rs                   — modify: Amount/AssetId/Network accessors, serde derives
talea-core/src/types/accounts.rs                 — modify: serde derives, AccountKind::as_str/from_db, Book::is_reserved
talea-core/src/types/transactions.rs             — modify: serde derives, Direction::from_db
talea-core/src/events.rs                         — modify: serde tagged enum, kind(), AccountOpened carries cfg
talea-core/src/store.rs                          — modify: registry methods, StoreError variants, SYSTEM_BOOK
talea-store-conformance/Cargo.toml               — create
talea-store-conformance/src/lib.rs               — create: fixtures + 12 conformance test fns
talea-store-sqlite/Cargo.toml                    — modify: fill in dependencies
talea-store-sqlite/migrations/0001_init.sql      — create
talea-store-sqlite/src/lib.rs                    — rewrite: SqliteTaleaStore
talea-store-sqlite/tests/conformance.rs          — create
talea-store-postgres/Cargo.toml                  — modify: add deps/features
talea-store-postgres/migrations/0001_init.sql    — create
talea-store-postgres/src/lib.rs                  — rewrite: PgTaleaStore
talea-store-postgres/src/helpers.rs              — keep as-is (book_channel_name)
talea-store-postgres/tests/conformance.rs        — create
```

A note on one deliberate spec refinement: `LedgerEvent::AccountOpened` must carry the `AccountCfg` (normal_side, min_balance) in addition to the `AccountDef`, otherwise the event log cannot reproduce account state ("log as truth"). The variant becomes `AccountOpened { def: AccountDef, cfg: AccountCfg }`.

---

### Task 1: `talea-core` — Amount/AssetId/Network accessors

`Amount`, `AssetId`, and `Network` have private fields with no constructors or getters; store crates can neither build nor read them.

**Files:**
- Modify: `talea-core/src/types/assets.rs`

- [ ] **Step 1: Write the failing test**

Append to `talea-core/src/types/assets.rs`:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn amount_accessors_round_trip() {
        let a = Amount::new(1500, AssetId::new("USD"));
        assert_eq!(a.minor(), 1500);
        assert_eq!(a.asset().as_str(), "USD");
        assert_eq!(Network::new("bitcoin").as_str(), "bitcoin");
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cargo test -p talea_core amount_accessors_round_trip`
Expected: COMPILE ERROR — `no function or associated item named 'new' found for struct 'Amount'`

- [ ] **Step 3: Write minimal implementation**

Add to `talea-core/src/types/assets.rs` (after the struct definitions):

```rust
impl AssetId {
    pub fn new(id: impl Into<String>) -> Self {
        Self(id.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl Network {
    pub fn new(network: impl Into<String>) -> Self {
        Self(network.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl Amount {
    pub fn new(minor: i64, asset: AssetId) -> Self {
        Self { minor, asset }
    }

    pub fn minor(&self) -> i64 {
        self.minor
    }

    pub fn asset(&self) -> &AssetId {
        &self.asset
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cargo test -p talea_core amount_accessors_round_trip`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add talea-core/src/types/assets.rs
git commit -m "feat(core): add Amount/AssetId/Network constructors and accessors"
```

---

### Task 2: `talea-core` — serde derives, DB string helpers, event payload shape

The `events.payload` column stores `LedgerEvent` as tagged JSON, so every type reachable from it needs `Serialize`/`Deserialize`. The stores also need string round-trips for `Direction`/`AccountKind` columns, `Book::is_reserved()`, and `PartialEq` on definitions (to compare for registry idempotency).

**Files:**
- Modify: `talea-core/src/types/assets.rs`
- Modify: `talea-core/src/types/accounts.rs`
- Modify: `talea-core/src/types/transactions.rs`
- Modify: `talea-core/src/events.rs`
- Modify: `talea-core/src/store.rs` (AccountCfg derives only — rest of store.rs changes in Task 3)

- [ ] **Step 1: Write the failing round-trip test**

Append to `talea-core/src/events.rs`:

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use crate::store::AccountCfg;
    use crate::types::*;
    use chrono::Utc;
    use uuid::Uuid;

    #[test]
    fn ledger_event_json_round_trip() {
        let tx = Transaction {
            id: TxId(Uuid::nil()),
            book: Book("onramp".into()),
            postings: vec![Posting {
                account: AccountId {
                    book: Book("onramp".into()),
                    path: "treasury:btc".into(),
                },
                amount: Amount::new(100, AssetId::new("BTC")),
                direction: Direction::Debit,
            }],
            idempotency_key: IdempotencyKey("k1".into()),
            external_refs: vec![],
            metadata: serde_json::json!({}),
            occurred_at: Utc::now(),
        };
        let ev = LedgerEvent::TransactionPosted(tx);
        assert_eq!(ev.kind(), "transaction_posted");
        let json = serde_json::to_string(&ev).unwrap();
        assert!(json.contains("\"kind\":\"transaction_posted\""));
        let back: LedgerEvent = serde_json::from_str(&json).unwrap();
        match back {
            LedgerEvent::TransactionPosted(t) => assert_eq!(t.idempotency_key.0, "k1"),
            _ => panic!("wrong variant"),
        }

        let opened = LedgerEvent::AccountOpened {
            def: AccountDef {
                id: AccountId {
                    book: Book("onramp".into()),
                    path: "cash".into(),
                },
                asset: AssetId::new("USD"),
                kind: AccountKind::Asset,
            },
            cfg: AccountCfg {
                normal_side: Some(Direction::Debit),
                min_balance: Some(0),
            },
        };
        let json = serde_json::to_string(&opened).unwrap();
        let back: LedgerEvent = serde_json::from_str(&json).unwrap();
        assert!(matches!(back, LedgerEvent::AccountOpened { cfg, .. } if cfg.min_balance == Some(0)));
    }

    #[test]
    fn db_string_round_trips() {
        assert_eq!(Direction::from_db("D"), Some(Direction::Debit));
        assert_eq!(Direction::from_db("C"), Some(Direction::Credit));
        assert_eq!(Direction::from_db("x"), None);
        assert_eq!(AccountKind::from_db("liability"), Some(AccountKind::Liability));
        assert_eq!(AccountKind::from_db(AccountKind::Clearing.as_str()), Some(AccountKind::Clearing));
        assert!(Book("_system".into()).is_reserved());
        assert!(!Book("onramp".into()).is_reserved());
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cargo test -p talea_core ledger_event_json_round_trip`
Expected: COMPILE ERROR — `LedgerEvent` has no `Serialize`, no variant `AccountOpened { .. }`, no `kind()`, no `from_db`

- [ ] **Step 3: Add derives and helpers**

In `talea-core/src/types/assets.rs`, change the derive lines (struct bodies stay identical):

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AssetDef { /* unchanged fields */ }

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct AssetId(String);

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct Network(String);

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AssetClass { /* unchanged variants */ }

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Amount { /* unchanged fields */ }
```

In `talea-core/src/types/accounts.rs`:

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AccountDef { /* unchanged fields */ }

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct Book(pub String);

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct AccountId { /* unchanged fields */ }

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AccountKind { /* unchanged variants */ }
```

Add these impls to `accounts.rs`:

```rust
impl Book {
    /// Book names starting with '_' are reserved for the ledger itself
    /// (e.g. "_system" holds AssetRegistered events).
    pub fn is_reserved(&self) -> bool {
        self.0.starts_with('_')
    }
}

impl AccountKind {
    pub fn as_str(&self) -> &str {
        match self {
            AccountKind::Asset => "asset",
            AccountKind::Liability => "liability",
            AccountKind::Income => "income",
            AccountKind::Expense => "expense",
            AccountKind::Equity => "equity",
            AccountKind::Clearing => "clearing",
        }
    }

    pub fn from_db(s: &str) -> Option<Self> {
        match s {
            "asset" => Some(AccountKind::Asset),
            "liability" => Some(AccountKind::Liability),
            "income" => Some(AccountKind::Income),
            "expense" => Some(AccountKind::Expense),
            "equity" => Some(AccountKind::Equity),
            "clearing" => Some(AccountKind::Clearing),
            _ => None,
        }
    }
}
```

In `talea-core/src/types/transactions.rs`, change derives and add `Direction::from_db`:

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transaction { /* unchanged fields */ }

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Posting { /* unchanged fields */ }

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct TxId(pub Uuid);

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct IdempotencyKey(pub String);

impl Direction {
    // existing as_str() stays; add:
    pub fn from_db(s: &str) -> Option<Self> {
        match s {
            "D" => Some(Direction::Debit),
            "C" => Some(Direction::Credit),
            _ => None,
        }
    }
}
```

(`Direction` already derives `Debug, Clone, PartialEq, Eq, Serialize, Deserialize`.)

In `talea-core/src/store.rs`, change only the `AccountCfg` derive for now:

```rust
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
pub struct AccountCfg {
    pub normal_side: Option<Direction>,
    pub min_balance: Option<i64>,
}
```

Replace `talea-core/src/events.rs` (above the test module) with:

```rust
use serde::{Deserialize, Serialize};

use crate::store::AccountCfg;
use crate::types::{AccountDef, AssetDef, Transaction};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum LedgerEvent {
    AssetRegistered(AssetDef),
    AccountOpened { def: AccountDef, cfg: AccountCfg },
    TransactionPosted(Transaction),
}

impl LedgerEvent {
    /// Stable string used for the events.kind column.
    pub fn kind(&self) -> &'static str {
        match self {
            LedgerEvent::AssetRegistered(_) => "asset_registered",
            LedgerEvent::AccountOpened { .. } => "account_opened",
            LedgerEvent::TransactionPosted(_) => "transaction_posted",
        }
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cargo test -p talea_core`
Expected: PASS (all tests, including Task 1's)

- [ ] **Step 5: Verify the workspace still compiles**

Run: `cargo check --workspace`
Expected: success (warnings OK)

- [ ] **Step 6: Commit**

```bash
git add talea-core/src
git commit -m "feat(core): serde derives, DB string helpers, AccountOpened carries cfg"
```

---

### Task 3: `talea-core` — Store trait registry methods + StoreError variants

**Files:**
- Modify: `talea-core/src/store.rs`
- Modify: `talea-store-postgres/src/lib.rs` (add `todo!()` stubs so the workspace keeps compiling)

- [ ] **Step 1: Rewrite `talea-core/src/store.rs`**

Full new content (keeping the Task 2 `AccountCfg`):

```rust
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use futures::stream::BoxStream;

use crate::events::LedgerEvent;
use crate::types::{
    AccountDef, AccountId, Amount, AssetDef, AssetId, Book, Direction, Seq, Transaction, TxId,
};

pub type EventStream = BoxStream<'static, Result<Sequenced<LedgerEvent>, StoreError>>;

/// Reserved book that holds book-agnostic events (AssetRegistered).
/// User books may not start with '_'.
pub const SYSTEM_BOOK: &str = "_system";

pub fn system_book() -> Book {
    Book(SYSTEM_BOOK.to_string())
}

#[async_trait]
pub trait Store: Send + Sync {
    /// Register an asset. Idempotent on id: identical def => Ok(());
    /// same id with a different def => AlreadyExists.
    /// Appends an AssetRegistered event to the "_system" book.
    async fn register_asset(&self, asset: &AssetDef) -> Result<(), StoreError>;

    /// Open an account. Idempotent on id, same rule as register_asset.
    /// Appends an AccountOpened event to the account's book.
    async fn open_account(&self, def: &AccountDef, cfg: &AccountCfg) -> Result<(), StoreError>;

    /// Append one transaction's event atomically and exactly-once.
    /// Duplicate `idem` => Ok(prior Committed), not an error.
    async fn commit(&self, transaction: &Transaction) -> Result<Committed, StoreError>;

    /// Current balance (projection) or point-in-time (replay from log).
    /// `as_of` filters on commit time. Returns the normal-side-adjusted
    /// effective balance.
    async fn balance(
        &self,
        account: &AccountId,
        as_of: Option<DateTime<Utc>>,
    ) -> Result<Amount, StoreError>;

    /// Ordered, paginated log read - rebuilds, reconciliation, stream catch-up.
    /// `from` is inclusive: resume by passing last_seen + 1.
    async fn read_events(
        &self,
        book: &Book,
        from: Seq,
        limit: usize,
    ) -> Result<Vec<Sequenced<LedgerEvent>>, StoreError>;

    fn subscribe(&self, book: &Book, from: Seq) -> EventStream;
}

#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
pub struct AccountCfg {
    pub normal_side: Option<Direction>,
    pub min_balance: Option<i64>,
}

#[derive(Debug, Clone, PartialEq)]
pub struct Committed {
    pub txid: TxId,
    pub seq: Seq,
    pub at: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub struct Sequenced<T> {
    pub seq: Seq,
    pub at: DateTime<Utc>,
    pub event: T,
}

#[derive(Debug, thiserror::Error)]
pub enum StoreError {
    #[error(
        "violated constraint for account {account:?}. min balance: {min_balance}, would be: {would_be}"
    )]
    ConstraintViolation {
        account: AccountId,
        min_balance: i64,
        would_be: i64,
    },
    #[error("unknown account {0:?}")]
    UnknownAccount(AccountId),
    #[error("unknown asset {0:?}")]
    UnknownAsset(AssetId),
    #[error(
        "asset mismatch for account {account:?}: account holds {account_asset:?}, posting uses {asset:?}"
    )]
    AssetMismatch {
        account: AccountId,
        account_asset: AssetId,
        asset: AssetId,
    },
    #[error("{what} already exists with a different definition")]
    AlreadyExists { what: String },
    #[error("invalid book {0:?}: names starting with '_' are reserved")]
    InvalidBook(Book),
    #[error("storage backend error: {0}")]
    Io(#[source] Box<dyn std::error::Error + Send + Sync>),
}
```

- [ ] **Step 2: Add stubs to `talea-store-postgres/src/lib.rs`**

Inside the existing `#[async_trait] impl Store for PgTaleaStore` block, add (above `commit`):

```rust
    async fn register_asset(&self, asset: &AssetDef) -> Result<(), StoreError> {
        todo!()
    }

    async fn open_account(&self, def: &AccountDef, cfg: &AccountCfg) -> Result<(), StoreError> {
        todo!()
    }
```

- [ ] **Step 3: Verify the workspace compiles and core tests pass**

Run: `cargo check --workspace && cargo test -p talea_core`
Expected: success / PASS

- [ ] **Step 4: Commit**

```bash
git add talea-core/src/store.rs talea-store-postgres/src/lib.rs
git commit -m "feat(core): registry methods on Store, richer StoreError, SYSTEM_BOOK"
```

---

### Task 4: `talea-store-conformance` — shared test suite

A non-published workspace crate exposing `pub async fn` conformance tests over `&impl Store`, plus fixtures. Fixtures generate unique asset ids and book names per call so the suite can run repeatedly against a shared, long-lived Postgres database.

**Files:**
- Modify: `Cargo.toml` (workspace root)
- Create: `talea-store-conformance/Cargo.toml`
- Create: `talea-store-conformance/src/lib.rs`

- [ ] **Step 1: Add the workspace member**

In the root `Cargo.toml`:

```toml
[workspace]
members = ["talea-client", "talea-core", "talea-server", "talea-store-postgres", "talea-store-sqlite", "talea-store-conformance"]
resolver = "3"
```

- [ ] **Step 2: Create `talea-store-conformance/Cargo.toml`**

```toml
[package]
name = "talea-store-conformance"
version = "0.1.0"
edition = "2024"
publish = false

[dependencies]
chrono = "0.4.44"
futures = "0.3.32"
serde_json = "1.0.150"
talea_core = { path = "../talea-core/" }
tokio = { version = "1.52.3", features = ["time", "macros", "rt"] }
uuid = { version = "1.23.2", features = ["v4"] }
```

- [ ] **Step 3: Create `talea-store-conformance/src/lib.rs`**

```rust
//! Backend-agnostic conformance suite for `talea_core::store::Store`.
//!
//! Every fixture generates unique ids so the suite can run repeatedly
//! against a shared database (e.g. a developer's Postgres).

use std::time::Duration;

use chrono::Utc;
use futures::StreamExt;
use talea_core::events::LedgerEvent;
use talea_core::store::*;
use talea_core::types::*;
use uuid::Uuid;

// --- fixtures ---------------------------------------------------------

pub fn unique(prefix: &str) -> String {
    format!("{prefix}-{}", Uuid::new_v4().simple())
}

pub fn asset(id: &str) -> AssetDef {
    AssetDef {
        id: AssetId::new(id),
        class: AssetClass::Fiat,
        precision: 2,
        name: format!("{id} test asset"),
    }
}

pub fn account_id(book: &str, path: &str) -> AccountId {
    AccountId {
        book: Book(book.to_string()),
        path: path.to_string(),
    }
}

pub fn open_spec(book: &str, path: &str, asset_id: &str, kind: AccountKind) -> (AccountDef, AccountCfg) {
    let cfg = AccountCfg {
        normal_side: kind.normal_side(),
        min_balance: None,
    };
    let def = AccountDef {
        id: account_id(book, path),
        asset: AssetId::new(asset_id),
        kind,
    };
    (def, cfg)
}

/// A balanced two-posting transaction: credit `from`, debit `to`.
pub fn transfer(book: &str, idem: &str, from: &str, to: &str, asset_id: &str, minor: i64) -> Transaction {
    Transaction {
        id: TxId(Uuid::new_v4()),
        book: Book(book.to_string()),
        postings: vec![
            Posting {
                account: account_id(book, from),
                amount: Amount::new(minor, AssetId::new(asset_id)),
                direction: Direction::Credit,
            },
            Posting {
                account: account_id(book, to),
                amount: Amount::new(minor, AssetId::new(asset_id)),
                direction: Direction::Debit,
            },
        ],
        idempotency_key: IdempotencyKey(idem.to_string()),
        external_refs: vec![],
        metadata: serde_json::json!({}),
        occurred_at: Utc::now(),
    }
}

/// Registers a fresh asset and opens "cash" (debit-normal) and "deposits"
/// (credit-normal) in a fresh book. The two account_opened events consume
/// book seqs 1 and 2. Returns (book, asset_id).
pub async fn setup_book(store: &impl Store) -> (String, String) {
    let book = unique("book");
    let asset_id = unique("USD");
    store.register_asset(&asset(&asset_id)).await.unwrap();
    let (cash_def, cash_cfg) = open_spec(&book, "cash", &asset_id, AccountKind::Asset);
    store.open_account(&cash_def, &cash_cfg).await.unwrap();
    let (dep_def, dep_cfg) = open_spec(&book, "deposits", &asset_id, AccountKind::Liability);
    store.open_account(&dep_def, &dep_cfg).await.unwrap();
    (book, asset_id)
}

// --- registry ---------------------------------------------------------

pub async fn registry_is_idempotent(store: &impl Store) {
    let id = unique("USD");
    let def = asset(&id);
    store.register_asset(&def).await.unwrap();
    store.register_asset(&def).await.unwrap(); // identical re-registration: fine
    let mut conflicting = asset(&id);
    conflicting.precision = 8;
    match store.register_asset(&conflicting).await {
        Err(StoreError::AlreadyExists { .. }) => {}
        other => panic!("expected AlreadyExists, got {other:?}"),
    }

    let book = unique("book");
    let (adef, acfg) = open_spec(&book, "cash", &id, AccountKind::Asset);
    store.open_account(&adef, &acfg).await.unwrap();
    store.open_account(&adef, &acfg).await.unwrap(); // identical: fine
    let mut conflicting_cfg = acfg.clone();
    conflicting_cfg.min_balance = Some(10);
    match store.open_account(&adef, &conflicting_cfg).await {
        Err(StoreError::AlreadyExists { .. }) => {}
        other => panic!("expected AlreadyExists, got {other:?}"),
    }
}

pub async fn unknown_asset_rejected(store: &impl Store) {
    let book = unique("book");
    let (def, cfg) = open_spec(&book, "cash", &unique("NOPE"), AccountKind::Asset);
    match store.open_account(&def, &cfg).await {
        Err(StoreError::UnknownAsset(_)) => {}
        other => panic!("expected UnknownAsset, got {other:?}"),
    }
}

// --- commit -----------------------------------------------------------

pub async fn commit_happy_path(store: &impl Store) {
    let (book, asset_id) = setup_book(store).await;
    let tx = transfer(&book, "t1", "deposits", "cash", &asset_id, 1_000);
    let committed = store.commit(&tx).await.unwrap();
    assert_eq!(committed.txid, tx.id);
    // seqs 1 and 2 were consumed by the two account_opened events
    assert_eq!(committed.seq, 3);
}

pub async fn unknown_account_rejected(store: &impl Store) {
    let (book, asset_id) = setup_book(store).await;
    let tx = transfer(&book, "ua", "deposits", "ghost", &asset_id, 100);
    match store.commit(&tx).await {
        Err(StoreError::UnknownAccount(acc)) => assert_eq!(acc.path, "ghost"),
        other => panic!("expected UnknownAccount, got {other:?}"),
    }
}

pub async fn asset_mismatch_rejected(store: &impl Store) {
    let (book, _) = setup_book(store).await;
    let other_asset = unique("EUR");
    store.register_asset(&asset(&other_asset)).await.unwrap();
    let tx = transfer(&book, "am", "deposits", "cash", &other_asset, 100);
    match store.commit(&tx).await {
        Err(StoreError::AssetMismatch { .. }) => {}
        other => panic!("expected AssetMismatch, got {other:?}"),
    }
}

pub async fn seq_is_per_book_and_gapless(store: &impl Store) {
    let (book_a, asset_a) = setup_book(store).await;
    let (book_b, asset_b) = setup_book(store).await;
    let a1 = store.commit(&transfer(&book_a, "a1", "deposits", "cash", &asset_a, 1)).await.unwrap();
    let b1 = store.commit(&transfer(&book_b, "b1", "deposits", "cash", &asset_b, 1)).await.unwrap();
    let a2 = store.commit(&transfer(&book_a, "a2", "deposits", "cash", &asset_a, 1)).await.unwrap();
    assert_eq!((a1.seq, a2.seq), (3, 4));
    assert_eq!(b1.seq, 3);
}

// --- idempotency + balances -------------------------------------------

pub async fn commit_is_idempotent(store: &impl Store) {
    let (book, asset_id) = setup_book(store).await;
    let tx = transfer(&book, "dup", "deposits", "cash", &asset_id, 500);
    let first = store.commit(&tx).await.unwrap();
    let second = store.commit(&tx).await.unwrap();
    assert_eq!(first, second);
    // and nothing was double-posted:
    let bal = store.balance(&account_id(&book, "cash"), None).await.unwrap();
    assert_eq!(bal.minor(), 500);
}

pub async fn concurrent_same_key_commits_once(store: &(impl Store + Sync)) {
    let (book, asset_id) = setup_book(store).await;
    let tx = transfer(&book, "race", "deposits", "cash", &asset_id, 250);
    let (a, b) = futures::join!(store.commit(&tx), store.commit(&tx));
    let (a, b) = (a.unwrap(), b.unwrap());
    assert_eq!(a.seq, b.seq);
    let bal = store.balance(&account_id(&book, "cash"), None).await.unwrap();
    assert_eq!(bal.minor(), 250);
}

pub async fn min_balance_blocks_overdraft(store: &impl Store) {
    let book = unique("book");
    let asset_id = unique("USD");
    store.register_asset(&asset(&asset_id)).await.unwrap();
    let (cash_def, mut cash_cfg) = open_spec(&book, "cash", &asset_id, AccountKind::Asset);
    cash_cfg.min_balance = Some(0);
    store.open_account(&cash_def, &cash_cfg).await.unwrap();
    let (exp_def, exp_cfg) = open_spec(&book, "expenses", &asset_id, AccountKind::Expense);
    store.open_account(&exp_def, &exp_cfg).await.unwrap();

    // spending from empty cash: cash effective balance would be -100 < 0
    let tx = transfer(&book, "od", "cash", "expenses", &asset_id, 100);
    match store.commit(&tx).await {
        Err(StoreError::ConstraintViolation { would_be, .. }) => assert_eq!(would_be, -100),
        other => panic!("expected ConstraintViolation, got {other:?}"),
    }
    // the whole commit rolled back — nothing was written:
    let bal = store.balance(&account_id(&book, "expenses"), None).await.unwrap();
    assert_eq!(bal.minor(), 0);
}

pub async fn min_balance_is_normal_side_adjusted(store: &impl Store) {
    let book = unique("book");
    let asset_id = unique("USD");
    store.register_asset(&asset(&asset_id)).await.unwrap();
    let (cash_def, cash_cfg) = open_spec(&book, "cash", &asset_id, AccountKind::Asset);
    store.open_account(&cash_def, &cash_cfg).await.unwrap();
    let (dep_def, mut dep_cfg) = open_spec(&book, "deposits", &asset_id, AccountKind::Liability);
    dep_cfg.min_balance = Some(0);
    store.open_account(&dep_def, &dep_cfg).await.unwrap();

    // funding deposits (credit-normal): raw -100, effective +100 — allowed
    store.commit(&transfer(&book, "fund", "deposits", "cash", &asset_id, 100)).await.unwrap();
    let bal = store.balance(&account_id(&book, "deposits"), None).await.unwrap();
    assert_eq!(bal.minor(), 100);

    // over-withdrawing 200: effective would be -100 < 0 — blocked
    let over = transfer(&book, "over", "cash", "deposits", &asset_id, 200);
    match store.commit(&over).await {
        Err(StoreError::ConstraintViolation { would_be, .. }) => assert_eq!(would_be, -100),
        other => panic!("expected ConstraintViolation, got {other:?}"),
    }
}

// --- reads ------------------------------------------------------------

pub async fn balance_as_of_point_in_time(store: &impl Store) {
    let (book, asset_id) = setup_book(store).await;
    store.commit(&transfer(&book, "p1", "deposits", "cash", &asset_id, 100)).await.unwrap();
    tokio::time::sleep(Duration::from_millis(20)).await;
    let mid = Utc::now();
    tokio::time::sleep(Duration::from_millis(20)).await;
    store.commit(&transfer(&book, "p2", "deposits", "cash", &asset_id, 50)).await.unwrap();

    let now_bal = store.balance(&account_id(&book, "cash"), None).await.unwrap();
    assert_eq!(now_bal.minor(), 150);
    assert_eq!(now_bal.asset().as_str(), asset_id);
    let then_bal = store.balance(&account_id(&book, "cash"), Some(mid)).await.unwrap();
    assert_eq!(then_bal.minor(), 100);
}

pub async fn read_events_paginates_inclusively(store: &impl Store) {
    let (book, asset_id) = setup_book(store).await;
    for i in 0..3 {
        store.commit(&transfer(&book, &format!("e{i}"), "deposits", "cash", &asset_id, 10)).await.unwrap();
    }
    let b = Book(book.clone());
    // seqs: 1,2 account_opened; 3,4,5 transaction_posted
    let page = store.read_events(&b, 1, 2).await.unwrap();
    assert_eq!(page.len(), 2);
    assert_eq!(page[0].seq, 1); // `from` is inclusive
    assert!(matches!(page[0].event, LedgerEvent::AccountOpened { .. }));
    let next = store.read_events(&b, page.last().unwrap().seq + 1, 10).await.unwrap();
    assert_eq!(next.len(), 3);
    assert!(matches!(next[0].event, LedgerEvent::TransactionPosted(_)));
    assert_eq!(next.last().unwrap().seq, 5);
}

pub async fn system_book_is_reserved(store: &impl Store) {
    let asset_id = unique("BTC");
    store.register_asset(&asset(&asset_id)).await.unwrap();

    // the AssetRegistered event landed in the _system book (page until found,
    // since a shared database may hold many _system events already):
    let mut from = 1;
    let mut found = false;
    loop {
        let page = store.read_events(&system_book(), from, 500).await.unwrap();
        if page.is_empty() {
            break;
        }
        if page.iter().any(|e| matches!(
            &e.event,
            LedgerEvent::AssetRegistered(a) if a.id.as_str() == asset_id
        )) {
            found = true;
            break;
        }
        from = page.last().unwrap().seq + 1;
    }
    assert!(found, "AssetRegistered event not found in _system book");

    // user activity in books starting with '_' is rejected:
    let (def, cfg) = open_spec("_sneaky", "cash", &asset_id, AccountKind::Asset);
    match store.open_account(&def, &cfg).await {
        Err(StoreError::InvalidBook(_)) => {}
        other => panic!("expected InvalidBook, got {other:?}"),
    }
    let tx = transfer("_sneaky", "x", "a", "b", &asset_id, 1);
    match store.commit(&tx).await {
        Err(StoreError::InvalidBook(_)) => {}
        other => panic!("expected InvalidBook, got {other:?}"),
    }
}

// --- subscribe ----------------------------------------------------------

pub async fn subscribe_catches_up_then_tails(store: &(impl Store + Sync)) {
    let (book, asset_id) = setup_book(store).await;
    store.commit(&transfer(&book, "s1", "deposits", "cash", &asset_id, 10)).await.unwrap();

    // from = 3 skips the two account_opened events; seq 3 already exists (catch-up)
    let mut stream = store.subscribe(&Book(book.clone()), 3);
    let first = tokio::time::timeout(Duration::from_secs(5), stream.next())
        .await.expect("timed out waiting for catch-up event")
        .expect("stream ended").unwrap();
    assert_eq!(first.seq, 3);
    assert!(matches!(first.event, LedgerEvent::TransactionPosted(_)));

    // a commit made while subscribed must be delivered live
    store.commit(&transfer(&book, "s2", "deposits", "cash", &asset_id, 20)).await.unwrap();
    let second = tokio::time::timeout(Duration::from_secs(5), stream.next())
        .await.expect("timed out waiting for live event")
        .expect("stream ended").unwrap();
    assert_eq!(second.seq, 4);
}
```

- [ ] **Step 4: Verify it compiles**

Run: `cargo check -p talea-store-conformance`
Expected: success (no tests of its own — it IS the test suite; both store crates consume it)

- [ ] **Step 5: Commit**

```bash
git add Cargo.toml talea-store-conformance
git commit -m "feat: backend-agnostic Store conformance test suite"
```

---

### Task 5: `talea-store-sqlite` — crate setup, migration, store skeleton

**Files:**
- Modify: `talea-store-sqlite/Cargo.toml`
- Create: `talea-store-sqlite/migrations/0001_init.sql`
- Rewrite: `talea-store-sqlite/src/lib.rs`
- Create: `talea-store-sqlite/tests/conformance.rs`

- [ ] **Step 1: Fill in `talea-store-sqlite/Cargo.toml`**

```toml
[package]
name = "talea-store-sqlite"
version = "0.1.0"
edition = "2024"

[dependencies]
async-stream = "0.3"
async-trait = "0.1.89"
chrono = "0.4.44"
futures = "0.3.32"
serde_json = "1.0.150"
sqlx = { version = "0.9.0", features = ["sqlite", "chrono", "uuid", "runtime-tokio"] }
talea_core = { path = "../talea-core/" }
tokio = { version = "1.52.3", features = ["sync", "rt"] }
uuid = { version = "1.23.2", features = ["v7"] }

[dev-dependencies]
talea-store-conformance = { path = "../talea-store-conformance/" }
tokio = { version = "1.52.3", features = ["macros", "rt-multi-thread", "time"] }
```

- [ ] **Step 2: Create `talea-store-sqlite/migrations/0001_init.sql`**

```sql
CREATE TABLE assets (
    id          TEXT PRIMARY KEY,
    class       TEXT NOT NULL,              -- 'fiat' | 'crypto'
    network     TEXT,
    native_id   TEXT,
    precision   INTEGER NOT NULL,
    name        TEXT NOT NULL
);

CREATE TABLE accounts (
    key         TEXT PRIMARY KEY,           -- AccountId::to_key() => "book:path"
    book        TEXT NOT NULL,
    path        TEXT NOT NULL,
    asset       TEXT NOT NULL REFERENCES assets(id),
    kind        TEXT NOT NULL,
    normal_side TEXT,                       -- 'D' | 'C' | NULL (clearing)
    min_balance INTEGER
);

-- per-book gapless sequence counter; the upsert-increment serializes writers per book
CREATE TABLE books (
    book     TEXT PRIMARY KEY,
    next_seq INTEGER NOT NULL DEFAULT 0
);

-- the append-only source of truth
CREATE TABLE events (
    book    TEXT NOT NULL,
    seq     INTEGER NOT NULL,
    at      TEXT NOT NULL,                  -- RFC3339 UTC
    kind    TEXT NOT NULL,
    payload TEXT NOT NULL,                  -- LedgerEvent as tagged JSON
    PRIMARY KEY (book, seq)
);

CREATE TABLE transactions (
    tx_id           TEXT PRIMARY KEY,
    book            TEXT NOT NULL,
    seq             INTEGER NOT NULL,
    idempotency_key TEXT NOT NULL,
    occurred_at     TEXT NOT NULL,
    committed_at    TEXT NOT NULL,
    metadata        TEXT NOT NULL,
    external_refs   TEXT NOT NULL,
    UNIQUE (book, idempotency_key)
);

CREATE TABLE postings (
    tx_id        TEXT NOT NULL REFERENCES transactions(tx_id),
    idx          INTEGER NOT NULL,
    account_key  TEXT NOT NULL REFERENCES accounts(key),
    asset        TEXT NOT NULL,
    minor        INTEGER NOT NULL,
    direction    TEXT NOT NULL,             -- 'D' | 'C'
    book         TEXT NOT NULL,
    seq          INTEGER NOT NULL,
    committed_at TEXT NOT NULL,
    PRIMARY KEY (tx_id, idx)
);
CREATE INDEX postings_account_time ON postings (account_key, committed_at);
CREATE INDEX postings_account_seq  ON postings (account_key, seq);

-- raw balance projection: balance = sum(debits) - sum(credits)
CREATE TABLE balances (
    account_key TEXT PRIMARY KEY REFERENCES accounts(key),
    asset       TEXT NOT NULL,
    balance     INTEGER NOT NULL,
    updated_seq INTEGER NOT NULL
);
```

- [ ] **Step 3: Rewrite `talea-store-sqlite/src/lib.rs` with the skeleton**

Delete the `add()` stub and its test. New content — struct, constructors, `migrate()`, internal helpers, and `todo!()` trait stubs:

```rust
use std::collections::HashMap;
use std::sync::Arc;

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::{Row, Sqlite, SqlitePool, Transaction as DbTx};
use tokio::sync::broadcast;

use talea_core::{events::*, store::*, types::*};

/// Wake-up published on the in-process channel after every committed write.
/// Carries only the book: subscribers always fetch rows from the events table.
#[derive(Debug, Clone)]
struct WakeUp {
    book: Book,
}

#[derive(Debug, Clone)]
pub struct SqliteTaleaStore {
    pool: SqlitePool,
    publisher: broadcast::Sender<Arc<WakeUp>>,
}

impl SqliteTaleaStore {
    pub fn new(pool: SqlitePool) -> Self {
        let (publisher, _) = broadcast::channel(1024);
        Self { pool, publisher }
    }

    /// Open (creating if missing) a SQLite database, apply pragmas, run migrations.
    pub async fn connect(url: &str) -> Result<Self, StoreError> {
        use sqlx::sqlite::{SqliteConnectOptions, SqliteJournalMode, SqlitePoolOptions};
        use std::str::FromStr;

        let opts = SqliteConnectOptions::from_str(url)
            .map_err(io_err)?
            .create_if_missing(true)
            .journal_mode(SqliteJournalMode::Wal)
            .busy_timeout(std::time::Duration::from_secs(5))
            .foreign_keys(true);
        let pool = SqlitePoolOptions::new().connect_with(opts).await.map_err(io_err)?;
        let store = Self::new(pool);
        store.migrate().await?;
        Ok(store)
    }

    pub async fn migrate(&self) -> Result<(), StoreError> {
        sqlx::migrate!("./migrations").run(&self.pool).await.map_err(io_err)
    }

    fn publish(&self, book: Book) {
        // a send error just means nobody is subscribed
        let _ = self.publisher.send(Arc::new(WakeUp { book }));
    }
}

// --- shared helpers -----------------------------------------------------

fn io_err(e: impl std::error::Error + Send + Sync + 'static) -> StoreError {
    StoreError::Io(Box::new(e))
}

/// Raw stored balance is debit-positive; the effective balance is
/// normal-side-adjusted (negated for credit-normal accounts).
fn effective(raw: i64, normal_side: &Option<Direction>) -> i64 {
    match normal_side {
        Some(Direction::Credit) => -raw,
        _ => raw,
    }
}

fn posting_delta(p: &Posting) -> i64 {
    match p.direction {
        Direction::Debit => p.amount.minor(),
        Direction::Credit => -p.amount.minor(),
    }
}

struct AccountRow {
    asset: AssetId,
    normal_side: Option<Direction>,
    min_balance: Option<i64>,
}

async fn load_account<'e, E>(executor: E, key: &str) -> Result<Option<AccountRow>, StoreError>
where
    E: sqlx::Executor<'e, Database = Sqlite>,
{
    let row = sqlx::query("SELECT asset, normal_side, min_balance FROM accounts WHERE key = ?1")
        .bind(key)
        .fetch_optional(executor)
        .await
        .map_err(io_err)?;
    Ok(row.map(|r| AccountRow {
        asset: AssetId::new(r.get::<String, _>("asset")),
        normal_side: r
            .get::<Option<String>, _>("normal_side")
            .as_deref()
            .and_then(Direction::from_db),
        min_balance: r.get("min_balance"),
    }))
}

/// Claim the next per-book sequence number. The upsert takes a write lock on
/// the counter row, serializing concurrent writers on the same book => gapless.
async fn next_seq(db: &mut DbTx<'_, Sqlite>, book: &str) -> Result<Seq, StoreError> {
    let row = sqlx::query(
        "INSERT INTO books (book, next_seq) VALUES (?1, 1)
         ON CONFLICT (book) DO UPDATE SET next_seq = books.next_seq + 1
         RETURNING next_seq",
    )
    .bind(book)
    .fetch_one(&mut **db)
    .await
    .map_err(io_err)?;
    Ok(row.get::<i64, _>("next_seq"))
}

async fn insert_event(
    db: &mut DbTx<'_, Sqlite>,
    book: &str,
    seq: Seq,
    at: DateTime<Utc>,
    event: &LedgerEvent,
) -> Result<(), StoreError> {
    let payload = serde_json::to_string(event).map_err(io_err)?;
    sqlx::query("INSERT INTO events (book, seq, at, kind, payload) VALUES (?1, ?2, ?3, ?4, ?5)")
        .bind(book)
        .bind(seq)
        .bind(at)
        .bind(event.kind())
        .bind(payload)
        .execute(&mut **db)
        .await
        .map_err(io_err)?;
    Ok(())
}

async fn fetch_events(
    pool: &SqlitePool,
    book: &Book,
    from: Seq,
    limit: i64,
) -> Result<Vec<Sequenced<LedgerEvent>>, StoreError> {
    let rows = sqlx::query(
        "SELECT seq, at, payload FROM events WHERE book = ?1 AND seq >= ?2 ORDER BY seq LIMIT ?3",
    )
    .bind(&book.0)
    .bind(from)
    .bind(limit)
    .fetch_all(pool)
    .await
    .map_err(io_err)?;
    rows.into_iter()
        .map(|r| {
            let event: LedgerEvent =
                serde_json::from_str(&r.get::<String, _>("payload")).map_err(io_err)?;
            Ok(Sequenced {
                seq: r.get("seq"),
                at: r.get("at"),
                event,
            })
        })
        .collect()
}

async fn find_committed(
    db: &mut DbTx<'_, Sqlite>,
    book: &Book,
    idem: &IdempotencyKey,
) -> Result<Option<Committed>, StoreError> {
    let row = sqlx::query(
        "SELECT tx_id, seq, committed_at FROM transactions WHERE book = ?1 AND idempotency_key = ?2",
    )
    .bind(&book.0)
    .bind(&idem.0)
    .fetch_optional(&mut **db)
    .await
    .map_err(io_err)?;
    row.map(|r| {
        let txid = uuid::Uuid::parse_str(&r.get::<String, _>("tx_id")).map_err(io_err)?;
        Ok(Committed {
            txid: TxId(txid),
            seq: r.get("seq"),
            at: r.get("committed_at"),
        })
    })
    .transpose()
}

#[async_trait]
impl Store for SqliteTaleaStore {
    async fn register_asset(&self, asset: &AssetDef) -> Result<(), StoreError> {
        todo!()
    }

    async fn open_account(&self, def: &AccountDef, cfg: &AccountCfg) -> Result<(), StoreError> {
        todo!()
    }

    async fn commit(&self, transaction: &Transaction) -> Result<Committed, StoreError> {
        todo!()
    }

    async fn balance(
        &self,
        account: &AccountId,
        as_of: Option<DateTime<Utc>>,
    ) -> Result<Amount, StoreError> {
        todo!()
    }

    async fn read_events(
        &self,
        book: &Book,
        from: Seq,
        limit: usize,
    ) -> Result<Vec<Sequenced<LedgerEvent>>, StoreError> {
        todo!()
    }

    fn subscribe(&self, book: &Book, from: Seq) -> EventStream {
        todo!()
    }
}
```

(The `HashMap` import is used by `commit` in Task 7; the compiler will warn until then — that's fine.)

- [ ] **Step 4: Create the test harness `talea-store-sqlite/tests/conformance.rs`**

```rust
use sqlx::sqlite::SqlitePoolOptions;
use talea_store_conformance as conformance;
use talea_store_sqlite::SqliteTaleaStore;

/// One connection, so every handle sees the same in-memory database
/// (each :memory: connection is otherwise a separate database).
async fn store() -> SqliteTaleaStore {
    let pool = SqlitePoolOptions::new()
        .max_connections(1)
        .connect("sqlite::memory:")
        .await
        .unwrap();
    let store = SqliteTaleaStore::new(pool);
    store.migrate().await.unwrap();
    store
}

macro_rules! sqlite_test {
    ($name:ident) => {
        #[tokio::test]
        async fn $name() {
            conformance::$name(&store().await).await;
        }
    };
}

sqlite_test!(registry_is_idempotent);
sqlite_test!(unknown_asset_rejected);
```

- [ ] **Step 5: Verify it builds and the stub tests fail**

Run: `cargo test -p talea-store-sqlite`
Expected: COMPILES, then both tests FAIL with `not yet implemented` panics from `todo!()`

- [ ] **Step 6: Commit**

```bash
git add talea-store-sqlite
git commit -m "feat(sqlite): crate setup, schema migration, store skeleton + helpers"
```

---

### Task 6: `talea-store-sqlite` — register_asset + open_account

**Files:**
- Modify: `talea-store-sqlite/src/lib.rs`

- [ ] **Step 1: Confirm the failing tests**

Run: `cargo test -p talea-store-sqlite`
Expected: `registry_is_idempotent` and `unknown_asset_rejected` FAIL (todo! panic)

- [ ] **Step 2: Implement `register_asset`**

Replace the `register_asset` stub:

```rust
    async fn register_asset(&self, asset: &AssetDef) -> Result<(), StoreError> {
        let mut db = self.pool.begin().await.map_err(io_err)?;

        if let Some(row) = sqlx::query(
            "SELECT class, network, native_id, precision, name FROM assets WHERE id = ?1",
        )
        .bind(asset.id.as_str())
        .fetch_optional(&mut *db)
        .await
        .map_err(io_err)?
        {
            let class: String = row.get("class");
            let existing = AssetDef {
                id: asset.id.clone(),
                class: match class.as_str() {
                    "fiat" => AssetClass::Fiat,
                    _ => AssetClass::Crypto {
                        network: Network::new(
                            row.get::<Option<String>, _>("network").unwrap_or_default(),
                        ),
                        native_id: row.get("native_id"),
                    },
                },
                precision: row.get::<i64, _>("precision") as u8,
                name: row.get("name"),
            };
            return if existing == *asset {
                Ok(())
            } else {
                Err(StoreError::AlreadyExists {
                    what: format!("asset {}", asset.id.as_str()),
                })
            };
        }

        let (class, network, native_id) = match &asset.class {
            AssetClass::Fiat => ("fiat", None, None),
            AssetClass::Crypto { network, native_id } => {
                ("crypto", Some(network.as_str().to_string()), native_id.clone())
            }
        };
        sqlx::query(
            "INSERT INTO assets (id, class, network, native_id, precision, name)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        )
        .bind(asset.id.as_str())
        .bind(class)
        .bind(network)
        .bind(native_id)
        .bind(asset.precision as i64)
        .bind(&asset.name)
        .execute(&mut *db)
        .await
        .map_err(io_err)?;

        let seq = next_seq(&mut db, SYSTEM_BOOK).await?;
        let at = Utc::now();
        insert_event(&mut db, SYSTEM_BOOK, seq, at, &LedgerEvent::AssetRegistered(asset.clone())).await?;
        db.commit().await.map_err(io_err)?;
        self.publish(system_book());
        Ok(())
    }
```

- [ ] **Step 3: Implement `open_account`**

Replace the `open_account` stub:

```rust
    async fn open_account(&self, def: &AccountDef, cfg: &AccountCfg) -> Result<(), StoreError> {
        if def.id.book.is_reserved() {
            return Err(StoreError::InvalidBook(def.id.book.clone()));
        }
        let key = def.id.to_key();
        let mut db = self.pool.begin().await.map_err(io_err)?;

        let asset_exists = sqlx::query("SELECT 1 FROM assets WHERE id = ?1")
            .bind(def.asset.as_str())
            .fetch_optional(&mut *db)
            .await
            .map_err(io_err)?;
        if asset_exists.is_none() {
            return Err(StoreError::UnknownAsset(def.asset.clone()));
        }

        if let Some(row) = sqlx::query(
            "SELECT asset, kind, normal_side, min_balance FROM accounts WHERE key = ?1",
        )
        .bind(&key)
        .fetch_optional(&mut *db)
        .await
        .map_err(io_err)?
        {
            let same_def = row.get::<String, _>("asset") == def.asset.as_str()
                && AccountKind::from_db(&row.get::<String, _>("kind")).as_ref() == Some(&def.kind);
            let same_cfg = row
                .get::<Option<String>, _>("normal_side")
                .as_deref()
                .and_then(Direction::from_db)
                == cfg.normal_side
                && row.get::<Option<i64>, _>("min_balance") == cfg.min_balance;
            return if same_def && same_cfg {
                Ok(())
            } else {
                Err(StoreError::AlreadyExists {
                    what: format!("account {key}"),
                })
            };
        }

        sqlx::query(
            "INSERT INTO accounts (key, book, path, asset, kind, normal_side, min_balance)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        )
        .bind(&key)
        .bind(&def.id.book.0)
        .bind(&def.id.path)
        .bind(def.asset.as_str())
        .bind(def.kind.as_str())
        .bind(cfg.normal_side.as_ref().map(|d| d.as_str().to_string()))
        .bind(cfg.min_balance)
        .execute(&mut *db)
        .await
        .map_err(io_err)?;

        let seq = next_seq(&mut db, &def.id.book.0).await?;
        let at = Utc::now();
        insert_event(
            &mut db,
            &def.id.book.0,
            seq,
            at,
            &LedgerEvent::AccountOpened { def: def.clone(), cfg: cfg.clone() },
        )
        .await?;
        db.commit().await.map_err(io_err)?;
        self.publish(def.id.book.clone());
        Ok(())
    }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cargo test -p talea-store-sqlite`
Expected: `registry_is_idempotent` PASS, `unknown_asset_rejected` PASS

- [ ] **Step 5: Commit**

```bash
git add talea-store-sqlite/src/lib.rs
git commit -m "feat(sqlite): register_asset and open_account with event log append"
```

---

### Task 7: `talea-store-sqlite` — commit

**Files:**
- Modify: `talea-store-sqlite/src/lib.rs`
- Modify: `talea-store-sqlite/tests/conformance.rs`

- [ ] **Step 1: Add the failing tests**

Append to `talea-store-sqlite/tests/conformance.rs`:

```rust
sqlite_test!(commit_happy_path);
sqlite_test!(unknown_account_rejected);
sqlite_test!(asset_mismatch_rejected);
sqlite_test!(seq_is_per_book_and_gapless);
```

Run: `cargo test -p talea-store-sqlite`
Expected: the four new tests FAIL (todo! panic in `commit`)

- [ ] **Step 2: Implement `commit`**

Replace the `commit` stub:

```rust
    async fn commit(&self, transaction: &Transaction) -> Result<Committed, StoreError> {
        if transaction.book.is_reserved() {
            return Err(StoreError::InvalidBook(transaction.book.clone()));
        }
        let mut db = self.pool.begin().await.map_err(io_err)?;

        // 1. idempotency fast path: a duplicate returns the prior result
        if let Some(prior) =
            find_committed(&mut db, &transaction.book, &transaction.idempotency_key).await?
        {
            return Ok(prior);
        }

        // 2. claim the per-book seq (serializes writers on this book => gapless)
        let seq = next_seq(&mut db, &transaction.book.0).await?;
        let at = Utc::now();

        // 3. load + validate accounts, accumulating one raw delta per account
        struct Pending {
            account: AccountId,
            asset: AssetId,
            normal_side: Option<Direction>,
            min_balance: Option<i64>,
            delta: i64,
        }
        let mut pending: HashMap<String, Pending> = HashMap::new();
        for posting in &transaction.postings {
            let key = posting.account.to_key();
            if !pending.contains_key(&key) {
                let row = load_account(&mut *db, &key)
                    .await?
                    .ok_or_else(|| StoreError::UnknownAccount(posting.account.clone()))?;
                pending.insert(
                    key.clone(),
                    Pending {
                        account: posting.account.clone(),
                        asset: row.asset,
                        normal_side: row.normal_side,
                        min_balance: row.min_balance,
                        delta: 0,
                    },
                );
            }
            let entry = pending.get_mut(&key).unwrap();
            if entry.asset != *posting.amount.asset() {
                return Err(StoreError::AssetMismatch {
                    account: posting.account.clone(),
                    account_asset: entry.asset.clone(),
                    asset: posting.amount.asset().clone(),
                });
            }
            entry.delta += posting_delta(posting);
        }

        // 4. apply to the balances projection, enforcing min_balance on the
        //    effective (normal-side-adjusted) balance. An Err return drops
        //    `db`, rolling the whole transaction back.
        for p in pending.values() {
            let row = sqlx::query(
                "INSERT INTO balances (account_key, asset, balance, updated_seq)
                 VALUES (?1, ?2, ?3, ?4)
                 ON CONFLICT (account_key) DO UPDATE
                     SET balance = balances.balance + ?3, updated_seq = ?4
                 RETURNING balance",
            )
            .bind(p.account.to_key())
            .bind(p.asset.as_str())
            .bind(p.delta)
            .bind(seq)
            .fetch_one(&mut *db)
            .await
            .map_err(io_err)?;
            let new_raw: i64 = row.get("balance");
            if let Some(min) = p.min_balance {
                let would_be = effective(new_raw, &p.normal_side);
                if would_be < min {
                    return Err(StoreError::ConstraintViolation {
                        account: p.account.clone(),
                        min_balance: min,
                        would_be,
                    });
                }
            }
        }

        // 5. write the transaction row; a lost idempotency race surfaces here
        //    as a unique violation on (book, idempotency_key)
        let insert_tx = sqlx::query(
            "INSERT INTO transactions
                 (tx_id, book, seq, idempotency_key, occurred_at, committed_at, metadata, external_refs)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        )
        .bind(transaction.id.0.to_string())
        .bind(&transaction.book.0)
        .bind(seq)
        .bind(&transaction.idempotency_key.0)
        .bind(transaction.occurred_at)
        .bind(at)
        .bind(serde_json::to_string(&transaction.metadata).map_err(io_err)?)
        .bind(serde_json::to_string(&transaction.external_refs).map_err(io_err)?)
        .execute(&mut *db)
        .await;
        if let Err(e) = insert_tx {
            let unique = e
                .as_database_error()
                .map(|d| d.is_unique_violation())
                .unwrap_or(false);
            if unique {
                drop(db); // roll back our attempt, then return the winner's result
                let mut db = self.pool.begin().await.map_err(io_err)?;
                if let Some(prior) =
                    find_committed(&mut db, &transaction.book, &transaction.idempotency_key).await?
                {
                    return Ok(prior);
                }
            }
            return Err(io_err(e));
        }

        // 6. postings projection + the event-log row (the source of truth)
        for (idx, posting) in transaction.postings.iter().enumerate() {
            sqlx::query(
                "INSERT INTO postings
                     (tx_id, idx, account_key, asset, minor, direction, book, seq, committed_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            )
            .bind(transaction.id.0.to_string())
            .bind(idx as i64)
            .bind(posting.account.to_key())
            .bind(posting.amount.asset().as_str())
            .bind(posting.amount.minor())
            .bind(posting.direction.as_str())
            .bind(&transaction.book.0)
            .bind(seq)
            .bind(at)
            .execute(&mut *db)
            .await
            .map_err(io_err)?;
        }
        insert_event(
            &mut db,
            &transaction.book.0,
            seq,
            at,
            &LedgerEvent::TransactionPosted(transaction.clone()),
        )
        .await?;

        db.commit().await.map_err(io_err)?;
        self.publish(transaction.book.clone());
        Ok(Committed { txid: transaction.id.clone(), seq, at })
    }
```

- [ ] **Step 3: Run tests to verify they pass**

Run: `cargo test -p talea-store-sqlite`
Expected: all 6 tests PASS

- [ ] **Step 4: Commit**

```bash
git add talea-store-sqlite
git commit -m "feat(sqlite): atomic idempotent commit with per-book gapless seq"
```

---

### Task 8: `talea-store-sqlite` — balance + read_events

**Files:**
- Modify: `talea-store-sqlite/src/lib.rs`
- Modify: `talea-store-sqlite/tests/conformance.rs`

- [ ] **Step 1: Add the failing tests**

Append to `talea-store-sqlite/tests/conformance.rs`:

```rust
sqlite_test!(commit_is_idempotent);
sqlite_test!(concurrent_same_key_commits_once);
sqlite_test!(min_balance_blocks_overdraft);
sqlite_test!(min_balance_is_normal_side_adjusted);
sqlite_test!(balance_as_of_point_in_time);
sqlite_test!(read_events_paginates_inclusively);
sqlite_test!(system_book_is_reserved);
```

Run: `cargo test -p talea-store-sqlite`
Expected: the 7 new tests FAIL (todo! panic in `balance`/`read_events`)

- [ ] **Step 2: Implement `balance` and `read_events`**

Replace the two stubs:

```rust
    async fn balance(
        &self,
        account: &AccountId,
        as_of: Option<DateTime<Utc>>,
    ) -> Result<Amount, StoreError> {
        let key = account.to_key();
        let acct = load_account(&self.pool, &key)
            .await?
            .ok_or_else(|| StoreError::UnknownAccount(account.clone()))?;

        let raw: i64 = match as_of {
            // current balance: the projection row (0 if never posted to)
            None => sqlx::query("SELECT balance FROM balances WHERE account_key = ?1")
                .bind(&key)
                .fetch_optional(&self.pool)
                .await
                .map_err(io_err)?
                .map(|r| r.get("balance"))
                .unwrap_or(0),
            // point-in-time: aggregate the postings projection by commit time
            Some(t) => sqlx::query(
                "SELECT COALESCE(SUM(CASE WHEN direction = 'D' THEN minor ELSE -minor END), 0) AS raw
                 FROM postings WHERE account_key = ?1 AND committed_at <= ?2",
            )
            .bind(&key)
            .bind(t)
            .fetch_one(&self.pool)
            .await
            .map_err(io_err)?
            .get("raw"),
        };

        Ok(Amount::new(effective(raw, &acct.normal_side), acct.asset))
    }

    async fn read_events(
        &self,
        book: &Book,
        from: Seq,
        limit: usize,
    ) -> Result<Vec<Sequenced<LedgerEvent>>, StoreError> {
        fetch_events(&self.pool, book, from, limit as i64).await
    }
```

- [ ] **Step 3: Run tests to verify they pass**

Run: `cargo test -p talea-store-sqlite`
Expected: all 13 tests PASS

- [ ] **Step 4: Commit**

```bash
git add talea-store-sqlite
git commit -m "feat(sqlite): balance projection with as_of replay, read_events"
```

---

### Task 9: `talea-store-sqlite` — subscribe

**Files:**
- Modify: `talea-store-sqlite/src/lib.rs`
- Modify: `talea-store-sqlite/tests/conformance.rs`

- [ ] **Step 1: Add the failing test**

Append to `talea-store-sqlite/tests/conformance.rs`:

```rust
sqlite_test!(subscribe_catches_up_then_tails);
```

Run: `cargo test -p talea-store-sqlite subscribe_catches_up_then_tails`
Expected: FAIL (todo! panic)

- [ ] **Step 2: Implement `subscribe`**

Replace the stub. Pattern: subscribe to wake-ups FIRST, then alternate "drain the log" / "await a wake-up for this book". Events are always read from the table, so a missed/lagged wake-up only delays delivery, never loses it.

```rust
    fn subscribe(&self, book: &Book, from: Seq) -> EventStream {
        let pool = self.pool.clone();
        let book = book.clone();
        let mut wakeups = self.publisher.subscribe();
        Box::pin(async_stream::stream! {
            let mut next = from;
            loop {
                // catch up from the log until dry
                loop {
                    let batch = match fetch_events(&pool, &book, next, 256).await {
                        Ok(batch) => batch,
                        Err(e) => {
                            yield Err(e);
                            return;
                        }
                    };
                    if batch.is_empty() {
                        break;
                    }
                    for ev in batch {
                        next = ev.seq + 1;
                        yield Ok(ev);
                    }
                }
                // wait for a write to this book
                loop {
                    match wakeups.recv().await {
                        Ok(w) if w.book == book => break,
                        Ok(_) => continue,
                        // we fell behind on wake-ups; the log has everything
                        Err(broadcast::error::RecvError::Lagged(_)) => break,
                        // store dropped: no more writes can happen
                        Err(broadcast::error::RecvError::Closed) => return,
                    }
                }
            }
        })
    }
```

- [ ] **Step 3: Run the full suite**

Run: `cargo test -p talea-store-sqlite`
Expected: all 14 tests PASS

- [ ] **Step 4: Commit**

```bash
git add talea-store-sqlite
git commit -m "feat(sqlite): subscribe via catch-up + in-process broadcast wake-ups"
```

---

### Task 10: `talea-store-postgres` — crate setup, migration, store skeleton

Same logical schema and helper set as SQLite, with Postgres types (`UUID`, `TIMESTAMPTZ`, `JSONB`, `BIGINT`), `$n` parameters, and no broadcast channel (Postgres uses `pg_notify`/`PgListener` instead). The conformance tests only run when `TALEA_TEST_PG_URL` is set; otherwise they print a skip notice and pass.

**Files:**
- Modify: `talea-store-postgres/Cargo.toml`
- Create: `talea-store-postgres/migrations/0001_init.sql`
- Rewrite: `talea-store-postgres/src/lib.rs`
- Keep: `talea-store-postgres/src/helpers.rs` (already has `book_channel_name`)
- Create: `talea-store-postgres/tests/conformance.rs`

- [ ] **Step 1: Update `talea-store-postgres/Cargo.toml`**

```toml
[package]
name = "talea_store_postgres"
version = "0.1.0"
edition = "2024"

[dependencies]
async-stream = "0.3"
async-trait = "0.1.89"
chrono = "0.4.44"
futures = "0.3.32"
serde_json = "1.0.150"
sqlx = { version = "0.9.0", features = ["postgres", "chrono", "uuid", "json", "runtime-tokio"] }
talea_core = { path = "../talea-core/" }
tokio = { version = "1.52.3", features = ["sync", "rt"] }
uuid = { version = "1.23.2", features = ["v7"] }

[dev-dependencies]
talea-store-conformance = { path = "../talea-store-conformance/" }
tokio = { version = "1.52.3", features = ["macros", "rt-multi-thread", "time"] }
```

- [ ] **Step 2: Create `talea-store-postgres/migrations/0001_init.sql`**

```sql
CREATE TABLE assets (
    id          TEXT PRIMARY KEY,
    class       TEXT NOT NULL,              -- 'fiat' | 'crypto'
    network     TEXT,
    native_id   TEXT,
    precision   SMALLINT NOT NULL,
    name        TEXT NOT NULL
);

CREATE TABLE accounts (
    key         TEXT PRIMARY KEY,           -- AccountId::to_key() => "book:path"
    book        TEXT NOT NULL,
    path        TEXT NOT NULL,
    asset       TEXT NOT NULL REFERENCES assets(id),
    kind        TEXT NOT NULL,
    normal_side TEXT,                       -- 'D' | 'C' | NULL (clearing)
    min_balance BIGINT
);

-- per-book gapless sequence counter; the upsert-increment row-locks the
-- counter, serializing concurrent writers per book
CREATE TABLE books (
    book     TEXT PRIMARY KEY,
    next_seq BIGINT NOT NULL DEFAULT 0
);

-- the append-only source of truth
CREATE TABLE events (
    book    TEXT NOT NULL,
    seq     BIGINT NOT NULL,
    at      TIMESTAMPTZ NOT NULL,
    kind    TEXT NOT NULL,
    payload JSONB NOT NULL,                 -- LedgerEvent as tagged JSON
    PRIMARY KEY (book, seq)
);

CREATE TABLE transactions (
    tx_id           UUID PRIMARY KEY,
    book            TEXT NOT NULL,
    seq             BIGINT NOT NULL,
    idempotency_key TEXT NOT NULL,
    occurred_at     TIMESTAMPTZ NOT NULL,
    committed_at    TIMESTAMPTZ NOT NULL,
    metadata        JSONB NOT NULL,
    external_refs   JSONB NOT NULL,
    UNIQUE (book, idempotency_key)
);

CREATE TABLE postings (
    tx_id        UUID NOT NULL REFERENCES transactions(tx_id),
    idx          INTEGER NOT NULL,
    account_key  TEXT NOT NULL REFERENCES accounts(key),
    asset        TEXT NOT NULL,
    minor        BIGINT NOT NULL,
    direction    TEXT NOT NULL,             -- 'D' | 'C'
    book         TEXT NOT NULL,
    seq          BIGINT NOT NULL,
    committed_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (tx_id, idx)
);
CREATE INDEX postings_account_time ON postings (account_key, committed_at);
CREATE INDEX postings_account_seq  ON postings (account_key, seq);

-- raw balance projection: balance = sum(debits) - sum(credits)
CREATE TABLE balances (
    account_key TEXT PRIMARY KEY REFERENCES accounts(key),
    asset       TEXT NOT NULL,
    balance     BIGINT NOT NULL,
    updated_seq BIGINT NOT NULL
);
```

- [ ] **Step 3: Rewrite `talea-store-postgres/src/lib.rs` with the skeleton**

Delete the old contents (including `add()`, its test, and `load_account_cfg`). New content:

```rust
use std::collections::HashMap;

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::{PgPool, Postgres, Row, Transaction as DbTx};
use uuid::Uuid;

use talea_core::{events::*, store::*, types::*};

mod helpers;
pub use helpers::book_channel_name;

#[derive(Debug, Clone)]
pub struct PgTaleaStore {
    pool: PgPool,
}

impl PgTaleaStore {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    /// Connect and run migrations.
    pub async fn connect(url: &str) -> Result<Self, StoreError> {
        let pool = sqlx::postgres::PgPoolOptions::new()
            .connect(url)
            .await
            .map_err(io_err)?;
        let store = Self::new(pool);
        store.migrate().await?;
        Ok(store)
    }

    pub async fn migrate(&self) -> Result<(), StoreError> {
        sqlx::migrate!("./migrations").run(&self.pool).await.map_err(io_err)
    }
}

// --- shared helpers -----------------------------------------------------

fn io_err(e: impl std::error::Error + Send + Sync + 'static) -> StoreError {
    StoreError::Io(Box::new(e))
}

/// Raw stored balance is debit-positive; the effective balance is
/// normal-side-adjusted (negated for credit-normal accounts).
fn effective(raw: i64, normal_side: &Option<Direction>) -> i64 {
    match normal_side {
        Some(Direction::Credit) => -raw,
        _ => raw,
    }
}

fn posting_delta(p: &Posting) -> i64 {
    match p.direction {
        Direction::Debit => p.amount.minor(),
        Direction::Credit => -p.amount.minor(),
    }
}

struct AccountRow {
    asset: AssetId,
    normal_side: Option<Direction>,
    min_balance: Option<i64>,
}

async fn load_account<'e, E>(executor: E, key: &str) -> Result<Option<AccountRow>, StoreError>
where
    E: sqlx::Executor<'e, Database = Postgres>,
{
    let row = sqlx::query("SELECT asset, normal_side, min_balance FROM accounts WHERE key = $1")
        .bind(key)
        .fetch_optional(executor)
        .await
        .map_err(io_err)?;
    Ok(row.map(|r| AccountRow {
        asset: AssetId::new(r.get::<String, _>("asset")),
        normal_side: r
            .get::<Option<String>, _>("normal_side")
            .as_deref()
            .and_then(Direction::from_db),
        min_balance: r.get("min_balance"),
    }))
}

/// Claim the next per-book sequence number. The upsert row-locks the counter,
/// serializing concurrent writers on the same book => gapless.
async fn next_seq(db: &mut DbTx<'_, Postgres>, book: &str) -> Result<Seq, StoreError> {
    let row = sqlx::query(
        "INSERT INTO books (book, next_seq) VALUES ($1, 1)
         ON CONFLICT (book) DO UPDATE SET next_seq = books.next_seq + 1
         RETURNING next_seq",
    )
    .bind(book)
    .fetch_one(&mut **db)
    .await
    .map_err(io_err)?;
    Ok(row.get::<i64, _>("next_seq"))
}

async fn insert_event(
    db: &mut DbTx<'_, Postgres>,
    book: &str,
    seq: Seq,
    at: DateTime<Utc>,
    event: &LedgerEvent,
) -> Result<(), StoreError> {
    let payload = serde_json::to_value(event).map_err(io_err)?;
    sqlx::query("INSERT INTO events (book, seq, at, kind, payload) VALUES ($1, $2, $3, $4, $5)")
        .bind(book)
        .bind(seq)
        .bind(at)
        .bind(event.kind())
        .bind(payload)
        .execute(&mut **db)
        .await
        .map_err(io_err)?;
    Ok(())
}

async fn fetch_events(
    pool: &PgPool,
    book: &Book,
    from: Seq,
    limit: i64,
) -> Result<Vec<Sequenced<LedgerEvent>>, StoreError> {
    let rows = sqlx::query(
        "SELECT seq, at, payload FROM events WHERE book = $1 AND seq >= $2 ORDER BY seq LIMIT $3",
    )
    .bind(&book.0)
    .bind(from)
    .bind(limit)
    .fetch_all(pool)
    .await
    .map_err(io_err)?;
    rows.into_iter()
        .map(|r| {
            let event: LedgerEvent =
                serde_json::from_value(r.get::<serde_json::Value, _>("payload")).map_err(io_err)?;
            Ok(Sequenced {
                seq: r.get("seq"),
                at: r.get("at"),
                event,
            })
        })
        .collect()
}

async fn find_committed(
    db: &mut DbTx<'_, Postgres>,
    book: &Book,
    idem: &IdempotencyKey,
) -> Result<Option<Committed>, StoreError> {
    let row = sqlx::query(
        "SELECT tx_id, seq, committed_at FROM transactions WHERE book = $1 AND idempotency_key = $2",
    )
    .bind(&book.0)
    .bind(&idem.0)
    .fetch_optional(&mut **db)
    .await
    .map_err(io_err)?;
    Ok(row.map(|r| Committed {
        txid: TxId(r.get::<Uuid, _>("tx_id")),
        seq: r.get("seq"),
        at: r.get("committed_at"),
    }))
}

#[async_trait]
impl Store for PgTaleaStore {
    async fn register_asset(&self, asset: &AssetDef) -> Result<(), StoreError> {
        todo!()
    }

    async fn open_account(&self, def: &AccountDef, cfg: &AccountCfg) -> Result<(), StoreError> {
        todo!()
    }

    async fn commit(&self, transaction: &Transaction) -> Result<Committed, StoreError> {
        todo!()
    }

    async fn balance(
        &self,
        account: &AccountId,
        as_of: Option<DateTime<Utc>>,
    ) -> Result<Amount, StoreError> {
        todo!()
    }

    async fn read_events(
        &self,
        book: &Book,
        from: Seq,
        limit: usize,
    ) -> Result<Vec<Sequenced<LedgerEvent>>, StoreError> {
        todo!()
    }

    fn subscribe(&self, book: &Book, from: Seq) -> EventStream {
        todo!()
    }
}
```

- [ ] **Step 4: Create the env-gated test harness `talea-store-postgres/tests/conformance.rs`**

```rust
use sqlx::postgres::PgPoolOptions;
use talea_store_conformance as conformance;
use talea_store_postgres::PgTaleaStore;

/// Returns None (skipping the test) when TALEA_TEST_PG_URL is not set.
/// Example: TALEA_TEST_PG_URL=postgres://localhost/talea_test cargo test -p talea_store_postgres
async fn store() -> Option<PgTaleaStore> {
    let Ok(url) = std::env::var("TALEA_TEST_PG_URL") else {
        eprintln!("TALEA_TEST_PG_URL not set; skipping postgres conformance test");
        return None;
    };
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&url)
        .await
        .expect("failed to connect to TALEA_TEST_PG_URL");
    let store = PgTaleaStore::new(pool);
    store.migrate().await.expect("migration failed");
    Some(store)
}

macro_rules! pg_test {
    ($name:ident) => {
        #[tokio::test]
        async fn $name() {
            let Some(store) = store().await else { return };
            conformance::$name(&store).await;
        }
    };
}

pg_test!(registry_is_idempotent);
pg_test!(unknown_asset_rejected);
```

- [ ] **Step 5: Verify build, and behavior with/without a database**

Run: `cargo test -p talea_store_postgres`
Expected: COMPILES; both tests PASS trivially (skip notice) when `TALEA_TEST_PG_URL` is unset.

If you have Postgres available, create a scratch database and verify the gated path reaches the `todo!()`:

```bash
TALEA_TEST_PG_URL=postgres://localhost/talea_test cargo test -p talea_store_postgres
```

Expected: both tests FAIL with `not yet implemented`

- [ ] **Step 6: Commit**

```bash
git add talea-store-postgres
git commit -m "feat(postgres): schema migration, store skeleton + helpers, env-gated tests"
```

---

### Task 11: `talea-store-postgres` — register_asset + open_account

**Files:**
- Modify: `talea-store-postgres/src/lib.rs`

- [ ] **Step 1: Implement `register_asset`**

Replace the stub. Identical logic to SQLite, with `$n` params, JSONB payloads, and `pg_notify` (inside the transaction, so it is delivered only on commit):

```rust
    async fn register_asset(&self, asset: &AssetDef) -> Result<(), StoreError> {
        let mut db = self.pool.begin().await.map_err(io_err)?;

        if let Some(row) = sqlx::query(
            "SELECT class, network, native_id, precision, name FROM assets WHERE id = $1",
        )
        .bind(asset.id.as_str())
        .fetch_optional(&mut *db)
        .await
        .map_err(io_err)?
        {
            let class: String = row.get("class");
            let existing = AssetDef {
                id: asset.id.clone(),
                class: match class.as_str() {
                    "fiat" => AssetClass::Fiat,
                    _ => AssetClass::Crypto {
                        network: Network::new(
                            row.get::<Option<String>, _>("network").unwrap_or_default(),
                        ),
                        native_id: row.get("native_id"),
                    },
                },
                precision: row.get::<i16, _>("precision") as u8,
                name: row.get("name"),
            };
            return if existing == *asset {
                Ok(())
            } else {
                Err(StoreError::AlreadyExists {
                    what: format!("asset {}", asset.id.as_str()),
                })
            };
        }

        let (class, network, native_id) = match &asset.class {
            AssetClass::Fiat => ("fiat", None, None),
            AssetClass::Crypto { network, native_id } => {
                ("crypto", Some(network.as_str().to_string()), native_id.clone())
            }
        };
        sqlx::query(
            "INSERT INTO assets (id, class, network, native_id, precision, name)
             VALUES ($1, $2, $3, $4, $5, $6)",
        )
        .bind(asset.id.as_str())
        .bind(class)
        .bind(network)
        .bind(native_id)
        .bind(asset.precision as i16)
        .bind(&asset.name)
        .execute(&mut *db)
        .await
        .map_err(io_err)?;

        let seq = next_seq(&mut db, SYSTEM_BOOK).await?;
        let at = Utc::now();
        insert_event(&mut db, SYSTEM_BOOK, seq, at, &LedgerEvent::AssetRegistered(asset.clone())).await?;
        notify(&mut db, &system_book(), seq).await?;
        db.commit().await.map_err(io_err)?;
        Ok(())
    }
```

Add the `notify` helper next to the other free functions:

```rust
/// Issued inside the transaction: Postgres delivers it only if the tx commits.
/// The payload is informational; subscribers always read rows from `events`.
async fn notify(db: &mut DbTx<'_, Postgres>, book: &Book, seq: Seq) -> Result<(), StoreError> {
    sqlx::query("SELECT pg_notify($1, $2)")
        .bind(book_channel_name(book))
        .bind(seq.to_string())
        .execute(&mut **db)
        .await
        .map_err(io_err)?;
    Ok(())
}
```

- [ ] **Step 2: Implement `open_account`**

Replace the stub:

```rust
    async fn open_account(&self, def: &AccountDef, cfg: &AccountCfg) -> Result<(), StoreError> {
        if def.id.book.is_reserved() {
            return Err(StoreError::InvalidBook(def.id.book.clone()));
        }
        let key = def.id.to_key();
        let mut db = self.pool.begin().await.map_err(io_err)?;

        let asset_exists = sqlx::query("SELECT 1 FROM assets WHERE id = $1")
            .bind(def.asset.as_str())
            .fetch_optional(&mut *db)
            .await
            .map_err(io_err)?;
        if asset_exists.is_none() {
            return Err(StoreError::UnknownAsset(def.asset.clone()));
        }

        if let Some(row) = sqlx::query(
            "SELECT asset, kind, normal_side, min_balance FROM accounts WHERE key = $1",
        )
        .bind(&key)
        .fetch_optional(&mut *db)
        .await
        .map_err(io_err)?
        {
            let same_def = row.get::<String, _>("asset") == def.asset.as_str()
                && AccountKind::from_db(&row.get::<String, _>("kind")).as_ref() == Some(&def.kind);
            let same_cfg = row
                .get::<Option<String>, _>("normal_side")
                .as_deref()
                .and_then(Direction::from_db)
                == cfg.normal_side
                && row.get::<Option<i64>, _>("min_balance") == cfg.min_balance;
            return if same_def && same_cfg {
                Ok(())
            } else {
                Err(StoreError::AlreadyExists {
                    what: format!("account {key}"),
                })
            };
        }

        sqlx::query(
            "INSERT INTO accounts (key, book, path, asset, kind, normal_side, min_balance)
             VALUES ($1, $2, $3, $4, $5, $6, $7)",
        )
        .bind(&key)
        .bind(&def.id.book.0)
        .bind(&def.id.path)
        .bind(def.asset.as_str())
        .bind(def.kind.as_str())
        .bind(cfg.normal_side.as_ref().map(|d| d.as_str().to_string()))
        .bind(cfg.min_balance)
        .execute(&mut *db)
        .await
        .map_err(io_err)?;

        let seq = next_seq(&mut db, &def.id.book.0).await?;
        let at = Utc::now();
        insert_event(
            &mut db,
            &def.id.book.0,
            seq,
            at,
            &LedgerEvent::AccountOpened { def: def.clone(), cfg: cfg.clone() },
        )
        .await?;
        notify(&mut db, &def.id.book, seq).await?;
        db.commit().await.map_err(io_err)?;
        Ok(())
    }
```

- [ ] **Step 3: Run the gated tests**

Run: `TALEA_TEST_PG_URL=postgres://localhost/talea_test cargo test -p talea_store_postgres`
Expected: `registry_is_idempotent` PASS, `unknown_asset_rejected` PASS
(Without the env var: `cargo test -p talea_store_postgres` still passes via skip.)

- [ ] **Step 4: Commit**

```bash
git add talea-store-postgres/src/lib.rs
git commit -m "feat(postgres): register_asset and open_account with event log append + notify"
```

---

### Task 12: `talea-store-postgres` — commit

**Files:**
- Modify: `talea-store-postgres/src/lib.rs`
- Modify: `talea-store-postgres/tests/conformance.rs`

- [ ] **Step 1: Add the failing tests**

Append to `talea-store-postgres/tests/conformance.rs`:

```rust
pg_test!(commit_happy_path);
pg_test!(unknown_account_rejected);
pg_test!(asset_mismatch_rejected);
pg_test!(seq_is_per_book_and_gapless);
```

Run: `TALEA_TEST_PG_URL=postgres://localhost/talea_test cargo test -p talea_store_postgres`
Expected: the four new tests FAIL (todo! panic in `commit`)

- [ ] **Step 2: Implement `commit`**

Replace the stub:

```rust
    async fn commit(&self, transaction: &Transaction) -> Result<Committed, StoreError> {
        if transaction.book.is_reserved() {
            return Err(StoreError::InvalidBook(transaction.book.clone()));
        }
        let mut db = self.pool.begin().await.map_err(io_err)?;

        // 1. idempotency fast path: a duplicate returns the prior result
        if let Some(prior) =
            find_committed(&mut db, &transaction.book, &transaction.idempotency_key).await?
        {
            return Ok(prior);
        }

        // 2. claim the per-book seq (row-locks the counter => gapless, serialized per book)
        let seq = next_seq(&mut db, &transaction.book.0).await?;
        let at = Utc::now();

        // 3. load + validate accounts, accumulating one raw delta per account
        struct Pending {
            account: AccountId,
            asset: AssetId,
            normal_side: Option<Direction>,
            min_balance: Option<i64>,
            delta: i64,
        }
        let mut pending: HashMap<String, Pending> = HashMap::new();
        for posting in &transaction.postings {
            let key = posting.account.to_key();
            if !pending.contains_key(&key) {
                let row = load_account(&mut *db, &key)
                    .await?
                    .ok_or_else(|| StoreError::UnknownAccount(posting.account.clone()))?;
                pending.insert(
                    key.clone(),
                    Pending {
                        account: posting.account.clone(),
                        asset: row.asset,
                        normal_side: row.normal_side,
                        min_balance: row.min_balance,
                        delta: 0,
                    },
                );
            }
            let entry = pending.get_mut(&key).unwrap();
            if entry.asset != *posting.amount.asset() {
                return Err(StoreError::AssetMismatch {
                    account: posting.account.clone(),
                    account_asset: entry.asset.clone(),
                    asset: posting.amount.asset().clone(),
                });
            }
            entry.delta += posting_delta(posting);
        }

        // 4. apply to the balances projection, enforcing min_balance on the
        //    effective (normal-side-adjusted) balance. The upsert row-locks the
        //    balance row, so the post-update value we read is serialized.
        //    An Err return drops `db`, rolling the whole transaction back.
        for p in pending.values() {
            let row = sqlx::query(
                "INSERT INTO balances (account_key, asset, balance, updated_seq)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (account_key) DO UPDATE
                     SET balance = balances.balance + $3, updated_seq = $4
                 RETURNING balance",
            )
            .bind(p.account.to_key())
            .bind(p.asset.as_str())
            .bind(p.delta)
            .bind(seq)
            .fetch_one(&mut *db)
            .await
            .map_err(io_err)?;
            let new_raw: i64 = row.get("balance");
            if let Some(min) = p.min_balance {
                let would_be = effective(new_raw, &p.normal_side);
                if would_be < min {
                    return Err(StoreError::ConstraintViolation {
                        account: p.account.clone(),
                        min_balance: min,
                        would_be,
                    });
                }
            }
        }

        // 5. write the transaction row; a lost idempotency race surfaces here
        //    as a unique violation on (book, idempotency_key)
        let insert_tx = sqlx::query(
            "INSERT INTO transactions
                 (tx_id, book, seq, idempotency_key, occurred_at, committed_at, metadata, external_refs)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
        )
        .bind(transaction.id.0)
        .bind(&transaction.book.0)
        .bind(seq)
        .bind(&transaction.idempotency_key.0)
        .bind(transaction.occurred_at)
        .bind(at)
        .bind(&transaction.metadata)
        .bind(serde_json::to_value(&transaction.external_refs).map_err(io_err)?)
        .execute(&mut *db)
        .await;
        if let Err(e) = insert_tx {
            let unique = e
                .as_database_error()
                .map(|d| d.is_unique_violation())
                .unwrap_or(false);
            if unique {
                drop(db); // roll back our attempt, then return the winner's result
                let mut db = self.pool.begin().await.map_err(io_err)?;
                if let Some(prior) =
                    find_committed(&mut db, &transaction.book, &transaction.idempotency_key).await?
                {
                    return Ok(prior);
                }
            }
            return Err(io_err(e));
        }

        // 6. postings projection + the event-log row (the source of truth)
        for (idx, posting) in transaction.postings.iter().enumerate() {
            sqlx::query(
                "INSERT INTO postings
                     (tx_id, idx, account_key, asset, minor, direction, book, seq, committed_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
            )
            .bind(transaction.id.0)
            .bind(idx as i32)
            .bind(posting.account.to_key())
            .bind(posting.amount.asset().as_str())
            .bind(posting.amount.minor())
            .bind(posting.direction.as_str())
            .bind(&transaction.book.0)
            .bind(seq)
            .bind(at)
            .execute(&mut *db)
            .await
            .map_err(io_err)?;
        }
        insert_event(
            &mut db,
            &transaction.book.0,
            seq,
            at,
            &LedgerEvent::TransactionPosted(transaction.clone()),
        )
        .await?;
        notify(&mut db, &transaction.book, seq).await?;

        db.commit().await.map_err(io_err)?;
        Ok(Committed { txid: transaction.id.clone(), seq, at })
    }
```

- [ ] **Step 3: Run tests to verify they pass**

Run: `TALEA_TEST_PG_URL=postgres://localhost/talea_test cargo test -p talea_store_postgres`
Expected: all 6 tests PASS

- [ ] **Step 4: Commit**

```bash
git add talea-store-postgres
git commit -m "feat(postgres): atomic idempotent commit with per-book gapless seq"
```

---

### Task 13: `talea-store-postgres` — balance + read_events

**Files:**
- Modify: `talea-store-postgres/src/lib.rs`
- Modify: `talea-store-postgres/tests/conformance.rs`

- [ ] **Step 1: Add the failing tests**

Append to `talea-store-postgres/tests/conformance.rs`:

```rust
pg_test!(commit_is_idempotent);
pg_test!(concurrent_same_key_commits_once);
pg_test!(min_balance_blocks_overdraft);
pg_test!(min_balance_is_normal_side_adjusted);
pg_test!(balance_as_of_point_in_time);
pg_test!(read_events_paginates_inclusively);
pg_test!(system_book_is_reserved);
```

Run: `TALEA_TEST_PG_URL=postgres://localhost/talea_test cargo test -p talea_store_postgres`
Expected: the 7 new tests FAIL (todo! panic in `balance`/`read_events`)

- [ ] **Step 2: Implement `balance` and `read_events`**

Replace the two stubs:

```rust
    async fn balance(
        &self,
        account: &AccountId,
        as_of: Option<DateTime<Utc>>,
    ) -> Result<Amount, StoreError> {
        let key = account.to_key();
        let acct = load_account(&self.pool, &key)
            .await?
            .ok_or_else(|| StoreError::UnknownAccount(account.clone()))?;

        let raw: i64 = match as_of {
            // current balance: the projection row (0 if never posted to)
            None => sqlx::query("SELECT balance FROM balances WHERE account_key = $1")
                .bind(&key)
                .fetch_optional(&self.pool)
                .await
                .map_err(io_err)?
                .map(|r| r.get("balance"))
                .unwrap_or(0),
            // point-in-time: aggregate the postings projection by commit time
            Some(t) => sqlx::query(
                "SELECT COALESCE(SUM(CASE WHEN direction = 'D' THEN minor ELSE -minor END), 0)::BIGINT AS raw
                 FROM postings WHERE account_key = $1 AND committed_at <= $2",
            )
            .bind(&key)
            .bind(t)
            .fetch_one(&self.pool)
            .await
            .map_err(io_err)?
            .get("raw"),
        };

        Ok(Amount::new(effective(raw, &acct.normal_side), acct.asset))
    }

    async fn read_events(
        &self,
        book: &Book,
        from: Seq,
        limit: usize,
    ) -> Result<Vec<Sequenced<LedgerEvent>>, StoreError> {
        fetch_events(&self.pool, book, from, limit as i64).await
    }
```

(Note the `::BIGINT` cast: Postgres `SUM(BIGINT)` returns `NUMERIC`, which won't decode as `i64` without it.)

- [ ] **Step 3: Run tests to verify they pass**

Run: `TALEA_TEST_PG_URL=postgres://localhost/talea_test cargo test -p talea_store_postgres`
Expected: all 13 tests PASS

- [ ] **Step 4: Commit**

```bash
git add talea-store-postgres
git commit -m "feat(postgres): balance projection with as_of replay, read_events"
```

---

### Task 14: `talea-store-postgres` — subscribe

**Files:**
- Modify: `talea-store-postgres/src/lib.rs`
- Modify: `talea-store-postgres/tests/conformance.rs`

- [ ] **Step 1: Add the failing test**

Append to `talea-store-postgres/tests/conformance.rs`:

```rust
pg_test!(subscribe_catches_up_then_tails);
```

Run: `TALEA_TEST_PG_URL=postgres://localhost/talea_test cargo test -p talea_store_postgres subscribe_catches_up_then_tails`
Expected: FAIL (todo! panic)

- [ ] **Step 2: Implement `subscribe`**

Replace the stub. Same shape as SQLite: LISTEN first, then alternate "drain the log" / "await a notification". Because LISTEN starts before catch-up, a commit landing during catch-up queues a notification we consume next loop — nothing is missed.

```rust
    fn subscribe(&self, book: &Book, from: Seq) -> EventStream {
        let pool = self.pool.clone();
        let book = book.clone();
        Box::pin(async_stream::stream! {
            let mut listener = match sqlx::postgres::PgListener::connect_with(&pool).await {
                Ok(l) => l,
                Err(e) => {
                    yield Err(io_err(e));
                    return;
                }
            };
            if let Err(e) = listener.listen(&book_channel_name(&book)).await {
                yield Err(io_err(e));
                return;
            }
            let mut next = from;
            loop {
                // catch up from the log until dry
                loop {
                    let batch = match fetch_events(&pool, &book, next, 256).await {
                        Ok(batch) => batch,
                        Err(e) => {
                            yield Err(e);
                            return;
                        }
                    };
                    if batch.is_empty() {
                        break;
                    }
                    for ev in batch {
                        next = ev.seq + 1;
                        yield Ok(ev);
                    }
                }
                // wait for a write to this book (payload is just a wake-up)
                if let Err(e) = listener.recv().await {
                    yield Err(io_err(e));
                    return;
                }
            }
        })
    }
```

- [ ] **Step 3: Run the full Postgres suite**

Run: `TALEA_TEST_PG_URL=postgres://localhost/talea_test cargo test -p talea_store_postgres`
Expected: all 14 tests PASS

- [ ] **Step 4: Commit**

```bash
git add talea-store-postgres
git commit -m "feat(postgres): subscribe via catch-up + LISTEN/NOTIFY wake-ups"
```

---

### Task 15: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Full workspace check**

Run: `cargo test --workspace`
Expected: all tests PASS (Postgres tests skip without `TALEA_TEST_PG_URL`)

Run: `TALEA_TEST_PG_URL=postgres://localhost/talea_test cargo test --workspace`
Expected: all tests PASS including Postgres

- [ ] **Step 2: Lint**

Run: `cargo clippy --workspace --all-targets`
Expected: no errors. Fix any warnings introduced by this work (pre-existing `talea-server` dead-code warnings are out of scope).

- [ ] **Step 3: Commit any lint fixes**

```bash
git add -A
git commit -m "chore: clippy fixes for store implementations"
```

(Skip if nothing changed.)

---

## Self-Review Notes

- **Spec coverage:** core changes (Tasks 1–3), schema (5, 10), commit semantics incl. idempotency + gapless seq + min_balance (7, 12), balance/as_of (8, 13), read_events inclusivity (8, 13), subscribe catch-up/live (9, 14), `_system` book + InvalidBook (6, 7, 11, 12, tests in 8/13), conformance suite + env-gated Postgres (4, 5, 10). Out-of-scope items from the spec remain out of scope.
- **Known risk — sqlx 0.9 API drift:** the query/bind/Executor patterns here follow the sqlx 0.7/0.8 API. If 0.9 renamed anything (e.g. transaction deref, `PgListener::connect_with`), adapt mechanically; the semantics of every step stand.
- **SQLite `:memory:` pools require `max_connections(1)`** — already encoded in the test harness; do not "fix" it to a larger pool.
- **`Utc::now()` in commit:** timestamps are taken once per commit inside the store (not the DB) so SQLite and Postgres behave identically and `Sequenced.at == Committed.at == events.at`.





