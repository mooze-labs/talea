//! Append-log store: one CRC-framed JSON event log per book, a single
//! writer task per book over in-memory state, strict fsync-per-batch.

pub mod frame;
pub mod segment;
pub mod state;
pub mod writer;
pub use frame::WireEvent;

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};

use async_trait::async_trait;
use chrono::DateTime;
use chrono::Utc;
use futures::stream::BoxStream;
use tokio::sync::RwLock;

use talea_core::events::LedgerEvent;
use talea_core::store::{
    AccountCfg, BalanceSnapshot, Committed, PostingRecord, Sequenced, Store, StoreError,
    StoredTransaction, TrialBalanceRow, SYSTEM_BOOK,
};
use talea_core::types::{AccountDef, AccountId, Amount, AssetDef, AssetId, Book, Seq, Transaction, TxId};

use crate::segment::SegmentSet;
use crate::state::{BookState, effective};
use crate::writer::{BookWriter, Job};

/// An append-log implementation of [`Store`].
///
/// # Directory structure
///
/// ```text
/// <dir>/
///   LOCK                   ← exclusive advisory lock held for the process lifetime
///   books/
///     _system/             ← system book (assets)
///     <book>/              ← one dir per user book
/// ```
///
/// # Concurrency / single-process invariant
///
/// One `LogTaleaStore` per directory at a time is enforced via an fs4 advisory
/// lock on `<dir>/LOCK`. A second `open` on the same directory from the same
/// or a different process will fail with `StoreError::Io`.
///
/// # Book name safety
///
/// Book names are validated to prevent directory escape: names containing `/`,
/// `\`, or the component `..` are rejected. This validation happens in every
/// path that accepts a book name from external input.
pub struct LogTaleaStore {
    dir: PathBuf,
    registry: Arc<RwLock<HashMap<AssetId, AssetDef>>>,
    books: Arc<RwLock<HashMap<String, BookWriter>>>,
    batch_max: usize,
    /// Held for the process lifetime. `shutdown(&self)` takes the file out so
    /// the advisory lock is released before another `open` on the same dir
    /// (e.g. in the same test process). Drop of the struct releases it otherwise.
    ///
    /// We wrap in `Mutex<Option<_>>` because `shutdown` takes `&self` (not
    /// `self`) — the test drops the store after calling `shutdown`, and the
    /// reopen inside the same scope needs the lock gone first.
    _lock: Mutex<Option<std::fs::File>>,
}

fn io_err(e: impl std::error::Error + Send + Sync + 'static) -> StoreError {
    StoreError::Io(Box::new(e))
}

fn io_str(s: impl Into<String>) -> StoreError {
    StoreError::Io(s.into().into())
}

/// Validate a book name is safe to use as a directory component.
fn validate_book_name(book: &str) -> Result<(), StoreError> {
    if book.contains('/') || book.contains('\\') || book == ".." || book.contains("..") {
        return Err(io_str(format!(
            "invalid book name {book:?}: must not contain '/', '\\', or '..'"
        )));
    }
    Ok(())
}

