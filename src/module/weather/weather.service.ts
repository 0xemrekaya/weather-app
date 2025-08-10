import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { GeocodingResponse } from './interfaces/geocoding.interface';
import { WeatherDto } from './dto/weather.dto';
import { firstValueFrom } from 'rxjs';
import { WeatherResponse } from './dto/weather-response.dto';
import { CacheService } from '../cache/cache.service';
import { DatabaseService } from '../database/database.service';
import { WeatherData } from 'src/common/interfaces/weather.interface';
import { OpenWeatherConfig } from '../config/openweather.config';
import { UserWeatherQueryDto, UserWeatherResponseDto } from './dto/user-weather-response.dto';

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


    async getWeatherData(weatherDto: WeatherDto, userId: number): Promise<WeatherResponse> {
        try {
            // Step 1: Check cache first
            const cachedWeather = await this.cacheService.getWeatherCache(weatherDto.city, weatherDto.country);
            if (cachedWeather) {
                // Save query to database even if data is cached
                await this.saveWeatherQuery(userId, weatherDto, cachedWeather);
                return this.mapToWeatherResponse(cachedWeather);
            }

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

            return weatherData;
        } catch (error) {
            this.logger.error(`Failed to fetch weather data for user ${userId}:`, error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Failed to fetch weather data',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    private async getCoordinates(weatherDto: WeatherDto): Promise<GeocodingResponse> {
        try {
            // Build query string for geocoding
            let query = weatherDto.city + ',' + weatherDto.country;
            const url = `${this.geocodingUrl}?q=${encodeURIComponent(query)}&limit=1&appid=${this.apiKey}`;

            const response = await firstValueFrom(
                this.httpService.get<GeocodingResponse[]>(url)
            );

            if (!response.data || response.data.length === 0) {
                throw new HttpException(
                    'Location not found',
                    HttpStatus.NOT_FOUND,
                );
            }

            return response.data[0];
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Failed to get location coordinates',
                HttpStatus.BAD_REQUEST,
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
            throw new HttpException(
                'Failed to fetch weather data',
                HttpStatus.BAD_REQUEST,
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
    private async saveWeatherQuery(userId: number, weatherDto: WeatherDto, weatherData: WeatherResponse | WeatherData): Promise<void> {
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
    async getUserWeatherQueries(userId: number): Promise<UserWeatherResponseDto> {
        try {
            // Get from database (skipping cache for now due to type mismatch)
            const queries = await this.databaseService.weatherQuery.findMany({
                where: { userId },
                include: {
                    WeatherData: true,
                },
                orderBy: {
                    queryTime: 'desc'
                },
                take: 50 // Limit to last 50 queries
            });

            // Transform data for response
            const transformedQueries: UserWeatherQueryDto[] = queries.map(query => ({
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
            throw new HttpException(
                'Failed to retrieve all weather queries',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
