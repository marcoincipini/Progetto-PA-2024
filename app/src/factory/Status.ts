// HttpStatus.ts

export enum HttpStatus {
    OK = 200,
    CREATED = 201,
    NO_CONTENT = 204,   
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500
}

export enum SuccessStatus {
    //User login success message
    userLoginSuccess,

    //Passage login success message
    passageLoginSuccess,

    //Authorization success message
    userAuthorized,

    //User CRUD success messages
    creationSuccess,
    readSuccess,
    updateSuccess,
    deleteSuccess,

}


export enum ErrorStatus {
    //User login error messages
    userLoginError,
    emailNotValid,

    //Login bad request error message
    loginBadRequest,

    //JWT auth not valid message
    jwtNotValid,

    //Authorization error message
    userNotAuthorized,

    //Passage login error message
    passageLoginError,

    //General CRUD Internal Server Error messages
    creationInternalServerError,
    readInternalServerError,
    updateInternalServerError,
    deleteInternalServerError,

    //General errors
    resourceNotFoundError,
    resourceAlreadyPresent,
    invalidDateFormat,
    invalidHourFormat,
    invalidFormat,
    invalidFormatOrResourceNotFound,
    routeNotFound,
    functionNotWorking,
    parkingFull,
    defaultError

}

export interface Response {
    message: string;
    status: number;
    data?: string;
    type: string;
}

export interface Message {
    getResponse(): Response;
}

export abstract class MessageFactory {

    abstract getMessage(type: number): Message;
}
