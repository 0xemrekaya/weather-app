import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { UserModule } from './module/user/user.module';
import { WeatherModule } from './module/weather/weather.module';
import { ConfigModule } from './module/config/config.module';
import { AuthModule } from './module/auth/auth.module';
import { throttleConfig } from './module/config/throttle.config';

@Module({
  imports: [
    ConfigModule,
    ThrottlerModule.forRoot(throttleConfig),
    UserModule,
    AuthModule,
    WeatherModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
