def mergeDevToMaster(sourceRepo, credentialsId) {
    withCredentials([usernamePassword(credentialsId: credentialsId, usernameVariable: 'GIT_USER', passwordVariable: 'GIT_PASS')]) {
        bat '''
            @echo off
            setlocal enabledelayedexpansion
            
            set "PASS_ENCODED=!GIT_PASS:@=%%40!"
            set "PASS_ENCODED=!PASS_ENCODED:?=%%3F!"
            set "URL_WITH_CREDS=https://%GIT_USER%:!PASS_ENCODED!@git.ucr.ac.cr/proyecto_analisis/backend_nest_js_hogar_de_ancianos.git"
            
            git remote add origin-merge "!URL_WITH_CREDS!" 2>nul
            if errorlevel 1 (
                git remote remove origin-merge 2>nul
                git remote add origin-merge "!URL_WITH_CREDS!"
            )
            
            git fetch origin-merge master dev
            git checkout -b master-merge origin-merge/master
            git merge origin-merge/dev --no-edit
            git push origin-merge master-merge:master
        '''
    }
}

def buildApplication() {
    bat '''
        @echo off
        npm run build
    '''
}

return this
