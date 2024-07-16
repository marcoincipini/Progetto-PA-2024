import { Request, Response } from 'express';
import { Model, ModelStatic, WhereOptions } from 'sequelize';
import Transit from '../models/Transit';
import { errorFactory } from '../factory/ErrorMessage';
import { successFactory } from '../factory/SuccessMessage';
import { ErrorStatus, SuccessStatus } from '../factory/Status'

const ErrorFac: errorFactory = new errorFactory();
const SuccessFac: successFactory = new successFactory();

// Helper per definire il tipo di WhereOptions
const whereId = <T>(id: string | number): WhereOptions<T> => ({ id } as unknown as WhereOptions<T>);

type results = {
    message: any;
    data: any;
}
class CRUDController {

    // Create a Model 
    async createRecord<T extends Model>(model: ModelStatic<T>, req: Request, res: Response): Promise<any> {
        var result: any;
        
        try {
            const record = await model.create(req.body);
            const specificMessage = `Creating ${model.name} succeded`;
            const successMessage = SuccessFac.getMessage(SuccessStatus.creationSuccess, specificMessage);
            result = res.json({ message: successMessage, data: { record }});
        } catch (error) {
            const specificMessage = `Error creating ${model.name}`;
            result = ErrorFac.getMessage(ErrorStatus.creationInternalServerError, specificMessage);
        }
        return result;
    }

    // Retrieve a Model by ID
    async getRecord<T extends Model>(model: ModelStatic<T>, req: Request, res: Response): Promise<Response> {
        var result: any;
        try {
            const id = req.params.id as unknown as number | string;
            const record = await model.findByPk(id);
            const specificMessage = `Reading ${model.name} succeded`;
            const successMessage = SuccessFac.getMessage(SuccessStatus.readSuccess, specificMessage);
            result = res.json({ message: successMessage, data: { record }});
        } catch (error) {
            const specificMessage = `Error retrieving ${model.name}:`;
            result = ErrorFac.getMessage(ErrorStatus.readInternalServerError, specificMessage);
        }
        return result;
    }

    // Update a Model by ID
    async updateRecord<T extends Model>(model: ModelStatic<T>, req: Request, res: Response): Promise<Response> {
        var result: any;
        try {
            const id = req.params.id as unknown as number | string;
            await model.update(req.body, {
                where: whereId<T>(id),
            });
            const record = await model.findByPk(id);
            const specificMessage = `Updating ${model.name} succeded`;
            const successMessage = SuccessFac.getMessage(SuccessStatus.updateSuccess, specificMessage);
            result = res.json({ message: successMessage, data: { record }});
        } catch (error) {
            const specificMessage = `Error updating ${model.name}:`;
            result = ErrorFac.getMessage(ErrorStatus.updateInternalServerError, specificMessage);
        }

        return result;
    }

    // Delete a Model by ID
    async deleteRecord<T extends Model>(model: ModelStatic<T>, req: Request, res: Response): Promise<Response> {
        var result: any;
        try {
            const id = req.params.id as unknown as number | string;
            await model.destroy({
                where: whereId<T>(id),
            });
            const specificMessage = `Deleting ${model.name} succeded`;
            const successMessage = SuccessFac.getMessage(SuccessStatus.deleteSuccess, specificMessage);
            result = res.json({ message: successMessage});
        } catch (error) {
            const specificMessage = `Error deleting ${model.name}:`;
            result = ErrorFac.getMessage(ErrorStatus.deleteInternalServerError, specificMessage);
        }

        return result;
    }
}
export default new CRUDController();


