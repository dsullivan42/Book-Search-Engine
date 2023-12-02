const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const path = require('path');
const { AuthMiddleware } = require('./utils/auth');
const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: AuthMiddleware,
});

const startApolloServer = async () => {
  await server.start();
  
  // the code below applies the Apollo server to the Express server as middleware
  app.use(express.urlencoded({ extended: true }));
  // the code below parses incoming JSON data
  app.use(express.json());
  // the code below applies the Apollo server to the Express server as middleware
  app.use('/graphql', expressMiddleware(server));

  // if we're in production, serve client/dist as static assets
  if (process.env.NODE_ENV === 'production') {
    // the code below serves the client/build directory if we're in production
    app.use(express.static(path.join(__dirname, '../client/dist')));

    // the code below serves the index.html file if we're in production
    app.get('*', (req, res) => {
      // the code below sends the index.html file
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }

db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
});
};

startApolloServer();
