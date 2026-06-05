//! In-memory authoritative state for one book, plus batch validation.
//!
//! [`BookState`] is the single-writer in-memory projection of one book's
//! event log. It owns account balances, idempotency records, and sequence
//! counters. [`Scratch`] provides a batch overlay: once a transaction is
//! accepted by [`BookState::validate`], call [`Scratch::stage`] to project
//! its effects into the overlay so later batchmates see the updated balances.
use std::collections::HashMap;
use std::sync::Arc;
use std::sync::atomic::AtomicBool;

use crate::idem_spill::TieredIdem;

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

/// Chunk size for [`PostingIndex`] sealed chunks.
pub const CHUNK: usize = 4096;

/// A chunked, Arc-shared posting history for one account.
///
/// # Invariant
///
/// Entries are ordered by `(seq, at)` in globally non-decreasing order — the
/// same order they are appended by the single writer. This invariant is
/// maintained by calling [`PostingIndex::push`] only from within
/// [`BookState::try_apply_transaction`], which receives events in seq order.
///
/// # Clone cost
///
/// Cloning bumps the `Arc` refcount on each sealed chunk (O(sealed.len()))
/// and deep-copies only the active tail (at most `CHUNK` entries). Over a long
/// book lifetime, sealed grows logarithmically in event count while the per-
/// clone memcpy stays bounded at `CHUNK * size_of::<PostingEntry>()` ≈ 256 KiB.
///
/// # Serde
///
/// Serialised as a flat `Vec<PostingEntry>` for forward compatibility with
/// snapshot files. On deserialisation the flat list is re-chunked using the
/// same `CHUNK` constant. Pre-release snapshots with the old `Vec<PostingEntry>`
/// field are NOT compatible (the field name changed from `postings: Vec<…>` to
/// `postings: PostingIndex`).
#[derive(Debug, Clone, Default)]
pub struct PostingIndex {
    /// Sealed, immutable chunks — Arc-shared so cloning bumps refcounts instead
    /// of copying history. Each holds exactly `CHUNK` entries.
    sealed: Vec<Arc<Vec<PostingEntry>>>,
    /// Active tail: at most `CHUNK` entries; the only part deep-copied by `clone`.
    tail: Vec<PostingEntry>,
}

impl PostingIndex {
    /// Append a new entry. When the tail reaches `CHUNK` entries it is sealed
    /// (wrapped in an `Arc` and pushed to `sealed`) and a fresh tail is started.
    pub fn push(&mut self, e: PostingEntry) {
        self.tail.push(e);
        if self.tail.len() == CHUNK {
            let chunk = Arc::new(std::mem::take(&mut self.tail));
            self.sealed.push(chunk);
        }
    }

    /// Total number of entries across sealed chunks and the tail.
    pub fn len(&self) -> usize {
        self.sealed.len() * CHUNK + self.tail.len()
    }

    /// True when no entries have been pushed.
    pub fn is_empty(&self) -> bool {
        self.sealed.is_empty() && self.tail.is_empty()
    }

    /// Global index of the first entry with `at > t` (entries are ordered by
    /// non-decreasing `at`). Equivalent to `Vec::partition_point(|e| e.at <= t)`.
    ///
    /// Binary searches chunk boundaries first, then within the relevant chunk.
    pub fn partition_point_at(&self, t: DateTime<Utc>) -> usize {
        // Determine which chunk contains the boundary.
        // Each sealed chunk's last entry is the candidate for the boundary check.
        let n_sealed = self.sealed.len();

        // Find the first sealed chunk whose last entry has `at > t`.
        let chunk_idx = self.sealed.partition_point(|chunk| {
            chunk.last().map(|e| e.at <= t).unwrap_or(false)
        });

        if chunk_idx < n_sealed {
            // Boundary is inside sealed[chunk_idx].
            let chunk = &self.sealed[chunk_idx];
            let local = chunk.partition_point(|e| e.at <= t);
            chunk_idx * CHUNK + local
        } else {
            // Boundary is in the tail (or past the end).
            let tail_local = self.tail.partition_point(|e| e.at <= t);
            n_sealed * CHUNK + tail_local
        }
    }

