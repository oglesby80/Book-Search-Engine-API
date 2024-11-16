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

    // Serve static files in production
    if (process.env.NODE_ENV === 'production') {
        // Correct path to the `dist` directory
        const distPath = path.join(__dirname, '../../client/dist');
        console.log('Serving static files from:', distPath);

        // Serve the static files
        app.use(express.static(distPath));

        // Fallback route to serve `index.html`
        app.get('*', (req, res) => {
            const indexPath = path.join(distPath, 'index.html');
            console.log('Trying to serve:', indexPath);
            res.sendFile(indexPath, (err) => {
                if (err) {
                    console.error('Error serving index.html:', err);
                    res.status(500).send('An error occurred.');
                }
            });
        });
    }

    // Apply routes
    app.use(routes);

    // Connect to the database and start the server
    dbConnection();

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







