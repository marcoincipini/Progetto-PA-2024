import { Request, Response } from 'express';
import { Model, ModelStatic, WhereOptions } from 'sequelize';
import Transit from '../models/Transit';
import { errorFactory } from '../factory/ErrorMessage';
import { successFactory } from '../factory/SuccessMessage';
import { ErrorStatus, SuccessStatus } from '../factory/Status'
import Vehicle from '../models/Vehicle';
import Passage from '../models/Passage';
import Fee from '../models/Fee';
import Bill from '../models/Bill';
import Parking from '../models/Parking';

const ErrorFac: errorFactory = new errorFactory();
const SuccessFac: successFactory = new successFactory();

// Helper per definire il tipo di WhereOptions
const whereId = <T>(id: string | number): WhereOptions<T> => ({ id } as unknown as WhereOptions<T>);

class CRUDController {

    // Create a Model 
    async createRecord<T extends Model>(model: ModelStatic<T>, req: Request, res: Response): Promise<Response> {
        var result: any;
        
        try {
            const record = await model.create(req.body);
            const successMessage = SuccessFac.getMessage(SuccessStatus.creationSuccess, `Creating ${model.name} succeded`);
            result = res.json({ message: successMessage, data: { record }});
        } catch (err) {
            result = ErrorFac.getMessage(ErrorStatus.creationInternalServerError, `Error creating ${model.name}`);
        }
        return result;
    }

    // Retrieve a Model by ID
    async getRecord<T extends Model>(model: ModelStatic<T>, req: Request, res: Response): Promise<Response> {
        var result: any;
        try {
            const id = req.params.id as unknown as number | string;
            const record = await model.findByPk(id);
            const successMessage = SuccessFac.getMessage(SuccessStatus.readSuccess, `Reading ${model.name} succeded`);
            result = res.json({ message: successMessage, data: { record }});
        } catch (err) {
            result = ErrorFac.getMessage(ErrorStatus.readInternalServerError, `Error retrieving ${model.name}`);
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
            const successMessage = SuccessFac.getMessage(SuccessStatus.updateSuccess, `Updating ${model.name} succeded`);
            result = res.json({ message: successMessage, data: { record }});
        } catch (err) {
            result = ErrorFac.getMessage(ErrorStatus.updateInternalServerError, `Error updating ${model.name}`);
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
            const successMessage = SuccessFac.getMessage(SuccessStatus.deleteSuccess, `Deleting ${model.name} succeded`);
            result = res.json({ message: successMessage});
        } catch (err) {
            result = ErrorFac.getMessage(ErrorStatus.deleteInternalServerError, `Error deleting ${model.name}`);
        }

        return result;
    }

    async createBill(req:Request,res:Response): Promise<Response> {

        type timeline = {
            data: number,
            hour: number
        }
        const passage_id = req.body.passage_id as unknown as number;
        const plate = req.body.plate as string;
        
        console.log("ecchime");
        const vehicle: Vehicle = await Vehicle.findByPk(plate);
        console.log("recuperato il veicolo: ", vehicle);
        let parkingPassage: Passage = await Passage.findByPk(passage_id);
        console.log("recuperato il varco: ", parkingPassage); // ritoena il varco con id corrispondente con parcheggio
        let transit_in: Transit[] = await Transit.getEnterTransit(plate);
        console.log("recuperato il transito in ingresso: ", transit_in[0]); //ritorna il transito di ingresso max tempo

        const parkings = await Parking.findByPk(parkingPassage.parking_id);
        console.log("recuperato il PARCHEGGIO: ", parkings);
        const dayStart: Date = new Date(parkings.day_starting_hour);
        const dayFinish: Date = new Date(parkings.day_finishing_hour);

        let fees: Fee[] = await Fee.getFee(vehicle.vehicle_type,parkingPassage.parking_id);
        console.log("non sono ancora morto e ho recuperato le fee: ", fees);

        let amount: number=0;
        
        let end_time: Date = new Date(req.body.passing_by_date + ' ' + req.body.passing_by_hour);
        let data: Date = transit_in[0].passing_by_date;
        let start_time: Date = new Date(data + ' ' + transit_in[0].passing_by_hour);
        //const [hours, minutes, seconds] = transit_in[0].passing_by_hour.split(":").map(Number);
        
        console.log(typeof(end_time),end_time);
        //end_time.setHours(hours,minutes,seconds);
        //end_time.setMinutes(minutes);
        //end_time.setSeconds(seconds);
        
        console.log(start_time);

        let time: timeline[]=[]; 
        start_time.setHours(start_time.getHours() + 1);
        while (start_time < end_time) {
            time.push({data : start_time.getDay(), hour: start_time.getHours()});
            start_time.setHours(start_time.getHours() + 1);
        }
        console.log("spazio-tempo creato: ", time);
        for (const hour of time) {
            console.log("so sordi: ", amount);
            if(hour.hour >= dayFinish.getHours() && hour.hour <= dayStart.getHours()){
                if(hour.data == 6){
                    amount += parseFloat(this.searchfee(fees, false, true ) as unknown as string );
                }
                    amount += parseFloat(this.searchfee(fees, false, false )as unknown as string);
            }else{
                if(hour.data == 6){
                    amount += parseFloat(this.searchfee(fees, true, true )as unknown as string);
                }
                    amount += parseFloat(this.searchfee(fees, true, false )as unknown as string);
            }
        }
        let transitOut: Transit = await Transit.create(req.body);

        console.log("recuperato il transito uscita: ", transitOut);

        let billOut = await Bill.create({
            parking_id: parkingPassage.parking_id, 
            amount: amount,
            entrance_transit: transit_in[0].id, 
            exit_transit: transitOut.id});

        console.log(billOut);

        return res.status(200).json(billOut);

       
    }

    searchfee(fees:Fee[], night:boolean, festive:boolean): number{
        for (const fee of fees) {
            if(fee.festive !== festive){
                if(fee.night !== night){
                    return fee.hourly_amount;
                }
            }
        }
        return 0;
    }
        
}
export default new CRUDController();


