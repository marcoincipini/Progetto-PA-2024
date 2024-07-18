// Import necessary modules from 'express' and 'sequelize'
import { Request, Response } from 'express';
import { Model, ModelStatic, WhereOptions } from 'sequelize';
// Import the models and factories
import Transit from '../models/Transit';
import { errorFactory } from '../factory/ErrorMessage';
import { successFactory } from '../factory/SuccessMessage';
import { ErrorStatus, Message, SuccessStatus } from '../factory/Status'
import Vehicle from '../models/Vehicle';
import Passage from '../models/Passage';
import Fee from '../models/Fee';
import Bill from '../models/Bill';
import Parking from '../models/Parking';

// Instantiate the error and success factories
const ErrorFac: errorFactory = new errorFactory();
const SuccessFac: successFactory = new successFactory();

// Helper to define the type of WhereOptions
const whereId = <T>(id: string | number): WhereOptions<T> => ({ id } as unknown as WhereOptions<T>);

class CRUDController {

    // Method to create a Model 
    async createRecord<T extends Model>(model: ModelStatic<T>, req: Request, res: Response): Promise<Response> {
        var result: any;

        try {
            // Create a new record using the request body
            const record = await model.create(req.body);
            // Generate a success message
            const successMessage = SuccessFac.getMessage(SuccessStatus.creationSuccess, `Creating ${model.name} succeded`);
            // Return the success message and the created record
            result = res.json({ message: successMessage, data: { record } });
        } catch (err) {
            // If an error occurs, return an error message
            result = res.json(ErrorFac.getMessage(ErrorStatus.creationInternalServerError, `Error creating ${model.name}`));
        }
        return result;
    }

    // Method to retrieve a Model by ID
    async getRecord<T extends Model>(model: ModelStatic<T>, req: Request, res: Response): Promise<Response> {
        var result: any;
        try {
            // Get the ID from the request parameters
            const id = req.params.id as unknown as number | string;
            // Find the record by its primary key
            const record = await model.findByPk(id);
            // Generate a success message
            const successMessage = SuccessFac.getMessage(SuccessStatus.readSuccess, `Reading ${model.name} succeded`);
            // Return the success message and the found record
            result = res.json({ message: successMessage, data: { record } });
        } catch (err) {
            // If an error occurs, return an error message
            result = res.json(ErrorFac.getMessage(ErrorStatus.readInternalServerError, `Error retrieving ${model.name}`));
        }
        return result;
    }

    // Method to update a Model by ID
    async updateRecord<T extends Model>(model: ModelStatic<T>, req: Request, res: Response): Promise<Response> {
        var result: any;
        try {
            // Get the ID from the request parameters
            const id = req.params.id as unknown as number | string;
            // Update the record with the request body
            await model.update(req.body, {
                where: whereId<T>(id),
            });
            // Find the updated record
            const record = await model.findByPk(id);
            // Generate a success message
            const successMessage = SuccessFac.getMessage(SuccessStatus.updateSuccess, `Updating ${model.name} succeded`);
            // Return the success message and the updated record
            result = res.json({ message: successMessage, data: { record } });
        } catch (err) {
            // If an error occurs, return an error message
            result = res.json(ErrorFac.getMessage(ErrorStatus.updateInternalServerError, `Error updating ${model.name}`));
        }

        return result;
    }

    // Method to delete a Model by ID
    async deleteRecord<T extends Model>(model: ModelStatic<T>, req: Request, res: Response): Promise<Response> {
        var result: any;
        try {
            // Get the ID from the request parameters
            const id = req.params.id as unknown as number | string;
            // Delete the record
            await model.destroy({
                where: whereId<T>(id),
            });
            // Generate a success message
            const successMessage = SuccessFac.getMessage(SuccessStatus.deleteSuccess, `Deleting ${model.name} succeded`);
            // Return the success message
            result = res.json({ message: successMessage });
        } catch (err) {
            // If an error occurs, return an error message
            result = res.json(ErrorFac.getMessage(ErrorStatus.deleteInternalServerError, `Error deleting ${model.name}`));
        }

        return result;
    }

