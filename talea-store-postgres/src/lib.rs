use std::collections::HashMap;

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::{PgPool, Postgres, Row, Transaction as DbTx};
use uuid::Uuid;

use talea_core::{events::*, store::*, types::*};

mod helpers;
pub use helpers::book_channel_name;

#[derive(Debug, Clone)]
pub struct PgTaleaStore {
    pool: PgPool,
}

impl PgTaleaStore {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    /// Connect and run migrations.
    pub async fn connect(url: &str) -> Result<Self, StoreError> {
        let pool = sqlx::postgres::PgPoolOptions::new()
            .connect(url)
            .await
            .map_err(io_err)?;
        let store = Self::new(pool);
        store.migrate().await?;
        Ok(store)
    }

    pub async fn migrate(&self) -> Result<(), StoreError> {
        sqlx::migrate!("./migrations")
            .run(&self.pool)
            .await
            .map_err(io_err)
    }
}

// --- shared helpers -----------------------------------------------------

fn io_err(e: impl std::error::Error + Send + Sync + 'static) -> StoreError {
    StoreError::Io(Box::new(e))
}

/// Raw stored balance is debit-positive; the effective balance is
/// normal-side-adjusted (negated for credit-normal accounts).
fn effective(raw: i64, normal_side: &Option<Direction>) -> i64 {
    match normal_side {
        Some(Direction::Credit) => -raw,
        _ => raw,
    }
}

fn posting_delta(p: &Posting) -> i64 {
    match p.direction {
        Direction::Debit => p.amount.minor(),
        Direction::Credit => -p.amount.minor(),
    }
}

struct AccountRow {
    asset: AssetId,
    normal_side: Option<Direction>,
    min_balance: Option<i64>,
}

async fn load_account<'e, E>(executor: E, key: &str) -> Result<Option<AccountRow>, StoreError>
where
    E: sqlx::Executor<'e, Database = Postgres>,
{
    let row = sqlx::query("SELECT asset, normal_side, min_balance FROM accounts WHERE key = $1")
        .bind(key)
        .fetch_optional(executor)
        .await
        .map_err(io_err)?;
    Ok(row.map(|r| AccountRow {
        asset: AssetId::new(r.get::<String, _>("asset")),
        normal_side: r
            .get::<Option<String>, _>("normal_side")
            .as_deref()
            .and_then(Direction::from_db),
        min_balance: r.get("min_balance"),
    }))
}

/// One account's folded contribution to a transaction.
struct Pending {
    account: AccountId,
    asset: AssetId,
    normal_side: Option<Direction>,
    min_balance: Option<i64>,
    delta: i64,
}

/// True when a StoreError::Io wraps a sqlx unique-constraint violation.
fn is_unique_violation(e: &StoreError) -> bool {
    let StoreError::Io(inner) = e else {
        return false;
    };
    inner
        .downcast_ref::<sqlx::Error>()
        .and_then(|e| e.as_database_error())
        .map(|d| d.is_unique_violation())
        .unwrap_or(false)
}

