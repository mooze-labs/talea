//! First-run flow: connect+migrate, token, seed, .env.

use std::path::{Path, PathBuf};
use std::sync::Arc;

use rand::RngCore;
use talea_core::store::Store;

pub fn generate_token() -> String {
    let mut bytes = [0u8; 32];
    rand::rng().fill_bytes(&mut bytes);
    hex::encode(bytes)
}

pub fn render_env(db_url: &str, token: &str) -> String {
    format!(
        "TALEA_DB_URL={db_url}\n\
         TALEA_API_TOKEN={token}\n\
         TALEA_BIND=127.0.0.1:8080\n\
         # TALEA_DB_POOL=10\n\
         # TALEA_MAX_INFLIGHT=256\n\
         # TALEA_METRICS_BIND=127.0.0.1:9100\n"
    )
}

#[derive(Debug, PartialEq, Eq)]
pub enum EnvOutcome {
    Written,
    KeptExisting,
}

pub fn write_env(path: &Path, contents: &str, force: bool) -> std::io::Result<EnvOutcome> {
    if path.exists() && !force {
        return Ok(EnvOutcome::KeptExisting);
    }
    std::fs::write(path, contents)?;
    Ok(EnvOutcome::Written)
}

pub struct InitOpts {
    pub db_url: String,
    /// Explicit seed path. `None` falls back to ./talea.seed.toml when present.
    pub seed: Option<PathBuf>,
    pub env_out: PathBuf,
    pub force: bool,
}

#[derive(Debug)]
pub struct InitReport {
    /// None = no seed file found/given.
    pub seed: Option<crate::seed::ApplySummary>,
    pub env: EnvOutcome,
}

/// Parse log-store tuning env vars.
///
/// Each var is optional; a set but unparseable value is a startup error naming
/// the variable. `TALEA_LOG_SNAPSHOT_EVERY=0` is valid and disables automatic
/// snapshots.
fn parse_log_store_opts() -> Result<talea_store_log::LogStoreOptions, Box<dyn std::error::Error>> {
    parse_log_store_opts_from(|k| std::env::var(k).ok())
}

