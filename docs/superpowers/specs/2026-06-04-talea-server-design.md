# talea-server: LedgerApi over Store with REST/SSE transport

**Date:** 2026-06-04
**Status:** Approved
**Scope:** Implement `talea-server` — the `LedgerApi` service over `Arc<dyn Store>` with an axum REST + SSE transport — plus the `talea-core` contract fixes and `Store` trait read extensions it requires.

**Prerequisite state:** Both store backends are complete and conformance-tested (`docs/superpowers/specs/2026-06-04-store-implementations-design.md`); Postgres has passed the suite against a live database.

## Architectural decisions (locked)

| Decision | Choice |
|---|---|
| Read gaps (`account_history`, `transaction`, `trial_balance`) | Extend the `Store` trait with read methods over the existing projections; server stays a thin translation layer |
| Streaming transport | SSE (axum built-in), resume via `?from=` cursor or `Last-Event-ID` header (header wins) |
| Authentication | Static bearer token from `TALEA_API_TOKEN`; unset = open dev mode (logged loudly) |
| Backend selection | Runtime URL scheme on `TALEA_DB_URL`: `postgres://`/`postgresql://` → `PgTaleaStore`, `sqlite://` → `SqliteTaleaStore` |
| Posting addressing | `PostingDraft.account` is a path within the draft's book; transactions cannot touch other books (book isolation is structural) |
| Balance formatting | `BalanceView.balance` is a decimal string formatted with the asset's registered precision (e.g. minor=150000, precision=2 → `"1500.00"`) |

## Part 1 — `talea-core` contract fixes

Five corrections to the `api` module, discovered by designing the server against it:

1. **`LedgerApi::balance`** signature becomes `(book: &str, path: &str, as_of: Option<DateTime<Utc>>)`. Required-`as_of` was an oversight (`Store::balance` and `BalanceView.as_of` are both `Option`); a single joined `account: &str` cannot be parsed back unambiguously because paths contain `:`. **`LedgerApi::account_history`** likewise takes `(book, path, page)`.
2. **`api::EventStream`** becomes `BoxStream<'static, ApiResult<EventEnvelope>>` — consumers need `seq` to resume; bare `LedgerEvent` loses the cursor. `EventEnvelope` already exists.
3. **`TransactionDraft`** gains `occurred_at: Option<DateTime<Utc>>` with `#[serde(default)]`; the server defaults it to now. Without it, clients cannot backdate event time, which `Transaction.occurred_at` exists for.
4. **`ApiError`** gains:
   - `InvalidDraft { field: String, reason: String }` — malformed kind/class strings, crypto asset without network, empty idempotency key, reserved book names (no 400-shaped variant exists today);
   - `NotFound { what: String }` — `transaction(tx_id)` misses;
   - and **`AssetMismatch` is reshaped** to `{ account: String, account_asset: String, asset: String }` — the current `amount: i64` field cannot be filled from `StoreError::AssetMismatch` (which carries the conflicting asset, not an amount), and the conflicting asset is the actionable datum.
5. **`format_minor(minor: i64, precision: u8) -> String`** — a shared decimal formatter in the `api` module (zero-padded fraction, negative-safe: minor=-1500, precision=2 → `"-15.00"`; precision=0 → no decimal point). Used by `BalanceView` now and the client later. Unit-tested in core.

## Part 2 — `Store` trait read extensions

Four additions, each implemented in both stores as plain SQL over the existing `postings`/`transactions`/`events`/`assets` projections, each with a conformance test in `talea-store-conformance`:

```rust
/// Registry read — the server needs precision to format balances.
async fn asset(&self, id: &AssetId) -> Result<Option<AssetDef>, StoreError>;

/// Postings for one account, seq-ascending. `after_seq` is EXCLUSIVE
/// (None = from the beginning); resume by passing the last seen seq.
async fn account_history(
    &self,
    account: &AccountId,
    after_seq: Option<Seq>,
    limit: usize,
) -> Result<Vec<PostingRecord>, StoreError>;

/// Committed transaction by id; Ok(None) if unknown.
async fn transaction(&self, txid: &TxId) -> Result<Option<StoredTransaction>, StoreError>;

/// Per-asset debit/credit sums for a book, optionally as of commit time.
async fn trial_balance(
    &self,
    book: &Book,
    as_of: Option<DateTime<Utc>>,
) -> Result<Vec<TrialBalanceRow>, StoreError>;
```

