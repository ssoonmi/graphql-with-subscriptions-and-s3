import gql from 'graphql-tag';

export const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput) {
    createPost(input: $input) {
      success
      message
      post {
        _id
        title
        description
        photo
      }
    }
  }
`;

export const GET_POSTS = gql`
  query GetPosts {
    posts {
      _id
      title
      description
      photo
    }
  }
`;

export const POST_SUBSCRIPTION = gql`
  subscription OnPostAdded {
    postAdded {
      _id
      title
      description
      photo
    }
  }
`;