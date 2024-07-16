import { Request, Response, NextFunction } from 'express';
import Parking from '../models/Parking';
import Passage from '../models/Passage';
import Vehicle from '../models/Vehicle';
import { errorFactory  } from '../factory/ErrorMessage';
import { ErrorStatus } from '../factory/Status'

const ErrorFac: errorFactory = new errorFactory();

class validateData {

    // Middleware per validare il parametro ID nella richiesta
    validateRequestId(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;

        if (!id || isNaN(Number(id))) {
            const specificMessage = 'Invalid ID';
            next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
        }

        next();
    }

    async validateTransitDataCreation(req: Request, res: Response, next: NextFunction) {
        const { passage_id, plate, passing_by_date, passing_by_hour, direction, vehicle_type } = req.body;
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const hourRegex = /^\d{2}:\d{2}:\d{2}$/;

        const passage = await Passage.findByPk(passage_id);

        if (!passage) {
            const specificMessage = "Passage not found or does not exist";
                next(ErrorFac.getMessage(ErrorStatus.resourceNotFoundError, specificMessage));
        }

        if (typeof passage_id !== 'number') {
            const specificMessage = 'Invalid passage_id. Passage id is expected a number' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound, specificMessage));
        }
        const plateEx = await Vehicle.findByPk(plate);

        if (!plateEx) {
            const specificMessage = 'Plate not found' ;
            next(ErrorFac.getMessage(ErrorStatus.resourceNotFoundError, specificMessage));
        }

        if (!plateEx || typeof plate !== 'string') {
            const specificMessage = 'Invalid plate. plate is expected a string' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound, specificMessage));
        }

        if (!passing_by_date || typeof passing_by_date !== 'string') {
            const specificMessage = 'Invalid passing_by_date. passing_by_date is expected a string' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound, specificMessage));
        }

        if (!passing_by_hour || typeof passing_by_hour !== 'string') {
            const specificMessage = 'Invalid passing_by_hour. passing_by_hour is expected a string' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound, specificMessage));
        }

        if (!direction || typeof direction !== 'string') {
            const specificMessage = 'Invalid direction. direction is expected a string' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound, specificMessage));
        }

        if (!vehicle_type || typeof vehicle_type !== 'string') {
            const specificMessage = 'Invalid vehicle_type. vehicle_type is expected a string' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound, specificMessage));
        }

        if (!dateRegex.test(passing_by_date)) {
            next(ErrorFac.getMessage(ErrorStatus.invalidDateFormat));
        }

        if (!hourRegex.test(passing_by_hour)) {
            next(ErrorFac.getMessage(ErrorStatus.invalidHourFormat));
        }

        if (direction.length !== 1 || (direction !== 'E' && direction !== 'U')) {
            const specificMessage = 'Invalid direction format. Expected length: 1 character' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
        }

        if (plate.length !== 7) {
            const specificMessage = 'Invalid plate format. Expected length: 7 characters' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormat));
        }
