use talead::init::{EnvOutcome, InitOpts, run_init};
use talead::seed::SeedError;

const SEED: &str = r#"
[[assets]]
id = "USD"
class = "fiat"
precision = 2
name = "US Dollar"

[[accounts]]
book = "onramp"
path = "treasury:usd"
asset = "USD"
kind = "asset"
"#;

fn opts(dir: &std::path::Path, seed_file: Option<&str>) -> InitOpts {
    let seed = seed_file.map(|content| {
        let p = dir.join("talea.seed.toml");
        std::fs::write(&p, content).unwrap();
        p
    });
    InitOpts {
        db_url: format!("sqlite://{}", dir.join("talea.db").display()),
        seed,
        env_out: dir.join(".env"),
        force: false,
    }
}

#[tokio::test]
async fn init_then_rerun_is_idempotent() {
    let dir = tempfile::tempdir().unwrap();
    let o = opts(dir.path(), Some(SEED));

    let report = run_init(&o).await.unwrap();
    let s = report.seed.as_ref().unwrap();
    assert_eq!(
        (s.assets_created, s.assets_existing, s.accounts_ensured),
        (1, 0, 1)
    );
    assert_eq!(report.env, EnvOutcome::Written);

    let env = std::fs::read_to_string(&o.env_out).unwrap();
    assert!(env.contains(&format!("TALEA_DB_URL={}\n", o.db_url)));
    let token = env
        .lines()
        .find_map(|l| l.strip_prefix("TALEA_API_TOKEN="))
        .unwrap();
    assert_eq!(token.len(), 64);

    // Re-run: same DB, same seed — exits Ok, asset already present, .env untouched.
    let report2 = run_init(&o).await.unwrap();
    let s2 = report2.seed.as_ref().unwrap();
    assert_eq!(
        (s2.assets_created, s2.assets_existing, s2.accounts_ensured),
        (0, 1, 1)
    );
    assert_eq!(report2.env, EnvOutcome::KeptExisting);
    assert_eq!(std::fs::read_to_string(&o.env_out).unwrap(), env);
}

#[tokio::test]
async fn conflicting_asset_def_fails_with_named_field() {
    let dir = tempfile::tempdir().unwrap();
    run_init(&opts(dir.path(), Some(SEED))).await.unwrap();

    let conflicting = SEED.replace("precision = 2", "precision = 4");
    let err = run_init(&opts(dir.path(), Some(&conflicting)))
        .await
        .unwrap_err();
    let msg = err.to_string();
    assert!(msg.contains("USD"), "got: {msg}");
    assert!(msg.contains("precision 2 vs 4"), "got: {msg}");
}

#[tokio::test]
async fn account_referencing_unknown_asset_fails() {
    let dir = tempfile::tempdir().unwrap();
    let orphan = r#"
[[accounts]]
book = "onramp"
path = "treasury:eur"
asset = "EUR"
kind = "asset"
"#;
    let err = run_init(&opts(dir.path(), Some(orphan))).await.unwrap_err();
    assert!(matches!(
        err.downcast_ref::<SeedError>(),
        Some(SeedError::MissingAsset { asset, .. }) if asset == "EUR"
    ));
}

#[tokio::test]
async fn no_seed_file_skips_seeding() {
    let dir = tempfile::tempdir().unwrap();
    let report = run_init(&opts(dir.path(), None)).await.unwrap();
    assert!(report.seed.is_none());
    assert_eq!(report.env, EnvOutcome::Written);
}

#[tokio::test]
async fn memory_url_is_refused() {
    let dir = tempfile::tempdir().unwrap();
    let mut o = opts(dir.path(), None);
    o.db_url = "sqlite::memory:".into();
    let msg = run_init(&o).await.unwrap_err().to_string();
    assert!(msg.contains("memory"), "got: {msg}");
}

#[tokio::test]
async fn explicit_missing_seed_path_errors() {
    let dir = tempfile::tempdir().unwrap();
    let mut o = opts(dir.path(), None);
    o.seed = Some(dir.path().join("nope.toml"));
    let msg = run_init(&o).await.unwrap_err().to_string();
    assert!(msg.contains("seed file not found"), "got: {msg}");
}
