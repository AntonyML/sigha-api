import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { createWinstonLogger } from '../../config/logger.config';
import { LoggerService } from './logger.service';

/**
 * LoggerModule - Global module for logging
 * 
 * Provides Winston logger configured with:
 * - Custom log levels (fatal, error, warn, info, http, audit, debug, trace)
 * - Console transport (colored output for development)
 * - File transport with daily rotation (JSON format for production)
 * - Error logs rotated daily, kept for 14 days
 * - Combined logs rotated daily, kept for 14 days
 * 
 * This module is global - LoggerService is available everywhere without explicit imports.
 */
@Global()
@Module({
  imports: [
    WinstonModule.forRoot(createWinstonLogger()),
  ],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}