/// Load + validate the accounts a transaction touches and fold its postings
/// into one signed delta per account, sorted by account key. Read-only: runs
/// BEFORE the book-counter lock is claimed, keeping validation round trips
/// outside the per-book critical section. One ANY($1) query loads all
/// accounts.
async fn load_pending(
    db: &mut DbTx<'_, Postgres>,
    transaction: &Transaction,
) -> Result<Vec<Pending>, StoreError> {
    let mut keys: Vec<String> = transaction
        .postings
        .iter()
        .map(|p| p.account.to_key())
        .collect();
    keys.sort();
    keys.dedup();

    let rows = sqlx::query(
        "SELECT key, asset, normal_side, min_balance FROM accounts WHERE key = ANY($1)",
    )
    .bind(&keys)
    .fetch_all(&mut **db)
    .await
    .map_err(io_err)?;
    let mut loaded: HashMap<String, AccountRow> = rows
        .into_iter()
        .map(|r| {
            let key: String = r.get("key");
            let row = AccountRow {
                asset: AssetId::new(r.get::<String, _>("asset")),
                normal_side: r
                    .get::<Option<String>, _>("normal_side")
                    .as_deref()
                    .and_then(Direction::from_db),
                min_balance: r.get("min_balance"),
            };
            (key, row)
        })
        .collect();

    let mut pending: HashMap<String, Pending> = HashMap::new();
    for posting in &transaction.postings {
        let key = posting.account.to_key();
        if !pending.contains_key(&key) {
            let row = loaded
                .remove(&key)
                .ok_or_else(|| StoreError::UnknownAccount(posting.account.clone()))?;
            pending.insert(
                key.clone(),
                Pending {
                    account: posting.account.clone(),
                    asset: row.asset,
                    normal_side: row.normal_side,
                    min_balance: row.min_balance,
                    delta: 0,
                },
            );
        }
        let entry = pending.get_mut(&key).unwrap();
        if entry.asset != *posting.amount.asset() {
            return Err(StoreError::AssetMismatch {
                account: posting.account.clone(),
                account_asset: entry.asset.clone(),
                asset: posting.amount.asset().clone(),
            });
        }
        // checked: a silent i64 wrap would corrupt the balance projection
        entry.delta = entry
            .delta
            .checked_add(posting_delta(posting))
            .ok_or_else(|| {
                StoreError::Io(format!("posting delta overflow for account {key}").into())
            })?;
    }
    // Sorted key order is best-effort defense-in-depth: a single multi-row
    // upsert's lock order is plan-dependent, but balance-row deadlocks are
    // already structurally prevented — same-book writers serialize on the
    // books counter row before touching balances, and cross-book writers
    // touch disjoint account_key sets.
    let mut out: Vec<Pending> = pending.into_values().collect();
    out.sort_by_key(|p| p.account.to_key());
    Ok(out)
}

/// Write phase: claim the per-book seq + commit timestamp from the DB clock,
/// apply balances (one UNNEST upsert), then the transaction row, postings
/// (one UNNEST insert), the event row, and the notify. Every statement here
/// runs while the book-counter lock is held. Runs entirely inside the
/// caller's transaction or savepoint.
async fn write_transaction(
    db: &mut DbTx<'_, Postgres>,
    transaction: &Transaction,
    pending: &[Pending],
) -> Result<Committed, StoreError> {
    // Each draft in a batch claims its own (seq, at) pair under the counter
    // lock inside its savepoint; the DB-clock monotonicity invariant therefore
    // extends to group commits automatically — no per-instance clock needed.
    let (seq, at) = next_seq(db, &transaction.book.0).await?;

    let b_keys: Vec<String> = pending.iter().map(|p| p.account.to_key()).collect();
    let b_assets: Vec<String> = pending
        .iter()
        .map(|p| p.asset.as_str().to_string())
        .collect();
    let b_deltas: Vec<i64> = pending.iter().map(|p| p.delta).collect();
    // RETURNING rows are matched by key, not position, for robustness
    let rows = sqlx::query(
        "INSERT INTO balances (account_key, asset, balance, updated_seq)
         SELECT t.account_key, t.asset, t.delta, $4
         FROM UNNEST($1::text[], $2::text[], $3::int8[]) AS t(account_key, asset, delta)
         ON CONFLICT (account_key) DO UPDATE
             SET balance = balances.balance + EXCLUDED.balance,
                 updated_seq = EXCLUDED.updated_seq
         RETURNING account_key, balance",
    )
    .bind(&b_keys)
    .bind(&b_assets)
    .bind(&b_deltas)
    .bind(seq)
    .fetch_all(&mut **db)
    .await
    .map_err(io_err)?;
    let new_raw: HashMap<String, i64> = rows
        .into_iter()
        .map(|r| {
            (
                r.get::<String, _>("account_key"),
                r.get::<i64, _>("balance"),
            )
        })
        .collect();
    for p in pending {
        if let Some(min) = p.min_balance {
            let raw = *new_raw.get(&p.account.to_key()).ok_or_else(|| {
                StoreError::Io(
                    format!(
                        "balance upsert returned no row for account {}",
                        p.account.to_key()
                    )
                    .into(),
                )
            })?;
            let would_be = effective(raw, &p.normal_side);
            if would_be < min {
                return Err(StoreError::ConstraintViolation {
                    account: p.account.clone(),
                    min_balance: min,
                    would_be,
                });
            }
        }
    }

    // transaction row; a lost idempotency race surfaces here as a unique
    // violation on (book, idempotency_key) — the caller handles it
    sqlx::query(
        "INSERT INTO transactions
             (tx_id, book, seq, idempotency_key, occurred_at, committed_at, metadata, external_refs)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
    )
    .bind(transaction.id.0)
    .bind(&transaction.book.0)
    .bind(seq)
    .bind(&transaction.idempotency_key.0)
    .bind(transaction.occurred_at)
    .bind(at)
    .bind(&transaction.metadata)
    .bind(serde_json::to_value(&transaction.external_refs).map_err(io_err)?)
    .execute(&mut **db)
    .await
    .map_err(io_err)?;

    // postings projection: one UNNEST insert
    let p_idxs: Vec<i32> = (0..transaction.postings.len() as i32).collect();
    let p_accounts: Vec<String> = transaction
        .postings
        .iter()
        .map(|p| p.account.to_key())
        .collect();
    let p_assets: Vec<String> = transaction
        .postings
        .iter()
        .map(|p| p.amount.asset().as_str().to_string())
        .collect();
    let p_minors: Vec<i64> = transaction
        .postings
        .iter()
        .map(|p| p.amount.minor())
        .collect();
    let p_directions: Vec<String> = transaction
        .postings
        .iter()
        .map(|p| p.direction.as_str().to_string())
        .collect();
    sqlx::query(
        "INSERT INTO postings
             (tx_id, idx, account_key, asset, minor, direction, book, seq, committed_at)
         SELECT $1, t.idx, t.account_key, t.asset, t.minor, t.direction, $2, $3, $4
         FROM UNNEST($5::int4[], $6::text[], $7::text[], $8::int8[], $9::text[])
              AS t(idx, account_key, asset, minor, direction)",
    )
    .bind(transaction.id.0)
    .bind(&transaction.book.0)
    .bind(seq)
    .bind(at)
    .bind(&p_idxs)
    .bind(&p_accounts)
    .bind(&p_assets)
    .bind(&p_minors)
    .bind(&p_directions)
    .execute(&mut **db)
    .await
    .map_err(io_err)?;

    insert_event(
        db,
        &transaction.book.0,
        seq,
        at,
        &LedgerEvent::TransactionPosted(transaction.clone()),
    )
    .await?;
    notify(db, &transaction.book, seq).await?;
    Ok(Committed {
        txid: transaction.id.clone(),
        seq,
        at,
    })
}

