//! Realistic blend: posts + balance + history + trial-balance at fixed
//! ratios across several books, with live SSE subscribers measuring
//! commit→delivery lag. This is where the surfaces interfere.

use std::collections::HashMap;
use std::sync::{Arc, Mutex};

use chrono::Utc;
use futures::StreamExt;
use hdrhistogram::Histogram;
use serde::Serialize;
use talea_client::LedgerApi;
use talea_core::api::Page;
use talea_core::types::Seq;

use crate::progress::LiveCounters;
use crate::report::{self, StepJson, latency_json};
use crate::runner::{OpOutcome, StepConfig, classify, run_step};
use crate::scenarios::validate_sweep;
use crate::workload::{MixOp, MixWeights};
use crate::{Ctx, seed, verify, workload};

#[derive(Debug, Clone, Serialize)]
pub struct Opts {
    pub concurrencies: Vec<usize>,
    pub books: usize,
    pub sse_subscribers: usize,
    pub weights: MixWeights,
}

pub async fn run(ctx: &Ctx, opts: Opts) -> Result<Vec<StepJson>, String> {
    validate_sweep(&opts.concurrencies, "concurrency")?;
    if opts.books == 0 {
        return Err("books must be > 0".into());
    }
    let client = Arc::new(ctx.client()?);
    seed::seed_books(client.as_ref(), opts.books).await?;
    let mut probes: Vec<(String, Seq)> = Vec::with_capacity(opts.books);
    for i in 0..opts.books {
        let book = workload::book_name(i);
        let seq = verify::probe_seq(client.as_ref(), &book, &ctx.run_id, "mixed-before").await?;
        probes.push((book, seq));
    }

    // SSE subscribers tail from just past the probe; lag = now - event.at.
    // NOTE (Postgres): each subscriber pins one pool connection — size
    // TALEA_DB_POOL for subscribers + workers.
    let lag: Arc<Mutex<Histogram<u64>>> =
        Arc::new(Mutex::new(Histogram::<u64>::new(3).expect("histogram")));
    let mut subscribers = Vec::with_capacity(opts.sse_subscribers);
    for i in 0..opts.sse_subscribers {
        let client = client.clone();
        let lag = lag.clone();
        let progress = ctx.progress.clone();
        let (book, from) = {
            let (b, s) = &probes[i % opts.books];
            (b.clone(), *s + 1)
        };
        subscribers.push(tokio::spawn(async move {
            let mut stream = match client.subscribe(&book, from).await {
                Ok(s) => s,
                Err(e) => {
                    progress.println(format!("sse subscribe({book}) failed: {e:?}"));
                    return;
                }
            };
            while let Some(item) = stream.next().await {
                if let Ok(env) = item {
                    let us = (Utc::now() - env.at).num_microseconds().unwrap_or(0).max(1) as u64;
                    let _ = lag.lock().expect("lag lock").record(us);
                }
            }
        }));
    }

    let probes_shared: Arc<Vec<(String, Seq)>> = Arc::new(probes.clone());
    let mut steps = Vec::new();
    let mut committed = 0u64;
    let mut ambiguous = 0u64;
    for &c in &opts.concurrencies {
        let op = {
            let client = client.clone();
            let probes = probes_shared.clone();
            let weights = opts.weights.clone();
            let books = opts.books;
            let scope: Arc<str> = format!("{}/mixed/c{c}", ctx.run_id).into();
            move |w: usize, s: u64| {
                let client = client.clone();
                let probes = probes.clone();
                let weights = weights.clone();
                let scope = scope.clone();
                async move {
                    let (book, base_seq) = &probes[w % books];
                    match weights.op_for(s) {
                        MixOp::Post => {
                            match client
                                .post(workload::transfer_draft(book, &scope, w, s, 2))
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
                        MixOp::Balance => match client.balance(book, workload::CASH, None).await {
                            Ok(_) => OpOutcome::Success {
                                kind: "balance",
                                deduplicated: false,
                                committed: false,
                            },
                            Err(e) => classify(e),
                        },
                        MixOp::History => {
                            let cursor =
                                (workload::pseudo(w, s) % (*base_seq).max(1) as u64) as i64;
                            match client
                                .account_history(
                                    book,
                                    workload::CASH,
                                    Page {
                                        after_seq: Some(cursor),
                                        limit: 100,
                                    },
                                )
                                .await
                            {
                                Ok(_) => OpOutcome::Success {
                                    kind: "history",
                                    deduplicated: false,
                                    committed: false,
                                },
                                Err(e) => classify(e),
                            }
                        }
                        MixOp::Trial => match client.trial_balance(book, None).await {
                            Ok(_) => OpOutcome::Success {
                                kind: "trial-balance",
                                deduplicated: false,
                                committed: false,
                            },
                            Err(e) => classify(e),
                        },
                    }
                }
            }
        };
        let label = format!("c{c}");
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
        committed += r.total_committed;
        ambiguous += r.total_ambiguous;
        let step = report::summarize(label, &r);
        ctx.progress.println(report::step_line(&step));
        steps.push(step);
    }

    for s in &subscribers {
        s.abort();
    }

    // SSE lag as a pseudo-step (whole-run histogram, no throughput).
    // Drop the guard before the verify_books await to satisfy clippy::await_holding_lock.
    let sse_step: Option<StepJson> = {
        let lag_guard = lag.lock().expect("lag lock");
        if !lag_guard.is_empty() {
            let mut latency = HashMap::new();
            let count = lag_guard.len();
            latency.insert("sse-lag".to_string(), latency_json(&lag_guard));
            Some(StepJson {
                label: "sse-lag".into(),
                workers: opts.sse_subscribers,
                measured_secs: 0.0,
                throughput_ops_s: 0.0,
                successes: count,
                saturated_503: 0,
                deduplicated: 0,
                errors: HashMap::new(),
                invalid: false,
                latency,
            })
        } else {
            None
        }
    };

    let warnings = verify::verify_books(
        client.as_ref(),
        &ctx.run_id,
        "mixed",
        &probes,
        committed,
        ambiguous,
    )
    .await?;
    for w in &warnings {
        ctx.progress.println(format!("WARN: {w}"));
    }
    if let Some(step) = sse_step {
        steps.push(step);
    }
    Ok(steps)
}
