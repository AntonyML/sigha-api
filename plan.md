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

### Migración de Servicios (Fases 7-10)
- [x] FASE 7: Auth Module (`AuthService` - 1 console.error migrado)
- [x] FASE 8: Audit Module (`AuditService` - 3 console.error, `AuditLogInterceptor` - 1 console.error)
- [x] FASE 9: Business Modules (`UserService` - 1 console.error)
- [x] FASE 10: Clinical Modules (PENDIENTE DE DETALLAR)

### Commits Realizados: ~17 commits
**Rama actual:** `feature/logging-infrastructure`

---

## ⏳ PENDIENTE

### FASE 10: Migración Módulos Clínicos (EN PROGRESO)

**Servicios con console.error identificados:**

1. **clinical-medication.service.ts** - 6 console.error
   - create, retrieve all, retrieve by history, retrieve one, update, delete
   - Líneas: 25, 35, 48, 60, 74, 87

2. **clinical-conditions.service.ts** - 2 console.error
   - create, retrieve
   - Líneas: 36, 63

3. **nursing.service.ts** - 11 console.error
   - retrieve all, pending, completed, cancelled, create, update, cancel, by patient, by identification, records by appointment, complete
   - Líneas: 97, 145, 217, 263, 347, 457, 520, 559, 598, 652, 755

4. **emergency-contacts.service.ts** - 6 console.error
   - create, retrieve all, retrieve by older adult, retrieve one, update, delete
   - Líneas: 24, 34, 47, 59, 73, 86

5. **specialized-areas.service.ts** - 5 console.error
   - create, retrieve all, retrieve one, update, delete
   - Líneas: 28, 45, 60, 74, 87

6. **specialized-appointments.service.ts** - 1 console.error
   - delete
   - Línea: 120

7. **older-adult-family.service.ts** - 5 console.error
   - create, retrieve all, retrieve one, update, delete
   - Líneas: 29, 39, 51, 65, 78

8. **older-adult-updates.service.ts** - 3 console.error
   - retrieve all, retrieve, retrieve one
   - Líneas: 26, 40, 55

9. **vaccines.service.ts** - 2 console.error
   - create, retrieve all
   - Líneas: 36, 63

10. **virtual-records.service.ts** - 3 console.error
    - create, update, search
    - Líneas: 180, 400, 599

**Total estimado:** ~44 console.error en 10 servicios

**Patrón de migración:**
```typescript
// ANTES
console.error('Error creating X:', error);

// DESPUÉS
this.logger.error('Error creating X', {
  error: error instanceof Error ? error.message : 'Unknown error',
  // contexto específico
});
```

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