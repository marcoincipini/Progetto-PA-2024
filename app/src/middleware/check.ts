import { Request, Response, NextFunction } from 'express';
import { Model, ModelStatic } from 'sequelize';
import Parking from '../models/Parking';
import Passage from '../models/Passage';
import User from '../models/User';
import { errorFactory } from '../factory/ErrorMessage';
import { ErrorStatus } from '../factory/Status'

const ErrorFac: errorFactory = new errorFactory();

class globalCheck {

    checkRecordExists<T extends Model>(model: ModelStatic<T>) {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                const id = req.params.id as unknown as number | string;
                const record = await model.findByPk(id);

                if (!record) {
                    next(ErrorFac.getMessage(ErrorStatus.resourceNotFoundError, "Record not found or does not exist"));
                }

                next();
            } catch (err) {
                next(ErrorFac.getMessage(ErrorStatus.functionNotWorking, `Error checking ${model.name} existence`));
            }
        };
    }

    async checkParkingCapacity(req: Request, res: Response, next: NextFunction) {
        try {
            const { passage_id } = req.body; // Supponendo che l'ID del passage sia passato nel corpo della richiesta

            if (!passage_id) {
                next(ErrorFac.getMessage(ErrorStatus.functionNotWorking, "Passage id is required"));
            }

            // Trova il passage associato
            const passage = await Passage.findByPk(passage_id);

            if (!passage) {
                next(ErrorFac.getMessage(ErrorStatus.resourceNotFoundError, "Passage not found or does not exist"));
            }

            const parking_id = passage.parking_id;

            // Trova il parcheggio associato
            const parking = await Parking.findByPk(parking_id);

            if (!parking) {
                next(ErrorFac.getMessage(ErrorStatus.resourceNotFoundError, "Parking not found or does not exist"));
            }

            if (parking.occupied_spots >= parking.parking_spots) {
                next(ErrorFac.getMessage(ErrorStatus.functionNotWorking, 'Parking is full. No more spots available'));
            }

            next();
        } catch (err) {
            next(ErrorFac.getMessage(ErrorStatus.functionNotWorking, 'Error checking parking capacity'));
        }
    }

}
export default new globalCheck();