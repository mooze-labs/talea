//! Server run path, callable from any binary (talea-server, talead).

use std::sync::Arc;

use metrics::gauge;
use talea_core::store::{Store, StoreError};

use crate::config::Config;
use crate::http::auth::AuthConfig;
use talea_service::LedgerService;

/// Connect to the store, bind, and serve until ctrl-c.
pub async fn run(config: Config) -> Result<(), Box<dyn std::error::Error>> {
    let _metrics_handle = crate::metrics::install()?;

    let (store, pool_sampler, backend) = connect_store(&config).await?;

    let mut entries = AuthConfig::single(config.api_token.clone()).entries;
    if let Some(path) = &config.tokens_file {
        let text = std::fs::read_to_string(path)
            .map_err(|e| format!("reading TALEA_TOKENS_FILE {path}: {e}"))?;
        let file_entries = crate::http::auth::parse_tokens(&text)
            .map_err(|e| format!("TALEA_TOKENS_FILE {path}: {e}"))?;
        // a fat-fingered file silently yielding zero entries must never
        // downgrade the server to open mode
        if file_entries.is_empty() {
            return Err(
                format!("TALEA_TOKENS_FILE {path}: no [tokens.<name>] entries found").into(),
            );
        }
        // a duplicate against the legacy env token is as fatal as within the file
        for (secret, scope) in &file_entries {
            if entries.iter().any(|(s, _)| s == secret) {
                return Err(format!(
                    "TALEA_TOKENS_FILE {path}: entry '{}' duplicates TALEA_API_TOKEN",
                    scope.name
                )
                .into());
            }
        }
        entries.extend(file_entries);
    }
    if entries.is_empty() {
        tracing::warn!(
            "TALEA_API_TOKEN and TALEA_TOKENS_FILE not set - the API is OPEN (dev mode)"
        );
    } else {
        tracing::info!(tokens = entries.len(), "auth: scoped bearer tokens active");
    }

    if let Some(bind) = config.metrics_bind {
        let metrics_app = crate::metrics::router(_metrics_handle.clone());
        let listener = tokio::net::TcpListener::bind(bind).await?;
        tracing::info!(bind = %bind, "metrics listener up");
        tokio::spawn(async move {
            axum::serve(listener, metrics_app).await.ok();
        });
    }

    let service = Arc::new(LedgerService::with_write_config(
        store,
        talea_service::WriteConfig {
            queue_depth: config.write_queue_depth,
            batch_max: config.write_batch_max,
            ..Default::default()
        },
    ));

    let sampler_service = Arc::clone(&service);
    tokio::spawn(async move {
        let mut tick = tokio::time::interval(std::time::Duration::from_secs(5));
        loop {
            tick.tick().await;
            let (size, idle) = pool_sampler();
            gauge!("talea_db_pool_connections", "state" => "size").set(size as f64);
            gauge!("talea_db_pool_connections", "state" => "idle").set(idle as f64);
            let (books, queued) = sampler_service.write_queue_stats();
            gauge!("talea_write_active_books").set(books as f64);
            gauge!("talea_write_queue_depth").set(queued as f64);
        }
    });
    let app = crate::http::routes::router_with_batch_max(
        service,
        AuthConfig { entries },
        config.max_inflight,
        backend,
        config.http_batch_max,
    );

    let listener = tokio::net::TcpListener::bind(config.bind).await?;
    tracing::info!(bind = %config.bind, "talea-server listening");
    axum::serve(listener, app)
        .with_graceful_shutdown(async {
            tokio::signal::ctrl_c().await.ok();
            tracing::info!("shutting down");
        })
        .await?;
    Ok(())
}

/// URL-scheme store selection. The server owns pool sizing so admission
/// control (acquire_timeout -> 503) is configurable in one place.
///
/// (store, pool_sampler): the sampler reads pool stats for the gauges —
/// captured as a closure because the two backends have different pool types.
async fn connect_store(
    config: &Config,
) -> Result<
    (
        Arc<dyn Store>,
        Box<dyn Fn() -> (u32, usize) + Send>,
        &'static str,
    ),
    Box<dyn std::error::Error>,
