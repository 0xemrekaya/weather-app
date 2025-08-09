import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, IsEnum, IsString } from 'class-validator';
import { UserRoles } from '../enums/role.enum';

/* Data Transfer Object for user registration
 @email: User's email address
 @username: User's chosen username
 @password: User's chosen password
 @role: User's role (UserRole enum)
*/
export class RegisterDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'johndoe' })
    @IsNotEmpty()
    @IsString()
    username: string;

    @ApiProperty({ example: 'password123', minLength: 6 })
    @IsNotEmpty()
    @MinLength(6)
    @IsString()
    password: string;

    @ApiProperty({ enum: UserRoles, example: UserRoles.user })
    @IsNotEmpty()
    @IsEnum(UserRoles)
    role: UserRoles;
}