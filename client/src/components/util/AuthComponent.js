import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { IS_LOGGED_IN } from '../../graphql/users';

export default ({ component: Component, ...otherProps }) => {
  const { data } = useQuery(IS_LOGGED_IN);
  
  if (data && !data.isLoggedIn) return <Component {...otherProps} />;
  return null;
}