use crate::utils::bind_dynamic_params;
use async_graphql::{Context, InputObject, Object, Result};
use backend::FilterBuilder;
use sqlx::types::chrono::{DateTime, Utc};
use sqlx::{FromRow, PgPool, Postgres, QueryBuilder};

//  Models
#[derive(FromRow)]
struct User {
    id: i32,
    name: Option<String>,
    age: Option<i32>,
    email: Option<String>,
    phone: Option<String>,
    created_at: Option<DateTime<Utc>>,
    updated_at: Option<DateTime<Utc>>,
}

#[derive(FromRow)]
struct Post {
    id: i32,
    user_id: Option<i32>,
    title: Option<String>,
    created_at: Option<DateTime<Utc>>,
    updated_at: Option<DateTime<Utc>>,
    content: Option<String>,
}

//  Input Filters
#[derive(InputObject)]
struct IntFilter {
    equals: Option<i32>,
    gt: Option<i32>,
    lt: Option<i32>,
    gte: Option<i32>,
    lte: Option<i32>,
}

#[derive(InputObject)]
struct StringFilter {
    equals: Option<String>,
    contains: Option<String>,
    starts_with: Option<String>,
    ends_with: Option<String>,
    #[graphql(name = "containsInsensitive")]
    contains_insensitive: Option<String>,
}

#[derive(InputObject, FilterBuilder)]
struct UserFilters {
    id: Option<IntFilter>,
    name: Option<StringFilter>,
    age: Option<IntFilter>,
    email: Option<StringFilter>,
    phone: Option<StringFilter>,
    and: Option<Vec<UserFilters>>,
    or: Option<Vec<UserFilters>>,
}

#[derive(InputObject, FilterBuilder)]
struct PostFilters {
    id: Option<IntFilter>,
    user_id: Option<IntFilter>,
    title: Option<StringFilter>,
    content: Option<StringFilter>,
    or: Option<Vec<PostFilters>>,
}

//  CRUD Input Types
#[derive(InputObject)]
struct CreatePostInput {
    user_id: i32,
    title: String,
    content: Option<String>,
}

#[derive(InputObject)]
struct UpdatePostInput {
    id: i32,
    title: Option<String>,
    content: Option<String>,
}

//  User Object
#[Object]
impl User {
    async fn id(&self) -> i32 {
        self.id
    }
    async fn name(&self) -> &Option<String> {
        &self.name
    }
    async fn age(&self) -> &Option<i32> {
        &self.age
    }
    async fn email(&self) -> &Option<String> {
        &self.email
    }
    async fn phone(&self) -> &Option<String> {
        &self.phone
    }
    async fn created_at(&self) -> &Option<DateTime<Utc>> {
        &self.created_at
    }
    async fn updated_at(&self) -> &Option<DateTime<Utc>> {
        &self.updated_at
    }

    async fn posts(&self, ctx: &Context<'_>) -> Result<Vec<Post>> {
        let pool = ctx.data::<PgPool>()?;
        let posts = sqlx::query_as::<_, Post>("SELECT * FROM posts WHERE user_id = $1")
            .bind(self.id)
            .fetch_all(pool)
            .await?;
        Ok(posts)
    }
}

//  Post Object
#[Object]
impl Post {
    async fn id(&self) -> i32 {
        self.id
    }
    async fn user_id(&self) -> &Option<i32> {
        &self.user_id
    }
    async fn title(&self) -> &Option<String> {
        &self.title
    }
    async fn created_at(&self) -> &Option<DateTime<Utc>> {
        &self.created_at
    }
    async fn updated_at(&self) -> &Option<DateTime<Utc>> {
        &self.updated_at
    }
    async fn content(&self) -> &Option<String> {
        &self.content
    }

    async fn user(&self, ctx: &Context<'_>) -> Result<Option<User>> {
        if let Some(user_id) = self.user_id {
            let pool = ctx.data::<PgPool>()?;
            let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
                .bind(user_id)
                .fetch_optional(pool)
                .await?;
            Ok(user)
        } else {
            Ok(None)
        }
    }
}

// Connection types for paginated responses
#[derive(Default)]
struct UsersConnection {
    data: Vec<User>,
    total_count: i32,
}

#[derive(Default)]
struct PostsConnection {
    data: Vec<Post>,
    total_count: i32,
}

#[Object]
impl UsersConnection {
    async fn data(&self) -> &Vec<User> {
        &self.data
    }

    async fn total_count(&self) -> i32 {
        self.total_count
    }
}

