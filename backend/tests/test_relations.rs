// This file contains GraphQL integration tests for scenarios of relations between users and posts.

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
async fn test_user_posts_resolver() {
    // Test user posts relationship resolver returns correct posts
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
            users {
                data {
                    id
                    name
                    posts {
                        id
                        title
                    }
                }
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
    let user1 = users
        .iter()
        .find(|u| u["id"].as_i64().unwrap() == 1)
        .unwrap();
    let posts = user1["posts"].as_array().unwrap();
    assert_eq!(posts.len(), 2);
}

#[tokio::test]
async fn test_post_user_resolver() {
    // Test post user relationship resolver returns correct user
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
                    user {
                        id
                        name
                        email
                    }
                }
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
    let post1 = &posts[0];
    assert!(post1["user"].is_object());
    assert!(post1["user"]["name"].is_string());
}
