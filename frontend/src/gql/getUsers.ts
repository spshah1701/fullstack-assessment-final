/*
GraphQL query to fetch users with filters/pagination 
and their posts, including total count of users
*/
import { gql } from "@apollo/client";

export const GET_USERS_WITH_POSTS = gql`
query GetUsers($filters: UserFilters, $limit: Int, $offset: Int) {
  users(filters: $filters, limit: $limit, offset: $offset) {
    data {
      id
      name
      age
      email
      phone
      posts {
        id
        title
        content
        createdAt
        updatedAt
      }
    }
    totalCount
  }
}
`
