// GraphQL mutation to create a post and return key fields with timestamps
import { gql } from "@apollo/client";

export const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      title
      content
      createdAt
      updatedAt
    }
  }
`;
