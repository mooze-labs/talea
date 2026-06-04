//! Planner check: trial_balance must hit the postings_book_time index,
//! not scan the postings table.

use sqlx::Row;
use sqlx::sqlite::SqlitePoolOptions;
use talea_store_sqlite::SqliteTaleaStore;

#[tokio::test]
async fn trial_balance_query_uses_book_index() {
    let pool = SqlitePoolOptions::new()
        .max_connections(1)
        .connect("sqlite::memory:")
        .await
        .unwrap();
    let store = SqliteTaleaStore::new(pool.clone());
    store.migrate().await.unwrap();

    // the exact statement trial_balance runs
    let rows = sqlx::query(
        "EXPLAIN QUERY PLAN
         SELECT asset,
                COALESCE(SUM(CASE WHEN direction = 'D' THEN minor ELSE 0 END), 0) AS debits,
                COALESCE(SUM(CASE WHEN direction = 'C' THEN minor ELSE 0 END), 0) AS credits
         FROM postings
         WHERE book = ?1 AND (?2 IS NULL OR committed_at <= ?2)
         GROUP BY asset ORDER BY asset",
    )
    .bind("somebook")
    .bind(Option::<chrono::DateTime<chrono::Utc>>::None)
    .fetch_all(&pool)
    .await
    .unwrap();

    let plan: String = rows
        .iter()
        .map(|r| r.get::<String, _>("detail"))
        .collect::<Vec<_>>()
        .join("\n");
    assert!(
        plan.contains("postings_book_time"),
        "trial_balance does not use the book index; plan:\n{plan}"
    );
}
