import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from './weather.service';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { WeatherDto } from './dto/weather.dto';

describe('WeatherService', () => {
  let service: WeatherService;
  let httpService: HttpService;

  const mockHttpService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getWeatherData', () => {
    const mockWeatherDto: WeatherDto = {
      city: 'Istanbul',
      country: 'TR',
    };

    const mockGeocodingResponse = [
      {
        name: 'Istanbul',
        lat: 41.0082,
        lon: 28.9784,
        country: 'TR',
      },
    ];

    const mockWeatherResponse = {
      data: {
        weather: [
          {
            id: 800,
            main: 'Clear',
            description: 'clear sky',
            icon: '01d',
          },
        ],
        main: {
          temp: 25.5,
          feels_like: 27.2,
          temp_min: 23.1,
          temp_max: 28.3,
          humidity: 65,
        },
        id: 745044,
      },
    };

    it('should return weather data successfully', async () => {
      // Mock geocoding API response
      mockHttpService.get.mockReturnValueOnce(
        of({ data: mockGeocodingResponse })
      );

      // Mock weather API response
      mockHttpService.get.mockReturnValueOnce(
        of(mockWeatherResponse)
      );

      const result = await service.getWeatherData(mockWeatherDto);

      expect(result).toEqual({
        weather: mockWeatherResponse.data.weather,
        main: mockWeatherResponse.data.main,
        id: mockWeatherResponse.data.id,
      });

      expect(mockHttpService.get).toHaveBeenCalledTimes(2);
    });

    it('should throw HttpException when location not found', async () => {
      // Mock empty geocoding response
      mockHttpService.get.mockReturnValueOnce(
        of({ data: [] })
      );

      await expect(service.getWeatherData(mockWeatherDto)).rejects.toThrow(
        new HttpException('Failed to fetch weather data', HttpStatus.INTERNAL_SERVER_ERROR)
      );
    });

    it('should throw HttpException when geocoding API fails', async () => {
      mockHttpService.get.mockReturnValueOnce(
        throwError(() => new Error('API Error'))
      );

      await expect(service.getWeatherData(mockWeatherDto)).rejects.toThrow(
        HttpException
      );
    });

    it('should throw HttpException when weather API fails', async () => {
      // Mock successful geocoding response
      mockHttpService.get.mockReturnValueOnce(
        of({ data: mockGeocodingResponse })
      );

      // Mock failed weather API response
      mockHttpService.get.mockReturnValueOnce(
        throwError(() => new Error('Weather API Error'))
      );

      await expect(service.getWeatherData(mockWeatherDto)).rejects.toThrow(
        HttpException
      );
    });
  });
});
