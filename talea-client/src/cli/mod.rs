//! The `talea` CLI: thin shim over TaleaClient. `execute` returns the
//! response as JSON (None for 204 ops) so tests never need a subprocess;
//! `run` adds printing and the streaming `tail` loop.

pub mod parse;

use std::time::Duration;

use clap::{Parser, Subcommand};
use futures::StreamExt;
use talea_core::api::*;

use crate::{RetryPolicy, TaleaClient};

#[derive(Parser)]
#[command(name = "talea", about = "talea ledger client", version)]
pub struct Cli {
    /// Server base URL
    #[arg(
        long,
        env = "TALEA_URL",
        default_value = "http://127.0.0.1:8080",
        global = true
    )]
    pub url: String,
    /// Bearer token
    #[arg(long, env = "TALEA_TOKEN", global = true)]
    pub token: Option<String>,
    /// Per-request timeout in seconds (not applied to `tail`)
    #[arg(long, default_value_t = 30, global = true)]
    pub timeout_secs: u64,
    #[command(subcommand)]
    pub command: Command,
}

#[derive(Subcommand)]
pub enum Command {
    /// Asset registry operations
    Asset {
        #[command(subcommand)]
        cmd: AssetCmd,
    },
    /// Account operations
    Account {
        #[command(subcommand)]
        cmd: AccountCmd,
    },
    /// Post a balanced transaction
    Post {
        #[arg(long)]
        book: Option<String>,
        /// Idempotency key — REQUIRED (never auto-generated: a generated key
        /// would defeat retry safety)
        #[arg(long)]
        idem: Option<String>,
        /// <account>:<asset>:<minor>, repeatable (parsed from the right;
        /// account paths may contain ':')
        #[arg(long)]
        debit: Vec<String>,
        /// <account>:<asset>:<minor>, repeatable
        #[arg(long)]
        credit: Vec<String>,
        /// RFC3339 business/event time (defaults to now, server-side)
        #[arg(long)]
        occurred_at: Option<String>,
        /// Arbitrary JSON metadata
        #[arg(long)]
        metadata: Option<String>,
        /// Full TransactionDraft JSON from a file, or '-' for stdin;
        /// other flags override the draft's fields
        #[arg(long)]
        draft: Option<String>,
    },
    /// Current or point-in-time balance
    Balance {
        #[arg(long)]
        book: String,
        #[arg(long)]
        path: String,
        #[arg(long)]
        as_of: Option<String>,
    },
    /// Paginated posting history for an account
    History {
        #[arg(long)]
        book: String,
        #[arg(long)]
        path: String,
        #[arg(long)]
        after_seq: Option<i64>,
        #[arg(long, default_value_t = 100)]
        limit: u32,
    },
    /// Fetch a committed transaction by id
    Tx { tx_id: String },
    /// Per-asset debit/credit sums for a book
    TrialBalance {
        #[arg(long)]
        book: String,
        #[arg(long)]
        as_of: Option<String>,
    },
    /// Stream the book's event log as JSON lines (Ctrl-C to stop)
    Tail {
        #[arg(long)]
        book: String,
        /// First seq to deliver (default 1 = from the beginning)
        #[arg(long, default_value_t = 1)]
        from: i64,
    },
    /// Print shell completions to stdout (e.g. `talea completions zsh`)
    Completions { shell: clap_complete::Shell },
    /// Write man pages (talea.1 plus one page per subcommand) to a directory
    Man {
        /// Output directory (created if missing)
        #[arg(long, default_value = ".")]
        out_dir: std::path::PathBuf,
    },
}

/// (file name, roff content) for the command and every visible subcommand,
/// depth-first: talea.1, talea-asset.1, talea-asset-register.1, ...
///
/// Rendering to an in-memory `Vec` cannot fail in practice; an `Err` is
/// surfaced rather than panicking.
fn man_pages(cmd: &clap::Command) -> std::io::Result<Vec<(String, Vec<u8>)>> {
    fn walk(
        cmd: &clap::Command,
        name: String,
        out: &mut Vec<(String, Vec<u8>)>,
    ) -> std::io::Result<()> {
        let mut buf = Vec::new();
        clap_mangen::Man::new(cmd.clone().name(name.clone())).render(&mut buf)?;
        out.push((format!("{name}.1"), buf));
        for sub in cmd.get_subcommands() {
            if sub.is_hide_set() || sub.get_name() == "help" {
                continue;
            }
            walk(sub, format!("{name}-{}", sub.get_name()), out)?;
        }
        Ok(())
    }
    let mut out = Vec::new();
    walk(cmd, cmd.get_name().to_string(), &mut out)?;
    Ok(out)
}

