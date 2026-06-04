# Talea Store Implementations: Postgres & SQLite

**Date:** 2026-06-04
**Status:** Approved
**Scope:** Implement the `Store` trait (`talea-core/src/store.rs`) in `talea-store-postgres` and `talea-store-sqlite`, plus the `talea-core` changes required to make that possible.

## Goal

Two interchangeable persistence backends for the talea multi-currency ledger:

- **Postgres** — production deployments, cross-process subscriptions via `LISTEN/NOTIFY`.
- **SQLite** — embedded/single-process use, in-memory testing.

Both share the same logical schema, the same commit semantics, and pass the same conformance test suite.

## Architectural decisions (locked)

| Decision | Choice |
|---|---|
| Source of truth | Append-only `events` log + normalized `postings`/`balances` projections written in the same DB transaction |
| `Seq` scope | Per-book, gapless (dense `1..N` per book via a counter row; writers serialize per book, stay concurrent across books) |
| Registry | `Store` trait extended with `register_asset` / `open_account`, both idempotent on id |
| SQLite driver | `sqlx` with the `sqlite` feature (structurally parallel to the Postgres store) |
| Validation in store | DB-state invariants only: account/asset existence, posting asset matches account asset, `min_balance`, idempotency. Shape checks (balanced per asset, positive amounts) remain the server's job |
| `as_of` semantics | Filters on **commit time** (`Committed.at`), monotonic with `seq`. `occurred_at` is client metadata only |
| Migrations | Embedded per crate via `sqlx::migrate!`, run by an explicit async `migrate()` method |
| Testing | Shared conformance suite crate; SQLite runs it in-memory always, Postgres runs when `TALEA_TEST_PG_URL` is set |
| Asset events | Assets are global; `AssetRegistered` events go to a reserved `_system` book. User book names starting with `_` are rejected |
| Balance sign | Stored raw balance = Σdebits − Σcredits. Effective balance (returned by `balance()`, compared against `min_balance`) is normal-side-adjusted: negated for credit-normal accounts; raw for debit-normal and clearing accounts |

## Part 1 — `talea-core` changes

### `Amount` (types/assets.rs)

Fields are private with no constructor or accessors; store crates can neither build nor read one.

```rust
impl Amount {
    pub fn new(minor: i64, asset: AssetId) -> Self;
    pub fn minor(&self) -> i64;
    pub fn asset(&self) -> &AssetId;
}
```

`AssetId` also needs a way to construct from / view as `&str` for DB round-trips (e.g. `AssetId::new(impl Into<String>)`, `as_str()`).

### Serde derives

`Serialize`/`Deserialize` on: `LedgerEvent` (internally tagged: `{"kind": "transaction_posted", ...}`), `Transaction`, `Posting`, `TxId`, `IdempotencyKey`, `AccountId`, `Book`, `AccountDef`, `AccountKind`, `AssetDef`, `AssetId`, `AssetClass`, `Network`, `Amount`. Needed for the JSON `payload` column in `events`.

### `Store` trait additions (store.rs)

```rust
/// Idempotent on id: identical def => Ok(()); different def with same id => AlreadyExists.
async fn register_asset(&self, asset: &AssetDef) -> Result<(), StoreError>;

/// Idempotent on id, same rule as register_asset.
async fn open_account(&self, def: &AccountDef, cfg: &AccountCfg) -> Result<(), StoreError>;
```

`read_events(book, from, limit)`: `from` is **inclusive** (`seq >= from`); consumers resume by passing `last_seen + 1`. Document on the trait.

### `StoreError` additions

```rust
AssetMismatch { account: AccountId, account_asset: AssetId, asset: AssetId },
AlreadyExists { what: String },
InvalidBook(Book),                       // user book starting with '_'
Io(#[source] Box<dyn std::error::Error + Send + Sync>),  // replaces unit Io
```

## Part 2 — Schema (identical logical shape in both stores)

```
assets        (id PK, class, network NULL, native_id NULL, precision, name)
accounts      (key PK,            -- "book:path" via AccountId::to_key()
               book, path, asset FK -> assets, kind,
               normal_side NULL, min_balance NULL)
books         (book PK, next_seq) -- per-book gapless counter
events        (book, seq, at, kind, payload JSON, PK (book, seq))
transactions  (tx_id PK, book, seq, idempotency_key,
               occurred_at, committed_at, metadata JSON, external_refs JSON,
               UNIQUE (book, idempotency_key))
postings      (tx_id FK, idx, account_key FK, asset, minor, direction,
               book, seq, committed_at, PK (tx_id, idx))
balances      (account_key PK, asset, balance, updated_seq)
```

Type mappings: Postgres uses `UUID`, `TIMESTAMPTZ`, `JSONB`, `BIGINT`; SQLite uses `TEXT` (uuid, RFC3339 timestamps), `TEXT` (JSON), `INTEGER`. Index `postings (account_key, committed_at)` for `as_of` aggregation; `postings (account_key, seq)` for history.

The `events` table is the source of truth. `postings` and `balances` are projections maintained transactionally with the log — never independently.

Idempotency keys are scoped per book: `UNIQUE (book, idempotency_key)`.

## Part 3 — Operation semantics

