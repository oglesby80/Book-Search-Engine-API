import express from 'express';
import path from 'node:path';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { json } from 'body-parser';
import db from './config/connection';
import routes from './routes';
import typeDefs from './schemas/typeDefs';
import resolvers from './schemas/resolvers';
import { authMiddleware } from './services/auth';

const app = express();
const PORT = process.env.PORT || 3001;

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

async function startApolloServer() {
  await server.start();
  app.use('/graphql', json(), expressMiddleware(server, {
    context: async ({ req }) => authMiddleware({ req }),
  }));

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
  }

  app.use(routes);

  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`🌍 Server listening on http://localhost:${PORT}`);
      console.log(`🚀 GraphQL available at http://localhost:${PORT}/graphql`);
    });
  });
}

startApolloServer();

