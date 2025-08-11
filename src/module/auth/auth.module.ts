import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { UserModule } from '../user/user.module';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtConfig } from '../config/jwt.config';

// Auth module for handling authentication-related functionality
@Module({
    imports: [
        PassportModule, // For handling authentication strategies
        JwtModule.registerAsync({
            imports: [],
            useFactory: async (jwtConfig: JwtConfig) => ({
                secret: jwtConfig.secret,
                signOptions: { expiresIn: jwtConfig.expiresIn },
            }),
            inject: [JwtConfig],
        }),
        UserModule,
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtStrategy,
        JwtGuard,
        RolesGuard,
    ],
    exports: [
        AuthService,
        JwtStrategy
    ],
})
export class AuthModule { }