/// Idempotency check -> validate -> write: the shared body of commit() and
/// the batch path. Assumes the reserved-book check already ran.
async fn commit_draft(
    db: &mut DbTx<'_, Postgres>,
    transaction: &Transaction,
) -> Result<Committed, StoreError> {
    if let Some(prior) = find_committed(db, &transaction.book, &transaction.idempotency_key).await?
    {
        return Ok(prior);
    }
    let pending = load_pending(db, transaction).await?;
    write_transaction(db, transaction, &pending).await
}

/// One draft inside a shared batch transaction. SAVEPOINT scoping makes a
/// failed draft roll back alone — including its claimed seq, so a later
/// draft in the same batch reclaims the freed number and the per-book
/// sequence stays gapless. Savepoint names come from the loop index, never
/// from user input.
async fn commit_in_savepoint(
    db: &mut DbTx<'_, Postgres>,
    i: usize,
    transaction: &Transaction,
) -> Result<Committed, StoreError> {
    if transaction.book.is_reserved() {
        // nothing written yet: no savepoint needed
        return Err(StoreError::InvalidBook(transaction.book.clone()));
    }
    // SAFETY: savepoint names are "sp_{i}" where i is a loop index (usize),
    // never derived from user input — no injection risk.
    sqlx::query(sqlx::AssertSqlSafe(format!("SAVEPOINT sp_{i}")))
        .execute(&mut **db)
        .await
        .map_err(io_err)?;
    match commit_draft(db, transaction).await {
        Ok(committed) => {
            sqlx::query(sqlx::AssertSqlSafe(format!("RELEASE SAVEPOINT sp_{i}")))
                .execute(&mut **db)
                .await
                .map_err(io_err)?;
            Ok(committed)
        }
        Err(e) => {
            // Undo just this draft's writes. If the undo itself fails (broken
            // connection, disk full) the whole batch is doomed — surface both
            // errors, the draft error being the root cause.
            let undo: Result<(), sqlx::Error> = async {
                // SAFETY: savepoint names are "sp_{i}" where i is a loop index (usize),
                // never derived from user input — no injection risk.
                sqlx::query(sqlx::AssertSqlSafe(format!("ROLLBACK TO SAVEPOINT sp_{i}")))
                    .execute(&mut **db)
                    .await?;
                // ROLLBACK TO leaves the savepoint defined; RELEASE discards it
                sqlx::query(sqlx::AssertSqlSafe(format!("RELEASE SAVEPOINT sp_{i}")))
                    .execute(&mut **db)
                    .await?;
                Ok(())
            }
            .await;
            if let Err(undo_err) = undo {
                return Err(StoreError::Io(
                    format!("draft failed ({e}); savepoint rollback also failed: {undo_err}")
                        .into(),
                ));
            }
            // A unique violation means another writer owns this idempotency key;
            // under read-committed the re-read can observe the winner's commit
            // after our savepoint rollback. (Mirror note: on SQLite this branch
            // is effectively dead — see the sqlite store.)
            if is_unique_violation(&e)
                && let Some(prior) =
                    find_committed(db, &transaction.book, &transaction.idempotency_key).await?
            {
                return Ok(prior);
            }
            Err(e)
        }
    }
}

