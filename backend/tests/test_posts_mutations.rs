// This file contains GraphQL integration tests for the "posts" mutations.

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

// ----- POST MUTATION TESTS -----

#[tokio::test]
async fn test_create_post_mutation() {
    // Test creating a new post with valid data
    let pool = setup().await;
    seed_test_data(&pool)
        .await
        .expect("Failed to seed test data");
    let schema = build_schema(
        pool,
        resolvers::Query::default(),
        resolvers::Mutation::default(),
    );
    let mutation = r#"
        mutation {
            createPost(input: {
                userId: 1
                title: "New Test Post"
                content: "This is test content"
            }) {
                id
                title
                content
            }
        }
    "#;
    let result = schema.execute(mutation).await;
    if !result.errors.is_empty() {
        println!("GraphQL errors: {:?}", result.errors);
    }
    assert!(result.errors.is_empty());
    let data = result.data.into_json().unwrap();
    let post = &data["createPost"];
    assert_eq!(post["title"].as_str().unwrap(), "New Test Post");
    assert_eq!(post["content"].as_str().unwrap(), "This is test content");
}

#[tokio::test]
async fn test_create_post_mutation_empty_title() {
    // Test creating a post with empty title should fail
    let pool = setup().await;
    seed_test_data(&pool)
        .await
        .expect("Failed to seed test data");
    let schema = build_schema(
        pool,
        resolvers::Query::default(),
        resolvers::Mutation::default(),
    );
    let mutation = r#"
        mutation {
            createPost(input: {
                userId: 1
                title: "   "
                content: "Test content"
            }) {
                id
                title
            }
        }
    "#;
    let result = schema.execute(mutation).await;
    assert!(!result.errors.is_empty());
    assert!(result.errors[0].message.contains("Title cannot be empty"));
}

#[tokio::test]
async fn test_create_post_mutation_with_empty_content_string() {
    // Test creating a post with empty content string should set content to null
    let pool = setup().await;
    seed_test_data(&pool)
        .await
        .expect("Failed to seed test data");
    let schema = build_schema(
        pool,
        resolvers::Query::default(),
        resolvers::Mutation::default(),
    );
    let mutation = r#"
        mutation {
            createPost(input: {
                userId: 1
                title: "Post with empty content"
                content: "   "
            }) {
                id
                title
                content
            }
        }
    "#;
    let result = schema.execute(mutation).await;
    assert!(result.errors.is_empty());
    let data = result.data.into_json().unwrap();
    let post = &data["createPost"];
    assert_eq!(post["title"].as_str().unwrap(), "Post with empty content");
    assert!(post["content"].is_null());
}

#[tokio::test]
async fn test_create_post_mutation_with_null_content() {
    // Test creating a post without content should set content to null
    let pool = setup().await;
    seed_test_data(&pool)
        .await
        .expect("Failed to seed test data");
    let schema = build_schema(
        pool,
        resolvers::Query::default(),
        resolvers::Mutation::default(),
    );
    let mutation = r#"
        mutation {
            createPost(input: {
                userId: 1
                title: "Post without content"
            }) {
                id
                title
                content
            }
        }
    "#;
    let result = schema.execute(mutation).await;
    assert!(result.errors.is_empty());
    let data = result.data.into_json().unwrap();
    let post = &data["createPost"];
    assert_eq!(post["title"].as_str().unwrap(), "Post without content");
    assert!(post["content"].is_null());
}

#[tokio::test]
async fn test_update_post_mutation() {
    // Test updating a post with valid data
    let pool = setup().await;
    seed_test_data(&pool)
        .await
        .expect("Failed to seed test data");
    let schema = build_schema(
        pool,
        resolvers::Query::default(),
        resolvers::Mutation::default(),
    );
    let mutation = r#"
        mutation {
            updatePost(input: {
                id: 1
                title: "Updated Title"
            }) {
                id
                title
                content
            }
        }
    "#;
    let result = schema.execute(mutation).await;
    assert!(result.errors.is_empty());
    let data = result.data.into_json().unwrap();
    let post = &data["updatePost"];
    assert_eq!(post["title"].as_str().unwrap(), "Updated Title");
}

