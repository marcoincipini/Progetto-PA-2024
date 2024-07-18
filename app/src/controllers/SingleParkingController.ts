// Import necessary modules and types
import { Request, Response } from 'express';
import Transit from '../models/Transit';
import Bill from '../models/Bill';
import Parking from '../models/Parking';
import { errorFactory } from '../factory/ErrorMessage';
import { successFactory } from '../factory/SuccessMessage';
import { ErrorStatus, SuccessStatus } from '../factory/Status'

// Create instances of error and success message factories
const ErrorFac: errorFactory = new errorFactory();
const SuccessFac: successFactory = new successFactory();

// Define a type for transit count
type transitCount = {
    timeSlot: string;
    vehicleType: string,
    nTransits: number
}

// Define the SingleParkingController class
class SingleParkingController {
    // Method to count transits
    async countTransits(req: Request, res: Response): Promise<Response> {
        const { startDate, endDate } = req.query;
        var result: any;
        const id = req.params.id as unknown as number;

        try {
            // Find parking by primary key
            const parking = await Parking.findByPk(id);

            // Get day start and finish hours
            const dayStart = parking.day_starting_hour;
            const dayFinish = parking.day_finishing_hour;

            // Get transits within date range and for specific parking
            const transits = await Transit.transitJoins(startDate, endDate, id);

            // Initialize transit count array
            let transitC: transitCount[] = [
                { timeSlot: 'day', vehicleType: 'Moto', nTransits: 0 },
                { timeSlot: 'night', vehicleType: 'Moto', nTransits: 0 },
                { timeSlot: 'day', vehicleType: 'Auto', nTransits: 0 },
                { timeSlot: 'night', vehicleType: 'Auto', nTransits: 0 },
                { timeSlot: 'day', vehicleType: 'Camion', nTransits: 0 },
                { timeSlot: 'night', vehicleType: 'Camion', nTransits: 0 }
            ];

            // Count transits by vehicle type and time slot
            for (const trans of transits) {
                let Index = this.vehicleCheck(trans.vehicle_type);
                if (trans.passing_by_hour >= dayStart && trans.passing_by_hour <= dayFinish) {
                    transitC[Index].nTransits += 1;
                } else {
                    transitC[Index + 1].nTransits += 1;
                }
            }

            // Create success message and send response
            const successMessage = SuccessFac.getMessage(SuccessStatus.defaultSuccess, 'Counting Transits succeded');
            result = res.json({ message: successMessage, data: { transitC } });
        } catch (err) {
            // Handle error
            result = res.json(ErrorFac.getMessage(ErrorStatus.functionNotWorking, 'Error counting Transits'));
        }
        return result;
    }

    // Helper method to get index for vehicle type
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

    // Method to get parking revenues
    async getParkRevenues(req: Request, res: Response): Promise<Response> {
        const { startDate, endDate } = req.query;
        const id = req.params.id as unknown as number;
        var result: any;

        try {
            // Find bills within date range and for specific parking
            let selectedBill = await Bill.findByDateTimeRangeAndId(startDate, endDate, id);

            // Calculate total amount
            let amount: number = 0;
            for (const bill of selectedBill) {
                amount += parseFloat(bill.amount as unknown as string);
            }

            // Create success message and send response
            const successMessage = SuccessFac.getMessage(SuccessStatus.defaultSuccess, 'Calculating revenues for parkings succeded');
            result = res.json({ message: successMessage, data: { amount } });
        } catch (err) {
            // Handle error
            result = res.json(ErrorFac.getMessage(ErrorStatus.functionNotWorking, 'Error calculating revenues for parkings'));
        }
        return result;
    }
}

// Export an instance of the SingleParkingController
export default new SingleParkingController();