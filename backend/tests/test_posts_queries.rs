// This file contains GraphQL integration tests for the "posts" queries.

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

// ----- POST QUERY TESTS -----

#[tokio::test]
async fn test_posts_query_basic() {
    // Test basic post query without filters
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
            posts {
                data {
                    id
                    title
                    content
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
    let posts = data["posts"]["data"].as_array().unwrap();
    assert!(posts.len() >= 3);
    assert_eq!(data["posts"]["totalCount"].as_i64().unwrap(), 3);
}

#[tokio::test]
async fn test_posts_query_with_user_filter() {
    // Test filtering posts by user ID
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
            posts(filters: { userId: { equals: 1 } }) {
                data {
                    id
                    title
                    userId
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
    let posts = data["posts"]["data"].as_array().unwrap();
    assert_eq!(posts.len(), 2);
    for post in posts {
        assert_eq!(post["userId"].as_i64().unwrap(), 1);
    }
}

#[tokio::test]
async fn test_posts_query_with_empty_result() {
    // Test filtering posts with no matching results
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
            posts(filters: { id: { equals: 999 } }) {
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
    assert_eq!(data["posts"]["totalCount"].as_i64().unwrap(), 0);
}

#[tokio::test]
async fn test_posts_query_with_pagination_and_filter() {
    // Test filtering posts by user ID with pagination
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
            posts(filters: { userId: { equals: 1 } }, limit: 1, offset: 0) {
                data {
                    id
                    userId
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
    assert_eq!(data["posts"]["totalCount"].as_i64().unwrap(), 2);
    assert_eq!(posts[0]["userId"].as_i64().unwrap(), 1);
}

// ----- POST QUERY TESTS - INTFILTER OPERATORS -----

#[tokio::test]
async fn test_posts_query_with_id_equals() {
    // Test filtering posts by exact ID match
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
            posts(filters: { id: { equals: 2 } }) {
                data {
                    id
                    title
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
    assert_eq!(data["posts"]["totalCount"].as_i64().unwrap(), 1);
    assert_eq!(posts[0]["id"].as_i64().unwrap(), 2);
}

#[tokio::test]
async fn test_posts_query_with_id_gt() {
    // Test filtering posts by ID greater than
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
            posts(filters: { id: { gt: 1 } }) {
                data {
                    id
                    title
                }
                totalCount
            }
        }
    "#;
    let result = schema.execute(query).await;
    assert!(result.errors.is_empty());
    let data = result.data.into_json().unwrap();
    let posts = data["posts"]["data"].as_array().unwrap();
    assert_eq!(posts.len(), 2);
    assert_eq!(data["posts"]["totalCount"].as_i64().unwrap(), 2);
    for post in posts {
        assert!(post["id"].as_i64().unwrap() > 1);
    }
}

#[tokio::test]
async fn test_posts_query_with_id_gte() {
    // Test filtering posts by ID greater than or equal
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
            posts(filters: { id: { gte: 2 } }) {
                data {
                    id
                    title
                }
                totalCount
            }
        }
    "#;
    let result = schema.execute(query).await;
    assert!(result.errors.is_empty());
    let data = result.data.into_json().unwrap();
    let posts = data["posts"]["data"].as_array().unwrap();
    assert_eq!(posts.len(), 2);
    assert_eq!(data["posts"]["totalCount"].as_i64().unwrap(), 2);
    for post in posts {
        assert!(post["id"].as_i64().unwrap() >= 2);
    }
}

#[tokio::test]
async fn test_posts_query_with_id_lt() {
    // Test filtering posts by ID less than
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
            posts(filters: { id: { lt: 3 } }) {
                data {
                    id
                    title
                }
                totalCount
            }
        }
    "#;
    let result = schema.execute(query).await;
    assert!(result.errors.is_empty());
    let data = result.data.into_json().unwrap();
    let posts = data["posts"]["data"].as_array().unwrap();
    assert_eq!(posts.len(), 2);
    assert_eq!(data["posts"]["totalCount"].as_i64().unwrap(), 2);
    for post in posts {
        assert!(post["id"].as_i64().unwrap() < 3);
    }
}

#[tokio::test]
async fn test_posts_query_with_id_lte() {
    // Test filtering posts by ID less than or equal
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
            posts(filters: { id: { lte: 2 } }) {
                data {
                    id
                    title
                }
                totalCount
            }
        }
    "#;
    let result = schema.execute(query).await;
    assert!(result.errors.is_empty());
    let data = result.data.into_json().unwrap();
    let posts = data["posts"]["data"].as_array().unwrap();
    assert_eq!(posts.len(), 2);
    assert_eq!(data["posts"]["totalCount"].as_i64().unwrap(), 2);
    for post in posts {
        assert!(post["id"].as_i64().unwrap() <= 2);
    }
}

#[tokio::test]
async fn test_posts_query_with_id_not_equals() {
    // Test filtering posts by ID not equal (lt OR gt)
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
            posts(filters: { or: [ { id: { lt: 2 } }, { id: { gt: 2 } } ] }) {
                data {
                    id
                    title
                }
                totalCount
            }
        }
    "#;
    let result = schema.execute(query).await;
    assert!(result.errors.is_empty());
    let data = result.data.into_json().unwrap();
    let posts = data["posts"]["data"].as_array().unwrap();
    assert_eq!(posts.len(), 2);
    assert_eq!(data["posts"]["totalCount"].as_i64().unwrap(), 2);
    for post in posts {
        assert_ne!(post["id"].as_i64().unwrap(), 2);
    }
}

#[tokio::test]
async fn test_posts_query_with_user_id_equals() {
    // Test filtering posts by exact user ID match
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
            posts(filters: { userId: { equals: 1 } }) {
                data {
                    id
                    userId
                }
                totalCount
            }
        }
    "#;
    let result = schema.execute(query).await;
    assert!(result.errors.is_empty());
    let data = result.data.into_json().unwrap();
    let posts = data["posts"]["data"].as_array().unwrap();
    assert_eq!(posts.len(), 2);
    assert_eq!(data["posts"]["totalCount"].as_i64().unwrap(), 2);
    for post in posts {
        assert_eq!(post["userId"].as_i64().unwrap(), 1);
    }
}

#[tokio::test]
async fn test_posts_query_with_user_id_gt() {
    // Test filtering posts by user ID greater than
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
            posts(filters: { userId: { gt: 1 } }) {
                data {
                    id
                    userId
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
    assert_eq!(data["posts"]["totalCount"].as_i64().unwrap(), 1);
    assert!(posts[0]["userId"].as_i64().unwrap() > 1);
}

#[tokio::test]
async fn test_posts_query_with_user_id_gte() {
    // Test filtering posts by user ID greater than or equal
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
            posts(filters: { userId: { gte: 2 } }) {
                data {
                    id
                    userId
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
    assert_eq!(data["posts"]["totalCount"].as_i64().unwrap(), 1);
    assert_eq!(posts[0]["userId"].as_i64().unwrap(), 2);
}

#[tokio::test]
async fn test_posts_query_with_user_id_lt() {
    // Test filtering posts by user ID less than
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
            posts(filters: { userId: { lt: 2 } }) {
                data {
                    id
                    userId
                }
                totalCount
            }
        }
    "#;
    let result = schema.execute(query).await;
    assert!(result.errors.is_empty());
    let data = result.data.into_json().unwrap();
    let posts = data["posts"]["data"].as_array().unwrap();
    assert_eq!(posts.len(), 2);
    assert_eq!(data["posts"]["totalCount"].as_i64().unwrap(), 2);
    for post in posts {
        assert!(post["userId"].as_i64().unwrap() < 2);
    }
}

#[tokio::test]
async fn test_posts_query_with_user_id_lte() {
    // Test filtering posts by user ID less than or equal
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
            posts(filters: { userId: { lte: 1 } }) {
                data {
                    id
                    userId
                }
                totalCount
            }
        }
    "#;
    let result = schema.execute(query).await;
    assert!(result.errors.is_empty());
    let data = result.data.into_json().unwrap();
    let posts = data["posts"]["data"].as_array().unwrap();
    assert_eq!(posts.len(), 2);
    assert_eq!(data["posts"]["totalCount"].as_i64().unwrap(), 2);
    for post in posts {
        assert!(post["userId"].as_i64().unwrap() <= 1);
    }
}

#[tokio::test]
async fn test_posts_query_with_user_id_not_equals() {
    // Test filtering posts by user ID not equal (lt OR gt)
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
            posts(filters: { or: [ { userId: { lt: 2 } }, { userId: { gt: 2 } } ] }) {
                data {
                    id
                    userId
                }
                totalCount
            }
        }
    "#;
    let result = schema.execute(query).await;
    assert!(result.errors.is_empty());
    let data = result.data.into_json().unwrap();
    let posts = data["posts"]["data"].as_array().unwrap();
    assert_eq!(posts.len(), 2);
    assert_eq!(data["posts"]["totalCount"].as_i64().unwrap(), 2);
    for post in posts {
        assert_ne!(post["userId"].as_i64().unwrap(), 2);
    }
}

// ----- POST QUERY TESTS - STRINGFILTER OPERATORS -----

#[tokio::test]
async fn test_posts_query_with_title_equals() {
    // Test filtering posts by exact title match
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
            posts(filters: { title: { equals: "Test Post 1" } }) {
                data {
                    id
                    title
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
    assert_eq!(data["posts"]["totalCount"].as_i64().unwrap(), 1);
    assert_eq!(posts[0]["title"].as_str().unwrap(), "Test Post 1");
}

#[tokio::test]
async fn test_posts_query_with_title_contains() {
    // Test filtering posts by title substring match
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
            posts(filters: { title: { contains: "Post 1" } }) {
                data {
                    id
                    title
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
    assert_eq!(data["posts"]["totalCount"].as_i64().unwrap(), 1);
    assert!(posts[0]["title"].as_str().unwrap().contains("Post 1"));
}

#[tokio::test]
async fn test_posts_query_with_title_starts_with() {
    // Test filtering posts by title prefix match
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
            posts(filters: { title: { startsWith: "Test" } }) {
                data {
                    id
                    title
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
    for post in posts {
        assert!(post["title"].as_str().unwrap().starts_with("Test"));
    }
}

#[tokio::test]
async fn test_posts_query_with_title_ends_with() {
    // Test filtering posts by title suffix match
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
            posts(filters: { title: { endsWith: "Post 2" } }) {
                data {
                    id
                    title
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
    assert_eq!(data["posts"]["totalCount"].as_i64().unwrap(), 1);
    assert!(posts[0]["title"].as_str().unwrap().ends_with("Post 2"));
}

#[tokio::test]
async fn test_posts_query_with_title_contains_insensitive() {
    // Test filtering posts by title substring match case-insensitive
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
            posts(filters: { title: { containsInsensitive: "POST 1" } }) {
                data {
                    id
                    title
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
    assert_eq!(data["posts"]["totalCount"].as_i64().unwrap(), 1);
    assert_eq!(posts[0]["title"].as_str().unwrap(), "Test Post 1");
}

#[tokio::test]
async fn test_posts_query_with_content_equals() {
    // Test filtering posts by exact content match
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
            posts(filters: { content: { equals: "Content for post 1" } }) {
                data {
                    id
                    content
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
    assert_eq!(data["posts"]["totalCount"].as_i64().unwrap(), 1);
    assert_eq!(posts[0]["content"].as_str().unwrap(), "Content for post 1");
}

#[tokio::test]
async fn test_posts_query_with_content_contains() {
    // Test filtering posts by content substring match
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
            posts(filters: { content: { contains: "post 1" } }) {
                data {
                    id
                    content
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
    assert_eq!(data["posts"]["totalCount"].as_i64().unwrap(), 1);
    assert!(posts[0]["content"].as_str().unwrap().contains("post 1"));
}

#[tokio::test]
async fn test_posts_query_with_content_starts_with() {
    // Test filtering posts by content prefix match
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
            posts(filters: { content: { startsWith: "Content" } }) {
                data {
                    id
                    content
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
    for post in posts {
        assert!(post["content"].as_str().unwrap().starts_with("Content"));
    }
}

#[tokio::test]
async fn test_posts_query_with_content_ends_with() {
    // Test filtering posts by content suffix match
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
            posts(filters: { content: { endsWith: "post 1" } }) {
                data {
                    id
                    content
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
    assert_eq!(data["posts"]["totalCount"].as_i64().unwrap(), 1);
    assert!(posts[0]["content"].as_str().unwrap().ends_with("post 1"));
}

#[tokio::test]
async fn test_posts_query_with_content_contains_insensitive() {
    // Test filtering posts by content substring match case-insensitive
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
            posts(filters: { content: { containsInsensitive: "POST 2" } }) {
                data {
                    id
                    content
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
    assert_eq!(data["posts"]["totalCount"].as_i64().unwrap(), 1);
    assert_eq!(posts[0]["content"].as_str().unwrap(), "Content for post 2");
}

// ----- POST QUERY TESTS - LOGICAL OPERATORS -----

#[tokio::test]
async fn test_posts_query_with_or_filter() {
    // Test filtering posts using OR logic with nested filters
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
            posts(filters: { or: [
                { id: { equals: 1 } },
                { id: { equals: 3 } }
            ] }) {
                data {
                    id
                    title
                }
                totalCount
            }
        }
    "#;
    let result = schema.execute(query).await;
    assert!(result.errors.is_empty());
    let data = result.data.into_json().unwrap();
    let posts = data["posts"]["data"].as_array().unwrap();
    assert_eq!(posts.len(), 2);
    assert_eq!(data["posts"]["totalCount"].as_i64().unwrap(), 2);
    let ids: Vec<i64> = posts.iter().map(|p| p["id"].as_i64().unwrap()).collect();
    assert!(ids.contains(&1));
    assert!(ids.contains(&3));
}
