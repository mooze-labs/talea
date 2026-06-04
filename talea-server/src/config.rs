use std::net::SocketAddr;
use std::time::Duration;

#[derive(Debug, Clone)]
pub struct Config {
    pub db_url: String,
    pub bind: SocketAddr,
    pub api_token: Option<String>,
    pub db_pool: u32,
    pub max_inflight: usize,
    /// Optional bind for the Prometheus /metrics listener; unset = no
    /// metrics endpoint (the recorder still runs, nothing is exposed).
    pub metrics_bind: Option<SocketAddr>,
}

#[derive(Debug, thiserror::Error)]
pub enum ConfigError {
    #[error("TALEA_DB_URL is required (postgres://... or sqlite://...)")]
    MissingDbUrl,
    #[error("invalid {var}: {reason}")]
    Invalid { var: &'static str, reason: String },
}

impl Config {
    pub const DB_ACQUIRE_TIMEOUT: Duration = Duration::from_secs(3);
    pub const REQUEST_TIMEOUT: Duration = Duration::from_secs(30);

    pub fn from_env() -> Result<Self, ConfigError> {
        Self::from_lookup(|k| std::env::var(k).ok())
    }

    /// Testable core: takes a lookup fn instead of mutating process env
    /// (env-var mutation races under the parallel test runner).
    pub fn from_lookup(get: impl Fn(&str) -> Option<String>) -> Result<Self, ConfigError> {
        let db_url = get("TALEA_DB_URL").ok_or(ConfigError::MissingDbUrl)?;
        let bind = get("TALEA_BIND")
            .unwrap_or_else(|| "127.0.0.1:8080".to_string())
            .parse()
            .map_err(|e| ConfigError::Invalid {
                var: "TALEA_BIND",
                reason: format!("{e}"),
            })?;
        let db_pool = get("TALEA_DB_POOL")
            .map(|v| v.parse())
            .transpose()
            .map_err(|e| ConfigError::Invalid {
                var: "TALEA_DB_POOL",
                reason: format!("{e}"),
            })?
            .unwrap_or(10);
        let max_inflight = get("TALEA_MAX_INFLIGHT")
            .map(|v| v.parse())
            .transpose()
            .map_err(|e| ConfigError::Invalid {
                var: "TALEA_MAX_INFLIGHT",
                reason: format!("{e}"),
            })?
            .unwrap_or(256);
        let metrics_bind = get("TALEA_METRICS_BIND")
            .map(|v| v.parse())
            .transpose()
            .map_err(|e| ConfigError::Invalid {
                var: "TALEA_METRICS_BIND",
                reason: format!("{e}"),
            })?;
        Ok(Self {
            db_url,
            bind,
            api_token: get("TALEA_API_TOKEN"),
            db_pool,
            max_inflight,
            metrics_bind,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    fn cfg(vars: &[(&str, &str)]) -> Result<Config, ConfigError> {
        let map: HashMap<String, String> = vars
            .iter()
            .map(|(k, v)| (k.to_string(), v.to_string()))
            .collect();
        Config::from_lookup(|k| map.get(k).cloned())
    }

    #[test]
    fn db_url_is_required() {
        assert!(matches!(cfg(&[]), Err(ConfigError::MissingDbUrl)));
    }

    #[test]
    fn defaults_apply() {
        let c = cfg(&[("TALEA_DB_URL", "sqlite://x.db")]).unwrap();
        assert_eq!(c.bind, "127.0.0.1:8080".parse().unwrap());
        assert_eq!(c.db_pool, 10);
        assert_eq!(c.max_inflight, 256);
        assert!(c.api_token.is_none());
    }

    #[test]
    fn overrides_apply() {
        let c = cfg(&[
            ("TALEA_DB_URL", "postgres://h/db"),
            ("TALEA_BIND", "0.0.0.0:9000"),
            ("TALEA_API_TOKEN", "secret"),
            ("TALEA_DB_POOL", "32"),
            ("TALEA_MAX_INFLIGHT", "512"),
        ])
        .unwrap();
        assert_eq!(c.bind, "0.0.0.0:9000".parse().unwrap());
        assert_eq!(c.api_token.as_deref(), Some("secret"));
        assert_eq!(c.db_pool, 32);
        assert_eq!(c.max_inflight, 512);
    }

    #[test]
    fn metrics_bind_defaults_to_none() {
        let c = cfg(&[("TALEA_DB_URL", "sqlite://x.db")]).unwrap();
        assert!(c.metrics_bind.is_none());
    }

    #[test]
    fn metrics_bind_parses() {
        let c = cfg(&[
            ("TALEA_DB_URL", "sqlite://x.db"),
            ("TALEA_METRICS_BIND", "127.0.0.1:9100"),
        ])
        .unwrap();
        assert_eq!(c.metrics_bind, Some("127.0.0.1:9100".parse().unwrap()));
    }

    #[test]
    fn metrics_bind_garbage_rejected() {
        assert!(matches!(
            cfg(&[
                ("TALEA_DB_URL", "sqlite://x.db"),
                ("TALEA_METRICS_BIND", "nope")
            ]),
            Err(ConfigError::Invalid {
                var: "TALEA_METRICS_BIND",
                ..
            })
        ));
    }

    #[test]
    fn garbage_values_are_rejected() {
        assert!(matches!(
            cfg(&[("TALEA_DB_URL", "sqlite://x.db"), ("TALEA_BIND", "nope")]),
            Err(ConfigError::Invalid {
                var: "TALEA_BIND",
                ..
            })
        ));
        assert!(matches!(
            cfg(&[("TALEA_DB_URL", "sqlite://x.db"), ("TALEA_DB_POOL", "many")]),
            Err(ConfigError::Invalid {
                var: "TALEA_DB_POOL",
                ..
            })
        ));
    }
}