/*
        if (passage_id || plate || direction || vehicle_type){
            const specificMessage = (`parameter already existing`);
            next(ErrorFac.getMessage(ErrorStatus.resourceAlreadyPresent, specificMessage));
        }
*/
//validateParams(next, passage_id, plate, direction, vehicle_type);
        next();
    }

    validateParkingDataCreation(req: Request, res: Response, next: NextFunction) {
        const { name, parking_spots, occupied_spots, day_starting_hour, day_finishing_hour } = req.body;



        if (!name || typeof name !== 'string') {
            const specificMessage = 'Invalid name. Name must be a string' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound));
        }

        if (!parking_spots || typeof parking_spots !== 'number' || !Number.isInteger(parking_spots) || parking_spots <= 0) {
            const specificMessage = 'Invalid parking_spots. Must be a positive integer' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound));
        }

        if (!occupied_spots || typeof occupied_spots !== 'number' || !Number.isInteger(occupied_spots) || occupied_spots < 0) {
            const specificMessage = 'Invalid occupied_spots. Must be a non-negative integer' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound));
        }

        if (!day_starting_hour || !/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(day_starting_hour)) {
            next(ErrorFac.getMessage(ErrorStatus.invalidHourFormat));
        }

        if (!day_finishing_hour || !/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(day_finishing_hour)) {
            next(ErrorFac.getMessage(ErrorStatus.invalidHourFormat));
        }

        next();
    }

    validateUserDataCreation(req: Request, res: Response, next: NextFunction) {
        const { name, surname, email, password, role } = req.body;

        if (!name || typeof name !== 'string') {
            const specificMessage = 'Invalid name. Name must be a string' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound, specificMessage));
        }

        if (!surname || typeof surname !== 'string') {
            const specificMessage = 'Invalid surname. Surname must be a string' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound, specificMessage));
        }

        if (!email || typeof email !== 'string' || !validateEmail(email)) {
            next(ErrorFac.getMessage(ErrorStatus.emailNotValid));
        }

        if (!password || typeof password !== 'string') {
            const specificMessage = 'Invalid password. Password must be a string' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound, specificMessage));
        }

        if (!role || typeof role !== 'string' || role.length > 32) {
            const specificMessage = 'Invalid role. Role must be a string with maximum length of 32 characters';
            next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound, specificMessage));
        }

        next();
    }

    async validatePassageDataCreation(req: Request, res: Response, next: NextFunction) {
        const { parking_id, name, entrance, exit } = req.body;

        if (typeof parking_id !== 'number') {
            const specificMessage = 'Invalid parking_id. Parking ID must be a number' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
        }

        const parking = await Parking.findByPk(parking_id);

        if (!parking) {
            const specificMessage = 'Passage not found';
            next(ErrorFac.getMessage(ErrorStatus.resourceNotFoundError, specificMessage));
        }

        if (!name || typeof name !== 'string' || name.length > 255) {
            const specificMessage = 'Invalid name. Name must be a string with maximum length of 255 characters' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound, specificMessage));
        }

        if (!entrance || typeof entrance !== 'boolean') {
            const specificMessage = 'Invalid entrance value. Entrance must be a boolean';
            next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound, specificMessage));
        }

        if (!exit || typeof exit !== 'boolean') {
            const specificMessage = 'Invalid exit value. Exit must be a boolean';
            next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound, specificMessage));
        }

        next();
    }

    async validateFeeDataCreation(req: Request, res: Response, next: NextFunction) {
        const { parking_id, name, hourly_amount, vehicle_type, night, festive } = req.body;

        const parking = await Parking.findByPk(parking_id);

        if (!parking) {
            const specificMessage = 'Parking not found' ;
            next(ErrorFac.getMessage(ErrorStatus.resourceNotFoundError, specificMessage));
        }

        if (typeof parking_id !== 'number') {
            const specificMessage = 'Invalid parking_id. Parking ID must be a number' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
        }

        if (!name || typeof name !== 'string' || name.length > 255) {
            const specificMessage = 'Invalid name. Name must be a string with maximum length of 255 characters' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound, specificMessage));
        }

        if (!hourly_amount || typeof hourly_amount !== 'number' || !validateDecimal(hourly_amount)) {
            const specificMessage = 'Invalid hourly_amount. Hourly amount must be a decimal number with two decimal places' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound, specificMessage));
        }

        if (!vehicle_type || typeof vehicle_type !== 'string' || vehicle_type.length > 32) {
            const specificMessage = 'Invalid vehicle_type. Vehicle type must be a string with maximum length of 32 characters' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound, specificMessage));
        }

        if (!night || typeof night !== 'boolean') {
            const specificMessage = 'Invalid night value. Night value must be a boolean' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound, specificMessage));
        }

        if (!festive || typeof festive !== 'boolean') {
            const specificMessage = 'Invalid festive value. Festive value is required must be a boolean' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound, specificMessage));
        }

        next();
    }

    async validateTransitDataUpdate(req: Request, res: Response, next: NextFunction) {
        const { passage_id, plate, passing_by_date, passing_by_hour, direction, vehicle_type } = req.body;
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const hourRegex = /^\d{2}:\d{2}:\d{2}$/;

        const passage = await Passage.findByPk(passage_id);

        if (passage && typeof passage_id !== 'number') {
            const specificMessage = 'Invalid passage_id. Passage id is expected a number' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
        }
        const plateEx = await Vehicle.findByPk(plate);

        if (plateEx && typeof plate !== 'string') {
            const specificMessage = 'Invalid plate. Plate is expected a string' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
        }

        if (passing_by_date && typeof passing_by_date !== 'string') {
            const specificMessage = 'Invalid passing_by_date. Passing_by_date is expected a string' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
        }

        if (passing_by_hour && typeof passing_by_hour !== 'string') {
            const specificMessage = 'Invalid passing_by_hour. Passing_by_hour is expected a string' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
        }

        if (direction && typeof direction !== 'string') {
            const specificMessage = 'Invalid direction. Direction is expected a string' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
        }

        if (vehicle_type && typeof vehicle_type !== 'string') {
            const specificMessage = 'Invalid vehicle_type. Vehicle_type is expected a string' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
        }

        if (!dateRegex.test(passing_by_date)) {
            next(ErrorFac.getMessage(ErrorStatus.invalidDateFormat));
        }

        if (!hourRegex.test(passing_by_hour)) {
            next(ErrorFac.getMessage(ErrorStatus.invalidHourFormat));
        }

        if (direction.length !== 1 || (direction !== 'E' && direction !== 'U')) {
            const specificMessage = 'Invalid direction format. Expected length: 1 character' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
        }

        if (plate.length !== 7) {
            const specificMessage = 'Invalid plate format. Expected length: 7 characters' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
        }

        next();
    }

    validateParkingDataUpdate(req: Request, res: Response, next: NextFunction) {
        const { name, parking_spots, occupied_spots, day_starting_hour, day_finishing_hour } = req.body;

        if (name && typeof name !== 'string') {
            const specificMessage = 'Invalid name. Name must be a string' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
        }

        if (parking_spots && (typeof parking_spots !== 'number' || !Number.isInteger(parking_spots) || parking_spots <= 0)) {
            const specificMessage = 'Invalid parking_spots. Must be a positive integer' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
        }

        if (occupied_spots && (typeof occupied_spots !== 'number' || !Number.isInteger(occupied_spots) || occupied_spots < 0)) {
            const specificMessage = 'Invalid occupied_spots. Must be a non-negative integer' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
        }

        if (day_starting_hour && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(day_starting_hour)) {
            const specificMessage = 'Invalid day_starting_hour format. Expected format: hh:mm:ss' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidHourFormat, specificMessage));
        }

        if (day_finishing_hour && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(day_finishing_hour)) {
            const specificMessage = 'Invalid day_finishing_hour format. Expected format: hh:mm:ss' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidHourFormat, specificMessage));
        }

        next();
    }

    validateUserDataUpdate(req: Request, res: Response, next: NextFunction) {
        const { name, surname, email, password, role } = req.body;

        if (name && typeof name !== 'string') {
            const specificMessage = 'Invalid name. Name must be a string' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
        }

        if (surname && typeof surname !== 'string') {
            const specificMessage = 'Invalid surname. Surname must be a string' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
        }

        if (email && (typeof email !== 'string' || !validateEmail(email))) {
            const specificMessage = 'Invalid email. Email must be a string' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
        }

        if (password && typeof password !== 'string') {
            const specificMessage = 'Invalid password. Password must be a string' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
        }

        if (role && (typeof role !== 'string' || role.length > 32)) {
            const specificMessage = 'Invalid role. Role must be a string with maximum length of 32 characters' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
        }

        next();
    }

    async validatePassageDataUpdate(req: Request, res: Response, next: NextFunction) {
        const { parking_id, name, entrance, exit } = req.body;

        const parking = await Parking.findByPk(parking_id);

        if (parking && typeof parking_id !== 'number') {
            const specificMessage = 'Invalid parking_id. Parking ID must be a number' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
        }

        if (name && (typeof name !== 'string' || name.length > 255)) {
            const specificMessage = 'Invalid name. Name must be a string with maximum length of 255 characters' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
        }

        if (entrance && typeof entrance !== 'boolean') {
            const specificMessage = 'Invalid entrance value. Entrance must be a boolean' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
        }

        if (exit && typeof exit !== 'boolean') {
            const specificMessage = 'Invalid exit value. Exit must be a boolean' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
        }

        next();
    }

    async validateFeeDataUpdate(req: Request, res: Response, next: NextFunction) {
        const { parking_id, name, hourly_amount, vehicle_type, night, festive } = req.body;

        const parking = await Parking.findByPk(parking_id);

        if (parking && typeof parking_id !== 'number') {
            const specificMessage = 'Invalid parking_id. Parking ID must be a number' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));

        }

        if (name && (typeof name !== 'string' || name.length > 255)) {
            const specificMessage = 'Invalid name. Name must be a string with maximum length of 255 characters' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
        }

        if (hourly_amount && (typeof hourly_amount !== 'number' || !validateDecimal(hourly_amount))) {
            const specificMessage = 'Invalid hourly_amount. Hourly amount must be a decimal number with two decimal places' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
        }

        if (vehicle_type && (typeof vehicle_type !== 'string' || vehicle_type.length > 32)) {
            const specificMessage = 'Invalid vehicle_type. Vehicle type must be a string with maximum length of 32 characters' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
        }

        if (night && typeof night !== 'boolean') {
            const specificMessage = 'Invalid night value. Night value must be a boolean' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
        }

        if (festive && typeof festive !== 'boolean') {
            const specificMessage = 'Invalid festive value. Festive value must be a boolean' ;
            next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
        }

        next();
    }

}

export function validateParams(next: NextFunction, ...params: any[]) {
    for (const param of params) {
        if (param) {
            const specificMessage = `${param} already existing`;
            console.log(specificMessage);
            next(ErrorFac.getMessage(ErrorStatus.resourceAlreadyPresent, specificMessage));
        }
    }
    next();
}

export function validateDecimal(num: number): boolean {
    const regex = /^\d+(\.\d{1,2})?$/;
    return regex.test(num.toString());
}

export function validateEmail(email: string): boolean {
    // Regular expression to validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
export default new validateData();