#[Object]
impl PostsConnection {
    async fn data(&self) -> &Vec<Post> {
        &self.data
    }

    async fn total_count(&self) -> i32 {
        self.total_count
    }
}

// Helper function to execute count query
async fn fetch_count(
    pool: &PgPool,
    where_clause: &str,
    params: Vec<serde_json::Value>,
    table_name: &str,
) -> Result<i32> {
    let sql = format!("SELECT COUNT(*)::int FROM {}{}", table_name, where_clause);

    let mut query = sqlx::query_scalar::<_, i32>(&sql);
    for p in params {
        match p {
            serde_json::Value::Number(n) => {
                if let Some(i) = n.as_i64() {
                    query = query.bind(i as i32);
                } else if let Some(f) = n.as_f64() {
                    query = query.bind(f);
                }
            }
            serde_json::Value::String(s) => {
                query = query.bind(s);
            }
            serde_json::Value::Bool(b) => {
                query = query.bind(b);
            }
            _ => {}
        }
    }

    let count = query.fetch_one(pool).await?;
    Ok(count)
}

//  Query
#[derive(Default)]
pub struct Query;

#[Object]
impl Query {
    async fn users(
        &self,
        ctx: &Context<'_>,
        filters: Option<UserFilters>,
        limit: Option<i32>,
        offset: Option<i32>,
    ) -> Result<UsersConnection> {
        let pool = ctx.data::<PgPool>()?;
        let limit = limit.unwrap_or(10).clamp(1, 200);
        let offset = offset.unwrap_or(0).max(0);

        let (where_clause, params) = filters
            .as_ref()
            .map(|f| f.build_where_clause())
            .unwrap_or(("".to_string(), Vec::new()));

        // Fetch count
        let total_count = fetch_count(pool, &where_clause, params.clone(), "users").await?;

        // Fetch data
        let sql = format!(
            "SELECT * FROM users{} ORDER BY id ASC LIMIT {} OFFSET {}",
            where_clause, limit, offset
        );

        let q = bind_dynamic_params(sqlx::query_as::<_, User>(&sql), params);
        let users = q.fetch_all(pool).await?;

        Ok(UsersConnection {
            data: users,
            total_count,
        })
    }

    async fn posts(
        &self,
        ctx: &Context<'_>,
        filters: Option<PostFilters>,
        limit: Option<i32>,
        offset: Option<i32>,
    ) -> Result<PostsConnection> {
        let pool = ctx.data::<PgPool>()?;
        let limit = limit.unwrap_or(10).clamp(1, 200);
        let offset = offset.unwrap_or(0).max(0);

        let (where_clause, params) = filters
            .as_ref()
            .map(|f| f.build_where_clause())
            .unwrap_or(("".to_string(), Vec::new()));

        // Fetch count
        let total_count = fetch_count(pool, &where_clause, params.clone(), "posts").await?;

        // Fetch data
        let sql = format!(
            "SELECT * FROM posts{} ORDER BY created_at DESC LIMIT {} OFFSET {}",
            where_clause, limit, offset
        );

        let q = bind_dynamic_params(sqlx::query_as::<_, Post>(&sql), params);
        let posts = q.fetch_all(pool).await?;

        Ok(PostsConnection {
            data: posts,
            total_count,
        })
    }
}
//  Mutations
#[derive(Default)]
pub struct Mutation;

#[Object]
impl Mutation {
    async fn create_post(&self, ctx: &Context<'_>, input: CreatePostInput) -> Result<Post> {
        let pool = ctx.data::<PgPool>()?;
        let title = input.title.trim();

        if title.is_empty() {
            return Err(async_graphql::Error::new("Title cannot be empty"));
        }

        let mut qb = QueryBuilder::<Postgres>::new(
            "INSERT INTO posts (user_id, title, content, created_at, updated_at) ",
        );

        // Normalize empty content to NULL before binding
        let normalized_content = match &input.content {
            Some(c) if !c.trim().is_empty() => Some(c.trim().to_string()),
            _ => None,
        };

        // Build query
        qb.push("VALUES (")
            .push_bind(input.user_id)
            .push(", ")
            .push_bind(title)
            .push(", ")
            .push_bind(normalized_content)
            .push(", NOW(), NOW()) ")
            .push("RETURNING id, user_id, title, created_at, updated_at, content");

        let post = qb
            .build_query_as::<Post>()
            .fetch_one(pool)
            .await
            .map_err(|e| async_graphql::Error::new(format!("Failed to create post: {}", e)))?;

        Ok(post)
    }

