import { Request, Response, NextFunction } from 'express';
import { Model, ModelStatic } from 'sequelize';
import Parking from '../models/Parking';
import Passage from '../models/Passage';
import User from '../models/User';
import { errorFactory  } from '../factory/ErrorMessage';
import { Error } from '../factory/Status'

class globalCheck {
    validateString(req: Request, res: Response, next: NextFunction) {
        const { param } = req.body;

        if (typeof param !== 'string') {
            next(Error.invalidFormat);
        }

        next();
    }


    async checkRole(req: Request, res: Response, next: NextFunction) {
        const { email } = req.body;
        const user = await User.getUserData(email);

        if (user) {
            console.log("Logging in as " + user.role);
            next();
        } else {
            console.log("User not found or does not exist");
            next(Error.resourceNotFoundError);
        }
    };

    checkRecordExists<T extends Model>(model: ModelStatic<T>) {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                const id = req.params.id as unknown as number | string;
                const record = await model.findByPk(id);

                if (!record) {
                    console.log("Record not found or does not exist");
                    next(Error.resourceNotFoundError);
                }

                next();
            } catch (error) {
                console.error(`Error checking ${model.name} existence:`, error);
                next(Error.functionNotWorking);
            }
        };
    }

    async checkParkingCapacity(req: Request, res: Response, next: NextFunction) {
        try {
            const { passage_id } = req.body; // Supponendo che l'ID del passage sia passato nel corpo della richiesta
    
            if (!passage_id) {
                console.log("Passage id is required");
                next(Error.functionNotWorking);
            }
    
            // Trova il passage associato
            const passage = await Passage.findByPk(passage_id);
    
            if (!passage) {
                console.log("Passage not found or does not exist");
                next(Error.resourceNotFoundError);
            }
    
            const parking_id = passage.parking_id;
    
            // Trova il parcheggio associato
            const parking = await Parking.findByPk(parking_id);
    
            if (!parking) {
                console.log("Parking not found or does not exist");
                next(Error.resourceNotFoundError);
            }
    
            if (parking.occupied_spots >= parking.parking_spots) {
                console.log('Parking is full. No more spots available' );
                next(Error.functionNotWorking);
            }
    
            next();
        } catch (error) {
            console.error('Error checking parking capacity:', error);
            next(Error.functionNotWorking);
        }
    }

}
export default new globalCheck();