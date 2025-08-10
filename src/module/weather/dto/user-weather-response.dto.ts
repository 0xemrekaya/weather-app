import { ApiProperty } from '@nestjs/swagger';

export class WeatherDataDto {
    @ApiProperty({ description: 'Main weather condition', example: 'Clear' })
    main: string;

    @ApiProperty({ description: 'Weather description', example: 'clear sky' })
    description: string;

    @ApiProperty({ description: 'Weather icon code', example: '01d' })
    icon: string;

    @ApiProperty({ description: 'Temperature in Celsius', example: 25.6 })
    temperature: number;

    @ApiProperty({ description: 'Feels like temperature in Celsius', example: 27.2 })
    feelsLike: number;

    @ApiProperty({ description: 'Humidity percentage', example: 65 })
    humidity: number;

    @ApiProperty({ description: 'Maximum temperature in Celsius', example: 28.0 })
    tempMax: number;

    @ApiProperty({ description: 'Minimum temperature in Celsius', example: 22.0 })
    tempMin: number;
}

export class UserWeatherQueryDto {
    @ApiProperty({ description: 'User ID', example: 1 })
    id: number;

    @ApiProperty({ description: 'Weather query ID', example: 123 })
    queryId: number;

    @ApiProperty({ description: 'City and country', example: 'Istanbul, TR' })
    city: string;

    @ApiProperty({ description: 'Query timestamp', example: '2025-08-10T14:30:00.000Z' })
    queryTime: Date;

    @ApiProperty({ 
        description: 'Weather data', 
        type: WeatherDataDto,
        nullable: true 
    })
    weatherData: WeatherDataDto | null;
}

export class UserWeatherResponseDto {
    @ApiProperty({ 
        description: 'List of user weather queries',
        type: [UserWeatherQueryDto]
    })
    queries: UserWeatherQueryDto[];

    @ApiProperty({ description: 'Total number of queries', example: 15 })
    total: number;
}