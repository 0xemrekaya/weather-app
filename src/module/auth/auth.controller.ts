import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoginRequest } from './dto/login-request.dto';
import { AuthService } from './auth.service';
import { ApiLoginSwagger } from './decorators/swagger.decorator';
import { LoginResponse } from './dto/login-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login') // `auth/login` endpoint
    @HttpCode(HttpStatus.OK)
    @ApiLoginSwagger() // Swagger documentation for login
    async login(@Body() loginDto: LoginRequest): Promise<LoginResponse> {
        return await this.authService.login(loginDto);
    }
}
