import { HttpStatus, Response, Message, SuccessStatus, MessageFactory } from './Status';

// Success message class for user login success
class userLoginSuccess implements Message {
    private specificMessage: string;
    constructor(specificMessage: string) {
        this.specificMessage = specificMessage;
    }
    getResponse(): Response {
        return {
            status: HttpStatus.OK,
            message: `OK - User login succeded: ${this.specificMessage}`,
            type: "application/json"
        }
    }
}

// Success message class for passage login success
class passageLoginSuccess implements Message {
    private specificMessage: string;
    constructor(specificMessage: string) {
        this.specificMessage = specificMessage;
    }
    getResponse(): Response {
        return {
            status: HttpStatus.OK,
            message: `OK - Passage login succeded: ${this.specificMessage}`,
            type: "application/json"
        }
    }
}

// Success message class for creation success
class creationSuccess implements Message {
    private specificMessage: string;
    constructor(specificMessage: string) {
        this.specificMessage = specificMessage;
    }
    getResponse(): Response {
        return {
            status: HttpStatus.CREATED,
            message: `Created - Create operation succeded: ${this.specificMessage}`,
            type: "application/json"
        }
    }
}

// Success message class for read operation success
class readSuccess implements Message {
    private specificMessage: string;
    constructor(specificMessage: string) {
        this.specificMessage = specificMessage;
    }
    getResponse(): Response {
        return {
            status: HttpStatus.OK,
            message: `OK - Read operation succeded: ${this.specificMessage}`,
            type: "application/json"
        }
    }
}

// Success message class for update operation success
class updateSuccess implements Message {
    private specificMessage: string;
    constructor(specificMessage: string) {
        this.specificMessage = specificMessage;
    }
    getResponse(): Response {
        return {
            status: HttpStatus.CREATED,
            message: `Created - Update operation succeded: ${this.specificMessage}`,
            type: "application/json"
        }
    }
}

// Success message class for delete operation success
class deleteSuccess implements Message {
    private specificMessage: string;
    constructor(specificMessage: string) {
        this.specificMessage = specificMessage;
    }
    getResponse(): Response {
        return {
            status: HttpStatus.NO_CONTENT,
            message: `No content - Delete operation succeded: ${this.specificMessage}`,
            type: "application/json"
        }
    }
}

// Default success message class
class defaultSuccess implements Message {
    private specificMessage: string;
    constructor(specificMessage: string) {
        this.specificMessage = specificMessage;
    }
    getResponse(): Response {
        return {
            status: HttpStatus.OK,
            message: `Ok - Operation completed: ${this.specificMessage}`,
            type: "application/json"
        };
    }
}

// Factory class to generate success messages
export class successFactory extends MessageFactory {

    getMessage(type: SuccessStatus, specificMessage?: string): Message {
        let successMessage: Message | null = null;

        // Switch case to return the appropriate success message based on the success type
        switch (type) {
            case SuccessStatus.userLoginSuccess:
                successMessage = new userLoginSuccess(specificMessage);
                break;
            case SuccessStatus.passageLoginSuccess:
                successMessage = new passageLoginSuccess(specificMessage);
                break;
            case SuccessStatus.creationSuccess:
                successMessage = new creationSuccess(specificMessage);
                break;
            case SuccessStatus.readSuccess:
                successMessage = new readSuccess(specificMessage);
                break;
            case SuccessStatus.updateSuccess:
                successMessage = new updateSuccess(specificMessage);
                break;
            case SuccessStatus.deleteSuccess:
                successMessage = new deleteSuccess(specificMessage);
                break;
            default:
                successMessage = new defaultSuccess(specificMessage);
        }

        return successMessage
    }
}