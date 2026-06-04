//! Deterministic workload generation: balanced transfer drafts, scoped
//! idempotency keys, exact-ratio op mixing, and a cheap PRNG for cursors.

use serde::Serialize;
use talea_core::api::{PostingDraft, TransactionDraft, WireAmount};
use talea_core::types::Direction;

pub const ASSET: &str = "USD";
pub const CASH: &str = "cash";
pub const EQUITY: &str = "equity";

pub fn book_name(i: usize) -> String {
    format!("bench-{i}")
}

/// Balanced cash↔equity transfer. The idempotency key embeds
/// scope/worker/seq so distinct logical requests never collide while
/// SDK-internal retries (same draft) always dedup safely. A scope that
/// embeds the run_id is unique per run; a fixed scope (depth seeding)
/// makes re-runs free via dedup.
pub fn transfer_draft(
    book: &str,
    scope: &str,
    worker: usize,
    seq: u64,
    postings_per_tx: usize,
) -> TransactionDraft {
    assert!(
        postings_per_tx >= 2 && postings_per_tx.is_multiple_of(2),
        "postings_per_tx must be even and >= 2, got {postings_per_tx}"
    );
    let mut postings = Vec::with_capacity(postings_per_tx);
    for _ in 0..postings_per_tx / 2 {
        postings.push(PostingDraft {
            account: CASH.into(),
            amount: WireAmount { minor: 100, asset: ASSET.into() },
            direction: Direction::Debit,
        });
        postings.push(PostingDraft {
            account: EQUITY.into(),
            amount: WireAmount { minor: 100, asset: ASSET.into() },
            direction: Direction::Credit,
        });
    }
    TransactionDraft {
        book: book.into(),
        idempotency_key: format!("bench/{scope}/{worker}/{seq}"),
        postings,
        external_refs: vec![],
        metadata: serde_json::Value::Null,
        occurred_at: None,
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MixOp {
    Post,
    Balance,
    History,
    Trial,
}

/// Integer weights; ops are dealt by cycling `seq` through the weight
/// ranges, so every full cycle hits the ratios exactly (no RNG drift).
#[derive(Debug, Clone, Serialize)]
pub struct MixWeights {
    pub post: u32,
    pub balance: u32,
    pub history: u32,
    pub trial: u32,
}

impl MixWeights {
    pub fn total(&self) -> u32 {
        self.post + self.balance + self.history + self.trial
    }

    pub fn op_for(&self, seq: u64) -> MixOp {
        let r = (seq % u64::from(self.total())) as u32;
        if r < self.post {
            MixOp::Post
        } else if r < self.post + self.balance {
            MixOp::Balance
        } else if r < self.post + self.balance + self.history {
            MixOp::History
        } else {
            MixOp::Trial
        }
    }
}

/// splitmix64 over (worker, seq): deterministic pagination cursors
/// without an RNG dependency.
pub fn pseudo(worker: usize, seq: u64) -> u64 {
    let mut x = (worker as u64)
        .wrapping_mul(0x9E37_79B9_7F4A_7C15)
        .wrapping_add(seq)
        .wrapping_add(0x9E37_79B9_7F4A_7C15);
    x ^= x >> 30;
    x = x.wrapping_mul(0xBF58_476D_1CE4_E5B9);
    x ^= x >> 27;
    x = x.wrapping_mul(0x94D0_49BB_1331_11EB);
    x ^ (x >> 31)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashSet;
    use talea_core::types::Direction;

    #[test]
    fn transfer_draft_balances_per_asset() {
        for ppt in [2usize, 4, 8] {
            let d = transfer_draft("bench-0", "scope", 3, 7, ppt);
            assert_eq!(d.postings.len(), ppt);
            let debits: i64 = d
                .postings
                .iter()
                .filter(|p| matches!(p.direction, Direction::Debit))
                .map(|p| p.amount.minor)
                .sum();
            let credits: i64 = d
                .postings
                .iter()
                .filter(|p| matches!(p.direction, Direction::Credit))
                .map(|p| p.amount.minor)
                .sum();
            assert_eq!(debits, credits);
            assert!(d.postings.iter().all(|p| p.amount.minor > 0));
        }
    }

    #[test]
    #[should_panic]
    fn transfer_draft_rejects_odd_posting_counts() {
        transfer_draft("b", "s", 0, 0, 3);
    }

    #[test]
    fn idempotency_keys_unique_across_scope_worker_seq() {
        let mut seen = HashSet::new();
        for scope in ["run1/step1", "run1/step2"] {
            for w in 0..3 {
                for s in 0..3 {
                    let d = transfer_draft("b", scope, w, s, 2);
                    assert!(seen.insert(d.idempotency_key.clone()), "dup: {}", d.idempotency_key);
                }
            }
        }
    }

    #[test]
    fn mix_weights_hit_exact_ratios_per_cycle() {
        let w = MixWeights { post: 60, balance: 25, history: 10, trial: 5 };
        let mut counts = [0u32; 4];
        for s in 0..100u64 {
            match w.op_for(s) {
                MixOp::Post => counts[0] += 1,
                MixOp::Balance => counts[1] += 1,
                MixOp::History => counts[2] += 1,
                MixOp::Trial => counts[3] += 1,
            }
        }
        assert_eq!(counts, [60, 25, 10, 5]);
    }

    #[test]
    fn pseudo_is_deterministic_and_spreads() {
        assert_eq!(pseudo(1, 2), pseudo(1, 2));
        assert_ne!(pseudo(1, 2), pseudo(1, 3));
        assert_ne!(pseudo(1, 2), pseudo(2, 2));
    }
}
