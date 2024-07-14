import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken'

export const isOperator = (req: Request, res: Response, next: NextFunction) => {
    if (req.body.user && req.body.user.role === 'operator') {
        next();
    } else {
        res.status(403).json({ error: "Access forbidden: operators only" });
    }
    };

    export const isCarDriver = (req: Request, res: Response, next: NextFunction) => {
        if (req.body.user && req.body.user.role === 'automobilista') {
            next();
        } else {
            res.status(403).json({ error: "Access forbidden: operators only" });
        }
        };