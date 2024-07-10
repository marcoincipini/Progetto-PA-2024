import { Request, Response } from 'express';
import Parking from '../models/Parking';
import Passage from '../models/Passage';
import Transit from '../models/Transit';
class ParkingCRUDController {
    // Create a new parking
    async parkingcreate(req: Request, res: Response): Promise<Response> {
        var result: any;
        try {
            const parking = await Parking.create(req.body);
            result = res.status(201).json(parking);
        } catch (error) {
            console.error('Error creating parking:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
        return result;
    }

    // Retrieve a parking by ID
    async getById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const parking = await Parking.findByPk(id);
            if (!parking) {
                return res.status(404).json({ message: 'Parking not found' });
            }
            return res.status(200).json(parking);
        } catch (error) {
            console.error('Error retrieving parking:', error);
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
    // Update a parking by ID
    async update(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const [updated] = await Parking.update(req.body, {
                where: { id: id }
            });
            if (updated) {
                const updatedParking = await Parking.findByPk(id);
                return res.status(200).json(updatedParking);
            }
            return res.status(404).json({ message: 'Parking not found' });
        } catch (error) {
            console.error('Error updating parking:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Delete a parking by ID
    async delete(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const deleted = await Parking.destroy({
                where: { id: id }
            });
            if (deleted) {
                return res.status(204).send();
            }
            return res.status(404).json({ message: 'Parking not found' });
        } catch (error) {
            console.error('Error deleting parking:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}

export default new ParkingCRUDController();
