//! Router assembly with admission control: requests beyond the in-flight
//! limit shed immediately as 503 + Retry-After; the DB row lock remains the
//! write arbiter (correct across instances) — see the spec's Part 4.5.
//!
//! /health sits INSIDE the limits on purpose: overload 503s are a real load
//! signal. Configure load balancers to treat them as "busy" (readiness),
//! not "dead" (liveness), or saturation will eject healthy instances.

use std::sync::Arc;

use axum::Json;
use axum::Router;
use axum::error_handling::HandleErrorLayer;
use axum::http::{StatusCode, header};
use axum::response::{IntoResponse, Response};
use axum::routing::{get, post};
use talea_core::api::ApiError;
use tower::ServiceBuilder;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

use crate::config::Config;
use crate::http::auth::{self, AuthConfig};
use crate::http::handlers;
use crate::service::LedgerService;

#[derive(Clone)]
pub struct AppState {
    pub service: Arc<LedgerService>,
    /// Cap for POST /v1/transactions/batch; from TALEA_HTTP_BATCH_MAX.
    pub batch_max: usize,
}

pub async fn handle_middleware_error(err: tower::BoxError) -> Response {
    if err.is::<tower::load_shed::error::Overloaded>() {
        metrics::counter!("talea_shed_total").increment(1);
        // Same body as the queue-full 429 — same client action either way
        // (back off, retry with the same idempotency key); the distinction
        // lives in the status code.
        (
            StatusCode::SERVICE_UNAVAILABLE,
            [(header::RETRY_AFTER, "1")],
            Json(ApiError::Overloaded),
        )
            .into_response()
    } else if err.is::<tower::timeout::error::Elapsed>() {
        (StatusCode::REQUEST_TIMEOUT, Json(ApiError::Timeout)).into_response()
    } else {
        // Log the real error; never leak it to the wire.
        tracing::error!(error = %err, "middleware failure");
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiError::Internal {
                message: "middleware failure".into(),
            }),
        )
            .into_response()
    }
}

pub fn router(
    service: Arc<LedgerService>,
    auth: AuthConfig,
    max_inflight: usize,
    backend: &'static str,
) -> Router {
    router_with_batch_max(service, auth, max_inflight, backend, 500)
}

pub fn router_with_batch_max(
    service: Arc<LedgerService>,
    auth: AuthConfig,
    max_inflight: usize,
    backend: &'static str,
    batch_max: usize,
) -> Router {
    let state = AppState { service, batch_max };

    // SSE is long-lived: no request timeout. Everything else gets one.
    // NOTE: the auth layer wraps REGISTERED routes only — an unmatched path
    // under /v1 404s without hitting auth (reveals nothing token-gated).
    let rest = Router::new()
        .route("/assets", post(handlers::register_asset))
        .route("/accounts", post(handlers::open_account))
        .route("/transactions", post(handlers::post_transaction))
        .route(
            "/transactions/batch",
            post(handlers::post_batch_transactions),
        )
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
        // Body stays exactly "ok" (LB checks compare it verbatim); the
        // backend tag rides as a header so benchmark results can record
        // which store they measured.
        .route(
            "/health",
            get(move || async move { ([("x-talea-backend", backend)], "ok") }),
        )
        .merge(
            SwaggerUi::new("/docs").url("/openapi.json", crate::http::openapi::ApiDoc::openapi()),
        )
        .layer(
            ServiceBuilder::new()
                .layer(HandleErrorLayer::new(handle_middleware_error))
                .load_shed()
                .concurrency_limit(max_inflight),
        )
}
