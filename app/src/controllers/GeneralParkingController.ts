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
        console.log(selectedBill);
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
            const startDate = new Date(req.query.startDate as string);
            const endDate = new Date(req.query.endDate as string);
    
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return res.status(400).json({ error: 'Invalid dates provided' });
            }
    
            const parkings = await Parking.findAll();
            let results = [];
    
            for (const parking of parkings) {
                const dayStart = parseInt(parking.day_starting_hour.split(':')[0]);
                const dayEnd = parseInt(parking.day_finishing_hour.split(':')[0]);
    
                let totalDayFreeSpots = 0;
                let totalNightFreeSpots = 0;
                let totalDayIntervals = 0;
                let totalNightIntervals = 0;
    
                // Iterate over each day in the date range
                for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
                    let currentOccupiedSpots = parking.occupied_spots;
    
                    // Iterate over each hour of the day
                    for (let hour = 0; hour < 24; hour++) {
                        const intervalStart = new Date(date);
                        intervalStart.setHours(hour, 0, 0, 0);
                        const intervalEnd = new Date(date);
                        intervalEnd.setHours(hour, 59, 59, 999);
    
                        const intervalTransits = await Transit.findAll({
                            where: {
                                passing_by_date: {
                                    [Op.between]: [intervalStart, intervalEnd]
                                }
                            },
                            include: [
                                {
                                    model: Passage,
                                    where: { parking_id: parking.id },
                                    attributes: [] // Non includere gli attributi del modello Passage nei risultati
                                }
                            ]
                        });
    
                        for (const transit of intervalTransits) {
                            if (transit.direction === 'E') {
                                currentOccupiedSpots++;
                            } else {
                                currentOccupiedSpots--;
                            }
                        }
    
                        if (hour >= dayStart && hour < dayEnd) {
                            totalDayFreeSpots += (parking.parking_spots - currentOccupiedSpots);
                            totalDayIntervals++;
                        } else {
                            totalNightFreeSpots += (parking.parking_spots - currentOccupiedSpots);
                            totalNightIntervals++;
                        }
                    }
                }
    
                const averageDayFreeSpots = totalDayFreeSpots / (totalDayIntervals || 1);
                const averageNightFreeSpots = totalNightFreeSpots / (totalNightIntervals || 1);
    
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