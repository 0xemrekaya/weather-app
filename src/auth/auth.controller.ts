import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginResponse, RegisterResponse } from './interfaces/auth.interface';
import { AuthService } from './auth.service';
import { ApiLoginSwagger, ApiRegisterSwagger } from './decorators/swagger.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiLoginSwagger()
    async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
        return this.authService.login(loginDto);
    }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiRegisterSwagger()
    async register(@Body() registerDto: RegisterDto): Promise<RegisterResponse> {
        return this.authService.register(registerDto);
    }
}
