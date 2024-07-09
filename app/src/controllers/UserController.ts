// src/controllers/UserController.ts

import { Request, Response } from 'express';
import User from '../models/User'; // Importa il modello User

export async function getUsers(req: Request, res: Response): Promise<void> {
  try {
    // Recupera tutti gli utenti dal database utilizzando il modello User
    const users = await User.findAll();

    // Invia una risposta JSON con gli utenti trovati
    res.json(users);
  } catch (error) {
    console.error('Errore durante il recupero degli utenti:', error);
    res.status(500).json({ error: 'Errore durante il recupero degli utenti' });
  }
}
