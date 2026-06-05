//! Cross-book write scaling. Fixed per-book concurrency, sweep the book
//! count; the knee where aggregate throughput stops scaling is the
//! pool/Postgres/fsync bound — the "is the DB the bottleneck" answer.

use std::sync::Arc;

use serde::Serialize;
use talea_client::LedgerApi;

use crate::report::{self, StepJson};
use crate::runner::{OpOutcome, StepConfig, classify, run_step};
use crate::scenarios::validate_sweep;
use crate::{Ctx, seed, verify, workload};

#[derive(Debug, Clone, Serialize)]
pub struct Opts {
    pub book_counts: Vec<usize>,
    pub per_book_concurrency: usize,
    pub postings_per_tx: usize,
}

pub async fn run(ctx: &Ctx, opts: Opts) -> Result<Vec<StepJson>, String> {
    validate_sweep(&opts.book_counts, "books")?;
    if opts.per_book_concurrency == 0 {
        return Err("per-book-concurrency must be > 0".into());
    }
    let client = Arc::new(ctx.client()?);
    let max_books = *opts
        .book_counts
        .iter()
        .max()
        .ok_or("no book counts given")?;
    seed::seed_books(client.as_ref(), max_books).await?;
    let mut probes = Vec::with_capacity(max_books);
    for i in 0..max_books {
        let book = workload::book_name(i);
        let seq = verify::probe_seq(client.as_ref(), &book, &ctx.run_id, "many-before").await?;
        probes.push((book, seq));
    }

    let mut steps = Vec::new();
    let mut committed = 0u64;
    let mut ambiguous = 0u64;
    for &n in &opts.book_counts {
        let workers = n * opts.per_book_concurrency;
        let op = {
            let client = client.clone();
            let scope: Arc<str> = format!("{}/many/b{n}", ctx.run_id).into();
            let ppt = opts.postings_per_tx;
            move |w: usize, s: u64| {
                let client = client.clone();
                let scope = scope.clone();
                async move {
                    let book = workload::book_name(w % n);
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
                workers,
                warmup: ctx.warmup,
                duration: ctx.duration,
            },
            None,
            op,
        )
        .await;
        committed += r.total_committed;
        ambiguous += r.total_ambiguous;
        let step = report::summarize(format!("books{n}"), &r);
        eprintln!("{}", report::step_line(&step));
        steps.push(step);
    }

    let warnings = verify::verify_books(
        client.as_ref(),
        &ctx.run_id,
        "many",
        &probes,
        committed,
        ambiguous,
    )
    .await?;
    for w in &warnings {
        eprintln!("WARN: {w}");
    }
    Ok(steps)
}
