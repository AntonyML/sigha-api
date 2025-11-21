def runJMeterTests() {
    bat '''
        @echo off
        setlocal enabledelayedexpansion
        
        where jmeter >nul 2>&1
        if errorlevel 1 (
            echo Warning: JMeter no esta instalado o no esta en PATH
            exit /b 0
        )
        
        if not exist "jmeter-results" mkdir jmeter-results
        
        if exist "tests/jmeter/users-performance-test.jmx" (
            jmeter -n -t tests/jmeter/users-performance-test.jmx -l jmeter-results/results.jtl -j jmeter.log
        ) else (
            echo Warning: JMeter test file not found
            exit /b 0
        )
    '''
}

def getJMeterResults() {
    if (fileExists('jmeter-results/results.jtl')) {
        return readFile('jmeter-results/results.jtl').take(1000)
    }
    return 'No JMeter results available'
}

return this
