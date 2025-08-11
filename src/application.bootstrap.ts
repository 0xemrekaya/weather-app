import { INestApplication, Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";

export class ApplicationBootstrap {
    private readonly logger = new Logger(ApplicationBootstrap.name);
    private app: INestApplication;
    private configService: ConfigService;

    async bootstrap(): Promise<void> {
        this.app = await NestFactory.create(AppModule);
        this.configService = this.app.get(ConfigService);

        this.setupGlobalConfiguration(this.app);
        this.setupSwagger(this.app);
        this.setupGracefulShutdown();

        const port = this.getPort();
        await this.app.listen(port);

        this.logApplicationInfo(port);
    }

    private setupGlobalConfiguration(app: INestApplication): void {
        // Enable CORS
        const corsOrigins = this.configService.get<string>('CORS_ORIGIN')?.split(',') || ['http://localhost:3000', 'http://localhost:3001'];
        
        app.enableCors({
            origin: corsOrigins,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
            credentials: true,
        });

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
        return this.configService.get<number>('PORT') || 3000;
    }

    private logApplicationInfo(port: number): void {
        this.logger.log(`Application is running on: http://localhost:${port}`);
        this.logger.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
    }

    private setupGracefulShutdown(): void {
        // Enable graceful shutdown hooks
        this.app.enableShutdownHooks();

        // Handle SIGTERM signal (sent by Docker)
        process.on('SIGTERM', async () => {
            this.logger.log('SIGTERM signal received, starting graceful shutdown...');
            await this.gracefulShutdown('SIGTERM');
        });

        // Handle SIGINT signal (Ctrl+C)
        process.on('SIGINT', async () => {
            this.logger.log('IGINT signal received, starting graceful shutdown...');
            await this.gracefulShutdown('SIGINT');
        });

        // Handle uncaught exceptions
        process.on('uncaughtException', async (error) => {
            this.logger.error('Uncaught Exception:', error);
            await this.gracefulShutdown('uncaughtException');
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', async (reason, promise) => {
            this.logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
            await this.gracefulShutdown('unhandledRejection');
        });
    }

    private async gracefulShutdown(signal: string): Promise<void> {
        this.logger.log(`Initiating graceful shutdown due to: ${signal}`);

        try {
            // Give ongoing requests time to complete (30 seconds timeout)
            const shutdownTimeout = setTimeout(() => {
                this.logger.error('Graceful shutdown timeout exceeded, forcing exit');
                process.exit(1);
            }, 30000 // 30 seconds timeout for graceful shutdown
            );

            // Close the NestJS application
            await this.app.close();

            // Clear the timeout since shutdown completed successfully
            clearTimeout(shutdownTimeout);

            this.logger.log('Application shut down successfully');
            process.exit(0);
        } catch (error) {
            this.logger.error('Error during graceful shutdown:', error);
            process.exit(1);
        }
    }
}
