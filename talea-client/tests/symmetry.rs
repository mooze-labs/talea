// Test code: a panicking unwrap/expect IS the test failing (clippy.toml
// exempts #[test] fns; this extends that to integration-test helpers).
#![allow(clippy::unwrap_used, clippy::expect_used)]

//! One generic exercise over the LedgerApi trait, run against BOTH the
//! in-process LedgerService and the remote TaleaClient — proving consumers
//! can swap them freely.

mod harness;

use std::sync::Arc;

use sqlx::sqlite::SqlitePoolOptions;
use talea_client::*;
use talea_core::types::Direction;
use talea_server::LedgerService;
use talea_store_sqlite::SqliteTaleaStore;

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

fn balanced(amount: i64) -> Vec<PostingDraft> {
    vec![
        posting("deposits", "USD", amount, Direction::Credit),
        posting("cash", "USD", amount, Direction::Debit),
    ]
}

async fn exercise(api: &impl LedgerApi) {
    api.register_asset(AssetDraft {
        id: "USD".into(),
        class: "fiat".into(),
        network: None,
        native_id: None,
        precision: 2,
        name: "US Dollar".into(),
    })
    .await
    .unwrap();
    for (path, kind, side) in [
        ("cash", "asset", Direction::Debit),
        ("deposits", "liability", Direction::Credit),
    ] {
        api.open_account(AccountDraft {
            book: "b".into(),
            path: path.into(),
            asset: "USD".into(),
            kind: kind.into(),
            normal_side: Some(side),
            min_balance: None,
        })
        .await
        .unwrap();
    }
    let posted = api
        .post(TransactionDraft {
            book: "b".into(),
            idempotency_key: "k1".into(),
            postings: vec![
                PostingDraft {
                    account: "deposits".into(),
                    amount: WireAmount {
                        minor: 500,
                        asset: "USD".into(),
                    },
                    direction: Direction::Credit,
                },
                PostingDraft {
                    account: "cash".into(),
                    amount: WireAmount {
                        minor: 500,
                        asset: "USD".into(),
                    },
                    direction: Direction::Debit,
                },
            ],
            external_refs: vec![],
            metadata: serde_json::json!({}),
            occurred_at: None,
        })
        .await
        .unwrap();
    assert_eq!(posted.seq, 3);

    let bal = api.balance("b", "cash", None).await.unwrap();
    assert_eq!(bal.balance, "5.00");
    assert_eq!(bal.updated_seq, 3);

    let tb = api.trial_balance("b", None).await.unwrap();
    assert_eq!((tb.lines[0].debits, tb.lines[0].credits), (500, 500));

    let view = api.transaction(&posted.tx_id).await.unwrap();
    assert_eq!(view.seq, 3);
}

/// Exercises `post_batch` through the trait.  Runs a mixed batch:
///   slot 0 — valid balanced draft  →  Ok
///   slot 1 — unbalanced draft      →  Err(Unbalanced)
///   slot 2 — duplicate of slot 0   →  Ok(deduplicated: true)
///
/// Seqs and tx_ids will differ between the service and the HTTP client
/// (each runs against its own fresh store), so we compare error *shapes*
/// only: Ok/Err variant, error discriminant for Err, and `deduplicated`
/// flag for the dedup slot.
async fn exercise_batch(api: &impl LedgerApi) {
    // Set up the book — same shape as `exercise` so the two functions
    // can be combined in future tests.
    api.register_asset(AssetDraft {
        id: "USD".into(),
        class: "fiat".into(),
        network: None,
        native_id: None,
        precision: 2,
        name: "US Dollar".into(),
    })
    .await
    .unwrap();
    for (path, kind, side) in [
        ("cash", "asset", Direction::Debit),
        ("deposits", "liability", Direction::Credit),
    ] {
        api.open_account(AccountDraft {
            book: "b".into(),
            path: path.into(),
            asset: "USD".into(),
            kind: kind.into(),
            normal_side: Some(side),
            min_balance: None,
        })
        .await
        .unwrap();
    }

    let valid = tx_draft("b", "sym-batch-v1", balanced(100));
    let unbalanced = tx_draft(
        "b",
        "sym-batch-u1",
        vec![
            posting("deposits", "USD", 100, Direction::Credit),
            posting("cash", "USD", 50, Direction::Debit), // intentionally unbalanced
        ],
    );
    let duplicate = valid.clone(); // same idem key as slot 0

    let results = api.post_batch(vec![valid, unbalanced, duplicate]).await;

    assert_eq!(results.len(), 3, "positional length must match input");

    // slot 0: valid — must succeed
    assert!(
        results[0].is_ok(),
        "slot 0 (valid) should be Ok; got {:?}",
        results[0]
    );

    // slot 1: unbalanced — must be Err(Unbalanced)
    assert!(
        matches!(&results[1], Err(ApiError::Unbalanced { .. })),
        "slot 1 (unbalanced) should be Err(Unbalanced); got {:?}",
        results[1]
    );

    // slot 2: duplicate idem key — must succeed and be flagged deduplicated
    let dedup = results[2]
        .as_ref()
        .expect("slot 2 (duplicate) should be Ok");
    assert!(
        dedup.deduplicated,
        "slot 2 (duplicate idem key) should have deduplicated: true"
    );
    // tx_id must match slot 0's tx_id (same underlying transaction)
    let orig = results[0].as_ref().unwrap();
    assert_eq!(
        dedup.tx_id, orig.tx_id,
        "slot 2 dedup tx_id must equal slot 0 tx_id"
    );

    // empty batch → empty result, no panic
    let empty = api.post_batch(vec![]).await;
    assert!(empty.is_empty(), "empty batch must return empty Vec");
}

#[tokio::test]
async fn in_process_service() {
    let pool = SqlitePoolOptions::new()
        .max_connections(1)
        .connect("sqlite::memory:")
        .await
        .unwrap();
    let store = SqliteTaleaStore::new(pool);
    store.migrate().await.unwrap();
    let service = LedgerService::new(Arc::new(store));
    exercise(&service).await;
}

#[tokio::test]
async fn remote_client() {
    let url = harness::spawn_server(None).await;
    let client = TaleaClient::builder(&url).build().unwrap();
    exercise(&client).await;
}

#[tokio::test]
async fn in_process_service_batch() {
    let pool = SqlitePoolOptions::new()
        .max_connections(1)
        .connect("sqlite::memory:")
        .await
        .unwrap();
    let store = SqliteTaleaStore::new(pool);
    store.migrate().await.unwrap();
    let service = LedgerService::new(Arc::new(store));
    exercise_batch(&service).await;
}

#[tokio::test]
async fn remote_client_batch() {
    let url = harness::spawn_server(None).await;
    let client = TaleaClient::builder(&url).build().unwrap();
    exercise_batch(&client).await;
}
