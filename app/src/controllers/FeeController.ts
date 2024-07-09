// src/controllers/UserController.ts

import { Request, Response } from 'express';
import Fee from '../models/Fee'; // Importa il modello Fee

export async function getFees(req: Request, res: Response): Promise<void> {
  try {
    // Recupera tutti gli utenti dal database utilizzando il modello User
    const fees = await Fee.findAll();

    // Invia una risposta JSON con gli utenti trovati
    res.json(fees);
  } catch (error) {
    console.error('Errore durante il recupero degli utenti:', error);
    res.status(500).json({ error: 'Errore durante il recupero degli utenti' });
  }
}
