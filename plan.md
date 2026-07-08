# 📋 PLAN MAESTRO DE IMPLEMENTACIÓN: Sistema de Logging, Manejo de Errores y Observabilidad

**Proyecto:** `sigha-api` (E:\Dev\TCU\sigha-api)  
**Fecha de Inicio:** 2026-07-07  
**Estado:** 🟡 EN PROGRESO  
**Última Actualización:** 2026-07-07 - Inicio del plan

---

## RESUMEN EJECUTIVO

**Objetivo:** Implementar sistema enterprise de logging, manejo de errores y observabilidad  
**Duración estimada:** 3-4 semanas (12 fases, 35 commits atómicos)  
**Riesgo:** Bajo (cada fase es reversible y deja el sistema estable)  
**Impacto:** Consola limpia, errores centralizados, logs persistidos, auditoría trazable

### Checklist General de Fases

- [x] **FASE 0:** Preparación ✅
- [x] **FASE 1:** Infraestructura de Logging (Directorios) ✅
- [x] **FASE 2:** Instalación de Dependencias ✅
- [x] **FASE 3:** Exception Filters Globales ✅
- [x] **FASE 4:** LoggerService + Configuración Winston ✅
- [x] **FASE 5:** Middleware de Correlation ID ✅
- [x] **FASE 6:** Interceptor de Logging HTTP ✅
- [x] **FASE 7:** Migración Módulo Auth ✅
- [ ] **FASE 8:** Migración Módulo Audit + Core
- [ ] **FASE 9:** Migración Módulos de Negocio (Users, Roles, Permissions)
- [ ] **FASE 10:** Migración Módulos Clínicos
- [ ] **FASE 11:** Configuración de TypeORM Logging
- [ ] **FASE 12:** Process Global Handlers
- [ ] **FASE 13:** Rotación de Logs (Producción)
- [ ] **FASE 14:** Configuración por Ambiente

---

## ESTRATEGIA GENERAL

### Filosofía de Implementación

1. **Bootstrap → Core → Migración → Optimización**
2. **Commits Atómicos:** Cada commit = UNA responsabilidad
3. **Rollback First:** Cada fase reversible en <10 minutos
4. **Migración por Capas:** Infraestructura → Core → Negocio → Clínicos

### Estrategia de Ramas: **GitHub Flow**

```
main (producción)
  │
  └── feature/logging-infrastructure (Fases 1-6)
  │
  └── feature/logging-migration-auth (Fase 7)
  │
  └── feature/logging-migration-audit (Fase 8)
  │
  └── feature/logging-migration-business (Fase 9)
  │
  └── feature/logging-migration-clinical (Fase 10)
  │
  └── feature/logging-production (Fases 11-14)
```

**Reglas:**
- Una rama por fase/grupo de fases
- PR por fase completada
- NO squash merge (preservar commits atómicos)
- Merge commit (preserva historial)
- main SIEMPRE estable y desplegable

---

## ROADMAP DETALLADO

```
FASE 0: Preparación (Día 1) ✅ COMPLETADA
   ↓
FASE 1: Infraestructura (Día 1) ✅ COMPLETADA
   ↓
FASE 2: Dependencias (Día 1) ✅ COMPLETADA
   ↓
FASE 3: Exception Filters (Día 2) ✅ COMPLETADA
   ↓
FASE 4: LoggerService (Días 2-3) 🟡 SIGUIENTE
   ↓
FASE 5: Correlation ID (Día 3) ⏳
   ↓
FASE 6: HTTP Interceptor (Día 4) ⏳
   ↓
FASE 7: Migración Auth (Día 5) ⏳
   ↓
FASE 8: Migración Audit (Día 6) ⏳
   ↓
FASE 9: Migración Negocio (Días 7-8) ⏳
   ↓
FASE 10: Migración Clínicos (Días 9-11) ⏳
   ↓
FASE 11: TypeORM Logging (Día 12) ⏳
   ↓
FASE 12: Global Handlers (Día 12) ⏳
   ↓
FASE 13: Rotación de Logs (Día 13) ⏳
   ↓
FASE 14: Config por Ambiente (Día 14) ⏳
```

---

## FASE 0: PREPARACIÓN

**Estado:** ✅ COMPLETADA  
**Fecha de Completación:** 2026-07-07  
**Objetivo:** Congelar estado actual, preparar terreno para cambios  
**Duración:** 1 hora  
**Riesgo:** Nulo (solo lectura)

### Tareas Completas

- [x] 0.1 Crear rama base desde main
```bash
git checkout -b feature/logging-infrastructure
# Commit base: 924c1b1 chore: remove obsolete JMeter test files and configuration
# Commit base: 76e961a chore(docs): add master implementation plan for logging system
```

- [x] 0.2 Identificar commits actuales
  - Commit inicial: `924c1b1 chore: remove obsolete JMeter test files and configuration`
  - Hash documentado: `924c1b1`

- [x] 0.3 Documentar estado actual de `main.ts`
  - Líneas con console.log existentes: 16, 37, 38
  - Configuración actual de TypeORM: `logging: process.env.NODE_ENV === 'development'` (línea 98)

