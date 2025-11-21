param(
    [string]$SiteName = "backend",
    [int]$IisPort = 8086,
    [string]$NodeHost = "localhost",
    [int]$NodePort = 3000,
    [string]$PhysicalPath = "C:\ProyectoAnalisis\backend\www"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "IIS PROXY REVERSO - CONFIGURACION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si se ejecuta como admin
$isAdmin = [bool]([System.Security.Principal.WindowsIdentity]::GetCurrent().Groups -match "S-1-5-32-544")
if (-not $isAdmin) {
    Write-Host "ERROR: Este script DEBE ejecutarse como ADMINISTRADOR" -ForegroundColor Red
    exit 1
}

Write-Host "OK: Ejecutandose como ADMINISTRADOR" -ForegroundColor Green
Write-Host ""

try {
    # Importar modulo de IIS
    Write-Host "Importando modulo WebAdministration..." -ForegroundColor Yellow
    Import-Module WebAdministration -ErrorAction Stop
    Write-Host "OK: Modulo cargado" -ForegroundColor Green
    Write-Host ""
    
    # Verificar que la carpeta fisica exista
    Write-Host "Verificando carpeta fisica..." -ForegroundColor Yellow
    if (-not (Test-Path $PhysicalPath)) {
        Write-Host "ADVERTENCIA: Carpeta no existe. Creando: $PhysicalPath" -ForegroundColor Yellow
        New-Item -ItemType Directory -Path $PhysicalPath -Force | Out-Null
        Write-Host "OK: Carpeta creada" -ForegroundColor Green
    } else {
        Write-Host "OK: Carpeta existe: $PhysicalPath" -ForegroundColor Green
    }
    Write-Host ""
    
    # Obtener el sitio o crear si no existe
    Write-Host "Configurando sitio IIS '$SiteName' en puerto $IisPort..." -ForegroundColor Yellow
    
    $site = Get-IISSite -Name $SiteName -ErrorAction SilentlyContinue
    
    if ($site) {
        Write-Host "OK: Sitio '$SiteName' ya existe" -ForegroundColor Green
    } else {
        Write-Host "Creando sitio '$SiteName'..." -ForegroundColor Yellow
        
        # Crear binding - usar comillas simples para evitar interpretacion de variables
        $bindingInfo = "*:${IisPort}:"
        New-IISSite -Name $SiteName `
                   -BindingInformation $bindingInfo `
                   -PhysicalPath $PhysicalPath `
                   -Protocol http | Out-Null
        
        Write-Host "OK: Sitio creado: $SiteName" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Configurando URL Rewrite para proxy..." -ForegroundColor Yellow
    
    # Path al web.config
    $webConfigPath = Join-Path $PhysicalPath "web.config"
    
    # Crear o actualizar web.config con reglas de rewrite
    $webConfigContent = @"
<?xml version="1.0" encoding="utf-8"?>
<configuration>
    <system.webServer>
        <rewrite>
            <rules>
                <rule name="ReverseProxy" stopProcessing="true">
                    <match url="^(.*)$" />
                    <conditions>
                        <add input="{HTTP_HOST}" pattern="^localhost:$IisPort`$" />
                    </conditions>
                    <action type="Rewrite" url="http://$NodeHost`:$NodePort/{R:1}" />
                </rule>
            </rules>
            <outboundRules>
                <rule name="OutboundRewriteHttps" preCondition="ResponseIsHtml">
                    <match filterByTags="A, Form, Img" pattern="^http(s)?://$NodeHost`:$NodePort/(.*)" />
                    <action type="Rewrite" value="http{R:1}://localhost:$IisPort/{R:2}" />
                </rule>
                <preConditions>
                    <preCondition name="ResponseIsHtml">
                        <add input="{RESPONSE_CONTENT_TYPE}" pattern="^text/html" />
                    </preCondition>
                </preConditions>
            </outboundRules>
        </rewrite>
        
        <security>
            <requestFiltering>
                <verbs>
                    <add verb="GET" allowed="true" />
                    <add verb="POST" allowed="true" />
                    <add verb="PUT" allowed="true" />
                    <add verb="DELETE" allowed="true" />
                    <add verb="PATCH" allowed="true" />
                    <add verb="OPTIONS" allowed="true" />
                    <add verb="HEAD" allowed="true" />
                </verbs>
            </requestFiltering>
        </security>
        
        <proxy enabled="true" />
    </system.webServer>
</configuration>
"@
    
    # Escribir web.config
    Set-Content -Path $webConfigPath -Value $webConfigContent -Encoding UTF8 -Force
    Write-Host "OK: web.config configurado con reglas de proxy" -ForegroundColor Green
    Write-Host ""
    
    # Iniciar el sitio
    Write-Host "Iniciando sitio IIS..." -ForegroundColor Yellow
    $siteState = (Get-IISSite -Name $SiteName).State
    if ($siteState -ne "Started") {
        Start-IISSite -Name $SiteName
        Write-Host "OK: Sitio iniciado" -ForegroundColor Green
    } else {
        Write-Host "OK: Sitio ya estaba en ejecucion" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "OK: CONFIGURACION COMPLETADA" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Resumen de configuracion:" -ForegroundColor Cyan
    Write-Host "  Sitio IIS: $SiteName" -ForegroundColor White
    Write-Host "  Puerto visible: $IisPort" -ForegroundColor White
    Write-Host "  Redirecciona a: http://$NodeHost`:$NodePort" -ForegroundColor White
    Write-Host "  Carpeta: $PhysicalPath" -ForegroundColor White
    Write-Host ""
    Write-Host "PROXIMOS PASOS:" -ForegroundColor Yellow
    Write-Host "  1. Asegurate de que Node.js este corriendo en puerto $NodePort" -ForegroundColor Gray
    Write-Host "  2. Accede a http://localhost:$IisPort/" -ForegroundColor Gray
    Write-Host "  3. IIS redirecciona automaticamente a http://$NodeHost`:$NodePort" -ForegroundColor Gray
    Write-Host ""
    
    exit 0
}
catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "ERROR EN LA CONFIGURACION" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Soluciones:" -ForegroundColor Yellow
    Write-Host "  1. Ejecuta PowerShell como ADMINISTRADOR" -ForegroundColor Gray
    Write-Host "  2. Verifica que IIS este instalado" -ForegroundColor Gray
    Write-Host "  3. Instala URL Rewrite desde Microsoft" -ForegroundColor Gray
    exit 1
}
