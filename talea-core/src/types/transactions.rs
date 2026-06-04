//! Postings and transactions
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::types::{AccountId, Amount, Book};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transaction {
    pub id: TxId,
    pub book: Book,
    pub postings: Vec<Posting>,
    pub idempotency_key: IdempotencyKey,
    pub external_refs: Vec<ExternalRef>,
    pub metadata: serde_json::Value,
    pub occurred_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Posting {
    pub account: AccountId,
    pub amount: Amount,
    pub direction: Direction,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Direction {
    Debit,
    Credit,
}

impl Direction {
    pub fn as_str(&self) -> &str {
        match self {
            Direction::Debit => "D",
            Direction::Credit => "C",
        }
    }

    pub fn from_db(s: &str) -> Option<Self> {
        match s {
            "D" => Some(Direction::Debit),
            "C" => Some(Direction::Credit),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExternalRef {
    pub kind: String,
    pub value: String,
} // "btc_txid", "ln_preimage", etc...

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct TxId(pub Uuid);

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct IdempotencyKey(pub String);
