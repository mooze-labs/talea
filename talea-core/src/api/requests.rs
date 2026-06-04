use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::types::{AssetClass, Direction, ExternalRef, Seq};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WireAmount {
    pub minor: i64,
    pub asset: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct AssetDraft {
    pub id: String,
    pub class: String,
    pub network: Option<String>, // required for crypto, e.g. "bitcoin", "ethereum".
    pub native_id: Option<String>, // contract / asset id; null for a chain base coin.
    pub precision: u8,
    pub name: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct AccountDraft {
    pub book: String,
    pub path: String,
    pub asset: String,
    pub kind: String,
    pub normal_side: Option<Direction>, // null = clearing
    pub min_balance: Option<i64>,       // null = unconstrained
}

#[derive(Debug, Clone, Deserialize)]
pub struct PostingDraft {
    pub account: String,
    pub amount: WireAmount,
    pub direction: Direction,
}

#[derive(Debug, Clone, Deserialize)]
pub struct TransactionDraft {
    pub book: String,
    pub idempotency_key: String,
    pub postings: Vec<PostingDraft>,
    #[serde(default)]
    pub external_refs: Vec<ExternalRef>,
    #[serde(default)]
    pub metadata: serde_json::Value,
    /// Business/event time; the server defaults it to now when absent.
    #[serde(default)]
    pub occurred_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct Page {
    pub after_seq: Option<Seq>,
    pub limit: u32,
}
