import { ArgumentsHost, BadRequestException, Catch, ConflictException, ExceptionFilter, ForbiddenException, HttpException, HttpStatus, Logger, NotFoundException, PayloadTooLargeException, } from '@nestjs/common';
import axios from 'axios';
import * as console from "console";
import { get } from 'lodash';
import { GenericErrorEnum } from "../enum/generic-error.enum";
import {InternalServiceException} from "../module/rest/exception/internal-service.exception";

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        this.logException(exception)

        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        if (exception instanceof InternalServiceException) {
            this.axios(exception, request, response);
        } else if (exception instanceof PayloadTooLargeException) {
            this.payloadToLarge(exception, request, response);
        } else if (exception instanceof ForbiddenException) {
            this.forbidden(exception, request, response);
        } else if (exception instanceof BadRequestException) {
            this.badRequest(exception, request, response);
        } else if (exception instanceof NotFoundException) {
            this.notFound(exception, request, response);
        } else if (exception instanceof ConflictException) {
            this.conflict(exception, request, response);
        } else {
            this.unknownException(exception, request, response);
        }

    }

    private logException(exception: any){
        /* 
         1. internal error should be catch then throw with InternalServerErrorException.
         2. inner http call can throw response directly(AxiosError), or package with InternalServerErrorException(exception.response)
         3. others may be uncatched errors.

         axios error contains very detail datas, not suitable for log all.
        */
        if (axios.isAxiosError(exception)) {
            this.logger.error(`status: ${exception.status}, error: ${exception.code}, url: ${exception?.config?.url}`)
        } else if (axios.isAxiosError(exception.error)) {
            const error = exception.error
            this.logger.error(`status: ${exception.status}, error: ${error.code}, url: ${error?.config?.url}`, error.stack)
        } else if (axios.isAxiosError(exception.response)) {
             const response = exception.response
             this.logger.error(`error: ${response.code}, url: ${response.config?.url}`)
        } else if (exception.message) {
             this.logger.error(exception.message)
        } else if (exception.response?.data){
             this.logger.error(exception.response?.data)
        } else {
            //console.log for found out what's the uncatched error is
            console.log(exception)
            this.logger.error(exception) // uncatched error
        }
    }


    private axios(exception: any, request: any, response: any) {
        const error = exception.error;
        const axiosResponse = exception.error.response;
        const axiosRequest = exception.error.request;
        if (!error) {
            this.unknownException(exception, request, response);
        } else if (axiosResponse) {
            // The request was made and the server responded with a status code
            this.logger.error(axiosResponse.data?.message, axiosResponse.data);

            const statusCode = axiosResponse.status || get(axiosResponse, 'data.statusCode');
            const code = axiosResponse.code || get(axiosResponse, 'data.code');
            const message = axiosResponse.statusText || get(axiosResponse, 'data.message');
            // get process-api errors: nest.js:(axiosResponse.data.errors), java:(axiosResponse.data)
            const errors = get(axiosResponse, 'data.errors') || axiosResponse.data; 
            const service = get(axiosResponse, 'data.service') || 'UNKNOWN_PROCESS_API';

            response.status(statusCode).json({
              statusCode,
              code,
              message,
              errors,
              service,
            });
           
        } else if (axiosRequest) {
            // The request was made but no response was received
            const subCode = error.code;
            let statusCode = HttpStatus.SERVICE_UNAVAILABLE;
            let code = GenericErrorEnum.apiFailure;
            const message = error.message;
            if (subCode === 'ECONNABORTED' || subCode === 'ETIMEDOUT') {
                statusCode = HttpStatus.REQUEST_TIMEOUT
                code = GenericErrorEnum.requestTimeout;
            }
            response.status(statusCode).json({
                statusCode: statusCode,
                message: message,
                code: code,
                errors: [{
                    message: message,
                    code: code,
                    subCode: subCode
                }]
            });
        } else {
            // Something happened in setting up the request that triggered an Error
            this.unknownException(exception, request, response);
        }
    }

    private payloadToLarge(exception: PayloadTooLargeException, request: any, response: any) {
        const statusCode = HttpStatus.BAD_REQUEST;
        const code = GenericErrorEnum.payloadTooLarge;
        const message = exception.message ?? 'The payload is too large.';
        response.status(statusCode).json({
            statusCode: statusCode,
            message: message,
            code: code,
            errors: [{
                message: message,
                code: code
            }]
        });
    }

    private forbidden(exception: ForbiddenException, request: any, response: any) {
        const statusCode = HttpStatus.FORBIDDEN;
        const code = GenericErrorEnum.forbiddenResource;
        const message = exception.message ?? 'The requested resource is forbidden';
        response.status(statusCode).json({
            statusCode: statusCode,
            message: message,
            code: code,
            errors: [{
                message: message,
                code: code
            }]
        });
    }

    private badRequest(exception: BadRequestException, request: any, response: any) {
        const exceptionResponse: any = exception.getResponse();
        const message = exceptionResponse.message || exception.message;
        if (Array.isArray(message)) {
            // exception from class-validator
            const errors = [];
            message.forEach(m => errors.push({
                code: GenericErrorEnum.invalidParameter,
                message: m
            }));
            response.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                code: GenericErrorEnum.invalidParameter,
                message: 'Invalid parameter',
                errors: errors
            });
        } else {
            response.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                message: message,
                code: GenericErrorEnum.invalidParameter,
                errors: [{
                    message: message,
                    code: GenericErrorEnum.invalidParameter,
                }]
            });
        }
    }

    private notFound(exception: NotFoundException, request: any, response: any) {
        const statusCode = HttpStatus.NOT_FOUND;
        const code = GenericErrorEnum.notFound;
        const message = exception.message || 'The requested resource not found';
        response.status(statusCode).json({
            statusCode: statusCode,
            message: message,
            code: code,
            errors: [{
                message: message,
                code: code
            }]
        });
    }

    private conflict(exception: ConflictException, request: any, response: any) {
        const statusCode = HttpStatus.CONFLICT;
        const code = GenericErrorEnum.conflict;
        const message = exception.message || 'The resource already exist';
        response.status(statusCode).json({
            statusCode: statusCode,
            message: message,
            code: code,
            errors: [{
                message: message,
                code: code
            }]
        });
    }

    private custom(statusCode: HttpStatus, json: any, response: any) {
        response.status(statusCode).json(json);
    }

    private unknownException(exception: any, request: any, response: any) {
        const statusCode = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        const code = exception.code || GenericErrorEnum.unknownError;
        const defaultMessage = 'Unknown service error';
        const message = exception.message || defaultMessage;
        // @ts-ignore
        // const errorMessage = exception instanceof HttpException ? exception.message : (exception.stack ?? 'Unknown error');
        const errorMessage = get(exception, 'response.data') || exception.stack || defaultMessage;
        response.status(statusCode).json({
            statusCode: statusCode,
            message: message,
            code: code,
            errors: [{
                message: errorMessage,
                code: code
            }]
        });
    }

}