    async fn update_post(&self, ctx: &Context<'_>, input: UpdatePostInput) -> Result<Post> {
        let pool = ctx.data::<PgPool>()?;

        if input.title.is_none() && input.content.is_none() {
            return Err(async_graphql::Error::new("Nothing to update"));
        }

        let mut qb = QueryBuilder::<Postgres>::new("UPDATE posts SET ");
        let mut wrote = false;

        if let Some(title) = &input.title {
            if wrote {
                qb.push(", ");
            } else {
                wrote = true;
            }
            qb.push("title = ").push_bind(title.clone());
        }

        if let Some(content) = &input.content {
            let normalized_content = if content.trim().is_empty() {
                None
            } else {
                Some(content.trim().to_string())
            };

            if wrote {
                qb.push(", ");
            } else {
                wrote = true;
            }

            qb.push("content = ").push_bind(normalized_content);
        }

        if wrote {
            qb.push(", ");
        }
        qb.push("updated_at = NOW()");

        qb.push(" WHERE id = ")
            .push_bind(input.id)
            .push(" RETURNING id, user_id, title, created_at, updated_at, content");

        let post = qb
            .build_query_as::<Post>()
            .fetch_one(pool)
            .await
            .map_err(|e| async_graphql::Error::new(format!("Failed to update post: {}", e)))?;

        Ok(post)
    }

