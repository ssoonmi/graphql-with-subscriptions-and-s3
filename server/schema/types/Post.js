const mongoose = require('mongoose');
const User = mongoose.model('User');
const Post = mongoose.model('Post');

const gql = require('graphql-tag');

const { PubSub, withFilter } = require('graphql-subscriptions');
const pubsub = new PubSub();
const POST_ADDED = 'POST_ADDED';

const { retrievePrivateFile } = require('../../aws/s3');

const typeDefs = gql`
  type Post {
    _id: ID!
    title: String!
    description: String
    photo: String
    author: User
  }
  extend type Query {
    posts(userId: ID): [Post]
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
    postAdded(userId: ID): Post
  }
`;

const resolvers = {
  Query: {
    posts(_, { userId }) {
      if (!userId) return Post.find({});
      return Post.find({ author: mongoose.Types.ObjectId(userId) })
    },
    post(_, { postId }) {
      return Post.findById(postId);
    }
  },
  Mutation: {
    createPost: async (_, { input: { title, description, photo }}, context) => {
      if (!context.user) throw new Error('Need to be logged in');
      const post = new Post({ title, description, author: context.user._id });
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
      subscribe: withFilter(() => pubsub.asyncIterator(POST_ADDED), ({ postAdded: post }, { userId }) => {
        if (!userId) return true;
        return post.author.toString() === userId;
      })
    },
  },
  Post: {
    photo(post) {
      return retrievePrivateFile(post.photo);
    },
    author: async (post, _) => {
      await post.populate('author').execPopulate();
      return post.author;
    }
  }
};

module.exports = {
  typeDefs,
  resolvers
}