const mongoose = require('mongoose');
const Post = mongoose.model('Post');

const gql = require('graphql-tag');

const { PubSub } = require('graphql-subscriptions');
const pubsub = new PubSub();
const POST_ADDED = 'POST_ADDED';

const { retrievePrivateFile } = require('../../aws/s3');

const typeDefs = gql`
  type Post {
    _id: ID!
    title: String!
    description: String
    photo: String
  }
  extend type Query {
    posts: [Post]
    post(postId: ID!): Post
  }
  extend type Mutation {
    createPost(input: CreatePostInput): CreatePostResponse
  }
  input CreatePostInput {
    title: String!
    description: String
    photo: Upload
  }
  type CreatePostResponse {
    success: Boolean!
    message: String
    post: Post
  }
  extend type Subscription {
    postAdded: Post
  }
`;

const resolvers = {
  Query: {
    posts(_, __) {
      return Post.find({});
    },
    post(_, { postId }) {
      return Post.findById(postId);
    }
  },
  Mutation: {
    createPost: async (_, { input: { title, description, photo }}, context) => {
      console.log(context.headers);
      const post = new Post({ title, description });
      if (photo) await post.addPhoto(photo);
      await post.save();
      pubsub.publish(POST_ADDED, { postAdded: post });
      return {
        success: true,
        message: 'Successfully created Post',
        post
      };
    }
  },
  Subscription: {
    postAdded: {
      subscribe: () => pubsub.asyncIterator(POST_ADDED),
    },
  },
  Post: {
    photo(post) {
      return retrievePrivateFile(post.photo);
    }
  }
};

module.exports = {
  typeDefs,
  resolvers
}