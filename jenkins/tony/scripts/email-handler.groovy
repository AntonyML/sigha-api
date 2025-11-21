def getEmailTemplate(title, statusColor, statusText, content, footerMessage = "") {
    return """
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f5f5f5;
                }
                
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                
                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 40px 20px;
                    text-align: center;
                    border-bottom: 5px solid ${statusColor};
                }
                
                .header h1 {
                    font-size: 28px;
                    margin-bottom: 10px;
                    font-weight: 600;
                }
                
                .status-badge {
                    display: inline-block;
                    background-color: ${statusColor};
                    color: white;
                    padding: 10px 20px;
                    border-radius: 25px;
                    font-weight: bold;
                    font-size: 14px;
                    margin-top: 10px;
                }
                
                .content {
                    padding: 40px 30px;
                }
                
                .info-section {
                    margin-bottom: 30px;
                    border-left: 4px solid ${statusColor};
                    padding-left: 20px;
                    background-color: #f9f9f9;
                    padding: 20px;
                    padding-left: 20px;
                    border-radius: 4px;
                }
                
                .info-section h3 {
                    color: ${statusColor};
                    font-size: 16px;
                    margin-bottom: 15px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                
                .info-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px 0;
                    border-bottom: 1px solid #eee;
                }
                
                .info-item:last-child {
                    border-bottom: none;
                }
                
                .info-label {
                    font-weight: 600;
                    color: #667eea;
                    min-width: 150px;
                }
                
                .info-value {
                    color: #555;
                    word-break: break-all;
                }
                
                .details-section {
                    margin-bottom: 30px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    overflow: hidden;
                }
                
                .details-title {
                    background-color: #f0f0f0;
                    padding: 15px 20px;
                    font-weight: 600;
                    color: #333;
                    border-bottom: 1px solid #ddd;
                    display: flex;
                    align-items: center;
                }
                
                .details-title::before {
                    content: "▸";
                    margin-right: 10px;
                    color: ${statusColor};
                    font-size: 18px;
                }
                
                .details-content {
                    padding: 15px 20px;
                    background-color: #fafafa;
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    overflow-x: auto;
                    max-height: 300px;
                    overflow-y: auto;
                    color: #444;
                    line-height: 1.4;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                }
                
                .checklist {
                    list-style: none;
                    margin: 15px 0;
                }
                
                .checklist li {
                    padding: 10px 0;
                    padding-left: 30px;
                    position: relative;
                }
                
                .checklist li::before {
                    content: "✓";
                    position: absolute;
                    left: 0;
                    color: #4caf50;
                    font-weight: bold;
                    font-size: 16px;
                }
                
                .error-list {
                    list-style: none;
                    margin: 15px 0;
                }
                
                .error-list li {
                    padding: 10px 0;
                    padding-left: 30px;
                    position: relative;
                    color: #d32f2f;
                }
                
                .error-list li::before {
                    content: "✗";
                    position: absolute;
                    left: 0;
                    color: #d32f2f;
                    font-weight: bold;
                    font-size: 16px;
                }
                
                .action-button {
                    display: inline-block;
                    background-color: ${statusColor};
                    color: white;
                    padding: 12px 25px;
                    text-decoration: none;
                    border-radius: 4px;
                    margin: 10px 10px 10px 0;
                    font-weight: 600;
                    font-size: 14px;
                    transition: background-color 0.3s ease;
                }
                
                .action-button:hover {
                    opacity: 0.9;
                }
                
                .footer {
                    background-color: #f5f5f5;
                    padding: 20px 30px;
                    border-top: 1px solid #ddd;
                    text-align: center;
                    font-size: 12px;
                    color: #999;
                }
                
                .footer-divider {
                    border-top: 2px solid ${statusColor};
                    margin: 0 0 15px 0;
                }
                
                .recommended-actions {
                    background-color: #e3f2fd;
                    border-left: 4px solid #2196f3;
                    padding: 15px 20px;
                    border-radius: 4px;
                    margin: 20px 0;
                }
                
                .recommended-actions h4 {
                    color: #2196f3;
                    margin-bottom: 10px;
                }
                
                .recommended-actions ol {
                    padding-left: 20px;
                    color: #333;
                }
                
                .recommended-actions li {
                    margin-bottom: 8px;
                }
                
                .success-color {
                    color: #4caf50;
                }
                
                .error-color {
                    color: #d32f2f;
                }
                
                @media (max-width: 600px) {
                    .info-item {
                        flex-direction: column;
                    }
                    
                    .header {
                        padding: 20px 10px;
                    }
                    
                    .content {
                        padding: 20px 15px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>${title}</h1>
                    <div class="status-badge">${statusText}</div>
                </div>
                
                <div class="content">
                    ${content}
                </div>
                
                <div class="footer">
                    <div class="footer-divider"></div>
                    <p>${footerMessage}</p>
                    <p>Este es un mensaje automático del sistema CI/CD Jenkins</p>
                    <p>Por favor no responda a este correo</p>
                </div>
            </div>
        </body>
        </html>
    """
}

