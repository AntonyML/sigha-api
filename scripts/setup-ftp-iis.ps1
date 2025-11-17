# Script para configurar FTP en IIS
# Ejecutar como ADMIN en PowerShell
# Este script:
# 1. Habilita el servicio FTP en IIS
# 2. Crea un sitio FTP apuntando a C:\ProyectoAnalisis\backend\www
# 3. Crea usuario local ftpadmin
# 4. Configura permisos

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CONFIGURACION DE FTP EN IIS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si se ejecuta como admin
$isAdmin = [bool]([System.Security.Principal.WindowsIdentity]::GetCurrent().Groups -match "S-1-5-32-544")
if (-not $isAdmin) {
    Write-Host "ERROR: Este script debe ejecutarse como ADMINISTRADOR" -ForegroundColor Red
    Write-Host "Abre PowerShell como admin y vuelve a intentar." -ForegroundColor Red
    exit 1
}

Write-Host "✓ Ejecutando como administrador" -ForegroundColor Green
Write-Host ""

# PASO 1: Verificar que la carpeta existe
$ftpPath = "C:\ProyectoAnalisis\backend\www"
if (-not (Test-Path $ftpPath)) {
    Write-Host "ERROR: La carpeta $ftpPath no existe" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Carpeta FTP existe: $ftpPath" -ForegroundColor Green
Write-Host ""

# PASO 2: Crear usuario local ftpadmin si no existe
Write-Host "Verificando usuario ftpadmin..." -ForegroundColor Yellow
try {
    $user = Get-LocalUser -Name "ftpadmin" -ErrorAction SilentlyContinue
    if ($user) {
        Write-Host "✓ Usuario ftpadmin ya existe" -ForegroundColor Green
    } else {
        Write-Host "Creando usuario ftpadmin..." -ForegroundColor Yellow
        $password = ConvertTo-SecureString "Ftp@2025Proyecto" -AsPlainText -Force
        New-LocalUser -Name "ftpadmin" -Password $password -Description "FTP Admin User for Jenkins Deploy" -PasswordNeverExpires | Out-Null
        Write-Host "✓ Usuario ftpadmin creado exitosamente" -ForegroundColor Green
    }
} catch {
    Write-Host "Error creating user: $_" -ForegroundColor Red
}
Write-Host ""

# PASO 3: Agregar usuario ftpadmin al grupo IIS_IUSRS (necesario para FTP)
Write-Host "Agregando usuario ftpadmin al grupo IIS_IUSRS..." -ForegroundColor Yellow
try {
    Add-LocalGroupMember -Group "IIS_IUSRS" -Member "ftpadmin" -ErrorAction SilentlyContinue
    Write-Host "✓ Usuario agregado a IIS_IUSRS" -ForegroundColor Green
} catch {
    Write-Host "Usuario ya está en el grupo o error: $_" -ForegroundColor Yellow
}
Write-Host ""

# PASO 4: Configurar permisos NTFS en la carpeta FTP
Write-Host "Configurando permisos NTFS..." -ForegroundColor Yellow
try {
    # Dar permisos Full Control a ftpadmin
    $acl = Get-Acl -Path $ftpPath
    $permission = New-Object System.Security.AccessControl.FileSystemAccessRule(
        "ftpadmin",
        "FullControl",
        "ContainerInherit,ObjectInherit",
        "None",
        "Allow"
    )
    $acl.AddAccessRule($permission)
    Set-Acl -Path $ftpPath -AclObject $acl
    Write-Host "✓ Permisos configurados para ftpadmin" -ForegroundColor Green
} catch {
    Write-Host "Error configurando permisos: $_" -ForegroundColor Yellow
}
Write-Host ""

# PASO 5: Importar módulo IIS
Write-Host "Importando módulo WebAdministration..." -ForegroundColor Yellow
try {
    Import-Module WebAdministration -ErrorAction Stop
    Write-Host "✓ Módulo WebAdministration importado" -ForegroundColor Green
} catch {
    Write-Host "ERROR: No se pudo importar WebAdministration" -ForegroundColor Red
    Write-Host "Verifica que IIS esté instalado" -ForegroundColor Red
    exit 1
}
Write-Host ""

# PASO 6: Crear sitio FTP
$ftpSiteName = "BackendFTP"
Write-Host "Creando sitio FTP: $ftpSiteName" -ForegroundColor Yellow

$ftpSite = Get-WebSite -Name $ftpSiteName -ErrorAction SilentlyContinue
if ($ftpSite) {
    Write-Host "⚠ Sitio FTP ya existe. Removiendo..." -ForegroundColor Yellow
    Remove-WebSite -Name $ftpSiteName -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

try {
    # Crear sitio FTP
    New-WebFtpSite -Name $ftpSiteName `
                   -PhysicalPath $ftpPath `
                   -Port 21 `
                   -IPAddress "*" `
                   -ErrorAction Stop | Out-Null
    
    Write-Host "✓ Sitio FTP '$ftpSiteName' creado en puerto 21" -ForegroundColor Green
} catch {
    Write-Host "ERROR: No se pudo crear sitio FTP: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# PASO 7: Configurar autenticación FTP
Write-Host "Configurando autenticación FTP..." -ForegroundColor Yellow
try {
    # Habilitar autenticación básica
    Set-WebConfigurationProperty -PSPath "IIS:\sites\$ftpSiteName" `
                                 -Filter "system.ftpServer/security/authentication/basicAuthentication" `
                                 -Name "enabled" `
                                 -Value $true `
                                 -ErrorAction Stop
    
    # Deshabilitar autenticación anónima
    Set-WebConfigurationProperty -PSPath "IIS:\sites\$ftpSiteName" `
                                 -Filter "system.ftpServer/security/authentication/anonymousAuthentication" `
                                 -Name "enabled" `
                                 -Value $false `
                                 -ErrorAction Stop
    
    Write-Host "✓ Autenticación configurada (Basic auth habilitada, Anonymous deshabilitada)" -ForegroundColor Green
} catch {
    Write-Host "Error configurando autenticación: $_" -ForegroundColor Yellow
}
Write-Host ""

# PASO 8: Configurar permisos de lectura/escritura FTP
Write-Host "Configurando permisos de lectura/escritura FTP..." -ForegroundColor Yellow
try {
    # Habilitar lectura
    Set-WebConfigurationProperty -PSPath "IIS:\sites\$ftpSiteName" `
                                 -Filter "system.ftpServer/security/fileAuthorization" `
                                 -Name "*(Read)" `
                                 -Value $true `
                                 -ErrorAction Stop
    
    # Habilitar escritura
    Set-WebConfigurationProperty -PSPath "IIS:\sites\$ftpSiteName" `
                                 -Filter "system.ftpServer/security/fileAuthorization" `
                                 -Name "*(Write)" `
                                 -Value $true `
                                 -ErrorAction Stop
    
    Write-Host "✓ Permisos Read/Write habilitados" -ForegroundColor Green
} catch {
    Write-Host "Error configurando permisos FTP: $_" -ForegroundColor Yellow
}
Write-Host ""

# PASO 9: Iniciar sitio FTP
Write-Host "Iniciando sitio FTP..." -ForegroundColor Yellow
try {
    Start-WebSite -Name $ftpSiteName -ErrorAction Stop
    Write-Host "✓ Sitio FTP iniciado" -ForegroundColor Green
} catch {
    Write-Host "ERROR: No se pudo iniciar sitio FTP: $_" -ForegroundColor Red
}
Write-Host ""

# PASO 10: Verificar estado
Write-Host "Verificando estado del sitio FTP..." -ForegroundColor Yellow
$site = Get-WebSite -Name $ftpSiteName -ErrorAction SilentlyContinue
if ($site) {
    Write-Host "✓ Sitio: $($site.Name)" -ForegroundColor Green
    Write-Host "✓ Estado: $($site.State)" -ForegroundColor Green
    Write-Host "✓ Ruta física: $($site.PhysicalPath)" -ForegroundColor Green
} else {
    Write-Host "ERROR: No se pudo verificar el sitio" -ForegroundColor Red
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ CONFIGURACION FTP COMPLETADA" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Información para Jenkins:" -ForegroundColor Cyan
Write-Host "  FTP Host: localhost" -ForegroundColor White
Write-Host "  FTP Port: 21" -ForegroundColor White
Write-Host "  FTP User: ftpadmin" -ForegroundColor White
Write-Host "  FTP Pass: Ftp@2025Proyecto" -ForegroundColor White
Write-Host "  FTP Path: /backend/www" -ForegroundColor White
Write-Host "  Physical: $ftpPath" -ForegroundColor White
Write-Host ""
Write-Host "Prueba de conectividad (desde cmd):" -ForegroundColor Yellow
Write-Host "  ftp localhost" -ForegroundColor Gray
Write-Host "  Usuario: ftpadmin" -ForegroundColor Gray
Write-Host "  Password: Ftp@2025Proyecto" -ForegroundColor Gray
Write-Host ""
