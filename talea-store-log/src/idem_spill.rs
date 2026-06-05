//! Tiered idempotency index: hot HashMap + on-disk sorted runs + Bloom front.
//!
//! # Architecture
//!
//! ```text
//! lookup(key)
//!   └── hot map (sync, O(1))
//!         ├── hit  → return
//!         └── miss → bloom filter (sync)
//!                      ├── negative → miss (never touch disk)
//!                      └── positive → runs newest-first (binary search per run)
//! ```
//!
//! # Overflow / spill
//!
//! When `hot.len() > cap` the OLDEST half (by insertion order, tracked by
//! `order: VecDeque`) is drained into a sorted Vec, serialised as a run file
//! `idem-<n:06>.run` (u32-LE CRC | JSON array of `[key, CommittedRec]` pairs
//! sorted by key), and their keys are inserted into the Bloom filter.
//!
//! # Merge
//!
//! When `runs.len() > 8` all runs are read, merge-sorted, and rewritten as one
//! run (tmp→rename discipline).  The Bloom filter is rebuilt from the merged run.
//!
//! # Serde shape
//!
//! Only `hot`, `order`, and `cap` are serialised (the three fields marked
//! `#[serde(skip)]` reload from disk at [`TieredIdem::attach_dir`] time).
//! Callers **must** call `attach_dir` after deserialising before the first lookup.
//!
//! # Failure handling
//!
//! A flush / merge error is `tracing::error` + the hot map is KEPT intact
//! (the spilled keys stay hot, retry next flush).  A read error on a run during
//! lookup is treated as a miss-and-warn (never a hard error on the lookup path;
//! the log is the source of truth).
//!
//! # Rebuild
//!
//! `attach_dir` verifies every run's CRC.  Any CRC failure triggers a full
//! log scan via the caller-supplied iterator.  The bloom is a pure in-memory
//! cache rebuilt from runs at attach; nothing bloom-related is persisted,
//! eliminating staleness windows.

use std::collections::{HashMap, VecDeque};
use std::path::{Path, PathBuf};

use crate::state::CommittedRec;

// ---------------------------------------------------------------------------
// Bloom filter (in-crate, ~40 lines)
// ---------------------------------------------------------------------------

/// Simple k=4, m=10n Bloom filter backed by a `Vec<u64>` bit-array.
///
/// Uses two independent `DefaultHasher` seeds for double-hashing:
///   h_i(key) = (h1(key) + i * h2(key)) mod m
/// where h1 = DefaultHasher seeded with 0xDEAD_BEEF_u64 and
///       h2 = DefaultHasher seeded with 0x1337_C0DE_u64.
#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct Bloom {
    /// Bit-array stored as u64 words.
    bits: Vec<u64>,
    /// Total number of bits (always `bits.len() * 64`).
    m: usize,
}

impl Default for Bloom {
    fn default() -> Self {
        Self::new(1)
    }
}

const BLOOM_K: usize = 4;
const BLOOM_SEED1: u64 = 0xDEAD_BEEF_CAFE_BABEu64;
const BLOOM_SEED2: u64 = 0x1337_C0DE_F00D_FACEu64;

impl Bloom {
    /// Create a new Bloom filter sized for `expected_n` keys.
    pub fn new(expected_n: usize) -> Self {
        // m = 10 * n bits, rounded up to whole u64 words.
        let n = expected_n.max(1);
        let m_bits = 10 * n;
        let words = m_bits.div_ceil(64);
        Self { bits: vec![0u64; words], m: words * 64 }
    }

    fn hashes(&self, key: &str) -> [usize; BLOOM_K] {
        use std::hash::{Hash, Hasher};

        // h1: seed BLOOM_SEED1 then hash key bytes
        let h1: u64 = {
            let mut h = std::collections::hash_map::DefaultHasher::new();
            BLOOM_SEED1.hash(&mut h);
            key.hash(&mut h);
            h.finish()
        };
        // h2: seed BLOOM_SEED2 then hash key bytes
        let h2: u64 = {
            let mut h = std::collections::hash_map::DefaultHasher::new();
            BLOOM_SEED2.hash(&mut h);
            key.hash(&mut h);
            h.finish()
        };

        let m = self.m as u64;
        std::array::from_fn(|i| {
            (h1.wrapping_add((i as u64).wrapping_mul(h2)) % m) as usize
        })
    }

    /// Insert a key.
    pub fn insert(&mut self, key: &str) {
        for bit in self.hashes(key) {
            self.bits[bit / 64] |= 1u64 << (bit % 64);
        }
    }

    /// `false` means definitely-not-present.  `true` means maybe-present.
    pub fn might_contain(&self, key: &str) -> bool {
        self.hashes(key).iter().all(|&bit| {
            (self.bits[bit / 64] >> (bit % 64)) & 1 == 1
        })
    }
}

// ---------------------------------------------------------------------------
// Run files
// ---------------------------------------------------------------------------

