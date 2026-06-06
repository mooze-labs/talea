//! Thin handlers: parse -> LedgerApi -> JSON. No logic beyond extraction.

use axum::Extension;
use axum::extract::{Path, State};
use std::sync::Arc;

// Envelope-rejection wrappers, not stock axum (415 kept, 422/413 -> 400).
use crate::http::extract::{Json, Query};
use axum::http::StatusCode;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use talea_core::api::*;

use crate::http::auth::TokenScope;
use crate::http::error::ApiFailure;
use crate::http::routes::AppState;

/// One item in a batch response array: either a committed `Posted` or the
/// standard error envelope. `#[serde(untagged)]` serializes each variant
/// directly — `Ok` produces the `Posted` object, `Err` produces the
/// `{"error": ...}` object — byte-identical to single-route bodies.
///
/// **Schema note**: utoipa renders `#[serde(untagged)]` enums as `oneOf` in
/// the generated OpenAPI document, so generators see the correct
/// `Posted | ApiError` discriminant.  The two are unambiguously
/// distinguishable: `Posted` always carries `tx_id`; `ApiError` always
/// carries `error`.
#[derive(Serialize, utoipa::ToSchema)]
#[serde(untagged)]
pub enum BatchItem {
    Ok(Posted),
    Err(ApiError),
}

/// 403 with the offending book; "*" stands for the global registry.
fn forbid(book: &str) -> ApiFailure {
    ApiFailure(ApiError::Forbidden {
        book: book.to_string(),
    })
}

// parameter_in = Query is load-bearing: utoipa defaults IntoParams to Path,
// which makes generated clients pass these as path substitutions.
#[derive(Deserialize, utoipa::IntoParams)]
#[into_params(parameter_in = Query)]
pub struct AsOfQuery {
    pub as_of: Option<DateTime<Utc>>,
}

#[derive(Deserialize, utoipa::IntoParams)]
#[into_params(parameter_in = Query)]
pub struct HistoryQuery {
    pub after_seq: Option<i64>,
    pub limit: Option<u32>,
}

/// Register an asset (idempotent on id).
#[utoipa::path(post, path = "/v1/assets", request_body = AssetDraft,
    responses(
        (status = 204, description = "registered (idempotent on id)"),
        (status = 400, description = "malformed draft", body = ApiError),
        (status = 401, description = "missing or invalid bearer token", body = ApiError),
        (status = 403, description = "token scope does not cover the registry", body = ApiError),
        (status = 408, description = "server-side timeout; safe to retry (idempotent on id)", body = ApiError),
        (status = 409, description = "same id, different definition", body = ApiError),
        (status = 415, description = "missing or wrong content-type", body = ApiError),
        (status = 429, description = "pool saturation or write queue full; retry with the same idempotency key", body = ApiError),
        (status = 503, description = "saturated; honor Retry-After and retry", body = ApiError),
    ), security(("bearer" = [])), tag = "registry")]
pub async fn register_asset(
    State(state): State<AppState>,
    Extension(scope): Extension<Arc<TokenScope>>,
    Json(draft): Json<AssetDraft>,
) -> Result<StatusCode, ApiFailure> {
    if !scope.allows_registry() {
        return Err(forbid("*"));
    }
    state
        .service
        .register_asset(draft)
        .await
        .map_err(ApiFailure)?;
    Ok(StatusCode::NO_CONTENT)
}

/// Open an account (idempotent on book+path).
#[utoipa::path(post, path = "/v1/accounts", request_body = AccountDraft,
    responses(
        (status = 204, description = "opened (idempotent on book+path)"),
        (status = 400, description = "malformed draft", body = ApiError),
        (status = 401, description = "missing or invalid bearer token", body = ApiError),
        (status = 403, description = "token scope does not cover this book", body = ApiError),
        (status = 404, description = "unknown asset", body = ApiError),
        (status = 408, description = "server-side timeout; safe to retry (idempotent on book+path)", body = ApiError),
        (status = 409, description = "same book+path, different definition", body = ApiError),
        (status = 415, description = "missing or wrong content-type", body = ApiError),
        (status = 429, description = "pool saturation or write queue full; retry with the same idempotency key", body = ApiError),
        (status = 503, description = "saturated; honor Retry-After and retry", body = ApiError),
    ), security(("bearer" = [])), tag = "registry")]
