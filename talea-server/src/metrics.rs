//! Prometheus metrics: recorder installation, the scrape router, HTTP
//! middleware, and the SSE subscriber guard.
//!
//! Cardinality rule: NO user-controlled label values. Route labels use
//! axum's MatchedPath templates; books/accounts/assets never become labels.

use std::time::Instant;

use axum::Router;
use axum::extract::{MatchedPath, Request};
use axum::middleware::Next;
use axum::response::Response;
use axum::routing::get;
use metrics::{counter, gauge, histogram};
use metrics_exporter_prometheus::{Matcher, PrometheusBuilder, PrometheusHandle};

/// Histogram buckets for *_duration_seconds: 1ms .. 10s.
const DURATION_BUCKETS: &[f64] = &[
    0.001, 0.0025, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0,
];

/// Install the global Prometheus recorder. Call once, before anything
/// records. Panics on double-installation (main calls it exactly once;
/// tests wrap it in a OnceLock).
pub fn install() -> PrometheusHandle {
    PrometheusBuilder::new()
        .set_buckets_for_metric(
            Matcher::Suffix("_duration_seconds".into()),
            DURATION_BUCKETS,
        )
        .expect("static bucket list is non-empty")
        .install_recorder()
        .expect("metrics recorder already installed")
}

/// Tiny router serving GET /metrics from the recorder handle.
pub fn router(handle: PrometheusHandle) -> Router {
    Router::new().route("/metrics", get(move || async move { handle.render() }))
}

/// Records talea_http_requests_total{method,route,status} and
/// talea_http_request_duration_seconds{method,route}. Route is the
/// MatchedPath template (bounded cardinality); "unmatched" when absent.
pub async fn track_http(req: Request, next: Next) -> Response {
    let method = req.method().to_string();
    let route = req
        .extensions()
        .get::<MatchedPath>()
        .map(|p| p.as_str().to_owned())
        .unwrap_or_else(|| "unmatched".to_owned());
    let start = Instant::now();

    let response = next.run(req).await;

    let status = response.status().as_u16().to_string();
    histogram!(
        "talea_http_request_duration_seconds",
        "method" => method.clone(),
        "route" => route.clone(),
    )
    .record(start.elapsed().as_secs_f64());
    counter!(
        "talea_http_requests_total",
        "method" => method,
        "route" => route,
        "status" => status,
    )
    .increment(1);
    response
}

/// RAII guard for the live-subscription gauge: increments
/// talea_sse_subscribers on creation, decrements on Drop. Move it into the
/// SSE stream so it lives exactly as long as the connection.
pub struct SseSubscriberGuard;

impl SseSubscriberGuard {
    pub fn new() -> Self {
        gauge!("talea_sse_subscribers").increment(1.0);
        Self
    }
}

impl Default for SseSubscriberGuard {
    fn default() -> Self {
        Self::new()
    }
}

impl Drop for SseSubscriberGuard {
    fn drop(&mut self) {
        gauge!("talea_sse_subscribers").decrement(1.0);
    }
}
