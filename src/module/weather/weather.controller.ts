import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards, Request, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WeatherRequest } from './dto/weather-request.dto';
import { WeatherService } from './weather.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRoles } from '../../common/enums/user.enum';
import { ApiGetUserWeatherHistorySwagger, ApiWeatherSwagger } from './decorators/swagger.decorators';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserWeatherResponse } from './dto/user-weather-response.dto';
import { WeatherResponse } from './dto/weather-response.dto';
import { UserWeatherQueryParams } from './dto/user-weather-query.dto';

@ApiTags('weather')
@Controller('weather')
@UseGuards(JwtGuard)
export class WeatherController {
    constructor(private readonly weatherService: WeatherService) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiWeatherSwagger()
    async getWeather(@Query() weatherDto: WeatherRequest, @Request() req: any): Promise<WeatherResponse> {
        const userId = req.user.id; // JWT payload contains user ID
        const result = await this.weatherService.getWeatherData(weatherDto, userId);
        return result;
    }

    @Get('history')
    @HttpCode(HttpStatus.OK)
    @ApiGetUserWeatherHistorySwagger() // Swagger documentation for getting user weather history
    async getUserselfWeatherHistory(
        @Request() req: any,
        @Query() queryParams: UserWeatherQueryParams
    ): Promise<UserWeatherResponse> {
        const userId = req.user.id;
        return this.weatherService.getUserWeatherQueries(userId, queryParams);
    }

    @Get('history/user/:userId')
    @UseGuards(RolesGuard)
    @Roles(UserRoles.admin)
    @HttpCode(HttpStatus.OK)
    @ApiGetUserWeatherHistorySwagger() // Swagger documentation for admin to get another user's weather history with User ID
    async getSpecificUserWeatherHistory(
        @Param('userId', ParseIntPipe) userId: number,
        @Query() queryParams: UserWeatherQueryParams
    ): Promise<UserWeatherResponse> {
        return this.weatherService.getUserWeatherQueries(userId, queryParams);
    }
}