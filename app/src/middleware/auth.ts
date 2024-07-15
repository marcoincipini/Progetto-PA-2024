import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import User from '../models/User'
import Passage from '../models/Passage';
import { validateEmail } from './validateData';
import { errorFactory  } from '../factory/ErrorMessage';
import { Error } from '../factory/Status'

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

class authMiddleware {

    async isOperator(req: Request, res: Response, next: NextFunction) {
        const user = req.body.user;
        const userData = await User.getUserData(user.email);
        if (!validateEmail(user.email)){
            next(Error.emailNotValid);
        }
        if (userData && userData.role === 'operatore') {
            next();
        } else {
            next(Error.userNotAuthorized);
        }
    };

    async isPassageOrOperator(req: Request, res: Response, next: NextFunction) {
        const user = req.body.user;
        const passage = req.body.passage;
    
        try {
            // Controlla se l'utente è un operatore
            if (user) {
                if (!validateEmail(user.email)){
                    next(Error.emailNotValid);
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
            next(Error.userNotAuthorized);
        } catch (error) {   
            next(Error.defaultError);
        }
    }

    async validateUserCredentials(req: Request, res: Response, next: NextFunction) {
        const { email, password } = req.body;

        if (!email || !password) {
            next(Error.loginBadRequest);
        }

        try {
            if (!validateEmail(email)){
                next(Error.emailNotValid);
            }
            const user = await User.getUserData(email);

            if (!user || user.password !== password) {
                next(Error.loginBadRequest);
            }

            // Aggiungi il dato dell'utente al req per l'utilizzo successivo nei controller
            req.body.user = user;
            next();
        } catch (error) {
            next(Error.userLoginError);
        }
    }

    async validatePassage(req: Request, res: Response, next: NextFunction) {
        const { name } = req.body;

        if (!name) {
            next(Error.loginBadRequest);
        }

        try {
            const passage = await Passage.findOne({ where: { name } });

            if (!passage) {
                console.log (passage + 'does not exist');
                next(Error.resourceNotFoundError);
            }

            // Aggiungi il dato del passage al req per l'utilizzo successivo nei controller
            req.body.passage = passage;
            next();
        } catch (error) {
            next(Error.passageLoginError);
        }
    }


    authenticateJWT(req: Request, res: Response, next: NextFunction) {
        const token = req.header('Authorization')?.split(' ')[1];
    
        if (!token) {
            console.log('Access token is missing or invalid' );
            next(Error.resourceNotFoundError);
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
                next(Error.jwtNotValid);
            }
    
            next();
        } catch (error) {
            next(Error.jwtNotValid);
        }
    }
}

export default new authMiddleware();