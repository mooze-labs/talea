//! Atomic per-book snapshots: `snapshot-<last_seq:020>.snap` =
//! u32-LE crc32(payload) | payload: JSON BookState.
//!
//! Snapshots bound startup time: instead of replaying the full event log from
//! genesis, `open` loads the latest valid snapshot and replays only the tail
//! starting at `snap_seq + 1`.
//!
//! # File format
//!
//! ```text
//! [u32 LE crc32(payload)] [JSON-encoded BookState bytes]
//! ```
//!
//! # Atomicity discipline (mirrors `SegmentSet::maybe_rotate`)
//!
//! 1. Write to `<name>.tmp`
//! 2. `sync_all` on the tmp file (data durable before dirent is visible)
//! 3. Rename tmp → final name (atomic on POSIX; Windows deferred)
//! 4. fsync the directory so the new dirent is durable
//!
//! A crash between steps 3 and 4 leaves the directory entry pending in the
//! journal — on Linux the rename is already visible to a reopener but the dirent
//! may be lost by a power failure before the fsync.  Directory fsyncing is the
//! standard cure; we apply it for the same reason `SegmentSet` does.
//!
//! # Retention
//!
//! After each successful write, `prune_old` removes all but the two newest
//! `.snap` files (by seq).  Segments are NEVER deleted — only snap files.

use std::path::Path;

use talea_core::types::Seq;

use crate::state::BookState;

const CRC_LEN: usize = 4;

fn snap_name(seq: Seq) -> String {
    format!("snapshot-{:020}.snap", seq)
}

fn parse_snap_seq(name: &str) -> Option<Seq> {
    let s = name.strip_prefix("snapshot-")?.strip_suffix(".snap")?;
    s.parse().ok()
}

/// fsync the directory so any newly-created or renamed dirent is durable.
///
/// A file whose directory entry is lost by a crash is silently absent on
/// recovery even though the file data may be intact — the OS had no way to
/// link it.  This is the same reasoning used by `SegmentSet::maybe_rotate`.
fn fsync_dir(dir: &Path) -> std::io::Result<()> {
    std::fs::File::open(dir)?.sync_all()
}

/// Write a snapshot for `state` at `last_seq` into `dir`.
///
/// Uses the tmp→rename→fsync-dir discipline for atomicity.
/// Calls `prune_old` after the rename to keep at most two snapshots.
pub async fn write_snapshot(dir: &Path, state: &BookState, last_seq: Seq) -> std::io::Result<()> {
    let payload = serde_json::to_vec(state)
        .map_err(|e| std::io::Error::other(format!("snapshot serialize: {e}")))?;
    let crc = crc32fast::hash(&payload);

    let mut snap_bytes = Vec::with_capacity(CRC_LEN + payload.len());
    snap_bytes.extend_from_slice(&crc.to_le_bytes());
    snap_bytes.extend_from_slice(&payload);

    let final_name = snap_name(last_seq);
    let tmp_path = dir.join(format!("{final_name}.tmp"));
    let final_path = dir.join(&final_name);

    // Step 1 + 2: write to tmp, sync_all.
    tokio::fs::write(&tmp_path, &snap_bytes).await?;
    {
        let f = std::fs::OpenOptions::new()
            .write(true)
            .open(&tmp_path)
            .map_err(|e| std::io::Error::other(format!("open tmp for sync: {e}")))?;
        f.sync_all()?;
    }

    // Step 3: rename (atomic on POSIX).
    tokio::fs::rename(&tmp_path, &final_path).await?;

    // Step 4: fsync the directory so the new dirent is durable.
    let dir_owned = dir.to_path_buf();
    tokio::task::spawn_blocking(move || fsync_dir(&dir_owned))
        .await
        .map_err(|e| std::io::Error::other(format!("spawn_blocking join: {e}")))??;

    // Prune old snapshots; keep the two newest.
    prune_old(dir).await
}

