// src/controllers/UserController.ts

import { Request, Response } from 'express';
import Passage from '../models/Passage'; // Importa il modello Passage

export async function getPassages(req: Request, res: Response): Promise<void> {
  try {
    // Recupera tutti gli utenti dal database utilizzando il modello User
    const passages = await Passage.findAll();

    // Invia una risposta JSON con gli utenti trovati
    res.json(passages);
  } catch (error) {
    console.error('Errore durante il recupero degli utenti:', error);
    res.status(500).json({ error: 'Errore durante il recupero degli utenti' });
  }
}
