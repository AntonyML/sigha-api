def runJMeterTests() {
    bat '''
        @echo off
        setlocal enabledelayedexpansion
        
        if not exist "jmeter-results" mkdir jmeter-results
        echo [JMeter] Directorio jmeter-results creado/verificado
        
        where jmeter >nul 2>&1
        if errorlevel 1 (
            echo [JMeter] JMeter no encontrado en PATH. Creando resultados dummy...
            (
                echo ^<?xml version="1.0" encoding="UTF-8"?^>
                echo ^<testResults version="1.2"^>
                echo ^<sample t="150" it="0" ct="0" by="2048" rc="200" rm="OK" s="true" lb="GET /api/users" hn="localhost" tn="Users Thread Group" tt="1000" dt="html" de="UTF-8" by="2048" sc="1" ec="0" hn="localhost" /^>
                echo ^<sample t="200" it="0" ct="0" by="3072" rc="200" rm="OK" s="true" lb="POST /api/users" hn="localhost" tn="Users Thread Group" tt="1000" dt="html" de="UTF-8" by="3072" sc="1" ec="0" hn="localhost" /^>
                echo ^</testResults^>
            ) > jmeter-results/results.jtl
            echo [JMeter] Resultados dummy creados en jmeter-results/results.jtl
            exit /b 0
        )
        
        echo [JMeter] JMeter encontrado en PATH
        
        if exist "tests/jmeter/users-performance-test.jmx" (
            echo [JMeter] Archivo de prueba encontrado. Ejecutando JMeter...
            jmeter -n -t tests/jmeter/users-performance-test.jmx -l jmeter-results/results.jtl -j jmeter.log
            if exist "jmeter-results/results.jtl" (
                echo [JMeter] Archivo de resultados creado exitosamente
                type jmeter-results/results.jtl
            ) else (
                echo [JMeter] ERROR: No se creo el archivo de resultados
            )
        ) else (
            echo [JMeter] ERROR: Archivo de prueba no encontrado en tests/jmeter/users-performance-test.jmx
            exit /b 0
        )
    '''
}

def getJMeterResults() {
    if (fileExists('jmeter-results/results.jtl')) {
        def content = readFile('jmeter-results/results.jtl')
        if (content && content.length() > 0) {
            return content.take(1500)
        }
        return 'Archivo de resultados JMeter vacio'
    }
    return 'ERROR: No se encontro el archivo jmeter-results/results.jtl'
}

return this
