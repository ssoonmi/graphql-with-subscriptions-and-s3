import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { IS_LOGGED_IN, CURRENT_USER } from '../../graphql/users';

const MeComponent = ({ component: Component, ...otherProps }) => {
  const { data, loading, error } = useQuery(CURRENT_USER);
  
  if (loading || error || !data || !data.me) return null;

  if (data.me) return <Component {...otherProps} me={data.me} />
};

export default (props) => {
  const { data } = useQuery(IS_LOGGED_IN);

  if (data && data.isLoggedIn) return <MeComponent {...props} />;
  return null;
};