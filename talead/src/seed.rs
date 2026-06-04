//! Declarative seed file (talea.seed.toml): parse, validate, apply.

use std::collections::HashSet;

use serde::Deserialize;
use talea_core::store::{AccountCfg, Store, StoreError};
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
    #[error("{entry} {field} cannot be blank")]
    BlankField {
        entry: &'static str,
        field: &'static str,
    },
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
        if asset.id.trim().is_empty() {
            return Err(SeedError::BlankField {
                entry: "asset",
                field: "id",
            });
        }
        if asset.name.trim().is_empty() {
            return Err(SeedError::BlankField {
                entry: "asset",
                field: "name",
            });
        }
        if !asset_ids.insert(asset.id.as_str()) {
            return Err(SeedError::DuplicateAsset(asset.id.clone()));
        }
    }
    let mut account_keys = HashSet::new();
    for account in &seed.accounts {
        if account.book.trim().is_empty() {
            return Err(SeedError::BlankField {
                entry: "account",
                field: "book",
            });
        }
        if account.path.trim().is_empty() {
            return Err(SeedError::BlankField {
                entry: "account",
                field: "path",
            });
        }
        if account.asset.trim().is_empty() {
            return Err(SeedError::BlankField {
                entry: "account",
                field: "asset",
            });
        }
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

#[derive(Debug, Default, PartialEq, Eq)]
pub struct ApplySummary {
    pub assets_created: usize,
    pub assets_existing: usize,
    /// open_account has tolerate-identical semantics but no read API, so
    /// created-vs-existing can't be distinguished for accounts.
    pub accounts_ensured: usize,
}

/// Idempotent: identical re-application is a no-op; a conflicting def errors.
pub async fn apply(store: &dyn Store, seed: &SeedFile) -> Result<ApplySummary, SeedError> {
    let mut summary = ApplySummary::default();
    let file_assets: HashSet<&str> = seed.assets.iter().map(|a| a.id.as_str()).collect();

    for asset in &seed.assets {
        let def = asset.to_def();
        match store.asset(&def.id).await? {
            Some(existing) if existing == def => summary.assets_existing += 1,
            Some(existing) => {
                return Err(SeedError::AssetConflict {
                    id: asset.id.clone(),
                    diff: diff_assets(&existing, &def),
                });
            }
            None => {
                store.register_asset(&def).await?;
                summary.assets_created += 1;
            }
        }
    }

    for account in &seed.accounts {
        let (def, cfg) = account.to_def();
        if !file_assets.contains(account.asset.as_str()) && store.asset(&def.asset).await?.is_none()
        {
            return Err(SeedError::MissingAsset {
                account: def.id.to_key(),
                asset: account.asset.clone(),
            });
        }
        store.open_account(&def, &cfg).await?;
        summary.accounts_ensured += 1;
    }
    Ok(summary)
}

fn diff_assets(existing: &AssetDef, new: &AssetDef) -> String {
    let mut diffs = Vec::new();
    if existing.precision != new.precision {
        diffs.push(format!(
            "precision {} vs {}",
            existing.precision, new.precision
        ));
    }
    if existing.name != new.name {
        diffs.push(format!("name {:?} vs {:?}", existing.name, new.name));
    }
    if existing.class != new.class {
        diffs.push("class differs".to_string());
    }
    diffs.join(", ")
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
                id: AccountId {
                    book: Book(self.book.clone()),
                    path: self.path.clone(),
                },
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
        let input = format!(
            "{VALID}\n[[assets]]\nid = \"USD\"\nclass = \"fiat\"\nprecision = 2\nname = \"Dup\"\n"
        );
        assert!(matches!(parse(&input), Err(SeedError::DuplicateAsset(id)) if id == "USD"));
    }

    #[test]
    fn rejects_duplicate_account() {
        let input = format!(
            "{VALID}\n[[accounts]]\nbook = \"onramp\"\npath = \"treasury:usd\"\nasset = \"USD\"\nkind = \"asset\"\n"
        );
        assert!(
            matches!(parse(&input), Err(SeedError::DuplicateAccount(k)) if k == "onramp:treasury:usd")
        );
    }

    #[test]
    fn rejects_reserved_book() {
        let input = VALID.replace("book = \"onramp\"", "book = \"_system\"");
        assert!(matches!(parse(&input), Err(SeedError::ReservedBook(b)) if b == "_system"));
    }

    #[test]
    fn rejects_blank_asset_fields() {
        let blank_id = VALID.replace("id = \"USD\"", "id = \" \"");
        assert!(matches!(
            parse(&blank_id),
            Err(SeedError::BlankField { .. })
        ));
        let blank_name = VALID.replace("name = \"US Dollar\"", "name = \"\"");
        assert!(matches!(
            parse(&blank_name),
            Err(SeedError::BlankField { .. })
        ));
    }

    #[test]
    fn rejects_blank_account_fields() {
        let blank_book = VALID.replacen("book = \"onramp\"", "book = \"\"", 1);
        assert!(matches!(
            parse(&blank_book),
            Err(SeedError::BlankField { field: "book", .. })
        ));
        let blank_path = VALID.replacen("path = \"treasury:usd\"", "path = \"  \"", 1);
        assert!(matches!(
            parse(&blank_path),
            Err(SeedError::BlankField { field: "path", .. })
        ));
    }
}
