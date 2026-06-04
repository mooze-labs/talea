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

/// Render minor units as a decimal string using the asset's precision.
/// Pure string arithmetic — safe for any precision, no 10^p overflow.
pub fn format_minor(minor: i64, precision: u8) -> String {
    let precision = precision as usize;
    if precision == 0 {
        return minor.to_string();
    }
    let sign = if minor < 0 { "-" } else { "" };
    let digits = minor.unsigned_abs().to_string();
    if digits.len() > precision {
        let (whole, frac) = digits.split_at(digits.len() - precision);
        format!("{sign}{whole}.{frac}")
    } else {
        format!("{sign}0.{digits:0>precision$}")
    }
}

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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn format_minor_renders_decimal_strings() {
        assert_eq!(format_minor(150000, 2), "1500.00");
        assert_eq!(format_minor(150000, 8), "0.00150000");
        assert_eq!(format_minor(-1500, 2), "-15.00");
        assert_eq!(format_minor(5, 2), "0.05");
        assert_eq!(format_minor(0, 2), "0.00");
        assert_eq!(format_minor(42, 0), "42");
        assert_eq!(format_minor(-42, 0), "-42");
        assert_eq!(format_minor(i64::MIN, 2), "-92233720368547758.08");
    }
}
