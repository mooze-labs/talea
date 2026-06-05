//! Deliberately exceed admission capacity. Pass A (retries disabled)
//! observes raw 503s while a concurrent raw-HTTP probe asserts the
//! Retry-After header (the typed client honors it internally but does
//! not expose it). Pass B (default retry) measures time-to-success.
//! Verification proves retry storms never double-posted.

use std::sync::Arc;
use std::time::Duration;

use serde::Serialize;
use talea_client::{LedgerApi, Posted, RetryPolicy};

use crate::report::{self, StepJson};
use crate::runner::{OpOutcome, StepConfig, classify, run_step};
use crate::{Ctx, seed, verify, workload};

#[derive(Debug, Clone, Serialize)]
pub struct Opts {
    /// Should be several times TALEA_MAX_INFLIGHT.
    pub concurrency: usize,
    pub postings_per_tx: usize,
}

struct ProbeResult {
    saw_503: bool,
    retry_after_present: bool,
    /// 0 or 1: the probe uses one fixed idempotency key.
    committed: u64,
}

pub async fn run(ctx: &Ctx, opts: Opts) -> Result<Vec<StepJson>, String> {
    if opts.concurrency == 0 {
        return Err("concurrency must be > 0".into());
    }
    let raw = Arc::new(ctx.client_with(RetryPolicy::none())?);
    let retrying = Arc::new(ctx.client()?);
    seed::seed_books(raw.as_ref(), 1).await?;
    let book = workload::book_name(0);
    let before = verify::probe_seq(raw.as_ref(), &book, &ctx.run_id, "overload-before").await?;

    let mut committed = 0u64;
    let mut ambiguous = 0u64;
    let mut steps = Vec::new();

    // ---- Pass A: retries disabled; raw 503s are the measurement. ----
    let probe = tokio::spawn(retry_after_probe(
        ctx.url.clone(),
        ctx.token.clone(),
        ctx.run_id.clone(),
        book.clone(),
    ));
    let op_a = {
        let client = raw.clone();
        let book: Arc<str> = book.clone().into();
        let scope: Arc<str> = format!("{}/overload/raw", ctx.run_id).into();
        let ppt = opts.postings_per_tx;
        move |w: usize, s: u64| {
            let client = client.clone();
            let book = book.clone();
            let scope = scope.clone();
            async move {
                match client
                    .post(workload::transfer_draft(&book, &scope, w, s, ppt))
                    .await
                {
                    Ok(p) => OpOutcome::Success {
                        kind: "post",
                        deduplicated: p.deduplicated,
                        // Keys are run-scoped unique: a dedup'd success can only be
                        // an SDK retry whose original attempt committed — count it.
                        committed: true,
                    },
                    Err(e) => classify(e),
                }
            }
        }
    };
    let r_a = run_step(
        StepConfig {
            workers: opts.concurrency,
            warmup: ctx.warmup,
            duration: ctx.duration,
        },
        None,
        op_a,
    )
    .await;
    committed += r_a.total_committed;
    ambiguous += r_a.total_ambiguous;

    let probe = probe
        .await
        .map_err(|e| format!("probe task panicked: {e}"))?;
    committed += probe.committed;
    if probe.saw_503 && !probe.retry_after_present {
        return Err("503 observed WITHOUT a Retry-After header — shedding contract broken".into());
    }
    if !probe.saw_503 {
        eprintln!("WARN: raw probe never saw a 503; load may not have saturated admission");
    }
    if r_a.saturated == 0 {
        eprintln!(
            "WARN: no 503s in pass A — concurrency {} did not exceed admission capacity",
            opts.concurrency
        );
    }
    if r_a.successes == 0 {
        return Err("goodput collapsed to zero under overload".into());
    }
    let step = report::summarize("raw-503", &r_a);
    eprintln!("{}", report::step_line(&step));
    steps.push(step);

    // ---- Pass B: default retry; latency includes retry waits. ----
    let op_b = {
        let client = retrying.clone();
        let book: Arc<str> = book.clone().into();
        let scope: Arc<str> = format!("{}/overload/retry", ctx.run_id).into();
        let ppt = opts.postings_per_tx;
        move |w: usize, s: u64| {
            let client = client.clone();
            let book = book.clone();
            let scope = scope.clone();
            async move {
                match client
                    .post(workload::transfer_draft(&book, &scope, w, s, ppt))
                    .await
                {
                    Ok(p) => OpOutcome::Success {
                        kind: "post",
                        deduplicated: p.deduplicated,
                        // Keys are run-scoped unique: a dedup'd success can only be
                        // an SDK retry whose original attempt committed — count it.
                        committed: true,
                    },
                    Err(e) => classify(e),
                }
            }
        }
    };
    let r_b = run_step(
        StepConfig {
            workers: opts.concurrency,
            warmup: ctx.warmup,
            duration: ctx.duration,
        },
        None,
        op_b,
    )
    .await;
    committed += r_b.total_committed;
    ambiguous += r_b.total_ambiguous;
    if r_b.successes == 0 {
        return Err("no successful commits in the retrying pass".into());
    }
    let step = report::summarize("retry-to-success", &r_b);
    eprintln!("{}", report::step_line(&step));
    steps.push(step);

    let warnings = verify::verify_books(
        raw.as_ref(),
        &ctx.run_id,
        "overload",
        &[(book, before)],
        committed,
        ambiguous,
    )
    .await?;
    for w in &warnings {
        eprintln!("WARN: {w}");
    }
    Ok(steps)
}

/// Periodically fire a raw HTTP post (fixed idempotency key, so at most
/// one commit ever) until a 503 is observed, then report whether it
/// carried Retry-After. Stops after ~10s of attempts.
async fn retry_after_probe(
    url: String,
    token: Option<String>,
    run_id: String,
    book: String,
) -> ProbeResult {
    let client = reqwest::Client::new();
    let endpoint = format!("{}/v1/transactions", url.trim_end_matches('/'));
    let draft = workload::transfer_draft(&book, &format!("{run_id}/overload-probe"), 0, 0, 2);
    let mut result = ProbeResult {
        saw_503: false,
        retry_after_present: false,
        committed: 0,
    };
    for _ in 0..50 {
        tokio::time::sleep(Duration::from_millis(200)).await;
        let mut req = client.post(&endpoint).json(&draft);
        if let Some(t) = &token {
            req = req.bearer_auth(t);
        }
        let Ok(resp) = req.send().await else { continue };
        if resp.status() == reqwest::StatusCode::SERVICE_UNAVAILABLE {
            result.saw_503 = true;
            result.retry_after_present = resp.headers().contains_key(reqwest::header::RETRY_AFTER);
            return result;
        }
        if resp.status().is_success()
            && let Ok(p) = resp.json::<Posted>().await
            && !p.deduplicated
        {
            result.committed += 1;
        }
    }
    result
}
