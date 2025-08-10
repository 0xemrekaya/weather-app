import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { WeatherModule } from './weather/weather.module';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [UserModule, AuthModule, DatabaseModule, WeatherModule, CacheModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
