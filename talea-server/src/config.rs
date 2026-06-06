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
    /// Per-book write queue length; a full queue answers 429 + Retry-After.
    pub write_queue_depth: usize,
    /// Max drafts group-committed in one storage transaction per book.
    pub write_batch_max: usize,
    /// Path to a TOML file of scoped bearer tokens (see README "Scoped
    /// tokens"). Additive with TALEA_API_TOKEN.
    pub tokens_file: Option<String>,
    /// Maximum number of drafts accepted by POST /v1/transactions/batch.
    /// Requests that exceed this cap are rejected with 400. Default: 500.
    pub http_batch_max: usize,

    // ---- log:// store tuning -----------------------------------------------
    /// Events between automatic snapshots (0 = disabled). Only applies when
    /// TALEA_DB_URL uses the `log://` scheme. Default: 100_000.
    pub log_snapshot_every: Option<u64>,
    /// Max hot idempotency keys in memory; overflow drains oldest half to disk.
    /// Only applies to the `log://` backend. Default: 1_000_000.
    pub log_idem_hot_cap: Option<usize>,
    /// Max bytes per segment file before rotation. Only applies to `log://`.
    /// Default: 128 MiB.
    pub log_segment_max: Option<u64>,
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
        let write_queue_depth = Self::parse_nonzero(&get, "TALEA_WRITE_QUEUE_DEPTH", 256)?;
        let write_batch_max = Self::parse_nonzero(&get, "TALEA_WRITE_BATCH_MAX", 64)?;
        let http_batch_max = Self::parse_nonzero(&get, "TALEA_HTTP_BATCH_MAX", 500)?;
        let log_snapshot_every = get("TALEA_LOG_SNAPSHOT_EVERY")
            .map(|v| v.parse::<u64>())
            .transpose()
            .map_err(|e| ConfigError::Invalid {
                var: "TALEA_LOG_SNAPSHOT_EVERY",
                reason: format!("{e}"),
            })?;
        let log_idem_hot_cap = get("TALEA_LOG_IDEM_HOT_CAP")
            .map(|v| v.parse::<usize>())
            .transpose()
            .map_err(|e| ConfigError::Invalid {
                var: "TALEA_LOG_IDEM_HOT_CAP",
                reason: format!("{e}"),
            })?;
        let log_segment_max = get("TALEA_LOG_SEGMENT_MAX")
            .map(|v| v.parse::<u64>())
            .transpose()
            .map_err(|e| ConfigError::Invalid {
                var: "TALEA_LOG_SEGMENT_MAX",
                reason: format!("{e}"),
            })?;
        Ok(Self {
            db_url,
            bind,
            api_token: get("TALEA_API_TOKEN"),
            db_pool,
            max_inflight,
            metrics_bind,
            write_queue_depth,
            write_batch_max,
            tokens_file: get("TALEA_TOKENS_FILE"),
            http_batch_max,
            log_snapshot_every,
            log_idem_hot_cap,
            log_segment_max,
        })
    }

    fn parse_nonzero(
        get: impl Fn(&str) -> Option<String>,
        var: &'static str,
        default: usize,
    ) -> Result<usize, ConfigError> {
        let value = match get(var) {
            None => return Ok(default),
            Some(v) => v.parse::<usize>().map_err(|e| ConfigError::Invalid {
                var,
                reason: format!("{e}"),
            })?,
        };
        if value == 0 {
            return Err(ConfigError::Invalid {
                var,
                reason: "must be >= 1".into(),
            });
        }
        Ok(value)
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
    fn write_knobs_default() {
        let c = cfg(&[("TALEA_DB_URL", "sqlite://x.db")]).unwrap();
        assert_eq!(c.write_queue_depth, 256);
        assert_eq!(c.write_batch_max, 64);
    }

    #[test]
    fn write_knobs_parse_and_reject_zero() {
        let c = cfg(&[
            ("TALEA_DB_URL", "sqlite://x.db"),
            ("TALEA_WRITE_QUEUE_DEPTH", "8"),
            ("TALEA_WRITE_BATCH_MAX", "16"),
        ])
        .unwrap();
        assert_eq!(c.write_queue_depth, 8);
        assert_eq!(c.write_batch_max, 16);
        assert!(matches!(
            cfg(&[
                ("TALEA_DB_URL", "sqlite://x.db"),
                ("TALEA_WRITE_QUEUE_DEPTH", "0")
            ]),
            Err(ConfigError::Invalid {
                var: "TALEA_WRITE_QUEUE_DEPTH",
                ..
            })
        ));
        assert!(matches!(
            cfg(&[
                ("TALEA_DB_URL", "sqlite://x.db"),
                ("TALEA_WRITE_BATCH_MAX", "0")
            ]),
            Err(ConfigError::Invalid {
                var: "TALEA_WRITE_BATCH_MAX",
                ..
            })
        ));
    }

    #[test]
    fn http_batch_max_default_and_override() {
        let c = cfg(&[("TALEA_DB_URL", "sqlite://x.db")]).unwrap();
        assert_eq!(c.http_batch_max, 500);
        let c = cfg(&[
            ("TALEA_DB_URL", "sqlite://x.db"),
            ("TALEA_HTTP_BATCH_MAX", "100"),
        ])
        .unwrap();
        assert_eq!(c.http_batch_max, 100);
        assert!(matches!(
            cfg(&[
                ("TALEA_DB_URL", "sqlite://x.db"),
                ("TALEA_HTTP_BATCH_MAX", "0")
            ]),
            Err(ConfigError::Invalid {
                var: "TALEA_HTTP_BATCH_MAX",
                ..
            })
        ));
    }

    #[test]
    fn tokens_file_passthrough() {
        let c = cfg(&[("TALEA_DB_URL", "sqlite://x.db")]).unwrap();
        assert!(c.tokens_file.is_none());
        let c = cfg(&[
            ("TALEA_DB_URL", "sqlite://x.db"),
            ("TALEA_TOKENS_FILE", "/etc/talea/tokens.toml"),
        ])
        .unwrap();
        assert_eq!(c.tokens_file.as_deref(), Some("/etc/talea/tokens.toml"));
    }

    // ---- log store option parsing ------------------------------------------

    #[test]
    fn log_opts_default_to_none() {
        let c = cfg(&[("TALEA_DB_URL", "log:///tmp/x")]).unwrap();
        assert!(c.log_snapshot_every.is_none());
        assert!(c.log_idem_hot_cap.is_none());
        assert!(c.log_segment_max.is_none());
    }

    #[test]
    fn log_opts_parse_valid_values() {
        let c = cfg(&[
            ("TALEA_DB_URL", "log:///tmp/x"),
            ("TALEA_LOG_SNAPSHOT_EVERY", "500"),
            ("TALEA_LOG_IDEM_HOT_CAP", "2000"),
            ("TALEA_LOG_SEGMENT_MAX", "65536"),
        ])
        .unwrap();
        assert_eq!(c.log_snapshot_every, Some(500u64));
        assert_eq!(c.log_idem_hot_cap, Some(2000usize));
        assert_eq!(c.log_segment_max, Some(65536u64));
    }

    #[test]
    fn log_opts_snapshot_every_zero_is_valid() {
        let c = cfg(&[
            ("TALEA_DB_URL", "log:///tmp/x"),
            ("TALEA_LOG_SNAPSHOT_EVERY", "0"),
        ])
        .unwrap();
        assert_eq!(c.log_snapshot_every, Some(0u64));
    }

    #[test]
    fn log_opts_garbage_snapshot_every_errors_with_var_name() {
        let err = cfg(&[
            ("TALEA_DB_URL", "log:///tmp/x"),
            ("TALEA_LOG_SNAPSHOT_EVERY", "not-a-number"),
        ])
        .unwrap_err();
        assert!(
            matches!(
                &err,
                ConfigError::Invalid {
                    var: "TALEA_LOG_SNAPSHOT_EVERY",
                    ..
                }
            ),
            "expected Invalid for TALEA_LOG_SNAPSHOT_EVERY, got: {err:?}"
        );
    }

    #[test]
    fn log_opts_garbage_idem_hot_cap_errors_with_var_name() {
        let err = cfg(&[
            ("TALEA_DB_URL", "log:///tmp/x"),
            ("TALEA_LOG_IDEM_HOT_CAP", "bad"),
        ])
        .unwrap_err();
        assert!(
            matches!(
                &err,
                ConfigError::Invalid {
                    var: "TALEA_LOG_IDEM_HOT_CAP",
                    ..
                }
            ),
            "expected Invalid for TALEA_LOG_IDEM_HOT_CAP, got: {err:?}"
        );
    }

    #[test]
    fn log_opts_garbage_segment_max_errors_with_var_name() {
        let err = cfg(&[
            ("TALEA_DB_URL", "log:///tmp/x"),
            ("TALEA_LOG_SEGMENT_MAX", "???"),
        ])
        .unwrap_err();
        assert!(
            matches!(
                &err,
                ConfigError::Invalid {
                    var: "TALEA_LOG_SEGMENT_MAX",
                    ..
                }
            ),
            "expected Invalid for TALEA_LOG_SEGMENT_MAX, got: {err:?}"
        );
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
