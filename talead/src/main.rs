use std::path::Path;

use clap::Parser;

use talead::cli::{Cli, Command};
use talead::init::{run_init, EnvOutcome, InitOpts};

#[tokio::main]
async fn main() -> std::process::ExitCode {
    match run().await {
        Ok(()) => std::process::ExitCode::SUCCESS,
        Err(e) => {
            eprintln!("error: {e}");
            std::process::ExitCode::FAILURE
        }
    }
}

async fn run() -> Result<(), Box<dyn std::error::Error>> {
    let cli = Cli::parse();
    match cli.command {
        Command::Init { db_url, seed, env_out, force } => {
            let opts = InitOpts { db_url, seed, env_out, force };
            let report = run_init(&opts).await?;
            match &report.seed {
                Some(s) => println!(
                    "seed: {} assets created, {} already present, {} accounts ensured",
                    s.assets_created, s.assets_existing, s.accounts_ensured
                ),
                None => println!("seed: no seed file found, skipped"),
            }
            match report.env {
                EnvOutcome::Written => println!("wrote {}", opts.env_out.display()),
                EnvOutcome::KeptExisting => println!(
                    "{} exists; left untouched (re-run with --force to overwrite)",
                    opts.env_out.display()
                ),
            }
            println!("ready. next: talead serve");
            Ok(())
        }
        Command::Serve => {
            tracing_subscriber::fmt()
                .with_env_filter(
                    tracing_subscriber::EnvFilter::try_from_default_env()
                        .unwrap_or_else(|_| "info".into()),
                )
                .init();
            let env_path = Path::new(".env");
            let config = talead::serve::load_config(
                env_path.exists().then_some(env_path),
                |k| std::env::var(k).ok(),
            )?;
            talea_server::run::run(config).await
        }
    }
}
