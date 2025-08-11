import { Controller, Get, HttpCode, HttpStatus, Res } from '@nestjs/common';
import * as client from 'prom-client';
import type { Response } from 'express';

// Enable default metrics
client.collectDefaultMetrics();

// HTTP request counter
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

// HTTP request duration
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

// Total errors counter
const errorsTotal = new client.Counter({
  name: 'errors_total',
  help: 'Total number of errors.',
});

// Users created counter
const usersCreatedTotal = new client.Counter({
  name: 'users_created_total',
  help: 'Total number of users created.',
});

@Controller('metrics')
export class MetricsController {
  @Get()
  @HttpCode(HttpStatus.OK)
  async getMetrics(@Res() res: Response) {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  }
}

// Example usage: increment counter and observe duration in your middleware/interceptor
export {
  httpRequestCounter,
  httpRequestDuration,
  errorsTotal,
  usersCreatedTotal,
};
