// This file contains GraphQL integration tests for the "users" queries.

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

// ----- USER QUERY TESTS -----

#[tokio::test]
async fn test_users_query_with_id_filter() {
    // Test filtering users by exact ID match
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
            users(filters: { id: { equals: 2 } }) {
                data {
                    id
                    name
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
    assert_eq!(data["users"]["totalCount"].as_i64().unwrap(), 1);
    assert_eq!(users[0]["id"].as_i64().unwrap(), 2);
}

#[tokio::test]
async fn test_users_query_with_age_equals() {
    // Test filtering users by exact age match
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
            users(filters: { age: { equals: 25 } }) {
                data {
                    id
                    name
                    age
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
    assert_eq!(users[0]["age"].as_i64().unwrap(), 25);
}

#[tokio::test]
async fn test_users_query_with_email_filter() {
    // Test filtering users by exact email match
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
            users(filters: { email: { equals: "test1@example.com" } }) {
                data {
                    id
                    name
                    email
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
    assert_eq!(users[0]["email"].as_str().unwrap(), "test1@example.com");
}

#[tokio::test]
async fn test_users() {
    // Test basic user query without filters
    let pool = setup().await;
    seed_test_data(&pool)
        .await
        .expect("Failed to seed test data");
    let schema = build_schema(
        pool.clone(),
        resolvers::Query::default(),
        resolvers::Mutation::default(),
    );
    let query = r#"
        query {
            users {
                data {
                    id
                    name
                    email
                }
                totalCount
            }
        }
    "#;
    let result = schema.execute(query).await;
    if !result.errors.is_empty() {
        println!("GraphQL errors: {:?}", result.errors);
    }
    assert!(result.errors.is_empty());
    let data = result.data.into_json().unwrap();
    let users = data["users"]["data"].as_array().unwrap();
    assert!(users.len() >= 3);
    assert_eq!(data["users"]["totalCount"].as_i64().unwrap(), 3);
}

#[tokio::test]
async fn test_users_query_with_pagination() {
    // Test user query with limit and offset pagination
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
            users(limit: 2, offset: 0) {
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
    assert_eq!(users.len(), 2);
    assert_eq!(data["users"]["totalCount"].as_i64().unwrap(), 3);
}

// ----- USER QUERY TESTS - INTFILTER OPERATORS -----

#[tokio::test]
async fn test_users_query_with_age_gte() {
    // Test filtering users by age greater than or equal
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
            users(filters: { age: { gte: 30 } }) {
                data {
                    id
                    age
                }
                totalCount
            }
        }
    "#;
    let result = schema.execute(query).await;
    assert!(result.errors.is_empty());
    let data = result.data.into_json().unwrap();
    let users = data["users"]["data"].as_array().unwrap();
    assert_eq!(users.len(), 2);
    assert_eq!(data["users"]["totalCount"].as_i64().unwrap(), 2);
    for user in users {
        assert!(user["age"].as_i64().unwrap() >= 30);
    }
}

#[tokio::test]
async fn test_users_query_with_age_lte() {
    // Test filtering users by age less than or equal
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
            users(filters: { age: { lte: 30 } }) {
                data {
                    id
                    age
                }
                totalCount
            }
        }
    "#;
    let result = schema.execute(query).await;
    assert!(result.errors.is_empty());
    let data = result.data.into_json().unwrap();
    let users = data["users"]["data"].as_array().unwrap();
    assert_eq!(users.len(), 2);
    assert_eq!(data["users"]["totalCount"].as_i64().unwrap(), 2);
    for user in users {
        assert!(user["age"].as_i64().unwrap() <= 30);
    }
}

#[tokio::test]
async fn test_users_query_with_age_gt() {
    // Test filtering users by age greater than
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
            users(filters: { age: { gt: 25 } }) {
                data {
                    id
                    age
                }
                totalCount
            }
        }
    "#;
    let result = schema.execute(query).await;
    assert!(result.errors.is_empty());
    let data = result.data.into_json().unwrap();
    let users = data["users"]["data"].as_array().unwrap();
    assert_eq!(users.len(), 2);
    assert_eq!(data["users"]["totalCount"].as_i64().unwrap(), 2);
    for user in users {
        assert!(user["age"].as_i64().unwrap() > 25);
    }
}

#[tokio::test]
async fn test_users_query_with_age_lt() {
    // Test filtering users by age less than
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
            users(filters: { age: { lt: 35 } }) {
                data {
                    id
                    age
                }
                totalCount
            }
        }
    "#;
    let result = schema.execute(query).await;
    assert!(result.errors.is_empty());
    let data = result.data.into_json().unwrap();
    let users = data["users"]["data"].as_array().unwrap();
    assert_eq!(users.len(), 2);
    assert_eq!(data["users"]["totalCount"].as_i64().unwrap(), 2);
    for user in users {
        assert!(user["age"].as_i64().unwrap() < 35);
    }
}

#[tokio::test]
async fn test_users_query_with_age_range() {
    // Test filtering users by age range using gte and lte together
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
            users(filters: { age: { gte: 25, lte: 35 } }) {
                data {
                    id
                    age
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

// ----- USER QUERY TESTS - STRINGFILTER OPERATORS -----

#[tokio::test]
async fn test_users_query_with_name_equals() {
    // Test filtering users by exact name match
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
            users(filters: { name: { equals: "Test User 1" } }) {
                data {
                    id
                    name
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
    assert_eq!(data["users"]["totalCount"].as_i64().unwrap(), 1);
    assert_eq!(users[0]["name"].as_str().unwrap(), "Test User 1");
}

#[tokio::test]
async fn test_users_query_with_name_contains() {
    // Test filtering users by name substring match
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
            users(filters: { name: { contains: "User 1" } }) {
                data {
                    id
                    name
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
    assert_eq!(data["users"]["totalCount"].as_i64().unwrap(), 1);
    assert!(users[0]["name"].as_str().unwrap().contains("User 1"));
}

#[tokio::test]
async fn test_users_query_with_name_starts_with() {
    // Test filtering users by name prefix match
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
            users(filters: { name: { startsWith: "Test" } }) {
                data {
                    id
                    name
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
    for user in users {
        assert!(user["name"].as_str().unwrap().starts_with("Test"));
    }
}

#[tokio::test]
async fn test_users_query_with_name_ends_with() {
    // Test filtering users by name suffix match
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
            users(filters: { name: { endsWith: "User 2" } }) {
                data {
                    id
                    name
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
    assert_eq!(data["users"]["totalCount"].as_i64().unwrap(), 1);
    assert!(users[0]["name"].as_str().unwrap().ends_with("User 2"));
}

#[tokio::test]
async fn test_users_query_with_name_contains_insensitive() {
    // Test filtering users by name substring match case-insensitive
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
            users(filters: { name: { containsInsensitive: "USER 3" } }) {
                data {
                    id
                    name
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
    assert_eq!(data["users"]["totalCount"].as_i64().unwrap(), 1);
    assert_eq!(users[0]["name"].as_str().unwrap(), "Test User 3");
}

#[tokio::test]
async fn test_users_query_with_email_equals() {
    // Test filtering users by exact email match
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
            users(filters: { email: { equals: "test1@example.com" } }) {
                data {
                    id
                    email
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
    assert_eq!(data["users"]["totalCount"].as_i64().unwrap(), 1);
    assert_eq!(users[0]["email"].as_str().unwrap(), "test1@example.com");
}

#[tokio::test]
async fn test_users_query_with_email_contains() {
    // Test filtering users by email substring match
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
            users(filters: { email: { contains: "test" } }) {
                data {
                    id
                    email
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
    for user in users {
        assert!(user["email"].as_str().unwrap().contains("test"));
    }
}

#[tokio::test]
async fn test_users_query_with_email_starts_with() {
    // Test filtering users by email prefix match
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
            users(filters: { email: { startsWith: "test1" } }) {
                data {
                    id
                    email
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
    assert_eq!(data["users"]["totalCount"].as_i64().unwrap(), 1);
    assert!(users[0]["email"].as_str().unwrap().starts_with("test1"));
}

#[tokio::test]
async fn test_users_query_with_email_ends_with() {
    // Test filtering users by email suffix match
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
            users(filters: { email: { endsWith: "@example.com" } }) {
                data {
                    id
                    email
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
    for user in users {
        assert!(user["email"].as_str().unwrap().ends_with("@example.com"));
    }
}

#[tokio::test]
async fn test_users_query_with_email_contains_insensitive() {
    // Test filtering users by email substring match case-insensitive
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
            users(filters: { email: { containsInsensitive: "TEST1" } }) {
                data {
                    id
                    email
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
    assert_eq!(data["users"]["totalCount"].as_i64().unwrap(), 1);
    assert_eq!(users[0]["email"].as_str().unwrap(), "test1@example.com");
}

#[tokio::test]
async fn test_users_query_with_phone_filter() {
    // Test filtering users by exact phone match
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
            users(filters: { phone: { equals: "111-111-1111" } }) {
                data {
                    id
                    phone
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
    assert_eq!(data["users"]["totalCount"].as_i64().unwrap(), 1);
    assert_eq!(users[0]["phone"].as_str().unwrap(), "111-111-1111");
}

#[tokio::test]
async fn test_users_query_with_phone_equals() {
    // Test filtering users by exact phone match
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
            users(filters: { phone: { equals: "111-111-1111" } }) {
                data {
                    id
                    phone
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
    assert_eq!(data["users"]["totalCount"].as_i64().unwrap(), 1);
    assert_eq!(users[0]["phone"].as_str().unwrap(), "111-111-1111");
}

#[tokio::test]
async fn test_users_query_with_phone_contains() {
    // Test filtering users by phone substring match
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
            users(filters: { phone: { contains: "111" } }) {
                data {
                    id
                    phone
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
    assert_eq!(data["users"]["totalCount"].as_i64().unwrap(), 1);
    assert!(users[0]["phone"].as_str().unwrap().contains("111"));
}

#[tokio::test]
async fn test_users_query_with_phone_starts_with() {
    // Test filtering users by phone prefix match
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
            users(filters: { phone: { startsWith: "222" } }) {
                data {
                    id
                    phone
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
    assert_eq!(data["users"]["totalCount"].as_i64().unwrap(), 1);
    assert!(users[0]["phone"].as_str().unwrap().starts_with("222"));
}

#[tokio::test]
async fn test_users_query_with_phone_ends_with() {
    // Test filtering users by phone suffix match
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
            users(filters: { phone: { endsWith: "1111" } }) {
                data {
                    id
                    phone
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
    assert_eq!(data["users"]["totalCount"].as_i64().unwrap(), 1);
    assert!(users[0]["phone"].as_str().unwrap().ends_with("1111"));
}

#[tokio::test]
async fn test_users_query_with_phone_contains_insensitive() {
    // Test filtering users by phone substring match case-insensitive
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
            users(filters: { phone: { containsInsensitive: "222-222" } }) {
                data {
                    id
                    phone
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
    assert_eq!(data["users"]["totalCount"].as_i64().unwrap(), 1);
    assert_eq!(users[0]["phone"].as_str().unwrap(), "222-222-2222");
}

#[tokio::test]
async fn test_users_query_with_name_equals_exact() {
    // Test filtering users by exact name match (duplicate test for consistency)
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
            users(filters: { name: { equals: "Test User 2" } }) {
                data {
                    id
                    name
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
    assert_eq!(data["users"]["totalCount"].as_i64().unwrap(), 1);
    assert_eq!(users[0]["name"].as_str().unwrap(), "Test User 2");
}

#[tokio::test]
async fn test_users_query_with_phone_equals_exact() {
    // Test filtering users by exact phone match (duplicate test for consistency)
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
            users(filters: { phone: { equals: "222-222-2222" } }) {
                data {
                    id
                    phone
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
    assert_eq!(data["users"]["totalCount"].as_i64().unwrap(), 1);
    assert_eq!(users[0]["phone"].as_str().unwrap(), "222-222-2222");
}

#[tokio::test]
async fn test_users_query_with_email_equals_exact() {
    // Test filtering users by exact email match (duplicate test for consistency)
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
            users(filters: { email: { equals: "test2@example.com" } }) {
                data {
                    id
                    email
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
    assert_eq!(data["users"]["totalCount"].as_i64().unwrap(), 1);
    assert_eq!(users[0]["email"].as_str().unwrap(), "test2@example.com");
}

// ----- USER QUERY TESTS - LOGICAL OPERATORS -----

#[tokio::test]
async fn test_users_query_with_or_filter() {
    // Test filtering users using OR logic with nested filters
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
            users(filters: { or: [
                { age: { equals: 25 } },
                { age: { equals: 35 } }
            ] }) {
                data {
                    id
                    age
                }
                totalCount
            }
        }
    "#;
    let result = schema.execute(query).await;
    assert!(result.errors.is_empty());
    let data = result.data.into_json().unwrap();
    let users = data["users"]["data"].as_array().unwrap();
    assert_eq!(users.len(), 2);
    assert_eq!(data["users"]["totalCount"].as_i64().unwrap(), 2);
    let ages: Vec<i64> = users.iter().map(|u| u["age"].as_i64().unwrap()).collect();
    assert!(ages.contains(&25));
    assert!(ages.contains(&35));
}

#[tokio::test]
async fn test_users_query_with_and_filter() {
    // Test filtering users using AND logic with nested filters
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
            users(filters: { and: [
                { age: { gte: 25 } },
                { age: { lte: 30 } }
            ] }) {
                data {
                    id
                    age
                }
                totalCount
            }
        }
    "#;
    let result = schema.execute(query).await;
    assert!(result.errors.is_empty());
    let data = result.data.into_json().unwrap();
    let users = data["users"]["data"].as_array().unwrap();
    assert_eq!(users.len(), 2);
    assert_eq!(data["users"]["totalCount"].as_i64().unwrap(), 2);
    for user in users {
        let age = user["age"].as_i64().unwrap();
        assert!(age >= 25 && age <= 30);
    }
}

#[tokio::test]
async fn test_users_query_with_multiple_filters() {
    // Test filtering users with multiple filter conditions
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
            users(filters: { 
                age: { gte: 25 }
                email: { contains: "test1" }
            }) {
                data {
                    id
                    age
                    email
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
    assert_eq!(data["users"]["totalCount"].as_i64().unwrap(), 1);
    assert_eq!(users[0]["email"].as_str().unwrap(), "test1@example.com");
    assert_eq!(users[0]["age"].as_i64().unwrap(), 25);
}

#[tokio::test]
async fn test_users_query_with_filters() {
    // Test filtering users by age equals
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
            users(filters: { age: { equals: 25 } }) {
                data {
                    id
                    name
                    age
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
    assert_eq!(users[0]["age"].as_i64().unwrap(), 25);
}

#[tokio::test]
async fn test_users_query_with_empty_result() {
    // Test filtering users with no matching results
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
            users(filters: { age: { equals: 99 } }) {
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
    assert_eq!(data["users"]["totalCount"].as_i64().unwrap(), 0);
}
