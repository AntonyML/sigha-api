# Script de configuración manual guiada para FTP en IIS
Write-Host @"

════════════════════════════════════════════════════════════════
         CONFIGURACION MANUAL DE FTP EN IIS MANAGER
════════════════════════════════════════════════════════════════

Este script te guiará para configurar correctamente el sitio FTP-Backend.

PASOS A SEGUIR EN IIS MANAGER:
════════════════════════════════════════════════════════════════

PASO 1: Abre IIS Manager
━━━━━━━━━━━━━━━━━━━━━━━━
- Presiona Win + R
- Escribe: inetmgr
- Presiona ENTER

PASO 2: Navega al sitio FTP-Backend
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- En el panel izquierdo, expande tu servidor
- Expande "Sitios" (Sites)
- Haz clic en "FTP-Backend"

PASO 3: Configurar Autenticación FTP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- En el panel central, busca "Autenticación FTP" o "FTP Authentication"
- Doble clic en ella
- Verifica estos estados:
  ✓ Basic Authentication: HABILITADO (verde)
  ✓ Anonymous Authentication: DESHABILITADO (gris)
- Si necesitas cambiar algo:
  - Selecciona Basic Authentication
  - En el panel derecho, haz clic en "Habilitar" (Enable)
  - Selecciona Anonymous Authentication
  - En el panel derecho, haz clic en "Deshabilitar" (Disable)
- Clic en "Aplicar" (Apply) en el panel derecho

PASO 4: Configurar Reglas de Autorización
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- En el panel central, busca "Reglas de autorización FTP" o "FTP Authorization Rules"
- Doble clic en ella
- Elimina TODAS las reglas existentes (si las hay):
  - Selecciona cada regla
  - Haz clic en "Quitar" (Remove) en el panel derecho
- Agrega una nueva regla:
  - Haz clic derecho en el panel central
  - Selecciona "Agregar regla de permiso" (Add Allow Rule...)
  - En el cuadro de diálogo:
    * Selecciona: Usuarios especificados (Specified users)
    * Escribe: ftpadmin
    * Marca ✓ Lectura (Read)
    * Marca ✓ Escritura (Write)
  - Haz clic en OK
- Clic en "Aplicar" (Apply)

PASO 5: Configurar Configuración SSL de FTP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- En el panel central, busca "Configuración SSL de FTP" o "FTP SSL Settings"
- Doble clic en ella
- En la sección "Política SSL":
  - Selecciona: "Permitir conexiones SSL" (Allow SSL connections)
- Clic en "Aplicar" (Apply)

PASO 6: Reiniciar el sitio FTP
━━━━━━━━━━━━━━━━━━━━━━━━━━━
- En el panel izquierdo, haz clic en FTP-Backend
- En el panel derecho (Actions), busca "Reiniciar" (Restart)
- Haz clic en "Reiniciar"

════════════════════════════════════════════════════════════════

Una vez hayas completado TODOS estos pasos, presiona ENTER para 
continuar con la verificación...

"@ -ForegroundColor Cyan

Read-Host "`nPresiona ENTER cuando hayas completado todos los pasos en IIS Manager"

Write-Host "`n════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "Ahora vamos a VERIFICAR que la configuración es correcta..." -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════`n" -ForegroundColor Green

# Verificar la configuración
Write-Host "VERIFICACIÓN 1: Estado del sitio FTP" -ForegroundColor Yellow
& C:\Windows\System32\inetsrv\appcmd.exe list site "FTP-Backend"

Write-Host "`nVERIFICACIÓN 2: Listar configuración de autenticación" -ForegroundColor Yellow
& C:\Windows\System32\inetsrv\appcmd.exe list config "FTP-Backend" /section:system.ftpServer/security/authentication

Write-Host "`nVERIFICACIÓN 3: Listar reglas de autorización" -ForegroundColor Yellow
& C:\Windows\System32\inetsrv\appcmd.exe list config "FTP-Backend" /section:system.ftpServer/security/authorization

# Reiniciar FTP
Write-Host "`nReiniciando servicio FTP..." -ForegroundColor Yellow
Restart-Service FTPSVC -Force
Start-Sleep -Seconds 2

Write-Host "`n✅ Verificación completada" -ForegroundColor Green

# Prueba de conexión
Write-Host "`n════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "PRUEBA DE CONEXIÓN FTP" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

try {
    $ftpUri = "ftp://localhost/"
    $ftpRequest = [System.Net.FtpWebRequest]::Create($ftpUri)
    $ftpRequest.Credentials = New-Object System.Net.NetworkCredential("ftpadmin", "Ftp@2025Proyecto")
    $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
    $ftpRequest.UsePassive = $true
    $ftpRequest.EnableSsl = $false
    $ftpRequest.Timeout = 10000
    
    Write-Host "Intentando conectar a FTP con ftpadmin..." -ForegroundColor Yellow
    $response = $ftpRequest.GetResponse()
    
    Write-Host "`n✅ ¡CONEXIÓN EXITOSA!" -ForegroundColor Green
    Write-Host "Status: $($response.StatusDescription)" -ForegroundColor Green
    
    $stream = $response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $content = $reader.ReadToEnd()
    
    if ($content) {
        Write-Host "`nContenido del servidor FTP:" -ForegroundColor Yellow
        Write-Host $content
    }
    
    $reader.Close()
    $stream.Close()
    $response.Close()
    
    Write-Host "`n════════════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "✅ CONFIGURACIÓN CORRECTA - Listo para Jenkins" -ForegroundColor Green
    Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Green
    
} catch {
    Write-Host "`n❌ ERROR DE CONEXIÓN" -ForegroundColor Red
    Write-Host "Mensaje: $($_.Exception.InnerException.Message)" -ForegroundColor Red
    Write-Host "`nPor favor, revisa los pasos anteriores en IIS Manager" -ForegroundColor Yellow
}
