# TypeORM entities — reference

> All entities referenced by `src/ucr/ac/cr/ie/database.providers.ts`. The list below is the source of truth for what TypeORM knows about.
>
> **Rule: every new entity MUST be added to the `entities` array in `database.providers.ts`.**

> ✅ **ÉPICA 2:** The driver is now `postgres` (was `mysql`). The connection options builder lives in `database.providers.ts` and supports `DATABASE_URL` or discrete `DB_*` env vars. See AGENTS.md §7.

---

## Registered (29)

> Source: `src/ucr/ac/cr/ie/database.providers.ts` (entity list, ~29 entries).

| # | Entity class | File | Maps to table |
|---|---|---|---|
| 1 | `User` | `domain/auth/core/user.entity.ts` | `users` |
| 2 | `Role` | `domain/auth/core/role.entity.ts` | `roles` |
| 3 | `UserSession` | `domain/auth/sessions/user-session.entity.ts` | `user_sessions` |
| 4 | `UserTwoFactor` | `domain/auth/security/user-two-factor.entity.ts` | `user_two_factor` |
| 5 | `LoginAttempt` | `domain/auth/security/login-attempt.entity.ts` | `login_attempts` |
| 6 | `PasswordResetToken` | `domain/auth/tokens/password-reset-token.entity.ts` | `password_reset_tokens` |
| 7 | `EmailVerificationToken` | `domain/auth/tokens/email-verification-token.entity.ts` | `email_verification_tokens` |
| 8 | `EntranceExit` | `domain/entrances-exits/entrance-exit.entity.ts` | `entrances_exits` |
| 9 | `RoleChange` | `domain/roles/role-change.entity.ts` | `role_changes` |
| 10 | `AuditReport` | `domain/audit/audit-report.entity.ts` | `audit_reports` |
| 11 | `DigitalRecord` | `domain/audit/digital-record.entity.ts` | `digital_records` |
| 12 | `OlderAdultUpdate` | `domain/audit/older-adult-update.entity.ts` | `older_adult_updates` |
| 13 | `Program` | `domain/virtual-records/program.entity.ts` | `programs` |
| 14 | `SubProgram` | `domain/virtual-records/sub-program.entity.ts` | `sub_programs` |
| 15 | `OlderAdult` | `domain/virtual-records/older-adult.entity.ts` | `older_adult` |
| 16 | `OlderAdultFamily` | `domain/virtual-records/older-adult-family.entity.ts` | `older_adult_family` |
| 17 | `ClinicalHistory` | `domain/virtual-records/clinical-history.entity.ts` | `clinical_history` |
| 18 | `ClinicalCondition` | `domain/virtual-records/clinical-condition.entity.ts` | `clinical_conditions` |
| 19 | `Vaccine` | `domain/virtual-records/vaccine.entity.ts` | `vaccines` |
| 20 | `ClinicalMedication` | `domain/virtual-records/clinical-medication.entity.ts` | `clinical_medications` |
| 21 | `ClinicalHistoryAndCondition` | `domain/virtual-records/clinical-history-and-condition.entity.ts` | `clinical_history_and_condition` |
| 22 | `VaccinesAndClinicalHistory` | `domain/virtual-records/vaccines-and-clinical-history.entity.ts` | `vaccines_and_clinical_history` |
| 23 | `OlderAdultSubprogram` | `domain/virtual-records/older-adult-subprogram.entity.ts` | `older_adult_subprogram` |
| 24 | `EmergencyContact` | `domain/virtual-records/emergency-contact.entity.ts` | `emergency_contacts` |
| 25 | `Notification` | `domain/notifications/notification.entity.ts` | `notifications` |
| 26 | `NotificationAttachment` | `domain/notifications/notification-attachment.entity.ts` | `notification_attachments` |
| 27 | `SpecializedArea` | `domain/nursing/specialized-area.entity.ts` | `specialized_areas` |
| 28 | `SpecializedAppointment` | `domain/nursing/specialized-appointment.entity.ts` | `specialized_appointments` |
| 29 | `NursingRecord` | `domain/nursing/nursing-record.entity.ts` | `nursing_records` |

> The `medical_record` table is also defined in the Postgres migrations (006) but the corresponding TypeORM entity file is not yet present in `domain/`. Verify and add it.

---

## Missing from `database.providers.ts` (per ÉPICA 4)

> These entity files MAY exist under `src/ucr/ac/cr/ie/domain/...` but are NOT in the entities array. Verify before assuming.

| Candidate | Likely path | Notes |
|---|---|---|
| `PhysiotherapySession` | `domain/nursing/physiotherapy-session.entity.ts` | Verify if exists |
| `PsychologySession` | `domain/nursing/psychology-session.entity.ts` | Verify if exists |
| `SocialWorkReport` | `domain/nursing/social-work-report.entity.ts` | Verify if exists |
| `MedicalRecord` | `domain/.../medical-record.entity.ts` | Tables exist in 006 migration; entity not present |
| `AuditLog` | `domain/.../audit-log.entity.ts` (audit-logs module) | |
| `SecurityEvent` | `domain/.../security-event.entity.ts` (security-audit module) | |
| `ActivityLog` | `domain/.../activity-log.entity.ts` (activity-logs module) | |
| `SystemEvent` | `domain/.../system-event.entity.ts` (system-audit module) | |

> 📋 **Task:** Audit `src/ucr/ac/cr/ie/domain/` to find entity files that exist but are not registered. Add them to the entities array.

---

## Conventions

- Entity file name: `<thing>.entity.ts`.
- Class name: singular PascalCase (`OlderAdult`, NOT `OlderAdultEntity`).
- Table name: snake_case, plural or plural-ish (`older_adult` is singular — legacy!).
- Timestamps: `create_at`, `update_at` (legacy spelling).
- Soft deletes: use `u_is_active` boolean where present; do not use `deleteAt` unless consistent with DB.

---

## Verifying the registry

```bash
# from backend root
grep -n "entities" src/ucr/ac/cr/ie/database.providers.ts
```

You should see 29 import lines + 29 entries in the `entities: [...]` array.

---

## Adding a new entity — checklist

1. Create the entity file in the appropriate `domain/<area>/` folder.
2. Add a row to the "Registered" table above.
3. Add the import + entry to `database.providers.ts`.
4. Add the SQL definition to `database_mysql_hogar_de_ancianos/supabase/migrations/00N_*.sql` (or the legacy `scriptDBCompleta.sql`).
5. Create a DTO in `dto/<area>/`.
6. Create a service in `services/<area>/`.
7. Create a controller in `controller/<area>/`.
8. Register the module in `app.module.ts` (if new module).
9. Write a `*.spec.ts` for the service.
10. Update `docs/modules.md` and `docs/api-endpoints.md`.
