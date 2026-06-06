//! Per-book writer actor: serializes same-book commits in-process and
//! group-commits queued drafts through Store::commit_batch (one storage
//! transaction, one fsync). Cross-process correctness still comes from the
//! DB book-counter lock — this is the per-process optimization recorded in
//! the server spec, Part 4.5.

use std::collections::HashMap;
use std::sync::{Arc, Mutex, MutexGuard, PoisonError};
use std::time::Duration;

use talea_core::store::{Committed, Store, StoreError};
use talea_core::types::Transaction;
use tokio::sync::{mpsc, oneshot};

#[derive(Debug, Clone)]
pub struct WriteConfig {
    /// Per-book queue length; a full queue rejects with Overloaded.
    pub queue_depth: usize,
    /// Max drafts drained into one commit_batch call.
    pub batch_max: usize,
    /// An idle committer deregisters and exits after this long without work.
    pub idle_reap: Duration,
}

impl Default for WriteConfig {
    fn default() -> Self {
        Self {
            queue_depth: 256,
            batch_max: 64,
            idle_reap: Duration::from_secs(60),
        }
    }
}

#[derive(Debug)]
pub enum SubmitError {
    /// The book's queue is full — answer 429 + Retry-After.
    Overloaded,
    /// The committer dropped the reply channel (task died); the commit
    /// outcome is unknown. Answer 500; an idempotent retry resolves the
    /// ambiguity.
    CommitterGone,
    Store(StoreError),
}

struct Job {
    transaction: Transaction,
    reply: oneshot::Sender<Result<Committed, StoreError>>,
}

type BookMap = Arc<Mutex<HashMap<String, mpsc::Sender<Job>>>>;

/// Lock the book map, recovering from poisoning: the guarded operations are
/// single HashMap reads/inserts/removes that cannot be left logically torn by
/// a panicking thread, so the inner value is always safe to continue with.
fn lock_books(
    books: &Mutex<HashMap<String, mpsc::Sender<Job>>>,
) -> MutexGuard<'_, HashMap<String, mpsc::Sender<Job>>> {
    books.lock().unwrap_or_else(PoisonError::into_inner)
}

pub struct WriteRouter {
    store: Arc<dyn Store>,
    cfg: WriteConfig,
    books: BookMap,
}