- [x] 0.4 Crear backup de archivos críticos (documentación en este plan)

### Validaciones
- [ ] Branch creado desde último main
- [ ] Hash del commit base documentado
- [ ] Archivos críticos respaldados (en documentación)

### Criterios de Éxito
- [ ] Cualquier desarrollador puede volver al estado exacto inicial
- [ ] Estado de antes documentado por escrito

---

## FASE 1: INFRAESTRUCTURA DE LOGGING

**Estado:** ✅ COMPLETADA  
**Fecha de Completación:** 2026-07-07  
**Objetivo:** Crear estructura de carpetas y gitignore  
**Motivación:** Base física del sistema sin modificar lógica existente  
**Duración:** 2 horas  
**Riesgo:** Bajo (solo añade archivos nuevos)

### Archivos Creados

- [x] `src/common/filters/.gitkeep`
- [x] `src/common/interceptors/.gitkeep`
- [x] `src/common/middleware/.gitkeep`
- [x] `src/common/services/.gitkeep`
- [x] `src/common/utils/.gitkeep`
- [x] `src/config/.gitkeep`
- [x] `src/storage/logs/.gitkeep` (se llenará en runtime)

### Commits Completados

#### Commit 1.1 ✅
- **Objetivo:** Crear estructura de carpetas vacía
- **Archivos:** 7 directorios con `.gitkeep`
- **Mensaje:** Incluido en commit `7a67046`
- **Validación:** `git status` mostró solo archivos nuevos

#### Commit 1.2 ✅
- **Objetivo:** Actualizar `.gitignore` para logs
- **Archivos:** `.gitignore`
- **Contenido agregado:**
```
# Application logs (structured logging)
storage/logs/*.log
storage/logs/**/*.log
```

### Validaciones de Fase
- [x] Todas las carpetas existen
- [x] `.gitignore` actualizado
- [x] `npm run build` funciona
- [x] Ningún archivo de lógica modificado

### Rollback
```bash
git revert 7a67046
git clean -fd src/common src/config src/storage
```

---

## FASE 2: INSTALACIÓN DE DEPENDENCIAS

**Estado:** ✅ COMPLETADA  
**Fecha de Completación:** 2026-07-07  
**Objetivo:** Instalar Winston + nest-winston + types  
**Motivación:** Motor de logging sin usarlo aún  
**Duración:** 1 hora  
**Riesgo:** Bajo (dependencias nuevas no afectan código existente)

### Dependencias Instaladas

```bash
npm install winston nest-winston
npm install --save-dev @types/winston winston-daily-rotate-file
```

**Versiones instaladas:**
- winston@3.19.0
- nest-winston@1.10.2
- winston-daily-rotate-file@5.0.0
- @types/winston@2.4.4 (deprecated, winston ya incluye sus propios tipos)

### Archivos Modificados

- [x] `package.json` (nuevas dependencias)
- [x] `package-lock.json` (auto)

### Commits Completados

#### Commit 2.1 ✅
- **Objetivo:** Instalar winston + nest-winston
- **Archivos:** `package.json`, `package-lock.json`
- **Hash:** `5e68a99`
- **Mensaje:** `feat(deps): install winston and nest-winston for logging`

### Validaciones de Fase
- [x] `npm ls winston` → winston@3.19.0
- [x] `npm ls nest-winston` → nest-winston@1.10.2
- [x] `npm run build` → Success
- [x] `npm run start:dev` → Servidor inicia normal

### Rollback
```bash
git revert 5e68a99
npm install
```

---

## FASE 3: EXCEPTION FILTER GLOBAL

**Estado:** ✅ COMPLETADA  
**Fecha de Completación:** 2026-07-07  
**Objetivo:** Crear filtro que capture TODAS las excepciones no manejadas  
**Motivación:** Centralizar manejo de errores, evitar que se pierdan  
**Impacto:** ALTO (cambia comportamiento de errores)  
**Duración:** 2 horas  
**Riesgo:** Medio (puede cambiar formato de respuestas de error)

### Archivos Creados

- [x] `src/common/filters/all-exceptions.filter.ts`
- [x] `src/common/filters/index.ts`

### Archivos Modificados

- [x] `src/main.ts` (registrar filter globalmente)

### Commits Completados

#### Commit 3.1 ✅
- **Objetivo:** Crear AllExceptionsFilter base
- **Archivos:** `src/common/filters/all-exceptions.filter.ts`, `index.ts`
- **Hash:** `5bcc4d6`
- **Mensaje:** `feat(errors): create and register global all-exceptions filter`

#### Commit 3.2 ✅
- **Objetivo:** Registrar filter en main.ts
- **Archivos:** `src/main.ts`
- **Hash:** Incluido en `5bcc4d6`

### Validaciones de Fase
- [x] Error 404 devuelve JSON estructurado (no HTML)
- [x] Error 500 devuelto por filter
- [x] Validation errors manejados
- [x] Logs de errores aparecen en consola (con contexto)
- [x] Build funciona sin errores nuevos

### Rollback
```bash
git revert 5bcc4d6
```

---

