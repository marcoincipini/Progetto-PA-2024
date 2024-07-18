// Import necessary modules and types
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import User from '../models/User'
import Passage from '../models/Passage';
import { errorFactory } from '../factory/ErrorMessage';
import { successFactory } from '../factory/SuccessMessage';
import { ErrorStatus, SuccessStatus } from '../factory/Status'

// Load environment variables
dotenv.config();

// Get JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

// Create instances of error and success message factories
const ErrorFac: errorFactory = new errorFactory();
const SuccessFac: successFactory = new successFactory();

// Define the loginController class
class loginController {
    // Method to handle user login
    async login(req: Request, res: Response) {
        const { email } = req.body;
        var result: any;

        try {
            // Get user data based on email
            const user = await User.getUserData(email);

            // Compose payload with the user info
            const payload = {
                email: user.email,
                name: user.name,
                surname: user.surname,
                role: user.role
            };

            // Generate JWT token
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

            // Create success message
            const successMessage = SuccessFac.getMessage(SuccessStatus.userLoginSuccess, `Logging as User ${user.name} ${user.surname} succeded`);

            // Send response with token
            result = res.json({ message: successMessage, data: { token } });
        } catch (err) {
            // Handle login error
            result = res.json(ErrorFac.getMessage(ErrorStatus.userLoginError, `Logging as User failed`));
        }

        return result;
    };

    // Method to handle passage login
    async passageLogin(req: Request, res: Response) {
        const { name } = req.body;
        var result: any;

        try {
            // Find passage based on name
            const passage = await Passage.findOne({ where: { name } });

            // Compose payload with the passage info
            const payload = {
                id: passage.id,
                name: passage.name,
                parking_id: passage.parking_id,
                entrance: passage.entrance,
                exit: passage.exit
            };

            // Generate JWT token
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

            // Create success message
            const successMessage = SuccessFac.getMessage(SuccessStatus.passageLoginSuccess, `Logging as Passage ${passage.name} succeded`);

            // Send response with token
            result = res.json({ message: successMessage, data: { token } });
        } catch (err) {
            // Handle login error
            result = res.json(ErrorFac.getMessage(ErrorStatus.userLoginError, `Logging as Passage failed`));
        }

        return result;
    };
}

// Export an instance of the loginController
export default new loginController();