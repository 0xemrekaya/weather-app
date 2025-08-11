import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

// Login request DTO
// Represents the login request payload
/*
* @example
* {
*   "username": "johndoe",
*   "password": "password123"
* }
*/
export class LoginRequest {
    @ApiProperty({ example: 'johndoe' })
    @IsNotEmpty()
    @IsString()
    username: string;

    @ApiProperty({ example: 'password123', minLength: 6 })
    @IsNotEmpty()
    @MinLength(6)
    @IsString()
    password: string;
}