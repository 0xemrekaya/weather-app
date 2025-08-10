import { ApiProperty } from '@nestjs/swagger';
import type { UserRole } from '../../../generated/prisma';
import { UserRoles } from '../enums/user.enum';

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
