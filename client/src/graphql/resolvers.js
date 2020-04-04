import gql from 'graphql-tag';

export const typeDefs = gql`
  extend type Query {
    isLoggedIn: Boolean!
  }
`;

export const resolvers = {
  Query: {
    isLoggedIn() {
      return !!localStorage.getItem('token');
    }
  }
}