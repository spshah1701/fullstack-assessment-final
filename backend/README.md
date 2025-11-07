# GraphQL Rust Backend

A GraphQL API server built with Rust using async-graphql, Axum, and PostgreSQL.

## Features

- **GraphQL API** with schema introspection
- **PostgreSQL integration** with SQLx
- **Advanced filtering** using custom procedural macros
- **Relational data support** with user-post relationships
- **CORS support** for frontend integration
- **GraphiQL interface** for API exploration

## Tech Stack

- **Rust** - Systems programming language
- **async-graphql** - GraphQL server implementation
- **Axum** - Web framework
- **SQLx** - Async SQL toolkit
- **PostgreSQL** - Database
- **tower-http** - HTTP middleware

## Project Structure

```
src/
├── main.rs          # Application entry point and routing
├── resolvers.rs     # GraphQL resolvers and schema definitions
├── cors.rs          # CORS middleware configuration
├── lib.rs           # Custom procedural macros for filter building
└── db.rs            # Database utilities
```

## Database Schema

### Users Table
- `id` - Primary key
- `name` - User's full name
- `age` - User's age
- `email` - Unique email address
- `phone` - Phone number
- `created_at` / `updated_at` - Timestamps

### Posts Table
- `id` - Primary key
- `user_id` - Foreign key to users table
- `title` - Post title
- `created_at` / `updated_at` - Timestamps

## Setup

1. **Start PostgreSQL** (using Docker):
   ```bash
   docker-compose up -d postgres
   ```

2. **Initialize Database**:
   ```bash
   # Connect to database and run init.sql
   docker exec -i postgres-db psql -U postgres -d graphql_db < init.sql
   ```

3. **Run the Server**:

   **Option A: Using Docker (Recommended)**:
   ```bash
   docker-compose up --build
   ```

   **Option B: Using Cargo (Alternative)**:
   ```bash
   # Start only PostgreSQL with Docker
   docker-compose up -d postgres
   
   # Run the Rust server locally
   DATABASE_URL=postgres://postgres:password@localhost:5432/graphql_db cargo run
   ```

   **For AWS/Cloud deployment**: Ensure your security group allows inbound traffic on port 8000.

## Endpoints

- **GraphQL API**: `POST http://localhost:8000/graphql`
- **GraphiQL IDE**: `GET http://localhost:8000/graphiql`

## GraphQL Features

### Basic Queries

```graphql
# Get all users
query {
  users {
    id
    name
    email
  }
}

# Get all posts
query {
  posts {
    id
    title
  }
}
```

### Filtering

```graphql
# Filter users by name and age
query {
  users(filters: {
    name: { someFilter: "John" }
  }) {
    name
  }
}
```

### Filter Operators

Available filter operators for each type can be found by exploring the GraphQL schema in GraphiQL at `http://localhost:8000/graphiql`.

## Your Tasks

### Required Tasks

1. **Extend the Posts Data Model**
   - The `Post` struct in `src/resolvers.rs` currently has basic fields
   - You need to add a new field to store post content/body text
   - Consider what data type is most appropriate for storing longer text content

2. **Update Database Schema**
   - Ensure your database schema supports the new field you're adding
   - The `init.sql` file contains the initial database setup
   - Consider how existing posts should handle the new field

3. **Update GraphQL Schema**
   - Make sure your new field is exposed through the GraphQL API
   - Test your changes using the GraphQL playground at `http://localhost:8000/graphql`
   - Ensure the field is queryable and properly typed

### Technical Notes
- The project uses async-graphql for GraphQL implementation
- SQLx is used for database interactions with PostgreSQL
- The FilterBuilder macro provides automatic filter generation
- Database queries support comprehensive filtering options

## Development

### CORS Configuration

The server is configured to accept requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:8000` (same-origin for GraphiQL)

### Database Connection

The server expects a `DATABASE_URL` environment variable or defaults to:
```
postgres://postgres:password@localhost:5432/graphql_db
```

### Database GUI Connection

To connect with database GUI tools (pgAdmin, DBeaver, etc.):
- **Host**: `localhost` (or your VM's IP address)
- **Port**: `5432`
- **Database**: `graphql_db`
- **Username**: `postgres`
- **Password**: `password`
- **Connection String**: `postgres://postgres:password@localhost:5432/graphql_db`

## Sample Data

The database includes sample users and posts for testing:
- **John Doe** - 3 posts about Rust programming
- **Jane Smith** - 3 posts about web development
- **Bob Johnson** - 4 posts about DevOps

## Documentation

For advanced GraphQL features like nested resolvers and relational queries, see the [async-graphql documentation](https://async-graphql.github.io/async-graphql/en/index.html).

## Architecture Notes

- **Type Safety**: Full compile-time type checking with Rust and SQLx
- **SQL Injection Protection**: Uses parameterized queries throughout
- **Custom Macros**: Procedural macros for automatic filter generation

Diagrams for reference:
## System Architecture
![System Architecture](./diagrams/architecture_diag.png)

## ERD
![ERD](./diagrams/erd_diag.png)