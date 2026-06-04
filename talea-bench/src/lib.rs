//! Capacity benchmark suite for talea-server. Library so integration
//! tests can drive scenarios directly; the `talea-bench` binary is a
//! thin clap wrapper.

pub mod report;
pub mod runner;
pub mod seed;
pub mod workload;

use std::time::Duration;

use talea_client::{RetryPolicy, TaleaClient};

/// Shared run context: where the server is and how each step is timed.
pub struct Ctx {
    pub url: String,
    pub token: Option<String>,
    /// Unique per run; namespaces idempotency keys so re-runs never dedup.
    pub run_id: String,
    pub warmup: Duration,
    pub duration: Duration,
}

impl Ctx {
    pub fn client(&self) -> Result<TaleaClient, String> {
        self.client_with(RetryPolicy::default())
    }

    pub fn client_with(&self, retry: RetryPolicy) -> Result<TaleaClient, String> {
        let mut b = TaleaClient::builder(self.url.clone()).retry(retry);
        if let Some(t) = &self.token {
            b = b.bearer_token(t.clone());
        }
        b.build().map_err(|e| format!("building client: {e:?}"))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn ctx(url: &str) -> Ctx {
        Ctx {
            url: url.into(),
            token: None,
            run_id: "t".into(),
            warmup: Duration::ZERO,
            duration: Duration::ZERO,
        }
    }

    #[test]
    fn ctx_builds_client_for_valid_url() {
        assert!(ctx("http://127.0.0.1:8080").client().is_ok());
    }

    #[test]
    fn ctx_rejects_invalid_url() {
        assert!(ctx("not a url").client().is_err());
    }
}
