use std::sync::Arc;

use axum::body::Body;
use axum::http::{Request, StatusCode, header};
use http_body_util::BodyExt;
use sqlx::sqlite::SqlitePoolOptions;
use talea_server::http::auth::AuthConfig;
use talea_server::service::LedgerService;
use talea_store_sqlite::SqliteTaleaStore;
use tower::ServiceExt;

async fn app(token: Option<&str>) -> axum::Router {
    let pool = SqlitePoolOptions::new()
        .max_connections(1)
        .connect("sqlite::memory:")
        .await
        .unwrap();
    let store = SqliteTaleaStore::new(pool);
    store.migrate().await.unwrap();
    let service = Arc::new(LedgerService::new(Arc::new(store)));
    talea_server::http::routes::router(
        service,
        AuthConfig {
            token: token.map(String::from),
        },
        256,
    )
}

async fn send(
    app: &axum::Router,
    method: &str,
    path: &str,
    auth: Option<&str>,
    body: Option<serde_json::Value>,
) -> (StatusCode, serde_json::Value) {
    let mut req = Request::builder().method(method).uri(path);
    if let Some(token) = auth {
        req = req.header(header::AUTHORIZATION, format!("Bearer {token}"));
    }
    let req = match body {
        Some(json) => req
            .header(header::CONTENT_TYPE, "application/json")
            .body(Body::from(json.to_string()))
            .unwrap(),
        None => req.body(Body::empty()).unwrap(),
    };
    let res = app.clone().oneshot(req).await.unwrap();
    let status = res.status();
    let bytes = res.into_body().collect().await.unwrap().to_bytes();
    let json = if bytes.is_empty() {
        serde_json::json!(null)
    } else {
        serde_json::from_slice(&bytes).unwrap_or(serde_json::json!(null))
    };
    (status, json)
}

fn usd() -> serde_json::Value {
    serde_json::json!({"id":"USD","class":"fiat","precision":2,"name":"US Dollar"})
}

fn account(path: &str, kind: &str, side: &str) -> serde_json::Value {
    serde_json::json!({"book":"onramp","path":path,"asset":"USD","kind":kind,"normal_side":side})
}

fn transfer_body(idem: &str, minor: i64) -> serde_json::Value {
    serde_json::json!({
        "book": "onramp",
        "idempotency_key": idem,
        "postings": [
            {"account":"deposits","amount":{"minor":minor,"asset":"USD"},"direction":"credit"},
            {"account":"cash","amount":{"minor":minor,"asset":"USD"},"direction":"debit"}
        ]
    })
}

/// register USD + open both accounts; asserts the 204s.
async fn setup(app: &axum::Router) {
    let (s, _) = send(app, "POST", "/v1/assets", None, Some(usd())).await;
    assert_eq!(s, StatusCode::NO_CONTENT);
    let (s, _) = send(
        app,
        "POST",
        "/v1/accounts",
        None,
        Some(account("cash", "asset", "debit")),
    )
    .await;
    assert_eq!(s, StatusCode::NO_CONTENT);
    let (s, _) = send(
        app,
        "POST",
        "/v1/accounts",
        None,
        Some(account("deposits", "liability", "credit")),
    )
    .await;
    assert_eq!(s, StatusCode::NO_CONTENT);
}

