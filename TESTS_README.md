# 🧪 Framework de Pruebas QA - Módulo de Autenticación

## 📋 Descripción

Este framework implementa una estrategia completa de pruebas QA para el módulo de autenticación del sistema **Hogar de Ancianos**, utilizando **Playwright** como herramienta principal. El framework está estructurado siguiendo las mejores prácticas de testing con separación clara entre diferentes niveles de pruebas.

## 🏗️ Arquitectura de Pruebas

```
tests/
├── black-box/           # Pruebas de caja negra (funcionales)
│   └── auth/
│       └── auth-black-box.spec.ts
├── white-box/           # Pruebas de caja blanca (estructurales)
│   └── auth/
│       └── auth-white-box.spec.ts
├── integration/         # Pruebas de integración
│   └── auth/
│       └── auth-integration.spec.ts
├── e2e/                 # Pruebas End-to-End
│   └── auth/
│       └── auth-e2e.spec.ts
└── utils/               # Utilidades compartidas
    └── auth-test-utils.ts
```

## 🎯 Estrategias de Prueba Implementadas

### 1. Black Box Testing (Caja Negra)
- **Enfoque**: Pruebas funcionales sin conocimiento del código interno
- **Técnicas**:
  - Equivalence Partitioning
  - Boundary Value Analysis
  - Decision Tables
  - State Transition Testing
- **Casos**: 15 pruebas funcionales

### 2. White Box Testing (Caja Blanca)
- **Enfoque**: Pruebas estructurales con conocimiento del código interno
- **Técnicas**:
  - Path Coverage
  - Statement Coverage
  - Branch Coverage
  - Condition Coverage
  - Multiple Condition Coverage
- **Casos**: 17 pruebas estructurales

### 3. Integration Testing (Pruebas de Integración)
- **Enfoque**: Verificar interacción entre módulos
- **Técnicas**:
  - Component Integration Testing
  - System Integration Testing
  - Database Integration
  - Service Integration
- **Casos**: 21 pruebas de integración

### 4. End-to-End Testing (E2E)
- **Enfoque**: Simular flujo completo del usuario
- **Técnicas**:
  - User Journey Testing
  - Critical Path Testing
  - Happy Path/Sad Path Testing
  - Performance Testing
- **Casos**: 15 pruebas E2E

## 🚀 Inicio Rápido

### Prerrequisitos

1. **Node.js** >= 18.0.0
2. **npm** o **yarn**
3. **Base de datos** configurada (MySQL/PostgreSQL)
4. **Variables de entorno** configuradas

### Instalación

```bash
# Instalar dependencias
npm install

# Configurar base de datos
npm run setup:users

# Verificar instalación
npm run start:dev
```

### Ejecutar Pruebas

#### Pruebas por Tipo

```bash
# Pruebas de caja negra (funcionales)
npm run test:auth:black-box

# Pruebas de caja blanca (estructurales)
npm run test:auth:white-box

# Pruebas de integración
npm run test:auth:integration

# Pruebas End-to-End
npm run test:auth:e2e

# Todas las pruebas de autenticación
npm run test:auth:all

# Pruebas de humo (subset rápido)
npm run test:auth:smoke
```

#### Opciones Avanzadas

```bash
# Ejecutar con UI interactiva
npm run test:e2e:ui

# Ejecutar en modo debug
npm run test:e2e:debug

# Ejecutar con navegador visible
npm run test:e2e:headed

# Ver reportes
npm run test:auth:report
```

## 📊 Cobertura de Pruebas

| Tipo de Prueba | Casos | Cobertura | Estado |
|---------------|-------|-----------|--------|
| Black Box | 15 | Funcional completa | ✅ Completo |
| White Box | 17 | Estructural completa | ✅ Completo |
| Integration | 21 | Integración completa | ✅ Completo |
| E2E | 15 | Flujos críticos | ✅ Completo |
| **Total** | **68** | **Completa** | **✅ Completo** |

## 🔧 Configuración

### Variables de Entorno

Crear archivo `.env.test`:

```env
# Base URL de la aplicación
BASE_URL=http://localhost:3000

# Base de datos de pruebas
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=test_user
DB_PASSWORD=test_password
DB_DATABASE=hogar_ancianos_test

# JWT Secret para pruebas
JWT_SECRET=test_jwt_secret_key

# 2FA Secret para pruebas
TOTP_SECRET=test_totp_secret
```

### Configuración de Playwright

El archivo `playwright.config.ts` incluye:

- **Proyectos separados** por tipo de prueba
- **Configuración de timeouts** apropiada
- **Reportes múltiples** (HTML, JSON, JUnit)
- **Server automático** para desarrollo
- **Screenshots y videos** en caso de fallos

## 🧩 Utilidades de Prueba

### AuthAPITestUtils

