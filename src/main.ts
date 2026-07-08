import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import setupSwagger from './ucr/ac/cr/ie/config/swagger.config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { createWinstonLogger } from './config/logger.config';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

async function bootstrap() {
	// Create logger instance for bootstrap logs
	const logger = createWinstonLogger();
	
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
	
	// Register global exception filter
	app.useGlobalFilters(new AllExceptionsFilter());
	
	// Register logger middleware for correlation ID
	app.use(LoggerMiddleware);
	
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
