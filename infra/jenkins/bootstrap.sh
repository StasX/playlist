#!/usr/bin/env bash
set -euo pipefail

usage() {
    printf 'Usage: bash bootstrap.sh [--context CONTEXT] [--render]\n'
}

context=''
render=false
while (($#)); do
    case "$1" in
        --context)
            if (($# < 2)) || [[ -z "$2" || "$2" == --* ]]; then
                printf 'Error: --context requires a context name.\n' >&2
                exit 1
            fi
            context=$2
            shift 2
            ;;
        --render) render=true; shift ;;
        -h|--help) usage; exit 0 ;;
        *) printf 'Unknown option: %s\n' "$1" >&2; usage >&2; exit 1 ;;
    esac
done

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
chart_version='5.10.5'
casc_path="$script_dir/casc/jenkins.yaml"
for required_file in "$script_dir/values.yaml" "$script_dir/plugins.yaml" "$casc_path"; do
    if [[ ! -f "$required_file" ]]; then
        printf 'Required bootstrap file not found: %s\n' "$required_file" >&2
        exit 1
    fi
done

command -v helm >/dev/null || { printf 'Error: helm is required.\n' >&2; exit 1; }
chart_args=(
    jenkins --repo https://charts.jenkins.io
    --version "$chart_version" --namespace jenkins
    --values "$script_dir/values.yaml"
    --values "$script_dir/plugins.yaml"
    --set-file "controller.JCasC.configScripts.jenkins=$casc_path"
    --repository-config "$script_dir/repositories.yaml"
)

if "$render"; then
    helm template jenkins "${chart_args[@]}"
    exit 0
fi

command -v kubectl >/dev/null || { printf 'Error: kubectl is required.\n' >&2; exit 1; }
if [[ -z "$context" ]]; then
    if ! context=$(kubectl config current-context) || [[ -z "$context" ]]; then
        printf 'No current Kubernetes context. Select one or pass --context.\n' >&2
        exit 1
    fi
    context=${context%$'\r'}
fi

if ! kubectl --context "$context" cluster-info; then
    printf "Cannot reach Kubernetes context '%s'.\n" "$context" >&2
    exit 1
fi

printf "Installing/upgrading Jenkins in context '%s', namespace 'jenkins'.\n" "$context"
if ! helm upgrade --install jenkins "${chart_args[@]}" --kube-context "$context" --create-namespace --wait --timeout 15m; then
    printf 'Jenkins installation failed. Inspect pods and PVCs in namespace jenkins.\n' >&2
    exit 1
fi

printf 'Jenkins is ready. Open a separate terminal and run:\n'
printf 'kubectl --context %q --namespace jenkins port-forward svc/jenkins 8080:8080\n' "$context"
printf 'Then open http://localhost:8080. See infra/jenkins/README.md for login and pipeline setup.\n'
