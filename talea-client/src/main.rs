use clap::Parser;

#[tokio::main]
async fn main() {
    let cli = talea_client::cli::Cli::parse();
    if let Err(e) = talea_client::cli::run(cli).await {
        eprintln!(
            "{}",
            serde_json::to_string(&e).unwrap_or_else(|_| format!("{e:?}"))
        );
        std::process::exit(1);
    }
}
