//! .env-aware config loading for `talead serve`.

use std::collections::HashMap;
use std::path::Path;

use talea_server::config::Config;

/// Process env wins; the env file only fills gaps (dotenvy semantics),
/// implemented via lookup-merge instead of process-env mutation so it
/// stays testable under the parallel runner.
pub fn load_config(
    env_file: Option<&Path>,
    base: impl Fn(&str) -> Option<String>,
) -> Result<Config, Box<dyn std::error::Error>> {
    let file_vars: HashMap<String, String> = match env_file {
        Some(p) => dotenvy::from_path_iter(p)?.collect::<Result<_, _>>()?,
        None => HashMap::new(),
    };
    let config = Config::from_lookup(|k| base(k).or_else(|| file_vars.get(k).cloned()))
        .map_err(|e| Box::new(e) as Box<dyn std::error::Error>)?;
    Ok(config)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn env_file_fills_gaps_but_does_not_override() {
        let dir = tempfile::tempdir().unwrap();
        let env_path = dir.path().join(".env");
        std::fs::write(&env_path, "TALEA_DB_URL=sqlite://from-file.db\nTALEA_DB_POOL=7\n").unwrap();

        // Process env (simulated) already sets TALEA_DB_URL — file must not override it.
        let config = load_config(Some(&env_path), |k| {
            (k == "TALEA_DB_URL").then(|| "sqlite://from-env.db".to_string())
        })
        .unwrap();
        assert_eq!(config.db_url, "sqlite://from-env.db");
        assert_eq!(config.db_pool, 7); // gap filled from file

        // Without the file: missing db url errors.
        assert!(load_config(None, |_| None).is_err());
    }
}
