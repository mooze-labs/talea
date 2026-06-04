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
    /// `as_of` filters on commit time. Returns the normal-side-adjusted
    /// effective balance.
    async fn balance(
        &self,
        account: &AccountId,
        as_of: Option<DateTime<Utc>>,
    ) -> Result<Amount, StoreError>;

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