## FASE 4: LOGGERSERVICE + CONFIGURACIÓN WINSTON

**Estado:** ⏳ PENDIENTE  
**Objetivo:** Crear LoggerService wrapper de Winston + configuración  
**Motivación:** Abstraer logging, permitir cambios futuros sin tocar servicios  
**Impacto:** ALTO (nuevo patrón de logging)  
**Duración:** 6 horas  
**Riesgo:** Medio (nueva dependencia central)

### Archivos a Crear

- [ ] `src/config/logger.config.ts` (Winston configuration)
- [ ] `src/common/services/logger.service.ts` (LoggerService wrapper)
- [ ] `src/common/services/logger-factory.service.ts` (Logger con contexto)
- [ ] `src/common/services/logger.module.ts`
- [ ] `src/common/utils/log-levels.util.ts` (Niveles personalizados)
- [ ] `src/common/utils/log-formatter.util.ts` (Format JSON/Console)
- [ ] `src/common/services/index.ts`

### Archivos a Modificar

- [ ] `src/app.module.ts` (importar LoggerModule)
- [ ] `src/main.ts` (usar LoggerService para logs de bootstrap)

### Commits Atómicos

#### Commit 4.1
- [ ] **Objetivo:** Crear configuración de Winston base
- [ ] **Archivos:** `src/config/logger.config.ts`
- [ ] **Mensaje:** `feat(logging): add winston configuration module`

#### Commit 4.2
- [ ] **Objetivo:** Crear LoggerService wrapper
- [ ] **Archivos:** `src/common/services/logger.service.ts`, `index.ts`
- [ ] **Mensaje:** `feat(logging): create LoggerService wrapper for winston`

#### Commit 4.3
- [ ] **Objetivo:** Crear LoggerModule y registrar globalmente
- [ ] **Archivos:** `src/common/services/logger.module.ts`, `src/app.module.ts`
- [ ] **Mensaje:** `feat(logging): create and register LoggerModule globally`

#### Commit 4.4
- [ ] **Objetivo:** Reemplazar console.log en main.ts por LoggerService
- [ ] **Archivos:** `src/main.ts`
- [ ] **Mensaje:** `refactor(logging): migrate main.ts to use LoggerService`

### Validaciones de Fase
- [ ] LoggerService inyectable en cualquier módulo
- [ ] `logger.info()`, `logger.error()` funcionan
- [ ] Winston escribe en consola
- [ ] Winston escribe en `storage/logs/error.log` si nivel >= error
- [ ] `main.ts` usa LoggerService
- [ ] Build funciona

### Rollback
```bash
git revert HEAD~4..HEAD
```

---

## FASE 5: MIDDLEWARE DE CORRELATION ID

**Estado:** ⏳ PENDIENTE  
**Objetivo:** Inyectar correlation ID en cada request, enriquecer logs  
**Motivación:** Poder seguir una petición a través de múltiples servicios/logs  
**Impacto:** MEDIO (añade header, modifica metadata de logs)  
**Duración:** 4 horas  
**Riesgo:** Bajo (middleware no intrusivo)

### Archivos a Crear

- [ ] `src/common/middleware/logger.middleware.ts`
- [ ] `src/common/middleware/index.ts`
- [ ] `src/common/utils/correlation-id.util.ts` (generador de UUID)

### Archivos a Modificar

- [ ] `src/main.ts` (registrar middleware)
- [ ] `src/common/services/logger.service.ts` (leer correlation ID del contexto)

### Commits Atómicos

#### Commit 5.1
- [ ] **Objetivo:** Crear utilidad de generación de Correlation ID
- [ ] **Archivos:** `src/common/utils/correlation-id.util.ts`
- [ ] **Mensaje:** `feat(logging): add correlation ID generator utility`

#### Commit 5.2
- [ ] **Objetivo:** Crear LoggerMiddleware
- [ ] **Archivos:** `src/common/middleware/logger.middleware.ts`, `index.ts`
- [ ] **Mensaje:** `feat(logging): create logger middleware for correlation ID`

#### Commit 5.3
- [ ] **Objetivo:** Registrar middleware globalmente
- [ ] **Archivos:** `src/main.ts`
- [ ] **Mensaje:** `feat(logging): register logger middleware globally`

#### Commit 5.4
- [ ] **Objetivo:** Enriquecer LoggerService con correlation ID
- [ ] **Archivos:** `src/common/services/logger.service.ts`
- [ ] **Mensaje:** `feat(logging): enrich LoggerService with correlation ID context`

### Validaciones de Fase
- [ ] Cada request HTTP tiene `X-Correlation-ID` header
- [ ] Logs incluyen `correlationId`
- [ ] Mismo correlation ID en todos los logs de un request
- [ ] Middleware no afecta performance significativamente (<1ms)

### Rollback
```bash
git revert HEAD~4..HEAD
```

---

## FASE 6: INTERCEPTOR DE LOGGING HTTP

**Estado:** ⏳ PENDIENTE  
**Objetivo:** Loguear automáticamente todos los requests/responses HTTP  
**Motivación:** Auditoría de tráfico, debugging, métricas de performance  
**Impacto:** MEDIO (genera logs adicionales)  
**Duración:** 4 horas  
**Riesgo:** Bajo (solo añade logs, no modifica comportamiento)

