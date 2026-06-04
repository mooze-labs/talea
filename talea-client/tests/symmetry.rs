//! One generic exercise over the LedgerApi trait, run against BOTH the
//! in-process LedgerService and the remote TaleaClient — proving consumers
//! can swap them freely.

mod harness;

use std::sync::Arc;

use sqlx::sqlite::SqlitePoolOptions;
use talea_client::*;
use talea_core::types::Direction;
use talea_server::service::LedgerService;
use talea_store_sqlite::SqliteTaleaStore;

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
                    amount: WireAmount { minor: 500, asset: "USD".into() },
                    direction: Direction::Credit,
                },
                PostingDraft {
                    account: "cash".into(),
                    amount: WireAmount { minor: 500, asset: "USD".into() },
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