impl LogTaleaStore {
    /// Open (or create) the store at `dir`.
    ///
    /// 1. Creates `<dir>/books/` if missing.
    /// 2. Acquires an exclusive fs4 advisory lock on `<dir>/LOCK`.
    /// 3. Replays each existing book dir under `<dir>/books/` to rebuild
    ///    in-memory state, then spawns a `BookWriter` per book.
    /// 4. `_system` is treated like any other book for replay; `AssetRegistered`
    ///    events also populate the in-memory asset registry.
    pub async fn open(dir: &Path) -> Result<Self, StoreError> {
        use fs4::fs_std::FileExt;

        // 1. Create dirs.
        tokio::fs::create_dir_all(dir).await.map_err(io_err)?;
        let books_dir = dir.join("books");
        tokio::fs::create_dir_all(&books_dir).await.map_err(io_err)?;

        // 2. Acquire exclusive advisory lock.
        let lock_path = dir.join("LOCK");
        let lock_file = std::fs::OpenOptions::new()
            .create(true)
            .write(true)
            // truncate(false): we only need the fd for locking, not to modify content
            .truncate(false)
            .open(&lock_path)
            .map_err(io_err)?;
        // try_lock_exclusive returns Ok(true) on success, Ok(false) if contended,
        // Err(_) for genuine I/O failure.
        let locked = lock_file.try_lock_exclusive().map_err(io_err)?;
        if !locked {
            return Err(io_str(format!(
                "data dir already locked by another process: {}",
                dir.display()
            )));
        }

        // 3. Replay existing book dirs.
        let mut registry: HashMap<AssetId, AssetDef> = HashMap::new();
        let mut books_map: HashMap<String, BookWriter> = HashMap::new();
        let batch_max = 1024;

        let mut rd = tokio::fs::read_dir(&books_dir).await.map_err(io_err)?;
        while let Some(entry) = rd.next_entry().await.map_err(io_err)? {
            let ft = entry.file_type().await.map_err(io_err)?;
            if !ft.is_dir() {
                continue;
            }
            let name = entry
                .file_name()
                .into_string()
                .map_err(|_| io_str("non-UTF-8 book dir name"))?;

            let book_dir = entry.path();

            // Open the segments for replay (validation + repair happens inside open).
            let seg = SegmentSet::open(&book_dir).await.map_err(io_err)?;

            // Scan all events with their positions.
            let pairs = seg.scan_with_pos(1, usize::MAX).await.map_err(io_err)?;

            // Fold into a fresh BookState.
            let mut st = BookState::default();
            for (wire, pos) in pairs {
                match wire.event {
                    LedgerEvent::TransactionPosted(ref tx) => {
                        st.apply_transaction(tx, wire.seq, wire.at, pos);
                    }
                    LedgerEvent::AccountOpened { ref def, ref cfg } => {
                        st.apply_account_opened(def, cfg, wire.seq, wire.at);
                    }
                    LedgerEvent::AssetRegistered(ref def) => {
                        st.bump_seq(wire.seq, wire.at);
                        // Populate registry regardless of which book the event
                        // lives in (though the writer only appends these to _system).
                        registry.insert(def.id.clone(), def.clone());
                    }
                }
            }

            // Drop the replay SegmentSet — BookWriter::spawn re-opens it for writes.
            drop(seg);

            // Spawn writer over the replayed state.
            let writer = BookWriter::spawn(
                book_dir,
                Arc::new(RwLock::new(st)),
                batch_max,
            )
            .await
            .map_err(io_err)?;

            books_map.insert(name, writer);
        }

        Ok(Self {
            dir: dir.to_path_buf(),
            registry: Arc::new(RwLock::new(registry)),
            books: Arc::new(RwLock::new(books_map)),
            batch_max,
            _lock: Mutex::new(Some(lock_file)),
        })
    }

    /// Get or create the `BookWriter` for `book`.
    ///
    /// # Book name safety
    ///
    /// Book names containing `/`, `\`, or `..` are rejected to prevent a book
    /// named e.g. `../x` from escaping the `<dir>/books/` subtree. The API
    /// layer constrains book names further, but the store provides a last-line
    /// defence here too.
    async fn book_writer(&self, book: &str) -> Result<BookWriter, StoreError> {
        validate_book_name(book)?;

        // Fast path: read lock.
        {
            let guard = self.books.read().await;
            if let Some(w) = guard.get(book) {
                return Ok(w.clone());
            }
        }

        // Slow path: write lock, get-or-create.
        let mut guard = self.books.write().await;
        if let Some(w) = guard.get(book) {
            return Ok(w.clone());
        }

        let book_dir = self.dir.join("books").join(book);
        let state = Arc::new(RwLock::new(BookState::default()));
        let writer = BookWriter::spawn(book_dir, state, self.batch_max)
            .await
            .map_err(io_err)?;
        guard.insert(book.to_string(), writer.clone());
        Ok(writer)
    }

