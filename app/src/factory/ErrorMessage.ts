// ErrorMessages.ts

import { HttpStatus, Response, Message, MessageFactory, ErrorStatus } from './Status';


class userLoginError implements Message {
    getResponse(): Response {
        return {
            status: HttpStatus.UNAUTHORIZED,
            message: "Unauthorized - User login failed",
            type: "application/json"
        }
    }
}

class emailNotValid implements Message {
    getResponse(): Response {
        return {
            status: HttpStatus.BAD_REQUEST,
            message: "Bad request - Email format is not valid",
            type: "application/json"
        }
    }
}

class loginBadRequest implements Message {
    getResponse(): Response {
        return {
            status: HttpStatus.BAD_REQUEST,
            message: "Bad request - The request for the login is not done correctly",
            type: "application/json"
        }
    }
}

class jwtNotValid implements Message {
    getResponse(): Response {
        return {
            status: HttpStatus.FORBIDDEN,
            message: "Forbidden - The JWT authentication failed, JWT not valid or expired",
            type: "application/json"
        }
    }
}

class userNotAuthorized implements Message {
    getResponse(): Response {
        return {
            status: HttpStatus.FORBIDDEN,
            message: "Forbidden - User not authorized for this operation",
            type: "application/json"
        }
    }
}

class passageLoginError implements Message {
    getResponse(): Response {
        return {
            status: HttpStatus.UNAUTHORIZED,
            message: "Unauthorized - Passage login failed",
            type: "application/json"
        }
    }
}

class creationInternalServerError implements Message {
    private specificMessage: string;
    constructor(specificMessage: string) {
        this.specificMessage = specificMessage;
    }
    getResponse(): Response {
        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: `Bad request - Creation of model failed: ${this.specificMessage}`,
            type: "application/json"
        }
    }
}

class readInternalServerError implements Message {
    private specificMessage: string;
    constructor(specificMessage: string) {
        this.specificMessage = specificMessage;
    }
    getResponse(): Response {
        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: `Bad request - Reading data from model failed: ${this.specificMessage}`,
            type: "application/json"
        }
    }
}

class updateInternalServerError implements Message {
    private specificMessage: string;
    constructor(specificMessage: string) {
        this.specificMessage = specificMessage;
    }
    getResponse(): Response {
        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: `Bad request - Updating model failed: ${this.specificMessage}`,
            type: "application/json"
        }
    }
}

class deleteInternalServerError implements Message {
    private specificMessage: string;
    constructor(specificMessage: string) {
        this.specificMessage = specificMessage;
    }
    getResponse(): Response {
        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: `Bad request - Deleting model failed: ${this.specificMessage}`,
            type: "application/json"
        }
    }
}

class resourceNotFoundError implements Message {
    private specificMessage: string;
    constructor(specificMessage: string) {
        this.specificMessage = specificMessage;
    }
    getResponse(): Response {
        return {
            status: HttpStatus.NOT_FOUND,
            message: `Not Found - Resource not found or not existing: ${this.specificMessage}`,
            type: "application/json"
        }
    }
}

class defaultError implements Message {
    private specificMessage: string;
    constructor(specificMessage: string) {
        this.specificMessage = specificMessage;
    }
    getResponse(): Response {
        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: `Ops, something went wrong: ${this.specificMessage}`,
            type: "application/json"
        };
    }
}

class invalidDateFormat implements Message {
    getResponse(): Response {
        return {
            status: HttpStatus.BAD_REQUEST,
            message: "Bad request - Date format should be aaaa-mm-gg",
            type: "application/json"
        }
    }
}

class invalidHourFormat implements Message {
    getResponse(): Response {
        return {
            status: HttpStatus.BAD_REQUEST,
            message: "Bad request - Hour format should be hh:mm:ss",
            type: "application/json"
        }
    }
}

class invalidFormat implements Message {
    private specificMessage: string;
    constructor(specificMessage: string) {
        this.specificMessage = specificMessage;
    }
    getResponse(): Response {
        return {
            status: HttpStatus.BAD_REQUEST,
            message: `Bad request - Format not valid: ${this.specificMessage}`,
            type: "application/json"
        }
    }
}

