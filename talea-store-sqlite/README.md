# talea-store-sqlite

SQLite implementation of the `Store` trait from `talea-core`, for the [talea](https://github.com/mooze-labs/talea) ledger. Zero external services: the fastest path to a running ledger.

- **Append-only event log with gapless per-book sequences**, same contract as the Postgres backend.
- **Projections in the same transaction.** `transactions`, `postings`, and `balances` are written atomically with the event.
- **WAL mode, foreign keys on, 5s busy timeout** — applied automatically by `SqliteTaleaStore::connect`, which also creates the database file if missing and runs the embedded migrations.
- **In-process subscriptions.** Live event delivery uses a tokio broadcast channel as a wake-up signal; subscribers always fetch rows from the events table, so delivery is exactly the committed log, in order, resumable from any sequence.

```rust
use talea_store_sqlite::SqliteTaleaStore;

let store = SqliteTaleaStore::connect("sqlite://talea.db").await?;
```

**Limit:** subscriptions are same-process only — SQLite has no cross-connection notify. Use [`talea-store-postgres`](../talea-store-postgres/README.md) when subscribers and writers are separate processes. (`:memory:` URLs are rejected by the server: a ledger that vanishes on restart is a footgun.)

## Conformance

This crate passes the shared [`talea-store-conformance`](../talea-store-conformance/README.md) suite — the `Store` contract in executable form — with no setup:

```bash
cargo test -p talea-store-sqlite
```

See the [workspace README](../README.md) for the full picture.
