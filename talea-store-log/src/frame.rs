//! Wire format: u32-LE payload_len | u32-LE crc32(payload) | JSON payload.
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use talea_core::events::LedgerEvent;
use talea_core::types::Seq;

/// Local serde-able mirror of `Sequenced<LedgerEvent>` (core doesn't derive serde).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WireEvent {
    pub seq: Seq,
    pub at: DateTime<Utc>,
    pub event: LedgerEvent,
}

pub const HEADER_LEN: usize = 8;

#[derive(Debug, thiserror::Error)]
pub enum FrameError {
    /// Incomplete frame at end of data: a torn write.
    ///
    /// **Recovery contract:** truncation on `Torn` is safe ONLY at the tail of
    /// the log. A caller that sees `Torn` anywhere other than the final bytes of
    /// the final segment MUST escalate it as corruption, not truncate.
    #[error("torn frame at end of data")]
    Torn,
    /// Full-length frame whose payload fails CRC or JSON: corruption.
    #[error("corrupt frame: {reason}")]
    Corrupt { reason: String },
}

#[derive(Debug, thiserror::Error)]
pub enum EncodeError {
    #[error("event payload serialization: {0}")]
    Json(#[from] serde_json::Error),
    #[error("event payload of {len} bytes exceeds the u32 frame length limit")]
    TooLarge { len: usize },
}

/// Encode a [`WireEvent`] into a framed byte buffer.
///
/// Returns `Err(EncodeError::TooLarge)` if the serialized payload exceeds 4 GiB
/// (the u32 frame-length field limit), preventing silent truncation.
pub fn encode_frame(ev: &WireEvent) -> Result<Vec<u8>, EncodeError> {
    let payload = serde_json::to_vec(ev)?;
    let len_u32 =
        u32::try_from(payload.len()).map_err(|_| EncodeError::TooLarge { len: payload.len() })?;
    let mut buf = Vec::with_capacity(HEADER_LEN + payload.len());
    buf.extend_from_slice(&len_u32.to_le_bytes());
    buf.extend_from_slice(&crc32fast::hash(&payload).to_le_bytes());
    buf.extend_from_slice(&payload);
    Ok(buf)
}

/// Decode one frame from the front of `buf`.
///
/// - `Ok(None)` — clean end of data (empty buffer).
/// - `Ok(Some((event, bytes_consumed)))` — one successfully decoded frame.
/// - `Err(FrameError::Torn)` — header or payload bytes missing; see recovery
///   contract on [`FrameError::Torn`].
/// - `Err(FrameError::Corrupt)` — full-length frame with bad CRC or JSON.
pub fn decode_frame(buf: &[u8]) -> Result<Option<(WireEvent, usize)>, FrameError> {
    if buf.is_empty() {
        return Ok(None);
    }
    // Take the two u32 header fields as fixed-size chunks; fewer than
    // HEADER_LEN bytes means a torn header.
    let Some((len_bytes, rest)) = buf.split_first_chunk::<4>() else {
        return Err(FrameError::Torn);
    };
    let Some((crc_bytes, _)) = rest.split_first_chunk::<4>() else {
        return Err(FrameError::Torn);
    };
    let len = u32::from_le_bytes(*len_bytes) as usize;
    let crc = u32::from_le_bytes(*crc_bytes);
    let Some(payload) = buf.get(HEADER_LEN..HEADER_LEN + len) else {
        return Err(FrameError::Torn);
    };
    if crc32fast::hash(payload) != crc {
        return Err(FrameError::Corrupt {
            reason: "crc mismatch".into(),
        });
    }
    let ev = serde_json::from_slice(payload).map_err(|e| FrameError::Corrupt {
        reason: format!("json: {e}"),
    })?;
    Ok(Some((ev, HEADER_LEN + len)))
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;
    use talea_core::events::LedgerEvent;
    use talea_core::types::*;

    fn tx_event() -> WireEvent {
        WireEvent {
            seq: 7,
            at: talea_core::store::ledger_now(),
            event: LedgerEvent::TransactionPosted(Transaction {
                id: TxId(uuid::Uuid::now_v7()),
                book: Book("b".into()),
                postings: vec![],
                idempotency_key: IdempotencyKey("k".into()),
                external_refs: vec![],
                metadata: serde_json::json!({"note": "meta survives json"}),
                occurred_at: Utc::now(),
            }),
        }
    }

    #[test]
    fn frame_round_trips() {
        let ev = tx_event();
        let buf = encode_frame(&ev).unwrap();
        let (back, consumed) = decode_frame(&buf).unwrap().unwrap();
        assert_eq!(consumed, buf.len());
        assert_eq!(back.seq, 7);
        assert!(matches!(back.event, LedgerEvent::TransactionPosted(_)));
    }

    #[test]
    fn short_buffer_is_torn_not_corrupt() {
        let buf = encode_frame(&tx_event()).unwrap();
        // Note: empty buffer (cut=0) is Ok(None) — clean end, not Torn.
        // Only partial-header and partial-payload cuts are Torn.
        for cut in [3, 8, buf.len() - 1] {
            match decode_frame(&buf[..cut]) {
                Err(FrameError::Torn) => {}
                other => panic!("cut at {cut}: expected Torn, got {other:?}"),
            }
        }
    }

    #[test]
    fn bit_flip_with_full_length_is_corrupt() {
        let mut buf = encode_frame(&tx_event()).unwrap();
        let last = buf.len() - 1;
        buf[last] ^= 0xff; // payload damaged but full length present
        assert!(matches!(
            decode_frame(&buf),
            Err(FrameError::Corrupt { .. })
        ));
    }

    #[test]
    fn empty_buffer_is_clean_end() {
        assert!(decode_frame(&[]).unwrap().is_none());
    }

    #[test]
    fn chained_frames_decode_sequentially() {
        let ev1 = tx_event();
        let mut ev2 = tx_event();
        ev2.seq = 8;

        let mut buf = encode_frame(&ev1).unwrap();
        let frame2 = encode_frame(&ev2).unwrap();
        buf.extend_from_slice(&frame2);

        let (back1, consumed1) = decode_frame(&buf).unwrap().unwrap();
        let (back2, consumed2) = decode_frame(&buf[consumed1..]).unwrap().unwrap();

        assert_eq!(back1.seq, 7);
        assert_eq!(back2.seq, 8);
        assert_eq!(consumed1 + consumed2, buf.len());
    }

    #[test]
    fn adversarial_large_len_header_returns_torn_not_panic() {
        // Craft a header claiming len = u32::MAX followed by a handful of bytes.
        let mut buf = Vec::new();
        buf.extend_from_slice(&u32::MAX.to_le_bytes()); // len field
        buf.extend_from_slice(&0u32.to_le_bytes()); // crc field (arbitrary)
        buf.extend_from_slice(b"tiny"); // far fewer bytes than claimed

        match decode_frame(&buf) {
            Err(FrameError::Torn) => {}
            other => panic!("expected Torn for adversarial len header, got {other:?}"),
        }
    }
}
