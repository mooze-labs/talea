//! Embedded ledger: no server, no SQL — just the log store and LedgerService
//! driven through the LedgerApi trait. Run with:
//!   cargo run -p talea-service --example embedded

use std::sync::Arc;

use talea_core::api::{
    AccountDraft, AssetDraft, LedgerApi, PostingDraft, TransactionDraft, WireAmount,
};
use talea_core::types::Direction;
use talea_service::LedgerService;
use talea_store_log::LogTaleaStore;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // A fresh log store in a temp dir — no external services.
    let dir = std::env::temp_dir().join("talea-embedded-example");
    let _ = std::fs::remove_dir_all(&dir);
    std::fs::create_dir_all(&dir)?;
    let store = LogTaleaStore::open(&dir).await?;

    // The engine, behind the same trait the HTTP client implements.
    let ledger: Arc<dyn LedgerApi> = Arc::new(LedgerService::new(Arc::new(store)));

    // Register an asset and open two accounts.
    ledger
        .register_asset(AssetDraft {
            id: "USD".into(),
            class: "fiat".into(),
            network: None,
            native_id: None,
            precision: 2,
            name: "US Dollar".into(),
        })
        .await?;
    ledger
        .open_account(AccountDraft {
            book: "demo".into(),
            path: "assets:cash".into(),
            asset: "USD".into(),
            kind: "asset".into(),
            normal_side: Some(Direction::Debit),
            min_balance: None,
        })
        .await?;
    ledger
        .open_account(AccountDraft {
            book: "demo".into(),
            path: "equity:opening".into(),
            asset: "USD".into(),
            kind: "equity".into(),
            normal_side: Some(Direction::Credit),
            min_balance: None,
        })
        .await?;

    // Post a balanced transaction: debit cash, credit opening equity.
    let posted = ledger
        .post(TransactionDraft {
            book: "demo".into(),
            idempotency_key: "seed-0001".into(),
            postings: vec![
                PostingDraft {
                    account: "assets:cash".into(),
                    amount: WireAmount {
                        minor: 100_000,
                        asset: "USD".into(),
                    },
                    direction: Direction::Debit,
                },
                PostingDraft {
                    account: "equity:opening".into(),
                    amount: WireAmount {
                        minor: 100_000,
                        asset: "USD".into(),
                    },
                    direction: Direction::Credit,
                },
            ],
            external_refs: vec![],
            metadata: serde_json::Value::Null,
            occurred_at: None,
        })
        .await?;
    println!("posted tx {} at seq {}", posted.tx_id, posted.seq);

    // Read it back.
    let cash = ledger.balance("demo", "assets:cash", None).await?;
    println!("assets:cash balance = {} {}", cash.balance, cash.asset);

    let tb = ledger.trial_balance("demo", None).await?;
    for line in &tb.lines {
        println!(
            "trial balance {}: debits={} credits={}",
            line.asset, line.debits, line.credits
        );
    }

    Ok(())
}
