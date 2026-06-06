// Test code: a panicking unwrap/expect IS the test failing (clippy.toml
// exempts #[test] fns; this extends that to integration-test helpers).
#![allow(clippy::unwrap_used, clippy::expect_used)]

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
    let first_id = first.id.clone();
    let mut second = first.clone();
    second.id = talea_core::types::TxId(uuid::Uuid::now_v7());
    let (path, results) = store.commit_batch_traced(&[first, second]).await;
    assert_eq!(path, BatchPath::Fast);
    let a = results[0].as_ref().unwrap();
    let b = results[1].as_ref().unwrap();
    assert_eq!(a.seq, b.seq);
    assert_eq!(a.txid, b.txid); // dedup returns the winner's identity
    assert_eq!(a.txid, first_id); // the FIRST draft is the winner
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
async fn multi_book_batch_falls_back() {
    let Some(store) = store().await else { return };
    let (book_a, asset_a) = conformance::setup_book(&store).await;
    let (book_b, asset_b) = conformance::setup_book(&store).await;
    let a = conformance::transfer(&book_a, "mb-a", "deposits", "cash", &asset_a, 100);
    let b = conformance::transfer(&book_b, "mb-b", "deposits", "cash", &asset_b, 100);
    let (path, results) = store.commit_batch_traced(&[a, b]).await;
    assert_eq!(path, BatchPath::Fallback);
    assert!(results[0].is_ok());
    assert!(results[1].is_ok());
}

#[tokio::test]
async fn exact_min_balance_boundary_stays_fast() {
    let Some(store) = store().await else { return };
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
    let (dep_def, dep_cfg) =
        conformance::open_spec(&book, "deposits", &asset_id, AccountKind::Liability);
    store.open_account(&dep_def, &dep_cfg).await.unwrap();
    let (exp_def, exp_cfg) =
        conformance::open_spec(&book, "expenses", &asset_id, AccountKind::Expense);
    store.open_account(&exp_def, &exp_cfg).await.unwrap();

    // fund 100, then spend exactly 100: cash lands exactly at min (0)
    let fund = conformance::transfer(&book, "bd-fund", "deposits", "cash", &asset_id, 100);
    let spend = conformance::transfer(&book, "bd-spend", "cash", "expenses", &asset_id, 100);
    let (path, results) = store.commit_batch_traced(&[fund, spend]).await;
    assert_eq!(path, BatchPath::Fast);
    assert!(results[0].is_ok() && results[1].is_ok());
}

#[tokio::test]
async fn touched_only_by_non_final_draft_records_that_drafts_seq() {
    // P0 regression: an account touched ONLY by a non-final draft of a
    // fast-path batch must report THAT draft's seq as updated_seq, not the
    // batch-max seq. The reference per-draft path binds the per-draft seq;
    // the fast path must agree.
    let Some(store) = store().await else { return };
    use talea_core::types::AccountKind;
    let (book, asset_id) = conformance::setup_book(&store).await;
    // setup_book opened cash + deposits (seqs 1,2). Add an expenses account.
    let (exp_def, exp_cfg) =
        conformance::open_spec(&book, "expenses", &asset_id, AccountKind::Expense);
    store.open_account(&exp_def, &exp_cfg).await.unwrap();

    // Draft 0 touches expenses (+cash); drafts 1,2 touch only cash/deposits.
    let d0 = conformance::transfer(&book, "us-0", "cash", "expenses", &asset_id, 30);
    let d1 = conformance::transfer(&book, "us-1", "deposits", "cash", &asset_id, 100);
    let d2 = conformance::transfer(&book, "us-2", "deposits", "cash", &asset_id, 100);
    let (path, results) = store.commit_batch_traced(&[d0, d1, d2]).await;
    assert_eq!(path, BatchPath::Fast);
    let seqs: Vec<i64> = results
        .iter()
        .map(|r| r.as_ref().expect("clean batch commits").seq)
        .collect();
    // 3 account-opened events (cash, deposits, expenses) hold seqs 1-3.
    assert_eq!(seqs, vec![4, 5, 6]);

    let exp = store
        .balance(&conformance::account_id(&book, "expenses"), None)
        .await
        .unwrap();
    // expenses was touched ONLY by draft 0 (seq 4); NOT the batch max (6).
    assert_eq!(
        exp.updated_seq, 4,
        "expenses.updated_seq must be the touching draft's seq, not the batch max"
    );
}

