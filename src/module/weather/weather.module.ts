import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../auth/auth.module';
import { CacheModule } from '../cache/cache.module';
import { DatabaseModule } from '../database/database.module';


@Module({
  imports: [
    HttpModule.register({
      timeout: 10000, // 10 seconds timeout
      maxRedirects: 3, // Maximum number of redirects
    }),
    CacheModule, 
    DatabaseModule,
  ],
  providers: [WeatherService],
  controllers: [WeatherController],
})
export class WeatherModule { }
