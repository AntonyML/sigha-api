# Audit Module - Hogar de Ancianos Backend

## Overview

Complete audit module for tracking system actions, user changes, and generating comprehensive audit reports.

## Features

- **Digital Records**: Automatic and manual logging of system actions
- **Older Adult Updates Tracking**: Track all changes to older adult records
- **Audit Reports**: Generate comprehensive reports by type and date range
- **Audit Log Interceptor**: Automatic logging decorator for controllers
- **Role-based Access**: Secure endpoints with RBAC
- **Pagination Support**: Efficient data retrieval with pagination

## Database Tables

### digital_record
Tracks all user actions in the system:
- `dr_action`: login, logout, create, update, delete, view, export, other
- `dr_table_name`: Table affected by the action
- `dr_record_id`: ID of the affected record
- `dr_description`: Description of the action
- `dr_timestamp`: When the action occurred

### audit_reports
Stores generated audit reports:
- `ar_audit_number`: Sequential audit report number
- `ar_type`: general_actions, role_changes, older_adult_updates, system_access, other
- `ar_start_date` / `ar_end_date`: Report date range
- `id_generator`: User who generated the report

### older_adult_updates
Tracks changes to older adult records:
- `oau_field_changed`: Field that was modified
- `oau_old_value` / `oau_new_value`: Before and after values
- `id_older_adult`: ID of the older adult
- `changed_by`: User who made the change

## API Endpoints

### Main Audit Endpoints

**GET** `/audits`
- Get all audit records with pagination and filtering
- Roles: super admin, admin, director
- Query: `SearchDigitalRecordsDto` (userId, action, tableName, recordId, dates, page, limit, sortBy, sortOrder)

**GET** `/audits/:id`
- Get a specific audit record by ID
- Roles: super admin, admin, director

**POST** `/audits`
- Create a manual audit log entry
- Roles: super admin, admin, director
- Body: `CreateDigitalRecordDto`

**GET** `/audits/stats`
- Get audit statistics (total actions, by type, by entity, top users, recent activity)
- Roles: super admin, admin, director
- Query: `startDate`, `endDate` (optional)

**GET** `/audits/search`
- Search audit records with advanced filters
- Roles: super admin, admin, director
- Query: `SearchDigitalRecordsDto`

**GET** `/audits/user/:userId`
- Get all audit records for a specific user
- Roles: super admin, admin, director
- Query: `SearchDigitalRecordsDto` (optional pagination/filtering)

**GET** `/audits/entity/:entity/:entityId`
- Get all audit records for a specific entity
- Roles: super admin, admin, director
- Params: `entity` (table name), `entityId` (record ID)
- Query: `SearchDigitalRecordsDto` (optional)

### Older Adult Updates

**GET** `/audits/older-adult-updates`
- Search older adult change history
- Roles: super admin, admin, director, nurse, physiotherapist, psychologist, social worker
- Query: `SearchOlderAdultUpdatesDto` (olderAdultId, fieldChanged, changedBy, dates, pagination)

### Audit Reports

**POST** `/audits/reports`
- Generate a new audit report
- Roles: super admin, admin, director
- Body: `GenerateAuditReportDto` (type, startDate, endDate)

**GET** `/audits/reports`
- Get all audit reports
- Roles: super admin, admin, director
- Query: `AuditReportFilterDto` (type, dates)

**GET** `/audits/reports/:id`
- Get detailed audit report with data
- Roles: super admin, admin, director

**DELETE** `/audits/reports/:id`
- Delete an audit report
- Roles: super admin only

## Usage Examples

### Manual Audit Logging

```typescript
import { AuditService } from './services/audit';
import { AuditAction } from './domain/audit';

// In your service
constructor(private auditService: AuditService) {}

async someAction(userId: number) {
  // ... your logic ...
  
  await this.auditService.logAction(
    userId,
    AuditAction.CREATE,
    'older_adult',
    newRecordId,
    'Created new older adult with identification 123456789'
  );
}
```

### Automatic Audit Logging with Decorator

```typescript
import { Controller, Post, UseInterceptors } from '@nestjs/common';
import { AuditLog, AuditLogInterceptor } from './common';
import { AuditAction } from './domain/audit';

@Controller('users')
@UseInterceptors(AuditLogInterceptor)
export class UserController {
  
  @Post()
  @AuditLog({
    action: AuditAction.CREATE,
    tableName: 'users',
    description: 'Created new user'
  })
  async createUser(@Body() createDto: CreateUserDto) {
    // Your logic - audit log will be created automatically
    return this.userService.create(createDto);
  }
}
```

### Generate Audit Report

```typescript
POST /audits/reports
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "type": "general_actions",
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": "2025-01-31T23:59:59.999Z"
}
```

### Search Digital Records

```typescript
GET /audits?userId=1&action=create&startDate=2025-01-01&page=1&limit=50
Authorization: Bearer <jwt_token>
```

### Get Audit Statistics

```typescript
GET /audits/stats?startDate=2025-01-01&endDate=2025-01-31
Authorization: Bearer <jwt_token>
```

### Get Audits by User

```typescript
GET /audits/user/1?page=1&limit=25
Authorization: Bearer <jwt_token>
```

### Get Audits by Entity

```typescript
GET /audits/entity/older_adult/123?page=1&limit=25
Authorization: Bearer <jwt_token>
```

## Report Types

- **general_actions**: All digital records (logins, CRUD operations)
- **role_changes**: User role modifications
- **older_adult_updates**: Changes to older adult data
- **system_access**: Login attempts and authentication events
- **other**: Custom report type

## Integration with Other Modules

The audit module is automatically integrated with:
- Authentication module (login/logout tracking)
- Users module (user changes)
- Roles module (role changes)
- All modules using AuditLog decorator

## Security

- All endpoints protected with JWT authentication
- Role-based access control
- Super admin required for report deletion
- Audit logs are immutable (no update or delete endpoints for digital records)

## Future Enhancements

- PDF export for audit reports
- Email notifications for suspicious activities
- Real-time audit log streaming
- Advanced filtering and search
- Audit log retention policies
- Compliance report templates (HIPAA, GDPR)
