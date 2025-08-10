import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Role-based access control JWT configuration
 */
@Injectable()
export class JwtConfig {
    constructor(private configService: ConfigService) { }

    get secret(): string {
        const secret = this.configService.get<string>('JWT_SECRET');
        if (!secret || secret.length < 32) {
            throw new Error('JWT_SECRET must be at least 32 characters long for security');
        }
        return secret;
    }

    get expiresIn(): string {
        return this.configService.get<string>('JWT_EXPIRES_IN', '24h');
    }

    get saltRounds(): number {
        return this.configService.get<number>('JWT_SALT_ROUNDS', 12);
    }

    get jwtConfig() {
        return {
            secret: this.secret,
            signOptions: {
                expiresIn: this.expiresIn,
                issuer: 'weather-app',
                audience: 'weather-app-users',
            },
        };
    }
}