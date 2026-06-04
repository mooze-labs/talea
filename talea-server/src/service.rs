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
    ApiError::InvalidDraft {
        field: field.into(),
        reason: reason.into(),
    }
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
                return Err(invalid(
                    "network",
                    "fiat assets have no network or native_id",
                ));
            }
            AssetClass::Fiat
        }
        "crypto" => AssetClass::Crypto {
            network: Network::new(
                draft
                    .network
                    .ok_or_else(|| invalid("network", "crypto assets require a network"))?,
            ),
            native_id: draft.native_id,
        },
        other => {
            return Err(invalid(
                "class",
                format!("unknown asset class '{other}' (expected 'fiat' or 'crypto')"),
            ));
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
        id: AccountId {
            book,
            path: draft.path,
        },
        asset: AssetId::new(draft.asset),
        kind,
    };
    Ok((def, cfg))
}

// --- error mapping ----------------------------------------------------------

fn map_store_err(e: StoreError) -> ApiError {
    match e {
        StoreError::ConstraintViolation {
            account,
            min_balance,
            would_be,
        } => ApiError::ConstraintViolation {
            account: account.to_key(),
            min_balance,
            would_be,
        },
        StoreError::UnknownAccount(a) => ApiError::UnknownAccount {
            account: a.to_key(),
        },
        StoreError::UnknownAsset(a) => ApiError::UnknownAsset {
            asset: a.as_str().to_string(),
        },
        StoreError::AssetMismatch {
            account,
            account_asset,
            asset,
        } => ApiError::AssetMismatch {
            account: account.to_key(),
            account_asset: account_asset.as_str().to_string(),
            asset: asset.as_str().to_string(),
        },
        StoreError::AlreadyExists { what } => ApiError::AlreadyExists { what },
        StoreError::InvalidBook(b) => invalid("book", format!("book {:?} is reserved", b.0)),
        StoreError::Io(e) => {
            tracing::error!(error = %e, "store backend error");
            ApiError::Internal {
                message: "storage backend error".into(),
            }
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
        self.store
            .open_account(&def, &cfg)
            .await
            .map_err(map_store_err)
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
                return Err(ApiError::InvalidAmount {
                    amount: p.amount.minor,
                });
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
                .ok_or(ApiError::InvalidAmount {
                    amount: p.amount.minor,
                })?;
            postings.push(Posting {
                account: AccountId {
                    book: book.clone(),
                    path: p.account.clone(),
                },
                amount: Amount::new(p.amount.minor, AssetId::new(&p.amount.asset)),
                direction: p.direction.clone(),
            });
        }
        for (asset, (debit, credit)) in &totals {
            if debit != credit {
                return Err(ApiError::Unbalanced {
                    asset: asset.clone(),
                    debit: *debit,
                    credit: *credit,
                });
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
        let started = std::time::Instant::now();
        let committed = self.store.commit(&transaction).await.map_err(|e| {
            metrics::counter!("talea_commits_total", "result" => "rejected").increment(1);
            map_store_err(e)
        })?;
        metrics::histogram!("talea_commit_duration_seconds")
            .record(started.elapsed().as_secs_f64());
        let deduplicated = committed.txid != id;
        metrics::counter!(
            "talea_commits_total",
            "result" => if deduplicated { "deduplicated" } else { "committed" },
        )
        .increment(1);
        Ok(Posted {
            tx_id: committed.txid.0.to_string(),
            seq: committed.seq,
            at: committed.at,
            // a dedup hit returns the prior transaction's id, not ours
            deduplicated,
        })
    }

    async fn balance(
        &self,
        book: &str,
        path: &str,
        as_of: Option<DateTime<Utc>>,
    ) -> ApiResult<BalanceView> {
        let account = AccountId {
            book: parse_book_lax(book)?,
            path: path.to_string(),
        };
        let snapshot = self
            .store
            .balance(&account, as_of)
            .await
            .map_err(map_store_err)?;
        let asset = self
            .store
            .asset(snapshot.amount.asset())
            .await
            .map_err(map_store_err)?
            .ok_or_else(|| {
                tracing::error!(
                    asset = snapshot.amount.asset().as_str(),
                    account = account.to_key(),
                    "account references an unregistered asset"
                );
                ApiError::Internal {
                    message: "ledger inconsistency".into(),
                }
            })?;
        Ok(BalanceView {
            account: account.to_key(),
            asset: asset.id.as_str().to_string(),
            balance: format_minor(snapshot.amount.minor(), asset.precision),
            as_of,
            updated_seq: snapshot.updated_seq,
        })
    }

    async fn account_history(
        &self,
        book: &str,
        path: &str,
        page: Page,
    ) -> ApiResult<Paged<PostingView>> {
        let account = AccountId {
            book: parse_book_lax(book)?,
            path: path.to_string(),
        };
        let limit = (page.limit as usize).clamp(1, 1000);
        let records = self
            .store
            .account_history(&account, page.after_seq, limit)
            .await
            .map_err(map_store_err)?;
        // limit counts distinct seqs; fewer rows than limit can still mean a
        // full page, so the cursor closes only when the page came back short
        let next = if records.len() < limit {
            None
        } else {
            records.last().map(|r| r.seq)
        };
        let items = records
            .into_iter()
            .map(|r| PostingView {
                seq: r.seq,
                tx_id: r.txid.0.to_string(),
                account: r.account.to_key(),
                amount: WireAmount {
                    minor: r.amount.minor(),
                    asset: r.amount.asset().as_str().to_string(),
                },
                direction: r.direction,
                at: r.at,
            })
            .collect();
        Ok(Paged { items, next })
    }

    async fn transaction(&self, tx_id: &str) -> ApiResult<TransactionView> {
        let id =
            Uuid::parse_str(tx_id).map_err(|e| invalid("tx_id", format!("not a uuid: {e}")))?;
        let stored = self
            .store
            .transaction(&TxId(id))
            .await
            .map_err(map_store_err)?
            .ok_or_else(|| ApiError::NotFound {
                what: format!("transaction {tx_id}"),
            })?;
        let t = stored.transaction;
        Ok(TransactionView {
            tx_id: t.id.0.to_string(),
            book: t.book.0.clone(),
            seq: stored.seq,
            at: stored.at,
            postings: t
                .postings
                .iter()
                .map(|p| PostingView {
                    seq: stored.seq,
                    tx_id: t.id.0.to_string(),
                    account: p.account.to_key(),
                    amount: WireAmount {
                        minor: p.amount.minor(),
                        asset: p.amount.asset().as_str().to_string(),
                    },
                    direction: p.direction.clone(),
                    at: stored.at,
                })
                .collect(),
            external_refs: t.external_refs,
            metadata: t.metadata,
        })
    }

    async fn trial_balance(
        &self,
        book: &str,
        as_of: Option<DateTime<Utc>>,
    ) -> ApiResult<TrialBalance> {
        let b = parse_book_lax(book)?;
        let rows = self
            .store
            .trial_balance(&b, as_of)
            .await
            .map_err(map_store_err)?;
        Ok(TrialBalance {
            book: b.0,
            as_of,
            lines: rows
                .into_iter()
                .map(|r| TrialBalanceLine {
                    asset: r.asset.as_str().to_string(),
                    debits: r.debits,
                    credits: r.credits,
                })
                .collect(),
        })
    }

    async fn subscribe(&self, book: &str, from: Seq) -> ApiResult<EventStream> {
        let b = parse_book_lax(book)?;
        let stream = self.store.subscribe(&b, from);
        let mapped = stream.map(|item| {
            let s = item.map_err(map_store_err)?;
            let kind = s.event.kind().to_string();
            let payload = serde_json::to_value(&s.event).map_err(|e| {
                tracing::error!(error = %e, "event serialization failed");
                ApiError::Internal {
                    message: "event serialization failed".into(),
                }
            })?;
            Ok(EventEnvelope {
                seq: s.seq,
                at: s.at,
                kind,
                payload,
            })
        });
        // Both store streams self-terminate after yielding an Err, but that
        // is their implementation detail — fuse here so a future backend
        // cannot leak post-error items through the API contract.
        let fused = mapped.scan(false, |errored, item| {
            if *errored {
                return futures::future::ready(None);
            }
            *errored = item.is_err();
            futures::future::ready(Some(item))
        });
        Ok(Box::pin(fused))
    }
}
