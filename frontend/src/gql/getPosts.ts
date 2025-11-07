/*
GraphQL query to fetch posts with filters/pagination and the author's name
including total count of posts
*/
import { gql } from "@apollo/client";

export const GET_POSTS = gql`
    query GetPosts($filters: PostFilters, $limit: Int, $offset: Int) {
        posts(filters: $filters, limit: $limit, offset: $offset) {
            data {
                id
                title
                content
                createdAt
                updatedAt
                user {
                    name
                }
            }
            totalCount
        }
    }
`;
