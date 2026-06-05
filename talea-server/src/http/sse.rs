//! SSE event stream: catch-up + live tail per book. Each event carries
//! id: <seq>; reconnects resume via Last-Event-ID (wins) or ?from=,
//! both meaning "last seen seq" — the stream starts at value + 1.

use axum::Extension;
use axum::extract::{Path, State};
use std::sync::Arc;

// Envelope-rejection wrapper, not stock axum (bad ?from= -> 400 envelope).
use crate::http::extract::Query;
use axum::http::HeaderMap;
use axum::response::sse::{Event, KeepAlive, Sse};
use futures::{Stream, StreamExt};
use serde::Deserialize;
use talea_core::api::{ApiError, LedgerApi};

use crate::http::auth::TokenScope;
use crate::http::error::ApiFailure;
use crate::http::routes::AppState;

#[derive(Deserialize, utoipa::IntoParams)]
pub struct EventsQuery {
    pub from: Option<i64>,
}

#[utoipa::path(get, path = "/v1/books/{book}/events",
    params(("book" = String, Path), EventsQuery),
    responses(
        (status = 200, description = "SSE stream (text/event-stream): each event carries id: <seq> and an EventEnvelope JSON body; ?from= and Last-Event-ID both mean 'last seen seq' (header wins); reconnect resumes from the cursor", content_type = "text/event-stream"),
        (status = 401, body = ApiError),
        (status = 403, description = "token scope does not cover this book", body = ApiError),
    ), security(("bearer" = [])), tag = "stream")]
pub async fn events(
    State(state): State<AppState>,
    Extension(scope): Extension<Arc<TokenScope>>,
    Path(book): Path<String>,
    headers: HeaderMap,
    Query(q): Query<EventsQuery>,
) -> Result<Sse<impl Stream<Item = Result<Event, std::convert::Infallible>>>, ApiFailure> {
    if !scope.allows_read(&book) {
        return Err(ApiFailure(ApiError::Forbidden { book }));
    }
    let last_seen = headers
        .get("last-event-id")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.parse::<i64>().ok())
        .or(q.from);
    let from = last_seen.map(|s| s + 1).unwrap_or(1);

    let mut inner = state
        .service
        .subscribe(&book, from)
        .await
        .map_err(ApiFailure)?;
    let guard = crate::metrics::SseSubscriberGuard::new();
    let stream = async_stream::stream! {
        let _guard = guard; // lives exactly as long as the connection
        while let Some(item) = inner.next().await {
            match item {
                Ok(env) => match Event::default().id(env.seq.to_string()).json_data(&env) {
                    Ok(ev) => yield Ok::<_, std::convert::Infallible>(ev),
                    Err(e) => {
                        tracing::error!(error = %e, "sse serialization failed");
                        yield Ok(Event::default().event("error").data("serialization failure"));
                        return;
                    }
                },
                // a store-stream error ends the connection; the client
                // reconnects with its cursor
                Err(e) => {
                    yield Ok(Event::default().event("error").data(
                        serde_json::to_string(&e).unwrap_or_else(|_| "\"internal\"".into()),
                    ));
                    return;
                }
            }
        }
    };
    Ok(Sse::new(stream).keep_alive(KeepAlive::default()))
}
