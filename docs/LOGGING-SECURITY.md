# 🔒 Sanityzación de Datos Sensibles en Logs

**Objetivo:** Prevenir que información sensible (PII/PHI) sea escrita en logs de texto plano.

**Cumplimiento:** Ley 8968 - Protección de Datos Personales (Costa Rica)

---

## ⚠️ ¿Qué se considera dato sensible?

### Datos Personales Identificables (PII)

- **Cédulas de identidad** (formato CR: `1-2345-6789`, `123456789`)
- **Números de teléfono** (`8765-4321`, `2222-3333`)
- **Direcciones de email** (`usuario@ejemplo.com`)
- **Direcciones físicas** (calles, números de casa)
- **Números de pasaporte**
- **Datos financieros** (cuentas bancarias, tarjetas)

### Información de Salud Protegida (PHI)

- **Diagnósticos médicos**
- **Historiales clínicos**
- **Tratamientos**
- **Medicamentos y recetas**
- **Síntomas**
- **Expedientes de pacientes**
- **Condición de pacientes**

### Credenciales de Autenticación

- **Contraseñas** (password, contrasena, clave)
- **Tokens JWT** (accessToken, refreshToken)
- **API Keys y secretos**
- **Tokens de sesión**

---

## 🛡️ Cómo funciona la sanitización

### Función principal: `sanitizeForLogging()`

```typescript
import { sanitizeForLogging } from './common/utils/logger-sanitizer';

// Datos con información sensible
const userData = {
  username: 'juan.perez',
  cedula: '1-2345-6789',
  password: 'hashed_secret',
  profile: {
    name: 'Juan Pérez',
    diagnosis: 'Diabetes Type 2',
    phone: '8888-7777',
  },
};

// Sanitizar antes de loguear
const safeData = sanitizeForLogging(userData);

/*
Resultado:
{
  username: 'juan.perez',        // ✅ No sensible
  cedula: '[REDACTED]',          // 🔒 Redactado
  password: '[REDACTED]',        // 🔒 Redactado
  profile: {
    name: 'Juan Pérez',          // ✅ No sensible
    diagnosis: '[REDACTED]',     // 🔒 Redactado
    phone: '[REDACTED]',         // 🔒 Redactado
  }
}
*/
```

### Campos automáticamente redactados

La lista completa está en `logger-sanitizer.ts`:

```typescript
const SENSITIVE_FIELDS = [
  // Autenticación
  'password', 'contrasena', 'token', 'jwt', 'apiKey', ...
  
  // Identificadores personales
  'cedula', 'identificacion', 'dni', 'pasaporte', ...
  
  // Datos médicos
  'diagnostico', 'tratamiento', 'medicamento', 'paciente', ...
  
  // Contacto
  'telefono', 'email', 'direccion', ...
  
  // Financieros
  'tarjeta', 'cuenta', 'iban', 'sinpe',
];
```

### Detección por patrones

Además de nombres de campos, se detectan patrones en strings:

- ✅ **Cédulas CR:** `/\d{1,3}-?\d{4,6}-?\d{1,4}/`
- ✅ **Emails:** `/\w+@\w+\.\w+/`
- ✅ **Teléfonos CR:** `/\d{4}-?\d{4}/`
- ✅ **JWTs:** `/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\./`

---

## 📝 Uso en servicios

### Ejemplo 1: LoggerService con sanitización automática

```typescript
import { LoggerService } from '../../common/services/logger.service';
import { sanitizeForLogging } from '../../common/utils/logger-sanitizer';

@Injectable()
export class UserService {
  constructor(private logger: LoggerService) {}

  async createUser(userData: CreateUserDto) {
    try {
      // ... lógica de creación
      
      // ✅ CORRECTO: Sanitizar antes de loguear
      this.logger.info('User created successfully', {
        userId: savedUser.id,
        data: sanitizeForLogging(userData), // ← Sanitizado
      });
      
      // ❌ INCORRECTO: Loguear datos sin sanitizar
      // this.logger.info('User created', { data: userData });
      
    } catch (error) {
      // Los errores también deben sanitizarse
      this.logger.error('Error creating user', {
        error: error.message,
        userData: sanitizeForLogging(userData),
      });
    }
  }
}
```

