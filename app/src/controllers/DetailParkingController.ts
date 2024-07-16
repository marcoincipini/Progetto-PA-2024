import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Transit from '../models/Transit';
import Vehicle from '../models/Vehicle';
import Passage from '../models/Passage';
import PDFDocument from 'pdfkit';
import Bill from '../models/Bill';
import Parking from '../models/Parking';
import { errorFactory } from '../factory/ErrorMessage';
import { ErrorStatus } from '../factory/Status'

const ErrorFac: errorFactory = new errorFactory();

type transitCount = {
    timeSlot: string;
    vehicleType: string,
    nTransits: number
}

class DetailParkingController {
    async countTransits(req: Request, res: Response): Promise<Response> {
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;
        const id = req.params.id as unknown as number;

        const parking = await Parking.findByPk(id);

        const dayStart = parking.day_starting_hour;
        const dayFinish = parking.day_finishing_hour;

        const transits = await Transit.transitJoins(startDate, endDate, id);

        let transitC: transitCount[] = [
            { timeSlot: 'day', vehicleType: 'Moto', nTransits: 0 },
            { timeSlot: 'night', vehicleType: 'Moto', nTransits: 0 },
            { timeSlot: 'day', vehicleType: 'Auto', nTransits: 0 },
            { timeSlot: 'night', vehicleType: 'Auto', nTransits: 0 },
            { timeSlot: 'day', vehicleType: 'Camion', nTransits: 0 },
            { timeSlot: 'night', vehicleType: 'Camion', nTransits: 0 }
        ];

        for (const trans of transits) {
            let Index = this.vehicleCheck(trans.vehicle_type);
            if (trans.passing_by_hour >= dayStart && trans.passing_by_hour <= dayFinish) {
                transitC[Index].nTransits += 1;
            } else {
                transitC[Index + 1].nTransits += 1;
            }
        }
        return res.status(200).json( [transitC] );
    }

    vehicleCheck(vehicle: string): number {
        switch (vehicle) {
            case 'Moto':
                return 0;
            case 'Auto':
                return 2;
            case 'Camion':
                return 4;
            default: return -1;    
        }
    }

    async getParkRevenues(req: Request, res: Response): Promise<Response> {
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;
        const id = req.params.id as unknown as number;

        let selectedBill = await Bill.findByDateTimeRangeAndId(startDate, endDate, id);
        
        let amount: number = 0;
        for (const bill of selectedBill) {
            amount += parseFloat(bill.amount as unknown as string);
        }
        return res.status(200).json( [amount] );
    }

}

export default new DetailParkingController();