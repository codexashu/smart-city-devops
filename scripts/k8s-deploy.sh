#!/bin/bash
set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "=========================================================="
echo "☸️ Deploying Smart City System to Kubernetes"
echo "=========================================================="

# Create namespace if not exists
kubectl apply -f kubernetes/namespace.yaml

# Apply all resources via Kustomize
kubectl apply -k kubernetes/

echo "Waiting for backend deployment rollout..."
kubectl rollout status deployment/backend-deployment -n smartcity --timeout=90s

echo "Waiting for frontend deployment rollout..."
kubectl rollout status deployment/frontend-deployment -n smartcity --timeout=90s

echo ""
echo "✅ Kubernetes deployment complete!"
kubectl get all -n smartcity