### `commit(transaction)` — one DB transaction

1. **Reject** book names starting with `_` → `InvalidBook`.
2. **Dedup fast path:** select `transactions` by `(book, idempotency_key)`; if found, return the prior `Committed { txid, seq, at }` — success, not an error.
3. **Claim seq:** upsert-increment `books.next_seq` for the book (`INSERT .. ON CONFLICT .. DO UPDATE .. RETURNING`). Locks the counter row → serializes writers per book → gapless.
4. **Load accounts** for all postings (`FOR UPDATE` on Postgres). Missing → `UnknownAccount`; posting asset ≠ account asset → `AssetMismatch`.
5. **Apply deltas** to `balances` (raw, debit-positive). For each account with a `min_balance`, check the normal-side-adjusted effective balance; violation → `ConstraintViolation`, roll back everything.
6. **Insert** `transactions` row, `postings` rows, and one `events` row (`kind = 'transaction_posted'`, payload = serialized `Transaction`). `committed_at` is a single timestamp taken once per commit.
7. **Commit.** If a concurrent duplicate won the race, the unique violation on `(book, idempotency_key)` is caught, the winner's row re-selected, and its `Committed` returned.
8. **Notify:** Postgres — `pg_notify(book_channel_name(book), seq)` issued inside the transaction (delivered on commit). SQLite — send `Sequenced<LedgerEvent>` on the store's `tokio::sync::broadcast` channel after commit returns.

`register_asset` / `open_account` follow the same pattern: idempotent insert, identical-def re-registration is `Ok(())`, conflicting def is `AlreadyExists`; each appends its `LedgerEvent` (`asset_registered` → book `_system`; `account_opened` → the account's book) claiming a seq the same way.

### `balance(account, as_of)`

- `as_of = None`: read the `balances` projection row; missing account → `UnknownAccount` (distinguish from zero-balance by checking `accounts`).
- `as_of = Some(t)`: `SUM` over `postings WHERE account_key = ? AND committed_at <= t` — single aggregate query, no literal event replay.
- Both return the **effective** (normal-side-adjusted) balance as `Amount::new(effective, account_asset)`.

### `read_events(book, from, limit)`

`SELECT .. FROM events WHERE book = ? AND seq >= ? ORDER BY seq LIMIT ?`, deserializing `payload` by `kind`.

### `subscribe(book, from)`

Spawned task driving an `async-stream`/unfold:

1. **Postgres:** `LISTEN` on `book_channel_name(book)` *before* catch-up (nothing missed in the gap); page through `events` from `from`; then wait on notifications, fetching rows `> last_seen` each wake-up. Notifications are wake-ups only — payloads always come from the table. Dedup by last-seen seq.
2. **SQLite:** subscribe to the broadcast channel *before* catch-up; page through `events`; then yield broadcast items filtered by book with `seq > last_seen`. A `Lagged` receiver transparently re-catches-up from the DB.

**Documented limitation:** SQLite subscriptions only observe writes from the same process (no cross-connection notify mechanism).

## Part 4 — Crate setup

### `talea-store-sqlite/Cargo.toml`

```toml
async-trait, chrono, futures, serde_json, uuid,
sqlx = { features = ["sqlite", "chrono", "uuid"] },
tokio = { features = ["sync", "rt"] },
async-stream,
talea_core = { path = "../talea-core/" }
```

Connection setup: WAL mode, `busy_timeout`, `foreign_keys = ON`.

### `talea-store-postgres/Cargo.toml` additions

`serde_json`, `tokio` (`sync`, `rt`), `async-stream`, and the sqlx `chrono`/`uuid`/`json` features.

### Both stores

- `migrations/` directory embedded via `sqlx::migrate!`; exposed as `pub async fn migrate(&self) -> Result<(), StoreError>`.
- Constructor stays sync (`new(pool)`); a convenience `connect(url)` may wrap pool creation + migrate.

## Part 5 — Testing

New non-published workspace member **`talea-store-conformance`** exposing `pub async fn` test functions over `&impl Store`:

- commit happy path; returned seq/at sane
- idempotent dedup (same key → same `Committed`, no double-posting)
- concurrent dedup race (two tasks, same key → one seq)
- `UnknownAccount`, `UnknownAsset`, `AssetMismatch`
- `min_balance` enforcement incl. normal-side adjustment (liability overdraft)
- `balance` current vs `as_of` point-in-time
- per-book gapless seq under concurrent cross-book commits
- `read_events` pagination & inclusivity of `from`
- `subscribe` catch-up then live delivery
- `register_asset`/`open_account` idempotency + conflict
- `_system` book reservation

Each store crate runs the suite as a dev-dependency: SQLite against `sqlite::memory:` always; Postgres against `TALEA_TEST_PG_URL` when set, otherwise tests are skipped (not failed).

## Out of scope

- `LedgerApi` implementation in `talea-server` (separate effort; this design only ensures `Store` can support it).
- Multi-asset balance reporting, trial balance queries (server-level reads composed from `Store` primitives or added later).
- Cross-process SQLite subscriptions.
- Removing `talea-core`'s `axum`/`sqlx`/`tokio` dependencies (noted as future cleanup — core currently depends on server/db crates it arguably shouldn't).