### Archivos a Crear

- [ ] `src/common/interceptors/logging.interceptor.ts`
- [ ] `src/common/interceptors/index.ts` (actualizar)

### Archivos a Modificar

- [ ] `src/app.module.ts` (registrar interceptor globalmente)

### Commits Atómicos

#### Commit 6.1
- [ ] **Objetivo:** Crear LoggingInterceptor
- [ ] **Archivos:** `src/common/interceptors/logging.interceptor.ts`, `index.ts`
- [ ] **Mensaje:** `feat(logging): create HTTP logging interceptor`

#### Commit 6.2
- [ ] **Objetivo:** Registrar interceptor globalmente
- [ ] **Archivos:** `src/app.module.ts`
- [ ] **Mensaje:** `feat(logging): register logging interceptor globally`

### Validaciones de Fase
- [ ] Cada request genera log con method, URL, status
- [ ] Duration calculada correctamente
- [ ] Correlation ID incluido en logs HTTP
- [ ] Performance impact <5ms por request

### Rollback
```bash
git revert HEAD~2..HEAD
```

---

## FASE 7: MIGRACIÓN MÓDULO AUTH

**Estado:** ⏳ PENDIENTE  
**Objetivo:** Migrar servicios del módulo auth a LoggerService  
**Motivación:** Módulo crítico, validar patrón de migración  
**Impacto:** MEDIO (cambia logging en auth)  
**Duración:** 4 horas  
**Riesgo:** Medio (módulo sensible, pero cambios son solo logging)

### Archivos a Modificar

- [ ] `src/ucr/ac/cr/ie/services/auth/auth.service.ts` (reemplazar console.error)
- [ ] `src/ucr/ac/cr/ie/services/auth/user-role.service.ts` (si tiene console)
- [ ] `src/ucr/ac/cr/ie/common/guards/jwt-auth.guard.ts` (inyectar logger)
- [ ] `src/ucr/ac/cr/ie/common/guards/two-factor.guard.ts` (inyectar logger)

### Commits Atómicos

#### Commit 7.1
- [ ] **Objetivo:** Inyectar LoggerService en AuthService
- [ ] **Archivos:** `src/ucr/ac/cr/ie/services/auth/auth.service.ts`
- [ ] **Mensaje:** `refactor(auth): inject LoggerService into AuthService`

#### Commit 7.2
- [ ] **Objetivo:** Reemplazar console.error por logger.error en AuthService
- [ ] **Archivos:** `src/ucr/ac/cr/ie/services/auth/auth.service.ts`
- [ ] **Mensaje:** `refactor(auth): migrate AuthService to LoggerService`

#### Commit 7.3
- [ ] **Objetivo:** Migrar Guards del módulo auth
- [ ] **Archivos:** `src/ucr/ac/cr/ie/common/guards/jwt-auth.guard.ts`, `two-factor.guard.ts`
- [ ] **Mensaje:** `refactor(auth): migrate guards to LoggerService`

### Validaciones de Fase
- [ ] AuthService usa `this.logger.error()` en todos los catch
- [ ] Guards inyectan LoggerService
- [ ] Login fallido logueado con contexto (email, error)
- [ ] 2FA errors logueados
- [ ] No hay console.error en módulo auth

### Rollback
```bash
git revert HEAD~3..HEAD
```

---

## FASE 8: MIGRACIÓN MÓDULO AUDIT + CORE

**Estado:** ⏳ PENDIENTE  
**Objetivo:** Migrar módulo audit y servicios core usados por audit  
**Motivación:** Audit registra todas las acciones, debe usar LoggerService  
**Impacto:** MEDIO (auditoría es crítica)  
**Duración:** 4 horas  
**Riesgo:** Medio (pero logging no afecta funcionalidad de auditoría)

### Archivos a Modificar

- [ ] `src/ucr/ac/cr/ie/services/audit/audit.service.ts`
- [ ] `src/ucr/ac/cr/ie/common/interceptors/audit-log.interceptor.ts`
- [ ] `src/ucr/ac/cr/ie/services/users/user.service.ts` (log de auditoría en user creation)

### Commits Atómicos

#### Commit 8.1
- [ ] **Objetivo:** Migrar AuditService a LoggerService
- [ ] **Archivos:** `src/ucr/ac/cr/ie/services/audit/audit.service.ts`
- [ ] **Mensaje:** `refactor(audit): migrate AuditService to LoggerService`

#### Commit 8.2
- [ ] **Objetivo:** Migrar AuditLogInterceptor a LoggerService
- [ ] **Archivos:** `src/ucr/ac/cr/ie/common/interceptors/audit-log.interceptor.ts`
- [ ] **Mensaje:** `refactor(audit): migrate AuditLogInterceptor to LoggerService`

### Validaciones de Fase
- [ ] AuditService inyecta LoggerService
- [ ] `logAction()` errores logueados correctamente
- [ ] AuditLogInterceptor no usa console.error
- [ ] Auditoría sigue funcionando (registros se crean)

