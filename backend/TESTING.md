# Testing & Setup Guide

## Running the Project

1. **Start PostgreSQL**:

   ```bash
   docker-compose up -d postgres
   ```

2. **Initialize Database**:

   ```bash
   docker exec -i postgres-db psql -U postgres -d graphql_db < init.sql
   ```

3. **Run Server**:

   ```bash
   # Using Docker
   docker-compose up --build

   # Or locally
   DATABASE_URL=postgres://postgres:password@localhost:5432/graphql_db cargo run
   ```

## Test Database Configuration

### Option 1: Separate test database in the same PostgreSQL instance (recommended)

1. **Ensure PostgreSQL is running**:

   ```bash
   docker-compose up -d postgres
   ```

2. **Export the test database URL** (pointing to a different database name):

   ```bash
   export TEST_DATABASE_URL=postgres://postgres:password@localhost:5432/graphql_test_db
   ```

3. **Create the test database**:

   ```bash
   docker exec -i postgres-db psql -U postgres -c "CREATE DATABASE graphql_test_db;"
   ```

4. **Verify it was created**:

   ```bash
   docker exec -i postgres-db psql -U postgres -c "\l" | grep graphql
   ```

   The test database is ready. Tests will use `graphql_test_db` while the main app uses `graphql_db`.

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

The `resolvers.rs` file contains unit tests (in `#[cfg(test)]` module) that test filter logic without requiring a database:

Run all unit tests in `resolvers.rs`:

```bash
cargo test resolvers::tests -- --test-threads=1
```

**Important**: Always use `--test-threads=1` to prevent database connection conflicts for integration tests.

## Running Frontend Tests

Navigate to frontend directory:

```bash
cd ../frontend
```

Run all frontend tests:

```bash
npm run test
```
