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
	await app.listen(port);

	// Logging mejorado
	console.log('\n===== SISTEMA HOGAR DE ANCIANOS =====');
	console.log(`Servidor corriendo en: http://localhost:${port}`);
	console.log(`Documentación API: http://localhost:${port}/api`);
	console.log(`Modo: ${process.env.NODE_ENV || 'development'}`);
	console.log('\n=== ENDPOINTS DISPONIBLES ===');
	console.log('\nAUTENTICACION (/auth):');
	console.log('  POST   /auth/login          - Iniciar sesión');
	console.log('  POST   /auth/verify-2fa     - Verificar 2FA');
	console.log('  GET    /auth/profile        - Obtener perfil');
	console.log('  POST   /auth/logout         - Cerrar sesión');
	console.log('  POST   /auth/setup-2fa      - Configurar 2FA');
	console.log('  POST   /auth/enable-2fa     - Habilitar 2FA');
	console.log('  POST   /auth/disable-2fa    - Deshabilitar 2FA');
	console.log('\nUSUARIOS (/users):');
	console.log('  POST   /users               - Crear usuario');
	console.log('  GET    /users               - Listar usuarios');
	console.log('  GET    /users/search        - Buscar usuarios');
	console.log('  GET    /users/by-role/:id   - Usuarios por rol');
	console.log('  GET    /users/profile       - Perfil actual');
	console.log('  GET    /users/:id           - Obtener usuario');
	console.log('  PATCH  /users/profile       - Actualizar perfil');
	console.log('  PATCH  /users/:id           - Actualizar usuario');
	console.log('  POST   /users/change-password - Cambiar contraseña');
	console.log('  PATCH  /users/:id/toggle-status - Activar/Desactivar');
	console.log('  DELETE /users/:id           - Eliminar usuario');
	console.log('\nROLES (/roles):');
	console.log('  POST   /roles               - Crear rol');
	console.log('  GET    /roles               - Listar roles');
	console.log('  GET    /roles/admin-roles   - Roles admin');
	console.log('  GET    /roles/:id           - Obtener rol');
	console.log('  GET    /roles/:id/is-admin  - Verificar admin');
	console.log('  GET    /roles/:id/requires-2fa - Verificar 2FA requerido');
	console.log('  PATCH  /roles/:id           - Actualizar rol');
	console.log('  DELETE /roles/:id           - Eliminar rol');
	console.log('  POST   /roles/initialize-system-roles - Inicializar roles');
	console.log('\nCREDENCIALES DE PRUEBA:');
	console.log('  Super Admin: superadmin@hogarancianos.com / SuperAdmin123!');
	console.log('  Admin:       admin@hogarancianos.com / Admin123!');
	console.log('\nSistema listo para usar!');
	console.log('=====================================\n');
}

bootstrap();