### Rollback
```bash
git revert HEAD~2..HEAD
```

---

## FASE 9: MIGRACIÓN MÓDULOS DE NEGOCIO

**Estado:** ⏳ PENDIENTE  
**Objetivo:** Migrar módulos users, roles, permissions  
**Motivación:** Módulos frecuentemente usados, validar migración masiva  
**Impacto:** MEDIO  
**Duración:** 6 horas  
**Riesgo:** Bajo (solo logging)

### Archivos a Modificar

- [ ] `src/ucr/ac/cr/ie/services/users/user.service.ts`
- [ ] `src/ucr/ac/cr/ie/services/roles/role.service.ts`
- [ ] `src/ucr/ac/cr/ie/services/permissions/permission.service.ts`

### Commits Atómicos

#### Commit 9.1
- [ ] **Objetivo:** Migrar UserService
- [ ] **Archivos:** `src/ucr/ac/cr/ie/services/users/user.service.ts`
- [ ] **Mensaje:** `refactor(users): migrate UserService to LoggerService`

#### Commit 9.2
- [ ] **Objetivo:** Migrar RoleService
- [ ] **Archivos:** `src/ucr/ac/cr/ie/services/roles/role.service.ts`
- [ ] **Mensaje:** `refactor(roles): migrate RoleService to LoggerService`

#### Commit 9.3
- [ ] **Objetivo:** Migrar PermissionService
- [ ] **Archivos:** `src/ucr/ac/cr/ie/services/permissions/permission.service.ts`
- [ ] **Mensaje:** `refactor(permissions): migrate PermissionService to LoggerService`

### Validaciones de Fase
- [ ] Todos los servicios inyectan LoggerService
- [ ] No hay console.error en estos módulos
- [ ] Creación/edición/eliminación de usuarios logueada
- [ ] Gestión de roles logueada

### Rollback
```bash
git revert HEAD~3..HEAD
```

---

## FASE 10: MIGRACIÓN MÓDULOS CLÍNICOS

**Estado:** ⏳ PENDIENTE  
**Objetivo:** Migrar módulos nursing, vaccines, emergency-contacts, etc.  
**Motivación:** Módulos menos críticos, mayor volumen de cambios  
**Impacto:** BAJO (módulos internos)  
**Duración:** 8 horas  
**Riesgo:** Bajo

### Archivos a Modificar

- [ ] `src/ucr/ac/cr/ie/services/nursing/nursing.service.ts`
- [ ] `src/ucr/ac/cr/ie/services/vaccines/vaccines.service.ts`
- [ ] `src/ucr/ac/cr/ie/services/emergency-contacts/emergency-contacts.service.ts`
- [ ] `src/ucr/ac/cr/ie/services/virtual-records/virtual-records.service.ts`
- [ ] `src/ucr/ac/cr/ie/services/specialized-areas/specialized-areas.service.ts`
- [ ] Restantes servicios con console.error

### Commits Atómicos

#### Commit 10.1
- [ ] **Objetivo:** Migrar NursingService
- [ ] **Archivos:** `src/ucr/ac/cr/ie/services/nursing/nursing.service.ts`
- [ ] **Mensaje:** `refactor(nursing): migrate NursingService to LoggerService`

#### Commit 10.2
- [ ] **Objetivo:** Migrar Vaccines + Emergency Contacts
- [ ] **Archivos:** `src/ucr/ac/cr/ie/services/vaccines/vaccines.service.ts`, `src/ucr/ac/cr/ie/services/emergency-contacts/emergency-contacts.service.ts`
- [ ] **Mensaje:** `refactor(clinical): migrate vaccines and emergency contacts to LoggerService`

#### Commit 10.3
- [ ] **Objetivo:** Migrar Virtual Records + Specialized Areas
- [ ] **Archivos:** `src/ucr/ac/cr/ie/services/virtual-records/virtual-records.service.ts`, `src/ucr/ac/cr/ie/services/specialized-areas/specialized-areas.service.ts`
- [ ] **Mensaje:** `refactor(clinical): migrate virtual records and specialized areas`

#### Commit 10.4
- [ ] **Objetivo:** Migrar servicios restantes
- [ ] **Archivos:** Todos los servicios restantes con console.error
- [ ] **Mensaje:** `refactor(clinical): migrate remaining services to LoggerService`

### Validaciones de Fase
- [ ] Todos los servicios clínicos migrados
- [ ] Búsqueda global de console.error retorna 0 en src/
- [ ] Tests (si existen) pasan

### Rollback
```bash
git revert HEAD~4..HEAD
```

---

## FASE 11: CONFIGURACIÓN DE TYPEORM LOGGING

**Estado:** ⏳ PENDIENTE  
**Objetivo:** Reducir/eliminar logging excesivo de SQL  
**Motivación:** Limpiar consola de queries  
**Impacto:** ALTO (reduce drásticamente ruido en consola)  
**Duración:** 2 horas  
**Riesgo:** Bajo (cambia configuración)

### Archivos a Modificar

- [ ] `src/ucr/ac/cr/ie/database.providers.ts`

### Commits Atómicos

