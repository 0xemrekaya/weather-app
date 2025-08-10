import { ApiProperty } from "@nestjs/swagger";

export class WeatherCondition {
    @ApiProperty({ description: 'Weather condition ID', example: 800 })
    id: number;

    @ApiProperty({ description: 'Group of weather parameters', example: 'Clear' })
    main: string;

    @ApiProperty({ description: 'Weather condition description', example: 'clear sky' })
    description: string;

    @ApiProperty({ description: 'Weather icon ID', example: '01d' })
    icon: string;
}

export class WeatherMain {
    @ApiProperty({ description: 'Temperature in Celsius', example: 25.5 })
    temp: number;

    @ApiProperty({ description: 'Feels like temperature in Celsius', example: 27.2 })
    feels_like: number;

    @ApiProperty({ description: 'Minimum temperature', example: 23.1 })
    temp_min: number;

    @ApiProperty({ description: 'Maximum temperature', example: 28.3 })
    temp_max: number;

    @ApiProperty({ description: 'Humidity percentage', example: 65 })
    humidity: number;
}

export class WeatherResponse {
    @ApiProperty({
        description: 'Weather conditions',
        type: [WeatherCondition],
        example: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }]
    })
    weather: WeatherCondition[];

    @ApiProperty({
        description: 'Main weather data',
        type: WeatherMain,
        example: {
            temp: 25.5,
            feels_like: 27.2,
            temp_min: 23.1,
            temp_max: 28.3,
            humidity: 65
        }
    })
    main: WeatherMain;

    @ApiProperty({ description: 'Internal parameter', example: 1 })
    id: number;
}