def deployToIIS(ftpHost, ftpUser, ftpPass, ftpPort, remotePath, sourceBuild) {
    echo "=========================================="
    echo "FTP DEPLOYMENT - ZIP OPTIMIZED"
    echo "=========================================="
    
    def scriptPath = ".\\jenkins\\tony\\scripts\\deploy-ftp-zip.ps1"
    
    powershell(script: """
        Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
        
        & "${scriptPath}" `
            -FtpHost "${ftpHost}" `
            -FtpPort ${ftpPort} `
            -FtpUser "${ftpUser}" `
            -FtpPass "${ftpPass}" `
            -RemotePath "${remotePath}" `
            -SourceBuild ".\\${sourceBuild}" `
            -ProductionPath "C:\\ProyectoAnalisis\\backend\\www"
        
        if (\$LASTEXITCODE -ne 0) {
            throw "FTP deployment failed with exit code: \$LASTEXITCODE"
        }
    """)
    
    echo "FTP deployment completed successfully"
}

def startNodeServer() {
    echo "=========================================="
    echo "STARTING NODE.JS SERVER"
    echo "=========================================="
    
    def scriptPath = ".\\jenkins\\tony\\scripts\\start-node-server.ps1"
    
    powershell(script: """
        Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
        
        & "${scriptPath}" `
            -WorkingDirectory "C:\\ProyectoAnalisis\\backend\\www" `
            -Port 3001 `
            -TimeoutSeconds 10
        
        if (\$LASTEXITCODE -ne 0) {
            echo "Warning: Node.js startup script reported issues but continuing..."
        }
    """)
    
    echo "Node.js server startup sequence completed"
}

def verifyDeployment() {
    echo "=========================================="
    echo "VERIFYING DEPLOYMENT"
    echo "=========================================="
    
    powershell(script: """
        \$maxRetries = 5
        \$retryCount = 0
        \$success = \$false
        
        while (\$retryCount -lt \$maxRetries -and -not \$success) {
            try {
                \$response = Invoke-WebRequest -Uri "http://localhost:3001/api" `
                                             -Method GET `
                                             -TimeoutSec 5 `
                                             -ErrorAction Stop
                
                if (\$response.StatusCode -eq 200) {
                    Write-Host "Health check passed - Deployment verified" -ForegroundColor Green
                    \$success = \$true
                }
            }
            catch {
                \$retryCount++
                if (\$retryCount -lt \$maxRetries) {
                    Write-Host "Retry \$retryCount/\$maxRetries - waiting for server..." -ForegroundColor Yellow
                    Start-Sleep -Seconds 2
                }
                else {
                    Write-Host "Warning: Could not verify deployment after \$maxRetries attempts" -ForegroundColor Yellow
                }
            }
        }
    """)
}

return this
