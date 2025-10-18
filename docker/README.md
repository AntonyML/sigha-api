# 🏠 Sistema Hogar de Ancianos - Backend

Backend desarrollado en NestJS con autenticación JWT y 2FA para la gestión de un hogar de ancianos.

## 🚀 Inicio Rápido con Docker

### Prerrequisitos
- Docker y Docker Compose instalados
- Puerto 3000 y 3306 disponibles

### Ejecutar con Docker

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd backend_nest_js_hogar_de_ancianos
   ```

2. **Iniciar con Docker Compose**
   ```bash
   cd docker
   docker-compose up -d
   ```

3. **Verificar servicios**
   ```bash
   docker-compose ps
   ```

4. **Ver logs**
   ```bash
   docker-compose logs -f backend
   ```

### Servicios Docker

- **Backend**: `http://localhost:3000`
- **Base de Datos**: `localhost:3306`
- **Documentación API**: `http://localhost:3000/docs`

## 🔧 Desarrollo Local (sin Docker)

### Instalación

```bash
# Instalar dependencias
npm install

# Configurar base de datos
cp .env.example .env
# Editar .env con tus credenciales

# Crear base de datos MySQL
CREATE DATABASE hogar_de_ancianos;

# Iniciar en modo desarrollo
npm run start:dev
```

## 📋 Variables de Entorno

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=tu_contraseña
DB_NAME=hogar_de_ancianos
JWT_SECRET=tu-clave-secreta-super-segura
```

## 🔐 Usuarios Iniciales

Al iniciar por primera vez se crean automáticamente:

- **Super Admin**: 
  - Email: `superadmin@hogarancianos.com`
  - Password: `SuperAdmin123!`

- **Admin**: 
  - Email: `admin@hogarancianos.com`
  - Password: `Admin123!`

## 🏗️ Arquitectura

```
src/ucr/ac/cr/ie/
├── common/           # Guards, decoradores, utilidades
├── config/          # Configuración de Swagger
├── controller/      # Controladores REST
├── domain/         # Entidades TypeORM
├── repository/     # Proveedores de repositorios
├── services/       # Lógica de negocio
└── *.module.ts     # Módulos NestJS
```

## 🛡️ Seguridad

- **JWT Authentication**: Tokens con expiración
- **2FA**: Autenticación de dos factores opcional
- **Role-based Access**: Control por roles
- **Session Management**: Gestión de sesiones activas

## 📚 API Endpoints

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/verify-2fa` - Verificar 2FA
- `POST /auth/setup-2fa` - Configurar 2FA
- `GET /auth/profile` - Perfil del usuario

### Usuarios (Admin+)
- `GET /users` - Listar usuarios
- `POST /users` - Crear usuario (requiere 2FA)
- `PATCH /users/:id` - Actualizar usuario (requiere 2FA)

### Roles (Super Admin)
- `GET /roles` - Listar roles
- `POST /roles` - Crear rol (requiere 2FA)

## 🐳 Comandos Docker

```bash
# Iniciar servicios
docker-compose up -d

# Detener servicios
docker-compose down

# Ver logs
docker-compose logs -f

# Reconstruir imagen
docker-compose build --no-cache

# Acceder al contenedor
docker-compose exec backend sh
```

## 🔧 Scripts NPM

```bash
npm run build       # Compilar proyecto
npm run start       # Iniciar en producción
npm run start:dev   # Iniciar en desarrollo
npm run start:prod  # Iniciar compilado
```

## 📖 Documentación

- **Swagger UI**: `http://localhost:3000/docs`
- **Postman Collection**: `postman_collection.json`

## 🤝 Contribuir

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📝 Licencia

Este proyecto es privado y pertenece a UCR.