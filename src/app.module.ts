import { Module } from '@nestjs/common';
import { UserModule } from './module/user/user.module';
import { WeatherModule } from './module/weather/weather.module';
import { CacheModule } from './module/cache/cache.module';
import { ConfigModule } from './module/config/config.module';
import { AuthModule } from './module/auth/auth.module';
import { DatabaseModule } from './module/database/database.module';

@Module({
  imports: [ConfigModule, UserModule, AuthModule, DatabaseModule, WeatherModule, CacheModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
