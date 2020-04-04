import React from 'react';
import UserPostList from '../components/users/UserPostList';
import NavBar from '../components/navbar/NavBar';

export default ({ match }) => {
  const userId = match.params.userId;
  return (
    <>
      <NavBar />
      <UserPostList userId={userId} />
    </>
  )
}