class routeNotFound implements Message {
    getResponse(): Response {
        return {
            status: HttpStatus.NOT_FOUND,
            message: "Not Found - Route not found",
            type: "application/json"
        }
    }
}

class functionNotWorking implements Message {
    private specificMessage: string;
    constructor(specificMessage: string) {
        this.specificMessage = specificMessage;
    }
    getResponse(): Response {
        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: `Internal Server Error - some functions do not work properly: ${this.specificMessage}`,
            type: "application/json"
        }
    }
}

class invalidFormatOrResourceNotFound implements Message {
    private specificMessage: string;
    constructor(specificMessage: string) {
        this.specificMessage = specificMessage;
    }
    getResponse(): Response {
        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: `Internal Server Error - The format is invalid or some resources do not exist: ${this.specificMessage}`,
            type: "application/json"
        }
    }
}

class parkingFull implements Message {
    getResponse(): Response {
        return {
            status: HttpStatus.FORBIDDEN,
            message: "Forbidden - The parking is full, no more spots available",
            type: "application/json"
        }
    }
}

class resourceAlreadyPresent implements Message {
    private specificMessage: string;
    constructor(specificMessage: string) {
        this.specificMessage = specificMessage;
    }
    getResponse(): Response {
        return {
            status: HttpStatus.FORBIDDEN,
            message: `Forbidden - The resource is already present:${this.specificMessage}`,
            type: "application/json"
        }
    }
}

export class errorFactory extends MessageFactory {

    getMessage(type: ErrorStatus, specificMessage?: string): Message {
        let errorMessage: Message | null = null;

        switch (type) {
            case ErrorStatus.userLoginError:
                errorMessage = new userLoginError;
                break;
            case ErrorStatus.emailNotValid:
                errorMessage = new emailNotValid;
                break;
            case ErrorStatus.loginBadRequest:
                errorMessage = new loginBadRequest;
                break;
            case ErrorStatus.jwtNotValid:
                errorMessage = new jwtNotValid;
                break;
            case ErrorStatus.userNotAuthorized:
                errorMessage = new userNotAuthorized;
                break;
            case ErrorStatus.passageLoginError:
                errorMessage = new passageLoginError;
                break;
            case ErrorStatus.creationInternalServerError:
                errorMessage = new creationInternalServerError(specificMessage);
                break;
            case ErrorStatus.readInternalServerError:
                errorMessage = new readInternalServerError(specificMessage);
                break;
            case ErrorStatus.updateInternalServerError:
                errorMessage = new updateInternalServerError(specificMessage);
                break;
            case ErrorStatus.deleteInternalServerError:
                errorMessage = new deleteInternalServerError(specificMessage);
                break;
            case ErrorStatus.resourceNotFoundError:
                errorMessage = new resourceNotFoundError(specificMessage);
                break;
            case ErrorStatus.invalidDateFormat:
                errorMessage = new invalidDateFormat;
                break;
            case ErrorStatus.invalidHourFormat:
                errorMessage = new invalidHourFormat;
                break;
            case ErrorStatus.invalidFormat:
                errorMessage = new invalidFormat(specificMessage);
                break;
            case ErrorStatus.routeNotFound:
                errorMessage = new routeNotFound;
                break;
            case ErrorStatus.functionNotWorking:
                errorMessage = new functionNotWorking(specificMessage);
                break;
            case ErrorStatus.invalidFormatOrResourceNotFound:
                errorMessage = new invalidFormatOrResourceNotFound(specificMessage);
                break;
            case ErrorStatus.parkingFull:
                errorMessage = new parkingFull;
                break;
            case ErrorStatus.resourceAlreadyPresent:
                errorMessage = new resourceAlreadyPresent(specificMessage);
                break;

            default:
                errorMessage = new defaultError(specificMessage);
        }
        return errorMessage;
    }
}
