//! Closed-loop worker pool: N tokio tasks each issue their next request
//! when the previous completes. Warmup is excluded from stats, but
//! commits are tallied for the WHOLE step lifetime — verification must
//! account for every event the bench wrote, warmup included.

use std::collections::HashMap;
use std::future::Future;
use std::sync::Arc;
use std::time::{Duration, Instant};

use hdrhistogram::Histogram;
use talea_core::api::ApiError;

#[derive(Debug, Clone, Copy)]
pub struct StepConfig {
    pub workers: usize,
    pub warmup: Duration,
    pub duration: Duration,
}

#[derive(Debug)]
pub enum OpOutcome {
    Success {
        kind: &'static str,
        deduplicated: bool,
        /// True when this op caused an event to be appended. For ops with
        /// run-scoped unique keys this includes dedup'd successes: the
        /// dedup means this op's own retried attempt had already committed.
        committed: bool,
    },
    /// Load-shed 503: rejected at admission, definitely not committed.
    Saturated,
    Failed {
        kind: String,
    },
    /// Aggregate outcome from one `post_batch` call covering `n_ok + n_shed +
    /// err_slots` drafts. The runner expands this into per-draft accounting:
    /// successes, shed, and errors are tallied separately; the batch's wall
    /// latency is recorded once per successful draft so histogram percentiles
    /// remain comparable with single-post runs at the same concurrency.
    ///
    /// `first_err` carries the classified outcome for the first failed
    /// (non-shed) slot; if more than one error kind appears in a batch, only
    /// the first is tallied — whole-request failures (auth/transport) map all
    /// slots to the same error kind anyway, so this is fine in practice.
    Batch {
        n_ok: u64,
        n_dedup: u64,
        n_shed: u64,
        first_err: Option<Box<OpOutcome>>,
    },
}

// No Debug derive: hdrhistogram's Histogram does not implement Debug.
pub struct StepReport {
    pub workers: usize,
    /// Nominal measure window; throughput = successes / measured.
    pub measured: Duration,
    /// Latency per op kind, microseconds, post-warmup only.
    pub latencies: HashMap<&'static str, Histogram<u64>>,
    pub successes: u64,
    pub saturated: u64,
    pub deduplicated: u64,
    pub errors: HashMap<String, u64>,
    /// Lifetime commit count INCLUDING warmup (verification needs all of it).
    pub total_committed: u64,
    /// Lifetime transport failures that may have committed server-side.
    pub total_ambiguous: u64,
}

/// Map a client error to an outcome. A 503 that survives the retry
/// budget surfaces as Transport with a message starting "503"
/// (talea-client http.rs decode_error) — that is admission shedding,
/// not an ambiguous failure. A 429 Overloaded (per-book write queue
/// full) is the same class of backpressure, one layer deeper.
pub fn classify(e: ApiError) -> OpOutcome {
    match e {
        ApiError::Transport { ref message } if message.starts_with("503") => OpOutcome::Saturated,
        ApiError::Overloaded => OpOutcome::Saturated,
        // 408: the server's processing deadline fired — backpressure class,
        // same client action as Overloaded (retries are idempotent-safe).
        // Not ambiguous: each store write is one DB transaction, so a
        // mid-flight cancellation rolls back — no partial commit can land.
        ApiError::Timeout => OpOutcome::Saturated,
        other => OpOutcome::Failed {
            kind: error_kind(&other).into(),
        },
    }
}

