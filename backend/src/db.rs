use dotenvy::dotenv;
use sqlx::{PgPool, postgres::PgPoolOptions};
use std::env;
use tracing::info;

pub async fn init_postgres() -> Result<PgPool, sqlx::Error> {
    // Load variables from .env
    dotenv().ok();

    let database_url =
        env::var("DATABASE_URL").expect("DATABASE_URL must be set in .env or environment");

    let max_connections: u32 = env::var("MAX_DB_CONNECTIONS")
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(10);

    info!("Initializing PostgreSQL connection pool...");

    let pool = PgPoolOptions::new()
        .max_connections(max_connections)
        .connect(&database_url)
        .await?;

    info!(
        "PostgreSQL connected successfully ({} connections)",
        max_connections
    );

    Ok(pool)
}
