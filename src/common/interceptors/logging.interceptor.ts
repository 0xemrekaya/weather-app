import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import {
  httpRequestCounter,
  httpRequestDuration,
} from '../../module/metrics/metrics.controller';

// Logging Interceptor, logs incoming requests and outgoing responses
// Measures the time taken to process requests
// Adds request and response metadata
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, ip } = request;
    const userAgent = request.get('User-Agent') || '';
    const startTime = Date.now();
    const end = httpRequestDuration.startTimer();

    this.logger.log(`Incoming Request: ${method} ${url} - ${ip} - ${userAgent}`);

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        const { statusCode } = response;
        const route = url;
        end({ method, route, status_code: statusCode });
        httpRequestCounter.inc({ method, route, status_code: statusCode });
        this.logger.log(
          `Completed Request: ${method} ${url} - ${statusCode} - ${duration}ms`,
        );
      }),
    );
  }
}