pub async fn open_account(
    State(state): State<AppState>,
    Extension(scope): Extension<Arc<TokenScope>>,
    Json(draft): Json<AccountDraft>,
) -> Result<StatusCode, ApiFailure> {
    if !scope.allows_write(&draft.book) {
        return Err(forbid(&draft.book));
    }
    state
        .service
        .open_account(draft)
        .await
        .map_err(ApiFailure)?;
    Ok(StatusCode::NO_CONTENT)
}

/// Commit a balanced transaction (idempotent on idempotency_key).
#[utoipa::path(post, path = "/v1/transactions", request_body = TransactionDraft,
    responses(
        (status = 200, description = "committed or deduplicated replay", body = Posted),
        (status = 400, description = "unbalanced / invalid amount / malformed draft", body = ApiError),
        (status = 401, description = "missing or invalid bearer token", body = ApiError),
        (status = 403, description = "token scope does not cover this book", body = ApiError),
        (status = 404, description = "unknown account", body = ApiError),
        (status = 408, description = "server-side timeout; retry with the same idempotency key", body = ApiError),
        (status = 409, description = "min_balance violation", body = ApiError),
        (status = 415, description = "missing or wrong content-type", body = ApiError),
        (status = 429, description = "per-book write queue full; retry with the same idempotency key", body = ApiError),
        (status = 503, description = "saturated; honor Retry-After and retry with the same idempotency key", body = ApiError),
    ), security(("bearer" = [])), tag = "ledger")]
pub async fn post_transaction(
    State(state): State<AppState>,
    Extension(scope): Extension<Arc<TokenScope>>,
    Json(draft): Json<TransactionDraft>,
) -> Result<Json<Posted>, ApiFailure> {
    if !scope.allows_write(&draft.book) {
        return Err(forbid(&draft.book));
    }
    Ok(Json(state.service.post(draft).await.map_err(ApiFailure)?))
}

/// Post a batch of transactions; returns one positional outcome per draft.
///
/// Each item in the response array is either the `Posted` JSON (on success)
/// or the standard `ApiError` envelope (on per-draft failure or scope
/// violation). The outer HTTP status is always 200 when the request itself
/// is accepted — per-draft errors live in their slot.
///
/// Whole-request errors (401, 415, 400) follow the same contract as the
/// single-transaction route.
///
/// **DoS bounds**: axum's default 2 MiB body limit is the memory ceiling
/// for the request (the cap is enforced post-deserialize).  Worst-case
/// in-flight allocation is `TALEA_HTTP_BATCH_MAX × max_inflight` drafts
/// concurrently resident in the write-router queue — size the cap
/// (`TALEA_HTTP_BATCH_MAX`, default 500) and max-inflight together.
#[utoipa::path(post, path = "/v1/transactions/batch",
    request_body(content = Vec<TransactionDraft>,
        description = "Array of transaction drafts; order is preserved in the response"),
    responses(
        (status = 200, description = "positional outcomes — each item is Posted on success or the ApiError envelope on per-draft failure",
            body = Vec<BatchItem>,
            example = json!([
                {"tx_id":"...","seq":3,"deduplicated":false},
                {"error":"unbalanced","asset":"USD","debit":100,"credit":90}
            ])
        ),
        (status = 400, description = "malformed body or batch size exceeds TALEA_HTTP_BATCH_MAX", body = ApiError),
        (status = 401, description = "missing or invalid bearer token", body = ApiError),
        (status = 408, description = "server-side timeout; retry each item with its idempotency key", body = ApiError),
        (status = 415, description = "missing or wrong content-type", body = ApiError),
        (status = 503, description = "saturated; honor Retry-After and retry", body = ApiError),
    ), security(("bearer" = [])), tag = "ledger")]
