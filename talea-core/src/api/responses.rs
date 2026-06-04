use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::{
    api::requests::WireAmount,
    types::{Direction, ExternalRef, Seq},
};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
pub struct Posted {
    pub tx_id: String,
    pub seq: Seq,
    pub at: DateTime<Utc>,
    pub deduplicated: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
pub struct BalanceView {
    pub account: String,
    pub asset: String,
    pub balance: String,
    pub as_of: Option<DateTime<Utc>>,
    pub updated_seq: Seq,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
pub struct PostingView {
    pub seq: Seq,
    pub tx_id: String,
    pub account: String,
    pub amount: WireAmount,
    pub direction: Direction,
    pub at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
pub struct TransactionView {
    pub tx_id: String,
    pub book: String,
    pub seq: Seq,
    pub at: DateTime<Utc>,
    pub postings: Vec<PostingView>,
    pub external_refs: Vec<ExternalRef>,
    pub metadata: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
pub struct TrialBalanceLine {
    pub asset: String,
    pub debits: i64,
    pub credits: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
pub struct TrialBalance {
    pub book: String,
    pub as_of: Option<DateTime<Utc>>,
    pub lines: Vec<TrialBalanceLine>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
pub struct Paged<T> {
    pub items: Vec<T>,
    pub next: Option<Seq>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
pub struct EventEnvelope {
    pub seq: Seq,
    pub at: DateTime<Utc>,
    pub kind: String,
    pub payload: serde_json::Value,
}
