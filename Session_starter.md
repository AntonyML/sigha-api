AI Session Starter: backend_nest_js_hogar_de_ancianos

Project memory file for AI assistant session continuity. Auto-referenced by custom instructions.

---

## Project Context

**Project**: Backend API - Hogar de Ancianos Guapiles
**Type**: NestJS Backend with TypeORM + MySQL
**Status**: Active Development - Core modules operational

### Tech Stack
- NestJS v11.1.6 + TypeScript v5.9.3
- TypeORM v0.3.27 + MySQL2 v3.15.2
- JWT Auth + Passport + Speakeasy 2FA
- Swagger/OpenAPI + class-validator
- BCrypt + PDFKit + dotenv

### MCP Tools Active
- Filesystem MCP (file operations)
- GitHub MCP (repository management)
- Puppeteer MCP (E2E testing)
- Upstash Conte MCP (documentation)

---

## Architecture Overview

### Implemented Modules
1. **AuthModule** - JWT + 2FA authentication, session management
2. **UsersModule** - User CRUD, profile management, password operations
3. **RolesModule** - RBAC system with 8 system roles
4. **EntrancesExitsModule** - Entry/exit tracking for facility
5. **AuditModule** - Digital records, audit reports, change tracking

### Key Features
- Domain-driven design with UCR namespace (ucr.ac.cr.ie)
- Role-based access control (RBAC) with guards
- TypeORM entities with MySQL relations
- Swagger documentation at `/api`
- 2FA with QR code generation
- Automatic audit logging with @AuditLog decorator
- Postman collection for testing

### Database Structure
- Core: users, roles, user_sessions, user_two_factor, login_attempts
- Audit: digital_record, audit_reports, older_adult_updates, role_changes
- Operations: entrances_exits
- Pending: older_adult, clinical_history, specialized_area, medical_record

---

## Recent Milestones

### 2025-10-23 - Audit Module
- Complete audit system with 7 REST endpoints
- TypeORM entities: AuditReport, DigitalRecord, OlderAdultUpdate
- Search/filtering with pagination support
- Audit report generation (5 types: general_actions, role_changes, older_adult_updates, system_access, other)
- @AuditLog decorator for automatic logging
- RoleChange entity converted to TypeORM
- Full Swagger documentation + README

### 2025-10-22 - 2FA Improvements
- Fixed time synchronization (6-hour drift)
- Security hardening: TOTP window reduced to ±60s
- Branding: "Hogar Adulto Mayor Guapiles"

### 2025-10-18 - Initial Setup
- Complete auth system with JWT + 2FA
- RBAC with 8 system roles
- Docker + MySQL setup
- Postman collection created
- Puppeteer E2E testing configured

---

## Active Priorities

- [ ] **Older Adult Module** - Virtual file CRUD (clinical history, medications, family data)
- [ ] **Specialized Areas** - Nursing, physiotherapy, psychology, social work appointments
- [ ] **Medical Records** - Chronological medical history tracking
- [ ] **File Uploads** - Document/photo storage for virtual files
- [ ] **Email Notifications** - 2FA, alerts, audit reports
- [ ] **Testing** - Jest unit/integration tests
- [ ] **Security** - Rate limiting, input sanitization
- [ ] **Monitoring** - Logging, performance metrics
- [ ] **Deployment** - Migration scripts, backup procedures

---

## Quick Reference

### Default Credentials
```
Super Admin: superadmin@hogarancianos.com / SuperAdmin123!
Admin:       admin@hogarancianos.com / Admin123!
```

### System Roles
1. super admin - Full system access
2. admin - Administrative operations
3. director - Management oversight
4. nurse - Medical care
5. physiotherapist - Physical therapy
6. psychologist - Mental health
7. social worker - Social services
8. not specified - Default/unassigned

### Key Commands
```bash
npm run start:dev              # Dev server (port 3000)
npm run build                  # Production build
docker-compose up -d           # Start MySQL
npm run setup:users            # Initialize admin users
npm run disable:2fa            # Disable 2FA for testing
```

### Important Endpoints
- Swagger UI: `http://localhost:3000/api`
- Auth: `/auth/login`, `/auth/verify-2fa`, `/auth/profile`
- Audit: `/audit/digital-records`, `/audit/reports`
- Users: `/users`, `/users/search`, `/users/:id`

### Project Structure
```
src/ucr/ac/cr/ie/
├── common/         # Guards, decorators, interceptors, utils
├── config/         # Swagger configuration
├── controller/     # REST controllers
├── domain/         # TypeORM entities
├── dto/            # Data transfer objects
├── interfaces/     # Response interfaces
├── repository/     # Database providers
├── services/       # Business logic
├── *.module.ts     # NestJS modules
└── database.providers.ts
```

---

## Technical Notes

### Authentication Flow
1. POST `/auth/login` with credentials
2. If 2FA enabled: returns `requiresTwoFactor: true`
3. POST `/auth/verify-2fa` with TOTP code
4. JWT token issued (1h expiration)
5. Use token in Authorization header: `Bearer <token>`

### Audit Logging
```typescript
// Manual logging
await auditService.logAction(userId, AuditAction.CREATE, 'table', recordId, 'description');

// Automatic with decorator
@Post()
@AuditLog({ action: AuditAction.CREATE, tableName: 'users' })
async create() { }
```

### Database Entities Registered
- User, Role, UserSession, UserTwoFactor, LoginAttempt
- EntranceExit, RoleChange
- AuditReport, DigitalRecord, OlderAdultUpdate

### Known Constraints
- MySQL required (no SQLite/PostgreSQL support yet)
- 2FA requires time synchronization
- MCP filesystem limited to allowed directories
- UCR namespace mandatory for organizational standards

---

## Development Workflow

1. **Start Session**: Review this file + check Active Priorities
2. **Use MCP Tools**: Prefer filesystem/GitHub MCP over native tools
3. **Follow Patterns**: Match existing module structure
4. **Update Context**: Add achievements to Recent Milestones
5. **No Emojis**: Professional communication only
6. **Senior Dev Level**: Minimal comments, assume expertise
7. **Audit Actions**: Use @AuditLog for important operations

---

**Last Updated**: 2025-10-23
**Version**: 1.2.0-audit
**MCP Status**: Active (Filesystem, GitHub, Puppeteer)
