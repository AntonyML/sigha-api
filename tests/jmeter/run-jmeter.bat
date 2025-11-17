@echo off
REM Script para ejecutar JMeter tests
REM Espera los parámetros: camino a jmeter, archivo jmx, archivo de salida

if "%~1"=="" (
    echo Error: Falta especificar la ruta de JMeter
    echo Uso: run-jmeter.bat "C:\path\to\jmeter" "test-file.jmx" "output-file.jtl"
    exit /b 1
)

setlocal enabledelayedexpansion

set JMETER_HOME=%~1
set TEST_FILE=%~2
set OUTPUT_FILE=%~3

if not exist "!JMETER_HOME!\bin\jmeter.bat" (
    echo Error: No se encontró JMeter en !JMETER_HOME!
    exit /b 1
)

if not exist "!TEST_FILE!" (
    echo Error: Archivo de test no encontrado: !TEST_FILE!
    exit /b 1
)

echo ========================================
echo Ejecutando JMeter Tests
echo ========================================
echo Archivo de test: !TEST_FILE!
echo Archivo de salida: !OUTPUT_FILE!
echo.

REM Ejecutar JMeter en modo no-GUI
"!JMETER_HOME!\bin\jmeter.bat" -n -t "!TEST_FILE!" -l "!OUTPUT_FILE!" -j jmeter.log

if errorlevel 1 (
    echo Error al ejecutar JMeter
    exit /b 1
)

echo.
echo ✓ JMeter tests completados
exit /b 0
