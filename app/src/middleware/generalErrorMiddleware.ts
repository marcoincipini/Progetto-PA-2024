import {errorFactory} from '../factory/ErrorMessage'
import {Error, Message} from '../factory/Status'
//error factory istances
const errors: errorFactory = new errorFactory();
//in case user request non existing route

export function routeNotFound(req: any, res: any, next: any) {
    next(Error.routeNotFound);
}

//error handler from the middleware
export function generalErrorHandler(err: Error, req: any, res: any, next: any) {
    var response = errors.getMessage(err).getResponse()
    console.log("MIDDLEWARE ERROR HANDLER: "+ response.message)
    res.setHeader('Content-Type', response.type).status(response.status).send(JSON.stringify({"response" : response.message, "data" : {}}))
}