#[tokio::test]
async fn full_rest_round_trip() {
    let app = app(None).await;
    setup(&app).await;

    // post a transaction
    let (s, posted) = send(
        &app,
        "POST",
        "/v1/transactions",
        None,
        Some(transfer_body("t1", 1000)),
    )
    .await;
    assert_eq!(s, StatusCode::OK);
    assert_eq!(posted["seq"], 3);
    assert_eq!(posted["deduplicated"], false);

    // balance
    let (s, bal) = send(
        &app,
        "GET",
        "/v1/books/onramp/accounts/cash/balance",
        None,
        None,
    )
    .await;
    assert_eq!(s, StatusCode::OK);
    assert_eq!(bal["balance"], "10.00");
    assert_eq!(bal["updated_seq"], 3);

    // history
    let (s, page) = send(
        &app,
        "GET",
        "/v1/books/onramp/accounts/cash/history?limit=10",
        None,
        None,
    )
    .await;
    assert_eq!(s, StatusCode::OK);
    assert_eq!(page["items"].as_array().unwrap().len(), 1);

    // transaction view
    let tx_id = posted["tx_id"].as_str().unwrap();
    let (s, view) = send(
        &app,
        "GET",
        &format!("/v1/transactions/{tx_id}"),
        None,
        None,
    )
    .await;
    assert_eq!(s, StatusCode::OK);
    assert_eq!(view["book"], "onramp");

    // trial balance
    let (s, tb) = send(&app, "GET", "/v1/books/onramp/trial-balance", None, None).await;
    assert_eq!(s, StatusCode::OK);
    assert_eq!(tb["lines"][0]["debits"], 1000);

    // health
    let (s, _) = send(&app, "GET", "/health", None, None).await;
    assert_eq!(s, StatusCode::OK);
}

#[tokio::test]
async fn error_statuses() {
    let app = app(None).await;
    setup(&app).await;

    // 400 unbalanced
    let mut bad = transfer_body("e1", 1000);
    bad["postings"][1]["amount"]["minor"] = serde_json::json!(900);
    let (s, body) = send(&app, "POST", "/v1/transactions", None, Some(bad)).await;
    assert_eq!(s, StatusCode::BAD_REQUEST);
    assert_eq!(body["error"], "unbalanced");

    // 404 unknown account balance
    let (s, body) = send(
        &app,
        "GET",
        "/v1/books/onramp/accounts/ghost/balance",
        None,
        None,
    )
    .await;
    assert_eq!(s, StatusCode::NOT_FOUND);
    assert_eq!(body["error"], "unknown_account");

    // 404 unknown transaction
    let missing = uuid::Uuid::now_v7();
    let (s, body) = send(
        &app,
        "GET",
        &format!("/v1/transactions/{missing}"),
        None,
        None,
    )
    .await;
    assert_eq!(s, StatusCode::NOT_FOUND);
    assert_eq!(body["error"], "not_found");

    // 409 conflicting asset re-registration
    let mut conflict = usd();
    conflict["precision"] = serde_json::json!(8);
    let (s, body) = send(&app, "POST", "/v1/assets", None, Some(conflict)).await;
    assert_eq!(s, StatusCode::CONFLICT);
    assert_eq!(body["error"], "already_exists");
}

#[tokio::test]
async fn auth_gate() {
    let app = app(Some("sekrit")).await;

    // missing token → 401
    let (s, body) = send(&app, "POST", "/v1/assets", None, Some(usd())).await;
    assert_eq!(s, StatusCode::UNAUTHORIZED);
    assert_eq!(body["error"], "unauthorized");

    // GET routes are gated too
    let (s, _) = send(&app, "GET", "/v1/books/onramp/trial-balance", None, None).await;
    assert_eq!(s, StatusCode::UNAUTHORIZED);

    // wrong token → 401
    let (s, _) = send(&app, "POST", "/v1/assets", Some("nope"), Some(usd())).await;
    assert_eq!(s, StatusCode::UNAUTHORIZED);

    // right token → 204
    let (s, _) = send(&app, "POST", "/v1/assets", Some("sekrit"), Some(usd())).await;
    assert_eq!(s, StatusCode::NO_CONTENT);

    // health stays open
    let (s, _) = send(&app, "GET", "/health", None, None).await;
    assert_eq!(s, StatusCode::OK);
}

