// Import necessary modules 
import { Request, Response, NextFunction } from 'express';

// Import the models
import Parking from '../models/Parking';
import Passage from '../models/Passage';
import Vehicle from '../models/Vehicle';
import User from '../models/User';
import Fee from '../models/Fee';
import Transit from '../models/Transit';

// Import the factories
import { errorFactory } from '../factory/ErrorMessage';
import { ErrorStatus } from '../factory/Status'

// Initialize the error factory instance
const ErrorFac: errorFactory = new errorFactory();

class validateData {

    // Middleware to validate the ID parameter in the request
    validateRequestId(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;

        // Check if ID is present and a valid number
        if (!id || isNaN(Number(id))) {
            return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, 'Invalid ID'));
        }

        next();
    }

    // Middleware to validate data for creating a new transit record
    async validateTransitDataCreation(req: Request, res: Response, next: NextFunction) {
        const { passage_id, plate, passing_by_date, passing_by_hour, direction, vehicle_type } = req.body;
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const hourRegex = /^\d{2}:\d{2}:\d{2}$/;
        try {

            // Check if passage_id is a number and if the passage exists
            if (typeof passage_id !== 'number') {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound, 'Invalid passage_id. Passage id is expected a number'));
            }
            const passage = await Passage.findByPk(passage_id);
            if (!passage) {
                return next(ErrorFac.getMessage(ErrorStatus.resourceNotFoundError, "Passage not found or does not exist"));
            }

            if((!passage.entrance && direction === 'E') || (!passage.exit && direction === 'U')){
                return next(ErrorFac.getMessage(ErrorStatus.functionNotWorking, "The transit cannot be the opposite direction of the passage"));
            }

            // Check if plate is a valid string and if the vehicle exists
            if (!isValidString(plate)) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound, 'Invalid plate. Plate is expected a string'));
            }
            const plateEx = await Vehicle.findByPk(plate);
            if (!plateEx) {
                return next(ErrorFac.getMessage(ErrorStatus.resourceNotFoundError, 'Plate not found'));
            }
            if (plate.length !== 7) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, 'Invalid plate format. Expected length: 7 characters'));
            }

            // Check if passing_by_date is a valid date
            if (!isValidString(passing_by_date) || !dateRegex.test(passing_by_date)) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidDateFormat, 'Invalid passing_by_date. Expected format: YYYY-MM-DD'));
            }

            // Check if passing_by_hour is a valid time
            if (!isValidString(passing_by_hour) || !hourRegex.test(passing_by_hour)) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidHourFormat, 'Invalid passing_by_hour. Expected format: HH:MM:SS'));
            }

            // Check if direction is valid
            if (!isValidString(direction) || direction.length !== 1 || (direction !== 'E' && direction !== 'U')) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, 'Invalid direction format. Expected length: 1 character (E or U)'));
            }

            // Check if vehicle_type is a valid string
            if (!isValidString(vehicle_type)) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound, 'Invalid vehicle_type. Vehicle type is expected a string'));
            }

            // Check if a transit with the provided data already exists
            const existingTransit = await Transit.getTransitData(passage_id, plate, passing_by_date, passing_by_hour);
            if (existingTransit) {
                return next(ErrorFac.getMessage(ErrorStatus.resourceAlreadyPresent, 'Transit already existing'));
            }



            next();
        } catch (err) {
            return next(ErrorFac.getMessage(ErrorStatus.defaultError));
        }

    }

    // Middleware to validate data for creating a new parking record
    async validateParkingDataCreation(req: Request, res: Response, next: NextFunction) {
        const { name, parking_spots, occupied_spots, day_starting_hour, day_finishing_hour } = req.body;

        // Check if name is a valid string
        if (!isValidString(name)) {
            const specificMessage = 'Invalid name. Name must be a string';
            return next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound, specificMessage));
        }

        // Check if parking_spots is a valid positive integer
        if (typeof parking_spots !== 'number' || !Number.isInteger(parking_spots) || parking_spots <= 0) {
            return next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound, 'Invalid parking_spots. Must be a positive integer'));
        }

        // Check if occupied_spots is a valid non-negative integer
        if (typeof occupied_spots !== 'number' || !Number.isInteger(occupied_spots) || occupied_spots < 0) {
            return next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound, 'Invalid occupied_spots. Must be a non-negative integer'));
        }

        // Check if day_starting_hour is a valid time
        const hourRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
        if (!isValidString(day_starting_hour) || !hourRegex.test(day_starting_hour)) {
            return next(ErrorFac.getMessage(ErrorStatus.invalidHourFormat, 'Invalid day_starting_hour. Expected format: HH:MM:SS'));
        }

        // Check if day_finishing_hour is a valid time
        if (!isValidString(day_finishing_hour) || !hourRegex.test(day_finishing_hour)) {
            return next(ErrorFac.getMessage(ErrorStatus.invalidHourFormat, 'Invalid day_finishing_hour. Expected format: HH:MM:SS'));
        }

        try {

            // Check if a parking with the provided name already exists
            const existingParking = await Parking.getParkingData(name);
            if (existingParking) {
                return next(ErrorFac.getMessage(ErrorStatus.resourceAlreadyPresent, `Parking ${name} already exists`));
            }

            next();
        } catch (err) {
            next(ErrorFac.getMessage(ErrorStatus.defaultError));
        }
    }

    // Middleware to validate data for creating a new user record
    async validateUserDataCreation(req: Request, res: Response, next: NextFunction) {
        const { name, surname, email, password, role } = req.body;

        // Check if name is a valid string
        if (!isValidString(name)) {
            return next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound, 'Invalid name. Name must be a string'));
        }

        // Check if surname is a valid string
        if (!isValidString(surname)) {
            return next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound, 'Invalid surname. Surname must be a string'));
        }

        // Check if email is valid string
        if (!isValidString(email) || !validateEmail(email)) {
            return next(ErrorFac.getMessage(ErrorStatus.emailNotValid));
        }

        // Check if password is a valid string
        if (!isValidString(password)) {
            return next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound, 'Invalid password. Password must be a string'));
        }

        // Check if role is valid
        if (!isValidString(role) || role.length > 32 || (role !== 'operatore' && role !== 'automobilista')) {
            return next(ErrorFac.getMessage(
                ErrorStatus.invalidFormatOrResourceNotFound,
                'Invalid role. Role must be a string with maximum length of 32 characters and be either "operatore" or "automobilista"'
            ));
        }

        try {

            // Check if a user with the provided email already exists
            const existingUser = await User.getUserData(email);
            if (existingUser) {
                return next(ErrorFac.getMessage(ErrorStatus.resourceAlreadyPresent, `User ${email} already exists`));
            }

            next();
        } catch (err) {
            next(ErrorFac.getMessage(ErrorStatus.defaultError));
        }
    }

    // Middleware to validate data for creating a new passage record
    async validatePassageDataCreation(req: Request, res: Response, next: NextFunction) {
        const { parking_id, name, entrance, exit } = req.body;

        // Check if parking_id is a number
        if (typeof parking_id !== 'number') {
            return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, 'Invalid parking_id. Parking ID must be a number'));
        }

        try {

            // Check if parking exists
            const parking = await Parking.findByPk(parking_id);
            if (!parking) {
                return next(ErrorFac.getMessage(ErrorStatus.resourceNotFoundError, 'Parking not found'));
            }

            // Check if name is a valid string with a maximum length of 255 characters
            if (!isValidString(name) || name.length > 255) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound,
                    'Invalid name. Name must be a string with maximum length of 255 characters'));
            }

            // Check if entrance is a boolean
            if (typeof entrance !== 'boolean') {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound,
                    'Invalid entrance value. Entrance must be a boolean'));
            }

            // Check if exit is a boolean
            if (typeof exit !== 'boolean') {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound, 'Invalid exit value. Exit must be a boolean'));
            }

            // Check if a passage with the provided name already exists in the same parking
            const existingPassage = await Passage.getPassageData(parking_id, name);
            if (existingPassage) {
                return next(ErrorFac.getMessage(ErrorStatus.resourceAlreadyPresent, `Passage ${name} already existing`));
            }

            next();
        } catch (err) {
            next(ErrorFac.getMessage(ErrorStatus.defaultError));
        }
    }

    // Middleware to validate data for creating a new fee record
    async validateFeeDataCreation(req: Request, res: Response, next: NextFunction) {
        const { parking_id, name, hourly_amount, vehicle_type, night, festive } = req.body;

        // Check if parking_id is a valid positive number
        if (typeof parking_id !== 'number') {
            return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, 'Invalid parking_id. Parking ID must be a number'));
        }

        try {
            // Check if parking exists
            const parking = await Parking.findByPk(parking_id);
            if (!parking) {
                return next(ErrorFac.getMessage(ErrorStatus.resourceNotFoundError, 'Parking not found'));
            }

            // Check if name is a valid string with a maximum length of 255 characters
            if (!isValidString(name) || name.length > 255) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound,
                    'Invalid name. Name must be a string with maximum length of 255 characters'));
            }

            // Check if hourly_amount is a valid decimal number
            if (typeof hourly_amount !== 'number' || validateDecimal(hourly_amount)) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound,
                    'Invalid hourly_amount. Hourly amount must be a decimal number with two decimal places'));
            }

            // Check if vehicle_type is a valid string
            if (!isValidString(vehicle_type) || vehicle_type.length > 32) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound,
                    'Invalid vehicle_type. Vehicle type must be a string with maximum length of 32 characters'));
            }

            // Check if night is a boolean
            if (typeof night !== 'boolean') {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound,
                    'Invalid night value. Night value must be a boolean'));
            }

            // Check if festive is a boolean
            if (typeof festive !== 'boolean') {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound,
                    'Invalid festive value. Festive value must be a boolean'));
            }

            // Check if a fee already exists
            const existingFee = await Fee.getFeeData(parking_id, name);
            if (existingFee) {
                return next(ErrorFac.getMessage(ErrorStatus.resourceAlreadyPresent,
                    `Fee ${name} for parking ${parking_id} already existing`));
            }

            next();
        } catch (err) {
            next(ErrorFac.getMessage(ErrorStatus.defaultError));
        }
    }

    // Middleware to validate data for updating a Transit record
    async validateTransitDataUpdate(req: Request, res: Response, next: NextFunction) {
        const { passage_id, plate, passing_by_date, passing_by_hour, direction, vehicle_type } = req.body;
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const hourRegex = /^\d{2}:\d{2}:\d{2}$/;
        try {
            const passage = await Passage.findByPk(passage_id);
            // Verify if passage_id is a number
            if (passage && (typeof passage_id !== 'number')) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, 'Invalid passage_id. Passage id is expected a number'));
            }
            const plateEx = await Vehicle.findByPk(plate);
            // Verify if plate is a valid string
            if (plateEx && !isValidString(plate)) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, 'Invalid plate. Plate is expected a string'));
            }

            // Verify if passing_by_date is a valid string if it exists
            if (!isValidString(passing_by_date) && passing_by_date && !dateRegex.test(passing_by_date)) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidDateFormat));
            }

            // Verify if passing_by_hour has a valid format if it exists
            if (!isValidString(passing_by_hour) && passing_by_hour && !hourRegex.test(passing_by_hour)) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidHourFormat));
            }

            // Verify if direction has a valid format if it exists
            if (!isValidString(direction) && direction) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, 'Invalid direction. Direction is expected a string'));
            }

            // Verify if vehicle_type is a valid string if it exists
            if (!isValidString(vehicle_type) && vehicle_type) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, 'Invalid vehicle_type. Vehicle_type is expected a string'));
            }

            // Verify if direction has the correct format and values
            if (direction.length !== 1 || (direction !== 'E' && direction !== 'U')) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, 'Invalid direction format. Expected length: 1 character'));
            }

            // Verify if plate has the correct format
            if (plate.length !== 7) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, 'Invalid plate format. Expected length: 7 characters'));
            }

            next();
        } catch (err) {
            next(ErrorFac.getMessage(ErrorStatus.defaultError));
        }

    }

    // Middleware to validate data for updating a Parking record
    validateParkingDataUpdate(req: Request, res: Response, next: NextFunction) {
        const { name, parking_spots, occupied_spots, day_starting_hour, day_finishing_hour } = req.body;

        // Verify if name is a valid string if it exists
        if (!isValidString(name) && name) {
            const specificMessage = 'Invalid name. Name must be a string';
            return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
        }

        // Verify if parking_spots is a valid positive integer if it exists
        if ((typeof parking_spots !== 'number' || !Number.isInteger(parking_spots) || parking_spots <= 0) && parking_spots) {
            const specificMessage = 'Invalid parking_spots. Must be a positive integer';
            return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
        }

        // Verify if occupied_spots is a valid non-negative integer if it exists
        if ((typeof occupied_spots !== 'number' || !Number.isInteger(occupied_spots) || occupied_spots < 0) && occupied_spots) {
            const specificMessage = 'Invalid occupied_spots. Must be a non-negative integer';
            return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
        }

        const hourRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;

        // Verify if day_starting_hour matches the hour format if it exists
        if (!hourRegex.test(day_starting_hour) && day_starting_hour) {
            const specificMessage = 'Invalid day_starting_hour format. Expected format: hh:mm:ss';
            return next(ErrorFac.getMessage(ErrorStatus.invalidHourFormat, specificMessage));
        }

        // Verify if day_finishing_hour matches the hour format if it exists
        if (!hourRegex.test(day_finishing_hour) && day_finishing_hour) {
            const specificMessage = 'Invalid day_finishing_hour format. Expected format: hh:mm:ss';
            return next(ErrorFac.getMessage(ErrorStatus.invalidHourFormat, specificMessage));
        }

        next();
    }

    // Middleware to validate data for updating a User record
    validateUserDataUpdate(req: Request, res: Response, next: NextFunction) {
        const { name, surname, email, password, role } = req.body;

        // Verify if name is a valid string if it exists
        if (!isValidString(name) && name) {
            return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, 'Invalid name. Name must be a string'));
        }

        // Verify if surname is a valid string if it exists
        if (!isValidString(surname) && surname) {
            return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, 'Invalid surname. Surname must be a string'));
        }

        // Verify if email is a valid string and email format if it exists
        if ((!isValidString(email) || !validateEmail(email)) && email) {
            return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, 'Invalid email. Email must be a string'));
        }

        // Verify if password is a valid string if it exists
        if (!isValidString(password) && password) {
            return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, 'Invalid password. Password must be a string'));
        }

        // Verify if role is a valid string and within acceptable values if it exists
        if ((!isValidString(role) || role.length > 32 || (role !== 'operatore' && role !== 'automobilista')) && role) {
            return next(ErrorFac.getMessage(
                ErrorStatus.invalidFormat,
                'Invalid role. Role must be a string with maximum length of 32 characters'
            ));
        }

        next();
    }

    // Middleware to validate data for updating a Passage record
    async validatePassageDataUpdate(req: Request, res: Response, next: NextFunction) {
        const { parking_id, name, entrance, exit } = req.body;
        try {

            const parking = await Parking.findByPk(parking_id);

            // Verify if parking_id is a number
            if (parking && (typeof parking_id !== 'number')) {
                const specificMessage = 'Invalid parking_id. Parking ID must be a number';
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
            }

            // Verify if name is a valid string with a maximum length of 255 characters if it exists
            if (name && (!isValidString(name) || name.length > 255)) {
                const specificMessage = 'Invalid name. Name must be a string with maximum length of 255 characters';
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
            }

            // Verify if entrance is a boolean if it exists
            if (entrance && typeof entrance !== 'boolean') {
                const specificMessage = 'Invalid entrance value. Entrance must be a boolean';
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
            }

            // Verify if exit is a boolean if it exists
            if (exit && typeof exit !== 'boolean') {
                const specificMessage = 'Invalid exit value. Exit must be a boolean';
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
            }

            next();
        } catch (err) {
            next(ErrorFac.getMessage(ErrorStatus.defaultError));
        }

    }

    // Middleware to validate data for updating a Fee record
    async validateFeeDataUpdate(req: Request, res: Response, next: NextFunction) {
        const { parking_id, name, hourly_amount, vehicle_type, night, festive } = req.body;
        try {

            const parking = await Parking.findByPk(parking_id);
            // Verify if parking_id is a number
            if (parking && (typeof parking_id !== 'number')) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, 'Invalid parking_id. Parking ID must be a number'));

            }

            // Verify if name is a valid string with a maximum length of 255 characters if it exists
            if ((!isValidString(name) || name.length > 255) && name) {
                return next(ErrorFac.getMessage(
                    ErrorStatus.invalidFormat,
                    'Invalid name. Name must be a string with maximum length of 255 characters'
                ));
            }

            // Verify if hourly_amount is a valid decimal number with two decimal places if it exists
            if ((typeof hourly_amount !== 'number' || !validateDecimal(hourly_amount)) && hourly_amount) {
                return next(ErrorFac.getMessage(
                    ErrorStatus.invalidFormat,
                    'Invalid hourly_amount. Hourly amount must be a decimal number with two decimal places'
                ));
            }

            // Verify if vehicle_type is a valid string with a maximum length of 32 characters if it exists
            if ((!isValidString(vehicle_type) || vehicle_type.length > 32) && vehicle_type) {
                return next(ErrorFac.getMessage(
                    ErrorStatus.invalidFormat,
                    'Invalid vehicle_type. Vehicle type must be a string with maximum length of 32 characters'
                ));
            }

            // Verify if night is a boolean if it exists
            if (typeof night !== 'boolean' && night) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, 'Invalid night value. Night value must be a boolean'));
            }

            // Verify if festive is a boolean if it exists
            if (typeof festive !== 'boolean' && festive) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, 'Invalid festive value. Festive value must be a boolean'));
            }

            next();
        } catch (err) {
            next(ErrorFac.getMessage(ErrorStatus.defaultError));
        }

    }

    // Middleware to validate data for the request of TransitStatusController
    validateTransitStatusControllerRequest(req: Request, res: Response, next: NextFunction) {

        const dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
        const { plates, startDate, endDate, format } = req.query;
        const { role } = req.body.user;

        let transformedPlates: string[] = [];

        // Process plates parameter to an array of strings
        if (plates) {
            if (typeof plates === 'string') {
                transformedPlates = plates.split(',').map((plate: string) => plate.trim());
            } else if (Array.isArray(plates)) {
                transformedPlates = (plates as string[]).map((plate: string) => plate.trim());
            } else {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, 'Invalid plate format.'));
            }
            req.query.plates = transformedPlates;
        } else {
            return next(ErrorFac.getMessage(ErrorStatus.resourceNotFoundError, 'Plate not found, is required'));
        };

        // Verify if startDate is a valid string and matches the dateTime format
        if (!isValidString(startDate) || !dateTimeRegex.test(startDate as string) || !startDate) {
            return next(
                ErrorFac.getMessage(
                    ErrorStatus.invalidFormat,
                    'Invalid startDate. StartDate is expected a string with format AAAA-MM-GG HH:MM:SS'
                ));
        }

        // Verify if endDate is a valid string and matches the dateTime format
        if (!isValidString(endDate) || !dateTimeRegex.test(endDate as string) || !endDate) {
            return next(
                ErrorFac.getMessage(
                    ErrorStatus.invalidFormat,
                    'Invalid endDate. EndDate is expected a string with format AAAA-MM-GG HH:MM:SS'
                ));
        }

        // Verify if role is a valid string within acceptable values
        if ((!isValidString(role) || role.length > 32 || (role !== 'operatore' && role !== 'automobilista')) || !role) {

            return next(ErrorFac.getMessage(
                ErrorStatus.invalidFormat,
                'Invalid role. Role must be a string with maximum length of 32 characters'
            ));
        }

        // Verify if format is a valid string and within acceptable values
        if ((!isValidString(format) || (format !== 'json' && format !== 'pdf')) || !format) {
            return next(ErrorFac.getMessage(
                ErrorStatus.invalidFormat,
                'Invalid format. Format must be a string and must be json or pdf'
            ));
        }

        next();
    }

    // Middleware to validate data for the request of GeneralParkingController and SingleParkingController
    validateParkStatsRequest(req: Request, res: Response, next: NextFunction) {
        const { startDate, endDate, format } = req.query;
        const dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

        // Verify if startDate is a valid string and matches the dateTime format
        if (!isValidString(startDate) || !dateTimeRegex.test(startDate as string) || !startDate) {
            return next(
                ErrorFac.getMessage(
                    ErrorStatus.invalidFormat,
                    'Invalid startDate. StartDate is expected a string with format AAAA-MM-GG HH:MM:SS'
                ));
        }

        // Verify if endDate is a valid string and matches the dateTime format
        if (!isValidString(endDate) || !dateTimeRegex.test(endDate as string) || !endDate) {
            return next(
                ErrorFac.getMessage(
                    ErrorStatus.invalidFormat,
                    'Invalid endDate. EndDate is expected a string with format AAAA-MM-GG HH:MM:SS'
                ));
        }

        // Verify if format is a valid string and within acceptable values
        if (format && (!isValidString(format) || (format !== 'json' && format !== 'pdf'))) {
            return next(ErrorFac.getMessage(
                ErrorStatus.invalidFormat,
                'Invalid format. Format must be a string and must be json or pdf'
            ));
        }
        next();
    }
}

// Helper function to check if a value is a valid string
export function isValidString(value: any): boolean {
    return typeof value === 'string' && value.trim().length > 0;
}

// Helper function to validate if a value is a valid decimal number with two decimal places
export function validateDecimal(value: any): boolean {
    return typeof value === 'number' && !isNaN(value) && value.toFixed(2).toString() === value.toString();

}
// Helper function to validate email format
export function validateEmail(email: string): boolean {
    // Regular expression to validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Export an instance of validateData
export default new validateData();