// HttpStatus.ts

export enum HttpStatus {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500
}

export enum Success {
    //User login success message
    userLoginSuccess,

    //Passage login success message
    passageLoginSuccess,

    //Authorization success message
    userAuthorized,

    //User CRUD success messages
    userCreationSuccess,
    userReadSuccess,
    userUpdateSuccess,
    userDeleteSuccess,

    //Parking CRUD success messages
    parkingCreationSuccess,
    parkingReadSuccess,
    parkingUpdateSuccess,
    parkingDeleteSuccess,

    //Passage CRUD success messages
    passageCreationSuccess,
    passageReadSuccess,
    passageUpdateSuccess,
    passageDeleteSuccess,

    //Transit CRUD success messages
    transitCreationSuccess,
    transitReadSuccess,
    transitUpdateSuccess,
    transitDeleteSuccess,

    //Fee CRUD success messages
    feeCreationSuccess,
    feeReadSuccess,
    feeUpdateSuccess,
    feeDeleteSuccess,

    //
}


export enum Error {
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

    //CRUD bad request error messages
    creationBadRequest,
    readingBadRequest,
    updateBadRequest,
    deleteBadRequest,

    //General CRUD Internal Server Error messages
    creationInternalServerError,
    readInternalServerError,
    updateInternalServerError,
    deleteInternalServerError,

    //General errors
    resourceNotFoundError,
    invalidDateFormat,
    invalidHourFormat,
    invalidFormat,
    invalidFormatOrResourceNotFound,
    routeNotFound,
    functionNotWorking,
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
