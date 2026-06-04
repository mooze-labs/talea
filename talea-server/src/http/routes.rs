//! Router assembly. Admission-control layers are added in a later task.

use std::sync::Arc;

use axum::Router;
use axum::routing::{get, post};

use crate::http::auth::{self, AuthConfig};
use crate::http::handlers;
use crate::service::LedgerService;

#[derive(Clone)]
pub struct AppState {
    pub service: Arc<LedgerService>,
}

pub fn router(service: Arc<LedgerService>, auth: AuthConfig, max_inflight: usize) -> Router {
    let _ = max_inflight; // consumed by the admission-control task
    // NOTE: the auth layer wraps REGISTERED routes only — an unmatched path
    // under /v1 404s without hitting auth (reveals nothing token-gated).
    let api = Router::new()
        .route("/assets", post(handlers::register_asset))
        .route("/accounts", post(handlers::open_account))
        .route("/transactions", post(handlers::post_transaction))
        .route("/transactions/{tx_id}", get(handlers::get_transaction))
        .route("/books/{book}/accounts/{path}/balance", get(handlers::get_balance))
        .route("/books/{book}/accounts/{path}/history", get(handlers::get_history))
        .route("/books/{book}/trial-balance", get(handlers::get_trial_balance))
        .route("/books/{book}/events", get(crate::http::sse::events))
        .layer(axum::middleware::from_fn_with_state(auth, auth::require_bearer))
        .with_state(AppState { service });

    Router::new()
        .nest("/v1", api)
        .route("/health", get(|| async { "ok" }))
}
