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
pg_test!(commit_is_idempotent);
pg_test!(concurrent_same_key_commits_once);
pg_test!(min_balance_blocks_overdraft);
pg_test!(min_balance_is_normal_side_adjusted);
pg_test!(balance_as_of_point_in_time);
pg_test!(read_events_paginates_inclusively);
pg_test!(system_book_is_reserved);
pg_test!(subscribe_catches_up_then_tails);
pg_test!(asset_lookup);
pg_test!(balance_snapshot_updated_seq);
pg_test!(account_history_pages_exclusively);
pg_test!(account_history_never_splits_a_transaction);
pg_test!(transaction_round_trip);
pg_test!(trial_balance_sums_per_asset);
pg_test!(commit_batch_all_succeed);
pg_test!(commit_batch_isolates_failures_and_stays_gapless);
pg_test!(commit_batch_dedups_within_batch);
pg_test!(commit_batch_dedups_against_prior_commit);
pg_test!(commit_batch_rejects_reserved_book);
pg_test!(commit_batch_empty_returns_empty);
pg_test!(commit_batch_min_balance_checks_run_sequentially);
pg_test!(committed_at_is_monotonic_per_book);
pg_test!(concurrent_cross_book_commits_all_succeed);
