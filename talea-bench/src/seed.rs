//! Idempotent setup: the USD asset, bench-{i} books, and the dedicated
//! deep-history read book. Registry writes are idempotent on identity,
//! so re-running any seed is free.

use talea_client::LedgerApi;
use talea_core::api::{AccountDraft, AssetDraft};
use talea_core::types::Direction;

use crate::workload::{ASSET, CASH, EQUITY, book_name};

/// Book used by the `reads` scenario; kept separate from bench-{i} so
/// its event-log depth stays stable across runs.
pub const READ_BOOK: &str = "bench-read";

async fn register_usd(api: &dyn LedgerApi) -> Result<(), String> {
    api.register_asset(AssetDraft {
        id: ASSET.into(),
        class: "fiat".into(),
        network: None,
        native_id: None,
        precision: 2,
        name: "US Dollar".into(),
    })
    .await
    .map_err(|e| format!("registering {ASSET}: {e:?}"))
}

async fn open_pair(api: &dyn LedgerApi, book: &str) -> Result<(), String> {
    api.open_account(AccountDraft {
        book: book.into(),
        path: CASH.into(),
        asset: ASSET.into(),
        kind: "asset".into(),
        normal_side: Some(Direction::Debit),
        min_balance: None,
    })
    .await
    .map_err(|e| format!("opening {book}:{CASH}: {e:?}"))?;
    api.open_account(AccountDraft {
        book: book.into(),
        path: EQUITY.into(),
        asset: ASSET.into(),
        kind: "equity".into(),
        normal_side: Some(Direction::Credit),
        min_balance: None,
    })
    .await
    .map_err(|e| format!("opening {book}:{EQUITY}: {e:?}"))
}

/// USD + cash/equity pairs in books bench-0..bench-{n-1}.
pub async fn seed_books(api: &dyn LedgerApi, n: usize) -> Result<(), String> {
    register_usd(api).await?;
    for i in 0..n {
        open_pair(api, &book_name(i)).await?;
    }
    Ok(())
}

/// USD + cash/equity pair in the dedicated read book.
pub async fn seed_read_book(api: &dyn LedgerApi) -> Result<(), String> {
    register_usd(api).await?;
    open_pair(api, READ_BOOK).await
}
