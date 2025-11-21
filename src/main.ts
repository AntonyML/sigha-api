import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import setupSwagger from './ucr/ac/cr/ie/config/swagger.config';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

async function bootstrap() {
	// Cargar .env según NODE_ENV
	const env = process.env.NODE_ENV || 'development';
	const envFile = env === 'production' ? '.env.production' : '.env';
	const envPath = path.resolve(process.cwd(), envFile);
	
	if (fs.existsSync(envPath)) {
		dotenv.config({ path: envPath });
		console.log(`Loading environment from: ${envFile}`);
	}
	
	const app = await NestFactory.create(AppModule);
	
	// Habilitar CORS
	app.enableCors({
		origin: true,
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
		credentials: true,
	});
	
	setupSwagger(app);

	const port = process.env.PORT || 3000;
	await app.listen(port, '0.0.0.0');

	console.log(`[${env.toUpperCase()}] Server running on: http://localhost:${port}`);
	console.log(`API documentation: http://localhost:${port}/api`);
}

bootstrap();
