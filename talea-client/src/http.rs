//! Request execution: URL building, auth, bounded retry, and response
//! decoding. Domain errors arrive as the ApiError JSON envelope; the
//! server's admission layer (503/408/429) and framework rejections are plain
//! text, so undecodable bodies are synthesized from the status.

use std::time::Duration;

use reqwest::StatusCode;
use serde::Deserialize;
use serde::de::DeserializeOwned;
use talea_core::api::{ApiError, ApiResult, Posted};

use crate::retry::RetryPolicy;

/// Mirror of the server's `BatchItem` for deserialization only. The server
/// serializes each slot with `#[serde(untagged)]`: a `Posted` object on
/// success, or the `ApiError` tagged envelope on failure. Because `Posted`
/// has a required `tx_id` field (absent from all `ApiError` variants),
/// `serde(untagged)` resolves the union unambiguously in this direction.
#[derive(Deserialize)]
#[serde(untagged)]
pub(crate) enum BatchResponseItem {
    Ok(Posted),
    Err(ApiError),
}

pub(crate) struct Http {
    pub client: reqwest::Client,
    pub base: reqwest::Url,
    pub token: Option<String>,
    /// Per-request timeout; NOT applied to SSE connections.
    pub timeout: Duration,
    pub retry: RetryPolicy,
}

impl Http {
    /// /v1/<segments...> with each segment percent-encoded (account paths
    /// legally contain ':'). A path prefix on the base URL is preserved
    /// (http://h/api -> /api/v1/...), so the base must NOT already include
    /// a version segment.
    pub(crate) fn url(&self, segments: &[&str]) -> ApiResult<reqwest::Url> {
        let mut url = self.base.clone();
        {
            let mut path = url.path_segments_mut().map_err(|_| ApiError::Transport {
                message: "base URL cannot be a base".into(),
            })?;
            path.pop_if_empty();
            path.push("v1");
            for s in segments {
                path.push(s);
            }
        }
        Ok(url)
    }

    /// Send with bounded retry; expects a JSON body on success.
    pub(crate) async fn execute<T: DeserializeOwned>(
        &self,
        build: impl Fn() -> reqwest::RequestBuilder,
    ) -> ApiResult<T> {
        let response = self.send_with_retry(build).await?;
        let status = response.status();
        let bytes = response.bytes().await.map_err(|e| ApiError::Transport {
            message: format!("reading response body: {e}"),
        })?;
        if status.is_success() {
            return serde_json::from_slice(&bytes).map_err(|e| ApiError::Transport {
                message: format!("decoding response body: {e}"),
            });
        }
        Err(decode_error(status, &bytes))
    }

    /// POST a batch of drafts to `/v1/transactions/batch`; returns one
    /// `ApiResult<Posted>` per input item, in input order.
    ///
    /// A whole-request failure (401/415/400/transport) is replicated into
    /// every slot — callers can detect this via all-slots-identical.
    /// Retrying the whole batch is always safe because idempotency keys dedup
    /// per draft: a slot that already committed just returns `deduplicated: true`.
    ///
    /// The request itself goes through the standard retry wrapper
    /// (503/408/transport), which is safe for the same reason.
    pub(crate) async fn execute_batch(
        &self,
        build: impl Fn() -> reqwest::RequestBuilder,
        n: usize,
    ) -> Vec<ApiResult<Posted>> {
        // Whole-request failure: replicate the single error into every slot.
        macro_rules! whole_err {
            ($e:expr) => {{
                let e: ApiError = $e;
                return std::iter::repeat_with(|| Err(e.clone())).take(n).collect();
            }};
        }
        let response = match self.send_with_retry(build).await {
            Ok(r) => r,
            Err(e) => whole_err!(e),
        };
        let status = response.status();
        let bytes = match response.bytes().await {
            Ok(b) => b,
            Err(e) => whole_err!(ApiError::Transport {
                message: format!("reading batch response body: {e}"),
            }),
        };
        if !status.is_success() {
            whole_err!(decode_error(status, &bytes));
        }
        // Parse the positional array; each item is Posted or ApiError.
        let items: Vec<BatchResponseItem> = match serde_json::from_slice(&bytes) {
            Ok(v) => v,
            Err(e) => whole_err!(ApiError::Transport {
                message: format!("decoding batch response: {e}"),
            }),
        };
        items
            .into_iter()
            .map(|item| match item {
                BatchResponseItem::Ok(posted) => Ok(posted),
                BatchResponseItem::Err(e) => Err(e),
            })
            .collect()
    }

    /// Send with bounded retry; success is any 2xx with no body expected.
    pub(crate) async fn execute_unit(
        &self,
        build: impl Fn() -> reqwest::RequestBuilder,
    ) -> ApiResult<()> {
        let response = self.send_with_retry(build).await?;
        let status = response.status();
        if status.is_success() {
            return Ok(());
        }
        let bytes = response.bytes().await.unwrap_or_default();
        Err(decode_error(status, &bytes))
    }

