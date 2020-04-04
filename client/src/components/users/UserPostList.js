import React from 'react';
import { useQuery, useSubscription } from '@apollo/react-hooks';

import gql from 'graphql-tag';
import PostList from '../posts/PostList';

const GET_USER_POSTS = gql`
  query GetUserPosts($userId: ID!) {
    posts(userId: $userId) {
      _id
      title
      description
      photo
    }
  }
`;

export const USER_POST_SUBSCRIPTION = gql`
  subscription OnUserPostAdded($userId: ID!) {
    postAdded(userId: $userId) {
      _id
      title
      description
      photo
    }
  }
`;

export default ({ userId }) => {
  const { data, loading, error } = useQuery(
    GET_USER_POSTS,
   {
      variables: { userId },
      fetchPolicy: 'cache-and-network'
    }
  );
  useSubscription(
    USER_POST_SUBSCRIPTION,
    {
      variables: { userId },
      onSubscriptionData({ subscriptionData: { data: { postAdded } }, client }) {
        if (!postAdded) return;
        const posts = data.posts.concat([postAdded]);
        client.writeQuery({ query: GET_USER_POSTS, variables: { userId }, data: { posts } });
      }
    }
  );

  if (loading) return <p>Loading...</p>
  if (error) return <p>ERROR</p>

  return data && data.posts && <PostList posts={data.posts} />
}