# AGENTS.md — Backend (`sigha-api/`)

> **You are an AI agent working on the NestJS backend of the Hogar de Ancianos platform.**
> Read the root `AGENTS.md` first, then this file. This file is the source of truth for backend-specific rules.

---

## 0. Scope and authority

- **You work only inside `E:\Dev\TCU\sigha-api\`.**
- **You do not edit** `frontend/`, `database/`, or root files (except when you must, and only with explicit user permission).
- **You do not push** to the remote. The user reviews and pushes.
- **You do not amend** published commits.
- **You do not** commit secrets, `.env`, `node_modules/`, `dist/`.

---

## 1. Stack

- **Framework:** NestJS 11 + TypeScript 5.9
- **ORM:** TypeORM with `pg` driver (Postgres / Supabase — ÉPICA 2 ✅). `mysql2` remains as a dependency for the legacy fallback (see `docker-compose.yml` `profiles: [legacy]`).
- **Auth:** JWT + `speakeasy` (TOTP 2FA) + bcrypt
- **Docs:** Swagger at `http://localhost:3000/api`
- **Validation:** `class-validator`, `class-transformer`
- **Testing:** Jest (`*.spec.ts`)
- **PDF / files:** `pdfkit`
- **Container:** Docker Compose (`docker/docker-compose.yml` for MySQL + backend)

---

## 2. Folder map (this repo)

```
sigha-api/
├── AGENTS.md                                # this file
├── docs/                                    # AI-facing reference docs
│   ├── modules.md                           # NestJS modules catalog
│   ├── api-endpoints.md                     # all HTTP routes
│   ├── entities.md                          # TypeORM entities registered
│   └── auth-flow.md                         # JWT + 2FA + sessions
├── src/
│   ├── main.ts                              # bootstrap, CORS, Swagger
│   ├── app.module.ts                        # global guards, all module imports
│   ├── types/
│   └── ucr/ac/cr/ie/
│       ├── database.module.ts               # TypeORM connection wrapper
│       ├── database.providers.ts            # ★ entities array (update on new entity)
│       ├── <module>.module.ts               # one per feature module
│       ├── common/
│       │   ├── guards/                      # JwtAuthGuard, RolesGuard
│       │   ├── decorators/                  # @Public(), @Roles(), @CurrentUser()
│       │   ├── filters/                     # HttpException filter
│       │   └── pipes/
│       ├── config/                          # swagger.config.ts, etc.
│       ├── auth/                            # see docs/auth-flow.md
│       │   ├── auth.module.ts
│       │   ├── controller/
│       │   ├── services/                    # auth.service.ts, jwt.service.ts, etc.
│       │   ├── domain/                      # entities (user, role, session, 2fa, tokens)
│       │   └── dto/
│       ├── users/
│       ├── roles/
│       ├── entrances-exits/
│       ├── audit/
│       ├── virtual-records/
│       ├── programs/
│       ├── clinical-conditions/
│       ├── vaccines/
│       ├── notifuse/                        # being replaced by Resend (ÉPICA 1)
│       ├── notifications/
│       ├── role-changes/
│       ├── nursing/
│       └── modules/                         # extended audit / session modules
│           ├── audit-logs/
│           ├── audit-reports/
│           ├── security-audit/
│           ├── session-management/
│           ├── system-audit/
│           └── activity-logs/
├── scripts/                                 # ops scripts (create super users, reset DB)
├── tests/                                   # legacy Selenium / JMeter / Vitest
└── docker/
    └── docker-compose.yml
```

---

## 3. Module catalog (full list, in `app.module.ts`)

