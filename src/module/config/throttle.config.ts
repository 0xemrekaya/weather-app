import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const throttleConfig: ThrottlerModuleOptions = [
    {
        ttl: 5000, // 5 seconds
        limit: 10, // 10 requests per 5 seconds
    },
];
