//! Write ceiling for a single book. The gapless per-book sequence comes
//! from a counter-row lock, so throughput should plateau at roughly
//! 1/commit-latency regardless of concurrency, while p99 grows with
//! queue depth. This scenario measures both.
//!
//! With `--batch-size N > 1` each worker iteration calls `post_batch`
//! with N drafts in one HTTP request. Accounting stays per-draft so
//! numbers are comparable to single-post runs at the same concurrency.

use std::sync::Arc;

use serde::Serialize;
use talea_client::LedgerApi;

use crate::progress::LiveCounters;
use crate::report::{self, StepJson};
use crate::runner::{OpOutcome, StepConfig, classify, run_step};
use crate::scenarios::validate_sweep;
use crate::{Ctx, seed, verify, workload};

#[derive(Debug, Clone, Serialize)]
pub struct Opts {
    pub concurrencies: Vec<usize>,
    pub postings_per_tx: usize,
    /// Drafts per HTTP call. 1 = single POST /transactions (default).
    /// >1 = POST /transactions/batch with N unique drafts per iteration.
    pub batch_size: usize,
}

pub async fn run(ctx: &Ctx, opts: Opts) -> Result<Vec<StepJson>, String> {
    validate_sweep(&opts.concurrencies, "concurrency")?;
    if opts.batch_size == 0 {
        return Err("--batch-size must be >= 1".into());
    }
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
            let bs = opts.batch_size;
            move |w: usize, s: u64| {
                let client = client.clone();
                let book = book.clone();
                let scope = scope.clone();
                async move {
                    if bs == 1 {
                        // Single-post path: unchanged behaviour.
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
                    } else {
                        // Batch path: build N drafts with idem keys
                        // bench/<scope>/<w>/<batch_seq>/<slot> so they are
                        // globally unique across workers, iterations, and slots.
                        let batch_seq = s * bs as u64; // first draft seq for this batch
                        let drafts: Vec<_> = (0..bs)
                            .map(|i| {
                                workload::transfer_draft(
                                    &book,
                                    &scope,
                                    w,
                                    batch_seq + i as u64,
                                    ppt,
                                )
                            })
                            .collect();
                        // post_batch returns Vec<ApiResult<Posted>>, one slot per draft.
                        // Whole-request failures propagate as Err in every slot.
                        let results = client.post_batch(drafts).await;

                        // Classify per-slot and pick the "dominant" outcome for the
                        // runner's single-return contract. We count per-draft in the
                        // multi-success fast path below; for mixed/error batches we fall
                        // back to the first non-success outcome so shed/errors are
                        // correctly tallied by the runner's record() path.
                        //
                        // Count successes per slot: each successful draft in a batch
                        // contributes one Success outcome to the runner.  Because run_step
                        // expects one OpOutcome per call we return a synthetic
                        // BatchOutcome instead — but the runner only knows OpOutcome.
                        // Solution: emit a sequence of outcomes. run_step's op closure
                        // must return one OpOutcome, so we accumulate surplus outcomes
                        // into a channel or… avoid that complexity entirely by handling
                        // all slots here and returning a single aggregate.
                        //
                        // Aggregate approach:
                        //   successes → counted via OpOutcome::Success with committed=true
                        //   shed/errors → classified per slot exactly as singles are
                        //
                        // Since run_step's record() adds 1 per call, we need one call
                        // per draft to keep latency-histogram counts == draft counts.
                        // But the closure returns ONE outcome.
                        //
                        // The chosen design: return a SINGLE OpOutcome representing
                        // the whole batch, but multiply the counters by N via a
                        // BatchSuccess variant. However adding a new variant to
                        // OpOutcome would require runner changes.
                        //
                        // Simpler: the op closure is called once per "iteration";
                        // with batch_size>1 one iteration IS the batch, and we report
                        // counters for the whole batch as ONE call. The latency for
                        // each individual draft equals the batch wall time — we record
                        // the histogram N times to preserve percentile semantics.
                        //
                        // To do that within the existing runner contract, we use a
                        // dedicated BatchOutcome in runner.rs OR we keep everything in
                        // this file via a wrapper that records N latency samples. The
                        // runner doesn't expose that hook.
                        //
                        // Decision (task spec): record the batch wall latency ONCE PER
                        // DRAFT. This is achieved by calling the op closure once and
                        // returning a BatchSuccess that the runner knows how to expand.
                        // We add BatchSuccess { n, n_dedup } to OpOutcome and expand it
                        // in runner::Local::record. See runner.rs changes below.
                        // This comment stays as the authoritative explanation.

                        // Aggregate all slots into counts.
                        let mut n_ok: usize = 0;
                        let mut n_dedup: usize = 0;
                        let mut n_shed: usize = 0;
                        let mut first_err: Option<OpOutcome> = None;

                        for res in results {
                            match res {
                                Ok(p) => {
                                    n_ok += 1;
                                    if p.deduplicated {
                                        n_dedup += 1;
                                    }
                                }
                                Err(e) => {
                                    let outcome = classify(e);
                                    match &outcome {
                                        OpOutcome::Saturated => n_shed += 1,
                                        _ => {
                                            if first_err.is_none() {
                                                first_err = Some(outcome);
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        // Return BatchOutcome so the runner can expand it per-draft.
                        if n_ok > 0 || n_shed > 0 || first_err.is_some() {
                            OpOutcome::Batch {
                                n_ok: n_ok as u64,
                                n_dedup: n_dedup as u64,
                                n_shed: n_shed as u64,
                                first_err: first_err.map(Box::new),
                            }
                        } else {
                            // Empty batch (shouldn't happen with bs>0) — treat as success
                            OpOutcome::Batch {
                                n_ok: 0,
                                n_dedup: 0,
                                n_shed: 0,
                                first_err: None,
                            }
                        }
                    }
                }
            }
        };
        let label = format!("c{c}");
        let counters = Arc::new(LiveCounters::default());
        let bar = ctx
            .progress
            .step(&label, ctx.warmup, ctx.duration, counters.clone());
        let r = run_step(
            StepConfig {
                workers: c,
                warmup: ctx.warmup,
                duration: ctx.duration,
            },
            Some(counters),
            op,
        )
        .await;
        bar.finish();
        committed += r.total_committed;
        ambiguous += r.total_ambiguous;
        let step = report::summarize_with_batch(label, &r, opts.batch_size);
        ctx.progress.println(report::step_line(&step));
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
        ctx.progress.println(format!("WARN: {w}"));
    }
    Ok(steps)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn opts_serializes_batch_size() {
        let opts = Opts {
            concurrencies: vec![1, 4],
            postings_per_tx: 2,
            batch_size: 8,
        };
        let v = serde_json::to_value(&opts).unwrap();
        assert_eq!(v["batch_size"], 8);
        assert_eq!(v["concurrencies"][1], 4);
    }
}
