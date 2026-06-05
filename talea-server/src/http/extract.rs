//! `axum::Json` / `axum::extract::Query` with envelope rejections: extraction
//! failures answer with the same `ApiError` JSON envelope every other error
//! path uses, instead of axum's plain-text defaults.
//!
//! Status codes: wrong/missing content-type keeps its semantically distinct
//! 415 (the fix is a header, not the body); everything else — syntax errors,
//! deserialization failures (axum's 422), body-limit — collapses to the
//! contract's 400 `invalid_draft`.

use axum::extract::rejection::{JsonRejection, QueryRejection};
use axum::extract::{FromRequest, FromRequestParts, Request};
use axum::http::StatusCode;
use axum::http::request::Parts;
use axum::response::{IntoResponse, Response};
use talea_core::api::ApiError;

use crate::http::error::ApiFailure;

/// Drop-in replacement for `axum::Json`: same extraction and response
/// behavior, envelope rejections.
pub struct Json<T>(pub T);

impl<S, T> FromRequest<S> for Json<T>
where
    axum::Json<T>: FromRequest<S, Rejection = JsonRejection>,
    S: Send + Sync,
{
    type Rejection = Response;

    async fn from_request(req: Request, state: &S) -> Result<Self, Self::Rejection> {
        match axum::Json::<T>::from_request(req, state).await {
            Ok(axum::Json(value)) => Ok(Json(value)),
            Err(rejection) => Err(json_rejection_response(rejection)),
        }
    }
}

/// Responses delegate to `axum::Json` unchanged (serialization never rejects).
impl<T: serde::Serialize> IntoResponse for Json<T> {
    fn into_response(self) -> Response {
        axum::Json(self.0).into_response()
    }
}

fn json_rejection_response(rejection: JsonRejection) -> Response {
    match rejection {
        // 415 keeps its status; built manually because ApiFailure maps
        // InvalidDraft to 400.
        JsonRejection::MissingJsonContentType(_) => (
            StatusCode::UNSUPPORTED_MEDIA_TYPE,
            axum::Json(ApiError::InvalidDraft {
                field: "body".into(),
                reason: "expected content-type: application/json".into(),
            }),
        )
            .into_response(),
        // Syntax errors (400), data errors (axum's 422 -> our 400), body
        // limit: the rejection's own text carries serde's message including
        // the JSON path — genuinely useful to callers.
        other => ApiFailure(ApiError::InvalidDraft {
            field: "body".into(),
            reason: other.body_text(),
        })
        .into_response(),
    }
}

/// Drop-in replacement for `axum::extract::Query` with envelope rejections.
pub struct Query<T>(pub T);

impl<S, T> FromRequestParts<S> for Query<T>
where
    axum::extract::Query<T>: FromRequestParts<S, Rejection = QueryRejection>,
    S: Send + Sync,
{
    type Rejection = ApiFailure;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        match axum::extract::Query::<T>::from_request_parts(parts, state).await {
            Ok(axum::extract::Query(value)) => Ok(Query(value)),
            Err(rejection) => Err(ApiFailure(ApiError::InvalidDraft {
                field: "query".into(),
                reason: rejection.body_text(),
            })),
        }
    }
}
