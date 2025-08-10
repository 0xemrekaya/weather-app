import { Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from 'src/module/config/config.module';
import { redisStore } from 'cache-manager-redis-store';
import { CacheConfig } from 'src/module/config/cache.config';

@Module({
    imports: [
        NestCacheModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (cacheConfig: CacheConfig) => {
                const store = await redisStore({
                    socket: {
                        host: cacheConfig.host,
                        port: cacheConfig.port,
                    },
                    password: cacheConfig.password,
                    database: cacheConfig.database,
                    retryDelayOnFailover: cacheConfig.cacheConfig.retryDelayOnFailover,
                    maxRetriesPerRequest: cacheConfig.cacheConfig.maxRetriesPerRequest,
                });

                return {
                    store: () => store,
                    ttl: cacheConfig.ttl,
                    max: cacheConfig.maxItems,
                };
            },
            inject: [CacheConfig],
        }),
    ],
    providers: [CacheService],
    exports: [CacheService, NestCacheModule],
})
export class CacheModule { }