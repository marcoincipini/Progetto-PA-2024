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

import routerApp from './routes/routes';
import * as middlewareErrorHandler from './middleware/generalErrorMiddleware'

import { errorFactory  } from './factory/ErrorMessage';
import { ErrorStatus } from './factory/Status'
import CRUDController from './controllers/CRUDController';
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
  } catch (err) {
    console.error('Unable to connect to the database:', err);
  }
};

// Middleware per il parsing del corpo della richiesta
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Usa le rotte definite nel router
app.use(router);
app.use(routerApp);

router.get('/api/transits', async (req: any, res: any) => {
  try {
    const transits = await Transit.findByPlatesAndDateTimeRange(
      ['AB123CD', 'EF456GH', 'QR345ST'],
      '2024-03-12 10:50:54',
      '2024-06-15 07:15:32'
    );
    res.json({ transits });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
//router.get('/api/try', (req: any, res: any) => GeneralParkingController.getStats (req, res));
/*app.get('/api/try', (req: Request, res: Response) => {
  // Chiamata al metodo getStats del controller
  let variabile = Transit.findByDateRange('2023-03-12 10:50:54','2025-06-15 07:15:32');
  res.json({ variabile });
});
*/
app.post('/api/try/:passage_id', async (req: Request, res: Response) => CRUDController.createBill(req, res));

//app.get('/api/try/', async (req: Request, res: Response) => res.json( await Transit.getEnterTransit('AB123CD')));

/*
router.get('/api/try', async (req: any, res: any) => {
  try {
    const tr = [1, 2, 3];
    const transits = await Bill.findByDateTimeRange('2023-03-12 10:50:54',
      '2025-06-15 07:15:32');
    res.json({ transits });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
*/

//all other requests (from all methods) that are not the ones implemented above return 404 not found error
app.all('*', middlewareErrorHandler.routeNotFound);

//management of an error handler in the middleware chain
app.use(middlewareErrorHandler.generalErrorHandler);

// Server start
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});