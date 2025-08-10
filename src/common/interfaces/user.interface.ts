import { ApiProperty } from '@nestjs/swagger';
import type { UserRole } from '../../../generated/prisma';
import { UserRoles } from '../enums/user.enum';

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

// Database user entity interface (from Prisma)
export interface UserEntity {
    id: number;
    username: string;
    email: string;
    password?: string; // Optional for queries without password
    role: UserRole; // Using Prisma's UserRole enum
    createdAt: Date;
    updatedAt: Date;
}
