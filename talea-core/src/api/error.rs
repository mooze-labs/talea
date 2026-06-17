use serde::{Deserialize, Serialize};
use std::fmt;

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

impl fmt::Display for ApiError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Unbalanced {
                asset,
                debit,
                credit,
            } => {
                write!(
                    f,
                    "unbalanced transaction for {}: debit {} != credit {}",
                    asset, debit, credit
                )
            }
            Self::AssetMismatch {
                account,
                account_asset,
                asset,
            } => {
                write!(
                    f,
                    "asset mismatch for account {}: has {}, posting is {}",
                    account, account_asset, asset
                )
            }
            Self::InvalidAmount { amount } => {
                write!(f, "invalid amount: {}", amount)
            }
            Self::UnknownAsset { asset } => {
                write!(f, "unknown asset: {}", asset)
            }
            Self::UnknownAccount { account } => {
                write!(f, "unknown account: {}", account)
            }
            Self::ConstraintViolation {
                account,
                min_balance,
                would_be,
            } => {
                write!(
                    f,
                    "constraint violation for account {}: minimum balance is {}, would be {}",
                    account, min_balance, would_be
                )
            }
            Self::AlreadyExists { what } => {
                write!(f, "already exists: {}", what)
            }
            Self::InvalidDraft { field, reason } => {
                write!(f, "invalid draft field {}: {}", field, reason)
            }
            Self::NotFound { what } => {
                write!(f, "not found: {}", what)
            }
            Self::Transport { message } => {
                write!(f, "transport error: {}", message)
            }
            Self::Unauthorized => {
                write!(f, "unauthorized")
            }
            Self::Forbidden { book } => {
                write!(f, "forbidden for book: {}", book)
            }
            Self::Overloaded => {
                write!(f, "overloaded")
            }
            Self::Timeout => {
                write!(f, "timeout")
            }
            Self::Internal { message } => {
                write!(f, "internal error: {}", message)
            }
        }
    }
}

impl std::error::Error for ApiError {}
