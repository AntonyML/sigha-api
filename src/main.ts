import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import setupSwagger from './ucr/ac/cr/ie/config/swagger.config';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	setupSwagger(app);

	await app.listen(process.env.PORT);
	console.log(`🚀 Aplicación corriendo en http://localhost:${process.env.PORT || 3000}`);
}

bootstrap();
