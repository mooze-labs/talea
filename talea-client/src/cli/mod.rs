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
            Ok(Some(
                serde_json::to_value(posted).expect("Posted serializes"),
            ))
        }
        Command::Balance { book, path, as_of } => {
            let as_of = as_of
                .as_deref()
                .map(parse::parse_rfc3339)
                .transpose()
                .map_err(invalid)?;
            let view = client.balance(&book, &path, as_of).await?;
            Ok(Some(
                serde_json::to_value(view).expect("BalanceView serializes"),
            ))
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
            Ok(Some(serde_json::to_value(page).expect("Paged serializes")))
        }
        Command::Tx { tx_id } => {
            let view = client.transaction(&tx_id).await?;
            Ok(Some(
                serde_json::to_value(view).expect("TransactionView serializes"),
            ))
        }
        Command::TrialBalance { book, as_of } => {
            let as_of = as_of
                .as_deref()
                .map(parse::parse_rfc3339)
                .transpose()
                .map_err(invalid)?;
            let tb = client.trial_balance(&book, as_of).await?;
            Ok(Some(
                serde_json::to_value(tb).expect("TrialBalance serializes"),
            ))
        }
        // run() handles Tail before calling execute(); a typed error (not a
        // panic) for library callers that reach this directly
        Command::Tail { .. } => Err(invalid("tail is a streaming command; call run()".into())),
    }
}

/// Full CLI entry: printing + the streaming tail loop.
pub async fn run(cli: Cli) -> ApiResult<()> {
    if let Command::Tail { book, from } = &cli.command {
        let book = book.clone();
        let from = *from;
        let client = build_client(&cli)?;
        let mut stream = client.subscribe(&book, from).await?;
        while let Some(item) = stream.next().await {
            match item {
                Ok(env) => println!(
                    "{}",
                    serde_json::to_string(&env).expect("envelope serializes")
                ),
                Err(e) => eprintln!("{}", serde_json::to_string(&e).expect("error serializes")),
            }
        }
        return Ok(());
    }
    if let Some(value) = execute(cli).await? {
        println!("{}", serde_json::to_string_pretty(&value).expect("json"));
    }
    Ok(())
}
