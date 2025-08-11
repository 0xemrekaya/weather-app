import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { LoginRequest } from '../dto/login-request.dto';
import { LoginResponse } from '../dto/login-response.dto';
import { ErrorResponse, RateLimitErrorResponse, ValidationErrorResponse } from '../../../common/dto/error-response.dto';

// Swagger decorator for user login 
export function ApiLoginSwagger() {
    return applyDecorators(
        ApiOperation({
            summary: 'User login',
            description: 'Authenticate user with username and password. Returns JWT token with User object.'
        }),
        ApiBody({
            type: LoginRequest,
            description: 'User login credentials'
        }),
        ApiResponse({
            status: 200,
            description: 'Login successful',
            type: LoginResponse
        }),
        ApiResponse({
            status: 400,
            description: 'Validation error - Invalid input format',
            type: ValidationErrorResponse
        }),
        ApiResponse({
            status: 401,
            description: 'Invalid credentials - Wrong username or password',
            type: ErrorResponse
        }),
        ApiResponse({
            status: 404,
            description: 'User not found',
            type: ErrorResponse
        }),
        ApiResponse({
            status: 429,
            description: 'Rate limit exceeded',
            type: RateLimitErrorResponse
        }),
        ApiResponse({
            status: 500,
            description: 'Internal server error',
            type: ErrorResponse
        })
    );
}
