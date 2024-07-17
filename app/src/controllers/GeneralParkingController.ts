import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Transit from '../models/Transit';
import Vehicle from '../models/Vehicle';
import Passage from '../models/Passage';
import PDFDocument from 'pdfkit';
import Bill from '../models/Bill';
import Parking from '../models/Parking';
import { errorFactory } from '../factory/ErrorMessage';
import { successFactory } from '../factory/SuccessMessage';
import { ErrorStatus, SuccessStatus } from '../factory/Status'

const ErrorFac: errorFactory = new errorFactory();
const SuccessFac: successFactory = new successFactory();

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

class GeneralParkingController {

    async getRevenues(req: Request, res: Response): Promise<any> {
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;

        try {
            let selectedBill = await Bill.findByDateTimeRange(startDate, endDate);

            let parkings: Parkings[] = [];
            for (const bill of selectedBill) {
                let selectedParkings = parkings.find((parking) => parking.id === bill.parking_id);
                if (selectedParkings) {
                    selectedParkings.sum += parseFloat(bill.amount as unknown as string);

                } else {
                    parkings.push({ id: bill.parking_id, sum: parseFloat(bill.amount as unknown as string) });
                }
            }
            return this.selectFormatAverageRevenue(parkings, req, res);
        } catch (err) {
            ErrorFac.getMessage(ErrorStatus.functionNotWorking, 'Error calculating revenues for parking');
        }

    }
    async averageVacanciesCalculator(req: Request, res: Response): Promise<any> {
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;
        let start_time: Date = new Date(startDate);
        let end_time: Date = new Date(endDate);

        let vacancies_matrix: number[][] = [];

        let step_counter: number = 0;

        let matrix_timeline: timeline[] = [];

        let average_res: average[][] = [];

        try {
            const parkings = await Parking.findAll();
            const parkings_number: number = parkings.length;

            start_time.setHours(start_time.getHours() + 1);
            while (start_time < end_time) {
                matrix_timeline.push({ index: step_counter, hour: start_time.getHours() })
                step_counter += 1;
                start_time.setHours(start_time.getHours() + 1);
            }

            vacancies_matrix = Array.from({ length: parkings_number }, () =>
                new Array(step_counter).fill(0).map(() => Math.floor(Math.random() * (50 - 5 + 1)) + 5));

            for (const parking of parkings) {
                average_res.push(this.averageCalc(parking, vacancies_matrix, matrix_timeline));
            }

            return this.selectFormatAverageVacancies(average_res, req, res);
        } catch (err) {
            ErrorFac.getMessage(ErrorStatus.functionNotWorking, 'Error calculating average vacancies for parking');
        }
    }

    averageCalc(parking: Parking, vacancies_matrix: number[][], matrix_timeline: timeline[]): any {
        const start_time: number = parseInt(parking.day_starting_hour.split(':')[0]);
        const end_time: number = parseInt(parking.day_finishing_hour.split(':')[0]);
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

        for (const iterator of matrix_timeline) {
            if (iterator.hour >= start_time && iterator.hour <= end_time) {
                day.average_vacancies += vacancies_matrix[(parking.id - 1)][iterator.index];
                step_day += 1;
            } else {
                night.average_vacancies += vacancies_matrix[(parking.id - 1)][iterator.index];
                step_night += 1;
            }
        }

        day.average_vacancies = Number((day.average_vacancies / step_day).toFixed(0));
        night.average_vacancies = Number((night.average_vacancies / step_night).toFixed(0));


        return [day, night];

    }

    async selectFormatAverageVacancies(average: average[][], req: Request, res: Response) {
        if (req.query.format === 'json' || !req.query.format) {
            var result: any;
            const successMessage = SuccessFac.getMessage(SuccessStatus.defaultSuccess, `Calculating average vacancies for parking succeded`);
            res.json({ message: successMessage, data: { average }});
        } else if (req.query.format === 'pdf') {
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

            res.setHeader('Content-Type', 'application/pdf');
            pdf.pipe(res);
            pdf.end();
        }
    }

    async selectFormatAverageRevenue(parkings: Parkings[], req: Request, res: Response) {
        if (req.query.format === 'json' || !req.query.format) {
            var result: any;
            const successMessage = SuccessFac.getMessage(SuccessStatus.defaultSuccess, `Calculating average revenue for parking succeded`);
            res.json({ message: successMessage, data: { parkings }});
        } else if (req.query.format === 'pdf') {
            const pdf = new PDFDocument();
            pdf.text('AVERAGE REVENUE REPORT');

            parkings.forEach((parkings) => {
                pdf.text('--------------REVENUE---------------------------');
                pdf.text(`Parking_id: ${parkings.id}`);
                pdf.text(`Revenue: ${parkings.sum}`);
                pdf.text('--------------------------------------------');
            });

            res.setHeader('Content-Type', 'application/pdf');
            pdf.pipe(res);
            pdf.end();
        }
    }
}
export default new GeneralParkingController;