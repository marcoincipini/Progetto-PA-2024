import { Request, Response, NextFunction } from 'express';
import { Model, ModelStatic } from 'sequelize';
import Parking from '../models/Parking';
import Passage from '../models/Passage';
import Vehicle from '../models/Vehicle';
import { errorFactory  } from '../factory/ErrorMessage';
import { Error } from '../factory/Status'


class validateData {

    // Middleware per validare il parametro ID nella richiesta
    validateRequestId(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;

        if (!id || isNaN(Number(id))) {
            console.log('Invalid ID');
            next(Error.invalidFormat);
        }

        next();
    }

    async validateTransitDataCreation(req: Request, res: Response, next: NextFunction) {
        const { passage_id, plate, passing_by_date, passing_by_hour, direction, vehicle_type } = req.body;
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const hourRegex = /^\d{2}:\d{2}:\d{2}$/;

        const passage = await Passage.findByPk(passage_id);

        if (!passage) {
            console.log("Passage not found or does not exist");
                next(Error.resourceNotFoundError);
        }

        if (typeof passage_id !== 'number') {
            console.log('Invalid passage_id. Passage id is required and is expected a number' );
            next(Error.invalidFormatOrResourceNotFound);
        }
        const plateEx = await Vehicle.findByPk(plate);

        if (!plateEx) {
            console.log ('Plate not found' );
            next(Error.resourceNotFoundError);
        }

        if (!plateEx || typeof plate !== 'string') {
            console.log('Invalid plate. plate is required and is expected a string' );
            next(Error.invalidFormatOrResourceNotFound);
        }

        if (!passing_by_date || typeof passing_by_date !== 'string') {
            console.log('Invalid passing_by_date. passing_by_date is required and is expected a string' );
            next(Error.invalidFormatOrResourceNotFound);
        }

        if (!passing_by_hour || typeof passing_by_hour !== 'string') {
            console.log('Invalid passing_by_hour. passing_by_hour is required and is expected a string' );
            next(Error.invalidFormatOrResourceNotFound);
        }

        if (!direction || typeof direction !== 'string') {
            console.log('Invalid direction. direction is required and is expected a string' );
            next(Error.invalidFormatOrResourceNotFound);
        }

        if (!vehicle_type || typeof vehicle_type !== 'string') {
            console.log('Invalid vehicle_type. vehicle_type is required and is expected a string' );
            next(Error.invalidFormatOrResourceNotFound);
        }

        if (!dateRegex.test(passing_by_date)) {
            next(Error.invalidDateFormat);
        }

        if (!hourRegex.test(passing_by_hour)) {
            next(Error.invalidHourFormat);
        }

        if (direction.length !== 1 || (direction !== 'E' && direction !== 'U')) {
            console.log('Invalid direction format. Expected length: 1 character' );
            next(Error.invalidFormat);
        }

        if (plate.length !== 7) {
            console.log('Invalid plate format. Expected length: 7 characters' );
            next(Error.invalidFormat);
        }

        next();
    }

    validateParkingDataCreation(req: Request, res: Response, next: NextFunction) {
        const { name, parking_spots, occupied_spots, day_starting_hour, day_finishing_hour } = req.body;

        if (!name || typeof name !== 'string') {
            console.log('Invalid name. Name is required and must be a string' );
            next(Error.invalidFormatOrResourceNotFound);
        }

        if (!parking_spots || typeof parking_spots !== 'number' || !Number.isInteger(parking_spots) || parking_spots <= 0) {
            console.log('Invalid parking_spots. Must be a positive integer' );
            next(Error.invalidFormatOrResourceNotFound);
        }

        if (!occupied_spots || typeof occupied_spots !== 'number' || !Number.isInteger(occupied_spots) || occupied_spots < 0) {
            console.log('Invalid occupied_spots. Must be a non-negative integer' );
            next(Error.invalidFormatOrResourceNotFound);
        }

        if (!day_starting_hour || !/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(day_starting_hour)) {
            console.log('Invalid day_starting_hour format. Expected format: hh:mm:ss' );
            next(Error.invalidDateFormat);
        }

        if (!day_finishing_hour || !/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(day_finishing_hour)) {
            console.log('Invalid day_finishing_hour format. Expected format: hh:mm:ss' );
            next(Error.invalidHourFormat);
        }

        next();
    }

