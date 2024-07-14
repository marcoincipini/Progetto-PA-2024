import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import User from '../models/User'
import Passage from '../models/Passage';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export async function login(req: Request, res: Response) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        
        const user = await User.getUserData(email);

        // Check if user exists and password matches
        if (user && user.password === password) {
            console.log("Login as " + user.role);

            // Compose payload with the user info
            const payload = {
                email: user.email,
                name: user.name,
                surname: user.surname,
                role: user.role
            };

            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

            return res.json({ token });
        } else {
            return res.status(401).json({ message: 'Email or password is incorrect' });
        }
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }

};

export async function passageLogin(req: Request, res: Response) {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Name required' });
    }

    try {
        const passage = await Passage.findOne({ where: { name } });
        // Check if passage exists
        if (passage) {
            console.log("Login to passage " + passage.name);

            // Compose payload with the passage info
            const payload = {
                id: passage.id,
                name: passage.name,
                parking_id: passage.parking_id,
                entrance: passage.entrance,
                exit: passage.exit
            };

            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

            return res.json({ token });
        } else {
            return res.status(401).json({ message: 'Name or parking_id is incorrect' });
        }
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};