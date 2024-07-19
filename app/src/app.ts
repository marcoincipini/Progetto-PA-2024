
import express from 'express';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

import { DbConnections } from "./models/DbConnections";

import routerApp from './routes/routes';

import * as middlewareErrorHandler from './middleware/generalErrorMiddleware'


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const connection: Sequelize = DbConnections.getConnection();

async () => {
  try {
    await connection.authenticate();
    console.log('Connection has been established successfully.');
  } catch (err) {
    console.error('Unable to connect to the database:', err);
  }
};

// Middleware per il parsing del corpo della richiesta
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Usa le rotte definite nel router
app.use(routerApp);

//all routes will return Err route not found if the route is incorrect
app.all('*', middlewareErrorHandler.routeNotFound);

//management of an error handler in the middleware chain
app.use(middlewareErrorHandler.generalErrorHandler);

// Server start
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});