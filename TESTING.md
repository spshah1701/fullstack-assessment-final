# Testing and Setup Guide

## Backend and Test Database Setup

1. **Navigate to backend directory**:

   ```bash
   cd backend
   ```

2. **Export Database URLs**:

   ```bash
   export DATABASE_URL="postgresql://postgres:password@localhost:5432/graphql_db"
   export TEST_DATABASE_URL="postgres://postgres:password@localhost:5432/graphql_test_db"
   ```

3. **Start the database**:
   ```bash
   docker-compose up -d postgres # Start the database
   ```

4. **Create the test database**:

   ```bash
   docker exec -i postgres-db psql -U postgres -c "CREATE DATABASE graphql_test_db;"
   ```

5. **Verify it was created**:

   ```bash
   docker exec -i postgres-db psql -U postgres -c "\l" | grep graphql
   ```

   The test database is ready. Tests will use `graphql_test_db` while the main app uses `graphql_db`.

6. **Start the backend server**:

   ```bash
   cargo run
   ```

## Running Backend Tests

Run all tests (single-threaded):

```bash
cargo test -- --test-threads=1
```

Run specific test file:

```bash
cargo test --test test_users_queries -- --test-threads=1
cargo test --test test_posts_mutations -- --test-threads=1
```

The `resolvers.rs` file contains unit tests (in `#[cfg(test)]` module) that test filter logic without requiring a database.

Run all unit tests in `resolvers.rs`:

```bash
cargo test resolvers::tests -- --test-threads=1
```

**Important**: Use --test-threads=1 to run integration tests sequentially and avoid database conflicts.

## Running Frontend Tests

Navigate to frontend directory:

```bash
cd frontend
```

Run all frontend tests:

```bash
npm run test
```

Run a specific test(mention file path):
```bash
npm run test -- __tests__/utils/sorting.test.ts
```
