import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { UserEntity } from '../../common/interfaces/user.interface';
import * as bcrypt from 'bcrypt';
import { UserRoles } from '../../common/enums/user.enum';
import { CreateUserInput, UserSelectFields } from './interfaces/user.interface';
import { UserResponseData } from 'src/common/dto/user-response.dto';
import { DatabaseService } from '../database/database.service';
import { JwtConfig } from '../config/jwt.config';

@Injectable()
export class UserService {
    private readonly saltRounds: number;

    constructor(
        private readonly databaseService: DatabaseService,
        private readonly jwtConfig: JwtConfig
    ) {
        this.saltRounds = this.jwtConfig.saltRounds;
    }

    /**
     * Find user by username for authentication
     */
    async findByUsername(username: string, includePassword: boolean = false): Promise<UserEntity | null> {
        const selectFields: UserSelectFields = {
            id: true,
            username: true,
            email: true,
            password: includePassword,
            role: true,
            createdAt: true,
            updatedAt: true,
        };

        return await this.databaseService.user.findUnique({
            where: { username },
            select: selectFields
        });
    }

    /**
     * Find user by email
     */
    async findByEmail(email: string): Promise<UserEntity | null> {
        return await this.databaseService.user.findUnique({
            where: { email },
            select: {
                id: true,
                username: true,
                email: true,
                password: false,
                role: true,
                createdAt: true,
                updatedAt: true,
            }
        });
    }

    /**
     * Check if user exists by email or username
     * @param email - User email to check
     * @param username - Username to check
     * @returns true if user exists, false otherwise
     */
    async findByEmailOrUsername(email: string, username: string): Promise<boolean> {
        const user = await this.databaseService.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            },
            select: {
                id: true,
            }
        });
        return user !== null;
    }

    /**
     * Create a new user with hashed password
     */
    async createUser(userData: CreateUserInput): Promise<UserResponseData> {
        const { email, username, password, role } = userData;

        // Check if user already exists
        const userExists = await this.findByEmailOrUsername(email, username);
        if (userExists) {
            throw new ConflictException('User with this email or username already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, this.saltRounds);

        // Create user
        const user = await this.databaseService.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
                role: role as UserRoles,
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role as UserRoles,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }

    /**
     * Validate user password
     */
    async validatePassword(user: UserEntity, password: string): Promise<boolean> {
        if (!user.password) {
            throw new Error('User password not loaded');
        }
        return await bcrypt.compare(password, user.password);
    }

    /**
     * Get all users (admin only)
     */
    async getAllUsers(): Promise<UserResponseData[]> {
        const users = await this.databaseService.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return users.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role as UserRoles,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }));
    }
}
