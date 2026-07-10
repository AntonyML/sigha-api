# SIGHA API

[![npm version](https://img.shields.io/badge/npm-1.0.0-blue)](https://www.npmjs.com/package/hogar-ancianos-backend)
[![build status](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![license](https://img.shields.io/badge/license-UNLICENSED-lightgrey)](#)

## Descripción General

API RESTful basada en NestJS que gestiona el **Sistema Integral de Gestión del Hogar de Ancianos (SIGHA)**. Proporciona autenticación JWT con soporte opcional de 2FA, control de roles y permisos granulares, y operaciones CRUD para usuarios, notificaciones, registros clínicos, programas y más.

## Arquitectura y Flujo

- **NestJS** (TypeScript) como framework backend.
- **TypeORM** para acceso a PostgreSQL / Supabase.
- **JWT** + **2FA** para seguridad.
- **Swagger** (`@nestjs/swagger`) genera la documentación automática.
- **Logging** centralizado con `nest-winston` y sanitización de PII/PHI.

## Requisitos Previos

| Requisito | Detalle |
|-----------|----------|
| **Node.js** | >= 20.x |
| **npm** | >= 10.x |
| **PostgreSQL** | 12+ (o Supabase) |
| **Variables de entorno** | Ver la tabla "Variables de Entorno" abajo |
| **Docker** (opcional) | Para despliegue en contenedor |

## Instalación y Ejecución

```bash
# Clonar el repositorio
git clone https://github.com/tu-org/sigha-api.git
cd sigha-api

# Instalar dependencias
npm ci

# Copiar variables de entorno de ejemplo y completarlas
cp .env.example .env
# Editar .env con los valores reales

# Ejecutar en modo desarrollo
npm run start:dev

# Compilar y ejecutar en producción
npm run build && npm run start:prod
```

## Variables de Entorno

| Variable | Propósito | Ejemplo |
|----------|----------|---------|
| `NODE_ENV` | Entorno de ejecución | `development` |
| `PORT` | Puerto HTTP del API | `3000` |
| `DATABASE_URL` | URL completa (Supabase, Railway, etc.) | `postgresql://user:pass@host:5432/db` |
| `DB_HOST` | Host de PostgreSQL (si no usas `DATABASE_URL`) | `localhost` |
| `DB_PORT` | Puerto PostgreSQL | `5432` |
| `DB_USERNAME` | Usuario DB | `postgres` |
| `DB_PASSWORD` | Contraseña DB | `mysecret` |
| `DB_NAME` | Nombre de base de datos | `hogar_de_ancianos` |
| `DB_SSL` | `true` para TLS | `false` |
| `TYPEORM_LOGGING` | Logueo de consultas (debug) | `false` |
| `LOG_LEVEL` | Nivel de logs (fatal, error, warn, info, http, audit, debug, trace) | `info` |
| `JWT_SECRET` | Clave secreta JWT (cadena aleatoria) | `replace-me-with-a-long-random-string` |
| `JWT_EXPIRES_IN` | Tiempo de vida del token | `1h` |
| `RESEND_API_KEY` | API key para envío de correos | `re_xxxxxxxxxxxxx` |
| `RESEND_FROM_EMAIL` | Remitente de correo | `noreply@tu-dominio.com` |
| `RESEND_FROM_NAME` | Nombre del remitente | `Hogar de Ancianos` |
| `SUPABASE_URL` | URL del bucket Supabase | `https://<ref>.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Credencial de servicio Supabase | `<clave>` |

## Endpoints / Documentación de Rutas

### Auth (`/auth`)
| Método | Ruta | Descripción | Payload de Entrada | Respuesta de Éxito |
|--------|------|-------------|--------------------|--------------------|
| `POST` | `/auth/login` | Inicia sesión, devuelve token o requiere 2FA | `{ "email": "string", "password": "string" }` | `{ accessToken, refreshToken, user }` o `{ requiresTwoFactor, tempToken, user }` |
| `POST` | `/auth/verify-2fa` | Completa login con 2FA | `{ "tempToken": "string", "twoFactorCode": "string" }` | Token JWT |
| `GET` | `/auth/profile` | Obtiene perfil del usuario autenticado | — | `{ user: { id, email, name, role, ... } }` |
| `POST` | `/auth/logout` | Cierra sesión (invalidación de token) | — | `{ message: "Sesión cerrada" }` |
| `POST` | `/auth/setup-2fa` | Configura 2FA (generación de secret) | — | `{ secret, qrCodeUrl }` |
| `POST` | `/auth/enable-2fa` | Habilita 2FA después de verificación | `{ "verificationCode": "string" }` | `{ message: "2FA habilitado" }` |
| `POST` | `/auth/disable-2fa` | Deshabilita 2FA | — | `{ message: "2FA deshabilitado" }` |
| `GET` | `/auth/2fa/status` | Estado de 2FA del usuario | — | `{ enabled, lastUsed, hasBackupCodes }` |
| `POST` | `/auth/forgot-password` | Envía código de recuperación por email | `{ "email": "string" }` | `{ message: "Código enviado" }` |
| `POST` | `/auth/reset-password` | Restablece contraseña con código temporal | `{ "token": "string", "newPassword": "string" }` | `{ message: "Contraseña actualizada" }` |

### Notificaciones (`/notifications`)
| Método | Ruta | Descripción | Payload | Respuesta |
|--------|------|-------------|---------|-----------|
| `POST` | `/notifications` | Crear nueva notificación (adjuntos opcionales) | `CreateNotificationDto` | Notificación creada |
| `GET` | `/notifications` | Listar notificaciones (paginado, filtros) | Query params: `search`, `sendDateFrom`, `sendDateTo`, `nSent`, `idSender`, `page`, `limit` | Lista paginada |
| `GET` | `/notifications/:id` | Obtener notificación por ID | — | Detalle de notificación |
| `PATCH` | `/notifications/:id/read` | Marcar como leída | — | Confirmación |
| `PATCH` | `/notifications/:id` | Actualizar notificación | `UpdateNotificationDto` | Notificación actualizada |
| `DELETE` | `/notifications/:id` | Eliminar notificación | — | Confirmación |

### Usuarios (`/users`)
| Método | Ruta | Descripción | Payload | Respuesta |
|--------|------|-------------|---------|-----------|
| `POST` | `/users` | Crear nuevo usuario (solo admins, requiere 2FA) | `CreateUserDto` | Usuario creado |
| `GET` | `/users` | Listar todos los usuarios | — | Lista de usuarios |
| `GET` | `/users/search?term=...` | Buscar usuarios por término | `term` query | Resultados de búsqueda |
| `GET` | `/users/by-role/:roleId` | Usuarios por rol | — | Lista de usuarios |
| `GET` | `/users/profile` | Perfil propio del usuario autenticado | — | Perfil básico |
| `GET` | `/users/profile/full` | Perfil propio con roles y permisos | — | `UserProfileFullResponseDto` |
| `GET` | `/users/:id/roles` | Roles efectivos de un usuario | — | `UserRolesResponseDto` |
| `GET` | `/users/:id/permissions` | Permisos efectivos de un usuario | — | `UserPermissionsResponseDto` |
| `GET` | `/users/:id/full` | Perfil completo de otro usuario (solo admins) | — | `UserProfileFullResponseDto` |
| `GET` | `/users/:id` | Obtener usuario por ID | — | Usuario |
| `PATCH` | `/users/profile` | Actualizar propio perfil (campos limitados) | `UpdateUserDto` (solo campos permitidos) | Perfil actualizado |
| `PATCH` | `/users/:id` | Actualizar usuario (solo admins, requiere 2FA) | `UpdateUserDto` | Usuario actualizado |
| `POST` | `/users/change-password` | Cambiar propia contraseña | `ChangePasswordDto` | Confirmación |
| `PATCH` | `/users/:id/toggle-status` | Activar/Desactivar usuario (solo admins, requiere 2FA) | — | Estado actualizado |

### Otros recursos (ejemplo)
> Los controladores restantes siguen la misma convención: método HTTP, ruta base (`/virtual-records`, `/settings`, `/vaccines`, etc.), DTOs de entrada y respuesta documentados en sus archivos `*.dto.ts`. Se pueden inspeccionar directamente en el código fuente.

## Manejo de Errores

- **Formato JSON estándar**: `{ "statusCode": number, "message": string | string[], "error": string }`.
- **Códigos HTTP comunes**:
  - `400 Bad Request` – validación de DTOs.
  - `401 Unauthorized` – token ausente o inválido.
  - `403 Forbidden` – falta de permisos o 2FA requerida.
  - `404 Not Found` – recurso inexistente.
  - `500 Internal Server Error` – errores inesperados del servidor.

## Deuda Técnica
⚠️ Deuda Técnica
Para consultar el detalle exacto, localización de archivos y plan de resolución mediante commits atómicos, revisa el documento TECH_DEBT.md.
