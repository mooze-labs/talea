//! `summarize` subcommand: extract trend metrics from run-report JSONs into
//! github-action-benchmark's custom-format files.
//!
//! Loud over silent: any condition that would quietly flat-line or mislabel a
//! trend chart (unknown backend, missing representative step, duplicate
//! metric names) is an error, not a warning.

use serde::Serialize;
use std::collections::HashSet;
use std::path::{Path, PathBuf};

use crate::report::RunJson;

/// One entry in the action's `customBiggerIsBetter`/`customSmallerIsBetter`
/// JSON: `[{"name", "unit", "value"}]`.
#[derive(Debug, Serialize, PartialEq)]
pub struct Metric {
    pub name: String,
    pub unit: String,
    pub value: f64,
}

/// Metrics split by chart direction.
#[derive(Debug, Default)]
pub struct Summary {
    /// `customBiggerIsBetter`: throughput.
    pub bigger: Vec<Metric>,
    /// `customSmallerIsBetter`: latency percentiles, error rates.
    pub smaller: Vec<Metric>,
}

/// Extract metrics from parsed runs. `rep_workers` picks the step used for
/// latency percentiles (the workflow keeps sweeps and this value in sync).
pub fn summarize_runs(runs: &[RunJson], rep_workers: usize) -> Result<Summary, String> {
    let mut summary = Summary::default();
    for run in runs {
        summarize_run(run, rep_workers, &mut summary)?;
    }
    let mut seen = HashSet::new();
    for m in summary.bigger.iter().chain(summary.smaller.iter()) {
        if !seen.insert(m.name.as_str()) {
            return Err(format!(
                "duplicate metric {:?} — did two legs bench the same backend?",
                m.name
            ));
        }
    }
    Ok(summary)
}

fn summarize_run(run: &RunJson, rep_workers: usize, out: &mut Summary) -> Result<(), String> {
    let tag = format!("{}/{}", run.scenario, run.backend);
    if run.backend == "unknown" {
        return Err(format!(
            "{}: backend is \"unknown\" (health probe failed); refusing to mislabel trend data",
            run.scenario
        ));
    }
    for s in run.steps.iter().filter(|s| s.invalid) {
        eprintln!(
            "WARN: {tag}: step {} invalid (>1% errors), excluded",
            s.label
        );
    }
    let valid: Vec<_> = run.steps.iter().filter(|s| !s.invalid).collect();
    if valid.is_empty() {
        return Err(format!("{tag}: no valid steps"));
    }

    let peak = valid
        .iter()
        .map(|s| s.throughput_ops_s)
        .fold(f64::NEG_INFINITY, f64::max);
    out.bigger.push(Metric {
        name: format!("{tag}/peak-throughput"),
        unit: "ops/s".into(),
        value: peak,
    });

    if run.scenario == "overload" {
        // No p99 here: 1024 closed-loop workers far past capacity measure
        // queueing, not the server. Clean shedding is the signal instead.
        // NB: this denominator includes `saturated`, unlike the `invalid`
        // flag in report::summarize (successes + errors only) — a step that
        // only shed traffic is valid there but has zero error-rate ops here.
        for s in &valid {
            let errs: u64 = s.errors.values().sum();
            let denom = s.successes + s.saturated + errs;
            if denom == 0 {
                return Err(format!("{tag}: step {} recorded no operations", s.label));
            }
            out.smaller.push(Metric {
                name: format!("{tag}/error-rate/{}", s.label),
                unit: "errors/op".into(),
                value: errs as f64 / denom as f64,
            });
        }
        return Ok(());
    }

    let rep = valid
        .iter()
        .find(|s| s.workers == rep_workers)
        .ok_or_else(|| format!("{tag}: no valid step with workers == {rep_workers}"))?;
    let mut kinds: Vec<_> = rep.latency.keys().collect();
    kinds.sort();
    for kind in kinds {
        out.smaller.push(Metric {
            name: format!("{tag}/p99-{kind}@c{rep_workers}"),
            unit: "us".into(),
            value: rep.latency[kind].p99_us as f64,
        });
    }

    Ok(())
}

