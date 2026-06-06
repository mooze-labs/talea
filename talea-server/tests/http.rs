use std::collections::HashSet;
use std::sync::Arc;

use axum::body::Body;
use axum::http::{Request, StatusCode, header};
use http_body_util::BodyExt;
use sqlx::sqlite::SqlitePoolOptions;
use talea_server::http::auth::{Access, AuthConfig, BookSet, TokenScope};
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
        AuthConfig::single(token.map(String::from)),
        256,
        "sqlite",
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

/// RFC 7235: the auth-scheme is case-insensitive, and one-or-more spaces
/// separate it from the token.
#[tokio::test]
async fn auth_scheme_is_case_insensitive() {
    let app = app(Some("sekrit")).await;

    for value in ["bearer sekrit", "BEARER sekrit", "Bearer  sekrit"] {
        let req = Request::builder()
            .method("GET")
            .uri("/v1/books/onramp/trial-balance")
            .header(header::AUTHORIZATION, value)
            .body(Body::empty())
            .unwrap();
        let res = app.clone().oneshot(req).await.unwrap();
        assert_eq!(res.status(), StatusCode::OK, "rejected {value:?}");
    }

    // a different scheme carrying the right token is still not bearer auth
    let req = Request::builder()
        .method("GET")
        .uri("/v1/books/onramp/trial-balance")
        .header(header::AUTHORIZATION, "Basic sekrit")
        .body(Body::empty())
        .unwrap();
    let res = app.clone().oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::UNAUTHORIZED);
}

/// talea_sse_subscribers is a process-global gauge and tests in this binary
/// run in parallel: any two tests that hold SSE streams open will race the
/// gauge test's exact-value assertions (observed on CI: gauge read 2).
/// Every stream-holding test must take this lock. Counters are exempt —
/// they're monotonic, so presence assertions can't race.
static SSE_GAUGE_LOCK: tokio::sync::Mutex<()> = tokio::sync::Mutex::const_new(());

