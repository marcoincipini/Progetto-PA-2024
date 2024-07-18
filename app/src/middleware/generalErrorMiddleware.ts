import {errorFactory} from '../factory/ErrorMessage'
import {ErrorStatus, Message} from '../factory/Status'
//error factory istances
const ErrorFac: errorFactory = new errorFactory();
//in case user request non existing route

export function routeNotFound(req: any, res: any, next: any) {
    next(ErrorFac.getMessage(ErrorStatus.routeNotFound));
}

//error handler from the middleware
export function generalErrorHandler(err: any, req: any, res: any, next: any) {
    var response = (err).getResponse();
    res.setHeader('Content-Type', response.type).status(response.status).send(JSON.stringify({"response" : response.message}))
}