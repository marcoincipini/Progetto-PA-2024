// src/controllers/UserController.ts

import { Request, Response } from 'express';
import Transit from '../models/Transit'; // Importa il modello Passage

export async function getTransit(req: Request, res: Response): Promise<void> {
  try {
    // Recupera tutti gli utenti dal database utilizzando il modello User
    const transit = await Transit.findAll();

    // Invia una risposta JSON con gli utenti trovati
    res.json(transit);
  } catch (error) {
    console.error('Errore durante il recupero degli utenti:', error);
    res.status(500).json({ error: 'Errore durante il recupero degli utenti' });
  }
}