#[tokio::test]
async fn sse_streams_envelopes_with_ids() {
    use futures::StreamExt;
    use std::time::Duration;

    let app = app(None).await;
    setup(&app).await;
    let (s, _) = send(
        &app,
        "POST",
        "/v1/transactions",
        None,
        Some(transfer_body("sse1", 100)),
    )
    .await;
    assert_eq!(s, StatusCode::OK);

    // from=2 means "last seen seq 2": stream starts at 3 (the transaction)
    let res = app
        .clone()
        .oneshot(
            Request::builder()
                .uri("/v1/books/onramp/events?from=2")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);
    assert_eq!(
        res.headers()[header::CONTENT_TYPE].to_str().unwrap(),
        "text/event-stream"
    );

    let mut body = res.into_body().into_data_stream();
    let first = tokio::time::timeout(Duration::from_secs(5), body.next())
        .await
        .expect("timed out waiting for first SSE chunk")
        .expect("body ended")
        .unwrap();
    let text = String::from_utf8(first.to_vec()).unwrap();
    assert!(text.contains("id: 3"), "got: {text}");
    assert!(text.contains("transaction_posted"), "got: {text}");
}

#[tokio::test]
async fn overload_maps_to_503_with_retry_after() {
    let resp = talea_server::http::routes::handle_middleware_error(Box::new(
        tower::load_shed::error::Overloaded::new(),
    ))
    .await;
    assert_eq!(resp.status(), StatusCode::SERVICE_UNAVAILABLE);
    assert!(resp.headers().contains_key(header::RETRY_AFTER));
}

#[tokio::test]
async fn openapi_spec_is_complete_and_open() {
    let app = app(Some("sekrit")).await; // token set: docs must STILL be open

    let (s, spec) = send(&app, "GET", "/openapi.json", None, None).await;
    assert_eq!(s, StatusCode::OK);

    // every /v1 route the router serves must be documented
    let paths = spec["paths"].as_object().expect("paths object");
    let expected = [
        "/v1/assets",
        "/v1/accounts",
        "/v1/transactions",
        "/v1/transactions/{tx_id}",
        "/v1/books/{book}/accounts/{path}/balance",
        "/v1/books/{book}/accounts/{path}/history",
        "/v1/books/{book}/trial-balance",
        "/v1/books/{book}/events",
    ];
    for route in expected {
        assert!(paths.contains_key(route), "spec missing {route}");
    }
    // drift guard: nothing extra, nothing missing
    assert_eq!(paths.len(), expected.len(), "spec/router drift: {paths:?}");

    let schemas = spec["components"]["schemas"].as_object().expect("schemas");
    for schema in [
        "ApiError",
        "EventEnvelope",
        "Posted",
        "TransactionDraft",
        "BalanceView",
    ] {
        assert!(schemas.contains_key(schema), "missing schema {schema}");
    }
    // bearer security scheme present
    assert!(spec["components"]["securitySchemes"].is_object());
}

#[tokio::test]
async fn swagger_ui_serves_without_token() {
    let app = app(Some("sekrit")).await;
    let res = app
        .clone()
        .oneshot(
            Request::builder()
                .uri("/docs/")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    // SwaggerUi serves HTML at /docs/ (a bare /docs may 303-redirect there)
    assert!(
        res.status() == StatusCode::OK || res.status().is_redirection(),
        "got {}",
        res.status()
    );
}

/// Exercises the exact middleware stack routes.rs installs, around a slow
/// service: with one in-flight slot taken, the concurrent request sheds.
#[tokio::test]
async fn load_shed_sheds_when_saturated() {
    use std::time::Duration;
    use tower::{Service, ServiceBuilder, ServiceExt, service_fn};

    let svc = ServiceBuilder::new()
        .layer(axum::error_handling::HandleErrorLayer::new(
            talea_server::http::routes::handle_middleware_error,
        ))
        .load_shed()
        .concurrency_limit(1)
        .service(service_fn(|_req: Request<Body>| async {
            tokio::time::sleep(Duration::from_millis(200)).await;
            Ok::<_, std::convert::Infallible>(axum::response::Response::new(Body::empty()))
        }));

    let slow = {
        let mut svc = svc.clone();
        async move {
            svc.ready().await.unwrap();
            svc.call(Request::builder().body(Body::empty()).unwrap())
                .await
        }
    };
    let shed = {
        let mut svc = svc.clone();
        async move {
            tokio::time::sleep(Duration::from_millis(50)).await;
            svc.ready().await.unwrap();
            svc.call(Request::builder().body(Body::empty()).unwrap())
                .await
        }
    };
    let (a, b) = tokio::join!(slow, shed);
    assert_eq!(a.unwrap().status(), StatusCode::OK);
    assert_eq!(b.unwrap().status(), StatusCode::SERVICE_UNAVAILABLE);
}

/// One process-global recorder shared by every test in this binary
/// (install_recorder is once-per-process). Assert presence/deltas only —
/// never exact totals — so tests stay parallel-safe.
fn metrics_handle() -> &'static metrics_exporter_prometheus::PrometheusHandle {
    use std::sync::OnceLock;
    static HANDLE: OnceLock<metrics_exporter_prometheus::PrometheusHandle> = OnceLock::new();
    HANDLE.get_or_init(talea_server::metrics::install)
}

