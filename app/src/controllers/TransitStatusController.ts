// Import necessary modules and types
import { Request, Response } from 'express';
import Transit from '../models/Transit';
import Vehicle from '../models/Vehicle';
import PDFDocument from 'pdfkit';

// Import the models
import Bill from '../models/Bill';

// Import the factories
import { errorFactory } from '../factory/ErrorMessage';
import { successFactory } from '../factory/SuccessMessage';
import { ErrorStatus, SuccessStatus } from '../factory/Status'

// Create instances of error and success message factories
const ErrorFac: errorFactory = new errorFactory();
const SuccessFac: successFactory = new successFactory();

// Define the TransitStatusController class
class TransitStatusController {

    // Method to get transits
    async getTransits(req: Request, res: Response): Promise<any> {
        try {
            const { plates, startDate, endDate } = req.query;
            const { role } = req.body.user;

            // Filter by plates only if the user is an operator
            if (role == 'operatore') {
                let exitTransitList = await this.collectTransitsAndBills(plates, startDate, endDate);
                return this.selectFormat(exitTransitList, req, res);
            } else {
                let selectedPlates = await this.checkPlates(plates, req, res);

                if (selectedPlates) {
                    let exitTransitList = await this.collectTransitsAndBills(plates, startDate, endDate);
                    return this.selectFormat(exitTransitList, req, res);
                } else {
                    const errMessage = ErrorFac.getMessage(ErrorStatus.functionNotWorking, 'Plates not correct, select only the ones owned').getResponse();
                    return res.json({ Error: errMessage });
                }
            }
        } catch (err) {
            const errMessage = ErrorFac.getMessage(ErrorStatus.functionNotWorking, 'Error retrieving transits').getResponse();
            return res.json({ Error: errMessage });
        }
    }

    // Method to collect transits and bills
    async collectTransitsAndBills(plates: any, startDate: any, endDate: any) {
        let selectedTransits = await Transit.findByPlatesAndDateTimeRange(plates, startDate, endDate);
        const TransitID: number[] = selectedTransits.map((item) => item.id);
        let fatture = await Bill.findBillByExitTransits(TransitID);
        let exitTransitList: any[] = [];

        // Populate exitTransitList with all transits
        for (const transit of selectedTransits) {
            if (transit.direction == 'E') {
                exitTransitList.push({
                    transit_id: transit.id,
                    plate: transit.plate,
                    passing_by_date: transit.passing_by_date,
                    passing_by_hour: transit.passing_by_hour,
                    direction: transit.direction,
                    vehicle_type: transit.vehicle_type,
                    entrance_passage: transit.passage_id,
                    exit_passage: null,
                    amount: null
                });
            }
        }
        // Update exitTransitList with bill information
        for (const bill of fatture) {
            const exitTransit: Transit = selectedTransits.find(tran => tran.id === bill.exit_transit);
            exitTransitList.push({
                transit_id: bill.exit_transit,
                plate: exitTransit.plate,
                passing_by_date: exitTransit.passing_by_date,
                passing_by_hour: exitTransit.passing_by_hour,
                direction: exitTransit.direction,
                vehicle_type: exitTransit.vehicle_type,
                entrance_transit: bill.entrance_transit,
                exit_passage: exitTransit.passage_id,
                amount: bill.amount
            });
        }
        return exitTransitList;
    }

    // Method to select output format (JSON or PDF)
    async selectFormat(transit: any[], req: Request, res: Response) {
        if (req.query.format === 'json' || !req.query.format) {
            var result: any;
            const successMessage = SuccessFac.getMessage(SuccessStatus.defaultSuccess, `Recovering Transit Report succeded`);
            result = res.json({ Success: successMessage, data: { transit } });
            return result;
        } else if (req.query.format === 'pdf') {
            const pdf = new PDFDocument();
            pdf.text('TRANSIT REPORT');

            transit.forEach((transit) => {
                pdf.text(`Transit ID: ${transit.transit_id}`);
                pdf.text(`Plate: ${transit.plate}`);
                pdf.text(`Passing Date: ${transit.passing_by_date}`);
                pdf.text(`Passing Hour: ${transit.passing_by_hour}`);
                pdf.text(`Direction: ${transit.direction}`);
                pdf.text(`Vehicle Type: ${transit.vehicle_type}`);
                pdf.text(`Entrance Transit: ${transit.entrance_transit || 'N/A'}`);
                pdf.text(`Entrance Passage: ${transit.entrance_passage || 'N/A'}`);
                pdf.text(`Exit Passage: ${transit.exit_passage || 'N/A'}`);
                pdf.text(`Amount: ${transit.amount || 'N/A'}`);
                pdf.text('--------------------------------------------');
            });

            res.setHeader('Content-Type', 'application/pdf');
            pdf.pipe(res);
            pdf.end();
        }
    }

    // Method to check if plates belong to the user
    async checkPlates(plates: any, req: Request, res: Response): Promise<any> {
        try {
            const { email } = req.body.user;
            const userPlat = await Vehicle.getVehiclesUser(email);
            let userPlates: string[] = userPlat.map((item) => item.plate);
            return plates.every((elem: string) => userPlates.includes(elem));
        } catch (err) {
            const errMessage = ErrorFac.getMessage(ErrorStatus.functionNotWorking, 'Error in checking existing plates').getResponse();
            return res.json({ Error: errMessage });
        }
    }
}

// Export an instance of the TransitStatusController
export default new TransitStatusController();