    /// Global index of the first entry with `seq > after`.
    /// Equivalent to `Vec::partition_point(|e| e.seq <= after)`.
    pub fn partition_point_seq(&self, after: Seq) -> usize {
        let n_sealed = self.sealed.len();

        let chunk_idx = self.sealed.partition_point(|chunk| {
            chunk.last().map(|e| e.seq <= after).unwrap_or(false)
        });

        if chunk_idx < n_sealed {
            let chunk = &self.sealed[chunk_idx];
            let local = chunk.partition_point(|e| e.seq <= after);
            chunk_idx * CHUNK + local
        } else {
            let tail_local = self.tail.partition_point(|e| e.seq <= after);
            n_sealed * CHUNK + tail_local
        }
    }

    /// Return the entry at global index `idx`, or `None` if out of bounds.
    pub fn get(&self, idx: usize) -> Option<&PostingEntry> {
        let n_sealed = self.sealed.len();
        if idx < n_sealed * CHUNK {
            let chunk_i = idx / CHUNK;
            let local = idx % CHUNK;
            self.sealed.get(chunk_i)?.get(local)
        } else {
            self.tail.get(idx - n_sealed * CHUNK)
        }
    }

    /// Iterator over entries starting at global index `idx`.
    pub fn iter_from(&self, idx: usize) -> impl Iterator<Item = &PostingEntry> {
        let n_sealed = self.sealed.len();
        let sealed_total = n_sealed * CHUNK;

        // Collect sealed entries starting at `idx`.
        let sealed_iter: Box<dyn Iterator<Item = &PostingEntry>> = if idx < sealed_total {
            let chunk_start = idx / CHUNK;
            let local_start = idx % CHUNK;
            Box::new(
                self.sealed[chunk_start..]
                    .iter()
                    .enumerate()
                    .flat_map(move |(ci, chunk)| {
                        let start = if ci == 0 { local_start } else { 0 };
                        chunk[start..].iter()
                    }),
            )
        } else {
            Box::new(std::iter::empty())
        };

        let tail_start = idx.saturating_sub(sealed_total);
        let tail_iter = self.tail[tail_start.min(self.tail.len())..].iter();

        sealed_iter.chain(tail_iter)
    }
}

// ---------------------------------------------------------------------------
// Serde: serialise as flat Vec<PostingEntry>, deserialise by re-chunking.
// ---------------------------------------------------------------------------

impl serde::Serialize for PostingIndex {
    fn serialize<S: serde::Serializer>(&self, ser: S) -> Result<S::Ok, S::Error> {
        use serde::ser::SerializeSeq;
        let total = self.len();
        let mut seq = ser.serialize_seq(Some(total))?;
        for chunk in &self.sealed {
            for e in chunk.as_ref() {
                seq.serialize_element(e)?;
            }
        }
        for e in &self.tail {
            seq.serialize_element(e)?;
        }
        seq.end()
    }
}

impl<'de> serde::Deserialize<'de> for PostingIndex {
    fn deserialize<D: serde::Deserializer<'de>>(de: D) -> Result<Self, D::Error> {
        let flat: Vec<PostingEntry> = Vec::deserialize(de)?;
        let mut idx = PostingIndex::default();
        for e in flat {
            idx.push(e);
        }
        Ok(idx)
    }
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct AccountState {
    pub def: AccountDef,
    pub cfg: AccountCfg,
    pub raw_balance: i64,
    pub updated_seq: Seq,
    pub postings: PostingIndex,
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
    ///
    /// Tiered: hot in-memory HashMap + on-disk spill runs + Bloom filter.
    /// The `runs_dir`, `runs`, and `bloom` fields of `TieredIdem` are
    /// `#[serde(skip)]` and must be reattached via `idem.attach_dir()`
    /// after deserialization (or at store-open time).
    pub idem: TieredIdem,
    /// TxId UUID → (seq, frame position).
    pub txids: HashMap<Uuid, (Seq, FramePos)>,
    /// Per-asset lifetime (debits, credits) sums.
    pub sums: HashMap<AssetId, (i64, i64)>,
    pub last_at: Option<DateTime<Utc>>,
    /// Single-writer guard: set to `true` when a `BookWriter` is spawned.
    /// Cloned `BookState` values (e.g. snapshots) share the flag via `Arc`,
    /// so a writer spawned from a snapshot will also see the flag. A
    /// deserialized `BookState` gets a fresh `false` flag (via `default`).
    #[serde(skip, default = "default_writer_attached")]
    pub writer_attached: Arc<AtomicBool>,
}

