// Test code: a panicking unwrap/expect IS the test failing (clippy.toml
// exempts #[test] fns; this extends that to integration-test helpers).
#![allow(clippy::unwrap_used, clippy::expect_used)]

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
sqlite_test!(asset_lookup);
sqlite_test!(balance_snapshot_updated_seq);
sqlite_test!(account_history_pages_exclusively);
sqlite_test!(account_history_never_splits_a_transaction);
sqlite_test!(transaction_round_trip);
sqlite_test!(trial_balance_sums_per_asset);
sqlite_test!(commit_batch_all_succeed);
sqlite_test!(commit_batch_isolates_failures_and_stays_gapless);
sqlite_test!(commit_batch_dedups_within_batch);
sqlite_test!(commit_batch_dedups_against_prior_commit);
sqlite_test!(commit_batch_rejects_reserved_book);
sqlite_test!(commit_batch_empty_returns_empty);
sqlite_test!(commit_batch_min_balance_checks_run_sequentially);
sqlite_test!(committed_at_is_monotonic_per_book);

/// The in-memory single-connection harness above cannot produce
/// write-write contention (the pool serializes everything). This variant
/// runs the production pool shape — file-backed WAL, multiple
/// connections, busy_timeout — where cross-book writers genuinely race.
/// Regression test for SQLITE_BUSY/BUSY_SNAPSHOT escaping as commit
/// errors when write transactions began deferred.
#[tokio::test]
async fn concurrent_cross_book_commits_all_succeed_on_a_real_pool() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("contention.db");
    let store = SqliteTaleaStore::connect(&format!("sqlite://{}", path.display()))
        .await
        .unwrap();
    conformance::concurrent_cross_book_commits_all_succeed(&store).await;
}
