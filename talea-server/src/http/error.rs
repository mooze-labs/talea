//! ApiError -> HTTP response mapping. Bodies are the serialized ApiError
//! (already a tagged serde enum: {"error": "unbalanced", ...}).

use axum::Json;
use axum::http::{StatusCode, header};
use axum::response::{IntoResponse, Response};
use talea_core::api::ApiError;

pub struct ApiFailure(pub ApiError);

impl From<ApiError> for ApiFailure {
    fn from(e: ApiError) -> Self {
        Self(e)
    }
}

impl IntoResponse for ApiFailure {
    fn into_response(self) -> Response {
        let status = match &self.0 {
            // AssetMismatch is 400 by choice (unlisted in the spec's status
            // table): the request itself names the wrong asset for the account.
            ApiError::Unbalanced { .. }
            | ApiError::InvalidAmount { .. }
            | ApiError::InvalidDraft { .. }
            | ApiError::AssetMismatch { .. } => StatusCode::BAD_REQUEST,
            ApiError::Unauthorized => StatusCode::UNAUTHORIZED,
            ApiError::Overloaded => StatusCode::TOO_MANY_REQUESTS,
            ApiError::Timeout => StatusCode::REQUEST_TIMEOUT,
            ApiError::UnknownAsset { .. }
            | ApiError::UnknownAccount { .. }
            | ApiError::NotFound { .. } => StatusCode::NOT_FOUND,
            ApiError::AlreadyExists { .. } | ApiError::ConstraintViolation { .. } => {
                StatusCode::CONFLICT
            }
            // Client-side-only variant; never constructed server-side.
            // Defensive mapping for exhaustiveness.
            ApiError::Transport { .. } => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::Internal { .. } => StatusCode::INTERNAL_SERVER_ERROR,
        };
        if status == StatusCode::TOO_MANY_REQUESTS {
            // mirror of the load-shed layer's contract: back off briefly and
            // retry with the same idempotency key
            (status, [(header::RETRY_AFTER, "1")], Json(self.0)).into_response()
        } else {
            (status, Json(self.0)).into_response()
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn statuses_match_contract() {
        let cases = [
            (
                ApiError::InvalidDraft {
                    field: "x".into(),
                    reason: "y".into(),
                },
                StatusCode::BAD_REQUEST,
            ),
            (ApiError::Unauthorized, StatusCode::UNAUTHORIZED),
            (
                ApiError::NotFound { what: "t".into() },
                StatusCode::NOT_FOUND,
            ),
            (
                ApiError::AlreadyExists { what: "a".into() },
                StatusCode::CONFLICT,
            ),
            (
                ApiError::ConstraintViolation {
                    account: "a".into(),
                    min_balance: 0,
                    would_be: -1,
                },
                StatusCode::CONFLICT,
            ),
            (
                ApiError::Transport {
                    message: "m".into(),
                },
                StatusCode::INTERNAL_SERVER_ERROR,
            ),
            (
                ApiError::Internal {
                    message: "m".into(),
                },
                StatusCode::INTERNAL_SERVER_ERROR,
            ),
            (ApiError::Overloaded, StatusCode::TOO_MANY_REQUESTS),
            (ApiError::Timeout, StatusCode::REQUEST_TIMEOUT),
        ];
        for (err, expected) in cases {
            assert_eq!(ApiFailure(err).into_response().status(), expected);
        }
    }

    #[test]
    fn overloaded_carries_retry_after() {
        let response = ApiFailure(ApiError::Overloaded).into_response();
        assert_eq!(response.status(), StatusCode::TOO_MANY_REQUESTS);
        assert_eq!(
            response
                .headers()
                .get(axum::http::header::RETRY_AFTER)
                .and_then(|v| v.to_str().ok()),
            Some("1")
        );
    }
}
