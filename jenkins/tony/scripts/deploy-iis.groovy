def deployToIIS(ftpHost, ftpUser, ftpPass, ftpPort, remotePath, sourceBuild) {
    bat '''
        @echo off
        setlocal enabledelayedexpansion
        
        set FTP_HOST=''' + ftpHost + '''
        set FTP_USER=''' + ftpUser + '''
        set FTP_PASS=''' + ftpPass + '''
        set FTP_PORT=''' + ftpPort + '''
        set REMOTE_PATH=''' + remotePath + '''
        set SOURCE_BUILD=''' + sourceBuild + '''
        
        if not exist "!SOURCE_BUILD!" (
            echo Error: Build directory not found at !SOURCE_BUILD!
            exit /b 1
        )
        
        echo Creating FTP deployment script...
        (
            echo open !FTP_HOST! !FTP_PORT!
            echo !FTP_USER!
            echo !FTP_PASS!
            echo binary
            echo cd !REMOTE_PATH!
            echo mput !SOURCE_BUILD!/*.*
            echo quit
        ) > ftp_deploy.txt
        
        echo Starting FTP deployment...
        ftp -s:ftp_deploy.txt
        
        if errorlevel 1 (
            echo FTP deployment failed
            del /q ftp_deploy.txt 2>nul
            exit /b 1
        )
        
        echo FTP deployment completed successfully
        del /q ftp_deploy.txt 2>nul
    '''
}

def restartIISService() {
    bat '''
        @echo off
        echo Restarting IIS...
        iisreset /restart
        
        if errorlevel 1 (
            echo Warning: Could not restart IIS automatically
            exit /b 0
        )
        
        echo IIS restarted successfully
    '''
}

return this
