//! Set-based batch commit fast path: one transaction, no savepoints,
//! round trips per BATCH instead of per draft. Any surprise aborts the
//! whole attempt (rollback frees the claimed seq range atomically) and
//! the caller reruns the batch through the per-draft savepoint path —
//! the semantic reference. A bail is intentionally unobservable here:
//! the fallback re-runs the batch and surfaces the underlying error with
//! full context; the talea_commit_batch_path_total counter carries the
//! fast/fallback rate.

use std::collections::{HashMap, HashSet};

use chrono::{DateTime, Utc};
use sqlx::{PgPool, Row};
use talea_core::events::LedgerEvent;
use talea_core::store::{Committed, StoreError};
use talea_core::types::{Transaction, TxId};
use uuid::Uuid;

use crate::{AccountRow, effective, fold_postings, load_accounts, notify};

struct FastDraft<'a> {
    input_idx: usize,
    tx: &'a Transaction,
}

/// One account's accumulated contribution across the write set, built in a
/// single pass over the drafts. The draft index is the position in `writes`
/// (0-based); drafts get seqs `first..=last` in that order, so the seq for a
/// draft index is `first + idx`.
struct AcctAgg {
    /// Sum of all per-draft deltas touching this account.
    total_delta: i64,
    /// Per-draft (write-index, delta) in draft order — the prefix-check
    /// replays these to validate sequential min_balance semantics.
    steps: Vec<(usize, i64)>,
    /// The highest write-index that touched this account: its seq is the
    /// account's last-touching seq (updated_seq).
    last_touch_idx: usize,
}

/// Try the set-based path. `None` means "not eligible / aborted — run the
/// per-draft fallback"; the transaction rolls back on drop, so an abort
/// leaves no trace (including the seq range claim).
pub(crate) async fn try_commit_batch_fast(
    pool: &PgPool,
    txs: &[Transaction],
) -> Option<Vec<Result<Committed, StoreError>>> {
    // Eligibility: single non-reserved book (the write router only builds
    // single-book batches; anything else takes the fallback).
    let book = &txs[0].book;
    if book.is_reserved() || txs.iter().any(|t| t.book != *book) {
        return None;
    }

    let mut db = pool.begin().await.ok()?;

    // 1. Idempotency pre-check: one query for every key in the batch.
    let keys: Vec<String> = txs.iter().map(|t| t.idempotency_key.0.clone()).collect();
    let prior_rows = sqlx::query(
        "SELECT idempotency_key, tx_id, seq, committed_at FROM transactions
         WHERE book = $1 AND idempotency_key = ANY($2)",
    )
    .bind(&book.0)
    .bind(&keys)
    .fetch_all(&mut *db)
    .await
    .ok()?;
    let mut by_key: HashMap<String, Committed> = prior_rows
        .into_iter()
        .map(|r| {
            (
                r.get::<String, _>("idempotency_key"),
                Committed {
                    txid: TxId(r.get::<Uuid, _>("tx_id")),
                    seq: r.get("seq"),
                    at: r.get("committed_at"),
                },
            )
        })
        .collect();

    // 2. Account load: one query for all distinct keys across the batch.
    let mut acct_keys: Vec<String> = txs
        .iter()
        .flat_map(|t| t.postings.iter().map(|p| p.account.to_key()))
        .collect();
    acct_keys.sort();
    acct_keys.dedup();
    let accounts: HashMap<String, AccountRow> = load_accounts(&mut db, &acct_keys).await.ok()?;

    // 3. Build the write set in a single pass. In-batch duplicates resolve to
    //    the first occurrence; per-draft validation failures abort to the
    //    fallback. The same pass accumulates the per-account aggregate
    //    (delta, ordered steps, last-touching draft index) so later stages
    //    never re-walk writes×pendings or recompute `to_key()`.
    let mut writes: Vec<FastDraft<'_>> = Vec::with_capacity(txs.len());
    let mut dedup_slots: Vec<(usize, String)> = Vec::new();
    let mut seen_in_batch: HashSet<&str> = HashSet::new();
    let mut agg: HashMap<String, AcctAgg> = HashMap::new();
    for (i, tx) in txs.iter().enumerate() {
        let key = tx.idempotency_key.0.as_str();
        if by_key.contains_key(key) || seen_in_batch.contains(key) {
            dedup_slots.push((i, key.to_string()));
            continue;
        }
        let pendings = match fold_postings(tx, &accounts) {
            Ok(p) => p,
            Err(_) => return None, // unknown account / asset mismatch / overflow
        };
        let draft_idx = writes.len();
        for p in &pendings {
            // `to_key()` computed ONCE per pending here, then reused.
            let entry = agg.entry(p.account.to_key()).or_insert(AcctAgg {
                total_delta: 0,
                steps: Vec::new(),
                last_touch_idx: draft_idx,
            });
            entry.total_delta += p.delta;
            entry.steps.push((draft_idx, p.delta));
            entry.last_touch_idx = draft_idx; // drafts visited in order
        }
        seen_in_batch.insert(key);
        writes.push(FastDraft { input_idx: i, tx });
    }

    let mut results: Vec<Option<Result<Committed, StoreError>>> =
        (0..txs.len()).map(|_| None).collect();

    if writes.is_empty() {
        // All drafts deduped: the pre-check already read everything durable,
        // so there is nothing to commit. Drop the read-only transaction
        // (rollback on drop) rather than paying an empty COMMIT round trip.
        drop(db);
    } else {
        write_set(
            &mut db,
            book,
            &writes,
            &accounts,
            &agg,
            &mut by_key,
            &mut results,
        )
        .await?;
        // A failed COMMIT lands here too: nothing became durable, so the whole
        // batch re-runs via the fallback — safe, at one wasted round trip group.
        db.commit().await.ok()?;
    }

    for (i, key) in &dedup_slots {
        results[*i] = Some(Ok(by_key[key].clone()));
    }
    Some(
        results
            .into_iter()
            .map(|r| r.expect("every input slot resolved"))
            .collect(),
    )
}