### Ejemplo 2: LoggingInterceptor con sanitización opcional

```typescript
// Configuración para habilitar logging de bodies con sanitización
const LOG_REQUEST_BODY = process.env.LOG_REQUEST_BODY === 'true';

if (LOG_REQUEST_BODY && request.body) {
  this.logger.log('http', 'Request body', {
    body: sanitizeForLogging(request.body), // ← Siempre sanitizar
  });
}
```

### Ejemplo 3: Excepciones y errores

```typescript
catch (error) {
  this.logger.error('Database operation failed', {
    error: error.message,
    stack: error.stack,
    // Sanitizar query parameters si contienen datos sensibles
    query: sanitizeForLogging(error.query),
    params: sanitizeForLogging(error.parameters),
  });
}
```

---

## 🔧 Configuración por ambiente

### Desarrollo (`.env`)

```bash
# Habilitar logging más verboso (con sanitización)
LOG_LEVEL=debug
LOG_REQUEST_BODY=true
```

### Producción (`.env.production`)

```bash
# Logs más conservadores
LOG_LEVEL=info
LOG_REQUEST_BODY=false

# Audit logs siempre activados para compliance
LOG_AUDIT=true
```

---

## ✅ Lista de verificación antes de commit

Antes de commitear código que loguea datos:

- [ ] ¿Estoy logueando un objeto con datos de usuario?
  - → Usar `sanitizeForLogging(obj)`
  
- [ ] ¿Estoy logueando error.stack que podría contener datos sensibles?
  - → El logger ya maneja esto, pero verificar query parameters
  
- [ ] ¿Estoy logueando req.body o res.body completo?
  - → Usar sanitización O loguear solo campos específicos no sensibles
  
- [ ] ¿Los logs de auditoría contienen PII/PHI?
  - → Los audit logs van a archivo separado (90 días), pero igual deben sanitizarse
  
- [ ] ¿Hay datos sensibles en los mensajes de error de TypeORM?
  - → Sanitizar `error.query` y `error.parameters`

---

## 🚨 Ejemplos de lo que NO hacer

### ❌ Mal: Loguear datos sin sanitizar

```typescript
// NUNCA hacer esto
this.logger.info('Login attempt', { user: req.body });
// req.body podría tener: { cedula: '1-1111-1111', password: 'secret' }

// NUNCA hacer esto
this.logger.error('Query failed', { query: error.query });
// error.query podría tener: SELECT * FROM users WHERE cedula = '1-2345-6789'
```

### ✅ Bien: Sanitizar siempre

```typescript
// SIEMPRE hacer esto
this.logger.info('Login attempt', {
  body: sanitizeForLogging(req.body),
});

// SIEMPRE hacer esto
this.logger.error('Query failed', {
  query: sanitizeForLogging({ sql: error.query }),
});
```

---

## 📊 Campos sanitizados por defecto

| Categoría | Campos | Ejemplo |
|-----------|--------|---------|
| **Autenticación** | password, token, jwt, apiKey | `password: '[REDACTED]'` |
| **Identificación** | cedula, dni, pasaporte | `cedula: '[REDACTED]'` |
| **Médicos** | diagnostico, tratamiento, paciente | `diagnosis: '[REDACTED]'` |
| **Contacto** | email, telefono, direccion | `email: '[REDACTED]'` |
| **Financieros** | tarjeta, cuenta, sinpe | `account: '[REDACTED]'` |

---

## 🧪 Tests

Los tests de sanitización están en:
- `src/common/utils/logger-sanitizer.spec.ts`

Ejecutar tests:
```bash
npm test -- logger-sanitizer.spec.ts
```

---

## 📚 Referencias

- **Ley 8968:** Protección de Datos Personales (Costa Rica)
- **HIPAA:** Health Insurance Portability and Accountability Act (EE.UU.)
- **GDPR:** General Data Protection Regulation (UE)

---

**Última actualización:** 2026-07-07  
**Author:** SIGHA Security Team