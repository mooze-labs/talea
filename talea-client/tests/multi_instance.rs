//! Two real server instances sharing one Postgres: the cross-instance
//! correctness contract — gapless seqs, idempotency dedup, LISTEN/NOTIFY
//! fan-out, cursor resume. Skips when TALEA_TEST_PG_URL is unset (same
//! convention as the postgres conformance suite); CI sets it job-wide.

mod harness;

use std::sync::Arc;
use std::time::Duration;

use futures::StreamExt;
use talea_client::*;
use talea_core::types::Direction;

/// Dependency-free unique names so repeated runs share a database safely.
fn unique(prefix: &str) -> String {
    use std::sync::atomic::{AtomicU64, Ordering};
    static N: AtomicU64 = AtomicU64::new(0);
    let nanos = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    format!("{prefix}-{nanos}-{}", N.fetch_add(1, Ordering::Relaxed))
}

fn pg_url() -> Option<String> {
    match std::env::var("TALEA_TEST_PG_URL") {
        Ok(url) => Some(url),
        Err(_) => {
            eprintln!("TALEA_TEST_PG_URL not set; skipping multi-instance test");
            None
        }
    }
}

fn transfer(book: &str, asset_id: &str, idem: &str, minor: i64) -> TransactionDraft {
    TransactionDraft {
        book: book.into(),
        idempotency_key: idem.into(),
        postings: vec![
            PostingDraft {
                account: "deposits".into(),
                amount: WireAmount {
                    minor,
                    asset: asset_id.into(),
                },
                direction: Direction::Credit,
            },
            PostingDraft {
                account: "cash".into(),
                amount: WireAmount {
                    minor,
                    asset: asset_id.into(),
                },
                direction: Direction::Debit,
            },
        ],
        external_refs: vec![],
        metadata: serde_json::json!({}),
        occurred_at: None,
    }
}

/// Two instances over one Postgres, plus a fresh book with cash/deposits
/// opened via instance A (consuming book seqs 1 and 2).
/// Returns (client_a, client_b, book, asset_id); None = skip (no PG).
async fn two_instances() -> Option<(TaleaClient, TaleaClient, String, String)> {
    let url = pg_url()?;
    // No retries: a 503/transport failure under contention is a finding, not noise to absorb.
    let a = TaleaClient::builder(harness::spawn_pg_server(&url).await)
        .retry(RetryPolicy::none())
        .build()
        .unwrap();
    let b = TaleaClient::builder(harness::spawn_pg_server(&url).await)
        .retry(RetryPolicy::none())
        .build()
        .unwrap();

    let book = unique("book");
    let asset_id = unique("USD");
    a.register_asset(AssetDraft {
        id: asset_id.clone(),
        class: "fiat".into(),
        network: None,
        native_id: None,
        precision: 2,
        name: "multi-instance test asset".into(),
    })
    .await
    .unwrap();
    for (path, kind, side) in [
        ("cash", "asset", Direction::Debit),
        ("deposits", "liability", Direction::Credit),
    ] {
        a.open_account(AccountDraft {
            book: book.clone(),
            path: path.into(),
            asset: asset_id.clone(),
            kind: kind.into(),
            normal_side: Some(side),
            min_balance: None,
        })
        .await
        .unwrap();
    }
    Some((a, b, book, asset_id))
}

async fn next_event(stream: &mut EventStream) -> EventEnvelope {
    tokio::time::timeout(Duration::from_secs(10), stream.next())
        .await
        .expect("timed out waiting for event")
        .expect("stream ended unexpectedly")
        .unwrap()
}

