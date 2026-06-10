# Backend modules — reference

> Every NestJS module registered in `src/app.module.ts`, plus the standalone modules in `src/ucr/ac/cr/ie/modules/...` that are NOT yet imported.
>
> **For a complete endpoint catalog, see `docs/api-endpoints.md`.**

---

## Currently registered (`src/app.module.ts`)

| # | Module | File | Responsibility | Key controllers / services | Status |
|---|---|---|---|---|---|
| 1 | `DatabaseModule` | `src/ucr/ac/cr/ie/database.module.ts` | TypeORM connection lifecycle | `database.providers.ts` | ✅ |
| 2 | `AuthModule` | `src/ucr/ac/cr/ie/auth.module.ts` | login, 2FA, password recovery, sessions, JWT issuance | `auth.controller.ts`, `auth.service.ts`, `jwt.service.ts`, `two-factor.service.ts`, `password-recovery.service.ts`, `session.service.ts` | ✅ |
| 3 | `UsersModule` | `src/ucr/ac/cr/ie/users.module.ts` | user CRUD, soft delete, profile | `users.controller.ts`, `users.service.ts` | ✅ |
| 4 | `RolesModule` | `src/ucr/ac/cr/ie/roles.module.ts` | role CRUD | `roles.controller.ts`, `roles.service.ts` | ✅ |
| 5 | `EntrancesExitsModule` | `src/ucr/ac/cr/ie/entrances-exits.module.ts` | entrance/exit events | `entrances-exits.controller.ts`, `entrances-exits.service.ts` | ✅ |
| 6 | `AuditModule` | `src/ucr/ac/cr/ie/audit.module.ts` | digital record + older adult updates audit | `audit.controller.ts`, `audit.service.ts` | ✅ |
| 7 | `VirtualRecordsModule` | `src/ucr/ac/cr/ie/virtual-records.module.ts` | older adults, family, emergency contacts, clinical history, conditions, vaccines, medications, sub-programs | multiple controllers + services | ✅ |
| 8 | `ProgramsModule` | `src/ucr/ac/cr/ie/programs.module.ts` | programs + sub-programs | `program.controller.ts`, `sub-program.controller.ts` | ✅ |
| 9 | `ClinicalConditionsModule` | `src/ucr/ac/cr/ie/clinical-conditions.module.ts` | clinical conditions | `clinical-conditions.controller.ts`, `clinical-conditions.service.ts` | ✅ |
| 10 | `VaccinesModule` | `src/ucr/js/vaccines.module.ts` | vaccines (admin + history) | `vaccines.controller.ts`, `vaccines.service.ts` | ✅ |
| 11 | `EmailModule` | `src/ucr/ac/cr/ie/email.module.ts` | Transactional email via Resend (`/email/password-reset`, `/email/backup-codes`) | `email.controller.ts`, `email.service.ts`, `resend.service.ts`, `services/email/templates/*` | ✅ (ÉPICA 1 done) |
| 12 | `NotificationsModule` | `src/ucr/ac/cr/ie/notifications.module.ts` | in-app notifications + attachments | `notifications.controller.ts`, `notifications.service.ts` | ✅ |
| 13 | `RoleChangesModule` | `src/ucr/ac/cr/ie/role-changes.module.ts` | role change history | `role-changes.controller.ts`, `role-changes.service.ts` | ✅ |
| 14 | `AuditLogsModule` | `src/ucr/ac/cr/ie/modules/audit-logs/audit-logs.module.ts` | activity log writes | `audit-logs.service.ts` | ✅ |
| 15 | `AuditReportsModule` | `src/ucr/ac/cr/ie/modules/audit-reports/audit-reports.module.ts` | audit reports generation | `audit-reports.service.ts`, `audit-reports.controller.ts` | ✅ |
| 16 | `SecurityAuditModule` | `src/ucr/ac/cr/ie/modules/security-audit/security-audit.module.ts` | security events | `security-audit.service.ts`, `security-audit.controller.ts` | ✅ |
| 17 | `NursingModule` | `src/ucr/ac/cr/ie/nursing.module.ts` | nursing records + specialized appointments + specialized areas | `nursing.controller.ts`, `specialized-appointments.controller.ts`, `specialized-areas.controller.ts`, related services | ✅ |

