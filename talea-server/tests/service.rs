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
