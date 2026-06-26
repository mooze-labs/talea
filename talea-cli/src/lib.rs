//! The `talea` CLI: a thin shim over the [`talea_client`] SDK.
//!
//! The binary lives in `src/main.rs`; the command surface and execution
//! logic live in [`cli`]. `cli::execute` returns each response as JSON so
//! tests can drive commands in-process without spawning a subprocess.

pub mod cli;