#[tokio::test]
async fn sse_streams_envelopes_with_ids() {
    use futures::StreamExt;
    use std::time::Duration;

    let _gauge_isolation = SSE_GAUGE_LOCK.lock().await;
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
        "/v1/transactions/batch",
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
async fn openapi_spec_is_generator_clean() {
    let app = app(None).await;
    let (s, spec) = send(&app, "GET", "/openapi.json", None, None).await;
    assert_eq!(s, StatusCode::OK);

    // generators want a servers entry
    assert!(
        spec["servers"].as_array().is_some_and(|s| !s.is_empty()),
        "servers must be present and non-empty"
    );

    for (path, ops) in spec["paths"].as_object().expect("paths") {
        for (method, op) in ops.as_object().unwrap() {
            let id = format!("{method} {path}");

            // params named in the template are Path; everything else is Query.
            // utoipa defaults IntoParams to Path — without parameter_in = Query
            // generated clients refuse query args (query?: never) and demand
            // them as path substitutions.
            if let Some(params) = op["parameters"].as_array() {
                for p in params {
                    let name = p["name"].as_str().unwrap();
                    let location = p["in"].as_str().unwrap();
                    let expected = if path.contains(&format!("{{{name}}}")) {
                        "path"
                    } else {
                        "query"
                    };
                    assert_eq!(location, expected, "{id}: param {name} misplaced");
                }
            }

            // summaries + response descriptions surface in generated SDK docs
            assert!(
                op["summary"].as_str().is_some_and(|s| !s.is_empty()),
                "{id}: missing summary"
            );
            let responses = op["responses"].as_object().unwrap();
            for (status, resp) in responses {
                assert!(
                    resp["description"].as_str().is_some_and(|d| !d.is_empty()),
                    "{id}: response {status} has empty description"
                );
            }

            // the admission layer applies to every route: 503 everywhere,
            // 408 everywhere except the SSE stream (which has no timeout layer)
            assert!(responses.contains_key("503"), "{id}: 503 undocumented");
            if path != "/v1/books/{book}/events" {
                assert!(responses.contains_key("408"), "{id}: 408 undocumented");
            }
        }
    }

    // the SSE payload type must be reachable from the spec, not orphaned
    let sse_schema = &spec["paths"]["/v1/books/{book}/events"]["get"]["responses"]["200"]["content"]
        ["text/event-stream"]["schema"];
    assert_eq!(
        sse_schema["$ref"].as_str(),
        Some("#/components/schemas/EventEnvelope"),
        "SSE 200 must reference EventEnvelope"
    );

    // free-string wire fields must document their accepted values
    let kind_desc =
        spec["components"]["schemas"]["AccountDraft"]["properties"]["kind"]["description"]
            .as_str()
            .unwrap_or("");
    for v in [
        "asset",
        "liability",
        "income",
        "expense",
        "equity",
        "clearing",
    ] {
        assert!(kind_desc.contains(v), "AccountDraft.kind must list `{v}`");
    }
    let class_desc =
        spec["components"]["schemas"]["AssetDraft"]["properties"]["class"]["description"]
            .as_str()
            .unwrap_or("");
    for v in ["fiat", "crypto"] {
        assert!(class_desc.contains(v), "AssetDraft.class must list `{v}`");
    }
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

    let _gauge_isolation = SSE_GAUGE_LOCK.lock().await;
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

#[tokio::test]
async fn middleware_errors_use_the_envelope() {
    // (`.oneshot` comes from the file's existing `use tower::ServiceExt;`)

    // load shed -> 503 + Retry-After + overloaded envelope
    let resp = talea_server::http::routes::handle_middleware_error(Box::new(
        tower::load_shed::error::Overloaded::new(),
    ))
    .await;
    assert_eq!(resp.status(), StatusCode::SERVICE_UNAVAILABLE);
    assert!(resp.headers().contains_key(header::RETRY_AFTER));
    assert_eq!(body_json(resp).await["error"], "overloaded");

    // timeout -> 408 timeout envelope. A real Elapsed obtained from a real
    // timeout layer (its constructor isn't part of tower's public API).
    let svc = tower::ServiceBuilder::new()
        .timeout(std::time::Duration::from_millis(1))
        .service(tower::service_fn(|_: ()| async {
            tokio::time::sleep(std::time::Duration::from_secs(5)).await;
            Ok::<_, std::convert::Infallible>(())
        }));
    let err = svc.oneshot(()).await.unwrap_err();
    let resp = talea_server::http::routes::handle_middleware_error(err).await;
    assert_eq!(resp.status(), StatusCode::REQUEST_TIMEOUT);
    assert_eq!(body_json(resp).await["error"], "timeout");

    // anything else -> 500 internal envelope; the error text is NOT leaked
    let resp = talea_server::http::routes::handle_middleware_error("secret detail".into()).await;
    assert_eq!(resp.status(), StatusCode::INTERNAL_SERVER_ERROR);
    let body = body_json(resp).await;
    assert_eq!(body["error"], "internal");
    assert_eq!(body["message"], "middleware failure");
}

#[tokio::test]
async fn health_reports_backend_header() {
    let app = app(None).await;
    let req = Request::builder()
        .method("GET")
        .uri("/health")
        .body(Body::empty())
        .unwrap();
    let res = app.oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::OK);
    assert_eq!(
        res.headers()
            .get("x-talea-backend")
            .and_then(|v| v.to_str().ok()),
        Some("sqlite")
    );
    // body must stay exactly "ok" — load balancers compare it verbatim
    let bytes = res.into_body().collect().await.unwrap().to_bytes();
    assert_eq!(&bytes[..], b"ok");
}

mod overload {
    use super::*;
    use async_trait::async_trait;
    use chrono::{DateTime, Utc};
    use talea_core::events::LedgerEvent;
    use talea_core::store::*;
    use talea_core::types::*;
    use talea_server::write_router::WriteConfig;

    /// Every commit hangs forever: the committer parks on the first job, the
    /// depth-1 queue fills with the second, the third gets 429.
    struct StuckStore;

    #[async_trait]
    impl Store for StuckStore {
        async fn commit_batch(&self, _: &[Transaction]) -> Vec<Result<Committed, StoreError>> {
            futures::future::pending().await
        }
        async fn commit(&self, _: &Transaction) -> Result<Committed, StoreError> {
            futures::future::pending().await
        }
        async fn register_asset(&self, _: &AssetDef) -> Result<(), StoreError> {
            unimplemented!()
        }
        async fn open_account(&self, _: &AccountDef, _: &AccountCfg) -> Result<(), StoreError> {
            unimplemented!()
        }
        async fn balance(
            &self,
            _: &AccountId,
            _: Option<DateTime<Utc>>,
        ) -> Result<BalanceSnapshot, StoreError> {
            unimplemented!()
        }
        async fn asset(&self, _: &AssetId) -> Result<Option<AssetDef>, StoreError> {
            unimplemented!()
        }
        async fn account_history(
            &self,
            _: &AccountId,
            _: Option<Seq>,
            _: usize,
        ) -> Result<Vec<PostingRecord>, StoreError> {
            unimplemented!()
        }
        async fn transaction(&self, _: &TxId) -> Result<Option<StoredTransaction>, StoreError> {
            unimplemented!()
        }
        async fn trial_balance(
            &self,
            _: &Book,
            _: Option<DateTime<Utc>>,
        ) -> Result<Vec<TrialBalanceRow>, StoreError> {
            unimplemented!()
        }
        async fn read_events(
            &self,
            _: &Book,
            _: Seq,
            _: usize,
        ) -> Result<Vec<Sequenced<LedgerEvent>>, StoreError> {
            unimplemented!()
        }
        fn subscribe(&self, _: &Book, _: Seq) -> EventStream {
            unimplemented!()
        }
    }

    #[tokio::test]
    async fn full_write_queue_answers_429_with_retry_after() {
        let service = Arc::new(LedgerService::with_write_config(
            Arc::new(StuckStore),
            WriteConfig {
                queue_depth: 1,
                ..Default::default()
            },
        ));
        let app = talea_server::http::routes::router(service, AuthConfig::open(), 256, "sqlite");

        // first request: committer takes it and hangs
        {
            let app = app.clone();
            let body = transfer_body("a", 100);
            tokio::spawn(async move {
                let req = Request::builder()
                    .method("POST")
                    .uri("/v1/transactions")
                    .header(header::CONTENT_TYPE, "application/json")
                    .body(Body::from(body.to_string()))
                    .unwrap();
                let _ = app.oneshot(req).await;
            });
        }
        // Let "a"'s task run (sends to channel + spawns committer) then let the
        // committer run (takes "a" and parks in the stuck store).
        tokio::task::yield_now().await;
        tokio::task::yield_now().await;

        // second request: fills the now-empty queue slot
        {
            let app = app.clone();
            let body = transfer_body("b", 100);
            tokio::spawn(async move {
                let req = Request::builder()
                    .method("POST")
                    .uri("/v1/transactions")
                    .header(header::CONTENT_TYPE, "application/json")
                    .body(Body::from(body.to_string()))
                    .unwrap();
                let _ = app.oneshot(req).await;
            });
        }
        // give "b"'s task time to reach try_send and fill the queue slot
        tokio::time::sleep(std::time::Duration::from_millis(100)).await;

        let req = Request::builder()
            .method("POST")
            .uri("/v1/transactions")
            .header(header::CONTENT_TYPE, "application/json")
            .body(Body::from(transfer_body("c", 100).to_string()))
            .unwrap();
        let res = app.clone().oneshot(req).await.unwrap();
        assert_eq!(res.status(), StatusCode::TOO_MANY_REQUESTS);
        assert_eq!(
            res.headers()
                .get(header::RETRY_AFTER)
                .and_then(|v| v.to_str().ok()),
            Some("1")
        );
        let bytes = res.into_body().collect().await.unwrap().to_bytes();
        let body: serde_json::Value = serde_json::from_slice(&bytes).unwrap();
        assert_eq!(body["error"], "overloaded");
    }
}

// ---- batch helpers / tests --------------------------------------------------

/// App with a custom TALEA_HTTP_BATCH_MAX value (for cap tests).
async fn batch_capped_app(batch_max: usize) -> axum::Router {
    let pool = SqlitePoolOptions::new()
        .max_connections(1)
        .connect("sqlite::memory:")
        .await
        .unwrap();
    let store = SqliteTaleaStore::new(pool);
    store.migrate().await.unwrap();
    let service = Arc::new(LedgerService::new(Arc::new(store)));
    talea_server::http::routes::router_with_batch_max(
        service,
        AuthConfig::open(),
        256,
        "sqlite",
        batch_max,
    )
}

fn draft(book: &str, idem: &str, minor: i64) -> serde_json::Value {
    serde_json::json!({
        "book": book,
        "idempotency_key": idem,
        "postings": [
            {"account":"deposits","amount":{"minor":minor,"asset":"USD"},"direction":"credit"},
            {"account":"cash","amount":{"minor":minor,"asset":"USD"},"direction":"debit"}
        ]
    })
}

fn draft_unbalanced(book: &str, idem: &str) -> serde_json::Value {
    serde_json::json!({
        "book": book,
        "idempotency_key": idem,
        "postings": [
            {"account":"deposits","amount":{"minor":100,"asset":"USD"},"direction":"credit"},
            {"account":"cash","amount":{"minor":90,"asset":"USD"},"direction":"debit"}
        ]
    })
}

fn book_account(book: &str, path: &str, kind: &str, side: &str) -> serde_json::Value {
    serde_json::json!({"book": book, "path": path, "asset": "USD", "kind": kind, "normal_side": side})
}

/// Register USD + open cash/deposits in each listed book.
async fn setup_books(app: &axum::Router, books: &[&str]) {
    let (s, _) = send(app, "POST", "/v1/assets", None, Some(usd())).await;
    assert_eq!(s, StatusCode::NO_CONTENT, "register USD");
    for &book in books {
        let (s, _) = send(
            app,
            "POST",
            "/v1/accounts",
            None,
            Some(book_account(book, "cash", "asset", "debit")),
        )
        .await;
        assert_eq!(s, StatusCode::NO_CONTENT, "open {book}/cash");
        let (s, _) = send(
            app,
            "POST",
            "/v1/accounts",
            None,
            Some(book_account(book, "deposits", "liability", "credit")),
        )
        .await;
        assert_eq!(s, StatusCode::NO_CONTENT, "open {book}/deposits");
    }
}

/// 1. Happy path: 3 drafts across two books → 200, positional Posted bodies.
#[tokio::test]
async fn batch_happy_path_mixed_books() {
    let app = app(None).await;
    setup_books(&app, &["alpha", "beta"]).await;

    let body = serde_json::json!([
        draft("alpha", "b1", 1000),
        draft("beta", "b2", 2000),
        draft("alpha", "b3", 3000),
    ]);
    let (s, arr) = send(&app, "POST", "/v1/transactions/batch", None, Some(body)).await;
    assert_eq!(s, StatusCode::OK, "{arr}");

    let items = arr.as_array().expect("expected array");
    assert_eq!(items.len(), 3);
    // all three succeeded
    for (i, item) in items.iter().enumerate() {
        assert!(item.get("error").is_none(), "slot {i} has error: {item}");
        assert!(item["tx_id"].is_string(), "slot {i} missing tx_id: {item}");
        assert_eq!(item["deduplicated"], false, "slot {i}");
    }
    // both alpha drafts committed in the same book: seqs must be distinct
    // and positive (ordering may vary with concurrent dispatch)
    let seq0 = items[0]["seq"].as_i64().unwrap();
    let seq2 = items[2]["seq"].as_i64().unwrap();
    assert!(seq0 > 0, "alpha slot 0 seq must be positive");
    assert!(seq2 > 0, "alpha slot 2 seq must be positive");
    assert_ne!(seq0, seq2, "alpha seqs must be distinct");
}

/// 2. Partial failure: one unbalanced draft among valid ones.
#[tokio::test]
async fn batch_partial_failure_slot_isolation() {
    let app = app(None).await;
    setup_books(&app, &["gamma"]).await;

    let body = serde_json::json!([
        draft("gamma", "pf1", 500),
        draft_unbalanced("gamma", "pf2"),
        draft("gamma", "pf3", 700),
    ]);
    let (s, arr) = send(&app, "POST", "/v1/transactions/batch", None, Some(body)).await;
    assert_eq!(s, StatusCode::OK, "{arr}");

    let items = arr.as_array().unwrap();
    assert_eq!(items.len(), 3);
    // slot 0 and 2 succeed
    assert!(items[0].get("error").is_none(), "slot 0: {}", items[0]);
    assert!(items[2].get("error").is_none(), "slot 2: {}", items[2]);
    // slot 1 carries the error envelope
    assert_eq!(items[1]["error"], "unbalanced", "slot 1: {}", items[1]);
}

/// 3. Scoped token: book A only; batch with A and B drafts →
///    A slots Posted, B slots `{"error":"forbidden","book":"B"}`.
#[tokio::test]
async fn batch_scoped_token_per_draft_403() {
    let app = scoped_app(&[("admin", &["*"], "rw"), ("scoped", &["book-a"], "rw")]).await;
    // scoped_app has auth enabled — all setup must use admin token.
    let (s, _) = send(&app, "POST", "/v1/assets", Some("admin"), Some(usd())).await;
    assert_eq!(s, StatusCode::NO_CONTENT, "register USD");
    for (book, path, kind, side) in [
        ("book-a", "cash", "asset", "debit"),
        ("book-a", "deposits", "liability", "credit"),
        ("book-b", "cash", "asset", "debit"),
        ("book-b", "deposits", "liability", "credit"),
    ] {
        let (s, _) = send(
            &app,
            "POST",
            "/v1/accounts",
            Some("admin"),
            Some(book_account(book, path, kind, side)),
        )
        .await;
        assert_eq!(s, StatusCode::NO_CONTENT, "setup {book}/{path}");
    }

    let body = serde_json::json!([
        draft("book-a", "sc1", 100),
        draft("book-b", "sc2", 200),
        draft("book-a", "sc3", 300),
    ]);
    let (s, arr) = send(
        &app,
        "POST",
        "/v1/transactions/batch",
        Some("scoped"),
        Some(body),
    )
    .await;
    assert_eq!(s, StatusCode::OK, "{arr}");

    let items = arr.as_array().unwrap();
    assert_eq!(items.len(), 3);
    // slots 0 and 2: in scope → Posted
    assert!(items[0].get("error").is_none(), "slot 0: {}", items[0]);
    assert!(items[2].get("error").is_none(), "slot 2: {}", items[2]);
    // slot 1: book-b is out of scope → 403 envelope in the slot
    assert_eq!(items[1]["error"], "forbidden", "slot 1: {}", items[1]);
    assert_eq!(items[1]["book"], "book-b", "slot 1 book: {}", items[1]);
}

/// 4. Cap: batch_max=2; 3 drafts → 400 envelope naming cap and length.
#[tokio::test]
async fn batch_cap_exceeded_is_400() {
    let app = batch_capped_app(2).await;
    setup_books(&app, &["captest"]).await;

    let body = serde_json::json!([
        draft("captest", "cap1", 100),
        draft("captest", "cap2", 200),
        draft("captest", "cap3", 300),
    ]);
    let (s, body_val) = send(&app, "POST", "/v1/transactions/batch", None, Some(body)).await;
    assert_eq!(s, StatusCode::BAD_REQUEST, "{body_val}");
    assert_eq!(body_val["error"], "invalid_draft", "{body_val}");
    let reason = body_val["reason"].as_str().unwrap();
    assert!(
        reason.contains("3"),
        "reason should mention length: {reason}"
    );
    assert!(reason.contains("2"), "reason should mention cap: {reason}");
}

/// 5. Empty array → 200 [].
#[tokio::test]
async fn batch_empty_array_ok() {
    let app = app(None).await;
    let (s, arr) = send(
        &app,
        "POST",
        "/v1/transactions/batch",
        None,
        Some(serde_json::json!([])),
    )
    .await;
    assert_eq!(s, StatusCode::OK, "{arr}");
    assert_eq!(arr.as_array().unwrap().len(), 0);
}

/// 6a. Malformed body (not an array) → 400.
/// 6b. Wrong content type → 415.
#[tokio::test]
async fn batch_bad_request_shapes() {
    let app = app(None).await;

    // not a JSON array — object instead
    let (s, body) = send(
        &app,
        "POST",
        "/v1/transactions/batch",
        None,
        Some(serde_json::json!({"book": "x"})),
    )
    .await;
    assert_eq!(s, StatusCode::BAD_REQUEST, "{body}");
    assert_eq!(body["error"], "invalid_draft");

    // wrong content-type → 415
    let req = Request::builder()
        .method("POST")
        .uri("/v1/transactions/batch")
        .body(Body::from(serde_json::json!([]).to_string()))
        .unwrap();
    let res = app.clone().oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::UNSUPPORTED_MEDIA_TYPE);
}

