import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { generateCorrelationId, CORRELATION_ID_HEADER } from '../utils/correlation-id.util';

/**
 * LoggerMiddleware - Injects correlation ID into every HTTP request.
 * 
 * This middleware:
 * 1. Generates a unique correlation ID for each request
 * 2. Adds it to request headers as 'x-correlation-id'
 * 3. Makes it available for logging throughout the request lifecycle
 * 
 * The correlation ID allows tracing a single request across:
 * - Multiple controllers
 * - Multiple services
 * - Multiple log entries
 * - Multiple microservices (in future architecture)
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Generate or extract correlation ID
    const correlationId = req.headers[CORRELATION_ID_HEADER] as string || generateCorrelationId();
    
    // Add to request headers for downstream access
    req.headers[CORRELATION_ID_HEADER] = correlationId;
    
    // Add to response headers for client visibility
    res.setHeader(CORRELATION_ID_HEADER, correlationId);
    
    next();
  }
}