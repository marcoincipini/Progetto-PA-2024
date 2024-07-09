import { Request, Response } from 'express';
import Parking from '../models/Parking'; // Importa il modello User

export async function getParkings(req: Request, res: Response): Promise<void> {
  try {
    // Recupera tutti gli utenti dal database utilizzando il modello User
    const parkings = await Parking.findAll();

    // Invia una risposta JSON con gli utenti trovati
    res.json(parkings);
  } catch (error) {
    console.error('Errore durante il recupero degli utenti:', error);
    res.status(500).json({ error: 'Errore durante il recupero degli utenti' });
  }
}
