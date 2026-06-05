//! Planner check for the live database. On a near-empty table Postgres
//! prefers a seq scan, so the test disables seqscan for its session: the
//! assertion is "the index exists and is usable", not "always chosen".

use sqlx::Row;
use sqlx::postgres::PgPoolOptions;
use talea_store_postgres::PgTaleaStore;

#[tokio::test]
async fn trial_balance_query_can_use_book_index() {
    let Ok(url) = std::env::var("TALEA_TEST_PG_URL") else {
        eprintln!("TALEA_TEST_PG_URL not set; skipping postgres explain test");
        return;
    };
    let pool = PgPoolOptions::new()
        .max_connections(1)
        .connect(&url)
        .await
        .expect("failed to connect to TALEA_TEST_PG_URL");
    let store = PgTaleaStore::new(pool.clone());
    store.migrate().await.expect("migration failed");

    let mut conn = pool.acquire().await.unwrap();
    sqlx::query("SET enable_seqscan = off")
        .execute(&mut *conn)
        .await
        .unwrap();
    let rows = sqlx::query(
        "EXPLAIN
         SELECT asset,
                COALESCE(SUM(CASE WHEN direction = 'D' THEN minor ELSE 0 END), 0)::BIGINT AS debits,
                COALESCE(SUM(CASE WHEN direction = 'C' THEN minor ELSE 0 END), 0)::BIGINT AS credits
         FROM postings
         WHERE book = 'somebook' AND (NULL::TIMESTAMPTZ IS NULL OR committed_at <= NULL::TIMESTAMPTZ)
         GROUP BY asset ORDER BY asset",
    )
    .fetch_all(&mut *conn)
    .await
    .unwrap();

    let plan: String = rows
        .iter()
        .map(|r| r.get::<String, _>(0))
        .collect::<Vec<_>>()
        .join("\n");
    assert!(
        plan.contains("postings_book_time"),
        "trial_balance cannot use the book index; plan:\n{plan}"
    );
}
