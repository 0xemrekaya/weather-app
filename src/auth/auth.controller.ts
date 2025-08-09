import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginResponse, RegisterResponse } from './interfaces/auth.interface';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ 
        summary: 'User login',
        description: 'Authenticate user with username and password. Returns JWT token for accessing protected endpoints.'
    })
    @ApiBody({
        type: LoginDto,
        description: 'User login credentials',
    })
    @ApiResponse({
        status: 200,
        description: 'Login successful',
        type: LoginResponse
    })
    @ApiResponse({
        status: 404,
        description: 'User not found'
    })
    @ApiResponse({
        status: 401,
        description: 'Invalid credentials'
    })
    async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
        return this.authService.login(loginDto);
    }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'User registration',
        description: 'Register a new user with username, email, password and role. Returns JWT token with User object.'
    })
    @ApiBody({
        type: RegisterDto,
        description: 'User registration data',
    })
    @ApiResponse({
        status: 201,
        description: 'User registered successfully',
        type: RegisterResponse
    })
    @ApiResponse({
        status: 409,
        description: 'User already exists'
    })
    @ApiResponse({
        status: 400,
        description: 'Validation error'
    })
    async register(@Body() registerDto: RegisterDto): Promise<RegisterResponse> {
        return this.authService.register(registerDto);
    }
}
