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
    // Fetch remoto para sincronizar con cambios en GitLab
    bat '''
        @echo off
        echo [GIT] Fetching latest changes from remote repository...
        git fetch origin 2>nul
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
    // Compara commit actual con último registrado
    if (!lastCommit || lastCommit.isEmpty()) {
        echo "[GIT] First build detected or no commit history"
        return true
    }
    
    def hasLocalChanges = currentCommit != lastCommit
    
    if (hasLocalChanges) {
        echo "[GIT] New commit detected locally: ${currentCommit.take(8)} (was: ${lastCommit.take(8)})"
    } else {
        echo "[GIT] No new commits since last build"
    }
    
    return hasLocalChanges
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
