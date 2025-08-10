import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, } from '@nestjs/swagger';
import { WeatherResponse } from '../dto/weather-response.dto';
import { UserWeatherResponseDto } from '../dto/user-weather-response.dto';


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

export function ApiGetUserselfWeatherHistorySwagger() {
    return applyDecorators(
        ApiOperation({ summary: 'Get user weather query history' }),
        ApiBearerAuth(),
        ApiResponse({
            status: 200,
            description: 'User weather query history retrieved successfully',
            type: UserWeatherResponseDto,
        }),
        ApiResponse({ status: 404, description: 'User not found' }),
        ApiResponse({ status: 401, description: 'Unauthorized' }),
        ApiResponse({ status: 500, description: 'Internal server error' }),
    );
}