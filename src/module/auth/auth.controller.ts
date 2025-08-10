import { Body, Controller, HttpCode, HttpStatus, Logger, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoginRequest } from './dto/login-request.dto';
import { AuthService } from './auth.service';
import { ApiLoginSwagger } from './decorators/swagger.decorator';
import { LoginResponse } from './dto/login-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    private readonly logger = new Logger(AuthController.name);
    
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiLoginSwagger()
    async login(@Body() loginDto: LoginRequest): Promise<LoginResponse> {
        this.logger.log(`Login request received for username: ${loginDto.username}`);
        const result = await this.authService.login(loginDto);
        this.logger.log(`Login request completed for username: ${loginDto.username}`);
        return result;
    }
}
