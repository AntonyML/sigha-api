def runJMeterTests() {
    bat 'cmd /c jenkins\\tony\\scripts\\run-jmeter.bat'
}

def getJMeterResults() {
    def resultsFile = "${WORKSPACE}\\jenkins\\tony\\jmeter-results\\results.jtl"
    if (fileExists(resultsFile)) {
        return readFile(file: resultsFile)
    } else {
        return "[JMeter] No results file found at ${resultsFile}"
    }
}
