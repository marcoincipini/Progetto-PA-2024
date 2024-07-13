import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken'
/*
export const checkRole = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'operator') {
        next();
    } else {
        res.status(403).json({ error: "Access forbidden: operators only" });
    }
    };

*/