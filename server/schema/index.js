const gql = require('graphql-tag');
const { merge } = require('lodash');
const { makeExecutableSchema } = require('graphql-tools');
const { GraphQLUpload } = require('graphql-upload');
const types = require('./types');

const otherTypeDefs = gql`
  type Query {
    _: String
    hello: String
  }
  type Mutation {
    _: String
  }
  type Subscription {
    _: String
  }
  scalar Upload
  schema {
    query: Query
    mutation: Mutation
    subscription: Subscription
  }
`;

const otherResolvers = {
  Query: {
    hello() {
      return 'Hello World!'
    }
  },
  Upload: GraphQLUpload
};

const typeDefs = [...types.map(type => type.typeDefs), otherTypeDefs];
const resolvers = merge(...types.map(type => type.resolvers), otherResolvers);

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

module.exports = {
  schema,
  typeDefs,
  resolvers
}