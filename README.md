# Subscriptions with Express-GraphQL and Apollo Client

A `subscription` is another type of GraphQL request on top of `query` and `mutation`. Subscriptions in GraphQL should be sent using websockets instead of HTTP requests.

A websocket is a long-term connection between a server and a client vs HTTP requests which end once the client receives the request from the server. 

A server can continuously push information from server to client over an established WebSocket connection. Whereas, the server can only send information if the client specifically asks for it. For this reason, websockets are primarily used for sending real-time information.

To make a WebSocket connection using GraphQL, we need to make our client to listen to specific information from our server by `subscribing`.

## Set Up

Set up your Express-GraphQL server and React App using `creat-react-app` with Apollo Client before starting the following set up.

### Install Dependencies on the Server

`npm install` the following in your server:

- graphql-subscriptions
- subscriptions-transport-ws - Create a WebSocket connection for GraphQL subscriptions

### Install Dependencies on the Client

`npm install` the following in your client:

- apollo-link-ws

### Server Set Up

We need to make two different servers, an HTTP and a WebSocket server. To do this, we are going to use `SubscriptionServer` from `subscriptions-transport-ws` to create our WebSocket server and the `createServer` function from the built-in `http` package to start both the WebSocket server and our HTTP server.

Import the following at the top of your server entry file.

```javascript
// server/index.js
const { execute, subscribe } = require('graphql');
const { createServer } = require('http');
const { SubscriptionServer } = require('subscriptions-transport-ws');
```

Then, instead of the `/graphql` route and `app.listen` function we have defined, we are going to replace it with:

```javascript
// server/index.js
// ...
const PORT = process.env.PORT || 5000;
const subscriptionsEndpoint = `ws://localhost:${PORT}/subscriptions`;

app.use(
  '/graphql',
  graphqlLogger(true),
  graphqlHTTP({
    schema,
    rootValue: resolvers,
    subscriptionsEndpoint: subscriptionsEndpoint
  })
);

app.get('/playground', expressPlayground({ endpoint: '/graphql' }));

// Create listener server by wrapping express app
const webServer = createServer(app);

webServer.listen(PORT, () => {
  console.log(`GraphQL Server is now running on http://localhost:${PORT}`);

  // Set up the WebSocket for handling GraphQL subscriptions.
  new SubscriptionServer({
    execute,
    subscribe,
    schema
  }, {
    server: webServer,
    path: '/subscriptions',
  });
});
```

We need to set up the WebSocket for handling GraphQL subscriptions. The subscriptions will be made the the `subscriptionsEndpoint` at `ws://localhost:5000/subscriptions`. We added that as an option to the `/graphql` route and as a path to the `new SubscriptionServer`.

### Client Set Up

We finished setting up our server for subscriptions, so let's set up the client. In your file for creating your client, you will want to import the following: 

```javascript
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { ApolloLink, split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';
import { setContext } from 'apollo-link-context';
import { onError } from "apollo-link-error";
import { ApolloClient } from 'apollo-client';
```

Now, we need to make a link for our WebSocket using `WebSocketLink` from `apollo-link-ws`, on top of our existing `HttpLink`. To be able to use both, we need to use `split` from `apollo-link` to route a `subscription` to the WebSocket link, and a `query` or `mutation` to the HTTP link. 

Define your client like so:

```javascript
//...

const cache = new InMemoryCache({ dataIdFromObject: object => object._id });

// Create an http link:
const httpLink = new HttpLink({
  uri: 'http://localhost:5000/graphql'
});

// Create a WebSocket link:
const wsLink = new WebSocketLink({
  uri: `ws://localhost:5000/subscriptions`,
  options: {
    reconnect: true
  }
});

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const serverLink = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      authorization: localStorage.getItem('token')
    }
  };
});

const errorLink = onError(({ networkError, graphQLErrors }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.group("\x1b[31m%s\x1b[0m", "[GraphQL error] ", "Message: ", message);
      console.log("Location: ", locations);
      console.log("Path: ", path);
      console.log("Extensions: ", extensions)
      console.groupEnd();
    });
  }
  if (networkError) console.log("\x1b[31m%s\x1b[0m", "[Network error]:", networkError);
});

const client = new ApolloClient({
  cache,
  link: ApolloLink.from([authLink.concat(errorLink), serverLink])
});
```

## Making a Subscription

In this example, we will be creating a GraphQL `subscription` to listen for any new `Post`s and `publish`ing any created `Post`s to that GraphQL subscription when a new `Post` gets created.

### `subscribe`

To create the connection between server and client, we need the client to `subscribe` to our server. There can be many different subscriptions happening between our client and our server. To distinguish them, we will be using `PubSub` from `graphql-subscriptions`.

Just like how we have a `Query` and `Mutation` types, we also have a `Subscription` type which can have fields and values. We will make a `Subscription` type with a field of `postAdded` and a value of `Post` type.

Our schema will look like this:

```graphql
type Post {
  _id: ID!
  title: String!
  description: String
}
type Query {
  posts: [Post]
}
type Mutation {
  createPost(input: CreatePostInput): CreatePostResponse
}
input CreatePostInput {
  title: String!
  description: String
}
type CreatePostResponse {
  success: Boolean!
  message: String
  post: Post
}
type Subscription {
  postAdded: Post
}
schema {
  query: Query
  mutation: Mutation
  subscription: Subscription
}
```

Our resolvers will look like this:

```javascript
const { PubSub } = require('graphql-subscriptions');
const pubsub = new PubSub();
const POST_ADDED = 'POST_ADDED';

const resolvers = {
  Query: {
    posts(_, __) {
      return Post.find({});
    }
  },
  Mutation: {
    createPost: async (_, { input: { title, description, photo }}, context) => {
      console.log(context.headers);
      const post = new Post({ title, description });
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
  }
};
```

# AWS S3 with Express-GraphQL and Apollo Client

## Set Up

### Install Dependencies on the Server

`npm install` the following in your server:

- aws-sdk
- graphql
- graphql-upload

### Install Dependencies on the Client

`npm install` the following in your client:

- apollo-upload-client