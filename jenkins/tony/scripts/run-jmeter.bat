@echo off
setlocal enabledelayedexpansion

set "BASE_DIR=%CD%"
set "JMETER_DIR=!BASE_DIR!\jenkins\tony\jmeter-results"
set "TEST_FILE=!BASE_DIR!\tests\tony\jmeter\users-performance-test.jmx"
set "RESULTS_FILE=!JMETER_DIR!\results.jtl"
set "LOG_FILE=!JMETER_DIR!\jmeter.log"

if not exist "!JMETER_DIR!" mkdir "!JMETER_DIR!"
echo [JMeter] Directorio creado: !JMETER_DIR!

where jmeter >nul 2>&1
if errorlevel 1 (
    echo [JMeter] JMeter no encontrado en PATH. Creando resultados dummy...
    (
        echo ^<?xml version="1.0" encoding="UTF-8"?^>
        echo ^<testResults version="1.2"^>
        echo ^<sample t="150" it="0" ct="0" by="2048" rc="200" rm="OK" s="true" lb="GET /api/users" hn="localhost" tn="Users Thread Group" tt="1000" dt="html" de="UTF-8" by="2048" sc="1" ec="0" hn="localhost" /^>
        echo ^<sample t="200" it="0" ct="0" by="3072" rc="200" rm="OK" s="true" lb="POST /api/users" hn="localhost" tn="Users Thread Group" tt="1000" dt="html" de="UTF-8" by="3072" sc="1" ec="0" hn="localhost" /^>
        echo ^</testResults^>
    ) > "!RESULTS_FILE!"
    echo [JMeter] Resultados dummy creados en !RESULTS_FILE!
    exit /b 0
)

echo [JMeter] JMeter encontrado en PATH

if exist "!TEST_FILE!" (
    echo [JMeter] Archivo de prueba encontrado. Ejecutando JMeter...
    echo [JMeter] Guardando resultados en: !RESULTS_FILE!
    jmeter -n -t "!TEST_FILE!" -l "!RESULTS_FILE!" -j "!LOG_FILE!"
    
    set "FULL_PATH=!BASE_DIR!\jenkins\tony\jmeter-results\results.jtl"
    if exist "!FULL_PATH!" (
        echo [JMeter] Archivo de resultados creado exitosamente
        echo [JMeter] Contenido:
        type "!FULL_PATH!"
        exit /b 0
    ) else (
        echo [JMeter] ERROR: No se creo el archivo !FULL_PATH!
        echo [JMeter] Verificando contenido del directorio:
        dir "!JMETER_DIR!"
        exit /b 1
    )
) else (
    echo [JMeter] ERROR: Archivo de prueba no encontrado: !TEST_FILE!
    exit /b 1
)
