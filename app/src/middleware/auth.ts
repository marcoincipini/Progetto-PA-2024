import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import User from '../models/User'

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
/*
interface CustomRequest extends Request {
  user?: string | object;
}*/

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token is missing or invalid' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.body.user = verified;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Access token is invalid or expired' });
  }
};
