import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Transit from '../models/Transit';
import Vehicle from '../models/Vehicle';
import Passage from '../models/Passage';
import PDFDocument from 'pdfkit';

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
                const selectedTransits = await Transit.findByPlatesAndDateTimeRange(plates, startDate, endDate);
                this.selectFormat(selectedTransits, req, res);
            } else if (role == 'automobilista' && plates.length > 0) {
                if (this.checkPlates(plates, req, res)) {
                    const selectedTransits = Transit.findByPlatesAndDateTimeRange(plates, startDate, endDate);
                    this.selectFormat(await selectedTransits, req, res);
                } else {
                    res.status(400).json({ message: 'utente non autorizzato' });
                }

            } else {
                res.status(400).json({ message: 'ruolo non specificato' });
            }
        } catch (error) {
            console.error('Error retrieving transits:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async selectFormat(transit: Transit[], req: Request, res: Response) {
        if (req.query.format === 'json' || !req.query.format) {
            return res.status(200).json({ transit });
        } else if (req.query.format === 'pdf') {
            const pdf = new PDFDocument();
            pdf.text('Transits Report');

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
        const userPlates = await Vehicle.getVehiclesUser(email);

        for (const vehicle of userPlates) {
            if (!plates.includes(vehicle.plate)) {
                return false;
            }
        }
        return true;
    }
    /*
    async checkPlates(req: Request, res: Response): Promise<Boolean> {
        const { plates } = req.query;
        const { email } = req.body.user;
        const userPlates = Vehicle.getVehiclesUser(email);
        (await userPlates).forEach((vehicle) => {
            plates.forEach((plates: string) => {
                if (vehicle.plate != plates) {
                    return false;
                }
            })
        })
        return true;
    }
        */
}

export default new TransitStatusController();