| Module | Purpose | Catalog entry |
|---|---|---|
| `DatabaseModule` | TypeORM connection | `src/ucr/ac/cr/ie/database.module.ts` |
| `AuthModule` | login, 2FA, password recovery, sessions | `docs/auth-flow.md` |
| `UsersModule` | users CRUD | `docs/modules.md` §Users |
| `RolesModule` | roles | `docs/modules.md` §Roles |
| `EntrancesExitsModule` | entrance/exit logging | `docs/modules.md` §EntrancesExits |
| `AuditModule` | digital record / older adult updates audit | `docs/modules.md` §Audit |
| `VirtualRecordsModule` | older adults, family, clinical, vaccines | `docs/modules.md` §VirtualRecords |
| `ProgramsModule` | programs + sub-programs | `docs/modules.md` §Programs |
| `ClinicalConditionsModule` | clinical conditions | `docs/modules.md` §ClinicalConditions |
| `VaccinesModule` | vaccines | `docs/modules.md` §Vaccines |
| `NotifuseModule` | **legacy** email via Notifuse — being replaced | `docs/modules.md` §Notifuse (deprecated) |
| `NotificationsModule` | in-app notifications | `docs/modules.md` §Notifications |
| `RoleChangesModule` | role-change history | `docs/modules.md` §RoleChanges |
| `AuditLogsModule` | activity logs | `docs/modules.md` §AuditLogs |
| `AuditReportsModule` | audit reports | `docs/modules.md` §AuditReports |
| `SecurityAuditModule` | security events | `docs/modules.md` §SecurityAudit |
| `NursingModule` | nursing records + specialized appointments + areas | `docs/modules.md` §Nursing |

> Plus: `ActivityLogsModule`, `SessionManagementModule`, `SystemAuditModule` exist as standalone modules under `src/ucr/ac/cr/ie/modules/...` but are **not yet imported in `app.module.ts`** — see TareasPendientes §ÉPICA 4.

For a full breakdown see `docs/modules.md`.

---

## 4. Entities registered in TypeORM

`src/ucr/ac/cr/ie/database.providers.ts` declares 27 entities (see `docs/entities.md` for the full table).

> 🚨 **Always add new entities to the `entities` array in `database.providers.ts`.** This is the most common mistake.

---

## 5. Golden rules (backend-specific)

1. **No global `/api/v1` prefix.** Routes are exposed as-is: `POST /auth/login`, not `POST /api/v1/auth/login`. Verify against `*.controller.ts` and `main.ts` before adding routes.
2. **Default JWT protection.** Add `@Public()` only for `auth/*` and Swagger. All other endpoints inherit `JwtAuthGuard` via `APP_GUARD`.
3. **Validate inputs with `class-validator` DTOs.** No raw `body`/`query`/`params` consumption.
4. **Return DTOs, not entities.** Never expose `password`, `tfa_secret`, or internal flags.
5. **Audit significant actions** via `auditService.createDigitalRecord(...)` with Spanish descriptions.
6. **One module per business area.** Don't pile nursing + psychology + social-work into one module — they share `NursingModule` today for historical reasons; future split is acceptable.
7. **Use `ParseIntPipe` for numeric path params** to get 400 instead of 500.
8. **No raw SQL in services.** If unavoidable, encapsulate in a custom repository.
9. **Spanish UI strings, English code.** See `CONVENTIONS.md` §1.

---

## 6. Adding a new module — checklist

1. Create `src/ucr/ac/cr/ie/<module>/<module>.module.ts`.
2. Create the entity, DTOs, service, controller, custom repository (if needed).
3. **Register the entity** in `src/ucr/ac/cr/ie/database.providers.ts`.
4. **Import the module** in `src/app.module.ts`.
5. Add `@ApiTags('<module>')` to the controller.
6. Add a row to `docs/modules.md` and `docs/api-endpoints.md`.
7. Add a unit test in `services/<name>.service.spec.ts`.
8. Commit atomically. Branch `feature/<module>-<short-desc>`.

Full step-by-step in `WORKFLOWS.md` §1, §4.

---

## 7. Database connection

- `database.providers.ts` builds a TypeORM DataSource in this order:
  1. `DATABASE_URL` (full Postgres URL — preferred for Supabase / managed DBs). SSL auto-enabled when the URL contains `sslmode=require` or `ssl=true`.
  2. Discrete `DB_HOST`, `DB_PORT` (5432), `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` (fallback).
  3. `DB_SSL=true` forces SSL.
