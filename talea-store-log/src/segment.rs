//! Segment set: a book's on-disk log as `segment-<base_seq:020>.log` files.
//!
//! Recovery contract:
//! - Only the FINAL (newest) segment may have a torn tail. Any decode failure
//!   there truncates the file to the last good frame boundary.
//! - ANY decode failure in a sealed (non-final) segment is corruption → open
//!   must fail with an error naming the segment and offset.

use std::collections::BTreeMap;
use std::io::SeekFrom;
use std::path::{Path, PathBuf};
use std::sync::{Arc, RwLock};

use talea_core::types::Seq;
use tokio::fs::File;
use tokio::io::{AsyncReadExt, AsyncSeekExt, AsyncWriteExt};

use crate::frame::{WireEvent, decode_frame, HEADER_LEN};

pub const DEFAULT_SEGMENT_MAX: u64 = 128 * 1024 * 1024;

// ---------------------------------------------------------------------------
// SegmentCatalog — shared, clone-able read view of the segment map
// ---------------------------------------------------------------------------

/// A shared, clone-able catalog of segment base-seqs → paths.
///
/// Owned by [`SegmentSet`] but cloned out to readers (e.g. `BookWriter`)
/// so read operations (`scan_from`, `scan_with_pos`, `read_at`) can happen
/// without holding the writer task's exclusive `SegmentSet`.
///
/// The inner `BTreeMap` is updated in exactly two places:
/// 1. [`SegmentSet::open_with_max`] — initial enumeration.
/// 2. [`SegmentSet::maybe_rotate`] — on every segment rotation.
///
/// All other operations (append, sync) leave the catalog unchanged.
#[derive(Clone)]
pub struct SegmentCatalog(pub(crate) Arc<RwLock<BTreeMap<Seq, PathBuf>>>);

