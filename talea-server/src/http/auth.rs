//! Static bearer-token middleware. Token unset => open mode (dev).

use axum::extract::{Request, State};
use axum::middleware::Next;
use axum::response::Response;
use subtle::ConstantTimeEq;
use talea_core::api::ApiError;

use crate::http::error::ApiFailure;

#[derive(Clone)]
pub struct AuthConfig {
    pub token: Option<String>,
}

pub async fn require_bearer(
    State(auth): State<AuthConfig>,
    req: Request,
    next: Next,
) -> Result<Response, ApiFailure> {
    let Some(expected) = &auth.token else {
        return Ok(next.run(req).await);
    };
    let provided = req
        .headers()
        .get(axum::http::header::AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .and_then(parse_bearer);
    match provided {
        // ct_eq short-circuits on length, which is fine: length is not secret
        Some(token) if bool::from(token.as_bytes().ct_eq(expected.as_bytes())) => {
            Ok(next.run(req).await)
        }
        _ => Err(ApiFailure(ApiError::Unauthorized)),
    }
}

/// RFC 7235 credentials: a case-insensitive auth-scheme, one-or-more spaces,
/// then the token.
fn parse_bearer(header: &str) -> Option<&str> {
    let (scheme, rest) = header.split_once(' ')?;
    if !scheme.eq_ignore_ascii_case("Bearer") {
        return None;
    }
    let token = rest.trim_start_matches(' ');
    (!token.is_empty()).then_some(token)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_bearer_scheme_case_insensitive() {
        assert_eq!(parse_bearer("Bearer tok"), Some("tok"));
        assert_eq!(parse_bearer("bearer tok"), Some("tok"));
        assert_eq!(parse_bearer("BEARER tok"), Some("tok"));
    }

    #[test]
    fn parse_bearer_allows_multiple_spaces() {
        assert_eq!(parse_bearer("Bearer  tok"), Some("tok"));
    }

    #[test]
    fn parse_bearer_rejects_other_shapes() {
        assert_eq!(parse_bearer("Basic tok"), None);
        assert_eq!(parse_bearer("Bearer"), None);
        assert_eq!(parse_bearer("Bearer "), None);
        assert_eq!(parse_bearer("Bearertok"), None);
        assert_eq!(parse_bearer(""), None);
    }
}
