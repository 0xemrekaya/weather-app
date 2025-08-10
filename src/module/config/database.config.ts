import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseConfig {
    constructor(private configService: ConfigService) { }

    get databaseUrl(): string {
        const databaseUrl = this.configService.get<string>('DATABASE_URL');
        if (!databaseUrl) {
            throw new Error('DATABASE_URL is required for database connection');
        }
        return databaseUrl;
    }

    get isProduction(): boolean {
        return this.configService.get<string>('NODE_ENV') === 'production';
    }

    get isDevelopment(): boolean {
        return this.configService.get<string>('NODE_ENV') === 'development';
    }

    /**
     * Database optimization configuration
     */
    get connectionConfig() {
        return {
            url: this.databaseUrl,
            // Production optimizations
            ...(this.isProduction && {
                pool: {
                    max: 20,
                    min: 5,
                    acquire: 30000,
                    idle: 10000,
                },
            }),
        };
    }
}