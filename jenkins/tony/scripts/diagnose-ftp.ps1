Write-Host "=== FTP SERVER DIAGNOSTICS ===" -ForegroundColor Cyan
Write-Host ""

# 1. Check FTP service
Write-Host "1. Checking FTP Service..." -ForegroundColor Yellow
$ftpService = Get-Service FTPSVC
Write-Host "Status: $($ftpService.Status)" -ForegroundColor Green
Write-Host ""

# 2. List FTP Sites
Write-Host "2. Listing FTP Sites..." -ForegroundColor Yellow
$sites = & "C:\Windows\System32\inetsrv\appcmd.exe" list site /text:name
foreach ($site in $sites) {
    if ($site -like "*FTP*" -or $site -like "*ftp*") {
        Write-Host "Site: $site" -ForegroundColor Green
        $details = & "C:\Windows\System32\inetsrv\appcmd.exe" list site "$site"
        Write-Host $details
    }
}
Write-Host ""

# 3. List FTP Users
Write-Host "3. Listing FTP Users in IIS..." -ForegroundColor Yellow
$ftpUsers = & "C:\Windows\System32\inetsrv\appcmd.exe" list config -section:basicAuthentication
Write-Host $ftpUsers
Write-Host ""

# 4. Test connection without auth
Write-Host "4. Testing basic FTP connection (no auth)..." -ForegroundColor Yellow
try {
    $ftpUri = "ftp://localhost:21/"
    $ftpRequest = [System.Net.FtpWebRequest]::Create($ftpUri)
    $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
    $ftpRequest.UseBinary = $false
    $ftpRequest.UsePassive = $true
    $ftpRequest.KeepAlive = $false
    $ftpRequest.EnableSsl = $false
    
    # Use anonymous credentials
    $ftpRequest.Credentials = New-Object System.Net.NetworkCredential("", "")
    
    $response = $ftpRequest.GetResponse()
    Write-Host "Anonymous connection successful" -ForegroundColor Green
    $response.Close()
} catch {
    Write-Host "Anonymous connection failed: $($_.Exception.Message)" -ForegroundColor Yellow
}
Write-Host ""

# 5. Test with ftpadmin
Write-Host "5. Testing connection with ftpadmin..." -ForegroundColor Yellow
try {
    $ftpUri = "ftp://localhost:21/"
    $credential = New-Object System.Net.NetworkCredential("ftpadmin", "Ftp@2025Proyecto")
    
    $ftpRequest = [System.Net.FtpWebRequest]::Create($ftpUri)
    $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
    $ftpRequest.Credentials = $credential
    $ftpRequest.UseBinary = $false
    $ftpRequest.UsePassive = $true
    $ftpRequest.KeepAlive = $false
    $ftpRequest.EnableSsl = $false
    
    $response = $ftpRequest.GetResponse()
    Write-Host "Connection with ftpadmin successful" -ForegroundColor Green
    
    $stream = $response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $content = $reader.ReadToEnd()
    Write-Host "Server contents:" -ForegroundColor Green
    Write-Host $content
    
    $reader.Close()
    $stream.Close()
    $response.Close()
} catch {
    Write-Host "Connection with ftpadmin failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 6. Check FTP home directory
Write-Host "6. Checking FTP Home Directory..." -ForegroundColor Yellow
$ftpSiteDir = & "C:\Windows\System32\inetsrv\appcmd.exe" list site "FTP-Backend" /text:physicalPath 2>$null
if ($ftpSiteDir) {
    Write-Host "FTP Site Physical Path: $ftpSiteDir" -ForegroundColor Green
    if (Test-Path $ftpSiteDir) {
        Get-Item $ftpSiteDir | Select-Object FullName, Attributes
    }
} else {
    Write-Host "Could not determine FTP site path" -ForegroundColor Yellow
}
