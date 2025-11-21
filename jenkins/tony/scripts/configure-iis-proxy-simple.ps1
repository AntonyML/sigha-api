param(
    [string]$SiteName = "backend-proxy",
    [int]$IisPort = 80,
    [string]$NodeHost = "localhost",
    [int]$NodePort = 3001,
    [string]$PhysicalPath = "C:\ProyectoAnalisis\backend\www"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "IIS PROXY INVERSO - CONFIGURACION SIMPLE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$isAdmin = [bool]([System.Security.Principal.WindowsIdentity]::GetCurrent().Groups -match "S-1-5-32-544")
if (-not $isAdmin) {
    Write-Host "ERROR: Ejecuta como ADMINISTRADOR" -ForegroundColor Red
    exit 1
}

try {
    Write-Host "Importando modulo WebAdministration..." -ForegroundColor Yellow
    Import-Module WebAdministration -ErrorAction Stop
    Write-Host "OK: Modulo cargado" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Verificando carpeta fisica..." -ForegroundColor Yellow
    if (-not (Test-Path $PhysicalPath)) {
        New-Item -ItemType Directory -Path $PhysicalPath -Force | Out-Null
    }
    Write-Host "OK: Carpeta $PhysicalPath" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Configurando sitio IIS '$SiteName' en puerto $IisPort..." -ForegroundColor Yellow
    
    $site = Get-IISSite -Name $SiteName -ErrorAction SilentlyContinue
    
    if ($site) {
        Write-Host "OK: Sitio ya existe" -ForegroundColor Green
    } else {
        Write-Host "Creando sitio..." -ForegroundColor Yellow
        $bindingInfo = "*:${IisPort}:"
        New-IISSite -Name $SiteName `
                   -BindingInformation $bindingInfo `
                   -PhysicalPath $PhysicalPath `
                   -Protocol http | Out-Null
        Write-Host "OK: Sitio creado" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Creando web.config con proxy inverso..." -ForegroundColor Yellow
    
    $webConfigPath = Join-Path $PhysicalPath "web.config"
    
    $webConfigContent = @"
<?xml version="1.0" encoding="utf-8"?>
<configuration>
    <system.webServer>
        <rewrite>
            <rules>
                <rule name="ReverseProxyToNodeJs" stopProcessing="true">
                    <match url="^(.*)$" />
                    <action type="Rewrite" url="http://$NodeHost`:$NodePort/{R:1}" />
                </rule>
            </rules>
        </rewrite>
        <proxy enabled="true" />
        <security>
            <requestFiltering>
                <verbs>
                    <add verb="GET" allowed="true" />
                    <add verb="POST" allowed="true" />
                    <add verb="PUT" allowed="true" />
                    <add verb="DELETE" allowed="true" />
                    <add verb="PATCH" allowed="true" />
                    <add verb="OPTIONS" allowed="true" />
                </verbs>
            </requestFiltering>
        </security>
    </system.webServer>
</configuration>
"@
    
    Set-Content -Path $webConfigPath -Value $webConfigContent -Encoding UTF8 -Force
    Write-Host "OK: web.config creado" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "OK: CONFIGURACION COMPLETADA" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Configuracion:" -ForegroundColor Cyan
    Write-Host "  Puerto IIS: $IisPort" -ForegroundColor White
    Write-Host "  Node.js: http://$NodeHost`:$NodePort" -ForegroundColor White
    Write-Host "  Carpeta: $PhysicalPath" -ForegroundColor White
    Write-Host ""
    Write-Host "Acceso:" -ForegroundColor Cyan
    Write-Host "  Usuario: http://localhost" -ForegroundColor White
    Write-Host "  Internamente redirige a: http://$NodeHost`:$NodePort" -ForegroundColor White
    Write-Host ""
    
    exit 0
}
catch {
    Write-Host ""
    Write-Host "ERROR: $_" -ForegroundColor Red
    exit 1
}
