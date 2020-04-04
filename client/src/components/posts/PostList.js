import React from 'react';
import { useQuery, useSubscription } from '@apollo/react-hooks';
import { GET_POSTS, POST_SUBSCRIPTION } from '../../graphql/posts';

export default () => {
  const { data, loading, error } = useQuery(GET_POSTS);
  useSubscription(
    POST_SUBSCRIPTION,
    {
      onSubscriptionData({ subscriptionData: { data: { postAdded }}, client }) {
        if (!postAdded) return;
        const posts = data.posts.concat([postAdded]);
        client.writeQuery({ query: GET_POSTS, data: { posts } });
      }
    }
  );

  if (loading) return <p>Loading...</p>
  if (error) return <p>ERROR</p>

  return (
    <ul>
      {data && data.posts && data.posts.map(post => {
        return (
          <li key={post._id}>
            {post.photo && <img src={post.photo} alt={post.title} />}
            <p>{post.title}</p>
            <p>{post.description}</p>
          </li>
        );
      })}
    </ul>
  )
}