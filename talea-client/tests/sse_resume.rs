//! Pins the cursor-resume contract: a router that serves two events then
//! closes; on reconnect it reads Last-Event-ID and serves the next two.

use std::net::SocketAddr;
use std::time::Duration;

use axum::http::{HeaderMap, header};
use futures::StreamExt;
use talea_client::*;
use talea_core::types::Seq;

async fn spawn_chunked_sse() -> String {
    let app = axum::Router::new().route(
        "/v1/books/{book}/events",
        axum::routing::get(|headers: HeaderMap| async move {
            let resume_from: Seq = headers
                .get("last-event-id")
                .and_then(|v| v.to_str().ok())
                .and_then(|v| v.parse().ok())
                .unwrap_or(0);
            let mut body = String::new();
            for seq in (resume_from + 1)..=(resume_from + 2) {
                let env = serde_json::json!({
                    "seq": seq,
                    "at": "2026-06-04T00:00:00Z",
                    "kind": "transaction_posted",
                    "payload": {}
                });
                body.push_str(&format!("id: {seq}\ndata: {env}\n\n"));
            }
            // returning a complete body closes the connection after sending,
            // forcing the client to reconnect for more
            ([(header::CONTENT_TYPE, "text/event-stream")], body)
        }),
    );
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let addr: SocketAddr = listener.local_addr().unwrap();
    tokio::spawn(async move {
        axum::serve(listener, app).await.ok();
    });
    format!("http://{addr}")
}

#[tokio::test]
async fn resumes_with_cursor_across_disconnects() {
    let url = spawn_chunked_sse().await;
    let client = TaleaClient::builder(&url)
        .retry(RetryPolicy {
            max_attempts: 10,
            base_delay: Duration::from_millis(5),
            max_delay: Duration::from_millis(20),
        })
        .build()
        .unwrap();

    let mut stream = client.subscribe("b", 1).await.unwrap();
    let mut seqs = Vec::new();
    for _ in 0..4 {
        let env = tokio::time::timeout(Duration::from_secs(5), stream.next())
            .await
            .expect("timed out")
            .expect("stream ended early")
            .unwrap();
        seqs.push(env.seq);
    }
    // events 1,2 from the first connection; 3,4 after an automatic
    // reconnect carrying Last-Event-ID: 2
    assert_eq!(seqs, vec![1, 2, 3, 4]);
}
