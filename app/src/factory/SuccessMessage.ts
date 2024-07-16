// SuccessMessages.ts

import { HttpStatus, Response, Message, SuccessStatus, MessageFactory } from './Status';

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

class userAuthorized implements Message {
    private specificMessage: string;
    constructor(specificMessage: string) {
        this.specificMessage = specificMessage;
    }
    getResponse(): Response {
        return {
            status: HttpStatus.OK,
            message: `OK - User authorized for this operation: ${this.specificMessage}`,
            type: "application/json"
        }
    }
}

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
export class successFactory extends MessageFactory {

    getMessage(type: SuccessStatus, specificMessage?: string): Message {
        let successMessage: Message | null = null;

        switch (type) {
            case SuccessStatus.userLoginSuccess:
                successMessage = new userLoginSuccess(specificMessage);
                break;
            case SuccessStatus.passageLoginSuccess:
                successMessage = new passageLoginSuccess(specificMessage);
                break;
            case SuccessStatus.userAuthorized:
                successMessage = new userAuthorized(specificMessage);
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

