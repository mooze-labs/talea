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
        sqlx::migrate!("./migrations").run(&self.pool).await.map_err(io_err)
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

/// Claim the next per-book sequence number. The upsert's row lock on the
/// counter is held until the surrounding transaction commits or rolls back,
/// so concurrent same-book writers serialize here and an aborted commit
/// releases its claimed seq atomically => gapless, dense 1..N per book.
async fn next_seq(db: &mut DbTx<'_, Postgres>, book: &str) -> Result<Seq, StoreError> {
    let row = sqlx::query(
        "INSERT INTO books (book, next_seq) VALUES ($1, 1)
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
            AssetClass::Crypto { network, native_id } => {
                ("crypto", Some(network.as_str().to_string()), native_id.clone())
            }
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

        let seq = next_seq(&mut db, SYSTEM_BOOK).await?;
        let at = Utc::now();
        insert_event(&mut db, SYSTEM_BOOK, seq, at, &LedgerEvent::AssetRegistered(asset.clone())).await?;
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

        if let Some(row) = sqlx::query(
            "SELECT asset, kind, normal_side, min_balance FROM accounts WHERE key = $1",
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
        notify(&mut db, &def.id.book, seq).await?;
        db.commit().await.map_err(io_err)?;
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

        // 2. claim the per-book seq (row-locks the counter => gapless, serialized per book)
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
        //    row-lock acquisition deterministic, preventing lock-order
        //    deadlocks between commits touching overlapping account sets.
        let mut ordered: Vec<_> = pending.iter().collect();
        ordered.sort_by(|a, b| a.0.cmp(b.0));
        for (_, p) in ordered {
            let row = sqlx::query(
                "INSERT INTO balances (account_key, asset, balance, updated_seq)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (account_key) DO UPDATE
                     SET balance = balances.balance + $3, updated_seq = $4
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
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
            )
            .bind(transaction.id.0)
            .bind(idx as i32)
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
        notify(&mut db, &transaction.book, seq).await?;

        db.commit().await.map_err(io_err)?;
        Ok(Committed { txid: transaction.id.clone(), seq, at })
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
            None => sqlx::query(
                "SELECT balance, updated_seq FROM balances WHERE account_key = $1",
            )
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
        let Some(row) = sqlx::query(
            "SELECT book, seq, committed_at FROM transactions WHERE tx_id = $1",
        )
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
            }) if transaction.id == *txid => Ok(Some(StoredTransaction { transaction, seq, at })),
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
