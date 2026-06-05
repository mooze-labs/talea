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

use talea_core::types::Seq;
use tokio::fs::File;
use tokio::io::{AsyncReadExt, AsyncSeekExt, AsyncWriteExt};

use crate::frame::{WireEvent, decode_frame, HEADER_LEN};

pub const DEFAULT_SEGMENT_MAX: u64 = 128 * 1024 * 1024;

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
    /// Maps base_seq → path for every known segment (including the active one).
    segments: BTreeMap<Seq, PathBuf>,
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

        Ok(Self {
            dir: dir.to_path_buf(),
            segments,
            active,
            active_len,
            segment_max,
        })
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
            self.segments.insert(next_seq, new_path);
            self.active = new_file;
            self.active_len = 0;
        }
        Ok(())
    }

    /// Scan events ascending with `seq >= from`, returning at most `limit`.
    ///
    /// Starts at the last segment whose base ≤ `from` (falls back to the first
    /// segment). Reads each file fully, decodes sequentially, stops at `limit`.
    pub async fn scan_from(&self, from: Seq, limit: usize) -> std::io::Result<Vec<WireEvent>> {
        if limit == 0 {
            return Ok(vec![]);
        }

        // Pick the starting segment: last base <= from, else first.
        let start_base = self
            .segments
            .range(..=from)
            .next_back()
            .map(|(k, _)| *k)
            .unwrap_or_else(|| *self.segments.keys().next().unwrap());

        let mut results = Vec::new();
        for (_, path) in self.segments.range(start_base..) {
            if results.len() >= limit {
                break;
            }
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

    /// Returns `(active_segment_base, active_len)` — position of the NEXT append.
    pub fn next_pos(&self) -> (Seq, u64) {
        let base = *self.segments.keys().next_back().unwrap();
        (base, self.active_len)
    }

    /// Open the segment with `segment_base`, seek to `offset`, decode one frame.
    ///
    /// # Trust contract
    ///
    /// `offset` MUST come from the in-process index built at append/replay time.
    /// It must NEVER be taken from external input.  This function verifies that
    /// the decoded frame carries `expected_seq` as an additional guard against
    /// stale positions or accidental wrong-segment reads, but the primary
    /// correctness guarantee is that callers supply only index-derived offsets.
    pub async fn read_at(
        &self,
        segment_base: Seq,
        offset: u64,
        expected_seq: Seq,
    ) -> std::io::Result<WireEvent> {
        let path = self.segments.get(&segment_base).ok_or_else(|| {
            std::io::Error::other(format!("unknown segment base {segment_base}"))
        })?;
        let mut file = File::open(path).await?;

        // Bound the allocation: refuse to allocate based on an unvalidated header.
        let file_len = file.metadata().await?.len();

        file.seek(SeekFrom::Start(offset)).await?;
        // Read the 8-byte header first.
        let mut header = [0u8; HEADER_LEN];
        file.read_exact(&mut header).await?;
        let payload_len = u32::from_le_bytes(header[0..4].try_into().unwrap()) as usize;

        // Validate that the claimed frame fits within the file before allocating.
        let frame_end = offset
            .checked_add((HEADER_LEN + payload_len) as u64)
            .ok_or_else(|| std::io::Error::other("frame length arithmetic overflow"))?;
        if frame_end > file_len {
            return Err(std::io::Error::other(format!(
                "frame header at {offset} claims {payload_len} bytes past end of segment"
            )));
        }

        // Read the full frame (header + payload).
        let mut frame = vec![0u8; HEADER_LEN + payload_len];
        frame[..HEADER_LEN].copy_from_slice(&header);
        file.read_exact(&mut frame[HEADER_LEN..]).await?;
        let ev = match decode_frame(&frame) {
            Ok(Some((ev, _))) => ev,
            Ok(None) => return Err(std::io::Error::other("empty frame at read_at")),
            Err(e) => return Err(std::io::Error::other(format!("decode error at offset {offset}: {e}"))),
        };

        // Verify the decoded sequence number matches what the caller expected.
        if ev.seq != expected_seq {
            return Err(std::io::Error::other(format!(
                "frame at {segment_base}/{offset} has seq {got}, expected {expected_seq} — stale or wrong position",
                got = ev.seq,
            )));
        }

        Ok(ev)
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
