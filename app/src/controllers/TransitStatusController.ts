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
        
        let whereClause: any = {};
  
        // Filtra per targhe solo se l'utente è un automobilista
        if (req.user.role === 'operatore' && plates) {
          whereClause.plate = Array.isArray(plates) ? plates : [plates];
        }
  
        if (startDate && endDate) {
            whereClause.passing_by_date = {
                [Op.between]: [new Date(startDate as string), new Date(endDate as string)],
            };
        }        
  
        // Ottieni i transiti dal database
        const transits = await Transit.findAll({
          where: whereClause,
          include: [
            { model: Passage, attributes: ['name'] },
            { model: Vehicle, attributes: ['vehicle_type'] },
          ],
        });
  
        // Formato di output JSON
        if (req.query.format === 'json' || !req.query.format) {
          return res.status(200).json({ transits });
        }
  
        // Formato di output PDF
        if (req.query.format === 'pdf') {
          const pdf = new PDFDocument();
          pdf.text('Transits Report');
  
          transits.forEach((transit) => {
            pdf.text(`Plate: ${transit.plate}`);
            pdf.text(`Passage: ${transit.passage_id}`);
            pdf.text(`Vehicle Type: ${transit.vehicle_type}`);
            pdf.text('--------------------------------------------');
          });
  
          res.setHeader('Content-Type', 'application/pdf');
          pdf.pipe(res);
          pdf.end();
        }
      } catch (error) {
        console.error('Error retrieving transits:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
  

export default new TransitStatusController();
