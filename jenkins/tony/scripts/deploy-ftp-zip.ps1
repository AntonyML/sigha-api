param(
    [string]$FtpHost = "localhost",
    [string]$FtpUser = "ftpadmin",
    [string]$FtpPass = "Ftp@2025Proyecto",
    [int]$FtpPort = 21,
    [string]$RemotePath = "/",
    [string]$SourceBuild = ".\dist",
    [string]$ProductionPath = "C:\ProyectoAnalisis\backend\www"
)

Write-Host "========================================"
Write-Host "FTP DEPLOYMENT - ZIP OPTIMIZED"
Write-Host "========================================"
Write-Host ""

if (-not (Test-Path $SourceBuild)) {
    Write-Host "ERROR: Build directory not found at $SourceBuild"
    exit 1
}

Write-Host "Build directory found: $SourceBuild"

$filesToUpload = Get-ChildItem -Path $SourceBuild -File -Recurse
$fileCount = $filesToUpload.Count
Write-Host "Found $fileCount files"
Write-Host ""

# Crear ZIP
$zipPath = "dist.zip"
Write-Host "Creating ZIP file: $zipPath"

if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
$resolvedSource = (Resolve-Path $SourceBuild).Path
$resolvedZip = (Get-Item -Path $zipPath -ErrorAction SilentlyContinue).FullName
if (-not $resolvedZip) {
    $resolvedZip = Join-Path (Get-Location) $zipPath
}

[System.IO.Compression.ZipFile]::CreateFromDirectory($resolvedSource, $resolvedZip, "Optimal", $false)

$zipSize = (Get-Item $zipPath).Length / 1MB
Write-Host "ZIP created successfully (Size: $($zipSize.ToString('F2')) MB)"
Write-Host ""

Write-Host "Connecting to FTP server: $FtpHost`:$FtpPort"
Write-Host "Remote path: $RemotePath"
Write-Host ""

try {
    $securePassword = ConvertTo-SecureString $FtpPass -AsPlainText -Force
    $credential = New-Object System.Management.Automation.PSCredential($FtpUser, $securePassword)
    
    $ftpUri = "ftp://$FtpHost`:$FtpPort"
    $remoteFileUri = "$ftpUri$RemotePath/dist.zip"
    
    Write-Host "Uploading ZIP file to FTP..."
    Write-Host "Target: $remoteFileUri"
    Write-Host ""
    
    $ftpRequest = [System.Net.FtpWebRequest]::Create($remoteFileUri)
    $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
    $ftpRequest.Credentials = $credential
    $ftpRequest.UseBinary = $true
    $ftpRequest.UsePassive = $true
    $ftpRequest.KeepAlive = $true
    $ftpRequest.EnableSsl = $true
    
    # Ignorar validacion de certificado SSL auto-firmado
    [System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12
    
    $fileContent = [System.IO.File]::ReadAllBytes($zipPath)
    $ftpRequest.ContentLength = $fileContent.Length
    
    $requestStream = $ftpRequest.GetRequestStream()
    $requestStream.Write($fileContent, 0, $fileContent.Length)
    $requestStream.Close()
    
    $response = $ftpRequest.GetResponse()
    $statusCode = $response.StatusCode
    $response.Close()
    
    Write-Host "ZIP uploaded successfully (Status: $statusCode)"
    Write-Host ""
    
    # Descomprimir localmente en produccion
    Write-Host "Extracting ZIP to production directory: $ProductionPath"
    
    if (Test-Path $ProductionPath) {
        # Limpiar carpeta anterior (excepto web.config)
        Get-ChildItem -Path $ProductionPath -Exclude "web.config" | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    } else {
        New-Item -ItemType Directory -Path $ProductionPath -Force | Out-Null
    }
    
    # Crear carpeta dist si no existe
    $distPath = Join-Path $ProductionPath "dist"
    if (-not (Test-Path $distPath)) {
        New-Item -ItemType Directory -Path $distPath -Force | Out-Null
    }
    
    # Extraer ZIP local en la carpeta dist
    Write-Host "Extracting ZIP file from: $zipPath"
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    
    try {
        [System.IO.Compression.ZipFile]::ExtractToDirectory($zipPath, $distPath)
        Write-Host "ZIP extracted successfully to $distPath"
        
        # Listar archivos extraidos
        Write-Host ""
        Write-Host "Extracted files:"
        Get-ChildItem -Path $distPath -Recurse | ForEach-Object {
            $relativePath = $_.FullName.Substring($distPath.Length)
            Write-Host "  $relativePath"
        }
    } catch {
        Write-Host "Error extracting ZIP: $($_.Exception.Message)"
        throw
    }
    
    Write-Host ""
    
    # Limpiar ZIP local
    if (Test-Path $zipPath) {
        Remove-Item $zipPath -Force
        Write-Host "Cleanup: Removed local dist.zip"
    }
    
    Write-Host ""
    
    Write-Host "========================================"
    Write-Host "DEPLOYMENT COMPLETED SUCCESSFULLY"
    Write-Host "========================================"
    Write-Host ""
    Write-Host "Files deployed: $fileCount"
    Write-Host "Production path: $ProductionPath"
    Write-Host ""
    
    exit 0
}
catch {
    Write-Host ""
    Write-Host "ERROR: Deployment failed"
    Write-Host $_.Exception.Message
    
    # Limpiar ZIP si existe
    if (Test-Path $zipPath) {
        Remove-Item $zipPath -Force
    }
    
    exit 1
}
