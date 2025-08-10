import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { WeatherData } from 'src/common/interfaces/weather.interface';

@Injectable()
export class CacheService implements OnModuleInit {
    private readonly logger = new Logger(CacheService.name);

    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }

    /**
     * Redis connection health check on service initialization
     * Ensures cache system is ready for weather data operations
     */
    async onModuleInit(): Promise<void> {
        try {
            const healthKey = 'health_check';
            await this.cacheManager.set(healthKey, 'ok', 5);
            const healthCheck = await this.cacheManager.get(healthKey);

            if (healthCheck === 'ok') {
                this.logger.log('Redis cache connection established successfully');
                await this.cacheManager.del(healthKey);
            } else {
                throw new Error('Health check validation failed');
            }
        } catch (error) {
            this.logger.error('Redis cache connection failed:', error.message);
            this.logger.warn('Cache service operating in fallback mode');
        }
    }

    /**
     * Get cached weather data with proper error handling
     */
    async getWeatherCache(city: string): Promise<WeatherData | null> {
        try {
            const cacheKey = this.generateWeatherCacheKey(city);
            const cachedData = await this.cacheManager.get<WeatherData>(cacheKey);

            if (cachedData) {
                this.logger.debug(`Cache HIT for weather data: ${city}`);
                return cachedData;
            }

            return null;
        } catch (error) {
            this.logger.error(`Cache GET error for ${city}:`, error.message);
            return null; // Graceful degradation - continue without cache
        }
    }

    /**
     * Set weather data cache with TTL optimization
     */
    async setWeatherCache(city: string, data: WeatherData, customTtl?: number): Promise<void> {
        try {
            const cacheKey = this.generateWeatherCacheKey(city);
            const ttl = customTtl || 300; // 5 minutes default

            await this.cacheManager.set(cacheKey, data, ttl);
            this.logger.debug(`Cache SET for weather data: ${city} (TTL: ${ttl}s)`);
        } catch (error) {
            // Error handling
            this.logger.error(`Cache SET error for ${city}:`, error.message);
        }
    }

    /**
     * Role-based access control - Cache user queries separately
     */
    async getUserQueriesCache(userId: number): Promise<WeatherData[] | null> {
        try {
            const cacheKey = this.generateUserQueriesCacheKey(userId);
            const cachedQueries = await this.cacheManager.get<WeatherData[]>(cacheKey);

            if (cachedQueries) {
                this.logger.debug(`Cache HIT for user queries: userId=${userId}`);
                return cachedQueries;
            }

            return null;
        } catch (error) {
            this.logger.error(`User queries cache GET error for user ${userId}:`, error.message);
            return null;
        }
    }

    /**
     * Cache user queries to reduce database load
     */
    async setUserQueriesCache(userId: number, queries: WeatherData[], ttl?: number): Promise<void> {
        try {
            const cacheKey = this.generateUserQueriesCacheKey(userId);
            const cacheTTL = ttl || 120; // 2 minutes for user data

            await this.cacheManager.set(cacheKey, queries, cacheTTL);
            this.logger.debug(`Cache SET for user queries: userId=${userId} (TTL: ${cacheTTL}s)`);
        } catch (error) {
            this.logger.error(`User queries cache SET error for user ${userId}:`, error.message);
        }
    }

    /**
     * Cache invalidation for data consistency
     */
    async invalidateUserQueriesCache(userId: number): Promise<void> {
        try {
            const cacheKey = this.generateUserQueriesCacheKey(userId);
            await this.cacheManager.del(cacheKey);
            this.logger.debug(`Cache INVALIDATED for user queries: userId=${userId}`);
        } catch (error) {
            this.logger.error(`Cache invalidation error for user ${userId}:`, error.message);
        }
    }

    /**
     * Admin cache management
     */
    async clearAllCache(): Promise<void> {
        try {
            await this.cacheManager.clear();
            this.logger.warn('All cache cleared by admin operation');
        } catch (error) {
            this.logger.error('Cache clear error:', error.message);
            throw error;
        }
    }

    /**
     * Generate consistent cache keys for weather data
     */
    private generateWeatherCacheKey(city: string): string {
        return `weather:${city.toLowerCase().trim().replace(/\s+/g, '_')}`;
    }

    /**
     * Generate consistent cache keys for user queries
     */
    private generateUserQueriesCacheKey(userId: number): string {
        return `user_queries:${userId}`;
    }
}