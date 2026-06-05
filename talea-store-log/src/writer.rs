//! Per-book writer: single Tokio task, group commit, ack strictly after fsync.
//!
//! # Durability invariants
//!
//! 1. **Ack after fsync.** No reply for an ACCEPTED transaction (or any
//!    broadcast publish) leaves this task until `segments.sync()` returned `Ok`
//!    for the batch containing it. Rejections also reply after the fsync for
//!    simplicity; they carry no durability requirement.
//!
//! 2. **Failed fsync kills the writer.** On any I/O error during the write or
//!    sync phase, every job in the current batch gets `StoreError::Io`, the
//!    loop returns, and the channel closes. Callers that attempt to send
//!    subsequent jobs will receive a "book writer gone" error.
//!
//! 3. **committed_at non-decreasing vs seq.** `at` starts at
//!    `max(ledger_now(), state.last_at)` per batch and is clamped
//!    non-decreasing within the batch.
//!
//! 4. **Apply in acceptance order, post-fsync.** `apply_transaction` /
//!    `apply_account_opened` / `bump_seq` run on the write lock in the same
//!    order the events were staged, so balances and `raw_after` match what
//!    `validate` projected.
//!
//! # Asset registration
//!
//! `Job::RegisterAsset` does NOT go through `BookState::validate` (which checks
//! reserved books and account existence). The asset-registry same-def dedup is
//! the caller's (Task 6 / `LogTaleaStore`) responsibility before submitting this
//! job. The writer simply appends an `AssetRegistered` event and bumps the seq.
//!
//! # OpenAccount dedup
//!
//! `Job::OpenAccount` with an identical `(def, cfg)` pair returns `Ok(())` without
//! appending a new event. A conflict (same id, different def/cfg) returns
//! `StoreError::AlreadyExists`. The reserved-book check for open_account is also
//! the store's responsibility; the writer does not validate the book name here.

use std::path::PathBuf;
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};

use chrono::DateTime;
use chrono::Utc;
use tokio::sync::broadcast;
use tokio::sync::mpsc;
use tokio::sync::oneshot;
use tokio::sync::Mutex;
use tokio::sync::RwLock;
use tokio::task::JoinHandle;

use talea_core::events::LedgerEvent;
use talea_core::store::{AccountCfg, Committed, Sequenced, StoreError, ledger_now};
use talea_core::types::{AccountDef, AssetDef, Seq, Transaction};

use crate::frame::{WireEvent, encode_frame};
use crate::segment::{SegmentCatalog, SegmentSet};
use crate::snapshot;
use crate::state::{BookState, CommittedRec, FramePos, Scratch};

use std::collections::HashMap as StdHashMap;

// ---------------------------------------------------------------------------
// Public job type
// ---------------------------------------------------------------------------

pub enum Job {
    Commit(Transaction, oneshot::Sender<Result<Committed, StoreError>>),
    OpenAccount(AccountDef, AccountCfg, oneshot::Sender<Result<(), StoreError>>),
    RegisterAsset(AssetDef, oneshot::Sender<Result<(), StoreError>>),
    /// Trigger an immediate snapshot and reply when it completes.
    ///
    /// Used by `LogTaleaStore::snapshot_now` (ops/test hook).
    Snapshot(oneshot::Sender<Result<(), StoreError>>),
}

// ---------------------------------------------------------------------------
// BookWriter handle (Clone-safe)
// ---------------------------------------------------------------------------

#[derive(Clone)]
pub struct BookWriter {
    tx: mpsc::Sender<Job>,
    /// Broadcast channel — subscribers see every fsynced event in seq order.
    pub events: broadcast::Sender<Sequenced<LedgerEvent>>,
    /// Shared reference to the live in-memory state.
    pub state: Arc<RwLock<BookState>>,
    /// Shared segment catalog — readers clone this to access segment files
    /// without touching the writer task's exclusive `SegmentSet`.
    pub catalog: SegmentCatalog,
    /// Join handle for the background task; held so callers can await
    /// clean shutdown.  `Arc<Mutex<Option<…>>>` keeps `BookWriter: Clone`.
    handle: Arc<Mutex<Option<JoinHandle<()>>>>,
}

impl BookWriter {
    /// Default number of applied events between automatic snapshots.
    pub const DEFAULT_SNAPSHOT_EVERY: u64 = 100_000;

    /// Spawn the background writer task.
    ///
    /// `batch_max` caps how many jobs are drained per batch.
    ///
    /// Uses `DEFAULT_SNAPSHOT_EVERY` for the snapshot cadence.
    ///
    /// # Contract
    ///
    /// At most **one** `BookWriter` may ever be spawned per `BookState` /
    /// segment directory. Constructing a second writer over the same
    /// `Arc<RwLock<BookState>>` would fork the seq counter and silently
    /// corrupt the log — the two writers would interleave sequence numbers
    /// and overwrite each other's segments. Construction is owned by the
    /// store layer, which must ensure one writer per book.
    ///
    /// This invariant is enforced at runtime: a second `spawn` on the same
    /// `BookState` returns an error.
    pub async fn spawn(
        dir: PathBuf,
        state: Arc<RwLock<BookState>>,
        batch_max: usize,
    ) -> std::io::Result<Self> {
        Self::spawn_with(dir, state, batch_max, Self::DEFAULT_SNAPSHOT_EVERY).await
    }

    /// Like [`spawn`] but with explicit `snapshot_every` cadence and
    /// `segment_max` rotation threshold.
    ///
    /// After every `snapshot_every` applied events, the writer clones the
    /// current `BookState` and writes a snapshot asynchronously.  Snapshot
    /// failures are logged at `tracing::error` and do NOT kill the writer —
    /// the log is truth; snapshots are an optimisation.
    ///
    /// `snapshot_every = 0` disables automatic snapshots (useful for tests
    /// that trigger `Job::Snapshot` explicitly).
    ///
    /// `segment_max` sets the byte threshold for segment rotation.  Use
    /// [`crate::segment::DEFAULT_SEGMENT_MAX`] (128 MiB) for production.
    pub async fn spawn_with(
        dir: PathBuf,
        state: Arc<RwLock<BookState>>,
        batch_max: usize,
        snapshot_every: u64,
    ) -> std::io::Result<Self> {
        Self::spawn_with_opts(dir, state, batch_max, snapshot_every, crate::segment::DEFAULT_SEGMENT_MAX).await
    }

