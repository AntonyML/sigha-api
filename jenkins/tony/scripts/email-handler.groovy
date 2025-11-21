def sendSuccessEmail(emailRecipient, sourceBranch, sourceRepo, testOutput, unitTestOutput, jmeterOutput) {
    emailext(
        to: emailRecipient,
        subject: "Jenkins Pipeline - Rama ${sourceBranch}: BUILD EXITOSO",
        body: """
            <html>
                <body>
                    <h2>Pipeline Build - EXITOSO</h2>
                    <p><strong>Repositorio:</strong> ${sourceRepo}</p>
                    <p><strong>Rama:</strong> ${sourceBranch}</p>
                    <p><strong>Build Number:</strong> ${BUILD_NUMBER}</p>
                    <p><strong>Build URL:</strong> <a href="${BUILD_URL}">${BUILD_URL}</a></p>
                    
                    <h3>Resumen de Ejecución:</h3>
                    <ul>
                        <li>Código descargado exitosamente</li>
                        <li>Push al repositorio de pruebas completado</li>
                        <li>Dependencias instaladas</li>
                        <li>Jest Tests ejecutados exitosamente</li>
                        <li>Unit Tests de Users Service ejecutados exitosamente</li>
                        <li>Performance Tests (JMeter) ejecutados exitosamente</li>
                        <li>Desplegado al repositorio de deploy</li>
                    </ul>

                    <h3>Detalles de los Tests Unitarios:</h3>
                    <pre>${testOutput}</pre>
                    
                    <h3>Detalles Unit Tests - Users Service:</h3>
                    <pre>${unitTestOutput}</pre>

                    <h3>Detalles Performance Tests - JMeter:</h3>
                    <pre>${jmeterOutput}</pre>

                    <hr>
                    <p><strong>Build ID:</strong> ${BUILD_NUMBER}</p>
                    <p><em>Este es un mensaje automático del sistema CI/CD</em></p>
                </body>
            </html>
        """,
        mimeType: 'text/html'
    )
}

def sendFailureEmail(emailRecipient, sourceBranch, sourceRepo, testOutput, unitTestOutput) {
    emailext(
        to: emailRecipient,
        subject: "Jenkins Pipeline - Rama ${sourceBranch}: BUILD FALLIDO",
        body: """
            <html>
                <body>
                    <h2>Pipeline Build - FALLIDO</h2>
                    <p><strong>Repositorio:</strong> ${sourceRepo}</p>
                    <p><strong>Rama:</strong> ${sourceBranch}</p>
                    <p><strong>Build Number:</strong> ${BUILD_NUMBER}</p>
                    <p><strong>Build URL:</strong> <a href="${BUILD_URL}">${BUILD_URL}</a></p>
                    
                    <h3>Causa del Fallo:</h3>
                    <p>Revisa los logs detallados a continuación para identificar el problema.</p>

                    <h3>Salida de Jest Tests:</h3>
                    <pre>${testOutput}</pre>
                    
                    <h3>Salida Unit Tests - Users Service:</h3>
                    <pre>${unitTestOutput}</pre>

                    <h3>Acciones Recomendadas:</h3>
                    <ol>
                        <li>Revisa los logs completos en: <a href="${BUILD_URL}console">${BUILD_URL}console</a></li>
                        <li>Verifica los cambios en la rama ${sourceBranch}</li>
                        <li>Ejecuta localmente: npm run test</li>
                        <li>Contacta al equipo de desarrollo si es necesario</li>
                    </ol>

                    <hr>
                    <p><strong>Build ID:</strong> ${BUILD_NUMBER}</p>
                    <p><em>Este es un mensaje automático del sistema CI/CD</em></p>
                </body>
            </html>
        """,
        mimeType: 'text/html'
    )
}

def sendUnstableEmail(emailRecipient, sourceBranch, sourceRepo) {
    emailext(
        to: emailRecipient,
        subject: "Jenkins Pipeline - Rama ${sourceBranch}: BUILD INESTABLE",
        body: """
            <html>
                <body>
                    <h2>Pipeline Build - INESTABLE</h2>
                    <p><strong>Repositorio:</strong> ${sourceRepo}</p>
                    <p><strong>Rama:</strong> ${sourceBranch}</p>
                    <p><strong>Build Number:</strong> ${BUILD_NUMBER}</p>
                    <p><strong>Build URL:</strong> <a href="${BUILD_URL}">${BUILD_URL}</a></p>
                    
                    <p>El pipeline completó pero hay algunos tests que fallaron o produjeron advertencias.</p>
                    <p>Por favor revisa los detalles en: <a href="${BUILD_URL}console">${BUILD_URL}console</a></p>

                    <hr>
                    <p><em>Este es un mensaje automático del sistema CI/CD</em></p>
                </body>
            </html>
        """,
        mimeType: 'text/html'
    )
}

return this
