//! Router assembly with admission control: requests beyond the in-flight
//! limit shed immediately as 503 + Retry-After; the DB row lock remains the
//! write arbiter (correct across instances) — see the spec's Part 4.5.
//!
//! /health sits INSIDE the limits on purpose: overload 503s are a real load
//! signal. Configure load balancers to treat them as "busy" (readiness),
//! not "dead" (liveness), or saturation will eject healthy instances.

use std::sync::Arc;

use axum::Router;
use axum::error_handling::HandleErrorLayer;
use axum::http::{StatusCode, header};
use axum::response::{IntoResponse, Response};
use axum::routing::{get, post};
use tower::ServiceBuilder;

use crate::config::Config;
use crate::http::auth::{self, AuthConfig};
use crate::http::handlers;
use crate::service::LedgerService;

#[derive(Clone)]
pub struct AppState {
    pub service: Arc<LedgerService>,
}

pub async fn handle_middleware_error(err: tower::BoxError) -> Response {
    if err.is::<tower::load_shed::error::Overloaded>() {
        metrics::counter!("talea_shed_total").increment(1);
        (
            StatusCode::SERVICE_UNAVAILABLE,
            [(header::RETRY_AFTER, "1")],
            "overloaded; retry with the same idempotency key",
        )
            .into_response()
    } else if err.is::<tower::timeout::error::Elapsed>() {
        (StatusCode::REQUEST_TIMEOUT, "request timed out").into_response()
    } else {
        tracing::error!(error = %err, "middleware failure");
        (StatusCode::INTERNAL_SERVER_ERROR, "internal error").into_response()
    }
}

pub fn router(service: Arc<LedgerService>, auth: AuthConfig, max_inflight: usize) -> Router {
    let state = AppState { service };

    // SSE is long-lived: no request timeout. Everything else gets one.
    // NOTE: the auth layer wraps REGISTERED routes only — an unmatched path
    // under /v1 404s without hitting auth (reveals nothing token-gated).
    let rest = Router::new()
        .route("/assets", post(handlers::register_asset))
        .route("/accounts", post(handlers::open_account))
        .route("/transactions", post(handlers::post_transaction))
        .route("/transactions/{tx_id}", get(handlers::get_transaction))
        .route(
            "/books/{book}/accounts/{path}/balance",
            get(handlers::get_balance),
        )
        .route(
            "/books/{book}/accounts/{path}/history",
            get(handlers::get_history),
        )
        .route(
            "/books/{book}/trial-balance",
            get(handlers::get_trial_balance),
        )
        .route_layer(axum::middleware::from_fn(crate::metrics::track_http))
        .layer(
            ServiceBuilder::new()
                .layer(HandleErrorLayer::new(handle_middleware_error))
                .timeout(Config::REQUEST_TIMEOUT),
        );

    let streaming = Router::new()
        .route("/books/{book}/events", get(crate::http::sse::events))
        .route_layer(axum::middleware::from_fn(crate::metrics::track_http));

    let api = rest
        .merge(streaming)
        .layer(axum::middleware::from_fn_with_state(
            auth,
            auth::require_bearer,
        ))
        .with_state(state);

    Router::new()
        .nest("/v1", api)
        .route("/health", get(|| async { "ok" }))
        .layer(
            ServiceBuilder::new()
                .layer(HandleErrorLayer::new(handle_middleware_error))
                .load_shed()
                .concurrency_limit(max_inflight),
        )
}
