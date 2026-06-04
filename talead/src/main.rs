use clap::Parser;

use talead::cli::{Cli, Command};

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
        Command::Init { .. } => Err("init: not implemented yet".into()),
        Command::Serve => Err("serve: not implemented yet".into()),
    }
}