    /// Drain all writers and await their completion.
    ///
    /// Writers finish when their last sender clone is dropped. This method:
    /// 1. Drains the books map (removing the store's writer clones).
    /// 2. For each writer, calls `BookWriter::shutdown(w)` which consumes the
    ///    clone — dropping its `mpsc::Sender` — before awaiting the task. This
    ///    guarantees the task sees sender-count → 0 and exits.
    /// 3. Releases the advisory LOCK file so a subsequent `open` on the same
    ///    directory succeeds in the same process (the test pattern calls
    ///    `shutdown` before dropping and then reopens).
    ///
    /// Note: takes `&self` (not `self`) so it can be called without consuming
    /// the store. The caller is expected to drop the `LogTaleaStore` afterward.
    pub async fn shutdown(&self) {
        // Drain the books map → we now hold the only remaining clones.
        let writers: Vec<BookWriter> = {
            let mut guard = self.books.write().await;
            guard.drain().map(|(_, w)| w).collect()
        };

        // BookWriter::shutdown(w) consumes `w` (dropping its Sender) before
        // awaiting the task handle. Calling `w.join()` instead would keep `w`
        // alive during the await, so the Sender would never be dropped and the
        // task would block forever on `rx.recv()`.
        for w in writers {
            w.shutdown().await;
        }

        // Release the advisory lock so a subsequent `open` on the same dir works.
        let _ = self._lock.lock().unwrap().take();
    }
}

#[async_trait]
impl Store for LogTaleaStore {
    /// Register an asset.
    ///
    /// Idempotent: same def → `Ok(())` with no new event.
    /// Different def for same id → `StoreError::AlreadyExists`.
    ///
    /// # Race note (same-new-asset concurrent register)
    ///
    /// Both concurrent calls for a brand-new asset would each pass the "absent"
    /// check and submit a `Job::RegisterAsset`. To prevent two `AssetRegistered`
    /// frames being appended, we hold the registry WRITE lock across the submit
    /// AND the ack from the writer. Asset registration is rare (a setup-time
    /// operation, not a hot path), so a write-lock held across an await is
    /// acceptable here. Documented explicitly.
    async fn register_asset(&self, asset: &AssetDef) -> Result<(), StoreError> {
        // Hold the write lock for the full operation to serialize concurrent
        // registrations of the same new asset (see race note above).
        let mut reg = self.registry.write().await;

        if let Some(existing) = reg.get(&asset.id) {
            if existing == asset {
                return Ok(()); // same def — idempotent no-op
            }
            return Err(StoreError::AlreadyExists {
                what: format!("asset {}", asset.id.as_str()),
            });
        }

        // Submit to the _system writer.
        let writer = self.book_writer(SYSTEM_BOOK).await?;
        let (reply_tx, reply_rx) = tokio::sync::oneshot::channel();
        writer.submit(Job::RegisterAsset(asset.clone(), reply_tx)).await?;
        reply_rx
            .await
            .map_err(|_| io_str("book writer gone during register_asset"))??;

        // Insert into registry AFTER the ack so a concurrent open sees it
        // only once it is durable.
        reg.insert(asset.id.clone(), asset.clone());
        Ok(())
    }

    /// Open an account.
    ///
    /// Validates that:
    /// - The book is not a reserved name (starts with `_`).
    /// - The asset is registered.
    ///
    /// Idempotent for the same `(def, cfg)` pair; `AlreadyExists` for a
    /// conflicting def/cfg.
    async fn open_account(&self, def: &AccountDef, cfg: &AccountCfg) -> Result<(), StoreError> {
        // Reserved-book guard: the store is responsible for this (the writer
        // does not validate book names for OpenAccount jobs).
        if def.id.book.is_reserved() {
            return Err(StoreError::InvalidBook(def.id.book.clone()));
        }

        // Asset must be registered.
        {
            let reg = self.registry.read().await;
            if !reg.contains_key(&def.asset) {
                return Err(StoreError::UnknownAsset(def.asset.clone()));
            }
        }

        let writer = self.book_writer(&def.id.book.0).await?;
        let (reply_tx, reply_rx) = tokio::sync::oneshot::channel();
        writer.submit(Job::OpenAccount(def.clone(), cfg.clone(), reply_tx)).await?;
        reply_rx
            .await
            .map_err(|_| io_str("book writer gone during open_account"))?
    }

