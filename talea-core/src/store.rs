use async_trait::async_trait;
use chrono::{DateTime, Utc};
use futures::stream::BoxStream;

use crate::events::LedgerEvent;
use crate::types::{
    AccountId, Amount, AssetId, Book, Direction, IdempotencyKey, Seq, Transaction, TxId,
};

pub type EventStream = BoxStream<'static, Result<Sequenced<LedgerEvent>, StoreError>>;

#[async_trait]
pub trait Store {
    /// Append one transaction's event atomically and exactly-once.
    /// Duplicate `idem` => Ok(prior Commited), not an error.
    async fn commit(&self, transaction: &Transaction) -> Result<Committed, StoreError>;

    /// Current balance (projection) or point-in-time (replay from log);
    async fn balance(
        &self,
        account: &AccountId,
        as_of: Option<DateTime<Utc>>,
    ) -> Result<Amount, StoreError>;

    /// Ordered, paginated log read - rebuilds, reconciliation, stream catch-up.
    async fn read_events(
        &self,
        book: &Book,
        from: Seq,
        limit: usize,
    ) -> Result<Vec<Sequenced<LedgerEvent>>, StoreError>;

    fn subscribe(&self, book: &Book, from: Seq) -> EventStream;
}

#[derive(Debug, Clone)]
pub struct AccountCfg {
    pub normal_side: Option<Direction>,
    pub min_balance: Option<i64>,
}

pub struct Committed {
    pub txid: TxId,
    pub seq: Seq,
    pub at: DateTime<Utc>,
}
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
    #[error("unknown account")]
    UnknownAccount(AccountId),
    #[error("unknown asset")]
    UnknownAsset(AssetId),
    #[error("io")]
    Io,
}
