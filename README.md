# Fullstack Take-Home Assignment

Welcome to our fullstack take-home assignment! This project consists of a React frontend with GraphQL integration and a Rust backend that provides a GraphQL API for managing users and posts data.

## Project Structure

```
├── backend/          # Rust GraphQL API server
├── frontend/         # React TypeScript application
└── sync/            # Development utilities
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- Rust (latest stable)
- Docker and Docker Compose
- PostgreSQL (or use Docker setup)

### Setup Instructions

1. **Start the Backend Services**

   ```bash
   cd backend
   docker-compose up -d  # Starts PostgreSQL database AND GraphQL backend server
   ```

   This will:

   - Start a PostgreSQL database on port 5432
   - Automatically run the `init.sql` script to set up the database schema and seed data
   - Start the GraphQL API server on port 8000
   - Both services will be ready when the health checks pass

   **Alternative Development Setup** (if you prefer to run the Rust server locally):

   ```bash
   # Start only the database
   docker-compose up -d postgres

   # Run the backend locally (requires DATABASE_URL environment variable)
   export DATABASE_URL="postgresql://postgres:password@localhost:5432/graphql_db"
   cargo run
   ```

2. **Start the Frontend**

   ```bash
   cd frontend
   npm install
   npm run dev          # Starts development server on port 5173
   ```

   The frontend is configured to connect to the GraphQL backend at `http://localhost:8000/graphql`

3. **Verify Setup**
   - Visit `http://localhost:8000/graphiql` to explore the GraphQL schema and test queries
   - The frontend will be available at `http://localhost:5173`
   - You should see users and posts data populated from the `init.sql` script

## Your Tasks

### Frontend Tasks

#### Required Tasks

1. **Complete the GenericCell component** (`src/components/table/cells/GenericCell.tsx`)

   - This component should handle rendering different data types appropriately
   - Consider how to display strings, numbers, dates, and other data types

2. **Implement Posts Column with Hover Details**

   - Add a "Posts" column to the table that displays the number of posts each user has
   - Create a hover component that shows post titles and content when hovering over the posts count
   - You'll need to query posts data using the available GraphQL endpoints

3. **Implement LoadingSpinner component**
   - `src/components/LoadingSpinner.tsx` - Show loading state with appropriate styling
   - Consider using Tailwind CSS for consistent styling

#### Frontend Technical Notes

- The project uses Apollo Client for GraphQL integration
- TypeScript is configured with strict type checking
- Tailwind CSS is available for styling
- The table component uses TanStack Table (React Table v8)
- If you make changes to GraphQL queries, run the code generation script: `npm run codegen`

### Backend Tasks

#### Required Tasks

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
   - Test your changes using the GraphQL playground at `http://localhost:8000/graphiql`
   - Ensure the field is queryable and properly typed

#### Backend Technical Notes

- The project uses async-graphql for GraphQL implementation
- SQLx is used for database interactions with PostgreSQL
- The FilterBuilder macro provides automatic filter generation
- Database queries support comprehensive filtering options

### Integration Tasks

1. **Frontend-Backend Integration**

   - Update frontend GraphQL queries to fetch the new post content field
   - Ensure the Posts column hover details display the new content
   - Test the end-to-end functionality

2. **Data Population**
   - Ensure existing posts have meaningful content in the new field
   - Consider how to handle posts that might not have content initially

## Available Scripts

### Frontend

- `npm run dev` - Start development server
- `npm run codegen` - Generate GraphQL types and hooks from schema
- `npm run lint` - Run ESLint
- `npm run build` - Build for production

### Backend

- `cargo run` - Start the GraphQL server
- `cargo test` - Run tests
- `docker-compose up -d` - Start PostgreSQL database
- `docker-compose down` - Stop database

## GraphQL Schema Reference

The API provides `users` and `posts` queries with comprehensive filtering options. Key entities:

- **Users**: Contains user information (id, name, age, email, phone, timestamps)
- **Posts**: Contains post information (id, user_id, title, timestamps, and more...)

You can explore the full schema, available fields, and filter types by visiting the GraphQL playground at `http://localhost:8000/graphiql`.

### Example Queries

```graphql
# Get all users
query GetUsers {
  users {
    id
    name
    email
    age
  }
}

# Get posts with filtering
query GetPosts($filters: PostFilters) {
  posts(filters: $filters) {
    id
    title
    user_id
  }
}
```

## Evaluation Criteria

### Code Quality

- Clean, readable, and well-organized code
- Proper error handling and edge case management
- Consistent coding patterns and conventions

### Technical Implementation

- TypeScript usage and type safety (frontend)
- Rust best practices and safety (backend)
- Proper GraphQL schema design and query optimization
- Database schema design and data integrity

### Architecture & Design

- Component reusability and design patterns
- Separation of concerns between frontend and backend
- Scalable and maintainable code structure
- Proper abstraction layers

### User Experience

- Intuitive and responsive user interface
- Appropriate loading states and error handling
- Smooth interactions and hover effects
- Mobile-friendly design considerations

## Development Tips

1. **Start with the Backend**: Implement your data model changes first, then update the frontend
2. **Use the GraphQL Playground**: Test your queries and mutations before implementing frontend code
3. **Type Safety**: Leverage TypeScript and Rust's type systems for better development experience
4. **Incremental Development**: Make small changes and test frequently
5. **Database Migrations**: Schema changes are additive; you don't need to worry about backwards compatibility

## Troubleshooting

- **Database Connection Issues**:
  - Ensure both services are running: `docker-compose up -d`
  - Check service health: `docker-compose ps`
  - View logs: `docker-compose logs postgres` or `docker-compose logs backend`
- **Database Schema Issues**: The `init.sql` script should run automatically on first startup. If you need to reset the database:
  ```bash
  docker-compose down -v  # Removes volumes
  docker-compose up -d    # Recreates database with fresh schema
  ```
- **GraphQL Schema Errors**: Run `npm run codegen` in the frontend after making backend changes
- **CORS Issues**: The backend is configured to allow frontend connections
- **Port Conflicts**:
  - Backend runs on 8000, frontend on 5173, PostgreSQL on 5432
  - Ensure these ports are available or modify docker-compose.yml accordingly

Good luck! Feel free to make improvements beyond the required tasks if you see opportunities to enhance the application.