/// Claim the next per-book sequence number and the commit timestamp.
///
/// The upsert's row lock on the counter is held until the surrounding
/// transaction commits or rolls back, so concurrent same-book writers
/// serialize here and an aborted commit releases its claimed seq
/// atomically => gapless, dense 1..N per book.
///
/// The timestamp is `clock_timestamp()` evaluated in the RETURNING
/// projection — captured *while holding the counter lock*, on the DB
/// host's clock. Same-book writers serialize on exactly that lock, so
/// `(seq, at)` is jointly monotonic per book no matter how many server
/// instances commit concurrently; instance clock skew is irrelevant.
/// Postgres timestamptz is natively microsecond-precision, so the value
/// round-trips identically through its own read-back (the invariant
/// `commit_is_idempotent` enforces — see `talea_core::store::ledger_now`).
///
/// The first-ever insert for a book has no row to lock; two concurrent
/// first-inserts serialize on the primary-key uniqueness check instead —
/// the loser blocks until the winner COMMITS, then takes the DO UPDATE
/// branch, so its later-evaluated `clock_timestamp()` cannot precede the
/// winner's. Don't refactor the upsert into separate INSERT + UPDATE
/// statements; this serialization is load-bearing for `as_of` correctness.
async fn next_seq(
    db: &mut DbTx<'_, Postgres>,
    book: &str,
) -> Result<(Seq, DateTime<Utc>), StoreError> {
    let row = sqlx::query(
        "INSERT INTO books (book, next_seq) VALUES ($1, 1)
         ON CONFLICT (book) DO UPDATE SET next_seq = books.next_seq + 1
         RETURNING next_seq, clock_timestamp() AS at",
    )
    .bind(book)
    .fetch_one(&mut **db)
    .await
    .map_err(io_err)?;
    Ok((row.get::<i64, _>("next_seq"), row.get("at")))
}

async fn insert_event(
    db: &mut DbTx<'_, Postgres>,
    book: &str,
    seq: Seq,
    at: DateTime<Utc>,
    event: &LedgerEvent,
) -> Result<(), StoreError> {
    let payload = serde_json::to_value(event).map_err(io_err)?;
    sqlx::query("INSERT INTO events (book, seq, at, kind, payload) VALUES ($1, $2, $3, $4, $5)")
        .bind(book)
        .bind(seq)
        .bind(at)
        .bind(event.kind())
        .bind(payload)
        .execute(&mut **db)
        .await
        .map_err(io_err)?;
    Ok(())
}

/// Issued inside the transaction: Postgres delivers it only if the tx commits.
/// The payload is informational; subscribers always read rows from `events`.
async fn notify(db: &mut DbTx<'_, Postgres>, book: &Book, seq: Seq) -> Result<(), StoreError> {
    sqlx::query("SELECT pg_notify($1, $2)")
        .bind(book_channel_name(book))
        .bind(seq.to_string())
        .execute(&mut **db)
        .await
        .map_err(io_err)?;
    Ok(())
}

