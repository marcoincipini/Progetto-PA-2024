import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

import { DbConnections } from "./models/DbConnections";
import Parking from './models/Parking';
import User from './models/User';
import Fee from './models/Fee';
import Bill from './models/Bill';
import Transit from './models/Transit';
import Passage from './models/Passage';

import CRUDController from './controllers/CRUDController';
import TransitStatusController from './controllers/TransitStatusController';
import loginController from './controllers/LoginController';
import GeneralParkingController from './controllers/GeneralParkingController';

import authMiddleware from './middleware/auth';
import globalCheck from './middleware/check'
import validateData from './middleware/validateData';
import routerApp from './routes/routes';
import * as middlewareErrorHandler from './middleware/generalErrorMiddleware'

import { errorFactory  } from './factory/ErrorMessage';
import { Error } from './factory/Status'
//import { checkRole } from './middleware/check';

dotenv.config();

const router = express.Router();
const app = express();
const PORT = process.env.PORT || 3000;
const connection: Sequelize = DbConnections.getConnection();

async () => {
  try {
    await connection.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

// Middleware per il parsing del corpo della richiesta
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Usa le rotte definite nel router
app.use(router);
app.use(routerApp);
router.get('/api/trans', authMiddleware.authenticateJWT, authMiddleware.isOperator, (req: any, res: any) => TransitStatusController.getTransits(req, res));


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
//router.get('/api/try', (req: any, res: any) => GeneralParkingController.getStats (req, res));
app.get('/api/try', (req: Request, res: Response) => {
  // Chiamata al metodo getStats del controller
  GeneralParkingController.getStatistics(req, res);
});
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

//all other requests (from all methods) that are not the ones implemented above return 404 not found error
app.all('*', middlewareErrorHandler.routeNotFound);

//management of an error handler in the middleware chain
app.use(middlewareErrorHandler.generalErrorHandler);

// Server start
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});