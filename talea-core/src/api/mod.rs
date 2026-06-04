use async_trait::async_trait;
use chrono::{DateTime, Utc};
use futures::stream::BoxStream;

mod error;
mod requests;
mod responses;

pub use error::*;
pub use requests::*;
pub use responses::*;

use crate::{events::LedgerEvent, types::Seq};

pub type ApiResult<T> = Result<T, ApiError>;
pub type EventStream = BoxStream<'static, ApiResult<LedgerEvent>>;

/// The full server contract. Each transport adapter is a thin translation
/// onto it.
#[async_trait]
pub trait LedgerApi: Send + Sync {
    // --- registry (idempotent on id) ---
    async fn register_asset(&self, draft: AssetDraft) -> ApiResult<()>;
    async fn open_account(&self, draft: AccountDraft) -> ApiResult<()>;

    // --- write (idempotent on idempotency_key) ---
    async fn post(&self, draft: TransactionDraft) -> ApiResult<Posted>;

    // --- reads ---
    async fn balance(&self, account: &str, as_of: DateTime<Utc>) -> ApiResult<BalanceView>;
    async fn account_history(&self, account: &str, page: Page) -> ApiResult<Paged<PostingView>>;
    async fn transaction(&self, tx_id: &str) -> ApiResult<TransactionView>;
    async fn trial_balance(
        &self,
        book: &str,
        as_of: Option<DateTime<Utc>>,
    ) -> ApiResult<TrialBalance>;

    // --- stream (at least once; resume from a cursor) ---
    async fn subscribe(&self, book: &str, from: Seq) -> ApiResult<EventStream>;
}
