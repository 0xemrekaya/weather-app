import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WeatherDto } from './dto/weather.dto';
import { WeatherService } from './weather.service';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { ApiWeatherSwagger } from './decorators/swagger.decorators';

@ApiTags('weather')
@Controller('weather')
@UseGuards(JwtGuard)
export class WeatherController {
    constructor(private readonly weatherService: WeatherService) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiWeatherSwagger()
    async getWeather(@Query() weatherDto: WeatherDto) {
        return this.weatherService.getWeatherData(weatherDto);
    }
}