//! Retry behavior against a hand-rolled router that fails N times then
//! succeeds. Fault injection the real server can't provide on demand.

use std::net::SocketAddr;
use std::sync::Arc;
use std::sync::atomic::{AtomicU32, Ordering};
use std::time::Duration;

use axum::http::{StatusCode, header};
use axum::response::IntoResponse;
use talea_client::*;

async fn spawn_flaky(fail_n: u32) -> (String, Arc<AtomicU32>) {
    spawn_flaky_status(StatusCode::SERVICE_UNAVAILABLE, fail_n).await
}

async fn spawn_flaky_status(fail_status: StatusCode, fail_n: u32) -> (String, Arc<AtomicU32>) {
    let count = Arc::new(AtomicU32::new(0));
    let counter = count.clone();
    let app = axum::Router::new().route(
        "/v1/assets",
        axum::routing::post(move || {
            let counter = counter.clone();
            async move {
                if counter.fetch_add(1, Ordering::SeqCst) < fail_n {
                    (fail_status, [(header::RETRY_AFTER, "0")], "overloaded").into_response()
                } else {
                    StatusCode::NO_CONTENT.into_response()
                }
            }
        }),
    );
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let addr: SocketAddr = listener.local_addr().unwrap();
    tokio::spawn(async move {
        axum::serve(listener, app).await.ok();
    });
    (format!("http://{addr}"), count)
}

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

fn fast_retry(max_attempts: u32) -> RetryPolicy {
    RetryPolicy {
        max_attempts,
        base_delay: Duration::from_millis(5),
        max_delay: Duration::from_millis(20),
    }
}

#[tokio::test]
async fn retries_503_until_success() {
    let (url, count) = spawn_flaky(2).await;
    let client = TaleaClient::builder(&url)
        .retry(fast_retry(3))
        .build()
        .unwrap();
    client.register_asset(usd()).await.unwrap();
    assert_eq!(count.load(Ordering::SeqCst), 3); // 2 failures + 1 success
}

#[tokio::test]
async fn retries_429_until_success() {
    // 429 backpressure (e.g. DB pool saturation) is retried just like 503,
    // honoring Retry-After. First response fails, second succeeds.
    let (url, count) = spawn_flaky_status(StatusCode::TOO_MANY_REQUESTS, 1).await;
    let client = TaleaClient::builder(&url)
        .retry(fast_retry(3))
        .build()
        .unwrap();
    client.register_asset(usd()).await.unwrap();
    assert_eq!(count.load(Ordering::SeqCst), 2); // 1 failure + 1 success
}

#[tokio::test]
async fn exhausted_budget_surfaces_transport() {
    let (url, count) = spawn_flaky(u32::MAX).await;
    let client = TaleaClient::builder(&url)
        .retry(fast_retry(2))
        .build()
        .unwrap();
    match client.register_asset(usd()).await {
        Err(ApiError::Transport { .. }) => {}
        other => panic!("expected Transport, got {other:?}"),
    }
    assert_eq!(count.load(Ordering::SeqCst), 2); // exactly max_attempts
}

#[tokio::test]
async fn no_retry_policy_fails_immediately() {
    let (url, count) = spawn_flaky(u32::MAX).await;
    let client = TaleaClient::builder(&url)
        .retry(RetryPolicy::none())
        .build()
        .unwrap();
    assert!(client.register_asset(usd()).await.is_err());
    assert_eq!(count.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn non_retryable_statuses_do_not_retry() {
    // a 409 must surface once, untouched by the retry loop
    let count = Arc::new(AtomicU32::new(0));
    let counter = count.clone();
    let app = axum::Router::new().route(
        "/v1/assets",
        axum::routing::post(move || {
            let counter = counter.clone();
            async move {
                counter.fetch_add(1, Ordering::SeqCst);
                (
                    StatusCode::CONFLICT,
                    axum::Json(serde_json::json!({"error":"already_exists","what":"asset USD"})),
                )
            }
        }),
    );
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let addr = listener.local_addr().unwrap();
    tokio::spawn(async move {
        axum::serve(listener, app).await.ok();
    });

    let client = TaleaClient::builder(format!("http://{addr}"))
        .retry(fast_retry(5))
        .build()
        .unwrap();
    assert!(matches!(
        client.register_asset(usd()).await,
        Err(ApiError::AlreadyExists { .. })
    ));
    assert_eq!(count.load(Ordering::SeqCst), 1);
}
