import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards, Request, Post, Param, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WeatherDto } from './dto/weather.dto';
import { WeatherService } from './weather.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRoles } from 'src/common/enums/user.enum';
import { ApiGetUserselfWeatherHistorySwagger, ApiWeatherSwagger } from './decorators/swagger.decorators';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserWeatherResponseDto } from './dto/user-weather-response.dto';
import { WeatherResponse } from './dto/weather-response.dto';

@ApiTags('weather')
@Controller('weather')
@UseGuards(JwtGuard)
export class WeatherController {
    constructor(private readonly weatherService: WeatherService) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiWeatherSwagger()
    async getWeather(@Query() weatherDto: WeatherDto, @Request() req: any): Promise<WeatherResponse> {
        const userId = req.user.id; // JWT payload contains user ID as 'sub'
        return this.weatherService.getWeatherData(weatherDto, userId);
    }

    @Get('history')
    @HttpCode(HttpStatus.OK)
    @ApiGetUserselfWeatherHistorySwagger()
    async getUserselfWeatherHistory(@Request() req: any): Promise<UserWeatherResponseDto> {
        const userId = req.user.id;
        return this.weatherService.getUserWeatherQueries(userId);
    }

    @Get('history/:id')
    @UseGuards(RolesGuard)
    @Roles(UserRoles.admin)
    @HttpCode(HttpStatus.OK)
    @ApiGetUserselfWeatherHistorySwagger()
    async getCustomUserWeatherHistory(@Param('id', ParseIntPipe) userId: number): Promise<UserWeatherResponseDto> {
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