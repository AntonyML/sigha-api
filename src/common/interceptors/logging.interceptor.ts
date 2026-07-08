import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject } from '@nestjs/common';
import { CORRELATION_ID_HEADER } from '../utils/correlation-id.util';

/**
 * Request context interface for logging
 */
interface RequestContext {
  method: string;
  url: string;
  correlationId: string;
  userId?: number | string;
  userAgent?: string;
  ip?: string;
}

/**
 * Response context interface for logging
 */
interface ResponseContext extends RequestContext {
  statusCode: number;
  duration: number;
}

/**
 * LoggingInterceptor - Automatically logs all HTTP requests and responses.
 * 
 * This interceptor:
 * 1. Logs incoming request with method, URL, correlation ID
 * 2. Tracks request duration
 * 3. Logs response with status code and duration
 * 4. Includes user context if available (from JWT)
 * 
 * Logs are written with 'http' level, which can be filtered by environment.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    const now = Date.now();
    
    // Extract request context
    const reqContext: RequestContext = {
      method: request.method,
      url: request.url,
      correlationId: request.headers[CORRELATION_ID_HEADER] || 'unknown',
      userAgent: request.headers['user-agent'],
      ip: request.ip,
    };
    
    // Try to extract user info from JWT (if available)
    if (request.user) {
      reqContext.userId = request.user.sub || request.user.id || request.user.username;
    }
    
    // Log incoming request
    this.logger.log('http', `${reqContext.method} ${reqContext.url} - Request received`, {
      type: 'request',
      ...reqContext,
    });
    
    // Process request and log response
    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - now;
        
        const resContext: ResponseContext = {
          ...reqContext,
          statusCode: response.statusCode,
          duration,
        };
        
        // Log response
        const logLevel = response.statusCode >= 500 ? 'error' : 
                        response.statusCode >= 400 ? 'warn' : 'http';
        
        this.logger.log(logLevel, `${resContext.method} ${resContext.url} - ${resContext.statusCode} (${resContext.duration}ms)`, {
          type: 'response',
          ...resContext,
        });
        
        // Log slow requests (>1000ms)
        if (duration > 1000) {
          this.logger.warn(`SLOW REQUEST: ${resContext.method} ${resContext.url} took ${duration}ms`, {
            type: 'slow_request',
            threshold: 1000,
            ...resContext,
          });
        }
      }),
    );
  }
}