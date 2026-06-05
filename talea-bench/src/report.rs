//! Step summaries, the stdout table, and the per-run JSON result file.

use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};

use chrono::{DateTime, Utc};
use hdrhistogram::Histogram;
use serde::Serialize;

use crate::runner::StepReport;

/// Caveats header printed before every run and useful to embed near
/// results. The sqlite extension keeps cross-backend comparisons honest:
/// a SQLite post-many-books knee is the single-writer model, not a
/// regression.
pub fn caveats(backend: &str) -> String {
    let mut out = String::from(
        "\
CAVEATS:
  1. Closed-loop load understates latency at saturation (coordinated
     omission). Treat results as ceilings and curve shapes, not SLO evidence.
  2. Postgres under Docker Desktop on macOS skews commit latency (VM +
     fsync behavior). Treat absolute numbers as indicative only.",
    );
    if backend == "sqlite" {
        out.push_str(
            "\n  3. SQLite has a single WAL writer: cross-book write scaling \
             (post-many-books) knees early BY DESIGN. Compare SQLite runs only \
             against other SQLite runs.",
        );
    }
    out
}

#[derive(Debug, Serialize)]
pub struct LatencyJson {
    pub count: u64,
    pub p50_us: u64,
    pub p90_us: u64,
    pub p99_us: u64,
    pub p999_us: u64,
    pub max_us: u64,
}

pub fn latency_json(h: &Histogram<u64>) -> LatencyJson {
    LatencyJson {
        count: h.len(),
        p50_us: h.value_at_quantile(0.50),
        p90_us: h.value_at_quantile(0.90),
        p99_us: h.value_at_quantile(0.99),
        p999_us: h.value_at_quantile(0.999),
        max_us: h.max(),
    }
}

#[derive(Debug, Serialize)]
pub struct StepJson {
    pub label: String,
    pub workers: usize,
    pub measured_secs: f64,
    /// All successful ops per second across kinds.
    pub throughput_ops_s: f64,
    pub successes: u64,
    /// Shed by backpressure: 503 admission shedding + 429 per-book
    /// write-queue rejection. Both mean "retry later", never an error.
    pub saturated: u64,
    pub deduplicated: u64,
    pub errors: HashMap<String, u64>,
    /// Error rate over 1% — numbers from this step are not trustworthy.
    pub invalid: bool,
    pub latency: HashMap<String, LatencyJson>,
}

pub fn summarize(label: impl Into<String>, r: &StepReport) -> StepJson {
    let errs: u64 = r.errors.values().sum();
    let denom = r.successes + errs;
    let invalid = denom > 0 && errs as f64 / denom as f64 > 0.01;
    StepJson {
        label: label.into(),
        workers: r.workers,
        measured_secs: r.measured.as_secs_f64(),
        throughput_ops_s: if r.measured.as_secs_f64() > 0.0 {
            r.successes as f64 / r.measured.as_secs_f64()
        } else {
            0.0
        },
        successes: r.successes,
        saturated: r.saturated,
        deduplicated: r.deduplicated,
        errors: r.errors.clone(),
        invalid,
        latency: r
            .latencies
            .iter()
            .map(|(k, h)| ((*k).to_string(), latency_json(h)))
            .collect(),
    }
}

pub fn render_table(steps: &[StepJson]) -> String {
    fn ms(us: u64) -> f64 {
        us as f64 / 1000.0
    }
    let mut out = format!(
        "{:<24} {:<14} {:>10} {:>9} {:>9} {:>9} {:>9} {:>10} {:>6} {:>6}\n",
        "step", "op", "ops/s", "p50ms", "p90ms", "p99ms", "p99.9ms", "maxms", "shed", "errs"
    );
    for s in steps {
        let errs: u64 = s.errors.values().sum();
        let label = if s.invalid {
            format!("{} [INVALID]", s.label)
        } else {
            s.label.clone()
        };
        let mut kinds: Vec<&String> = s.latency.keys().collect();
        kinds.sort();
        for k in kinds {
            let l = &s.latency[k];
            let rate = if s.measured_secs > 0.0 {
                l.count as f64 / s.measured_secs
            } else {
                0.0
            };
            out.push_str(&format!(
                "{:<24} {:<14} {:>10.1} {:>9.1} {:>9.1} {:>9.1} {:>9.1} {:>10.1} {:>6} {:>6}\n",
                label,
                k,
                rate,
                ms(l.p50_us),
                ms(l.p90_us),
                ms(l.p99_us),
                ms(l.p999_us),
                ms(l.max_us),
                s.saturated,
                errs
            ));
        }
        if s.latency.is_empty() {
            out.push_str(&format!(
                "{:<24} {:<14} {:>10} (no successful ops; shed={} errs={})\n",
                label, "-", "-", s.saturated, errs
            ));
        }
    }
    out
}

