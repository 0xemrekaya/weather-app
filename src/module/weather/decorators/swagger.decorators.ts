import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, } from '@nestjs/swagger';
import { WeatherResponse } from '../interfaces/weather.interface';

export function ApiWeatherSwagger() {
    return applyDecorators(
        ApiOperation({ summary: 'Get weather data for a city' }),
        ApiBearerAuth(),
        ApiResponse({
            status: 200,
            description: 'Weather data retrieved successfully',
            type: WeatherResponse,
        }),
        ApiResponse({ status: 404, description: 'Location not found' }),
        ApiResponse({ status: 401, description: 'Unauthorized' }),
        ApiResponse({ status: 500, description: 'Internal server error from Weather API' }),
    );
}
