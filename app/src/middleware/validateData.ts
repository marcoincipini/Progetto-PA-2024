import { Request, Response, NextFunction } from 'express';
import Parking from '../models/Parking';
import Passage from '../models/Passage';
import Vehicle from '../models/Vehicle';
import { errorFactory } from '../factory/ErrorMessage';
import { ErrorStatus } from '../factory/Status'
import User from '../models/User';
import Fee from '../models/Fee';
import Transit from '../models/Transit';

const ErrorFac: errorFactory = new errorFactory();

class validateData {

    // Middleware per validare il parametro ID nella richiesta
    validateRequestId(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;

        if (!id || isNaN(Number(id))) {
            return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, 'Invalid ID'));
        }


        next();
    }

    async validateTransitDataCreation(req: Request, res: Response, next: NextFunction) {
        const { passage_id, plate, passing_by_date, passing_by_hour, direction, vehicle_type } = req.body;
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const hourRegex = /^\d{2}:\d{2}:\d{2}$/;
        try {
            // Verifica se passage_id è valido e se il passage esiste
            if (typeof passage_id !== 'number') {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound, 'Invalid passage_id. Passage id is expected a number'));
            }
            const passage = await Passage.findByPk(passage_id);
            if (!passage) {
                return next(ErrorFac.getMessage(ErrorStatus.resourceNotFoundError, "Passage not found or does not exist"));
            }

            // Verifica se plate è valido e se il veicolo esiste
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

            // Verifica se passing_by_date è valido
            if (!isValidString(passing_by_date) || !dateRegex.test(passing_by_date)) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidDateFormat, 'Invalid passing_by_date. Expected format: YYYY-MM-DD'));
            }

            // Verifica se passing_by_hour è valido
            if (!isValidString(passing_by_hour) || !hourRegex.test(passing_by_hour)) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidHourFormat, 'Invalid passing_by_hour. Expected format: HH:MM:SS'));
            }

            // Verifica se direction è valida
            if (!isValidString(direction) || direction.length !== 1 || (direction !== 'E' && direction !== 'U')) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, 'Invalid direction format. Expected length: 1 character (E or U)'));
            }

            // Verifica se vehicle_type è valido
            if (!isValidString(vehicle_type)) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound, 'Invalid vehicle_type. Vehicle type is expected a string'));
            }

            // Verifica se esiste già un transit con i dati forniti
            const existingTransit = await Transit.getTransitData(passage_id, plate, passing_by_date, passing_by_hour);
            if (existingTransit) {
                return next(ErrorFac.getMessage(ErrorStatus.resourceAlreadyPresent, 'Transit already existing'));
            }

            next();
        } catch (err) {
            return next(ErrorFac.getMessage(ErrorStatus.defaultError));
        }

    }

    async validateParkingDataCreation(req: Request, res: Response, next: NextFunction) {
        const { name, parking_spots, occupied_spots, day_starting_hour, day_finishing_hour } = req.body;

        // Verifica se il nome è valido
        if (!isValidString(name)) {
            const specificMessage = 'Invalid name. Name must be a string';
            return next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound, specificMessage));
        }

        // Verifica se parking_spots è valido
        if (typeof parking_spots !== 'number' || !Number.isInteger(parking_spots) || parking_spots <= 0) {
            return next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound, 'Invalid parking_spots. Must be a positive integer'));
        }

        // Verifica se occupied_spots è valido
        if (typeof occupied_spots !== 'number' || !Number.isInteger(occupied_spots) || occupied_spots < 0) {
            return next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound, 'Invalid occupied_spots. Must be a non-negative integer'));
        }

        // Verifica se day_starting_hour è valido
        const hourRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
        if (!isValidString(day_starting_hour) || !hourRegex.test(day_starting_hour)) {
            return next(ErrorFac.getMessage(ErrorStatus.invalidHourFormat, 'Invalid day_starting_hour. Expected format: HH:MM:SS'));
        }

        // Verifica se day_finishing_hour è valido
        if (!isValidString(day_finishing_hour) || !hourRegex.test(day_finishing_hour)) {
            return next(ErrorFac.getMessage(ErrorStatus.invalidHourFormat, 'Invalid day_finishing_hour. Expected format: HH:MM:SS'));
        }

        try {
            // Verifica se esiste già un parcheggio con il nome fornito
            const existingParking = await Parking.getParkingData(name);
            if (existingParking) {
                return next(ErrorFac.getMessage(ErrorStatus.resourceAlreadyPresent, `Parking ${name} already exists`));
            }

            next();
        } catch (err) {
            next(ErrorFac.getMessage(ErrorStatus.defaultError));
        }
    }

    async validateUserDataCreation(req: Request, res: Response, next: NextFunction) {
        const { name, surname, email, password, role } = req.body;

        // Verifica se il nome è valido
        if (!isValidString(name)) {
            return next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound, 'Invalid name. Name must be a string'));
        }

        // Verifica se il cognome è valido
        if (!isValidString(surname)) {
            return next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound, 'Invalid surname. Surname must be a string'));
        }

        // Verifica se l'email è valida
        if (!isValidString(email) || !validateEmail(email)) {
            return next(ErrorFac.getMessage(ErrorStatus.emailNotValid));
        }

        // Verifica se la password è valida
        if (!isValidString(password)) {
            return next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound, 'Invalid password. Password must be a string'));
        }

        // Verifica se il ruolo è valido
        if (!isValidString(role) || role.length > 32 || (role !== 'operatore' && role !== 'automobilista')) {
            return next(ErrorFac.getMessage(
                ErrorStatus.invalidFormatOrResourceNotFound,
                'Invalid role. Role must be a string with maximum length of 32 characters and be either "operatore" or "automobilista"'
            ));
        }

        try {
            // Verifica se esiste già un utente con l'email fornita
            const existingUser = await User.getUserData(email);
            if (existingUser) {
                return next(ErrorFac.getMessage(ErrorStatus.resourceAlreadyPresent, `User ${email} already exists`));
            }

            next();
        } catch (err) {
            next(ErrorFac.getMessage(ErrorStatus.defaultError));
        }
    }

    async validatePassageDataCreation(req: Request, res: Response, next: NextFunction) {
        const { parking_id, name, entrance, exit } = req.body;

        // Verifica se il parking_id è valido
        if (typeof parking_id !== 'number') {
            return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, 'Invalid parking_id. Parking ID must be a number'));
        }

        try {
            // Verifica se il parcheggio esiste
            const parking = await Parking.findByPk(parking_id);
            if (!parking) {
                return next(ErrorFac.getMessage(ErrorStatus.resourceNotFoundError, 'Parking not found'));
            }

            // Verifica se il nome è valido
            if (!isValidString(name) || name.length > 255) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound,
                    'Invalid name. Name must be a string with maximum length of 255 characters'));
            }

            // Verifica se l'entrata è valida
            if (typeof entrance !== 'boolean') {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound,
                    'Invalid entrance value. Entrance must be a boolean'));
            }

            // Verifica se l'uscita è valida
            if (typeof exit !== 'boolean') {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound, 'Invalid exit value. Exit must be a boolean'));
            }

            // Verifica se il passaggio esiste già
            const existingPassage = await Passage.getPassageData(parking_id, name);
            if (existingPassage) {
                return next(ErrorFac.getMessage(ErrorStatus.resourceAlreadyPresent, `Passage ${name} already existing`));
            }

            next();
        } catch (err) {
            next(ErrorFac.getMessage(ErrorStatus.defaultError));
        }
    }

    async validateFeeDataCreation(req: Request, res: Response, next: NextFunction) {
        const { parking_id, name, hourly_amount, vehicle_type, night, festive } = req.body;
        // Verifica se il parking_id è valido
        if (typeof parking_id !== 'number') {
            return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, 'Invalid parking_id. Parking ID must be a number'));
        }

        try {
            // Verifica se il parcheggio esiste
            const parking = await Parking.findByPk(parking_id);
            if (!parking) {
                return next(ErrorFac.getMessage(ErrorStatus.resourceNotFoundError, 'Parking not found'));
            }

            // Verifica se il nome è valido
            if (!isValidString(name) || name.length > 255) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound,
                    'Invalid name. Name must be a string with maximum length of 255 characters'));
            }

            // Verifica se hourly_amount è valido
            if (typeof hourly_amount !== 'number' || validateDecimal(hourly_amount)) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound,
                    'Invalid hourly_amount. Hourly amount must be a decimal number with two decimal places'));
            }

            // Verifica se vehicle_type è valido
            if (!isValidString(vehicle_type) || vehicle_type.length > 32) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound,
                    'Invalid vehicle_type. Vehicle type must be a string with maximum length of 32 characters'));
            }

            // Verifica se night è valido
            if (typeof night !== 'boolean') {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound,
                    'Invalid night value. Night value must be a boolean'));
            }

            // Verifica se festive è valido
            if (typeof festive !== 'boolean') {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormatOrResourceNotFound,
                    'Invalid festive value. Festive value must be a boolean'));
            }

            // Verifica se la tariffa esiste già
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

    async validateTransitDataUpdate(req: Request, res: Response, next: NextFunction) {
        const { passage_id, plate, passing_by_date, passing_by_hour, direction, vehicle_type } = req.body;
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const hourRegex = /^\d{2}:\d{2}:\d{2}$/;
        try {
            // Verifica se passage_id è un numero
            if (typeof passage_id !== 'number') {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, 'Invalid passage_id. Passage id is expected a number'));
            }

            // Verifica se passage_id esiste nel database
            const passage = await Passage.findByPk(passage_id);
            if (!passage) {
                return next(ErrorFac.getMessage(ErrorStatus.resourceNotFoundError, 'Passage not found'));
            }

            if (!isValidString(plate)) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, 'Invalid plate. Plate is expected a string'));
            }

            const plateEx = await Vehicle.findByPk(plate);
            if (!plateEx) {
                return next(ErrorFac.getMessage(ErrorStatus.resourceNotFoundError, 'Plate not found'));
            }

            if (!isValidString(passing_by_date) && passing_by_date) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, 'Invalid passing_by_date. Passing_by_date is expected a string'));
            }

            if (!isValidString(passing_by_hour) && passing_by_hour) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, 'Invalid passing_by_hour. Passing_by_hour is expected a string'));
            }

            if (!isValidString(direction) && direction) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, 'Invalid direction. Direction is expected a string'));
            }

            if (!isValidString(vehicle_type) && vehicle_type) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, 'Invalid vehicle_type. Vehicle_type is expected a string'));
            }

            if (!dateRegex.test(passing_by_date)) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidDateFormat));
            }

            if (!hourRegex.test(passing_by_hour)) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidHourFormat));
            }

            if (direction.length !== 1 || (direction !== 'E' && direction !== 'U')) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, 'Invalid direction format. Expected length: 1 character'));
            }

            if (plate.length !== 7) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, 'Invalid plate format. Expected length: 7 characters'));
            }
            next();
        } catch (err) {
            next(ErrorFac.getMessage(ErrorStatus.defaultError));
        }
     
    }

    validateParkingDataUpdate(req: Request, res: Response, next: NextFunction) {
        const { name, parking_spots, occupied_spots, day_starting_hour, day_finishing_hour } = req.body;

        if (!isValidString(name) && name) {
            const specificMessage = 'Invalid name. Name must be a string';
            return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
        }

        if ((typeof parking_spots !== 'number' || !Number.isInteger(parking_spots) || parking_spots <= 0) && parking_spots) {
            const specificMessage = 'Invalid parking_spots. Must be a positive integer';
            return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
        }

        if ((typeof occupied_spots !== 'number' || !Number.isInteger(occupied_spots) || occupied_spots < 0) && occupied_spots) {
            const specificMessage = 'Invalid occupied_spots. Must be a non-negative integer';
            return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
        }

        const hourRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;

        if (!hourRegex.test(day_starting_hour) && day_starting_hour) {
            const specificMessage = 'Invalid day_starting_hour format. Expected format: hh:mm:ss';
            return next(ErrorFac.getMessage(ErrorStatus.invalidHourFormat, specificMessage));
        }

        if (!hourRegex.test(day_finishing_hour) && day_finishing_hour) {
            const specificMessage = 'Invalid day_finishing_hour format. Expected format: hh:mm:ss';
            return next(ErrorFac.getMessage(ErrorStatus.invalidHourFormat, specificMessage));
        }

        next();
    }

    validateUserDataUpdate(req: Request, res: Response, next: NextFunction) {
        const { name, surname, email, password, role } = req.body;

        if (!isValidString(name) && name) {
            return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, 'Invalid name. Name must be a string'));
        }

        if (!isValidString(surname) && surname) {
            return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, 'Invalid surname. Surname must be a string'));
        }

        if ((!isValidString(email) || !validateEmail(email)) && email) {
            return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, 'Invalid email. Email must be a string'));
        }

        if (!isValidString(password) && password) {
            return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, 'Invalid password. Password must be a string'));
        }

        if ((!isValidString(role) || role.length > 32 || (role !== 'operatore' && role !== 'automobilista')) && role) {
            return next(ErrorFac.getMessage(
                ErrorStatus.invalidFormat,
                'Invalid role. Role must be a string with maximum length of 32 characters'
            ));
        }

        next();
    }

    async validatePassageDataUpdate(req: Request, res: Response, next: NextFunction) {
        const { parking_id, name, entrance, exit } = req.body;
        try {
            const parking = await Parking.findByPk(parking_id);

            if (typeof parking_id !== 'number') {
                const specificMessage = 'Invalid parking_id. Parking ID must be a number';
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
            }
            if (!parking) {
                return next(ErrorFac.getMessage(ErrorStatus.resourceNotFoundError, 'Parking not found'));
            }

            if (name && (!isValidString(name) || name.length > 255)) {
                const specificMessage = 'Invalid name. Name must be a string with maximum length of 255 characters';
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
            }

            if (entrance && typeof entrance !== 'boolean') {
                const specificMessage = 'Invalid entrance value. Entrance must be a boolean';
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
            }

            if (exit && typeof exit !== 'boolean') {
                const specificMessage = 'Invalid exit value. Exit must be a boolean';
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
            }

            next();
        } catch (err) {
            next(ErrorFac.getMessage(ErrorStatus.defaultError));
        }
        
    }

    async validateFeeDataUpdate(req: Request, res: Response, next: NextFunction) {
        const { parking_id, name, hourly_amount, vehicle_type, night, festive } = req.body;
        try {


            if (typeof parking_id !== 'number') {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, 'Invalid parking_id. Parking ID must be a number'));

            }

            const parking = await Parking.findByPk(parking_id);

            if (!parking) {
                return next(ErrorFac.getMessage(ErrorStatus.resourceNotFoundError, 'Parking not found'));
            }

            if ((!isValidString(name) || name.length > 255) && name) {
                return next(ErrorFac.getMessage(
                    ErrorStatus.invalidFormat,
                    'Invalid name. Name must be a string with maximum length of 255 characters'
                ));
            }

            if ((typeof hourly_amount !== 'number' || !validateDecimal(hourly_amount)) && hourly_amount) {
                return next(ErrorFac.getMessage(
                    ErrorStatus.invalidFormat,
                    'Invalid hourly_amount. Hourly amount must be a decimal number with two decimal places'
                ));
            }

            if ((!isValidString(vehicle_type) || vehicle_type.length > 32) && vehicle_type) {
                return next(ErrorFac.getMessage(
                    ErrorStatus.invalidFormat,
                    'Invalid vehicle_type. Vehicle type must be a string with maximum length of 32 characters'
                ));
            }

            if (typeof night !== 'boolean' && night) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, 'Invalid night value. Night value must be a boolean'));
            }

            if (typeof festive !== 'boolean' && festive) {
                return next(ErrorFac.getMessage(ErrorStatus.invalidFormat, 'Invalid festive value. Festive value must be a boolean'));
            }
            next();
        } catch (err) {
            next(ErrorFac.getMessage(ErrorStatus.defaultError));
        }
     
    }

    validateTransitStatusControllerRequest(req: Request, res: Response, next: NextFunction) {

        const dateTimeRegex = /^\d{4}-\d{2}-\d{2} d{2}:\d{2}:\d{2}$/;
        const { plates, startDate, endDate, format } = req.query;
        const { role } = req.body;

        let transformedPlates: string[] = [];
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

        if (!isValidString(startDate) || !dateTimeRegex.test(startDate as string) || !startDate) {
            return next(
                ErrorFac.getMessage(
                    ErrorStatus.invalidFormat,
                    'Invalid startDate. StartDate is expected a string with format AAAA-MM-GG%HH:MM:SS'
                ));
        }

        if (!isValidString(endDate) || !dateTimeRegex.test(endDate as string) || !endDate) {
            return next(
                ErrorFac.getMessage(
                    ErrorStatus.invalidFormat,
                    'Invalid endDate. EndDate is expected a string with format AAAA-MM-GG%HH:MM:SS'
                ));
        }

        if ((!isValidString(role) || role.length > 32 || (role !== 'operatore' && role !== 'automobilista')) || !role) {
            return next(ErrorFac.getMessage(
                ErrorStatus.invalidFormat,
                'Invalid role. Role must be a string with maximum length of 32 characters'
            ));
        }
        if ((!isValidString(format) || (format !== 'json' && format !== 'pdf')) || !format) {
            return next(ErrorFac.getMessage(
                ErrorStatus.invalidFormat,
                'Invalid format. Format must be a string and must be json or pdf'
            ));
        }
        next();
    }

    validateParkStatsRequest(req: Request, res: Response, next: NextFunction) {
        const { startDate, endDate, format } = req.query;
        const dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

        if (!isValidString(startDate) || !dateTimeRegex.test(startDate as string) || !startDate) {
            return next(
                ErrorFac.getMessage(
                    ErrorStatus.invalidFormat,
                    'Invalid startDate. StartDate is expected a string with format AAAA-MM-GG%HH:MM:SS'
                ));
        }

        if (!isValidString(endDate) || !dateTimeRegex.test(endDate as string) || !endDate) {
            return next(
                ErrorFac.getMessage(
                    ErrorStatus.invalidFormat,
                    'Invalid endDate. EndDate is expected a string with format AAAA-MM-GG%HH:MM:SS'
                ));
        }

        if ((!isValidString(format) || (format !== 'json' && format !== 'pdf')) || !format) {
            return next(ErrorFac.getMessage(
                ErrorStatus.invalidFormat,
                'Invalid format. Format must be a string and must be json or pdf'
            ));
        }
        next();
    }
}

export function isValidString(value: any): boolean {
    return typeof value === 'string' && value.trim().length > 0;
}

export function validateDecimal(value: any): boolean {
    return typeof value === 'number' && !isNaN(value) && value.toFixed(2).toString() === value.toString();

}

export function validateEmail(email: string): boolean {
    // Regular expression to validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
export default new validateData();