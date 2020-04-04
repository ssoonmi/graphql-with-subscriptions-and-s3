const mongoose = require('mongoose');
const gql = require('graphql-tag');

const User = mongoose.model('User');
const Post = mongoose.model('Post');

const typeDefs = gql`
type User {
  _id: ID!
  username: String!
}
type UserCredentials {
  _id: ID!
  username: String!
  token: String
}
extend type Query {
  me: User
}
extend type Mutation {
  signup(input: UserInput): UserCredentials
  login(input: UserInput): UserCredentials
}
input UserInput {
  username: String!
  password: String!
}
`;

const resolvers = {
  Query: {
    me(_, __, context) {
      return context.user;
    }
  },
  Mutation: {
    login(_, { input: { username, password } }) {
      return User.login(username, password);
    },
    signup(_, { input: { username, password } }) {
      return User.signup(username, password);
    }
  }
}

module.exports = {
  typeDefs,
  resolvers
}