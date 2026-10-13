# Registro de cambios

Registra aquí solo cambios integrados en `dev`. El agente que integra agrega una entrada bajo el lock `dev-sigha-api` tras re-verificar el cambio en `dev`; las demás tareas no editan este archivo.

Formato: `YYYY-MM-DD | <taskId> | tipo: resumen | verificación: resultado`.

- 2026-10-13 | agent/antigravity/migrate-to-bun | chore: migración de runtime, gestor de dependencias y test runner a Bun | verificación: bun install, bun test (25 pass, 0 fail), bun run build y db:check exitosos.
