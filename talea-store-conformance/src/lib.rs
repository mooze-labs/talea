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

/// Exercises the Crypto class round-trip in the registry idempotency
/// comparison (network/native_id columns), which Fiat fixtures never touch.
pub async fn crypto_asset_round_trips(store: &impl Store) {
    let id = unique("USDT-ETH");
    let def = AssetDef {
        id: AssetId::new(&id),
        class: AssetClass::Crypto {
            network: Network::new("ethereum"),
            native_id: Some("0xdac17f958d2ee523a2206206994597c13d831ec7".into()),
        },
        precision: 6,
        name: "Tether".into(),
    };
    store.register_asset(&def).await.unwrap();
    store.register_asset(&def).await.unwrap(); // identical: fine
    let conflicting = AssetDef {
        class: AssetClass::Crypto {
            network: Network::new("tron"),
            native_id: None,
        },
        ..def.clone()
    };
    match store.register_asset(&conflicting).await {
        Err(StoreError::AlreadyExists { .. }) => {}
        other => panic!("expected AlreadyExists, got {other:?}"),
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

/// Interleaved (single-task `join!`) duplicate commits — an idempotency-under-
/// interleaving check, NOT a true parallel race; the unique-violation recovery
/// path needs multi-connection contention to be exercised for real.
pub async fn concurrent_same_key_commits_once(store: &impl Store) {
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

/// Assumes the store stamps commit time from the same clock as this process
/// (the plan's stores take `Utc::now()` in-process); a DB-side clock with skew
/// could place `mid` on the wrong side of a commit.
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

    // user activity in books starting with '_' is rejected. NOTE: this asserts
    // the reservation check runs BEFORE account/asset lookups ("a"/"b" below
    // were never opened) — stores must validate the book name first.
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

pub async fn subscribe_catches_up_then_tails(store: &impl Store) {
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
