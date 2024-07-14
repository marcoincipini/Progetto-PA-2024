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
    
    async media(req: Request, res: Response): Promise<Response> {
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      // Creo le strutture
      let matriceOccupazione: number[][]=[];
      const t = await Parking.findAll();
      const nparcheggio:number = t.length;
      // Calcolo numero di intervalli
      let inizio: Date = new Date(startDate);
      let fine: Date = new Date(endDate);
      let numerointervalli:number=0;
      inizio.setHours(inizio.getHours()+1);
      while (inizio < fine) {
        numerointervalli += 1;
        inizio.setHours(inizio.getHours()+1);
      }
      console.log(numerointervalli);
      // Create the matrix with all elements initialized to 0
      matriceOccupazione = Array.from({ length: nparcheggio }, () => new Array(numerointervalli).fill(0));


      // Ricerca nelle fatture
      let fatture = await Bill.findBillsOutsideRange(startDate,endDate);
      for (const bill of fatture) {
        for (let i = 0; i < numerointervalli; i++) {
          matriceOccupazione[bill.parking_id - 1][i] += 1;        
        }
      }
      // Ricerca nei transiti
      let transiti = await Transit.findByDateRange(startDate,endDate);
      for (const tran of transiti) {
        let collegati = transiti.filter(elem => elem.plate === tran.plate);
        if(collegati){
          // caso ingresso uscita
        }else{
          if (tran.direction == 'E') {
            let inizio: Date = new Date(startDate);
            let ntemp:number=0;
            let dataingresso: Date = new Date(tran.passing_by_date+tran.passing_by_hour);
            inizio.setHours(inizio.getHours()+1);
            while (inizio < dataingresso) {
              ntemp += 1;
              inizio.setHours(inizio.getHours()+1);
            }
            while (dataingresso < fine) {
              matriceOccupazione[tran.passage?.parking_id][ntemp] += 1;

              ntemp += 1;
              inizio.setHours(inizio.getHours()+1);
            }
          } else {
            let inizio: Date = new Date(startDate);
            let ntemp:number=0;
            let dataingresso: Date = new Date(tran.passing_by_date+tran.passing_by_hour);
            inizio.setHours(inizio.getHours()+1);
            while (inizio < dataingresso) {
              matriceOccupazione[tran.passage?.parking_id][ntemp] += 1;

              ntemp += 1;
              inizio.setHours(inizio.getHours()+1);
            }
          }
        }
      }
      return res.status(200).json(matriceOccupazione);

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
      
              const transits = await Transit.findByDateRange(startDate, endDate);
      
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