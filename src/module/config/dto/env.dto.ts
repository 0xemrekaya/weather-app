import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync, IsOptional, IsUrl } from 'class-validator';

enum Environment {
    Development = 'development',
    Production = 'production',
}

/**
 * Environment variables validation for production readiness
 */
class EnvironmentVariables {
    @IsEnum(Environment)
    NODE_ENV: Environment = Environment.Development;

    @IsNumber()
    @IsOptional()
    PORT?: number = 3000;

    // Database connection string URL 
    @IsString()
    DATABASE_URL: string;

    // JWT Authentication
    @IsString()
    JWT_SECRET: string;

    @IsString()
    @IsOptional()
    JWT_EXPIRES_IN?: string = '24h';

    // OpenWeather API
    @IsString()
    OPENWEATHER_API_KEY: string;

    // OpenWeather Geocoding API
    @IsUrl()
    @IsOptional()
    OPENWEATHER_GEOCODING_URL?: string = 'http://api.openweathermap.org/geo/1.0/direct';

    // OpenWeather Weather API
    @IsString()
    @IsOptional()
    OPENWEATHER_WEATHER_URL?: string = 'https://api.openweathermap.org/data/2.5/weather';

    // Redis Caching
    @IsString()
    @IsOptional()
    REDIS_HOST?: string = 'localhost';

    @IsNumber()
    @IsOptional()
    REDIS_PORT?: number = 6379;

    @IsString()
    @IsOptional()
    REDIS_PASSWORD?: string;

    @IsNumber()
    @IsOptional()
    REDIS_DB?: number = 0;

    @IsNumber()
    @IsOptional()
    CACHE_TTL?: number = 300; // 5 minutes

    @IsNumber()
    @IsOptional()
    CACHE_MAX_ITEMS?: number = 1000;
}

export function validate(config: Record<string, unknown>) {
    const validatedConfig = plainToInstance(EnvironmentVariables, config, {
        enableImplicitConversion: true,
    });

    const errors = validateSync(validatedConfig, {
        skipMissingProperties: false,
    });

    if (errors.length > 0) {
        throw new Error(`Environment validation failed: ${errors.toString()}`);
    }

    return validatedConfig;
}