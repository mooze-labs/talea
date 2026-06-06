//! Typed client SDK for the talea ledger server, plus the `talea` CLI.
//!
//! [`TaleaClient`] implements the same [`LedgerApi`] trait the server's
//! in-process service does, so code written against the trait runs
//! unchanged against either. All operations are retry-safe by construction
//! (posts carry caller-supplied idempotency keys, registry writes are
//! idempotent on id, reads are reads), and the client retries 503/transport
//! failures automatically within a bounded [`RetryPolicy`].
//!
//! ```no_run
//! use talea_client::{LedgerApi, Page, TaleaClient};
//!
//! # async fn demo() -> talea_client::ApiResult<()> {
//! let client = TaleaClient::builder("http://127.0.0.1:8080")
//!     .bearer_token("sekrit")
//!     .build()?;
//!
//! let balance = client.balance("onramp", "cash", None).await?;
//! println!("{} {}", balance.balance, balance.asset);
//!
//! let page = client
//!     .account_history("onramp", "cash", Page { after_seq: None, limit: 100 })
//!     .await?;
//! # let _ = page;
//! # Ok(())
//! # }
//! ```
//!
//! Subscriptions are unbroken streams: [`LedgerApi::subscribe`] reconnects
//! with backoff and resumes from the last seen sequence, so consumers never
//! re-implement cursor bookkeeping.

pub mod cli;
mod http;
mod retry;
mod sse;

pub use retry::RetryPolicy;
pub use talea_core::api::*;

use std::time::Duration;

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use talea_core::types::Seq;

/// HTTP client for a talea server, implementing [`LedgerApi`].
///
/// Cheap to share: hold it in an `Arc` or clone the underlying reqwest
/// client via the builder. Construct with [`TaleaClient::builder`].
pub struct TaleaClient {
    http: http::Http,
}

/// Configures and builds a [`TaleaClient`]. Created by
/// [`TaleaClient::builder`]; finish with [`ClientBuilder::build`].
pub struct ClientBuilder {
    base_url: String,
    token: Option<String>,
    timeout: Duration,
    retry: RetryPolicy,
    http_client: Option<reqwest::Client>,
}

impl TaleaClient {
    /// Start building a client for the server at `base_url`
    /// (e.g. `http://127.0.0.1:8080`). A path prefix is preserved, but the
    /// base must not already include the `/v1` version segment.
    pub fn builder(base_url: impl Into<String>) -> ClientBuilder {
        ClientBuilder {
            base_url: base_url.into(),
            token: None,
            timeout: Duration::from_secs(30),
            retry: RetryPolicy::default(),
            http_client: None,
        }
    }
}

impl ClientBuilder {
    /// Send `Authorization: Bearer <token>` on every request (matches the
    /// server's `TALEA_API_TOKEN`). Without it the client only works
    /// against a server running in open dev mode.
    pub fn bearer_token(mut self, token: impl Into<String>) -> Self {
        self.token = Some(token.into());
        self
    }

    /// Per-request timeout (default 30s). Not applied to SSE subscriptions.
    pub fn timeout(mut self, timeout: Duration) -> Self {
        self.timeout = timeout;
        self
    }

    /// Retry policy for 503/408/transport failures (default: 3 attempts,
    /// exponential 200ms..5s, honoring `Retry-After`). Safe for every
    /// operation; use [`RetryPolicy::none`] to surface failures immediately.
    pub fn retry(mut self, retry: RetryPolicy) -> Self {
        self.retry = retry;
        self
    }

    /// Bring your own reqwest client (proxies, TLS config, ...). Do NOT set
    /// a global timeout on it — that would kill SSE; use `.timeout()` here.
    pub fn with_http_client(mut self, client: reqwest::Client) -> Self {
        self.http_client = Some(client);
        self
    }

    /// Validate the base URL and construct the client. Fails with
    /// [`ApiError::Transport`] on an unparseable URL; no network I/O happens
    /// until the first request.
    pub fn build(self) -> ApiResult<TaleaClient> {
        let base = reqwest::Url::parse(&self.base_url).map_err(|e| ApiError::Transport {
            message: format!("invalid base url: {e}"),
        })?;
        let client = match self.http_client {
            Some(c) => c,
            None => reqwest::Client::builder()
                .connect_timeout(Duration::from_secs(10))
                .build()
                .map_err(|e| ApiError::Transport {
                    message: format!("building http client: {e}"),
                })?,
        };
        Ok(TaleaClient {
            http: http::Http {
                client,
                base,
                token: self.token,
                timeout: self.timeout,
                retry: self.retry,
            },
        })
    }
}

#[async_trait]
impl LedgerApi for TaleaClient {
    async fn register_asset(&self, draft: AssetDraft) -> ApiResult<()> {
        let url = self.http.url(&["assets"])?;
        self.http
            .execute_unit(|| self.http.client.post(url.clone()).json(&draft))
            .await
    }

    async fn open_account(&self, draft: AccountDraft) -> ApiResult<()> {
        let url = self.http.url(&["accounts"])?;
        self.http
            .execute_unit(|| self.http.client.post(url.clone()).json(&draft))
            .await
    }

    async fn post(&self, draft: TransactionDraft) -> ApiResult<Posted> {
        let url = self.http.url(&["transactions"])?;
        self.http
            .execute(|| self.http.client.post(url.clone()).json(&draft))
            .await
    }

    async fn balance(
        &self,
        book: &str,
        path: &str,
        as_of: Option<DateTime<Utc>>,
    ) -> ApiResult<BalanceView> {
        let mut url = self
            .http
            .url(&["books", book, "accounts", path, "balance"])?;
        if let Some(t) = as_of {
            url.query_pairs_mut().append_pair("as_of", &t.to_rfc3339());
        }
        self.http
            .execute(|| self.http.client.get(url.clone()))
            .await
    }

    async fn account_history(
        &self,
        book: &str,
        path: &str,
        page: Page,
    ) -> ApiResult<Paged<PostingView>> {
        let mut url = self
            .http
            .url(&["books", book, "accounts", path, "history"])?;
        {
            let mut q = url.query_pairs_mut();
            if let Some(after) = page.after_seq {
                q.append_pair("after_seq", &after.to_string());
            }
            q.append_pair("limit", &page.limit.to_string());
        }
        self.http
            .execute(|| self.http.client.get(url.clone()))
            .await
    }

    async fn transaction(&self, tx_id: &str) -> ApiResult<TransactionView> {
        let url = self.http.url(&["transactions", tx_id])?;
        self.http
            .execute(|| self.http.client.get(url.clone()))
            .await
    }

    async fn trial_balance(
        &self,
        book: &str,
        as_of: Option<DateTime<Utc>>,
    ) -> ApiResult<TrialBalance> {
        let mut url = self.http.url(&["books", book, "trial-balance"])?;
        if let Some(t) = as_of {
            url.query_pairs_mut().append_pair("as_of", &t.to_rfc3339());
        }
        self.http
            .execute(|| self.http.client.get(url.clone()))
            .await
    }

    /// Sequential implementation: calls `self.post` for each draft in order.
    /// Wire batch endpoint lands in the next commit; this is correct until
    /// then because each call is independently idempotent.
    async fn post_batch(&self, drafts: Vec<TransactionDraft>) -> Vec<ApiResult<Posted>> {
        let mut results = Vec::with_capacity(drafts.len());
        for draft in drafts {
            results.push(self.post(draft).await);
        }
        results
    }

    async fn subscribe(&self, book: &str, from: Seq) -> ApiResult<EventStream> {
        sse::subscribe(&self.http, book, from)
    }
}