New types in `talea-core/src/store.rs`:

```rust
pub struct PostingRecord {
    pub seq: Seq,
    pub txid: TxId,
    pub account: AccountId,
    pub amount: Amount,
    pub direction: Direction,
    pub at: DateTime<Utc>,
}

pub struct StoredTransaction {
    pub transaction: Transaction,
    pub seq: Seq,
    pub at: DateTime<Utc>,
}

pub struct TrialBalanceRow {
    pub asset: AssetId,
    pub debits: i64,
    pub credits: i64,
}
```

**Breaking change:** `Store::balance` returns `BalanceSnapshot { amount: Amount, updated_seq: Seq }` — `BalanceView.updated_seq` is unfillable from a bare `Amount`. `updated_seq` is the projection row's value (current path) or `MAX(seq)` of included postings (as_of path); 0 if the account has never been posted to. Both stores and the conformance suite update mechanically.

Implementation notes:
- `transaction(txid)`: read the `transactions` row for `(book, seq, committed_at)`, then deserialize the `TransactionPosted` payload from the `events` row at `(book, seq)` — the log is the truth; no posting-row reassembly. A missing/mismatched event row is corruption → `StoreError::Io`.
- `trial_balance`: `GROUP BY asset` over `postings WHERE book = ? [AND committed_at <= ?]`, summing debit and credit minors separately (Postgres: `::BIGINT` casts on the sums).
- `account_history`: `WHERE account_key = ? AND seq > ? ORDER BY seq LIMIT ?` — uses the existing `postings (account_key, seq)` index.

## Part 3 — `LedgerService` (the `LedgerApi` implementation)

`talea-server/src/service.rs`: `LedgerService { store: Arc<dyn Store> }` — replaces the `LedgerRestApi` stub. Pure translation and validation; no SQL; fully testable without HTTP.

**Draft parsing** (`InvalidDraft` on failure):
- `kind`/`class` strings parse via the existing `AccountKind::from_db` / `"fiat"|"crypto"` mapping; `class == "crypto"` requires `network`.
- Posting `account` strings resolve as `AccountId { book: draft.book, path }` — postings only within the transaction's own book.
- Reserved book names (`_`-prefixed) rejected at the service layer as `InvalidDraft { field: "book" }` before hitting the store.

