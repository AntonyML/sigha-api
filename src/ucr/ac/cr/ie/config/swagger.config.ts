import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
    const config = new DocumentBuilder()
        .setTitle('Sistema Hogar de Ancianos API')
        .setDescription('API completa para la gestión integral de hogar de ancianos. Incluye autenticación JWT con 2FA, gestión de usuarios, roles y auditoría.')
        .setVersion('1.0.0')
        .addServer('http://localhost:3000', 'Desarrollo Local')
        .addTag('auth', 'Endpoints de autenticación y seguridad')
        .addTag('users', 'Gestión de usuarios del sistema')
        .addTag('roles', 'Administración de roles y permisos')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'JWT',
                description: 'Token JWT para autenticación básica',
                in: 'header'
            },
            'jwt'
        )
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: '2FA-JWT',
                description: 'Token JWT validado con 2FA para operaciones sensibles',
                in: 'header'
            },
            'jwt-2fa'
        )
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
}

export default setupSwagger;