impl WriteRouter {
    pub fn new(store: Arc<dyn Store>, cfg: WriteConfig) -> Self {
        Self {
            store,
            cfg,
            books: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    /// Route one draft through its book's committer. Same-book drafts
    /// serialize on one task and group-commit; different books run
    /// concurrently.
    pub async fn submit(&self, transaction: Transaction) -> Result<Committed, SubmitError> {
        let book_key = transaction.book.0.clone();
        let (reply_tx, reply_rx) = oneshot::channel();
        let mut job = Job {
            transaction,
            reply: reply_tx,
        };
        loop {
            let sender = self.sender_for(&book_key);
            match sender.try_send(job) {
                Ok(()) => break,
                Err(mpsc::error::TrySendError::Full(_)) => return Err(SubmitError::Overloaded),
                // the committer reaped itself between lookup and send;
                // sender_for spawns a fresh one on the next pass
                Err(mpsc::error::TrySendError::Closed(returned)) => job = returned,
            }
        }
        match reply_rx.await {
            Ok(result) => result.map_err(SubmitError::Store),
            Err(_) => Err(SubmitError::CommitterGone),
        }
    }

    /// Live committer count (for tests and gauges).
    pub fn active_books(&self) -> usize {
        lock_books(&self.books).len()
    }

    /// Jobs currently queued across all books (for the sampled gauge).
    /// Cardinality rule: book names never become labels, so this is a
    /// global sum rather than a per-book breakdown.
    /// Approximate: counts buffered jobs, sampled without synchronization.
    pub fn queued_jobs(&self) -> usize {
        lock_books(&self.books)
            .values()
            .map(|s| s.max_capacity() - s.capacity())
            .sum()
    }

    fn sender_for(&self, book_key: &str) -> mpsc::Sender<Job> {
        let mut books = lock_books(&self.books);
        // is_closed() catches both a cleanly reaped committer and a sender
        // orphaned by a panicked committer — a panic doesn't remove the map
        // entry, so the channel closes but the stale sender stays in the map
        // until the next submit for that book respawns a fresh committer here.
        if let Some(sender) = books.get(book_key)
            && !sender.is_closed()
        {
            return sender.clone();
        }
        let (tx, rx) = mpsc::channel(self.cfg.queue_depth);
        books.insert(book_key.to_string(), tx.clone());
        tokio::spawn(run_committer(
            Arc::clone(&self.store),
            Arc::clone(&self.books),
            book_key.to_string(),
            rx,
            self.cfg.batch_max,
            self.cfg.idle_reap,
        ));
        tx
    }
}

async fn run_committer(
    store: Arc<dyn Store>,
    books: BookMap,
    book_key: String,
    mut rx: mpsc::Receiver<Job>,
    batch_max: usize,
    idle_reap: Duration,
) {
    loop {
        let first = match tokio::time::timeout(idle_reap, rx.recv()).await {
            Ok(Some(job)) => job,
            // all senders dropped (router gone): exit
            Ok(None) => return,
            Err(_idle) => {
                // Idle: deregister, then drain stragglers and exit.
                // close() fails new try_sends (which respawn a fresh
                // committer via sender_for) while letting already-buffered
                // jobs drain — no job is ever dropped. A fresh committer may
                // briefly overlap with this drain; the DB lock keeps that
                // correct.
                lock_books(&books).remove(&book_key);
                rx.close();
                while let Some(job) = rx.recv().await {
                    let batch = drain_batch(job, &mut rx, batch_max);
                    commit_batch_and_reply(&*store, batch).await;
                }
                return;
            }
        };
        let batch = drain_batch(first, &mut rx, batch_max);
        commit_batch_and_reply(&*store, batch).await;
    }
}

/// Drain whatever is already queued, up to batch_max — no artificial delay;
/// batching emerges exactly when a queue exists.
fn drain_batch(first: Job, rx: &mut mpsc::Receiver<Job>, batch_max: usize) -> Vec<Job> {
    let mut batch = vec![first];
    while batch.len() < batch_max {
        match rx.try_recv() {
            Ok(job) => batch.push(job),
            Err(_) => break,
        }
    }
    batch
}

async fn commit_batch_and_reply(store: &dyn Store, batch: Vec<Job>) {
    metrics::histogram!("talea_write_batch_size").record(batch.len() as f64);
    let txs: Vec<Transaction> = batch.iter().map(|j| j.transaction.clone()).collect();
    let results = store.commit_batch(&txs).await;
    // zip is positional: commit_batch guarantees out[i] answers txs[i]. A
    // short result vec (buggy store) leaves trailing oneshots unanswered ->
    // those submitters get CommitterGone.
    for (job, result) in batch.into_iter().zip(results) {
        // a send error means the submitter gave up (e.g. request timeout);
        // the commit outcome stands either way
        let _ = job.reply.send(result);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicI64, Ordering};
    use talea_core::store::{
        AccountCfg, BalanceSnapshot, EventStream, PostingRecord, Sequenced, StoredTransaction,
        TrialBalanceRow,
    };
    use talea_core::types::{
        AccountDef, AccountId, AssetDef, AssetId, Book, Direction, IdempotencyKey, Posting, TxId,
    };
    use tokio::sync::{Notify, Semaphore};

    use chrono::Utc;
    use uuid::Uuid;

    // --- GatedStore stub ---------------------------------------------------

    struct GatedStore {
        gate: Arc<Semaphore>,
        entered: Arc<Notify>,
        batches: Arc<Mutex<Vec<usize>>>,
        seq: Arc<AtomicI64>,
    }

    #[async_trait::async_trait]
    impl Store for GatedStore {
        async fn register_asset(&self, _asset: &AssetDef) -> Result<(), StoreError> {
            unimplemented!()
        }
        async fn open_account(
            &self,
            _def: &AccountDef,
            _cfg: &AccountCfg,
        ) -> Result<(), StoreError> {
            unimplemented!()
        }
        async fn commit(&self, _transaction: &Transaction) -> Result<Committed, StoreError> {
            unimplemented!("the router batches everything through commit_batch")
        }
        async fn commit_batch(&self, txs: &[Transaction]) -> Vec<Result<Committed, StoreError>> {
            self.entered.notify_one();
            self.gate.acquire().await.unwrap().forget();
            self.batches.lock().unwrap().push(txs.len());
            let mut out = Vec::with_capacity(txs.len());
            for tx in txs {
                if tx.idempotency_key.0 == "fail" {
                    out.push(Err(StoreError::UnknownAccount(AccountId {
                        book: tx.book.clone(),
                        path: "fail-account".to_string(),
                    })));
                } else {
                    let seq = self.seq.fetch_add(1, Ordering::Relaxed);
                    out.push(Ok(Committed {
                        txid: tx.id.clone(),
                        seq,
                        at: Utc::now(),
                    }));
                }
            }
            out
        }
        async fn balance(
            &self,
            _account: &AccountId,
            _as_of: Option<chrono::DateTime<Utc>>,
        ) -> Result<BalanceSnapshot, StoreError> {
            unimplemented!()
        }
        async fn asset(&self, _id: &AssetId) -> Result<Option<AssetDef>, StoreError> {
            unimplemented!()
        }
        async fn account_history(
            &self,
            _account: &AccountId,
            _after_seq: Option<talea_core::types::Seq>,
            _limit: usize,
        ) -> Result<Vec<PostingRecord>, StoreError> {
            unimplemented!()
        }
        async fn transaction(&self, _txid: &TxId) -> Result<Option<StoredTransaction>, StoreError> {
            unimplemented!()
        }
        async fn trial_balance(
            &self,
            _book: &Book,
            _as_of: Option<chrono::DateTime<Utc>>,
        ) -> Result<Vec<TrialBalanceRow>, StoreError> {
            unimplemented!()
        }
        async fn read_events(
            &self,
            _book: &Book,
            _from: talea_core::types::Seq,
            _limit: usize,
        ) -> Result<Vec<Sequenced<talea_core::events::LedgerEvent>>, StoreError> {
            unimplemented!()
        }
        fn subscribe(&self, _book: &Book, _from: talea_core::types::Seq) -> EventStream {
            unimplemented!()
        }
    }

    type StoreBundle = (
        Arc<GatedStore>,
        Arc<Semaphore>,
        Arc<Notify>,
        Arc<Mutex<Vec<usize>>>,
    );

    fn make_store() -> StoreBundle {
        let gate = Arc::new(Semaphore::new(0));
        let entered = Arc::new(Notify::new());
        let batches = Arc::new(Mutex::new(Vec::new()));
        let store = Arc::new(GatedStore {
            gate: Arc::clone(&gate),
            entered: Arc::clone(&entered),
            batches: Arc::clone(&batches),
            seq: Arc::new(AtomicI64::new(1)),
        });
        (store, gate, entered, batches)
    }

    /// Build a minimal one-posting Transaction for a given book and idempotency key.
    fn tx(book: &str, idem: &str) -> Transaction {
        Transaction {
            id: TxId(Uuid::now_v7()),
            book: Book(book.to_string()),
            postings: vec![Posting {
                account: AccountId {
                    book: Book(book.to_string()),
                    path: "acct".to_string(),
                },
                amount: talea_core::types::Amount::new(100, AssetId::new("USD")),
                direction: Direction::Debit,
            }],
            idempotency_key: IdempotencyKey(idem.to_string()),
            external_refs: vec![],
            metadata: serde_json::json!({}),
            occurred_at: Utc::now(),
        }
    }

    // --- Tests -------------------------------------------------------------

    #[tokio::test(start_paused = true)]
    async fn queued_jobs_group_commit() {
        let (store, gate, entered, batches) = make_store();
        let router = Arc::new(WriteRouter::new(
            store,
            WriteConfig {
                queue_depth: 256,
                batch_max: 64,
                idle_reap: Duration::from_secs(60),
            },
        ));

        // Submit A — committer task starts and blocks at the gate
        let r = Arc::clone(&router);
        let ha = tokio::spawn(async move { r.submit(tx("book1", "a")).await });

        // Wait for committer to enter commit_batch (gate blocks it)
        entered.notified().await;

        // While A is in flight, queue up b/c/d
        let r = Arc::clone(&router);
        let hb = tokio::spawn(async move { r.submit(tx("book1", "b")).await });
        let r = Arc::clone(&router);
        let hc = tokio::spawn(async move { r.submit(tx("book1", "c")).await });
        let r = Arc::clone(&router);
        let hd = tokio::spawn(async move { r.submit(tx("book1", "d")).await });

        // Let them queue up
        tokio::time::sleep(Duration::from_millis(10)).await;

        // b/c/d are buffered in the channel; A is in flight inside commit_batch
        assert_eq!(router.queued_jobs(), 3);

        // Release A's commit; committer will immediately drain b/c/d
        gate.add_permits(1);

        // Wait for the second batch to enter
        entered.notified().await;
        gate.add_permits(1);

        assert!(ha.await.unwrap().is_ok());
        assert!(hb.await.unwrap().is_ok());
        assert!(hc.await.unwrap().is_ok());
        assert!(hd.await.unwrap().is_ok());

        let recorded = batches.lock().unwrap().clone();
        assert_eq!(recorded, vec![1, 3]);
    }

    #[tokio::test(start_paused = true)]
    async fn full_queue_returns_overloaded() {
        let (store, gate, entered, _batches) = make_store();
        let router = Arc::new(WriteRouter::new(
            store,
            WriteConfig {
                queue_depth: 1,
                batch_max: 64,
                idle_reap: Duration::from_secs(60),
            },
        ));

        // Submit A — committer task starts and blocks
        let r = Arc::clone(&router);
        let ha = tokio::spawn(async move { r.submit(tx("book1", "a")).await });

        // Wait for committer to enter
        entered.notified().await;

        // Submit B — fills the queue (depth=1)
        let r = Arc::clone(&router);
        let hb = tokio::spawn(async move { r.submit(tx("book1", "b")).await });

        // Let B queue up
        tokio::time::sleep(Duration::from_millis(10)).await;

        // Submit C inline — queue is full, must get Overloaded
        let result_c = router.submit(tx("book1", "c")).await;
        assert!(
            matches!(result_c, Err(SubmitError::Overloaded)),
            "expected Overloaded"
        );

        // Release A and B
        gate.add_permits(2);

        assert!(ha.await.unwrap().is_ok());
        assert!(hb.await.unwrap().is_ok());
    }

    #[tokio::test(start_paused = true)]
    async fn results_are_positional() {
        let (store, gate, entered, _batches) = make_store();
        let router = Arc::new(WriteRouter::new(
            store,
            WriteConfig {
                queue_depth: 256,
                batch_max: 64,
                idle_reap: Duration::from_secs(60),
            },
        ));

        // Submit A — blocks committer
        let r = Arc::clone(&router);
        let ha = tokio::spawn(async move { r.submit(tx("book1", "a")).await });

        // Wait for committer to enter
        entered.notified().await;

        // Queue up "fail" and "good" while A is in flight
        let r = Arc::clone(&router);
        let hfail = tokio::spawn(async move { r.submit(tx("book1", "fail")).await });
        let r = Arc::clone(&router);
        let hgood = tokio::spawn(async move { r.submit(tx("book1", "good")).await });

        tokio::time::sleep(Duration::from_millis(10)).await;

        // Release A's batch, then the fail/good batch
        gate.add_permits(1);
        entered.notified().await;
        gate.add_permits(1);

        assert!(ha.await.unwrap().is_ok());
        let fail_result = hfail.await.unwrap();
        assert!(
            matches!(
                fail_result,
                Err(SubmitError::Store(StoreError::UnknownAccount(_)))
            ),
            "expected UnknownAccount for 'fail'"
        );
        assert!(hgood.await.unwrap().is_ok());
    }

    #[tokio::test(start_paused = true)]
    async fn idle_committer_reaps_and_respawns() {
        let (store, gate, _entered, _batches) = make_store();
        // Pre-fill so commits never block
        gate.add_permits(64);

        let router = Arc::new(WriteRouter::new(
            store,
            WriteConfig {
                queue_depth: 256,
                batch_max: 64,
                idle_reap: Duration::from_secs(1),
            },
        ));

        // First submit — spawns committer for "bookA"
        assert!(router.submit(tx("bookA", "x")).await.is_ok());
        assert_eq!(router.active_books(), 1);

        // Advance time past idle_reap; committer should self-reap
        tokio::time::sleep(Duration::from_secs(2)).await;
        assert_eq!(router.active_books(), 0);

        // Submit again to same book — should respawn committer and succeed
        assert!(router.submit(tx("bookA", "y")).await.is_ok());

        // Also submit to a different book
        assert!(router.submit(tx("bookB", "z")).await.is_ok());

        // Both committers are up (or at least were; they may have reaped again,
        // but the key assertion is that the submits succeeded)
        assert!(router.active_books() <= 2);
    }
}
