//! Pure arg -> draft parsers. No I/O, no clap types: trivially testable.

use chrono::{DateTime, Utc};
use talea_core::api::{PostingDraft, TransactionDraft, WireAmount};
use talea_core::types::Direction;

/// `--debit treasury:btc:USD:1000` — parsed from the RIGHT so account paths
/// may contain ':'. Format: <account>:<asset>:<minor>.
pub fn parse_posting(s: &str, direction: Direction) -> Result<PostingDraft, String> {
    let mut it = s.rsplitn(3, ':');
    let minor = it.next().filter(|p| !p.is_empty()).ok_or("empty posting")?;
    let asset = it
        .next()
        .filter(|p| !p.is_empty())
        .ok_or("missing asset (want <account>:<asset>:<minor>)")?;
    let account = it
        .next()
        .filter(|p| !p.is_empty())
        .ok_or("missing account (want <account>:<asset>:<minor>)")?;
    let minor: i64 = minor.parse().map_err(|e| format!("minor units: {e}"))?;
    Ok(PostingDraft {
        account: account.to_string(),
        amount: WireAmount { minor, asset: asset.to_string() },
        direction,
    })
}

pub fn parse_rfc3339(s: &str) -> Result<DateTime<Utc>, String> {
    DateTime::parse_from_rfc3339(s)
        .map(|t| t.with_timezone(&Utc))
        .map_err(|e| format!("timestamp: {e}"))
}

/// Builds the final draft. `base` comes from --draft (file or stdin); flag
/// values override its fields. Without --draft, --book and --idem are
/// required and postings come from --debit/--credit.
pub fn build_draft(
    base: Option<TransactionDraft>,
    book: Option<String>,
    idem: Option<String>,
    debits: Vec<PostingDraft>,
    credits: Vec<PostingDraft>,
    occurred_at: Option<DateTime<Utc>>,
    metadata: Option<serde_json::Value>,
) -> Result<TransactionDraft, String> {
    let mut draft = base.unwrap_or(TransactionDraft {
        book: String::new(),
        idempotency_key: String::new(),
        postings: vec![],
        external_refs: vec![],
        metadata: serde_json::Value::Null,
        occurred_at: None,
    });
    if let Some(b) = book {
        draft.book = b;
    }
    if let Some(k) = idem {
        draft.idempotency_key = k;
    }
    if !debits.is_empty() || !credits.is_empty() {
        draft.postings = debits.into_iter().chain(credits).collect();
    }
    if let Some(t) = occurred_at {
        draft.occurred_at = Some(t);
    }
    if let Some(m) = metadata {
        draft.metadata = m;
    }
    if draft.book.is_empty() {
        return Err("--book is required (or provide it in --draft)".into());
    }
    if draft.idempotency_key.is_empty() {
        return Err("--idem is required (or provide it in --draft)".into());
    }
    if draft.postings.is_empty() {
        return Err("at least one --debit/--credit is required (or postings in --draft)".into());
    }
    Ok(draft)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn posting_parses_from_the_right() {
        let p = parse_posting("treasury:btc:USD:1000", Direction::Debit).unwrap();
        assert_eq!(p.account, "treasury:btc"); // colon-bearing path survives
        assert_eq!(p.amount.asset, "USD");
        assert_eq!(p.amount.minor, 1000);

        let p = parse_posting("cash:USD:5", Direction::Credit).unwrap();
        assert_eq!(p.account, "cash");
    }

    #[test]
    fn posting_rejects_malformed_input() {
        assert!(parse_posting("USD:1000", Direction::Debit).is_err()); // no account
        assert!(parse_posting("cash:USD:ten", Direction::Debit).is_err()); // bad minor
        assert!(parse_posting("", Direction::Debit).is_err());
        assert!(parse_posting("cash::1000", Direction::Debit).is_err()); // empty asset
    }

    #[test]
    fn rfc3339_round_trips() {
        let t = parse_rfc3339("2026-06-04T12:00:00Z").unwrap();
        assert_eq!(t.to_rfc3339(), "2026-06-04T12:00:00+00:00");
        assert!(parse_rfc3339("yesterday").is_err());
    }

    #[test]
    fn draft_flags_override_base() {
        let base: TransactionDraft = serde_json::from_value(serde_json::json!({
            "book": "from-file",
            "idempotency_key": "file-key",
            "postings": [
                {"account":"a","amount":{"minor":1,"asset":"USD"},"direction":"debit"}
            ]
        }))
        .unwrap();
        let draft = build_draft(
            Some(base),
            Some("cli-book".into()),
            None,
            vec![],
            vec![],
            None,
            None,
        )
        .unwrap();
        assert_eq!(draft.book, "cli-book"); // flag wins
        assert_eq!(draft.idempotency_key, "file-key"); // file value kept
        assert_eq!(draft.postings.len(), 1); // file postings kept
    }

    #[test]
    fn missing_required_fields_error() {
        assert!(build_draft(None, None, Some("k".into()), vec![], vec![], None, None).is_err());
        assert!(build_draft(None, Some("b".into()), None, vec![], vec![], None, None).is_err());
        assert!(build_draft(None, Some("b".into()), Some("k".into()), vec![], vec![], None, None).is_err());
    }
}
