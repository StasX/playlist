@Library(['installers', 'dockerizer', 'code-qualities', 'securityscans']) _

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
    containerTemplate(name: 'composer', image: 'php:8.5-cli-alpine', command: 'sleep', args: '1d'),
    containerTemplate(name: 'checkov', image: 'python:3.13', command: 'sleep', args: '1d'),
    containerTemplate(name: 'semgrep', image: 'python:3.13', command: 'sleep', args: '1d')
], volumes: [emptyDirVolume(mountPath: '/var/lib/docker', memory: false)]) {
    node(POD_LABEL) {
        try {
            stage('Checkout') {
                checkout scm
            }
            stage('Environment preparations') {
                parallel(
                    'Install Checkov': {
                        container('checkov') {
                            // Containers share the workspace; isolate their Python environments.
                            sh 'python3 -m venv /tmp/checkov-venv && /tmp/checkov-venv/bin/pip install checkov'
                        }
                    },
                    'Install Semgrep': {
                        container('semgrep') {
                            sh 'python3 -m venv /tmp/semgrep-venv && /tmp/semgrep-venv/bin/pip install semgrep'
                        }
                    },
                    'Install PHP dependencies': {
                        container('composer') {
                            sh 'sh infra/php/prepare-php.sh'
                            dir('backend') { installersForPHPBasedTools.installAll(true, true) }
                        }
                    },
                    'Wait for Docker': {
                        container('docker') {
                            timeout(time: 2, unit: 'MINUTES') {
                                sh 'until docker info >/dev/null 2>&1; do sleep 2; done'
                            }
                        }
                    }
                )
            }
            stage('Code Quality') {
                parallel(
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
            // Both suites use the same database and workspace, so run them sequentially.
            stage('PHPUnit and Infection Tests') {
                container('composer') {
                    dir('backend') {
                        try {
                            // The shared helper overwrites phpunit.xml with its JUnit report.
                            sh 'vendor/bin/phpunit --configuration phpunit.xml --log-junit phpunit-results.xml --coverage-clover coverage.xml'
                            sh 'vendor/bin/infection --configuration=infection.json5 --threads=1 --no-progress'
                        } finally {
                            junit(testResults: 'phpunit-results.xml', allowEmptyResults: true)
                            archiveArtifacts(
                                artifacts: 'phpunit-results.xml,coverage.xml,storage/logs/infection*',
                                allowEmptyArchive: true
                            )
                        }
                    }
                }
            }
            stage('Build Docker Images') {
                container('docker') {
                    services.each { service ->
                        dir(service) { Dockerizer.buildImage("${image}-${service}", version, envName) }
                    }
                }
            }
            stage('Trivy Scan') {
                container('docker') {
                    services.each { service ->
                        dir("reports/trivy-${service}") {
                            DockerSecurityScans.trivyScanImage("${image}-${service}", imageTag)
                        }
                    }
                }
            }
            stage('Publish Docker Images') {
                container('docker') {
                    Dockerizer.login()
                    services.each { service ->
                        Dockerizer.tag("${image}-${service}", version, envName)
                        Dockerizer.push("${image}-${service}", version, envName)
                    }
                }
            }
        } finally {
            stage('Cleanup Workspace') {
                // Root-owned build directories must be writable by the inbound agent.
                container('composer') {
                    sh(returnStatus: true, script: 'find . -type d -exec chmod a+rwx {} +')
                }
                cleanWs(deleteDirs: true, disableDeferredWipeout: true, notFailBuild: true)
            }
        }
    }
}
