#!/bin/sh
# Builds the panel bundle into the integration in a throwaway Node container.
# The bundle is committed, because HACS installs the integration folder as-is.
set -e
cd "$(dirname "$0")/.."
podman run --rm -v "$PWD/frontend":/app:z -v "$PWD/custom_components/itadaki/frontend":/custom_components/itadaki/frontend:z \
  -w /app docker.io/library/node:22-alpine sh -c 'npm ci --no-audit --no-fund --loglevel=error && npm run build'
# The panel's URL carries the bundle's modification time, read when HA starts, so the
# dev HA must restart for browsers to fetch the new bundle instead of a cached one.
if podman container exists itadaki-ha 2>/dev/null; then
  podman restart itadaki-ha >/dev/null 2>&1
  echo "restarted dev HA"
fi
