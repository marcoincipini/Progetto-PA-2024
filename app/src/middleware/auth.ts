// Import necessary modules 
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

// Import the models
import User from '../models/User'
import Passage from '../models/Passage';

// Import the middlewares
import { validateEmail } from './validateData';

// Import the factories
import { errorFactory } from '../factory/ErrorMessage';
import { ErrorStatus } from '../factory/Status'

// Initialize the error factory instance
const ErrorFac: errorFactory = new errorFactory();

dotenv.config();

// Get the JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

class authMiddleware {

    // Middleware to check if the user is an operator
    async isOperator(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.body.user;
            const userData = await User.getUserData(user.email);

            // Validate email format
            if (!validateEmail(user.email)) {
                next(ErrorFac.getMessage(ErrorStatus.emailNotValid));
            }

            // Check if the user has the role of 'operatore'
            if (userData.role === 'operatore' && userData) {
                next();
            } else {
                next(ErrorFac.getMessage(ErrorStatus.userNotAuthorized));
            }
        } catch (err) {
            next(ErrorFac.getMessage(ErrorStatus.defaultError, "Error in checking the logged User"));
        }
    };

    // Middleware to check if the user is an operator or if is a passage 
    async isPassageOrOperator(req: Request, res: Response, next: NextFunction) {
        const user = req.body.user;
        const passage = req.body.passage;

        try {
            // Check if the user is an operator
            if (user) {
                if (!validateEmail(user.email)) {
                    next(ErrorFac.getMessage(ErrorStatus.emailNotValid));
                }
                const userData = await User.getUserData(user.email);
                if (userData.role === 'operatore' && userData) {
                    return next();
                }
            }

            // Check if the passage is valid
            if (passage) {
                const passageData = await Passage.findByPk(passage.id);
                if (passageData) {
                    return next();
                }
            }

            // If none of the conditions are met, return not authorized
            next(ErrorFac.getMessage(ErrorStatus.userNotAuthorized));
        } catch (err) {
            next(ErrorFac.getMessage(ErrorStatus.defaultError, "Error in checking the logged User/passage"));
        }
    }

    // Middleware to validate user credentials
    async validateUserCredentials(req: Request, res: Response, next: NextFunction) {
        const { email, password } = req.body;

        // Check if email and password are provided
        if (!email || !password) {
            next(ErrorFac.getMessage(ErrorStatus.loginBadRequest));
        }

        try {
            // Validate email format
            if (!validateEmail(email)) {
                next(ErrorFac.getMessage(ErrorStatus.emailNotValid));
            }
            const user = await User.getUserData(email);

            // Check if user exists and password matches
            if (!user || user.password !== password) {
                next(ErrorFac.getMessage(ErrorStatus.loginBadRequest));
            }

            // Add user data to req for later use in controllers
            req.body.user = user;
            next();
        } catch (err) {
            next(ErrorFac.getMessage(ErrorStatus.userLoginError));
        }
    }

    // Middleware to validate passage data
    async validatePassage(req: Request, res: Response, next: NextFunction) {
        const { name } = req.body;

        // Check if name is provided
        if (!name) {
            next(ErrorFac.getMessage(ErrorStatus.loginBadRequest));
        }

        try {
            const passage = await Passage.findOne({ where: { name } });

            // Check if passage exists
            if (!passage) {
                next(ErrorFac.getMessage(ErrorStatus.resourceNotFoundError, `passage does not exist`));
            }

            // Add passage data to req for later use in controllers
            req.body.passage = passage;
            next();
        } catch (err) {
            next(ErrorFac.getMessage(ErrorStatus.passageLoginError));
        }
    }

    // Middleware to authenticate JWT
    authenticateJWT(req: Request, res: Response, next: NextFunction) {
        const token = req.header('Authorization')?.split(' ')[1];

        // Check if token is provided
        if (!token) {
            next(ErrorFac.getMessage(ErrorStatus.resourceNotFoundError, 'Access token is missing or invalid'));
        }

        try {
            const verified = jwt.verify(token, JWT_SECRET);

            // Check if the payload is for a user or a passage
            if (verified && (verified as any).email) {
                // Add user email to req for later use in controllers
                req.body.user = verified;
            } else if (verified && (verified as any).name) {
                // Add passage name to req for later use in controllers
                req.body.passage = verified;
            } else {
                next(ErrorFac.getMessage(ErrorStatus.jwtNotValid));
            }

            next();
        } catch (err) {
            next(ErrorFac.getMessage(ErrorStatus.jwtNotValid));
        }
    }
}

// Export an instance of authMiddleware
export default new authMiddleware();