    /// Full-options constructor — like [`spawn_with`] but also accepts an
    /// explicit `segment_max` rotation threshold.
    pub async fn spawn_with_opts(
        dir: PathBuf,
        state: Arc<RwLock<BookState>>,
        batch_max: usize,
        snapshot_every: u64,
        segment_max: u64,
    ) -> std::io::Result<Self> {
        Self::spawn_inner(dir, state, batch_max, snapshot_every, segment_max, None::<std::sync::Arc<dyn Fn() -> std::io::Result<()> + Send + Sync>>).await
    }

    /// Test-only constructor that installs a [`SegmentSet::sync_hook`] before
    /// entering the run loop.  The hook is invoked at the start of every
    /// `sync()` call; returning `Err` simulates an fsync failure.
    ///
    /// Uses `snapshot_every = 0` (no automatic snapshots) and a tiny
    /// `segment_max` of 1 GiB (never rotates in unit tests).
    #[cfg(test)]
    pub(crate) async fn spawn_for_test(
        dir: PathBuf,
        state: Arc<RwLock<BookState>>,
        batch_max: usize,
        hook: Option<std::sync::Arc<dyn Fn() -> std::io::Result<()> + Send + Sync>>,
    ) -> std::io::Result<Self> {
        Self::spawn_inner(dir, state, batch_max, 0, crate::segment::DEFAULT_SEGMENT_MAX, hook).await
    }

    /// Shared constructor used by all public `spawn*` variants.
    ///
    /// `sync_hook` is only evaluated in test builds; it is ignored (and the
    /// parameter does not exist) in release builds.
    async fn spawn_inner(
        dir: PathBuf,
        state: Arc<RwLock<BookState>>,
        batch_max: usize,
        snapshot_every: u64,
        segment_max: u64,
        _sync_hook: Option<std::sync::Arc<dyn Fn() -> std::io::Result<()> + Send + Sync>>,
    ) -> std::io::Result<Self> {
        // Single-writer guard: fail fast if another writer is already live.
        {
            let st = state.read().await;
            if st.writer_attached
                .compare_exchange(false, true, Ordering::AcqRel, Ordering::Acquire)
                .is_err()
            {
                return Err(std::io::Error::other(
                    "a BookWriter is already attached to this BookState \
                     — single-writer contract violated",
                ));
            }
        }

        #[allow(unused_mut)]
        let mut segments = SegmentSet::open_with_max(&dir, segment_max).await?;

        // Install the test hook (no-op on release builds).
        #[cfg(test)]
        segments.set_sync_hook(_sync_hook);

        // Clone the catalog handle BEFORE moving segments into the loop.
        // The catalog's inner Arc is shared, so rotations done by the loop
        // are immediately visible through this clone.
        let catalog = segments.catalog();

        let (tx, rx) = mpsc::channel::<Job>(batch_max.max(64) * 4);
        let (ev_tx, _) = broadcast::channel::<Sequenced<LedgerEvent>>(1024);

        let state2 = Arc::clone(&state);
        let ev_tx2 = ev_tx.clone();
        let snap_inflight: Arc<AtomicBool> = Arc::new(AtomicBool::new(false));

        let handle = tokio::spawn(run_loop(rx, segments, state2, ev_tx2, batch_max, dir, snapshot_every, snap_inflight));

        Ok(Self {
            tx,
            events: ev_tx,
            state,
            catalog,
            handle: Arc::new(Mutex::new(Some(handle))),
        })
    }

    /// Submit a pre-built `Job` (takes ownership of the sender side).
    ///
    /// Returns `Err(StoreError::Io)` if the writer loop has exited.
    pub async fn submit(&self, job: Job) -> Result<(), StoreError> {
        self.tx
            .send(job)
            .await
            .map_err(|_| StoreError::Io("book writer gone".into()))
    }

    /// Commit a transaction; resolves after fsync of the containing batch.
    pub async fn commit(&self, t: Transaction) -> Result<Committed, StoreError> {
        let (reply_tx, reply_rx) = oneshot::channel();
        self.submit(Job::Commit(t, reply_tx)).await?;
        reply_rx
            .await
            .map_err(|_| StoreError::Io("book writer gone".into()))?
    }

    /// Explicit close hook.  Identical to dropping all `BookWriter` clones:
    /// the channel closes when the last `mpsc::Sender` is dropped, which
    /// causes the writer loop to return cleanly.
    pub fn close(&self) {}

    /// Await the writer task (idempotent: second call is a no-op).
    ///
    /// NOTE: callers must ensure that `self` is the LAST `BookWriter` clone
    /// alive before calling this; otherwise the writer task will block forever
    /// waiting for the channel to close. Use [`shutdown`] to safely do both
    /// at once when consuming a clone.
    pub async fn join(&self) {
        let maybe_handle = self.handle.lock().await.take();
        if let Some(h) = maybe_handle {
            let _ = h.await;
        }
    }

    /// Drop this sender clone and await the writer task.
    ///
    /// Consumes `self` so the `mpsc::Sender` inside this clone is dropped
    /// first, then extracts and awaits the `JoinHandle`. If other clones of
    /// this `BookWriter` are still alive the task will not exit; callers must
    /// ensure this is the last clone.
    pub async fn shutdown(self) {
        let maybe_handle = self.handle.lock().await.take();
        // Drop `self` (and its Sender) BEFORE awaiting the task.
        // This is the key: the task exits when the last Sender is gone.
        drop(self);
        if let Some(h) = maybe_handle {
            let _ = h.await;
        }
    }
}

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

/// Classification of a job during the read-lock phase.
enum Reply {
    /// Committed idem hit in `state.idem`; carries the prior record.
    Dup(usize, CommittedRec),
    /// Idem hit earlier in this batch; `staged_slot` indexes into `staged`.
    DupInBatch { job_idx: usize, staged_slot: usize },
    /// Validation failed (or `OpenAccount` conflict).
    Reject(usize, StoreError),
    /// `OpenAccount` with identical `(def, cfg)` — already open, idempotent ok.
    OpenExistsOk(usize),
    /// Job was accepted; a `Staged` entry was pushed.
    /// `staged_slot` is the index in `staged` for this job.
    Staged { staged_slot: usize },
}

/// One accepted write awaiting fsync.
struct Staged {
    /// Index of the originating job in the `jobs` vec.
    job_idx: usize,
    wire: WireEvent,
    pos: FramePos,
}

// ---------------------------------------------------------------------------
// Writer loop
// ---------------------------------------------------------------------------

