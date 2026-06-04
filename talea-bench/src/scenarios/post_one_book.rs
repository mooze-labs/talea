//! Write ceiling for a single book. The gapless per-book sequence comes
//! from a counter-row lock, so throughput should plateau at roughly
//! 1/commit-latency regardless of concurrency, while p99 grows with
//! queue depth. This scenario measures both.

use std::sync::Arc;

use serde::Serialize;
use talea_client::LedgerApi;

use crate::report::{self, StepJson};
use crate::runner::{OpOutcome, StepConfig, classify, run_step};
use crate::{Ctx, seed, verify, workload};

#[derive(Debug, Clone, Serialize)]
pub struct Opts {
    pub concurrencies: Vec<usize>,
    pub postings_per_tx: usize,
}

pub async fn run(ctx: &Ctx, opts: Opts) -> Result<Vec<StepJson>, String> {
    let client = Arc::new(ctx.client()?);
    seed::seed_books(client.as_ref(), 1).await?;
    let book = workload::book_name(0);
    let before = verify::probe_seq(client.as_ref(), &book, &ctx.run_id, "one-before").await?;

    let mut steps = Vec::new();
    let mut committed = 0u64;
    let mut ambiguous = 0u64;
    for &c in &opts.concurrencies {
        let op = {
            let client = client.clone();
            let book: Arc<str> = book.clone().into();
            let scope: Arc<str> = format!("{}/one/c{c}", ctx.run_id).into();
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
        let r = run_step(
            StepConfig {
                workers: c,
                warmup: ctx.warmup,
                duration: ctx.duration,
            },
            op,
        )
        .await;
        committed += r.total_committed;
        ambiguous += r.total_ambiguous;
        let step = report::summarize(format!("c{c}"), &r);
        eprintln!("{}", report::step_line(&step));
        steps.push(step);
    }

    let warnings = verify::verify_books(
        client.as_ref(),
        &ctx.run_id,
        "one",
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
