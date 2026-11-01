
@Library([
    'installers',
    'dockerizer',
    'code-qualities',
    'securityscans',
    'test-suite'
    ]) _
def image = 'sm1986/playlist'
def version = '1.0.0'
def envName = 'dev'

podTemplate(cloud: 'kubernetes', containers: [
    containerTemplate(
        name: 'jnlp', 
        image: 'jenkins/inbound-agent:latest'
    ),
    containerTemplate(
        name: 'docker', 
        image: 'docker:26-dind',
        privileged: true,
        args: '--storage-driver=vfs'
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
                // sh 'git config --global http.sslVerify false'
                checkout scm
            }
        }
        stage('Environment preparations'){
            parallel(
                'Install Checkov' : {
                    container('checkov') {
                        installersForPythonBasedTools.installCheckov()
                    }
                },
                'Install composer packages' : {
                    container('composer') {
                        dir('backend') { installersForPHPBasedTools.installAll(true, true) }
                    }
                },
                'Install Semgrep' : {
                    container('semgrep') {
                        installersForPythonBasedTools.installSemgrep()
                    }
                },
                'Install Trivy' : {
                    container('docker') {
                        installersForDockerBasedTools.installTrivy()
                    }
                }
            )
        }
        stage('Code Quality '){
            parallel(
                'PHP CS Fixer Testing' : {
                    container('composer'){
                        dir('backend') { PHPCodeQuality.phpCSFixerTesting() }
                    }
                },
                'PHP_CodeSniffer Testing' : {
                    container('composer'){
                        dir('backend') { PHPCodeQuality.phpCodeSnifferTesting() }
                    }
                },
                'PHPStan Testing': {
                    container('composer') {
                        echo 'Running PHP Stan Static Analysis...'
                        dir('backend') { PHPSecurityScans.phpStanScan() }
                    }
                }
            )

        }
        stage('Security Scans') {
            parallel(
                'Composer Audit':{
                    container('composer') {
                        echo 'Running Composer Audit...'
                        dir('backend') { PHPSecurityScans.composerAudit() }
                    }
                },
                'Semgrep Scan for PHP': {
                    container('semgrep') {
                        echo 'Running Semgrep Scans...'
                        dir('backend') { PHPSecurityScans.semgrepScan() }
                    }
                },
                'Checkov Scans for Dockerfile': {
                    container('checkov') {
                        ['frontend', 'backend', 'database'].each { service ->
                            DockerSecurityScans.checkovScan("${service}/Dockerfile")
                        }
                    }
                },
                'Checkov Scans for docker-compose.yml': {
                    container('checkov') {
                        echo 'Running Checkov on docker compose file...'
                        DockerSecurityScans.checkovScan('docker-compose.yml')
                    }
                },
                'Semgrep Scans for Docker': {
                    container('semgrep') {
                        echo 'Running Semgrep Scans...'
                        DockerSecurityScans.semgrepScan()
                    }
                }
            )
        }
        stage ('PHPUnit  and Infection Tests'){
            parallel(
                'PHPUnit Tests' : {
                    container('composer') {
                        dir('backend') { PHPTests.phpUnitTesting() }
                    }
                },
                'Infection Tests' : {
                    container('composer') {
                        dir('backend') { PHPTests.infectionTesting() }
                    }
                }
            )
        }
        stage('Build Docker Image') {
            container('docker') {
              ['frontend', 'backend'].each { service ->
                  dir(service) {
                      Dockerizer.buildImage("${image}-${service}", version, envName)
                  }
              }
            }
        }
        stage('Run Trivy scan, login to Docker and tag Docker Image'){
            parallel(
                'Trivy Scan' : {
                    container('docker') {
                        echo 'Running Trivy vulnerability scan on the built image...'
                        ['frontend', 'backend'].each { service ->
                            if (envName != 'prod') {
                                DockerSecurityScans.trivyScanImage("${image}-${service}", "${version}-${envName}")
                            } else {
                                DockerSecurityScans.trivyScanImage("${image}-${service}", version)
                            }
                        }
                    }
                },
                'Tag Docker Image' : {
                    container('docker') {
                        ['frontend', 'backend'].each { service ->
                            Dockerizer.tagImage("${image}-${service}", version, envName)
                        }
                    }    
                },
                'Login to Docker repository' : {
                    container('docker') {              
                        Dockerizer.login()
                    }
                }           
            )
        }
        stage('Push Docker Image'){
            container('docker') {              
                 ['frontend', 'backend'].each { service ->
                     Dockerizer.push("${image}-${service}", version, envName)
                 }
            }
        }
        stage('Cleanup Workspace') {
            container('alpine') {
                echo 'Cleaning up workspace...'
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