#[tokio::test]
async fn asset_mismatch_falls_back() {
    let Some(store) = store().await else { return };
    use talea_core::store::StoreError;
    let (book, asset_id) = conformance::setup_book(&store).await;
    let other = conformance::unique("EUR");
    store
        .register_asset(&conformance::asset(&other))
        .await
        .unwrap();
    let good = conformance::transfer(&book, "am-good", "deposits", "cash", &asset_id, 100);
    let bad = conformance::transfer(&book, "am-bad", "deposits", "cash", &other, 100);
    let (path, results) = store.commit_batch_traced(&[good, bad]).await;
    assert_eq!(path, BatchPath::Fallback);
    assert!(results[0].is_ok());
    assert!(matches!(results[1], Err(StoreError::AssetMismatch { .. })));
}

#[tokio::test]
async fn reserved_book_falls_back() {
    let Some(store) = store().await else { return };
    use talea_core::store::StoreError;
    // A single-draft batch on a reserved book (name starts with '_'). The
    // fast path's eligibility gate rejects reserved books, so the fallback
    // per-draft path runs and surfaces InvalidBook.
    let tx = conformance::transfer("_system", "rb-0", "deposits", "cash", "USD", 100);
    let (path, results) = store.commit_batch_traced(&[tx]).await;
    assert_eq!(path, BatchPath::Fallback);
    assert!(matches!(results[0], Err(StoreError::InvalidBook(_))));
}

#[tokio::test]
async fn empty_batch_is_fast_and_empty() {
    let Some(store) = store().await else { return };
    let (path, results) = store.commit_batch_traced(&[]).await;
    assert_eq!(path, BatchPath::Fast);
    assert!(results.is_empty());
}

#[tokio::test]
async fn trait_commit_batch_matches_traced() {
    // Pins the Store::commit_batch wrapper to commit_batch_traced for both a
    // clean (fast) batch and a fallback batch, on fresh books per call so the
    // inputs are identical and the only difference is the entry point.
    let Some(store) = store().await else { return };

    // Clean batch via the trait method.
    let (book1, asset1) = conformance::setup_book(&store).await;
    let clean: Vec<_> = (0..3)
        .map(|i| {
            conformance::transfer(&book1, &format!("tw-{i}"), "deposits", "cash", &asset1, 100)
        })
        .collect();
    let trait_clean = store.commit_batch(&clean).await;
    // Same shape on a fresh book via the traced variant.
    let (book2, asset2) = conformance::setup_book(&store).await;
    let clean2: Vec<_> = (0..3)
        .map(|i| {
            conformance::transfer(&book2, &format!("tw-{i}"), "deposits", "cash", &asset2, 100)
        })
        .collect();
    let (path2, traced_clean) = store.commit_batch_traced(&clean2).await;
    assert_eq!(path2, BatchPath::Fast);
    let trait_seqs: Vec<i64> = trait_clean
        .iter()
        .map(|r| r.as_ref().unwrap().seq)
        .collect();
    let traced_seqs: Vec<i64> = traced_clean
        .iter()
        .map(|r| r.as_ref().unwrap().seq)
        .collect();
    assert_eq!(trait_seqs, traced_seqs);

    // Fallback batch (unknown account) via both entry points on fresh books.
    let (book3, asset3) = conformance::setup_book(&store).await;
    let fb3 = vec![
        conformance::transfer(&book3, "tw-fb-0", "deposits", "cash", &asset3, 100),
        conformance::transfer(&book3, "tw-fb-1", "deposits", "ghost", &asset3, 100),
    ];
    let trait_fb = store.commit_batch(&fb3).await;
    let (book4, asset4) = conformance::setup_book(&store).await;
    let fb4 = vec![
        conformance::transfer(&book4, "tw-fb-0", "deposits", "cash", &asset4, 100),
        conformance::transfer(&book4, "tw-fb-1", "deposits", "ghost", &asset4, 100),
    ];
    let (path4, traced_fb) = store.commit_batch_traced(&fb4).await;
    assert_eq!(path4, BatchPath::Fallback);
    assert_eq!(trait_fb[0].is_ok(), traced_fb[0].is_ok());
    assert_eq!(trait_fb[1].is_err(), traced_fb[1].is_err());
    use talea_core::store::StoreError;
    assert!(matches!(trait_fb[1], Err(StoreError::UnknownAccount(_))));
    assert!(matches!(traced_fb[1], Err(StoreError::UnknownAccount(_))));
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
