//! Thin handlers: parse -> LedgerApi -> JSON. No logic beyond extraction.

use axum::Json;
use axum::extract::{Path, Query, State};
use axum::http::StatusCode;
use chrono::{DateTime, Utc};
use serde::Deserialize;
use talea_core::api::*;

use crate::http::error::ApiFailure;
use crate::http::routes::AppState;

#[derive(Deserialize)]
pub struct AsOfQuery {
    pub as_of: Option<DateTime<Utc>>,
}

#[derive(Deserialize)]
pub struct HistoryQuery {
    pub after_seq: Option<i64>,
    pub limit: Option<u32>,
}

pub async fn register_asset(
    State(state): State<AppState>,
    Json(draft): Json<AssetDraft>,
) -> Result<StatusCode, ApiFailure> {
    state
        .service
        .register_asset(draft)
        .await
        .map_err(ApiFailure)?;
    Ok(StatusCode::NO_CONTENT)
}

pub async fn open_account(
    State(state): State<AppState>,
    Json(draft): Json<AccountDraft>,
) -> Result<StatusCode, ApiFailure> {
    state
        .service
        .open_account(draft)
        .await
        .map_err(ApiFailure)?;
    Ok(StatusCode::NO_CONTENT)
}

pub async fn post_transaction(
    State(state): State<AppState>,
    Json(draft): Json<TransactionDraft>,
) -> Result<Json<Posted>, ApiFailure> {
    Ok(Json(state.service.post(draft).await.map_err(ApiFailure)?))
}

pub async fn get_balance(
    State(state): State<AppState>,
    Path((book, path)): Path<(String, String)>,
    Query(q): Query<AsOfQuery>,
) -> Result<Json<BalanceView>, ApiFailure> {
    Ok(Json(
        state
            .service
            .balance(&book, &path, q.as_of)
            .await
            .map_err(ApiFailure)?,
    ))
}

pub async fn get_history(
    State(state): State<AppState>,
    Path((book, path)): Path<(String, String)>,
    Query(q): Query<HistoryQuery>,
) -> Result<Json<Paged<PostingView>>, ApiFailure> {
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

pub async fn get_transaction(
    State(state): State<AppState>,
    Path(tx_id): Path<String>,
) -> Result<Json<TransactionView>, ApiFailure> {
    Ok(Json(
        state
            .service
            .transaction(&tx_id)
            .await
            .map_err(ApiFailure)?,
    ))
}

pub async fn get_trial_balance(
    State(state): State<AppState>,
    Path(book): Path<String>,
    Query(q): Query<AsOfQuery>,
) -> Result<Json<TrialBalance>, ApiFailure> {
    Ok(Json(
        state
            .service
            .trial_balance(&book, q.as_of)
            .await
            .map_err(ApiFailure)?,
    ))
}
