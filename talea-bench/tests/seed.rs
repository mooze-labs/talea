mod harness;

use talea_bench::{seed, workload};
use talea_client::{LedgerApi, TaleaClient};

#[tokio::test]
async fn seed_is_idempotent_and_accounts_accept_postings() {
    let url = harness::spawn_server(256).await;
    let client = TaleaClient::builder(url).build().unwrap();

    seed::seed_books(&client, 3).await.unwrap();
    seed::seed_books(&client, 3).await.unwrap(); // re-run must not error
    seed::seed_read_book(&client).await.unwrap();
    seed::seed_read_book(&client).await.unwrap();

    let p = client
        .post(workload::transfer_draft("bench-2", "seed-test", 0, 0, 2))
        .await
        .unwrap();
    assert!(!p.deduplicated);
    let b = client
        .balance("bench-2", workload::CASH, None)
        .await
        .unwrap();
    assert_eq!(b.balance, "1.00"); // 100 minor at precision 2

    let p = client
        .post(workload::transfer_draft(
            seed::READ_BOOK,
            "seed-test-read",
            0,
            0,
            2,
        ))
        .await
        .unwrap();
    assert!(!p.deduplicated);
}
