// Test code: a panicking unwrap/expect IS the test failing (clippy.toml
// exempts #[test] fns; this extends that to integration-test helpers).
#![allow(clippy::unwrap_used, clippy::expect_used)]

use talea_store_conformance as conformance;
use talea_store_log::LogTaleaStore;

async fn store() -> (LogTaleaStore, tempfile::TempDir) {
    let dir = tempfile::tempdir().unwrap();
    let store = LogTaleaStore::open(dir.path()).await.unwrap();
    (store, dir) // TempDir must outlive the store
}

macro_rules! log_test {
    ($name:ident) => {
        #[tokio::test]
        async fn $name() {
            let (store, _dir) = store().await;
            conformance::$name(&store).await;
        }
    };
}

log_test!(registry_is_idempotent);
log_test!(crypto_asset_round_trips);
log_test!(unknown_asset_rejected);
log_test!(commit_happy_path);
log_test!(unknown_account_rejected);
log_test!(asset_mismatch_rejected);
log_test!(seq_is_per_book_and_gapless);
log_test!(commit_is_idempotent);
log_test!(concurrent_same_key_commits_once);
log_test!(min_balance_blocks_overdraft);
log_test!(min_balance_is_normal_side_adjusted);
log_test!(balance_as_of_point_in_time);
log_test!(read_events_paginates_inclusively);
log_test!(system_book_is_reserved);
log_test!(subscribe_catches_up_then_tails);
log_test!(asset_lookup);
log_test!(balance_snapshot_updated_seq);
log_test!(account_history_pages_exclusively);
log_test!(account_history_never_splits_a_transaction);
log_test!(transaction_round_trip);
log_test!(trial_balance_sums_per_asset);
log_test!(commit_batch_all_succeed);
log_test!(commit_batch_isolates_failures_and_stays_gapless);
log_test!(commit_batch_dedups_within_batch);
log_test!(commit_batch_dedups_against_prior_commit);
log_test!(commit_batch_rejects_reserved_book);
log_test!(commit_batch_empty_returns_empty);
log_test!(commit_batch_min_balance_checks_run_sequentially);
log_test!(committed_at_is_monotonic_per_book);
