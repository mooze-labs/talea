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
use std::sync::atomic::Ordering;

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
use crate::state::{BookState, CommittedRec, FramePos, Scratch};

// ---------------------------------------------------------------------------
// Public job type
// ---------------------------------------------------------------------------

pub enum Job {
    Commit(Transaction, oneshot::Sender<Result<Committed, StoreError>>),
    OpenAccount(AccountDef, AccountCfg, oneshot::Sender<Result<(), StoreError>>),
    RegisterAsset(AssetDef, oneshot::Sender<Result<(), StoreError>>),
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
    /// Spawn the background writer task.
    ///
    /// `batch_max` caps how many jobs are drained per batch.
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

        let segments = SegmentSet::open(&dir).await?;
        // Clone the catalog handle BEFORE moving segments into the loop.
        // The catalog's inner Arc is shared, so rotations done by the loop
        // are immediately visible through this clone.
        let catalog = segments.catalog();

        let (tx, rx) = mpsc::channel::<Job>(batch_max.max(64) * 4);
        let (ev_tx, _) = broadcast::channel::<Sequenced<LedgerEvent>>(1024);

        let state2 = Arc::clone(&state);
        let ev_tx2 = ev_tx.clone();

        let handle = tokio::spawn(run_loop(rx, segments, state2, ev_tx2, batch_max));

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

async fn run_loop(
    mut rx: mpsc::Receiver<Job>,
    mut segments: SegmentSet,
    state: Arc<RwLock<BookState>>,
    events: broadcast::Sender<Sequenced<LedgerEvent>>,
    batch_max: usize,
) {
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
        // 2. Classify each job under a read lock.
        // ----------------------------------------------------------------
        let mut replies: Vec<Reply> = Vec::with_capacity(jobs.len());
        let mut staged: Vec<Staged> = Vec::new();
        let mut scratch = Scratch::default();

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

                        // Check committed idem index first.
                        if let Some(rec) = st.idem.get(&idem_key) {
                            replies.push(Reply::Dup(idx, rec.clone()));
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
                        None => {}
                    }
                }
            }
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
    use crate::state::{AccountState, BookState};
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
                    postings: vec![],
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
}
