#!/usr/bin/env groovy

def deploymentStatus = "FAILED"

pipeline {
    agent any

    stages {
        stage('Deploy to IIS via FTP') {
            steps {
                script {
                    echo "=========================================="
                    echo "DEPLOYING TO IIS VIA FTP (PowerShell)"
                    echo "=========================================="
                    echo ""
                    
                    // Define parameters
                    def ftpHost = 'localhost'
                    def ftpPort = 21
                    def ftpUser = 'ftpadmin'
                    def ftpPass = credentials('ftpadmin-password')  // Jenkins credential
                    def remotePath = '/backend/www'
                    def sourceBuild = '.\\dist'
                    
                    try {
                        // Call PowerShell FTP deployment script
                        powershell(script: """
                            & ".\\jenkins\\tony\\scripts\\deploy-ftp-powershell.ps1" `
                                -FtpHost "${ftpHost}" `
                                -FtpPort ${ftpPort} `
                                -FtpUser "${ftpUser}" `
                                -FtpPass "${ftpPass}" `
                                -RemotePath "${remotePath}" `
                                -SourceBuild "${sourceBuild}"
                            
                            if (\$LASTEXITCODE -ne 0) {
                                throw "FTP Deployment failed with exit code: \$LASTEXITCODE"
                            }
                        """)
                        
                        echo ""
                        echo "✓ FTP Deployment completed successfully"
                        deploymentStatus = "SUCCESS"
                    }
                    catch (Exception e) {
                        echo ""
                        echo "✗ FTP Deployment failed: ${e.message}"
                        deploymentStatus = "FAILED"
                        error("FTP deployment failed: ${e.message}")
                    }
                }
            }
        }

        stage('Restart IIS Services') {
            steps {
                script {
                    echo ""
                    echo "=========================================="
                    echo "RESTARTING IIS SERVICES (PowerShell)"
                    echo "=========================================="
                    echo ""
                    
                    try {
                        // Call PowerShell IIS restart script
                        powershell(script: """
                            & ".\\jenkins\\tony\\scripts\\restart-iis-powershell.ps1" -TimeoutSeconds 30
                            
                            if (\$LASTEXITCODE -ne 0) {
                                throw "IIS restart failed with exit code: \$LASTEXITCODE"
                            }
                        """)
                        
                        echo ""
                        echo "✓ IIS Services restarted successfully"
                    }
                    catch (Exception e) {
                        echo ""
                        echo "✗ IIS restart failed: ${e.message}"
                        // Continue to notification even if restart fails
                        currentBuild.result = 'FAILURE'
                    }
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                script {
                    echo ""
                    echo "=========================================="
                    echo "VERIFYING DEPLOYMENT"
                    echo "=========================================="
                    echo ""
                    
                    try {
                        // Wait for IIS to be ready
                        sleep(time: 5, unit: 'SECONDS')
                        
                        // Check health endpoint
                        def healthUrl = 'http://localhost:3000/api'
                        
                        powershell(script: """
                            \$maxRetries = 5
                            \$retryCount = 0
                            \$success = \$false
                            
                            while (\$retryCount -lt \$maxRetries -and -not \$success) {
                                try {
                                    \$response = Invoke-WebRequest -Uri "${healthUrl}" -Method GET -TimeoutSec 10 -ErrorAction Stop
                                    if (\$response.StatusCode -eq 200) {
                                        Write-Host "✓ Health check passed" -ForegroundColor Green
                                        \$success = \$true
                                    }
                                }
                                catch {
                                    \$retryCount++
                                    if (\$retryCount -lt \$maxRetries) {
                                        Write-Host "Retry \$retryCount/\$maxRetries..." -ForegroundColor Yellow
                                        Start-Sleep -Seconds 2
                                    }
                                    else {
                                        throw "Health check failed after \$maxRetries retries"
                                    }
                                }
                            }
                        """)
                        
                        echo "✓ Deployment verified successfully"
                    }
                    catch (Exception e) {
                        echo "⚠ Verification warning: ${e.message}"
                        // Don't fail the build on verification warning
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                echo ""
                echo "=========================================="
                echo "DEPLOYMENT COMPLETE"
                echo "=========================================="
                echo ""
                echo "Status: ${deploymentStatus}"
                echo ""
            }
        }

        success {
            echo "✓ Deployment pipeline completed successfully"
        }

        failure {
            echo "✗ Deployment pipeline failed"
            echo "Check FTP credentials and IIS service status"
        }
    }
}
