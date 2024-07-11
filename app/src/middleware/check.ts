import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken'
/*
export const checkRole = (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.headers.authorization) {
            const decoded: any = jwt.decode(req.headers.authorization);
            if (decoded.role === 'operatore' || decoded.role === 'automobilista') {
                req.role = decoded.role; // Imposta il ruolo dell'utente sulla richiesta
                next();
            } else {
                console.log("Errore nella funzione: ruolo non valido");
                res.status(403).json({ message: 'Accesso negato' });
            }
        } else {
            console.log("Errore nella funzione: header di autorizzazione non presente");
            res.status(401).json({ message: 'Token di autenticazione mancante' });
        }
    } catch (error) {
        console.error("Errore nella funzione:", error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};
*/
