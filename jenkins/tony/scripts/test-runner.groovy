def installDependencies() {
    bat 'npm install'
}

def runJestTests() {
    bat 'cmd /c jenkins\\tony\\scripts\\run-tests.bat'
}

def runUnitTests() {
    bat 'npm run test -- tests/tony/unit/users/user.service.spec.ts --verbose'
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
