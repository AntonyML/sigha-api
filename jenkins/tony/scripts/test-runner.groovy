/**
 * test-runner.groovy
 * Maneja la instalación de dependencias y ejecución de tests
 */

def installDependencies() {
    bat 'npm install'
    echo "✓ Dependencias instaladas exitosamente"
}

def runJestTests() {
    bat 'npm run test -- --coverage --testPathPatterns="tests/tony/unit" > jest-results.log 2>&1'
    echo "✓ Jest tests ejecutados"
}

def runUnitTests() {
    bat 'npm run test -- tests/tony/unit/users/user.service.spec.ts --verbose > unit-test-results.log 2>&1'
    echo "✓ Unit tests - Users Service ejecutados"
}

def getTestOutput(logFile, maxLines = 500) {
    if (fileExists(logFile)) {
        return readFile(logFile).take(maxLines * 80) // Aproximado
    }
    return "No log file found: ${logFile}"
}

def publishTestResults() {
    junit testResults: '**/test-results/**/*.xml', allowEmptyResults: true
    echo "✓ Resultados de tests publicados"
}

return this
