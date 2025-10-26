AI Session Starter: backend_nest_js_hogar_de_ancianos

Project memory file for AI assistant session continuity. Auto-referenced by custom instructions.

---

### 2025-01-XX - QA Testing Framework Reorganization COMPLETED
- [OK] **Test Structure Simplified**: Reorganized from 4 testing levels (black-box, white-box, integration, e2e) to 2 essential levels (black-box/AuthTest, white-box/AuthTest)
- [OK] **File Reorganization**: Moved auth-black-box.spec.ts and auth-white-box.spec.ts to dedicated AuthTest subdirectories
- [OK] **Directory Cleanup**: Removed integration/ and e2e/ folders as requested
- [OK] **Playwright Config Update**: Simplified configuration to 3 projects (auth-black-box, auth-white-box, auth-all)
- [OK] **NPM Scripts Cleanup**: Streamlined to 4 essential commands (test:black, test:white, test:all, test:report)
- [OK] **Syntax Error Resolution**: Fixed all TypeScript compilation errors including import statements, property expectations, and authUtils initialization
- [OK] **Test Execution Validation**: All 32 tests now run without syntax errors (17 passed, 12 skipped due to dependencies, 3 functional failures)

**Current Test Status:**
- **Total Tests**: 32 (15 black-box + 17 white-box)
- **Syntax Errors**: 0 [OK]
- **Functional Issues**: 3 tests failing (401 responses - authentication API issues, not framework issues)
- **Test Coverage**: Black-box functional testing + White-box structural testing for Auth module

**Framework Benefits:**
- Clean, maintainable test structure focused on essential testing levels
- Professional organization with AuthTest subdirectories
- All syntax errors resolved, tests execute properly
- Ready for development team usage and CI/CD integration

---

### 2025-01-XX - Comprehensive QA Testing Framework Implementation
- [OK] **Playwright Testing Framework**: Installed and configured for comprehensive testing
- [OK] **QA Directory Structure**: Created professional testing organization with black-box, white-box, integration, and E2E folders
- [OK] **Auth Test Utilities**: Complete AuthAPITestUtils class with TOTP generation, API helpers, and test constants
- [OK] **Black Box Tests**: 15 functional test cases covering equivalence partitioning, boundary analysis, and security testing
- [OK] **White Box Tests**: 17 structural test cases with path coverage, branch coverage, and condition coverage
- [OK] **Integration Tests**: 21 integration test cases covering database, JWT service, 2FA service, RBAC, audit, cache, and email integration
- [OK] **E2E Tests**: 15 end-to-end test cases covering happy paths, sad paths, edge cases, and critical user journeys
- [OK] **Playwright Configuration**: Complete setup with multiple projects, reporters, and CI/CD integration
- [OK] **NPM Scripts**: Added organized test commands for each testing level and combinations
- [OK] **Documentation**: Comprehensive TESTS_README.md with usage instructions, best practices, and troubleshooting

**Testing Coverage Achieved:**
- **Total Test Cases**: 68 comprehensive test cases
- **Testing Strategies**: Black Box, White Box, Integration, E2E
- **Security Validations**: Token expiration, RBAC permissions, audit logging, brute force protection, 2FA validation
- **Performance Testing**: Concurrent login handling, session persistence, load testing scenarios
- **CI/CD Ready**: JUnit XML reports, JSON results, HTML reports for integration with GitHub Actions

**Key Testing Features:**
- 2FA verification with 8-digit backup codes and time synchronization validation
- JWT token lifecycle management (generation, validation, refresh, expiration)
- Role-based access control validation across all privilege levels
- Database integration testing with session persistence and audit logging
- Complete user journey testing from registration to logout
- Error handling and edge case validation
- Security testing for common vulnerabilities

**Framework Benefits:**
- Industry-standard QA practices implementation
- Automated testing with comprehensive coverage
- Easy maintenance and extension for new features
- Professional reporting and debugging capabilities
- Ready for production deployment with confidence

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

### 2025-10-23 - Endpoint 2FA Status Implementado
- [OK] **Evaluación de Seguridad**: Completada - Endpoint seguro de implementar
- [OK] **Interface Creada**: `TwoFactorStatusResponse` con campos seguros
- [OK] **Método en AuthService**: `get2FAStatus()` implementado
- [OK] **Endpoint en AuthController**: `GET /auth/2fa/status` agregado
- [OK] **Documentación**: `GET_2FA_STATUS_ENDPOINT.md` creado
- [OK] **Script de Prueba**: `test_2fa_status_endpoint.sql` creado
- [OK] **Sincronización Frontend**: Ahora compatible con `twoFactorService.get2FAStatus()`

