# Registro de cambios

Registra aquí solo cambios integrados en `dev`. El coordinador agrega una entrada después de cada integración; los agentes entregan el resumen y las verificaciones, pero no editan este archivo.

Formato: `YYYY-MM-DD | agent/<id>/<tarea> | tipo: resumen | verificación: resultado`.

- 2026-10-13 | agent/antigravity/migrate-to-bun | chore: migración de runtime, gestor de dependencias y test runner a Bun | verificación: bun install, bun test (25 pass, 0 fail), bun run build y db:check exitosos.
