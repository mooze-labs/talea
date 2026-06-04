use std::sync::Arc;

use talea_core::store::{Store, StoreError};
use talea_server::config::Config;
use talea_server::http::auth::AuthConfig;
use talea_server::http::routes::router;
use talea_server::service::LedgerService;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info".into()),
        )
        .init();

    let config = Config::from_env()?;
    let store = connect_store(&config).await?;
    if config.api_token.is_none() {
        tracing::warn!("TALEA_API_TOKEN not set - the API is OPEN (dev mode)");
    }

    let service = Arc::new(LedgerService::new(store));
    let app = router(
        service,
        AuthConfig { token: config.api_token.clone() },
        config.max_inflight,
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
async fn connect_store(config: &Config) -> Result<Arc<dyn Store>, Box<dyn std::error::Error>> {
    if config.db_url.starts_with("postgres://") || config.db_url.starts_with("postgresql://") {
        let pool = sqlx::postgres::PgPoolOptions::new()
            .max_connections(config.db_pool)
            .acquire_timeout(Config::DB_ACQUIRE_TIMEOUT)
            .connect(&config.db_url)
            .await?;
        let store = talea_store_postgres::PgTaleaStore::new(pool);
        store.migrate().await.map_err(box_store_err)?;
        Ok(Arc::new(store))
    } else if config.db_url.starts_with("sqlite:") {
        use sqlx::sqlite::{SqliteConnectOptions, SqliteJournalMode, SqlitePoolOptions};
        use std::str::FromStr;

        let opts = SqliteConnectOptions::from_str(&config.db_url)?
            .create_if_missing(true)
            .journal_mode(SqliteJournalMode::Wal)
            .busy_timeout(std::time::Duration::from_secs(5))
            .foreign_keys(true);
        let pool = SqlitePoolOptions::new()
            .max_connections(config.db_pool)
            .acquire_timeout(Config::DB_ACQUIRE_TIMEOUT)
            .connect_with(opts)
            .await?;
        let store = talea_store_sqlite::SqliteTaleaStore::new(pool);
        store.migrate().await.map_err(box_store_err)?;
        Ok(Arc::new(store))
    } else {
        Err(format!(
            "unsupported TALEA_DB_URL scheme: {} (expected postgres://... or sqlite://...)",
            config.db_url
        )
        .into())
    }
}

fn box_store_err(e: StoreError) -> Box<dyn std::error::Error> {
    Box::new(e)
}
