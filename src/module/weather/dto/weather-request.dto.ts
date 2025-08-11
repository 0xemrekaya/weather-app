import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Matches, MinLength, MaxLength } from "class-validator";

// Weather request DTO
// Represents the data required to request weather information
// e.g., city name, country code: izmir, tr
export class WeatherRequest {
    @ApiProperty({
        example: 'Izmir',
        description: 'City name (letters only, no numbers)',
        minLength: 2,
        maxLength: 50
    })
    @IsNotEmpty({ message: 'City is required' })
    @IsString({ message: 'City must be a string' })
    @MinLength(2, { message: 'City name must be at least 2 characters long' })
    @MaxLength(50, { message: 'City name must not exceed 50 characters' })
    @Matches(/^[a-zA-Z\s\u00C0-\u017F\u0100-\u024F\u1E00-\u1EFF]+$/, {
        message: 'City name can only contain letters, spaces, and accented characters'
    })
    city: string;

    @ApiProperty({
        example: 'TR',
        description: 'Country code (2 letters, ISO 3166-1 alpha-2)',
        minLength: 2,
        maxLength: 2
    })
    @IsNotEmpty({ message: 'Country is required' })
    @IsString({ message: 'Country must be a string' })
    @MinLength(2, { message: 'Country code must be exactly 2 characters' })
    @MaxLength(2, { message: 'Country code must be exactly 2 characters' })
    @Matches(/^[A-Z]{2}$/, {
        message: 'Country must be a valid 2-letter uppercase ISO country code (e.g., TR, US, GB)'
    })
    country: string;
}