- Schema lives in `sigha-db/supabase/migrations/` (ÉPICA 2). The legacy `scriptDBCompleta.sql` is the MySQL reference.
- `synchronize: false` — schema is owned by the SQL migrations.
- `logging: process.env.NODE_ENV === 'development'` — verbose SQL in dev.

For ops scripts, use the shared helper in `scripts/script-data-source.ts` so the same connection rules apply.

---

## 8. Env variables (`.env` / `.env.production`)

| Var | Example | Notes |
|---|---|---|
| `NODE_ENV` | `development` | |
| `PORT` | `3000` | |
| `DB_HOST` | `localhost` | |
| `DB_PORT` | `3306` | |
| `DB_USERNAME` | `root` | |
| `DB_PASSWORD` | `***` | never commit |
| `DB_NAME` | `hogar_de_ancianos` | |
| `JWT_SECRET` | `***` | never commit; rotate periodically |
| `JWT_EXPIRES_IN` | `1h` | |
| `NOTIFUSE_BASE_URL` | `https://notifuse.example.com` | **legacy**, to be removed (ÉPICA 1) |
| `NOTIFUSE_API_KEY` | `***` | **legacy**, to be removed (ÉPICA 1) |
| `NOTIFUSE_WORKSPACE_ID` | `***` | **legacy**, to be removed (ÉPICA 1) |
| `RESEND_API_KEY` | `re_...` | **new** (ÉPICA 1) |
| `RESEND_FROM_EMAIL` | `noreply@...` | **new** (ÉPICA 1) |
| `RESEND_FROM_NAME` | `Sistema Hogar de Ancianos` | **new** (ÉPICA 1) |
| `DATABASE_URL` | (Supabase, ÉPICA 2) | full Postgres URL |

---

## 9. Running locally

```bash
cd sigha-api
npm install
npm run start:dev   # http://localhost:3000
# Swagger: http://localhost:3000/api
# DB via docker: cd docker && docker compose up -d
```

Common scripts:
- `npm run start:dev` — dev with watch
- `npm run build` — production build
- `npm test` — Jest unit tests
- `npm run setup:users` — create initial super-users (run once)
- `npm run reset-database` — truncate tables
- `npm run check-schema` — verify entities ↔ DB (if script exists)

---

## 10. Testing

- Frameworks: Jest (`*.spec.ts`).
- Mocking: `jest.mock(...)` for services; `getRepositoryToken(Entity)` for repos.
- Coverage target: 70%+ for new code.

```bash
npm test
npm test -- --watch
npm test -- auth.service.spec.ts
```

---

## 11. Common pitfalls

- ❌ Forgetting to add the entity to `database.providers.ts` → silent failure at runtime.
- ❌ Returning a raw entity from a controller → leaks `password` and `tfa_secret`.
- ❌ Marking a non-auth route `@Public()` "just to make it work" → security hole.
- ❌ Using `synchronize: true` in production → corrupts schema.
- ❌ Inline-importing `axios` instead of a service.
- ❌ Mixing English/Spanish in audit messages.

---

## 12. Documentation files in this repo

| File | Purpose |
|---|---|
| `AGENTS.md` | This file |
| `docs/modules.md` | Module-by-module responsibilities |
| `docs/api-endpoints.md` | Catalog of HTTP routes |
| `docs/entities.md` | TypeORM entities (registered and not) |
| `docs/auth-flow.md` | JWT, 2FA, password recovery, sessions in detail |
| `README.md` | (legacy, in repo root — supersede with this file) |
| `tareas.md` | (legacy, Spanish, CI/CD history — keep for reference) |

---

## 13. Escalating to the coordinator

If a task touches more than this repo (e.g. needs frontend changes too), **stop and tell the user**, or invoke the `fullstack-coordinator` agent from the root `.opencode/agents/`.
