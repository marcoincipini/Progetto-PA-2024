// SuccessMessages.ts

import { HttpStatus, Response, Message } from './Status';

class SuccessMessage implements Message {
    private data?: string;

    constructor(data?: string) {
        this.data = data;
    }

    getResponse(): Response {
        return {
            message: "Success",
            status: HttpStatus.OK,
            data: this.data,
            type: "application/json"
        };
    }
}

class CreatedMessage implements Message {
    private data?: string;

    constructor(data?: string) {
        this.data = data;
    }

    getResponse(): Response {
        return {
            message: "Resource created successfully",
            status: HttpStatus.CREATED,
            data: this.data,
            type: "application/json"
        };
    }
}

export class SuccessMessages {
    public static successMessage = new SuccessMessage();
    public static createdMessage = new CreatedMessage();
}