/// Decode a response body as JSON (null if empty/undecodable) — for tests
/// that must build raw requests instead of going through send().
async fn body_json(res: axum::response::Response) -> serde_json::Value {
    let bytes = res.into_body().collect().await.unwrap().to_bytes();
    serde_json::from_slice(&bytes).unwrap_or(serde_json::json!(null))
}

/// Router over fresh sqlite with explicit (secret, books, access) entries.
/// books = ["*"] means all books; access is "ro" or "rw".
async fn scoped_app(entries: &[(&str, &[&str], &str)]) -> axum::Router {
    let pool = SqlitePoolOptions::new()
        .max_connections(1)
        .connect("sqlite::memory:")
        .await
        .unwrap();
    let store = SqliteTaleaStore::new(pool);
    store.migrate().await.unwrap();
    let service = Arc::new(LedgerService::new(Arc::new(store)));
    let entries = entries
        .iter()
        .map(|(secret, books, access)| {
            let books = if books.len() == 1 && books[0] == "*" {
                BookSet::All
            } else {
                BookSet::Named(books.iter().map(|b| b.to_string()).collect::<HashSet<_>>())
            };
            let access = match *access {
                "ro" => Access::ReadOnly,
                _ => Access::ReadWrite,
            };
            (
                secret.to_string(),
                Arc::new(TokenScope {
                    name: format!("entry-{secret}"),
                    books,
                    access,
                }),
            )
        })
        .collect();
    talea_server::http::routes::router(service, AuthConfig { entries }, 256, "sqlite")
}