> {
    if config.db_url.starts_with("postgres://") || config.db_url.starts_with("postgresql://") {
        // Each active SSE subscription pins one pool connection for its whole
        // lifetime (PgListener). With max_inflight admitting far more requests
        // than the pool holds, heavy subscriber fan-out starves commits into
        // acquire_timeout 503s — size TALEA_DB_POOL for subscribers + workers.
        if config.max_inflight as u32 > config.db_pool {
            tracing::warn!(
                db_pool = config.db_pool,
                max_inflight = config.max_inflight,
                "TALEA_DB_POOL is far below TALEA_MAX_INFLIGHT; sustained SSE \
                 subscriber fan-out on Postgres can starve the pool (each \
                 subscription holds one connection)"
            );
        }
        let pool = sqlx::postgres::PgPoolOptions::new()
            .max_connections(config.db_pool)
            .acquire_timeout(Config::DB_ACQUIRE_TIMEOUT)
            .connect(&config.db_url)
            .await?;
        let sampler_pool = pool.clone();
        let sampler: Box<dyn Fn() -> (u32, usize) + Send> =
            Box::new(move || (sampler_pool.size(), sampler_pool.num_idle()));
        let store = talea_store_postgres::PgTaleaStore::new(pool);
        store.migrate().await.map_err(box_store_err)?;
        Ok((Arc::new(store), sampler, "postgres"))
    } else if config.db_url.starts_with("sqlite:") {
        use sqlx::sqlite::{
            SqliteConnectOptions, SqliteJournalMode, SqlitePoolOptions, SqliteSynchronous,
        };
        use std::str::FromStr;

        // A pooled bare :memory: URL would give every connection its OWN
        // empty database — silent data divergence. Refuse it outright.
        if config.db_url.contains(":memory:") {
            return Err(
                "sqlite::memory: is not supported by the server (each pooled \
                 connection would get its own database); use a file path"
                    .into(),
            );
        }
        let opts = SqliteConnectOptions::from_str(&config.db_url)?
            .create_if_missing(true)
            .journal_mode(SqliteJournalMode::Wal)
            // NORMAL is the standard WAL pairing: one fsync less per commit.
            // Durable against process crash; an OS/power crash can lose the
            // most recent commit(s), never corrupt the database.
            .synchronous(SqliteSynchronous::Normal)
            .busy_timeout(std::time::Duration::from_secs(5))
            .foreign_keys(true);
        let pool = SqlitePoolOptions::new()
            .max_connections(config.db_pool)
            .acquire_timeout(Config::DB_ACQUIRE_TIMEOUT)
            .connect_with(opts)
            .await?;
        let sampler_pool = pool.clone();
        let sampler: Box<dyn Fn() -> (u32, usize) + Send> =
            Box::new(move || (sampler_pool.size(), sampler_pool.num_idle()));
        let store = talea_store_sqlite::SqliteTaleaStore::new(pool);
        store.migrate().await.map_err(box_store_err)?;
        Ok((Arc::new(store), sampler, "sqlite"))
    } else if let Some(path) = config.db_url.strip_prefix("log://") {
        let log_opts = if config.log_snapshot_every.is_some()
            || config.log_idem_hot_cap.is_some()
            || config.log_segment_max.is_some()
        {
            let defaults = talea_store_log::LogStoreOptions::default();
            talea_store_log::LogStoreOptions {
                snapshot_every: config.log_snapshot_every.unwrap_or(defaults.snapshot_every),
                idem_hot_cap: config.log_idem_hot_cap.unwrap_or(defaults.idem_hot_cap),
                segment_max: config.log_segment_max.unwrap_or(defaults.segment_max),
            }
        } else {
            talea_store_log::LogStoreOptions::default()
        };
        let store = talea_store_log::LogTaleaStore::open_with(std::path::Path::new(path), log_opts)
            .await
            .map_err(box_store_err)?;
        // The log store has no connection pool; report zeros for the pool gauges.
        // The dashboard tolerates zero-valued series and the metrics are labelled
        // with the backend name, so consumers can distinguish pool-less backends.
        let sampler: Box<dyn Fn() -> (u32, usize) + Send> = Box::new(|| (0, 0));
        Ok((Arc::new(store), sampler, "log"))
    } else {
        Err(format!(
            "unsupported TALEA_DB_URL scheme: {} (expected postgres://..., sqlite://..., or log://<dir>)",
            config.db_url
        )
        .into())
    }
}

fn box_store_err(e: StoreError) -> Box<dyn std::error::Error> {
    Box::new(e)
}
