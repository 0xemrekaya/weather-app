import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { LoginDto } from '../dto/login.dto';
import { LoginResponse } from '../interfaces/auth.interface';

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
