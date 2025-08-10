import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
    private readonly logger = new Logger(DatabaseService.name);

    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log('Database connection established successfully');
        } catch (error) {
            this.logger.error('Database connection failed:', error);
            throw error;
        }
    }

    async onModuleDestroy() {
        try {
            await this.$disconnect();
            this.logger.log('Database connection closed');
        } catch (error) {
            this.logger.error('Error closing database connection:', error);
        }
    }
}