#[tokio::test]
async fn scoped_tokens_gate_books() {
    let app = scoped_app(&[
        ("admin", &["*"], "rw"),
        ("payments", &["onramp"], "rw"),
        ("reporting", &["*"], "ro"),
        ("other-svc", &["other"], "rw"),
    ])
    .await;

    // setup via admin: USD + cash/deposits in "onramp" (existing fixtures)
    let (s, _) = send(&app, "POST", "/v1/assets", Some("admin"), Some(usd())).await;
    assert_eq!(s, StatusCode::NO_CONTENT);
    for (path, kind, side) in [
        ("cash", "asset", "debit"),
        ("deposits", "liability", "credit"),
    ] {
        let (s, _) = send(
            &app,
            "POST",
            "/v1/accounts",
            Some("admin"),
            Some(account(path, kind, side)),
        )
        .await;
        assert_eq!(s, StatusCode::NO_CONTENT);
    }

    // scoped rw writes its own book
    let (s, posted) = send(
        &app,
        "POST",
        "/v1/transactions",
        Some("payments"),
        Some(transfer_body("t1", 100)),
    )
    .await;
    assert_eq!(s, StatusCode::OK);

    // ro token reads...
    let (s, _) = send(
        &app,
        "GET",
        "/v1/books/onramp/accounts/cash/balance",
        Some("reporting"),
        None,
    )
    .await;
    assert_eq!(s, StatusCode::OK);
    // ...but cannot write
    let (s, body) = send(
        &app,
        "POST",
        "/v1/transactions",
        Some("reporting"),
        Some(transfer_body("t2", 100)),
    )
    .await;
    assert_eq!(s, StatusCode::FORBIDDEN);
    assert_eq!(body["error"], "forbidden");
    assert_eq!(body["book"], "onramp");

    // foreign-book read is forbidden, naming the book
    let (s, body) = send(
        &app,
        "GET",
        "/v1/books/onramp/trial-balance",
        Some("other-svc"),
        None,
    )
    .await;
    assert_eq!(s, StatusCode::FORBIDDEN);
    assert_eq!(body["book"], "onramp");

    // history shares allows_read with trial-balance; pin it explicitly
    let (s, body) = send(
        &app,
        "GET",
        "/v1/books/onramp/accounts/cash/history",
        Some("other-svc"),
        None,
    )
    .await;
    assert_eq!(s, StatusCode::FORBIDDEN);
    assert_eq!(body["book"], "onramp");

    // account-opening shares allows_write with tx-posting; pin it explicitly
    let (s, body) = send(
        &app,
        "POST",
        "/v1/accounts",
        Some("other-svc"),
        Some(account("savings", "asset", "debit")),
    )
    .await;
    assert_eq!(s, StatusCode::FORBIDDEN);
    assert_eq!(body["book"], "onramp");

    // foreign-book write (book lives in the BODY) is forbidden
    let (s, body) = send(
        &app,
        "POST",
        "/v1/transactions",
        Some("other-svc"),
        Some(transfer_body("t3", 100)),
    )
    .await;
    assert_eq!(s, StatusCode::FORBIDDEN);
    assert_eq!(body["book"], "onramp");

    // registry needs *: scoped rw is forbidden with book "*"
    let (s, body) = send(&app, "POST", "/v1/assets", Some("payments"), Some(usd())).await;
    assert_eq!(s, StatusCode::FORBIDDEN);
    assert_eq!(body["book"], "*");
    // ro-all is forbidden too (registry needs rw)
    let (s, _) = send(&app, "POST", "/v1/assets", Some("reporting"), Some(usd())).await;
    assert_eq!(s, StatusCode::FORBIDDEN);

    // tx-by-id: the book is only known after the load
    let tx_id = posted["tx_id"].as_str().unwrap();
    let (s, _) = send(
        &app,
        "GET",
        &format!("/v1/transactions/{tx_id}"),
        Some("payments"),
        None,
    )
    .await;
    assert_eq!(s, StatusCode::OK);
    // out-of-scope tx-by-id is 404, byte-identical to a true miss: a 403
    // here would be an existence oracle for transaction ids (and leaked
    // the owning book's name to a token that has no rights to it)
    let (s, body) = send(
        &app,
        "GET",
        &format!("/v1/transactions/{tx_id}"),
        Some("other-svc"),
        None,
    )
    .await;
    assert_eq!(s, StatusCode::NOT_FOUND);
    assert_eq!(body["error"], "not_found");
    assert_eq!(body["what"], format!("transaction {tx_id}"));
    assert!(body.get("book").is_none(), "must not leak the book: {body}");
    // ...and carries the same shape as a genuinely unknown id
    let ghost = "00000000-0000-4000-8000-000000000000";
    let (s, ghost_body) = send(
        &app,
        "GET",
        &format!("/v1/transactions/{ghost}"),
        Some("other-svc"),
        None,
    )
    .await;
    assert_eq!(s, StatusCode::NOT_FOUND);
    assert_eq!(
        ghost_body.as_object().unwrap().keys().collect::<Vec<_>>(),
        body.as_object().unwrap().keys().collect::<Vec<_>>(),
        "out-of-scope and true-miss bodies must be indistinguishable"
    );

    // SSE: foreign book forbidden before any stream output
    let (s, body) = send(
        &app,
        "GET",
        "/v1/books/onramp/events",
        Some("other-svc"),
        None,
    )
    .await;
    assert_eq!(s, StatusCode::FORBIDDEN);
    assert_eq!(body["error"], "forbidden");
    // ...and the in-scope subscribe still answers 200 (stream starts).
    // NOTE: send() collects the whole body, which would hang on a live SSE
    // stream — assert via a raw request, reading only the response head:
    let req = Request::builder()
        .method("GET")
        .uri("/v1/books/onramp/events")
        .header(header::AUTHORIZATION, "Bearer reporting")
        .body(Body::empty())
        .unwrap();
    let res = app.clone().oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::OK);

    // unknown token is 401 (distinct from 403)
    let (s, body) = send(
        &app,
        "GET",
        "/v1/books/onramp/trial-balance",
        Some("nope"),
        None,
    )
    .await;
    assert_eq!(s, StatusCode::UNAUTHORIZED);
    assert_eq!(body["error"], "unauthorized");
}

