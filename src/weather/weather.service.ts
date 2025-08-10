import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { GeocodingResponse, WeatherResponse } from './interfaces/weather.interface';
import { WeatherDto } from './dto/weather.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WeatherService {
    private readonly apiKey = process.env.OPENWEATHER_API_KEY;
    private readonly geocodingUrl = 'http://api.openweathermap.org/geo/1.0/direct';
    private readonly weatherUrl = 'https://api.openweathermap.org/data/2.5/weather';

    constructor(
        private readonly httpService: HttpService,
    ) { }


    async getWeatherData(weatherDto: WeatherDto): Promise<WeatherResponse> {
        try {
            // Step 1: Get coordinates from geocoding API
            const coordinates = await this.getCoordinates(weatherDto);

            // Step 2: Get weather data using coordinates
            const weatherData = await this.getWeatherByCoordinates(
                coordinates.lat,
                coordinates.lon
            );

            return weatherData;
        } catch (error) {
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
}
