param(
    [string]$FtpHost = "localhost",
    [string]$FtpUser = "ftpadmin",
    [string]$FtpPass = "Ftp@2025Proyecto",
    [int]$FtpPort = 21,
    [string]$RemotePath = "/backend/www",
    [string]$SourceBuild = ".\dist"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FTP DEPLOYMENT SCRIPT (PowerShell)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que el directorio de build existe
if (-not (Test-Path $SourceBuild)) {
    Write-Host "ERROR: Build directory not found at $SourceBuild" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Build directory found: $SourceBuild" -ForegroundColor Green

# Obtener archivos a subir (recursivo)
$filesToUpload = Get-ChildItem -Path $SourceBuild -File -Recurse
$fileCount = $filesToUpload.Count
Write-Host "✓ Found $fileCount files to upload" -ForegroundColor Green
Write-Host ""

Write-Host "Connecting to FTP server: $FtpHost`:$FtpPort" -ForegroundColor Yellow
Write-Host "Remote path: $RemotePath" -ForegroundColor Yellow
Write-Host "Using FTP Upload (not direct filesystem access)" -ForegroundColor Yellow
Write-Host ""

try {
    # Crear credenciales
    $securePassword = ConvertTo-SecureString $FtpPass -AsPlainText -Force
    $credential = New-Object System.Management.Automation.PSCredential($FtpUser, $securePassword)
    
    $ftpUri = "ftp://$FtpHost`:$FtpPort"
    $uploadedCount = 0
    $failedCount = 0
    $uploadedFiles = @()
    $failedFiles = @()
    
    # Crear colecciones de directorios para crear en FTP
    $remoteDirs = @()
    
    # Subir cada archivo vía FTP
    foreach ($file in $filesToUpload) {
        $relativePath = $file.FullName.Substring($SourceBuild.Length + 1)
        $relativeDir = Split-Path -Parent $relativePath
        $fileName = Split-Path -Leaf $relativePath
        
        # Construir ruta FTP (reemplazar backslash con forward slash)
        $remoteDir = $RemotePath + "/" + $relativeDir.Replace("\", "/")
        $remoteFileUri = "$ftpUri$remoteDir/$fileName"
        
        try {
            Write-Host "Uploading: $relativePath... " -NoNewline -ForegroundColor White
            
            # Crear request FTP para upload
            $ftpRequest = [System.Net.FtpWebRequest]::Create($remoteFileUri)
            $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
            $ftpRequest.Credentials = $credential
            $ftpRequest.UseBinary = $true
            $ftpRequest.UsePassive = $true
            $ftpRequest.KeepAlive = $true
            $ftpRequest.EnableSsl = $false
            
            # Ignorar validación de certificado SSL si es necesario
            if ($ftpRequest.EnableSsl) {
                [System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }
            }
            
            # Leer archivo binario
            $fileContent = [System.IO.File]::ReadAllBytes($file.FullName)
            $ftpRequest.ContentLength = $fileContent.Length
            
            # Enviar contenido
            $requestStream = $ftpRequest.GetRequestStream()
            $requestStream.Write($fileContent, 0, $fileContent.Length)
            $requestStream.Close()
            
            # Obtener respuesta FTP
            $response = $ftpRequest.GetResponse()
            $statusCode = $response.StatusCode
            $response.Close()
            
            Write-Host "✓ OK ($statusCode)" -ForegroundColor Green
            $uploadedCount++
            $uploadedFiles += $relativePath
        }
        catch {
            Write-Host "✗ FAILED - $_" -ForegroundColor Red
            $failedCount++
            $failedFiles += $relativePath
        }
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "FTP Upload Summary:" -ForegroundColor Cyan
    Write-Host "  FTP Server: $FtpHost`:$FtpPort" -ForegroundColor White
    Write-Host "  Remote Path: $RemotePath" -ForegroundColor White
    Write-Host "  Total files: $fileCount" -ForegroundColor White
    Write-Host "  Successfully uploaded: $uploadedCount" -ForegroundColor Green
    Write-Host "  Failed: $failedCount" -ForegroundColor $(if ($failedCount -eq 0) { "Green" } else { "Red" })
    Write-Host "========================================" -ForegroundColor Green
    
    if ($uploadedCount -gt 0) {
        Write-Host ""
        Write-Host "Uploaded files (first 10):" -ForegroundColor Cyan
        $uploadedFiles | Select-Object -First 10 | ForEach-Object {
            Write-Host "  ✓ $_" -ForegroundColor Gray
        }
        if ($uploadedCount -gt 10) {
            Write-Host "  ... and $($uploadedCount - 10) more files" -ForegroundColor Gray
        }
    }
    
    if ($failedCount -gt 0) {
        Write-Host ""
        Write-Host "Failed files:" -ForegroundColor Red
        $failedFiles | ForEach-Object {
            Write-Host "  ✗ $_" -ForegroundColor Red
        }
        exit 1
    }
    
    Write-Host ""
    Write-Host "✓ FTP deployment completed successfully" -ForegroundColor Green
    Write-Host ""
    Write-Host "All files uploaded to: $FtpHost`:$FtpPort$RemotePath" -ForegroundColor Green
    exit 0
}
catch {
    Write-Host "ERROR: FTP deployment failed: $_" -ForegroundColor Red
    Write-Host "Stack trace: $($_.Exception.StackTrace)" -ForegroundColor Red
    exit 1
}
