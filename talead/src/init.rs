//! First-run flow: connect+migrate, token, seed, .env.

use std::path::Path;

use rand::RngCore;

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
