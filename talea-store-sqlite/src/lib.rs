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
        use sqlx::sqlite::{SqliteConnectOptions, SqliteJournalMode, SqlitePoolOptions};
        use std::str::FromStr;

        let opts = SqliteConnectOptions::from_str(url)
            .map_err(io_err)?
            .create_if_missing(true)
            .journal_mode(SqliteJournalMode::Wal)
            .busy_timeout(std::time::Duration::from_secs(5))
            .foreign_keys(true);
        let pool = SqlitePoolOptions::new().connect_with(opts).await.map_err(io_err)?;
        let store = Self::new(pool);
        store.migrate().await?;
        Ok(store)
    }

    pub async fn migrate(&self) -> Result<(), StoreError> {
        sqlx::migrate!("./migrations").run(&self.pool).await.map_err(io_err)
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
            let class: String = row.get("class");
            let existing = AssetDef {
                id: asset.id.clone(),
                class: match class.as_str() {
                    "fiat" => AssetClass::Fiat,
                    _ => AssetClass::Crypto {
                        network: Network::new(
                            row.get::<Option<String>, _>("network").unwrap_or_default(),
                        ),
                        native_id: row.get("native_id"),
                    },
                },
                precision: row.get::<i64, _>("precision") as u8,
                name: row.get("name"),
            };
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
            AssetClass::Crypto { network, native_id } => {
                ("crypto", Some(network.as_str().to_string()), native_id.clone())
            }
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
        let at = Utc::now();
        insert_event(&mut db, SYSTEM_BOOK, seq, at, &LedgerEvent::AssetRegistered(asset.clone())).await?;
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

        if let Some(row) = sqlx::query(
            "SELECT asset, kind, normal_side, min_balance FROM accounts WHERE key = ?1",
        )
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
        let at = Utc::now();
        insert_event(
            &mut db,
            &def.id.book.0,
            seq,
            at,
            &LedgerEvent::AccountOpened { def: def.clone(), cfg: cfg.clone() },
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

        // 1. idempotency fast path: a duplicate returns the prior result
        if let Some(prior) =
            find_committed(&mut db, &transaction.book, &transaction.idempotency_key).await?
        {
            return Ok(prior);
        }

        // 2. claim the per-book seq (serializes writers on this book => gapless)
        let seq = next_seq(&mut db, &transaction.book.0).await?;
        let at = Utc::now();

        // 3. load + validate accounts, accumulating one raw delta per account
        struct Pending {
            account: AccountId,
            asset: AssetId,
            normal_side: Option<Direction>,
            min_balance: Option<i64>,
            delta: i64,
        }
        let mut pending: HashMap<String, Pending> = HashMap::new();
        for posting in &transaction.postings {
            let key = posting.account.to_key();
            if !pending.contains_key(&key) {
                let row = load_account(&mut *db, &key)
                    .await?
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
            entry.delta = entry.delta.checked_add(posting_delta(posting)).ok_or_else(|| {
                StoreError::Io(format!("posting delta overflow for account {key}").into())
            })?;
        }

        // 4. apply to the balances projection, enforcing min_balance on the
        //    effective (normal-side-adjusted) balance. An Err return drops
        //    `db`, rolling the whole transaction back. Sorted key order keeps
        //    lock acquisition deterministic — required to avoid lock-order
        //    deadlocks on backends with row-level locking (Postgres mirror).
        let mut ordered: Vec<_> = pending.iter().collect();
        ordered.sort_by(|a, b| a.0.cmp(b.0));
        for (_, p) in ordered {
            let row = sqlx::query(
                "INSERT INTO balances (account_key, asset, balance, updated_seq)
                 VALUES (?1, ?2, ?3, ?4)
                 ON CONFLICT (account_key) DO UPDATE
                     SET balance = balances.balance + ?3, updated_seq = ?4
                 RETURNING balance",
            )
            .bind(p.account.to_key())
            .bind(p.asset.as_str())
            .bind(p.delta)
            .bind(seq)
            .fetch_one(&mut *db)
            .await
            .map_err(io_err)?;
            let new_raw: i64 = row.get("balance");
            if let Some(min) = p.min_balance {
                let would_be = effective(new_raw, &p.normal_side);
                if would_be < min {
                    return Err(StoreError::ConstraintViolation {
                        account: p.account.clone(),
                        min_balance: min,
                        would_be,
                    });
                }
            }
        }

        // 5. write the transaction row; a lost idempotency race surfaces here
        //    as a unique violation on (book, idempotency_key)
        let insert_tx = sqlx::query(
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
        .execute(&mut *db)
        .await;
        if let Err(e) = insert_tx {
            let unique = e
                .as_database_error()
                .map(|d| d.is_unique_violation())
                .unwrap_or(false);
            if unique {
                drop(db); // roll back our attempt, then return the winner's result
                let mut db = self.pool.begin().await.map_err(io_err)?;
                if let Some(prior) =
                    find_committed(&mut db, &transaction.book, &transaction.idempotency_key).await?
                {
                    return Ok(prior);
                }
                // the winner vanished => it rolled back its own commit;
                // surface the original conflict rather than silently retrying
            }
            return Err(io_err(e));
        }

        // 6. postings projection + the event-log row (the source of truth)
        for (idx, posting) in transaction.postings.iter().enumerate() {
            sqlx::query(
                "INSERT INTO postings
                     (tx_id, idx, account_key, asset, minor, direction, book, seq, committed_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            )
            .bind(transaction.id.0.to_string())
            .bind(idx as i64)
            .bind(posting.account.to_key())
            .bind(posting.amount.asset().as_str())
            .bind(posting.amount.minor())
            .bind(posting.direction.as_str())
            .bind(&transaction.book.0)
            .bind(seq)
            .bind(at)
            .execute(&mut *db)
            .await
            .map_err(io_err)?;
        }
        insert_event(
            &mut db,
            &transaction.book.0,
            seq,
            at,
            &LedgerEvent::TransactionPosted(transaction.clone()),
        )
        .await?;

        db.commit().await.map_err(io_err)?;
        self.publish(transaction.book.clone());
        Ok(Committed { txid: transaction.id.clone(), seq, at })
    }

    async fn balance(
        &self,
        account: &AccountId,
        as_of: Option<DateTime<Utc>>,
    ) -> Result<Amount, StoreError> {
        let key = account.to_key();
        let acct = load_account(&self.pool, &key)
            .await?
            .ok_or_else(|| StoreError::UnknownAccount(account.clone()))?;

        let raw: i64 = match as_of {
            // current balance: the projection row (0 if never posted to)
            None => sqlx::query("SELECT balance FROM balances WHERE account_key = ?1")
                .bind(&key)
                .fetch_optional(&self.pool)
                .await
                .map_err(io_err)?
                .map(|r| r.get("balance"))
                .unwrap_or(0),
            // point-in-time: aggregate the postings projection by commit time
            Some(t) => sqlx::query(
                "SELECT COALESCE(SUM(CASE WHEN direction = 'D' THEN minor ELSE -minor END), 0) AS raw
                 FROM postings WHERE account_key = ?1 AND committed_at <= ?2",
            )
            .bind(&key)
            .bind(t)
            .fetch_one(&self.pool)
            .await
            .map_err(io_err)?
            .get("raw"),
        };

        Ok(Amount::new(effective(raw, &acct.normal_side), acct.asset))
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
        todo!()
    }
}
