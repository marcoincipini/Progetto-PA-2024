import express from 'express';
import dotenv from 'dotenv';
import { getUsers } from './controllers/UserController';
import { Sequelize } from 'sequelize';
import { DbConnections } from "./models/DbConnections";
dotenv.config();

const router = express.Router();

const connection: Sequelize = DbConnections.getConnection();

(async () => {
    try {
      await connection.authenticate();
      console.log('Connection has been established successfully.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }
  })();

// Endpoint per ottenere tutti gli utenti
router.get('/api/users', getUsers);


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware per il parsing del corpo della richiesta
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Usa le rotte definite nel router
app.use(router);

// Avvia il server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
