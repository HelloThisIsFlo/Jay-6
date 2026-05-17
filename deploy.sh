#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="jay-6"

echo "==> Creating namespace '$NAMESPACE'..."
kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

SCRIPT_DIR="$(dirname "$0")"

echo "==> Applying manifests..."
kubectl apply -n "$NAMESPACE" -f "$SCRIPT_DIR/k8s.yaml"

echo "==> Forcing rollout to pull :latest..."
kubectl rollout restart deployment/jay-6 -n "$NAMESPACE"

echo "==> Waiting for rollout..."
kubectl rollout status deployment/jay-6 -n "$NAMESPACE" --timeout=120s

echo ""
echo "==> Deployed! Pod status:"
kubectl get pods -n "$NAMESPACE"
echo ""
echo "Live at: https://jay-6.kempenich.ai"
echo ""
echo "Quick test: kubectl port-forward -n jay-6 svc/jay-6 9000:80"