#[tokio::test]
async fn concurrent_commits_across_instances_stay_gapless() {
    let Some((a, b, book, asset_id)) = two_instances().await else {
        return;
    };
    let (a, b) = (Arc::new(a), Arc::new(b));

    // 16 commits to ONE book, 8 per instance, all in flight at once —
    // true multi-connection contention on the counter-row lock.
    let mut joins = Vec::new();
    for i in 0..16 {
        let client = if i % 2 == 0 { a.clone() } else { b.clone() };
        let draft = transfer(&book, &asset_id, &format!("gapless-{i}"), 1);
        joins.push(tokio::spawn(
            async move { client.post(draft).await.unwrap() },
        ));
    }
    let mut seqs = Vec::new();
    for j in joins {
        let posted = j.await.unwrap();
        assert!(!posted.deduplicated, "distinct keys must never dedup");
        seqs.push(posted.seq);
    }
    seqs.sort_unstable();
    // setup consumed seqs 1-2; the 16 commits must be exactly 3..=18:
    // dense, no gaps, no duplicates, regardless of which instance won which.
    assert_eq!(seqs, (3..=18).collect::<Vec<_>>());
}

#[tokio::test]
async fn idempotency_dedups_across_instances() {
    let Some((a, b, book, asset_id)) = two_instances().await else {
        return;
    };

    // sequential: same key via A then B returns the identical commit
    let first = a
        .post(transfer(&book, &asset_id, "dup", 500))
        .await
        .unwrap();
    let second = b
        .post(transfer(&book, &asset_id, "dup", 500))
        .await
        .unwrap();
    assert!(!first.deduplicated);
    assert!(second.deduplicated);
    assert_eq!(first.tx_id, second.tx_id);
    assert_eq!(first.seq, second.seq);
    assert_eq!(first.at, second.at); // µs round-trip: byte-identical timestamps

    // concurrent: same key racing through BOTH instances — a true
    // multi-connection race on the (book, idempotency_key) unique index,
    // exercising the unique-violation recovery path across pools.
    let (x, y) = tokio::join!(
        a.post(transfer(&book, &asset_id, "race", 250)),
        b.post(transfer(&book, &asset_id, "race", 250)),
    );
    let (x, y) = (x.unwrap(), y.unwrap());
    assert_eq!(x.tx_id, y.tx_id);
    assert_eq!(x.seq, y.seq);

    // posted exactly once each: 500 + 250 minor at precision 2
    let bal = a.balance(&book, "cash", None).await.unwrap();
    assert_eq!(bal.balance, "7.50");
}

#[tokio::test]
async fn subscriber_on_a_sees_commits_via_b() {
    let Some((a, b, book, asset_id)) = two_instances().await else {
        return;
    };
    // from=3 skips the two setup events. Race-free by design: if the commit
    // lands before the subscription is established, catch-up reads it from
    // the log; if after, LISTEN/NOTIFY delivers the wake-up across pools.
    let mut stream = a.subscribe(&book, 3).await.unwrap();
    let posted = b
        .post(transfer(&book, &asset_id, "via-b", 100))
        .await
        .unwrap();
    let env = next_event(&mut stream).await;
    assert_eq!(env.seq, posted.seq);
    assert_eq!(env.kind, "transaction_posted");
}

#[tokio::test]
async fn client_resumes_cursor_across_instances() {
    let Some((a, b, book, asset_id)) = two_instances().await else {
        return;
    };
    for i in 0..3 {
        a.post(transfer(&book, &asset_id, &format!("pre-{i}"), 10))
            .await
            .unwrap();
    }

    // consume everything so far via A: 2 setup events + 3 commits
    let mut stream_a = a.subscribe(&book, 1).await.unwrap();
    let mut cursor = 0;
    for _ in 0..5 {
        cursor = next_event(&mut stream_a).await.seq;
    }
    assert_eq!(cursor, 5);
    drop(stream_a); // "instance A goes away"

    // more commits land via B while we are disconnected
    for i in 0..3 {
        b.post(transfer(&book, &asset_id, &format!("post-{i}"), 10))
            .await
            .unwrap();
    }

    // resume on B from cursor+1: continuity — no gaps, no replays
    let mut stream_b = b.subscribe(&book, cursor + 1).await.unwrap();
    let mut seqs = Vec::new();
    for _ in 0..3 {
        seqs.push(next_event(&mut stream_b).await.seq);
    }
    assert_eq!(seqs, vec![6, 7, 8]);
}