async fn fetch_events(
    pool: &PgPool,
    book: &Book,
    from: Seq,
    limit: i64,
) -> Result<Vec<Sequenced<LedgerEvent>>, StoreError> {
    let rows = sqlx::query(
        "SELECT seq, at, payload FROM events WHERE book = $1 AND seq >= $2 ORDER BY seq LIMIT $3",
    )
    .bind(&book.0)
    .bind(from)
    .bind(limit)
    .fetch_all(pool)
    .await
    .map_err(io_err)?;
    rows.into_iter()
        .map(|r| {
            let event: LedgerEvent =
                serde_json::from_value(r.get::<serde_json::Value, _>("payload")).map_err(io_err)?;
            Ok(Sequenced {
                seq: r.get("seq"),
                at: r.get("at"),
                event,
            })
        })
        .collect()
}

fn decode_asset(id: AssetId, r: &sqlx::postgres::PgRow) -> AssetDef {
    let class: String = r.get("class");
    AssetDef {
        id,
        class: match class.as_str() {
            "fiat" => AssetClass::Fiat,
            _ => AssetClass::Crypto {
                network: Network::new(r.get::<Option<String>, _>("network").unwrap_or_default()),
                native_id: r.get("native_id"),
            },
        },
        precision: r.get::<i16, _>("precision") as u8,
        name: r.get("name"),
    }
}

async fn find_committed(
    db: &mut DbTx<'_, Postgres>,
    book: &Book,
    idem: &IdempotencyKey,
) -> Result<Option<Committed>, StoreError> {
    let row = sqlx::query(
        "SELECT tx_id, seq, committed_at FROM transactions WHERE book = $1 AND idempotency_key = $2",
    )
    .bind(&book.0)
    .bind(&idem.0)
    .fetch_optional(&mut **db)
    .await
    .map_err(io_err)?;
    Ok(row.map(|r| Committed {
        txid: TxId(r.get::<Uuid, _>("tx_id")),
        seq: r.get("seq"),
        at: r.get("committed_at"),
    }))
}

#[async_trait]
impl Store for PgTaleaStore {
    async fn register_asset(&self, asset: &AssetDef) -> Result<(), StoreError> {
        let mut db = self.pool.begin().await.map_err(io_err)?;

        if let Some(row) = sqlx::query(
            "SELECT class, network, native_id, precision, name FROM assets WHERE id = $1",
        )
        .bind(asset.id.as_str())
        .fetch_optional(&mut *db)
        .await
        .map_err(io_err)?
        {
            let existing = decode_asset(asset.id.clone(), &row);
            return if existing == *asset {
                Ok(())
            } else {
                Err(StoreError::AlreadyExists {
                    what: format!("asset {}", asset.id.as_str()),
                })
            };
        }

        let (class, network, native_id) = match &asset.class {
            AssetClass::Fiat => ("fiat", None, None),
            AssetClass::Crypto { network, native_id } => (
                "crypto",
                Some(network.as_str().to_string()),
                native_id.clone(),
            ),
        };
        sqlx::query(
            "INSERT INTO assets (id, class, network, native_id, precision, name)
             VALUES ($1, $2, $3, $4, $5, $6)",
        )
        .bind(asset.id.as_str())
        .bind(class)
        .bind(network)
        .bind(native_id)
        .bind(asset.precision as i16)
        .bind(&asset.name)
        .execute(&mut *db)
        .await
        .map_err(io_err)?;

        let (seq, at) = next_seq(&mut db, SYSTEM_BOOK).await?;
        insert_event(
            &mut db,
            SYSTEM_BOOK,
            seq,
            at,
            &LedgerEvent::AssetRegistered(asset.clone()),
        )
        .await?;
        notify(&mut db, &system_book(), seq).await?;
        db.commit().await.map_err(io_err)?;
        Ok(())
    }

