import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import setupSwagger from './ucr/ac/cr/ie/config/swagger.config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { createWinstonLogger } from './config/logger.config';
import { sanitizeForLogging } from './common/utils/logger-sanitizer';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

let appInstance: any = null;

/**
 * Setup graceful shutdown handlers
 */
function setupGracefulShutdown(logger: any) {
  const shutdown = async (signal: string) => {
    logger.warn(`Received ${signal}, starting graceful shutdown...`);
    
    if (appInstance) {
      logger.info('Closing HTTP server...');
      await appInstance.close();
      logger.info('HTTP server closed');
    }
    
    logger.info(`Graceful shutdown completed for ${signal}`);
    process.exit(0);
  };

  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception', sanitizeForLogging({
      message: error.message,
      stack: error.stack,
      name: error.name,
    }));
    
    // Give time for log to be written, then exit
    setTimeout(() => process.exit(1), 1000);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled Promise Rejection', sanitizeForLogging({
      reason: reason?.message || String(reason),
      stack: reason?.stack,
    }));
  });

  // Handle shutdown signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

async function bootstrap() {
	// Create logger instance for bootstrap logs
	const logger = createWinstonLogger();
	
	// Setup global process handlers
	setupGracefulShutdown(logger);
	
	// Cargar .env según NODE_ENV
	const env = process.env.NODE_ENV || 'development';
	const envFile = env === 'production' ? '.env.production' : '.env';
	const envPath = path.resolve(process.cwd(), envFile);
	
	if (fs.existsSync(envPath)) {
		dotenv.config({ path: envPath });
		logger.info(`Loading environment from: ${envFile}`, { env, envFile });
	}
	
	const app = await NestFactory.create(AppModule, {
		logger: ['error', 'warn', 'log'], // Use NestJS built-in logger for bootstrap
	});
	
	appInstance = app; // Store for graceful shutdown
	
	// Register global exception filter
	app.useGlobalFilters(new AllExceptionsFilter());
	
	// Register logger middleware for correlation ID
	const loggerMiddleware = new LoggerMiddleware();
	app.use(loggerMiddleware.use.bind(loggerMiddleware));
	
	// Habilitar CORS
	const allowedOrigins = process.env.CORS_ORIGINS
		? process.env.CORS_ORIGINS.split(',')
		: true; // dev: permite todo

	app.enableCors({
		origin: allowedOrigins,
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
		credentials: true,
	});
	
	setupSwagger(app);

	const port = process.env.PORT || 3000;
	await app.listen(port, '0.0.0.0');

	logger.info(`[${env.toUpperCase()}] Server running on: http://localhost:${port}`, { port, env });
	logger.info(`API documentation: http://localhost:${port}/api`);
}

bootstrap();
