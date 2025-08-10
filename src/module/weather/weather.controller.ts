import { Controller, Get, HttpCode, HttpStatus, Logger, Query, UseGuards, Request, Post, Param, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WeatherRequest } from './dto/weather-request.dto';
import { WeatherService } from './weather.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRoles } from 'src/common/enums/user.enum';
import { ApiGetUserselfWeatherHistorySwagger, ApiWeatherSwagger } from './decorators/swagger.decorators';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserWeatherResponse } from './dto/user-weather-response.dto';
import { WeatherResponse } from './dto/weather-response.dto';

@ApiTags('weather')
@Controller('weather')
@UseGuards(JwtGuard)
export class WeatherController {
    private readonly logger = new Logger(WeatherController.name);
    
    constructor(private readonly weatherService: WeatherService) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiWeatherSwagger()
    async getWeather(@Query() weatherDto: WeatherRequest, @Request() req: any): Promise<WeatherResponse> {
        const userId = req.user.id; // JWT payload contains user ID as 'sub'
        this.logger.log(`Weather request received from user ${userId} for ${weatherDto.city}, ${weatherDto.country}`);
        const result = await this.weatherService.getWeatherData(weatherDto, userId);
        this.logger.log(`Weather request completed for user ${userId}`);
        return result;
    }

    @Get('history')
    @HttpCode(HttpStatus.OK)
    @ApiGetUserselfWeatherHistorySwagger()
    async getUserselfWeatherHistory(@Request() req: any): Promise<UserWeatherResponse> {
        const userId = req.user.id;
        this.logger.log(`Weather history request from user ${userId}`);
        return this.weatherService.getUserWeatherQueries(userId);
    }

    @Get('history/:id')
    @UseGuards(RolesGuard)
    @Roles(UserRoles.admin)
    @HttpCode(HttpStatus.OK)
    @ApiGetUserselfWeatherHistorySwagger()
    async getCustomUserWeatherHistory(@Param('id', ParseIntPipe) userId: number): Promise<UserWeatherResponse> {
        this.logger.log(`Admin weather history request for user ${userId}`);
        return this.weatherService.getUserWeatherQueries(userId);
    }

    // @Get('all-queries')
    // @UseGuards(RolesGuard)
    // @Roles(UserRoles.admin)
    // @HttpCode(HttpStatus.OK)
    // async getAllWeatherQueries() {
    //     return this.weatherService.getAllWeatherQueries();
    // }
}