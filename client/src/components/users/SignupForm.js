import React, { useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { useHistory } from 'react-router-dom';

import gql from 'graphql-tag';

const SIGNUP_USER = gql`
mutation SignupUser($input: UserInput) {
  signup(input: $input) {
    _id
    username
    token
  }
}
`;

export default () => {
  const history = useHistory();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [signup, { loading }] = useMutation(
    SIGNUP_USER,
    {
      variables: {
        input: {
          username,
          password
        }
      },
      update(cache, { data: { signup } }) {
        localStorage.setItem('token', signup.token);
        cache.writeData({ data: { isLoggedIn: true } });
        history.push(`/users/${signup._id}`);
      }
    }
  )
  return (
    <form onSubmit={e => {
      e.preventDefault();
      signup();
    }}>
      <label>
        Username
        <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
      </label>
      <label>
        Password
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      </label>
      <input type="submit" value="Log In" disabled={loading} />
    </form>
  )
}