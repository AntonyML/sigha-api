# Backend API endpoints — reference

> All HTTP routes exposed by the backend. **No global prefix** — routes are mounted as-is.
> Base URL: `http://localhost:3000` (dev) — Swagger UI: `http://localhost:3000/api`.
>
> Default: all routes are JWT-protected. Exceptions are marked `@Public()` and listed here.

> ⚠️ This is a curated catalog — for the live API, hit `/api` (Swagger). For a verified list, `grep` the controllers.

---

## Legend

- 🔓 `@Public()` — no JWT required
- 🛡 `Roles(...)` — role-restricted
- ✅ Implemented
- 🟡 Partial
- ❌ Not started

---

## `/auth/*` — Authentication

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/auth/login` | 🔓 | Email + password. Returns `{ requires2fa, accessToken? }` |
| POST | `/auth/verify-2fa` | 🔓 | TOTP or backup code. Returns full JWT. |
| POST | `/auth/refresh` | 🔓 | Refresh token → new access token. |
| POST | `/auth/logout` | 🛡 | Invalidates the current session. |
| POST | `/auth/recovery/request` | 🔓 | "Forgot password" — sends 8-digit code. |
| POST | `/auth/recovery/verify` | 🔓 | Code + email → one-time token. |
| POST | `/auth/recovery/reset` | 🔓 | Token + new password. |
| POST | `/auth/2fa/enable` | 🛡 | Generate TOTP secret + QR. |
| POST | `/auth/2fa/confirm` | 🛡 | Submit first TOTP to activate. |
| POST | `/auth/2fa/disable` | 🛡 | Disable 2FA. |
| POST | `/auth/2fa/regenerate-backup-codes` | 🛡 | New 8 codes, sent by email. |
| GET | `/auth/sessions` | 🛡 | List active sessions for current user. |
| DELETE | `/auth/sessions/:id` | 🛡 | Revoke a session. |

See `docs/auth-flow.md` for the full state machine.

---

## `/users` — Users (staff)

| Method | Path | Notes |
|---|---|---|
| GET | `/users` | List with filters. |
| GET | `/users/:id` | Single user. |
| POST | `/users` | Create. |
| PATCH | `/users/:id` | Update. |
| DELETE | `/users/:id` | Soft delete. |
| GET | `/users/deleted` | List soft-deleted. |
| POST | `/users/:id/restore` | Restore soft-deleted. |
| GET | `/users/profile` | Current user. |
| PATCH | `/users/profile` | Update current user. |

---

## `/roles` — Roles

| Method | Path | Notes |
|---|---|---|
| GET | `/roles` | List. |
| GET | `/roles/:id` | Single. |
| POST | `/roles` | Create (limited to admin). |
| PATCH | `/roles/:id` | Update. |
| DELETE | `/roles/:id` | Soft delete. |

## `/permissions` — Permissions

| Method | Path | Notes |
|---|---|---|
| GET | `/permissions` | List. |
| GET | `/permissions/:id` | Single. |
| POST | `/permissions` | Create. |
| PATCH | `/permissions/:id` | Update. |
| DELETE | `/permissions/:id` | Delete. |

---

## `/entrances-exits` — Access control

| Method | Path | Notes |
|---|---|---|
| GET | `/entrances-exits` | List with date filters. |
| GET | `/entrances-exits/:id` | Single. |
| POST | `/entrances-exits` | Register entrance or exit. |
| GET | `/entrances-exits/today` | Quick "who's in" query. |

---

## `/virtual-records` — Older adults

> The legacy front-end calls these "VirtualFiles" (`/virtualFiles/*`). Backend routes use `virtual-records`.

| Method | Path | Notes |
|---|---|---|
| GET | `/virtual-records` | List (paginated, filtered). |
| GET | `/virtual-records/:id` | Single. |
| POST | `/virtual-records` | Create. |
| PATCH | `/virtual-records/:id` | Update. |
| DELETE | `/virtual-records/:id` | Soft delete. |
| GET | `/virtual-records/:id/family` | Family members. |
| POST | `/virtual-records/:id/family` | Add family member. |
| PATCH | `/virtual-records/:id/family/:familyId` | Update. |
| DELETE | `/virtual-records/:id/family/:familyId` | Remove. |
| GET | `/virtual-records/:id/emergency-contacts` | Contacts. |
| GET | `/virtual-records/:id/clinical-history` | History. |
| GET | `/virtual-records/:id/vaccines` | Vaccines. |
| GET | `/virtual-records/:id/medications` | Medications. |
| GET | `/virtual-records/:id/updates` | Update history. |
| GET | `/virtual-records/:id/sub-programs` | Enrolled sub-programs. |

---

## `/programs` and `/sub-programs`

| Method | Path | Notes |
|---|---|---|
| GET | `/programs` | List. |
| GET | `/programs/:id` | Single. |
| POST | `/programs` | Create. |
| PATCH | `/programs/:id` | Update. |
| DELETE | `/programs/:id` | Delete. |
| GET | `/sub-programs` | List. |
| GET | `/sub-programs/:id` | Single. |
| POST | `/sub-programs` | Create. |
| PATCH | `/sub-programs/:id` | Update. |
| DELETE | `/sub-programs/:id` | Delete. |

---

## `/clinical-conditions` — Clinical conditions

| Method | Path | Notes |
|---|---|---|
| GET | `/clinical-conditions` | List. |
| GET | `/clinical-conditions/:id` | Single. |
| POST | `/clinical-conditions` | Create. |
| PATCH | `/clinical-conditions/:id` | Update. |
| DELETE | `/clinical-conditions/:id` | Delete. |

## `/vaccines` — Vaccines

| Method | Path | Notes |
|---|---|---|
| GET | `/vaccines` | List. |
| GET | `/vaccines/:id` | Single. |
| POST | `/vaccines` | Create. |
| PATCH | `/vaccines/:id` | Update. |
| DELETE | `/vaccines/:id` | Delete. |
| POST | `/vaccines/administrate` | Register dose to a patient. |

---

## `/notifications` — In-app notifications

| Method | Path | Notes |
|---|---|---|
| GET | `/notifications` | List for current user. |
| GET | `/notifications/:id` | Single. |
| POST | `/notifications` | Create. |
| PATCH | `/notifications/:id` | Update (mark read). |
| DELETE | `/notifications/:id` | Delete. |

---

## `/role-changes` — Role change history

| Method | Path | Notes |
|---|---|---|
| GET | `/role-changes` | List. |
| GET | `/role-changes/:id` | Single. |
| GET | `/role-changes/user/:userId` | By user. |
| POST | `/role-changes` | Record a change. |

---

## `/nursing`, `/specialized-appointments`, `/specialized-areas`

| Method | Path | Notes |
|---|---|---|
| GET | `/nursing` | List nursing records. |
| GET | `/nursing/:id` | Single. |
| POST | `/nursing` | Create. |
| PATCH | `/nursing/:id` | Update. |
| DELETE | `/nursing/:id` | Delete. |
| GET | `/nursing/patient/:olderAdultId` | By patient. |
| GET | `/specialized-appointments` | List. |
| GET | `/specialized-appointments/:id` | Single. |
| POST | `/specialized-appointments` | Schedule. |
| PATCH | `/specialized-appointments/:id` | Update (start, complete, cancel). |
| DELETE | `/specialized-appointments/:id` | Cancel. |
| GET | `/specialized-areas` | List. |
| GET | `/specialized-areas/:id` | Single. |
| POST | `/specialized-areas` | Create. |
| PATCH | `/specialized-areas/:id` | Update. |
| DELETE | `/specialized-areas/:id` | Delete. |

---

## `/audits`, `/audit-logs`, `/audit-reports`, `/security-audits`

| Method | Path | Notes |
|---|---|---|
| GET | `/audits` | Audit reports (digital records). |
| GET | `/audits/:id` | Single. |
| GET | `/audit-logs` | Activity logs. |
| GET | `/audit-reports` | Generated reports. |
| POST | `/audit-reports` | Generate. |
| GET | `/security-audits` | Security events. |

---

## `/email` — Transactional email (Resend)

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/email/password-reset` | 🛡 | Send password-reset code. Body: `{ contact: {email, firstName, lastName?}, code, expirationLabel? }`. |
| POST | `/email/backup-codes` | 🛡 | Send 2FA backup codes. Body: `{ contact: {email, firstName, lastName?}, codes: string[] }`. |

Both routes return `{ success: boolean, messageId?: string, error?: string }`.

> Internal call sites: `auth.service.forgotPassword` (password reset) and `auth.service.enable2FA` (backup codes). Both are best-effort: a failed email does not fail the user-facing operation; the failure is recorded in `audit_reports`.

---

## `/notifuse` — **Removed in ÉPICA 1**

The legacy Notifuse module (`NotifuseModule`, `NotifuseService`, `NotifuseHttpService`, `NotifuseController`, `dto/notifuse/*`) was deleted in ÉPICA 1. Its functionality is now provided by `/email/*` (see above) backed by Resend.

---

## Conventions for new endpoints

- Always mount the controller with `@Controller('plural')` (e.g. `users`).
- Use HTTP verbs correctly: `GET` (read), `POST` (create / non-idempotent action), `PATCH` (partial update), `DELETE` (delete).
- Use path params for IDs: `GET /users/:id`.
- Use query params for filters: `GET /users?role=nurse&active=true`.
- Always return DTOs, never raw entities.
- Add Swagger decorators: `@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth`.
- Add the new endpoint to this catalog in the same PR.

---

## Verifying the live API

```bash
# from repo root
curl http://localhost:3000/api-json | jq '.paths | keys'   # list all routes
```

Or open `http://localhost:3000/api` in a browser.