    async fn delete_post(&self, ctx: &Context<'_>, id: i32) -> Result<bool> {
        let pool = ctx.data::<PgPool>()?;

        let mut qb = QueryBuilder::<Postgres>::new("DELETE FROM posts WHERE id = ");
        qb.push_bind(id);

        let affected = qb
            .build()
            .execute(pool)
            .await
            .map_err(|e| async_graphql::Error::new(format!("Failed to delete post: {}", e)))?
            .rows_affected();

        Ok(affected > 0)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_user_filters_build_where_clause() {
        // Verifies WHERE clause generation for UserFilters
        let filters = UserFilters {
            id: Some(IntFilter {
                equals: Some(1),
                gt: None,
                lt: None,
                gte: None,
                lte: None,
            }),
            name: None,
            age: None,
            email: None,
            phone: None,
            and: None,
            or: None,
        };

        let (clause, params) = filters.build_where_clause();
        assert!(clause.contains("WHERE"));
        assert!(clause.contains("id = $1"));
        assert_eq!(params.len(), 1);
    }

    #[test]
    fn test_user_filters_multiple_conditions() {
        // Verifies multiple filter conditions combine correctly
        let filters = UserFilters {
            id: Some(IntFilter {
                equals: Some(1),
                gt: None,
                lt: None,
                gte: None,
                lte: None,
            }),
            name: Some(StringFilter {
                equals: Some("Test".to_string()),
                contains: None,
                starts_with: None,
                ends_with: None,
                contains_insensitive: None,
            }),
            age: None,
            email: None,
            phone: None,
            and: None,
            or: None,
        };

        let (clause, params) = filters.build_where_clause();
        assert!(clause.contains("id = $1"));
        assert!(clause.contains("name = $2"));
        assert_eq!(params.len(), 2);
    }

    #[test]
    fn test_user_filters_age_range() {
        // Verifies integer range filter behavior for UserFilters
        let filters = UserFilters {
            id: None,
            name: None,
            age: Some(IntFilter {
                equals: None,
                gt: Some(18),
                lt: Some(65),
                gte: None,
                lte: None,
            }),
            email: None,
            phone: None,
            and: None,
            or: None,
        };

        let (clause, params) = filters.build_where_clause();
        assert!(clause.contains("age > $1"));
        assert!(clause.contains("age < $2"));
        assert_eq!(params.len(), 2);
    }

    #[test]
    fn test_user_filters_string_contains() {
        // Verifies string contains filter behavior for UserFilters
        let filters = UserFilters {
            id: None,
            name: None,
            age: None,
            email: Some(StringFilter {
                equals: None,
                contains: Some("example".to_string()),
                starts_with: None,
                ends_with: None,
                contains_insensitive: None,
            }),
            phone: None,
            and: None,
            or: None,
        };

        let (clause, params) = filters.build_where_clause();
        assert!(clause.contains("email LIKE $1"));
        assert_eq!(params.len(), 1);
        assert!(params[0].as_str().unwrap().contains("%example%"));
    }

    #[test]
    fn test_user_filters_empty() {
        // Verifies that empty filters produce no WHERE clause
        let filters = UserFilters {
            id: None,
            name: None,
            age: None,
            email: None,
            phone: None,
            and: None,
            or: None,
        };

        let (clause, params) = filters.build_where_clause();
        assert_eq!(clause, "");
        assert_eq!(params.len(), 0);
    }

    #[test]
    fn test_post_filters_build_where_clause() {
        // Verifies WHERE clause generation for PostFilters
        let filters = PostFilters {
            id: Some(IntFilter {
                equals: Some(5),
                gt: None,
                lt: None,
                gte: None,
                lte: None,
            }),
            user_id: None,
            title: None,
            content: None,
            or: None,
        };

        let (clause, params) = filters.build_where_clause();
        assert!(clause.contains("WHERE"));
        assert!(clause.contains("id = $1"));
        assert_eq!(params.len(), 1);
    }

    #[test]
    fn test_post_filters_title_contains() {
        // Verifies string contains filter behavior for PostFilters
        let filters = PostFilters {
            id: None,
            user_id: None,
            title: Some(StringFilter {
                equals: None,
                contains: Some("Rust".to_string()),
                starts_with: None,
                ends_with: None,
                contains_insensitive: None,
            }),
            content: None,
            or: None,
        };

        let (clause, params) = filters.build_where_clause();
        assert!(clause.contains("title LIKE $1"));
        assert_eq!(params.len(), 1);
    }

    #[test]
    fn test_string_filter_contains_insensitive() {
        // Verifies case-insensitive string contains filter behavior
        let filters = UserFilters {
            id: None,
            name: Some(StringFilter {
                equals: None,
                contains: None,
                starts_with: None,
                ends_with: None,
                contains_insensitive: Some("test".to_string()),
            }),
            age: None,
            email: None,
            phone: None,
            and: None,
            or: None,
        };

        let (clause, params) = filters.build_where_clause();
        assert!(clause.contains("name ILIKE $1"));
        assert_eq!(params.len(), 1);
    }

    #[test]
    fn test_int_filter_gte() {
        // Verifies integer greater-than-or-equal (>=) filter behavior
        let filters = UserFilters {
            id: None,
            name: None,
            age: Some(IntFilter {
                equals: None,
                gt: None,
                lt: None,
                gte: Some(18),
                lte: None,
            }),
            email: None,
            phone: None,
            and: None,
            or: None,
        };

        let (clause, params) = filters.build_where_clause();
        assert!(clause.contains("age >= $1"));
        assert_eq!(params.len(), 1);
        assert_eq!(params[0].as_i64().unwrap(), 18);
    }

    #[test]
    fn test_int_filter_lte() {
        // Verifies integer less-than-or-equal (<=) filter behavior
        let filters = UserFilters {
            id: None,
            name: None,
            age: Some(IntFilter {
                equals: None,
                gt: None,
                lt: None,
                gte: None,
                lte: Some(65),
            }),
            email: None,
            phone: None,
            and: None,
            or: None,
        };

        let (clause, params) = filters.build_where_clause();
        assert!(clause.contains("age <= $1"));
        assert_eq!(params.len(), 1);
        assert_eq!(params[0].as_i64().unwrap(), 65);
    }

    #[test]
    fn test_int_filter_gte_and_lte() {
        // Verifies integer range filter behavior with both gte and lte
        let filters = UserFilters {
            id: None,
            name: None,
            age: Some(IntFilter {
                equals: None,
                gt: None,
                lt: None,
                gte: Some(18),
                lte: Some(65),
            }),
            email: None,
            phone: None,
            and: None,
            or: None,
        };

        let (clause, params) = filters.build_where_clause();
        assert!(clause.contains("age >= $1"));
        assert!(clause.contains("age <= $2"));
        assert_eq!(params.len(), 2);
        assert_eq!(params[0].as_i64().unwrap(), 18);
        assert_eq!(params[1].as_i64().unwrap(), 65);
    }

    #[test]
    fn test_string_filter_starts_with() {
        // Verifies WHERE clause generation for a single string starts_with filter
        let filters = UserFilters {
            id: None,
            name: Some(StringFilter {
                equals: None,
                contains: None,
                starts_with: Some("John".to_string()),
                ends_with: None,
                contains_insensitive: None,
            }),
            age: None,
            email: None,
            phone: None,
            and: None,
            or: None,
        };

        let (clause, params) = filters.build_where_clause();
        assert!(clause.contains("name LIKE $1"));
        assert_eq!(params.len(), 1);
        assert!(params[0].as_str().unwrap().starts_with("John"));
        assert!(params[0].as_str().unwrap().ends_with("%"));
        assert_eq!(params[0].as_str().unwrap(), "John%");
    }

    #[test]
    fn test_string_filter_ends_with() {
        // Verifies WHERE clause generation for a single string ends_with filter
        let filters = UserFilters {
            id: None,
            name: None,
            age: None,
            email: Some(StringFilter {
                equals: None,
                contains: None,
                starts_with: None,
                ends_with: Some(".com".to_string()),
                contains_insensitive: None,
            }),
            phone: None,
            and: None,
            or: None,
        };

        let (clause, params) = filters.build_where_clause();
        assert!(clause.contains("email LIKE $1"));
        assert_eq!(params.len(), 1);
        assert!(params[0].as_str().unwrap().starts_with("%"));
        assert!(params[0].as_str().unwrap().ends_with(".com"));
        assert_eq!(params[0].as_str().unwrap(), "%.com");
    }

    #[test]
    fn test_user_filters_or() {
        // Verifies nested OR conditions combine correctly across filters
        let filters = UserFilters {
            id: Some(IntFilter {
                equals: Some(1),
                gt: None,
                lt: None,
                gte: None,
                lte: None,
            }),
            name: None,
            age: None,
            email: None,
            phone: None,
            and: None,
            or: Some(vec![
                UserFilters {
                    id: Some(IntFilter {
                        equals: Some(2),
                        gt: None,
                        lt: None,
                        gte: None,
                        lte: None,
                    }),
                    name: None,
                    age: None,
                    email: None,
                    phone: None,
                    and: None,
                    or: None,
                },
                UserFilters {
                    id: None,
                    name: Some(StringFilter {
                        equals: Some("Test".to_string()),
                        contains: None,
                        starts_with: None,
                        ends_with: None,
                        contains_insensitive: None,
                    }),
                    age: None,
                    email: None,
                    phone: None,
                    and: None,
                    or: None,
                },
            ]),
        };

        let (clause, params) = filters.build_where_clause();
        assert!(clause.contains("WHERE"));
        assert!(clause.contains("id = $1"));
        assert!(clause.contains("OR"));
        assert!(clause.contains("(id = $2)"));
        assert!(clause.contains("(name = $3)"));
        assert_eq!(params.len(), 3);
    }

    #[test]
    fn test_post_filters_or() {
        // Ensures PostFilters handle OR conditions
        let filters = PostFilters {
            id: None,
            user_id: None,
            title: None,
            content: None,
            or: Some(vec![
                PostFilters {
                    id: Some(IntFilter {
                        equals: Some(1),
                        gt: None,
                        lt: None,
                        gte: None,
                        lte: None,
                    }),
                    user_id: None,
                    title: None,
                    content: None,
                    or: None,
                },
                PostFilters {
                    id: None,
                    user_id: Some(IntFilter {
                        equals: Some(2),
                        gt: None,
                        lt: None,
                        gte: None,
                        lte: None,
                    }),
                    title: None,
                    content: None,
                    or: None,
                },
            ]),
        };

        let (clause, params) = filters.build_where_clause();
        assert!(clause.contains("WHERE"));
        assert!(clause.contains("OR"));
        assert!(clause.contains("(id = $1)"));
        assert!(clause.contains("(user_id = $2)"));
        assert_eq!(params.len(), 2);
    }

    #[test]
    fn test_user_filters_and() {
        // Verifies WHERE clause generation for AND conditions
        let filters = UserFilters {
            id: Some(IntFilter {
                equals: Some(1),
                gt: None,
                lt: None,
                gte: None,
                lte: None,
            }),
            name: None,
            age: None,
            email: None,
            phone: None,
            and: Some(vec![
                UserFilters {
                    id: None,
                    name: Some(StringFilter {
                        equals: Some("John".to_string()),
                        contains: None,
                        starts_with: None,
                        ends_with: None,
                        contains_insensitive: None,
                    }),
                    age: None,
                    email: None,
                    phone: None,
                    and: None,
                    or: None,
                },
                UserFilters {
                    id: None,
                    name: None,
                    age: Some(IntFilter {
                        equals: Some(25),
                        gt: None,
                        lt: None,
                        gte: None,
                        lte: None,
                    }),
                    email: None,
                    phone: None,
                    and: None,
                    or: None,
                },
            ]),
            or: None,
        };

        let (clause, params) = filters.build_where_clause();
        assert!(clause.contains("WHERE"));
        assert!(clause.contains("id = $1"));
        assert!(clause.contains("AND"));
        assert!(clause.contains("(name = $2)"));
        assert!(clause.contains("(age = $3)"));
        assert_eq!(params.len(), 3);
    }
}
