param(
    [string]$FtpHost = "localhost",
    [string]$FtpUser = "ftpadmin",
    [string]$FtpPass = "Ftp@2025Proyecto",
    [int]$FtpPort = 21,
    [string]$RemotePath = "/backend/www",
    [string]$SourceBuild = ".\dist"
)

Write-Host "========================================"
Write-Host "FTP DEPLOYMENT SCRIPT"
Write-Host "========================================"
Write-Host ""

if (-not (Test-Path $SourceBuild)) {
    Write-Host "ERROR: Build directory not found at $SourceBuild"
    exit 1
}

Write-Host "Build directory found: $SourceBuild"

$filesToUpload = Get-ChildItem -Path $SourceBuild -File -Recurse
$fileCount = $filesToUpload.Count
Write-Host "Found $fileCount files to upload"
Write-Host ""

Write-Host "Connecting to FTP server: $FtpHost`:$FtpPort"
Write-Host "Remote path: $RemotePath"
Write-Host ""

try {
    $securePassword = ConvertTo-SecureString $FtpPass -AsPlainText -Force
    $credential = New-Object System.Management.Automation.PSCredential($FtpUser, $securePassword)
    
    $ftpUri = "ftp://$FtpHost`:$FtpPort"
    $uploadedCount = 0
    $failedCount = 0
    $uploadedFiles = @()
    $failedFiles = @()
    
    foreach ($file in $filesToUpload) {
        $relativePath = $file.FullName.Substring($SourceBuild.Length + 1)
        $relativeDir = Split-Path -Parent $relativePath
        $fileName = Split-Path -Leaf $relativePath
        
        $remoteDir = $RemotePath + "/" + $relativeDir.Replace("\", "/")
        $remoteFileUri = "$ftpUri$remoteDir/$fileName"
        
        try {
            Write-Host "Uploading: $relativePath... " -NoNewline
            
            $ftpRequest = [System.Net.FtpWebRequest]::Create($remoteFileUri)
            $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
            $ftpRequest.Credentials = $credential
            $ftpRequest.UseBinary = $true
            $ftpRequest.UsePassive = $true
            $ftpRequest.KeepAlive = $true
            $ftpRequest.EnableSsl = $false
            
            if ($ftpRequest.EnableSsl) {
                [System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }
            }
            
            $fileContent = [System.IO.File]::ReadAllBytes($file.FullName)
            $ftpRequest.ContentLength = $fileContent.Length
            
            $requestStream = $ftpRequest.GetRequestStream()
            $requestStream.Write($fileContent, 0, $fileContent.Length)
            $requestStream.Close()
            
            $response = $ftpRequest.GetResponse()
            $statusCode = $response.StatusCode
            $response.Close()
            
            Write-Host "OK"
            $uploadedCount++
            $uploadedFiles += $relativePath
        }
        catch {
            Write-Host "FAILED"
            $failedCount++
            $failedFiles += $relativePath
        }
    }
    
    Write-Host ""
    Write-Host "========================================"
    Write-Host "FTP Upload Summary"
    Write-Host "========================================"
    Write-Host "Total files: $fileCount"
    Write-Host "Successfully uploaded: $uploadedCount"
    Write-Host "Failed: $failedCount"
    Write-Host ""
    
    if ($uploadedCount -gt 0) {
        Write-Host "Uploaded files (first 10):"
        $uploadedFiles | Select-Object -First 10 | ForEach-Object {
            Write-Host "  - $_"
        }
        if ($uploadedCount -gt 10) {
            Write-Host "  ... and $($uploadedCount - 10) more files"
        }
    }
    
    if ($failedCount -gt 0) {
        Write-Host ""
        Write-Host "Failed files:"
        $failedFiles | ForEach-Object {
            Write-Host "  - $_"
        }
        exit 1
    }
    
    Write-Host ""
    Write-Host "FTP deployment completed successfully"
    exit 0
}
catch {
    Write-Host ""
    Write-Host "ERROR: FTP deployment failed"
    Write-Host $_.Exception.Message
    exit 1
}
