node {

    catchBuild([], ['engineering'], cleanup: { sh 'make down' }) {

        stage('pre-build') {
            resetWs()
        }

        def product = sh(script: 'make get-build-var var=product', returnStdout: true)

        stage('build') {
            def registry_url = sh(script: 'make get-build-var var=docker_registry_url', returnStdout: true)
            def registry_creds = sh(script: 'make get-build-var var=docker_registry_credentials', returnStdout: true)

            docker.withRegistry(registry_url, registry_creds) {
                sh 'make down'  // make sure not running from a previous build that broke
                sh 'make up'    // bring up docker-compose services for this specific application build
                sh 'make'
            }
        }

        stage('package') {
            debutilsDocker(product) {
                createDebPackage(debContext, 'DEBIAN') {
                    sh "fakeroot make install-generic DESTDIR=${destdir}"
                }
                createDebPackage(debContext, 'DEBIAN.orange') {
                    sh "fakeroot make install-orange DESTDIR=${destdir}"
                }
                publishDebPackages(debContext)
            }
        }

    }
}

// vim: sts=4 sw=4 syntax=groovy expandtab:
