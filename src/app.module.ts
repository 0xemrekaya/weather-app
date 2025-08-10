import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { WeatherModule } from './weather/weather.module';

@Module({
  imports: [UserModule, AuthModule, PrismaModule, WeatherModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
