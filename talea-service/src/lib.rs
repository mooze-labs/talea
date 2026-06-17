//! Embeddable ledger engine: the in-process `LedgerApi` implementation
//! (`LedgerService`) and its per-book group-commit write router. Depends only
//! on `talea-core` and async-runtime facades — no HTTP, no SQL, no server.

mod service;
mod write_router;

pub use service::LedgerService;
pub use write_router::{SubmitError, WriteConfig, WriteRouter};
