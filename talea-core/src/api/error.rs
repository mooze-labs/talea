use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize)]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
#[serde(tag = "error", rename_all = "snake_case")]
pub enum ApiError {
    Unbalanced {
        asset: String,
        debit: i64,
        credit: i64,
    },
    AssetMismatch {
        account: String,
        account_asset: String,
        asset: String,
    },
    InvalidAmount {
        amount: i64,
    },
    UnknownAsset {
        asset: String,
    },
    UnknownAccount {
        account: String,
    },
    ConstraintViolation {
        account: String,
        min_balance: i64,
        would_be: i64,
    },
    AlreadyExists {
        what: String,
    },
    InvalidDraft {
        field: String,
        reason: String,
    },
    NotFound {
        what: String,
    },
    /// Client-side transport failure (network error, retry budget exhausted,
    /// undecodable response). Never produced by the server.
    Transport {
        message: String,
    },
    Unauthorized,
    /// The token is valid but its scope does not cover this book/operation.
    /// For the global asset registry the book field carries "*".
    Forbidden {
        book: String,
    },
    /// The per-book write queue is full. Retry with the same idempotency
    /// key — overload degrades to "retry later", never "maybe applied twice".
    Overloaded,
    /// The request exceeded the server's processing deadline. Safe to retry
    /// with the same idempotency key.
    Timeout,
    Internal {
        message: String,
    },
}
