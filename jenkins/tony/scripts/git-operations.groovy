/**
 * git-operations.groovy
 * Maneja todas las operaciones de Git (checkout, push a repos)
 */

def checkoutSource(sourceRepo, sourceBranch) {
    checkout(
        [
            $class: 'GitSCM',
            branches: [[name: "*/${sourceBranch}"]],
            userRemoteConfigs: [[url: "${sourceRepo}"]]
        ]
    )
    echo "✓ Repositorio ${sourceRepo} descargado en rama ${sourceBranch}"
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
            
            REM URL-encode the password: @ = %%40, ? = %%3F
            set "PASS_ENCODED=!GIT_PASS:@=%%40!"
            set "PASS_ENCODED=!PASS_ENCODED:?=%%3F!"
            set "URL_WITH_CREDS=https://%GIT_USER%:!PASS_ENCODED!@git.ucr.ac.cr/proyecto_analisis/''' + targetRepo.split('/')[-1] + '''.git"
            
            REM Add remote with credentials in URL
            git remote add ''' + targetRepo.split('/')[-1] + ''' "!URL_WITH_CREDS!" 2>nul
            if errorlevel 1 (
                REM Remote might already exist, remove and add again
                git remote remove ''' + targetRepo.split('/')[-1] + ''' 2>nul
                git remote add ''' + targetRepo.split('/')[-1] + ''' "!URL_WITH_CREDS!"
            )
            
            REM Push with verbose output
            git push -u ''' + targetRepo.split('/')[-1] + ''' HEAD:''' + targetBranch + ''' --force
        '''
    }
    echo "✓ Push completado a ${targetRepo} en rama ${targetBranch}"
}

return this
