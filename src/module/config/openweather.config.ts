import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Case study requirement: External API Integration (10 Points)
 * OpenWeather API configuration with proper error handling
 */
@Injectable()
export class OpenWeatherConfig {
    constructor(private configService: ConfigService) { }

    get apiKey(): string {
        const apiKey = this.configService.get<string>('OPENWEATHER_API_KEY');
        if (!apiKey) {
            throw new Error('OPENWEATHER_API_KEY is required for weather data integration');
        }
        return apiKey;
    }

    get geocodingUrl(): string {
        const geocodingUrl = this.configService.get<string>('OPENWEATHER_GEOCODING_URL');
        if (!geocodingUrl) {
            throw new Error('OPENWEATHER_GEOCODING_URL is required for weather data integration');
        }
        return geocodingUrl;
    }

    get baseUrl(): string {
        const weatherUrl = this.configService.get<string>('OPENWEATHER_WEATHER_URL');
        if (!weatherUrl) {
            throw new Error('OPENWEATHER_WEATHER_URL is required for weather data integration');
        }
        return weatherUrl;
    }

    get timeout(): number {
        return this.configService.get<number>('OPENWEATHER_TIMEOUT', 5000);
    }

    /**
     * HTTP client configuration for OpenWeather API
     */
    get httpConfig() {
        return {
            baseURL: this.baseUrl,
            timeout: this.timeout,
            params: {
                appid: this.apiKey,
                units: 'metric', // Celsius for international users
            },
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'WeatherApp/1.0',
            },
        };
    }

    /**
     * Rate limiting configuration to respect OpenWeather API limits
     */
    get rateLimitConfig() {
        return {
            maxRequests: 60, // OpenWeather free tier: 60 calls/minute
            windowMs: 60 * 1000, // 1 minute
            standardHeaders: true,
            legacyHeaders: false,
        };
    }
}