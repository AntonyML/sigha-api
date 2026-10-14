# Registro de cambios

Registra aquí solo cambios integrados en `dev`. El agente que integra agrega una entrada bajo el lock `dev-sigha-api` tras re-verificar el cambio en `dev`; las demás tareas no editan este archivo.

Formato: `YYYY-MM-DD | <taskId> | tipo: resumen | verificación: resultado`.

- 2026-10-13 | agent/antigravity/migrate-to-bun | chore: migración de runtime, gestor de dependencias y test runner a Bun | verificación: bun install, bun test (25 pass, 0 fail), bun run build y db:check exitosos.
2026-10-13 | sigha-api-20261013-f4t8 | feat: job de despacho programado de notificaciones pendientes | verificacion: typecheck limpio, bun test 48 pass/0 fail, build OK (worktree y dev).
2026-10-13 | sigha-api-20261013-g9w3 | test: unit tests de UserService | verificacion: typecheck limpio, bun test 65 pass/0 fail, build OK (worktree y dev).
2026-10-13 | sigha-api-20261013-9z3r | refactor: renombrar Hogar de Ancianos a Sistema Integral de Gestión Holística y de Asistencia (SIGHA) | verificación: typecheck OK, bun test 82 pass/0 fail, build OK (worktree y dev); funcional: swagger/SYSTEM_NAME/README con nombre nuevo, cero restos en src.
2026-10-13 | sigha-api-20261013-c4ab | refactor: eliminacion de scripts de seed, atajos directos a DB y StartupService | verificacion: typecheck limpio, bun test 82 pass/0 fail, build OK (worktree y dev).
2026-10-13 | sigha-api-20261013-tsf4 | feat: backend como autoridad SaaS con contexto de organización en sesión, endpoints /organizations, TenantGuard y scoping de referencia en notifications | verificación: typecheck limpio, bun test 92 pass/0 fail, nest build OK (worktree y dev); verificación funcional HTTP live (login/organizations, switch active-org, 403 en org ajena, TenantGuard 403 sin org y 200 con org).
2026-10-13 | sigha-api-20261013-m7x2 | feat: configuracion de proyecto Infisical (.infisical.json), scripts de ejecucion desacoplados y documentacion | verificacion: typecheck limpio, bun test 92 pass/0 fail, infisical live injection 92 pass/0 fail, nest build OK (worktree y dev).
2026-10-13 | sigha-api-20261013-02tp | feat: configurar deploy Render con Bun (render.yaml + GET /health publico + .node-version) | verificación: tsc --noEmit OK, bun test health 1 pass, nest build OK (worktree y dev); render.yaml validado (bun install/build, start dist/main.js, health /health).

2026-10-13 | sigha-api-20261013-8qht | docs: actualizar deuda sobre cadencia y tamaño del lote del job de notificaciones | verificación: typecheck OK, bun test 93 pass/0 fail, build OK; prueba del job 5 pass/0 fail.
