# AGENTS.md — API (`sigha-api`)

Este archivo define el flujo de trabajo compartido y las reglas para cambios en la API NestJS/TypeScript. Usa `README.md` y `package.json` como fuentes de verdad para arquitectura, configuración y comandos.

## Alcance

- Trabaja solo en el repositorio `sigha-api`. Cambios de frontend o base de datos corresponden a tareas en `sigha-web` o `sigha-db`.
- Coordina cambios de contratos API con las tareas de frontend y de base de datos **antes** de integrarlos.
- No publiques ramas ni hagas `amend` de commits publicados. Nunca subas secretos ni archivos `.env` al control de versiones.

## Coordinación y Git (protocolo multi-agente)

> Protocolo maestro: `C:\DEV\sigha\AGENTS.md` — **manda sobre esta sección**.
> Registro: `C:\DEV\sigha\_wt\_registry\sigha-api.jsonl` (formato en `_wt\_registry\README.md`).

### Identidad y alcance

Al iniciar, identifícate con:

```
Agente: <herramienta>/<modelo> | repo: sigha-api | taskId: <taskId o "(por reclamar)">
| rama: task/<taskId> | worktree: C:\DEV\sigha\_wt\sigha-api\<taskId>
| archivos: <alcance> | base: <sha de dev>
```

La identidad es el **`taskId`** (`sigha-api-<yyyymmdd>-<rand4>`), no el nombre de la herramienta. La herramienta/modelo se registran solo como `actor`. Contratos compartidos con web/db (DTOs ↔ `services/` ↔ esquema) se acuerdan **antes** de trabajar en paralelo, no durante.

### Checkout principal: solo se integra

- `C:\DEV\sigha\sigha-api` **siempre está en `dev`, siempre está limpio.** No se edita a mano: solo se integra ahí una rama terminada, bajo el lock `dev-sigha-api`.
- Prohibido para agentes: editarlo directamente, hacer `checkout`/`switch` en él, commitear `.env`, secretos, `node_modules/`, `dist/`.

### Tu worktree (uno por tarea)

- Ruta canónica: `C:\DEV\sigha\_wt\sigha-api\<taskId>`, rama `task/<taskId>` creada desde `origin/dev` recién traído. ⛔ Ruta vieja `~/worktrees/...` deprecada: no crear nada ahí.
- Si no existe `origin/dev` ni `dev`, STOP y pide al humano que fije `dev`. `main` queda reservada: no basar ramas en ella ni integrarle nada.
- Secuencia obligatoria (una operación Git a la vez; con lock: esperar, nunca borrar `.lock` con proceso vivo):
  1. `git -C C:\DEV\sigha\sigha-api worktree list` + `status --short --branch` + `log --oneline -5` (solo lectura).
  2. Preflight (§6 del protocolo): lee los tres ledgers; si hay solape de archivos o tarea `blocked` con pregunta abierta → HARD STOP.
  3. Bajo `registry-sigha-api.lock`: si ningún claim abierto cubre tus archivos → appendea tu `claim` (`status: in_progress`) con un `taskId` único.
  4. `git -C C:\DEV\sigha\sigha-api fetch origin dev` y `worktree add "C:\DEV\sigha\_wt\sigha-api\<taskId>" -b "task/<taskId>" origin/dev`.
  5. `bun install --cwd <tu-worktree>`; copia `.env.example` → `.env` (nunca se commitea).
- No compartas worktree, rama ni sesión de edición. No hagas `push` ni `rebase` por tu cuenta ni `amend` de commits publicados.
- CodeGraph: cada worktree usa su propio `.codegraph/` (`gentle-ai codegraph init --cwd <tu-worktree>` si falta); no copiar ni compartir índices.

### Regla STOP ante diffs ajenos (el caso `invalidateUserUnreadCache`)

Si `status`/`diff` muestra código que no escribiste, otro proceso tocó tu archivo o un `log` trae commits inesperados: **para de editar, no sobrescribas, no hagas commit "para salvar lo tuyo"**. Diagnostica en solo lectura (`status`, `diff --stat`, `log --oneline -5` en tu worktree, relee el archivo, compara con tu claim y con los ledgers) y reporta al humano archivo + símbolo inesperado + tu `baseSha` vs `HEAD` + `taskId`/rama sospechosa. **"Releer y seguir" sin atribuir el cambio está prohibido.** Detalle en `C:\DEV\sigha\AGENTS.md` §7.

### Verificación (en tu worktree)

```powershell
bun run typecheck --cwd "C:\DEV\sigha\_wt\sigha-api\<taskId>"
bun test --cwd "C:\DEV\sigha\_wt\sigha-api\<taskId>"
bun run build --cwd "C:\DEV\sigha\_wt\sigha-api\<taskId>"
```

No levantes dos `start:dev` en el puerto `3000`; si necesitas servidor, usa un `PORT` distinto por worktree.

### Entrega e integración (tú integras; el humano solo hace `push`)

1. Commit en tu rama, `git status` limpio, y appendea `event: "done"` con `branch`, `worktree`, `baseSha`, `git diff --stat`, archivos y verificaciones con resultado.
2. Bajo el lock `dev-sigha-api`: con el checkout principal en `dev` y limpio, `fetch origin dev` y `merge --no-ff "task/<taskId>"`. Si hay conflicto → `merge --abort`, marca `blocked`, conserva el worktree, HARD STOP.
3. **Re-verifica en `dev`** (typecheck, pruebas pertinentes, build y una comprobación funcional del endpoint/flujo). Que pase en el worktree no basta.
4. Si pasa: actualiza `CHANGELOG.md` (y `TECH_DEBT.md` §`Resueltas` cuando aplique), commitea en `dev`, appendea `event: "integrated"` con `mergeSha`/`devSha`, y limpia worktree + rama (`worktree remove`, `branch -d`, `worktree prune`).
5. Si falla la re-verificación: `git revert -m 1 <mergeSha>`, marca `blocked`, conserva el worktree y HARD STOP.
6. **No hagas `push`.** El humano revisa `dev` y publica `dev` y `main`.

Formato de la línea de `CHANGELOG.md`: `YYYY-MM-DD | <taskId> | tipo: resumen | verificación: resultado`.
