import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginRequest } from './dto/login-request.dto';
import { JwtPayload } from './interfaces/jwt.interface';
import { UserRoles } from 'src/common/enums/user.enum';
import { LoginResponse } from './dto/login-response.dto';

@Injectable()
export class AuthService {

    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) { }

    /**
    * Authenticate user and return JWT token
    * Supports both admin and user roles for RBAC
    */
    async login(loginDto: LoginRequest): Promise<LoginResponse> {
        const { username, password } = loginDto;

        // Find user with password for authentication
        const user = await this.userService.findByUsername(username, true);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Validate password using UserService
        const validatePassword = await this.userService.validatePassword(user, password);
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
    }

}