    validateUserDataCreation(req: Request, res: Response, next: NextFunction) {
        const { name, surname, email, password, role } = req.body;

        if (!name || typeof name !== 'string') {
            console.log('Invalid name. Name is required and must be a string' );
            next(Error.invalidFormatOrResourceNotFound);
        }

        if (!surname || typeof surname !== 'string') {
            console.log('Invalid surname. Surname is required and must be a string' );
            next(Error.invalidFormatOrResourceNotFound);
        }

        if (!email || typeof email !== 'string' || !validateEmail(email)) {
            console.log('Invalid email format' );
            next(Error.invalidFormatOrResourceNotFound);
        }

        if (!password || typeof password !== 'string') {
            console.log('Invalid password. Password is required and must be a string' );
            next(Error.invalidFormatOrResourceNotFound);
        }

        if (!role || typeof role !== 'string' || role.length > 32) {
            console.log('Invalid role. Role is required and must be a string with maximum length of 32 characters');
            next(Error.invalidFormatOrResourceNotFound);
        }

        next();
    }

    async validatePassageDataCreation(req: Request, res: Response, next: NextFunction) {
        const { parking_id, name, entrance, exit } = req.body;

        if (typeof parking_id !== 'number') {
            console.log('Invalid parking_id. Parking ID is required and must be a number' );
            next(Error.invalidFormat);
        }

        const parking = await Parking.findByPk(parking_id);

        if (!parking) {
            console.log ('Parking not found' );
            next(Error.resourceNotFoundError);
        }

        if (!name || typeof name !== 'string' || name.length > 255) {
            console.log('Invalid name. Name is required and must be a string with maximum length of 255 characters' );
            next(Error.invalidFormatOrResourceNotFound);
        }

        if (!entrance || typeof entrance !== 'boolean') {
            console.log('Invalid entrance value. Entrance is required and must be a boolean');
            next(Error.invalidFormatOrResourceNotFound);
        }

        if (!exit || typeof exit !== 'boolean') {
            console.log('Invalid exit value. Exit is required and must be a boolean' );
            next(Error.invalidFormatOrResourceNotFound);
        }

        next();
    }

    async validateFeeDataCreation(req: Request, res: Response, next: NextFunction) {
        const { parking_id, name, hourly_amount, vehicle_type, night, festive } = req.body;

        const parking = await Parking.findByPk(parking_id);

        if (!parking) {
            console.log('Parking not found' );
            next(Error.resourceNotFoundError);
        }

        if (typeof parking_id !== 'number') {
            console.log('Invalid parking_id. Parking ID is required and must be a number' );
            next(Error.invalidFormat);
        }

        if (!name || typeof name !== 'string' || name.length > 255) {
            console.log('Invalid name. Name is required and must be a string with maximum length of 255 characters' );
            next(Error.invalidFormatOrResourceNotFound);
        }

        if (!hourly_amount || typeof hourly_amount !== 'number' || !validateDecimal(hourly_amount)) {
            console.log('Invalid hourly_amount. Hourly amount is required and must be a decimal number with two decimal places' );
            next(Error.invalidFormatOrResourceNotFound);
        }

        if (!vehicle_type || typeof vehicle_type !== 'string' || vehicle_type.length > 32) {
            console.log('Invalid vehicle_type. Vehicle type is required and must be a string with maximum length of 32 characters' );
            next(Error.invalidFormatOrResourceNotFound);
        }

        if (!night || typeof night !== 'boolean') {
            console.log('Invalid night value. Night value is required and must be a boolean' );
            next(Error.invalidFormatOrResourceNotFound);
        }

        if (!festive || typeof festive !== 'boolean') {
            console.log('Invalid festive value. Festive value is required must be a boolean' );
            next(Error.invalidFormatOrResourceNotFound);
        }

        next();
    }

    async validateTransitDataUpdate(req: Request, res: Response, next: NextFunction) {
        const { passage_id, plate, passing_by_date, passing_by_hour, direction, vehicle_type } = req.body;
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const hourRegex = /^\d{2}:\d{2}:\d{2}$/;

        const passage = await Passage.findByPk(passage_id);

        if (!passage || (passage && typeof passage_id !== 'number')) {
            console.log('Invalid passage_id. Passage id is required and is expected a number' );
            next(Error.invalidFormatOrResourceNotFound);
        }
        const plateEx = await Vehicle.findByPk(plate);

        if (!plateEx || (plateEx && typeof plate !== 'string')) {
            console.log('Invalid plate. plate is required and is expected a string' );
            next(Error.invalidFormatOrResourceNotFound);
        }

        if (passing_by_date && typeof passing_by_date !== 'string') {
            console.log('Invalid passing_by_date. passing_by_date is required and is expected a string' );
        }

        if (passing_by_hour && typeof passing_by_hour !== 'string') {
            console.log('Invalid passing_by_hour. passing_by_hour is required and is expected a string' );
        }

        if (direction && typeof direction !== 'string') {
            console.log('Invalid direction. direction is required and is expected a string' );
        }

        if (vehicle_type && typeof vehicle_type !== 'string') {
            console.log('Invalid vehicle_type. vehicle_type is required and is expected a string' );
        }

        if (!dateRegex.test(passing_by_date)) {
            console.log('Invalid date format. Expected format: aaaa-mm-gg' );
        }

        if (!hourRegex.test(passing_by_hour)) {
            console.log('Invalid hour format. Expected format: hh:mm:ss' );
        }

        if (direction.length !== 1 || (direction !== 'E' && direction !== 'U')) {
            console.log('Invalid direction format. Expected length: 1 character' );
        }

        if (plate.length !== 7) {
            console.log('Invalid plate format. Expected length: 7 characters' );
        }

        next();
    }

