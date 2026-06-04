use sqlx::sqlite::SqlitePoolOptions;
use talea_store_conformance as conformance;
use talea_store_sqlite::SqliteTaleaStore;

/// One connection, so every handle sees the same in-memory database
/// (each :memory: connection is otherwise a separate database).
async fn store() -> SqliteTaleaStore {
    let pool = SqlitePoolOptions::new()
        .max_connections(1)
        .connect("sqlite::memory:")
        .await
        .unwrap();
    let store = SqliteTaleaStore::new(pool);
    store.migrate().await.unwrap();
    store
}

macro_rules! sqlite_test {
    ($name:ident) => {
        #[tokio::test]
        async fn $name() {
            conformance::$name(&store().await).await;
        }
    };
}

sqlite_test!(registry_is_idempotent);
sqlite_test!(unknown_asset_rejected);