/// CLI entry: read report files, write the two metric files. Returns the
/// (bigger, smaller) metric counts for the caller to report.
pub fn run_summarize(
    rep_workers: usize,
    bigger_out: &Path,
    smaller_out: &Path,
    reports: &[PathBuf],
) -> Result<(usize, usize), String> {
    let mut runs = Vec::with_capacity(reports.len());
    for path in reports {
        let body = std::fs::read_to_string(path)
            .map_err(|e| format!("reading {}: {e}", path.display()))?;
        runs.push(
            serde_json::from_str::<RunJson>(&body)
                .map_err(|e| format!("parsing {}: {e}", path.display()))?,
        );
    }
    let summary = summarize_runs(&runs, rep_workers)?;
    write_metrics(bigger_out, &summary.bigger)?;
    write_metrics(smaller_out, &summary.smaller)?;
    Ok((summary.bigger.len(), summary.smaller.len()))
}

fn write_metrics(path: &Path, metrics: &[Metric]) -> Result<(), String> {
    let body =
        serde_json::to_string_pretty(metrics).map_err(|e| format!("serializing metrics: {e}"))?;
    std::fs::write(path, body).map_err(|e| format!("writing {}: {e}", path.display()))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::report::{LatencyJson, RunJson, StepJson};
    use std::collections::HashMap;

    fn lat(p99_us: u64) -> LatencyJson {
        LatencyJson {
            count: 100,
            p50_us: p99_us / 2,
            p90_us: p99_us * 9 / 10,
            p99_us,
            p999_us: p99_us * 2,
            max_us: p99_us * 3,
        }
    }

    fn step(label: &str, workers: usize, ops: f64, p99_us: u64) -> StepJson {
        StepJson {
            label: label.into(),
            workers,
            measured_secs: 10.0,
            throughput_ops_s: ops,
            successes: (ops * 10.0) as u64,
            saturated: 0,
            deduplicated: 0,
            errors: HashMap::new(),
            invalid: false,
            latency: HashMap::from([("post".to_string(), lat(p99_us))]),
        }
    }

    fn run(scenario: &str, backend: &str, steps: Vec<StepJson>) -> RunJson {
        RunJson {
            scenario: scenario.into(),
            backend: backend.into(),
            git_sha: "abc1234".into(),
            started_at: chrono::Utc::now(),
            config: serde_json::json!({}),
            steps,
        }
    }

    #[test]
    fn peak_throughput_is_max_over_steps_tagged_by_backend() {
        let runs = vec![
            run(
                "post-one-book",
                "sqlite",
                vec![step("c1", 1, 300.0, 3000), step("c8", 8, 500.0, 9000)],
            ),
            run(
                "post-one-book",
                "postgres",
                vec![step("c8", 8, 800.0, 7000)],
            ),
        ];
        let s = summarize_runs(&runs, 8).unwrap();
        assert_eq!(
            s.bigger[0],
            Metric {
                name: "post-one-book/sqlite/peak-throughput".into(),
                unit: "ops/s".into(),
                value: 500.0,
            }
        );
        assert_eq!(s.bigger[1].name, "post-one-book/postgres/peak-throughput");
        assert_eq!(s.bigger[1].value, 800.0);
    }

    #[test]
    fn invalid_steps_are_excluded_from_peak() {
        let mut bad = step("c8", 8, 9999.0, 1000);
        bad.invalid = true;
        let runs = vec![run(
            "post-one-book",
            "sqlite",
            vec![step("c1", 1, 300.0, 3000), bad],
        )];
        let s = summarize_runs(&runs, 1).unwrap();
        assert_eq!(s.bigger[0].value, 300.0);
    }

    #[test]
    fn all_invalid_steps_is_an_error() {
        let mut bad = step("c8", 8, 100.0, 1000);
        bad.invalid = true;
        let err = summarize_runs(&[run("post-one-book", "sqlite", vec![bad])], 8).unwrap_err();
        assert!(err.contains("no valid steps"), "got: {err}");
    }

    #[test]
    fn p99_metrics_come_from_the_rep_workers_step() {
        let runs = vec![run(
            "post-one-book",
            "sqlite",
            vec![step("c1", 1, 300.0, 3000), step("c8", 8, 500.0, 9000)],
        )];
        let s = summarize_runs(&runs, 8).unwrap();
        assert_eq!(s.smaller.len(), 1);
        assert_eq!(
            s.smaller[0],
            Metric {
                name: "post-one-book/sqlite/p99-post@c8".into(),
                unit: "us".into(),
                value: 9000.0,
            }
        );
    }

    #[test]
    fn missing_rep_step_is_an_error() {
        let runs = vec![run("reads", "sqlite", vec![step("c1", 1, 300.0, 3000)])];
        let err = summarize_runs(&runs, 8).unwrap_err();
        assert!(err.contains("workers == 8"), "got: {err}");
    }

    #[test]
    fn overload_emits_error_rate_per_step_and_no_p99() {
        let mut raw = step("raw-503", 1024, 200.0, 50_000);
        raw.successes = 90;
        raw.saturated = 900;
        raw.errors = HashMap::from([("transport".to_string(), 10)]);
        let mut retry = step("retry-to-success", 1024, 180.0, 60_000);
        retry.successes = 1000;
        retry.saturated = 0;
        let runs = vec![run("overload", "postgres", vec![raw, retry])];
        let s = summarize_runs(&runs, 8).unwrap();
        // bigger: just the peak; smaller: one error-rate per step, no p99 entries
        assert_eq!(s.bigger[0].name, "overload/postgres/peak-throughput");
        assert_eq!(s.smaller.len(), 2);
        assert_eq!(s.smaller[0].name, "overload/postgres/error-rate/raw-503");
        assert!((s.smaller[0].value - 10.0 / 1000.0).abs() < 1e-12);
        assert_eq!(
            s.smaller[1],
            Metric {
                name: "overload/postgres/error-rate/retry-to-success".into(),
                unit: "errors/op".into(),
                value: 0.0,
            }
        );
    }

    #[test]
    fn overload_step_with_no_operations_is_an_error() {
        let mut dead = step("raw-503", 1024, 0.0, 0);
        dead.successes = 0;
        dead.latency = HashMap::new();
        let err = summarize_runs(&[run("overload", "sqlite", vec![dead])], 8).unwrap_err();
        assert!(err.contains("no operations"), "got: {err}");
    }

    #[test]
    fn unknown_backend_is_an_error() {
        let runs = vec![run(
            "post-one-book",
            "unknown",
            vec![step("c8", 8, 500.0, 9000)],
        )];
        let err = summarize_runs(&runs, 8).unwrap_err();
        assert!(err.contains("unknown"), "got: {err}");
    }

    #[test]
    fn duplicate_metric_names_are_an_error() {
        // Two reports for the same scenario/backend — e.g. both workflow legs
        // accidentally benched sqlite because of a misconfigured --db-url.
        let runs = vec![
            run("post-one-book", "sqlite", vec![step("c8", 8, 500.0, 9000)]),
            run("post-one-book", "sqlite", vec![step("c8", 8, 510.0, 9100)]),
        ];
        let err = summarize_runs(&runs, 8).unwrap_err();
        assert!(err.contains("duplicate metric"), "got: {err}");
    }

    #[test]
    fn run_summarize_reads_reports_and_writes_action_format() {
        let dir = tempfile::tempdir().unwrap();
        let report = dir.path().join("post-one-book.json");
        std::fs::write(
            &report,
            include_str!("../tests/fixtures/post-one-book.sqlite.json"),
        )
        .unwrap();
        let bigger = dir.path().join("summary-bigger.json");
        let smaller = dir.path().join("summary-smaller.json");

        let (nb, ns) = run_summarize(8, &bigger, &smaller, &[report]).unwrap();
        assert_eq!((nb, ns), (1, 1));

        let b: serde_json::Value =
            serde_json::from_str(&std::fs::read_to_string(&bigger).unwrap()).unwrap();
        assert_eq!(b.as_array().unwrap().len(), 1);
        assert_eq!(b[0]["name"], "post-one-book/sqlite/peak-throughput");
        assert_eq!(b[0]["unit"], "ops/s");
        assert_eq!(b[0]["value"], 503.5);

        let s: serde_json::Value =
            serde_json::from_str(&std::fs::read_to_string(&smaller).unwrap()).unwrap();
        assert_eq!(s.as_array().unwrap().len(), 1);
        assert_eq!(s[0]["name"], "post-one-book/sqlite/p99-post@c8");
        assert_eq!(s[0]["value"], 24800.0);
    }

    #[test]
    fn run_summarize_reports_unreadable_input() {
        let dir = tempfile::tempdir().unwrap();
        let err = run_summarize(
            8,
            &dir.path().join("b.json"),
            &dir.path().join("s.json"),
            &[dir.path().join("missing.json")],
        )
        .unwrap_err();
        assert!(err.contains("missing.json"), "got: {err}");
    }

    #[test]
    fn run_summarize_reports_bad_json() {
        let dir = tempfile::tempdir().unwrap();
        let bad = dir.path().join("bad.json");
        std::fs::write(&bad, b"not json").unwrap();
        let err = run_summarize(
            8,
            &dir.path().join("b.json"),
            &dir.path().join("s.json"),
            &[bad],
        )
        .unwrap_err();
        assert!(err.contains("parsing"), "got: {err}");
    }
}
