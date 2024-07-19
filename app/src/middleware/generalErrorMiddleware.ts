// Import the factories
import { errorFactory } from '../factory/ErrorMessage'
import { ErrorStatus } from '../factory/Status'

// Create an instance of the error factory
const ErrorFac: errorFactory = new errorFactory();

// Middleware function to handle non-existing routes
export function routeNotFound(req: any, res: any, next: any) {
    next(ErrorFac.getMessage(ErrorStatus.routeNotFound));
}

// General error handler middleware
export function generalErrorHandler(err: any, req: any, res: any, next: any) {
    // Get the error response from the error object
    var response = (err).getResponse();
    
     // Set the response header content type and status, then send the error message as a JSON response
    res.setHeader('Content-Type', response.type).status(response.status).send(JSON.stringify({"response" : response.message}))
}