#[tokio::test]
async fn extractor_rejections_use_the_envelope() {
    let app = app(None).await;
    setup(&app).await;

    // malformed JSON syntax -> 400 invalid_draft
    let req = Request::builder()
        .method("POST")
        .uri("/v1/transactions")
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from("{\"book\":"))
        .unwrap();
    let res = app.clone().oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::BAD_REQUEST);
    let body = body_json(res).await;
    assert_eq!(body["error"], "invalid_draft");
    assert_eq!(body["field"], "body");

    // well-formed JSON, wrong type (string where i64 expected) -> 400, NOT axum's 422
    let mut bad = transfer_body("etype", 100);
    bad["postings"][0]["amount"]["minor"] = serde_json::json!("a-string");
    let (s, body) = send(&app, "POST", "/v1/transactions", None, Some(bad)).await;
    assert_eq!(s, StatusCode::BAD_REQUEST);
    assert_eq!(body["error"], "invalid_draft");
    assert_eq!(body["field"], "body");
    let reason = body["reason"].as_str().unwrap();
    assert!(
        !reason.is_empty(),
        "data-error reason must carry serde's message"
    );

    // missing content-type -> 415 envelope
    let req = Request::builder()
        .method("POST")
        .uri("/v1/transactions")
        .body(Body::from(transfer_body("ect", 100).to_string()))
        .unwrap();
    let res = app.clone().oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::UNSUPPORTED_MEDIA_TYPE);
    let body = body_json(res).await;
    assert_eq!(body["error"], "invalid_draft");
    assert_eq!(body["field"], "body");

    // bad query param: as_of not a date -> 400 envelope
    let (s, body) = send(
        &app,
        "GET",
        "/v1/books/onramp/accounts/cash/balance?as_of=yesterday",
        None,
        None,
    )
    .await;
    assert_eq!(s, StatusCode::BAD_REQUEST);
    assert_eq!(body["error"], "invalid_draft");
    assert_eq!(body["field"], "query");

    // bad query param: limit not a number -> 400 envelope
    let (s, body) = send(
        &app,
        "GET",
        "/v1/books/onramp/accounts/cash/history?limit=abc",
        None,
        None,
    )
    .await;
    assert_eq!(s, StatusCode::BAD_REQUEST);
    assert_eq!(body["error"], "invalid_draft");
    assert_eq!(body["field"], "query");
    assert!(
        body["reason"].as_str().is_some_and(|r| !r.is_empty()),
        "query rejection must carry a reason"
    );

    // SSE query param: from not a number -> 400 envelope
    let (s, body) = send(&app, "GET", "/v1/books/onramp/events?from=abc", None, None).await;
    assert_eq!(s, StatusCode::BAD_REQUEST);
    assert_eq!(body["error"], "invalid_draft");
    assert_eq!(body["field"], "query");
}
