import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import User from '../models/User'
import Passage from '../models/Passage';
import { errorFactory  } from '../factory/ErrorMessage';
import { ErrorStatus } from '../factory/Status'

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const ErrorFac: errorFactory = new errorFactory();

class loginController {
    async login(req: Request, res: Response) {
        const { email } = req.body;

        const user = await User.getUserData(email);

        // Compose payload with the user info
        const payload = {
            email: user.email,
            name: user.name,
            surname: user.surname,
            role: user.role
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        return res.json({ token });

    };

    async passageLogin(req: Request, res: Response) {
        const { name } = req.body;

        const passage = await Passage.findOne({ where: { name } });

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

    };
}

export default new loginController();