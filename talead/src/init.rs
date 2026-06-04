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
         # TALEA_MAX_INFLIGHT=256\n"
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

/// URL-scheme store selection, mirroring talea_server::run::connect_store —
/// but using the stores' own connect() (which migrate), since init doesn't
/// need the server's pool sizing.
pub async fn connect_store(db_url: &str) -> Result<Arc<dyn Store>, Box<dyn std::error::Error>> {
    if db_url.contains(":memory:") {
        return Err("sqlite::memory: is not supported (nothing would persist); use a file path".into());
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
    } else {
        Err(format!("unsupported db url scheme: {db_url} (expected postgres://... or sqlite://...)").into())
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

    let env = write_env(&opts.env_out, &render_env(&opts.db_url, &generate_token()), opts.force)?;
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
    }

    #[test]
    fn write_env_respects_existing_without_force() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join(".env");

        assert!(matches!(write_env(&path, "first", false).unwrap(), EnvOutcome::Written));
        assert!(matches!(write_env(&path, "second", false).unwrap(), EnvOutcome::KeptExisting));
        assert_eq!(std::fs::read_to_string(&path).unwrap(), "first");

        assert!(matches!(write_env(&path, "third", true).unwrap(), EnvOutcome::Written));
        assert_eq!(std::fs::read_to_string(&path).unwrap(), "third");
    }
}
