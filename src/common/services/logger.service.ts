import { Injectable, Inject, LoggerService as NestLoggerService } from '@nestjs/common';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

/**
 * LoggerService - Central wrapper for Winston logger
 * 
 * Provides a consistent interface for logging across the application.
 * All services should inject this service instead of using console.log/error.
 * 
 * Usage:
 * ```typescript
 * @Injectable()
 * export class MyService {
 *   constructor(private logger: LoggerService) {}
 *   
 *   myMethod() {
 *     this.logger.info('Operation started', { userId: 123 });
 *   }
 * }
 * ```
 */
@Injectable()
export class LoggerService implements NestLoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
  ) {}

  /**
   * Log an info message
   */
  log(message: string, context?: Record<string, unknown>) {
    this.logger.info(message, { context });
  }

  /**
   * Log an error message
   */
  error(message: string, trace?: string, context?: Record<string, unknown>) {
    this.logger.error(message, { trace, context });
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: Record<string, unknown>) {
    this.logger.warn(message, { context });
  }

  /**
   * Log an info message (alias)
   */
  info(message: string, context?: Record<string, unknown>) {
    this.logger.info(message, { context });
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: Record<string, unknown>) {
    this.logger.debug(message, { context });
  }

  /**
   * Log a verbose/trace message
   */
  verbose(message: string, context?: Record<string, unknown>) {
    this.logger.debug(message, { context });
  }

  /**
   * Log a fatal message (most severe level)
   */
  fatal(message: string, context?: Record<string, unknown>) {
    this.logger.log('fatal', message, { context });
  }

  /**
   * Log an HTTP request/response
   */
  http(message: string, context?: Record<string, unknown>) {
    this.logger.log('http', message, { context });
  }

  /**
   * Log an audit event
   */
  audit(message: string, context?: Record<string, unknown>) {
    this.logger.log('audit', message, { context });
  }
}