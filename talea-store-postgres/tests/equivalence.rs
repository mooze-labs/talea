//! Property: commit_batch == sequential commit, observably.
//! Seeded PRNG, fixed iteration count — deterministic in CI.

use sqlx::postgres::PgPoolOptions;
use talea_core::store::Store;
use talea_core::types::AccountKind;
use talea_store_conformance as conformance;
use talea_store_postgres::PgTaleaStore;

fn splitmix64(state: &mut u64) -> u64 {
    *state = state.wrapping_add(0x9E37_79B9_7F4A_7C15);
    let mut z = *state;
    z = (z ^ (z >> 30)).wrapping_mul(0xBF58_476D_1CE4_E5B9);
    z = (z ^ (z >> 27)).wrapping_mul(0x94D0_49BB_1331_11EB);
    z ^ (z >> 31)
}

async fn store() -> Option<PgTaleaStore> {
    let Ok(url) = std::env::var("TALEA_TEST_PG_URL") else {
        eprintln!("TALEA_TEST_PG_URL not set; skipping equivalence test");
        return None;
    };
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&url)
        .await
        .expect("connect failed");
    let store = PgTaleaStore::new(pool);
    store.migrate().await.expect("migration failed");
    Some(store)
}

/// One book with a constrained cash account; returns (book, asset).
async fn constrained_book(store: &PgTaleaStore) -> (String, String) {
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
    (book, asset_id)
}

#[tokio::test]
async fn commit_batch_equals_sequential_commit() {
    let Some(store) = store().await else { return };
    let mut rng: u64 = 0x7A1E_A001;

    for round in 0..25 {
        let (book_a, asset_a) = constrained_book(&store).await;
        let (book_b, asset_b) = constrained_book(&store).await;

        // One batch shape, instantiated against both books.
        let size = 2 + (splitmix64(&mut rng) % 7) as usize; // 2..=8
        let mut drafts_a = Vec::new();
        let mut drafts_b = Vec::new();
        let mut used_keys: Vec<String> = Vec::new();
        for j in 0..size {
            let roll = splitmix64(&mut rng) % 10;
            let key = if roll == 0 && !used_keys.is_empty() {
                used_keys[(splitmix64(&mut rng) as usize) % used_keys.len()].clone()
            } else {
                let k = format!("eq-{round}-{j}");
                used_keys.push(k.clone());
                k
            };
            let (from, to, amount) = match splitmix64(&mut rng) % 4 {
                0 => ("deposits", "cash", 100),
                1 => ("deposits", "cash", 50),
                2 => ("cash", "expenses", 75), // overdrafts when cash is low
                _ => ("cash", "ghost", 10),    // unknown account
            };
            drafts_a.push(conformance::transfer(
                &book_a, &key, from, to, &asset_a, amount,
            ));
            drafts_b.push(conformance::transfer(
                &book_b, &key, from, to, &asset_b, amount,
            ));
        }

        let batch_results = store.commit_batch(&drafts_a).await;
        let mut seq_results = Vec::new();
        for d in &drafts_b {
            seq_results.push(store.commit(d).await);
        }

        assert_eq!(batch_results.len(), seq_results.len());
        for (i, (b, s)) in batch_results.iter().zip(&seq_results).enumerate() {
            let same = match (b, s) {
                (Ok(_), Ok(_)) => true,
                (Err(eb), Err(es)) => std::mem::discriminant(eb) == std::mem::discriminant(es),
                _ => false,
            };
            assert!(
                same,
                "round {round} draft {i}: batch={b:?} vs sequential={s:?}"
            );
        }
        // Relative seq order of successes matches (offsets differ only by
        // each book's setup events — both books have 3).
        let seqs_a: Vec<i64> = batch_results.iter().flatten().map(|c| c.seq).collect();
        let seqs_b: Vec<i64> = seq_results.iter().flatten().map(|c| c.seq).collect();
        let rel = |v: &[i64]| -> Vec<i64> {
            v.iter()
                .map(|s| s - v.first().copied().unwrap_or(0))
                .collect()
        };
        assert_eq!(
            rel(&seqs_a),
            rel(&seqs_b),
            "round {round}: seq order diverged"
        );
        for path in ["cash", "deposits", "expenses"] {
            let a = store
                .balance(&conformance::account_id(&book_a, path), None)
                .await
                .unwrap();
            let b = store
                .balance(&conformance::account_id(&book_b, path), None)
                .await
                .unwrap();
            assert_eq!(
                a.amount.minor(),
                b.amount.minor(),
                "round {round}: {path} balance diverged"
            );
        }
    }
}
