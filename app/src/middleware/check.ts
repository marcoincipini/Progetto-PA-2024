import { Request, Response, NextFunction } from 'express';
import { Model, ModelStatic } from 'sequelize';
import Parking from '../models/Parking';
import Passage from '../models/Passage';
import User from '../models/User';
import { errorFactory  } from '../factory/ErrorMessage';
import { ErrorStatus } from '../factory/Status'

const ErrorFac: errorFactory = new errorFactory();

class globalCheck {
    validateString(req: Request, res: Response, next: NextFunction) {
        const { param } = req.body;

        if (typeof param !== 'string') {
            const specificMessage = "The parameter must be a string";
            next(ErrorFac.getMessage(ErrorStatus.invalidFormat, specificMessage));
        }

        next();
    }


    async checkRole(req: Request, res: Response, next: NextFunction) {
        const { email } = req.body;
        const user = await User.getUserData(email);

        if (user) {
            //success message
            const specificMessage = "Logging in as " + user.role;
            next();
        } else {
            const specificMessage = "User not found or does not exist";
            next(ErrorFac.getMessage(ErrorStatus.resourceNotFoundError, specificMessage));
        }
    };

    checkRecordExists<T extends Model>(model: ModelStatic<T>) {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                const id = req.params.id as unknown as number | string;
                const record = await model.findByPk(id);

                if (!record) {
                    const specificMessage = "Record not found or does not exist";
                    next(ErrorFac.getMessage(ErrorStatus.resourceNotFoundError, specificMessage));
                }

                next();
            } catch (error) {
                const specificMessage = `Error checking ${model.name} existence:`;
                next(ErrorFac.getMessage(ErrorStatus.functionNotWorking, specificMessage));
            }
        };
    }

    async checkParkingCapacity(req: Request, res: Response, next: NextFunction) {
        try {
            const { passage_id } = req.body; // Supponendo che l'ID del passage sia passato nel corpo della richiesta
    
            if (!passage_id) {
                const specificMessage = "Passage id is required";
                next(ErrorFac.getMessage(ErrorStatus.functionNotWorking, specificMessage));
            }
    
            // Trova il passage associato
            const passage = await Passage.findByPk(passage_id);
    
            if (!passage) {
                const specificMessage = "Passage not found or does not exist";
                next(ErrorFac.getMessage(ErrorStatus.resourceNotFoundError, specificMessage));
            }
    
            const parking_id = passage.parking_id;
    
            // Trova il parcheggio associato
            const parking = await Parking.findByPk(parking_id);
    
            if (!parking) {
                const specificMessage = "Parking not found or does not exist";
                next(ErrorFac.getMessage(ErrorStatus.resourceNotFoundError, specificMessage));
            }
    
            if (parking.occupied_spots >= parking.parking_spots) {
                const specificMessage = 'Parking is full. No more spots available';
                next(ErrorFac.getMessage(ErrorStatus.functionNotWorking, specificMessage));
            }
    
            next();
        } catch (error) {
            const specificMessage = 'Error checking parking capacity:';
            next(ErrorFac.getMessage(ErrorStatus.functionNotWorking, specificMessage));
        }
    }

}
export default new globalCheck();