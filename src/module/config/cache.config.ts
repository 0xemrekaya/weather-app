import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Redis caching configuration for weather data
 */
@Injectable()
export class CacheConfig {
    constructor(private configService: ConfigService) { }

    get host(): string {
        return this.configService.get<string>('REDIS_HOST', 'localhost');
    }

    get port(): number {
        return this.configService.get<number>('REDIS_PORT', 6379);
    }

    get password(): string | undefined {
        return this.configService.get<string>('REDIS_PASSWORD');
    }

    get database(): number {
        return this.configService.get<number>('REDIS_DB', 0);
    }

    get ttl(): number {
        return this.configService.get<number>('CACHE_TTL', 300);
    }

    get maxItems(): number {
        return this.configService.get<number>('CACHE_MAX_ITEMS', 1000);
    }

    /**
     * Redis cache connection configuration for production readiness
     */
    get cacheConfig() {
        return {
            socket: {
                host: this.host,
                port: this.port,
                connectTimeout: 10000,
                lazyConnect: true,
            },
            password: this.password,
            database: this.database,
            retryDelayOnFailover: 100,
            maxRetriesPerRequest: 3,
        };
    }
}