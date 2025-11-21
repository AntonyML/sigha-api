@echo off
setlocal enabledelayedexpansion

set "BASE_DIR=%CD%"
set "TEST_RESULTS_DIR=!BASE_DIR!\test-results"
set "JEST_CONFIG=!BASE_DIR!\jest.config.js"

if not exist "!TEST_RESULTS_DIR!" mkdir "!TEST_RESULTS_DIR!"
echo [JEST] Directorio de resultados creado: !TEST_RESULTS_DIR!

echo [JEST] Ejecutando pruebas unitarias...
call npm run test -- --coverage --testPathPatterns="tests/tony/unit"

if errorlevel 1 (
    echo [JEST] ERROR: Las pruebas fallaron
    exit /b 1
) else (
    echo [JEST] Pruebas completadas exitosamente
    
    if exist "!TEST_RESULTS_DIR!\junit.xml" (
        echo [JEST] Archivo de resultados XML encontrado
        type "!TEST_RESULTS_DIR!\junit.xml"
    ) else (
        echo [JEST] Advertencia: junit.xml no encontrado en !TEST_RESULTS_DIR!
    )
    exit /b 0
)
