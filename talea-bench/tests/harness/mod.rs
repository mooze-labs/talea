//! Spawns the REAL talea-server router over a temporary FILE-backed SQLite
//! database on an ephemeral port.
//!
//! # Why not `sqlite::memory:` with `max_connections(1)`?
//!
//! sqlx 0.9 assigns a unique sequential name to every `:memory:` URL
//! (`file:sqlx-in-memory-<N>`).  A named shared-cache in-memory database
//! lives only as long as at least one connection to it is open.  When the
//! async SSE subscriber task is aborted mid-query, its `PoolConnection` guard
//! is dropped.  sqlx spawns a `return_to_pool` background task that calls
//! `ping()` on the interrupted connection.  If the ping fails (connection
//! left in inconsistent state after the mid-query cancel), sqlx permanently
//! closes the connection and opens a fresh one — but the fresh one increments
//! the global counter, landing on `file:sqlx-in-memory-<N+1>`: a completely
//! empty, unmigratable database.  Any subsequent query fails with
//! "no such table" → `StoreError::Io` → `Internal { message: "storage backend
//! error" }`.  This is the observed ~13 % flake in `mixed_smoke`.
//!
//! A temp-file-backed database survives connection drops: the schema and all
//! data persist on disk, so a recycled or freshly opened pool connection
//! always sees the full ledger.  WAL mode + `busy_timeout(5 s)` mirrors the
//! production `talead serve` configuration (see `talea-server/src/run.rs`).
//!
//! # Why `max_connections(1)` and not a larger pool?
//!
//! SQLite WAL mode allows concurrent readers but only one writer at a time.
//! When multiple write transactions run concurrently (each behind its own
//! pool connection), a later transaction can encounter `SQLITE_BUSY_SNAPSHOT`
//! when it tries to commit: its read snapshot is stale because another writer
//! committed in the meantime.  Unlike plain `SQLITE_BUSY`, busy-timeout does
//! NOT retry `SQLITE_BUSY_SNAPSHOT`, so the write immediately fails.  Keeping
//! `max_connections(1)` serializes all DB operations through a single
//! connection — identical to the original harness — but the FILE backing
//! ensures a recycled connection re-opens the same schema instead of a fresh
//! empty database.

use std::net::SocketAddr;
use std::sync::Arc;
use std::time::Duration;

use sqlx::sqlite::{SqliteConnectOptions, SqliteJournalMode, SqlitePoolOptions};
use talea_server::http::auth::AuthConfig;
use talea_server::http::routes::router;
use talea_server::service::LedgerService;
use talea_store_sqlite::SqliteTaleaStore;

pub async fn spawn_server(max_inflight: usize) -> String {
    // Keep the NamedTempFile alive for the duration of the server by moving it
    // into the spawned task.  When the tokio test runtime drops all its tasks
    // on teardown the file is deleted along with the server.
    let db_file = tempfile::NamedTempFile::new().expect("temp db file");
    let db_path = db_file.path().to_owned();

    // Mirror the production SQLite configuration from talea-server/src/run.rs:
    // WAL journal mode, 5-second busy timeout, and foreign-key enforcement.
    // max_connections(1) keeps all DB operations serialized so that concurrent
    // write transactions never collide on SQLITE_BUSY_SNAPSHOT (see module doc).
    let opts = SqliteConnectOptions::new()
        .filename(&db_path)
        .create_if_missing(true)
        .journal_mode(SqliteJournalMode::Wal)
        .busy_timeout(Duration::from_secs(5))
        .foreign_keys(true);

    let pool = SqlitePoolOptions::new()
        .max_connections(1)
        .connect_with(opts)
        .await
        .unwrap();

    let store = SqliteTaleaStore::new(pool);
    store.migrate().await.unwrap();
    let service = Arc::new(LedgerService::new(Arc::new(store)));
    let app = router(service, AuthConfig { token: None }, max_inflight, "sqlite");

    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let addr: SocketAddr = listener.local_addr().unwrap();
    // deliberately not joined/aborted: each #[tokio::test] runtime drops its
    // spawned tasks on teardown, taking the server and its port with it.
    // db_file is moved in so the temp file lives exactly as long as the task.
    tokio::spawn(async move {
        let _db_file = db_file;
        axum::serve(listener, app).await.ok();
    });
    format!("http://{addr}")
}
