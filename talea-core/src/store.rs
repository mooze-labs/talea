use async_trait::async_trait;
use chrono::{DateTime, Utc};
use futures::stream::BoxStream;

use crate::events::LedgerEvent;
use crate::types::{
    AccountDef, AccountId, Amount, AssetDef, AssetId, Book, Direction, Seq, Transaction, TxId,
};

pub type EventStream = BoxStream<'static, Result<Sequenced<LedgerEvent>, StoreError>>;

/// Reserved book that holds book-agnostic events (AssetRegistered).
/// User books may not start with '_'.
pub const SYSTEM_BOOK: &str = "_system";

pub fn system_book() -> Book {
    Book(SYSTEM_BOOK.to_string())
}

/// Now, truncated to whole microseconds — the timestamp stores must use
/// for everything they persist.
///
/// Ledger timestamps must round-trip identically through every backend.
/// Postgres TIMESTAMPTZ holds microseconds, while Linux clocks produce
/// nanoseconds: an untruncated `Utc::now()` makes a commit's in-memory
/// `Committed.at` differ from its own database read-back, so an idempotent
/// replay would return a value unequal to the original. (macOS clocks are
/// effectively microsecond-precision, which hides the bug locally.)
pub fn ledger_now() -> DateTime<Utc> {
    let now = Utc::now();
    DateTime::from_timestamp_micros(now.timestamp_micros())
        .expect("current time is within chrono's representable range")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ledger_now_is_microsecond_aligned() {
        for _ in 0..1_000 {
            let t = ledger_now();
            assert_eq!(
                t.timestamp_subsec_nanos() % 1_000,
                0,
                "ledger_now leaked sub-microsecond precision: {t:?}"
            );
        }
    }
}

#[async_trait]
pub trait Store: Send + Sync {
    /// Register an asset. Idempotent on id: identical def => Ok(());
    /// same id with a different def => AlreadyExists.
    /// Appends an AssetRegistered event to the "_system" book.
    async fn register_asset(&self, asset: &AssetDef) -> Result<(), StoreError>;

    /// Open an account. Idempotent on id, same rule as register_asset.
    /// Appends an AccountOpened event to the account's book.
    async fn open_account(&self, def: &AccountDef, cfg: &AccountCfg) -> Result<(), StoreError>;

    /// Append one transaction's event atomically and exactly-once.
    /// Duplicate `idem` => Ok(prior Committed), not an error.
    async fn commit(&self, transaction: &Transaction) -> Result<Committed, StoreError>;

    /// Current balance (projection) or point-in-time (replay from log).
    /// `as_of` filters on commit time. The amount is the normal-side-adjusted
    /// effective balance; `updated_seq` is the last seq that touched the
    /// account (0 if never posted to).
    async fn balance(
        &self,
        account: &AccountId,
        as_of: Option<DateTime<Utc>>,
    ) -> Result<BalanceSnapshot, StoreError>;

    /// Registry read; Ok(None) for unregistered ids.
    async fn asset(&self, id: &AssetId) -> Result<Option<AssetDef>, StoreError>;

    /// Postings for one account, seq-ascending. `after_seq` is EXCLUSIVE
    /// (None = from the beginning); resume by passing the last seen seq.
    /// `limit` counts distinct seqs (transactions), so postings of one
    /// transaction are never split across pages.
    async fn account_history(
        &self,
        account: &AccountId,
        after_seq: Option<Seq>,
        limit: usize,
    ) -> Result<Vec<PostingRecord>, StoreError>;

    /// Committed transaction by id; Ok(None) if unknown.
    async fn transaction(&self, txid: &TxId) -> Result<Option<StoredTransaction>, StoreError>;

    /// Per-asset debit/credit sums for a book, optionally as of commit time.
    async fn trial_balance(
        &self,
        book: &Book,
        as_of: Option<DateTime<Utc>>,
    ) -> Result<Vec<TrialBalanceRow>, StoreError>;

    /// Ordered, paginated log read - rebuilds, reconciliation, stream catch-up.
    /// `from` is inclusive: resume by passing last_seen + 1.
    async fn read_events(
        &self,
        book: &Book,
        from: Seq,
        limit: usize,
    ) -> Result<Vec<Sequenced<LedgerEvent>>, StoreError>;

    fn subscribe(&self, book: &Book, from: Seq) -> EventStream;
}

#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
pub struct AccountCfg {
    pub normal_side: Option<Direction>,
    pub min_balance: Option<i64>,
}

#[derive(Debug, Clone, PartialEq)]
pub struct Committed {
    pub txid: TxId,
    pub seq: Seq,
    pub at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq)]
pub struct BalanceSnapshot {
    pub amount: Amount,
    pub updated_seq: Seq,
}

#[derive(Debug, Clone)]
pub struct PostingRecord {
    pub seq: Seq,
    pub txid: TxId,
    pub account: AccountId,
    pub amount: Amount,
    pub direction: Direction,
    pub at: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub struct StoredTransaction {
    pub transaction: Transaction,
    pub seq: Seq,
    pub at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TrialBalanceRow {
    pub asset: AssetId,
    pub debits: i64,
    pub credits: i64,
}

#[derive(Debug, Clone)]
pub struct Sequenced<T> {
    pub seq: Seq,
    pub at: DateTime<Utc>,
    pub event: T,
}

#[derive(Debug, thiserror::Error)]
pub enum StoreError {
    #[error(
        "violated constraint for account {account:?}. min balance: {min_balance}, would be: {would_be}"
    )]
    ConstraintViolation {
        account: AccountId,
        min_balance: i64,
        would_be: i64,
    },
    #[error("unknown account {0:?}")]
    UnknownAccount(AccountId),
    #[error("unknown asset {0:?}")]
    UnknownAsset(AssetId),
    #[error(
        "asset mismatch for account {account:?}: account holds {account_asset:?}, posting uses {asset:?}"
    )]
    AssetMismatch {
        account: AccountId,
        account_asset: AssetId,
        asset: AssetId,
    },
    #[error("{what} already exists with a different definition")]
    AlreadyExists { what: String },
    #[error("invalid book {0:?}: names starting with '_' are reserved")]
    InvalidBook(Book),
    #[error("storage backend error: {0}")]
    Io(#[source] Box<dyn std::error::Error + Send + Sync>),
}
