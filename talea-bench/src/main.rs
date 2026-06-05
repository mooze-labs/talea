use std::path::PathBuf;
use std::time::Duration;

use chrono::Utc;
use clap::{Parser, Subcommand};
use talea_bench::Ctx;
use talea_bench::progress::Progress;
use talea_bench::report::{self, RunJson, StepJson};
use talea_bench::scenarios::{mixed, overload, post_many_books, post_one_book, reads};
use talea_bench::workload::MixWeights;

#[derive(Parser)]
#[command(
    name = "talea-bench",
    about = "Capacity benchmark suite for talea-server"
)]
struct Cli {
    /// Server base URL (no /v1)
    #[arg(long, env = "TALEA_URL", default_value = "http://127.0.0.1:8080")]
    url: String,
    /// Bearer token; omit only against an open dev-mode server
    #[arg(long, env = "TALEA_TOKEN")]
    token: Option<String>,
    /// Directory for JSON result files
    #[arg(long, default_value = "bench-results")]
    out_dir: PathBuf,
    /// Per-step warmup, excluded from stats
    #[arg(long, default_value_t = 5)]
    warmup_secs: u64,
    /// Per-step measure window
    #[arg(long, default_value_t = 30)]
    duration_secs: u64,
    #[command(subcommand)]
    cmd: Cmd,
}

#[derive(Subcommand)]
enum Cmd {
    /// Single-book write ceiling: concurrency sweep against one book
    PostOneBook {
        #[arg(long, value_delimiter = ',', default_value = "1,2,4,8,16,32,64")]
        concurrency: Vec<usize>,
        #[arg(long, default_value_t = 2)]
        postings_per_tx: usize,
    },
    /// Cross-book scaling: fixed per-book concurrency, sweep book count
    PostManyBooks {
        #[arg(long, value_delimiter = ',', default_value = "1,2,4,8,16,32,64,128")]
        books: Vec<usize>,
        #[arg(long, default_value_t = 4)]
        per_book_concurrency: usize,
        #[arg(long, default_value_t = 2)]
        postings_per_tx: usize,
    },
    /// Read QPS (balance/history/trial-balance) against a deep book
    Reads {
        #[arg(long, value_delimiter = ',', default_value = "1,4,16,64")]
        concurrency: Vec<usize>,
        /// Transactions pre-seeded into the read book (idempotent)
        #[arg(long, default_value_t = 20_000)]
        depth: usize,
        #[arg(long, default_value_t = 8)]
        seed_workers: usize,
    },
    /// Exceed admission capacity; verify shedding + retry safety
    Overload {
        /// Several times TALEA_MAX_INFLIGHT (server default 256)
        #[arg(long, default_value_t = 1024)]
        concurrency: usize,
        #[arg(long, default_value_t = 2)]
        postings_per_tx: usize,
    },
    /// Realistic blend with SSE subscribers
    Mixed {
        #[arg(long, value_delimiter = ',', default_value = "8,32,128")]
        concurrency: Vec<usize>,
        #[arg(long, default_value_t = 8)]
        books: usize,
        #[arg(long, default_value_t = 4)]
        sse_subscribers: usize,
        #[arg(long, default_value_t = 60)]
        post_weight: u32,
        #[arg(long, default_value_t = 25)]
        balance_weight: u32,
        #[arg(long, default_value_t = 10)]
        history_weight: u32,
        #[arg(long, default_value_t = 5)]
        trial_weight: u32,
    },
    /// Extract trend metrics from run reports into github-action-benchmark JSON
    Summarize {
        /// Step (by worker count) used for latency percentiles
        #[arg(long, default_value_t = 8)]
        rep_workers: usize,
        /// Output path for customBiggerIsBetter metrics (throughput)
        #[arg(long, default_value = "summary-bigger.json")]
        bigger_out: PathBuf,
        /// Output path for customSmallerIsBetter metrics (latency, error rates)
        #[arg(long, default_value = "summary-smaller.json")]
        smaller_out: PathBuf,
        /// Run-report JSON files; legs from different backends mix freely
        #[arg(required = true)]
        reports: Vec<PathBuf>,
    },
}