    async fn open_account(&self, def: &AccountDef, cfg: &AccountCfg) -> Result<(), StoreError> {
        if def.id.book.is_reserved() {
            return Err(StoreError::InvalidBook(def.id.book.clone()));
        }
        let key = def.id.to_key();
        let mut db = self.pool.begin().await.map_err(io_err)?;

        let asset_exists = sqlx::query("SELECT 1 FROM assets WHERE id = $1")
            .bind(def.asset.as_str())
            .fetch_optional(&mut *db)
            .await
            .map_err(io_err)?;
        if asset_exists.is_none() {
            return Err(StoreError::UnknownAsset(def.asset.clone()));
        }

        if let Some(row) =
            sqlx::query("SELECT asset, kind, normal_side, min_balance FROM accounts WHERE key = $1")
                .bind(&key)
                .fetch_optional(&mut *db)
                .await
                .map_err(io_err)?
        {
            let same_def = row.get::<String, _>("asset") == def.asset.as_str()
                && AccountKind::from_db(&row.get::<String, _>("kind")).as_ref() == Some(&def.kind);
            let same_cfg = row
                .get::<Option<String>, _>("normal_side")
                .as_deref()
                .and_then(Direction::from_db)
                == cfg.normal_side
                && row.get::<Option<i64>, _>("min_balance") == cfg.min_balance;
            return if same_def && same_cfg {
                Ok(())
            } else {
                Err(StoreError::AlreadyExists {
                    what: format!("account {key}"),
                })
            };
        }

        sqlx::query(
            "INSERT INTO accounts (key, book, path, asset, kind, normal_side, min_balance)
             VALUES ($1, $2, $3, $4, $5, $6, $7)",
        )
        .bind(&key)
        .bind(&def.id.book.0)
        .bind(&def.id.path)
        .bind(def.asset.as_str())
        .bind(def.kind.as_str())
        .bind(cfg.normal_side.as_ref().map(|d| d.as_str().to_string()))
        .bind(cfg.min_balance)
        .execute(&mut *db)
        .await
        .map_err(io_err)?;

        let (seq, at) = next_seq(&mut db, &def.id.book.0).await?;
        insert_event(
            &mut db,
            &def.id.book.0,
            seq,
            at,
            &LedgerEvent::AccountOpened {
                def: def.clone(),
                cfg: cfg.clone(),
            },
        )
        .await?;
        notify(&mut db, &def.id.book, seq).await?;
        db.commit().await.map_err(io_err)?;
        Ok(())
    }

    async fn commit(&self, transaction: &Transaction) -> Result<Committed, StoreError> {
        if transaction.book.is_reserved() {
            return Err(StoreError::InvalidBook(transaction.book.clone()));
        }
        let mut db = self.pool.begin().await.map_err(io_err)?;
        match commit_draft(&mut db, transaction).await {
            Ok(committed) => {
                db.commit().await.map_err(io_err)?;
                Ok(committed)
            }
            // a lost idempotency race: roll back our attempt, then return
            // the winner's result
            Err(e) if is_unique_violation(&e) => {
                drop(db);
                let mut db = self.pool.begin().await.map_err(io_err)?;
                if let Some(prior) =
                    find_committed(&mut db, &transaction.book, &transaction.idempotency_key).await?
                {
                    return Ok(prior);
                }
                // the winner vanished => it rolled back its own commit;
                // surface the original conflict rather than silently retrying
                Err(e)
            }
            Err(e) => Err(e),
        }
    }

    /// Group commit: the whole batch shares one storage transaction (one
    /// fsync), each draft isolated by a savepoint. Each draft's pg_notify is
    /// queued within its savepoint, so a rolled-back draft (or an aborted
    /// outer commit) never emits a wake-up. See commit_in_savepoint.
    ///
    /// Operational notes: a draft blocked on a foreign row lock (e.g. the
    /// book counter held by another instance) head-of-line-blocks its
    /// batchmates and pins this connection until the lock resolves — no
    /// lock_timeout or idle_in_transaction_session_timeout is set, on the
    /// assumption that drafts commit quickly. If sustained cross-instance
    /// book contention shows up, a lock_timeout on this transaction is the
    /// hardening knob: it would turn an indefinite stall into a bounded
    /// per-draft failure that the savepoint already isolates.
    async fn commit_batch(&self, txs: &[Transaction]) -> Vec<Result<Committed, StoreError>> {
        if txs.is_empty() {
            return Vec::new();
        }
        let mut db = match self.pool.begin().await {
            Ok(db) => db,
            Err(e) => {
                let msg = format!("failed to begin batch transaction: {e}");
                return txs
                    .iter()
                    .map(|_| Err(StoreError::Io(msg.clone().into())))
                    .collect();
            }
        };
        let mut results = Vec::with_capacity(txs.len());
        for (i, tx) in txs.iter().enumerate() {
            results.push(commit_in_savepoint(&mut db, i, tx).await);
        }
        if let Err(e) = db.commit().await {
            // nothing became durable: every recorded success is void
            let msg = format!("batch commit failed: {e}");
            return txs
                .iter()
                .map(|_| Err(StoreError::Io(msg.clone().into())))
                .collect();
        }
        results
    }

