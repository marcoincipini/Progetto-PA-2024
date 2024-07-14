import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Transit from '../models/Transit';
import Vehicle from '../models/Vehicle';
import Passage from '../models/Passage';
import PDFDocument from 'pdfkit';
import Bill from '../models/Bill';

class TransitStatusController {


    async getTransits(req: Request, res: Response): Promise<Response> {
        try {
            // Gestione dei parametri della query
            let plates: string[] = [];
            if (typeof req.query.plates === 'string') {
                plates = req.query.plates.split(',').map((plate: string) => plate.trim());
            } else if (Array.isArray(req.query.plates)) {
                plates = (req.query.plates as string[]).map((plate: string) => plate.trim());
            }
            const startDate = req.query.startDate as string;
            const endDate = req.query.endDate as string;
            const { role } = req.body.user;
            //const role = req.locals.user.role;
            // Filtra per targhe solo se l'utente è un automobilista
            if (role == 'operatore' && plates.length > 0) {
                console.log("sono un operatore");
                let exitTransitList = await this.collectTransitsAndBills(plates, startDate, endDate);
                return this.selectFormat(exitTransitList, req, res);
            } else if (role == 'automobilista' && plates.length > 0) {
                console.log("sono un automobilista");
                let selectedPlates = await this.checkPlates(plates, req, res);

                if (selectedPlates) {
                    console.log("sono una funzione");
                    let exitTransitList = await this.collectTransitsAndBills(plates, startDate, endDate);
                    this.selectFormat(exitTransitList, req, res);
                } else {
                    res.status(400).json({ message: 'utente non autorizzato' });
                }
            }
        } catch (error) {
            console.error('Error retrieving transits:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async collectTransitsAndBills(plates: string[], startDate: string, endDate: string) {
        let selectedTransits = await Transit.findByPlatesAndDateTimeRange(plates, startDate, endDate);
        const TransitID: number[] = selectedTransits.map((item) => item.id);
        let fatture = await Bill.findBillByExitTransits(TransitID);
        let exitTransitList: any[] = [];

        // Popola l'array transitiUscita con tutti i transiti
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
        // Aggiorna l'array transitiUscita con le informazioni delle fatture
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

    async selectFormat(transit: Transit[], req: Request, res: Response) {
        if (req.query.format === 'json' || !req.query.format) {
            return res.status(200).json({ transit });
        } else if (req.query.format === 'pdf') {
            const pdf = new PDFDocument();
            pdf.text('TRANSIT REPORT');

            transit.forEach((transit) => {
                pdf.text(`Plate: ${transit.plate}`);
                pdf.text(`Passage: ${transit.passage_id}`);
                pdf.text(`Vehicle Type: ${transit.vehicle_type}`);
                pdf.text('--------------------------------------------');
            });

            res.setHeader('Content-Type', 'application/pdf');
            pdf.pipe(res);
            pdf.end();
        }
    }

    async checkPlates(plates: string[], req: Request, res: Response): Promise<boolean> {
        const { email } = req.body.user;
        const userPlat = await Vehicle.getVehiclesUser(email);
        let userPlates: string[] = userPlat.map((item) => item.plate);
        console.log(plates);
        console.log(userPlates);
        console.log(plates.every(elem => userPlates.includes(elem)));
        return plates.every(elem => userPlates.includes(elem));

    }
}

export default new TransitStatusController();
