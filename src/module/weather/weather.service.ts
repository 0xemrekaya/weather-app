import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { GeocodingResponse } from './interfaces/geocoding.interface';
import { WeatherRequest } from './dto/weather-request.dto';
import { firstValueFrom } from 'rxjs';
import { WeatherResponse } from './dto/weather-response.dto';
import { CacheService } from '../cache/cache.service';
import { DatabaseService } from '../database/database.service';
import { WeatherData } from 'src/common/interfaces/weather.interface';
import { OpenWeatherConfig } from '../config/openweather.config';
import { UserWeatherQuery, UserWeatherResponse } from './dto/user-weather-response.dto';

@Injectable()
export class WeatherService {
    private readonly logger = new Logger(WeatherService.name);
    private readonly apiKey: string;
    private readonly geocodingUrl: string;
    private readonly weatherUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly cacheService: CacheService,
        private readonly databaseService: DatabaseService,
        private readonly weatherConfig: OpenWeatherConfig,
    ) {
        this.apiKey = this.weatherConfig.apiKey;
        this.geocodingUrl = this.weatherConfig.geocodingUrl;
        this.weatherUrl = this.weatherConfig.weatherUrl;
    }


    async getWeatherData(weatherDto: WeatherRequest, userId: number): Promise<WeatherResponse> {
        try {
            this.logger.log(`Fetching weather data for user ${userId}: ${weatherDto.city}, ${weatherDto.country}`);
            
            // Step 1: Check cache first
            const cachedWeather = await this.cacheService.getWeatherCache(weatherDto.city, weatherDto.country);
            if (cachedWeather) {
                // Save query to database even if data is cached
                await this.saveWeatherQuery(userId, weatherDto, cachedWeather);
                return this.mapToWeatherResponse(cachedWeather);
            }

            this.logger.log(`Fetching fresh data from OpenWeather API for ${weatherDto.city}, ${weatherDto.country}`);
            
            // Step 2: Get coordinates from geocoding API
            const coordinates = await this.getCoordinates(weatherDto);

            // Step 3: Get weather data using coordinates
            const weatherData = await this.getWeatherByCoordinates(
                coordinates.lat,
                coordinates.lon
            );

            // Step 4: Cache the weather data
            await this.cacheWeatherData(weatherDto.city, weatherDto.country, weatherData);

            // Step 5: Save query and weather data to database
            await this.saveWeatherQuery(userId, weatherDto, weatherData);

            this.logger.log(`Weather data successfully processed for ${weatherDto.city}, ${weatherDto.country}`);
            return weatherData;
        } catch (error) {
            // Differentiate between client errors (4xx) and server errors (5xx)
            if (error instanceof HttpException) {
                const status = error.getStatus();
                if (status >= 400 && status < 500) {
                    // Client errors: log as warn (bad request, not found, etc.)
                    this.logger.warn(`Client error for user ${userId}: ${error.message}`);
                } else {
                    // Server errors: log as error
                    this.logger.error(`Server error for user ${userId}:`, error);
                }
                throw error;
            }
            
            // Unexpected errors: log as error
            this.logger.error(`Unexpected error fetching weather data for user ${userId}:`, error);
            throw new HttpException(
                'Failed to fetch weather data',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    private async getCoordinates(weatherDto: WeatherRequest): Promise<GeocodingResponse> {
        try {
            this.logger.debug(`Geocoding location: ${weatherDto.city}, ${weatherDto.country}`);
            
            // Build query string for geocoding
            let query = weatherDto.city + ',' + weatherDto.country;
            const url = `${this.geocodingUrl}?q=${encodeURIComponent(query)}&limit=1&appid=${this.apiKey}`;

            const response = await firstValueFrom(
                this.httpService.get<GeocodingResponse[]>(url)
            );

            if (!response.data || response.data.length === 0) {
                this.logger.warn(`Location not found: ${weatherDto.city}, ${weatherDto.country}`);
                throw new HttpException(
                    'Location not found',
                    HttpStatus.NOT_FOUND,
                );
            }

            const coordinates = response.data[0];
            this.logger.debug(`Coordinates found for ${weatherDto.city}: lat=${coordinates.lat}, lon=${coordinates.lon}`);
            return coordinates;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            // Handle different HTTP status codes from external API
            if (error.response) {
                const status = error.response.status;
                switch (status) {
                    case 401:
                        throw new HttpException(
                            'Invalid API key for geocoding service',
                            HttpStatus.INTERNAL_SERVER_ERROR,
                        );
                    case 404:
                        throw new HttpException(
                            'Location not found',
                            HttpStatus.NOT_FOUND,
                        );
                    case 429:
                        throw new HttpException(
                            'Geocoding service rate limit exceeded',
                            HttpStatus.TOO_MANY_REQUESTS,
                        );
                    case 500:
                    case 502:
                    case 503:
                        throw new HttpException(
                            'Geocoding service temporarily unavailable',
                            HttpStatus.SERVICE_UNAVAILABLE,
                        );
                    default:
                        throw new HttpException(
                            'Failed to get location coordinates',
                            HttpStatus.BAD_REQUEST,
                        );
                }
            }

            throw new HttpException(
                'Failed to get location coordinates',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    private async getWeatherByCoordinates(lat: number, lon: number): Promise<WeatherResponse> {
        try {
            const url = `${this.weatherUrl}?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;

            const response = await firstValueFrom(
                this.httpService.get(url)
            );

            const apiData = response.data;

            const weatherResponse: WeatherResponse = {
                weather: apiData.weather,
                main: {
                    temp: apiData.main.temp,
                    feels_like: apiData.main.feels_like,
                    temp_min: apiData.main.temp_min,
                    temp_max: apiData.main.temp_max,
                    humidity: apiData.main.humidity
                },
                id: apiData.id,
            };

            return weatherResponse;
        } catch (error) {
            // Handle different HTTP status codes from external API
            if (error.response) {
                const status = error.response.status;
                switch (status) {
                    case 401:
                        throw new HttpException(
                            'Invalid API key for weather service',
                            HttpStatus.INTERNAL_SERVER_ERROR,
                        );
                    case 404:
                        throw new HttpException(
                            'Weather data not found for coordinates',
                            HttpStatus.NOT_FOUND,
                        );
                    case 429:
                        throw new HttpException(
                            'Weather service rate limit exceeded',
                            HttpStatus.TOO_MANY_REQUESTS,
                        );
                    case 500:
                    case 502:
                    case 503:
                        throw new HttpException(
                            'Weather service temporarily unavailable',
                            HttpStatus.SERVICE_UNAVAILABLE,
                        );
                    default:
                        throw new HttpException(
                            'Failed to fetch weather data',
                            HttpStatus.BAD_REQUEST,
                        );
                }
            }

            throw new HttpException(
                'Failed to fetch weather data',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Cache weather data with TTL
     */
    private async cacheWeatherData(city: string, country: string, weatherData: WeatherResponse): Promise<void> {
        try {
            const cacheData: WeatherData = {
                weather: weatherData.weather,
                main: weatherData.main,
                id: weatherData.id
            };
            await this.cacheService.setWeatherCache(city, country, cacheData);
        } catch (error) {
            this.logger.warn(`Cache set failed for key ${city}, ${country}:`, error);
        }
    }

    /**
     * Save weather query and data to database
     */
    private async saveWeatherQuery(userId: number, weatherDto: WeatherRequest, weatherData: WeatherResponse | WeatherData): Promise<void> {
        try {
            // Create weather query record
            const weatherQuery = await this.databaseService.weatherQuery.create({
                data: {
                    userId: userId,
                    city: `${weatherDto.city}, ${weatherDto.country}`,
                }
            });

            // Extract data regardless of input type
            const mainData = weatherData.main;
            const weatherInfo = weatherData.weather[0];

            await this.databaseService.weatherData.create({
                data: {
                    weatherQueryId: weatherQuery.id,
                    main: weatherInfo.main,
                    description: weatherInfo.description,
                    icon: weatherInfo.icon,
                    temperature: mainData.temp,
                    feelsLike: mainData.feels_like,
                    humidity: mainData.humidity,
                    tempMax: mainData.temp_max,
                    tempMin: mainData.temp_min,
                }
            });

            this.logger.debug(`Weather query saved for user ${userId}: ${weatherDto.city}, ${weatherDto.country}`);
        } catch (error) {
            this.logger.error(`Failed to save weather query for user ${userId}:`, error);
            // Don't throw error here to avoid breaking the main flow
        }
    }

    /**
     * Map cached weather data to response format
     */
    private mapToWeatherResponse(weatherData: WeatherData): WeatherResponse {
        return {
            weather: weatherData.weather,
            main: weatherData.main,
            id: weatherData.id
        };
    }

    /**
     * Get user's weather query history
     */
    async getUserWeatherQueries(userId: number): Promise<UserWeatherResponse> {
        try {
            // Get user with their weather queries in a single query
            const userWithQueries = await this.databaseService.user.findUnique({
                where: { id: userId },
                include: {
                    weatherQueries: {
                        include: {
                            WeatherData: true,
                        },
                        orderBy: {
                            queryTime: 'desc'
                        },
                        take: 50 // Limit to last 50 queries
                    }
                }
            });

            if (!userWithQueries) {
                throw new HttpException(
                    'User not found',
                    HttpStatus.NOT_FOUND,
                );
            }

            const queries = userWithQueries.weatherQueries;

            // Transform data for response
            const transformedQueries: UserWeatherQuery[] = queries.map(query => ({
                id: userId,
                queryId: query.id,
                city: query.city,
                queryTime: query.queryTime,
                weatherData: query.WeatherData ? {
                    main: query.WeatherData.main,
                    description: query.WeatherData.description,
                    icon: query.WeatherData.icon,
                    temperature: query.WeatherData.temperature,
                    feelsLike: query.WeatherData.feelsLike,
                    humidity: query.WeatherData.humidity,
                    tempMax: query.WeatherData.tempMax,
                    tempMin: query.WeatherData.tempMin,
                } : null
            }));

            return {
                queries: transformedQueries,
                total: transformedQueries.length
            };
        } catch (error) {
            // Differentiate between expected business logic errors and system errors
            if (error instanceof HttpException) {
                if (error.getStatus() === HttpStatus.NOT_FOUND) {
                    this.logger.warn(`User ${userId} not found for weather history request`);
                } else {
                    this.logger.warn(`Business logic error for user ${userId}: ${error.message}`);
                }
                throw error;
            }

            // Log unexpected system errors as ERROR
            this.logger.error(`Failed to get user weather queries for user ${userId}:`, error);
            throw new HttpException(
                'Failed to retrieve weather query history',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Get all weather queries (Admin only)
     */
    async getAllWeatherQueries(): Promise<any[]> {
        try {
            const queries = await this.databaseService.weatherQuery.findMany({
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true
                        }
                    },
                    WeatherData: true
                },
                orderBy: {
                    queryTime: 'desc'
                },
                take: 100 // Limit to last 100 queries
            });

            return queries.map(query => ({
                id: query.id,
                city: query.city,
                queryTime: query.queryTime,
                user: query.user,
                weatherData: query.WeatherData ? {
                    main: query.WeatherData.main,
                    description: query.WeatherData.description,
                    icon: query.WeatherData.icon,
                    temperature: query.WeatherData.temperature,
                    feelsLike: query.WeatherData.feelsLike,
                    humidity: query.WeatherData.humidity,
                    tempMax: query.WeatherData.tempMax,
                    tempMin: query.WeatherData.tempMin,
                } : null
            }));
        } catch (error) {
            this.logger.error('Failed to get all weather queries:', error);

            // If it's already an HttpException, re-throw it
            if (error instanceof HttpException) {
                throw error;
            }

            throw new HttpException(
                'Failed to retrieve all weather queries',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
