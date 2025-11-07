// GraphQL mutation to delete a post by ID; returns a boolean
import { gql } from "@apollo/client";

export const DELETE_POST = gql`
  mutation DeletePost($id: Int!) {
    deletePost(id: $id)
  }
`;
