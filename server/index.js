const express = require('express');
const mongoose = require('mongoose');
require('./models');
const morgan = require("morgan");
const graphqlHTTP = require('express-graphql');
const { graphqlUploadExpress } = require('graphql-upload');
const { graphqlLogger } = require('./middlewares');

const { execute, subscribe } = require('graphql');
const { createServer } = require('http');
const { SubscriptionServer } = require('subscriptions-transport-ws');

const expressPlayground = require('graphql-playground-middleware-express').default;
const { schema, resolvers } = require('./schema');
const db = require('./config/keys').mongoURI;

mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
  .then(() => console.log('Connected to Mongoose successfully'))
  .catch((e) => console.log(`Could not connect to mongoose with "${db}" Mongo URI string`, e));

const app = express();
app.use(morgan("dev"));

if (process.env.NODE_ENV !== 'production') {
  const cors = require('cors');
  app.use(cors({ origin: 'http://localhost:3000' }));
}

const PORT = process.env.PORT || 5000;
const subscriptionsEndpoint = `ws://localhost:${PORT}/subscriptions`;

app.use(
  '/graphql',
  graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }),
  graphqlLogger(true),
  graphqlHTTP({
    schema,
    rootValue: resolvers,
    subscriptionsEndpoint: subscriptionsEndpoint
  })
);

app.get('/playground', expressPlayground({ endpoint: '/graphql' }));

app.get('/hello', (req, res) => res.send('Hello World!'));

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