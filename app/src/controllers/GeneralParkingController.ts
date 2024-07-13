import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Transit from '../models/Transit';
import Vehicle from '../models/Vehicle';
import Passage from '../models/Passage';
import PDFDocument from 'pdfkit';
import Bill from '../models/Bill';
import Parking from '../models/Parking';

class GeneralParkingController{
    async getStatistics(req:Request, res:Response):Promise<Response>{
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;
        
        let selectedBill = await Bill.findByDateTimeRange(startDate, endDate);
        type Parkings = {
            id: number;
            sum: number;
          };
          let parkings: Parkings[] = [];
          for(const bill of selectedBill){
           let selectedParkings = parkings.find((park) => park.id === bill.parking_id);
            if(selectedParkings ){
                selectedParkings.sum += parseFloat(bill.amount as unknown as string);

            }else{
                parkings.push({id: bill.parking_id, sum: parseFloat(bill.amount as unknown as string)});
            }
          }
          return res.status(200).json({ parkings });
    }

    async getAverageFreeSpots(req: Request, res: Response): Promise<Response> {
        try {
            const startDate = req.query.startDate as string;
            const endDate = req.query.endDate as string;
      
            // Check if dates are valid
            if (!startDate || isNaN(Date.parse(startDate))) {
              return res.status(400).json({ error: 'Invalid startDate' });
            }
      
            if (!endDate || isNaN(Date.parse(endDate))) {
              return res.status(400).json({ error: 'Invalid endDate' });
            }
      
            const parkings = await Parking.findAll();
            let results = [];
      
            for (const parking of parkings) {
              const dayStart = parking.day_starting_hour;
              const dayEnd = parking.day_finishing_hour;
      
              const transits = await Transit.findByDateRange(startDate, endDate, parking.id);
      
              let dayOccupiedSpots = 0;
              let nightOccupiedSpots = 0;
              let dayCount = 0;
              let nightCount = 0;
      
              for (const transit of transits) {
                const passingHour = parseInt(transit.passing_by_hour.split(':')[0]);
      
                if (passingHour >= parseInt(dayStart.split(':')[0]) && passingHour < parseInt(dayEnd.split(':')[0])) {
                  dayOccupiedSpots += transit.direction === 'E' ? 1 : -1;
                  dayCount++;
                } else {
                  nightOccupiedSpots += transit.direction === 'E' ? 1 : -1;
                  nightCount++;
                }
              }
      
              const totalSpots = parking.parking_spots;
      
              const averageDayFreeSpots = totalSpots - (dayOccupiedSpots / (dayCount || 1));
              const averageNightFreeSpots = totalSpots - (nightOccupiedSpots / (nightCount || 1));
      
              results.push({
                parking_id: parking.id,
                parking_name: parking.name,
                average_day_free_spots: averageDayFreeSpots,
                average_night_free_spots: averageNightFreeSpots
              });
            }
      
            return res.status(200).json({ statistics: results });
          } catch (error) {
            return res.status(500).json({ error: error.message });
          }
        }
}

export default new GeneralParkingController;