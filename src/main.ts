import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import setupSwagger from './ucr/ac/cr/ie/config/swagger.config';
import createSuperUsers from '../scripts/create-super-users';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	setupSwagger(app);

	// Crear superusuarios si no existen
	await createSuperUsers();

	await app.listen(process.env.PORT);
}

bootstrap();
