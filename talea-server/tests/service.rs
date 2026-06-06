// Test code: a panicking unwrap/expect IS the test failing (clippy.toml
// exempts #[test] fns; this extends that to integration-test helpers).
#![allow(clippy::unwrap_used, clippy::expect_used)]

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
        amount: WireAmount {
            minor,
            asset: asset.into(),
        },
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
    svc.open_account(account_draft(
        "onramp",
        "cash",
        "USD",
        "asset",
        Some(Direction::Debit),
    ))
    .await
    .unwrap();
    svc.open_account(account_draft(
        "onramp",
        "deposits",
        "USD",
        "liability",
        Some(Direction::Credit),
    ))
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
    let draft = tx_draft(
        "onramp",
        "u1",
        vec![
            posting("deposits", "USD", 1000, Direction::Credit),
            posting("cash", "USD", 900, Direction::Debit),
        ],
    );
    match svc.post(draft).await {
        Err(ApiError::Unbalanced {
            debit,
            credit,
            asset,
        }) => {
            assert_eq!((debit, credit, asset.as_str()), (900, 1000, "USD"));
        }
        other => panic!("expected Unbalanced, got {other:?}"),
    }
}

#[tokio::test]
async fn non_positive_amount_rejected() {
    let svc = funded_svc().await;
    let draft = tx_draft(
        "onramp",
        "n1",
        vec![
            posting("deposits", "USD", 0, Direction::Credit),
            posting("cash", "USD", 0, Direction::Debit),
        ],
    );
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
    let draft = tx_draft(
        "onramp",
        "m1",
        vec![
            posting("deposits", "USD", 10, Direction::Credit),
            posting("ghost", "USD", 10, Direction::Debit),
        ],
    );
    assert!(matches!(
        svc.post(draft).await,
        Err(ApiError::UnknownAccount { account }) if account == "onramp:ghost"
    ));
    // asset mismatch: EUR postings against USD accounts
    svc.register_asset(usd_draft("EUR")).await.unwrap();
    let draft = tx_draft(
        "onramp",
        "m2",
        vec![
            posting("deposits", "EUR", 10, Direction::Credit),
            posting("cash", "EUR", 10, Direction::Debit),
        ],
    );
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

#[tokio::test]
async fn balance_view_formats_decimal() {
    let svc = funded_svc().await;
    svc.post(tx_draft("onramp", "b1", balanced(1000)))
        .await
        .unwrap();

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
        svc.post(tx_draft("onramp", &format!("h{i}"), balanced(100)))
            .await
            .unwrap();
    }
    let page = svc
        .account_history(
            "onramp",
            "cash",
            Page {
                after_seq: None,
                limit: 2,
            },
        )
        .await
        .unwrap();
    assert_eq!(page.items.len(), 2);
    assert_eq!(page.items[0].seq, 3);
    assert_eq!(page.items[0].amount.minor, 100);
    assert_eq!(page.next, Some(4));

    let rest = svc
        .account_history(
            "onramp",
            "cash",
            Page {
                after_seq: page.next,
                limit: 10,
            },
        )
        .await
        .unwrap();
    assert_eq!(rest.items.len(), 1);
    assert_eq!(rest.items[0].seq, 5);
    assert!(rest.next.is_none()); // short page => no further cursor
}

// ---- post_batch tests -------------------------------------------------------

#[tokio::test]
async fn batch_all_valid_gapless_seqs() {
    let svc = funded_svc().await;
    let drafts = vec![
        tx_draft("onramp", "batch-a1", balanced(100)),
        tx_draft("onramp", "batch-a2", balanced(200)),
        tx_draft("onramp", "batch-a3", balanced(300)),
    ];
    let results = svc.post_batch(drafts).await;
    assert_eq!(results.len(), 3);

    let mut seqs: Vec<i64> = results
        .iter()
        .map(|r| r.as_ref().expect("slot should be Ok").seq)
        .collect();
    seqs.sort_unstable();

    // seqs 1,2 are account_opened events; first transaction batch fills 3,4,5
    assert_eq!(seqs, vec![3, 4, 5], "seqs should be gapless: {seqs:?}");
}

