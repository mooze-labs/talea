# talea-store-postgres

Postgres implementation of the `Store` trait from `talea-core`, for the [talea](https://github.com/mooze-labs/talea) ledger.

- **Append-only event log with gapless per-book sequences.** Sequences come from a counter-row lock, which also serializes writers per book — and arbitrates across any number of server instances sharing the database.
- **Projections in the same transaction.** `transactions`, `postings`, and `balances` are written atomically with the event; the full transaction payload is read back from the log itself.
- **Live subscriptions via LISTEN/NOTIFY.** Each subscriber LISTENs on a per-book channel and fetches rows from the events table on wake-up, so delivery is exactly the committed log, in order, resumable from any sequence. Note: each subscriber pins one pool connection — size `TALEA_DB_POOL` for subscribers + workers.
- **Embedded migrations.** `PgTaleaStore::connect(url)` connects and migrates; `new(pool)` + `migrate()` are available separately if you manage the pool yourself.

```rust
use talea_store_postgres::PgTaleaStore;

let store = PgTaleaStore::connect("postgres://talea:talea@localhost:5432/talea").await?;
```

This is the backend to use when subscribers and writers are separate processes (SQLite subscriptions are same-process only).

## Conformance

This crate passes the shared [`talea-store-conformance`](../talea-store-conformance/README.md) suite — the `Store` contract in executable form. The tests need a live database:

```bash
TALEA_TEST_PG_URL=postgres://postgres:dev@localhost:5432 cargo test -p talea_store_postgres
```

Without `TALEA_TEST_PG_URL` the suite skips. See the [workspace README](../README.md) for the full picture.