const RUN_CRC_LEN: usize = 4;

/// Metadata about one on-disk run.
#[derive(Debug, Clone)]
pub struct RunMeta {
    pub path: PathBuf,
    /// (min_key, max_key) from the sorted array — used for early-out.
    pub key_range: (String, String),
    /// Number of entries in this run.
    pub len: usize,
}

/// On-disk format: 4-byte LE CRC32 | JSON array of `[key, CommittedRec]`.
fn encode_run(pairs: &[(String, CommittedRec)]) -> std::io::Result<Vec<u8>> {
    let payload = serde_json::to_vec(pairs)
        .map_err(|e| std::io::Error::other(format!("run serialize: {e}")))?;
    let crc = crc32fast::hash(&payload);
    let mut out = Vec::with_capacity(RUN_CRC_LEN + payload.len());
    out.extend_from_slice(&crc.to_le_bytes());
    out.extend_from_slice(&payload);
    Ok(out)
}

fn decode_run(bytes: &[u8]) -> Result<Vec<(String, CommittedRec)>, String> {
    if bytes.len() < RUN_CRC_LEN {
        return Err(format!("run too short: {} bytes", bytes.len()));
    }
    let stored = u32::from_le_bytes(bytes[..RUN_CRC_LEN].try_into().unwrap());
    let payload = &bytes[RUN_CRC_LEN..];
    let actual = crc32fast::hash(payload);
    if stored != actual {
        return Err(format!("CRC mismatch: stored={stored:#010x} actual={actual:#010x}"));
    }
    serde_json::from_slice(payload).map_err(|e| format!("run parse: {e}"))
}

/// Name for the n-th run file (0-indexed).
fn run_name(n: usize) -> String {
    format!("idem-{:06}.run", n)
}

/// fsync the directory for dirent durability (mirrors snapshot.rs).
fn fsync_dir(dir: &Path) -> std::io::Result<()> {
    std::fs::File::open(dir)?.sync_all()
}

/// Atomic tmp→rename write for a run file.
async fn write_run_atomic(path: &Path, bytes: &[u8]) -> std::io::Result<()> {
    let tmp = path.with_extension("run.tmp");
    tokio::fs::write(&tmp, bytes).await?;
    // sync_all on the tmp file
    {
        let f = std::fs::OpenOptions::new()
            .write(true)
            .open(&tmp)
            .map_err(|e| std::io::Error::other(format!("open tmp for sync: {e}")))?;
        f.sync_all()?;
    }
    tokio::fs::rename(&tmp, path).await?;
    let dir_owned = path.parent().unwrap_or(Path::new(".")).to_path_buf();
    tokio::task::spawn_blocking(move || fsync_dir(&dir_owned))
        .await
        .map_err(|e| std::io::Error::other(format!("spawn_blocking join: {e}")))??;
    Ok(())
}

// ---------------------------------------------------------------------------
// TieredIdem
// ---------------------------------------------------------------------------

/// Bounded idempotency index: hot map (in-memory) + spill runs (on-disk) +
/// Bloom filter gate.
///
/// # Serde contract
///
/// Only `hot`, `order`, and `cap` are serialised.  `runs_dir`, `runs`, and
/// `bloom` are `#[serde(skip)]` and are rebuilt by [`attach_dir`] at load time.
/// Callers MUST call `attach_dir` before any lookup or flush after deserialising.
#[derive(serde::Serialize, serde::Deserialize)]
pub struct TieredIdem {
    pub hot: HashMap<String, CommittedRec>,
    pub order: VecDeque<String>,
    pub cap: usize,

    #[serde(skip)]
    pub runs_dir: PathBuf,
    #[serde(skip)]
    pub runs: Vec<RunMeta>,
    #[serde(skip)]
    pub bloom: Bloom,
}

impl std::fmt::Debug for TieredIdem {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("TieredIdem")
            .field("hot_len", &self.hot.len())
            .field("cap", &self.cap)
            .field("runs", &self.runs.len())
            .finish()
    }
}

impl Clone for TieredIdem {
    fn clone(&self) -> Self {
        Self {
            hot: self.hot.clone(),
            order: self.order.clone(),
            cap: self.cap,
            runs_dir: self.runs_dir.clone(),
            runs: self.runs.clone(),
            bloom: self.bloom.clone(),
        }
    }
}

impl Default for TieredIdem {
    fn default() -> Self {
        Self::with_cap(DEFAULT_IDEM_HOT_CAP)
    }
}

/// Default hot-map capacity.
pub const DEFAULT_IDEM_HOT_CAP: usize = 1_000_000;

impl TieredIdem {
    /// Create a new empty `TieredIdem` with the given hot capacity.
    pub fn with_cap(cap: usize) -> Self {
        Self {
            hot: HashMap::new(),
            order: VecDeque::new(),
            cap,
            runs_dir: PathBuf::new(),
            runs: Vec::new(),
            bloom: Bloom::new(cap),
        }
    }

