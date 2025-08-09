import { ApiProperty } from '@nestjs/swagger';
import { UserRoles } from "../enums/role.enum";

export class UserResponseData {
    @ApiProperty({ 
        description: 'User unique identifier',
        example: 'clm1234567890'
    })
    id: number;

    @ApiProperty({ 
        description: 'Username',
        example: 'johndoe'
    })
    username: string;

    @ApiProperty({ 
        description: 'User email address',
        example: 'john@example.com'
    })
    email: string;

    @ApiProperty({ 
        description: 'User role for access control',
        enum: UserRoles,
        example: UserRoles.user
    })
    role: UserRoles;

    @ApiProperty({ 
        description: 'Account creation timestamp',
        type: 'string',
        format: 'date-time'
    })
    createdAt: Date;

    @ApiProperty({ 
        description: 'Last update timestamp',
        type: 'string',
        format: 'date-time'
    })
    updatedAt: Date;
}

export class LoginResponse {
    @ApiProperty({ 
        description: 'JWT access token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    })
    token: string;

    @ApiProperty({ 
        description: 'User information',
        type: () => UserResponseData
    })
    user: UserResponseData;
}

export class RegisterResponse {
    @ApiProperty({ 
        description: 'JWT access token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    })
    token: string;

    @ApiProperty({ 
        description: 'User information',
        type: () => UserResponseData
    })
    user: UserResponseData;
}

// JWT Payload interface for type safety
export interface JwtPayload {
    userId: number;
    username: string;
    role: UserRoles;
    iat?: number;
    exp?: number;
}
