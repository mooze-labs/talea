//! LedgerApi implementation: pure validation and translation over a Store.

use std::collections::HashMap;
use std::sync::Arc;

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use futures::StreamExt;
use talea_core::api::*;
use talea_core::store::{AccountCfg, Store, StoreError};
use talea_core::types::*;
use uuid::Uuid;

pub struct LedgerService {
    store: Arc<dyn Store>,
}

impl LedgerService {
    pub fn new(store: Arc<dyn Store>) -> Self {
        Self { store }
    }
}

// --- draft parsing --------------------------------------------------------

fn invalid(field: &str, reason: impl Into<String>) -> ApiError {
    ApiError::InvalidDraft { field: field.into(), reason: reason.into() }
}

/// Writes reject reserved books; reads use parse_book_lax (events of _system
/// are legitimately readable).
fn parse_book(name: &str) -> ApiResult<Book> {
    let book = parse_book_lax(name)?;
    if book.is_reserved() {
        return Err(invalid("book", "names starting with '_' are reserved"));
    }
    Ok(book)
}

fn parse_book_lax(name: &str) -> ApiResult<Book> {
    if name.is_empty() {
        return Err(invalid("book", "must not be empty"));
    }
    Ok(Book(name.to_string()))
}

fn parse_asset_draft(draft: AssetDraft) -> ApiResult<AssetDef> {
    if draft.id.is_empty() {
        return Err(invalid("id", "must not be empty"));
    }
    let class = match draft.class.as_str() {
        "fiat" => {
            if draft.network.is_some() || draft.native_id.is_some() {
                return Err(invalid("network", "fiat assets have no network or native_id"));
            }
            AssetClass::Fiat
        }
        "crypto" => AssetClass::Crypto {
            network: Network::new(
                draft.network.ok_or_else(|| invalid("network", "crypto assets require a network"))?,
            ),
            native_id: draft.native_id,
        },
        other => {
            return Err(invalid("class", format!("unknown asset class '{other}' (expected 'fiat' or 'crypto')")));
        }
    };
    Ok(AssetDef {
        id: AssetId::new(draft.id),
        class,
        precision: draft.precision,
        name: draft.name,
    })
}

/// The cfg (normal_side, min_balance) comes from the draft verbatim;
/// `kind` is classification only.
fn parse_account_draft(draft: AccountDraft) -> ApiResult<(AccountDef, AccountCfg)> {
    let book = parse_book(&draft.book)?;
    if draft.path.is_empty() {
        return Err(invalid("path", "must not be empty"));
    }
    let kind = AccountKind::from_db(&draft.kind)
        .ok_or_else(|| invalid("kind", format!("unknown account kind '{}'", draft.kind)))?;
    let cfg = AccountCfg {
        normal_side: draft.normal_side,
        min_balance: draft.min_balance,
    };
    let def = AccountDef {
        id: AccountId { book, path: draft.path },
        asset: AssetId::new(draft.asset),
        kind,
    };
    Ok((def, cfg))
}

// --- error mapping ----------------------------------------------------------

fn map_store_err(e: StoreError) -> ApiError {
    match e {
        StoreError::ConstraintViolation { account, min_balance, would_be } => {
            ApiError::ConstraintViolation { account: account.to_key(), min_balance, would_be }
        }
        StoreError::UnknownAccount(a) => ApiError::UnknownAccount { account: a.to_key() },
        StoreError::UnknownAsset(a) => ApiError::UnknownAsset { asset: a.as_str().to_string() },
        StoreError::AssetMismatch { account, account_asset, asset } => ApiError::AssetMismatch {
            account: account.to_key(),
            account_asset: account_asset.as_str().to_string(),
            asset: asset.as_str().to_string(),
        },
        StoreError::AlreadyExists { what } => ApiError::AlreadyExists { what },
        StoreError::InvalidBook(b) => invalid("book", format!("book {:?} is reserved", b.0)),
        StoreError::Io(e) => {
            tracing::error!(error = %e, "store backend error");
            ApiError::Internal { message: "storage backend error".into() }
        }
    }
}

#[async_trait]
impl LedgerApi for LedgerService {
    async fn register_asset(&self, draft: AssetDraft) -> ApiResult<()> {
        let def = parse_asset_draft(draft)?;
        self.store.register_asset(&def).await.map_err(map_store_err)
    }

    async fn open_account(&self, draft: AccountDraft) -> ApiResult<()> {
        let (def, cfg) = parse_account_draft(draft)?;
        self.store.open_account(&def, &cfg).await.map_err(map_store_err)
    }

    async fn post(&self, draft: TransactionDraft) -> ApiResult<Posted> {
        let book = parse_book(&draft.book)?;
        if draft.idempotency_key.is_empty() {
            return Err(invalid("idempotency_key", "must not be empty"));
        }
        if draft.postings.is_empty() {
            return Err(invalid("postings", "must not be empty"));
        }

        let mut postings = Vec::with_capacity(draft.postings.len());
        let mut totals: HashMap<String, (i64, i64)> = HashMap::new(); // asset -> (debits, credits)
        for p in &draft.postings {
            if p.amount.minor <= 0 {
                return Err(ApiError::InvalidAmount { amount: p.amount.minor });
            }
            if p.account.is_empty() {
                return Err(invalid("postings.account", "must not be empty"));
            }
            let entry = totals.entry(p.amount.asset.clone()).or_insert((0, 0));
            let side = match p.direction {
                Direction::Debit => &mut entry.0,
                Direction::Credit => &mut entry.1,
            };
            *side = side
                .checked_add(p.amount.minor)
                .ok_or(ApiError::InvalidAmount { amount: p.amount.minor })?;
            postings.push(Posting {
                account: AccountId { book: book.clone(), path: p.account.clone() },
                amount: Amount::new(p.amount.minor, AssetId::new(&p.amount.asset)),
                direction: p.direction.clone(),
            });
        }
        for (asset, (debit, credit)) in &totals {
            if debit != credit {
                return Err(ApiError::Unbalanced { asset: asset.clone(), debit: *debit, credit: *credit });
            }
        }

        let id = TxId(Uuid::now_v7());
        let transaction = Transaction {
            id: id.clone(),
            book,
            postings,
            idempotency_key: IdempotencyKey(draft.idempotency_key),
            external_refs: draft.external_refs,
            metadata: draft.metadata,
            occurred_at: draft.occurred_at.unwrap_or_else(Utc::now),
        };
        let committed = self.store.commit(&transaction).await.map_err(map_store_err)?;
        Ok(Posted {
            tx_id: committed.txid.0.to_string(),
            seq: committed.seq,
            at: committed.at,
            // a dedup hit returns the prior transaction's id, not ours
            deduplicated: committed.txid != id,
        })
    }

    async fn balance(
        &self,
        book: &str,
        path: &str,
        as_of: Option<DateTime<Utc>>,
    ) -> ApiResult<BalanceView> {
        todo!()
    }

    async fn account_history(
        &self,
        book: &str,
        path: &str,
        page: Page,
    ) -> ApiResult<Paged<PostingView>> {
        todo!()
    }

    async fn transaction(&self, tx_id: &str) -> ApiResult<TransactionView> {
        todo!()
    }

    async fn trial_balance(
        &self,
        book: &str,
        as_of: Option<DateTime<Utc>>,
    ) -> ApiResult<TrialBalance> {
        todo!()
    }

    async fn subscribe(&self, book: &str, from: Seq) -> ApiResult<EventStream> {
        todo!()
    }
}
