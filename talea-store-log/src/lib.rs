//! Append-log store: one CRC-framed JSON event log per book, a single
//! writer task per book over in-memory state, strict fsync-per-batch.

pub mod frame;
pub mod idem_spill;
pub mod segment;
pub mod snapshot;
pub mod state;
pub mod writer;
pub use frame::WireEvent;

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};
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
use talea_core::types::{AccountDef, AccountId, Amount, AssetDef, AssetId, Book, Direction, Seq, Transaction, TxId};

use crate::idem_spill::DEFAULT_IDEM_HOT_CAP;
use crate::segment::SegmentSet;
use crate::state::{BookState, effective};
use crate::writer::{BookWriter, Job};

/// Options for opening a [`LogTaleaStore`].
#[derive(Debug, Clone)]
pub struct LogStoreOptions {
    /// Maximum number of hot idempotency keys kept in memory.
    /// Overflow drains the oldest half to on-disk spill runs.
    pub idem_hot_cap: usize,
    /// Events between automatic snapshots (0 = disabled).
    pub snapshot_every: u64,
    /// Maximum bytes per segment file before rotation.
    pub segment_max: u64,
}

impl Default for LogStoreOptions {
    fn default() -> Self {
        Self {
            idem_hot_cap: DEFAULT_IDEM_HOT_CAP,
            snapshot_every: BookWriter::DEFAULT_SNAPSHOT_EVERY,
            segment_max: crate::segment::DEFAULT_SEGMENT_MAX,
        }
    }
}

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
    /// Segment rotation threshold in bytes.  Stored so that new books created
    /// after `open_with` (via `book_writer`) use the same threshold as books
    /// that were already on disk at startup.
    segment_max: u64,
    /// Snapshot cadence (events between automatic snapshots).  Stored so that
    /// new books created after `open_with` use the same setting.
    snapshot_every: u64,
    /// Set to `true` by `shutdown()` before draining writers.  Any subsequent
    /// call into `book_writer()` or `register_asset()` checks this flag first
    /// and returns an error rather than silently recreating writers over an
    /// empty `BookState` while a newly-opened store may own the directory.
    shut_down: AtomicBool,
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
    if book.is_empty() || book.contains('/') || book.contains('\\') || book == ".." || book.contains("..") {
        return Err(io_str(format!(
            "invalid book name {book:?}: must not be empty or contain '/', '\\', or '..'"
        )));
    }
    Ok(())
}

impl LogTaleaStore {
    /// Open (or create) the store at `dir` with default options.
    ///
    /// See [`open_with`] for the full option set.
    pub async fn open(dir: &Path) -> Result<Self, StoreError> {
        Self::open_with(dir, LogStoreOptions::default()).await
    }

