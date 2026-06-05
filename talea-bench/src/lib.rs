//! Capacity benchmark suite for talea-server. Library so integration
//! tests can drive scenarios directly; the `talea-bench` binary is a
//! thin clap wrapper.

pub mod progress;
pub mod report;
pub mod runner;
pub mod scenarios;
pub mod seed;
pub mod verify;
pub mod workload;

use std::time::Duration;

use talea_client::{RetryPolicy, TaleaClient};

use crate::progress::Progress;

/// Shared run context: where the server is and how each step is timed.
pub struct Ctx {
    pub url: String,
    pub token: Option<String>,
    /// Unique per run; namespaces idempotency keys so re-runs never dedup.
    pub run_id: String,
    pub warmup: Duration,
    pub duration: Duration,
    /// Bars + line routing; Progress::hidden() in tests and non-TTY runs.
    pub progress: Progress,
}

/// Ask the target server which store backend it runs — the
/// `x-talea-backend` header on `/health`. Servers older than the header
/// (or unreachable ones) yield "unknown" with a stderr warning; the run
/// proceeds, it is just unlabeled.
pub async fn detect_backend(url: &str) -> String {
    let probe = async {
        reqwest::get(format!("{url}/health"))
            .await
            .ok()?
            .headers()
            .get("x-talea-backend")?
            .to_str()
            .ok()
            .map(str::to_string)
    };
    match probe.await {
        Some(backend) => backend,
        None => {
            eprintln!(
                "WARN: server did not report x-talea-backend on /health; \
                 recording backend=\"unknown\""
            );
            "unknown".into()
        }
    }
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
            progress: Progress::hidden(),
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