/// Load the newest valid snapshot from `dir`.
///
/// Enumerates `snapshot-*.snap` files sorted descending by seq.
/// Returns `Some((state, seq))` for the first one that passes CRC and JSON
/// parsing.  Warns (via `tracing::warn`) for each skipped file.
///
/// Returns `Ok(None)` if no valid snapshot exists (fall back to full replay).
///
/// An I/O error reading the directory is propagated as `Err`; a CRC/parse
/// failure on an individual file is NOT — that is a soft skip.
pub async fn load_latest(dir: &Path) -> std::io::Result<Option<(BookState, Seq)>> {
    // Enumerate snapshot files.
    let mut entries: Vec<(Seq, std::path::PathBuf)> = Vec::new();
    let mut rd = tokio::fs::read_dir(dir).await?;
    while let Some(entry) = rd.next_entry().await? {
        let name = entry
            .file_name()
            .into_string()
            .map_err(|_| std::io::Error::other("non-UTF-8 snapshot filename"))?;
        if let Some(seq) = parse_snap_seq(&name) {
            entries.push((seq, entry.path()));
        }
    }

    // Sort descending by seq — try newest first.
    entries.sort_by_key(|b| std::cmp::Reverse(b.0));

    for (seq, path) in &entries {
        match try_load_snapshot(path).await {
            Ok(state) => return Ok(Some((state, *seq))),
            Err(reason) => {
                tracing::warn!(
                    ?path,
                    %reason,
                    "skipping invalid snapshot (CRC or parse failure); trying older"
                );
                // Not an error — fall through to next candidate.
            }
        }
    }

    Ok(None)
}

/// Attempt to load and verify a single snapshot file.
///
/// Returns `Err(String)` (soft, not propagated as `io::Error`) on CRC failure
/// or JSON parse failure.
async fn try_load_snapshot(path: &Path) -> Result<BookState, String> {
    let bytes = tokio::fs::read(path)
        .await
        .map_err(|e| format!("read: {e}"))?;

    // CRC_LEN is 4: take the CRC as a fixed-size chunk; a shorter file is
    // malformed.
    let Some((crc_bytes, payload)) = bytes.split_first_chunk::<CRC_LEN>() else {
        return Err(format!("file too short: {} bytes", bytes.len()));
    };
    let stored_crc = u32::from_le_bytes(*crc_bytes);
    let actual_crc = crc32fast::hash(payload);

    if stored_crc != actual_crc {
        return Err(format!(
            "CRC mismatch: stored={stored_crc:#010x} actual={actual_crc:#010x}"
        ));
    }

    serde_json::from_slice(payload).map_err(|e| format!("JSON parse: {e}"))
}

