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

pub fn open_spec(
    book: &str,
    path: &str,
    asset_id: &str,
    kind: AccountKind,
) -> (AccountDef, AccountCfg) {
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
pub fn transfer(
    book: &str,
    idem: &str,
    from: &str,
    to: &str,
    asset_id: &str,
    minor: i64,
) -> Transaction {
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
    let a1 = store
        .commit(&transfer(&book_a, "a1", "deposits", "cash", &asset_a, 1))
        .await
        .unwrap();
    let b1 = store
        .commit(&transfer(&book_b, "b1", "deposits", "cash", &asset_b, 1))
        .await
        .unwrap();
    let a2 = store
        .commit(&transfer(&book_a, "a2", "deposits", "cash", &asset_a, 1))
        .await
        .unwrap();
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
    let bal = store
        .balance(&account_id(&book, "cash"), None)
        .await
        .unwrap();
    assert_eq!(bal.amount.minor(), 500);
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
    let bal = store
        .balance(&account_id(&book, "cash"), None)
        .await
        .unwrap();
    assert_eq!(bal.amount.minor(), 250);
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
    let bal = store
        .balance(&account_id(&book, "expenses"), None)
        .await
        .unwrap();
    assert_eq!(bal.amount.minor(), 0);
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
    store
        .commit(&transfer(&book, "fund", "deposits", "cash", &asset_id, 100))
        .await
        .unwrap();
    let bal = store
        .balance(&account_id(&book, "deposits"), None)
        .await
        .unwrap();
    assert_eq!(bal.amount.minor(), 100);

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
    store
        .commit(&transfer(&book, "p1", "deposits", "cash", &asset_id, 100))
        .await
        .unwrap();
    tokio::time::sleep(Duration::from_millis(20)).await;
    let mid = Utc::now();
    tokio::time::sleep(Duration::from_millis(20)).await;
    store
        .commit(&transfer(&book, "p2", "deposits", "cash", &asset_id, 50))
        .await
        .unwrap();

    let now_bal = store
        .balance(&account_id(&book, "cash"), None)
        .await
        .unwrap();
    assert_eq!(now_bal.amount.minor(), 150);
    assert_eq!(now_bal.amount.asset().as_str(), asset_id);
    let then_bal = store
        .balance(&account_id(&book, "cash"), Some(mid))
        .await
        .unwrap();
    assert_eq!(then_bal.amount.minor(), 100);
}

pub async fn read_events_paginates_inclusively(store: &impl Store) {
    let (book, asset_id) = setup_book(store).await;
    for i in 0..3 {
        store
            .commit(&transfer(
                &book,
                &format!("e{i}"),
                "deposits",
                "cash",
                &asset_id,
                10,
            ))
            .await
            .unwrap();
    }
    let b = Book(book.clone());
    // seqs: 1,2 account_opened; 3,4,5 transaction_posted
    let page = store.read_events(&b, 1, 2).await.unwrap();
    assert_eq!(page.len(), 2);
    assert_eq!(page[0].seq, 1); // `from` is inclusive
    assert!(matches!(page[0].event, LedgerEvent::AccountOpened { .. }));
    let next = store
        .read_events(&b, page.last().unwrap().seq + 1, 10)
        .await
        .unwrap();
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
        if page.iter().any(|e| {
            matches!(
                &e.event,
                LedgerEvent::AssetRegistered(a) if a.id.as_str() == asset_id
            )
        }) {
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
    store
        .commit(&transfer(&book, "s1", "deposits", "cash", &asset_id, 10))
        .await
        .unwrap();

    // from = 3 skips the two account_opened events; seq 3 already exists (catch-up)
    let mut stream = store.subscribe(&Book(book.clone()), 3);
    let first = tokio::time::timeout(Duration::from_secs(5), stream.next())
        .await
        .expect("timed out waiting for catch-up event")
        .expect("stream ended")
        .unwrap();
    assert_eq!(first.seq, 3);
    assert!(matches!(first.event, LedgerEvent::TransactionPosted(_)));

    // a commit made while subscribed must be delivered live
    store
        .commit(&transfer(&book, "s2", "deposits", "cash", &asset_id, 20))
        .await
        .unwrap();
    let second = tokio::time::timeout(Duration::from_secs(5), stream.next())
        .await
        .expect("timed out waiting for live event")
        .expect("stream ended")
        .unwrap();
    assert_eq!(second.seq, 4);
}

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
    assert!(
        store
            .asset(&AssetId::new(unique("NOPE")))
            .await
            .unwrap()
            .is_none()
    );
}

pub async fn balance_snapshot_updated_seq(store: &impl Store) {
    let (book, asset_id) = setup_book(store).await;
    // never posted: zero balance, seq 0
    let empty = store
        .balance(&account_id(&book, "cash"), None)
        .await
        .unwrap();
    assert_eq!(empty.amount.minor(), 0);
    assert_eq!(empty.updated_seq, 0);

    store
        .commit(&transfer(&book, "u1", "deposits", "cash", &asset_id, 100))
        .await
        .unwrap();
    tokio::time::sleep(Duration::from_millis(20)).await;
    let mid = Utc::now();
    tokio::time::sleep(Duration::from_millis(20)).await;
    store
        .commit(&transfer(&book, "u2", "deposits", "cash", &asset_id, 50))
        .await
        .unwrap();

    // seqs 1,2 = account_opened; 3,4 = the two commits
    let now = store
        .balance(&account_id(&book, "cash"), None)
        .await
        .unwrap();
    assert_eq!(now.updated_seq, 4);
    let then = store
        .balance(&account_id(&book, "cash"), Some(mid))
        .await
        .unwrap();
    assert_eq!(then.updated_seq, 3);
    assert_eq!(then.amount.minor(), 100);
}

pub async fn account_history_pages_exclusively(store: &impl Store) {
    let (book, asset_id) = setup_book(store).await;
    for i in 0..3i64 {
        store
            .commit(&transfer(
                &book,
                &format!("h{i}"),
                "deposits",
                "cash",
                &asset_id,
                10 + i,
            ))
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
    let rest = store
        .account_history(&cash, Some(first[1].seq), 10)
        .await
        .unwrap();
    assert_eq!(rest.len(), 1);
    assert_eq!(rest[0].seq, 5);
    assert_eq!(rest[0].amount.minor(), 12);
    // the credit side sees its own postings
    let dep = store
        .account_history(&account_id(&book, "deposits"), None, 10)
        .await
        .unwrap();
    assert_eq!(dep.len(), 3);
    assert_eq!(dep[0].direction, Direction::Credit);
    // unknown account is an error, not an empty page
    match store
        .account_history(&account_id(&book, "ghost"), None, 10)
        .await
    {
        Err(StoreError::UnknownAccount(acc)) => assert_eq!(acc.path, "ghost"),
        other => panic!("expected UnknownAccount, got {other:?}"),
    }
}

/// A transaction can post to the same account more than once; those rows
/// share one seq. `limit` counts distinct seqs, so a page must carry ALL
/// rows of its boundary seq — a naive row-LIMIT implementation fails this.
pub async fn account_history_never_splits_a_transaction(store: &impl Store) {
    let (book, asset_id) = setup_book(store).await;
    let split = Transaction {
        id: TxId(Uuid::new_v4()),
        book: Book(book.clone()),
        postings: vec![
            Posting {
                account: account_id(&book, "cash"),
                amount: Amount::new(30, AssetId::new(&asset_id)),
                direction: Direction::Debit,
            },
            Posting {
                account: account_id(&book, "cash"),
                amount: Amount::new(70, AssetId::new(&asset_id)),
                direction: Direction::Debit,
            },
            Posting {
                account: account_id(&book, "deposits"),
                amount: Amount::new(100, AssetId::new(&asset_id)),
                direction: Direction::Credit,
            },
        ],
        idempotency_key: IdempotencyKey("split".to_string()),
        external_refs: vec![],
        metadata: serde_json::json!({}),
        occurred_at: Utc::now(),
    };
    store.commit(&split).await.unwrap(); // seq 3, two cash rows
    store
        .commit(&transfer(&book, "after", "deposits", "cash", &asset_id, 5))
        .await
        .unwrap(); // seq 4

    let cash = account_id(&book, "cash");
    // limit = 1 means one transaction (seq 3) — including BOTH its cash rows
    let page = store.account_history(&cash, None, 1).await.unwrap();
    assert_eq!(
        page.len(),
        2,
        "page must include all rows of the boundary seq"
    );
    assert_eq!((page[0].seq, page[1].seq), (3, 3));
    assert_eq!(page[0].amount.minor() + page[1].amount.minor(), 100);
    let rest = store.account_history(&cash, Some(3), 10).await.unwrap();
    assert_eq!(rest.len(), 1);
    assert_eq!(rest[0].seq, 4);
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

    store
        .commit(&transfer(&book, "ta", "deposits", "cash", &asset_a, 100))
        .await
        .unwrap();
    tokio::time::sleep(Duration::from_millis(20)).await;
    let mid = Utc::now();
    tokio::time::sleep(Duration::from_millis(20)).await;
    store
        .commit(&transfer(
            &book,
            "tb",
            "deposits-eur",
            "cash-eur",
            &asset_b,
            40,
        ))
        .await
        .unwrap();

    let all = store
        .trial_balance(&Book(book.clone()), None)
        .await
        .unwrap();
    assert_eq!(all.len(), 2);
    let row_a = all.iter().find(|r| r.asset.as_str() == asset_a).unwrap();
    assert_eq!((row_a.debits, row_a.credits), (100, 100));
    let row_b = all.iter().find(|r| r.asset.as_str() == asset_b).unwrap();
    assert_eq!((row_b.debits, row_b.credits), (40, 40));

    // as_of cuts the second commit off
    let early = store
        .trial_balance(&Book(book.clone()), Some(mid))
        .await
        .unwrap();
    assert_eq!(early.len(), 1);
    assert_eq!(early[0].asset.as_str(), asset_a);
}

// --- batch commits ------------------------------------------------------

pub async fn commit_batch_all_succeed(store: &impl Store) {
    let (book, asset_id) = setup_book(store).await;
    let txs: Vec<Transaction> = (0..3)
        .map(|i| {
            transfer(
                &book,
                &format!("batch-{i}"),
                "deposits",
                "cash",
                &asset_id,
                100,
            )
        })
        .collect();
    let results = store.commit_batch(&txs).await;
    assert_eq!(results.len(), 3);
    // setup_book's two AccountOpened events hold seqs 1-2; the batch gets 3,4,5
    let seqs: Vec<Seq> = results.iter().map(|r| r.as_ref().unwrap().seq).collect();
    assert_eq!(seqs, vec![3, 4, 5]);
    let bal = store
        .balance(&account_id(&book, "cash"), None)
        .await
        .unwrap();
    assert_eq!(bal.amount.minor(), 300);
}

pub async fn commit_batch_isolates_failures_and_stays_gapless(store: &impl Store) {
    let book = unique("book");
    let asset_id = unique("USD");
    store.register_asset(&asset(&asset_id)).await.unwrap();
    let (cash_def, mut cash_cfg) = open_spec(&book, "cash", &asset_id, AccountKind::Asset);
    cash_cfg.min_balance = Some(0);
    store.open_account(&cash_def, &cash_cfg).await.unwrap();
    let (exp_def, exp_cfg) = open_spec(&book, "expenses", &asset_id, AccountKind::Expense);
    store.open_account(&exp_def, &exp_cfg).await.unwrap();
    let (dep_def, dep_cfg) = open_spec(&book, "deposits", &asset_id, AccountKind::Liability);
    store.open_account(&dep_def, &dep_cfg).await.unwrap();
    // seqs 1..=3 are the three AccountOpened events

    let txs = vec![
        transfer(&book, "fund", "deposits", "cash", &asset_id, 100), // ok
        transfer(&book, "overdraft", "cash", "expenses", &asset_id, 500), // cash -> -400, blocked
        transfer(&book, "spend", "cash", "expenses", &asset_id, 30), // ok
    ];
    let results = store.commit_batch(&txs).await;
    match &results[1] {
        Err(StoreError::ConstraintViolation { would_be, .. }) => assert_eq!(*would_be, -400),
        other => panic!("expected ConstraintViolation, got {other:?}"),
    }
    let a = results[0].as_ref().unwrap();
    let b = results[2].as_ref().unwrap();
    // the failed draft's claimed seq rolled back and was reclaimed: gapless
    assert_eq!((a.seq, b.seq), (4, 5));
    let bal = store
        .balance(&account_id(&book, "cash"), None)
        .await
        .unwrap();
    assert_eq!(bal.amount.minor(), 70);
    // the log holds exactly the two successful TransactionPosted events
    let events = store.read_events(&Book(book.clone()), 4, 10).await.unwrap();
    assert_eq!(events.len(), 2);
}

pub async fn commit_batch_dedups_within_batch(store: &impl Store) {
    let (book, asset_id) = setup_book(store).await;
    // same idempotency key, distinct tx ids (transfer() generates a fresh uuid)
    let first = transfer(&book, "dup", "deposits", "cash", &asset_id, 100);
    let second = transfer(&book, "dup", "deposits", "cash", &asset_id, 100);
    let results = store.commit_batch(&[first.clone(), second]).await;
    let a = results[0].as_ref().unwrap();
    let b = results[1].as_ref().unwrap();
    assert_eq!(a.txid, first.id);
    assert_eq!(a, b); // the duplicate observes the first draft's commit
    let bal = store
        .balance(&account_id(&book, "cash"), None)
        .await
        .unwrap();
    assert_eq!(bal.amount.minor(), 100); // posted exactly once
}

pub async fn commit_batch_dedups_against_prior_commit(store: &impl Store) {
    let (book, asset_id) = setup_book(store).await;
    let original = transfer(&book, "prior", "deposits", "cash", &asset_id, 100);
    let prior = store.commit(&original).await.unwrap();
    let replay = transfer(&book, "prior", "deposits", "cash", &asset_id, 100);
    let results = store.commit_batch(&[replay]).await;
    assert_eq!(*results[0].as_ref().unwrap(), prior);
}

pub async fn commit_batch_rejects_reserved_book(store: &impl Store) {
    let (book, asset_id) = setup_book(store).await;
    let mut bad = transfer(&book, "bad", "deposits", "cash", &asset_id, 100);
    bad.book = Book(SYSTEM_BOOK.to_string());
    let good = transfer(&book, "good", "deposits", "cash", &asset_id, 100);
    let results = store.commit_batch(&[bad, good]).await;
    assert!(matches!(results[0], Err(StoreError::InvalidBook(_))));
    assert!(results[1].is_ok()); // the batchmate is unaffected
}

pub async fn commit_batch_empty_returns_empty(store: &impl Store) {
    assert!(store.commit_batch(&[]).await.is_empty());
}

// --- multi-instance timestamp contract ----------------------------------

/// `at` must be non-decreasing in seq order within a book. The timestamp is
/// captured while holding the per-book counter lock, on a single time
/// source (the DB clock for postgres, the process clock for embedded
/// sqlite), so `(seq, at)` is jointly monotonic — the property `as_of`
/// precision depends on. Guards against any backend capturing time outside
/// the lock or from a per-instance clock.
pub async fn committed_at_is_monotonic_per_book(store: &impl Store) {
    let (book, asset_id) = setup_book(store).await;
    for i in 0..4 {
        store
            .commit(&transfer(
                &book,
                &format!("mono-{i}"),
                "deposits",
                "cash",
                &asset_id,
                1,
            ))
            .await
            .unwrap();
    }
    // A burst of interleaved commits for contention. How much real
    // concurrency this exercises is backend-dependent: the sqlite
    // conformance harness pools a single connection, so the burst
    // serializes at the pool; on postgres the three commits race for
    // the per-book counter-row lock — the scenario that matters for
    // DB-clock timestamps.
    let tx_a = transfer(&book, "burst-a", "deposits", "cash", &asset_id, 2);
    let tx_b = transfer(&book, "burst-b", "deposits", "cash", &asset_id, 3);
    let tx_c = transfer(&book, "burst-c", "deposits", "cash", &asset_id, 4);
    let (a, b, c) = futures::join!(
        store.commit(&tx_a),
        store.commit(&tx_b),
        store.commit(&tx_c),
    );
    a.unwrap();
    b.unwrap();
    c.unwrap();

    let events = store
        .read_events(&Book(book.clone()), 1, 100)
        .await
        .unwrap();
    // 2 account_opened from setup + 7 commits
    assert_eq!(events.len(), 9);
    for pair in events.windows(2) {
        assert!(pair[0].seq < pair[1].seq, "events not in seq order");
        assert!(
            pair[0].at <= pair[1].at,
            "committed_at regressed: seq {} at {:?} > seq {} at {:?}",
            pair[0].seq,
            pair[0].at,
            pair[1].seq,
            pair[1].at
        );
    }
}
