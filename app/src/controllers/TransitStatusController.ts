import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Transit from '../models/Transit';
import Vehicle from '../models/Vehicle';
import Passage from '../models/Passage';
import PDFDocument from 'pdfkit';

class TransitStatusController {


    async getTransits(req: Request, res: Response): Promise<Response> {
        try {
            const { plates, startDate, endDate } = req.query;
            const { role } = req.body.user;
            //const role = req.locals.user.role;
            // Filtra per targhe solo se l'utente è un automobilista
            if (role == 'operatore' && plates) {
                const selectedTransits = Transit.findByPlatesAndDateTimeRange(plates, startDate, endDate);
                this.selectFormat(await selectedTransits, req, res);
            } else if (role == 'automobilista' && plates) {
                if (this.checkPlates(req, res)) {
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
}

export default new TransitStatusController();