#### Commit 11.1
- [ ] **Objetivo:** Configurar TypeORM logging selectivo
- [ ] **Archivos:** `src/ucr/ac/cr/ie/database.providers.ts`
- [ ] **Mensaje:** `perf(logging): configure TypeORM to log only errors and warnings`
- [ ] **Cambio:**
```typescript
// Antes
logging: process.env.NODE_ENV === 'development',

// Después
logging: ['error', 'warn'],  // Solo errores y slow queries
```

### Validaciones de Fase
- [ ] Queries SQL no aparecen en consola
- [ ] Errores de DB sí aparecen
- [ ] Slow queries (>1s) logueados
- [ ] Aplicación funciona normal

### Rollback
```bash
git revert HEAD
```

---

## FASE 12: PROCESS GLOBAL HANDLERS

**Estado:** ⏳ PENDIENTE  
**Objetivo:** Manejar errores fatales no capturados  
**Motivación:** Evitar que procesos mueran sin log  
**Impacto:** MEDIO (captura errores fatales)  
**Duración:** 2 horas  
**Riesgo:** Bajo (solo añade handlers)

### Archivos a Modificar

- [ ] `src/main.ts`

### Commits Atómicos

#### Commit 12.1
- [ ] **Objetivo:** Agregar handlers para uncaughtException, unhandledRejection
- [ ] **Archivos:** `src/main.ts`
- [ ] **Mensaje:** `feat(errors): add global handlers for uncaught exceptions`
- [ ] **Contenido:**
```typescript
process.on('uncaughtException', (error) => {
  logger.fatal('Uncaught Exception', { error });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.fatal('Unhandled Rejection', { reason });
});
```

### Validaciones de Fase
- [ ] `uncaughtException` loguea antes de salir
- [ ] `unhandledRejection` loguea automáticamente
- [ ] Proceso sale limpiamente

### Rollback
```bash
git revert HEAD
```

---

## FASE 13: ROTACIÓN DE LOGS

**Estado:** ⏳ PENDIENTE  
**Objetivo:** Implementar rotación diaria de archivos de log  
**Motivación:** Prevenir que logs crezcan infinitamente  
**Impacto:** MEDIO (añade nueva dependencia)  
**Duración:** 3 horas  
**Riesgo:** Bajo

### Dependencias a Instalar

```bash
npm install winston-daily-rotate-file
```

### Archivos a Modificar

- [ ] `src/config/logger.config.ts` (agregar transporte de rotación)

### Commits Atómicos

#### Commit 13.1
- [ ] **Objetivo:** Configurar rotación diaria de logs
- [ ] **Archivos:** `src/config/logger.config.ts`
- [ ] **Mensaje:** `feat(logging): add daily log rotation with winston-daily-rotate-file`

### Validaciones de Fase
- [ ] Logs rota diariamente
- [ ] Archivos antiguos se mantienen (7 días por defecto)
- [ ] No hay pérdida de logs durante rotación

### Rollback
```bash
git revert HEAD
```

---

## FASE 14: CONFIGURACIÓN POR AMBIENTE

**Estado:** ⏳ PENDIENTE  
**Objetivo:** Configurar niveles y transports por ambiente  
**Motivación:** Diferente comportamiento en dev vs prod  
**Impacto:** ALTO (cambia comportamiento en producción)  
**Duración:** 4 horas  
**Riesgo:** Medio (afecta producción)

### Archivos a Crear

- [ ] `src/config/environment-logging.config.ts`

### Archivos a Modificar

- [ ] `src/config/logger.config.ts` (leer config de ambiente)
- [ ] `.env.example` (agregar variables de logging)
- [ ] `.env` (configuración local)

### Variables de Ambiente a Agregar

```bash
# Logging
LOG_LEVEL=info
LOG_FORMAT=json
LOG_DIR=storage/logs
LOG_MAX_FILES=7
```

### Commits Atómicos

#### Commit 14.1
- [ ] **Objetivo:** Crear configuración por ambiente
- [ ] **Archivos:** `src/config/environment-logging.config.ts`
- [ ] **Mensaje:** `feat(config): add environment-based logging configuration`

#### Commit 14.2
- [ ] **Objetivo:** Actualizar logger.config para usar variables
- [ ] **Archivos:** `src/config/logger.config.ts`
- [ ] **Mensaje:** `feat(config): make logger configuration environment-aware`

#### Commit 14.3
- [ ] **Objetivo:** Agregar variables a .env.example
- [ ] **Archivos:** `.env.example`
- [ ] **Mensaje:** `chore(config): add logging environment variables to example`

### Validaciones de Fase
- [ ] Development: logs en consola, nivel DEBUG
- [ ] Production: logs en archivos, nivel INFO
- [ ] Variables de ambiente controlan comportamiento

### Rollback
```bash
git revert HEAD~3..HEAD
```

---

## ESTRATEGIA DE COMMITS ATÓMICOS

### Tabla Maestra de Commits