    /// Commit a transaction.
    async fn commit(&self, transaction: &Transaction) -> Result<Committed, StoreError> {
        let writer = self.book_writer(&transaction.book.0).await?;
        writer.commit(transaction.clone()).await
    }

    /// Commit a batch of transactions with group-commit semantics.
    ///
    /// All oneshot reply channels are created and submitted to the writer
    /// before awaiting any reply, so the writer can drain them into a single
    /// fsync batch. Results are positional.
    async fn commit_batch(&self, txs: &[Transaction]) -> Vec<Result<Committed, StoreError>> {
        if txs.is_empty() {
            return vec![];
        }

        // Group by book (in practice all txs are typically the same book,
        // but handle multi-book correctly).
        //
        // For the single-book case: submit ALL jobs first, then collect replies —
        // this is what lets the writer drain them into one fsync batch.
        //
        // For multi-book: we build per-book (channels, txs) then submit all at
        // once before awaiting any. Positional output is reconstructed at the end.

        // Build a vec of (book, tx_index, reply_rx) — all writers acquired before
        // any submits.
        let mut rxs: Vec<tokio::sync::oneshot::Receiver<Result<Committed, StoreError>>> =
            Vec::with_capacity(txs.len());
        // Temporarily hold Err results for txs that fail at writer-acquisition stage.
        let mut errs: HashMap<usize, StoreError> = HashMap::new();

        // Collect writers per book.
        let mut writers_cache: HashMap<String, Result<BookWriter, StoreError>> = HashMap::new();

        struct PendingSubmit {
            book: String,
            tx_idx: usize,
        }
        let mut pending: Vec<PendingSubmit> = Vec::with_capacity(txs.len());

        for (i, tx) in txs.iter().enumerate() {
            let book = tx.book.0.clone();
            if !writers_cache.contains_key(&book) {
                let w = self.book_writer(&book).await;
                writers_cache.insert(book.clone(), w);
            }
            match &writers_cache[&book] {
                Ok(_) => pending.push(PendingSubmit { book, tx_idx: i }),
                Err(_) => {
                    // Placeholder rx slot will be skipped; record error.
                    // We need to keep indices aligned, so push a dummy rx and
                    // record the error separately.
                    errs.insert(i, io_str("failed to get book writer"));
                }
            }
        }

        // Build (tx_idx, rx) pairs: submit all jobs, collect all rxs.
        let mut tx_to_rx_idx: Vec<Option<usize>> = vec![None; txs.len()];
        let mut rx_to_tx_idx: Vec<usize> = Vec::with_capacity(pending.len());

        for ps in &pending {
            let i = ps.tx_idx;
            let writer = match writers_cache[&ps.book].as_ref() {
                Ok(w) => w.clone(),
                Err(_) => continue,
            };
            let (reply_tx, reply_rx) = tokio::sync::oneshot::channel();
            let submit_result = writer.submit(Job::Commit(txs[i].clone(), reply_tx)).await;
            match submit_result {
                Ok(()) => {
                    let rx_idx = rxs.len();
                    rxs.push(reply_rx);
                    tx_to_rx_idx[i] = Some(rx_idx);
                    rx_to_tx_idx.push(i);
                }
                Err(e) => {
                    errs.insert(i, e);
                }
            }
        }

        // Await all replies.
        let mut replies: Vec<Option<Result<Committed, StoreError>>> =
            (0..rxs.len()).map(|_| None).collect();
        for (rx_idx, rx) in rxs.into_iter().enumerate() {
            replies[rx_idx] = Some(
                rx.await
                    .unwrap_or_else(|_| Err(io_str("book writer gone during commit_batch"))),
            );
        }

        // Reconstruct positional output.
        let mut out: Vec<Result<Committed, StoreError>> = (0..txs.len())
            .map(|_| Err(io_str("unreachable: unset commit_batch slot")))
            .collect();

        for i in 0..txs.len() {
            if let Some(e) = errs.remove(&i) {
                out[i] = Err(e);
            } else if let Some(rx_idx) = tx_to_rx_idx[i] {
                out[i] = replies[rx_idx].take().expect("rx result must be set");
            }
        }

        out
    }

