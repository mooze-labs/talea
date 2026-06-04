use sqlx::postgres::PgPoolOptions;
use talea_store_conformance as conformance;
use talea_store_postgres::PgTaleaStore;

/// Returns None (skipping the test) when TALEA_TEST_PG_URL is not set.
/// Example: TALEA_TEST_PG_URL=postgres://localhost/talea_test cargo test -p talea_store_postgres
async fn store() -> Option<PgTaleaStore> {
    let Ok(url) = std::env::var("TALEA_TEST_PG_URL") else {
        eprintln!("TALEA_TEST_PG_URL not set; skipping postgres conformance test");
        return None;
    };
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&url)
        .await
        .expect("failed to connect to TALEA_TEST_PG_URL");
    let store = PgTaleaStore::new(pool);
    store.migrate().await.expect("migration failed");
    Some(store)
}

macro_rules! pg_test {
    ($name:ident) => {
        #[tokio::test]
        async fn $name() {
            let Some(store) = store().await else { return };
            conformance::$name(&store).await;
        }
    };
}

pg_test!(registry_is_idempotent);
pg_test!(crypto_asset_round_trips);
pg_test!(unknown_asset_rejected);
pg_test!(commit_happy_path);
pg_test!(unknown_account_rejected);
pg_test!(asset_mismatch_rejected);
pg_test!(seq_is_per_book_and_gapless);