/// Testable core: accepts a lookup fn instead of reading the process env
/// (env-var mutation races under the parallel test runner).
fn parse_log_store_opts_from(
    get: impl Fn(&str) -> Option<String>,
) -> Result<talea_store_log::LogStoreOptions, Box<dyn std::error::Error>> {
    fn parse_opt<T>(var: &'static str, val: Option<String>) -> Result<Option<T>, Box<dyn std::error::Error>>
    where
        T: std::str::FromStr,
        T::Err: std::fmt::Display,
    {
        val.map(|v| {
            v.parse::<T>()
                .map_err(|e| -> Box<dyn std::error::Error> { format!("invalid {var}: {e}").into() })
        })
        .transpose()
    }

    let snapshot_every = parse_opt::<u64>("TALEA_LOG_SNAPSHOT_EVERY", get("TALEA_LOG_SNAPSHOT_EVERY"))?;
    let idem_hot_cap = parse_opt::<usize>("TALEA_LOG_IDEM_HOT_CAP", get("TALEA_LOG_IDEM_HOT_CAP"))?;
    let segment_max = parse_opt::<u64>("TALEA_LOG_SEGMENT_MAX", get("TALEA_LOG_SEGMENT_MAX"))?;

    if snapshot_every.is_none() && idem_hot_cap.is_none() && segment_max.is_none() {
        return Ok(talea_store_log::LogStoreOptions::default());
    }
    let defaults = talea_store_log::LogStoreOptions::default();
    Ok(talea_store_log::LogStoreOptions {
        snapshot_every: snapshot_every.unwrap_or(defaults.snapshot_every),
        idem_hot_cap: idem_hot_cap.unwrap_or(defaults.idem_hot_cap),
        segment_max: segment_max.unwrap_or(defaults.segment_max),
    })
}

/// URL-scheme store selection, mirroring talea_server::run::connect_store —
/// but using the stores' own connect() (which migrate), since init doesn't
/// need the server's pool sizing.
pub async fn connect_store(db_url: &str) -> Result<Arc<dyn Store>, Box<dyn std::error::Error>> {
    if db_url.contains(":memory:") {
        return Err(
            "sqlite::memory: is not supported (nothing would persist); use a file path".into(),
        );
    }
    if db_url.starts_with("postgres://") || db_url.starts_with("postgresql://") {
        let store = talea_store_postgres::PgTaleaStore::connect(db_url)
            .await
            .map_err(|e| format!("couldn't reach {db_url}: {e} (is the database up?)"))?;
        Ok(Arc::new(store))
    } else if db_url.starts_with("sqlite:") {
        let store = talea_store_sqlite::SqliteTaleaStore::connect(db_url)
            .await
            .map_err(|e| format!("couldn't open {db_url}: {e}"))?;
        Ok(Arc::new(store))
    } else if let Some(path) = db_url.strip_prefix("log://") {
        let log_opts = parse_log_store_opts()?;
        let store =
            talea_store_log::LogTaleaStore::open_with(std::path::Path::new(path), log_opts)
                .await
                .map_err(|e| format!("couldn't open log store at {path}: {e}"))?;
        Ok(Arc::new(store))
    } else {
        Err(format!(
            "unsupported db url scheme: {db_url} (expected postgres://..., sqlite://..., or log://<dir>)"
        )
        .into())
    }
}

pub async fn run_init(opts: &InitOpts) -> Result<InitReport, Box<dyn std::error::Error>> {
    let store = connect_store(&opts.db_url).await?;

    let seed_path = match &opts.seed {
        Some(p) if !p.exists() => {
            return Err(format!("seed file not found: {}", p.display()).into());
        }
        Some(p) => Some(p.clone()),
        None => {
            let default = PathBuf::from("talea.seed.toml");
            default.exists().then_some(default)
        }
    };

    let seed = match seed_path {
        Some(p) => {
            let text = std::fs::read_to_string(&p)?;
            let parsed = crate::seed::parse(&text)?;
            Some(crate::seed::apply(store.as_ref(), &parsed).await?)
        }
        None => None,
    };

    let env = write_env(
        &opts.env_out,
        &render_env(&opts.db_url, &generate_token()),
        opts.force,
    )?;
    Ok(InitReport { seed, env })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn token_is_64_hex_chars_and_random() {
        let a = generate_token();
        let b = generate_token();
        assert_eq!(a.len(), 64);
        assert!(a.chars().all(|c| c.is_ascii_hexdigit()));
        assert_ne!(a, b);
    }

    #[test]
    fn env_renders_all_keys() {
        let env = render_env("sqlite://talea.db", "deadbeef");
        assert!(env.contains("TALEA_DB_URL=sqlite://talea.db\n"));
        assert!(env.contains("TALEA_API_TOKEN=deadbeef\n"));
        assert!(env.contains("TALEA_BIND=127.0.0.1:8080\n"));
        assert!(env.contains("# TALEA_DB_POOL=10\n"));
        assert!(env.contains("# TALEA_MAX_INFLIGHT=256\n"));
        assert!(env.contains("# TALEA_METRICS_BIND=127.0.0.1:9100\n"));
    }

    #[tokio::test]
    async fn log_scheme_opens_a_log_store() {
        let dir = tempfile::tempdir().unwrap();
        let url = format!("log://{}", dir.path().display());
        let store = connect_store(&url).await.unwrap();
        assert!(store.asset(&talea_core::types::AssetId::new("X")).await.unwrap().is_none());
    }

    // ---- log store option parsing ------------------------------------------

    #[test]
    fn log_opts_garbage_snapshot_every_errors_with_var_name() {
        let err = parse_log_store_opts_from(|k| {
            if k == "TALEA_LOG_SNAPSHOT_EVERY" {
                Some("not-a-number".into())
            } else {
                None
            }
        })
        .unwrap_err();
        let msg = err.to_string();
        assert!(
            msg.contains("TALEA_LOG_SNAPSHOT_EVERY"),
            "error must name the var, got: {msg}"
        );
    }

    #[test]
    fn log_opts_garbage_idem_hot_cap_errors_with_var_name() {
        let err = parse_log_store_opts_from(|k| {
            if k == "TALEA_LOG_IDEM_HOT_CAP" {
                Some("bad".into())
            } else {
                None
            }
        })
        .unwrap_err();
        let msg = err.to_string();
        assert!(
            msg.contains("TALEA_LOG_IDEM_HOT_CAP"),
            "error must name the var, got: {msg}"
        );
    }

    #[test]
    fn log_opts_garbage_segment_max_errors_with_var_name() {
        let err = parse_log_store_opts_from(|k| {
            if k == "TALEA_LOG_SEGMENT_MAX" {
                Some("???".into())
            } else {
                None
            }
        })
        .unwrap_err();
        let msg = err.to_string();
        assert!(
            msg.contains("TALEA_LOG_SEGMENT_MAX"),
            "error must name the var, got: {msg}"
        );
    }

    #[tokio::test]
    async fn log_opts_valid_values_open_store() {
        let dir = tempfile::tempdir().unwrap();
        let url = format!("log://{}", dir.path().display());

        // Simulate all three vars set to valid values.
        let opts = parse_log_store_opts_from(|k| match k {
            "TALEA_LOG_SNAPSHOT_EVERY" => Some("500".into()),
            "TALEA_LOG_IDEM_HOT_CAP" => Some("2000".into()),
            "TALEA_LOG_SEGMENT_MAX" => Some("65536".into()),
            _ => None,
        })
        .unwrap();
        assert_eq!(opts.snapshot_every, 500);
        assert_eq!(opts.idem_hot_cap, 2000);
        assert_eq!(opts.segment_max, 65536);

        // Confirm the store actually opens with these options.
        let store = talea_store_log::LogTaleaStore::open_with(
            std::path::Path::new(&url["log://".len()..]),
            opts,
        )
        .await
        .unwrap();
        assert!(store.asset(&talea_core::types::AssetId::new("X")).await.unwrap().is_none());
    }

    #[test]
    fn log_opts_snapshot_every_zero_is_valid() {
        let opts = parse_log_store_opts_from(|k| {
            if k == "TALEA_LOG_SNAPSHOT_EVERY" {
                Some("0".into())
            } else {
                None
            }
        })
        .unwrap();
        assert_eq!(opts.snapshot_every, 0, "0 should disable snapshots, not error");
    }

    #[test]
    fn write_env_respects_existing_without_force() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join(".env");

        assert!(matches!(
            write_env(&path, "first", false).unwrap(),
            EnvOutcome::Written
        ));
        assert!(matches!(
            write_env(&path, "second", false).unwrap(),
            EnvOutcome::KeptExisting
        ));
        assert_eq!(std::fs::read_to_string(&path).unwrap(), "first");

        assert!(matches!(
            write_env(&path, "third", true).unwrap(),
            EnvOutcome::Written
        ));
        assert_eq!(std::fs::read_to_string(&path).unwrap(), "third");
    }
}
