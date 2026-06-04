//! End-to-end smoke: every scenario at tiny scale against the real
//! router over in-memory SQLite. Proves the machinery; capacity numbers
//! come from Postgres runs.

mod harness;

use std::time::Duration;

use talea_bench::Ctx;
use talea_bench::scenarios::{post_many_books, post_one_book, reads};

fn smoke_ctx(url: String, run_id: &str) -> Ctx {
    Ctx {
        url,
        token: None,
        run_id: run_id.into(),
        warmup: Duration::ZERO,
        duration: Duration::from_millis(300),
    }
}

#[tokio::test]
async fn post_one_book_smoke() {
    let url = harness::spawn_server(256).await;
    let ctx = smoke_ctx(url, "smoke-one");
    let steps = post_one_book::run(
        &ctx,
        post_one_book::Opts { concurrencies: vec![2], postings_per_tx: 2 },
    )
    .await
    .unwrap();
    assert_eq!(steps.len(), 1);
    assert!(steps[0].successes > 0);
    assert!(steps[0].latency.contains_key("post"));
}

#[tokio::test]
async fn post_many_books_smoke() {
    let url = harness::spawn_server(256).await;
    let ctx = smoke_ctx(url, "smoke-many");
    let steps = post_many_books::run(
        &ctx,
        post_many_books::Opts {
            book_counts: vec![1, 2],
            per_book_concurrency: 2,
            postings_per_tx: 2,
        },
    )
    .await
    .unwrap();
    assert_eq!(steps.len(), 2);
    assert!(steps.iter().all(|s| s.successes > 0));
}

#[tokio::test]
async fn reads_smoke() {
    let url = harness::spawn_server(256).await;
    let ctx = smoke_ctx(url, "smoke-reads");
    let steps = reads::run(
        &ctx,
        reads::Opts { concurrencies: vec![2], depth: 50, seed_workers: 4 },
    )
    .await
    .unwrap();
    assert_eq!(steps.len(), 3); // balance, history, trial-balance
    assert!(steps.iter().all(|s| s.successes > 0));
}
