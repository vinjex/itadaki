#!/bin/sh
# Runs a command in a throwaway container matching Home Assistant's Python, with the
# integration's dependencies installed under HA's own version pins so clashes show up
# here. dev/ai.env, when present, provides the live AI credentials.
set -e
. "$(dirname "$0")/ha-version.sh"
cd "$(dirname "$0")/.."
ENV_FILE=""
[ -f dev/ai.env ] && ENV_FILE="--env-file dev/ai.env"
podman run --rm $ENV_FILE -v "$PWD":/src:ro,z -w /src -e PYTHONDONTWRITEBYTECODE=1 -e HA_VERSION="$HA_VERSION" \
  python:3.14-slim sh -c '
  python - <<PY
import json, urllib.request
reqs = json.load(open("custom_components/itadaki/manifest.json"))["requirements"]
open("/tmp/req.txt", "w").write("\n".join(reqs))
url = f"https://raw.githubusercontent.com/home-assistant/core/$HA_VERSION/homeassistant/package_constraints.txt"
open("/tmp/ha.txt", "wb").write(urllib.request.urlopen(url).read())
PY
  pip install -q --root-user-action=ignore --disable-pip-version-check -c /tmp/ha.txt -r /tmp/req.txt pytest
  "$@"' -- "$@"
