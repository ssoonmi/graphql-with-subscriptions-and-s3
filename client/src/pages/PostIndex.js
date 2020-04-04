import React from 'react';
import PostList from '../components/posts/PostList';
import CreatePostForm from '../components/posts/CreatePostForm';

export default () => {
  return (
    <>
      <CreatePostForm />
      <PostList />
    </>
  );
};