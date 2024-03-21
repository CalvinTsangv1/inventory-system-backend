import {ServiceUnavailableException} from "@nestjs/common";

export class InternalServiceException extends ServiceUnavailableException {
    public error;

    constructor(error: any) {
        super();
        this.error = error;
    }

    isAxiosError() {
        return this.error.isAxiosError;
    }

}
