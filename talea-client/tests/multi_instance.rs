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

#[allow(dead_code)] // used by tests added in follow-up commits
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
