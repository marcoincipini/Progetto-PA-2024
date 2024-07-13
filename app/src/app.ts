import express from 'express';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import CRUDController from './controllers/CRUDController';
import TransitStatusController from './controllers/TransitStatusController';
import { DbConnections } from "./models/DbConnections";
import { login } from './controllers/LoginController';
import { authenticateJWT } from './middleware/auth';
import GeneralParkingController from './controllers/GeneralParkingController';
//import { checkRole } from './middleware/check';
import Parking from './models/Parking';
import User from './models/User';
import Fee from './models/Fee';
import Bill from './models/Bill';
import Transit from './models/Transit';
import Passage from './models/Passage';
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
//router.get('/api/users', authenticateJWT, User.getUsers);
// CRUD generico per Parking
router.post('/api/users', authenticateJWT, (req: any, res: any) => CRUDController.createRecord(User, req, res));
router.get('/api/users/:id', authenticateJWT, (req: any, res: any) => CRUDController.GetRecord(User, req, res));
router.put('/api/users/:id', authenticateJWT, (req: any, res: any) => CRUDController.UpdateRecord(User, req, res));
router.delete('/api/users/:id', authenticateJWT, (req: any, res: any) => CRUDController.DeleteRecord(User, req, res));
router.get('/api/trans', authenticateJWT, (req: any, res: any) => TransitStatusController.getTransits(req, res));


router.get('/api/transits', async (req: any, res: any) => {
  try {
    const transits = await Transit.findByPlatesAndDateTimeRange(
      ['AB123CD', 'EF456GH', 'QR345ST'],
      '2024-03-12 10:50:54',
      '2024-06-15 07:15:32'
    );
    res.json({ transits });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get('/api/try', (req: any, res: any) => GeneralParkingController.getAverageFreeSpots (req, res));
/*
router.get('/api/try', async (req: any, res: any) => {
  try {
    const tr = [1, 2, 3];
    const transits = await Bill.findByDateTimeRange('2023-03-12 10:50:54',
      '2025-06-15 07:15:32');
    res.json({ transits });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
*/
/*
router.get('/api/parkings/:id', authenticateJWT, ParkingCRUDController.getById);
router.put('/api/parkings/:id', authenticateJWT, ParkingCRUDController.update);
router.delete('/api/parkings/:id', authenticateJWT, ParkingCRUDController.delete);
router.get('/api/passages', authenticateJWT, PassageController.getPassages);
router.get('/api/transits',authenticateJWT, TransitController.getTransit);
router.get('/api/bills', authenticateJWT, BillController.getBills);
router.get('/api/fees', authenticateJWT, FeeController.getFees);
*/


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