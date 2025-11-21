# Script para probar conexión FTP
param(
    [string]$FtpServer = "localhost",
    [int]$FtpPort = 21,
    [string]$FtpUser = "ftpadmin",
    [string]$FtpPassword = "Ftp@2025Proyecto"
)

Write-Host "=== Prueba de Conexión FTP ===" -ForegroundColor Cyan

# 1. Probar conectividad por puerto
Write-Host "1. Probando conectividad al puerto $FtpPort..." -ForegroundColor Yellow
$ConnectionTest = Test-NetConnection -ComputerName $FtpServer -Port $FtpPort
if ($ConnectionTest.TcpTestSucceeded) {
    Write-Host "✅ Puerto $FtpPort abierto" -ForegroundColor Green
} else {
    Write-Host "❌ No se puede conectar al puerto $FtpPort" -ForegroundColor Red
    exit 1
}

# 2. Probar autenticación FTP
Write-Host "2. Probando autenticación FTP..." -ForegroundColor Yellow
try {
    $FtpUri = "ftp://${FtpServer}:${FtpPort}/"
    $Credential = New-Object System.Net.NetworkCredential($FtpUser, $FtpPassword)
    
    $FtpRequest = [System.Net.FtpWebRequest]::Create($FtpUri)
    $FtpRequest.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
    $FtpRequest.Credentials = $Credential
    $FtpRequest.UseBinary = $false
    $FtpRequest.KeepAlive = $true
    
    $FtpResponse = $FtpRequest.GetResponse()
    Write-Host "✅ Autenticación FTP exitosa" -ForegroundColor Green
    Write-Host "Respuesta del servidor: $($FtpResponse.StatusDescription)" -ForegroundColor Green
    
    # Leer contenido
    $ResponseStream = $FtpResponse.GetResponseStream()
    $StreamReader = New-Object System.IO.StreamReader($ResponseStream)
    $Content = $StreamReader.ReadToEnd()
    
    Write-Host "Contenido del servidor FTP:" -ForegroundColor Yellow
    Write-Host $Content
    
    $StreamReader.Close()
    $ResponseStream.Close()
    $FtpResponse.Close()
    
    Write-Host "✅ Prueba de conexión FTP completada exitosamente" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error en autenticación FTP: $_" -ForegroundColor Red
    Write-Host "Tipo de error: $($_.Exception.GetType().Name)" -ForegroundColor Red
    
    # Intentar obtener más detalles
    if ($_ -match "530") {
        Write-Host "Posible causa: Credenciales incorrectas o usuario no existe" -ForegroundColor Yellow
    }
    
    exit 1
}
