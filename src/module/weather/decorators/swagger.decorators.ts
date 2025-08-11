import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, } from '@nestjs/swagger';
import { WeatherResponse } from '../dto/weather-response.dto';
import { UserWeatherResponse } from '../dto/user-weather-response.dto';
import { ErrorResponse, RateLimitErrorResponse, ValidationErrorResponse } from '../../../common/dto/error-response.dto';

// Swagger decorators for weather endpoints
// Get weather data for a city
export function ApiWeatherSwagger() {
    return applyDecorators(
        ApiOperation({ summary: 'Get weather data for a city' }),
        ApiBearerAuth(),
        ApiResponse({
            status: 200,
            description: 'Weather data retrieved successfully',
            type: WeatherResponse,
        }),
        ApiResponse({
            status: 400,
            description: 'Bad request - Invalid parameters',
            type: ValidationErrorResponse,
        }),
        ApiResponse({
            status: 401,
            description: 'Unauthorized - Invalid or missing token',
            type: ErrorResponse,
        }),
        ApiResponse({
            status: 404,
            description: 'Location not found',
            type: ErrorResponse,
        }),
        ApiResponse({
            status: 429,
            description: 'Too many requests - Rate limit exceeded',
            type: RateLimitErrorResponse,
        }),
        ApiResponse({
            status: 500,
            description: 'Internal server error - API key or service issues',
            type: ErrorResponse,
        }),
        ApiResponse({
            status: 503,
            description: 'Service unavailable - External API temporarily down',
            type: ErrorResponse,
        }),
    );
}

/// Swagger documentation for getting user weather query history with pagination and filtering
// Get weather query history for a specific user
export function ApiGetUserWeatherHistorySwagger() {
    return applyDecorators(
        ApiOperation({ 
            summary: 'Get user weather query history with pagination and filtering',
            description: 'Retrieve paginated weather query history for a user with optional filtering and sorting capabilities'
        }),
        ApiBearerAuth(),
        ApiQuery({
            name: 'page',
            required: false,
            type: Number,
            description: 'Page number (1-based)',
            example: 1
        }),
        ApiQuery({
            name: 'limit',
            required: false,
            type: Number,
            description: 'Number of items per page (1-100)',
            example: 20
        }),
        ApiQuery({
            name: 'sortBy',
            required: false,
            enum: ['queryTime', 'city'],
            description: 'Field to sort by',
            example: 'queryTime'
        }),
        ApiQuery({
            name: 'sortOrder',
            required: false,
            enum: ['asc', 'desc'],
            description: 'Sort order',
            example: 'desc'
        }),
        ApiQuery({
            name: 'city',
            required: false,
            type: String,
            description: 'Filter by city name (partial match)',
            example: 'Istanbul'
        }),
        ApiResponse({
            status: 200,
            description: 'User weather query history retrieved successfully with pagination',
            type: UserWeatherResponse,
        }),
        ApiResponse({
            status: 400,
            description: 'Bad request - Invalid query parameters',
            type: ValidationErrorResponse,
        }),
        ApiResponse({
            status: 401,
            description: 'Unauthorized - Invalid or missing token',
            type: ErrorResponse,
        }),
        ApiResponse({
            status: 403,
            description: 'Forbidden - Admin access required',
            type: ErrorResponse,
        }),
        ApiResponse({
            status: 404,
            description: 'User not found',
            type: ErrorResponse,
        }),
        ApiResponse({
            status: 429,
            description: 'Rate limit exceeded',
            type: RateLimitErrorResponse
        }),
        ApiResponse({
            status: 500,
            description: 'Internal server error - Database or system error',
            type: ErrorResponse,
        }),
    );
}