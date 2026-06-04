use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize)]
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
    Unauthorized,
    Internal {
        message: String,
    },
}
