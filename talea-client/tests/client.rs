mod harness;

use talea_client::*;
use talea_core::types::Direction;

fn usd() -> AssetDraft {
    AssetDraft {
        id: "USD".into(),
        class: "fiat".into(),
        network: None,
        native_id: None,
        precision: 2,
        name: "US Dollar".into(),
    }
}

fn account(path: &str, kind: &str, side: Direction) -> AccountDraft {
    AccountDraft {
        book: "onramp".into(),
        path: path.into(),
        asset: "USD".into(),
        kind: kind.into(),
        normal_side: Some(side),
        min_balance: None,
    }
}

fn transfer(idem: &str, minor: i64) -> TransactionDraft {
    TransactionDraft {
        book: "onramp".into(),
        idempotency_key: idem.into(),
        postings: vec![
            PostingDraft {
                account: "deposits".into(),
                amount: WireAmount { minor, asset: "USD".into() },
                direction: Direction::Credit,
            },
            PostingDraft {
                account: "cash".into(),
                amount: WireAmount { minor, asset: "USD".into() },
                direction: Direction::Debit,
            },
        ],
        external_refs: vec![],
        metadata: serde_json::json!({}),
        occurred_at: None,
    }
}

async fn ready_client(url: &str) -> TaleaClient {
    let client = TaleaClient::builder(url).build().unwrap();
    client.register_asset(usd()).await.unwrap();
    client.open_account(account("cash", "asset", Direction::Debit)).await.unwrap();
    client.open_account(account("deposits", "liability", Direction::Credit)).await.unwrap();
    client
}

#[tokio::test]
async fn full_ledger_round_trip() {
    let url = harness::spawn_server(None).await;
    let client = ready_client(&url).await;

    let posted = client.post(transfer("t1", 1000)).await.unwrap();
    assert_eq!(posted.seq, 3);
    assert!(!posted.deduplicated);

    let replay = client.post(transfer("t1", 1000)).await.unwrap();
    assert!(replay.deduplicated);
    assert_eq!(replay.tx_id, posted.tx_id);

    let bal = client.balance("onramp", "cash", None).await.unwrap();
    assert_eq!(bal.balance, "10.00");
    assert_eq!(bal.updated_seq, 3);

    let page = client
        .account_history("onramp", "cash", Page { after_seq: None, limit: 10 })
        .await
        .unwrap();
    assert_eq!(page.items.len(), 1);
    assert_eq!(page.items[0].amount.minor, 1000);

    let view = client.transaction(&posted.tx_id).await.unwrap();
    assert_eq!(view.book, "onramp");
    assert_eq!(view.postings.len(), 2);

    let tb = client.trial_balance("onramp", None).await.unwrap();
    assert_eq!(tb.lines.len(), 1);
    assert_eq!((tb.lines[0].debits, tb.lines[0].credits), (1000, 1000));
}

#[tokio::test]
async fn domain_errors_decode_through_the_wire() {
    let url = harness::spawn_server(None).await;
    let client = ready_client(&url).await;

    // unbalanced -> Unbalanced with fields intact
    let mut bad = transfer("e1", 1000);
    bad.postings[1].amount.minor = 900;
    match client.post(bad).await {
        Err(ApiError::Unbalanced { debit, credit, .. }) => assert_eq!((debit, credit), (900, 1000)),
        other => panic!("expected Unbalanced, got {other:?}"),
    }

    // unknown account -> UnknownAccount
    assert!(matches!(
        client.balance("onramp", "ghost", None).await,
        Err(ApiError::UnknownAccount { .. })
    ));

    // unknown tx -> NotFound
    let missing = uuid_like();
    assert!(matches!(
        client.transaction(&missing).await,
        Err(ApiError::NotFound { .. })
    ));

    // conflicting re-registration -> AlreadyExists
    let mut conflict = usd();
    conflict.precision = 8;
    assert!(matches!(
        client.register_asset(conflict).await,
        Err(ApiError::AlreadyExists { .. })
    ));
}

/// v7-shaped uuid without pulling the uuid crate into dev-deps.
fn uuid_like() -> String {
    "019e0000-0000-7000-8000-000000000000".to_string()
}

#[tokio::test]
async fn subscribe_catches_up_then_tails() {
    use futures::StreamExt;
    use std::time::Duration;

    let url = harness::spawn_server(None).await;
    let client = ready_client(&url).await;
    client.post(transfer("s1", 100)).await.unwrap();

    // from = 3 (trait semantics: first seq delivered) skips the two
    // account_opened events; seq 3 already exists (catch-up path)
    let mut stream = client.subscribe("onramp", 3).await.unwrap();
    let first = tokio::time::timeout(Duration::from_secs(5), stream.next())
        .await
        .expect("timed out on catch-up")
        .expect("stream ended")
        .unwrap();
    assert_eq!(first.seq, 3);
    assert_eq!(first.kind, "transaction_posted");

    // a commit made while subscribed arrives live
    client.post(transfer("s2", 50)).await.unwrap();
    let second = tokio::time::timeout(Duration::from_secs(5), stream.next())
        .await
        .expect("timed out on live event")
        .expect("stream ended")
        .unwrap();
    assert_eq!(second.seq, 4);
}

#[tokio::test]
async fn bearer_auth_round_trip() {
    let url = harness::spawn_server(Some("sekrit")).await;

    // no token -> Unauthorized
    let anon = TaleaClient::builder(&url).build().unwrap();
    assert!(matches!(anon.register_asset(usd()).await, Err(ApiError::Unauthorized)));

    // with token -> works
    let auth = TaleaClient::builder(&url).bearer_token("sekrit").build().unwrap();
    auth.register_asset(usd()).await.unwrap();
}

#[tokio::test]
async fn connection_refused_is_transport() {
    // nothing listens on this port
    let client = TaleaClient::builder("http://127.0.0.1:9")
        .retry(RetryPolicy::none())
        .build()
        .unwrap();
    assert!(matches!(
        client.register_asset(usd()).await,
        Err(ApiError::Transport { .. })
    ));
}
