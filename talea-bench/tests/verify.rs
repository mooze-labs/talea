mod harness;

use talea_bench::{seed, verify, workload};
use talea_client::{LedgerApi, TaleaClient};

#[tokio::test]
async fn verify_accounts_for_every_commit() {
    let url = harness::spawn_server(256).await;
    let client = TaleaClient::builder(url).build().unwrap();
    seed::seed_books(&client, 1).await.unwrap();
    let book = workload::book_name(0);

    // Exact accounting passes with no warnings.
    let before = verify::probe_seq(&client, &book, "vt", "t1-before")
        .await
        .unwrap();
    for n in 0..5u64 {
        let p = client
            .post(workload::transfer_draft(&book, "vt/posts", 0, n, 2))
            .await
            .unwrap();
        assert!(!p.deduplicated);
    }
    let warnings = verify::verify_books(&client, "vt", "t1", &[(book.clone(), before)], 5, 0)
        .await
        .unwrap();
    assert!(warnings.is_empty());

    // A miscount fails loudly.
    let before = verify::probe_seq(&client, &book, "vt", "t2-before")
        .await
        .unwrap();
    let err = verify::verify_books(&client, "vt", "t2", &[(book.clone(), before)], 7, 0)
        .await
        .unwrap_err();
    assert!(err.contains("SEQ MISMATCH"), "got: {err}");

    // Ambiguous transport outcomes widen the window and warn.
    let before = verify::probe_seq(&client, &book, "vt", "t3-before")
        .await
        .unwrap();
    for n in 0..2u64 {
        client
            .post(workload::transfer_draft(&book, "vt/ambig", 0, n, 2))
            .await
            .unwrap();
    }
    // 2 actual commits, but only 1 was counted; 1 outcome was ambiguous.
    let warnings = verify::verify_books(&client, "vt", "t3", &[(book.clone(), before)], 1, 1)
        .await
        .unwrap();
    assert_eq!(warnings.len(), 1);
}
