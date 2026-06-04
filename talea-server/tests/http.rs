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
        AuthConfig { token: token.map(String::from) },
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
    let (s, _) = send(app, "POST", "/v1/accounts", None, Some(account("cash", "asset", "debit"))).await;
    assert_eq!(s, StatusCode::NO_CONTENT);
    let (s, _) = send(app, "POST", "/v1/accounts", None, Some(account("deposits", "liability", "credit"))).await;
    assert_eq!(s, StatusCode::NO_CONTENT);
}

#[tokio::test]
async fn full_rest_round_trip() {
    let app = app(None).await;
    setup(&app).await;

    // post a transaction
    let (s, posted) = send(&app, "POST", "/v1/transactions", None, Some(transfer_body("t1", 1000))).await;
    assert_eq!(s, StatusCode::OK);
    assert_eq!(posted["seq"], 3);
    assert_eq!(posted["deduplicated"], false);

    // balance
    let (s, bal) = send(&app, "GET", "/v1/books/onramp/accounts/cash/balance", None, None).await;
    assert_eq!(s, StatusCode::OK);
    assert_eq!(bal["balance"], "10.00");
    assert_eq!(bal["updated_seq"], 3);

    // history
    let (s, page) = send(&app, "GET", "/v1/books/onramp/accounts/cash/history?limit=10", None, None).await;
    assert_eq!(s, StatusCode::OK);
    assert_eq!(page["items"].as_array().unwrap().len(), 1);

    // transaction view
    let tx_id = posted["tx_id"].as_str().unwrap();
    let (s, view) = send(&app, "GET", &format!("/v1/transactions/{tx_id}"), None, None).await;
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
    let (s, body) = send(&app, "GET", "/v1/books/onramp/accounts/ghost/balance", None, None).await;
    assert_eq!(s, StatusCode::NOT_FOUND);
    assert_eq!(body["error"], "unknown_account");

    // 404 unknown transaction
    let missing = uuid::Uuid::now_v7();
    let (s, body) = send(&app, "GET", &format!("/v1/transactions/{missing}"), None, None).await;
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
