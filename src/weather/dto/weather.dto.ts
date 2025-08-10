import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class WeatherDto {
    @ApiProperty({ example: 'Izmir' })
    @IsNotEmpty()
    @IsString()
    city: string;

    @ApiProperty({ example: 'TR' })
    @IsNotEmpty()
    @IsString()
    country: string;
}