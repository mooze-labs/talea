use talead::init::{InitOpts, run_init};

/// Gated like the store conformance suite:
/// TALEA_TEST_PG_URL=postgres://localhost/talea_test cargo test -p talead --test init_postgres
#[tokio::test]
async fn init_against_postgres_is_idempotent() {
    let Ok(url) = std::env::var("TALEA_TEST_PG_URL") else {
        eprintln!("TALEA_TEST_PG_URL not set; skipping postgres init test");
        return;
    };
    let dir = tempfile::tempdir().unwrap();
    let seed_path = dir.path().join("talea.seed.toml");
    std::fs::write(
        &seed_path,
        "[[assets]]\nid = \"TALEAD-PG-TEST\"\nclass = \"fiat\"\nprecision = 2\nname = \"init test asset\"\n",
    )
    .unwrap();
    let opts = InitOpts {
        db_url: url,
        seed: Some(seed_path),
        env_out: dir.path().join(".env"),
        force: false,
    };

    let first = run_init(&opts).await.unwrap().seed.unwrap();
    // First-ever run creates it; any later run finds it — both states are valid
    // against a persistent test database.
    assert_eq!(first.assets_created + first.assets_existing, 1);

    let second = run_init(&opts).await.unwrap().seed.unwrap();
    assert_eq!((second.assets_created, second.assets_existing), (0, 1));
}
