#!/bin/sh
# Checks every dependency, including the ones our packages pull in, against known
# vulnerabilities: the Python packages as Home Assistant would install them, and the
# panel's npm tree.
set -e
cd "$(dirname "$0")/.."
scripts/run.sh sh -c '
  pip freeze > /tmp/installed.txt
  pip install -q --root-user-action=ignore --disable-pip-version-check pip-audit
  pip-audit --no-deps --disable-pip -r /tmp/installed.txt'
podman run --rm -e NPM_CONFIG_UPDATE_NOTIFIER=false -v "$PWD/frontend":/app:ro,z -w /app docker.io/library/node:22-slim npm audit