#[tokio::test]
async fn http_metrics_record_route_templates() {
    let handle = metrics_handle();
    let app = app(None).await;
    setup(&app).await;
    let (s, _) = send(
        &app,
        "GET",
        "/v1/books/onramp/accounts/cash/balance",
        None,
        None,
    )
    .await;
    assert_eq!(s, StatusCode::OK);

    let text = handle.render();
    assert!(
        text.contains("talea_http_requests_total"),
        "missing counter:\n{text}"
    );
    // the label must be a ROUTE TEMPLATE, not the concrete path
    assert!(
        text.contains("{book}") && text.contains("balance"),
        "route template label missing:\n{text}"
    );
    assert!(
        !text.contains("/books/onramp/"),
        "raw path leaked into labels (cardinality bug):\n{text}"
    );
    assert!(text.contains("talea_http_request_duration_seconds"));
}

#[tokio::test]
async fn sse_gauge_returns_to_zero_after_disconnect() {
    use futures::StreamExt;
    use std::time::Duration;

    let handle = metrics_handle();
    let app = app(None).await;
    setup(&app).await;

    {
        let res = app
            .clone()
            .oneshot(
                Request::builder()
                    .uri("/v1/books/onramp/events?from=0")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(res.status(), StatusCode::OK);
        let mut body = res.into_body().into_data_stream();
        // read one chunk so the stream (and guard) is definitely live
        let _ = tokio::time::timeout(Duration::from_secs(5), body.next())
            .await
            .expect("timed out")
            .expect("body ended");
        let live = handle.render();
        assert!(
            live.contains("talea_sse_subscribers 1"),
            "gauge not incremented:\n{live}"
        );
    } // response dropped -> stream dropped -> guard dropped

    let mut zeroed = false;
    for _ in 0..50 {
        if handle.render().contains("talea_sse_subscribers 0") {
            zeroed = true;
            break;
        }
        tokio::time::sleep(Duration::from_millis(20)).await;
    }
    assert!(zeroed, "gauge did not return to 0:\n{}", handle.render());
}

#[tokio::test]
async fn shed_increments_counter() {
    use std::time::Duration;
    use tower::{Service, ServiceBuilder, ServiceExt, service_fn};

    let handle = metrics_handle();
    let svc = ServiceBuilder::new()
        .layer(axum::error_handling::HandleErrorLayer::new(
            talea_server::http::routes::handle_middleware_error,
        ))
        .load_shed()
        .concurrency_limit(1)
        .service(service_fn(|_req: Request<Body>| async {
            tokio::time::sleep(Duration::from_millis(200)).await;
            Ok::<_, std::convert::Infallible>(axum::response::Response::new(Body::empty()))
        }));

    let slow = {
        let mut svc = svc.clone();
        async move {
            svc.ready().await.unwrap();
            svc.call(Request::builder().body(Body::empty()).unwrap())
                .await
        }
    };
    let shed = {
        let mut svc = svc.clone();
        async move {
            tokio::time::sleep(Duration::from_millis(50)).await;
            svc.ready().await.unwrap();
            svc.call(Request::builder().body(Body::empty()).unwrap())
                .await
        }
    };
    let (_, b) = tokio::join!(slow, shed);
    assert_eq!(b.unwrap().status(), StatusCode::SERVICE_UNAVAILABLE);
    assert!(
        handle.render().contains("talea_shed_total"),
        "shed counter missing:\n{}",
        handle.render()
    );
}
