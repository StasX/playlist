[CmdletBinding()]
param(
    [string]$Context,
    [switch]$Render
)

$ErrorActionPreference = 'Stop'
$chartVersion = '5.10.5'
$valuesPath = Join-Path $PSScriptRoot 'values.yaml'
$pluginsPath = Join-Path $PSScriptRoot 'plugins.yaml'
$cascPath = Join-Path $PSScriptRoot 'casc/jenkins.yaml'

foreach ($requiredFile in @($valuesPath, $pluginsPath, $cascPath)) {
    if (-not (Test-Path -LiteralPath $requiredFile -PathType Leaf)) {
        throw "Required bootstrap file not found: $requiredFile"
    }
}

Get-Command helm -ErrorAction Stop | Out-Null
$chartArgs = @(
    'jenkins', '--repo', 'https://charts.jenkins.io',
    '--version', $chartVersion, '--namespace', 'jenkins',
    '--values', $valuesPath,
    '--values', $pluginsPath,
    # Helm's --set-file parser treats backslashes as escapes on Windows.
    '--set-file', "controller.JCasC.configScripts.jenkins=$($cascPath.Replace('\', '/'))",
    '--repository-config', (Join-Path $PSScriptRoot 'repositories.yaml')
)

if ($Render) {
    & helm template jenkins @chartArgs
    if ($LASTEXITCODE -ne 0) { throw 'Helm template rendering failed.' }
    return
}

Get-Command kubectl -ErrorAction Stop | Out-Null
if (-not $Context) {
    $Context = & kubectl config current-context
    if ($LASTEXITCODE -ne 0 -or -not $Context) {
        throw 'No current Kubernetes context. Select one or pass -Context.'
    }
    $Context = $Context.Trim()
}

& kubectl --context $Context cluster-info
if ($LASTEXITCODE -ne 0) { throw "Cannot reach Kubernetes context '$Context'." }

Write-Host "Installing/upgrading Jenkins in context '$Context', namespace 'jenkins'."
& helm upgrade --install jenkins @chartArgs --kube-context $Context --create-namespace --wait --timeout 15m
if ($LASTEXITCODE -ne 0) { throw 'Jenkins installation failed. Inspect pods and PVCs in namespace jenkins.' }

Write-Host 'Jenkins is ready. Open a separate terminal and run:'
Write-Host "kubectl --context $Context --namespace jenkins port-forward svc/jenkins 8080:8080"
Write-Host 'Then open http://localhost:8080. See infra/jenkins/README.md for login and pipeline setup.'
