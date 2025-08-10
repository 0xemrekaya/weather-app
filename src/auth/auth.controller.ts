import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginResponse, RegisterResponse } from './interfaces/auth.interface';
import { AuthService } from './auth.service';
import { ApiLoginSwagger, ApiRegisterSwagger } from './decorators/swagger.decorator';
import { Roles } from './decorators/roles.decorator';
import { UserRoles } from './enums/role.enum';
import { RolesGuard } from './guard/roles.guard';
import { JwtGuard } from './guard/jwt.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiLoginSwagger()
    async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
        return this.authService.login(loginDto);
    }

    @Post('register')
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRoles.admin)
    @HttpCode(HttpStatus.CREATED)
    @ApiRegisterSwagger()
    async register(@Body() registerDto: RegisterDto): Promise<RegisterResponse> {
        return this.authService.register(registerDto);
    }
}
