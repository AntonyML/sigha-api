def getConfig() {
    return [
        source: [
            repo: 'https://git.ucr.ac.cr/proyecto_analisis/backend_nest_js_hogar_de_ancianos',
            branch: 'dev'
        ],
        test: [
            repo: 'https://git.ucr.ac.cr/proyecto_analisis/test_backend_nest_js_hogar_de_ancianos',
            branch: 'dev'
        ],
        deploy: [
            repo: 'https://git.ucr.ac.cr/proyecto_analisis/deploy_backend_nest_js_hogar_de_ancianos',
            branch: 'master'
        ],
        email: [
            recipient: 'antonyml2016@gmail.com'
        ],
        timeouts: [
            build: [time: 30, unit: 'MINUTES']
        ]
    ]
}

return this