/// Apply the whole non-dedup write set inside the open transaction. Returns
/// `None` (propagated as the fast-path abort) on any SQL error or a
/// min_balance prefix violation, leaving the transaction to roll back.
async fn write_set(
    db: &mut crate::DbTx<'_, sqlx::Postgres>,
    book: &talea_core::types::Book,
    writes: &[FastDraft<'_>],
    accounts: &HashMap<String, AccountRow>,
    agg: &HashMap<String, AcctAgg>,
    by_key: &mut HashMap<String, Committed>,
    results: &mut [Option<Result<Committed, StoreError>>],
) -> Option<()> {
    let n = writes.len() as i64;

    // 4. Seq range claim — same counter row + lock as next_seq, once.
    let row = sqlx::query(
        "INSERT INTO books (book, next_seq) VALUES ($1, $2)
         ON CONFLICT (book) DO UPDATE SET next_seq = books.next_seq + $2
         RETURNING next_seq, clock_timestamp() AS at",
    )
    .bind(&book.0)
    .bind(n)
    .fetch_one(&mut **db)
    .await
    .ok()?;
    let last: i64 = row.get("next_seq");
    let at: DateTime<Utc> = row.get("at");
    let first = last - n + 1;
    // A draft at write-index `idx` gets seq `first + idx`.
    let seq_of = |idx: usize| first + idx as i64;

    // 5. Balances: one UNNEST upsert from the pre-built aggregate. Each row
    //    carries its own updated_seq — the seq of the LAST draft that touched
    //    the account — so a non-final draft's account records its own seq, not
    //    the batch max (matches write_transaction's per-draft binding).
    // MIRROR: keep column shape in sync with write_transaction's balances upsert (lib.rs).
    let mut b_keys: Vec<String> = agg.keys().cloned().collect();
    b_keys.sort(); // deterministic lock order, mirrors write_transaction
    let b_assets: Vec<String> = b_keys
        .iter()
        .map(|k| accounts[k].asset.as_str().to_string())
        .collect();
    let b_deltas: Vec<i64> = b_keys.iter().map(|k| agg[k].total_delta).collect();
    let b_updated: Vec<i64> = b_keys
        .iter()
        .map(|k| seq_of(agg[k].last_touch_idx))
        .collect();
    let rows = sqlx::query(
        "INSERT INTO balances (account_key, asset, balance, updated_seq)
         SELECT t.account_key, t.asset, t.delta, t.updated_seq
         FROM UNNEST($1::text[], $2::text[], $3::int8[], $4::int8[])
              AS t(account_key, asset, delta, updated_seq)
         ON CONFLICT (account_key) DO UPDATE
             SET balance = balances.balance + EXCLUDED.balance,
                 updated_seq = EXCLUDED.updated_seq
         RETURNING account_key, balance",
    )
    .bind(&b_keys)
    .bind(&b_assets)
    .bind(&b_deltas)
    .bind(&b_updated)
    .fetch_all(&mut **db)
    .await
    .ok()?;
    let finals: HashMap<String, i64> = rows
        .into_iter()
        .map(|r| (r.get("account_key"), r.get("balance")))
        .collect();

    // 6. min_balance prefix check: sequential semantics need the RUNNING
    //    balance after each draft, not just the final value. Replay the
    //    account's ordered steps (already in draft order) against its
    //    pre-batch balance.
    for key in &b_keys {
        let acct = &accounts[key];
        let Some(min) = acct.min_balance else {
            continue;
        };
        let entry = &agg[key];
        let mut running = finals[key] - entry.total_delta; // pre-batch balance
        for (_idx, delta) in &entry.steps {
            running += delta;
            if effective(running, &acct.normal_side) < min {
                return None; // fallback attributes the violation
            }
        }
    }

    // 7. Row writes: three UNNEST inserts for the whole batch.
    //    transactions first — a unique violation (cross-instance idempotency
    //    race) lands here and aborts to the fallback.
    // MIRROR: keep column shape in sync with write_transaction's transaction insert (lib.rs).
    let t_seqs: Vec<i64> = (first..=last).collect();
    let t_ids: Vec<Uuid> = writes.iter().map(|w| w.tx.id.0).collect();
    let t_keys: Vec<String> = writes
        .iter()
        .map(|w| w.tx.idempotency_key.0.clone())
        .collect();
    let t_occurred: Vec<DateTime<Utc>> = writes.iter().map(|w| w.tx.occurred_at).collect();
    let t_meta: Vec<serde_json::Value> = writes.iter().map(|w| w.tx.metadata.clone()).collect();
    let t_refs: Vec<serde_json::Value> = writes
        .iter()
        .map(|w| serde_json::to_value(&w.tx.external_refs))
        .collect::<Result<_, _>>()
        .ok()?;
    sqlx::query(
        "INSERT INTO transactions
             (tx_id, book, seq, idempotency_key, occurred_at, committed_at, metadata, external_refs)
         SELECT t.tx_id, $1, t.seq, t.key, t.occurred_at, $2, t.metadata, t.refs
         FROM UNNEST($3::uuid[], $4::int8[], $5::text[], $6::timestamptz[],
                     $7::jsonb[], $8::jsonb[])
              AS t(tx_id, seq, key, occurred_at, metadata, refs)",
    )
    .bind(&book.0)
    .bind(at)
    .bind(&t_ids)
    .bind(&t_seqs)
    .bind(&t_keys)
    .bind(&t_occurred)
    .bind(&t_meta)
    .bind(&t_refs)
    .execute(&mut **db)
    .await
    .ok()?;

    // postings: flatten with per-draft seq.
    // MIRROR: keep column shape in sync with write_transaction's postings insert (lib.rs).
    let mut p_tx: Vec<Uuid> = Vec::new();
    let mut p_idx: Vec<i32> = Vec::new();
    let mut p_key: Vec<String> = Vec::new();
    let mut p_asset: Vec<String> = Vec::new();
    let mut p_minor: Vec<i64> = Vec::new();
    let mut p_dir: Vec<String> = Vec::new();
    let mut p_seq: Vec<i64> = Vec::new();
    for (w, seq) in writes.iter().zip(first..=last) {
        for (j, p) in w.tx.postings.iter().enumerate() {
            p_tx.push(w.tx.id.0);
            p_idx.push(j as i32);
            p_key.push(p.account.to_key());
            p_asset.push(p.amount.asset().as_str().to_string());
            p_minor.push(p.amount.minor());
            p_dir.push(p.direction.as_str().to_string());
            p_seq.push(seq);
        }
    }
    sqlx::query(
        "INSERT INTO postings
             (tx_id, idx, account_key, asset, minor, direction, book, seq, committed_at)
         SELECT t.tx_id, t.idx, t.account_key, t.asset, t.minor, t.direction, $1, t.seq, $2
         FROM UNNEST($3::uuid[], $4::int4[], $5::text[], $6::text[], $7::int8[],
                     $8::text[], $9::int8[])
              AS t(tx_id, idx, account_key, asset, minor, direction, seq)",
    )
    .bind(&book.0)
    .bind(at)
    .bind(&p_tx)
    .bind(&p_idx)
    .bind(&p_key)
    .bind(&p_asset)
    .bind(&p_minor)
    .bind(&p_dir)
    .bind(&p_seq)
    .execute(&mut **db)
    .await
    .ok()?;

    // events: one row per draft; same kind; payload = full transaction.
    // Build the events once (the per-payload Transaction clone is
    // unavoidable — LedgerEvent owns its Transaction) and read `kind()` from
    // the first by reference, avoiding a second clone just to name the kind.
    // MIRROR: keep column shape in sync with insert_event (lib.rs).
    let events: Vec<LedgerEvent> = writes
        .iter()
        .map(|w| LedgerEvent::TransactionPosted(w.tx.clone()))
        .collect();
    let kind = events[0].kind();
    let e_payloads: Vec<serde_json::Value> = events
        .iter()
        .map(serde_json::to_value)
        .collect::<Result<_, _>>()
        .ok()?;
    sqlx::query(
        "INSERT INTO events (book, seq, at, kind, payload)
         SELECT $1, t.seq, $2, $3, t.payload
         FROM UNNEST($4::int8[], $5::jsonb[]) AS t(seq, payload)",
    )
    .bind(&book.0)
    .bind(at)
    .bind(kind)
    .bind(&t_seqs)
    .bind(&e_payloads)
    .execute(&mut **db)
    .await
    .ok()?;

    // 8. One notify for the batch (max seq; payload is informational —
    //    subscribers read rows from events).
    notify(db, book, last).await.ok()?;

    for (w, seq) in writes.iter().zip(first..=last) {
        let committed = Committed {
            txid: w.tx.id.clone(),
            seq,
            at,
        };
        by_key.insert(w.tx.idempotency_key.0.clone(), committed.clone());
        results[w.input_idx] = Some(Ok(committed));
    }
    Some(())
}
