import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import setupSwagger from './ucr/ac/cr/ie/config/swagger.config';

async function bootstrap() {
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

	console.log(`Server running on: http://localhost:${port}`);
	console.log(`API documentation: http://localhost:${port}/api`);
}

bootstrap();
