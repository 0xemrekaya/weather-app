import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { UserRoles } from './enums/role.enum';
import { JwtPayload, LoginResponse, RegisterResponse } from './interfaces/auth.interface';

@Injectable()
export class AuthService {

    private readonly saltRounds = 12;

    constructor(
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    /**
    * Authenticate user and return JWT token
    * Supports both admin and user roles for RBAC
    */
    async login(loginDto: LoginDto): Promise<LoginResponse> {
        const { username, password } = loginDto;
        try {
            const user = await this.prismaService.user.findUnique({
                where: { username },
                select: {
                    id: true,
                    username: true,
                    password: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                }
            });

            if (!user) {
                throw new NotFoundException('User not found');
            }

            const validatePassword = await bcrypt.compare(password, user.password);
            if (!validatePassword) {
                throw new UnauthorizedException('Invalid credentials');
            }

            // Generate JWT token with user info for RBAC
            const payload: JwtPayload = {
                userId: user.id,
                username: user.username,
                role: user.role as UserRoles,
            };

            const token = this.jwtService.sign(payload);

            const loginResponse: LoginResponse = {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role as UserRoles,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                }
            };

            return loginResponse;
        } catch (error) {
            throw error;
        }

    }

    async register(registerDto: RegisterDto) {
        const { email, username, password, role } = registerDto;
        try {
            // Check if user already exists
            const existingUser = await this.prismaService.user.findFirst({
                where: {
                    OR: [
                        { email },
                        { username }
                    ]
                }
            });

            if (existingUser) {
                throw new ConflictException('User with this email or username already exists');
            }

            const hashedPassword = await bcrypt.hash(password, this.saltRounds);

            // Create user (default role is 'user' from Prisma schema)
            const user = await this.prismaService.user.create({
                data: {
                    email,
                    username,
                    password: hashedPassword,
                    role: role,
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

            // Generate JWT token for immediate login
            const payload: JwtPayload = {
                userId: user.id,
                username: user.username,
                role: user.role as UserRoles
            };

            const token = this.jwtService.sign(payload);

            const registerResponse: RegisterResponse = {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role as UserRoles,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                }
            };

            return registerResponse;
        }
        catch (error) {
            throw error;
        }
    }

}
