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
    /// Incomplete frame at end of data: a torn write. Recovery truncates here.
    #[error("torn frame at end of data")]
    Torn,
    /// Full-length frame whose payload fails CRC or JSON: corruption.
    #[error("corrupt frame: {reason}")]
    Corrupt { reason: String },
}

pub fn encode_frame(ev: &WireEvent) -> Result<Vec<u8>, serde_json::Error> {
    let payload = serde_json::to_vec(ev)?;
    let mut buf = Vec::with_capacity(HEADER_LEN + payload.len());
    buf.extend_from_slice(&(payload.len() as u32).to_le_bytes());
    buf.extend_from_slice(&crc32fast::hash(&payload).to_le_bytes());
    buf.extend_from_slice(&payload);
    Ok(buf)
}

/// Ok(None) = clean end. Ok(Some((event, bytes_consumed))) = one frame.
pub fn decode_frame(buf: &[u8]) -> Result<Option<(WireEvent, usize)>, FrameError> {
    if buf.is_empty() {
        return Ok(None);
    }
    if buf.len() < HEADER_LEN {
        return Err(FrameError::Torn);
    }
    let len = u32::from_le_bytes(buf[0..4].try_into().unwrap()) as usize;
    let crc = u32::from_le_bytes(buf[4..8].try_into().unwrap());
    let Some(payload) = buf.get(HEADER_LEN..HEADER_LEN + len) else {
        return Err(FrameError::Torn);
    };
    if crc32fast::hash(payload) != crc {
        return Err(FrameError::Corrupt { reason: "crc mismatch".into() });
    }
    let ev = serde_json::from_slice(payload)
        .map_err(|e| FrameError::Corrupt { reason: format!("json: {e}") })?;
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
        assert!(matches!(decode_frame(&buf), Err(FrameError::Corrupt { .. })));
    }

    #[test]
    fn empty_buffer_is_clean_end() {
        assert!(decode_frame(&[]).unwrap().is_none());
    }
}