#[tokio::main]
async fn main() {
    let cli = Cli::parse();
    // summarize is offline — handle it before anything probes the server.
    let cmd = match cli.cmd {
        Cmd::Summarize {
            rep_workers,
            bigger_out,
            smaller_out,
            reports,
        } => {
            match talea_bench::summarize::run_summarize(
                rep_workers,
                &bigger_out,
                &smaller_out,
                &reports,
            ) {
                Ok((nb, ns)) => {
                    println!(
                        "wrote {nb} metrics to {} and {ns} metrics to {}",
                        bigger_out.display(),
                        smaller_out.display()
                    );
                }
                Err(e) => {
                    eprintln!("SUMMARIZE FAILED: {e}");
                    std::process::exit(1);
                }
            }
            return;
        }
        cmd => cmd,
    };
    let backend = talea_bench::detect_backend(&cli.url).await;
    eprintln!("{}\n", report::caveats(&backend));
    let started_at = Utc::now();
    let ctx = Ctx {
        url: cli.url,
        token: cli.token,
        run_id: started_at.format("%Y%m%dT%H%M%S%.3f").to_string(),
        warmup: Duration::from_secs(cli.warmup_secs),
        duration: Duration::from_secs(cli.duration_secs),
        progress: Progress::auto(),
    };

    let (scenario, config, result): (&str, serde_json::Value, Result<Vec<StepJson>, String>) =
        match cmd {
            Cmd::PostOneBook {
                concurrency,
                postings_per_tx,
            } => {
                let opts = post_one_book::Opts {
                    concurrencies: concurrency,
                    postings_per_tx,
                };
                let config = run_config(&ctx, &opts);
                (
                    "post-one-book",
                    config,
                    post_one_book::run(&ctx, opts).await,
                )
            }
            Cmd::PostManyBooks {
                books,
                per_book_concurrency,
                postings_per_tx,
            } => {
                let opts = post_many_books::Opts {
                    book_counts: books,
                    per_book_concurrency,
                    postings_per_tx,
                };
                let config = run_config(&ctx, &opts);
                (
                    "post-many-books",
                    config,
                    post_many_books::run(&ctx, opts).await,
                )
            }
            Cmd::Reads {
                concurrency,
                depth,
                seed_workers,
            } => {
                let opts = reads::Opts {
                    concurrencies: concurrency,
                    depth,
                    seed_workers,
                };
                let config = run_config(&ctx, &opts);
                ("reads", config, reads::run(&ctx, opts).await)
            }
            Cmd::Overload {
                concurrency,
                postings_per_tx,
            } => {
                let opts = overload::Opts {
                    concurrency,
                    postings_per_tx,
                };
                let config = run_config(&ctx, &opts);
                ("overload", config, overload::run(&ctx, opts).await)
            }
            Cmd::Mixed {
                concurrency,
                books,
                sse_subscribers,
                post_weight,
                balance_weight,
                history_weight,
                trial_weight,
            } => {
                let opts = mixed::Opts {
                    concurrencies: concurrency,
                    books,
                    sse_subscribers,
                    weights: MixWeights {
                        post: post_weight,
                        balance: balance_weight,
                        history: history_weight,
                        trial: trial_weight,
                    },
                };
                let config = run_config(&ctx, &opts);
                ("mixed", config, mixed::run(&ctx, opts).await)
            }
            Cmd::Summarize { .. } => unreachable!("handled above"),
        };

    finish(&cli.out_dir, scenario, &backend, started_at, config, result);
}

fn run_config<T: serde::Serialize>(ctx: &Ctx, opts: &T) -> serde_json::Value {
    serde_json::json!({
        "opts": opts,
        "url": ctx.url,
        "warmup_secs": ctx.warmup.as_secs(),
        "duration_secs": ctx.duration.as_secs(),
    })
}

fn finish(
    out_dir: &std::path::Path,
    scenario: &str,
    backend: &str,
    started_at: chrono::DateTime<Utc>,
    config: serde_json::Value,
    result: Result<Vec<StepJson>, String>,
) {
    match result {
        Ok(steps) => {
            println!("\n{}", report::render_table(&steps));
            let run = RunJson {
                scenario: scenario.into(),
                backend: backend.into(),
                git_sha: report::git_sha(),
                started_at,
                config,
                steps,
            };
            match report::write_json(out_dir, &run) {
                Ok(p) => println!("results written to {}", p.display()),
                Err(e) => {
                    eprintln!("FAILED to write results: {e}");
                    std::process::exit(1);
                }
            }
        }
        Err(e) => {
            eprintln!("SCENARIO FAILED: {e}");
            std::process::exit(1);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use clap::{CommandFactory, Parser};

    #[test]
    fn cli_parses() {
        Cli::command().debug_assert();
    }

    #[test]
    fn summarize_subcommand_parses_with_defaults() {
        let cli = Cli::try_parse_from(["talea-bench", "summarize", "a.json", "b.json"]).unwrap();
        let Cmd::Summarize {
            rep_workers,
            bigger_out,
            smaller_out,
            reports,
        } = cli.cmd
        else {
            panic!("expected summarize");
        };
        assert_eq!(rep_workers, 8);
        assert_eq!(bigger_out, PathBuf::from("summary-bigger.json"));
        assert_eq!(smaller_out, PathBuf::from("summary-smaller.json"));
        assert_eq!(reports.len(), 2);
    }
}
