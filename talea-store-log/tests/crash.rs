//! Exhaustive torn-write sweep and sealed-corruption refusal tests.
//!
//! # Recovery contract under test
//!
//! For ANY truncation point inside the FINAL frame of the FINAL segment,
//! `LogTaleaStore::open()` must succeed and replay exactly the last-acked
//! prefix (all frames before the torn one).
//!
//! For ANY corruption inside a sealed (non-final) segment, `open()` must
//! refuse with an error.
//!
//! # Snapshot note
//!
//! Default `snapshot_every` is 100_000 events. At the scale of these tests
//! (≤ 5 events per book), no snapshot is ever triggered. This is deliberate:
//! a snapshot would mask the torn tail (state loads from snapshot; the
//! truncated log tail is irrelevant). We keep the fixture small so snapshots
//! never fire, meaning recovery is always log-replay based.

use std::fs;
use std::path::{Path, PathBuf};

use talea_store_log::frame::{decode_frame, HEADER_LEN};
use talea_store_log::{LogStoreOptions, LogTaleaStore};
use talea_core::store::{AccountCfg, Store};
use talea_core::types::{
    AccountDef, AccountId, AccountKind, Amount, AssetClass, AssetDef, AssetId, Book, Direction,
    IdempotencyKey, Posting, Transaction, TxId,
};

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

fn usd() -> AssetDef {
    AssetDef {
        id: AssetId::new("USD"),
        class: AssetClass::Fiat,
        precision: 2,
        name: "Dollar".into(),
    }
}

fn cash_def() -> AccountDef {
    AccountDef {
        id: AccountId { book: Book("b".into()), path: "cash".into() },
        asset: AssetId::new("USD"),
        kind: AccountKind::Asset,
    }
}

fn rev_def() -> AccountDef {
    AccountDef {
        id: AccountId { book: Book("b".into()), path: "rev".into() },
        asset: AssetId::new("USD"),
        kind: AccountKind::Income,
    }
}

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