/// One line of progress per completed step, for long sweeps.
pub fn step_line(s: &StepJson) -> String {
    let p99: u64 = s.latency.values().map(|l| l.p99_us).max().unwrap_or(0);
    format!(
        "step {} done: {:.1} ops/s, worst p99 {:.1}ms, shed={}, invalid={}",
        s.label,
        s.throughput_ops_s,
        p99 as f64 / 1000.0,
        s.saturated,
        s.invalid
    )
}

#[derive(Debug, Serialize)]
pub struct RunJson {
    pub scenario: String,
    /// Store backend the target server reported ("postgres" | "sqlite" |
    /// "unknown" for pre-header servers).
    pub backend: String,
    pub git_sha: String,
    pub started_at: DateTime<Utc>,
    pub config: serde_json::Value,
    pub steps: Vec<StepJson>,
}

pub fn git_sha() -> String {
    std::process::Command::new("git")
        .args(["rev-parse", "--short", "HEAD"])
        .output()
        .ok()
        .filter(|o| o.status.success())
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .unwrap_or_else(|| "unknown".into())
}

pub fn write_json(out_dir: &Path, run: &RunJson) -> Result<PathBuf, String> {
    fs::create_dir_all(out_dir).map_err(|e| format!("creating {}: {e}", out_dir.display()))?;
    let path = out_dir.join(format!(
        "{}-{}.json",
        run.started_at.format("%Y%m%dT%H%M%S%.3fZ"),
        run.scenario
    ));
    let body = serde_json::to_string_pretty(run).map_err(|e| format!("serializing run: {e}"))?;
    fs::write(&path, body).map_err(|e| format!("writing {}: {e}", path.display()))?;
    Ok(path)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::runner::StepReport;
    use hdrhistogram::Histogram;
    use std::time::Duration;

    fn sample_report(errors: u64) -> StepReport {
        let mut h = Histogram::new(3).unwrap();
        for v in [1_000u64, 2_000, 3_000, 4_000, 100_000] {
            h.record(v).unwrap();
        }
        let mut latencies = std::collections::HashMap::new();
        latencies.insert("post", h);
        let mut errs = std::collections::HashMap::new();
        if errors > 0 {
            errs.insert("transport".to_string(), errors);
        }
        StepReport {
            workers: 4,
            measured: Duration::from_secs(10),
            latencies,
            successes: 5,
            saturated: 2,
            deduplicated: 0,
            errors: errs,
            total_committed: 7,
            total_ambiguous: errors,
        }
    }

    #[test]
    fn summarize_computes_percentiles_and_throughput() {
        let s = summarize("c4", &sample_report(0));
        assert_eq!(s.label, "c4");
        assert_eq!(s.successes, 5);
        assert!((s.throughput_ops_s - 0.5).abs() < 1e-9);
        let l = &s.latency["post"];
        assert_eq!(l.count, 5);
        assert!(l.p50_us >= 2_000 && l.p50_us <= 3_010);
        assert!(l.max_us >= 100_000);
        assert!(!s.invalid);
    }

    #[test]
    fn summarize_flags_invalid_above_one_percent_errors() {
        // 5 successes + 1 error = 16.7% error rate -> invalid
        let s = summarize("c4", &sample_report(1));
        assert!(s.invalid);
    }

    #[test]
    fn render_table_includes_rows_and_header() {
        let s = summarize("c4", &sample_report(0));
        let t = render_table(std::slice::from_ref(&s));
        assert!(t.contains("ops/s"));
        assert!(t.contains("c4"));
        assert!(t.contains("post"));
        // shed counts BOTH 503 admission shedding and 429 write-queue
        // rejection — the old "503s" name lied after the write-queue landed
        assert!(t.contains("shed"));
        assert!(!t.contains("503s"));
    }

    #[test]
    fn write_json_roundtrips() {
        let dir = std::env::temp_dir().join(format!("talea-bench-test-{}", std::process::id()));
        let run = RunJson {
            scenario: "unit".into(),
            backend: "sqlite".into(),
            git_sha: git_sha(),
            started_at: chrono::Utc::now(),
            config: serde_json::json!({"k": 1}),
            steps: vec![summarize("c4", &sample_report(0))],
        };
        let path = write_json(&dir, &run).unwrap();
        let body = std::fs::read_to_string(&path).unwrap();
        let parsed: serde_json::Value = serde_json::from_str(&body).unwrap();
        assert_eq!(parsed["scenario"], "unit");
        assert_eq!(parsed["backend"], "sqlite");
        assert_eq!(parsed["steps"][0]["successes"], 5);
        std::fs::remove_dir_all(&dir).ok();
    }

    #[test]
    fn caveats_are_backend_conditional() {
        let pg = caveats("postgres");
        let lite = caveats("sqlite");
        // the two universal caveats appear for every backend
        for c in [&pg, &lite] {
            assert!(c.contains("coordinated"));
            assert!(c.contains("Docker Desktop"));
        }
        // the single-writer note appears only for sqlite
        assert!(lite.contains("single WAL writer"));
        assert!(!pg.contains("single WAL writer"));
    }
}
