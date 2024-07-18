import { Router } from "express";
// importare i controller ed i middleware necessari

import Parking from '../models/Parking';
import User from '../models/User';
import Fee from '../models/Fee';
import Bill from '../models/Bill';
import Transit from '../models/Transit';
import Passage from '../models/Passage';

import CRUDController from '../controllers/CRUDController';
import TransitStatusController from '../controllers/TransitStatusController';
import loginController from '../controllers/LoginController';
import GeneralParkingController from '../controllers/GeneralParkingController';
import SingleParkingController from "../controllers/SingleParkingController";

import authMiddleware from '../middleware/auth';
import globalCheck from '../middleware/check'
import validateData from '../middleware/validateData';

const routerApp = Router();

// usare in app.ts app.use('/api', routes);

routerApp.post('/login', authMiddleware.validateUserCredentials, loginController.login);
routerApp.post('/passageLogin', authMiddleware.validatePassage, loginController.passageLogin);

routerApp.post('/api/users', authMiddleware.authenticateJWT, authMiddleware.isOperator, validateData.validateUserDataCreation, (req: any, res: any) => CRUDController.createRecord(User, req, res));
routerApp.get('/api/users/:id', authMiddleware.authenticateJWT, authMiddleware.isOperator, validateData.validateRequestId, globalCheck.checkRecordExists(User), (req: any, res: any) => CRUDController.getRecord(User, req, res));
routerApp.put('/api/users/:id', authMiddleware.authenticateJWT, authMiddleware.isOperator, validateData.validateRequestId, globalCheck.checkRecordExists(User), (req: any, res: any) => CRUDController.updateRecord(User, req, res));
routerApp.delete('/api/users/:id', authMiddleware.authenticateJWT, authMiddleware.isOperator, validateData.validateRequestId, globalCheck.checkRecordExists(User), (req: any, res: any) => CRUDController.deleteRecord(User, req, res));

routerApp.post('/api/parkings', authMiddleware.authenticateJWT, authMiddleware.isOperator, validateData.validateParkingDataCreation, (req: any, res: any) => CRUDController.createRecord(User, req, res));
routerApp.get('/api/parkings/:id', authMiddleware.authenticateJWT, authMiddleware.isOperator, validateData.validateRequestId, globalCheck.checkRecordExists(Parking), (req: any, res: any) => CRUDController.getRecord(Parking, req, res));
routerApp.put('/api/parkings/:id', authMiddleware.authenticateJWT, authMiddleware.isOperator, validateData.validateRequestId, globalCheck.checkRecordExists(Parking), validateData.validateParkingDataUpdate, (req: any, res: any) => CRUDController.updateRecord(Parking, req, res));
routerApp.delete('/api/parkings/:id', authMiddleware.authenticateJWT, authMiddleware.isOperator, validateData.validateRequestId, globalCheck.checkRecordExists(Parking), (req: any, res: any) => CRUDController.deleteRecord(Parking, req, res));

routerApp.post('/api/passages', authMiddleware.authenticateJWT, authMiddleware.isOperator, validateData.validatePassageDataCreation, (req: any, res: any) => CRUDController.createRecord(User, req, res));
routerApp.get('/api/passages/:id', authMiddleware.authenticateJWT, authMiddleware.isOperator, validateData.validateRequestId, globalCheck.checkRecordExists(Passage), (req: any, res: any) => CRUDController.getRecord(Passage, req, res));
routerApp.put('/api/passages/:id', authMiddleware.authenticateJWT, authMiddleware.isOperator, validateData.validateRequestId, globalCheck.checkRecordExists(Passage), validateData.validatePassageDataUpdate, (req: any, res: any) => CRUDController.updateRecord(Passage, req, res));
routerApp.delete('/api/passages/:id', authMiddleware.authenticateJWT, authMiddleware.isOperator, validateData.validateRequestId, globalCheck.checkRecordExists(Passage), (req: any, res: any) => CRUDController.deleteRecord(Passage, req, res));

routerApp.post('/api/fees', authMiddleware.authenticateJWT, authMiddleware.isOperator, validateData.validateFeeDataCreation, (req: any, res: any) => CRUDController.createRecord(User, req, res));
routerApp.get('/api/fees/:id', authMiddleware.authenticateJWT, authMiddleware.isOperator, validateData.validateRequestId, globalCheck.checkRecordExists(Fee), (req: any, res: any) => CRUDController.getRecord(Fee, req, res));
routerApp.put('/api/fees/:id', authMiddleware.authenticateJWT, authMiddleware.isOperator, validateData.validateRequestId, globalCheck.checkRecordExists(Fee), validateData.validateFeeDataUpdate, (req: any, res: any) => CRUDController.updateRecord(Fee, req, res));
routerApp.delete('/api/fees/:id', authMiddleware.authenticateJWT, authMiddleware.isOperator, validateData.validateRequestId, globalCheck.checkRecordExists(Fee), (req: any, res: any) => CRUDController.deleteRecord(Fee, req, res));

routerApp.post('/api/transits', authMiddleware.authenticateJWT, authMiddleware.isPassageOrOperator, validateData.validateTransitDataCreation, globalCheck.checkParkingCapacity, (req: any, res: any) => {
    if (req.body.direction === 'E') {
        CRUDController.createRecord(Transit, req, res);
    } else {
        CRUDController.createBill(req, res);
    }
});
routerApp.get('/api/transits/:id', authMiddleware.authenticateJWT, authMiddleware.isOperator, validateData.validateRequestId, globalCheck.checkRecordExists(Transit), (req: any, res: any) => CRUDController.getRecord(Transit, req, res));
routerApp.put('/api/transits/:id', authMiddleware.authenticateJWT, authMiddleware.isOperator, validateData.validateRequestId, globalCheck.checkRecordExists(Transit), validateData.validateTransitDataUpdate, (req: any, res: any) => CRUDController.updateRecord(Transit, req, res));
routerApp.delete('/api/transits/:id', authMiddleware.authenticateJWT, authMiddleware.isOperator, validateData.validateRequestId, globalCheck.checkRecordExists(Transit), (req: any, res: any) => CRUDController.deleteRecord(Transit, req, res));

routerApp.get('/api/transitReport', authMiddleware.authenticateJWT, validateData.validateTransitStatusControllerRequest, (req: any, res: any) => TransitStatusController.getTransits(req, res));

routerApp.get('/api/generalParkStats/parkAverageVacancies',authMiddleware.authenticateJWT, authMiddleware.isOperator, validateData.validateParkStatsRequest, (req: any, res: any) => GeneralParkingController.averageVacanciesCalculator(req, res));
routerApp.get('/api/generalParkStats/parkRevenues',authMiddleware.authenticateJWT, authMiddleware.isOperator, validateData.validateParkStatsRequest, (req: any, res: any) => GeneralParkingController.getRevenues(req, res));

routerApp.get('/api/singleParkStats/nTransits/:id',authMiddleware.authenticateJWT, authMiddleware.isOperator,validateData.validateRequestId, globalCheck.checkRecordExists(Parking), validateData.validateParkStatsRequest, (req: any, res: any) => SingleParkingController.countTransits(req, res));
routerApp.get('/api/singleParkStats/parkRevenues/:id',authMiddleware.authenticateJWT, authMiddleware.isOperator,validateData.validateRequestId, globalCheck.checkRecordExists(Parking), validateData.validateParkStatsRequest, (req: any, res: any) => SingleParkingController.getParkRevenues(req, res));


export default routerApp;