    /// Retries transport errors, 503 and 429 (both honoring Retry-After),
    /// and 408. On budget exhaustion: the last HTTP response is returned for
    /// decoding (so a final 503 surfaces as Transport via decode_error); a
    /// last transport error becomes Transport directly.
    pub(crate) async fn send_with_retry(
        &self,
        build: impl Fn() -> reqwest::RequestBuilder,
    ) -> ApiResult<reqwest::Response> {
        let mut attempt: u32 = 0;
        loop {
            let mut req = build().timeout(self.timeout);
            if let Some(token) = &self.token {
                req = req.bearer_auth(token);
            }
            // A non-retryable outcome is always a response — return it
            // directly; everything else falls through to the backoff path.
            let outcome = match req.send().await {
                Ok(resp)
                    if resp.status() != StatusCode::SERVICE_UNAVAILABLE
                        && resp.status() != StatusCode::REQUEST_TIMEOUT
                        && resp.status() != StatusCode::TOO_MANY_REQUESTS =>
                {
                    return Ok(resp);
                }
                retryable => retryable,
            };
            attempt += 1;
            if attempt >= self.retry.max_attempts {
                return match outcome {
                    Ok(resp) => Ok(resp),
                    Err(e) => Err(ApiError::Transport {
                        message: format!("request failed after {attempt} attempts: {e}"),
                    }),
                };
            }
            let retry_after = outcome
                .as_ref()
                .ok()
                .and_then(|r| r.headers().get(reqwest::header::RETRY_AFTER))
                .and_then(|v| v.to_str().ok())
                .and_then(|v| v.parse::<u64>().ok())
                .map(Duration::from_secs);
            tracing::debug!(attempt, "retrying request after backoff");
            tokio::time::sleep(self.retry.delay_for(attempt - 1, retry_after)).await;
        }
    }
}

/// Pure status+body -> ApiError mapping.
pub(crate) fn decode_error(status: StatusCode, body: &[u8]) -> ApiError {
    if let Ok(api) = serde_json::from_slice::<ApiError>(body) {
        return api;
    }
    let text = String::from_utf8_lossy(body);
    let excerpt: String = text.chars().take(200).collect();
    match status {
        StatusCode::UNAUTHORIZED => ApiError::Unauthorized,
        s if s == StatusCode::SERVICE_UNAVAILABLE
            || s == StatusCode::REQUEST_TIMEOUT
            || s.is_server_error() =>
        {
            ApiError::Transport {
                message: format!("{s}: {excerpt}"),
            }
        }
        s if s.is_client_error() => ApiError::InvalidDraft {
            field: "request".into(),
            reason: format!("{s}: {excerpt}"),
        },
        s => ApiError::Transport {
            message: format!("unexpected status {s}: {excerpt}"),
        },
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn domain_envelope_decodes_as_is() {
        let body = br#"{"error":"unbalanced","asset":"USD","debit":900,"credit":1000}"#;
        match decode_error(StatusCode::BAD_REQUEST, body) {
            ApiError::Unbalanced {
                asset,
                debit,
                credit,
            } => {
                assert_eq!((asset.as_str(), debit, credit), ("USD", 900, 1000));
            }
            other => panic!("expected Unbalanced, got {other:?}"),
        }
    }

    #[test]
    fn plain_text_synthesizes_from_status() {
        assert!(matches!(
            decode_error(StatusCode::UNAUTHORIZED, b"nope"),
            ApiError::Unauthorized
        ));
        assert!(matches!(
            decode_error(StatusCode::SERVICE_UNAVAILABLE, b"overloaded"),
            ApiError::Transport { .. }
        ));
        assert!(matches!(
            decode_error(StatusCode::REQUEST_TIMEOUT, b"timed out"),
            ApiError::Transport { .. }
        ));
        assert!(matches!(
            decode_error(StatusCode::UNSUPPORTED_MEDIA_TYPE, b"bad content type"),
            ApiError::InvalidDraft { field, .. } if field == "request"
        ));
        assert!(matches!(
            decode_error(StatusCode::INTERNAL_SERVER_ERROR, b"boom"),
            ApiError::Transport { .. }
        ));
    }

    #[test]
    fn url_builder_encodes_segments() {
        let http = Http {
            client: reqwest::Client::new(),
            base: reqwest::Url::parse("http://h:1/").unwrap(),
            token: None,
            timeout: Duration::from_secs(1),
            retry: crate::retry::RetryPolicy::none(),
        };
        let url = http
            .url(&["books", "onramp", "accounts", "treasury:btc", "balance"])
            .unwrap();
        assert_eq!(url.path(), "/v1/books/onramp/accounts/treasury:btc/balance");
        // a path-separator in a segment must not create extra segments
        let url = http.url(&["books", "a/b"]).unwrap();
        assert_eq!(url.path(), "/v1/books/a%2Fb");
    }
}
