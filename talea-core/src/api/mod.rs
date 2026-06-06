use async_trait::async_trait;
use chrono::{DateTime, Utc};
use futures::stream::BoxStream;

mod error;
mod requests;
mod responses;

pub use error::*;
pub use requests::*;
pub use responses::*;

use crate::types::Seq;

pub type ApiResult<T> = Result<T, ApiError>;
pub type EventStream = BoxStream<'static, ApiResult<EventEnvelope>>;

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

/// The full ledger contract. Each transport adapter is a thin translation
/// onto it: the server implements it over a `Store`, the client over HTTP —
/// code written against this trait runs unchanged against either.
#[async_trait]
pub trait LedgerApi: Send + Sync {
    /// Register an asset. Idempotent on id: an identical re-registration
    /// succeeds, the same id with a different definition is `AlreadyExists`.
    /// Crypto assets require a network; precision is immutable forever.
    async fn register_asset(&self, draft: AssetDraft) -> ApiResult<()>;

    /// Open an account in a book. Idempotent on book+path with the same
    /// rule as assets. Book names starting with '_' are reserved.
    async fn open_account(&self, draft: AccountDraft) -> ApiResult<()>;

    /// Post a balanced transaction (per-asset debits == credits, all
    /// amounts positive). Idempotent on the caller-supplied idempotency key
    /// (unique per book): a replay returns the original `Posted` with
    /// `deduplicated: true` and never double-posts — which is what makes
    /// retrying on failure unconditionally safe.
    async fn post(&self, draft: TransactionDraft) -> ApiResult<Posted>;

    /// Post multiple drafts and return one result per input, preserving
    /// input order (`out[i]` corresponds to `drafts[i]`).
    ///
    /// **Positional contract** — every draft is attempted independently.
    /// A failure (validation error, unknown account, unbalanced, …) in one
    /// slot sets that slot's `Err`; it has no effect on any other slot.
    ///
    /// **Idempotency deduplication** — two drafts with the same idempotency
    /// key, whether within this batch or against historical commits, both
    /// resolve to the original `Posted` (with `deduplicated: true`) exactly
    /// as concurrent single `post` calls would. This is a property of the
    /// per-book write router, not special batch logic.
    ///
    /// **Empty input** returns an empty `Vec` immediately.
    ///
    /// Implementations must preserve input order in the returned `Vec`.
    async fn post_batch(&self, drafts: Vec<TransactionDraft>) -> Vec<ApiResult<Posted>>;

    /// Effective (normal-side-adjusted) balance, rendered as a decimal
    /// string using the asset's precision. `as_of` replays by commit time;
    /// `None` reads the live projection.
    async fn balance(
        &self,
        book: &str,
        path: &str,
        as_of: Option<DateTime<Utc>>,
    ) -> ApiResult<BalanceView>;

    /// Postings for one account, seq-ascending. `page.after_seq` is
    /// exclusive (resume with the last seen seq); `limit` counts
    /// transactions, so one transaction's postings never split across
    /// pages. `Paged::next` is `None` once exhausted.
    async fn account_history(
        &self,
        book: &str,
        path: &str,
        page: Page,
    ) -> ApiResult<Paged<PostingView>>;

    /// A committed transaction by its id (UUID assigned at post time).
    /// Unknown ids are `NotFound`.
    async fn transaction(&self, tx_id: &str) -> ApiResult<TransactionView>;

    /// Per-asset debit/credit sums for a book, optionally as of commit
    /// time. Every line balances when the ledger does.
    async fn trial_balance(
        &self,
        book: &str,
        as_of: Option<DateTime<Utc>>,
    ) -> ApiResult<TrialBalance>;

    /// Live event stream for a book, starting at seq `from` (inclusive:
    /// catch-up first, then tail). Delivery is at-least-once; consumers
    /// resume after a disconnect from their last seen `EventEnvelope::seq`.
    /// The HTTP client implementation does that resumption automatically.
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
        assert_eq!(format_minor(100, 3), "0.100"); // digits.len() == precision boundary
        assert_eq!(format_minor(0, 2), "0.00");
        assert_eq!(format_minor(42, 0), "42");
        assert_eq!(format_minor(-42, 0), "-42");
        assert_eq!(format_minor(i64::MIN, 2), "-92233720368547758.08");
    }

    #[test]
    fn api_error_new_variants_serialize_tagged() {
        let e = ApiError::InvalidDraft {
            field: "class".into(),
            reason: "unknown asset class".into(),
        };
        let json = serde_json::to_string(&e).unwrap();
        assert!(json.contains("\"error\":\"invalid_draft\""), "got: {json}");

        let e = ApiError::NotFound {
            what: "transaction x".into(),
        };
        let json = serde_json::to_string(&e).unwrap();
        assert!(json.contains("\"error\":\"not_found\""), "got: {json}");

        let e = ApiError::AssetMismatch {
            account: "onramp:cash".into(),
            account_asset: "USD".into(),
            asset: "EUR".into(),
        };
        let json = serde_json::to_string(&e).unwrap();
        assert!(json.contains("\"asset\":\"EUR\""), "got: {json}");

        let e = ApiError::Transport {
            message: "connection refused".into(),
        };
        let json = serde_json::to_string(&e).unwrap();
        assert!(json.contains("\"error\":\"transport\""), "got: {json}");
    }

    #[test]
    fn transaction_draft_occurred_at_defaults_to_none() {
        let draft: TransactionDraft =
            serde_json::from_str(r#"{"book":"b","idempotency_key":"k","postings":[]}"#).unwrap();
        assert!(draft.occurred_at.is_none());
    }
}
