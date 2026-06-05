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
    /// Flat `book:path` key used for persisted account_key columns and error
    /// payloads. The separator is the first *unescaped* ':' — ':' and '\\'
    /// inside the book component are '\\'-escaped, so distinct (book, path)
    /// pairs can never collide (e.g. ("a:b", "c") vs ("a", "b:c")). Books
    /// without those characters produce the same keys as ever, so existing
    /// persisted keys are unaffected. The path is the final component and
    /// needs no escaping.
    pub fn to_key(&self) -> String {
        let mut key = String::with_capacity(self.book.0.len() + self.path.len() + 1);
        for c in self.book.0.chars() {
            if c == ':' || c == '\\' {
                key.push('\\');
            }
            key.push(c);
        }
        key.push(':');
        key.push_str(&self.path);
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

#[cfg(test)]
mod tests {
    use super::*;

    fn id(book: &str, path: &str) -> AccountId {
        AccountId {
            book: Book(book.into()),
            path: path.into(),
        }
    }

    /// The historical bug: ("a:b", "c") and ("a", "b:c") both produced "a:b:c".
    #[test]
    fn to_key_is_injective_across_the_book_path_split() {
        assert_ne!(id("a:b", "c").to_key(), id("a", "b:c").to_key());
        assert_ne!(id("a\\", "c").to_key(), id("a", "\\:c").to_key());
    }

    /// Books without ':' or '\\' keep their exact pre-escaping keys —
    /// persisted account_key values must not shift.
    #[test]
    fn to_key_is_unchanged_for_plain_books() {
        assert_eq!(id("onramp", "treasury:btc").to_key(), "onramp:treasury:btc");
        assert_eq!(id("_system", "events").to_key(), "_system:events");
    }
}
