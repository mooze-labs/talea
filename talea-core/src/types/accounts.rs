//! Accounts: open, namespaced, consumer-defined

use crate::types::{Direction, assets::AssetId};

#[derive(Debug, Clone)]
pub struct AccountDef {
    pub id: AccountId,
    pub asset: AssetId,
    pub kind: AccountKind,
}

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct Book(pub String); // per-consumer namespace: "onramp", "gateway"...

#[derive(Debug, Clone)]
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

#[derive(Debug, Clone, PartialEq, Eq)]
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
}
