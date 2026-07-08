# Sigha API

Backend NestJS para el Sistema de Gestión de Hogar de Ancianos (SIHA).

## Configuración

### Variables de entorno

Copia `.env.example` a `.env` y configura:

```bash
# Logging
LOG_LEVEL=info  # debug, info, warn, error, fatal

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@tu-dominio.com
RESEND_FROM_NAME=Hogar de Ancianos
```

## Logs

### Ubicación

Los logs se escriben en `storage/logs/` por defecto.

### Niveles disponibles

- `fatal`: Errores críticos que requieren atención inmediata
- `error`: Errores de negocio o técnicos
- `warn`: Advertencias que no bloquean la operación
- `info`: Información operativa general
- `debug`: Detalle para desarrollo (no usar en producción)
- `http`: Requests HTTP (método, URL, estado, duración)
- `audit`: Eventos de auditoría (acciones de usuarios)

### Sanitización de PII/PHI

**Todos los logs pasan automáticamente por `sanitizeForLogging()`** que protege datos sensibles bajo Ley 8968:

- **Cédulas de identidad**: Se enmascaran (ej: `1-1111-1111` → `*-****-****`)
- **Nombres completos**: Se generalizan (ej: `Juan Pérez` → `[Nombre redactado]`)
- **Direcciones**: Se enmascaran (ej: `Calle 1, Casa 2` → `[Dirección redactada]`)
- **Teléfonos**: Se enmascaran (ej: `8888-8888` → `****-****`)
- **Emails**: Se enmascaran (ej: `juan@example.com` → `j***@example.com`)
- **Fechas de nacimiento**: Se generalizan a año (ej: `1950-05-15` → `1950-XX-XX`)

**Uso en código:**

```typescript
import { sanitizeForLogging } from '@common/utils/logger-sanitizer';

//✅ Correcto: datos sensibles sanitizados
this.logger.error('Error procesando usuario', sanitizeForLogging({ userId: user.id, email: user.email }));

// ❌ Incorrecto: potencial fuga de PII
this.logger.error(`Error con usuario ${user.email}`);
```

## Comandos útiles

```bash
# Desarrollo
npm run start:dev

# Build
npm run build

# Tests
npm test

# Reset de base de datos (solo desarrollo)
npm run ts-node scripts/reset-database.ts
```

## Estructura del proyecto

```
src/
├── common/           # Utilidades compartidas (logger, sanitizer, interceptors)
├── config/           # Configuración de la aplicación
├── ucr/ac/cr/ie/    # Módulos de negocio
│   ├── services/    # Servicios principales
│   ├── domain/      # Entidades y objetos de dominio
│   └── interfaces/  # Interfaces de módulos
└── main.ts          # Punto de entrada
storage/
└── logs/            # Logs de la aplicación
```

## Más información

- [Documentación de logging](src/common/services/logger.service.ts)
- [Implementación de sanitización](src/common/utils/logger-sanitizer.ts)
- [Tests de sanitización](src/common/utils/logger-sanitizer.spec.ts)