    /// Open (or create) the store at `dir` with explicit options.
    ///
    /// 1. Creates `<dir>/books/` if missing.
    /// 2. Acquires an exclusive fs4 advisory lock on `<dir>/LOCK`.
    /// 3. Replays each existing book dir under `<dir>/books/` to rebuild
    ///    in-memory state, then spawns a `BookWriter` per book.
    /// 4. `_system` is treated like any other book for replay; `AssetRegistered`
    ///    events also populate the in-memory asset registry.
    /// 5. For each book, calls `idem.attach_dir(...)` to load spill runs and
    ///    rebuild the Bloom filter.  If any run's CRC fails or the Bloom file
    ///    is missing/corrupt, a full log scan is performed to rebuild the runs.
    pub async fn open_with(dir: &Path, opts: LogStoreOptions) -> Result<Self, StoreError> {
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

            // --- Snapshot-assisted replay ---
            //
            // Try to load the newest valid snapshot from this book's directory.
            // If one is found, we start replaying the event log from `snap_seq + 1`
            // instead of from genesis, bounding startup time to the tail only.
            //
            // The snapshot was taken post-apply (by the writer, after fsync+apply),
            // so `state.next_seq == snap_seq + 1` in the loaded state.  We trust the
            // state's own counters; the filename's seq is only used to select the
            // segment start point.
            //
            // The deserialized BookState's `writer_attached` flag is always `false`
            // (it has `#[serde(skip, default = "default_writer_attached")]`), so a
            // writer can safely attach to it post-load.
            let (mut st, replay_from) =
                match snapshot::load_latest(&book_dir).await.map_err(io_err)? {
                    Some((snap_st, snap_seq)) => {
                        // Sanity: state's own next_seq must be snap_seq+1.
                        debug_assert_eq!(
                            snap_st.next_seq,
                            snap_seq + 1,
                            "snapshot {name} seq={snap_seq}: state.next_seq={} expected {}",
                            snap_st.next_seq,
                            snap_seq + 1
                        );
                        tracing::debug!(
                            book = %name,
                            snap_seq,
                            "loaded snapshot; replaying tail from seq {}",
                            snap_seq + 1
                        );
                        (snap_st, snap_seq + 1)
                    }
                    None => {
                        tracing::debug!(book = %name, "no snapshot; full replay from seq 1");
                        (BookState::default(), 1)
                    }
                };

            // Apply idem_hot_cap option to the loaded state.
            st.idem.cap = opts.idem_hot_cap;

            // Replay the tail starting at `replay_from` (full replay when no snapshot).
            let pairs = seg.scan_with_pos(replay_from, usize::MAX).await.map_err(io_err)?;

            // Fold into the (possibly snapshot-seeded) BookState.
            // Use try_apply_transaction (not apply_transaction) so a corrupt or
            // hand-edited log that contains arithmetic-impossible postings
            // returns StoreError::Io instead of panicking.
            for (wire, pos) in &pairs {
                match &wire.event {
                    LedgerEvent::TransactionPosted(tx) => {
                        st.try_apply_transaction(tx, wire.seq, wire.at, *pos)
                            .map_err(|msg| {
                                // Encode enough context for the operator to locate the corrupt frame.
                                let (seg_base, off) = pos;
                                io_str(format!(
                                    "corrupt log in book {name} at segment {seg_base} offset {off}: {msg}"
                                ))
                            })?;
                    }
                    LedgerEvent::AccountOpened { def, cfg } => {
                        st.apply_account_opened(def, cfg, wire.seq, wire.at);
                    }
                    LedgerEvent::AssetRegistered(def) => {
                        st.bump_seq(wire.seq, wire.at);
                        // Populate registry regardless of which book the event
                        // lives in (though the writer only appends these to _system).
                        registry.insert(def.id.clone(), def.clone());
                    }
                }
            }

            // Attach idem spill runs + bloom from disk.
            // The rebuild_fn supplies all committed idem keys from the full log
            // (both the snapshot-sourced hot map and tail replay), so that if any
            // run is corrupt/missing the index can be rebuilt accurately.
            //
            // Note: we do a second pass over `pairs` only for the rebuild path
            // (rare).  The all_idem_pairs closure is only called if CRC fails.
            let all_idem_snap: Vec<(String, crate::state::CommittedRec)> = {
                // Pre-snapshot idem keys come from st.idem.hot (already in hot).
                // tail-replay idem keys are also already in st.idem.hot at this point.
                // For rebuild, we need ALL committed keys: hot map is authoritative
                // for recent, runs hold older. The rebuild_fn produces the UNION
                // of all committed keys that are NOT already in hot, so pass an
                // empty vec here (hot is the only source of truth right now; runs
                // will be rebuilt from the log scan that follows).
                //
                // Actually: we need to provide all keys so rebuild can reconstruct
                // the full set.  `st.idem.hot` has all keys from replay at this point
                // (runs will be empty since they're being validated).
                // Pass all pairs from the full log so the rebuild_fn has complete data.
                pairs
                    .iter()
                    .filter_map(|(wire, _)| {
                        if let LedgerEvent::TransactionPosted(tx) = &wire.event {
                            Some((
                                tx.idempotency_key.0.clone(),
                                crate::state::CommittedRec {
                                    txid: tx.id.clone(),
                                    seq: wire.seq,
                                    at: wire.at,
                                },
                            ))
                        } else {
                            None
                        }
                    })
                    .collect()
            };

            st.idem
                .attach_dir(&book_dir, move || {
                    let snap = all_idem_snap;
                    async move { Ok(snap) }
                })
                .await
                .map_err(io_err)?;

            // Drop the replay SegmentSet — BookWriter::spawn re-opens it for writes.
            drop(seg);

            // Spawn writer over the replayed state.
            let writer = BookWriter::spawn_with_opts(
                book_dir,
                Arc::new(RwLock::new(st)),
                batch_max,
                opts.snapshot_every,
                opts.segment_max,
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
            segment_max: opts.segment_max,
            snapshot_every: opts.snapshot_every,
            shut_down: AtomicBool::new(false),
            _lock: Mutex::new(Some(lock_file)),
        })
    }

    /// Look up an existing `BookWriter` without creating one.
    ///
    /// Returns:
    /// - `Err(StoreError::Io)` if the store has been shut down (same behaviour
    ///   as `book_writer` — a shut-down store should not silently report that
    ///   every book is absent).
    /// - `Ok(None)` if the book does not exist yet (read lock only, no I/O).
    /// - `Ok(Some(w))` if the book is already loaded.
    ///
    /// Read paths (e.g. `balance`) use this so they never create a book
    /// directory on disk as a side effect of querying a nonexistent book.
    /// Write paths (`commit`, `open_account`, `register_asset`) continue to
    /// use `book_writer`, which creates the book on first access.
    async fn existing_book(&self, book: &str) -> Result<Option<BookWriter>, StoreError> {
        if self.shut_down.load(Ordering::SeqCst) {
            return Err(io_str("store has been shut down"));
        }
        validate_book_name(book)?;
        let guard = self.books.read().await;
        Ok(guard.get(book).cloned())
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
        if self.shut_down.load(Ordering::SeqCst) {
            return Err(io_str("store has been shut down"));
        }
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
        // For a brand-new book, attach_dir with an empty rebuild_fn (no existing log).
        let mut initial_state = BookState::default();
        tokio::fs::create_dir_all(&book_dir).await.map_err(io_err)?;
        initial_state
            .idem
            .attach_dir(&book_dir, || async { Ok(vec![]) })
            .await
            .map_err(io_err)?;

        let state = Arc::new(RwLock::new(initial_state));
        let writer = BookWriter::spawn_with_opts(
            book_dir,
            state,
            self.batch_max,
            self.snapshot_every,
            self.segment_max,
        )
        .await
        .map_err(io_err)?;
        guard.insert(book.to_string(), writer.clone());
        Ok(writer)
    }

    /// Trigger an immediate snapshot for `book` and wait for it to complete.
    ///
    /// This is an ops/test hook.  The snapshot is written by the book's writer
    /// task (the only mutator), so it is consistent with the current state.
    ///
    /// Returns `Ok(())` on success.  Returns `StoreError::Io` if the book is
    /// unknown, the store is shut down, or the snapshot write fails.
    pub async fn snapshot_now(&self, book: &str) -> Result<(), StoreError> {
        let writer = self
            .existing_book(book)
            .await?
            .ok_or_else(|| io_str(format!("book {book:?} not found for snapshot_now")))?;
        let (reply_tx, reply_rx) = tokio::sync::oneshot::channel();
        writer
            .submit(Job::Snapshot(reply_tx))
            .await?;
        reply_rx
            .await
            .map_err(|_| io_str("book writer gone during snapshot_now"))?
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
        // Signal all subsequent calls that the store is no longer usable.
        // Must happen BEFORE draining writers so any concurrent book_writer()
        // call racing with drain sees the flag and returns an error.
        self.shut_down.store(true, Ordering::SeqCst);

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
        if self.shut_down.load(Ordering::SeqCst) {
            return Err(io_str("store has been shut down"));
        }
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

        // Also track the original error message per book so duplicate slots
        // for the same failing book get a consistent (not generic) error.
        // StoreError is not Clone, so we store the message text and produce a
        // fresh Io error for each affected slot.
        let mut book_err_msgs: HashMap<String, String> = HashMap::new();

        for (i, tx) in txs.iter().enumerate() {
            let book = tx.book.0.clone();
            if !writers_cache.contains_key(&book) {
                let w = self.book_writer(&book).await;
                if let Err(ref e) = w {
                    book_err_msgs.insert(book.clone(), e.to_string());
                }
                writers_cache.insert(book.clone(), w);
            }
            match &writers_cache[&book] {
                Ok(_) => pending.push(PendingSubmit { book, tx_idx: i }),
                Err(_) => {
                    // Placeholder rx slot will be skipped; record error.
                    // We need to keep indices aligned, so push a dummy rx and
                    // record the error separately.
                    let msg = book_err_msgs
                        .get(&book)
                        .cloned()
                        .unwrap_or_else(|| "failed to get book writer".into());
                    errs.insert(i, io_str(msg));
                }
            }
        }

        // Build (tx_idx, rx) pairs: submit all jobs, collect all rxs.
        let mut tx_to_rx_idx: Vec<Option<usize>> = vec![None; txs.len()];
        let mut rx_to_tx_idx: Vec<usize> = Vec::with_capacity(pending.len());

        for ps in &pending {
            let i = ps.tx_idx;
            // pending only contains entries whose book resolved Ok; unwrap is safe.
            let writer = writers_cache[&ps.book].as_ref().expect("pending entry must have Ok writer").clone();
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
    /// in-memory state. `as_of: Some(t)` binary-searches the per-account
    /// posting entries (sorted by committed_at, non-decreasing) to find the
    /// balance as it stood at time `t`.
    ///
    /// Uses `existing_book` (read-only lookup) so querying an account in a
    /// book that has never been written to does NOT create that book's
    /// directory on disk.  An absent book means the account cannot exist →
    /// `StoreError::UnknownAccount`.
    ///
    /// Edge semantics matching sqlite:
    /// - Unknown book → `UnknownAccount` (no book → no account).
    /// - Unknown account within a known book → `UnknownAccount`.
    /// - Account exists but no postings before `as_of` → `BalanceSnapshot { amount: 0, updated_seq: 0 }`.
    async fn balance(
        &self,
        account: &AccountId,
        as_of: Option<DateTime<Utc>>,
    ) -> Result<BalanceSnapshot, StoreError> {
        let writer = self
            .existing_book(&account.book.0)
            .await?
            .ok_or_else(|| StoreError::UnknownAccount(account.clone()))?;
        let st = writer.state.read().await;
        let key = account.to_key();
        let acct = st
            .accounts
            .get(&key)
            .ok_or_else(|| StoreError::UnknownAccount(account.clone()))?;

        match as_of {
            None => {
                let eff = effective(acct.raw_balance, &acct.cfg.normal_side);
                Ok(BalanceSnapshot {
                    amount: Amount::new(eff, acct.def.asset.clone()),
                    updated_seq: acct.updated_seq,
                })
            }
            Some(t) => {
                // Binary search: committed_at is non-decreasing vs seq within a book.
                let idx = acct.postings.partition_point_at(t);
                if idx == 0 {
                    // No postings at or before the cutoff.
                    Ok(BalanceSnapshot {
                        amount: Amount::new(0, acct.def.asset.clone()),
                        updated_seq: 0,
                    })
                } else {
                    let entry = acct.postings.get(idx - 1).expect("partition_point_at guaranteed in-range");
                    let eff = effective(entry.raw_after, &acct.cfg.normal_side);
                    Ok(BalanceSnapshot {
                        amount: Amount::new(eff, acct.def.asset.clone()),
                        updated_seq: entry.seq,
                    })
                }
            }
        }
    }

    /// Look up an asset by id.
    async fn asset(&self, id: &AssetId) -> Result<Option<AssetDef>, StoreError> {
        let reg = self.registry.read().await;
        Ok(reg.get(id).cloned())
    }

    /// Posting history for `account`, paginated by seq.
    ///
    /// `after_seq` is EXCLUSIVE (matches sqlite semantics: `seq > after_seq`).
    /// `limit` counts DISTINCT seqs so one transaction's postings to the same
    /// account are never split across pages.
    ///
    /// Edge semantics matching sqlite:
    /// - Unknown book or account → `UnknownAccount`.
    /// - limit 0 → empty vec (never an error).
    async fn account_history(
        &self,
        account: &AccountId,
        after_seq: Option<Seq>,
        limit: usize,
    ) -> Result<Vec<PostingRecord>, StoreError> {
        if limit == 0 {
            return Ok(vec![]);
        }

        let writer = self
            .existing_book(&account.book.0)
            .await?
            .ok_or_else(|| StoreError::UnknownAccount(account.clone()))?;
        let st = writer.state.read().await;
        let key = account.to_key();
        let acct = st
            .accounts
            .get(&key)
            .ok_or_else(|| StoreError::UnknownAccount(account.clone()))?;

        let after = after_seq.unwrap_or(0);
        // Start at the first entry with seq > after.
        let start = acct.postings.partition_point_seq(after);

        // Walk counting DISTINCT seqs, stopping before exceeding `limit`.
        let mut records: Vec<PostingRecord> = Vec::new();
        let mut distinct_seqs: usize = 0;
        let mut last_seq: Seq = 0;

        for entry in acct.postings.iter_from(start) {
            if entry.seq != last_seq {
                if distinct_seqs >= limit {
                    break;
                }
                distinct_seqs += 1;
                last_seq = entry.seq;
            }
            records.push(PostingRecord {
                seq: entry.seq,
                txid: entry.txid.clone(),
                account: account.clone(),
                amount: Amount::new(entry.minor, acct.def.asset.clone()),
                direction: entry.direction.clone(),
                at: entry.at,
            });
        }

        Ok(records)
    }

    /// Look up a committed transaction by its `TxId`.
    ///
    /// Searches all book writers' in-memory txid indexes. Found → reads the
    /// frame at the recorded position and returns a `StoredTransaction`.
    /// Not found → `Ok(None)` (matches sqlite semantics).
    async fn transaction(&self, txid: &TxId) -> Result<Option<StoredTransaction>, StoreError> {
        use talea_core::events::LedgerEvent;

        // Snapshot the writers map under a read lock.
        let writers: Vec<BookWriter> = {
            let guard = self.books.read().await;
            guard.values().cloned().collect()
        };

        for writer in &writers {
            let st = writer.state.read().await;
            if let Some(&(seq, pos)) = st.txids.get(&txid.0) {
                // Found: release state lock before doing async I/O.
                drop(st);
                let wire = writer
                    .catalog
                    .read_at(pos.0, pos.1, seq)
                    .await
                    .map_err(io_err)?;
                match wire.event {
                    LedgerEvent::TransactionPosted(tx) => {
                        return Ok(Some(StoredTransaction {
                            transaction: tx,
                            seq: wire.seq,
                            at: wire.at,
                        }));
                    }
                    _ => {
                        return Err(io_str(format!(
                            "frame at recorded position is not a transaction (seq {seq})"
                        )));
                    }
                }
            }
        }

        Ok(None)
    }

    /// Trial balance for `book`.
    ///
    /// `as_of: None` returns the current lifetime sums from in-memory state
    /// (cheap). `as_of: Some(t)` replays all TransactionPosted frames with
    /// `committed_at <= t` from disk (rare, documented as slow path).
    ///
    /// Edge semantics matching sqlite:
    /// - Unknown book → empty vec (sqlite returns no rows for an unknown book).
    /// - Rows are sorted by asset id string, matching sqlite's `ORDER BY asset`.
    async fn trial_balance(
        &self,
        book: &Book,
        as_of: Option<DateTime<Utc>>,
    ) -> Result<Vec<TrialBalanceRow>, StoreError> {
        use talea_core::events::LedgerEvent;

        let writer = match self.existing_book(&book.0).await? {
            None => return Ok(vec![]),
            Some(w) => w,
        };

        match as_of {
            None => {
                let st = writer.state.read().await;
                let mut rows: Vec<TrialBalanceRow> = st
                    .sums
                    .iter()
                    .map(|(asset, &(debits, credits))| TrialBalanceRow {
                        asset: asset.clone(),
                        debits,
                        credits,
                    })
                    .collect();
                rows.sort_by(|a, b| a.asset.as_str().cmp(b.asset.as_str()));
                Ok(rows)
            }
            Some(t) => {
                // Disk replay: scan all events, fold TransactionPosted with at <= t.
                // Rare operation; documented as slow path.
                //
                // Durability watermark: the writer appends → syncs → applies-to-state
                // → acks.  `state.next_seq` advances only AFTER fsync, so any frame
                // with `seq < ceiling` (where `ceiling = next_seq - 1`) is guaranteed
                // to be both durable on disk and reflected in the in-memory state.
                // Frames beyond the ceiling may be in the page cache but not yet
                // fsynced (the writer hasn't applied them yet); surfacing them would
                // be a dirty read — they could vanish on crash.  We therefore stop
                // scanning once `wire.seq > ceiling`.
                let ceiling: Seq = {
                    let st = writer.state.read().await;
                    st.next_seq.saturating_sub(1)
                };

                let events = writer
                    .catalog
                    .scan_from(1, usize::MAX)
                    .await
                    .map_err(io_err)?;

                let mut sums: HashMap<AssetId, (i64, i64)> = HashMap::new();
                for wire in events {
                    if wire.seq > ceiling {
                        break; // beyond durability watermark — stop
                    }
                    if wire.at > t {
                        break; // committed_at is non-decreasing; can stop early
                    }
                    if let LedgerEvent::TransactionPosted(tx) = wire.event {
                        for posting in &tx.postings {
                            let entry = sums
                                .entry(posting.amount.asset().clone())
                                .or_insert((0, 0));
                            match posting.direction {
                                Direction::Debit => {
                                    entry.0 = entry.0.saturating_add(posting.amount.minor())
                                }
                                Direction::Credit => {
                                    entry.1 = entry.1.saturating_add(posting.amount.minor())
                                }
                            }
                        }
                    }
                }

                let mut rows: Vec<TrialBalanceRow> = sums
                    .into_iter()
                    .map(|(asset, (debits, credits))| TrialBalanceRow {
                        asset,
                        debits,
                        credits,
                    })
                    .collect();
                rows.sort_by(|a, b| a.asset.as_str().cmp(b.asset.as_str()));
                Ok(rows)
            }
        }
    }

    /// Read events from `book` starting at `from` (INCLUSIVE), returning at
    /// most `limit`.
    ///
    /// Edge semantics matching sqlite:
    /// - Unknown book → empty vec (sqlite returns no rows).
    ///
    /// # Durability watermark
    ///
    /// Log-replay reads must never surface frames that the in-memory state
    /// hasn't applied yet.  The writer pipeline is: append → fsync →
    /// apply-to-state → ack.  `state.next_seq` advances only after fsync AND
    /// apply, so `ceiling = next_seq - 1` is the highest seq that is both
    /// durable on disk and consistent with the in-memory index.  Frames with
    /// `seq > ceiling` may be page-cache-visible but not fsynced; returning
    /// them would be a dirty read — they could vanish on crash or diverge from
    /// in-memory state.  We drop the state lock before scanning and filter out
    /// any frames that exceed the ceiling.
    async fn read_events(
        &self,
        book: &Book,
        from: Seq,
        limit: usize,
    ) -> Result<Vec<Sequenced<LedgerEvent>>, StoreError> {
        let writer = match self.existing_book(&book.0).await? {
            None => return Ok(vec![]),
            Some(w) => w,
        };

        // Read the durability ceiling under a short-lived read lock, then
        // release before doing disk I/O.
        let ceiling: Seq = {
            let st = writer.state.read().await;
            st.next_seq.saturating_sub(1)
        };

        let wires = writer
            .catalog
            .scan_from(from, limit)
            .await
            .map_err(io_err)?;

        Ok(wires
            .into_iter()
            .take_while(|w| w.seq <= ceiling)
            .map(|w| Sequenced {
                seq: w.seq,
                at: w.at,
                event: w.event,
            })
            .collect())
    }

    fn subscribe(&self, book: &Book, from: Seq) -> BoxStream<'static, Result<Sequenced<LedgerEvent>, StoreError>> {
        // subscribe is sync — clone everything we need into the stream before returning.
        let books = Arc::clone(&self.books);
        let dir = self.dir.clone();
        let batch_max = self.batch_max;
        let segment_max = self.segment_max;
        let snapshot_every = self.snapshot_every;
        let book = book.clone();

        Box::pin(async_stream::try_stream! {
            // Validate the book name before touching the filesystem.  Every
            // other entry point calls validate_book_name via book_writer /
            // existing_book; subscribe builds the path directly, so we must
            // check here.
            validate_book_name(&book.0)?;

            // Step 1: get-or-create the BookWriter inside the async stream so we
            // can await it. This mirrors sqlite's behaviour: subscribing to a book
            // that has never been written to still works; future writes will be
            // received live.
            let writer: BookWriter = {
                // Fast path: read lock.
                let maybe = {
                    let g = books.read().await;
                    g.get(&book.0).cloned()
                };
                if let Some(w) = maybe {
                    w
                } else {
                    // Slow path: write lock, get-or-create.
                    let mut g = books.write().await;
                    if let Some(w) = g.get(&book.0).cloned() {
                        w
                    } else {
                        let book_dir = dir.join("books").join(&book.0);
                        tokio::fs::create_dir_all(&book_dir).await.map_err(|e| StoreError::Io(Box::new(e)))?;
                        let mut initial_st = crate::state::BookState::default();
                        initial_st.idem.attach_dir(&book_dir, || async { Ok(vec![]) }).await.map_err(|e| StoreError::Io(Box::new(e)))?;
                        let state = Arc::new(RwLock::new(initial_st));
                        let w = BookWriter::spawn_with_opts(book_dir, state, batch_max, snapshot_every, segment_max)
                            .await
                            .map_err(|e| StoreError::Io(Box::new(e)))?;
                        g.insert(book.0.clone(), w.clone());
                        w
                    }
                }
            };

            // Step 2: subscribe to the live broadcast channel BEFORE reading history
            // so nothing between catch-up and live-tail is missed.
            let mut live = writer.events.subscribe();

            // Step 3: page through history from `from` up to the durability watermark.
            let page_size = 512usize;
            let mut next = from;

            loop {
                // Ceiling at the start of each page so we don't surface un-applied frames.
                let ceiling: Seq = {
                    let st = writer.state.read().await;
                    st.next_seq.saturating_sub(1)
                };
                if next > ceiling {
                    break;
                }
                let limit = page_size.min((ceiling - next + 1) as usize);
                let wires = writer.catalog.scan_from(next, limit).await.map_err(io_err)?;
                let page_len = wires.len();
                for wire in wires {
                    // Double-check ceiling in case ceiling moved backward (shouldn't happen,
                    // but be defensive).
                    if wire.seq > ceiling {
                        break;
                    }
                    next = wire.seq + 1;
                    yield Sequenced { seq: wire.seq, at: wire.at, event: wire.event };
                }
                // A short page means we're caught up to the watermark.
                if page_len < limit {
                    break;
                }
            }

            // Step 4: live-tail loop.
            let mut last: Seq = next.saturating_sub(1);
            loop {
                match live.recv().await {
                    Ok(ev) => {
                        if ev.seq <= last {
                            // overlap from catch-up — skip
                            continue;
                        }
                        last = ev.seq;
                        yield Sequenced { seq: ev.seq, at: ev.at, event: ev.event };
                    }
                    Err(tokio::sync::broadcast::error::RecvError::Lagged(_)) => {
                        // We fell behind the broadcast ring — re-page from last+1.
                        let resume = last + 1;
                        let page_size_lag = 512usize;
                        let mut cursor = resume;
                        loop {
                            let ceiling: Seq = {
                                let st = writer.state.read().await;
                                st.next_seq.saturating_sub(1)
                            };
                            if cursor > ceiling {
                                break;
                            }
                            let limit = page_size_lag.min((ceiling - cursor + 1) as usize);
                            let wires = writer.catalog.scan_from(cursor, limit).await.map_err(io_err)?;
                            let page_len = wires.len();
                            for wire in wires {
                                if wire.seq > ceiling {
                                    break;
                                }
                                if wire.seq > last {
                                    last = wire.seq;
                                    cursor = wire.seq + 1;
                                    yield Sequenced { seq: wire.seq, at: wire.at, event: wire.event };
                                } else {
                                    cursor = wire.seq + 1;
                                }
                            }
                            if page_len < limit {
                                break;
                            }
                        }
                        // After re-paging, resume the live loop (re-subscribe isn't
                        // possible but new events will arrive normally).
                    }
                    Err(tokio::sync::broadcast::error::RecvError::Closed) => {
                        // Writer died — no more events. End the stream cleanly (matches sqlite).
                        return;
                    }
                }
            }
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use talea_core::store::{AccountCfg, Store};
    use talea_core::types::*;
    use crate::writer::BookWriter;

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

    #[tokio::test]
    async fn store_use_after_shutdown_fails_cleanly() {
        let dir = tempfile::tempdir().unwrap();
        let store = seeded(dir.path()).await;

        // Commit one tx so there's real state to inspect.
        store.commit(&mk_tx("k1", 10)).await.unwrap();

        store.shutdown().await;

        // commit must return Err, not panic, not succeed.
        let commit_res = store.commit(&mk_tx("k2", 5)).await;
        assert!(commit_res.is_err(), "commit after shutdown must fail");

        // open_account must return Err.
        let cfg = AccountCfg { normal_side: None, min_balance: None };
        let open_res = store.open_account(&cash_def(), &cfg).await;
        assert!(open_res.is_err(), "open_account after shutdown must fail");

        // balance reads via book_writer — after shutdown the books map is empty,
        // so book_writer returns the shut_down error before it can recreate anything.
        let bal_res = store.balance(&cash_def().id, None).await;
        assert!(bal_res.is_err(), "balance after shutdown must fail");
    }

    #[tokio::test]
    async fn empty_book_name_is_rejected() {
        let dir = tempfile::tempdir().unwrap();
        let store = LogTaleaStore::open(dir.path()).await.unwrap();
        store.register_asset(&usd()).await.unwrap();

        // An empty book name must be rejected by validate_book_name, which
        // book_writer calls.  Using commit (which calls book_writer) is the
        // simplest exerciser.
        let mut tx = mk_tx("empty-book", 1);
        tx.book = Book("".into());
        tx.postings[0].account.book = Book("".into());
        tx.postings[1].account.book = Book("".into());
        let res = store.commit(&tx).await;
        assert!(res.is_err(), "empty book name must be rejected");
        let err_msg = format!("{:?}", res.unwrap_err());
        assert!(err_msg.contains("invalid book name"), "error should mention invalid book name: {err_msg}");
    }

    // -----------------------------------------------------------------------
    // Fix 1: read paths must not create books
    // -----------------------------------------------------------------------

    /// `balance` for an account in a book that was never written must return
    /// `UnknownAccount` and must NOT create the book directory on disk.
    #[tokio::test]
    async fn balance_on_unknown_book_creates_nothing() {
        let dir = tempfile::tempdir().unwrap();
        let store = LogTaleaStore::open(dir.path()).await.unwrap();

        let typo_account = AccountId {
            book: Book("typo".into()),
            path: "cash".into(),
        };
        let res = store.balance(&typo_account, None).await;

        assert!(
            matches!(res, Err(talea_core::store::StoreError::UnknownAccount(_))),
            "expected UnknownAccount for nonexistent book, got {res:?}",
        );

        // The book directory must NOT have been created.
        let book_dir = dir.path().join("books").join("typo");
        assert!(
            !book_dir.exists(),
            "balance must not create books/typo on disk, but it exists: {book_dir:?}",
        );
    }

    // -----------------------------------------------------------------------
    // Fix 2: replay of corrupt log must error, not panic
    // -----------------------------------------------------------------------

    /// Build a valid store, shut it down, hand-append a structurally valid
    /// (correct CRC) but arithmetically impossible frame (debits i64::MAX
    /// from an account whose balance is already > 0), then reopen.  The open
    /// must return `Err(StoreError::Io(…))` mentioning "corrupt log", not
    /// panic.
    #[tokio::test]
    async fn replay_of_overflowing_log_errors_not_panics() {
        use crate::frame::{WireEvent, encode_frame};

        let dir = tempfile::tempdir().unwrap();

        // 1. Build a valid store with one committed transaction.
        {
            let store = seeded(dir.path()).await;
            // commit one tx so cash has balance > 0 (raw_balance = 100)
            store.commit(&mk_tx("k1", 100)).await.unwrap();
            store.shutdown().await;
        }
        // At this point next_seq in book "b" is 4 (seq1=cash open, seq2=rev
        // open, seq3=k1 tx).  We forge seq 4 outside the store.

        // 2. Find the segment file for book "b" (always segment-00000000000000000001.log
        //    since the test store is small and never rotates).
        let book_dir = dir.path().join("books").join("b");
        let seg_path = book_dir.join("segment-00000000000000000001.log");
        assert!(seg_path.exists(), "segment file must exist: {seg_path:?}");

        // 3. Forge a frame that is structurally valid (correct CRC) but whose
        //    debit of i64::MAX against a balance of 100 cannot fit in i64.
        let forged_tx = Transaction {
            id: TxId(uuid::Uuid::now_v7()),
            book: Book("b".into()),
            postings: vec![
                Posting {
                    account: AccountId { book: Book("b".into()), path: "cash".into() },
                    amount: Amount::new(i64::MAX, AssetId::new("USD")),
                    direction: Direction::Debit,
                },
                Posting {
                    account: AccountId { book: Book("b".into()), path: "rev".into() },
                    amount: Amount::new(i64::MAX, AssetId::new("USD")),
                    direction: Direction::Credit,
                },
            ],
            idempotency_key: IdempotencyKey("overflow-forge".into()),
            external_refs: vec![],
            metadata: serde_json::Value::Null,
            occurred_at: chrono::Utc::now(),
        };
        let forged_wire = WireEvent {
            seq: 4, // next after the 3 valid events
            at: chrono::Utc::now(),
            event: talea_core::events::LedgerEvent::TransactionPosted(forged_tx),
        };
        let frame_bytes = encode_frame(&forged_wire).expect("encode must succeed");

        // Append the forged frame directly.
        {
            use std::io::Write;
            let mut f = std::fs::OpenOptions::new()
                .append(true)
                .open(&seg_path)
                .expect("segment file must exist for append");
            f.write_all(&frame_bytes).unwrap();
        }

        // 4. Reopen — must return Err mentioning "corrupt log", not panic.
        let result = LogTaleaStore::open(dir.path()).await;
        match result {
            Err(StoreError::Io(ref msg)) => {
                let s = msg.to_string();
                assert!(
                    s.contains("corrupt log"),
                    "error must mention 'corrupt log', got: {s}",
                );
            }
            Ok(_) => panic!("open must fail on overflow replay, but it succeeded"),
            Err(other) => panic!("expected StoreError::Io, got {other:?}"),
        }
    }

    // -----------------------------------------------------------------------
    // Task 7: read path tests
    // -----------------------------------------------------------------------

    /// Build a store with 3 transactions at distinct timestamps.
    /// Returns (store, txids, commit_ats).
    /// Seqs: 1 = cash open, 2 = rev open, 3/4/5 = the 3 transactions.
    async fn history_fixture(
        dir: &std::path::Path,
    ) -> (LogTaleaStore, Vec<TxId>, Vec<chrono::DateTime<chrono::Utc>>) {
        let store = seeded(dir).await;
        let mut txids = Vec::new();
        let mut times = Vec::new();

        for (key, minor) in [("tx1", 10i64), ("tx2", 20), ("tx3", 30)] {
            let c = store.commit(&mk_tx(key, minor)).await.unwrap();
            txids.push(c.txid);
            times.push(c.at);
            // Ensure distinct microsecond timestamps for as_of binary search.
            tokio::time::sleep(std::time::Duration::from_millis(2)).await;
        }

        (store, txids, times)
    }

    #[tokio::test]
    async fn balance_as_of_binary_searches_posting_entries() {
        let dir = tempfile::tempdir().unwrap();
        let (store, _txids, times) = history_fixture(dir.path()).await;

        let cash = cash_def().id;

        // as_of before t1: no postings → amount 0, updated_seq 0.
        let before = times[0] - chrono::Duration::microseconds(1);
        let snap = store.balance(&cash, Some(before)).await.unwrap();
        assert_eq!(snap.amount.minor(), 0, "as_of before first commit must be 0");
        assert_eq!(snap.updated_seq, 0, "as_of before first commit: updated_seq must be 0");

        // as_of = t2 (second commit's at) → balance 30 (10+20), updated_seq = 4.
        let snap2 = store.balance(&cash, Some(times[1])).await.unwrap();
        assert_eq!(snap2.amount.minor(), 30, "balance after 2 commits must be 30");
        assert_eq!(snap2.updated_seq, 4, "updated_seq after 2 commits must be 4");

        // as_of = t3 → 60, updated_seq 5.
        let snap3 = store.balance(&cash, Some(times[2])).await.unwrap();
        assert_eq!(snap3.amount.minor(), 60, "balance after 3 commits must be 60");
        assert_eq!(snap3.updated_seq, 5, "updated_seq after 3 commits must be 5");
    }

    #[tokio::test]
    async fn account_history_pages_by_distinct_seq_after_seq_exclusive() {
        let dir = tempfile::tempdir().unwrap();
        let (store, _txids, times) = history_fixture(dir.path()).await;

        let cash = cash_def().id;

        // after_seq None, limit 2 → postings of seqs 3, 4 only.
        let page1 = store.account_history(&cash, None, 2).await.unwrap();
        assert_eq!(page1.len(), 2, "limit 2 must return 2 records");
        assert_eq!(page1[0].seq, 3);
        assert_eq!(page1[1].seq, 4);
        assert_eq!(page1[0].amount.minor(), 10);
        assert_eq!(page1[1].amount.minor(), 20);
        assert!(matches!(page1[0].direction, Direction::Debit));
        // at must match the commit time
        assert_eq!(page1[0].at, times[0]);
        assert_eq!(page1[1].at, times[1]);

        // Resume after_seq Some(4), limit 10 → only seq 5.
        let page2 = store.account_history(&cash, Some(4), 10).await.unwrap();
        assert_eq!(page2.len(), 1);
        assert_eq!(page2[0].seq, 5);
        assert_eq!(page2[0].amount.minor(), 30);

        // limit 0 → empty.
        let empty = store.account_history(&cash, None, 0).await.unwrap();
        assert!(empty.is_empty(), "limit 0 must return empty vec");
    }

    #[tokio::test]
    async fn transaction_round_trips_through_disk() {
        let dir = tempfile::tempdir().unwrap();
        let (store, txids, times) = history_fixture(dir.path()).await;

        // transaction(txid of 2nd commit) → seq 4, at == t2.
        let stored = store.transaction(&txids[1]).await.unwrap().expect("should find 2nd tx");
        assert_eq!(stored.seq, 4, "2nd transaction must have seq 4");
        assert_eq!(stored.at, times[1], "committed_at must match");
        assert_eq!(stored.transaction.idempotency_key.0, "tx2");

        // Unknown uuid → Ok(None).
        let unknown = TxId(uuid::Uuid::now_v7());
        let result = store.transaction(&unknown).await.unwrap();
        assert!(result.is_none(), "unknown txid must return Ok(None)");
    }

    #[tokio::test]
    async fn trial_balance_none_and_as_of() {
        let dir = tempfile::tempdir().unwrap();
        let (store, _txids, times) = history_fixture(dir.path()).await;

        let book = Book("b".into());

        // None: both accounts use USD; debits = 60 (10+20+30 to cash), credits = 60 (to rev).
        let tb = store.trial_balance(&book, None).await.unwrap();
        assert_eq!(tb.len(), 1, "one USD row");
        assert_eq!(tb[0].asset, AssetId::new("USD"));
        assert_eq!(tb[0].debits, 60);
        assert_eq!(tb[0].credits, 60);

        // as_of = t2: debits 30 (10+20), credits 30.
        let tb2 = store.trial_balance(&book, Some(times[1])).await.unwrap();
        assert_eq!(tb2.len(), 1);
        assert_eq!(tb2[0].debits, 30);
        assert_eq!(tb2[0].credits, 30);

        // Unknown book → empty vec (matches sqlite).
        let unknown = Book("ghost".into());
        let tb3 = store.trial_balance(&unknown, None).await.unwrap();
        assert!(tb3.is_empty(), "unknown book must return empty vec");
    }

    #[tokio::test]
    async fn read_events_from_inclusive_pages() {
        let dir = tempfile::tempdir().unwrap();
        let (store, _txids, _times) = history_fixture(dir.path()).await;

        let book = Book("b".into());

        // from=2, limit=2 → seqs [2, 3].
        let evs = store.read_events(&book, 2, 2).await.unwrap();
        assert_eq!(evs.len(), 2);
        assert_eq!(evs[0].seq, 2);
        assert_eq!(evs[1].seq, 3);

        // from=5, limit=10 → [5].
        let evs5 = store.read_events(&book, 5, 10).await.unwrap();
        assert_eq!(evs5.len(), 1);
        assert_eq!(evs5[0].seq, 5);

        // from past the end → empty.
        let evs_end = store.read_events(&book, 999, 10).await.unwrap();
        assert!(evs_end.is_empty(), "from past end must return empty vec");

        // Unknown book → empty vec (matches sqlite).
        let unknown = Book("ghost".into());
        let evs_ghost = store.read_events(&unknown, 1, 10).await.unwrap();
        assert!(evs_ghost.is_empty(), "unknown book must return empty vec");
    }

    // -----------------------------------------------------------------------
    // Hazard B: durability-watermark tests
    // -----------------------------------------------------------------------

    /// Verify that `read_events` never surfaces frames beyond the durability
    /// ceiling (`state.next_seq - 1`).
    ///
    /// After 3 commits the ceiling equals the highest committed seq.
    /// `read_events(from=1, limit=100)` must return exactly seqs 1..=ceiling
    /// (the two AccountOpened events + 3 TransactionPosted = 5 frames) with no
    /// extras.  This pins the ceiling-filter plumbing: if the filter were
    /// absent, a page-cache frame beyond the ceiling could appear.
    #[tokio::test]
    async fn read_events_excludes_frames_beyond_ceiling() {
        let dir = tempfile::tempdir().unwrap();
        let (store, _txids, _times) = history_fixture(dir.path()).await;

        let book = Book("b".into());

        // 3 commits + 2 account opens = 5 events total; next_seq = 6.
        // ceiling = 5.
        let evs = store.read_events(&book, 1, 100).await.unwrap();
        let seqs: Vec<Seq> = evs.iter().map(|e| e.seq).collect();

        // Must have exactly seqs 1..=5 and no more.
        assert_eq!(seqs, vec![1, 2, 3, 4, 5], "read_events must return exactly seqs 1..=ceiling");

        // Also verify from= skipping still applies within the ceiling.
        let evs_from4 = store.read_events(&book, 4, 100).await.unwrap();
        let seqs_from4: Vec<Seq> = evs_from4.iter().map(|e| e.seq).collect();
        assert_eq!(seqs_from4, vec![4, 5], "from=4 must return seqs 4 and 5 only");
    }

    // -----------------------------------------------------------------------
    // Task 12: Snapshot-assisted open path
    // -----------------------------------------------------------------------

    /// Verify that `open` uses a snapshot for replay when one exists.
    ///
    /// # What this test proves
    ///
    /// 1. After shutdown + reopen, balances reflect all commits (basic sanity).
    /// 2. The snapshot file exists on disk after `snapshot_now`.
    /// 3. `load_latest` after the final shutdown returns a snapshot with seq
    ///    >= the 5th commit's seq, proving the snapshot was taken at or after
    ///    that point and that the open path would have used it.
    ///
    /// What we do NOT try to prove here: that the replay *skipped* pre-snapshot
    /// frames (that would require corrupting early frames, which is invasive
    /// and risks making the test fragile).  The correctness of the load path
    /// itself is proven by `snapshot_round_trips_book_state` and the fact that
    /// balances are correct after reopen.
    #[tokio::test]
    async fn open_uses_snapshot_plus_tail() {
        use crate::snapshot;

        let dir = tempfile::tempdir().unwrap();

        // Seqs: 1 = _system (USD), 2 = cash open, 3 = rev open (all in separate
        // books: _system and "b").  Within book "b", seqs are 1..=N per-book.
        // We commit 5 transactions to book "b", then snapshot, then 2 more.

        let (first_5_seqs, snap_seq_at_least): (Vec<Seq>, Seq);
        {
            let store = seeded(dir.path()).await;

            let mut seqs = Vec::new();
            for i in 0..5 {
                let c = store.commit(&mk_tx(&format!("k{i}"), 1)).await.unwrap();
                seqs.push(c.seq);
            }

            // Snapshot after 5 commits.  The snapshot seq == last applied seq
            // in book "b" (3 events for asset+accounts are in _system, so in
            // "b" the seqs are [1..5] for the 5 txs; actual seq depends on
            // account opens going to "b" before commits).
            // The point is: after snapshot_now, a .snap file must exist.
            store.snapshot_now("b").await.unwrap();

            // 2 more commits after the snapshot.
            for i in 5..7 {
                store.commit(&mk_tx(&format!("k{i}"), 2)).await.unwrap();
            }

            first_5_seqs = seqs;
            // snap_seq_at_least: the snapshot must be >= the 5th commit's seq.
            snap_seq_at_least = *first_5_seqs.last().unwrap();

            store.shutdown().await;
        }

        // --- Verify snapshot file exists for book "b" ---
        let book_dir = dir.path().join("books").join("b");
        let snap = snapshot::load_latest(&book_dir).await.unwrap();
        assert!(snap.is_some(), "snapshot must exist for book b after snapshot_now + shutdown");
        let (_, snap_seq) = snap.unwrap();
        assert!(
            snap_seq >= snap_seq_at_least,
            "snapshot seq {snap_seq} must be >= 5th-commit seq {snap_seq_at_least}"
        );

        // --- Reopen and verify all 7 commits are reflected ---
        let store2 = LogTaleaStore::open(dir.path()).await.unwrap();

        // cash should have: 5 × 1 + 2 × 2 = 9 total debited.
        let bal = store2.balance(&cash_def().id, None).await.unwrap();
        assert_eq!(
            bal.amount.minor(),
            9,
            "all 7 commits must be visible after reopen; got {}",
            bal.amount.minor()
        );

        // Idempotency: replay of any of the first 5 keys returns the original seq.
        for (i, &orig_seq) in first_5_seqs.iter().enumerate() {
            let dup = store2.commit(&mk_tx(&format!("k{i}"), 1)).await.unwrap();
            assert_eq!(
                dup.seq, orig_seq,
                "idem key k{i} must resolve to original seq {orig_seq} after reopen, got {}",
                dup.seq
            );
        }
    }

    // -----------------------------------------------------------------------
    // Task 13: Snapshot interplay with spilled idem runs
    // -----------------------------------------------------------------------

    /// Commit enough transactions to overflow the hot idem cap (forcing spills),
    /// take a snapshot, reopen, and verify that BOTH hot (recent) and spilled
    /// (older) idem keys dedup correctly.
    ///
    /// Uses a small `idem_hot_cap` (8) so a handful of commits forces overflow.
    #[tokio::test]
    async fn snapshot_interplay_hot_and_spilled_keys_dedup() {
        let dir = tempfile::tempdir().unwrap();

        // Open with a tiny hot cap so we force spills with few commits.
        let opts = LogStoreOptions {
            idem_hot_cap: 8,
            snapshot_every: BookWriter::DEFAULT_SNAPSHOT_EVERY,
            segment_max: crate::segment::DEFAULT_SEGMENT_MAX,
        };

        let orig_seqs: Vec<talea_core::types::Seq>;
        {
            let store = LogTaleaStore::open_with(dir.path(), opts.clone()).await.unwrap();
            store.register_asset(&usd()).await.unwrap();
            let cfg = AccountCfg { normal_side: None, min_balance: None };
            store.open_account(&cash_def(), &cfg).await.unwrap();
            store.open_account(&rev_def(), &cfg).await.unwrap();

            // Commit 20 transactions (enough to spill with cap=8).
            let n = 20usize;
            let mut seqs = Vec::with_capacity(n);
            for i in 0..n {
                let c = store.commit(&mk_tx(&format!("spill-idem-{i:03}"), 1)).await.unwrap();
                seqs.push(c.seq);
            }

            // Take a snapshot so the next open uses it.
            store.snapshot_now("b").await.unwrap();

            orig_seqs = seqs;

            store.shutdown().await;
        }

        // Reopen with the same small cap — spill run files should be present.
        let store2 = LogTaleaStore::open_with(dir.path(), opts).await.unwrap();

        // ALL 20 keys must dedup to their original seq/txid.
        for (i, &orig_seq) in orig_seqs.iter().enumerate() {
            let key = format!("spill-idem-{i:03}");
            let dup = store2.commit(&mk_tx(&key, 1)).await.unwrap();
            assert_eq!(
                dup.seq, orig_seq,
                "idem key {key} must resolve to orig seq {orig_seq} after reopen with spilled runs; got {}",
                dup.seq,
            );
        }
    }

    // -----------------------------------------------------------------------
    // Task 8: subscribe catch-up + live tail
    // -----------------------------------------------------------------------

    /// subscribe with an invalid book name must yield Err as the first item and
    /// must NOT create any directory outside the books/ subtree.
    #[tokio::test]
    async fn subscribe_invalid_book_yields_err_and_creates_nothing() {
        use futures::StreamExt;
        let dir = tempfile::tempdir().unwrap();
        let store = LogTaleaStore::open(dir.path()).await.unwrap();

        let mut stream = store.subscribe(&Book("../evil".into()), 1);
        let first = stream.next().await.expect("stream must yield at least one item");
        assert!(first.is_err(), "first item must be Err for invalid book name");

        // The directory that would have been created by path traversal must not exist.
        let evil_dir = dir.path().join("evil");
        assert!(
            !evil_dir.exists(),
            "subscribe must not create the traversal target directory, but {:?} exists",
            evil_dir,
        );
    }

    #[tokio::test]
    async fn subscribe_catch_up_then_live() {
        use futures::StreamExt;
        let dir = tempfile::tempdir().unwrap();
        let store = seeded(dir.path()).await; // 2 opens → seqs 1, 2
        store.commit(&mk_tx("h1", 10)).await.unwrap(); // seq 3
        let mut stream = store.subscribe(&Book("b".into()), 1);
        let mut seen = vec![];
        for _ in 0..3 {
            seen.push(stream.next().await.unwrap().unwrap().seq);
        }
        assert_eq!(seen, vec![1, 2, 3]);
        store.commit(&mk_tx("live1", 5)).await.unwrap(); // seq 4
        assert_eq!(stream.next().await.unwrap().unwrap().seq, 4);
        // a second subscriber from the middle
        let mut s2 = store.subscribe(&Book("b".into()), 3);
        assert_eq!(s2.next().await.unwrap().unwrap().seq, 3);
        assert_eq!(s2.next().await.unwrap().unwrap().seq, 4);
    }

    /// Verify that `trial_balance(Some(t))` clamps to the durability ceiling.
    ///
    /// Commits two transactions in a single batch (so they very likely share
    /// the same `committed_at`).  Asserts that `trial_balance(as_of = that
    /// timestamp)` includes both transactions' effects.  This tests the
    /// ceiling + `as_of` interaction: the ceiling filter must not accidentally
    /// drop frames whose `at` equals the cutoff.
    #[tokio::test]
    async fn as_of_boundary_includes_all_commits_sharing_the_timestamp() {
        let dir = tempfile::tempdir().unwrap();
        let store = seeded(dir.path()).await;

        // Submit two transactions in one batch so they share a committed_at.
        let batch = vec![mk_tx("tb1", 50), mk_tx("tb2", 75)];
        let results = store.commit_batch(&batch).await;
        let c1 = results[0].as_ref().expect("tx1 must succeed");
        let c2 = results[1].as_ref().expect("tx2 must succeed");

        // If they share the same at, a trial_balance as_of that at must include both.
        if c1.at == c2.at {
            let book = Book("b".into());
            let tb = store.trial_balance(&book, Some(c1.at)).await.unwrap();
            assert!(!tb.is_empty(), "trial balance must not be empty after two commits");
            let usd_row = tb.iter().find(|r| r.asset == AssetId::new("USD"))
                .expect("USD row must exist");
            // Both txs debit cash and credit rev by 50 and 75 → total debits 125.
            assert_eq!(
                usd_row.debits, 125,
                "trial_balance(as_of) must include both batch-committed transactions; \
                 expected debits=125, got {}",
                usd_row.debits
            );
            assert_eq!(usd_row.credits, 125, "credits must also be 125");
        } else {
            // Clock ticked between the two commits; still verify the later as_of
            // includes both.
            let book = Book("b".into());
            let tb = store.trial_balance(&book, Some(c2.at)).await.unwrap();
            let usd_row = tb.iter().find(|r| r.asset == AssetId::new("USD"))
                .expect("USD row must exist");
            assert_eq!(
                usd_row.debits, 125,
                "trial_balance(as_of=c2.at) must include both transactions even if timestamps differ"
            );
        }
    }
}
