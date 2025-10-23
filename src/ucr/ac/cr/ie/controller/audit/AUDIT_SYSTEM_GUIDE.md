# Sistema de Auditoría Actualizado - Guía de Uso

## Cambios Implementados

### 1. Nueva Estructura de Tabla `audit_reports`

Se actualizó la tabla con los siguientes campos adicionales:

- `ar_entity_name`: Nombre de la tabla o entidad afectada
- `ar_entity_id`: ID del registro afectado
- `ar_action`: Acción realizada (create, update, delete, view, login, logout, export, other)
- `ar_old_value`: Valor anterior (para actualizaciones)
- `ar_new_value`: Valor nuevo (para actualizaciones)
- `ar_observations`: Observaciones adicionales
- `ar_duration_seconds`: Duración de la acción en segundos
- `ar_ip_address`: IP desde donde se realizó la acción
- `ar_user_agent`: Información del navegador/aplicación

### 2. Nuevos Tipos de Auditoría

```typescript
enum AuditReportType {
  GENERAL_ACTIONS = 'general_actions',
  ROLE_CHANGES = 'role_changes',
  OLDER_ADULT_UPDATES = 'older_adult_updates',
  SYSTEM_ACCESS = 'system_access',
  LOGIN_ATTEMPTS = 'login_attempts',           // NUEVO
  PASSWORD_RESETS = 'password_resets',         // NUEVO
  CLINICAL_RECORD_CHANGES = 'clinical_record_changes', // NUEVO
  NOTIFICATIONS = 'notifications',              // NUEVO
  OTHER = 'other'
}
```

### 3. Stored Procedure `sp_log_audit`

Procedimiento almacenado para logging centralizado de auditoría.

## Uso desde el Backend (NestJS)

### Método 1: Endpoint POST /audits/log (Recomendado)

```typescript
// Ejemplo desde otro servicio o controlador

// Login exitoso
await axios.post('/audits/log', {
  type: 'login_attempts',
  entityName: 'users',
  action: 'login',
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  observations: 'Ingreso exitoso al sistema'
}, {
  headers: { Authorization: `Bearer ${token}` }
});

// Logout
await axios.post('/audits/log', {
  type: 'login_attempts',
  action: 'logout',
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  observations: 'Cierre de sesión'
}, {
  headers: { Authorization: `Bearer ${token}` }
});

// Cambio de rol
await axios.post('/audits/log', {
  type: 'role_changes',
  entityName: 'users',
  entityId: 2,
  action: 'update',
  oldValue: 'user',
  newValue: 'admin',
  observations: 'Cambio de rol a admin'
}, {
  headers: { Authorization: `Bearer ${token}` }
});

// Actualización de adulto mayor
await axios.post('/audits/log', {
  type: 'older_adult_updates',
  entityName: 'older_adult',
  entityId: 5,
  action: 'update',
  oldValue: JSON.stringify({ age: 70, weight: 75 }),
  newValue: JSON.stringify({ age: 71, weight: 76 }),
  observations: 'Actualización de datos biométricos'
}, {
  headers: { Authorization: `Bearer ${token}` }
});

// Ver registro clínico
await axios.post('/audits/log', {
  type: 'system_access',
  entityName: 'clinical_history',
  entityId: 10,
  action: 'view',
  observations: 'Consultó historial clínico del paciente'
}, {
  headers: { Authorization: `Bearer ${token}` }
});

// Cambio en registro clínico
await axios.post('/audits/log', {
  type: 'clinical_record_changes',
  entityName: 'clinical_history',
  entityId: 12,
  action: 'update',
  oldValue: JSON.stringify({ blood_pressure: '120/80' }),
  newValue: JSON.stringify({ blood_pressure: '130/85' }),
  observations: 'Actualización de presión arterial'
}, {
  headers: { Authorization: `Bearer ${token}` }
});

// Reseteo de contraseña
await axios.post('/audits/log', {
  type: 'password_resets',
  entityName: 'users',
  entityId: 5,
  action: 'update',
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  observations: 'Reseteo de contraseña solicitado'
}, {
  headers: { Authorization: `Bearer ${token}` }
});

// Crear notificación
await axios.post('/audits/log', {
  type: 'notifications',
  entityName: 'notifications',
  entityId: 100,
  action: 'create',
  newValue: JSON.stringify({ title: 'Recordatorio cita', recipient: 'user@example.com' }),
  observations: 'Notificación de recordatorio enviada'
}, {
  headers: { Authorization: `Bearer ${token}` }
});

// Exportar datos
await axios.post('/audits/log', {
  type: 'general_actions',
  entityName: 'medical_records',
  action: 'export',
  observations: 'Exportó reportes médicos del mes de octubre'
}, {
  headers: { Authorization: `Bearer ${token}` }
});

// Eliminar registro
await axios.post('/audits/log', {
  type: 'general_actions',
  entityName: 'older_adult',
  entityId: 15,
  action: 'delete',
  oldValue: JSON.stringify({ name: 'Juan Pérez', identification: '123456789' }),
  observations: 'Eliminó registro de adulto mayor por duplicado'
}, {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Método 2: Llamada directa desde un servicio

```typescript
import { AuditService } from './services/audit/audit.service';
import { AuditReportType, AuditAction } from './domain/audit';

