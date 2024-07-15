// ErrorMessages.ts

import { HttpStatus, Response, Message, MessageFactory, Error } from './Status';


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
            message: "Bad request - Email format is not valid for the User",
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

class creationBadRequest implements Message {
    getResponse(): Response {
        return {
            status: HttpStatus.BAD_REQUEST,
            message: "Bad request - Request not valid for creation",
            type: "application/json"
        }
    }
}

class readingBadRequest implements Message {
    getResponse(): Response {
        return {
            status: HttpStatus.BAD_REQUEST,
            message: "Bad request - Request not valid for read",
            type: "application/json"
        }
    }
}

class updateBadRequest implements Message {
    getResponse(): Response {
        return {
            status: HttpStatus.BAD_REQUEST,
            message: "Bad request - Request not valid for update",
            type: "application/json"
        }
    }
}

class deleteBadRequest implements Message {
    getResponse(): Response {
        return {
            status: HttpStatus.BAD_REQUEST,
            message: "Bad request - Request not valid for delete",
            type: "application/json"
        }
    }
}

class creationInternalServerError implements Message {
    getResponse(): Response {
        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: "Bad request - Creation of model failed",
            type: "application/json"
        }
    }
}

class readInternalServerError implements Message {
    getResponse(): Response {
        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: "Bad request - Reading data from model failed",
            type: "application/json"
        }
    }
}

class updateInternalServerError implements Message {
    getResponse(): Response {
        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: "Bad request - Updating model failed",
            type: "application/json"
        }
    }
}

class deleteInternalServerError implements Message {
    getResponse(): Response {
        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: "Bad request - Deleting model failed",
            type: "application/json"
        }
    }
}

class resourceNotFoundError implements Message {
    getResponse(): Response {
        return {
            status: HttpStatus.NOT_FOUND,
            message: "Not Found - Resource not found or not existing, check console log for details",
            type: "application/json"
        }
    }
}

class defaultError implements Message {
    getResponse(): Response {
        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: "Ops, something went wrong",
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
    getResponse(): Response {
        return {
            status: HttpStatus.BAD_REQUEST,
            message: "Bad request - Format not valid, check console log for details",
            type: "application/json"
        }
    }
}

class routeNotFound implements Message{
    getResponse(): Response {
      return {
        status: HttpStatus.NOT_FOUND,
        message: "Not Found - Route not found",
        type: "application/json"
      }
    }
  }

  class functionNotWorking implements Message{
    getResponse(): Response {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Internal Server Error - some functions do not work properly, check console log for details",
        type: "application/json"
      }
    }
  }

  class invalidFormatOrResourceNotFound implements Message{
    getResponse(): Response {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Internal Server Error - The format is invalid or some resources do not exist, check console log for details",
        type: "application/json"
      }
    }
  }
  
export class errorFactory extends MessageFactory {

    getMessage(type: Error): Message {
        let errorMessage: Message | null = null;

        switch (type) {
            case Error.userLoginError:
                errorMessage = new userLoginError;
                break;
            case Error.emailNotValid:
                errorMessage = new emailNotValid;
                break;
            case Error.loginBadRequest:
                errorMessage = new loginBadRequest;
                break;
            case Error.jwtNotValid:
                errorMessage = new jwtNotValid;
                break;
            case Error.userNotAuthorized:
                errorMessage = new userNotAuthorized;
                break;
            case Error.passageLoginError:
                errorMessage = new passageLoginError;
                break;
            case Error.creationBadRequest:
                errorMessage = new creationBadRequest;
                break;
            case Error.readingBadRequest:
                errorMessage = new readingBadRequest;
                break;
            case Error.updateBadRequest:
                errorMessage = new updateBadRequest;
                break;
            case Error.deleteBadRequest:
                errorMessage = new deleteBadRequest;
                break;
            case Error.creationInternalServerError:
                errorMessage = new creationInternalServerError;
                break;
            case Error.readInternalServerError:
                errorMessage = new readInternalServerError;
                break;
            case Error.updateInternalServerError:
                errorMessage = new updateInternalServerError;
                break;
            case Error.deleteInternalServerError:
                errorMessage = new deleteInternalServerError;
                break;
            case Error.resourceNotFoundError:
                errorMessage = new resourceNotFoundError;
                break;
            case Error.invalidDateFormat:
                errorMessage = new invalidDateFormat;
                break;
            case Error.invalidHourFormat:
                errorMessage = new invalidHourFormat;   
                break;
            case Error.invalidFormat:
                errorMessage = new invalidFormat;   
                break; 
            case Error.routeNotFound:
                errorMessage = new routeNotFound;   
                break;
            case Error.functionNotWorking:
                errorMessage = new functionNotWorking;   
                break;
            case Error.invalidFormatOrResourceNotFound:
                errorMessage = new invalidFormatOrResourceNotFound;   
                break;                
            default:
                errorMessage = new defaultError;    
        }
        return errorMessage;
    }
}
