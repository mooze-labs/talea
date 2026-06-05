//! Append-log store: one CRC-framed JSON event log per book, a single
//! writer task per book over in-memory state, strict fsync-per-batch.