    async fn balance(
        &self,
        account: &AccountId,
        as_of: Option<DateTime<Utc>>,
    ) -> Result<BalanceSnapshot, StoreError> {
        let key = account.to_key();
        // Two pool reads without a transaction: safe because account metadata
        // (asset, normal_side) is immutable after open_account and the balance
        // read is a single atomic statement. Revisit if accounts become editable.
        let acct = load_account(&self.pool, &key)
            .await?
            .ok_or_else(|| StoreError::UnknownAccount(account.clone()))?;

        let (raw, updated_seq): (i64, i64) = match as_of {
            // current balance: the projection row (0 if never posted to)
            None => sqlx::query("SELECT balance, updated_seq FROM balances WHERE account_key = $1")
                .bind(&key)
                .fetch_optional(&self.pool)
                .await
                .map_err(io_err)?
                .map(|r| (r.get("balance"), r.get("updated_seq")))
                .unwrap_or((0, 0)),
            // point-in-time: aggregate the postings projection by commit time.
            // SUM(BIGINT) returns NUMERIC in Postgres => cast back to BIGINT.
            Some(t) => {
                let r = sqlx::query(
                    "SELECT COALESCE(SUM(CASE WHEN direction = 'D' THEN minor ELSE -minor END), 0)::BIGINT AS raw,
                            COALESCE(MAX(seq), 0) AS updated_seq
                     FROM postings WHERE account_key = $1 AND committed_at <= $2",
                )
                .bind(&key)
                .bind(t)
                .fetch_one(&self.pool)
                .await
                .map_err(io_err)?;
                (r.get("raw"), r.get("updated_seq"))
            }
        };

        Ok(BalanceSnapshot {
            amount: Amount::new(effective(raw, &acct.normal_side), acct.asset),
            updated_seq,
        })
    }

    async fn asset(&self, id: &AssetId) -> Result<Option<AssetDef>, StoreError> {
        let row = sqlx::query(
            "SELECT class, network, native_id, precision, name FROM assets WHERE id = $1",
        )
        .bind(id.as_str())
        .fetch_optional(&self.pool)
        .await
        .map_err(io_err)?;
        Ok(row.map(|r| decode_asset(id.clone(), &r)))
    }