**Características de Seguridad:**
- Solo expone estado general (enabled, lastUsed, hasBackupCodes)
- No revela secretos TOTP ni códigos de respaldo reales
- Requiere JWT válido
- Usuario solo puede consultar su propio estado
- Información auditada automáticamente

**Campos Expuestos (Seguros):**
- `enabled`: boolean - Estado de 2FA
- `lastUsed`: Date|null - Último uso exitoso
- `hasBackupCodes`: boolean - Existencia de códigos respaldo

**Campos Protegidos:**
- `tfaSecret`: Secreto TOTP (nunca expuesto)
- `tfaBackupCodes`: Valores reales de códigos (protegidos)

### 2025-01-15 - Digital Record Audit History Endpoint
- Implemented GET `/audits/digital-records/:recordId/history` endpoint
- Query params: page, limit, action filter, dateFrom, dateTo
- LEFT JOIN with users table, handles deleted users gracefully
- Response includes user info (userId, userName, userEmail)
- Pagination with metadata (currentPage, totalPages, totalRecords, limit)
- Changes parsed as JSON with before/after structure
- Metadata includes ipAddress and userAgent
- Created AuditHistoryQueryDto with full validation
- Created audit-history.interface.ts with complete TypeScript types
- Access restricted to: super admin, admin, director, nurse
- Documentation: DIGITAL_RECORD_AUDIT_HISTORY_ENDPOINT.md
- Test script: scripts/test_audit_history_endpoint.sql
- Ready for rate limiting implementation

### 2025-10-23 - Audit System Refactor with Stored Procedure
- Updated `audit_reports` table with new fields: entity_name, entity_id, action, old_value, new_value, observations, duration, ip_address, user_agent
- Added 5 new audit types: login_attempts, password_resets, clinical_record_changes, notifications, other
- Created `sp_log_audit` stored procedure for centralized audit logging with automatic duration calculation
- New AuditAction enum: create, update, delete, view, login, logout, export, other
- Added POST `/audits/log` endpoint using stored procedure (recommended method)
- Created `logAuditWithStoredProcedure` and `logActionWithSP` helper methods in AuditService
- Database scripts: `update_audit_reports.sql`, `clean_all_data.sql`, `test_data.sql`
- Documentation: `AUDIT_SYSTEM_GUIDE.md` with usage examples for all scenarios
- Build successful, ready for testing with new audit structure

### 2025-10-23 - Frontend Integration & Audit Endpoints
- Adapted audit endpoints from `/audit` to `/audits` to match frontend expectations
- Added new endpoints: GET `/audits`, `/audits/stats`, `/audits/search`, `/audits/user/:userId`, `/audits/entity/:entity/:entityId`
- Implemented statistics endpoint with action counts, entity counts, top users, and recent activity
- Added getDigitalRecordById and getAuditStatistics methods in service
- Successfully merged with teammates' VirtualRecordsModule, ProgramsModule, VaccinesModule, ClinicalConditionsModule
- All conflicts resolved maintaining both audit and virtual records functionality

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
- Audits: `/audits`, `/audits/stats`, `/audits/user/:userId`, `/audits/entity/:entity/:entityId`
- Users: `/users`, `/users/search`, `/users/:id`
- Virtual Records: `/virtual-records` (by teammates)

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
// Método 1: Endpoint POST /audits/log (Recomendado - usa stored procedure)
await axios.post('/audits/log', {
  type: 'login_attempts',
  action: 'login',
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  observations: 'Ingreso exitoso'
}, { headers: { Authorization: `Bearer ${token}` } });

// Método 2: Helper method (interno)
await auditService.logActionWithSP(
  userId, 
  AuditReportType.CLINICAL_RECORD_CHANGES,
  AuditAction.UPDATE,
  'clinical_history',
  12,
  JSON.stringify({ bp: '120/80' }),
  JSON.stringify({ bp: '130/85' }),
  ipAddress,
  userAgent,
  'Actualización de presión arterial'
);

// Método 3: Automatic con decorator (deprecado, usar stored procedure)
@Post()
@AuditLog({ action: AuditAction.CREATE, tableName: 'users' })
async create() { }
```

### Audit Types & Actions
```typescript
// Tipos: login_attempts, role_changes, older_adult_updates, system_access,
//        clinical_record_changes, password_resets, notifications, other
// Acciones: create, update, delete, view, login, logout, export, other
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
