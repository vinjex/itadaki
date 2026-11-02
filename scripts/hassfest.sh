#!/bin/sh
# Runs Home Assistant's integration validator (hassfest) in its official container.
set -e
cd "$(dirname "$0")/.."
podman run --rm -v "$PWD":/github/workspace:ro,z ghcr.io/home-assistant/hassfest