#[tokio::test]
async fn test_update_post_mutation_empty_fields() {
    // Test updating a post with no fields should fail
    let pool = setup().await;
    seed_test_data(&pool)
        .await
        .expect("Failed to seed test data");
    let schema = build_schema(
        pool,
        resolvers::Query::default(),
        resolvers::Mutation::default(),
    );
    let mutation = r#"
        mutation {
            updatePost(input: {
                id: 1
            }) {
                id
            }
        }
    "#;
    let result = schema.execute(mutation).await;
    assert!(!result.errors.is_empty());
    assert!(result.errors[0].message.contains("Nothing to update"));
}

#[tokio::test]
async fn test_update_post_mutation_with_only_content() {
    // Test updating a post with only content field
    let pool = setup().await;
    seed_test_data(&pool)
        .await
        .expect("Failed to seed test data");
    let schema = build_schema(
        pool,
        resolvers::Query::default(),
        resolvers::Mutation::default(),
    );
    let mutation = r#"
        mutation {
            updatePost(input: {
                id: 1
                content: "Updated content only"
            }) {
                id
                title
                content
            }
        }
    "#;
    let result = schema.execute(mutation).await;
    assert!(result.errors.is_empty());
    let data = result.data.into_json().unwrap();
    let post = &data["updatePost"];
    assert_eq!(post["id"].as_i64().unwrap(), 1);
    assert_eq!(post["title"].as_str().unwrap(), "Test Post 1");
    assert_eq!(post["content"].as_str().unwrap(), "Updated content only");
}

#[tokio::test]
async fn test_update_post_mutation_with_empty_content_string() {
    // Test updating a post with empty content string should set content to null
    let pool = setup().await;
    seed_test_data(&pool)
        .await
        .expect("Failed to seed test data");
    let schema = build_schema(
        pool,
        resolvers::Query::default(),
        resolvers::Mutation::default(),
    );
    let mutation = r#"
        mutation {
            updatePost(input: {
                id: 1
                content: "   "
            }) {
                id
                title
                content
            }
        }
    "#;
    let result = schema.execute(mutation).await;
    assert!(result.errors.is_empty());
    let data = result.data.into_json().unwrap();
    let post = &data["updatePost"];
    assert_eq!(post["id"].as_i64().unwrap(), 1);
    assert!(post["content"].is_null());
}

#[tokio::test]
async fn test_delete_post_mutation() {
    // Test deleting an existing post
    let pool = setup().await;
    seed_test_data(&pool)
        .await
        .expect("Failed to seed test data");
    let schema = build_schema(
        pool.clone(),
        resolvers::Query::default(),
        resolvers::Mutation::default(),
    );
    let mutation = r#"
        mutation {
            deletePost(id: 1)
        }
    "#;
    let result = schema.execute(mutation).await;
    assert!(result.errors.is_empty());
    let data = result.data.into_json().unwrap();
    assert_eq!(data["deletePost"].as_bool().unwrap(), true);
    // Verify post was deleted
    let query = r#"
        query {
            posts(filters: { id: { equals: 1 } }) {
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
    assert_eq!(data["posts"]["totalCount"].as_i64().unwrap(), 0);
}

#[tokio::test]
async fn test_delete_post_mutation_nonexistent() {
    // Test deleting a non-existent post should return false
    let pool = setup().await;
    seed_test_data(&pool)
        .await
        .expect("Failed to seed test data");
    let schema = build_schema(
        pool,
        resolvers::Query::default(),
        resolvers::Mutation::default(),
    );
    let mutation = r#"
        mutation {
            deletePost(id: 9999)
        }
    "#;
    let result = schema.execute(mutation).await;
    assert!(result.errors.is_empty());
    let data = result.data.into_json().unwrap();
    assert_eq!(data["deletePost"].as_bool().unwrap(), false);
}