    async fn account_history(
        &self,
        account: &AccountId,
        after_seq: Option<Seq>,
        limit: usize,
    ) -> Result<Vec<PostingRecord>, StoreError> {
        let key = account.to_key();
        if load_account(&self.pool, &key).await?.is_none() {
            return Err(StoreError::UnknownAccount(account.clone()));
        }
        // limit counts distinct seqs so one transaction's postings are never
        // split across pages (multiple postings to one account share a seq)
        let rows = sqlx::query(
            "SELECT seq, tx_id, asset, minor, direction, committed_at
             FROM postings
             WHERE account_key = $1 AND seq > $2
               AND seq <= (SELECT COALESCE(MAX(seq), 0) FROM (
                     SELECT DISTINCT seq FROM postings
                     WHERE account_key = $1 AND seq > $2
                     ORDER BY seq LIMIT $3) AS s)
             ORDER BY seq, idx",
        )
        .bind(&key)
        .bind(after_seq.unwrap_or(0))
        .bind(limit as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(io_err)?;
        rows.into_iter()
            .map(|r| {
                let direction = Direction::from_db(&r.get::<String, _>("direction"))
                    .ok_or_else(|| StoreError::Io("corrupt direction column".into()))?;
                Ok(PostingRecord {
                    seq: r.get("seq"),
                    txid: TxId(r.get::<Uuid, _>("tx_id")),
                    account: account.clone(),
                    amount: Amount::new(r.get("minor"), AssetId::new(r.get::<String, _>("asset"))),
                    direction,
                    at: r.get("committed_at"),
                })
            })
            .collect()
    }

    async fn transaction(&self, txid: &TxId) -> Result<Option<StoredTransaction>, StoreError> {
        let Some(row) =
            sqlx::query("SELECT book, seq, committed_at FROM transactions WHERE tx_id = $1")
                .bind(txid.0)
                .fetch_optional(&self.pool)
                .await
                .map_err(io_err)?
        else {
            return Ok(None);
        };
        let book: String = row.get("book");
        let seq: Seq = row.get("seq");
        let at: DateTime<Utc> = row.get("committed_at");

        // the log is the truth: the full Transaction lives in the event payload
        let events = fetch_events(&self.pool, &Book(book), seq, 1).await?;
        match events.into_iter().next() {
            Some(Sequenced {
                event: LedgerEvent::TransactionPosted(transaction),
                ..
            }) if transaction.id == *txid => Ok(Some(StoredTransaction {
                transaction,
                seq,
                at,
            })),
            _ => Err(StoreError::Io(
                format!("event log missing transaction_posted for tx {}", txid.0).into(),
            )),
        }
    }

    async fn trial_balance(
        &self,
        book: &Book,
        as_of: Option<DateTime<Utc>>,
    ) -> Result<Vec<TrialBalanceRow>, StoreError> {
        let rows = sqlx::query(
            "SELECT asset,
                    COALESCE(SUM(CASE WHEN direction = 'D' THEN minor ELSE 0 END), 0)::BIGINT AS debits,
                    COALESCE(SUM(CASE WHEN direction = 'C' THEN minor ELSE 0 END), 0)::BIGINT AS credits
             FROM postings
             WHERE book = $1 AND ($2::TIMESTAMPTZ IS NULL OR committed_at <= $2)
             GROUP BY asset ORDER BY asset",
        )
        .bind(&book.0)
        .bind(as_of)
        .fetch_all(&self.pool)
        .await
        .map_err(io_err)?;
        Ok(rows
            .into_iter()
            .map(|r| TrialBalanceRow {
                asset: AssetId::new(r.get::<String, _>("asset")),
                debits: r.get("debits"),
                credits: r.get("credits"),
            })
            .collect())
    }

    async fn read_events(
        &self,
        book: &Book,
        from: Seq,
        limit: usize,
    ) -> Result<Vec<Sequenced<LedgerEvent>>, StoreError> {
        fetch_events(&self.pool, book, from, limit as i64).await
    }

    /// Each active subscription holds one connection from the pool for its
    /// whole lifetime (PgListener parks on it) — size the pool for
    /// `subscribers + workers`, or commits will starve waiting for a
    /// connection that is never returned. A transient DB outage that defeats
    /// PgListener's auto-reconnect ends the stream with an error; callers
    /// resume by re-subscribing from `last_seen + 1`.
    fn subscribe(&self, book: &Book, from: Seq) -> EventStream {
        let pool = self.pool.clone();
        let book = book.clone();
        Box::pin(async_stream::stream! {
            let mut listener = match sqlx::postgres::PgListener::connect_with(&pool).await {
                Ok(l) => l,
                Err(e) => {
                    yield Err(io_err(e));
                    return;
                }
            };
            if let Err(e) = listener.listen(&book_channel_name(&book)).await {
                yield Err(io_err(e));
                return;
            }
            let mut next = from;
            loop {
                // catch up from the log until dry
                loop {
                    let batch = match fetch_events(&pool, &book, next, 256).await {
                        Ok(batch) => batch,
                        Err(e) => {
                            yield Err(e);
                            return;
                        }
                    };
                    if batch.is_empty() {
                        break;
                    }
                    for ev in batch {
                        next = ev.seq + 1;
                        yield Ok(ev);
                    }
                }
                // wait for a write to this book (payload is just a wake-up)
                if let Err(e) = listener.recv().await {
                    yield Err(io_err(e));
                    return;
                }
            }
        })
    }
}