def sendSuccessEmail(emailRecipient, sourceBranch, sourceRepo, testOutput, unitTestOutput, jmeterOutput, commit, deployStatus) {
    def infoSection = """
        <div class="info-section">
            <h3>Información del Build</h3>
            <div class="info-item">
                <span class="info-label">Repositorio:</span>
                <span class="info-value">${sourceRepo}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Rama:</span>
                <span class="info-value">${sourceBranch}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Commit:</span>
                <span class="info-value">${commit}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Build #:</span>
                <span class="info-value">${BUILD_NUMBER}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Estado Deploy:</span>
                <span class="info-value"><span class="success-color"><strong>${deployStatus}</strong></span></span>
            </div>
            <div class="info-item">
                <span class="info-label">URL:</span>
                <span class="info-value"><a href="${BUILD_URL}" style="color: #667eea; text-decoration: none;">Ver en Jenkins</a></span>
            </div>
        </div>
    """
    
    def executionSummary = """
        <div class="details-section">
            <div class="details-title">Resumen de Ejecución</div>
            <div style="padding: 20px;">
                <ul class="checklist">
                    <li>Código descargado exitosamente</li>
                    <li>Push al repositorio de pruebas completado</li>
                    <li>Dependencias instaladas (npm install)</li>
                    <li>Jest Tests ejecutados exitosamente</li>
                    <li>Unit Tests de Users Service ejecutados</li>
                    <li>Performance Tests (JMeter) ejecutados</li>
                    <li>Merge dev → master completado</li>
                    <li>Aplicación compilada</li>
                    <li>Deployment a IIS vía FTP completado</li>
                    <li>Servidor reiniciado</li>
                    <li>Push al repositorio de deploy completado</li>
                </ul>
            </div>
        </div>
    """
    
    def testDetails = """
        <div class="details-section">
            <div class="details-title">Detalles Jest Tests</div>
            <div class="details-content">${testOutput ?: 'Sin salida disponible'}</div>
        </div>
    """
    
    def unitTestDetails = """
        <div class="details-section">
            <div class="details-title">Detalles Unit Tests - Users Service</div>
            <div class="details-content">${unitTestOutput ?: 'Sin salida disponible'}</div>
        </div>
    """
    
    def jmeterDetails = """
        <div class="details-section">
            <div class="details-title">Detalles Performance Tests - JMeter</div>
            <div class="details-content">${jmeterOutput ?: 'Sin salida disponible'}</div>
        </div>
    """
    
    def accessInfo = """
        <div class="recommended-actions">
            <h4>🚀 Acceso al Sistema</h4>
            <p style="margin: 0;">La aplicación está disponible en: <strong>http://localhost:8086</strong></p>
        </div>
    """
    
    def contentHtml = infoSection + executionSummary + testDetails + unitTestDetails + jmeterDetails + accessInfo
    def fullBody = getEmailTemplate("Pipeline Build - EXITOSO", "#4caf50", "✓ DEPLOYMENT EXITOSO", contentHtml, "Build ID: ${BUILD_NUMBER}")
    
    emailext(
        to: emailRecipient,
        subject: "✓ Jenkins Pipeline - Rama ${sourceBranch}: DEPLOYMENT EXITOSO",
        body: fullBody,
        mimeType: 'text/html'
    )
}

