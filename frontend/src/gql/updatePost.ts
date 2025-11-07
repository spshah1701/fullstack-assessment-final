/*
GraphQL mutation to update a post 
and return the modified fields with the latest timestamp
*/
import { gql } from "@apollo/client";

export const UPDATE_POST = gql`
  mutation UpdatePost($input: UpdatePostInput!) {
    updatePost(input: $input) {
      id
      title
      content
      updatedAt
    }
  }
`;
