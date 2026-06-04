//! Static bearer-token middleware. Token unset => open mode (dev).

use axum::extract::{Request, State};
use axum::middleware::Next;
use axum::response::Response;
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
        .and_then(|v| v.strip_prefix("Bearer "));
    match provided {
        Some(token) if constant_time_eq(token.as_bytes(), expected.as_bytes()) => {
            Ok(next.run(req).await)
        }
        _ => Err(ApiFailure(ApiError::Unauthorized)),
    }
}

/// Constant-time comparison (length is not secret).
fn constant_time_eq(a: &[u8], b: &[u8]) -> bool {
    if a.len() != b.len() {
        return false;
    }
    a.iter().zip(b).fold(0u8, |acc, (x, y)| acc | (x ^ y)) == 0
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn constant_time_eq_basics() {
        assert!(constant_time_eq(b"secret", b"secret"));
        assert!(!constant_time_eq(b"secret", b"secreT"));
        assert!(!constant_time_eq(b"secret", b"secre"));
    }
}
