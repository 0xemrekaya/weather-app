import { Module } from '@nestjs/common';
import { UserModule } from './module/user/user.module';
import { WeatherModule } from './module/weather/weather.module';
import { ConfigModule } from './module/config/config.module';
import { AuthModule } from './module/auth/auth.module';

@Module({
  imports: [ConfigModule, UserModule, AuthModule, WeatherModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