/// Stable string tag per [`ApiError`] variant; used as the key space of
/// [`StepReport::errors`].
pub fn error_kind(e: &ApiError) -> &'static str {
    match e {
        ApiError::Unbalanced { .. } => "unbalanced",
        ApiError::AssetMismatch { .. } => "asset_mismatch",
        ApiError::InvalidAmount { .. } => "invalid_amount",
        ApiError::UnknownAsset { .. } => "unknown_asset",
        ApiError::UnknownAccount { .. } => "unknown_account",
        ApiError::ConstraintViolation { .. } => "constraint_violation",
        ApiError::AlreadyExists { .. } => "already_exists",
        ApiError::InvalidDraft { .. } => "invalid_draft",
        ApiError::NotFound { .. } => "not_found",
        ApiError::Transport { .. } => "transport",
        ApiError::Unauthorized => "unauthorized",
        ApiError::Forbidden { .. } => "forbidden",
        ApiError::Overloaded => "overloaded",
        ApiError::Timeout => "timeout",
        ApiError::Internal { .. } => "internal",
    }
}

struct Local {
    latencies: HashMap<&'static str, Histogram<u64>>,
    successes: u64,
    saturated: u64,
    deduplicated: u64,
    errors: HashMap<String, u64>,
    total_committed: u64,
    total_ambiguous: u64,
}

impl Local {
    fn new() -> Self {
        Self {
            latencies: HashMap::new(),
            successes: 0,
            saturated: 0,
            deduplicated: 0,
            errors: HashMap::new(),
            total_committed: 0,
            total_ambiguous: 0,
        }
    }

    fn record(&mut self, outcome: &OpOutcome, latency: Duration, measured: bool) {
        // Lifetime tallies first: every commit counts, warmup or not.
        match outcome {
            OpOutcome::Success {
                committed: true, ..
            } => self.total_committed += 1,
            OpOutcome::Failed { kind } if kind == "transport" => self.total_ambiguous += 1,
            OpOutcome::Batch {
                n_ok, first_err, ..
            } => {
                // All successful drafts in a batch committed (keys are unique
                // per run, so a dedup'd slot means the original committed too).
                self.total_committed += n_ok;
                if let Some(e) = first_err
                    && let OpOutcome::Failed { kind } = e.as_ref()
                    && kind == "transport"
                {
                    self.total_ambiguous += 1;
                }
            }
            _ => {}
        }
        if !measured {
            return;
        }
        match outcome {
            OpOutcome::Success {
                kind, deduplicated, ..
            } => {
                self.successes += 1;
                if *deduplicated {
                    self.deduplicated += 1;
                }
                let h = self
                    .latencies
                    .entry(kind)
                    .or_insert_with(|| Histogram::new(3).expect("histogram"));
                let _ = h.record((latency.as_micros() as u64).max(1));
            }
            OpOutcome::Saturated => self.saturated += 1,
            OpOutcome::Failed { kind } => *self.errors.entry(kind.clone()).or_insert(0) += 1,
            OpOutcome::Batch {
                n_ok,
                n_dedup,
                n_shed,
                first_err,
            } => {
                self.successes += n_ok;
                self.deduplicated += n_dedup;
                self.saturated += n_shed;
                // Record the batch's wall latency once per successful draft so
                // histogram percentiles stay comparable to single-post runs:
                // each draft waited the full batch wall time.
                let us = (latency.as_micros() as u64).max(1);
                let h = self
                    .latencies
                    .entry("post")
                    .or_insert_with(|| Histogram::new(3).expect("histogram"));
                for _ in 0..*n_ok {
                    let _ = h.record(us);
                }
                if let Some(e) = first_err {
                    match e.as_ref() {
                        OpOutcome::Saturated => {} // already counted in n_shed
                        OpOutcome::Failed { kind } => {
                            *self.errors.entry(kind.clone()).or_insert(0) += 1;
                        }
                        _ => {} // nested Batch/Success: not expected
                    }
                }
            }
        }
    }
}

