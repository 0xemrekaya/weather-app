import { applyDecorators } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CreateUserRequest } from "../dto/create-user-request.dto";
import { CreateUserResponse } from "../dto/create-user-response.dto";
import { ErrorResponse, RateLimitErrorResponse, ValidationErrorResponse } from "../../../common/dto/error-response.dto";
import { GetAllUserResponse } from "../dto/get-all-user-response.dto";

// Swagger decorators for create-user endpoint
export function ApiCreateUserSwagger() {
    return applyDecorators(
        ApiOperation({
            summary: 'User registration (Admin only)',
            description: 'Register a new user with username, email, password and role. Returns User object.'
        }),
        ApiBearerAuth(),
        ApiBody({
            type: CreateUserRequest,
            description: 'User registration data'
        }),
        ApiResponse({
            status: 201,
            description: 'User registered successfully',
            type: CreateUserResponse
        }),
        ApiResponse({
            status: 400,
            description: 'Validation error - Invalid input format',
            type: ValidationErrorResponse
        }),
        ApiResponse({
            status: 401,
            description: 'Unauthorized - Invalid or missing token',
            type: ErrorResponse
        }),
        ApiResponse({
            status: 403,
            description: 'Forbidden - Admin access required',
            type: ErrorResponse
        }),
        ApiResponse({
            status: 409,
            description: 'Conflict - User already exists',
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

// Swagger decorators for get-all-users endpoint
export function ApiGetUserAllSwagger() {
    return applyDecorators(
        ApiOperation({ summary: 'Get all users (Admin only)' }),
        ApiBearerAuth(),
        ApiResponse({
            status: 200,
            description: 'List of all users',
            type: [GetAllUserResponse]
        }),
        ApiResponse({
            status: 401,
            description: 'Unauthorized - Invalid or missing token',
            type: ErrorResponse
        }),
        ApiResponse({
            status: 403,
            description: 'Forbidden - Admin access required',
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
    )
}