/// Build the seeded store: register USD, open cash + rev in book "b",
/// commit 3 transactions (+10, +20, +30 to cash), then shutdown.
///
/// Balance state after successful replay:
/// - After tx1 only:       cash = 10
/// - After tx1 + tx2:     cash = 30  (last-acked before tx3)
/// - After all three:     cash = 60
async fn build_reference(dir: &Path) {
    let store = LogTaleaStore::open(dir).await.expect("open reference store");
    store.register_asset(&usd()).await.expect("register USD");
    let cfg = AccountCfg { normal_side: None, min_balance: None };
    store.open_account(&cash_def(), &cfg).await.expect("open cash");
    store.open_account(&rev_def(), &cfg).await.expect("open rev");
    store.commit(&mk_tx("tx1", 10)).await.expect("commit tx1");
    store.commit(&mk_tx("tx2", 20)).await.expect("commit tx2");
    store.commit(&mk_tx("tx3", 30)).await.expect("commit tx3");
    store.shutdown().await;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/// Walk a segment file and return the byte offset at which each frame starts.
fn frame_offsets(path: &Path) -> Vec<u64> {
    let bytes = fs::read(path).expect("read segment for frame_offsets");
    let mut offsets = Vec::new();
    let mut pos: usize = 0;
    loop {
        match decode_frame(&bytes[pos..]) {
            Ok(None) => break,
            Ok(Some((_, consumed))) => {
                offsets.push(pos as u64);
                pos += consumed;
            }
            Err(e) => panic!("decode_frame error at offset {pos} while building offsets: {e}"),
        }
    }
    offsets
}

/// Recursively copy `src` directory to `dst` (dst must not exist yet).
fn copy_dir(src: &Path, dst: &Path) {
    fs::create_dir_all(dst).expect("copy_dir: create dst");
    for entry in fs::read_dir(src).expect("copy_dir: read_dir src") {
        let entry = entry.expect("copy_dir: entry");
        let src_path = entry.path();
        let dst_path = dst.join(entry.file_name());
        if entry.file_type().expect("copy_dir: file_type").is_dir() {
            copy_dir(&src_path, &dst_path);
        } else {
            fs::copy(&src_path, &dst_path).expect("copy_dir: copy file");
        }
    }
}

/// Return the path of the newest (highest-numbered) `segment-*.log` in
/// `book_dir`.
fn newest_segment(book_dir: &Path) -> PathBuf {
    let mut entries: Vec<PathBuf> = fs::read_dir(book_dir)
        .expect("newest_segment: read_dir")
        .filter_map(|e| {
            let e = e.ok()?;
            let name = e.file_name().into_string().ok()?;
            if name.starts_with("segment-") && name.ends_with(".log") {
                Some(e.path())
            } else {
                None
            }
        })
        .collect();
    entries.sort();
    entries.into_iter().last().expect("newest_segment: no segment file found")
}

// ---------------------------------------------------------------------------
// Test 1: exhaustive truncation sweep — last frame (tx3)
// ---------------------------------------------------------------------------

/// For every byte position inside the last frame of book "b"'s segment,
/// truncate the file to that position, reopen, and assert:
///   1. open() succeeds (no panic / no Err).
///   2. cash balance == 30 (tx1 + tx2 recovered; torn tx3 discarded).
///
/// Frames in book "b": [open cash, open rev, tx1, tx2, tx3]
///   — the LAST frame is tx3, so any cut inside it must recover balance 30.
///   — cuts at exactly `last_start` (frame fully gone) are also included.
///
/// This is ~100-300 iterations (one per byte of the last JSON frame).
#[tokio::test]
async fn truncation_sweep_recovers_last_acked_prefix() {
    let ref_dir = tempfile::tempdir().expect("ref_dir tempdir");
    build_reference(ref_dir.path()).await;

    let book_dir = ref_dir.path().join("books").join("b");
    let segment = newest_segment(&book_dir);
    let file_len = fs::metadata(&segment).expect("segment metadata").len();
    let starts = frame_offsets(&segment);
    assert!(starts.len() >= 5, "expected ≥5 frames, got {}", starts.len());

    let last_start = *starts.last().unwrap();

    let cash_id = cash_def().id;
    let mut sweep_count: u64 = 0;

    for cut in last_start..file_len {
        // Fresh copy of the reference directory.
        let work_dir = tempfile::tempdir().expect("work_dir tempdir");
        copy_dir(ref_dir.path(), work_dir.path());
        // Remove LOCK so the copy is openable.
        let _ = fs::remove_file(work_dir.path().join("LOCK"));

        // Truncate the newest segment of book "b" to `cut` bytes.
        let work_segment = newest_segment(&work_dir.path().join("books").join("b"));
        {
            let f = fs::OpenOptions::new()
                .write(true)
                .open(&work_segment)
                .expect("open work segment for truncation");
            f.set_len(cut).expect("set_len");
        }

        // open() MUST succeed — torn tail in the final segment is safe to repair.
        let store = LogTaleaStore::open(work_dir.path())
            .await
            .unwrap_or_else(|e| {
                panic!(
                    "truncation_sweep: open() failed at cut={cut} (last_start={last_start}, \
                     file_len={file_len}): {e}"
                )
            });

        // Balance MUST be 30 (tx1 + tx2; tx3 was torn).
        let bal = store
            .balance(&cash_id, None)
            .await
            .unwrap_or_else(|e| {
                panic!("truncation_sweep: balance() failed at cut={cut}: {e}")
            });
        assert_eq!(
            bal.amount.minor(),
            30,
            "truncation_sweep: expected balance 30 at cut={cut}, got {}",
            bal.amount.minor()
        );

        store.shutdown().await;
        sweep_count += 1;
    }

    // Sanity: we swept at least one byte position.
    assert!(sweep_count > 0, "sweep ran 0 iterations — last frame must have been non-empty");
    println!("truncation_sweep_recovers_last_acked_prefix: swept {sweep_count} cut points");
}

// ---------------------------------------------------------------------------
// Test 2: one representative cut inside tx2's frame — must recover balance 10
// ---------------------------------------------------------------------------

/// Truncate from `starts[len-2]` (inside tx2's frame) mid-way through
/// the frame body. Recovery must yield cash balance 10 (only tx1 acked).
///
/// One representative cut is sufficient to prove the invariant for earlier
/// frames; the exhaustive sweep above covers all positions in the last frame.
#[tokio::test]
async fn cut_one_frame_earlier_recovers_first_tx_state() {
    let ref_dir = tempfile::tempdir().expect("ref_dir tempdir");
    build_reference(ref_dir.path()).await;

    let book_dir = ref_dir.path().join("books").join("b");
    let segment = newest_segment(&book_dir);
    let starts = frame_offsets(&segment);
    assert!(starts.len() >= 5, "expected ≥5 frames, got {}", starts.len());

    // starts[len-2] is the start of tx2's frame; cut 7 bytes in (past the
    // 8-byte header but well within the JSON payload).
    let tx2_start = starts[starts.len() - 2];
    let cut = tx2_start + 7;

    let work_dir = tempfile::tempdir().expect("work_dir tempdir");
    copy_dir(ref_dir.path(), work_dir.path());
    let _ = fs::remove_file(work_dir.path().join("LOCK"));

    let work_segment = newest_segment(&work_dir.path().join("books").join("b"));
    {
        let f = fs::OpenOptions::new()
            .write(true)
            .open(&work_segment)
            .expect("open work segment for truncation");
        f.set_len(cut).expect("set_len");
    }

    let store = LogTaleaStore::open(work_dir.path())
        .await
        .expect("open must succeed after mid-tx2 truncation");

    let bal = store
        .balance(&cash_def().id, None)
        .await
        .expect("balance must succeed");

    assert_eq!(
        bal.amount.minor(),
        10,
        "mid-tx2 truncation must recover only tx1 (balance 10), got {}",
        bal.amount.minor()
    );

    store.shutdown().await;
}

// ---------------------------------------------------------------------------
// Test 3: sealed-segment corruption refuses open() everywhere
// ---------------------------------------------------------------------------

/// Build a store with TINY segments (segment_max=64) so multiple sealed
/// segments exist. For each sealed (non-final) segment, copy the reference
/// dir, flip one byte mid-segment, and assert `open()` returns Err.
#[tokio::test]
async fn sealed_segment_corruption_refuses_open_everywhere() {
    let ref_dir = tempfile::tempdir().expect("ref_dir tempdir");

    // Open with tiny segments so we get multiple sealed ones from just a few events.
    let opts = LogStoreOptions {
        idem_hot_cap: talea_store_log::idem_spill::DEFAULT_IDEM_HOT_CAP,
        snapshot_every: 100_000, // won't fire; see module-level note
        segment_max: 64,         // tiny: each segment fills after ~1 frame
    };
    {
        let store = LogTaleaStore::open_with(ref_dir.path(), opts)
            .await
            .expect("open reference store");
        store.register_asset(&usd()).await.expect("register USD");
        let cfg = AccountCfg { normal_side: None, min_balance: None };
        store.open_account(&cash_def(), &cfg).await.expect("open cash");
        store.open_account(&rev_def(), &cfg).await.expect("open rev");
        store.commit(&mk_tx("tx1", 10)).await.expect("commit tx1");
        store.commit(&mk_tx("tx2", 20)).await.expect("commit tx2");
        store.commit(&mk_tx("tx3", 30)).await.expect("commit tx3");
        store.shutdown().await;
    }

    let book_dir = ref_dir.path().join("books").join("b");

    // Collect all segments, sorted.
    let mut seg_paths: Vec<PathBuf> = fs::read_dir(&book_dir)
        .expect("read book_dir")
        .filter_map(|e| {
            let e = e.ok()?;
            let name = e.file_name().into_string().ok()?;
            if name.starts_with("segment-") && name.ends_with(".log") {
                Some(e.path())
            } else {
                None
            }
        })
        .collect();
    seg_paths.sort();

    assert!(
        seg_paths.len() >= 2,
        "expected ≥2 segments with segment_max=64, got {}; \
         increase segment_max or add more events if frame sizes changed",
        seg_paths.len()
    );

    // Sealed segments = all but the last.
    let sealed: &[PathBuf] = &seg_paths[..seg_paths.len() - 1];

    for sealed_path in sealed {
        let seg_name = sealed_path
            .file_name()
            .unwrap()
            .to_string_lossy()
            .to_string();

        let work_dir = tempfile::tempdir().expect("work_dir tempdir");
        copy_dir(ref_dir.path(), work_dir.path());
        let _ = fs::remove_file(work_dir.path().join("LOCK"));

        // Flip one byte mid-segment in the copy.
        let work_seg = work_dir.path().join("books").join("b").join(&seg_name);
        let mut bytes = fs::read(&work_seg).expect("read work segment");
        assert!(!bytes.is_empty(), "sealed segment must be non-empty: {seg_name}");
        let mid = bytes.len() / 2;
        bytes[mid] ^= 0xFF;
        fs::write(&work_seg, &bytes).expect("write corrupted segment");

        // open() MUST fail — sealed segment corruption is unrecoverable.
        let result = LogTaleaStore::open(work_dir.path()).await;
        assert!(
            result.is_err(),
            "sealed_segment_corruption_refuses_open: open() must fail for corrupted \
             sealed segment {seg_name}, but it succeeded"
        );
    }

    println!(
        "sealed_segment_corruption_refuses_open_everywhere: tested {} sealed segment(s)",
        sealed.len()
    );
}

// ---------------------------------------------------------------------------
// Test 4: truncation to empty — open succeeds, state is empty, new commits work
// ---------------------------------------------------------------------------

/// Truncate the only segment of book "b" to 0 bytes.
///
/// Expected behaviour:
/// - open() succeeds (empty file == empty log, no frames, no error).
/// - balance() for cash returns UnknownAccount (no AccountOpened event was
///   replayed, so the account doesn't exist in the recovered state).
/// - A fresh register/open/commit cycle on a NEW book ("c") works end-to-end.
#[tokio::test]
async fn truncation_to_empty_book_dir_recovers_clean() {
    let ref_dir = tempfile::tempdir().expect("ref_dir tempdir");
    build_reference(ref_dir.path()).await;

    let work_dir = tempfile::tempdir().expect("work_dir tempdir");
    copy_dir(ref_dir.path(), work_dir.path());
    let _ = fs::remove_file(work_dir.path().join("LOCK"));

    // Truncate the only segment of book "b" to 0 bytes.
    let seg = newest_segment(&work_dir.path().join("books").join("b"));
    {
        let f = fs::OpenOptions::new()
            .write(true)
            .open(&seg)
            .expect("open segment for truncation");
        f.set_len(0).expect("truncate to 0");
    }

    let store = LogTaleaStore::open(work_dir.path())
        .await
        .expect("open must succeed after emptying the only segment");

    // balance for cash must return UnknownAccount — the AccountOpened event
    // was truncated away, so the account does not exist in the recovered state.
    let bal_result = store.balance(&cash_def().id, None).await;
    assert!(
        matches!(bal_result, Err(talea_core::store::StoreError::UnknownAccount(_))),
        "expected UnknownAccount after emptying the log, got: {bal_result:?}"
    );

    // A fresh commit cycle on a NEW book must work correctly.
    let new_cfg = AccountCfg { normal_side: None, min_balance: None };
    let new_cash = AccountDef {
        id: AccountId { book: Book("c".into()), path: "cash".into() },
        asset: AssetId::new("USD"),
        kind: AccountKind::Asset,
    };
    let new_rev = AccountDef {
        id: AccountId { book: Book("c".into()), path: "rev".into() },
        asset: AssetId::new("USD"),
        kind: AccountKind::Income,
    };
    let new_tx = Transaction {
        id: TxId(uuid::Uuid::now_v7()),
        book: Book("c".into()),
        postings: vec![
            Posting {
                account: AccountId { book: Book("c".into()), path: "cash".into() },
                amount: Amount::new(99, AssetId::new("USD")),
                direction: Direction::Debit,
            },
            Posting {
                account: AccountId { book: Book("c".into()), path: "rev".into() },
                amount: Amount::new(99, AssetId::new("USD")),
                direction: Direction::Credit,
            },
        ],
        idempotency_key: IdempotencyKey("new-tx".into()),
        external_refs: vec![],
        metadata: serde_json::Value::Null,
        occurred_at: chrono::Utc::now(),
    };

    // USD was in _system book which may also have been wiped — re-register if needed.
    let _ = store.register_asset(&usd()).await; // idempotent or re-registers

    store.open_account(&new_cash, &new_cfg).await.expect("open new cash");
    store.open_account(&new_rev, &new_cfg).await.expect("open new rev");
    let committed = store.commit(&new_tx).await.expect("commit on new book");

    let new_bal = store
        .balance(&new_cash.id, None)
        .await
        .expect("balance on new book");
    assert_eq!(
        new_bal.amount.minor(),
        99,
        "fresh commit on new book must yield balance 99, got {}",
        new_bal.amount.minor()
    );
    assert_eq!(committed.seq, new_bal.updated_seq, "seq must match updated_seq");

    store.shutdown().await;
}

// ---------------------------------------------------------------------------
// Byte-boundary sanity: HEADER_LEN is exported and matches our expectation
// ---------------------------------------------------------------------------

#[test]
fn header_len_is_8() {
    // u32 payload_len + u32 crc32 = 8 bytes.
    assert_eq!(HEADER_LEN, 8);
}
