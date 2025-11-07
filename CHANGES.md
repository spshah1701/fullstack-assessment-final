# Changes Summary

## Frontend Enhancements

### Tab Switcher

- Two-tab interface: **Users** (default) and **Posts** with clear active state indicators.

### Users Tab

**Search & Filters**

- Single search box matching name, phone, or email (case-insensitive, partial matching).
- Live search with debouncing for real-time filtering as user types.
- Age filter with operator selection (`=`, `>=`, `>`, `<=`, `<`) and input validation.
- Combined filtering: text search + age filter via GraphQL AND conditions.
- **Clear** button resets search, operator, age value, and restores default sort.
- **Search** button executes current query.

**Data Table**

- Columns: ID, Name, Age, Email, Phone, Posts.
- Sortable headers with ▲/▼ indicators for all columns.
- Email column opens native mail app via `mailto:` links.
- Posts counter badge showing number of posts per user.
- Hover panel reveals user's posts (title + content placeholder if empty).
- Row "+" button opens Create Post modal for that user.

**Post Modal** (Create / View / Edit / Delete)

- Header displays: "Hello, {UserName}! Edit your post!".
- Fields: Title (live counter, 50 char limit, required) and Content (multiline).
- Read-only timestamps: Created on and Last updated.
- Delete requires confirmation to prevent accidental removal.
- Title validation with inline error ("Title cannot be empty").
- Live character count display (e.g., 23/50).

**Validation & Feedback**

- Non-blocking toasts for all actions: "Post created", "Post updated", "Post deleted".
- Inline validation errors for empty titles.

### Posts Tab

**Search**

- Single search box matching title or content.
- Live search with debouncing for real-time filtering as user types.
- Clear and Search buttons mirror Users tab behavior.

**Data Table**

- Columns: ID, Title, Content, Author, Created, Edited.
- "Edited" column indicates if post was modified since creation.
- Sortable headers on all columns except "Edited".
- Rows are clickable to view post details in modal.
- Clicking a row opens the post modal with title, content and timestamps.

### Pagination & Sorting (Both Tabs)

- Offset-based pagination: 10 records per page.
- Controls: First («), Previous (<), Next (>), Last (») with disabled states at boundaries.
- Page indicator (e.g., "Page 1").
- Clicking headers toggles ascending/descending order.
- Visual ▲/▼ indicators persist across pages.

### User Experience

- Consistent spacing, hover states, and button styles across tabs.
- Smooth transitions and responsive design.
- Safe-delete confirmation dialog.
- Mail links use `mailto:` scheme.

---

## Backend Improvements

### GraphQL Schema

- Added `content: String` field to Post model.
- Logical operators (`and`/`or`) for nested and combined filtering.
- Case-insensitive string matching (`containsInsensitive`) using `ILIKE`.

### Query Resolvers

- Updated `users` and `posts` queries with `filters`, `limit`, and `offset` arguments.
- Safe pagination defaults and clamping (min: 1, max: 200).
- Results sorted by `id ASC` (users) and `created_at DESC` (posts).
- Dynamic SQL filtering with macro-generated WHERE clauses.

### Mutation Operations

- `createPost`, `updatePost`, `deletePost` mutations.
- SQLx parameter binding for security and maintainability.
- Proper error handling and validation.

### Filter Builder

- Procedural macro for automatic SQL WHERE clause generation.
- Support for AND/OR logical combinations.

---

## Testing

### Backend Tests

- 96 tests covering GraphQL resolvers, database queries, filter builders, and mutation operations.

### Unit Tests

- 16 unit tests for filter builder macro functionality, validating SQL WHERE clause generation.
- Validates nested AND/OR filter combinations and parameter binding correctness.

### Query Tests

- Basic user and post queries without filters.
- Pagination edge cases (limit=0, limit exceeding max, offset beyond total).
- Filter combinations (ID, name, email, phone, age).
- Case-insensitive string matching.
- Nested AND/OR filter conditions.

### Mutation Tests

- Create post with valid and invalid inputs.
- Update post fields (title, content).
- Delete post operations.
- Error handling for invalid mutations.

### Integration Tests

- GraphQL schema execution and response validation.
- Database query correctness.
- Relationship queries (users with posts, posts with users).
- Total count accuracy across filtered and paginated results.

### Frontend Tests

- Added 49 tests covering core UI components and interactions.
- Boundary testing for age input validation (rejects values below 0 and above 150).
- Unit tests for utility functions.
- Custom hooks testing.
- Interaction testing for tab switching, pagination navigation, and search functionality.
- Validation testing for input handling, dropdown selection, and form clearing using Vitest and React Testing Library.
---

## Impact

These updates significantly improve user experience, frontend performance, and code maintainability. The application now provides robust search, filtering, sorting, and pagination capabilities with comprehensive backend support and thorough test coverage.
