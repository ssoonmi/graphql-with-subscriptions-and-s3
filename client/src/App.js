
import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import PostIndex from './pages/PostIndex';

export default () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" component={PostIndex} />
      </Switch>
    </BrowserRouter>
  );
};