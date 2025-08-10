import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { UserModule } from 'src/module/user/user.module';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'your-secret-key',
            signOptions: { expiresIn: '7d' },
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