#[derive(Subcommand)]
pub enum AssetCmd {
    /// Register an asset (idempotent on id)
    Register {
        #[arg(long)]
        id: String,
        /// 'fiat' or 'crypto'
        #[arg(long)]
        class: String,
        /// Required for crypto assets
        #[arg(long)]
        network: Option<String>,
        /// Contract address / chain asset id
        #[arg(long)]
        native_id: Option<String>,
        #[arg(long)]
        precision: u8,
        #[arg(long)]
        name: String,
    },
}

#[derive(Subcommand)]
pub enum AccountCmd {
    /// Open an account (idempotent on book+path)
    Open {
        #[arg(long)]
        book: String,
        #[arg(long)]
        path: String,
        #[arg(long)]
        asset: String,
        /// asset|liability|income|expense|equity|clearing
        #[arg(long)]
        kind: String,
        /// debit|credit (omit for clearing accounts)
        #[arg(long)]
        normal_side: Option<String>,
        #[arg(long)]
        min_balance: Option<i64>,
    },
}

fn invalid(reason: String) -> ApiError {
    ApiError::InvalidDraft {
        field: "args".into(),
        reason,
    }
}

/// Serialize a response view for printing. These are plain-data types whose
/// serialization cannot fail in practice; if it ever did, surface a typed
/// error rather than panic.
fn to_json<T: serde::Serialize>(value: &T) -> ApiResult<serde_json::Value> {
    serde_json::to_value(value).map_err(|e| invalid(format!("serializing response: {e}")))
}

fn build_client(cli: &Cli) -> ApiResult<TaleaClient> {
    let mut builder = TaleaClient::builder(&cli.url)
        .timeout(Duration::from_secs(cli.timeout_secs))
        .retry(RetryPolicy::default());
    if let Some(t) = &cli.token {
        builder = builder.bearer_token(t);
    }
    builder.build()
}

fn parse_side(s: &str) -> ApiResult<talea_core::types::Direction> {
    match s {
        "debit" => Ok(talea_core::types::Direction::Debit),
        "credit" => Ok(talea_core::types::Direction::Credit),
        other => Err(invalid(format!(
            "normal side '{other}' (want debit|credit)"
        ))),
    }
}

/// Run one non-streaming command, returning the response as JSON
/// (None for 204 operations). Tests call this directly.
pub async fn execute(cli: Cli) -> ApiResult<Option<serde_json::Value>> {
    let client = build_client(&cli)?;
    match cli.command {
        Command::Asset {
            cmd:
                AssetCmd::Register {
                    id,
                    class,
                    network,
                    native_id,
                    precision,
                    name,
                },
        } => {
            client
                .register_asset(AssetDraft {
                    id,
                    class,
                    network,
                    native_id,
                    precision,
                    name,
                })
                .await?;
            Ok(None)
        }
        Command::Account {
            cmd:
                AccountCmd::Open {
                    book,
                    path,
                    asset,
                    kind,
                    normal_side,
                    min_balance,
                },
        } => {
            let normal_side = normal_side.as_deref().map(parse_side).transpose()?;
            client
                .open_account(AccountDraft {
                    book,
                    path,
                    asset,
                    kind,
                    normal_side,
                    min_balance,
                })
                .await?;
            Ok(None)
        }
        Command::Post {
            book,
            idem,
            debit,
            credit,
            occurred_at,
            metadata,
            draft,
        } => {
            let base = match draft {
                None => None,
                Some(src) => {
                    let raw = if src == "-" {
                        use std::io::Read;
                        let mut buf = String::new();
                        std::io::stdin()
                            .read_to_string(&mut buf)
                            .map_err(|e| invalid(format!("reading stdin: {e}")))?;
                        buf
                    } else {
                        std::fs::read_to_string(&src)
                            .map_err(|e| invalid(format!("reading {src}: {e}")))?
                    };
                    Some(
                        serde_json::from_str(&raw)
                            .map_err(|e| invalid(format!("draft json: {e}")))?,
                    )
                }
            };
            let debits = debit
                .iter()
                .map(|s| parse::parse_posting(s, talea_core::types::Direction::Debit))
                .collect::<Result<Vec<_>, _>>()
                .map_err(invalid)?;
            let credits = credit
                .iter()
                .map(|s| parse::parse_posting(s, talea_core::types::Direction::Credit))
                .collect::<Result<Vec<_>, _>>()
                .map_err(invalid)?;
            let occurred_at = occurred_at
                .as_deref()
                .map(parse::parse_rfc3339)
                .transpose()
                .map_err(invalid)?;
            let metadata = metadata
                .as_deref()
                .map(serde_json::from_str)
                .transpose()
                .map_err(|e| invalid(format!("metadata json: {e}")))?;
            let draft =
                parse::build_draft(base, book, idem, debits, credits, occurred_at, metadata)
                    .map_err(invalid)?;
            let posted = client.post(draft).await?;
            Ok(Some(to_json(&posted)?))
        }
        Command::Balance { book, path, as_of } => {
            let as_of = as_of
                .as_deref()
                .map(parse::parse_rfc3339)
                .transpose()
                .map_err(invalid)?;
            let view = client.balance(&book, &path, as_of).await?;
            Ok(Some(to_json(&view)?))
        }
        Command::History {
            book,
            path,
            after_seq,
            limit,
        } => {
            let page = client
                .account_history(&book, &path, Page { after_seq, limit })
                .await?;
            Ok(Some(to_json(&page)?))
        }
        Command::Tx { tx_id } => {
            let view = client.transaction(&tx_id).await?;
            Ok(Some(to_json(&view)?))
        }
        Command::TrialBalance { book, as_of } => {
            let as_of = as_of
                .as_deref()
                .map(parse::parse_rfc3339)
                .transpose()
                .map_err(invalid)?;
            let tb = client.trial_balance(&book, as_of).await?;
            Ok(Some(to_json(&tb)?))
        }
        // run() handles Tail/Completions/Man before calling execute(); a
        // typed error (not a panic) for library callers that reach these
        // directly
        Command::Tail { .. } => Err(invalid("tail is a streaming command; call run()".into())),
        Command::Completions { .. } | Command::Man { .. } => {
            Err(invalid("local command; call run()".into()))
        }
    }
}

