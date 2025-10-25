#!/usr/bin/env node

/**
 * Script de Ejecución de Pruebas QA - Módulo de Autenticación
 *
 * Uso:
 * npm run test:auth:black-box    - Ejecutar pruebas de caja negra
 * npm run test:auth:white-box    - Ejecutar pruebas de caja blanca
 * npm run test:auth:integration  - Ejecutar pruebas de integración
 * npm run test:auth:e2e          - Ejecutar pruebas E2E
 * npm run test:auth:all          - Ejecutar todas las pruebas
 * npm run test:auth:smoke        - Ejecutar pruebas de humo (subset rápido)
 */

const { execSync } = require('child_process');
const path = require('path');

const TEST_TYPES = {
  'black-box': 'tests/black-box/auth/auth-black-box.spec.ts',
  'white-box': 'tests/white-box/auth/auth-white-box.spec.ts',
  'integration': 'tests/integration/auth/auth-integration.spec.ts',
  'e2e': 'tests/e2e/auth/auth-e2e.spec.ts',
  'all': 'tests/**/auth/**/*.spec.ts',
  'smoke': [
    'tests/black-box/auth/auth-black-box.spec.ts',
    'tests/e2e/auth/auth-e2e.spec.ts'
  ]
};

function runTests(testType) {
  const testFiles = TEST_TYPES[testType];

  if (!testFiles) {
    console.error(`❌ Tipo de prueba desconocido: ${testType}`);
    console.log('📋 Tipos disponibles:', Object.keys(TEST_TYPES).join(', '));
    process.exit(1);
  }

  console.log(`🚀 Ejecutando pruebas de ${testType}...`);

  try {
    const command = Array.isArray(testFiles)
      ? `npx playwright test ${testFiles.join(' ')}`
      : `npx playwright test ${testFiles}`;

    console.log(`📝 Comando: ${command}`);

    execSync(command, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });

    console.log(`✅ Pruebas de ${testType} completadas exitosamente`);
  } catch (error) {
    console.error(`❌ Error ejecutando pruebas de ${testType}:`, error.message);
    process.exit(1);
  }
}

function showUsage() {
  console.log(`
🤖 Framework de Pruebas QA - Módulo de Autenticación

📋 Comandos disponibles:
  npm run test:auth:black-box    - Pruebas de caja negra (funcionales)
  npm run test:auth:white-box    - Pruebas de caja blanca (estructurales)
  npm run test:auth:integration  - Pruebas de integración
  npm run test:auth:e2e          - Pruebas End-to-End
  npm run test:auth:all          - Todas las pruebas
  npm run test:auth:smoke        - Pruebas de humo (rápidas)

🔧 Configuración:
  - Base URL: ${process.env.BASE_URL || 'http://localhost:3000'}
  - Reportes: test-results.html, test-results.json, test-results.xml

📊 Cobertura de Pruebas:
  - Black Box: 15 casos de prueba
  - White Box: 17 casos de prueba
  - Integration: 21 casos de prueba
  - E2E: 15 casos de prueba
  - Total: 68 casos de prueba

🎯 Estrategias Implementadas:
  - Equivalence Partitioning
  - Boundary Value Analysis
  - Decision Tables
  - State Transition Testing
  - Path Coverage
  - Branch Coverage
  - Condition Coverage
  - Multiple Condition Coverage
  `);
}

// Si se ejecuta directamente
if (require.main === module) {
  const testType = process.argv[2];

  if (!testType) {
    showUsage();
    process.exit(0);
  }

  runTests(testType);
}

module.exports = { runTests, TEST_TYPES };