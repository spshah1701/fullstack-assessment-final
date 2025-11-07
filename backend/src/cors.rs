use axum::http::{HeaderValue, Method, header};
use std::env;
use tower_http::cors::{Any, CorsLayer};

pub fn cors_layer() -> CorsLayer {
    // Load allowed origins from env (comma-separated)
    let allowed_origins = env::var("CORS_ALLOWED_ORIGINS").unwrap_or_else(|_| "*".to_string());

    let cors = if allowed_origins == "*" {
        // Development mode — allow all
        CorsLayer::new()
            .allow_origin(Any)
            .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
            .allow_headers([header::CONTENT_TYPE, header::AUTHORIZATION, header::ACCEPT])
    } else {
        // Restrict to configured origins
        let origins = allowed_origins
            .split(',')
            .filter_map(|o| HeaderValue::from_str(o.trim()).ok())
            .collect::<Vec<_>>();

        CorsLayer::new()
            .allow_origin(origins)
            .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
            .allow_headers([header::CONTENT_TYPE, header::AUTHORIZATION, header::ACCEPT])
            .allow_credentials(true)
    };

    cors
}
