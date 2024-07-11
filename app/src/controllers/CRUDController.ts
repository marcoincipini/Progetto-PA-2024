import { Request, Response } from 'express';
import { Model, ModelStatic, WhereOptions } from 'sequelize';

// Helper per definire il tipo di WhereOptions
const whereId = <T>(id: string | number): WhereOptions<T> => ({ id } as unknown as WhereOptions<T>);

class CRUDController {


    async createRecord<T extends Model>(model: ModelStatic<T>, req: Request, res: Response): Promise<Response> {
        try {
            const record = await model.create(req.body);
            return res.status(201).json(record);
        } catch (error) {
            console.error(`Error creating ${model.name}:`, error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Retrieve a Fee by ID
    async GetRecord<T extends Model>(model: ModelStatic<T>, req: Request, res: Response): Promise<Response> {
        try {
            const id = req.params.id as unknown as number | string; // Effettua una type assertion qui
            const record = await model.findByPk(id);
            if (!record) {
                return res.status(404).json({ message: `${model.name} not found` });
            }
            return res.status(200).json(record);
        } catch (error) {
            console.error(`Error retrieving ${model.name}`, error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    /*   // Retrieve all parkings
       async getAll(req: Request, res: Response): Promise<Response> {
           try {
               const parkings = await Parking.findAll();
               return res.status(200).json(parkings);
           } catch (error) {
               console.error('Error retrieving parkings:', error);
               return res.status(500).json({ message: 'Internal server error' });
           }
       }
   */
    // Update a Model by ID
    async UpdateRecord<T extends Model>(model: ModelStatic<T>, req: Request, res: Response): Promise<Response> {
        try {
            const id = req.params.id as unknown as number | string; // Effettua una type assertion qui
            const [updated] = await model.update(req.body, {
                where: whereId<T>(id),
            });
            if (updated) {
                const updatedRecord = await model.findByPk(id);
                return res.status(200).json(updatedRecord);
            }
            return res.status(404).json({ message: model + `${model.name} not found` });
        } catch (error) {
            console.error(`Error updating ${model.name}:`, error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Delete a Model by ID
    async DeleteRecord<T extends Model>(model: ModelStatic<T>, req: Request, res: Response): Promise<Response> {
        try {
            const id = req.params.id as unknown as number | string; // Effettua una type assertion qui
            const deleted = await model.destroy({
                where: whereId<T>(id),
            });
            if (deleted) {
                return res.status(204).send();
            }
            return res.status(404).json({ message: model + `${model.name} not found` });
        } catch (error) {
            console.error(`Error deleting ${model.name}:`, error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}
export default new CRUDController();