Clase principal de utilidades ubicada en `tests/utils/auth-test-utils.ts`:

```typescript
import { AuthAPITestUtils, TestUsers } from './utils/auth-test-utils';

const authUtils = new AuthAPITestUtils(request);

// Login de prueba
const response = await authUtils.login(
  TestUsers.SUPER_ADMIN.email,
  TestUsers.SUPER_ADMIN.password
);

// Generar código TOTP válido
const validCode = authUtils.generateValidTOTP(secret);

// Completar 2FA
const twoFactorResponse = await authUtils.completeTwoFactorLogin(
  tempToken,
  validCode
);
```

### Usuarios de Prueba

- **SUPER_ADMIN**: superadmin@hogarancianos.com
- **ADMIN**: admin@hogarancianos.com
- **USER**: user@hogarancianos.com

## 📈 Reportes y Resultados

### Tipos de Reporte

1. **HTML Report**: `test-results/index.html`
   - Interfaz visual completa
   - Gráficos de resultados
   - Detalles de fallos

2. **JSON Report**: `test-results.json`
   - Datos estructurados
   - Integración con CI/CD

3. **JUnit Report**: `test-results.xml`
   - Compatible con herramientas de CI
   - Integración con Jenkins, GitLab CI, etc.

### Interpretación de Resultados

#### ✅ Pruebas Exitosas
- Código de estado esperado
- Datos de respuesta correctos
- Validaciones de negocio cumplidas

#### ❌ Pruebas Fallidas
- Errores de aserción
- Excepciones no manejadas
- Timeouts de conexión
- Errores de configuración

## 🔒 Seguridad en Pruebas

### Consideraciones de Seguridad

1. **Datos Sensibles**: No incluir passwords reales en código
2. **Tokens**: Limpiar tokens después de pruebas
3. **Base de Datos**: Usar base de datos dedicada para pruebas
4. **Secrets**: Usar variables de entorno para secrets

### Validaciones de Seguridad Incluidas

- ✅ Verificación de tokens expirados
- ✅ Validación de permisos RBAC
- ✅ Auditoría de accesos
- ✅ Protección contra ataques de fuerza bruta
- ✅ Validación de códigos 2FA

## 🚦 Estados de Prueba

### Estados Posibles

- **✅ Passed**: Prueba exitosa
- **❌ Failed**: Prueba fallida
- **⏭️ Skipped**: Prueba omitida (condiciones no cumplidas)
- **🔄 Flaky**: Prueba inestable (reintentos necesarios)

### Manejo de Flaky Tests

```typescript
test('Flaky test example', async () => {
  // Reintentar hasta 3 veces
  await test.step('Retry logic', async () => {
    // Lógica de reintento
  });
});
```

## 🔄 Integración CI/CD

### GitHub Actions Example

```yaml
name: QA Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:auth:all
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: test-results/
```

## 🐛 Debugging

### Modos de Debug

```bash
# Debug interactivo
npm run test:e2e:debug

# Con navegador visible
npm run test:e2e:headed

# Solo una prueba específica
npx playwright test --grep "TC_E2E_AUTH_001"
```

### Logs y Tracing

- **Traces**: Generados automáticamente en fallos
- **Screenshots**: Capturados en errores
- **Videos**: Grabados para pruebas fallidas
- **Console Logs**: Disponibles en reportes

## 📚 Mejores Prácticas

### Estructura de Pruebas

1. **Nombres Descriptivos**: Usar patrón `TC_[TIPO]_AUTH_[NUM]: Descripción`
2. **Aserciones Específicas**: Verificar exactamente lo esperado
3. **Limpieza**: Limpiar estado después de cada prueba
4. **Independencia**: Pruebas que no dependen unas de otras

### Mantenimiento

1. **Actualizar Datos**: Mantener usuarios de prueba actualizados
2. **Revisar Cobertura**: Asegurar cobertura completa de nuevos features
3. **Performance**: Monitorear tiempo de ejecución
4. **Flakiness**: Identificar y solucionar pruebas inestables

## 🤝 Contribución

### Agregar Nuevas Pruebas

1. Identificar tipo de prueba apropiado
2. Seguir nomenclatura existente
3. Agregar casos a la suite correspondiente
4. Actualizar documentación
5. Ejecutar suite completa antes de commit

### Revisión de Código

- ✅ Cobertura de código
- ✅ Casos edge incluidos
- ✅ Aserciones completas
- ✅ Limpieza de estado
- ✅ Documentación actualizada

## 📞 Soporte

Para preguntas o issues relacionados con las pruebas:

1. Revisar logs detallados en reportes
2. Verificar configuración de entorno
3. Consultar documentación específica del módulo
4. Crear issue con detalles completos

---

**Framework desarrollado siguiendo estándares QA profesionales para garantizar la calidad y confiabilidad del módulo de autenticación del sistema Hogar de Ancianos.**