/// Full CLI entry: printing + the streaming tail loop.
pub async fn run(cli: Cli) -> ApiResult<()> {
    match &cli.command {
        Command::Completions { shell } => {
            let mut cmd = <Cli as clap::CommandFactory>::command();
            clap_complete::generate(*shell, &mut cmd, "talea", &mut std::io::stdout());
            return Ok(());
        }
        Command::Man { out_dir } => {
            std::fs::create_dir_all(out_dir)
                .map_err(|e| invalid(format!("creating {}: {e}", out_dir.display())))?;
            let pages = man_pages(&<Cli as clap::CommandFactory>::command())
                .map_err(|e| invalid(format!("rendering man pages: {e}")))?;
            for (name, page) in pages {
                let path = out_dir.join(name);
                std::fs::write(&path, page)
                    .map_err(|e| invalid(format!("writing {}: {e}", path.display())))?;
                println!("{}", path.display());
            }
            return Ok(());
        }
        _ => {}
    }
    if let Command::Tail { book, from } = &cli.command {
        let book = book.clone();
        let from = *from;
        let client = build_client(&cli)?;
        let mut stream = client.subscribe(&book, from).await?;
        while let Some(item) = stream.next().await {
            // Serialization of these envelopes cannot fail in practice; if it
            // ever did, report it on stderr and keep the stream alive.
            match item {
                Ok(env) => match serde_json::to_string(&env) {
                    Ok(line) => println!("{line}"),
                    Err(e) => eprintln!("failed to serialize event envelope: {e}"),
                },
                Err(e) => match serde_json::to_string(&e) {
                    Ok(line) => eprintln!("{line}"),
                    Err(ser) => eprintln!("failed to serialize stream error: {ser}"),
                },
            }
        }
        return Ok(());
    }
    if let Some(value) = execute(cli).await? {
        let pretty = serde_json::to_string_pretty(&value)
            .map_err(|e| invalid(format!("serializing output: {e}")))?;
        println!("{pretty}");
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use clap::CommandFactory;

    #[test]
    fn completions_render_for_zsh() {
        let mut buf = Vec::new();
        let mut cmd = Cli::command();
        clap_complete::generate(clap_complete::Shell::Zsh, &mut cmd, "talea", &mut buf);
        let script = String::from_utf8(buf).unwrap();
        assert!(script.contains("talea"));
        assert!(script.contains("trial-balance"));
    }

    #[test]
    fn man_pages_cover_every_subcommand() {
        let pages = man_pages(&Cli::command()).unwrap();
        let names: Vec<&str> = pages.iter().map(|(n, _)| n.as_str()).collect();
        assert!(names.contains(&"talea.1"), "got {names:?}");
        assert!(names.contains(&"talea-post.1"), "got {names:?}");
        assert!(names.contains(&"talea-asset-register.1"), "got {names:?}");
        assert!(!names.iter().any(|n| n.contains("help")), "got {names:?}");
        for (name, content) in &pages {
            assert!(!content.is_empty(), "{name} rendered empty");
        }
    }
}
