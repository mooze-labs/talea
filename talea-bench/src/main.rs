use std::path::PathBuf;
use std::time::Duration;

use chrono::Utc;
use clap::{Parser, Subcommand};
use talea_bench::Ctx;
use talea_bench::report::{self, RunJson, StepJson};
use talea_bench::scenarios::post_one_book;

#[derive(Parser)]
#[command(name = "talea-bench", about = "Capacity benchmark suite for talea-server")]
struct Cli {
    /// Server base URL (no /v1)
    #[arg(long, env = "TALEA_URL", default_value = "http://127.0.0.1:8080")]
    url: String,
    /// Bearer token; omit only against an open dev-mode server
    #[arg(long, env = "TALEA_TOKEN")]
    token: Option<String>,
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
}

#[tokio::main]
async fn main() {
    let cli = Cli::parse();
    eprintln!("{}\n", report::CAVEATS);
    let started_at = Utc::now();
    let ctx = Ctx {
        url: cli.url,
        token: cli.token,
        run_id: started_at.format("%Y%m%dT%H%M%S").to_string(),
        warmup: Duration::from_secs(cli.warmup_secs),
        duration: Duration::from_secs(cli.duration_secs),
    };

    let (scenario, config, result): (&str, serde_json::Value, Result<Vec<StepJson>, String>) =
        match cli.cmd {
            Cmd::PostOneBook { concurrency, postings_per_tx } => {
                let opts = post_one_book::Opts { concurrencies: concurrency, postings_per_tx };
                let config = run_config(&ctx, &opts);
                ("post-one-book", config, post_one_book::run(&ctx, opts).await)
            }
        };

    finish(&cli.out_dir, scenario, started_at, config, result);
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
    started_at: chrono::DateTime<Utc>,
    config: serde_json::Value,
    result: Result<Vec<StepJson>, String>,
) {
    match result {
        Ok(steps) => {
            println!("\n{}", report::render_table(&steps));
            let run = RunJson {
                scenario: scenario.into(),
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
    use clap::CommandFactory;

    #[test]
    fn cli_parses() {
        Cli::command().debug_assert();
    }
}