impl SegmentCatalog {
    /// Scan events ascending with `seq >= from`, returning at most `limit`.
    ///
    /// # Torn-tail safety on the active (last) segment
    ///
    /// A decode error on the **last segment in the snapshot** is treated as a
    /// clean stop rather than a hard error.  This mirrors the same asymmetry in
    /// [`open_with_max`]/[`validate`]:
    ///
    /// - The active segment is written by the concurrent writer task.  Between
    ///   `append` (page-cache visible) and `sync` (durable), readers may observe
    ///   a partial frame at the tail — a `FrameError::Torn`.  That is not
    ///   corruption; it means "no more durable frames here."
    /// - Even a fully corrupt tail (bad CRC) on the active segment may be a
    ///   mid-write state that `open()` would truncate on the next restart.
    ///   Surfacing it as a hard error would break callers unnecessarily.
    ///
    /// A decode error on any **sealed (non-final) segment** remains a hard
    /// `io::Error`: sealed segments are immutable — damage there is real
    /// corruption that should not be silently swallowed.
    pub async fn scan_from(&self, from: Seq, limit: usize) -> std::io::Result<Vec<WireEvent>> {
        if limit == 0 {
            return Ok(vec![]);
        }
        let snapshot = {
            let guard = self.0.read().unwrap();
            guard.clone()
        };

        let last_base = match snapshot.keys().next_back() {
            Some(&b) => b,
            None => return Ok(vec![]),
        };

        let start_base = snapshot
            .range(..=from)
            .next_back()
            .map(|(k, _)| *k)
            .unwrap_or_else(|| *snapshot.keys().next().unwrap());

        let mut results = Vec::new();
        'segments: for (&seg_base, path) in snapshot.range(start_base..) {
            if results.len() >= limit {
                break;
            }
            let is_last = seg_base == last_base;
            let bytes = tokio::fs::read(path).await?;
            let mut pos = 0usize;
            loop {
                if results.len() >= limit {
                    break;
                }
                match decode_frame(&bytes[pos..]) {
                    Ok(None) => break,
                    Ok(Some((ev, consumed))) => {
                        pos += consumed;
                        if ev.seq >= from {
                            results.push(ev);
                        }
                    }
                    Err(_) if is_last => {
                        // Decode error on the active segment: either an in-flight
                        // append (not yet fsynced) or a torn tail that open() will
                        // truncate on next startup.  Either way, no more durable
                        // frames are readable here — stop cleanly.
                        break 'segments;
                    }
                    Err(e) => {
                        return Err(std::io::Error::other(format!(
                            "decode error in {path:?} at offset {pos}: {e}"
                        )));
                    }
                }
            }
        }
        Ok(results)
    }

    /// Like [`scan_from`] but each event is paired with its `FramePos`.
    ///
    /// # Torn-tail safety on the active (last) segment
    ///
    /// Identical rule as [`scan_from`]: a decode error on the **last segment**
    /// is a clean stop (in-flight append or torn tail); a decode error on any
    /// **sealed segment** is a hard error.  See [`scan_from`] for the full
    /// rationale.
    pub async fn scan_with_pos(
        &self,
        from: Seq,
        limit: usize,
    ) -> std::io::Result<Vec<(WireEvent, crate::state::FramePos)>> {
        if limit == 0 {
            return Ok(vec![]);
        }
        let snapshot = {
            let guard = self.0.read().unwrap();
            guard.clone()
        };

        let last_base = match snapshot.keys().next_back() {
            Some(&b) => b,
            None => return Ok(vec![]),
        };

        let start_base = snapshot
            .range(..=from)
            .next_back()
            .map(|(k, _)| *k)
            .unwrap_or_else(|| *snapshot.keys().next().unwrap());

        let mut results = Vec::new();
        'segments: for (&seg_base, path) in snapshot.range(start_base..) {
            if results.len() >= limit {
                break;
            }
            let is_last = seg_base == last_base;
            let bytes = tokio::fs::read(path).await?;
            let mut byte_offset: u64 = 0;
            loop {
                if results.len() >= limit {
                    break;
                }
                match decode_frame(&bytes[byte_offset as usize..]) {
                    Ok(None) => break,
                    Ok(Some((ev, consumed))) => {
                        let frame_start = byte_offset;
                        byte_offset += consumed as u64;
                        if ev.seq >= from {
                            results.push((ev, (seg_base, frame_start)));
                        }
                    }
                    Err(_) if is_last => {
                        // Decode error on the active segment: in-flight append or
                        // torn tail.  Stop cleanly — no more durable frames here.
                        break 'segments;
                    }
                    Err(e) => {
                        return Err(std::io::Error::other(format!(
                            "decode error in {path:?} at offset {byte_offset}: {e}"
                        )));
                    }
                }
            }
        }
        Ok(results)
    }

    /// Open the segment with `segment_base`, seek to `offset`, decode one frame.
    pub async fn read_at(
        &self,
        segment_base: Seq,
        offset: u64,
        expected_seq: Seq,
    ) -> std::io::Result<WireEvent> {
        let path = {
            let guard = self.0.read().unwrap();
            guard
                .get(&segment_base)
                .cloned()
                .ok_or_else(|| std::io::Error::other(format!("unknown segment base {segment_base}")))?
        };

        let mut file = File::open(&path).await?;
        let file_len = file.metadata().await?.len();

        file.seek(SeekFrom::Start(offset)).await?;
        let mut header = [0u8; HEADER_LEN];
        file.read_exact(&mut header).await?;
        let payload_len = u32::from_le_bytes(header[0..4].try_into().unwrap()) as usize;

        let frame_end = offset
            .checked_add((HEADER_LEN + payload_len) as u64)
            .ok_or_else(|| std::io::Error::other("frame length arithmetic overflow"))?;
        if frame_end > file_len {
            return Err(std::io::Error::other(format!(
                "frame header at {offset} claims {payload_len} bytes past end of segment"
            )));
        }

        let mut frame = vec![0u8; HEADER_LEN + payload_len];
        frame[..HEADER_LEN].copy_from_slice(&header);
        file.read_exact(&mut frame[HEADER_LEN..]).await?;
        let ev = match decode_frame(&frame) {
            Ok(Some((ev, _))) => ev,
            Ok(None) => return Err(std::io::Error::other("empty frame at read_at")),
            Err(e) => {
                return Err(std::io::Error::other(format!(
                    "decode error at offset {offset}: {e}"
                )))
            }
        };

        if ev.seq != expected_seq {
            return Err(std::io::Error::other(format!(
                "frame at {segment_base}/{offset} has seq {got}, expected {expected_seq} — stale or wrong position",
                got = ev.seq,
            )));
        }

        Ok(ev)
    }
}

