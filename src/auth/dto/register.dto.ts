import { IsEmail, IsNotEmpty, MinLength, IsEnum, IsString } from 'class-validator';

/* User roles enumeration
   USER: Regular user with limited access
   ADMIN: Administrator with full access
*/
enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
}

/* Data Transfer Object for user registration
 @email: User's email address
 @username: User's chosen username
 @password: User's chosen password
 @role: User's role (UserRole enum)
*/
export class RegisterDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @MinLength(6)
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsEnum(UserRole)
    role: UserRole;
}