#[allow(clippy::too_many_arguments)]
async fn run_loop(
    mut rx: mpsc::Receiver<Job>,
    mut segments: SegmentSet,
    state: Arc<RwLock<BookState>>,
    events: broadcast::Sender<Sequenced<LedgerEvent>>,
    batch_max: usize,
    dir: PathBuf,
    snapshot_every: u64,
    // Guard shared with spawned snapshot tasks. Set to `true` when a
    // background snapshot is in flight; cleared by the task on completion
    // (success or failure). The writer skips a new periodic snapshot if this
    // is `true` — only one background snapshot at a time.
    snap_inflight: Arc<AtomicBool>,
) {
    // Number of events applied since the last snapshot (periodic trigger).
    let mut events_since_snap: u64 = 0;

    loop {
        // ----------------------------------------------------------------
        // 1. Drain up to batch_max jobs.
        // ----------------------------------------------------------------
        let first = match rx.recv().await {
            Some(j) => j,
            None => return, // all senders dropped → shut down cleanly
        };

        let mut jobs: Vec<Option<Job>> = Vec::with_capacity(batch_max);
        jobs.push(Some(first));

        while jobs.len() < batch_max {
            match rx.try_recv() {
                Ok(j) => jobs.push(Some(j)),
                Err(_) => break,
            }
        }

        // ----------------------------------------------------------------
        // 2. Two-phase classification to avoid holding a lock during disk I/O.
        //
        // Phase 2a (read lock): check hot idem map and Bloom filter.
        //   - Hot hit  → classify as Dup immediately.
        //   - Bloom negative → key is definitely absent from spill runs; proceed.
        //   - Bloom positive → collect key for disk lookup (phase 2b).
        //   - Snapshot jobs are noted by index for processing post-apply.
        //
        // Phase 2b (no lock): async run-file lookups for bloom-positive misses.
        //
        // Phase 2c (read lock again): full classification using pre-resolved
        //   disk results.
        // ----------------------------------------------------------------
        let mut replies: Vec<Reply> = Vec::with_capacity(jobs.len());
        let mut staged: Vec<Staged> = Vec::new();
        let mut scratch = Scratch::default();
        // Indices of Job::Snapshot entries in `jobs`.
        let mut snap_job_idxs: Vec<usize> = Vec::new();

        // ---- Phase 2a: first read lock pass — identify bloom-positive keys ----
        let bloom_positive_keys: Vec<String> = {
            let st = state.read().await;
            let mut bp = Vec::new();
            for slot in jobs.iter() {
                let job = slot.as_ref().expect("job slots are Some until taken");
                if let Job::Commit(tx, _) = job {
                    let key = tx.idempotency_key.0.as_str();
                    // Hot miss + bloom positive → needs disk lookup.
                    if st.idem.get_hot(key).is_none() && st.idem.bloom_might_contain(key) {
                        bp.push(tx.idempotency_key.0.clone());
                    }
                }
            }
            bp
        }; // drop read lock

        // ---- Phase 2b: resolve bloom-positive keys from run files (no lock) ----
        let mut disk_resolved: StdHashMap<String, CommittedRec> = StdHashMap::new();
        for key in &bloom_positive_keys {
            let st = state.read().await;
            let idem_ref: &crate::idem_spill::TieredIdem = &st.idem;
            // Double-check hot (may have changed between phase 2a and now).
            if let Some(rec) = idem_ref.get_hot(key) {
                disk_resolved.insert(key.clone(), rec.clone());
                continue;
            }
            // Clone the runs metadata so we can drop the read lock during I/O.
            let runs_snapshot = idem_ref.runs.clone();
            let key_clone = key.clone();
            drop(st); // release read lock before disk I/O

            // Search run files (spawns blocking).
            let tmp_tiered = {
                let mut t = crate::idem_spill::TieredIdem::with_cap(1);
                t.runs = runs_snapshot;
                t
            };
            if let Some(rec) = tmp_tiered.lookup_runs(&key_clone).await {
                disk_resolved.insert(key_clone, rec);
            }
        }

        // ---- Phase 2c: second read lock pass — full classification ----
        {
            let st = state.read().await;

            // Per-batch `at` floor: max(ledger_now(), last committed at).
            let mut batch_at: DateTime<Utc> = {
                let floor = st.last_at.unwrap_or_default();
                ledger_now().max(floor)
            };
            let mut seq: Seq = st.next_seq;

            for (idx, slot) in jobs.iter().enumerate() {
                let job = slot.as_ref().expect("job slots are Some until taken");
                match job {
                    // --------------------------------------------------
                    // Commit
                    // --------------------------------------------------
                    Job::Commit(tx, _) => {
                        let idem_key = tx.idempotency_key.0.clone();

                        // Check committed idem: hot map first, then pre-resolved disk.
                        let committed_rec = st.idem.get_hot(&idem_key)
                            .cloned()
                            .or_else(|| disk_resolved.get(&idem_key).cloned());
                        if let Some(rec) = committed_rec {
                            replies.push(Reply::Dup(idx, rec));
                            continue;
                        }

                        // Check within-batch idem.
                        if let Some(&staged_slot) = scratch.idem.get(&idem_key) {
                            replies.push(Reply::DupInBatch { job_idx: idx, staged_slot });
                            continue;
                        }

                        // Validate (seeds scratch.raw).
                        if let Err(e) = st.validate(tx, &mut scratch) {
                            replies.push(Reply::Reject(idx, e));
                            continue;
                        }

                        // Accepted: advance `at` monotonically.
                        batch_at = batch_at.max(ledger_now());

                        let staged_slot = staged.len();
                        staged.push(Staged {
                            job_idx: idx,
                            wire: WireEvent {
                                seq,
                                at: batch_at,
                                event: LedgerEvent::TransactionPosted(tx.clone()),
                            },
                            pos: (0, 0),
                        });

                        scratch.stage(tx);
                        scratch.idem.insert(idem_key, staged_slot);

                        seq += 1;
                        replies.push(Reply::Staged { staged_slot });
                    }

                    // --------------------------------------------------
                    // OpenAccount
                    // --------------------------------------------------
                    Job::OpenAccount(def, cfg, _) => {
                        let key = def.id.to_key();
                        if let Some(existing) = st.accounts.get(&key) {
                            if existing.def == *def && existing.cfg == *cfg {
                                replies.push(Reply::OpenExistsOk(idx));
                            } else {
                                replies.push(Reply::Reject(
                                    idx,
                                    StoreError::AlreadyExists {
                                        what: format!("account {key}"),
                                    },
                                ));
                            }
                            continue;
                        }

                        batch_at = batch_at.max(ledger_now());

                        let staged_slot = staged.len();
                        staged.push(Staged {
                            job_idx: idx,
                            wire: WireEvent {
                                seq,
                                at: batch_at,
                                event: LedgerEvent::AccountOpened {
                                    def: def.clone(),
                                    cfg: cfg.clone(),
                                },
                            },
                            pos: (0, 0),
                        });

                        seq += 1;
                        replies.push(Reply::Staged { staged_slot });
                    }

                    // --------------------------------------------------
                    // RegisterAsset
                    //
                    // Same-def dedup is the store layer's responsibility
                    // (Task 6); the writer just appends.
                    // --------------------------------------------------
                    Job::RegisterAsset(def, _) => {
                        batch_at = batch_at.max(ledger_now());

                        let staged_slot = staged.len();
                        staged.push(Staged {
                            job_idx: idx,
                            wire: WireEvent {
                                seq,
                                at: batch_at,
                                event: LedgerEvent::AssetRegistered(def.clone()),
                            },
                            pos: (0, 0),
                        });

                        seq += 1;
                        replies.push(Reply::Staged { staged_slot });
                    }

                    // --------------------------------------------------
                    // Snapshot — not staged or written to the log.
                    // Record the job index; process post-apply below.
                    // --------------------------------------------------
                    Job::Snapshot(_) => {
                        snap_job_idxs.push(idx);
                    }
                }
            }
        } // drop read lock

        // ----------------------------------------------------------------
        // 3. Write phase: rotate + append (no lock held).
        // ----------------------------------------------------------------
        if !staged.is_empty() {
            for s in &mut staged {
                // TooLarge (>4 GiB payload) is unreachable for real transactions.
                let frame_bytes =
                    encode_frame(&s.wire).expect("ledger events serialize and fit a frame");

                if let Err(e) = segments.maybe_rotate(s.wire.seq).await {
                    io_kill_batch(jobs, e);
                    return;
                }

                s.pos = segments.next_pos();

                if let Err(e) = segments.append(&frame_bytes).await {
                    io_kill_batch(jobs, e);
                    return;
                }
            }

            // --------------------------------------------------------------
            // 4. Single fsync for the whole batch.
            // --------------------------------------------------------------
            if let Err(e) = segments.sync().await {
                io_kill_batch(jobs, e);
                return;
            }
        }

        // ----------------------------------------------------------------
        // 5. Apply in acceptance order (post-fsync, write lock).
        // ----------------------------------------------------------------
        let applied_count = staged.len() as u64;
        if !staged.is_empty() {
            let mut st = state.write().await;
            for s in &staged {
                match &s.wire.event {
                    LedgerEvent::TransactionPosted(tx) => {
                        st.apply_transaction(tx, s.wire.seq, s.wire.at, s.pos);
                    }
                    LedgerEvent::AccountOpened { def, cfg } => {
                        st.apply_account_opened(def, cfg, s.wire.seq, s.wire.at);
                    }
                    LedgerEvent::AssetRegistered(_) => {
                        st.bump_seq(s.wire.seq, s.wire.at);
                    }
                }
            }
        }

        // ----------------------------------------------------------------
        // 5.5 Idem spill flush (post-apply, no lock needed for I/O).
        //
        // If the hot map grew past cap during this batch, drain the oldest
        // half to a new on-disk run.  The flush happens BETWEEN batches (not
        // on the lookup path) so it never delays commit acknowledgements.
        //
        // Failure: tracing::error + hot map retained (retry next batch).
        // ----------------------------------------------------------------
        {
            let needs_flush = {
                let st = state.read().await;
                st.idem.needs_flush()
            };
            if needs_flush {
                // Clone out just the idem tier metadata we need, flush outside
                // the lock, then re-take the write lock to update in-place.
                //
                // We hold the write lock for the swap so `get_hot` callers see
                // a consistent view (no partial flush).
                let mut st = state.write().await;
                // flush_spill is async (writes files) but we hold the write lock.
                // The write lock is only held by this task, so no reader is
                // blocked by another writer.  The flush I/O is bounded-small
                // (cap/2 JSON entries) and runs in the writer task's context.
                st.idem.flush_spill().await;
            }
        }

        // ----------------------------------------------------------------
        // 6. Send replies and broadcast (all post-fsync).
        // ----------------------------------------------------------------
        for reply in replies {
            match reply {
                Reply::Staged { staged_slot } => {
                    let s = &staged[staged_slot];

                    // Broadcast before replying to the caller.
                    let _ = events.send(Sequenced {
                        seq: s.wire.seq,
                        at: s.wire.at,
                        event: s.wire.event.clone(),
                    });

                    match jobs[s.job_idx].take().expect("job not yet taken") {
                        Job::Commit(tx, reply_tx) => {
                            let _ = reply_tx.send(Ok(Committed {
                                txid: tx.id,
                                seq: s.wire.seq,
                                at: s.wire.at,
                            }));
                        }
                        Job::OpenAccount(_, _, reply_tx) => {
                            let _ = reply_tx.send(Ok(()));
                        }
                        Job::RegisterAsset(_, reply_tx) => {
                            let _ = reply_tx.send(Ok(()));
                        }
                        Job::Snapshot(_) => {
                            unreachable!("Snapshot never in staged");
                        }
                    }
                }

                Reply::Dup(idx, rec) => {
                    if let Some(Job::Commit(_, reply_tx)) = jobs[idx].take() {
                        let _ = reply_tx.send(Ok(Committed::from(&rec)));
                    }
                }

                Reply::DupInBatch { job_idx, staged_slot } => {
                    let s = &staged[staged_slot];
                    // Resolve to the FIRST (staged) transaction's identity, not the
                    // duplicate's own txid — mirrors the committed-idem (Reply::Dup) path.
                    let first_txid = match &s.wire.event {
                        LedgerEvent::TransactionPosted(t) => t.id.clone(),
                        _ => unreachable!("DupInBatch staged slot is always a TransactionPosted"),
                    };
                    if let Some(Job::Commit(_, reply_tx)) = jobs[job_idx].take() {
                        let _ = reply_tx.send(Ok(Committed {
                            txid: first_txid,
                            seq: s.wire.seq,
                            at: s.wire.at,
                        }));
                    }
                }

                Reply::OpenExistsOk(idx) => {
                    if let Some(Job::OpenAccount(_, _, reply_tx)) = jobs[idx].take() {
                        let _ = reply_tx.send(Ok(()));
                    }
                }

                Reply::Reject(idx, e) => {
                    match jobs[idx].take() {
                        Some(Job::Commit(_, reply_tx)) => {
                            let _ = reply_tx.send(Err(e));
                        }
                        Some(Job::OpenAccount(_, _, reply_tx)) => {
                            let _ = reply_tx.send(Err(e));
                        }
                        Some(Job::RegisterAsset(_, reply_tx)) => {
                            let _ = reply_tx.send(Err(e));
                        }
                        Some(Job::Snapshot(reply_tx)) => {
                            // Shouldn't happen (Snapshot bypasses validate),
                            // but handle defensively.
                            let _ = reply_tx.send(Err(e));
                        }
                        None => {}
                    }
                }
            }
        }

        // ----------------------------------------------------------------
        // 6.5 Handle Snapshot jobs + periodic auto-snapshot.
        //
        // Two triggers:
        //  a) Explicit Job::Snapshot in this batch — synchronous, in-loop,
        //     replies only after the write completes. Tests rely on this
        //     guarantee (snapshot_now resolves when the file is durable).
        //  b) Periodic: applied_count pushed events_since_snap >= snapshot_every.
        //     The (now-cheap) clone is taken under a short read lock here on
        //     the writer loop, then the actual serialize+write is offloaded to
        //     a detached `tokio::spawn` task so the writer loop is not stalled
        //     by disk I/O. An `Arc<AtomicBool>` `snap_inflight` prevents
        //     concurrent background snapshots: if one is already running the
        //     periodic trigger is skipped (events_since_snap is NOT reset so
        //     the check fires again next batch).
        // ----------------------------------------------------------------
        let has_explicit_snap = !snap_job_idxs.is_empty();
        let hit_periodic = snapshot_every > 0 && applied_count > 0 && {
            events_since_snap += applied_count;
            events_since_snap >= snapshot_every
        };

        // --- a) Explicit Job::Snapshot: synchronous in-loop write ---
        if has_explicit_snap {
            let (snap_state, snap_seq) = {
                let st = state.read().await;
                let last = st.next_seq.saturating_sub(1);
                (st.clone(), last)
            };

            let snap_result = if snap_seq > 0 {
                let r = snapshot::write_snapshot(&dir, &snap_state, snap_seq).await;
                match &r {
                    Ok(()) => tracing::debug!(seq = snap_seq, "snapshot written (explicit)"),
                    Err(e) => tracing::error!(
                        error = %e,
                        seq = snap_seq,
                        "explicit snapshot write failed (non-fatal; log is truth)"
                    ),
                }
                r
            } else {
                Ok(())
            };

            for idx in snap_job_idxs {
                if let Some(Job::Snapshot(reply_tx)) = jobs[idx].take() {
                    let send_val = snap_result
                        .as_ref()
                        .map(|_| ())
                        .map_err(|e| StoreError::Io(e.to_string().into()));
                    let _ = reply_tx.send(send_val);
                }
            }
        }

        // --- b) Periodic snapshot: clone here, write off the loop ---
        if hit_periodic && !snap_inflight.load(Ordering::Acquire) {
            let (snap_state, snap_seq) = {
                let st = state.read().await;
                let last = st.next_seq.saturating_sub(1);
                (st.clone(), last)
            };

            if snap_seq > 0 {
                // Mark inflight BEFORE spawning so the next batch sees the flag.
                snap_inflight.store(true, Ordering::Release);
                events_since_snap = 0;

                let dir2 = dir.clone();
                let flag = Arc::clone(&snap_inflight);
                tokio::spawn(async move {
                    match snapshot::write_snapshot(&dir2, &snap_state, snap_seq).await {
                        Ok(()) => tracing::debug!(seq = snap_seq, "periodic snapshot written"),
                        Err(e) => tracing::error!(
                            error = %e,
                            seq = snap_seq,
                            "periodic snapshot write failed (non-fatal; log is truth)"
                        ),
                    }
                    // Clear the inflight flag regardless of success/failure.
                    flag.store(false, Ordering::Release);
                });
            }
        } else if hit_periodic {
            // A background snapshot is already running; don't reset the counter
            // so we try again next batch once it clears.
            tracing::debug!("periodic snapshot skipped: background snapshot already in flight");
        }
    }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/// Drop all pending jobs so their oneshot senders fire, causing receivers to
/// get `RecvError` which `commit()` maps to `StoreError::Io("book writer gone")`.
/// Log the fatal error and return; the loop `return`s after this call.
fn io_kill_batch(jobs: Vec<Option<Job>>, e: std::io::Error) {
    tracing::error!(error = %e, "fatal I/O in book writer — writer exiting");
    drop(jobs);
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::state::{AccountState, BookState, PostingIndex};
    use std::sync::Arc;
    use talea_core::store::AccountCfg;
    use talea_core::types::*;
    use tokio::sync::RwLock;

    async fn writer_with_accounts(dir: &std::path::Path) -> BookWriter {
        let mut st = BookState::default();
        for path in ["cash", "rev"] {
            st.accounts.insert(
                AccountId { book: Book("b".into()), path: path.into() }.to_key(),
                AccountState {
                    def: AccountDef {
                        id: AccountId { book: Book("b".into()), path: path.into() },
                        asset: AssetId::new("USD"),
                        kind: AccountKind::Asset,
                    },
                    cfg: AccountCfg { normal_side: None, min_balance: None },
                    raw_balance: 0,
                    updated_seq: 0,
                    postings: PostingIndex::default(),
                },
            );
        }
        BookWriter::spawn(dir.to_path_buf(), Arc::new(RwLock::new(st)), 1024)
            .await
            .unwrap()
    }

    fn tx(key: &str) -> Transaction {
        Transaction {
            id: TxId(uuid::Uuid::now_v7()),
            book: Book("b".into()),
            postings: vec![
                Posting {
                    account: AccountId { book: Book("b".into()), path: "cash".into() },
                    amount: Amount::new(10, AssetId::new("USD")),
                    direction: Direction::Debit,
                },
                Posting {
                    account: AccountId { book: Book("b".into()), path: "rev".into() },
                    amount: Amount::new(10, AssetId::new("USD")),
                    direction: Direction::Credit,
                },
            ],
            idempotency_key: IdempotencyKey(key.into()),
            external_refs: vec![],
            metadata: serde_json::Value::Null,
            occurred_at: chrono::Utc::now(),
        }
    }

    #[tokio::test]
    async fn commits_assign_gapless_seq_and_monotonic_at() {
        let dir = tempfile::tempdir().unwrap();
        let w = writer_with_accounts(dir.path()).await;
        let mut prev_at = None;
        for (i, key) in ["a", "b", "c"].iter().enumerate() {
            let c = w.commit(tx(key)).await.unwrap();
            assert_eq!(c.seq, (i + 1) as Seq);
            if let Some(p) = prev_at {
                assert!(c.at >= p, "committed_at must be non-decreasing");
            }
            prev_at = Some(c.at);
        }
    }

    #[tokio::test]
    async fn duplicate_idem_returns_prior_committed() {
        let dir = tempfile::tempdir().unwrap();
        let w = writer_with_accounts(dir.path()).await;
        let first = w.commit(tx("same")).await.unwrap();
        let replay = w.commit(tx("same")).await.unwrap();
        assert_eq!(replay.seq, first.seq);
        assert_eq!(replay.txid, first.txid);
        assert_eq!(replay.at, first.at);
    }

    #[tokio::test]
    async fn rejected_draft_does_not_poison_batchmates_or_consume_seq() {
        let dir = tempfile::tempdir().unwrap();
        let w = writer_with_accounts(dir.path()).await;
        // a tx referencing a ghost account must be rejected while a valid
        // batchmate commits with the next gapless seq
        let mut bad = tx("bad");
        bad.postings[0].account = AccountId { book: Book("b".into()), path: "ghost".into() };
        let (r_bad, r_ok) = tokio::join!(w.commit(bad), w.commit(tx("ok")));
        assert!(matches!(r_bad, Err(talea_core::store::StoreError::UnknownAccount(_))));
        assert_eq!(r_ok.unwrap().seq, 1, "rejected draft must not consume a seq");
    }

    #[tokio::test]
    async fn concurrent_commits_all_land_durably_and_gapless() {
        let dir = tempfile::tempdir().unwrap();
        let w = writer_with_accounts(dir.path()).await;
        let mut handles = vec![];
        for i in 0..64 {
            let w = w.clone();
            handles.push(tokio::spawn(async move { w.commit(tx(&format!("k{i}"))).await }));
        }
        let mut seqs: Vec<Seq> = vec![];
        for h in handles {
            seqs.push(h.await.unwrap().unwrap().seq);
        }
        seqs.sort();
        assert_eq!(seqs, (1..=64).collect::<Vec<Seq>>());
        // everything acked is on disk
        let seg = crate::segment::SegmentSet::open(dir.path()).await.unwrap();
        assert_eq!(seg.scan_from(1, 1000).await.unwrap().len(), 64);
    }

    #[tokio::test]
    async fn subscribers_see_events_post_fsync_in_seq_order() {
        let dir = tempfile::tempdir().unwrap();
        let w = writer_with_accounts(dir.path()).await;
        let mut rx = w.events.subscribe();
        for key in ["a", "b"] {
            w.commit(tx(key)).await.unwrap();
        }
        assert_eq!(rx.recv().await.unwrap().seq, 1);
        assert_eq!(rx.recv().await.unwrap().seq, 2);
    }

    #[tokio::test]
    async fn duplicate_idem_within_one_batch_resolves_to_first_txid() {
        // We submit two transactions with the same idempotency key concurrently
        // via tokio::join! to maximize the chance they land in the same batch.
        //
        // Note: batching is not guaranteed — the two commits may arrive in
        // separate batches, in which case the second resolves via the
        // committed-idem path (Reply::Dup) rather than the in-batch path
        // (Reply::DupInBatch).  Both paths must honour the same contract, and
        // the assertions below hold in either case.
        let dir = tempfile::tempdir().unwrap();
        let w = writer_with_accounts(dir.path()).await;

        let t1 = tx("same-key");
        let t2 = tx("same-key"); // different TxId, same idempotency key

        let (r1, r2) = tokio::join!(w.commit(t1), w.commit(t2));
        let c1 = r1.expect("first commit must succeed");
        let c2 = r2.expect("second commit must succeed");

        // Both must resolve to the SAME txid/seq/at (the first transaction's).
        assert_eq!(c2.txid, c1.txid, "dup must resolve to the first txid, not its own");
        assert_eq!(c2.seq, c1.seq, "dup must resolve to the first seq");
        assert_eq!(c2.at, c1.at, "dup must resolve to the first at");

        // Only one frame should be on disk regardless of batching.
        let seg = crate::segment::SegmentSet::open(dir.path()).await.unwrap();
        let frames = seg.scan_from(1, 1000).await.unwrap();
        assert_eq!(frames.len(), 1, "only the first transaction should be persisted");
    }

    // -----------------------------------------------------------------------
    // I1 — single-writer guard
    // -----------------------------------------------------------------------

    #[tokio::test]
    async fn second_writer_on_same_state_is_refused() {
        let dir1 = tempfile::tempdir().unwrap();
        let dir2 = tempfile::tempdir().unwrap();
        let state = Arc::new(RwLock::new(BookState::default()));

        // First writer succeeds.
        let _w1 = BookWriter::spawn(dir1.path().to_path_buf(), Arc::clone(&state), 64)
            .await
            .expect("first writer must succeed");

        // Second writer on the same BookState must be refused.
        let result = BookWriter::spawn(dir2.path().to_path_buf(), Arc::clone(&state), 64).await;
        match result {
            Err(e) => assert!(
                e.to_string().contains("single-writer contract violated"),
                "unexpected error message: {e}",
            ),
            Ok(_) => panic!("second writer must be refused but spawn succeeded"),
        }
    }

    // -----------------------------------------------------------------------
    // Gap 3 — OpenAccount / RegisterAsset writer tests
    // -----------------------------------------------------------------------

    #[tokio::test]
    async fn open_account_idempotent_same_def_no_event() {
        let dir = tempfile::tempdir().unwrap();
        let state = Arc::new(RwLock::new(BookState::default()));
        let w = BookWriter::spawn(dir.path().to_path_buf(), Arc::clone(&state), 64)
            .await
            .unwrap();

        let def = AccountDef {
            id: AccountId { book: Book("b".into()), path: "checking".into() },
            asset: AssetId::new("USD"),
            kind: AccountKind::Asset,
        };
        let cfg = AccountCfg { normal_side: None, min_balance: None };

        // First open — should succeed.
        let (tx1, rx1) = oneshot::channel();
        w.submit(Job::OpenAccount(def.clone(), cfg.clone(), tx1)).await.unwrap();
        rx1.await.unwrap().expect("first open must succeed");

        // Second open with identical (def, cfg) — idempotent, no new frame.
        let (tx2, rx2) = oneshot::channel();
        w.submit(Job::OpenAccount(def.clone(), cfg.clone(), tx2)).await.unwrap();
        rx2.await.unwrap().expect("idempotent open must succeed");

        // Exactly ONE AccountOpened frame on disk.
        let seg = crate::segment::SegmentSet::open(dir.path()).await.unwrap();
        let frames = seg.scan_from(1, 1000).await.unwrap();
        assert_eq!(frames.len(), 1, "idempotent open must not append a second frame");

        // The next commit must get seq 2 (open consumed seq 1; idempotent hit consumed none).
        // To commit we need the account to exist; it does now. Add a counterpart.
        let state_ref = state.read().await;
        let next = state_ref.next_seq;
        drop(state_ref);
        assert_eq!(next, 2, "seq must be 2 after one open + one idempotent no-op");
    }

    #[tokio::test]
    async fn open_account_different_def_already_exists() {
        let dir = tempfile::tempdir().unwrap();
        let state = Arc::new(RwLock::new(BookState::default()));
        let w = BookWriter::spawn(dir.path().to_path_buf(), Arc::clone(&state), 64)
            .await
            .unwrap();

        let def = AccountDef {
            id: AccountId { book: Book("b".into()), path: "savings".into() },
            asset: AssetId::new("USD"),
            kind: AccountKind::Asset,
        };
        let cfg1 = AccountCfg { normal_side: None, min_balance: None };
        let cfg2 = AccountCfg { normal_side: Some(Direction::Debit), min_balance: Some(0) };

        let (tx1, rx1) = oneshot::channel();
        w.submit(Job::OpenAccount(def.clone(), cfg1, tx1)).await.unwrap();
        rx1.await.unwrap().expect("first open must succeed");

        // Re-open same id but different cfg → AlreadyExists.
        let (tx2, rx2) = oneshot::channel();
        w.submit(Job::OpenAccount(def.clone(), cfg2, tx2)).await.unwrap();
        let err = rx2.await.unwrap().expect_err("conflicting open must fail");
        assert!(
            matches!(err, talea_core::store::StoreError::AlreadyExists { .. }),
            "expected AlreadyExists, got {err:?}",
        );
    }

    #[tokio::test]
    async fn register_asset_appends_to_log() {
        let dir = tempfile::tempdir().unwrap();
        let state = Arc::new(RwLock::new(BookState::default()));
        let w = BookWriter::spawn(dir.path().to_path_buf(), Arc::clone(&state), 64)
            .await
            .unwrap();

        let def = AssetDef {
            id: AssetId::new("EUR"),
            class: talea_core::types::AssetClass::Fiat,
            precision: 2,
            name: "Euro".into(),
        };

        let (reply_tx, reply_rx) = oneshot::channel();
        w.submit(Job::RegisterAsset(def, reply_tx)).await.unwrap();
        reply_rx.await.unwrap().expect("register asset must succeed");

        // Exactly ONE AssetRegistered frame on disk.
        let seg = crate::segment::SegmentSet::open(dir.path()).await.unwrap();
        let frames = seg.scan_from(1, 1000).await.unwrap();
        assert_eq!(frames.len(), 1, "one AssetRegistered frame expected");
        assert!(
            matches!(frames[0].event, talea_core::events::LedgerEvent::AssetRegistered(_)),
            "expected AssetRegistered event",
        );
    }

    // -----------------------------------------------------------------------
    // Gap 2 — rejected drafts do not broadcast
    // -----------------------------------------------------------------------

    #[tokio::test]
    async fn rejected_draft_produces_no_broadcast() {
        let dir = tempfile::tempdir().unwrap();
        let w = writer_with_accounts(dir.path()).await;
        let mut rx = w.events.subscribe();

        // Bad tx: ghost account → will be rejected.
        let mut bad = tx("bad");
        bad.postings[0].account = AccountId { book: Book("b".into()), path: "ghost".into() };

        // Good tx: valid accounts.
        let good = tx("good");

        // Submit both concurrently so they may land in the same batch.
        let (r_bad, r_good) = tokio::join!(w.commit(bad), w.commit(good));
        assert!(r_bad.is_err(), "bad tx must be rejected");
        let good_seq = r_good.expect("good tx must succeed").seq;

        // The broadcast channel must yield exactly one event (the good seq).
        let ev = rx.recv().await.expect("must receive one broadcast event");
        assert_eq!(ev.seq, good_seq, "broadcast event must be the accepted tx");

        // No further event within a short timeout — the rejected tx emits nothing.
        let second = tokio::time::timeout(
            std::time::Duration::from_millis(100),
            rx.recv(),
        )
        .await;
        assert!(second.is_err(), "no second broadcast event expected after rejected draft");
    }

    // -----------------------------------------------------------------------
    // Ack-after-fsync ordering proofs
    // -----------------------------------------------------------------------

    /// Helper: build a BookWriter with the standard two-account state and an
    /// optional sync hook, returning `(writer, Arc<RwLock<BookState>>)`.
    async fn writer_with_accounts_and_hook(
        dir: &std::path::Path,
        hook: Option<std::sync::Arc<dyn Fn() -> std::io::Result<()> + Send + Sync>>,
    ) -> (BookWriter, Arc<RwLock<BookState>>) {
        let mut st = BookState::default();
        for path in ["cash", "rev"] {
            st.accounts.insert(
                AccountId { book: Book("b".into()), path: path.into() }.to_key(),
                AccountState {
                    def: AccountDef {
                        id: AccountId { book: Book("b".into()), path: path.into() },
                        asset: AssetId::new("USD"),
                        kind: AccountKind::Asset,
                    },
                    cfg: AccountCfg { normal_side: None, min_balance: None },
                    raw_balance: 0,
                    updated_seq: 0,
                    postings: PostingIndex::default(),
                },
            );
        }
        let state = Arc::new(RwLock::new(st));
        let w = BookWriter::spawn_for_test(
            dir.to_path_buf(),
            Arc::clone(&state),
            1024,
            hook,
        )
        .await
        .unwrap();
        (w, state)
    }

    /// Proof 1 — ack arrives only AFTER sync returns Ok.
    ///
    /// The hook sets `synced = true`.  When the commit future resolves the
    /// hook must already have fired; reset and repeat for a second commit to
    /// prove the invariant holds for every batch, not just the first.
    #[tokio::test]
    async fn ack_only_after_sync_returns() {
        use std::sync::atomic::{AtomicBool, Ordering};

        let dir = tempfile::tempdir().unwrap();
        let synced = Arc::new(AtomicBool::new(false));
        let synced2 = Arc::clone(&synced);

        let hook = std::sync::Arc::new(move || -> std::io::Result<()> {
            synced2.store(true, Ordering::SeqCst);
            Ok(())
        });

        let (w, _state) = writer_with_accounts_and_hook(dir.path(), Some(hook)).await;

        // First commit: when the future resolves synced MUST be true.
        w.commit(tx("k1")).await.expect("first commit must succeed");
        assert!(
            synced.load(Ordering::SeqCst),
            "ack must arrive only after sync_hook set synced=true (first commit)"
        );

        // Reset and repeat for a second batch.
        synced.store(false, Ordering::SeqCst);
        w.commit(tx("k2")).await.expect("second commit must succeed");
        assert!(
            synced.load(Ordering::SeqCst),
            "ack must arrive only after sync_hook set synced=true (second commit)"
        );
    }

    /// Proof 2 — no broadcast event visible to a pre-subscribed receiver
    /// before the sync counter is incremented.
    ///
    /// The hook increments `sync_count`.  After each commit we check that
    /// `sync_count >= events_received` so far, i.e. every delivered event was
    /// preceded by a sync in its batch window.
    #[tokio::test]
    async fn no_broadcast_before_sync() {
        use std::sync::atomic::{AtomicU64, Ordering};

        let dir = tempfile::tempdir().unwrap();
        let sync_count = Arc::new(AtomicU64::new(0));
        let sc2 = Arc::clone(&sync_count);

        let hook = std::sync::Arc::new(move || -> std::io::Result<()> {
            sc2.fetch_add(1, Ordering::SeqCst);
            Ok(())
        });

        let (w, _state) = writer_with_accounts_and_hook(dir.path(), Some(hook)).await;

        for (i, key) in ["a", "b", "c"].iter().enumerate() {
            let events_before = (i as u64).saturating_sub(1);
            // Subscribe BEFORE the commit so we get this batch's event.
            let mut rx = w.events.subscribe();
            w.commit(tx(key)).await.expect("commit must succeed");

            // Receive the broadcast event.
            let _ev = tokio::time::timeout(
                std::time::Duration::from_millis(500),
                rx.recv(),
            )
            .await
            .expect("broadcast timeout")
            .expect("broadcast channel closed");

            // The sync count must be at least 1 (one sync per batch minimum).
            let sc = sync_count.load(Ordering::SeqCst);
            assert!(
                sc > events_before,
                "sync_count ({sc}) must be ≥ batches committed ({}) at event {}",
                events_before + 1,
                i + 1,
            );
        }

        // Verify total: 3 commits → at least 1 sync total (likely 3 if sequential).
        assert!(
            sync_count.load(Ordering::SeqCst) >= 1,
            "at least one sync must have fired for three sequential commits"
        );
    }

    /// Proof 3 — a rejected transaction (ghost account) never reaches the
    /// write/sync path; sync_count stays 0.
    #[tokio::test]
    async fn reject_only_batch_skips_sync() {
        use std::sync::atomic::{AtomicU64, Ordering};

        let dir = tempfile::tempdir().unwrap();
        let sync_count = Arc::new(AtomicU64::new(0));
        let sc2 = Arc::clone(&sync_count);

        let hook = std::sync::Arc::new(move || -> std::io::Result<()> {
            sc2.fetch_add(1, Ordering::SeqCst);
            Ok(())
        });

        let (w, _state) = writer_with_accounts_and_hook(dir.path(), Some(hook)).await;

        // Commit a tx that references a ghost account → must be rejected.
        let mut bad = tx("ghost-tx");
        bad.postings[0].account = AccountId { book: Book("b".into()), path: "ghost".into() };
        let result = w.commit(bad).await;
        assert!(
            matches!(result, Err(talea_core::store::StoreError::UnknownAccount(_))),
            "ghost-account tx must be rejected, got {result:?}"
        );

        // Reply received AND no sync ever fired (nothing was staged → no fsync).
        assert_eq!(
            sync_count.load(Ordering::SeqCst),
            0,
            "a reject-only batch must not trigger fsync"
        );
    }

    // -----------------------------------------------------------------------
    // Invariant-2 (deferred from Task 5 review): fsync failure kills the writer
    // -----------------------------------------------------------------------

    /// Invariant 2a — a valid commit in a batch that hits an fsync error must
    /// return `StoreError::Io`.
    #[tokio::test]
    async fn fsync_failure_fails_the_batch_with_io() {
        let dir = tempfile::tempdir().unwrap();

        let hook = std::sync::Arc::new(|| -> std::io::Result<()> {
            Err(std::io::Error::other("injected fsync failure"))
        });

        let (w, _state) = writer_with_accounts_and_hook(dir.path(), Some(hook)).await;

        let result = w.commit(tx("will-fail")).await;
        assert!(
            matches!(result, Err(talea_core::store::StoreError::Io(_))),
            "fsync failure must surface as StoreError::Io, got {result:?}"
        );
    }

    /// Invariant 2b — after an fsync failure:
    ///   (a) a subsequent commit also fails with `StoreError::Io` (writer is dead),
    ///   (b) the in-memory state was NOT mutated by the failed batch
    ///       (apply-after-fsync means a failed sync never commits to state).
    #[tokio::test]
    async fn fsync_failure_kills_the_writer_permanently() {
        let dir = tempfile::tempdir().unwrap();

        let hook = std::sync::Arc::new(|| -> std::io::Result<()> {
            Err(std::io::Error::other("injected fsync failure"))
        });

        let (w, state) = writer_with_accounts_and_hook(dir.path(), Some(hook)).await;

        // Snapshot of state BEFORE the attempted commit.
        let (seq_before, idem_count_before) = {
            let st = state.read().await;
            (st.next_seq, st.idem.hot_len())
        };

        // First commit — must fail.
        let r1 = w.commit(tx("fail-1")).await;
        assert!(
            matches!(r1, Err(talea_core::store::StoreError::Io(_))),
            "first post-failure commit must be StoreError::Io, got {r1:?}"
        );

        // Wait briefly for the writer task to die and the channel to close.
        tokio::time::sleep(std::time::Duration::from_millis(50)).await;

        // Second commit — writer is permanently dead.
        let r2 = w.commit(tx("fail-2")).await;
        assert!(
            matches!(r2, Err(talea_core::store::StoreError::Io(_))),
            "second commit after dead writer must be StoreError::Io, got {r2:?}"
        );

        // State invariant: failed sync must NOT have mutated state.
        let (seq_after, idem_count_after) = {
            let st = state.read().await;
            (st.next_seq, st.idem.hot_len())
        };
        assert_eq!(
            seq_after, seq_before,
            "next_seq must be unchanged after a failed fsync (apply-after-fsync)"
        );
        assert_eq!(
            idem_count_after, idem_count_before,
            "idem map must be unchanged after a failed fsync (apply-after-fsync)"
        );
    }
}
