import React from 'react';
import PostIndex from '../components/posts/PostIndex';
import CreatePostForm from '../components/posts/CreatePostForm';
import ProtectedComponent from '../components/util/ProtectedComponent';
import NavBar from '../components/navbar/NavBar';

export default () => {
  return (
    <>
      <NavBar />
      <ProtectedComponent component={CreatePostForm} />
      <PostIndex />
    </>
  );
};