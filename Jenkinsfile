@Library(['dockerizer', 'code-qualities', 'securityscans']) _

def image = 'sm1986/playlist'
def version = '1.0.0'
def envName = 'dev'
def imageTag = envName ? "${version}-${envName}" : version
def services = ['frontend', 'backend']

podTemplate(cloud: 'kubernetes', containers: [
    containerTemplate(name: 'jnlp', image: 'jenkins/inbound-agent:latest'),
    containerTemplate(
        name: 'docker', image: 'docker:26-dind', privileged: true,
        args: '--storage-driver=vfs',
        envVars: [envVar(key: 'DOCKER_TLS_CERTDIR', value: '')]
    ),
    containerTemplate(name: 'composer', image: 'sm1986/composer', command: 'sleep', args: '1d'),
    containerTemplate(name: 'node', image: 'node:26.5.0-alpine', command: 'sleep', args: '1d'),
    // Match the Jenkins agent so shell steps can write shared workspace launch files.
    containerTemplate(
        name: 'checkov', image: 'sm1986/checkov', command: 'sleep', args: '1d',
        runAsUser: '1000', runAsGroup: '1000'
    ),
    containerTemplate(
        name: 'semgrep', image: 'sm1986/semgrep', command: 'sleep', args: '1d',
        runAsUser: '1000', runAsGroup: '1000'
    )
], volumes: [emptyDirVolume(mountPath: '/var/lib/docker', memory: false)]) {
    node(POD_LABEL) {
        stage('Checkout') {
            checkout scm
        }
        stage('Environment preparations') {
            parallel(
                'Install PHP dependencies': {
                    container('composer') {
                        // Checkout and Composer run as different users in the shared pod.
                        sh 'git config --global --add safe.directory "$WORKSPACE"'
                        dir('backend') {
                            sh 'composer install --no-interaction --prefer-dist --no-progress --optimize-autoloader'
                        }
                    }
                },
                'Wait for Docker': {
                    container('docker') {
                        // The shared-library Trivy helper uses a Bash shebang.
                        sh 'apk add --no-cache bash'
                        timeout(time: 2, unit: 'MINUTES') {
                            sh 'until docker info >/dev/null 2>&1; do sleep 2; done'
                        }
                    }
                }
            )
        }
        stage('Code Quality') {
            parallel(
                'Frontend Tests': {
                    container('node') {
                        dir('frontend') {
                            sh 'npm ci'
                            sh 'npm test'
                        }
                    }
                },
                'PHP CS Fixer': {
                    container('composer') {
                        dir('backend') { phpCodeQuality.phpCSFixerTesting() }
                    }
                },
                'PHP CodeSniffer': {
                    container('composer') {
                        dir('backend') { phpCodeQuality.phpCodeSnifferTesting() }
                    }
                },
                'PHPStan': {
                    container('composer') {
                        dir('backend') { phpCodeQuality.phpStanTesting() }
                    }
                }
            )
        }
        stage('Security Scans') {
            parallel(
                'Composer Audit': {
                    container('composer') {
                        dir('backend') {
                            try {
                                sh 'composer audit --no-interaction > composer-audit.txt 2>&1'
                            } finally {
                                sh 'cat composer-audit.txt'
                                archiveArtifacts(artifacts: 'composer-audit.txt', allowEmptyArchive: true)
                            }
                        }
                    }
                },
                'Semgrep PHP': {
                    container('semgrep') {
                        dir('backend') {
                            try {
                                sh '/tmp/semgrep-venv/bin/semgrep scan --config=p/php --error --metrics=off > semgrep-php.txt 2>&1'
                            } finally {
                                sh 'cat semgrep-php.txt'
                                archiveArtifacts(artifacts: 'semgrep-php.txt', allowEmptyArchive: true)
                            }
                        }
                    }
                },
                'Checkov Dockerfiles': {
                    container('checkov') {
                        // Checkov has no Compose framework; Dockerfile rules cannot scan Compose YAML.
                        ['frontend', 'backend', 'database'].each { service ->
                            try {
                                sh "/tmp/checkov-venv/bin/checkov -f ${service}/Dockerfile --framework dockerfile > checkov-${service}.txt 2>&1"
                            } finally {
                                sh "cat checkov-${service}.txt"
                                archiveArtifacts(artifacts: "checkov-${service}.txt", allowEmptyArchive: true)
                            }
                        }
                    }
                },
                'Semgrep Docker': {
                    container('semgrep') {
                        try {
                            sh '/tmp/semgrep-venv/bin/semgrep scan --config=p/dockerfile --error --metrics=off > semgrep-docker.txt 2>&1'
                        } finally {
                            sh 'cat semgrep-docker.txt'
                            archiveArtifacts(artifacts: 'semgrep-docker.txt', allowEmptyArchive: true)
                        }
                    }
                }
            )
        }
        stage('Tests and Docker Builds') {
            parallel(
                'PHPUnit and Infection Tests': {
                    // Both suites share a test database, so keep them sequential.
                    container('docker') {
                        try {
                            timeout(time: 20, unit: 'MINUTES') {
                                sh 'docker compose -f docker-compose.dev.yml run --build --rm tests'
                            }
                        } finally {
                            sh(returnStatus: true, script: 'docker compose -f docker-compose.dev.yml down')
                            dir('backend') {
                                junit(testResults: 'phpunit-results.xml', allowEmptyResults: true)
                                archiveArtifacts(
                                    artifacts: 'phpunit-results.xml,coverage.xml,storage/logs/infection*',
                                    allowEmptyArchive: true
                                )
                            }
                        }
                    }
                },
                'Build Docker Images': {
                    container('docker') {
                        services.each { service ->
                            dir(service) { dockerizer.buildImage("${image}-${service}", version, envName) }
                        }
                    }
                }
            )
        }
        stage('Trivy Scan') {
            container('docker') {
                def dockerSecurityScans = this.DockerSecurityScans
                services.each { service ->
                    dir("reports/trivy-${service}") {
                        dockerSecurityScans.trivyScanImage("${image}-${service}", imageTag)
                    }
                }
            }
        }
        def publishImages = false
        stage('Approve Docker Image Publishing') {
            publishImages = input(
                message: "Publish ${image}-frontend:${imageTag} and ${image}-backend:${imageTag} to Docker Hub?",
                ok: 'Continue',
                parameters: [booleanParam(
                    name: 'PUBLISH_IMAGES',
                    defaultValue: false,
                    description: 'Check to publish both Docker images. Leave unchecked to skip publishing.'
                )]
            )
        }
        if (publishImages) {
            stage('Publish Docker Images') {
                container('docker') {
                    dockerizer.login()
                    services.each { service ->
                        dockerizer.tag("${image}-${service}", version, envName)
                        dockerizer.push("${image}-${service}", version, envName)
                    }
                }
            }
        } else {
            echo 'Docker image publishing skipped.'
        }
    }
}