| # | Fase | Mensaje del Commit | Archivos | Tipo | Estado |
|---|------|-------------------|----------|------|--------|
| 1 | 1 | `chore(logging): create directory structure for logging infrastructure` | 7 `.gitkeep` | chore | ⏳ |
| 2 | 1 | `chore(gitignore): add storage/logs to gitignore` | `.gitignore` | chore | ⏳ |
| 3 | 2 | `feat(deps): install winston and nest-winston for logging` | `package.json`, `package-lock.json` | feat | ⏳ |
| 4 | 3 | `feat(errors): create global all-exceptions filter` | `all-exceptions.filter.ts`, `index.ts` | feat | ⏳ |
| 5 | 3 | `feat(errors): register all-exceptions filter globally` | `main.ts` | feat | ⏳ |
| 6 | 4 | `feat(logging): add winston configuration module` | `logger.config.ts` | feat | ⏳ |
| 7 | 4 | `feat(logging): create LoggerService wrapper for winston` | `logger.service.ts`, `index.ts` | feat | ⏳ |
| 8 | 4 | `feat(logging): create and register LoggerModule globally` | `logger.module.ts`, `app.module.ts` | feat | ⏳ |
| 9 | 4 | `refactor(logging): migrate main.ts to use LoggerService` | `main.ts` | refactor | ⏳ |
| 10 | 5 | `feat(logging): add correlation ID generator utility` | `correlation-id.util.ts` | feat | ⏳ |
| 11 | 5 | `feat(logging): create logger middleware for correlation ID` | `logger.middleware.ts`, `index.ts` | feat | ⏳ |
| 12 | 5 | `feat(logging): register logger middleware globally` | `main.ts` | feat | ⏳ |
| 13 | 5 | `feat(logging): enrich LoggerService with correlation ID context` | `logger.service.ts` | feat | ⏳ |
| 14 | 6 | `feat(logging): create HTTP logging interceptor` | `logging.interceptor.ts`, `index.ts` | feat | ⏳ |
| 15 | 6 | `feat(logging): register logging interceptor globally` | `app.module.ts` | feat | ⏳ |
| 16 | 7 | `refactor(auth): inject LoggerService into AuthService` | `auth.service.ts` | refactor | ⏳ |
| 17 | 7 | `refactor(auth): migrate AuthService to LoggerService` | `auth.service.ts` | refactor | ⏳ |
| 18 | 7 | `refactor(auth): migrate guards to LoggerService` | `jwt-auth.guard.ts`, `two-factor.guard.ts` | refactor | ⏳ |
| 19 | 8 | `refactor(audit): migrate AuditService to LoggerService` | `audit.service.ts` | refactor | ⏳ |
| 20 | 8 | `refactor(audit): migrate AuditLogInterceptor to LoggerService` | `audit-log.interceptor.ts` | refactor | ⏳ |
| 21 | 9 | `refactor(users): migrate UserService to LoggerService` | `user.service.ts` | refactor | ⏳ |
| 22 | 9 | `refactor(roles): migrate RoleService to LoggerService` | `role.service.ts` | refactor | ⏳ |
| 23 | 9 | `refactor(permissions): migrate PermissionService to LoggerService` | `permission.service.ts` | refactor | ⏳ |
| 24 | 10 | `refactor(nursing): migrate NursingService to LoggerService` | `nursing.service.ts` | refactor | ⏳ |
| 25 | 10 | `refactor(clinical): migrate vaccines and emergency contacts` | `vaccines.service.ts`, `emergency-contacts.service.ts` | refactor | ⏳ |
| 26 | 10 | `refactor(clinical): migrate virtual records and specialized areas` | `virtual-records.service.ts`, `specialized-areas.service.ts` | refactor | ⏳ |
| 27 | 10 | `refactor(clinical): migrate remaining services` | Varios | refactor | ⏳ |
| 28 | 11 | `perf(logging): configure TypeORM to log only errors` | `database.providers.ts` | perf | ⏳ |
| 29 | 12 | `feat(errors): add global handlers for uncaught exceptions` | `main.ts` | feat | ⏳ |
| 30 | 13 | `feat(logging): add daily log rotation` | `logger.config.ts` | feat | ⏳ |
| 31 | 14 | `feat(config): add environment-based logging configuration` | `environment-logging.config.ts` | feat | ⏳ |
| 32 | 14 | `feat(config): make logger configuration environment-aware` | `logger.config.ts` | feat | ⏳ |
| 33 | 14 | `chore(config): add logging environment variables` | `.env.example` | chore | ⏳ |

---

## ESTRATEGIA DE PRUEBAS

### Pruebas por Fase

**Fase 1-2 (Infraestructura + Deps):**
- [ ] `npm run build` pasa
- [ ] `npm run start:dev` inicia sin errores
- [ ] `git status` muestra solo archivos nuevos

**Fase 3 (Exception Filter):**
- [ ] GET /endpoint-inexistente → 404 JSON estructurado
- [ ] Lanzar error 500 en controller → respuesta estructurada
- [ ] Validation error → respuesta 400 estructurada

**Fase 4 (LoggerService):**
- [ ] Inyectar LoggerService en servicio de prueba
- [ ] `logger.info()`, `logger.error()` escriben en consola
- [ ] `storage/logs/error.log` se crea con errores