    validateParkingDataUpdate(req: Request, res: Response, next: NextFunction) {
        const { name, parking_spots, occupied_spots, day_starting_hour, day_finishing_hour } = req.body;

        if (!name && typeof name !== 'string') {
            console.log('Invalid name. Name is required and must be a string' );
        }

        if (parking_spots && (typeof parking_spots !== 'number' || !Number.isInteger(parking_spots) || parking_spots <= 0)) {
            console.log('Invalid parking_spots. Must be a positive integer' );
        }

        if (occupied_spots && (typeof occupied_spots !== 'number' || !Number.isInteger(occupied_spots) || occupied_spots < 0)) {
            console.log('Invalid occupied_spots. Must be a non-negative integer' );
        }

        if (day_starting_hour && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(day_starting_hour)) {
            console.log('Invalid day_starting_hour format. Expected format: hh:mm:ss' );
        }

        if (day_finishing_hour && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(day_finishing_hour)) {
            console.log('Invalid day_finishing_hour format. Expected format: hh:mm:ss' );
        }

        next();
    }

    validateUserDataUpdate(req: Request, res: Response, next: NextFunction) {
        const { name, surname, email, password, role } = req.body;

        if (name && typeof name !== 'string') {
            console.log('Invalid name. Name is required and must be a string' );
        }

        if (surname && typeof surname !== 'string') {
            console.log('Invalid surname. Surname is required and must be a string' );
        }

        if (email && (typeof email !== 'string' || !validateEmail(email))) {
            console.log('Invalid email format' );
        }

        if (password && typeof password !== 'string') {
            console.log('Invalid password. Password is required and must be a string' );
        }

        if (role && (typeof role !== 'string' || role.length > 32)) {
            console.log('Invalid role. Role is required and must be a string with maximum length of 32 characters' );
        }

        next();
    }

    async validatePassageDataUpdate(req: Request, res: Response, next: NextFunction) {
        const { parking_id, name, entrance, exit } = req.body;

        const parking = await Parking.findByPk(parking_id);

        if (parking && typeof parking_id !== 'number') {
            console.log('Invalid parking_id. Parking ID is required and must be a number' );
        }

        if (name && (typeof name !== 'string' || name.length > 255)) {
            console.log('Invalid name. Name is required and must be a string with maximum length of 255 characters' );
        }

        if (entrance && typeof entrance !== 'boolean') {
            console.log('Invalid entrance value. Entrance is required and must be a boolean' );
        }

        if (exit && typeof exit !== 'boolean') {
            console.log('Invalid exit value. Exit is required and must be a boolean' );
        }

        next();
    }

    async validateFeeDataUpdate(req: Request, res: Response, next: NextFunction) {
        const { parking_id, name, hourly_amount, vehicle_type, night, festive } = req.body;

        const parking = await Parking.findByPk(parking_id);

        if (parking && typeof parking_id !== 'number') {
            console.log('Invalid parking_id. Parking ID is required and must be a number' );
        }

        if (name && (typeof name !== 'string' || name.length > 255)) {
            console.log('Invalid name. Name is required and must be a string with maximum length of 255 characters' );
        }

        if (hourly_amount && (typeof hourly_amount !== 'number' || !validateDecimal(hourly_amount))) {
            console.log('Invalid hourly_amount. Hourly amount is required and must be a decimal number with two decimal places' );
        }

        if (vehicle_type && (typeof vehicle_type !== 'string' || vehicle_type.length > 32)) {
            console.log('Invalid vehicle_type. Vehicle type is required and must be a string with maximum length of 32 characters' );
        }

        if (night && typeof night !== 'boolean') {
            console.log('Invalid night value. Night value is required and must be a boolean' );
        }

        if (festive && typeof festive !== 'boolean') {
            console.log('Invalid festive value. Festive value is required must be a boolean' );
        }

        next();
    }


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