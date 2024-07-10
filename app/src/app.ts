import express from 'express';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import * as User from './controllers/UserController';
import * as Parking from './controllers/ParkingController';
import * as Passage from './controllers/PassageController';
import * as Transit from './controllers/TransitController';
import * as Bill from './controllers/BillController';
import * as Fee from './controllers/FeeController';
import { DbConnections } from "./models/DbConnections";
import { login } from './controllers/LoginController';
import { authenticateJWT } from './middleware/auth';
import ParkingCRUDController from './controllers/ParkingCRUDController'

dotenv.config();

const router = express.Router();

const connection: Sequelize = DbConnections.getConnection();

async () => {
  try {
      await connection.authenticate();
      console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

router.post('/login', login);
// Endpoint per ottenere tutti gli utenti
router.get('/api/users', authenticateJWT, User.getUsers);
router.post('/api/parkings', authenticateJWT, ParkingCRUDController.parkingcreate);
router.get('/api/parkings/:id', authenticateJWT, ParkingCRUDController.getById);
router.put('/api/parkings/:id', authenticateJWT, ParkingCRUDController.update);
router.delete('/api/parkings/:id', authenticateJWT, ParkingCRUDController.delete);
router.get('/api/passages', authenticateJWT, Passage.getPassages);
router.get('/api/transits',authenticateJWT, Transit.getTransit);
router.get('/api/bills', authenticateJWT, Bill.getBills);
router.get('/api/fees', authenticateJWT, Fee.getFees);



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