/// Remove all but the two newest `.snap` files from `dir`.
///
/// Only `.snap` files (not `.snap.tmp`) are pruned.  Errors on individual
/// deletes are logged as warnings but do NOT propagate — pruning is best-effort
/// (we'd rather have stale files than crash a writer over a delete failure).
pub async fn prune_old(dir: &Path) -> std::io::Result<()> {
    let mut snaps: Vec<(Seq, std::path::PathBuf)> = Vec::new();
    let mut rd = tokio::fs::read_dir(dir).await?;
    while let Some(entry) = rd.next_entry().await? {
        let name = entry
            .file_name()
            .into_string()
            .map_err(|_| std::io::Error::other("non-UTF-8 snap filename in prune"))?;
        if let Some(seq) = parse_snap_seq(&name) {
            snaps.push((seq, entry.path()));
        }
    }

    // Sort descending: snaps[0] and snaps[1] are the two newest.
    snaps.sort_by_key(|b| std::cmp::Reverse(b.0));

    for (_, path) in snaps.into_iter().skip(2) {
        if let Err(e) = tokio::fs::remove_file(&path).await {
            tracing::warn!(?path, error = %e, "prune_old: failed to remove old snapshot");
        }
    }

    Ok(())
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use crate::state::{AccountState, BookState, CommittedRec, PostingIndex};
    use talea_core::store::AccountCfg;
    use talea_core::types::*;

    /// Build a `BookState` with one account and one applied transaction so
    /// all the interesting fields (balances, idem, txids, sums) are populated.
    fn make_state() -> BookState {
        let mut st = BookState::default();
        let id = AccountId {
            book: Book("b".into()),
            path: "cash".into(),
        };
        let asset = AssetId::new("USD");
        st.accounts.insert(
            id.to_key(),
            AccountState {
                def: AccountDef {
                    id: id.clone(),
                    asset: asset.clone(),
                    kind: AccountKind::Asset,
                },
                cfg: AccountCfg {
                    normal_side: Some(Direction::Debit),
                    min_balance: Some(0),
                },
                raw_balance: 42,
                updated_seq: 1,
                postings: PostingIndex::default(),
            },
        );
        let txid = uuid::Uuid::now_v7();
        let at = talea_core::store::ledger_now();
        st.idem.insert(
            "idem-key".into(),
            CommittedRec {
                txid: TxId(txid),
                seq: 1,
                at,
            },
        );
        st.txids.insert(txid, (1, (1, 0)));
        *st.sums.entry(asset).or_insert((0, 0)) = (42, 0);
        st.next_seq = 2;
        st.last_at = Some(at);
        // Note: idem.runs_dir is empty (not attached to a dir) in this test helper;
        // the hot map contains the key, so round-trip tests work without attach_dir.
        st
    }

    #[tokio::test]
    async fn snapshot_round_trips_book_state() {
        let dir = tempfile::tempdir().unwrap();
        let st = make_state();
        let seq: Seq = 42;

        write_snapshot(dir.path(), &st, seq).await.unwrap();

        let loaded = load_latest(dir.path()).await.unwrap();
        assert!(
            loaded.is_some(),
            "load_latest must return Some after writing a snapshot"
        );
        let (got, got_seq) = loaded.unwrap();

        assert_eq!(got_seq, seq, "returned seq must match written seq");
        assert_eq!(
            got.next_seq, st.next_seq,
            "next_seq must survive round-trip"
        );
        assert_eq!(
            got.accounts.len(),
            st.accounts.len(),
            "accounts must survive"
        );
        // Balance round-trips.
        let id = AccountId {
            book: Book("b".into()),
            path: "cash".into(),
        };
        assert_eq!(
            got.accounts[&id.to_key()].raw_balance,
            st.accounts[&id.to_key()].raw_balance,
            "raw_balance must survive round-trip"
        );
        // Idempotency key survives (in the hot map — the dir is not attached in this test).
        assert!(
            got.idem.hot.contains_key("idem-key"),
            "idem must survive round-trip"
        );
        let orig_rec = &st.idem.hot["idem-key"];
        let got_rec = &got.idem.hot["idem-key"];
        assert_eq!(got_rec.seq, orig_rec.seq, "idem record seq must match");
        // txids survive.
        assert_eq!(
            got.txids.len(),
            st.txids.len(),
            "txids must survive round-trip"
        );
        // sums survive.
        assert_eq!(got.sums, st.sums, "sums must survive round-trip");
        // writer_attached is a fresh false flag after deserialization (serde skip + default).
        assert!(
            !got.writer_attached
                .load(std::sync::atomic::Ordering::Acquire),
            "deserialized writer_attached must be false (fresh unattached flag)"
        );
    }

    #[tokio::test]
    async fn corrupt_snapshot_is_skipped_in_favor_of_older() {
        let dir = tempfile::tempdir().unwrap();
        let st = make_state();

        // Write the older snapshot at seq 10.
        write_snapshot(dir.path(), &st, 10).await.unwrap();

        // Write the newer snapshot at seq 20.
        write_snapshot(dir.path(), &st, 20).await.unwrap();

        // Flip one byte in the middle of the seq-20 snapshot file to corrupt it.
        let snap_20_path = dir.path().join(snap_name(20));
        let mut bytes = std::fs::read(&snap_20_path).unwrap();
        let mid = bytes.len() / 2;
        bytes[mid] ^= 0xFF;
        std::fs::write(&snap_20_path, &bytes).unwrap();

        // load_latest must fall back to seq 10 — no Err, just the older snapshot.
        let loaded = load_latest(dir.path())
            .await
            .expect("load_latest must return Ok even when newest snapshot is corrupt");

        assert!(
            loaded.is_some(),
            "load_latest must return Some (the seq-10 snapshot)"
        );
        let (_, got_seq) = loaded.unwrap();
        assert_eq!(
            got_seq, 10,
            "must fall back to seq-10 snapshot, got seq={got_seq}"
        );
    }

    #[tokio::test]
    async fn only_latest_two_snapshots_are_retained() {
        let dir = tempfile::tempdir().unwrap();
        let st = make_state();

        // Write three snapshots via the full write_snapshot (which calls prune_old).
        write_snapshot(dir.path(), &st, 10).await.unwrap();
        write_snapshot(dir.path(), &st, 20).await.unwrap();
        write_snapshot(dir.path(), &st, 30).await.unwrap();

        // Enumerate .snap files remaining in the directory.
        let mut snaps: Vec<Seq> = std::fs::read_dir(dir.path())
            .unwrap()
            .filter_map(|e| {
                let e = e.ok()?;
                let name = e.file_name().into_string().ok()?;
                parse_snap_seq(&name)
            })
            .collect();
        snaps.sort();

        assert_eq!(
            snaps,
            vec![20, 30],
            "only the two newest snapshots must be retained; found seqs: {snaps:?}"
        );
    }

    // -----------------------------------------------------------------------
    // Task 13 extras (cheap gap-closers from Task 12 review)
    // -----------------------------------------------------------------------

    /// A stray `.snap.tmp` file left by a crashed write must be ignored by
    /// `load_latest`.  Only `.snap` (not `.snap.tmp`) files should be
    /// enumerated.
    #[tokio::test]
    async fn stray_snap_tmp_is_ignored_by_load_latest() {
        let dir = tempfile::tempdir().unwrap();
        let st = make_state();

        // Write a valid snapshot at seq 5.
        write_snapshot(dir.path(), &st, 5).await.unwrap();

        // Drop a stray .tmp file (simulating a crash mid-write).
        let stray = dir.path().join("snapshot-00000000000000000099.snap.tmp");
        std::fs::write(&stray, b"garbage").unwrap();

        // load_latest must return the seq-5 snapshot, not error and not treat
        // the .tmp as a valid snapshot file.
        let loaded = load_latest(dir.path()).await.unwrap();
        assert!(
            loaded.is_some(),
            "load_latest must return Some (seq-5 snapshot)"
        );
        let (_, got_seq) = loaded.unwrap();
        assert_eq!(
            got_seq, 5,
            "must return the seq-5 snapshot, ignoring the .tmp file"
        );
    }

    /// When ALL snapshot files are corrupt, `load_latest` must return
    /// `Ok(None)` rather than `Err`.
    #[tokio::test]
    async fn all_snapshots_corrupt_returns_ok_none() {
        let dir = tempfile::tempdir().unwrap();
        let st = make_state();

        // Write two valid snapshots.
        write_snapshot(dir.path(), &st, 10).await.unwrap();
        write_snapshot(dir.path(), &st, 20).await.unwrap();

        // Corrupt both by zeroing their payloads.
        for seq in [10i64, 20] {
            let path = dir.path().join(snap_name(seq));
            let mut bytes = std::fs::read(&path).unwrap();
            // Zero the payload (after the 4-byte CRC) so CRC mismatch.
            for b in bytes.iter_mut().skip(4) {
                *b = 0;
            }
            std::fs::write(&path, &bytes).unwrap();
        }

        let result = load_latest(dir.path()).await;
        assert!(
            result.is_ok(),
            "load_latest must return Ok even with all snapshots corrupt"
        );
        assert!(
            result.unwrap().is_none(),
            "load_latest must return None when all snapshots are corrupt"
        );
    }
}