#[tokio::test]
async fn batch_one_invalid_slot_isolated() {
    let svc = funded_svc().await;
    let drafts = vec![
        tx_draft("onramp", "batch-b1", balanced(100)),
        // unbalanced: debit 999 ≠ credit 100 → Unbalanced error
        tx_draft(
            "onramp",
            "batch-b2",
            vec![
                posting("deposits", "USD", 100, Direction::Credit),
                posting("cash", "USD", 999, Direction::Debit),
            ],
        ),
        tx_draft("onramp", "batch-b3", balanced(300)),
    ];
    let results = svc.post_batch(drafts).await;
    assert_eq!(results.len(), 3);

    assert!(results[0].is_ok(), "slot 0 should succeed");
    assert!(
        matches!(&results[1], Err(ApiError::Unbalanced { .. })),
        "slot 1 should be Unbalanced, got {:?}",
        results[1]
    );
    assert!(results[2].is_ok(), "slot 2 should succeed");
}

#[tokio::test]
async fn batch_duplicate_idem_key_deduplicates() {
    let svc = funded_svc().await;
    let draft = tx_draft("onramp", "batch-dup", balanced(100));
    let drafts = vec![draft.clone(), draft];

    let results = svc.post_batch(drafts).await;
    assert_eq!(results.len(), 2);

    let p0 = results[0].as_ref().expect("slot 0 ok");
    let p1 = results[1].as_ref().expect("slot 1 ok");

    // Both resolve to the same committed transaction
    assert_eq!(p0.tx_id, p1.tx_id, "duplicate idem key → same tx_id");
    assert_eq!(p0.seq, p1.seq, "duplicate idem key → same seq");
    // Exactly one of the two is the original; the other is a dedup hit
    let deduped_count = [p0.deduplicated, p1.deduplicated]
        .iter()
        .filter(|&&d| d)
        .count();
    assert_eq!(deduped_count, 1, "exactly one slot should be deduplicated");
}

#[tokio::test]
async fn batch_empty_input_returns_empty() {
    let svc = funded_svc().await;
    let results = svc.post_batch(vec![]).await;
    assert!(results.is_empty());
}

fn metrics_handle() -> &'static metrics_exporter_prometheus::PrometheusHandle {
    use std::sync::OnceLock;
    static HANDLE: OnceLock<metrics_exporter_prometheus::PrometheusHandle> = OnceLock::new();
    HANDLE.get_or_init(|| talea_server::metrics::install().expect("install metrics recorder once"))
}

#[tokio::test]
async fn commit_metrics_classify_results() {
    let handle = metrics_handle();
    let svc = funded_svc().await;
    let draft = tx_draft("onramp", "metrics-dup", balanced(100));
    svc.post(draft.clone()).await.unwrap();
    svc.post(draft).await.unwrap(); // replay -> deduplicated

    let text = handle.render();
    assert!(
        text.contains(r#"talea_commits_total{result="committed"}"#),
        "committed counter missing:\n{text}"
    );
    assert!(
        text.contains(r#"talea_commits_total{result="deduplicated"}"#),
        "deduplicated counter missing:\n{text}"
    );
    assert!(text.contains("talea_commit_duration_seconds"));
}

#[tokio::test]
async fn transaction_view_and_not_found() {
    let svc = funded_svc().await;
    let posted = svc
        .post(tx_draft("onramp", "tv1", balanced(250)))
        .await
        .unwrap();

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
    svc.post(tx_draft("onramp", "tb1", balanced(500)))
        .await
        .unwrap();

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
    svc.post(tx_draft("onramp", "s1", balanced(10)))
        .await
        .unwrap();

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
