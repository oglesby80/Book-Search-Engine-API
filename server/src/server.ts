import express from 'express';
import path from 'node:path';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { json } from 'body-parser';
import dotenv from 'dotenv';
import db from './config/connection';
import routes from './routes';
import typeDefs from './schemas/typeDefs';
import resolvers from './schemas/resolvers';
import { authMiddleware } from './services/auth';

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3001;

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

async function startApolloServer() {
  await server.start();
  
  // Middleware for GraphQL with authentication context
  app.use('/graphql', json(), expressMiddleware(server, {
    context: async ({ req }) => authMiddleware({ req }),
  }));

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // Serve static assets in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));
  }

  // Fallback route for other server routes
  app.use(routes);

  // Connect to the database and start the server
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`🌍 Server listening on http://localhost:${PORT}`);
      console.log(`🚀 GraphQL available at http://localhost:${PORT}/graphql`);
    });
  });

  // Error handling for database connection issues
  db.on('error', (err) => {
    console.error('Database connection error:', err);
  });
}

startApolloServer();


