// Test code: a panicking unwrap/expect IS the test failing (clippy.toml
// exempts #[test] fns; this extends that to integration-test helpers).
#![allow(clippy::unwrap_used, clippy::expect_used)]

//! Spawns the REAL talea-server router over in-memory SQLite on an
//! ephemeral port. No mocks: every client test exercises the full loop.

// Each integration-test binary compiles this module but uses only some helpers.
#![allow(dead_code)]

use std::net::SocketAddr;
use std::sync::Arc;

use sqlx::sqlite::SqlitePoolOptions;
use talea_server::http::auth::AuthConfig;
use talea_server::http::routes::router;
use talea_server::service::LedgerService;
use talea_store_sqlite::SqliteTaleaStore;

/// Spawns the REAL talea-server router over Postgres on an ephemeral port,
/// with its own connection pool — one call per "instance"; two calls give
/// two instances sharing one database. Migrations run before the server
/// starts. Same teardown model as `spawn_server`.
///
/// The pool rides the same teardown: when the test runtime drops the serve
/// task, the service and its PgPool drop, closing the PG connections.
pub async fn spawn_pg_server(pg_url: &str) -> String {
    let pool = sqlx::postgres::PgPoolOptions::new()
        .max_connections(4)
        .connect(pg_url)
        .await
        .unwrap();
    let store = talea_store_postgres::PgTaleaStore::new(pool);
    store.migrate().await.unwrap();
    let service = Arc::new(LedgerService::new(Arc::new(store)));
    let app = router(service, AuthConfig::open(), 256, "postgres");

    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let addr: SocketAddr = listener.local_addr().unwrap();
    tokio::spawn(async move {
        axum::serve(listener, app).await.ok();
    });
    format!("http://{addr}")
}

pub async fn spawn_server(token: Option<&str>) -> String {
    let pool = SqlitePoolOptions::new()
        .max_connections(1)
        .connect("sqlite::memory:")
        .await
        .unwrap();
    let store = SqliteTaleaStore::new(pool);
    store.migrate().await.unwrap();
    let service = Arc::new(LedgerService::new(Arc::new(store)));
    let app = router(
        service,
        AuthConfig::single(token.map(String::from)),
        256,
        "sqlite",
    );

    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let addr: SocketAddr = listener.local_addr().unwrap();
    // deliberately not joined/aborted: each #[tokio::test] runtime drops its
    // spawned tasks on teardown, taking the server and its port with it
    tokio::spawn(async move {
        axum::serve(listener, app).await.ok();
    });
    format!("http://{addr}")
}
