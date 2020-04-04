const graphqlHTTP = require('express-graphql');

const graphqlLogger = (shouldLog) => (req, res, next) => {
  if (!shouldLog) return next();
  graphqlHTTP.getGraphQLParams(req).then(({ query, variables, operationName }) => {
    res.on("finish", function () {
      const operation = operationName || 'no operation specified';
      console.log(
        "\x1b[36m%s%s\x1b[0m",
        `${new Date().toLocaleString("en-US")} - `,
        operation
      );
      console.group();
      if (query) console.log(query);
      if (variables) console.log("variables: ", variables);
      console.groupEnd();
    });
  });
  return next();
};

module.exports = {
  graphqlLogger
}