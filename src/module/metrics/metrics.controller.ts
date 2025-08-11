import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import * as client from 'prom-client';
import type { Response } from 'express';
import { Res } from '@nestjs/common';

// HTTP request counter
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
});

// HTTP request duration
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  buckets: [0.1, 0.5, 1, 2, 5],
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
export { httpRequestCounter, httpRequestDuration };
