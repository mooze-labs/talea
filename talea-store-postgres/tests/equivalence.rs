// Test code: a panicking unwrap/expect IS the test failing (clippy.toml
// exempts #[test] fns; this extends that to integration-test helpers).
#![allow(clippy::unwrap_used, clippy::expect_used)]

//! Property: commit_batch == sequential commit, observably.
//! Seeded PRNG, fixed iteration count — deterministic in CI.
//!
//! Round structure:
//!   Even rounds — SAFE shape: opens with a 1000-unit funding deposit so the
//!   worst-case spend (7 × 75 = 525) can never overdraft. These MUST take
//!   BatchPath::Fast.
//!   Odd rounds — MIXED shape: four-arm generator that can produce ghost-account
//!   or overdraft drafts. Either path is legitimate.

use sqlx::postgres::PgPoolOptions;
use talea_core::store::Store;
use talea_core::types::AccountKind;
use talea_store_conformance as conformance;
use talea_store_postgres::{BatchPath, PgTaleaStore};

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
    let mut fast_count = 0usize;
    let mut fallback_count = 0usize;

    for round in 0..25 {
        let (book_a, asset_a) = constrained_book(&store).await;
        let (book_b, asset_b) = constrained_book(&store).await;

        let is_safe = round % 2 == 0;

        // One batch shape, instantiated against both books.
        let mut drafts_a = Vec::new();
        let mut drafts_b = Vec::new();
        let mut used_keys: Vec<String> = Vec::new();

        if is_safe {
            // SAFE round: seed with a large funding deposit so no overdraft is
            // possible regardless of subsequent draws.
            let key = format!("eq-{round}-seed");
            used_keys.push(key.clone());
            drafts_a.push(conformance::transfer(
                &book_a, &key, "deposits", "cash", &asset_a, 1000,
            ));
            drafts_b.push(conformance::transfer(
                &book_b, &key, "deposits", "cash", &asset_b, 1000,
            ));

            // ≤7 subsequent drafts; worst case 7 × 75 = 525 < 1000 funding.
            let extra = (splitmix64(&mut rng) % 7) as usize; // 0..=6
            for j in 0..extra {
                let roll = splitmix64(&mut rng) % 10;
                let key = if roll == 0 && !used_keys.is_empty() {
                    // the index draw shifts the PRNG, so a reused-key draft's arm
                    // comes from a different position — intentional.
                    used_keys[(splitmix64(&mut rng) as usize) % used_keys.len()].clone()
                } else {
                    let k = format!("eq-{round}-{j}");
                    used_keys.push(k.clone());
                    k
                };
                let (from, to, amount) = match splitmix64(&mut rng) % 3 {
                    0 => ("deposits", "cash", 100),
                    1 => ("deposits", "cash", 50),
                    _ => ("cash", "expenses", 75),
                };
                drafts_a.push(conformance::transfer(
                    &book_a, &key, from, to, &asset_a, amount,
                ));
                drafts_b.push(conformance::transfer(
                    &book_b, &key, from, to, &asset_b, amount,
                ));
            }
        } else {
            // MIXED round: four-arm generator that can produce ghost-account or
            // overdraft drafts — either batch path is legitimate.
            let size = 2 + (splitmix64(&mut rng) % 7) as usize; // 2..=8
            for j in 0..size {
                let roll = splitmix64(&mut rng) % 10;
                let key = if roll == 0 && !used_keys.is_empty() {
                    // the index draw shifts the PRNG, so a reused-key draft's arm
                    // comes from a different position — intentional.
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
        }

        let (path, batch_results) = store.commit_batch_traced(&drafts_a).await;
        eprintln!(
            "round {round} ({shape}): {path:?}  drafts={}",
            drafts_a.len(),
            shape = if is_safe { "safe" } else { "mixed" },
        );

        if is_safe {
            assert_eq!(
                path,
                BatchPath::Fast,
                "round {round}: safe batch must take the fast path"
            );
            fast_count += 1;
        } else {
            match path {
                BatchPath::Fast => fast_count += 1,
                BatchPath::Fallback => fallback_count += 1,
            }
        }

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

        // rel() normalizes away per-book seq offsets regardless of setup depth.
        // Single-success rounds pass rel() trivially; the balance check below is
        // the load-bearing assertion there.
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
        // Normalize updated_seq the same way as seqs: subtract each book's
        // minimum committed seq in this round. Both books have identical
        // setup-event counts and the same draft order, so an account's
        // last-touching seq, relative to its book's first committed seq this
        // round, must match across books.
        let base_a = seqs_a.iter().min().copied().unwrap_or(0);
        let base_b = seqs_b.iter().min().copied().unwrap_or(0);
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
            // updated_seq is 0 for accounts no committed draft touched this
            // round (and across rounds, since each book is fresh); compare
            // raw 0s directly, and normalized values when touched.
            if a.updated_seq == 0 || b.updated_seq == 0 {
                assert_eq!(
                    a.updated_seq, b.updated_seq,
                    "round {round}: {path} updated_seq touched-ness diverged"
                );
            } else {
                assert_eq!(
                    a.updated_seq - base_a,
                    b.updated_seq - base_b,
                    "round {round}: {path} updated_seq diverged"
                );
            }
        }
    }

    eprintln!(
        "equivalence summary: Fast={fast_count} Fallback={fallback_count} total={}",
        fast_count + fallback_count
    );
    assert!(
        fast_count > 0,
        "generator drift: no round took the fast path"
    );
    assert!(
        fallback_count > 0,
        "generator drift: no round took the fallback path"
    );
}
