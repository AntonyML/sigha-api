def installDependencies() {
    bat 'npm install'
}

def runJestTests() {
    bat 'npm run test -- --coverage --testPathPatterns="tests/tony/unit" --reporters=default --reporters=jest-junit > jest-results.log 2>&1'
}

def runUnitTests() {
    bat 'npm run test -- tests/tony/unit/users/user.service.spec.ts --verbose --reporters=default --reporters=jest-junit > unit-test-results.log 2>&1'
}

def getTestOutput(logFile, maxLines = 500) {
    if (fileExists(logFile)) {
        return readFile(logFile).take(maxLines * 80)
    }
    return "No log file found: ${logFile}"
}

def publishTestResults() {
    junit testResults: '**/test-results/**/*.xml', allowEmptyResults: true
}

return this
