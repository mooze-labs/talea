//! Path-selection tests for the set-based commit_batch fast path.
//! Gated on TALEA_TEST_PG_URL like the conformance run.

use sqlx::postgres::PgPoolOptions;
use talea_core::store::Store;
use talea_store_conformance as conformance;
use talea_store_postgres::{BatchPath, PgTaleaStore};

async fn store() -> Option<PgTaleaStore> {
    let Ok(url) = std::env::var("TALEA_TEST_PG_URL") else {
        eprintln!("TALEA_TEST_PG_URL not set; skipping fast-path test");
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

#[tokio::test]
async fn clean_batch_takes_fast_path() {
    let Some(store) = store().await else { return };
    let (book, asset_id) = conformance::setup_book(&store).await;
    let txs: Vec<_> = (0..3)
        .map(|i| {
            conformance::transfer(
                &book,
                &format!("fp-{i}"),
                "deposits",
                "cash",
                &asset_id,
                100,
            )
        })
        .collect();
    let (path, results) = store.commit_batch_traced(&txs).await;
    assert_eq!(path, BatchPath::Fast);
    let seqs: Vec<i64> = results
        .iter()
        .map(|r| r.as_ref().expect("clean batch commits").seq)
        .collect();
    assert_eq!(seqs, vec![3, 4, 5]); // 2 AccountOpened events hold 1-2
    let ats: Vec<_> = results.iter().map(|r| r.as_ref().unwrap().at).collect();
    assert!(ats.windows(2).all(|w| w[0] <= w[1]));
}

#[tokio::test]
async fn in_batch_duplicate_stays_fast_and_dedups() {
    let Some(store) = store().await else { return };
    let (book, asset_id) = conformance::setup_book(&store).await;
    let first = conformance::transfer(&book, "fp-dup", "deposits", "cash", &asset_id, 100);
    let mut second = first.clone();
    second.id = talea_core::types::TxId(uuid::Uuid::now_v7());
    let (path, results) = store.commit_batch_traced(&[first, second]).await;
    assert_eq!(path, BatchPath::Fast);
    let a = results[0].as_ref().unwrap();
    let b = results[1].as_ref().unwrap();
    assert_eq!(a.seq, b.seq);
    assert_eq!(a.txid, b.txid); // dedup returns the winner's identity
}

#[tokio::test]
async fn prior_commit_duplicate_stays_fast() {
    let Some(store) = store().await else { return };
    let (book, asset_id) = conformance::setup_book(&store).await;
    let tx = conformance::transfer(&book, "fp-prior", "deposits", "cash", &asset_id, 100);
    let prior = store.commit(&tx).await.unwrap();
    let (path, results) = store.commit_batch_traced(&[tx]).await;
    assert_eq!(path, BatchPath::Fast);
    assert_eq!(results[0].as_ref().unwrap().seq, prior.seq);
}

#[tokio::test]
async fn min_balance_violation_falls_back_with_sequential_semantics() {
    let Some(store) = store().await else { return };
    use talea_core::store::StoreError;
    use talea_core::types::AccountKind;
    let book = conformance::unique("book");
    let asset_id = conformance::unique("USD");
    store
        .register_asset(&conformance::asset(&asset_id))
        .await
        .unwrap();
    let (cash_def, mut cash_cfg) =
        conformance::open_spec(&book, "cash", &asset_id, AccountKind::Asset);
    cash_cfg.min_balance = Some(0);
    store.open_account(&cash_def, &cash_cfg).await.unwrap();
    let (exp_def, exp_cfg) =
        conformance::open_spec(&book, "expenses", &asset_id, AccountKind::Expense);
    store.open_account(&exp_def, &exp_cfg).await.unwrap();
    let (dep_def, dep_cfg) =
        conformance::open_spec(&book, "deposits", &asset_id, AccountKind::Liability);
    store.open_account(&dep_def, &dep_cfg).await.unwrap();

    let overdraft = conformance::transfer(&book, "fb-od", "cash", "expenses", &asset_id, 100);
    let cover = conformance::transfer(&book, "fb-cover", "deposits", "cash", &asset_id, 500);
    let (path, results) = store.commit_batch_traced(&[overdraft, cover]).await;
    assert_eq!(path, BatchPath::Fallback);
    assert!(matches!(
        results[0],
        Err(StoreError::ConstraintViolation { .. })
    ));
    assert!(results[1].is_ok());
}

#[tokio::test]
async fn unknown_account_falls_back() {
    let Some(store) = store().await else { return };
    let (book, asset_id) = conformance::setup_book(&store).await;
    let good = conformance::transfer(&book, "fb-good", "deposits", "cash", &asset_id, 100);
    let bad = conformance::transfer(&book, "fb-bad", "deposits", "ghost", &asset_id, 100);
    let (path, results) = store.commit_batch_traced(&[good, bad]).await;
    assert_eq!(path, BatchPath::Fallback);
    assert!(results[0].is_ok());
    use talea_core::store::StoreError;
    assert!(matches!(results[1], Err(StoreError::UnknownAccount(_))));
}
