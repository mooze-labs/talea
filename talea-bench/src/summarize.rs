//! `summarize` subcommand: extract trend metrics from run-report JSONs into
//! github-action-benchmark's custom-format files.
//!
//! Loud over silent: any condition that would quietly flat-line or mislabel a
//! trend chart (unknown backend, missing representative step, duplicate
//! metric names) is an error, not a warning.

use serde::Serialize;

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
    Ok(summary)
}

fn summarize_run(run: &RunJson, rep_workers: usize, out: &mut Summary) -> Result<(), String> {
    let tag = format!("{}/{}", run.scenario, run.backend);
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
}
