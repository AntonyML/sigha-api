# Jenkins Pipeline Modular - Tony

Esta es la estructura modular del pipeline de Jenkins. Se ha separado en componentes reutilizables para mayor mantenibilidad y claridad.

## 📁 Estructura

```
jenkins/tony/
├── Jenkinsfile              # Pipeline principal (limpio y legible)
├── scripts/
│   ├── config.groovy        # Configuración centralizada
│   ├── git-operations.groovy # Operaciones de Git (checkout, push)
│   ├── test-runner.groovy   # Ejecución de tests
│   └── email-handler.groovy # Notificaciones por email
└── README.md                # Este archivo
```

## 🔧 Componentes

### 1. **Jenkinsfile** (Pipeline Principal)
- **~170 líneas** (vs 300+ originales)
- Define stages y orquestación
- Carga y utiliza los scripts modulares
- Fácil de leer y mantener

**Flujo:**
```
Load Configuration
    ↓
Initialize & Check Changes
    ↓
Push to Test Repository
    ↓
Install Dependencies
    ↓
Run Tests
    ↓
Push to Deploy Repository
    ↓
Post-Actions (emails)
```

### 2. **config.groovy** - Configuración Centralizada
Almacena toda la configuración del pipeline (URLs, credenciales, timeouts).

**Uso:**
```groovy
def configModule = load("scripts/config.groovy")
def config = configModule.getConfig()
```

**Ventajas:**
- ✅ Un único punto de cambio para URLs y configuración
- ✅ Fácil de actualizar sin tocar el Jenkinsfile
- ✅ Reutilizable en otros pipelines

### 3. **git-operations.groovy** - Operaciones de Git
Maneja checkout, push a múltiples repositorios y detección de cambios.

**Funciones disponibles:**
- `checkoutSource(sourceRepo, sourceBranch)` - Descarga código
- `getCurrentCommit()` - Obtiene commit actual
- `getLastCommit(workspace)` - Obtiene último commit procesado
- `saveCurrentCommit(workspace, commit)` - Guarda commit actual
- `hasChanges(currentCommit, lastCommit)` - Detecta cambios
- `pushToRepository(targetRepo, targetBranch, credentialsId)` - Push a repos

**Ventajas:**
- ✅ Sin repetición de código (consolidó 2 pushes idénticos)
- ✅ Manejo centralizado de credenciales
- ✅ Lógica de URL-encoding centralizada

### 4. **test-runner.groovy** - Ejecución de Tests
Maneja instalación de dependencias y ejecución de tests.

**Funciones disponibles:**
- `installDependencies()` - npm install
- `runJestTests()` - Jest tests
- `runUnitTests()` - Unit tests específicos
- `getTestOutput(logFile, maxLines)` - Lee logs de tests
- `publishTestResults()` - Publica resultados

**Ventajas:**
- ✅ Centraliza lógica de tests
- ✅ Fácil agregar nuevos tipos de tests
- ✅ Reutilizable para otros servicios

### 5. **email-handler.groovy** - Notificaciones
Envía emails detallados de éxito, fallo e inestabilidad.

**Funciones disponibles:**
- `sendSuccessEmail(...)` - Email de éxito
- `sendFailureEmail(...)` - Email de fallo
- `sendUnstableEmail(...)` - Email de inestabilidad

**Ventajas:**
- ✅ Templates centralizados
- ✅ Fácil cambiar formato o recipientes
- ✅ Reutilizable en otros pipelines

## 🚀 Cómo Usar

### Agregar un nuevo tipo de test

En `scripts/test-runner.groovy`, agrega:

```groovy
def runNewTest() {
    bat 'npm run test:new > new-test-results.log 2>&1'
    echo "✓ New tests ejecutados"
}
```

Luego en `Jenkinsfile`, en el stage `Run Tests`:

```groovy
def testRunner = load("${WORKSPACE}/jenkins/tony/scripts/test-runner.groovy")
testRunner.runNewTest()
```

### Cambiar configuración

En `scripts/config.groovy`:

```groovy
source: [
    repo: 'tu-nueva-url',
    branch: 'tu-rama'
]
```

El Jenkinsfile automáticamente usa la nueva configuración.

### Agregar un nuevo stage

1. Define la lógica en el script correspondiente (o crea uno nuevo)
2. En `Jenkinsfile`, agrega el stage:

```groovy
stage('Mi Nuevo Stage') {
    when {
        expression { env.HAS_CHANGES == 'true' }
    }
    steps {
        script {
            def miScript = load("${WORKSPACE}/jenkins/tony/scripts/mi-script.groovy")
            miScript.miLogica()
        }
    }
}
```

## 📊 Comparativa: Antes vs Después

| Métrica | Antes | Después |
|---------|-------|---------|
| Líneas en Jenkinsfile | 300+ | ~170 |
| Código duplicado | Sí (2x git push) | No |
| Fácil de modificar | Difícil | Muy fácil |
| Escalable | Limitado | Excelente |
| Reutilizable | No | Sí |

## 🔗 Relaciones entre Componentes

```
Jenkinsfile (orquestación)
    ├→ config.groovy (provee configuración a todos)
    │
    ├→ git-operations.groovy (checkout, push)
    │
    ├→ test-runner.groovy (tests)
    │
    └→ email-handler.groovy (notificaciones)
```

## 🐛 Debugging

Si algo falla, revisa:

1. **Stage 'Load Configuration'** - Verifica que config.groovy sea válido
2. **Stage 'Initialize'** - Revisa los logs de git operations
3. **Stage 'Run Tests'** - Revisa `jest-results.log` y `unit-test-results.log`
4. **Post-Actions** - Revisa que los emails se hayan enviado

## ✅ Checklist de Mantenimiento

- [ ] Actualizar URLs en `config.groovy` si cambian repositorios
- [ ] Agregar nuevos tests en `test-runner.groovy` cuando sea necesario
- [ ] Revisar templates de email en `email-handler.groovy` regularmente
- [ ] Documentar cambios en este README

---

**Creado por:** Tony  
**Fecha:** Noviembre 2025  
**Versión:** 1.0
