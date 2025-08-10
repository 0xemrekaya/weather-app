import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Request, Response } from 'express';
import { Prisma } from "generated/prisma";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let error = 'Internal Server Error';

        // Handle HTTP exceptions
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const responseBody = exception.getResponse();
            
            if (typeof responseBody === 'object') {
                message = (responseBody as any).message || exception.message;
                error = (responseBody as any).error || exception.name;
            } else {
                message = responseBody;
                error = exception.name;
            }
        }
        // Handle Prisma database errors
        else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
            switch (exception.code) {
                case 'P2002':
                    status = HttpStatus.CONFLICT;
                    message = 'Email or username already exists';
                    error = 'Conflict';
                    break;
                case 'P2025':
                    status = HttpStatus.NOT_FOUND;
                    message = 'Record not found';
                    error = 'Not Found';
                    break;
                case 'P2003':
                    status = HttpStatus.BAD_REQUEST;
                    message = 'Foreign key constraint failed';
                    error = 'Bad Request';
                    break;
                default:
                    status = HttpStatus.INTERNAL_SERVER_ERROR;
                    message = 'Database error occurred';
                    error = 'Database Error';
            }
        }
        // Handle Prisma validation errors
        else if (exception instanceof Prisma.PrismaClientValidationError) {
            status = HttpStatus.BAD_REQUEST;
            message = 'Invalid data provided';
            error = 'Validation Error';
        }
        // Handle unexpected errors
        else if (exception instanceof Error) {
            message = exception.message;
            error = exception.name;
        }

        // Log the error for debugging
        // this.logger.error(
        //     `${request.method} ${request.url} - ${status} ${error}`,
        //     exception instanceof Error ? exception.stack : exception,
        // );

        // Send consistent error response
        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            method: request.method,
            error,
            message,
        });
    }
}