---

## Standalone modules NOT in `app.module.ts` (must be wired up)

These exist under `src/ucr/ac/cr/ie/modules/...` but are NOT imported in `app.module.ts`. They are part of **ÉPICA 4**.

| # | Module | File | Missing work |
|---|---|---|---|
| 18 | `ActivityLogsModule` | `src/ucr/ac/cr/ie/modules/activity-logs/activity-logs.module.ts` | register in `app.module.ts`; create entity if missing |
| 19 | `SessionManagementModule` | `src/ucr/ac/cr/ie/modules/session-management/session-management.module.ts` | register in `app.module.ts`; expose user-facing endpoints to list/revoke active sessions |
| 20 | `SystemAuditModule` | `src/ucr/ac/cr/ie/modules/system-audit/system-audit.module.ts` | register in `app.module.ts` |

---

## Domain entities (high-level)

| Module | Domain folder | Entities |
|---|---|---|
| Auth | `domain/auth/core/` | `User`, `Role` |
| Auth sessions | `domain/auth/sessions/` | `UserSession` |
| Auth security | `domain/auth/security/` | `UserTwoFactor`, `LoginAttempt` |
| Auth tokens | `domain/auth/tokens/` | `PasswordResetToken`, `EmailVerificationToken` |
| Entrances / exits | `domain/entrances-exits/` | `EntranceExit` |
| Roles | `domain/roles/` | `RoleChange` |
| Audit | `domain/audit/` | `AuditReport`, `DigitalRecord`, `OlderAdultUpdate` |
| Virtual records | `domain/virtual-records/` | `Program`, `SubProgram`, `OlderAdult`, `OlderAdultFamily`, `ClinicalHistory`, `ClinicalCondition`, `Vaccine`, `ClinicalMedication`, `ClinicalHistoryAndCondition`, `VaccinesAndClinicalHistory`, `OlderAdultSubprogram`, `EmergencyContact` |
| Notifications | `domain/notifications/` | `Notification`, `NotificationAttachment` |
| Nursing | `domain/nursing/` | `SpecializedArea`, `SpecializedAppointment`, `NursingRecord` |

See `docs/entities.md` for the full TypeORM registration status.

---

## Module responsibility matrix (one-liner each)

- **AuthModule:** "Who is this user? Is their 2FA valid? Can they reset their password?"
- **UsersModule:** "CRUD of the staff accounts, with soft delete."
- **RolesModule:** "What role does a user have? What permissions does a role grant?"
- **EntrancesExitsModule:** "Who went in or out of the home, and when?"
- **AuditModule:** "What did the system do, and when, and why?" (Digital records + older-adult update history.)
- **VirtualRecordsModule:** "Everything about an adult mayor: profile, family, contacts, history, conditions, vaccines, meds, programs."
- **ProgramsModule:** "Activities of the home. Adults mayores join sub-programs."
- **ClinicalConditionsModule:** "List of clinical conditions an adult mayor may have."
- **VaccinesModule:** "Vaccine catalog + per-adult vaccine history."
- **NotifuseModule (legacy):** "Send transactional email through the Notifuse service."
- **NotificationsModule:** "In-app notification feed."
- **RoleChangesModule:** "Bitácora de cambios de rol de un usuario."
- **AuditLogsModule / SystemAuditModule / SecurityAuditModule:** "Granular activity / system / security logs."
- **AuditReportsModule:** "Generate audit reports for compliance."
- **NursingModule:** "Nursing records + appointments to physiotherapy, psychology, social work, etc."
