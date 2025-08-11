import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

class ApplicationBootstrap {
  private readonly logger = new Logger(ApplicationBootstrap.name);

  async bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);
    
    this.setupGlobalConfiguration(app);
    this.setupSwagger(app);
    
    const port = this.getPort();
    await app.listen(port);
    
    this.logApplicationInfo(port);
  }

  private setupGlobalConfiguration(app: INestApplication): void {
    // Set global API prefix
    app.setGlobalPrefix('api/v1');

    // Configure global interceptors
    app.useGlobalInterceptors(new LoggingInterceptor());

    // Configure global filters
    app.useGlobalFilters(new GlobalExceptionFilter());

    // Configure global validation
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );
  }

  private setupSwagger(app: INestApplication): void {
    const config = new DocumentBuilder()
      .setTitle('Weather App API')
      .setDescription(
        'Weather application with role-based access control and OpenWeather API integration'
      )
      .setVersion('1.0')
      .addTag('auth', 'Authentication endpoints')
      .addTag('weather', 'Weather data endpoints')
      .addTag('users', 'User management endpoints')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  private getPort(): number {
    return parseInt(process.env.PORT || '3000', 10);
  }

  private logApplicationInfo(port: number): void {
    this.logger.log(`🚀 Application is running on: http://localhost:${port}`);
    this.logger.log(`📚 Swagger documentation available at: http://localhost:${port}/api/docs`);
  }
}

async function bootstrap(): Promise<void> {
  const app = new ApplicationBootstrap();
  await app.bootstrap();
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