**Fase 5 (Correlation ID):**
- [ ] Request HTTP incluye header `X-Correlation-ID`
- [ ] Response incluye mismo correlation ID
- [ ] Logs incluyen campo `correlationId`

**Fase 6 (HTTP Interceptor):**
- [ ] Cada request loguea method, URL, status, duration
- [ ] Duration es precisa (<5ms overhead)

**Fases 7-10 (Migración):**
- [ ] Búsqueda `console.error` en src/ retorna 0
- [ ] Functional tests del módulo migrado pasan
- [ ] Logs incluyen contexto (userId, error message)

**Fase 11 (TypeORM):**
- [ ] Queries normales NO aparecen en consola
- [ ] Errores de DB SÍ aparecen
- [ ] Slow queries (>1s) logueados

**Fase 12 (Global Handlers):**
- [ ] `throw new Error('test')` fuera de try → se loguea
- [ ] Promesa rechazada no manejada → se loguea

**Fase 13-14 (Rotación + Ambiente):**
- [ ] Logs rotan diariamente
- [ ] NODE_ENV=production → solo archivos, JSON format
- [ ] NODE_ENV=development → consola, colored format

---

## ESTRATEGIA DE ROLLBACK

### Rollback por Fase

Cada fase puede revertirse individualmente:

```bash
# Rollback de fase específica
git revert <commit-hash-start>..<commit-hash-end>

# Ejemplo: Revertir Fase 4 (commits 6-9)
git revert HEAD~4..HEAD
```

### Rollback Completo

```bash
# Volver al estado inicial (antes de Fase 1)
git checkout main
git pull origin main
```

### Rollback Parcial (mantener algunas fases)

```bash
# Mantener Fases 1-3, revertir 4-6
git revert <hash-fase-4-start>..<hash-fase-6-end>
```

---

## CHECKLIST FINAL ANTES DE COMENZAR

### Prerrequisitos

- [ ] Backup del estado actual documentado
- [ ] Rama `feature/logging-infrastructure` creada
- [ ] Team notificado del inicio de implementación
- [ ] Ventana de mantenimiento acordada (si es necesario)
- [ ] Plan de rollback comunicado

### Herramientas Necesarias

- [ ] Git configurado
- [ ] Node.js/npm funcionando
- [ ] Acceso al repositorio
- [ ] Ambiente de desarrollo disponible
- [ ] Ambiente de staging disponible (recomendado)

### Comunicación

- [ ] PR template preparado
- [ ] Commit message guidelines compartidos
- [ ] Canal de comunicación para issues durante implementación

---

## RECOMENDACIONES FINALES

### Durante la Implementación

1. **Commit frecuente:** No acumules más de 2-3 horas de trabajo sin commit
2. **Valida después de cada commit:** `npm run build`, `npm run start:dev`
3. **Documenta desviaciones:** Si te desvías del plan, actualiza este documento
4. **Prueba en staging:** Antes de mergear a main, prueba en staging
5. **Mantén main limpio:** Solo mergea cuando la fase esté 100% completa y testeada

### Después de Cada Fase

1. Actualiza este documento marcando checkboxes completados
2. Ejecuta `git log --oneline -5` para verificar commits
3. Prueba funcionalidad básica del sistema
4. Documenta cualquier issue encontrado y cómo se resolvió

### Métricas de Éxito

- [ ] Cero console.log/console.error en producción
- [ ] Todos los errores centralizados en ExceptionFilter
- [ ] Logs persistidos en archivos (producción)
- [ ] Correlation ID en todos los logs
- [ ] Consola limpia en desarrollo (sin SQL queries)
- [ ] Rollback probado y funcional

---

## ESTADO ACTUAL DE LA IMPLEMENTACIÓN

**Próxima Tarea:** Iniciar FASE 4 - LoggerService + Configuración Winston

**Progreso:** 4/35 commits completados (11.4%)

**Commits Realizados:**
1. `76e961a` chore(docs): add master implementation plan for logging system
2. `7a67046` chore(logging): create directory structure for logging infrastructure
3. `5e68a99` feat(deps): install winston and nest-winston for logging
4. `5bcc4d6` feat(errors): create and register global all-exceptions filter
5. `ae840ea` chore(plan): update progress after completing phase 3

**Rama Actual:** `feature/logging-infrastructure`

**Próximos Pasos (FASE 4):**
1. Crear `src/config/logger.config.ts` con configuración de Winston
2. Crear `src/common/services/logger.service.ts` como wrapper de Winston
3. Crear `src/common/services/logger.module.ts` para registro global
4. Registrar LoggerModule en app.module.ts
5. Migrar main.ts para usar LoggerService en lugar de console.log

**Estado del Sistema:**
- ✅ Estructura de directorios creada
- ✅ Dependencias instaladas (winston, nest-winston)
- ✅ Exception Filter global activo
- ⏳ LoggerService pendiente
- ⏳ Correlation ID pendiente
- ⏳ Migración de servicios pendiente

**Última Actualización:** 2026-07-07 - Fases 0-3 completadas exitosamente (4/14 fases)

---

**FIN DEL PLAN MAESTRO**