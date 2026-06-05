//! End-to-end smoke: every scenario at tiny scale against the real
//! router over in-memory SQLite. Proves the machinery; capacity numbers
//! come from Postgres runs.

mod harness;

use std::time::Duration;

use talea_bench::Ctx;
use talea_bench::progress::Progress;
use talea_bench::scenarios::{mixed, overload, post_many_books, post_one_book, reads};
use talea_bench::workload::MixWeights;

fn smoke_ctx(url: String, run_id: &str) -> Ctx {
    Ctx {
        url,
        token: None,
        run_id: run_id.into(),
        warmup: Duration::ZERO,
        duration: Duration::from_millis(300),
        progress: Progress::hidden(),
    }
}

#[tokio::test]
async fn post_one_book_smoke() {
    let url = harness::spawn_server(256).await;
    let ctx = smoke_ctx(url, "smoke-one");
    let steps = post_one_book::run(
        &ctx,
        post_one_book::Opts {
            concurrencies: vec![2],
            postings_per_tx: 2,
        },
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
        reads::Opts {
            concurrencies: vec![2],
            depth: 50,
            seed_workers: 4,
        },
    )
    .await
    .unwrap();
    assert_eq!(steps.len(), 3); // balance, history, trial-balance
    assert!(steps.iter().all(|s| s.successes > 0));
}

#[tokio::test]
async fn mixed_smoke() {
    let url = harness::spawn_server(256).await;
    let ctx = smoke_ctx(url, "smoke-mixed");
    let steps = mixed::run(
        &ctx,
        mixed::Opts {
            concurrencies: vec![4],
            books: 2,
            sse_subscribers: 1,
            weights: MixWeights {
                post: 60,
                balance: 25,
                history: 10,
                trial: 5,
            },
        },
    )
    .await
    .unwrap();
    // 1 sweep step; the sse-lag pseudo-step is timing-dependent, so
    // accept 1 or 2 steps but require the sweep step to have posts.
    assert!(!steps.is_empty() && steps.len() <= 2);
    assert!(steps[0].latency.contains_key("post"));
    assert!(steps[0].successes > 0);
}

#[tokio::test]
async fn overload_smoke() {
    // Tiny admission limit so 16 workers genuinely overload it.
    let url = harness::spawn_server(4).await;
    let ctx = smoke_ctx(url, "smoke-overload");
    let steps = overload::run(
        &ctx,
        overload::Opts {
            concurrency: 16,
            postings_per_tx: 2,
        },
    )
    .await
    .unwrap();
    assert_eq!(steps.len(), 2); // raw-503 pass + retry-to-success pass
    assert!(steps[1].successes > 0, "retrying pass must land commits");
}

#[tokio::test]
async fn detect_backend_reports_sqlite() {
    let url = harness::spawn_server(256).await;
    assert_eq!(talea_bench::detect_backend(&url).await, "sqlite");
}
