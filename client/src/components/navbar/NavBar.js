import React from 'react';
import ProtectedComponent from '../util/ProtectedComponent';
import AuthComponent from '../util/AuthComponent';
import LogoutButton from '../users/LogoutButton';
import { Link } from 'react-router-dom';

export default () => (
  <nav>
    <ul>
      <li>
        <Link to="/">Home</Link>
      </li>
      <AuthComponent component={() => (
        <>
          <li>
            <Link to="/login">Log In</Link>
          </li>
          <li>
            <Link to="/signup">Sign Up</Link>
          </li>
        </>
      )} />
      <ProtectedComponent component={({ me }) => (
        <>
          <li>
            <Link to={`/users/${me._id}`}>Profile</Link>
          </li>
          <li>
            <LogoutButton />
          </li>
        </>
      )} />
    </ul>

  </nav>
);