    /// Attach a directory and load existing runs from disk, rebuilding the
    /// Bloom filter in memory from the CRC-verified run contents.
    ///
    /// The bloom is a pure in-memory cache rebuilt from runs at attach; nothing
    /// bloom-related is persisted, eliminating staleness windows.
    ///
    /// Returns an error only if the directory cannot be read.  Individual run
    /// CRC failures trigger a full rebuild from the caller-supplied log iterator.
    ///
    /// Must be called after deserialization (or at store open time for a fresh
    /// instance).
    pub async fn attach_dir<F, Fut>(&mut self, dir: &Path, rebuild_fn: F) -> std::io::Result<()>
    where
        F: FnOnce() -> Fut,
        Fut: std::future::Future<Output = std::io::Result<Vec<(String, CommittedRec)>>>,
    {
        self.runs_dir = dir.to_path_buf();

        // Enumerate run files.
        let mut run_paths: Vec<(usize, PathBuf)> = Vec::new();
        let mut rd = tokio::fs::read_dir(dir).await?;
        while let Some(entry) = rd.next_entry().await? {
            let name = entry
                .file_name()
                .into_string()
                .map_err(|_| std::io::Error::other("non-UTF-8 run filename"))?;
            if let Some(n) = parse_run_name(&name) {
                run_paths.push((n, entry.path()));
            }
        }
        run_paths.sort_by_key(|&(n, _)| n);

        // Validate all runs; if any fail CRC, rebuild from the log.
        let mut all_valid = true;
        let mut metas: Vec<RunMeta> = Vec::new();

        for (_, path) in &run_paths {
            match tokio::fs::read(path).await {
                Ok(bytes) => match decode_run(&bytes) {
                    Ok(pairs) if !pairs.is_empty() => {
                        let min_key = pairs[0].0.clone();
                        let max_key = pairs[pairs.len() - 1].0.clone();
                        metas.push(RunMeta {
                            path: path.clone(),
                            key_range: (min_key, max_key),
                            len: pairs.len(),
                        });
                    }
                    Ok(_) => {
                        // Empty run — ignore but keep going.
                    }
                    Err(e) => {
                        tracing::warn!(?path, %e, "idem run CRC/parse failure — will rebuild");
                        all_valid = false;
                        break;
                    }
                },
                Err(e) => {
                    tracing::warn!(?path, %e, "idem run read failure — will rebuild");
                    all_valid = false;
                    break;
                }
            }
        }

        // Trigger a rebuild from the log if any run failed CRC/read, or if
        // there are no run files at all (either a fresh store — cheap empty
        // rebuild — or runs were deleted after a crash).
        if !all_valid || run_paths.is_empty() {
            // Rebuild: scan the full log for spilled keys (keys not in hot).
            tracing::info!(dir = %dir.display(), "rebuilding idem run files from log scan");
            let pairs = rebuild_fn().await?;

            // Filter to keys not in hot.
            let spill_pairs: Vec<(String, CommittedRec)> = pairs
                .into_iter()
                .filter(|(k, _)| !self.hot.contains_key(k))
                .collect();

            // Remove all existing run files.
            for (_, path) in &run_paths {
                let _ = tokio::fs::remove_file(path).await;
            }
            metas.clear();

            if !spill_pairs.is_empty() {
                // Write a single run with all spilled pairs sorted by key.
                let mut sorted = spill_pairs;
                sorted.sort_by(|a, b| a.0.cmp(&b.0));

                let n = next_run_n(&metas);
                let run_path = dir.join(run_name(n));
                match encode_run(&sorted) {
                    Ok(bytes) => match write_run_atomic(&run_path, &bytes).await {
                        Ok(()) => {
                            let min_key = sorted[0].0.clone();
                            let max_key = sorted[sorted.len() - 1].0.clone();
                            metas.push(RunMeta {
                                path: run_path,
                                key_range: (min_key, max_key),
                                len: sorted.len(),
                            });
                        }
                        Err(e) => {
                            tracing::error!(%e, "failed to write rebuilt idem run");
                        }
                    },
                    Err(e) => {
                        tracing::error!(%e, "failed to encode rebuilt idem run");
                    }
                }
            }
        }

        // Always rebuild the bloom in memory from the (now-valid) run metas.
        // Runs are bounded (at most ~8 between merges) so reading them here is
        // cheap and avoids any stale-bloom crash window.
        let mut bloom = Bloom::new(self.cap);
        for meta in &metas {
            match tokio::fs::read(&meta.path).await {
                Ok(bytes) => match decode_run(&bytes) {
                    Ok(pairs) => {
                        for (key, _) in &pairs {
                            bloom.insert(key);
                        }
                    }
                    Err(e) => {
                        tracing::warn!(path = %meta.path.display(), %e, "idem run decode during bloom rebuild — bloom may be incomplete");
                    }
                },
                Err(e) => {
                    tracing::warn!(path = %meta.path.display(), %e, "idem run read during bloom rebuild — bloom may be incomplete");
                }
            }
        }
        self.bloom = bloom;

        self.runs = metas;
        Ok(())
    }

