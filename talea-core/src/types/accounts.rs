//! Accounts: open, namespaced, consumer-defined

use serde::{Deserialize, Serialize};

use crate::types::{Direction, assets::AssetId};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AccountDef {
    pub id: AccountId,
    pub asset: AssetId,
    pub kind: AccountKind,
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct Book(pub String); // per-consumer namespace: "onramp", "gateway"...

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct AccountId {
    pub book: Book,
    pub path: String,
} // e.g. { onramp, "treasury:btc" }

impl AccountId {
    pub fn to_key(&self) -> String {
        let key = format!("{}:{}", &self.book.0, &self.path);

        key
    }
}

impl Book {
    /// Book names starting with '_' are reserved for the ledger itself
    /// (e.g. "_system" holds AssetRegistered events).
    pub fn is_reserved(&self) -> bool {
        self.0.starts_with('_')
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AccountKind {
    Asset,
    Liability,
    Income,
    Expense,
    Equity,
    Clearing,
}

impl AccountKind {
    pub fn normal_side(&self) -> Option<Direction> {
        match self {
            AccountKind::Asset | AccountKind::Expense => Some(Direction::Debit),
            AccountKind::Liability | AccountKind::Income | AccountKind::Equity => {
                Some(Direction::Credit)
            }
            AccountKind::Clearing => None,
        }
    }

    /// DB column codes — these coincide with the serde snake_case wire form
    /// today, but they are separate encodings: change one deliberately.
    pub fn as_str(&self) -> &str {
        match self {
            AccountKind::Asset => "asset",
            AccountKind::Liability => "liability",
            AccountKind::Income => "income",
            AccountKind::Expense => "expense",
            AccountKind::Equity => "equity",
            AccountKind::Clearing => "clearing",
        }
    }

    pub fn from_db(s: &str) -> Option<Self> {
        match s {
            "asset" => Some(AccountKind::Asset),
            "liability" => Some(AccountKind::Liability),
            "income" => Some(AccountKind::Income),
            "expense" => Some(AccountKind::Expense),
            "equity" => Some(AccountKind::Equity),
            "clearing" => Some(AccountKind::Clearing),
            _ => None,
        }
    }
}
