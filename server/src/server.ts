import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import typeDefs from './schemas/typeDefs.js';
import resolvers from './schemas/resolvers.js';
import { authMiddleware } from './services/auth.js';
import dbConnection from './config/connection.js';
import routes from './routes/index.js';

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3002;

// Equivalent of __dirname in ES Modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

async function startApolloServer() {
  await server.start();
  
  // Middleware for GraphQL with authentication context
  app.use('/graphql', express.json(), expressMiddleware(server, {
    context: async ({ req }) => authMiddleware({ req }),
  }));

  // Express middleware for parsing JSON and URL-encoded data
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  console.log('Serving static files from:', path.join(__dirname, '../../client/build'));


  // Serve static assets in production
  if (process.env.NODE_ENV === 'production') {
    // Serve React static files
    app.use(express.static(path.join(__dirname, '../client/build')));

    // Serve index.html for non-API routes
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/build/index.html'));
    });
  }

  // Apply routes
  app.use(routes);

  // Connect to the database and start the server
  dbConnection(); // Call the function that connects to MongoDB

  // Use mongoose.connection to listen for 'open' and 'error' events
  mongoose.connection.once('open', () => {
    app.listen(PORT, () => {
      console.log(`🌍 Server listening on http://localhost:${PORT}`);
      console.log(`🚀 GraphQL available at http://localhost:${PORT}/graphql`);
    });
  });

  mongoose.connection.on('error', (err) => {
    console.error('Database connection error:', err);
  });
}

startApolloServer();


