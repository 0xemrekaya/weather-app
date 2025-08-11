import { ApiProperty } from '@nestjs/swagger';

// Global Error response
/*
* @example
* {
*   "statusCode": 404,
*   "timestamp": "2025-08-10T12:00:00.000Z",
*   "method": "GET",
*   "error": "Not Found",
*   "message": "User not found"
* }
*/
export class ErrorResponse {
    @ApiProperty({
        description: 'HTTP status code',
        example: 404,
    })
    statusCode: number;

    @ApiProperty({
        description: 'Timestamp when the error occurred',
        example: '2025-08-10T12:00:00.000Z',
    })
    timestamp: string;

    @ApiProperty({
        description: 'HTTP method used',
        example: 'GET',
    })
    method: string;

    @ApiProperty({
        description: 'Error type',
        example: 'Not Found',
    })
    error: string;

    @ApiProperty({
        description: 'Detailed error message',
        example: 'User not found',
    })
    message: string;
}

// Global Validation Error response
/*
* @example
* {
*   "statusCode": 400,
*   "timestamp": "2025-08-10T12:00:00.000Z",
*   "method": "POST",
*   "error": "Bad Request",
*   "message": ["city must be a string", "country must be a string"]
* }
*/
export class ValidationErrorResponse {
    @ApiProperty({
        description: 'HTTP status code',
        example: 400,
    })
    statusCode: number;

    @ApiProperty({
        description: 'Timestamp when the error occurred',
        example: '2025-08-10T12:00:00.000Z',
    })
    timestamp: string;

    @ApiProperty({
        description: 'HTTP method used',
        example: 'POST',
    })
    method: string;

    @ApiProperty({
        description: 'Error type',
        example: 'Bad Request',
    })
    error: string;

    @ApiProperty({
        description: 'Array of validation errors',
        example: ['city must be a string', 'country must be a string'],
        isArray: true,
        type: String,
    })
    message: string[];
}
