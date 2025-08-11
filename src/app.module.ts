import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { UserModule } from './module/user/user.module';
import { WeatherModule } from './module/weather/weather.module';
import { ConfigModule } from './module/config/config.module';
import { AuthModule } from './module/auth/auth.module';
import { HealthController } from './health.controller';
import { throttleConfig } from './module/config/throttle.config';
import { MetricsModule } from './module/metrics/metrics.module';

@Module({
  imports: [
    ConfigModule,
    ThrottlerModule.forRoot(throttleConfig),
    UserModule,
    AuthModule,
    WeatherModule,
    MetricsModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
