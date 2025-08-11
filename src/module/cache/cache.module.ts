import { Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '../../module/config/config.module';
import { redisStore } from 'cache-manager-redis-yet';
import { CacheConfig } from '../../module/config/cache.config';

@Module({
    imports: [
        NestCacheModule.registerAsync({
            imports: [ConfigModule], // Import the ConfigModule to access configuration
            useFactory: async (cacheConfig: CacheConfig) => {
                const redisConfig: any = {
                    socket: {
                        host: cacheConfig.host,
                        port: cacheConfig.port,
                    },
                    database: cacheConfig.database,
                };

                // Only add password if it's defined
                if (cacheConfig.password) {
                    redisConfig.password = cacheConfig.password;
                }

                const store = await redisStore(redisConfig);

                return {
                    store: store,
                    ttl: cacheConfig.ttl * 1000, // cache-manager-redis-yet expects milliseconds
                    max: cacheConfig.maxItems, // cache-manager-redis-yet expects max items
                };
            },
            inject: [CacheConfig],
        }),
    ],
    providers: [CacheService],
    exports: [CacheService, NestCacheModule],
})
export class CacheModule { }