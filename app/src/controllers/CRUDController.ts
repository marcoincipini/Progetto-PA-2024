import { Request, Response } from 'express';
import { Model, ModelStatic, WhereOptions } from 'sequelize';
import Transit from '../models/Transit';
import { errorFactory  } from '../factory/ErrorMessage';
import { Error } from '../factory/Status'

// Helper per definire il tipo di WhereOptions
const whereId = <T>(id: string | number): WhereOptions<T> => ({ id } as unknown as WhereOptions<T>);

class CRUDController {

    // Create a Model 
    async createRecord<T extends Model>(model: ModelStatic<T>, req: Request, res: Response): Promise<Response> {
        try {
            const record = await model.create(req.body);
            return res.status(201).json(record);
        } catch (error) {
            console.error(`Error creating ${model.name}:`, error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Retrieve a Model by ID
    async getRecord<T extends Model>(model: ModelStatic<T>, req: Request, res: Response): Promise<Response> {
        const id = req.params.id as unknown as number | string;
        const record = await model.findByPk(id);
        return res.status(200).json(record);
    }

    // Update a Model by ID
    async updateRecord<T extends Model>(model: ModelStatic<T>, req: Request, res: Response): Promise<Response> {
        try {
            const id = req.params.id as unknown as number | string;
            await model.update(req.body, {
                where: whereId<T>(id),
            });
            const updatedRecord = await model.findByPk(id);
            return res.status(200).json(updatedRecord);
        } catch (error) {
            console.error(`Error updating ${model.name}:`, error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Delete a Model by ID
    async deleteRecord<T extends Model>(model: ModelStatic<T>, req: Request, res: Response): Promise<Response> {
        const id = req.params.id as unknown as number | string;
        await model.destroy({
            where: whereId<T>(id),
        });
        return res.status(204).send();
    }

}
export default new CRUDController();


