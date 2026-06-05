//! All indicatif usage lives here, behind a cloneable [`Progress`] handle.
//! Enabled only when stderr is a TTY; hidden mode is a true no-op so piped
//! and CI output stays byte-identical to a build without progress bars.

use std::io::IsTerminal;
use std::sync::Arc;
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{Duration, Instant};

use indicatif::{MultiProgress, ProgressBar, ProgressDrawTarget, ProgressStyle};

use crate::runner::OpOutcome;

/// Live tallies fed by the runner's workers: one relaxed increment per
/// completed op. Read by the step bar's ticker for display only.
#[derive(Debug, Default)]
pub struct LiveCounters {
    pub ops: AtomicU64,
    pub saturated: AtomicU64,
    pub deduplicated: AtomicU64,
}

impl LiveCounters {
    pub fn record(&self, outcome: &OpOutcome) {
        self.ops.fetch_add(1, Ordering::Relaxed);
        match outcome {
            OpOutcome::Saturated => {
                self.saturated.fetch_add(1, Ordering::Relaxed);
            }
            OpOutcome::Success { deduplicated: true, .. } => {
                self.deduplicated.fetch_add(1, Ordering::Relaxed);
            }
            _ => {}
        }
    }
}

/// Cloneable progress handle. `None` inside = hidden = every method is a no-op.
#[derive(Clone)]
pub struct Progress {
    multi: Option<MultiProgress>,
}

impl Progress {
    /// Enabled iff stderr is a TTY. Call once in main.
    pub fn auto() -> Self {
        if std::io::stderr().is_terminal() {
            Self { multi: Some(MultiProgress::new()) } // draws to stderr
        } else {
            Self::hidden()
        }
    }

    /// True no-op variant; used by every test.
    pub fn hidden() -> Self {
        Self { multi: None }
    }

    /// Enabled but drawing to a discarded target: exercises bar/ticker
    /// lifecycles in tests without touching a real terminal.
    pub fn forced_for_tests() -> Self {
        let multi = MultiProgress::with_draw_target(ProgressDrawTarget::hidden());
        Self { multi: Some(multi) }
    }

    pub fn is_enabled(&self) -> bool {
        self.multi.is_some()
    }

    /// Print a line above any active bars (falls back to eprintln when hidden).
    pub fn println(&self, msg: impl AsRef<str>) {
        match &self.multi {
            Some(m) => {
                let _ = m.println(msg.as_ref());
            }
            None => eprintln!("{}", msg.as_ref()),
        }
    }

    /// Time-driven two-phase bar for one runner step. A ticker task advances
    /// position from wall clock and renders live counters; the measured path
    /// is never touched. Call [`StepBar::finish`] when the step completes.
    pub fn step(
        &self,
        label: &str,
        warmup: Duration,
        duration: Duration,
        counters: Arc<LiveCounters>,
    ) -> StepBar {
        let Some(multi) = &self.multi else {
            return StepBar { bar: None, ticker: None };
        };
        let total_ms = (warmup + duration).as_millis() as u64;
        let bar = multi.add(ProgressBar::new(total_ms.max(1)));
        bar.set_style(
            ProgressStyle::with_template("{prefix:>10} [{bar:30}] {percent:>3}% {msg}")
                .expect("static template")
                .progress_chars("=> "),
        );
        bar.set_prefix(label.to_string());
        let start = Instant::now();
        let warmup_ms = warmup.as_millis() as u64;
        let ticker = tokio::spawn({
            let bar = bar.clone();
            async move {
                loop {
                    let elapsed = start.elapsed().as_millis() as u64;
                    bar.set_position(elapsed.min(total_ms));
                    let phase = if elapsed < warmup_ms { "warmup" } else { "measuring" };
                    let ops = counters.ops.load(Ordering::Relaxed);
                    let rate = ops as f64 / start.elapsed().as_secs_f64().max(0.001);
                    bar.set_message(format!(
                        "{phase} · {ops} ops · {rate:.0}/s · {} shed · {} dedup",
                        counters.saturated.load(Ordering::Relaxed),
                        counters.deduplicated.load(Ordering::Relaxed),
                    ));
                    tokio::time::sleep(Duration::from_millis(100)).await;
                }
            }
        });
        StepBar { bar: Some(bar), ticker: Some(ticker) }
    }

    /// Count-driven bar for depth seeding.
    pub fn seed(&self, total: u64) -> SeedBar {
        let Some(multi) = &self.multi else { return SeedBar { bar: None } };
        let bar = multi.add(ProgressBar::new(total.max(1)));
        bar.set_style(
            ProgressStyle::with_template("{prefix:>10} [{bar:30}] {pos}/{len}")
                .expect("static template")
                .progress_chars("=> "),
        );
        bar.set_prefix("seed");
        SeedBar { bar: Some(bar) }
    }
}

/// Guard for one step's bar; finishes (and stops its ticker) on `finish`
/// or drop, whichever comes first.
pub struct StepBar {
    bar: Option<ProgressBar>,
    ticker: Option<tokio::task::JoinHandle<()>>,
}

impl StepBar {
    pub fn finish(mut self) {
        self.close();
    }

    fn close(&mut self) {
        if let Some(t) = self.ticker.take() {
            t.abort();
        }
        if let Some(b) = self.bar.take() {
            b.finish_and_clear();
        }
    }
}

impl Drop for StepBar {
    fn drop(&mut self) {
        self.close();
    }
}

pub struct SeedBar {
    bar: Option<ProgressBar>,
}

impl SeedBar {
    pub fn inc(&self, n: u64) {
        if let Some(b) = &self.bar {
            b.inc(n);
        }
    }

    pub fn set_pos(&self, n: u64) {
        if let Some(b) = &self.bar {
            b.set_position(n);
        }
    }

    pub fn finish(self) {
        if let Some(b) = &self.bar {
            b.finish_and_clear();
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::runner::OpOutcome;
    use std::sync::atomic::Ordering;
    use std::time::Duration;

    #[test]
    fn live_counters_map_outcomes() {
        let c = LiveCounters::default();
        c.record(&OpOutcome::Success { kind: "post", deduplicated: false, committed: true });
        c.record(&OpOutcome::Success { kind: "post", deduplicated: true, committed: true });
        c.record(&OpOutcome::Saturated);
        c.record(&OpOutcome::Failed { kind: "transport".into() });
        assert_eq!(c.ops.load(Ordering::Relaxed), 4, "every completed op counts");
        assert_eq!(c.saturated.load(Ordering::Relaxed), 1);
        assert_eq!(c.deduplicated.load(Ordering::Relaxed), 1);
    }

    #[test]
    fn hidden_progress_is_inert() {
        let p = Progress::hidden();
        assert!(!p.is_enabled());
        p.println("a line"); // must not panic, must not draw
        let counters = std::sync::Arc::new(LiveCounters::default());
        let bar = p.step("c4", Duration::from_secs(5), Duration::from_secs(30), counters);
        bar.finish(); // no-op
        let seed = p.seed(100);
        seed.inc(50);
        seed.finish(); // no-op
    }

    #[tokio::test]
    async fn enabled_step_bar_ticks_and_finishes() {
        // Force-enabled even without a TTY: draws to a hidden target —
        // this exercises the ticker task lifecycle, not pixels.
        let p = Progress::forced_for_tests();
        let counters = std::sync::Arc::new(LiveCounters::default());
        let bar = p.step("c1", Duration::ZERO, Duration::from_millis(80), counters.clone());
        counters.record(&OpOutcome::Saturated);
        tokio::time::sleep(Duration::from_millis(120)).await;
        bar.finish(); // must stop the ticker and clear without panic
    }
}
