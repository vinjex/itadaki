#!/bin/sh
# Regenerates the README and docs screenshots from the demo library in repo/screenshots:
# a throwaway Home Assistant and a headless browser on a private container network,
# both removed afterwards. The browser's container also plays the recipe site and the
# AI provider. The dev HA and its data are not touched.
set -e
. "$(dirname "$0")/ha-version.sh"
cd "$(dirname "$0")/.."
PLAYWRIGHT_VERSION=$(sed -n 's/.*"playwright-core": "\(.*\)".*/\1/p' frontend/package.json)
NET=itadaki-shots
HA=itadaki-shots-ha
BROWSER=itadaki-shots-browser
# What HA calls the browser's container: it shows as the imported recipe's site.
SITE=recipes.example

cleanup() { podman rm -f $HA $BROWSER >/dev/null 2>&1 || true; podman network rm $NET >/dev/null 2>&1 || true; }
trap cleanup EXIT
cleanup
podman network create $NET >/dev/null
podman run -d --rm --name $HA --network $NET -e TZ=UTC \
  -v "$PWD/custom_components/itadaki":/config/custom_components/itadaki:ro,z \
  ghcr.io/home-assistant/home-assistant:$HA_VERSION >/dev/null
# node_modules is a throwaway volume: the panel build installs it for another platform.
podman run --rm --name $BROWSER --network $NET --network-alias $SITE -v "$PWD/frontend":/app:ro,z -v /app/node_modules \
  -v "$PWD/repo/screenshots":/demo:ro,z -v "$PWD/docs/images":/out:z -w /app \
  mcr.microsoft.com/playwright:v$PLAYWRIGHT_VERSION-noble \
  sh -c "npm ci --no-audit --no-fund --loglevel=error && node tools/screenshots.js http://$HA:8123 /demo /out http://$SITE"
