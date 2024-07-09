// src/controllers/UserController.ts

import { Request, Response } from 'express'
import Bill from '../models/Bill'; // Importa il modello Bill

export async function getBills(req: Request, res: Response): Promise<void> {
  try {
    // Recupera tutti gli utenti dalbdatabase utilizzando il modello User
    const bills = await Bill.findAll();

    // Invia una risposta JSON con gli utenti trovati
    res.json(bills);
  } catch (error) {
    console.error('Errore durante il recupero degli utenti:', error);
    res.status(500).json({ error: 'Errore durante il recupero degli utenti' });
  }
}