@Injectable()
export class YourService {
  constructor(private readonly auditService: AuditService) {}

  async someMethod(userId: number) {
    // Usar el helper method
    await this.auditService.logActionWithSP(
      userId,
      AuditReportType.CLINICAL_RECORD_CHANGES,
      AuditAction.UPDATE,
      'clinical_history',
      12,
      JSON.stringify({ blood_pressure: '120/80' }),
      JSON.stringify({ blood_pressure: '130/85' }),
      '192.168.1.10',
      'Mozilla/5.0',
      'Actualización de presión arterial'
    );
  }
}
```

### Método 3: Llamada directa al stored procedure

```typescript
// Desde cualquier servicio con acceso a Repository
await this.repository.query(
  `CALL sp_log_audit(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    userId,                    // p_user_id
    'login_attempts',          // p_type
    'users',                   // p_entity_name
    null,                      // p_entity_id
    'login',                   // p_action
    null,                      // p_old_value
    null,                      // p_new_value
    '192.168.1.10',           // p_ip
    'Chrome',                  // p_user_agent
    'Ingreso exitoso'         // p_observations
  ]
);
```

## Uso desde MySQL Directo

```sql
-- Login
CALL sp_log_audit(1, 'login_attempts', 'users', NULL, 'login', NULL, NULL, '192.168.1.10', 'Chrome', 'Ingreso exitoso');

-- Logout
CALL sp_log_audit(1, 'login_attempts', 'users', NULL, 'logout', NULL, NULL, '192.168.1.10', 'Chrome', 'Cierre de sesión');

-- Cambio de rol
CALL sp_log_audit(1, 'role_changes', 'users', 2, 'update', 'user', 'admin', NULL, NULL, 'Cambio de rol');

-- Actualización de adulto mayor
CALL sp_log_audit(1, 'older_adult_updates', 'older_adult', 5, 'update', '{"age": 70}', '{"age": 71}', NULL, NULL, 'Actualización');

-- Ver registro
CALL sp_log_audit(1, 'system_access', 'medication', 10, 'view', NULL, NULL, NULL, NULL, 'Visualizó medicación');
```

## Consultas de Auditoría

### GET /audits/stats
Obtener estadísticas de auditoría

```typescript
// Estadísticas generales
GET /audits/stats

// Estadísticas por rango de fechas
GET /audits/stats?startDate=2025-10-01&endDate=2025-10-31

// Respuesta:
{
  "totalActions": 150,
  "actionsByType": {
    "login": 45,
    "logout": 43,
    "update": 32,
    "view": 20,
    "create": 10
  },
  "actionsByEntity": {
    "users": 88,
    "older_adult": 35,
    "clinical_history": 27
  },
  "topUsers": [
    { "userId": 1, "username": "Carlos Rodríguez", "actionCount": 45 },
    { "userId": 2, "username": "María González", "actionCount": 32 }
  ],
  "recentActivity": [...]
}
```

### GET /audits
Buscar registros de auditoría con filtros

```typescript
// Buscar por usuario
GET /audits?userId=1&page=1&limit=20

// Buscar por acción
GET /audits?action=login&startDate=2025-10-01

// Buscar por entidad
GET /audits/entity/older_adult/5

// Buscar por usuario específico
GET /audits/user/1
```

## Mejores Prácticas

1. **Usar el endpoint `/audits/log`** para logging de auditoría en producción
2. **Incluir siempre `ipAddress` y `userAgent`** cuando esté disponible
3. **Usar JSON para `oldValue` y `newValue`** en actualizaciones complejas
4. **Ser descriptivo en `observations`** para facilitar auditorías futuras
5. **Usar el tipo de auditoría correcto** para facilitar reportes y búsquedas

## Tipos de Acciones por Contexto

| Contexto | Tipo de Auditoría | Acción |
|----------|-------------------|--------|
| Login/Logout | `login_attempts` | `login`, `logout` |
| Cambios de rol | `role_changes` | `update` |
| Actualizar paciente | `older_adult_updates` | `update` |
| Ver expediente | `system_access` | `view` |
| Modificar clínica | `clinical_record_changes` | `update`, `create` |
| Resetear password | `password_resets` | `update` |
| Enviar notificación | `notifications` | `create` |
| Exportar datos | `general_actions` | `export` |
| Eliminar registro | `general_actions` | `delete` |

## Instalación

1. Ejecutar el script de actualización:
```bash
mysql -u root -p hogar_de_ancianos < update_audit_reports.sql
```

2. El backend ya está actualizado con los nuevos endpoints y métodos

3. Probar el endpoint:
```bash
POST http://localhost:3000/audits/log
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "login_attempts",
  "action": "login",
  "ipAddress": "192.168.1.10",
  "userAgent": "Mozilla/5.0",
  "observations": "Ingreso de prueba"
}
```
