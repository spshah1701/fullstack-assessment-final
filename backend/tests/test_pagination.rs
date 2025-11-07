// This file contains GraphQL integration tests for pagination.

// Include utils module at crate root so resolvers can use crate::utils
mod utils {
    include!("../src/utils.rs");
}

// Include resolvers module directly at crate root
// Now crate::utils in resolvers.rs will resolve to our utils module above
mod resolvers {
    include!("../src/resolvers.rs");
}

// Include test utilities
mod test_utils {
    include!("../src/test_utils.rs");
}

use test_utils::{build_schema, seed_test_data, setup};

#[tokio::test]
async fn test_users_query_with_limit_zero() {
    // Test pagination with limit=0 should clamp to minimum of 1
    let pool = setup().await;
    seed_test_data(&pool)
        .await
        .expect("Failed to seed test data");
    let schema = build_schema(
        pool,
        resolvers::Query::default(),
        resolvers::Mutation::default(),
    );
    let query = r#"
        query {
            users(limit: 0) {
                data {
                    id
                }
                totalCount
            }
        }
    "#;
    let result = schema.execute(query).await;
    assert!(result.errors.is_empty());
    let data = result.data.into_json().unwrap();
    let users = data["users"]["data"].as_array().unwrap();
    assert_eq!(users.len(), 1);
    assert_eq!(data["users"]["totalCount"].as_i64().unwrap(), 3);
}

#[tokio::test]
async fn test_users_query_with_limit_exceeds_max() {
    // Test pagination with limit exceeding max should clamp to max of 200
    let pool = setup().await;
    seed_test_data(&pool)
        .await
        .expect("Failed to seed test data");
    let schema = build_schema(
        pool,
        resolvers::Query::default(),
        resolvers::Mutation::default(),
    );
    let query = r#"
        query {
            users(limit: 500) {
                data {
                    id
                }
                totalCount
            }
        }
    "#;
    let result = schema.execute(query).await;
    assert!(result.errors.is_empty());
    let data = result.data.into_json().unwrap();
    let users = data["users"]["data"].as_array().unwrap();
    assert_eq!(users.len(), 3);
    assert_eq!(data["users"]["totalCount"].as_i64().unwrap(), 3);
}

#[tokio::test]
async fn test_users_query_with_offset_beyond_total() {
    // Test pagination with offset beyond total count should return empty results
    let pool = setup().await;
    seed_test_data(&pool)
        .await
        .expect("Failed to seed test data");
    let schema = build_schema(
        pool,
        resolvers::Query::default(),
        resolvers::Mutation::default(),
    );
    let query = r#"
        query {
            users(limit: 10, offset: 100) {
                data {
                    id
                }
                totalCount
            }
        }
    "#;
    let result = schema.execute(query).await;
    assert!(result.errors.is_empty());
    let data = result.data.into_json().unwrap();
    let users = data["users"]["data"].as_array().unwrap();
    assert_eq!(users.len(), 0);
    assert_eq!(data["users"]["totalCount"].as_i64().unwrap(), 3);
}

#[tokio::test]
async fn test_posts_query_with_limit_zero() {
    // Test pagination with limit=0 should clamp to minimum of 1
    let pool = setup().await;
    seed_test_data(&pool)
        .await
        .expect("Failed to seed test data");
    let schema = build_schema(
        pool,
        resolvers::Query::default(),
        resolvers::Mutation::default(),
    );
    let query = r#"
        query {
            posts(limit: 0) {
                data {
                    id
                }
                totalCount
            }
        }
    "#;
    let result = schema.execute(query).await;
    assert!(result.errors.is_empty());
    let data = result.data.into_json().unwrap();
    let posts = data["posts"]["data"].as_array().unwrap();
    assert_eq!(posts.len(), 1);
    assert_eq!(data["posts"]["totalCount"].as_i64().unwrap(), 3);
}

#[tokio::test]
async fn test_posts_query_with_limit_exceeds_max() {
    // Test pagination with limit exceeding max should clamp to max of 200
    let pool = setup().await;
    seed_test_data(&pool)
        .await
        .expect("Failed to seed test data");
    let schema = build_schema(
        pool,
        resolvers::Query::default(),
        resolvers::Mutation::default(),
    );
    let query = r#"
        query {
            posts(limit: 500) {
                data {
                    id
                }
                totalCount
            }
        }
    "#;
    let result = schema.execute(query).await;
    assert!(result.errors.is_empty());
    let data = result.data.into_json().unwrap();
    let posts = data["posts"]["data"].as_array().unwrap();
    assert_eq!(posts.len(), 3);
    assert_eq!(data["posts"]["totalCount"].as_i64().unwrap(), 3);
}

#[tokio::test]
async fn test_posts_query_with_offset_beyond_total() {
    // Test pagination with offset beyond total count should return empty results
    let pool = setup().await;
    seed_test_data(&pool)
        .await
        .expect("Failed to seed test data");
    let schema = build_schema(
        pool,
        resolvers::Query::default(),
        resolvers::Mutation::default(),
    );
    let query = r#"
        query {
            posts(limit: 10, offset: 100) {
                data {
                    id
                }
                totalCount
            }
        }
    "#;
    let result = schema.execute(query).await;
    assert!(result.errors.is_empty());
    let data = result.data.into_json().unwrap();
    let posts = data["posts"]["data"].as_array().unwrap();
    assert_eq!(posts.len(), 0);
    assert_eq!(data["posts"]["totalCount"].as_i64().unwrap(), 3);
}