    /// Insert a key into the hot map.
    ///
    /// Tracks insertion order in `self.order`.  Does NOT trigger a flush
    /// (that is the writer's responsibility, post-apply).
    pub fn insert(&mut self, key: String, rec: CommittedRec) {
        if !self.hot.contains_key(&key) {
            self.order.push_back(key.clone());
        }
        self.hot.insert(key, rec);
    }

    /// Look up a key.
    ///
    /// - Hot map: O(1).
    /// - If bloom says negative: definitely absent (no disk touch).
    /// - If bloom says positive: search runs newest-first synchronously
    ///   (the files should already be mmap'd / page-cached; we use blocking
    ///   `std::fs::read` wrapped in `spawn_blocking` — but on the lookup hot
    ///   path this is called BEFORE the write lock is taken so async is fine).
    ///
    /// This is a sync method — callers resolve disk hits before taking the
    /// state lock.  See `lookup_async` for the async variant used in the writer.
    pub fn get_hot(&self, key: &str) -> Option<&CommittedRec> {
        self.hot.get(key)
    }

    /// `true` if the Bloom filter says the key might be in a spill run.
    pub fn bloom_might_contain(&self, key: &str) -> bool {
        self.bloom.might_contain(key)
    }

    /// Search spill runs for `key` (newest run first).
    ///
    /// Returns `None` if not found.  I/O errors on individual runs are logged
    /// as warnings and treated as misses (the log is the source of truth).
    pub async fn lookup_runs(&self, key: &str) -> Option<CommittedRec> {
        #[cfg(test)]
        test_hooks::RUN_READ_COUNT.fetch_add(1, std::sync::atomic::Ordering::Relaxed);

        for meta in self.runs.iter().rev() {
            // Key-range early-out.
            if key < meta.key_range.0.as_str() || key > meta.key_range.1.as_str() {
                continue;
            }
            let path = meta.path.clone();
            let key_owned = key.to_string();
            let result = tokio::task::spawn_blocking(move || -> Result<Option<CommittedRec>, String> {
                let bytes = std::fs::read(&path)
                    .map_err(|e| format!("read: {e}"))?;
                let pairs = decode_run(&bytes)?;
                // Binary search by key.
                match pairs.binary_search_by(|(k, _)| k.as_str().cmp(key_owned.as_str())) {
                    Ok(idx) => Ok(Some(pairs[idx].1.clone())),
                    Err(_) => Ok(None),
                }
            })
            .await;

            match result {
                Ok(Ok(Some(rec))) => return Some(rec),
                Ok(Ok(None)) => {} // not in this run
                Ok(Err(e)) => {
                    tracing::warn!(key = %key, error = %e, "idem run lookup error — treating as miss");
                }
                Err(e) => {
                    tracing::warn!(key = %key, error = %e, "idem run spawn_blocking panicked — treating as miss");
                }
            }
        }
        None
    }

    /// Full lookup: hot → bloom → runs.
    ///
    /// For use outside the write lock (e.g. test helpers).
    pub async fn get(&self, key: &str) -> Option<CommittedRec> {
        if let Some(rec) = self.hot.get(key) {
            return Some(rec.clone());
        }
        if !self.bloom.might_contain(key) {
            return None;
        }
        self.lookup_runs(key).await
    }

    /// Returns `true` if the hot map is over capacity.
    pub fn needs_flush(&self) -> bool {
        self.hot.len() > self.cap
    }

    /// Drain oldest half from the hot map into a new spill run.
    ///
    /// On failure: logs the error, keeps drained keys in hot (retry next time).
    /// Never loses dedup info.
    pub async fn flush_spill(&mut self) {
        let drain_n = self.hot.len() / 2;
        if drain_n == 0 {
            return;
        }

        // Drain oldest `drain_n` keys in insertion order.
        let mut spilled: Vec<(String, CommittedRec)> = Vec::with_capacity(drain_n);
        for _ in 0..drain_n {
            if let Some(key) = self.order.pop_front()
                && let Some(rec) = self.hot.remove(&key)
            {
                spilled.push((key, rec));
            }
        }
        if spilled.is_empty() {
            return;
        }

        // Sort by key for binary-search-able run.
        spilled.sort_by(|a, b| a.0.cmp(&b.0));

        let n = next_run_n(&self.runs);
        let run_path = self.runs_dir.join(run_name(n));

        let bytes = match encode_run(&spilled) {
            Ok(b) => b,
            Err(e) => {
                tracing::error!(%e, "failed to encode idem spill run — keeping keys in hot");
                // Return keys to hot.
                for (k, v) in spilled {
                    self.order.push_front(k.clone());
                    self.hot.insert(k, v);
                }
                // Restore order so front = oldest.
                // (The order was actually maintained since we drained oldest first)
                return;
            }
        };

        if let Err(e) = write_run_atomic(&run_path, &bytes).await {
            tracing::error!(%e, "failed to write idem spill run — keeping keys in hot");
            // Return keys to hot in their original front order.
            for (k, v) in spilled.into_iter().rev() {
                self.order.push_front(k.clone());
                self.hot.insert(k, v);
            }
            return;
        }

        // Success: register the run, update bloom.
        let min_key = spilled[0].0.clone();
        let max_key = spilled[spilled.len() - 1].0.clone();
        self.runs.push(RunMeta {
            path: run_path,
            key_range: (min_key, max_key),
            len: spilled.len(),
        });

        for (key, _) in &spilled {
            self.bloom.insert(key);
        }

        // Maybe merge runs.
        if self.runs.len() > 8 {
            self.merge_runs().await;
        }
    }

