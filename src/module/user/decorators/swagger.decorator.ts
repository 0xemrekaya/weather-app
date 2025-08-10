import { applyDecorators } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CreateUserDto } from "../dto/create-user.dto";
import { UserResponseData } from "src/common/dto/user-response.dto";
import { RegisterResponse } from "../dto/create-user-response.dto";

export function ApiRegisterSwagger() {
    return applyDecorators(
        ApiOperation({
            summary: 'User registration',
            description: 'Register a new user with username, email, password and role. Returns User object.'
        }),
        ApiBearerAuth(),
        ApiBody({
            type: CreateUserDto,
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

export function ApiGetUserAllSwagger() {
    return applyDecorators(
        ApiOperation({ summary: 'Get all users (Admin only)' }),
        ApiResponse({
            status: 200,
            description: 'List of all users',
            type: [UserResponseData]
        }),
        ApiResponse({ status: 401, description: 'Unauthorized' }),
        ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    )
}