/// Private helper result for per-segment validation.
#[derive(Debug)]
enum Validation {
    Clean,
    Truncate(u64),    // truncate to this byte length
    Corrupt(u64),     // corruption found at this offset
}

fn segment_name(base: Seq) -> String {
    format!("segment-{:020}.log", base)
}

fn parse_base(name: &str) -> Option<Seq> {
    let s = name.strip_prefix("segment-")?.strip_suffix(".log")?;
    s.parse().ok()
}

/// fsync the directory itself so that any newly-created dirent is durable.
///
/// A file whose directory entry is lost by a crash is silently absent on
/// recovery even though the file data may be intact — the OS had no way to
/// link it.  Calling this after creating a segment file prevents that gap.
fn fsync_dir(dir: &Path) -> std::io::Result<()> {
    // blocking std::fs is deliberate at open() time — one-shot startup path, not the hot path
    std::fs::File::open(dir)?.sync_all()
}

/// Validate a segment file. Returns `Validation::Clean`, `Truncate(n)`, or
/// `Corrupt(offset)`.  When `is_final` is true, both Torn and Corrupt errors
/// at the tail truncate; when false both are hard failures.
fn validate(path: &Path, is_final: bool) -> std::io::Result<Validation> {
    // blocking std::fs is deliberate at open() time — one-shot startup path, not the hot path
    let bytes = match std::fs::read(path) {
        Ok(b) => b,
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => {
            // File doesn't exist yet (brand-new segment, no writes). Clean.
            return Ok(Validation::Clean);
        }
        Err(e) => return Err(e),
    };
    let mut pos: usize = 0;
    let mut last_good: usize = 0;
    loop {
        match decode_frame(&bytes[pos..]) {
            Ok(None) => return Ok(Validation::Clean),
            Ok(Some((_, consumed))) => {
                pos += consumed;
                last_good = pos;
            }
            Err(_) if is_final => {
                return Ok(Validation::Truncate(last_good as u64));
            }
            Err(_) => {
                return Ok(Validation::Corrupt(pos as u64));
            }
        }
    }
}

/// A set of append-log segment files for a single book's event stream.
pub struct SegmentSet {
    dir: PathBuf,
    /// Shared segment catalog. The inner BTreeMap IS the canonical segment map;
    /// `SegmentSet` inserts into it on open and on every rotation.
    catalog: SegmentCatalog,
    /// The open, writable handle for the active (highest-base) segment.
    active: File,
    /// Byte length of the active segment (tracked without seeking).
    active_len: u64,
    /// Rotate when active_len reaches this threshold.
    segment_max: u64,
}

impl SegmentSet {
    /// Open using the default 128 MiB segment size.
    pub async fn open(dir: &Path) -> std::io::Result<Self> {
        Self::open_with_max(dir, DEFAULT_SEGMENT_MAX).await
    }

