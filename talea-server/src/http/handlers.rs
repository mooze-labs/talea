//! Thin handlers: parse -> LedgerApi -> JSON. No logic beyond extraction.

use axum::Extension;
use axum::extract::{Path, State};
use std::sync::Arc;

// Envelope-rejection wrappers, not stock axum (415 kept, 422/413 -> 400).
use crate::http::extract::{Json, Query};
use axum::http::StatusCode;
use chrono::{DateTime, Utc};
use serde::Deserialize;
use talea_core::api::*;

use crate::http::auth::TokenScope;
use crate::http::error::ApiFailure;
use crate::http::routes::AppState;

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
