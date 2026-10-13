# AGENTS.md — API (`sigha-api`)

Este archivo define el flujo de trabajo compartido y las reglas para cambios en la API NestJS/TypeScript. Usa `README.md` y `package.json` como fuentes de verdad para arquitectura, configuración y comandos.

## Alcance

- Trabaja solo en el repositorio `sigha-api`. Cambios de frontend o base de datos corresponden a agentes con sus propios worktrees en `sigha-web` o `sigha-db`.
- Coordina cambios de contratos API con los agentes de frontend y de base de datos antes de integrarlos.
- No publiques ramas ni hagas amend de commits publicados. No agregues secretos ni archivos `.env` al control de versiones.

## Coordinación de agentes y Git

### Identidad y alcance

Al iniciar, identifica tu trabajo con: `Agente: <id/rol> | proyecto: sigha-api | rama: <rama> | worktree: <ruta> | archivos: <alcance>`. El coordinador asigna archivos y evita que dos agentes editen los mismos archivos. Para cambios de frontend, API y base de datos, asigna un agente y un worktree por repositorio; acuerden los contratos compartidos antes de trabajar en paralelo.

### Ramas y worktrees

- `dev` es la rama de integración. Cada agente trabaja en un worktree exclusivo y una rama única `agent/<id>/<tarea>`, creada desde `dev`; usa `~/worktrees/sigha-api/<id>-<tarea>` como ubicación del worktree.
- **Flujo de cambios**: Después de crear la rama e implementar y verificar la tarea, **todos los cambios deben ir e integrarse directamente a `dev`**.
- Si no existe `dev` local ni `origin/dev`, detén la creación de ramas y pide al mantenedor que establezca `dev` desde una base aprobada. `main` queda reservada: no hagas checkout, no bases ramas de tarea en ella ni la uses como destino de commit, merge o integración.
- No compartas worktrees, ramas ni sesiones de edición. Cada agente confirma cambios únicamente en su propia rama antes de su integración a `dev`.
- Para analizar arquitectura, flujos o impacto, consulta CodeGraph antes de buscar archivos. Cada worktree necesita su propio `.codegraph/`; si falta, ejecuta `gentle-ai codegraph init --cwd <ruta-del-worktree>`. No copies ni compartas índices. Después de editar, deja sincronizar al watcher; usa `codegraph sync` solo si está apagado o el índice queda desactualizado.

### Operaciones Git y bloqueos

- El coordinador serializa por repositorio la creación o eliminación de worktrees y ramas, y toda integración o rebase sobre `dev`. Los agentes pueden implementar y verificar en paralelo en sus worktrees.
- Ejecuta como máximo un comando Git a la vez en cada worktree. Si Git informa que hay un lock, espera y localiza el proceso propietario; no borres archivos `.lock` mientras un proceso Git pueda estar activo.
- El usuario conserva la revisión y publicación remotas.

### Integración y registro

El agente entrega al coordinador el resumen, archivos modificados y verificaciones realizadas. El coordinador integra ramas completadas a `dev`, una por una y en orden de dependencias. Solo el coordinador actualiza `CHANGELOG.md` después de cada integración; los agentes entregan una nota lista para registrar, sin editar ese archivo.

