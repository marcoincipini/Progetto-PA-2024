import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import User from '../models/User'
import Passage from '../models/Passage';
import { errorFactory } from '../factory/ErrorMessage';
import { successFactory } from '../factory/SuccessMessage';
import { ErrorStatus, SuccessStatus } from '../factory/Status'

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const ErrorFac: errorFactory = new errorFactory();
const SuccessFac: successFactory = new successFactory();

class loginController {
    async login(req: Request, res: Response) {
        const { email } = req.body;
        var result: any;
        try {
            const user = await User.getUserData(email);

            // Compose payload with the user info
            const payload = {
                email: user.email,
                name: user.name,
                surname: user.surname,
                role: user.role
            };

            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
            const successMessage = SuccessFac.getMessage(SuccessStatus.userLoginSuccess, `Logging as User ${user.name} ${user.surname} succeded`);
            result = res.json({ message: successMessage, data: { token } });
        } catch (err) {
            result = res.json(ErrorFac.getMessage(ErrorStatus.userLoginError, `Logging as User failed`));
        }
        return result;
    };

    async passageLogin(req: Request, res: Response) {
        const { name } = req.body;
        var result: any;
        try {
            const passage = await Passage.findOne({ where: { name } });

            // Compose payload with the passage info
            const payload = {
                id: passage.id,
                name: passage.name,
                parking_id: passage.parking_id,
                entrance: passage.entrance,
                exit: passage.exit
            };

            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

            const successMessage = SuccessFac.getMessage(SuccessStatus.passageLoginSuccess, `Logging as Passage ${passage.name} succeded`);
            result = res.json({ message: successMessage, data: { token } });
        } catch (err) {
            result = res.json(ErrorFac.getMessage(ErrorStatus.userLoginError, `Logging as Passage failed`));
        }
        return result;

    };
}

export default new loginController();