pub async fn post_batch_transactions(
    State(state): State<AppState>,
    Extension(scope): Extension<Arc<TokenScope>>,
    Json(drafts): Json<Vec<TransactionDraft>>,
) -> Result<Json<Vec<BatchItem>>, ApiFailure> {
    // Whole-request cap check.
    if drafts.len() > state.batch_max {
        return Err(ApiFailure(ApiError::InvalidDraft {
            field: "body".into(),
            reason: format!(
                "batch length {} exceeds cap {} (TALEA_HTTP_BATCH_MAX)",
                drafts.len(),
                state.batch_max
            ),
        }));
    }

    // Empty input → empty response.
    if drafts.is_empty() {
        return Ok(Json(Vec::new()));
    }

    // Partition: collect (original_index, draft) pairs that are in-scope;
    // out-of-scope drafts get a Forbidden slot immediately.
    let mut slots: Vec<Option<BatchItem>> =
        std::iter::repeat_with(|| None).take(drafts.len()).collect();

    let mut in_scope: Vec<(usize, TransactionDraft)> = Vec::with_capacity(drafts.len());
    for (i, draft) in drafts.into_iter().enumerate() {
        if !scope.allows_write(&draft.book) {
            slots[i] = Some(BatchItem::Err(ApiError::Forbidden { book: draft.book }));
        } else {
            in_scope.push((i, draft));
        }
    }

    // Submit in-scope drafts as a single batch call.
    if !in_scope.is_empty() {
        let in_scope_drafts: Vec<TransactionDraft> =
            in_scope.iter().map(|(_, d)| d.clone()).collect();
        let results = state.service.post_batch(in_scope_drafts).await;
        for ((idx, _), result) in in_scope.into_iter().zip(results) {
            slots[idx] = Some(match result {
                Ok(posted) => BatchItem::Ok(posted),
                Err(e) => BatchItem::Err(e),
            });
        }
    }

    // All slots must be filled by now.
    let response: Vec<BatchItem> = slots.into_iter().map(|s| s.unwrap()).collect();
    Ok(Json(response))
}

/// Current or as-of balance for one account.
#[utoipa::path(get, path = "/v1/books/{book}/accounts/{path}/balance",
    params(
        ("book" = String, Path, description = "book name"),
        ("path" = String, Path, description = "account path within the book (may contain ':')"),
        AsOfQuery,
    ),
    responses(
        (status = 200, description = "effective balance, decimal string per asset precision", body = BalanceView),
        (status = 401, description = "missing or invalid bearer token", body = ApiError),
        (status = 403, description = "token scope does not cover this book", body = ApiError),
        (status = 404, description = "unknown book or account", body = ApiError),
        (status = 408, description = "server-side timeout; safe to retry (read)", body = ApiError),
        (status = 429, description = "pool saturation or write queue full; safe to retry (read)", body = ApiError),
        (status = 503, description = "saturated; honor Retry-After and retry", body = ApiError),
    ), security(("bearer" = [])), tag = "reads")]
pub async fn get_balance(
    State(state): State<AppState>,
    Extension(scope): Extension<Arc<TokenScope>>,
    Path((book, path)): Path<(String, String)>,
    Query(q): Query<AsOfQuery>,
) -> Result<Json<BalanceView>, ApiFailure> {
    if !scope.allows_read(&book) {
        return Err(forbid(&book));
    }
    Ok(Json(
        state
            .service
            .balance(&book, &path, q.as_of)
            .await
            .map_err(ApiFailure)?,
    ))
}

