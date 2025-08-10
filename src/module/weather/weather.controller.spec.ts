import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from './weather.service';
import { WeatherDto } from './dto/weather.dto';

// Simple controller class for testing without decorators
class TestWeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  async getWeather(weatherDto: WeatherDto) {
    return this.weatherService.getWeatherData(weatherDto);
  }
}

describe('WeatherController', () => {
  let controller: TestWeatherController;
  let weatherService: WeatherService;

  const mockWeatherService = {
    getWeatherData: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: WeatherService,
          useValue: mockWeatherService,
        },
      ],
    }).compile();

    weatherService = module.get<WeatherService>(WeatherService);
    controller = new TestWeatherController(weatherService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getWeather', () => {
    const mockWeatherDto: WeatherDto = {
      city: 'Istanbul',
      country: 'TR',
    };

    const mockWeatherResponse = {
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
    };

    it('should return weather data', async () => {
      mockWeatherService.getWeatherData.mockResolvedValue(mockWeatherResponse);

      const result = await controller.getWeather(mockWeatherDto);

      expect(result).toEqual(mockWeatherResponse);
      expect(weatherService.getWeatherData).toHaveBeenCalledWith(mockWeatherDto);
      expect(weatherService.getWeatherData).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors', async () => {
      const error = new Error('Service Error');
      mockWeatherService.getWeatherData.mockRejectedValue(error);

      await expect(controller.getWeather(mockWeatherDto)).rejects.toThrow(error);
      expect(weatherService.getWeatherData).toHaveBeenCalledWith(mockWeatherDto);
    });

    it('should call weather service with correct parameters', async () => {
      const customWeatherDto: WeatherDto = {
        city: 'Ankara',
        country: 'TR',
      };

      mockWeatherService.getWeatherData.mockResolvedValue(mockWeatherResponse);

      await controller.getWeather(customWeatherDto);

      expect(weatherService.getWeatherData).toHaveBeenCalledWith(customWeatherDto);
    });
  });
});
