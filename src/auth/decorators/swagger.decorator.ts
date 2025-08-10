import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { LoginResponse, RegisterResponse } from '../interfaces/auth.interface';

export function ApiLoginSwagger() {
    return applyDecorators(
        ApiOperation({
            summary: 'User login',
            description: 'Authenticate user with username and password. Returns JWT token with User object.'
        }),
        ApiBody({
            type: LoginDto,
            description: 'User login credentials'
        }),
        ApiResponse({
            status: 200,
            description: 'Login successful',
            type: LoginResponse
        }),
        ApiResponse({
            status: 404,
            description: 'User not found'
        }),
        ApiResponse({
            status: 401,
            description: 'Invalid credentials'
        }),
        ApiResponse({
            status: 400,
            description: 'Validation error'
        })
    );
}

export function ApiRegisterSwagger() {
    return applyDecorators(
        ApiOperation({
            summary: 'User registration',
            description: 'Register a new user with username, email, password and role. Returns JWT token with User object.'
        }),
        ApiBearerAuth(),
        ApiBody({
            type: RegisterDto,
            description: 'User registration data'
        }),
        ApiResponse({
            status: 201,
            description: 'User registered successfully',
            type: RegisterResponse
        }),
        ApiResponse({
            status: 409,
            description: 'User already exists'
        }),
        ApiResponse({
            status: 400,
            description: 'Validation error'
        })
    );
}