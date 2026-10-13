# AGENTS.md — API (`sigha-api`)

Este archivo define el flujo de trabajo compartido y las reglas para cambios en la API NestJS/TypeScript. Usa `README.md` y `package.json` como fuentes de verdad para arquitectura, configuración y comandos.

## Alcance

- Trabaja solo en el repositorio `sigha-api`. Cambios de frontend o base de datos corresponden a agentes con sus propios worktrees en `sigha-web` o `sigha-db`.
- Coordina cambios de contratos API con los agentes de frontend y de base de datos antes de integrarlos.
- No publiques ramas ni hagas amend de commits publicados. No agregues secretos ni archivos `.env` al control de versiones.

## Coordinación de agentes y Git (protocolo multi-agente)

> Protocolo maestro: `C:\DEV\sigha\AGENTS.md` — **manda sobre esta sección**.
> Lo de abajo es el resumen operativo para `sigha-api`; claims, regla STOP y
> limpieza se definen ahí.

### Identidad y alcance

Al iniciar, identifícate con: `Agente: <id/rol> | repo: sigha-api | rama: agent/<id>/<tarea> | worktree: C:\DEV\sigha\_wt\sigha-api\<id>-<tarea> | archivos: <alcance> | base: <sha de dev>`. El coordinador (por defecto: el usuario) asigna archivos; **dos agentes nunca reclaman el mismo archivo**. Contratos compartidos con web/db (DTOs ↔ `services/` ↔ esquema) se acuerdan **antes** de trabajar en paralelo, no durante.

### Checkout principal: intocable

- `C:\DEV\sigha\sigha-api` **siempre está en `dev`, siempre está limpio y NO se edita.** Solo el coordinador lo toca, y solo para integrar ramas terminadas una por una.
- Prohibido para agentes: editarlo, hacer `checkout`/`switch` en él, commitear `.env`, secretos, `node_modules/`, `dist/`.

### Tu worktree (uno por agente × tarea)

- Ruta canónica: `C:\DEV\sigha\_wt\sigha-api\<id>-<tarea>`, rama `agent/<id>/<tarea>` creada desde `origin/dev` recién traído. ⛔ Ruta vieja `~/worktrees/...` deprecada: no crear nada ahí.
- Si no existe `origin/dev` ni `dev`, STOP y pide al mantenedor que fije `dev`. `main` queda reservada: no basar ramas en ella ni integrarle nada.
- Secuencia obligatoria (una operación Git a la vez; con lock: esperar, nunca borrar `.lock` con proceso vivo):
  1. `git -C C:\DEV\sigha\sigha-api worktree list` + `status --short --branch` + `log --oneline -5` (solo lectura).
  2. Leer `C:\DEV\sigha\_wt\_claims\sigha-api.json`: si un claim `active` cubre tus archivos → STOP, pide reasignación. Si libre → registra el tuyo **antes** de crear la rama.
  3. `git -C C:\DEV\sigha\sigha-api fetch origin dev` y `worktree add "C:\DEV\sigha\_wt\sigha-api\<id>-<tarea>" -b "agent/<id>/<tarea>" origin/dev`.
  4. `bun install --cwd <tu-worktree>`; copia `.env.example` → `.env` (nunca se commitea).
- No compartas worktree, rama ni sesión de edición. No hagas `merge` a `dev`, `push`, `rebase` por tu cuenta ni `amend` de commits publicados.
- CodeGraph: cada worktree usa su propio `.codegraph/` (`gentle-ai codegraph init --cwd <tu-worktree>` si falta); no copiar ni compartir índices.

### Regla STOP ante diffs ajenos (el caso `invalidateUserUnreadCache`)

Si `status`/`diff` muestra código que no escribiste, otro agente tocó tu archivo o un `log` trae commits inesperados: **para de editar, no sobrescribas, no hagas commit "para salvar lo tuyo"**. Diagnostica en solo lectura (`status`, `diff --stat`, `log --oneline -5` en tu worktree, relee el archivo, compara claims) y reporta al coordinador archivo + símbolo inesperado + tu `baseSha` vs `HEAD` + rama sospechosa. **"Releer y seguir" sin atribuir el cambio está prohibido.** Detalle en `C:\DEV\sigha\AGENTS.md` §5.

### Verificación (en tu worktree)

```powershell
bun run typecheck --cwd "C:\DEV\sigha\_wt\sigha-api\<id>-<tarea>"
bun test --cwd "C:\DEV\sigha\_wt\sigha-api\<id>-<tarea>"
bun run build --cwd "C:\DEV\sigha\_wt\sigha-api\<id>-<tarea>"
```

No levantes dos `start:dev` en el puerto `3000`; si necesitas servidor, pide al coordinador un `PORT` distinto.

### Entrega al coordinador (no integras tú)

Commit en tu rama, `git status` limpio, marca tu claim `done`/`blocked` y entrega: rama, worktree, `baseSha`, `git diff --stat`, archivos tocados, verificaciones con resultado y nota lista para `CHANGELOG.md` (`YYYY-MM-DD | agent/<id>/<tarea> | tipo: resumen | verificación: resultado`). **No edites `CHANGELOG.md` ni la sección `Resueltas` de `TECH_DEBT.md`**: solo el coordinador los actualiza tras integrar.