/// Paged posting history for one account.
#[utoipa::path(get, path = "/v1/books/{book}/accounts/{path}/history",
    params(
        ("book" = String, Path), ("path" = String, Path),
        HistoryQuery,
    ),
    responses(
        (status = 200, description = "seq-ascending postings; after_seq exclusive; one transaction never splits across pages", body = inline(Paged<PostingView>)),
        (status = 401, description = "missing or invalid bearer token", body = ApiError),
        (status = 403, description = "token scope does not cover this book", body = ApiError),
        (status = 404, description = "unknown book or account", body = ApiError),
        (status = 408, description = "server-side timeout; safe to retry (read)", body = ApiError),
        (status = 429, description = "pool saturation or write queue full; safe to retry (read)", body = ApiError),
        (status = 503, description = "saturated; honor Retry-After and retry", body = ApiError),
    ), security(("bearer" = [])), tag = "reads")]
pub async fn get_history(
    State(state): State<AppState>,
    Extension(scope): Extension<Arc<TokenScope>>,
    Path((book, path)): Path<(String, String)>,
    Query(q): Query<HistoryQuery>,
) -> Result<Json<Paged<PostingView>>, ApiFailure> {
    if !scope.allows_read(&book) {
        return Err(forbid(&book));
    }
    let page = Page {
        after_seq: q.after_seq,
        limit: q.limit.unwrap_or(100).min(1000),
    };
    Ok(Json(
        state
            .service
            .account_history(&book, &path, page)
            .await
            .map_err(ApiFailure)?,
    ))
}

/// Fetch a committed transaction by id.
#[utoipa::path(get, path = "/v1/transactions/{tx_id}",
    params(("tx_id" = String, Path, description = "transaction id (uuid)")),
    responses(
        (status = 200, description = "the committed transaction with its postings", body = TransactionView),
        (status = 401, description = "missing or invalid bearer token", body = ApiError),
        (status = 404, description = "unknown transaction id, or one outside the token's book scope (indistinguishable by design: a 403 would confirm the id exists)", body = ApiError),
        (status = 408, description = "server-side timeout; safe to retry (read)", body = ApiError),
        (status = 429, description = "pool saturation or write queue full; safe to retry (read)", body = ApiError),
        (status = 503, description = "saturated; honor Retry-After and retry", body = ApiError),
    ), security(("bearer" = [])), tag = "ledger")]
pub async fn get_transaction(
    State(state): State<AppState>,
    Extension(scope): Extension<Arc<TokenScope>>,
    Path(tx_id): Path<String>,
) -> Result<Json<TransactionView>, ApiFailure> {
    let view = state
        .service
        .transaction(&tx_id)
        .await
        .map_err(ApiFailure)?;
    // Out-of-scope reads answer exactly like a true miss. The tx id is
    // global (not book-prefixed like the other routes), so a 403 here
    // would be an existence oracle and name a book the token can't see.
    if !scope.allows_read(&view.book) {
        return Err(ApiFailure(ApiError::NotFound {
            what: format!("transaction {tx_id}"),
        }));
    }
    Ok(Json(view))
}

/// Per-asset debit/credit totals for a book.
#[utoipa::path(get, path = "/v1/books/{book}/trial-balance",
    params(("book" = String, Path), AsOfQuery),
    responses(
        (status = 200, description = "per-asset debit/credit totals in integer minor units", body = TrialBalance),
        (status = 401, description = "missing or invalid bearer token", body = ApiError),
        (status = 403, description = "token scope does not cover this book", body = ApiError),
        (status = 408, description = "server-side timeout; safe to retry (read)", body = ApiError),
        (status = 429, description = "pool saturation or write queue full; safe to retry (read)", body = ApiError),
        (status = 503, description = "saturated; honor Retry-After and retry", body = ApiError),
    ), security(("bearer" = [])), tag = "reads")]
pub async fn get_trial_balance(
    State(state): State<AppState>,
    Extension(scope): Extension<Arc<TokenScope>>,
    Path(book): Path<String>,
    Query(q): Query<AsOfQuery>,
) -> Result<Json<TrialBalance>, ApiFailure> {
    if !scope.allows_read(&book) {
        return Err(forbid(&book));
    }
    Ok(Json(
        state
            .service
            .trial_balance(&book, q.as_of)
            .await
            .map_err(ApiFailure)?,
    ))
}
