# 📋 PLAN PENDIENTE: Sistema de Logging - sigha-api

**Proyecto:** `sigha-api`  
**Fecha:** 2026-07-07  
**Rama:** `feature/logging-infrastructure`

---

## ✅ LO COMPLETADO (Fases 0-10)

### Infraestructura (Fases 0-6)
- [x] FASE 0: Preparación del proyecto
- [x] FASE 1: Directorios (`src/common/filters`, `src/common/interceptors`, `src/common/middleware`, `src/common/services`, `src/config`, `src/storage/logs`)
- [x] FASE 2: Dependencias (winston, nest-winston, winston-daily-rotate-file, uuid)
- [x] FASE 3: Exception Filter Global (`AllExceptionsFilter`)
- [x] FASE 4: LoggerService + Winston config (niveles personalizados, file rotation)
- [x] FASE 5: Correlation ID Middleware (UUID por request)
- [x] FASE 6: HTTP Logging Interceptor (request/response logging)

### Migración de Servicios (Fases 7-10) ✅ COMPLETADO
- [x] FASE 7: Auth Module (`AuthService` - 1 console.error migrado)
- [x] FASE 8: Audit Module (`AuditService` - 3 console.error, `AuditLogInterceptor` - 1 console.error)
- [x] FASE 9: Business Modules (`UserService` - 1 console.error)
- [x] FASE 10: Clinical Modules ✅ - 44+ console.error migrados en 10 servicios

### Commits Realizados: ~17 commits
**Rama actual:** `feature/logging-infrastructure`

---

## ⏳ PENDIENTE

### FASE 10: Migración Módulos Clínicos ✅ COMPLETADA

**Completado:** 44+ console.error migrados en 10 servicios clínicos

**Servicios migrados:**
1. ✅ clinical-medication.service.ts - 6 console.error
2. ✅ clinical-conditions.service.ts - 2 console.error
3. ✅ nursing.service.ts - 11 console.error
4. ✅ emergency-contacts.service.ts - 6 console.error
5. ✅ specialized-areas.service.ts - 5 console.error
6. ✅ older-adult-family.service.ts - 5 console.error
7. ✅ older-adult-updates.service.ts - 3 console.error
8. ✅ vaccines.service.ts - 2 console.error
9. ✅ virtual-records.service.ts - 7 console.error

**Commit:** `000205f` refactor(clinical): migrate all clinical services to LoggerService

---

### FASE 11: TypeORM Logging (PENDIENTE)

**Objetivo:** Configurar logging de TypeORM apropiadamente

**Problema actual:**
`database.providers.ts:98` → `logging: process.env.NODE_ENV === 'development'`
- Retorna TRUE en development → logs excesivos de SQL

**Solución:**
```typescript
logging: ['error', 'warn'] // Solo errores y warnings en desarrollo
// O
logging: false // Deshabilitar completamente si no se necesita
```

**Archivos a modificar:**
- `src/ucr/ac/cr/ie/database.providers.ts` (línea 98)

---

### FASE 12: Process Global Handlers (PENDIENTE)

**Objetivo:** Capturar errores no manejados a nivel de proceso

**Archivos a crear/modificar:**
- `src/main.ts`
  - `process.on('uncaughtException', handler)`
  - `process.on('unhandledRejection', handler)`
  - `process.on('SIGTERM', handler)`
  - `process.on('SIGINT', handler)`

---

### FASE 13: Rotación de Logs en Producción (PENDIENTE)

**Objetivo:** Configurar producción para que use almacenamiento local

**Archivos a modificar:**
- `src/config/logger.config.ts`
  - Verificar que `logs/development` y `logs/error` apunten a `E:\Dev\TCU\sigha-api\storage\logs\`
  - Confirmar que winston-daily-rotate-file está configurado correctamente

**Configuración actual (ya implementada):**
- `logs/development`: `${rootDir}/logs/development/combined-%DATE%.log`
- `logs/error`: `${rootDir}/logs/error/error-%DATE%.log`
- Rotación: `dailyRotateFile`
- Retención: 14 días

---

### FASE 14: Configuración por Ambiente (PENDIENTE)

**Objetivo:** Diferenciar configuración entre desarrollo y producción

**Archivos:**
- `.env.example` (referencia)
- `.env` (desarrollo - NO commitear)
- `.env.production` (producción - NO commitear)

**Variables a configurar:**
```
NODE_ENV=development
LOG_LEVEL=debug (dev) / info (prod)
LOG_FORMAT=pretty (dev) / json (prod)
LOG_FILE_ROTATION_ENABLED=true
LOG_MAX_FILES=14
```

---

## 🧹 CLEANUP PENDIENTE

- [x] Eliminar `E:\Dev\TCU\sigha-api\scripts\` (migrate-clinical-services.py)
- [ ] Verificar otros archivos temporales o basura

---

## 📊 ESTADO DE GIT

**Rama:** `feature/logging-infrastructure`
**Base commit:** `924c1b1`
**Commits aproximados:** 17
**Estado del build:** ✅ Success (último npm run build: exit 0)
**Archivos nuevos:**
- `src/common/filters/`
- `src/common/interceptors/`
- `src/common/middleware/`
- `src/common/services/`
- `src/config/logger.config.ts`

---

## ✉️ SIGUIENTES PASOS INMEDIATOS

1. **Completar FASE 10** - Migrar todos los servicios clínicos (~44 console.error)
2. **FASE 11** - Configurar TypeORM logging
3. **FASE 12** - Agregar process handlers en main.ts
4. **FASE 13** - Verificar/migrar producción config