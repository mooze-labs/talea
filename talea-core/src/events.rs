use serde::{Deserialize, Serialize};

use crate::store::AccountCfg;
use crate::types::{AccountDef, AssetDef, Transaction};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum LedgerEvent {
    AssetRegistered(AssetDef),
    AccountOpened { def: AccountDef, cfg: AccountCfg },
    TransactionPosted(Transaction),
}

impl LedgerEvent {
    /// Stable string used for the events.kind column.
    pub fn kind(&self) -> &'static str {
        match self {
            LedgerEvent::AssetRegistered(_) => "asset_registered",
            LedgerEvent::AccountOpened { .. } => "account_opened",
            LedgerEvent::TransactionPosted(_) => "transaction_posted",
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::store::AccountCfg;
    use crate::types::*;
    use chrono::Utc;
    use uuid::Uuid;

    #[test]
    fn ledger_event_json_round_trip() {
        let tx = Transaction {
            id: TxId(Uuid::nil()),
            book: Book("onramp".into()),
            postings: vec![Posting {
                account: AccountId {
                    book: Book("onramp".into()),
                    path: "treasury:btc".into(),
                },
                amount: Amount::new(100, AssetId::new("BTC")),
                direction: Direction::Debit,
            }],
            idempotency_key: IdempotencyKey("k1".into()),
            external_refs: vec![],
            metadata: serde_json::json!({}),
            occurred_at: Utc::now(),
        };
        let ev = LedgerEvent::TransactionPosted(tx);
        assert_eq!(ev.kind(), "transaction_posted");
        let json = serde_json::to_string(&ev).unwrap();
        assert!(json.contains("\"kind\":\"transaction_posted\""));
        let back: LedgerEvent = serde_json::from_str(&json).unwrap();
        match back {
            LedgerEvent::TransactionPosted(t) => assert_eq!(t.idempotency_key.0, "k1"),
            _ => panic!("wrong variant"),
        }

        let opened = LedgerEvent::AccountOpened {
            def: AccountDef {
                id: AccountId {
                    book: Book("onramp".into()),
                    path: "cash".into(),
                },
                asset: AssetId::new("USD"),
                kind: AccountKind::Asset,
            },
            cfg: AccountCfg {
                normal_side: Some(Direction::Debit),
                min_balance: Some(0),
            },
        };
        let json = serde_json::to_string(&opened).unwrap();
        let back: LedgerEvent = serde_json::from_str(&json).unwrap();
        assert!(
            matches!(back, LedgerEvent::AccountOpened { cfg, .. } if cfg.min_balance == Some(0))
        );

        let registered = LedgerEvent::AssetRegistered(AssetDef {
            id: AssetId::new("L-USDT"),
            class: AssetClass::Crypto {
                network: Network::new("liquid"),
                native_id: Some("ce091c99...".into()),
            },
            precision: 8,
            name: "Liquid Tether".into(),
        });
        let json = serde_json::to_string(&registered).unwrap();
        let back: LedgerEvent = serde_json::from_str(&json).unwrap();
        assert!(matches!(
            back,
            LedgerEvent::AssetRegistered(a) if a.id.as_str() == "L-USDT" && a.precision == 8
        ));
    }

    #[test]
    fn db_string_round_trips() {
        assert_eq!(Direction::from_db("D"), Some(Direction::Debit));
        assert_eq!(Direction::from_db("C"), Some(Direction::Credit));
        assert_eq!(Direction::from_db("x"), None);
        assert_eq!(
            AccountKind::from_db("liability"),
            Some(AccountKind::Liability)
        );
        assert_eq!(
            AccountKind::from_db(AccountKind::Clearing.as_str()),
            Some(AccountKind::Clearing)
        );
        assert!(Book("_system".into()).is_reserved());
        assert!(!Book("onramp".into()).is_reserved());
    }
}