def sendFailureEmail(emailRecipient, sourceBranch, sourceRepo, testOutput, unitTestOutput, failureStage) {
    def infoSection = """
        <div class="info-section">
            <h3>Información del Build</h3>
            <div class="info-item">
                <span class="info-label">Repositorio:</span>
                <span class="info-value">${sourceRepo}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Rama:</span>
                <span class="info-value">${sourceBranch}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Build #:</span>
                <span class="info-value">${BUILD_NUMBER}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Falló en Stage:</span>
                <span class="info-value"><span class="error-color"><strong>${failureStage}</strong></span></span>
            </div>
            <div class="info-item">
                <span class="info-label">URL:</span>
                <span class="info-value"><a href="${BUILD_URL}console" style="color: #d32f2f; text-decoration: none;">Ver Logs Completos</a></span>
            </div>
        </div>
    """
    
    def failureReason = """
        <div class="recommended-actions" style="background-color: #ffebee; border-left-color: #d32f2f;">
            <h4 style="color: #d32f2f;">✗ Causa del Fallo</h4>
            <p style="margin: 0;">El pipeline se detuvo en el stage: <strong>${failureStage}</strong></p>
            <p style="margin: 10px 0 0 0;">Revisa los logs detallados para identificar el problema específico.</p>
        </div>
    """
    
    def testDetails = """
        <div class="details-section">
            <div class="details-title">Salida Jest Tests</div>
            <div class="details-content">${testOutput ?: 'Sin salida disponible'}</div>
        </div>
    """
    
    def unitTestDetails = """
        <div class="details-section">
            <div class="details-title">Salida Unit Tests - Users Service</div>
            <div class="details-content">${unitTestOutput ?: 'Sin salida disponible'}</div>
        </div>
    """
    
    def recommendedActions = """
        <div class="recommended-actions">
            <h4>📋 Acciones Recomendadas</h4>
            <ol>
                <li>Revisa los <a href="${BUILD_URL}console" style="color: #2196f3; text-decoration: none;">logs completos</a> en Jenkins</li>
                <li>Verifica los cambios en la rama <strong>${sourceBranch}</strong></li>
                <li>Ejecuta localmente: <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px;">npm run test</code></li>
                <li>Contacta al equipo de desarrollo si necesitas ayuda</li>
            </ol>
        </div>
    """
    
    def contentHtml = infoSection + failureReason + testDetails + unitTestDetails + recommendedActions
    def fullBody = getEmailTemplate("Pipeline Build - FALLIDO", "#d32f2f", "✗ BUILD FALLIDO", contentHtml, "Build ID: ${BUILD_NUMBER}")
    
    emailext(
        to: emailRecipient,
        subject: "✗ Jenkins Pipeline - Rama ${sourceBranch}: BUILD FALLIDO",
        body: fullBody,
        mimeType: 'text/html'
    )
}

def sendUnstableEmail(emailRecipient, sourceBranch, sourceRepo) {
    def infoSection = """
        <div class="info-section">
            <h3>Información del Build</h3>
            <div class="info-item">
                <span class="info-label">Repositorio:</span>
                <span class="info-value">${sourceRepo}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Rama:</span>
                <span class="info-value">${sourceBranch}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Build #:</span>
                <span class="info-value">${BUILD_NUMBER}</span>
            </div>
            <div class="info-item">
                <span class="info-label">URL:</span>
                <span class="info-value"><a href="${BUILD_URL}console" style="color: #ff9800; text-decoration: none;">Ver Detalles</a></span>
            </div>
        </div>
    """
    
    def unstableMessage = """
        <div class="recommended-actions" style="background-color: #fff3e0; border-left-color: #ff9800;">
            <h4 style="color: #ff9800;">⚠ Build Inestable</h4>
            <p style="margin: 0;">El pipeline completó pero hay algunos tests que fallaron o produjeron advertencias.</p>
            <p style="margin: 10px 0 0 0;">Esto puede afectar la estabilidad de la aplicación en producción.</p>
        </div>
    """
    
    def recommendedActions = """
        <div class="recommended-actions">
            <h4>📋 Acciones Recomendadas</h4>
            <ol>
                <li>Revisa los <a href="${BUILD_URL}console" style="color: #2196f3; text-decoration: none;">detalles del build</a></li>
                <li>Investiga los tests que fallaron</li>
                <li>Considera si el deploy debería pausarse hasta resolver los problemas</li>
                <li>Contacta al equipo de QA para más información</li>
            </ol>
        </div>
    """
    
    def contentHtml = infoSection + unstableMessage + recommendedActions
    def fullBody = getEmailTemplate("Pipeline Build - INESTABLE", "#ff9800", "⚠ BUILD INESTABLE", contentHtml, "Build ID: ${BUILD_NUMBER}")
    
    emailext(
        to: emailRecipient,
        subject: "⚠ Jenkins Pipeline - Rama ${sourceBranch}: BUILD INESTABLE",
        body: fullBody,
        mimeType: 'text/html'
    )
}

return this
