// Importing necessary modules
import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';

// Import the models
import Bill from '../models/Bill';
import Parking from '../models/Parking';

// Import the factories
import { errorFactory } from '../factory/ErrorMessage';
import { successFactory } from '../factory/SuccessMessage';
import { ErrorStatus, SuccessStatus } from '../factory/Status'

// Creating instances of errorFactory and successFactory
const ErrorFac: errorFactory = new errorFactory();
const SuccessFac: successFactory = new successFactory();

// Defining types for timeline and average
type timeline = {
    index: number;
    hour: number;
};

type average = {
    parking_id: number;
    time_slot: string;
    average_vacancies: number;
};

type Parkings = {
    id: number;
    sum: number;
};

// Defining a class GeneralParkingController
class GeneralParkingController {

    // Method to get revenues
    async getRevenues(req: Request, res: Response): Promise<any> {
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;

        try {
            // Find bills by date time range
            let selectedBill = await Bill.findByDateTimeRange(startDate, endDate);

            let parkings: Parkings[] = [];
            for (const bill of selectedBill) {
                let selectedParkings = parkings.find((parking) => parking.id === bill.parking_id);
                if (selectedParkings) {
                    // If parking is found, add the bill amount to the sum
                    selectedParkings.sum += parseFloat(bill.amount as unknown as string);

                } else {
                    // If parking is not found, push a new parking with the bill amount
                    parkings.push({ id: bill.parking_id, sum: parseFloat(bill.amount as unknown as string) });
                }
            }
            // Select the format for average revenue
            return this.selectFormatAverageRevenue(parkings, req, res);
        } catch (err) {
            // Return error message if there's an error
            const errMessage = ErrorFac.getMessage(ErrorStatus.functionNotWorking, 'Error calculating revenues for parking').getResponse();
            return res.json({ Error: errMessage });

        }

    }
    // Method to calculate average vacancies
    async averageVacanciesCalculator(req: Request, res: Response): Promise<any> {
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;
        let startTime: Date = new Date(startDate);
        let endTime: Date = new Date(endDate);

        let vacanciesMatrix: number[][] = [];

        let stepCounter: number = 0;

        let matrixTimeline: timeline[] = [];

        let averageRes: average[][] = [];

        try {
            // Find all parkings
            const parkings = await Parking.findAll();
            const parkings_number: number = parkings.length;

            startTime.setHours(startTime.getHours() + 1);
            while (startTime < endTime) {
                // Push the current hour to the timeline
                matrixTimeline.push({ index: stepCounter, hour: startTime.getHours() })
                stepCounter += 1;
                startTime.setHours(startTime.getHours() + 1);
            }

            // Initialize vacanciesMatrix with random values
            vacanciesMatrix = Array.from({ length: parkings_number }, () =>
                new Array(stepCounter).fill(0).map(() => Math.floor(Math.random() * (50 - 5 + 1)) + 5));

            for (const parking of parkings) {
                // Calculate average vacancies for each parking
                averageRes.push(this.averageCalc(parking, vacanciesMatrix, matrixTimeline));
            }

            // Select the format for average vacancies
            return this.selectFormatAverageVacancies(averageRes, req, res);
        } catch (err) {
            // Return error message if there's an error
            const errMessage = ErrorFac.getMessage(ErrorStatus.functionNotWorking, 'Error calculating average vacancies for parking').getResponse();
            return res.json({ Error: errMessage });
        }
    }

    // Method to calculate average vacancies for a parking
    averageCalc(parking: Parking, vacanciesMatrix: number[][], matrixTimeline: timeline[]): any {
        const startTime: number = parseInt(parking.day_starting_hour.split(':')[0]);
        const endTime: number = parseInt(parking.day_finishing_hour.split(':')[0]);
        let day: average = {
            parking_id: parking.id,
            time_slot: 'day',
            average_vacancies: 0
        };
        let step_day: number = 0;
        let night: average = {
            parking_id: parking.id,
            time_slot: 'night',
            average_vacancies: 0
        };
        let step_night: number = 0;

        for (const iterator of matrixTimeline) {
            if (iterator.hour >= startTime && iterator.hour <= endTime) {
                // If the current hour is within the parking's operating hours, add to the day average
                day.average_vacancies += vacanciesMatrix[(parking.id - 1)][iterator.index];
                step_day += 1;
            } else {
                // If the current hour is outside the parking's operating hours, add to the night average
                night.average_vacancies += vacanciesMatrix[(parking.id - 1)][iterator.index];
                step_night += 1;
            }
        }

        // Calculate the final averages
        day.average_vacancies = Number((day.average_vacancies / step_day).toFixed(0));
        night.average_vacancies = Number((night.average_vacancies / step_night).toFixed(0));

        // Return the averages for day and night
        return [day, night];

    }

    // Method to select the format for average vacancies
    async selectFormatAverageVacancies(average: average[][], req: Request, res: Response) {
        if (req.query.format === 'json' || !req.query.format) {
            // If the format is json or not specified, return json
            const successMessage = SuccessFac.getMessage(SuccessStatus.defaultSuccess, `Calculating average vacancies for parking succeded`);
            res.json({ Success: successMessage, data: { average } });
        } else if (req.query.format === 'pdf') {
            // If the format is pdf, generate a pdf
            const pdf = new PDFDocument();
            pdf.text('AVERAGE VACANCIES REPORT');

            average.forEach((average) => {
                pdf.text('--------------DAY---------------------------');
                pdf.text(`Parking_id: ${average[0].parking_id}`);
                pdf.text(`Time_slot: ${average[0].time_slot}`);
                pdf.text(`Average_vacancies: ${average[0].average_vacancies}`);
                pdf.text('--------------NIGHT-------------------------');
                pdf.text(`Parking_id: ${average[1].parking_id}`);
                pdf.text(`Time_slot: ${average[1].time_slot}`);
                pdf.text(`Average_vacancies: ${average[1].average_vacancies}`);
                pdf.text('--------------------------------------------');
            });

            // Set the response header and pipe the pdf to the response
            res.setHeader('Content-Type', 'application/pdf');
            pdf.pipe(res);
            pdf.end();
        }
    }

    // Method to select the format for average revenue
    async selectFormatAverageRevenue(parkings: Parkings[], req: Request, res: Response) {
        if (req.query.format === 'json' || !req.query.format) {
            // If the format is json or not specified, return json
            const successMessage = SuccessFac.getMessage(SuccessStatus.defaultSuccess, `Calculating average revenue for parking succeded`);
            res.json({ Success: successMessage, data: { parkings } });
        } else if (req.query.format === 'pdf') {
            // If the format is pdf, generate a pdf
            const pdf = new PDFDocument();
            pdf.text('AVERAGE REVENUE REPORT');

            parkings.forEach((parkings) => {
                pdf.text('--------------REVENUE---------------------------');
                pdf.text(`Parking_id: ${parkings.id}`);
                pdf.text(`Revenue: ${parkings.sum}`);
                pdf.text('--------------------------------------------');
            });

            // Set the response header and pipe the pdf to the response
            res.setHeader('Content-Type', 'application/pdf');
            pdf.pipe(res);
            pdf.end();
        }
    }
}

// Exporting an instance of GeneralParkingController
export default new GeneralParkingController;
