
@Library([
    'installers_lib',
    'docker-lib',
    'quality-lib',
    'security-lib'
    ]) _
def dockerRepo = "sm1986"


podTemplate(cloud: 'kubernetes', containers: [
    containerTemplate(
        name: 'jnlp', 
        image: 'jenkins/inbound-agent:latest'
    ),
    containerTemplate(
        name: 'docker', 
        image: 'docker:26-dind',
        privileged: true,
        args: '--storage-driver=vfs --host=tcp://0.0.0.0:2375'
    ),
    containerTemplate(
        name: 'alpine', 
        image: 'alpine:latest',
        command: 'sleep 1d'
    ),
    containerTemplate(
        name: 'composer', 
        image: 'composer:2.10.2',
        command: 'sleep 1d'
    ),
    containerTemplate(
        name: 'checkov', 
        image: 'python:3.13',
        command: 'sleep 1d'
    ),
    containerTemplate(
        name: 'semgrep', 
        image: 'python:3.13',
        command: 'sleep 1d'
    ),
    containerTemplate(
        name: 'node', 
        image: 'node:26-alpine3.23',
        command: 'sleep 1d'
    ), 
    containerTemplate(
        name: 'git', 
        image: 'alpine/git',
        command: 'sleep 1d'
    )], 
  volumes: [
    emptyDirVolume(mountPath: '/var/lib/docker', memory: false)
  ]) {
    node(POD_LABEL) {
        stage('Checkout & Extract App Information') {
            container('jnlp') {                       
                // Ensure we skip SSL if needed internally, then pull code
                sh 'git config --global http.sslVerify false'
                checkout scm
            }
        }
        stage("Environment preparations"){
            parallel(
                "Install Checkov" : {
                    container('checkov') {
                        installers.installCheckov()
                    }
                },
                "Install composer packages" : {
                    container('composer') {
                        installers.installComposer()
                    }
                },
                "Install Semgrep" : {
                    container('semgrep') {
                        installers.installSemgrep()
                    }
                },
                "Install Trivy" : {
                    container('docker') {
                        installers.installTrivy()
                    }
                }
            )
        },
        stage("Code Quality "){
            paralel(
                "PHP CS Fixer Testing" : {
                    container("composer"){
                        quality.testPHP()
                    }
                },
                "PHP_CodeSniffer Testing" : {
                    container("composer"){
                        quality.phpCodeSniffer()
                    }
                }
            )

        },
        stage('Security Scans') {
            parallel(
                'PHPStan Testing': {
                    container('phpstan') {
                        echo "Running Bandit Python Static Analysis..."
                        security.banditScan()
                    }
                },
                'Checkov Testing': {
                    container('checkov') {
                        echo "Running Checkov on Dockerfile..."
                        security.checkovScan("Dockerfile", "-f", "dockerfile")
                    }
                },
                'Semgrep Testing': {
                    container('semgrep') {
                        echo "Running Semgrep Scans..."
                        security.semgrepScan()
                    }
                }
            )
        },
        stage ("PHPUnit  and Infection Tests"){
            parallel(
                "PHPUnit Tests" : {
                    container("composer") {
                        quality.phpUnitTests()
                    }
                },
                "Infection Tests" : {
                    container("composer") {
                        quality.infectionTests()
                    }
                }
            )
        }
        stage('Build Docker Image') {
            container('docker') {
              dockers.build(dockerRepoOwner, image, version, envName, envShortName)
            }
        }
        stage("Run Trivy scan, login to Docker and tag Docker Image"){
            parallel(
                'Trivy Scan' : {
                    container('docker') {
                        echo "Running Trivy vulnerability scan on the built image..."
                        security.trivyScanImage(dockerRepoOwner, image, version, envName, envShortName)
                    }
                },
                'Tag Docker Image' : {
                    container('docker') {              
                        dockers.tag(dockerRepoOwner, image, version, envName, envShortName)
                    }
                },
                'Login to Docker repository' : {
                    container('docker') {              
                        dockers.login()
                    }
                }           
            )
        }
        stage('Push Docker Image'){
            container('docker') {              
                 dockers.push(dockerRepoOwner, image, version, envName, envShortName)
            }
        },
        stage('Cleanup Workspace') {
            container('alpine') {
                echo "Cleaning up workspace..."
                cleanWs(
                    cleanWhenNotBuilt: true,
                    deleteDirs: true,
                    disableDeferredWipeout: true,
                    notFailBuild: true
                )
            }
        }       
    }
}

