import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import User from '../models/User'
import Passage from '../models/Passage';
import { validateEmail } from './validateData';
import { errorFactory  } from '../factory/ErrorMessage';
import { ErrorStatus } from '../factory/Status'

const ErrorFac: errorFactory = new errorFactory();

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

class authMiddleware {

    async isOperator(req: Request, res: Response, next: NextFunction) {
        const user = req.body.user;
        const userData = await User.getUserData(user.email);
        if (!validateEmail(user.email)){
            next(ErrorFac.getMessage(ErrorStatus.emailNotValid));
        }
        if (userData && userData.role === 'operatore') {
            next();
        } else {
            next(ErrorFac.getMessage(ErrorStatus.userNotAuthorized));
        }
    };

    async isPassageOrOperator(req: Request, res: Response, next: NextFunction) {
        const user = req.body.user;
        const passage = req.body.passage;
    
        try {
            // Controlla se l'utente è un operatore
            if (user) {
                if (!validateEmail(user.email)){
                    next(ErrorFac.getMessage(ErrorStatus.emailNotValid));
                }
                const userData = await User.getUserData(user.email);
                if (userData && userData.role === 'operatore') {
                    return next();
                }
            }
    
            // Controlla se il passage è valido
            if (passage) {
                const passageData = await Passage.findByPk(passage.id);
                if (passageData) {
                    return next();
                }
            }
    
            // Se nessuna delle condizioni è soddisfatta, ritorna 403
            next(ErrorFac.getMessage(ErrorStatus.userNotAuthorized));
        } catch (error) {  
            const specificMessage = "Error in checking the logged User/passage" 
            next(ErrorFac.getMessage(ErrorStatus.defaultError, specificMessage));
        }
    }

    async validateUserCredentials(req: Request, res: Response, next: NextFunction) {
        const { email, password } = req.body;

        if (!email || !password) {
            next(ErrorFac.getMessage(ErrorStatus.loginBadRequest));
        }

        try {
            if (!validateEmail(email)){
                next(ErrorFac.getMessage(ErrorStatus.emailNotValid));
            }
            const user = await User.getUserData(email);

            if (!user || user.password !== password) {
                next(ErrorFac.getMessage(ErrorStatus.loginBadRequest));
            }

            // Aggiungi il dato dell'utente al req per l'utilizzo successivo nei controller
            req.body.user = user;
            next();
        } catch (error) {
            next(ErrorFac.getMessage(ErrorStatus.userLoginError));
        }
    }

    async validatePassage(req: Request, res: Response, next: NextFunction) {
        const { name } = req.body;

        if (!name) {
            next(ErrorFac.getMessage(ErrorStatus.loginBadRequest));
        }

        try {
            const passage = await Passage.findOne({ where: { name } });

            if (!passage) {
                const specificMessage = (passage + 'does not exist');
                next(ErrorFac.getMessage(ErrorStatus.resourceNotFoundError, specificMessage));
            }

            // Aggiungi il dato del passage al req per l'utilizzo successivo nei controller
            req.body.passage = passage;
            next();
        } catch (error) {
            next(ErrorFac.getMessage(ErrorStatus.passageLoginError));
        }
    }


    authenticateJWT(req: Request, res: Response, next: NextFunction) {
        const token = req.header('Authorization')?.split(' ')[1];
    
        if (!token) {
            const specificMessage = 'Access token is missing or invalid';
            next(ErrorFac.getMessage(ErrorStatus.resourceNotFoundError, specificMessage));
        }
    
        try {
            const verified = jwt.verify(token, JWT_SECRET);
    
            // Check if the payload is for a user or a passage
            if (verified && (verified as any).email) {
                // Assuming the token payload for a user contains an email
                req.body.user = verified;
            } else if (verified && (verified as any).name) {
                // Assuming the token payload for a passage contains a name
                req.body.passage = verified;
            } else {
                next(ErrorFac.getMessage(ErrorStatus.jwtNotValid));
            }
    
            next();
        } catch (error) {
            next(ErrorFac.getMessage(ErrorStatus.jwtNotValid));
        }
    }
}

export default new authMiddleware();