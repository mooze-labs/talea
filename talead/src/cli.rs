use std::path::PathBuf;

use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(
    name = "talead",
    about = "Talea ledger daemon: first-run setup and serving",
    arg_required_else_help = true
)]
pub struct Cli {
    #[command(subcommand)]
    pub command: Command,
}

#[derive(Subcommand)]
pub enum Command {
    /// First-run setup: migrate the database, generate a token, seed, write .env
    Init {
        /// Database URL (postgres://..., sqlite://..., or log://<dir>)
        #[arg(long, default_value = "sqlite://talea.db")]
        db_url: String,
        /// Seed file (default: talea.seed.toml, used only when present)
        #[arg(long)]
        seed: Option<PathBuf>,
        /// Where to write the env file
        #[arg(long, default_value = ".env")]
        env_out: PathBuf,
        /// Overwrite an existing env file (regenerates the API token)
        #[arg(long)]
        force: bool,
    },
    /// Run the ledger server (loads .env from the working directory if present)
    Serve,
}

#[cfg(test)]
mod tests {
    use super::*;
    use clap::CommandFactory;

    #[test]
    fn cli_is_well_formed() {
        Cli::command().debug_assert();
    }

    #[test]
    fn init_defaults_apply() {
        let cli = Cli::try_parse_from(["talead", "init"]).unwrap();
        let Command::Init {
            db_url,
            seed,
            env_out,
            force,
        } = cli.command
        else {
            panic!("expected init");
        };
        assert_eq!(db_url, "sqlite://talea.db");
        assert!(seed.is_none());
        assert_eq!(env_out, PathBuf::from(".env"));
        assert!(!force);
    }
}