    /// Merge all existing runs into one.
    ///
    /// Uses tmp→rename discipline.  On failure, logs and leaves runs intact.
    pub async fn merge_runs(&mut self) {
        if self.runs.len() <= 1 {
            return;
        }

        // Read all runs.
        let mut merged: Vec<(String, CommittedRec)> = Vec::new();
        let mut ok = true;
        for meta in &self.runs {
            match tokio::fs::read(&meta.path).await {
                Ok(bytes) => match decode_run(&bytes) {
                    Ok(pairs) => {
                        merged.extend(pairs);
                    }
                    Err(e) => {
                        tracing::error!(path = %meta.path.display(), %e, "idem merge: run decode failed");
                        ok = false;
                        break;
                    }
                },
                Err(e) => {
                    tracing::error!(path = %meta.path.display(), %e, "idem merge: run read failed");
                    ok = false;
                    break;
                }
            }
        }
        if !ok {
            return;
        }

        // Merge-sort and deduplicate (keep latest by... they are all distinct; still sort).
        merged.sort_by(|a, b| a.0.cmp(&b.0));
        merged.dedup_by(|a, b| {
            // Keep `b` (first occurrence in stable sort = older; second = newer).
            // For true dedup keep the one we saw first (b when a.key == b.key).
            a.0 == b.0
        });

        // Use next_run_n (max existing + 1) so the merged file never aliases
        // a run that is still in self.runs and will be removed below.  Using
        // self.runs.len() would collide on the second merge: after the first
        // merge self.runs = [idem-000009.run] and len==1 → merged_n=1, but
        // the second merge with runs=[9..17] (len=9) produces merged_n=9 which
        // matches the idem-000009.run that was just read, then the removal loop
        // deletes it → silent data loss.
        let merged_n = next_run_n(&self.runs);
        let merged_path = self.runs_dir.join(run_name(merged_n));

        let bytes = match encode_run(&merged) {
            Ok(b) => b,
            Err(e) => {
                tracing::error!(%e, "idem merge: encode failed");
                return;
            }
        };
        if let Err(e) = write_run_atomic(&merged_path, &bytes).await {
            tracing::error!(%e, "idem merge: write failed");
            return;
        }

        // Remove old run files.
        for meta in &self.runs {
            if let Err(e) = tokio::fs::remove_file(&meta.path).await {
                tracing::warn!(path = %meta.path.display(), %e, "idem merge: failed to remove old run");
            }
        }

        let min_key = if merged.is_empty() { String::new() } else { merged[0].0.clone() };
        let max_key = if merged.is_empty() { String::new() } else { merged[merged.len() - 1].0.clone() };
        self.runs = if merged.is_empty() {
            vec![]
        } else {
            vec![RunMeta {
                path: merged_path,
                key_range: (min_key, max_key),
                len: merged.len(),
            }]
        };

        // Rebuild bloom in memory from merged.
        let mut bloom = Bloom::new(merged.len().max(self.cap));
        for (key, _) in &merged {
            bloom.insert(key);
        }
        self.bloom = bloom;
    }

    /// Number of run files.
    pub fn run_count(&self) -> usize {
        self.runs.len()
    }

    /// Number of entries in the hot map.
    pub fn hot_len(&self) -> usize {
        self.hot.len()
    }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

fn parse_run_name(name: &str) -> Option<usize> {
    let s = name.strip_prefix("idem-")?.strip_suffix(".run")?;
    s.parse().ok()
}

fn next_run_n(existing: &[RunMeta]) -> usize {
    existing
        .iter()
        .filter_map(|m| {
            m.path
                .file_name()
                .and_then(|n| n.to_str())
                .and_then(parse_run_name)
        })
        .max()
        .map(|n| n + 1)
        .unwrap_or(0)
}

// ---------------------------------------------------------------------------
// cfg(test) read counter hook
// ---------------------------------------------------------------------------

#[cfg(test)]
pub mod test_hooks {
    use std::sync::atomic::{AtomicUsize, Ordering};

    /// Global counter incremented by `lookup_runs` in test builds.
    pub static RUN_READ_COUNT: AtomicUsize = AtomicUsize::new(0);