    /// Current balance for `account`.
    ///
    /// `as_of: None` returns the current (fully-applied) balance from
    /// in-memory state. `as_of: Some(_)` is not yet implemented (task 7).
    async fn balance(
        &self,
        account: &AccountId,
        as_of: Option<DateTime<Utc>>,
    ) -> Result<BalanceSnapshot, StoreError> {
        if as_of.is_some() {
            todo!("task 7: point-in-time balance replay")
        }

        let writer = self.book_writer(&account.book.0).await?;
        let st = writer.state.read().await;
        let key = account.to_key();
        let acct = st
            .accounts
            .get(&key)
            .ok_or_else(|| StoreError::UnknownAccount(account.clone()))?;
        let eff = effective(acct.raw_balance, &acct.cfg.normal_side);
        Ok(BalanceSnapshot {
            amount: Amount::new(eff, acct.def.asset.clone()),
            updated_seq: acct.updated_seq,
        })
    }

    /// Look up an asset by id.
    async fn asset(&self, id: &AssetId) -> Result<Option<AssetDef>, StoreError> {
        let reg = self.registry.read().await;
        Ok(reg.get(id).cloned())
    }

    #[allow(unused_variables)]
    async fn account_history(
        &self,
        account: &AccountId,
        after_seq: Option<Seq>,
        limit: usize,
    ) -> Result<Vec<PostingRecord>, StoreError> {
        todo!("task 7")
    }

    #[allow(unused_variables)]
    async fn transaction(&self, txid: &TxId) -> Result<Option<StoredTransaction>, StoreError> {
        todo!("task 7")
    }

    #[allow(unused_variables)]
    async fn trial_balance(
        &self,
        book: &Book,
        as_of: Option<DateTime<Utc>>,
    ) -> Result<Vec<TrialBalanceRow>, StoreError> {
        todo!("task 7")
    }

    #[allow(unused_variables)]
    async fn read_events(
        &self,
        book: &Book,
        from: Seq,
        limit: usize,
    ) -> Result<Vec<Sequenced<LedgerEvent>>, StoreError> {
        todo!("task 7/8")
    }

    #[allow(unused_variables)]
    fn subscribe(&self, book: &Book, from: Seq) -> BoxStream<'static, Result<Sequenced<LedgerEvent>, StoreError>> {
        todo!("task 8")
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use talea_core::store::{AccountCfg, Store};
    use talea_core::types::*;

    fn mk_tx(key: &str, minor: i64) -> Transaction {
        Transaction {
            id: TxId(uuid::Uuid::now_v7()),
            book: Book("b".into()),
            postings: vec![
                Posting {
                    account: AccountId { book: Book("b".into()), path: "cash".into() },
                    amount: Amount::new(minor, AssetId::new("USD")),
                    direction: Direction::Debit,
                },
                Posting {
                    account: AccountId { book: Book("b".into()), path: "rev".into() },
                    amount: Amount::new(minor, AssetId::new("USD")),
                    direction: Direction::Credit,
                },
            ],
            idempotency_key: IdempotencyKey(key.into()),
            external_refs: vec![],
            metadata: serde_json::Value::Null,
            occurred_at: chrono::Utc::now(),
        }
    }

    fn usd() -> AssetDef {
        AssetDef { id: AssetId::new("USD"), class: AssetClass::Fiat, precision: 2, name: "Dollar".into() }
    }

    fn cash_def() -> AccountDef {
        AccountDef { id: AccountId { book: Book("b".into()), path: "cash".into() }, asset: AssetId::new("USD"), kind: AccountKind::Asset }
    }