**Shape validation in `post`** (the store's documented trust boundary):
- postings non-empty;
- every `amount.minor > 0` → `InvalidAmount`;
- balanced per asset: for each asset, Σ(debit minors) == Σ(credit minors) → `Unbalanced { asset, debit, credit }`;
- idempotency key non-empty → `InvalidDraft`.

**`post` semantics:** server generates `TxId` (UUIDv7); `occurred_at` defaults to now; calls `store.commit`. `Posted { deduplicated: committed.txid != generated_id }` — the dedup flag falls out of the idempotency contract (a replay returns the prior transaction's id).

**Error mapping** (`StoreError → ApiError`):

| StoreError | ApiError | Notes |
|---|---|---|
| ConstraintViolation | ConstraintViolation | field-for-field |
| UnknownAccount | UnknownAccount | account key string |
| UnknownAsset | UnknownAsset | |
| AssetMismatch | AssetMismatch | field-for-field after the Part 1 reshape |
| AlreadyExists | AlreadyExists | |
| InvalidBook | InvalidDraft { field: "book" } | defense-in-depth; service normally catches first |
| Io | Internal | detail goes to `tracing::error!` only — never into the response body |

**Reads:** compose the store reads with `format_minor` into the view types (`BalanceView`, `PostingView`, `TransactionView`, `TrialBalance`). `balance` looks up the asset def for precision; a dangling asset reference is corruption → `Internal`. `subscribe` maps `Sequenced<LedgerEvent>` → `EventEnvelope { seq, at, kind: event.kind(), payload: serde_json::to_value(event) }`.

## Part 4 — HTTP layer (axum)

`talea-server/src/http/`: `routes.rs` (router construction), `handlers.rs` (thin parse → service → JSON), `sse.rs`, `auth.rs`, `error.rs`.

```
POST /v1/assets                                                  → 204 (idempotent)
POST /v1/accounts                                                → 204 (idempotent)
POST /v1/transactions                                            → 200 Posted
GET  /v1/books/{book}/accounts/{path}/balance?as_of=             → BalanceView
GET  /v1/books/{book}/accounts/{path}/history?after_seq=&limit=  → Paged<PostingView>
GET  /v1/transactions/{tx_id}                                    → TransactionView | 404
GET  /v1/books/{book}/trial-balance?as_of=                       → TrialBalance
GET  /v1/books/{book}/events?from=                               → SSE stream of EventEnvelope
GET  /health                                                     → 200, unauthenticated
```

- `{path}` is a single path segment; `:` inside it is legal per RFC 3986 and passes through axum unencoded. Paths containing `/` are not supported (consistent with `AccountId::to_key`).
- `history` `limit` defaults to 100, capped at 1000. `Paged.next` = last seq in the page, or `None` when the page came back short.
- **SSE:** each event is `id: <seq>` + `data: <EventEnvelope JSON>`. Resume order: `Last-Event-ID` header (standard EventSource reconnect) wins over `?from=`; both are interpreted as "last seen", so the stream starts at value+1. Keep-alive pings via axum's `KeepAlive`. A store-stream error ends the SSE connection; clients reconnect with their cursor.
- **Auth:** middleware on `/v1/*`. If `TALEA_API_TOKEN` is set, require `Authorization: Bearer <token>` with constant-time comparison, else `401`. Unset = open mode, one loud `tracing::warn!` at startup. `/health` always open.
- **Status mapping:** `InvalidDraft`/`Unbalanced`/`InvalidAmount` → 400; `Unauthorized` → 401; `UnknownAccount`/`UnknownAsset`/`NotFound` → 404; `AlreadyExists`/`ConstraintViolation` → 409; `Internal` → 500. Response bodies are the serialized `ApiError` (already a tagged serde enum: `{"error": "unbalanced", ...}`).

## Part 5 — Binary wiring

`main.rs` + `config.rs`:

- `Config::from_env()`: `TALEA_DB_URL` (required — error out with a clear message), `TALEA_BIND` (default `127.0.0.1:8080`), `TALEA_API_TOKEN` (optional).
- Store selection by URL scheme; both `connect()` constructors already run migrations.
- `tracing-subscriber` (env-filter) init; graceful shutdown on ctrl-c.
- New `talea-server` dependencies: `talea_store_sqlite`, `uuid` (v7), `futures`, `serde_json`, `chrono`, `tracing`, `tracing-subscriber`; dev-deps `tower` (for `ServiceExt::oneshot`), `http-body-util`.

## Part 6 — Testing

- **Core unit tests:** `format_minor` (zero precision, zero-padding, negatives, minor < 10^precision).
- **Conformance additions:** `asset_lookup`, `account_history_pages_exclusively`, `transaction_round_trip` (+ unknown id → None), `trial_balance_sums_per_asset` (+ as_of), `balance_snapshot_updated_seq`. Run by both store crates; Postgres against the live DB.
- **Service-level tests** (in-memory SQLite store): every validation rejection (unbalanced, non-positive amounts, malformed drafts, crypto-without-network, reserved book), dedup flag on replay, error mapping, view formatting.
- **HTTP-level tests** (`tower::ServiceExt::oneshot` against the real router + in-memory store): one happy round-trip per endpoint; 400/401/404/409 paths; auth enabled and disabled; SSE smoke test asserting `id:` fields and at least one catch-up event.

## Out of scope

- `talea-client` implementation (next sub-project; it consumes this API).
- Per-book / multi-tenant authentication and authorization.
- TLS termination (reverse proxy's job), rate limiting.
- Metrics, OpenAPI generation (future).
- `talea-core`'s axum/sqlx/tokio dependency cleanup (noted debt; the api module's axum dependency may shrink naturally once the server owns transport concerns).
