use crate::types::{AccountDef, AssetDef, Transaction};

pub enum LedgerEvent {
    AssetRegistered(AssetDef),
    AccountOpened(AccountDef),
    TransactionPosted(Transaction),
}
