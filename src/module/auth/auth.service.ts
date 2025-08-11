import { ConflictException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginRequest } from './dto/login-request.dto';
import { JwtPayload } from './interfaces/jwt.interface';
import { UserRoles } from '../../common/enums/user.enum';
import { LoginResponse } from './dto/login-response.dto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) { }

    /**
    * Authenticate user and return JWT token
    * Supports both admin and user roles for RBAC
    * @param loginDto - Login request containing username and password
    * @returns JWT token and user information
    */
    async login(loginDto: LoginRequest): Promise<LoginResponse> {
        const { username, password } = loginDto;
        
        this.logger.log(`Login attempt for username: ${username}`);

        // Find user with password for authentication
        const user = await this.userService.findByUsername(username, true);

        if (!user) {
            this.logger.warn(`Login failed: User not found for username: ${username}`);
            throw new NotFoundException('User not found');
        }

        // Validate password using UserService
        const validatePassword = await this.userService.validatePassword(user, password);
        if (!validatePassword) {
            this.logger.warn(`Login failed: Invalid credentials for username: ${username}`);
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

        this.logger.log(`Login successful for user: ${username} (ID: ${user.id}, Role: ${user.role})`);
        return loginResponse;
    }

}
