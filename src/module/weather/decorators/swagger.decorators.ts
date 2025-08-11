import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, } from '@nestjs/swagger';
import { WeatherResponse } from '../dto/weather-response.dto';
import { UserWeatherResponse } from '../dto/user-weather-response.dto';
import { ErrorResponse, ValidationErrorResponse } from '../../../common/dto/error-response.dto';

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
            type: ErrorResponse,
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

/// Swagger documentation for getting user weather query history (Admin only)
// Get weather query history for a specific user
export function ApiGetUserWeatherHistorySwagger() {
    return applyDecorators(
        ApiOperation({ summary: 'Get user weather query history (Admin only)' }),
        ApiBearerAuth(),
        ApiResponse({
            status: 200,
            description: 'User weather query history retrieved successfully',
            type: UserWeatherResponse,
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
            status: 500,
            description: 'Internal server error - Database or system error',
            type: ErrorResponse,
        }),
    );
}