/// Run a closed-loop benchmark step with N workers.
///
/// `live` (when present) is fed once per completed op, warmup included —
/// display only, never part of measurement.
pub async fn run_step<F, Fut>(
    cfg: StepConfig,
    live: Option<Arc<crate::progress::LiveCounters>>,
    op: F,
) -> StepReport
where
    F: Fn(usize, u64) -> Fut + Clone + Send + 'static,
    Fut: Future<Output = OpOutcome> + Send + 'static,
{
    let start = Instant::now();
    let warmup_end = start + cfg.warmup;
    let deadline = warmup_end + cfg.duration;

    let mut handles = Vec::with_capacity(cfg.workers);
    for w in 0..cfg.workers {
        let op = op.clone();
        let live = live.clone();
        handles.push(tokio::spawn(async move {
            let mut local = Local::new();
            let mut seq: u64 = 0;
            while Instant::now() < deadline {
                let t0 = Instant::now();
                let outcome = op(w, seq).await;
                if let Some(live) = &live {
                    live.record(&outcome);
                }
                local.record(&outcome, t0.elapsed(), t0 >= warmup_end);
                seq += 1;
            }
            local
        }));
    }

    let mut report = StepReport {
        workers: cfg.workers,
        measured: cfg.duration,
        latencies: HashMap::new(),
        successes: 0,
        saturated: 0,
        deduplicated: 0,
        errors: HashMap::new(),
        total_committed: 0,
        total_ambiguous: 0,
    };
    for h in handles {
        let local = h.await.expect("bench worker panicked");
        report.successes += local.successes;
        report.saturated += local.saturated;
        report.deduplicated += local.deduplicated;
        report.total_committed += local.total_committed;
        report.total_ambiguous += local.total_ambiguous;
        for (k, v) in local.errors {
            *report.errors.entry(k).or_insert(0) += v;
        }
        for (k, h) in local.latencies {
            report
                .latencies
                .entry(k)
                .or_insert_with(|| Histogram::new(3).expect("histogram"))
                .add(&h)
                .expect("histogram merge");
        }
    }
    report
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::Arc;
    use std::sync::atomic::{AtomicU64, Ordering};
    use talea_core::api::ApiError;

    #[test]
    fn classify_routes_outcomes() {
        assert!(matches!(
            classify(ApiError::Transport {
                message: "503 Service Unavailable: busy".into()
            }),
            OpOutcome::Saturated
        ));
        assert!(matches!(
            classify(ApiError::Transport { message: "connection refused".into() }),
            OpOutcome::Failed { ref kind } if kind == "transport"
        ));
        assert!(matches!(
            classify(ApiError::Unauthorized),
            OpOutcome::Failed { ref kind } if kind == "unauthorized"
        ));
        assert!(matches!(
            classify(ApiError::Overloaded),
            OpOutcome::Saturated
        ));
        assert!(matches!(classify(ApiError::Timeout), OpOutcome::Saturated));
        assert!(matches!(
            classify(ApiError::Forbidden { book: "acme".into() }),
            OpOutcome::Failed { ref kind } if kind == "forbidden"
        ));
    }

    #[tokio::test]
    async fn run_step_excludes_warmup_but_counts_lifetime_commits() {
        let calls = Arc::new(AtomicU64::new(0));
        let c = calls.clone();
        let report = run_step(
            StepConfig {
                workers: 4,
                warmup: Duration::from_millis(100),
                duration: Duration::from_millis(200),
            },
            None,
            move |_, _| {
                let c = c.clone();
                async move {
                    c.fetch_add(1, Ordering::Relaxed);
                    tokio::time::sleep(Duration::from_millis(5)).await;
                    OpOutcome::Success {
                        kind: "op",
                        deduplicated: false,
                        committed: true,
                    }
                }
            },
        )
        .await;
        let total = calls.load(Ordering::Relaxed);
        assert!(report.successes > 0);
        assert!(
            report.successes < total,
            "warmup ops must be excluded from stats"
        );
        assert_eq!(
            report.total_committed, total,
            "lifetime commits include warmup"
        );
        assert_eq!(report.latencies["op"].len(), report.successes);
        assert_eq!(report.workers, 4);
    }

    #[tokio::test]
    async fn run_step_tallies_errors_and_saturation() {
        let report = run_step(
            StepConfig {
                workers: 2,
                warmup: Duration::ZERO,
                duration: Duration::from_millis(50),
            },
            None,
            move |w, _| async move {
                tokio::time::sleep(Duration::from_millis(2)).await;
                if w == 0 {
                    OpOutcome::Saturated
                } else {
                    OpOutcome::Failed {
                        kind: "transport".into(),
                    }
                }
            },
        )
        .await;
        assert!(report.saturated > 0);
        assert!(report.errors["transport"] > 0);
        // Equality holds here only because warmup is zero; in general
        // total_ambiguous >= errors["transport"] (it also counts warmup).
        assert_eq!(report.total_ambiguous, report.errors["transport"]);
        assert_eq!(report.successes, 0);
    }

    #[tokio::test]
    async fn run_step_feeds_live_counters_including_warmup() {
        use crate::progress::LiveCounters;
        let live = Arc::new(LiveCounters::default());
        let calls = Arc::new(AtomicU64::new(0));
        let c = calls.clone();
        let _ = run_step(
            StepConfig {
                workers: 2,
                warmup: Duration::from_millis(50),
                duration: Duration::from_millis(100),
            },
            Some(live.clone()),
            move |_, _| {
                let c = c.clone();
                async move {
                    c.fetch_add(1, Ordering::Relaxed);
                    tokio::time::sleep(Duration::from_millis(5)).await;
                    OpOutcome::Success {
                        kind: "op",
                        deduplicated: false,
                        committed: true,
                    }
                }
            },
        )
        .await;
        assert_eq!(
            live.ops.load(Ordering::Relaxed),
            calls.load(Ordering::Relaxed),
            "live counter sees every op, warmup included"
        );
    }

    #[tokio::test]
    async fn run_step_batch_outcome_expands_per_draft() {
        // A single Batch{n_ok=3, n_dedup=1, n_shed=0} per iteration should
        // produce successes=3, deduplicated=1, and 3 histogram samples, all
        // from a single closure call.
        let report = run_step(
            StepConfig {
                workers: 1,
                warmup: Duration::ZERO,
                duration: Duration::from_millis(60),
            },
            None,
            |_, _| async move {
                tokio::time::sleep(Duration::from_millis(10)).await;
                OpOutcome::Batch {
                    n_ok: 3,
                    n_dedup: 1,
                    n_shed: 0,
                    first_err: None,
                }
            },
        )
        .await;
        // Each iteration contributes 3 successes; we expect multiple iterations.
        assert!(report.successes >= 3, "at least one batch fired");
        assert!(
            report.successes % 3 == 0,
            "successes must be a multiple of 3"
        );
        assert_eq!(
            report.deduplicated,
            report.successes / 3,
            "one dedup per batch"
        );
        // Latency histogram must have one sample per successful draft.
        assert_eq!(
            report.latencies["post"].len(),
            report.successes,
            "one latency sample per successful draft"
        );
        assert_eq!(report.total_committed, report.successes);
        assert_eq!(report.saturated, 0);
    }

    #[tokio::test]
    async fn run_step_batch_outcome_counts_shed_and_error() {
        let report = run_step(
            StepConfig {
                workers: 1,
                warmup: Duration::ZERO,
                duration: Duration::from_millis(40),
            },
            None,
            |_, _| async move {
                tokio::time::sleep(Duration::from_millis(10)).await;
                OpOutcome::Batch {
                    n_ok: 0,
                    n_dedup: 0,
                    n_shed: 2,
                    first_err: Some(Box::new(OpOutcome::Failed {
                        kind: "unauthorized".into(),
                    })),
                }
            },
        )
        .await;
        assert_eq!(report.successes, 0);
        assert!(report.saturated >= 2, "shed slots tallied");
        assert!(report.errors["unauthorized"] >= 1, "error slot tallied");
    }
}
