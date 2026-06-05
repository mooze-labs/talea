use std::collections::HashMap;
use std::sync::Arc;

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::{Row, Sqlite, SqlitePool, Transaction as DbTx};
use tokio::sync::broadcast;

use talea_core::{events::*, store::*, types::*};

/// Wake-up published on the in-process channel after every committed write.
/// Carries only the book: subscribers always fetch rows from the events table.
#[derive(Debug, Clone)]
struct WakeUp {
    book: Book,
}

#[derive(Debug, Clone)]
pub struct SqliteTaleaStore {
    pool: SqlitePool,
    publisher: broadcast::Sender<Arc<WakeUp>>,
}

impl SqliteTaleaStore {
    pub fn new(pool: SqlitePool) -> Self {
        let (publisher, _) = broadcast::channel(1024);
        Self { pool, publisher }
    }

    /// Open (creating if missing) a SQLite database, apply pragmas, run migrations.
    pub async fn connect(url: &str) -> Result<Self, StoreError> {
        use sqlx::sqlite::{
            SqliteConnectOptions, SqliteJournalMode, SqlitePoolOptions, SqliteSynchronous,
        };
        use std::str::FromStr;

        let opts = SqliteConnectOptions::from_str(url)
            .map_err(io_err)?
            .create_if_missing(true)
            .journal_mode(SqliteJournalMode::Wal)
            // NORMAL is the standard WAL pairing: one fsync less per commit.
            // Durable against process crash; an OS/power crash can lose the
            // most recent commit(s), never corrupt the database.
            .synchronous(SqliteSynchronous::Normal)
            .busy_timeout(std::time::Duration::from_secs(5))
            .foreign_keys(true);
        let pool = SqlitePoolOptions::new()
            .connect_with(opts)
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

    fn publish(&self, book: Book) {
        // a send error just means nobody is subscribed
        let _ = self.publisher.send(Arc::new(WakeUp { book }));
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
    E: sqlx::Executor<'e, Database = Sqlite>,
{
    let row = sqlx::query("SELECT asset, normal_side, min_balance FROM accounts WHERE key = ?1")
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

/// Claim the next per-book sequence number. The upsert's write lock on the
/// counter row is held until the surrounding transaction commits or rolls
/// back, so concurrent same-book writers serialize here and an aborted commit
/// releases its claimed seq atomically => gapless, dense 1..N per book.
async fn next_seq(db: &mut DbTx<'_, Sqlite>, book: &str) -> Result<Seq, StoreError> {
    let row = sqlx::query(
        "INSERT INTO books (book, next_seq) VALUES (?1, 1)
         ON CONFLICT (book) DO UPDATE SET next_seq = books.next_seq + 1
         RETURNING next_seq",
    )
    .bind(book)
    .fetch_one(&mut **db)
    .await
    .map_err(io_err)?;
    Ok(row.get::<i64, _>("next_seq"))
}

async fn insert_event(
    db: &mut DbTx<'_, Sqlite>,
    book: &str,
    seq: Seq,
    at: DateTime<Utc>,
    event: &LedgerEvent,
) -> Result<(), StoreError> {
    let payload = serde_json::to_string(event).map_err(io_err)?;
    sqlx::query("INSERT INTO events (book, seq, at, kind, payload) VALUES (?1, ?2, ?3, ?4, ?5)")
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

async fn fetch_events(
    pool: &SqlitePool,
    book: &Book,
    from: Seq,
    limit: i64,
) -> Result<Vec<Sequenced<LedgerEvent>>, StoreError> {
    let rows = sqlx::query(
        "SELECT seq, at, payload FROM events WHERE book = ?1 AND seq >= ?2 ORDER BY seq LIMIT ?3",
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
                serde_json::from_str(&r.get::<String, _>("payload")).map_err(io_err)?;
            Ok(Sequenced {
                seq: r.get("seq"),
                at: r.get("at"),
                event,
            })
        })
        .collect()
}

fn decode_asset(id: AssetId, r: &sqlx::sqlite::SqliteRow) -> AssetDef {
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
        precision: r.get::<i64, _>("precision") as u8,
        name: r.get("name"),
    }
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
/// outside the per-book critical section. One IN query loads all accounts.
async fn load_pending(
    db: &mut DbTx<'_, Sqlite>,
    transaction: &Transaction,
) -> Result<Vec<Pending>, StoreError> {
    let mut keys: Vec<String> = transaction
        .postings
        .iter()
        .map(|p| p.account.to_key())
        .collect();
    keys.sort();
    keys.dedup();

    let mut qb = sqlx::QueryBuilder::<Sqlite>::new(
        "SELECT key, asset, normal_side, min_balance FROM accounts WHERE key IN (",
    );
    let mut separated = qb.separated(", ");
    for key in &keys {
        separated.push_bind(key);
    }
    separated.push_unseparated(")");
    let rows = qb.build().fetch_all(&mut **db).await.map_err(io_err)?;
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
    // sorted key order keeps row-lock acquisition deterministic on backends
    // with row locking (the Postgres mirror of this code)
    let mut out: Vec<Pending> = pending.into_values().collect();
    out.sort_by_key(|a| a.account.to_key());
    Ok(out)
}

/// Write phase: claim the per-book seq, apply balances (one multi-row
/// upsert), then the transaction row, postings (one multi-row insert), and
/// the event-log row. Every statement here runs while the book-counter lock
/// is held, so this path carries no validation round trips. Runs entirely
/// inside the caller's transaction or savepoint.
///
/// Parameter batching bounds a single transaction at ~3640 postings (9 binds
/// per posting against SQLite's 32766-variable cap); past that the insert
/// fails with a backend error. Real double-entry drafts sit far below this.
async fn write_transaction(
    db: &mut DbTx<'_, Sqlite>,
    transaction: &Transaction,
    pending: &[Pending],
) -> Result<Committed, StoreError> {
    let seq = next_seq(db, &transaction.book.0).await?;
    let at = ledger_now();

    // multi-row balance upsert; RETURNING rows are matched by key, not
    // position (SQLite documents RETURNING order as unspecified)
    let mut qb = sqlx::QueryBuilder::<Sqlite>::new(
        "INSERT INTO balances (account_key, asset, balance, updated_seq) ",
    );
    qb.push_values(pending, |mut b, p| {
        b.push_bind(p.account.to_key())
            .push_bind(p.asset.as_str().to_string())
            .push_bind(p.delta)
            .push_bind(seq);
    });
    qb.push(
        " ON CONFLICT (account_key) DO UPDATE
             SET balance = balances.balance + excluded.balance,
                 updated_seq = excluded.updated_seq
         RETURNING account_key, balance",
    );
    let rows = qb.build().fetch_all(&mut **db).await.map_err(io_err)?;
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
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
    )
    .bind(transaction.id.0.to_string())
    .bind(&transaction.book.0)
    .bind(seq)
    .bind(&transaction.idempotency_key.0)
    .bind(transaction.occurred_at)
    .bind(at)
    .bind(serde_json::to_string(&transaction.metadata).map_err(io_err)?)
    .bind(serde_json::to_string(&transaction.external_refs).map_err(io_err)?)
    .execute(&mut **db)
    .await
    .map_err(io_err)?;

    // postings projection: one multi-row insert
    let mut qb = sqlx::QueryBuilder::<Sqlite>::new(
        "INSERT INTO postings
             (tx_id, idx, account_key, asset, minor, direction, book, seq, committed_at) ",
    );
    qb.push_values(
        transaction.postings.iter().enumerate(),
        |mut b, (idx, posting)| {
            b.push_bind(transaction.id.0.to_string())
                .push_bind(idx as i64)
                .push_bind(posting.account.to_key())
                .push_bind(posting.amount.asset().as_str().to_string())
                .push_bind(posting.amount.minor())
                .push_bind(posting.direction.as_str())
                .push_bind(transaction.book.0.clone())
                .push_bind(seq)
                .push_bind(at);
        },
    );
    qb.build().execute(&mut **db).await.map_err(io_err)?;

    insert_event(
        db,
        &transaction.book.0,
        seq,
        at,
        &LedgerEvent::TransactionPosted(transaction.clone()),
    )
    .await?;
    Ok(Committed {
        txid: transaction.id.clone(),
        seq,
        at,
    })
}

/// Idempotency check -> validate -> write: the shared body of commit() and
/// the batch path. Assumes the reserved-book check already ran.
async fn commit_draft(
    db: &mut DbTx<'_, Sqlite>,
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
    db: &mut DbTx<'_, Sqlite>,
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
            // A unique violation here means another writer owns this idempotency
            // key. On SQLite this branch is effectively dead: the outer tx holds
            // the single write lock, so an external winner cannot have committed
            // mid-batch, and a within-batch duplicate already deduped inside
            // commit_draft. It exists for the Postgres mirror, where read-committed
            // lets this re-read observe a concurrent winner after the rollback.
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

async fn find_committed(
    db: &mut DbTx<'_, Sqlite>,
    book: &Book,
    idem: &IdempotencyKey,
) -> Result<Option<Committed>, StoreError> {
    let row = sqlx::query(
        "SELECT tx_id, seq, committed_at FROM transactions WHERE book = ?1 AND idempotency_key = ?2",
    )
    .bind(&book.0)
    .bind(&idem.0)
    .fetch_optional(&mut **db)
    .await
    .map_err(io_err)?;
    row.map(|r| {
        let txid = uuid::Uuid::parse_str(&r.get::<String, _>("tx_id")).map_err(io_err)?;
        Ok(Committed {
            txid: TxId(txid),
            seq: r.get("seq"),
            at: r.get("committed_at"),
        })
    })
    .transpose()
}

#[async_trait]
impl Store for SqliteTaleaStore {
    async fn register_asset(&self, asset: &AssetDef) -> Result<(), StoreError> {
        let mut db = self.pool.begin().await.map_err(io_err)?;

        if let Some(row) = sqlx::query(
            "SELECT class, network, native_id, precision, name FROM assets WHERE id = ?1",
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
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        )
        .bind(asset.id.as_str())
        .bind(class)
        .bind(network)
        .bind(native_id)
        .bind(asset.precision as i64)
        .bind(&asset.name)
        .execute(&mut *db)
        .await
        .map_err(io_err)?;

        let seq = next_seq(&mut db, SYSTEM_BOOK).await?;
        let at = ledger_now();
        insert_event(
            &mut db,
            SYSTEM_BOOK,
            seq,
            at,
            &LedgerEvent::AssetRegistered(asset.clone()),
        )
        .await?;
        db.commit().await.map_err(io_err)?;
        self.publish(system_book());
        Ok(())
    }

    async fn open_account(&self, def: &AccountDef, cfg: &AccountCfg) -> Result<(), StoreError> {
        if def.id.book.is_reserved() {
            return Err(StoreError::InvalidBook(def.id.book.clone()));
        }
        let key = def.id.to_key();
        let mut db = self.pool.begin().await.map_err(io_err)?;

        let asset_exists = sqlx::query("SELECT 1 FROM assets WHERE id = ?1")
            .bind(def.asset.as_str())
            .fetch_optional(&mut *db)
            .await
            .map_err(io_err)?;
        if asset_exists.is_none() {
            return Err(StoreError::UnknownAsset(def.asset.clone()));
        }

        if let Some(row) =
            sqlx::query("SELECT asset, kind, normal_side, min_balance FROM accounts WHERE key = ?1")
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
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
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

        let seq = next_seq(&mut db, &def.id.book.0).await?;
        let at = ledger_now();
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
        db.commit().await.map_err(io_err)?;
        self.publish(def.id.book.clone());
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
                self.publish(transaction.book.clone());
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
    /// fsync), each draft isolated by a savepoint. See commit_in_savepoint.
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
        // one wake-up per distinct book with at least one committed draft
        let mut published: Vec<&str> = Vec::new();
        for (tx, result) in txs.iter().zip(&results) {
            if result.is_ok() && !published.contains(&tx.book.0.as_str()) {
                published.push(&tx.book.0);
                self.publish(tx.book.clone());
            }
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
            None => sqlx::query("SELECT balance, updated_seq FROM balances WHERE account_key = ?1")
                .bind(&key)
                .fetch_optional(&self.pool)
                .await
                .map_err(io_err)?
                .map(|r| (r.get("balance"), r.get("updated_seq")))
                .unwrap_or((0, 0)),
            // point-in-time: aggregate the postings projection by commit time
            Some(t) => {
                let r = sqlx::query(
                    "SELECT COALESCE(SUM(CASE WHEN direction = 'D' THEN minor ELSE -minor END), 0) AS raw,
                            COALESCE(MAX(seq), 0) AS updated_seq
                     FROM postings WHERE account_key = ?1 AND committed_at <= ?2",
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
            "SELECT class, network, native_id, precision, name FROM assets WHERE id = ?1",
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
             WHERE account_key = ?1 AND seq > ?2
               AND seq <= (SELECT COALESCE(MAX(seq), 0) FROM (
                     SELECT DISTINCT seq FROM postings
                     WHERE account_key = ?1 AND seq > ?2
                     ORDER BY seq LIMIT ?3) AS s)
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
                let txid = uuid::Uuid::parse_str(&r.get::<String, _>("tx_id")).map_err(io_err)?;
                let direction = Direction::from_db(&r.get::<String, _>("direction"))
                    .ok_or_else(|| StoreError::Io("corrupt direction column".into()))?;
                Ok(PostingRecord {
                    seq: r.get("seq"),
                    txid: TxId(txid),
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
            sqlx::query("SELECT book, seq, committed_at FROM transactions WHERE tx_id = ?1")
                .bind(txid.0.to_string())
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
                    COALESCE(SUM(CASE WHEN direction = 'D' THEN minor ELSE 0 END), 0) AS debits,
                    COALESCE(SUM(CASE WHEN direction = 'C' THEN minor ELSE 0 END), 0) AS credits
             FROM postings
             WHERE book = ?1 AND (?2 IS NULL OR committed_at <= ?2)
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

    fn subscribe(&self, book: &Book, from: Seq) -> EventStream {
        let pool = self.pool.clone();
        let book = book.clone();
        let mut wakeups = self.publisher.subscribe();
        Box::pin(async_stream::stream! {
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
                // wait for a write to this book
                loop {
                    match wakeups.recv().await {
                        Ok(w) if w.book == book => break,
                        Ok(_) => continue,
                        // we fell behind on wake-ups; the log has everything
                        Err(broadcast::error::RecvError::Lagged(_)) => break,
                        // store dropped: no more writes can happen
                        Err(broadcast::error::RecvError::Closed) => return,
                    }
                }
            }
        })
    }
}