    pub fn reset() {
        RUN_READ_COUNT.store(0, Ordering::SeqCst);
    }

    pub fn count() -> usize {
        RUN_READ_COUNT.load(Ordering::SeqCst)
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;
    use talea_core::types::TxId;
    use uuid::Uuid;

    fn make_rec(seq: i64) -> CommittedRec {
        CommittedRec {
            txid: TxId(Uuid::now_v7()),
            seq,
            at: Utc::now(),
        }
    }

    async fn make_tiered(dir: &Path, cap: usize) -> TieredIdem {
        let mut t = TieredIdem::with_cap(cap);
        t.attach_dir(dir, || async { Ok(vec![]) }).await.unwrap();
        t
    }

    // -----------------------------------------------------------------------
    // Bloom unit
    // -----------------------------------------------------------------------

    #[test]
    fn bloom_no_false_negatives() {
        let mut b = Bloom::new(1000);
        for i in 0..500 {
            b.insert(&format!("key-{i}"));
        }
        for i in 0..500 {
            assert!(b.might_contain(&format!("key-{i}")));
        }
    }

    #[test]
    fn bloom_mostly_no_false_positives_for_unseen_keys() {
        let mut b = Bloom::new(10000);
        for i in 0..5000 {
            b.insert(&format!("present-{i}"));
        }
        // Check absent keys — allow up to 2% FP rate.
        let mut fp = 0usize;
        for i in 0..5000 {
            if b.might_contain(&format!("absent-{i}")) {
                fp += 1;
            }
        }
        assert!(fp < 100, "too many false positives: {fp}");
    }

    // -----------------------------------------------------------------------
    // Hot-only (no overflow)
    // -----------------------------------------------------------------------

    #[tokio::test]
    async fn hot_lookup_hits() {
        let dir = tempfile::tempdir().unwrap();
        let mut t = make_tiered(dir.path(), 100).await;
        let rec = make_rec(1);
        t.insert("foo".into(), rec.clone());
        assert_eq!(t.get("foo").await, Some(rec));
    }

    #[tokio::test]
    async fn hot_miss_returns_none() {
        let dir = tempfile::tempdir().unwrap();
        let t = make_tiered(dir.path(), 100).await;
        assert_eq!(t.get("nope").await, None);
    }

    // -----------------------------------------------------------------------
    // Spill + lookup
    // -----------------------------------------------------------------------

    #[tokio::test]
    async fn spilled_key_still_dedups_with_original_committed() {
        let dir = tempfile::tempdir().unwrap();
        // tiny cap=4; insert 10 distinct keys → first keys spill
        let cap = 4usize;
        let mut t = make_tiered(dir.path(), cap).await;

        let mut recs: Vec<(String, CommittedRec)> = Vec::new();
        for i in 0..10 {
            let key = format!("idem-key-{i:02}");
            let rec = make_rec((i + 1) as i64);
            t.insert(key.clone(), rec.clone());
            recs.push((key, rec));
            // flush after each insert if over cap
            if t.needs_flush() {
                t.flush_spill().await;
            }
        }

        // Key #0 was inserted first and should have been spilled.
        let (key0, rec0) = &recs[0];
        assert!(
            !t.hot.contains_key(key0.as_str()),
            "key0 should have been spilled out of hot"
        );

        // Full lookup should still find it.
        let found = t.get(key0).await;
        assert_eq!(found.as_ref().map(|r| r.seq), Some(rec0.seq),
            "spilled key must still be found via run lookup");
        assert_eq!(found.as_ref().map(|r| r.txid.clone()), Some(rec0.txid.clone()));
        assert_eq!(found.as_ref().map(|r| r.at), Some(rec0.at));
    }

    // -----------------------------------------------------------------------
    // Bloom negative skips disk
    // -----------------------------------------------------------------------

    #[tokio::test]
    async fn bloom_negative_skips_disk() {
        let dir = tempfile::tempdir().unwrap();
        let cap = 4usize;
        let mut t = make_tiered(dir.path(), cap).await;

        // Insert and spill some keys so runs exist.
        let mut spilled_key = String::new();
        for i in 0..8 {
            let key = format!("spilled-{i}");
            if i == 0 {
                spilled_key = key.clone();
            }
            t.insert(key, make_rec(i as i64 + 1));
            if t.needs_flush() {
                t.flush_spill().await;
            }
        }
        assert!(!t.runs.is_empty(), "must have at least one run");

        // A fresh key that was never inserted will not be in the bloom filter
        // (and if not in the bloom, lookup_runs is never called).
        let fresh_key = "absolutely-fresh-key-xyz";
        assert!(!t.bloom.might_contain(fresh_key),
            "bloom must not contain a key that was never inserted");

        // Reset the counter, then perform a bloom-negative get.
        // RUN_READ_COUNT must stay at 0 — disk is skipped.
        test_hooks::reset();
        let result = t.get(fresh_key).await;
        assert_eq!(result, None);
        assert_eq!(
            test_hooks::count(), 0,
            "bloom-negative get must not call lookup_runs (disk skip)"
        );

        // A bloom-positive get (spilled key that IS in the bloom) must increment
        // the counter, proving that lookup_runs is actually called for hits.
        assert!(t.bloom.might_contain(&spilled_key),
            "spilled_key must be in the bloom");
        test_hooks::reset();
        let _ = t.get(&spilled_key).await;
        assert!(
            test_hooks::count() > 0,
            "bloom-positive get must call lookup_runs (counter should increment)"
        );
    }

    // -----------------------------------------------------------------------
    // Rebuild from log when run files deleted
    // -----------------------------------------------------------------------

    #[tokio::test]
    async fn runs_rebuild_from_log_when_deleted() {
        let dir = tempfile::tempdir().unwrap();
        let cap = 4usize;

        // Phase 1: insert 10 keys, spill, persist.
        let mut t = make_tiered(dir.path(), cap).await;
        let mut recs: Vec<(String, CommittedRec)> = Vec::new();
        for i in 0..10 {
            let key = format!("rebuild-{i:02}");
            let rec = make_rec((i + 1) as i64);
            t.insert(key.clone(), rec.clone());
            recs.push((key, rec));
            if t.needs_flush() {
                t.flush_spill().await;
            }
        }

        // Note which keys are in hot vs spilled.
        let hot_keys: std::collections::HashSet<String> = t.hot.keys().cloned().collect();
        let spilled_keys: Vec<&(String, CommittedRec)> =
            recs.iter().filter(|(k, _)| !hot_keys.contains(k)).collect();
        assert!(!spilled_keys.is_empty(), "some keys must have been spilled");

        // Phase 2: delete all run files (no bloom file to delete — bloom is never persisted).
        let entries: Vec<_> = std::fs::read_dir(dir.path())
            .unwrap()
            .filter_map(|e| e.ok())
            .filter(|e| {
                let name = e.file_name().into_string().unwrap_or_default();
                name.ends_with(".run")
            })
            .collect();
        for entry in entries {
            std::fs::remove_file(entry.path()).unwrap();
        }

        // Phase 3: reopen with rebuild_fn that supplies the full committed set.
        let all_recs_clone = recs.clone();
        let hot_snap = t.hot.clone();
        let mut t2 = TieredIdem {
            hot: hot_snap,
            order: t.order.clone(),
            cap,
            runs_dir: PathBuf::new(),
            runs: Vec::new(),
            bloom: Bloom::new(1),
        };
        t2.attach_dir(dir.path(), || {
            let all = all_recs_clone.clone();
            async move { Ok(all) }
        }).await.unwrap();

        // Phase 4: all original keys must be findable.
        for (key, rec) in &recs {
            let found = t2.get(key).await;
            assert_eq!(
                found.as_ref().map(|r| r.seq),
                Some(rec.seq),
                "key {key} must be found after rebuild; run files were deleted"
            );
        }
    }

    // -----------------------------------------------------------------------
    // Merge compacts runs
    // -----------------------------------------------------------------------

    #[tokio::test]
    async fn merge_compacts_runs() {
        let dir = tempfile::tempdir().unwrap();
        // cap=2 → spill after 2 inserts; insert enough to get >8 runs
        let cap = 2usize;
        let mut t = make_tiered(dir.path(), cap).await;

        let mut recs: Vec<(String, CommittedRec)> = Vec::new();
        // Insert 30 keys; flush after every 2.
        for i in 0..30 {
            let key = format!("merge-{i:03}");
            let rec = make_rec((i + 1) as i64);
            t.insert(key.clone(), rec.clone());
            recs.push((key, rec));
            if t.needs_flush() {
                // Temporarily disable auto-merge to build many runs.
                // We do this by calling the drain step manually without merge.
                let drain_n = t.hot.len() / 2;
                let mut spilled: Vec<(String, CommittedRec)> = Vec::new();
                for _ in 0..drain_n {
                    if let Some(key) = t.order.pop_front()
                        && let Some(rec) = t.hot.remove(&key)
                    {
                        spilled.push((key, rec));
                    }
                }
                if !spilled.is_empty() {
                    spilled.sort_by(|a, b| a.0.cmp(&b.0));
                    let n = next_run_n(&t.runs);
                    let run_path = t.runs_dir.join(run_name(n));
                    let bytes = encode_run(&spilled).unwrap();
                    write_run_atomic(&run_path, &bytes).await.unwrap();
                    let min_key = spilled[0].0.clone();
                    let max_key = spilled[spilled.len() - 1].0.clone();
                    t.runs.push(RunMeta {
                        path: run_path,
                        key_range: (min_key, max_key),
                        len: spilled.len(),
                    });
                    for (key, _) in &spilled {
                        t.bloom.insert(key);
                    }
                }
            }
        }

        assert!(t.runs.len() > 8, "must have more than 8 runs before merge: {}", t.runs.len());

        // Now merge.
        t.merge_runs().await;
        assert_eq!(t.runs.len(), 1, "after merge there must be exactly 1 run");

        // All spilled keys must still be findable.
        for (key, rec) in &recs {
            let found = t.get(key).await;
            assert_eq!(
                found.as_ref().map(|r| r.seq),
                Some(rec.seq),
                "key {key} must still be found after merge"
            );
        }
    }

    // -----------------------------------------------------------------------
    // C1 regression: second merge must not clobber its output
    // -----------------------------------------------------------------------

    #[tokio::test]
    async fn second_merge_does_not_clobber_output() {
        // C1 regression: with cap=2 and 40 bulk inserts, flush_spill is called
        // ~39 times.  Auto-merge fires whenever runs.len() > 8.  With 40 bulk
        // inserts the trace is: merge at flush 9, 19, 28, 35 (four merges),
        // leaving 7 runs after the final flush.  The key invariant is:
        //
        //   1. Every live run file on disk MUST EXIST after each merge.
        //   2. A key spilled BEFORE the first merge must still resolve via get().
        //
        // Before this fix, the second merge wrote its output to a path already
        // occupied by a live run in self.runs, then the removal loop deleted
        // that path — silently destroying the merged output.
        let dir = tempfile::tempdir().unwrap();
        let cap = 2usize;
        let mut t = make_tiered(dir.path(), cap).await;

        // Track the very first key inserted — it will be spilled before any merge.
        let first_key = "first-key-ever";
        let first_rec = make_rec(1);
        t.insert(first_key.into(), first_rec.clone());

        // Insert enough keys to trigger multiple auto-merges (needs >18 spill runs).
        // With cap=2 each flush drains 1 key, so every insertion past the second
        // triggers a flush and produces one run.
        for seq in 2i64..42 {
            let key = format!("bulk-{seq}");
            t.insert(key, make_rec(seq));
            if t.needs_flush() {
                t.flush_spill().await;
            }
        }

        // With 40 bulk inserts and cap=2: ~39 flushes, 4 auto-merges happen.
        // After the last flush sequence (seq 36..41) we end up with 7 runs.
        // Verify at least 1 run remains and all run files actually exist on disk.
        assert!(
            !t.runs.is_empty(),
            "must have at least one run after sustained inserts"
        );
        for meta in &t.runs {
            assert!(
                meta.path.exists(),
                "every live run file must exist on disk: {:?}",
                meta.path
            );
        }

        // A key spilled before the first merge must still be findable after
        // multiple subsequent merges (the C1 clobber bug would lose it).
        let found = t.get(first_key).await;
        assert_eq!(
            found.as_ref().map(|r| r.seq),
            Some(first_rec.seq),
            "key spilled before first merge must still resolve after subsequent merges"
        );
    }

    // -----------------------------------------------------------------------
    // C2 regression: bloom rebuilt from runs on fresh attach, never stale
    // -----------------------------------------------------------------------

    #[tokio::test]
    async fn bloom_rebuilt_from_runs_on_attach_never_stale() {
        let dir = tempfile::tempdir().unwrap();
        let cap = 4usize;

        // Phase 1: spill some keys.
        let mut t = make_tiered(dir.path(), cap).await;
        let mut spilled_keys: Vec<String> = Vec::new();
        for i in 0..10 {
            let key = format!("stale-test-{i:02}");
            t.insert(key.clone(), make_rec(i as i64 + 1));
            spilled_keys.push(key);
            if t.needs_flush() {
                t.flush_spill().await;
            }
        }
        // Confirm some keys were actually spilled (not in hot).
        let hot_keys: std::collections::HashSet<String> = t.hot.keys().cloned().collect();
        let actually_spilled: Vec<&String> = spilled_keys
            .iter()
            .filter(|k| !hot_keys.contains(*k))
            .collect();
        assert!(!actually_spilled.is_empty(), "some keys must have been spilled to runs");

        // Phase 2: simulate a "crash" by asserting there is no bloom artifact
        // (the new design never writes one), then do a fresh attach_dir.
        // Any idem-bloom.json from the old implementation would be a stale artifact;
        // with the new design the file should not exist.
        let bloom_artifact = dir.path().join("idem-bloom.json");
        assert!(
            !bloom_artifact.exists(),
            "idem-bloom.json must not exist — bloom is never persisted"
        );

        // Phase 3: fresh TieredIdem, attach to the same dir.  The bloom must
        // be rebuilt from the run files so all spilled keys are might_contain==true.
        let mut t2 = TieredIdem::with_cap(cap);
        t2.attach_dir(dir.path(), || async { Ok(vec![]) }).await.unwrap();

        for key in &actually_spilled {
            assert!(
                t2.bloom.might_contain(key),
                "after fresh attach bloom must contain spilled key {key:?}"
            );
        }
    }
}