    // Method to create a bill
    async createBill(req: Request, res: Response): Promise<Response | Message> {
        var result: any;
        type timeline = {
            data: number,
            hour: number
        }
        // Get the passage ID and plate from the request body
        const passage_id = req.body.passage_id as unknown as number;
        const plate = req.body.plate as string;

        console.log("ecchime");
        // Find the vehicle by its plate
        const vehicle: Vehicle = await Vehicle.findByPk(plate);
        console.log("recuperato il veicolo: ", vehicle);
        // Find the passage by its ID
        let parkingPassage: Passage = await Passage.findByPk(passage_id);
        console.log("recuperato il varco: ", parkingPassage); // returns the passage with corresponding parking
        // Find the entrance transit
        let transitIn: Transit[] = await Transit.getEnterTransit(plate);
        console.log("recuperato il transito in ingresso: ", transitIn[0]); // returns the max time entrance transit

        // If the direction of the transit is 'U', return an error message
        if (transitIn[0].direction == 'U') {
            result = res.json(ErrorFac.getMessage(ErrorStatus.resourceNotFoundError, `Entrance transit not present`));
            return result;
        }

        // Find the parking by its ID
        const parkings = await Parking.findByPk(parkingPassage.parking_id);
        console.log("recuperato il PARCHEGGIO: ", parkings);
        // Get the starting and finishing hours of the day
        const dayStart: Date = new Date(parkings.day_starting_hour);
        const dayFinish: Date = new Date(parkings.day_finishing_hour);

        // Get the fees for the vehicle type and parking
        let fees: Fee[] = await Fee.getFee(vehicle.vehicle_type, parkingPassage.parking_id);
        console.log("non sono ancora morto e ho recuperato le fee: ", fees);

        let amount: number = 0;

        // Get the end time from the request body
        let endTime: Date = new Date(req.body.passing_by_date + ' ' + req.body.passing_by_hour);
        let data: Date = transitIn[0].passing_by_date;
        // Get the start time from the entrance transit
        let startTime: Date = new Date(data + ' ' + transitIn[0].passing_by_hour);
        //const [hours, minutes, seconds] = transitIn[0].passing_by_hour.split(":").map(Number);

        console.log(typeof (endTime), endTime);
        //endTime.setHours(hours,minutes,seconds);
        //endTime.setMinutes(minutes);
        //endTime.setSeconds(seconds);

        console.log(startTime);

        let time: timeline[] = [];
        startTime.setHours(startTime.getHours() + 1);
        // Create a timeline from the start time to the end time
        while (startTime < endTime) {
            time.push({ data: startTime.getDay(), hour: startTime.getHours() });
            startTime.setHours(startTime.getHours() + 1);
        }
        console.log("spazio-tempo creato: ", time);
        // Calculate the amount for each hour in the timeline
        for (const hour of time) {
            console.log("so sordi: ", amount);
            if (hour.hour >= dayFinish.getHours() && hour.hour <= dayStart.getHours()) {
                if (hour.data == 6) {
                    amount += parseFloat(this.searchfee(fees, false, true) as unknown as string);
                }
                amount += parseFloat(this.searchfee(fees, false, false) as unknown as string);
            } else {
                if (hour.data == 6) {
                    amount += parseFloat(this.searchfee(fees, true, true) as unknown as string);
                }
                amount += parseFloat(this.searchfee(fees, true, false) as unknown as string);
            }
        }
        // Create the exit transit
        let transitOut: Transit = await Transit.create(req.body);

        console.log("recuperato il transito uscita: ", transitOut);

        // Create the bill
        let billOut = await Bill.create({
            parking_id: parkingPassage.parking_id,
            amount: amount,
            entrance_transit: transitIn[0].id,
            exit_transit: transitOut.id
        });

        console.log(billOut);

        // Generate a success message
        const successMessage = SuccessFac.getMessage(SuccessStatus.readSuccess, `Reading succeded`);
        // Return the success message and the created bill
        result = res.json({ message: successMessage, data: { billOut } });

    }

    // Method to search for a fee
    searchfee(fees: Fee[], night: boolean, festive: boolean): number {
        for (const fee of fees) {
            if (fee.festive !== festive) {
                if (fee.night !== night) {
                    return fee.hourly_amount;
                }
            }
        }
        return 0;
    }

}

// Export a new instance of the CRUDController class
export default new CRUDController();
