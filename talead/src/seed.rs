//! Declarative seed file (talea.seed.toml): parse, validate, apply.

use std::collections::HashSet;

use serde::Deserialize;
use talea_core::store::{AccountCfg, StoreError};
use talea_core::types::{
    AccountDef, AccountId, AccountKind, AssetClass, AssetDef, AssetId, Book, Direction,
};

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SeedFile {
    #[serde(default)]
    pub assets: Vec<SeedAsset>,
    #[serde(default)]
    pub accounts: Vec<SeedAccount>,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SeedAsset {
    pub id: String,
    pub class: AssetClass,
    pub precision: u8,
    pub name: String,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SeedAccount {
    pub book: String,
    pub path: String,
    pub asset: String,
    pub kind: AccountKind,
    #[serde(default)]
    pub min_balance: Option<i64>,
    #[serde(default)]
    pub normal_side: Option<Direction>,
}

#[derive(Debug, thiserror::Error)]
pub enum SeedError {
    #[error("failed to parse seed file: {0}")]
    Parse(#[from] toml::de::Error),
    #[error("duplicate asset id {0:?} in seed file")]
    DuplicateAsset(String),
    #[error("duplicate account {0:?} in seed file")]
    DuplicateAccount(String),
    #[error("book {0:?} is reserved (names starting with '_' belong to the ledger)")]
    ReservedBook(String),
    #[error(
        "account {account:?} references asset {asset:?}, which is neither in the seed file nor registered in the store"
    )]
    MissingAsset { account: String, asset: String },
    #[error("asset {id:?} already registered with a different definition ({diff})")]
    AssetConflict { id: String, diff: String },
    #[error(transparent)]
    Store(#[from] StoreError),
}

pub fn parse(input: &str) -> Result<SeedFile, SeedError> {
    let seed: SeedFile = toml::from_str(input)?;
    validate(&seed)?;
    Ok(seed)
}

/// File-local checks only; store-dependent checks (asset refs) happen in `apply`.
fn validate(seed: &SeedFile) -> Result<(), SeedError> {
    let mut asset_ids = HashSet::new();
    for asset in &seed.assets {
        if !asset_ids.insert(asset.id.as_str()) {
            return Err(SeedError::DuplicateAsset(asset.id.clone()));
        }
    }
    let mut account_keys = HashSet::new();
    for account in &seed.accounts {
        if account.book.starts_with('_') {
            return Err(SeedError::ReservedBook(account.book.clone()));
        }
        let key = format!("{}:{}", account.book, account.path);
        if !account_keys.insert(key.clone()) {
            return Err(SeedError::DuplicateAccount(key));
        }
    }
    Ok(())
}

impl SeedAsset {
    pub fn to_def(&self) -> AssetDef {
        AssetDef {
            id: AssetId::new(self.id.clone()),
            class: self.class.clone(),
            precision: self.precision,
            name: self.name.clone(),
        }
    }
}

impl SeedAccount {
    pub fn to_def(&self) -> (AccountDef, AccountCfg) {
        (
            AccountDef {
                id: AccountId { book: Book(self.book.clone()), path: self.path.clone() },
                asset: AssetId::new(self.asset.clone()),
                kind: self.kind.clone(),
            },
            AccountCfg {
                normal_side: self.normal_side.clone(),
                min_balance: self.min_balance,
            },
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const VALID: &str = r#"
[[assets]]
id = "USD"
class = "fiat"
precision = 2
name = "US Dollar"

[[assets]]
id = "BTC"
class = { crypto = { network = "bitcoin" } }
precision = 8
name = "Bitcoin"

[[accounts]]
book = "onramp"
path = "treasury:usd"
asset = "USD"
kind = "asset"
min_balance = 0

[[accounts]]
book = "onramp"
path = "fees:btc"
asset = "BTC"
kind = "income"
"#;

    #[test]
    fn parses_valid_seed() {
        let seed = parse(VALID).unwrap();
        assert_eq!(seed.assets.len(), 2);
        assert_eq!(seed.accounts.len(), 2);
        assert_eq!(seed.assets[0].id, "USD");
        assert_eq!(seed.accounts[0].min_balance, Some(0));
        assert_eq!(seed.accounts[1].min_balance, None);
    }

    #[test]
    fn converts_to_core_types() {
        let seed = parse(VALID).unwrap();
        let def = seed.assets[0].to_def();
        assert_eq!(def.id, AssetId::new("USD"));
        assert_eq!(def.precision, 2);
        let (acc, cfg) = seed.accounts[0].to_def();
        assert_eq!(acc.id.book, Book("onramp".into()));
        assert_eq!(acc.id.path, "treasury:usd");
        assert_eq!(acc.kind, AccountKind::Asset);
        assert_eq!(cfg.min_balance, Some(0));
        assert_eq!(cfg.normal_side, None);
    }

    #[test]
    fn rejects_bad_kind() {
        let input = VALID.replace("kind = \"asset\"", "kind = \"wealth\"");
        assert!(matches!(parse(&input), Err(SeedError::Parse(_))));
    }

    #[test]
    fn rejects_duplicate_asset_id() {
        let input = format!("{VALID}\n[[assets]]\nid = \"USD\"\nclass = \"fiat\"\nprecision = 2\nname = \"Dup\"\n");
        assert!(matches!(parse(&input), Err(SeedError::DuplicateAsset(id)) if id == "USD"));
    }

    #[test]
    fn rejects_duplicate_account() {
        let input = format!("{VALID}\n[[accounts]]\nbook = \"onramp\"\npath = \"treasury:usd\"\nasset = \"USD\"\nkind = \"asset\"\n");
        assert!(matches!(parse(&input), Err(SeedError::DuplicateAccount(k)) if k == "onramp:treasury:usd"));
    }

    #[test]
    fn rejects_reserved_book() {
        let input = VALID.replace("book = \"onramp\"", "book = \"_system\"");
        assert!(matches!(parse(&input), Err(SeedError::ReservedBook(b)) if b == "_system"));
    }
}
