//! In-memory authoritative state for one book, plus batch validation.
//!
//! [`BookState`] is the single-writer in-memory projection of one book's
//! event log. It owns account balances, idempotency records, and sequence
//! counters. [`Scratch`] provides a batch overlay: once a transaction is
//! accepted by [`BookState::validate`], call [`Scratch::stage`] to project
//! its effects into the overlay so later batchmates see the updated balances.
use std::collections::HashMap;

use chrono::{DateTime, Utc};
use talea_core::store::{AccountCfg, Committed, StoreError};
use talea_core::types::*;
use uuid::Uuid;

/// Raw stored balance is debit-positive; effective is normal-side-adjusted.
///
/// Mirrors the `effective()` helper in `talea-store-sqlite`, which the
/// conformance suite treats as the reference.
pub fn effective(raw: i64, normal_side: &Option<Direction>) -> i64 {
    match normal_side {
        Some(Direction::Credit) => -raw,
        _ => raw,
    }
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct PostingEntry {
    pub seq: Seq,
    pub at: DateTime<Utc>,
    pub txid: TxId,
    pub minor: i64,
    pub direction: Direction,
    /// Running debit-positive balance after this posting.
    pub raw_after: i64,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct AccountState {
    pub def: AccountDef,
    pub cfg: AccountCfg,
    pub raw_balance: i64,
    pub updated_seq: Seq,
    pub postings: Vec<PostingEntry>,
}

/// Serde-able mirror of core's [`Committed`] (which doesn't derive serde).
#[derive(Debug, Clone, PartialEq, serde::Serialize, serde::Deserialize)]
pub struct CommittedRec {
    pub txid: TxId,
    pub seq: Seq,
    pub at: DateTime<Utc>,
}

impl From<&CommittedRec> for Committed {
    fn from(r: &CommittedRec) -> Self {
        Committed {
            txid: r.txid.clone(),
            seq: r.seq,
            at: r.at,
        }
    }
}

/// `(segment_base_seq, byte_offset)` of a frame within the segment set.
pub type FramePos = (Seq, u64);

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct BookState {
    /// First unassigned seq; starts at 1.
    pub next_seq: Seq,
    /// Keyed by `AccountId::to_key()`.
    pub accounts: HashMap<String, AccountState>,
    /// Idempotency key → committed record.
    pub idem: HashMap<String, CommittedRec>,
    /// TxId UUID → (seq, frame position).
    pub txids: HashMap<Uuid, (Seq, FramePos)>,
    /// Per-asset lifetime (debits, credits) sums.
    pub sums: HashMap<AssetId, (i64, i64)>,
    pub last_at: Option<DateTime<Utc>>,
}

impl Default for BookState {
    fn default() -> Self {
        Self {
            next_seq: 1,
            accounts: HashMap::new(),
            idem: HashMap::new(),
            txids: HashMap::new(),
            sums: HashMap::new(),
            last_at: None,
        }
    }
}

/// Batch overlay for projecting in-flight (not yet applied) transactions.
///
/// # Coupling with `validate`
///
/// [`BookState::validate`] seeds `scratch.raw` for every account a transaction
/// touches (using the committed `raw_balance` as the starting point for
/// accounts not yet in the scratch). Callers MUST call `validate` before
/// `stage` for any given transaction; calling `stage` without a prior
/// `validate` on the same transaction will produce incorrect projections.
#[derive(Debug, Default)]
pub struct Scratch {
    /// Projected raw balances for accounts touched by accepted batchmates.
    /// Seeded by `validate`; advanced by `stage`.
    pub raw: HashMap<String, i64>,
    /// Idempotency keys accepted earlier in this batch.
    pub idem: HashMap<String, usize>,
}

impl Scratch {
    /// Fold an ACCEPTED transaction's postings into the projected balances.
    ///
    /// This method is meaningful only after a successful call to
    /// [`BookState::validate`] for the same transaction, which seeds the
    /// starting committed balances into `scratch.raw`. Subsequent batchmates
    /// will see the updated projections when their own `validate` is called.
    pub fn stage(&mut self, tx: &Transaction) {
        for p in &tx.postings {
            let key = p.account.to_key();
            // Entry must have been seeded by validate; get_mut is safe here.
            let raw = self.raw.entry(key).or_insert(0);
            match p.direction {
                Direction::Debit => *raw += p.amount.minor(),
                Direction::Credit => *raw -= p.amount.minor(),
            }
        }
    }
}

impl BookState {
    /// Validate a transaction against current committed state + batch overlay.
    ///
    /// Validation order:
    /// 1. Reserved-book check.
    /// 2. Every posting's account exists.
    /// 3. Posting amount asset matches the account's registered asset.
    /// 4. Min-balance constraints hold after projecting this transaction.
    ///
    /// On success the scratch's `raw` entries are seeded for every account
    /// this transaction touches (using committed balance as the base for
    /// accounts not yet in the scratch), but the transaction's own effects
    /// are NOT folded in — call [`Scratch::stage`] after acceptance to do
    /// that so later batchmates see the projection.
    pub fn validate(&self, tx: &Transaction, scratch: &mut Scratch) -> Result<(), StoreError> {
        // 1. Reserved-book check.
        if tx.book.is_reserved() {
            return Err(StoreError::InvalidBook(tx.book.clone()));
        }

        // 2 & 3. Verify every posting's account exists and asset matches;
        //        also collect the set of accounts we'll need to project.
        for p in &tx.postings {
            let key = p.account.to_key();
            let acct = self
                .accounts
                .get(&key)
                .ok_or_else(|| StoreError::UnknownAccount(p.account.clone()))?;
            if *p.amount.asset() != acct.def.asset {
                return Err(StoreError::AssetMismatch {
                    account: p.account.clone(),
                    account_asset: acct.def.asset.clone(),
                    asset: p.amount.asset().clone(),
                });
            }
        }

        // 4. Project balances and check min-balance constraints.
        //    Seed scratch.raw for accounts not yet touched by earlier batchmates.
        for p in &tx.postings {
            let key = p.account.to_key();
            // Seed from committed balance if not yet in the overlay.
            if !scratch.raw.contains_key(&key) {
                let committed_raw = self
                    .accounts
                    .get(&key)
                    .map(|a| a.raw_balance)
                    .unwrap_or(0);
                scratch.raw.insert(key.clone(), committed_raw);
            }
        }

        // Compute projected raw balances for THIS transaction only (local copy).
        let mut projected: HashMap<String, i64> = HashMap::new();
        for p in &tx.postings {
            let key = p.account.to_key();
            let base = *scratch.raw.get(&key).unwrap_or(&0);
            let entry = projected.entry(key.clone()).or_insert(base);
            match p.direction {
                Direction::Debit => *entry += p.amount.minor(),
                Direction::Credit => *entry -= p.amount.minor(),
            }
        }

        // Check min-balance for every touched account.
        for (key, &proj_raw) in &projected {
            let acct = &self.accounts[key];
            if let Some(min) = acct.cfg.min_balance {
                let would_be = effective(proj_raw, &acct.cfg.normal_side);
                if would_be < min {
                    return Err(StoreError::ConstraintViolation {
                        account: acct.def.id.clone(),
                        min_balance: min,
                        would_be,
                    });
                }
            }
        }

        Ok(())
    }

    /// Apply a committed transaction to the in-memory state.
    ///
    /// Updates raw balances, posts a [`PostingEntry`] per posting (with
    /// running `raw_after`), advances lifetime debit/credit sums, indexes
    /// the idempotency key and TxId, and bumps `next_seq`/`last_at`.
    pub fn apply_transaction(
        &mut self,
        tx: &Transaction,
        seq: Seq,
        at: DateTime<Utc>,
        pos: FramePos,
    ) {
        for p in &tx.postings {
            let key = p.account.to_key();
            if let Some(acct) = self.accounts.get_mut(&key) {
                match p.direction {
                    Direction::Debit => acct.raw_balance += p.amount.minor(),
                    Direction::Credit => acct.raw_balance -= p.amount.minor(),
                }
                acct.updated_seq = seq;
                let raw_after = acct.raw_balance;
                acct.postings.push(PostingEntry {
                    seq,
                    at,
                    txid: tx.id.clone(),
                    minor: p.amount.minor(),
                    direction: p.direction.clone(),
                    raw_after,
                });
            }

            // Lifetime sums.
            let sums = self.sums.entry(p.amount.asset().clone()).or_insert((0, 0));
            match p.direction {
                Direction::Debit => sums.0 += p.amount.minor(),
                Direction::Credit => sums.1 += p.amount.minor(),
            }
        }

        self.idem.insert(
            tx.idempotency_key.0.clone(),
            CommittedRec {
                txid: tx.id.clone(),
                seq,
                at,
            },
        );
        self.txids.insert(tx.id.0, (seq, pos));
        self.next_seq = seq + 1;
        self.last_at = Some(at);
    }

    /// Apply an account-opened event to the in-memory state.
    ///
    /// Idempotent on replay: if the account already exists (from a prior
    /// replay pass), the first insertion is kept and the duplicate is ignored.
    pub fn apply_account_opened(
        &mut self,
        def: &AccountDef,
        cfg: &AccountCfg,
        seq: Seq,
        at: DateTime<Utc>,
    ) {
        let key = def.id.to_key();
        self.accounts.entry(key).or_insert_with(|| AccountState {
            def: def.clone(),
            cfg: cfg.clone(),
            raw_balance: 0,
            updated_seq: 0,
            postings: vec![],
        });
        self.next_seq = seq + 1;
        self.last_at = Some(at);
    }

    /// Consume a sequence number for events that do not affect book-local
    /// state (e.g. `AssetRegistered` in `_system`).
    pub fn bump_seq(&mut self, seq: Seq, at: DateTime<Utc>) {
        self.next_seq = seq + 1;
        self.last_at = Some(at);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use talea_core::store::{AccountCfg, StoreError};

    fn acct(path: &str) -> AccountId {
        AccountId { book: Book("b".into()), path: path.into() }
    }

    fn state_with_accounts() -> BookState {
        let mut st = BookState::default();
        for (path, normal, min) in [
            ("cash", Some(Direction::Debit), Some(0)),
            ("rev", Some(Direction::Credit), None),
        ] {
            st.accounts.insert(
                acct(path).to_key(),
                AccountState {
                    def: AccountDef { id: acct(path), asset: AssetId::new("USD"), kind: AccountKind::Asset },
                    cfg: AccountCfg { normal_side: normal, min_balance: min },
                    raw_balance: 0,
                    updated_seq: 0,
                    postings: vec![],
                },
            );
        }
        st
    }

    fn tx(key: &str, postings: Vec<(AccountId, i64, Direction)>) -> Transaction {
        Transaction {
            id: TxId(uuid::Uuid::now_v7()),
            book: Book("b".into()),
            postings: postings
                .into_iter()
                .map(|(account, minor, direction)| Posting {
                    account,
                    amount: Amount::new(minor, AssetId::new("USD")),
                    direction,
                })
                .collect(),
            idempotency_key: IdempotencyKey(key.into()),
            external_refs: vec![],
            metadata: serde_json::Value::Null,
            occurred_at: chrono::Utc::now(),
        }
    }

    #[test]
    fn overdraft_rejected_with_projected_would_be() {
        let st = state_with_accounts();
        let mut scratch = Scratch::default();
        let t = tx("k1", vec![(acct("cash"), 100, Direction::Credit), (acct("rev"), 100, Direction::Debit)]);
        match st.validate(&t, &mut scratch) {
            Err(StoreError::ConstraintViolation { would_be, min_balance, .. }) => {
                assert_eq!(would_be, -100);
                assert_eq!(min_balance, 0);
            }
            other => panic!("expected ConstraintViolation, got {other:?}"),
        }
    }

    #[test]
    fn scratch_carries_earlier_batchmates_balances() {
        let st = state_with_accounts();
        let mut scratch = Scratch::default();
        let fund = tx("k1", vec![(acct("cash"), 100, Direction::Debit), (acct("rev"), 100, Direction::Credit)]);
        st.validate(&fund, &mut scratch).unwrap();
        scratch.stage(&fund); // accepted: later batchmates see the projection
        let spend = tx("k2", vec![(acct("cash"), 80, Direction::Credit), (acct("rev"), 80, Direction::Debit)]);
        st.validate(&spend, &mut scratch).unwrap(); // 100 - 80 = 20 >= 0: fine
        scratch.stage(&spend);
        let over = tx("k3", vec![(acct("cash"), 30, Direction::Credit), (acct("rev"), 30, Direction::Debit)]);
        assert!(matches!(st.validate(&over, &mut scratch), Err(StoreError::ConstraintViolation { .. })));
    }

    #[test]
    fn unknown_account_and_asset_mismatch() {
        let st = state_with_accounts();
        let mut scratch = Scratch::default();
        let ghost = tx("k1", vec![(acct("nope"), 1, Direction::Debit)]);
        assert!(matches!(st.validate(&ghost, &mut scratch), Err(StoreError::UnknownAccount(_))));
        let mut wrong = tx("k2", vec![(acct("cash"), 1, Direction::Debit)]);
        wrong.postings[0].amount = Amount::new(1, AssetId::new("BTC"));
        assert!(matches!(st.validate(&wrong, &mut scratch), Err(StoreError::AssetMismatch { .. })));
    }

    #[test]
    fn reserved_book_rejected() {
        let st = BookState::default();
        let mut scratch = Scratch::default();
        let mut t = tx("k1", vec![]);
        t.book = Book("_system".into());
        assert!(matches!(st.validate(&t, &mut scratch), Err(StoreError::InvalidBook(_))));
    }

    #[test]
    fn apply_updates_balances_indexes_and_sums() {
        let mut st = state_with_accounts();
        let t = tx("k1", vec![(acct("cash"), 100, Direction::Debit), (acct("rev"), 100, Direction::Credit)]);
        let at = talea_core::store::ledger_now();
        st.apply_transaction(&t, 1, at, (1, 0));
        let cash = &st.accounts[&acct("cash").to_key()];
        assert_eq!(cash.raw_balance, 100);
        assert_eq!(cash.updated_seq, 1);
        assert_eq!(cash.postings.len(), 1);
        assert_eq!(cash.postings[0].raw_after, 100);
        assert_eq!(st.sums[&AssetId::new("USD")], (100, 100));
        assert!(st.idem.contains_key("k1"));
        assert!(st.txids.contains_key(&t.id.0));
        assert_eq!(st.next_seq, 2);
    }
}
