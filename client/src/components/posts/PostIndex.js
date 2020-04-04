import React from 'react';
import { useQuery, useSubscription } from '@apollo/react-hooks';
import { GET_POSTS, POST_SUBSCRIPTION } from '../../graphql/posts';
import PostList from './PostList';

export default () => {
  const { data, loading, error } = useQuery(
    GET_POSTS,
    {
      fetchPolicy: 'cache-and-network'
    }
  );
  useSubscription(
    POST_SUBSCRIPTION,
    {
      onSubscriptionData({ subscriptionData: { data: { postAdded } }, client }) {
        if (!postAdded) return;
        const posts = data.posts.concat([postAdded]);
        client.writeQuery({ query: GET_POSTS, data: { posts } });
      }
    }
  );

  if (loading) return <p>Loading...</p>
  if (error) return <p>ERROR</p>

  return data && data.posts && <PostList posts={data.posts} />
}