// Import necessary modules
import express from 'express';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import { DbConnections } from "./models/DbConnections";
import routerApp from './routes/routes';

// Import the middlewares
import * as middlewareErrorHandler from './middleware/generalErrorMiddleware'

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000; // Set the port to the environment variable or default to 3000
const connection: Sequelize = DbConnections.getConnection();

// Authenticate and establish database connection
async () => {
  try {
    await connection.authenticate();
    console.log('Connection has been established successfully.');
  } catch (err) {
    console.error('Unable to connect to the database:', err);
  }
};

// Middleware for parsing request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use the defined routes from router
app.use(routerApp);

// Handle all undefined routes with "Route not found" error
app.all('*', middlewareErrorHandler.routeNotFound);

// Middleware for handling errors
app.use(middlewareErrorHandler.generalErrorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});