fn default_writer_attached() -> Arc<AtomicBool> {
    Arc::new(AtomicBool::new(false))
}

impl Default for BookState {
    fn default() -> Self {
        Self {
            next_seq: 1,
            accounts: HashMap::new(),
            idem: TieredIdem::default(),
            txids: HashMap::new(),
            sums: HashMap::new(),
            last_at: None,
            writer_attached: Arc::new(AtomicBool::new(false)),
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
    ///
    /// Populated and read by the per-book writer; this file only declares the
    /// field.
    pub idem: HashMap<String, usize>,
}

impl Scratch {
    /// Fold an ACCEPTED transaction's postings into the projected balances.
    ///
    /// MUST be called at most once per transaction, and only for transactions
    /// that [`BookState::validate`] returned `Ok` for. `validate` seeds
    /// `scratch.raw` for every account the transaction touches; `stage` then
    /// advances those projections so later batchmates see the updated balances.
    ///
    /// Panics if called for a transaction whose accounts were not seeded by
    /// `validate` (a caller-contract violation).
    pub fn stage(&mut self, tx: &Transaction) {
        for p in &tx.postings {
            let key = p.account.to_key();
            let raw = self
                .raw
                .get_mut(&key)
                .expect("stage called for a tx that validate did not seed");
            match p.direction {
                Direction::Debit => {
                    *raw = raw
                        .checked_add(p.amount.minor())
                        .expect("overflow rejected by validate");
                }
                Direction::Credit => {
                    *raw = raw
                        .checked_sub(p.amount.minor())
                        .expect("overflow rejected by validate");
                }
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
    /// are NOT folded in — this method is idempotent: it only seeds, never
    /// advances the overlay. Call [`Scratch::stage`] after acceptance to fold
    /// this transaction's effects in so later batchmates see the projection.
    ///
    /// # Idempotency
    ///
    /// Idempotency is NOT checked here: the caller (the per-book writer) must
    /// dedup against [`BookState::idem`] (committed) and [`Scratch::idem`]
    /// (earlier in this batch) BEFORE validating.
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
                Direction::Debit => {
                    *entry = entry.checked_add(p.amount.minor()).ok_or_else(|| {
                        StoreError::Io(
                            format!("posting delta overflow for account {key}").into(),
                        )
                    })?;
                }
                Direction::Credit => {
                    *entry = entry.checked_sub(p.amount.minor()).ok_or_else(|| {
                        StoreError::Io(
                            format!("posting delta overflow for account {key}").into(),
                        )
                    })?;
                }
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

    /// Apply a committed transaction to the in-memory state, returning `Err`
    /// if a balance arithmetic operation overflows.
    ///
    /// This is the **safe** variant used during log replay, where corrupt or
    /// hand-edited frames can produce arithmetic that `validate` would have
    /// rejected. It mirrors the body of [`apply_transaction`] but replaces the
    /// `expect` calls with checked ops that return a descriptive error string.
    ///
    /// The hot (write) path calls [`apply_transaction`], which is a thin
    /// wrapper that delegates here and panics on `Err`: `validate` guarantees
    /// that accepted transactions cannot overflow, so a panic there is a
    /// programming error, not a data error.
    pub fn try_apply_transaction(
        &mut self,
        tx: &Transaction,
        seq: Seq,
        at: DateTime<Utc>,
        pos: FramePos,
    ) -> Result<(), String> {
        for p in &tx.postings {
            let key = p.account.to_key();
            if let Some(acct) = self.accounts.get_mut(&key) {
                acct.raw_balance = match p.direction {
                    Direction::Debit => acct
                        .raw_balance
                        .checked_add(p.amount.minor())
                        .ok_or_else(|| {
                            format!("balance overflow applying seq {seq} to account {key}")
                        })?,
                    Direction::Credit => acct
                        .raw_balance
                        .checked_sub(p.amount.minor())
                        .ok_or_else(|| {
                            format!("balance overflow applying seq {seq} to account {key}")
                        })?,
                };
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

            // Lifetime debit/credit sums. These are not validated like balances
            // and can overflow even when individual balances don't. Saturate
            // rather than panic post-fsync: trial_balance accuracy degrades but
            // the store stays alive.
            let sums = self.sums.entry(p.amount.asset().clone()).or_insert((0, 0));
            match p.direction {
                Direction::Debit => {
                    let new = sums.0.saturating_add(p.amount.minor());
                    if new == i64::MAX && sums.0 != i64::MAX {
                        tracing::warn!(
                            asset = p.amount.asset().as_str(),
                            "lifetime debit sum saturated at i64::MAX; trial_balance accuracy degraded"
                        );
                    }
                    sums.0 = new;
                }
                Direction::Credit => {
                    let new = sums.1.saturating_add(p.amount.minor());
                    if new == i64::MAX && sums.1 != i64::MAX {
                        tracing::warn!(
                            asset = p.amount.asset().as_str(),
                            "lifetime credit sum saturated at i64::MAX; trial_balance accuracy degraded"
                        );
                    }
                    sums.1 = new;
                }
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
        // Note: flush_spill (overflow drain to disk) is triggered by the
        // writer post-apply, not here, so we never do disk I/O inside apply.
        self.txids.insert(tx.id.0, (seq, pos));
        self.next_seq = seq + 1;
        self.last_at = Some(at);
        Ok(())
    }

    /// Apply a committed transaction to the in-memory state.
    ///
    /// Updates raw balances, posts a [`PostingEntry`] per posting (with
    /// running `raw_after`), advances lifetime debit/credit sums, indexes
    /// the idempotency key and TxId, and bumps `next_seq`/`last_at`.
    ///
    /// # Panics
    ///
    /// Panics if a balance arithmetic operation overflows. This cannot happen
    /// on the live write path because [`BookState::validate`] rejects
    /// transactions that would overflow before they are accepted; a panic here
    /// is therefore a programming error, not a data error. For replay (where
    /// the log may be corrupt or hand-edited), use [`try_apply_transaction`]
    /// instead — it returns `Err` rather than panicking.
    pub fn apply_transaction(
        &mut self,
        tx: &Transaction,
        seq: Seq,
        at: DateTime<Utc>,
        pos: FramePos,
    ) {
        self.try_apply_transaction(tx, seq, at, pos)
            .expect("overflow rejected by validate")
    }

    /// Apply an account-opened event to the in-memory state.
    ///
    /// Defensive against a double-applied event or malformed log — NOT a
    /// normal replay path: a valid log contains each open at most once (the
    /// writer rejects `AlreadyExists` before appending). A duplicate with a
    /// differing definition is silently ignored here because the writer already
    /// rejects such opens before append; replay only ever sees writer-accepted
    /// events.
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
            postings: PostingIndex::default(),
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
                    postings: PostingIndex::default(),
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
        assert_eq!(cash.postings.get(0).unwrap().raw_after, 100);
        assert_eq!(st.sums[&AssetId::new("USD")], (100, 100));
        assert!(st.idem.hot.contains_key("k1"));
        assert!(st.txids.contains_key(&t.id.0));
        assert_eq!(st.next_seq, 2);
    }

    #[test]
    fn overflow_in_projection_is_rejected_not_wrapped() {
        // Account with balance i64::MAX; a debit of 1 would wrap silently
        // without checked arithmetic. validate must return Err(StoreError::Io).
        let mut st = BookState::default();
        let id = acct("cash");
        st.accounts.insert(
            id.to_key(),
            AccountState {
                def: AccountDef { id: id.clone(), asset: AssetId::new("USD"), kind: AccountKind::Asset },
                cfg: AccountCfg { normal_side: Some(Direction::Debit), min_balance: None },
                raw_balance: i64::MAX,
                updated_seq: 0,
                postings: PostingIndex::default(),
            },
        );
        let mut scratch = Scratch::default();
        let t = tx("k1", vec![(id, 1, Direction::Debit)]);
        match st.validate(&t, &mut scratch) {
            Err(StoreError::Io(_)) => {}
            other => panic!("expected StoreError::Io for overflow, got {other:?}"),
        }
    }

    #[test]
    fn reserved_book_wins_over_unknown_account() {
        // A tx on a reserved book with a posting to a nonexistent account
        // must return InvalidBook, not UnknownAccount.
        let st = BookState::default();
        let mut scratch = Scratch::default();
        let ghost_id = AccountId { book: Book("_x".into()), path: "nope".into() };
        let mut t = tx("k1", vec![]);
        t.book = Book("_x".into());
        t.postings = vec![Posting {
            account: ghost_id,
            amount: Amount::new(1, AssetId::new("USD")),
            direction: Direction::Debit,
        }];
        assert!(matches!(st.validate(&t, &mut scratch), Err(StoreError::InvalidBook(_))));
    }

    #[test]
    fn same_account_twice_in_one_tx_folds_cumulatively() {
        // cash has min_balance 0 and balance 0.
        // tx: debit 100, credit 60, credit 60 → net = 100 - 60 - 60 = -20 < 0.
        // The ConstraintViolation's would_be must be -20.
        let st = state_with_accounts(); // cash min=0, balance=0
        let mut scratch = Scratch::default();
        let id = acct("cash");
        let t = tx(
            "k1",
            vec![
                (id.clone(), 100, Direction::Debit),
                (id.clone(), 60, Direction::Credit),
                (id.clone(), 60, Direction::Credit),
            ],
        );
        match st.validate(&t, &mut scratch) {
            Err(StoreError::ConstraintViolation { would_be, min_balance, .. }) => {
                assert_eq!(would_be, -20, "expected would_be=-20");
                assert_eq!(min_balance, 0);
            }
            other => panic!("expected ConstraintViolation, got {other:?}"),
        }
    }

    #[test]
    fn book_state_serde_round_trips() {
        // Build a BookState with one account and one applied tx, then round-trip
        // through serde_json and check key fields survive.
        let mut st = state_with_accounts();
        let t = tx("idem-key", vec![
            (acct("cash"), 50, Direction::Debit),
            (acct("rev"), 50, Direction::Credit),
        ]);
        let at = talea_core::store::ledger_now();
        st.apply_transaction(&t, 1, at, (1, 0));

        let json = serde_json::to_string(&st).expect("serialize");
        let rt: BookState = serde_json::from_str(&json).expect("deserialize");

        assert_eq!(rt.next_seq, st.next_seq);
        assert_eq!(
            rt.accounts[&acct("cash").to_key()].raw_balance,
            st.accounts[&acct("cash").to_key()].raw_balance,
        );
        assert!(rt.idem.hot.contains_key("idem-key"));
        assert_eq!(rt.idem.hot["idem-key"], st.idem.hot["idem-key"]);
        // txids has a Uuid key — verify it round-trips
        assert_eq!(rt.txids.len(), 1);
        assert!(rt.txids.contains_key(&t.id.0));
    }

    // -----------------------------------------------------------------------
    // PostingIndex tests
    // -----------------------------------------------------------------------

    fn make_entry(seq: Seq, at: DateTime<Utc>) -> PostingEntry {
        PostingEntry {
            seq,
            at,
            txid: TxId(uuid::Uuid::now_v7()),
            minor: 1,
            direction: Direction::Debit,
            raw_after: seq,
        }
    }

    #[test]
    fn posting_index_chunking_preserves_order_and_search() {
        use std::sync::Arc;

        let base = chrono::DateTime::parse_from_rfc3339("2025-01-01T00:00:00Z")
            .unwrap()
            .with_timezone(&chrono::Utc);

        let total = CHUNK * 2 + 100;
        let mut idx = PostingIndex::default();

        for i in 0..total {
            let seq = (i + 1) as Seq;
            let at = base + chrono::Duration::seconds(i as i64);
            idx.push(make_entry(seq, at));
        }

        // Length is correct.
        assert_eq!(idx.len(), total);
        assert!(!idx.is_empty());

        // Exactly two sealed chunks were created (the third batch is in the tail).
        assert_eq!(idx.sealed.len(), 2);

        // partition_point_seq at chunk boundaries, mid-chunk, 0, len.
        assert_eq!(idx.partition_point_seq(0), 0);
        assert_eq!(idx.partition_point_seq(CHUNK as Seq), CHUNK);
        assert_eq!(idx.partition_point_seq((CHUNK * 2) as Seq), CHUNK * 2);
        assert_eq!(idx.partition_point_seq(total as Seq), total);
        // Mid first chunk.
        let mid = CHUNK / 2;
        assert_eq!(idx.partition_point_seq(mid as Seq), mid);
        // One past sealed boundary.
        assert_eq!(idx.partition_point_seq((CHUNK + 1) as Seq), CHUNK + 1);

        // partition_point_at mirrors partition_point_seq (seq and at both advance together).
        let t_chunk_boundary = base + chrono::Duration::seconds((CHUNK - 1) as i64);
        let pp_at = idx.partition_point_at(t_chunk_boundary);
        assert_eq!(pp_at, CHUNK, "partition_point_at at chunk boundary must equal CHUNK");

        // get: first, last, cross-chunk.
        assert_eq!(idx.get(0).unwrap().seq, 1);
        assert_eq!(idx.get(CHUNK - 1).unwrap().seq, CHUNK as Seq);
        assert_eq!(idx.get(CHUNK).unwrap().seq, (CHUNK + 1) as Seq);
        assert_eq!(idx.get(total - 1).unwrap().seq, total as Seq);
        assert!(idx.get(total).is_none());

        // iter_from: starts at correct entry and crosses chunk boundary.
        let cross_start = CHUNK - 2;
        let items: Vec<Seq> = idx.iter_from(cross_start).take(5).map(|e| e.seq).collect();
        let expected: Vec<Seq> = ((cross_start + 1) as Seq..=(cross_start + 5) as Seq).collect();
        assert_eq!(items, expected, "iter_from must cross chunk boundary seamlessly");

        // Clone shares sealed chunks via Arc::ptr_eq.
        let clone = idx.clone();
        assert_eq!(clone.sealed.len(), idx.sealed.len());
        for (orig, cloned) in idx.sealed.iter().zip(clone.sealed.iter()) {
            assert!(Arc::ptr_eq(orig, cloned), "sealed chunks must be Arc-shared after clone");
        }
    }

    #[test]
    fn posting_index_serde_round_trips() {
        let base = chrono::DateTime::parse_from_rfc3339("2025-06-01T00:00:00Z")
            .unwrap()
            .with_timezone(&chrono::Utc);

        let total = CHUNK + 50; // spans one full sealed chunk + tail
        let mut idx = PostingIndex::default();
        for i in 0..total {
            let seq = (i + 1) as Seq;
            let at = base + chrono::Duration::milliseconds(i as i64);
            idx.push(make_entry(seq, at));
        }

        let json = serde_json::to_string(&idx).expect("serialize PostingIndex");
        let rt: PostingIndex = serde_json::from_str(&json).expect("deserialize PostingIndex");

        assert_eq!(rt.len(), idx.len(), "round-trip must preserve entry count");
        // Re-chunking: first chunk must be sealed.
        assert_eq!(rt.sealed.len(), 1, "one full sealed chunk expected after re-chunk");
        assert_eq!(rt.tail.len(), 50, "tail must contain the 50 partial entries");

        // All entries in the same order.
        for i in 0..total {
            let orig = idx.get(i).unwrap();
            let got = rt.get(i).unwrap();
            assert_eq!(orig.seq, got.seq, "seq mismatch at index {i}");
            assert_eq!(orig.at, got.at, "at mismatch at index {i}");
            assert_eq!(orig.raw_after, got.raw_after, "raw_after mismatch at index {i}");
        }
    }
}
