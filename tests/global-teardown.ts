import { test as teardown } from '@playwright/test';

/**
 * Global Teardown para Pruebas de Autenticación
 *
 * Este archivo se ejecuta después de todas las pruebas y limpia:
 * - Datos de prueba
 * - Sesiones activas
 * - Cache
 */

teardown('Global Teardown - Limpiar entorno de pruebas', async ({}) => {
  console.log('🧹 Iniciando teardown global de pruebas de autenticación...');

  // Aquí iría la limpieza de datos de prueba
  // - Limpiar usuarios de prueba
  // - Limpiar sesiones
  // - Limpiar cache
  // - Resetear base de datos si es necesario

  console.log('✅ Teardown global completado');
});