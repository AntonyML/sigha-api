import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as path from 'path';

/**
 * Custom log levels for SIHA API
 * Ordered by severity (lower = more severe)
 */
const customLogLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    http: 4,
    audit: 5,
    debug: 6,
    trace: 7,
  },
  colors: {
    fatal: 'magenta',
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'cyan',
    audit: 'blue',
    debug: 'gray',
    trace: 'white',
  },
};

winston.addColors(customLogLevels.colors);

/**
 * Create Winston logger instance with:
 * - Console transport (colored format for development)
 * - File transport for errors (JSON format for production)
 * - Daily rotation for error logs
 */
export const createWinstonLogger = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const logDir = 'storage/logs';

  // Console format: colored and human-readable for development
  const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack, ...metadata }) => {
      let msg = `${timestamp} [${level}]: ${message}`;
      
      // Add stack trace if present
      if (stack) {
        msg += `\n${stack}`;
      }
      
      // Add metadata if present
      const metaKeys = Object.keys(metadata);
      if (metaKeys.length > 0) {
        const metaStr = JSON.stringify(metadata, null, 2);
        msg += ` ${metaStr}`;
      }
      
      return msg;
    })
  );

  // File format: JSON for production parsing
  const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  );

  // Create transports
  const transports: winston.transport[] = [
    // Console transport (always active)
    new winston.transports.Console({
      format: consoleFormat,
      level: isProduction ? 'info' : 'trace',
    }),
    
    // Error file transport with daily rotation
    new winston.transports.DailyRotateFile({
      dirname: logDir,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      format: fileFormat,
      maxSize: '20m',      // Rotate when file reaches 20MB
      maxFiles: '14d',     // Keep logs for 14 days
      zippedArchive: true, // Compress old logs
    }),
    
    // Combined log file (all levels) with daily rotation
    new winston.transports.DailyRotateFile({
      dirname: logDir,
      filename: 'combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: isProduction ? 'info' : 'trace',
      format: fileFormat,
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true,
    }),
  ];

  // Create logger instance
  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'trace'),
    levels: customLogLevels.levels,
    transports,
    exitOnError: false, // Don't exit on uncaught exceptions
  });

  return logger;
};