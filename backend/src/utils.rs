use chrono::{DateTime, Utc};
use serde_json::Value;
use sqlx::{Postgres, postgres::PgArguments, query::QueryAs};

// Dynamically binds JSON values (numbers, strings, dates, bools, etc.)
// to a SQLx query safely and type-correctly.
pub fn bind_dynamic_params<'q, T>(
    mut query: QueryAs<'q, Postgres, T, PgArguments>,
    params: Vec<Value>,
) -> QueryAs<'q, Postgres, T, PgArguments> {
    for p in params {
        match p {
            // --- Numbers ---
            Value::Number(n) => {
                if let Some(i) = n.as_i64() {
                    query = query.bind(i as i32);
                } else if let Some(f) = n.as_f64() {
                    query = query.bind(f);
                }
            }

            // --- Strings (try for date) ---
            Value::String(s) => {
                if let Ok(dt) = DateTime::parse_from_rfc3339(&s) {
                    query = query.bind(dt.with_timezone(&Utc));
                } else {
                    query = query.bind(s);
                }
            }

            // --- Booleans ---
            Value::Bool(b) => {
                query = query.bind(b);
            }

            // --- Nulls ---
            Value::Null => {
                query = query.bind::<Option<String>>(None);
            }

            // --- Fallback ---
            _ => {
                query = query.bind::<Option<String>>(None);
            }
        }
    }

    query
}
