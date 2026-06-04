//! Spawns the REAL talea-server router over in-memory SQLite on an
//! ephemeral port — the same pattern as talea-client's test harness,
//! with a configurable admission limit for the overload smoke test.

use std::net::SocketAddr;
use std::sync::Arc;

use sqlx::sqlite::SqlitePoolOptions;
use talea_server::http::auth::AuthConfig;
use talea_server::http::routes::router;
use talea_server::service::LedgerService;
use talea_store_sqlite::SqliteTaleaStore;

pub async fn spawn_server(max_inflight: usize) -> String {
    let pool = SqlitePoolOptions::new()
        .max_connections(1)
        .connect("sqlite::memory:")
        .await
        .unwrap();
    let store = SqliteTaleaStore::new(pool);
    store.migrate().await.unwrap();
    let service = Arc::new(LedgerService::new(Arc::new(store)));
    let app = router(service, AuthConfig { token: None }, max_inflight);

    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let addr: SocketAddr = listener.local_addr().unwrap();
    // deliberately not joined/aborted: each #[tokio::test] runtime drops its
    // spawned tasks on teardown, taking the server and its port with it
    tokio::spawn(async move {
        axum::serve(listener, app).await.ok();
    });
    format!("http://{addr}")
}
