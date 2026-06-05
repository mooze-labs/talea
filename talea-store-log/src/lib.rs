//! Append-log store: one CRC-framed JSON event log per book, a single
//! writer task per book over in-memory state, strict fsync-per-batch.

pub mod frame;
pub mod segment;
pub mod state;
pub mod writer;
pub use frame::WireEvent;
