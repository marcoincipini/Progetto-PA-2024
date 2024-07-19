// Import necessary modules 
import { Request, Response, NextFunction } from 'express';
import { Model, ModelStatic } from 'sequelize';

// Import the models
import Parking from '../models/Parking';
import Passage from '../models/Passage';

// Import the factories
import { errorFactory } from '../factory/ErrorMessage';
import { ErrorStatus } from '../factory/Status'

// Initialize the error factory instance
const ErrorFac: errorFactory = new errorFactory();

class globalCheck {

    // Middleware to check if a record exists in the database
    checkRecordExists<T extends Model>(model: ModelStatic<T>) {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {

                // Extract the ID from the request parameters
                const id = req.params.id as unknown as number | string;

                // Find the record by its primary key
                const record = await model.findByPk(id);

                // If the record does not exist, return a resource not found error
                if (!record) {
                    next(ErrorFac.getMessage(ErrorStatus.resourceNotFoundError, "Record not found or does not exist"));
                }

                // If the record exists, proceed to the next middleware
                next();
            } catch (err) {
                // Handle errors
                next(ErrorFac.getMessage(ErrorStatus.functionNotWorking, `Error checking ${model.name} existence`));
            }
        };
    }

    // Middleware to check the parking capacity
    async checkParkingCapacity(req: Request, res: Response, next: NextFunction) {
        try {
            // Extract passage_id from the request body
            const { passage_id } = req.body; 

             // If passage_id is not provided, return a function not working error
            if (!passage_id) {
                next(ErrorFac.getMessage(ErrorStatus.functionNotWorking, "Passage id is required"));
            }

            // Find the passage associated with the provided passage_id
            const passage = await Passage.findByPk(passage_id);

            // If the passage does not exist, return a resource not found error
            if (!passage) {
                next(ErrorFac.getMessage(ErrorStatus.resourceNotFoundError, "Passage not found or does not exist"));
            }

            const parking_id = passage.parking_id;

            // Find the parking associated with the passage
            const parking = await Parking.findByPk(parking_id);

            // If the parking does not exist, return a resource not found error
            if (!parking) {
                next(ErrorFac.getMessage(ErrorStatus.resourceNotFoundError, "Parking not found or does not exist"));
            }

            // Check if the parking is full
            if (parking.occupied_spots >= parking.parking_spots) {
                next(ErrorFac.getMessage(ErrorStatus.functionNotWorking, 'Parking is full. No more spots available'));
            }

            // If parking is not full, proceed to the next middleware
            next();
        } catch (err) {
            // Handle errors
            next(ErrorFac.getMessage(ErrorStatus.functionNotWorking, 'Error checking parking capacity'));
        }
    }

}

// Export an instance of globalCheck
export default new globalCheck();