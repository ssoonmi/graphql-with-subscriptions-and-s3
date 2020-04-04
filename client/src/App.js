
import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import PostIndex from './pages/PostIndex';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserPostIndex from './pages/UserPostIndex';
import AuthRoute from './components/util/AuthRoute';

export default () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={PostIndex} />
        <AuthRoute path="/login" component={Login} />
        <AuthRoute path="/signup" component={Signup} />
        <Route path="/users/:userId" component={UserPostIndex} />
      </Switch>
    </BrowserRouter>
  );
};