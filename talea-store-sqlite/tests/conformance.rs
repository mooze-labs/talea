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
sqlite_test!(crypto_asset_round_trips);
sqlite_test!(unknown_asset_rejected);
sqlite_test!(commit_happy_path);
sqlite_test!(unknown_account_rejected);
sqlite_test!(asset_mismatch_rejected);
sqlite_test!(seq_is_per_book_and_gapless);
sqlite_test!(commit_is_idempotent);
sqlite_test!(concurrent_same_key_commits_once);
sqlite_test!(min_balance_blocks_overdraft);
sqlite_test!(min_balance_is_normal_side_adjusted);
sqlite_test!(balance_as_of_point_in_time);
sqlite_test!(read_events_paginates_inclusively);
sqlite_test!(system_book_is_reserved);
sqlite_test!(subscribe_catches_up_then_tails);
