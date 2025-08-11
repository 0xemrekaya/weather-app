import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { validate } from './dto/env.dto';
import { DatabaseConfig } from './database.config';
import { JwtConfig } from './jwt.config';
import { CacheConfig } from './cache.config';
import { OpenWeatherConfig } from './openweather.config';


@Module({
    imports: [
        // Custom configuration module
        NestConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env'],
            cache: true,
            validate, // Environment validation for production readiness
        }),
    ],
    providers: [
        ConfigService,
        DatabaseConfig,
        JwtConfig,
        CacheConfig,
        OpenWeatherConfig,
    ],
    exports: [
        ConfigService,
        DatabaseConfig,
        JwtConfig,
        CacheConfig,
        OpenWeatherConfig,
    ],
})
export class ConfigModule {}