    fn rev_def() -> AccountDef {
        AccountDef { id: AccountId { book: Book("b".into()), path: "rev".into() }, asset: AssetId::new("USD"), kind: AccountKind::Income }
    }

    async fn seeded(dir: &std::path::Path) -> LogTaleaStore {
        let store = LogTaleaStore::open(dir).await.unwrap();
        store.register_asset(&usd()).await.unwrap();
        let cfg = AccountCfg { normal_side: None, min_balance: None };
        store.open_account(&cash_def(), &cfg).await.unwrap();
        store.open_account(&rev_def(), &cfg).await.unwrap();
        store
    }

    #[tokio::test]
    async fn open_recovers_state_by_replay() {
        let dir = tempfile::tempdir().unwrap();
        {
            let store = seeded(dir.path()).await;
            store.commit(&mk_tx("k1", 25)).await.unwrap();
            store.shutdown().await;
        }
        let store = LogTaleaStore::open(dir.path()).await.unwrap();
        let bal = store.balance(&cash_def().id, None).await.unwrap();
        assert_eq!(bal.amount.minor(), 25);
        assert_eq!(bal.updated_seq, 3); // seq 1 = cash open, 2 = rev open, 3 = tx
        assert_eq!(store.asset(&AssetId::new("USD")).await.unwrap(), Some(usd()));
        // idempotency survives restart: replay returns the prior commit
        let replay = store.commit(&mk_tx("k1", 25)).await.unwrap();
        assert_eq!(replay.seq, 3);
        // and balance is unchanged
        assert_eq!(store.balance(&cash_def().id, None).await.unwrap().amount.minor(), 25);
    }

    #[tokio::test]
    async fn second_open_on_same_dir_is_refused() {
        let dir = tempfile::tempdir().unwrap();
        let _first = LogTaleaStore::open(dir.path()).await.unwrap();
        assert!(LogTaleaStore::open(dir.path()).await.is_err());
    }

    #[tokio::test]
    async fn register_asset_idempotent_same_def_conflict_different() {
        let dir = tempfile::tempdir().unwrap();
        let store = LogTaleaStore::open(dir.path()).await.unwrap();
        store.register_asset(&usd()).await.unwrap();
        store.register_asset(&usd()).await.unwrap(); // same def: Ok, no second event
        let mut other = usd();
        other.precision = 8;
        assert!(matches!(
            store.register_asset(&other).await,
            Err(talea_core::store::StoreError::AlreadyExists { .. })
        ));
    }

    #[tokio::test]
    async fn open_account_requires_registered_asset_and_real_book() {
        let dir = tempfile::tempdir().unwrap();
        let store = LogTaleaStore::open(dir.path()).await.unwrap();
        let cfg = AccountCfg { normal_side: None, min_balance: None };
        assert!(matches!(
            store.open_account(&cash_def(), &cfg).await,
            Err(talea_core::store::StoreError::UnknownAsset(_))
        ));
        store.register_asset(&usd()).await.unwrap();
        let mut sys = cash_def();
        sys.id.book = Book("_system".into());
        assert!(matches!(
            store.open_account(&sys, &cfg).await,
            Err(talea_core::store::StoreError::InvalidBook(_))
        ));
    }

    #[tokio::test]
    async fn commit_batch_is_positional_and_isolates_failures() {
        let dir = tempfile::tempdir().unwrap();
        let store = seeded(dir.path()).await;
        let mut bad = mk_tx("bad", 1);
        bad.postings[0].account.path = "ghost".into();
        let txs = vec![mk_tx("a", 1), bad, mk_tx("b", 2)];
        let out = store.commit_batch(&txs).await;
        assert!(out[0].is_ok());
        assert!(matches!(out[1], Err(talea_core::store::StoreError::UnknownAccount(_))));
        assert!(out[2].is_ok());
        assert_eq!(out[0].as_ref().unwrap().seq + 1, out[2].as_ref().unwrap().seq, "gapless across the reject");
    }
}