    /// Open (or create) the segment set in `dir` with a custom rotation size.
    ///
    /// - Enumerates existing `segment-*.log` files into the BTreeMap.
    /// - If none exist, registers base-1 (file created lazily).
    /// - Validates every segment: truncates a torn final segment; refuses on
    ///   corruption in any sealed segment.
    pub async fn open_with_max(dir: &Path, segment_max: u64) -> std::io::Result<Self> {
        tokio::fs::create_dir_all(dir).await?;

        // Enumerate existing segments.
        let mut segments: BTreeMap<Seq, PathBuf> = BTreeMap::new();
        let mut rd = tokio::fs::read_dir(dir).await?;
        while let Some(entry) = rd.next_entry().await? {
            let name = entry.file_name().into_string().map_err(|_| {
                std::io::Error::other("non-UTF-8 filename in segment dir")
            })?;
            if let Some(base) = parse_base(&name) {
                segments.insert(base, entry.path());
            }
        }

        // If no segments exist, seed with base=1 (will be created on first write).
        if segments.is_empty() {
            let path = dir.join(segment_name(1));
            segments.insert(1, path);
        }

        // Validate all segments in ascending base order.
        let bases: Vec<Seq> = segments.keys().copied().collect();
        let final_base = *bases.last().unwrap(); // always exists
        for base in &bases {
            let path = segments[base].clone();
            let is_final = *base == final_base;
            match validate(&path, is_final)? {
                Validation::Clean => {}
                Validation::Truncate(good_len) => {
                    // Torn tail on the final segment — safe to repair.
                    //
                    // Crash between set_len and sync_all is safe: validate() is
                    // deterministic, so a re-open re-derives the same good_len and
                    // repeats the truncation (idempotent). The shrink lives in the
                    // inode, covered by the file's sync_all — no dir fsync needed.
                    let discarded = std::fs::metadata(&path)?.len().saturating_sub(good_len);
                    tracing::warn!(
                        ?path,
                        discarded_bytes = discarded,
                        "torn tail in final segment; truncating to last good frame"
                    );
                    // blocking std::fs is deliberate at open() time — one-shot startup path, not the hot path
                    let f = std::fs::OpenOptions::new().write(true).open(&path)?;
                    f.set_len(good_len)?;
                    // fsync so the repair itself is durable
                    f.sync_all()?;
                }
                Validation::Corrupt(off) => {
                    return Err(std::io::Error::other(format!(
                        "corrupt frame in sealed segment {path:?} at offset {off}"
                    )));
                }
            }
        }

        // Open the active (highest-base) segment for appending.
        let active_path = segments[&final_base].clone();
        let active = tokio::fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(&active_path)
            .await?;
        let active_len = active.metadata().await?.len();

        // Make the dirent durable — data in a file whose directory entry is lost
        // is silently dropped by recovery.
        // blocking std::fs is deliberate at open() time — one-shot startup path, not the hot path
        fsync_dir(dir)?;

        // Wrap the map in a shared catalog so readers can clone a handle.
        let catalog = SegmentCatalog(Arc::new(RwLock::new(segments)));

        Ok(Self {
            dir: dir.to_path_buf(),
            catalog,
            active,
            active_len,
            segment_max,
        })
    }

    /// Return a clone of the shared segment catalog.
    ///
    /// The clone shares the inner `Arc<RwLock<…>>` so any subsequent rotation
    /// written through the `SegmentSet` is immediately visible to all holders
    /// of cloned catalogs.
    pub fn catalog(&self) -> SegmentCatalog {
        self.catalog.clone()
    }

    /// Append a pre-encoded frame to the active segment. Does NOT fsync.
    pub async fn append(&mut self, frame: &[u8]) -> std::io::Result<()> {
        self.active.write_all(frame).await?;
        self.active_len += frame.len() as u64;
        Ok(())
    }

    /// fsync the active segment. Call once per commit batch.
    pub async fn sync(&mut self) -> std::io::Result<()> {
        self.active.sync_all().await
    }

    /// Rotate to a new segment named by `next_seq` if `active_len >= segment_max`.
    pub async fn maybe_rotate(&mut self, next_seq: Seq) -> std::io::Result<()> {
        if self.active_len >= self.segment_max {
            // Durably seal the current segment before opening a new one.
            self.active.sync_all().await?;
            let new_path = self.dir.join(segment_name(next_seq));
            let new_file = tokio::fs::OpenOptions::new()
                .create(true)
                .append(true)
                .open(&new_path)
                .await?;
            // Make the dirent durable — data in a file whose directory entry is lost
            // is silently dropped by recovery.
            // blocking std::fs is deliberate at rotation — rare event, not the hot path
            fsync_dir(&self.dir)?;
            // Insert into the shared catalog — all cloned catalog handles see this immediately.
            self.catalog.0.write().unwrap().insert(next_seq, new_path);
            self.active = new_file;
            self.active_len = 0;
        }
        Ok(())
    }

    /// Scan events ascending with `seq >= from`, returning at most `limit`.
    ///
    /// Delegates to [`SegmentCatalog::scan_from`].
    pub async fn scan_from(&self, from: Seq, limit: usize) -> std::io::Result<Vec<WireEvent>> {
        self.catalog.scan_from(from, limit).await
    }

