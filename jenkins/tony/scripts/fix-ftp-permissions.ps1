# Script para verificar y configurar permisos FTP
Write-Host "=== FTP USER AND PERMISSIONS DIAGNOSTIC ===" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar que el usuario existe en Windows
Write-Host "1. Checking if ftpadmin user exists in Windows..." -ForegroundColor Yellow
try {
    $user = Get-LocalUser -Name "ftpadmin" -ErrorAction Stop
    Write-Host "User ftpadmin found: $($user.Enabled)" -ForegroundColor Green
    Write-Host "Full Name: $($user.FullName)" -ForegroundColor Green
} catch {
    Write-Host "ERROR: User ftpadmin not found" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 2. Get FTP site physical path
Write-Host "2. Getting FTP site physical path..." -ForegroundColor Yellow
$ftpPath = "C:\ProyectoAnalisis\backend\www"
if (Test-Path $ftpPath) {
    Write-Host "FTP path exists: $ftpPath" -ForegroundColor Green
    $pathInfo = Get-Item $ftpPath
    Write-Host "Permissions:" -ForegroundColor Yellow
    icacls $ftpPath
} else {
    Write-Host "ERROR: FTP path does not exist: $ftpPath" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 3. Check if ftpadmin has read/write permissions
Write-Host "3. Checking ftpadmin permissions on FTP path..." -ForegroundColor Yellow
$acl = Get-Acl $ftpPath
$ftpUserAccess = $acl.Access | Where-Object { $_.IdentityReference -like "*ftpadmin*" }

if ($ftpUserAccess) {
    Write-Host "User ftpadmin has access:" -ForegroundColor Green
    $ftpUserAccess | ForEach-Object { Write-Host "  - $($_.FileSystemRights)" -ForegroundColor Green }
} else {
    Write-Host "WARNING: User ftpadmin has NO access to FTP path" -ForegroundColor Yellow
    Write-Host "Adding Modify permissions for ftpadmin..." -ForegroundColor Yellow
    
    # Grant permissions
    $rule = New-Object System.Security.AccessControl.FileSystemAccessRule("ftpadmin", "Modify", "ContainerInherit,ObjectInherit", "None", "Allow")
    $acl.AddAccessRule($rule)
    Set-Acl -Path $ftpPath -AclObject $acl
    Write-Host "Permissions updated" -ForegroundColor Green
}
Write-Host ""

# 4. Check IIS FTP site configuration
Write-Host "4. Checking IIS FTP site configuration..." -ForegroundColor Yellow
$siteConfig = & "C:\Windows\System32\inetsrv\appcmd.exe" list site "FTP-Backend" 2>&1
Write-Host $siteConfig
Write-Host ""

# 5. Check FTP authentication methods
Write-Host "5. Checking FTP authentication configuration..." -ForegroundColor Yellow
$authConfig = & "C:\Windows\System32\inetsrv\appcmd.exe" list config -section:system.ftpServer/security/authentication 2>&1
Write-Host $authConfig
Write-Host ""

# 6. Test FTP connection with detailed diagnostics
Write-Host "6. Testing FTP connection..." -ForegroundColor Yellow
try {
    $credential = New-Object System.Net.NetworkCredential("ftpadmin", "Ftp@2025Proyecto")
    $ftpRequest = [System.Net.FtpWebRequest]::Create("ftp://localhost:21/")
    $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
    $ftpRequest.Credentials = $credential
    $ftpRequest.UseBinary = $false
    $ftpRequest.UsePassive = $true
    $ftpRequest.KeepAlive = $false
    $ftpRequest.EnableSsl = $false
    
    Write-Host "Attempting connection..." -ForegroundColor Yellow
    $response = $ftpRequest.GetResponse()
    Write-Host "SUCCESS: Connected to FTP server" -ForegroundColor Green
    Write-Host "Response: $($response.StatusDescription)" -ForegroundColor Green
    
    $stream = $response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $content = $reader.ReadToEnd()
    Write-Host "Server response:" -ForegroundColor Yellow
    Write-Host $content
    
    $reader.Close()
    $stream.Close()
    $response.Close()
    
} catch {
    Write-Host "ERROR: FTP connection failed" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    
    # Try to extract error code
    if ($_ -match "530") {
        Write-Host "" -ForegroundColor Red
        Write-Host "DIAGNOSIS: Error 530 means 'Not logged in'" -ForegroundColor Red
        Write-Host "Possible causes:" -ForegroundColor Yellow
        Write-Host "  1. Wrong password for ftpadmin" -ForegroundColor Yellow
        Write-Host "  2. User does not have FTP access rights in IIS" -ForegroundColor Yellow
        Write-Host "  3. FTP Basic Authentication not enabled" -ForegroundColor Yellow
    }
}
