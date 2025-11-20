def checkoutSource(sourceRepo, sourceBranch) {
    checkout(
        [
            $class: 'GitSCM',
            branches: [[name: "*/${sourceBranch}"]],
            userRemoteConfigs: [[url: "${sourceRepo}"]]
        ]
    )
}

def getCurrentCommit() {
    bat '''
        @echo off
        git rev-parse HEAD > current_commit.txt
    '''
    return readFile('current_commit.txt').trim()
}

def getLastCommit(workspace) {
    def lastBuildFile = "${workspace}/.last_commit"
    if (fileExists(lastBuildFile)) {
        return readFile(lastBuildFile).trim()
    }
    return ''
}

def saveCurrentCommit(workspace, commit) {
    def lastBuildFile = "${workspace}/.last_commit"
    writeFile file: lastBuildFile, text: commit
}

def hasChanges(currentCommit, lastCommit) {
    return currentCommit != lastCommit
}

def pushToRepository(targetRepo, targetBranch, credentialsId) {
    withCredentials([usernamePassword(credentialsId: credentialsId, usernameVariable: 'GIT_USER', passwordVariable: 'GIT_PASS')]) {
        bat '''
            @echo off
            setlocal enabledelayedexpansion
            
            set "PASS_ENCODED=!GIT_PASS:@=%%40!"
            set "PASS_ENCODED=!PASS_ENCODED:?=%%3F!"
            set "URL_WITH_CREDS=https://%GIT_USER%:!PASS_ENCODED!@git.ucr.ac.cr/proyecto_analisis/''' + targetRepo.split('/')[-1] + '''.git"
            
            git remote add ''' + targetRepo.split('/')[-1] + ''' "!URL_WITH_CREDS!" 2>nul
            if errorlevel 1 (
                git remote remove ''' + targetRepo.split('/')[-1] + ''' 2>nul
                git remote add ''' + targetRepo.split('/')[-1] + ''' "!URL_WITH_CREDS!"
            )
            
            git push -u ''' + targetRepo.split('/')[-1] + ''' HEAD:''' + targetBranch + ''' --force
        '''
    }
}

return this
