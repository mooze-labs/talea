//! Read QPS against a deep book: balance, history pagination from
//! pseudo-random cursors, and trial balance. Depth seeding uses
//! run-independent idempotency keys ("bench/depth/0/{n}"), so re-runs
//! dedup to no-ops and the book's depth stays stable.

use std::sync::Arc;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::time::Duration;

use serde::Serialize;
use talea_client::{LedgerApi, TaleaClient};
use talea_core::api::Page;

use crate::progress::{LiveCounters, Progress};
use crate::report::{self, StepJson};
use crate::runner::{OpOutcome, StepConfig, classify, run_step};
use crate::scenarios::validate_sweep;
use crate::seed::READ_BOOK;
use crate::{Ctx, seed, verify, workload};

#[derive(Debug, Clone, Serialize)]
pub struct Opts {
    pub concurrencies: Vec<usize>,
    pub depth: usize,
    pub seed_workers: usize,
}

const ENDPOINTS: [&str; 3] = ["balance", "history", "trial-balance"];

pub async fn run(ctx: &Ctx, opts: Opts) -> Result<Vec<StepJson>, String> {
    validate_sweep(&opts.concurrencies, "concurrency")?;
    let client = Arc::new(ctx.client()?);
    seed::seed_read_book(client.as_ref()).await?;
    seed_depth(&client, &ctx.progress, opts.depth, opts.seed_workers).await?;
    // Probe gives the top seq — the cursor space for history pagination.
    let top_seq = verify::probe_seq(client.as_ref(), READ_BOOK, &ctx.run_id, "reads").await?;

    let mut steps = Vec::new();
    for &c in &opts.concurrencies {
        for ep in ENDPOINTS {
            let op = {
                let client = client.clone();
                move |w: usize, s: u64| {
                    let client = client.clone();
                    async move {
                        let r = match ep {
                            "balance" => client
                                .balance(READ_BOOK, workload::CASH, None)
                                .await
                                .map(|_| ()),
                            "history" => {
                                let cursor =
                                    (workload::pseudo(w, s) % top_seq.max(1) as u64) as i64;
                                client
                                    .account_history(
                                        READ_BOOK,
                                        workload::CASH,
                                        Page {
                                            after_seq: Some(cursor),
                                            limit: 100,
                                        },
                                    )
                                    .await
                                    .map(|_| ())
                            }
                            _ => client.trial_balance(READ_BOOK, None).await.map(|_| ()),
                        };
                        match r {
                            Ok(()) => OpOutcome::Success {
                                kind: ep,
                                deduplicated: false,
                                committed: false,
                            },
                            Err(e) => classify(e),
                        }
                    }
                }
            };
            let label = format!("{ep}/c{c}");
            let counters = Arc::new(LiveCounters::default());
            let bar = ctx.progress.step(&label, ctx.warmup, ctx.duration, counters.clone());
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
            let step = report::summarize(label, &r);
            ctx.progress.println(report::step_line(&step));
            steps.push(step);
        }
    }
    Ok(steps)
}

/// Post `depth` transactions into the read book with run-independent
/// keys, partitioned across workers. Re-running dedups (free).
pub async fn seed_depth(
    client: &Arc<TaleaClient>,
    progress: &Progress,
    depth: usize,
    workers: usize,
) -> Result<(), String> {
    let done = Arc::new(AtomicUsize::new(0));
    let progress_enabled = progress.is_enabled();
    let bar = progress.seed(depth as u64);
    let monitor = {
        let done = done.clone();
        tokio::spawn(async move {
            loop {
                tokio::time::sleep(Duration::from_millis(100)).await;
                let d = done.load(Ordering::Relaxed) as u64;
                bar.set_pos(d);
                if d >= depth as u64 {
                    bar.finish();
                    break;
                }
            }
        })
    };
    let mut handles = Vec::with_capacity(workers);
    for w in 0..workers.max(1) {
        let client = client.clone();
        let done = done.clone();
        let stride = workers.max(1);
        handles.push(tokio::spawn(async move {
            let mut n = w;
            while n < depth {
                let draft = workload::transfer_draft(READ_BOOK, "depth", 0, n as u64, 2);
                client
                    .post(draft)
                    .await
                    .map_err(|e| format!("depth seed post {n}: {e:?}"))?;
                let d = done.fetch_add(1, Ordering::Relaxed) + 1;
                if !progress_enabled && d.is_multiple_of(5000) {
                    eprintln!("depth seed: {d}/{depth}");
                }
                n += stride;
            }
            Ok::<(), String>(())
        }));
    }
    let mut result: Result<(), String> = Ok(());
    for h in handles {
        match h.await.map_err(|e| format!("seed worker panicked: {e}")) {
            Ok(Ok(())) => {}
            Ok(Err(e)) => {
                result = Err(e);
                break;
            }
            Err(e) => {
                result = Err(e);
                break;
            }
        }
    }
    monitor.abort();
    result
}
