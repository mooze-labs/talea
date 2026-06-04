//! Post-scenario ledger consistency checks. A benchmark that silently
//! corrupted the ledger is worse than no benchmark: every write
//! scenario must end here.

use talea_client::LedgerApi;
use talea_core::api::{PostingDraft, TransactionDraft, WireAmount};
use talea_core::types::{Direction, Seq};

use crate::workload::{ASSET, CASH, EQUITY};

/// Commit a 1-minor probe transfer and return the book's new top seq.
/// The key embeds run_id + book + label, so probes are unique per run
/// and never collide with workload keys (distinct scope shape).
pub async fn probe_seq(
    api: &dyn LedgerApi,
    book: &str,
    run_id: &str,
    label: &str,
) -> Result<Seq, String> {
    let draft = TransactionDraft {
        book: book.into(),
        idempotency_key: format!("bench/{run_id}/probe/{book}/{label}"),
        postings: vec![
            PostingDraft {
                account: CASH.into(),
                amount: WireAmount { minor: 1, asset: ASSET.into() },
                direction: Direction::Debit,
            },
            PostingDraft {
                account: EQUITY.into(),
                amount: WireAmount { minor: 1, asset: ASSET.into() },
                direction: Direction::Credit,
            },
        ],
        external_refs: vec![],
        metadata: serde_json::Value::Null,
        occurred_at: None,
    };
    api.post(draft)
        .await
        .map(|p| p.seq)
        .map_err(|e| format!("probe post on {book} failed: {e:?}"))
}

/// 1. Trial balance must balance per asset in every touched book.
/// 2. Seq accounting: total new events across books (after-probe minus
///    before-probe) must equal counted commits + one after-probe per
///    book, within a tolerance of `ambiguous` (transport failures that
///    may have committed server-side). Below the window or above it:
///    hard error. Inside the ambiguous window: warning.
/// 3. `label` must be unique per (run_id, book) across calls: the after-probe
///    key embeds it, and a reused label dedups to the OLD seq, poisoning the count.
pub async fn verify_books(
    api: &dyn LedgerApi,
    run_id: &str,
    label: &str,
    probes_before: &[(String, Seq)],
    committed: u64,
    ambiguous: u64,
) -> Result<Vec<String>, String> {
    let mut warnings = Vec::new();

    for (book, _) in probes_before {
        let tb = api
            .trial_balance(book, None)
            .await
            .map_err(|e| format!("trial_balance({book}): {e:?}"))?;
        for line in &tb.lines {
            if line.debits != line.credits {
                return Err(format!(
                    "UNBALANCED: book {book} asset {} has debits {} != credits {}",
                    line.asset, line.debits, line.credits
                ));
            }
        }
    }

    let mut observed: i64 = 0;
    for (book, before) in probes_before {
        let after = probe_seq(api, book, run_id, &format!("{label}-after")).await?;
        observed += after - before;
    }
    let expected_min = committed as i64 + probes_before.len() as i64;
    let expected_max = expected_min + ambiguous as i64;
    if observed < expected_min || observed > expected_max {
        return Err(format!(
            "SEQ MISMATCH: observed {observed} new events across {} book(s), expected \
             {expected_min}..={expected_max} (committed={committed}, after-probes={}, \
             ambiguous={ambiguous})",
            probes_before.len(),
            probes_before.len()
        ));
    }
    if observed > expected_min {
        warnings.push(format!(
            "{} ambiguous transport outcome(s) actually committed server-side \
             (observed {observed} > counted {expected_min}); within tolerance",
            observed - expected_min
        ));
    }
    Ok(warnings)
}
