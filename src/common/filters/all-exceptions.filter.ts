import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global exception filter that catches all unhandled exceptions.
 * 
 * This filter:
 * 1. Classifies errors (HTTP, Validation, Database, Unknown)
 * 2. Logs error with context (temporary: console.error, will migrate to LoggerService)
 * 3. Returns consistent HTTP response structure
 * 
 * @see https://docs.nestjs.com/exception-filters
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Determine status code and error message
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as Record<string, unknown>;
        message = (responseObj['message'] as string) || message;
        error = (responseObj['error'] as string) || error;
      }
    }

    // Log error to console (temporary - will migrate to LoggerService in Phase 4)
    console.error({
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      statusCode: status,
      message,
      error,
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    // Send structured response
    response.status(status).json({
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}