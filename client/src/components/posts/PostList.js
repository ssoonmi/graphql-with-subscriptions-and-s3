import React from 'react';

export default ({ posts }) => {
  return (
    <ul>
      {posts && posts.map(post => {
        return (
          <li key={post._id}>
            {post.photo && <img src={post.photo} alt={post.title} />}
            <p>{post.title}</p>
            <p>{post.description}</p>
          </li>
        );
      })}
    </ul>
  );
};