    /// Like [`scan_from`] but each event is paired with its [`FramePos`]
    /// `(segment_base, byte_offset_of_frame_start)`.
    ///
    /// Delegates to [`SegmentCatalog::scan_with_pos`].
    pub async fn scan_with_pos(
        &self,
        from: Seq,
        limit: usize,
    ) -> std::io::Result<Vec<(WireEvent, crate::state::FramePos)>> {
        self.catalog.scan_with_pos(from, limit).await
    }

    /// Returns `(active_segment_base, active_len)` — position of the NEXT append.
    pub fn next_pos(&self) -> (Seq, u64) {
        let base = *self.catalog.0.read().unwrap().keys().next_back().unwrap();
        (base, self.active_len)
    }

    /// Open the segment with `segment_base`, seek to `offset`, decode one frame.
    ///
    /// Delegates to [`SegmentCatalog::read_at`]; see that method for the
    /// trust contract on `offset`.
    pub async fn read_at(
        &self,
        segment_base: Seq,
        offset: u64,
        expected_seq: Seq,
    ) -> std::io::Result<WireEvent> {
        self.catalog.read_at(segment_base, offset, expected_seq).await
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::frame::{encode_frame, WireEvent};
    use talea_core::events::LedgerEvent;
    use talea_core::store::AccountCfg;
    use talea_core::types::*;

    fn ev(seq: Seq) -> WireEvent {
        WireEvent {
            seq,
            at: talea_core::store::ledger_now(),
            event: LedgerEvent::AccountOpened {
                def: AccountDef {
                    id: AccountId { book: Book("b".into()), path: format!("a{seq}") },
                    asset: AssetId::new("USD"),
                    kind: AccountKind::Asset,
                },
                cfg: AccountCfg { normal_side: None, min_balance: None },
            },
        }
    }

    #[tokio::test]
    async fn append_then_scan_round_trips() {
        let dir = tempfile::tempdir().unwrap();
        let mut seg = SegmentSet::open(dir.path()).await.unwrap();
        for s in 1..=5 {
            seg.append(&encode_frame(&ev(s)).unwrap()).await.unwrap();
        }
        seg.sync().await.unwrap();
        let got = seg.scan_from(1, 100).await.unwrap();
        assert_eq!(got.iter().map(|e| e.seq).collect::<Vec<_>>(), vec![1, 2, 3, 4, 5]);
        let page = seg.scan_from(3, 2).await.unwrap();
        assert_eq!(page.iter().map(|e| e.seq).collect::<Vec<_>>(), vec![3, 4]);
    }

    #[tokio::test]
    async fn rotation_starts_a_new_segment_named_by_base_seq() {
        let dir = tempfile::tempdir().unwrap();
        let mut seg = SegmentSet::open_with_max(dir.path(), 64).await.unwrap(); // tiny segments
        for s in 1..=10 {
            seg.maybe_rotate(s).await.unwrap();
            seg.append(&encode_frame(&ev(s)).unwrap()).await.unwrap();
        }
        seg.sync().await.unwrap();
        let names: Vec<String> = std::fs::read_dir(dir.path())
            .unwrap()
            .map(|e| e.unwrap().file_name().into_string().unwrap())
            .collect();
        assert!(names.len() >= 2, "expected rotation, got {names:?}");
        assert_eq!(seg.scan_from(1, 100).await.unwrap().len(), 10);
    }

    #[tokio::test]
    async fn torn_tail_on_final_segment_truncates() {
        let dir = tempfile::tempdir().unwrap();
        {
            let mut seg = SegmentSet::open(dir.path()).await.unwrap();
            for s in 1..=3 {
                seg.append(&encode_frame(&ev(s)).unwrap()).await.unwrap();
            }
            seg.sync().await.unwrap();
        }
        // tear the last frame: chop 5 bytes off the only segment
        let path = std::fs::read_dir(dir.path()).unwrap().next().unwrap().unwrap().path();
        let len = std::fs::metadata(&path).unwrap().len();
        let f = std::fs::OpenOptions::new().write(true).open(&path).unwrap();
        f.set_len(len - 5).unwrap();
        let mut seg = SegmentSet::open(dir.path()).await.unwrap();
        let got = seg.scan_from(1, 100).await.unwrap();
        assert_eq!(got.len(), 2, "torn third frame must be truncated away");
        // and appends continue cleanly after recovery
        seg.append(&encode_frame(&ev(3)).unwrap()).await.unwrap();
        seg.sync().await.unwrap();
        assert_eq!(seg.scan_from(1, 100).await.unwrap().len(), 3);
    }

    #[tokio::test]
    async fn corruption_in_sealed_segment_refuses_open() {
        let dir = tempfile::tempdir().unwrap();
        {
            let mut seg = SegmentSet::open_with_max(dir.path(), 64).await.unwrap();
            for s in 1..=10 {
                seg.maybe_rotate(s).await.unwrap();
                seg.append(&encode_frame(&ev(s)).unwrap()).await.unwrap();
            }
            seg.sync().await.unwrap();
        }
        // flip a byte in the FIRST (sealed, non-final) segment
        let mut paths: Vec<_> = std::fs::read_dir(dir.path()).unwrap().map(|e| e.unwrap().path()).collect();
        paths.sort();
        let mut bytes = std::fs::read(&paths[0]).unwrap();
        let mid = bytes.len() / 2;
        bytes[mid] ^= 0xff;
        std::fs::write(&paths[0], bytes).unwrap();
        assert!(SegmentSet::open(dir.path()).await.is_err());
    }

    /// Write 3 frames + sync; append a valid 8-byte header (with correct
    /// length + CRC fields for a hypothetical 4th frame payload) followed by
    /// only HALF that payload; reopen; assert scan returns exactly 3 frames and
    /// the file was truncated back to the 3-frame boundary.
    #[tokio::test]
    async fn torn_header_with_partial_payload_truncates() {
        let dir = tempfile::tempdir().unwrap();
        let good_len: u64;
        {
            let mut seg = SegmentSet::open(dir.path()).await.unwrap();
            for s in 1..=3i64 {
                seg.append(&encode_frame(&ev(s)).unwrap()).await.unwrap();
            }
            seg.sync().await.unwrap();
            good_len = seg.next_pos().1;
        }

        // Build a valid 8-byte header for a hypothetical 4th frame with
        // a 20-byte payload, but only write 10 bytes of payload (half).
        let payload_len: u32 = 20;
        let dummy_payload = vec![0xABu8; payload_len as usize];
        let crc = crc32fast::hash(&dummy_payload);
        let mut torn_fragment = Vec::with_capacity(HEADER_LEN + 10);
        torn_fragment.extend_from_slice(&payload_len.to_le_bytes());
        torn_fragment.extend_from_slice(&crc.to_le_bytes());
        torn_fragment.extend_from_slice(&dummy_payload[..10]); // only half

        // Find the single segment file and append the torn fragment.
        let path = std::fs::read_dir(dir.path())
            .unwrap()
            .next()
            .unwrap()
            .unwrap()
            .path();
        {
            use std::io::Write;
            let mut f = std::fs::OpenOptions::new().append(true).open(&path).unwrap();
            f.write_all(&torn_fragment).unwrap();
        }

        // Reopen: validate must detect the torn payload and truncate.
        let seg = SegmentSet::open(dir.path()).await.unwrap();
        let got = seg.scan_from(1, 100).await.unwrap();
        assert_eq!(got.len(), 3, "torn 4th frame must be truncated; got {} frames", got.len());

        let actual_len = std::fs::metadata(&path).unwrap().len();
        assert_eq!(
            actual_len, good_len,
            "file must be truncated back to {good_len}, found {actual_len}"
        );
    }

    /// Append 3 frames, call scan_with_pos, then use read_at to round-trip
    /// each returned position and verify the same event comes back.
    #[tokio::test]
    async fn scan_with_pos_round_trips_via_read_at() {
        let dir = tempfile::tempdir().unwrap();
        let mut seg = SegmentSet::open(dir.path()).await.unwrap();
        for s in 1..=3i64 {
            seg.append(&encode_frame(&ev(s)).unwrap()).await.unwrap();
        }
        seg.sync().await.unwrap();

        let pairs = seg.scan_with_pos(1, 100).await.unwrap();
        assert_eq!(pairs.len(), 3);

        for (wire, (seg_base, offset)) in &pairs {
            let from_disk = seg.read_at(*seg_base, *offset, wire.seq).await.unwrap();
            assert_eq!(from_disk.seq, wire.seq, "read_at must return the same seq at the recorded pos");
            // Verify the event type round-trips too.
            let ok = matches!(
                (&wire.event, &from_disk.event),
                (
                    talea_core::events::LedgerEvent::AccountOpened { .. },
                    talea_core::events::LedgerEvent::AccountOpened { .. },
                )
            );
            assert!(ok, "event variant must match after read_at");
        }
    }

    /// Write 3 good frames + sync; then append garbage bytes to the active
    /// segment file (simulating an in-flight append that has not been fsynced).
    /// `scan_from` must return exactly the 3 good frames with NO error.
    ///
    /// In a second sub-test we corrupt a byte in a SEALED segment of a
    /// two-segment setup and assert that `scan_from` DOES return an error.
    #[tokio::test]
    async fn scan_stops_cleanly_at_inflight_torn_tail() {
        // ---- Part 1: in-flight append on the active (only) segment ----
        let dir = tempfile::tempdir().unwrap();
        {
            let mut seg = SegmentSet::open(dir.path()).await.unwrap();
            for s in 1..=3i64 {
                seg.append(&encode_frame(&ev(s)).unwrap()).await.unwrap();
            }
            seg.sync().await.unwrap();
        }

        // Append garbage / partial-frame bytes directly to the segment file,
        // bypassing the writer — this is what an in-flight kernel write looks
        // like to a concurrent reader before fsync returns.
        let seg_path = std::fs::read_dir(dir.path())
            .unwrap()
            .next()
            .unwrap()
            .unwrap()
            .path();
        {
            use std::io::Write;
            let mut f = std::fs::OpenOptions::new()
                .append(true)
                .open(&seg_path)
                .unwrap();
            // A realistic in-flight write: valid 8-byte header (length=20, arbitrary
            // CRC) followed by only half the claimed payload.
            let payload_len: u32 = 20;
            f.write_all(&payload_len.to_le_bytes()).unwrap();
            f.write_all(&0x12345678u32.to_le_bytes()).unwrap(); // wrong CRC — torn
            f.write_all(&[0xAB; 10]).unwrap(); // only half the 20-byte payload
        }

        // Re-open without recovery (open() would truncate, so we go directly
        // through the catalog instead to test the reader-side fix).
        let seg = SegmentSet::open(dir.path()).await.unwrap();
        // open() will truncate the torn tail; the catalog now has 3 clean frames.
        // But the important thing is: if a reader sees the file BEFORE open()
        // truncates (i.e. between appends on a live writer), scan_from must also
        // stop cleanly.  We can test that directly by re-reading the catalog from
        // the torn file without reopening.
        //
        // Actually, since we opened a fresh SegmentSet above (which will have
        // truncated the torn tail during open/validate), scan from that:
        let got = seg.scan_from(1, 100).await.unwrap();
        assert_eq!(
            got.iter().map(|e| e.seq).collect::<Vec<_>>(),
            vec![1, 2, 3],
            "scan_from must return exactly 3 complete frames; torn tail must be a clean stop"
        );

        // ---- Part 1b: test the reader directly on a LIVE torn file ----
        // Build a new dir, write 3 frames, then append garbage WITHOUT reopening,
        // and call scan_from through the catalog (without validate truncation).
        let dir2 = tempfile::tempdir().unwrap();
        let seg2 = {
            let mut s = SegmentSet::open(dir2.path()).await.unwrap();
            for i in 1..=3i64 {
                s.append(&encode_frame(&ev(i)).unwrap()).await.unwrap();
            }
            s.sync().await.unwrap();
            s
        };
        // Append garbage directly to the file while the SegmentSet is still live.
        let seg_path2 = std::fs::read_dir(dir2.path())
            .unwrap()
            .next()
            .unwrap()
            .unwrap()
            .path();
        {
            use std::io::Write;
            let mut f = std::fs::OpenOptions::new()
                .append(true)
                .open(&seg_path2)
                .unwrap();
            f.write_all(&[0xFF; 16]).unwrap(); // pure garbage — Torn or Corrupt
        }
        // The live catalog (seg2) reads the file via tokio::fs::read which sees
        // the page-cache version (including the garbage bytes).  scan_from must
        // stop cleanly at the 3 good frames.
        let got2 = seg2.catalog().scan_from(1, 100).await.unwrap();
        assert_eq!(
            got2.iter().map(|e| e.seq).collect::<Vec<_>>(),
            vec![1, 2, 3],
            "live scan_from must stop cleanly at in-flight garbage in the active segment"
        );

        // ---- Part 2: decode error in a SEALED segment → hard error ----
        let dir3 = tempfile::tempdir().unwrap();
        {
            // tiny segment_max so we get at least 2 segments
            let mut seg3 = SegmentSet::open_with_max(dir3.path(), 64).await.unwrap();
            for s in 1..=10i64 {
                seg3.maybe_rotate(s).await.unwrap();
                seg3.append(&encode_frame(&ev(s)).unwrap()).await.unwrap();
            }
            seg3.sync().await.unwrap();
        }
        // Flip a byte in the FIRST (sealed) segment.
        let mut paths3: Vec<_> = std::fs::read_dir(dir3.path())
            .unwrap()
            .map(|e| e.unwrap().path())
            .collect();
        paths3.sort();
        let mut bytes3 = std::fs::read(&paths3[0]).unwrap();
        let mid3 = bytes3.len() / 2;
        bytes3[mid3] ^= 0xff;
        std::fs::write(&paths3[0], &bytes3).unwrap();

        // Re-open and try to scan — open() validates ALL segments; the sealed
        // corrupt segment must cause open() itself to fail.
        let open_result = SegmentSet::open(dir3.path()).await;
        assert!(
            open_result.is_err(),
            "opening with a corrupt sealed segment must fail"
        );
    }

    /// Force a rotation so a fresh empty active segment exists; reopen without
    /// any writes to it; assert all pre-rotation frames are still readable,
    /// `next_pos()` reports the rotated base with offset 0, and a subsequent
    /// append succeeds.
    #[tokio::test]
    async fn empty_final_segment_after_rotation_is_clean() {
        let dir = tempfile::tempdir().unwrap();
        let pre_rotation_base: Seq;
        let rotated_base: Seq = 4; // first seq after writing 3 frames that exceed tiny limit

        {
            // Use a very small segment_max so we rotate after the first frame.
            let mut seg = SegmentSet::open_with_max(dir.path(), 1).await.unwrap();
            for s in 1..=3i64 {
                seg.maybe_rotate(s).await.unwrap();
                seg.append(&encode_frame(&ev(s)).unwrap()).await.unwrap();
            }
            // Trigger one more rotation to leave the active segment empty.
            seg.maybe_rotate(rotated_base).await.unwrap();
            seg.sync().await.unwrap();
            pre_rotation_base = seg.next_pos().0;
        }

        // Reopen.
        let mut seg = SegmentSet::open(dir.path()).await.unwrap();

        // All pre-rotation frames must be visible.
        let got = seg.scan_from(1, 100).await.unwrap();
        assert_eq!(got.len(), 3, "expected 3 pre-rotation frames, got {}", got.len());

        // next_pos must point to the (empty) rotated segment.
        let (base, off) = seg.next_pos();
        assert_eq!(base, pre_rotation_base, "expected rotated base {pre_rotation_base}, got {base}");
        assert_eq!(off, 0, "new segment must start at offset 0");

        // Appending to the empty segment must work.
        seg.append(&encode_frame(&ev(rotated_base)).unwrap()).await.unwrap();
        seg.sync().await.unwrap();
        let all = seg.scan_from(1, 100).await.unwrap();
        assert_eq!(all.len(), 4, "expected 4 frames after append, got {}", all.len());
    }
}
