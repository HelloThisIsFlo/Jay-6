#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="jay-6"

echo "==> Deleting namespace '$NAMESPACE'..."
kubectl delete namespace "$NAMESPACE"

echo ""
echo "==> Done. Remember to remove the tunnel route from Cloudflare dashboard."
echo "   Zero Trust > Networks > Tunnels > your tunnel > Public Hostname > remove jay-6 entry"
