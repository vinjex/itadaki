#!/bin/sh
# Local throwaway Home Assistant for development, on http://127.0.0.1:8123
# (login dev / devdevdev). Its config lives in git-ignored dev/ha-config.
#   up     start it, onboarding a dev user on first run
#   down   stop and remove it (config is kept)
#   token  print a fresh access token for API calls
#   reset  remove it and its config
set -e
. "$(dirname "$0")/ha-version.sh"
NAME=itadaki-ha
URL=http://127.0.0.1:8123
CLIENT="$URL/"
cd "$(dirname "$0")/.."

token() {
  curl -sf -X POST "$URL/auth/token" -d grant_type=refresh_token -d "client_id=$CLIENT" \
    -d "refresh_token=$(cat dev/ha-refresh-token)" | python3 -c 'import sys,json;print(json.load(sys.stdin)["access_token"])'
}

case "$1" in
up)
  mkdir -p dev/ha-config
  podman run -d --name $NAME -p 127.0.0.1:8123:8123 -e TZ=Asia/Tokyo \
    -v "$PWD/dev/ha-config":/config:z \
    -v "$PWD/custom_components/itadaki":/config/custom_components/itadaki:ro,z \
    ghcr.io/home-assistant/home-assistant:$HA_VERSION >/dev/null
  until curl -sf "$URL/manifest.json" >/dev/null; do sleep 2; done
  if [ ! -f dev/ha-refresh-token ]; then
    code=$(curl -sf -X POST "$URL/api/onboarding/users" -H 'Content-Type: application/json' \
      -d "{\"client_id\":\"$CLIENT\",\"name\":\"Dev\",\"username\":\"dev\",\"password\":\"devdevdev\",\"language\":\"en\"}" \
      | python3 -c 'import sys,json;print(json.load(sys.stdin)["auth_code"])')
    curl -sf -X POST "$URL/auth/token" -d grant_type=authorization_code -d "code=$code" -d "client_id=$CLIENT" \
      | python3 -c 'import sys,json;print(json.load(sys.stdin)["refresh_token"])' > dev/ha-refresh-token
    t=$(token)
    for step in core_config analytics; do
      curl -sf -X POST "$URL/api/onboarding/$step" -H "Authorization: Bearer $t" -H 'Content-Type: application/json' -d '{}' >/dev/null
    done
    curl -sf -X POST "$URL/api/onboarding/integration" -H "Authorization: Bearer $t" -H 'Content-Type: application/json' \
      -d "{\"client_id\":\"$CLIENT\",\"redirect_uri\":\"$CLIENT\"}" >/dev/null
  fi
  echo "up: $URL (dev / devdevdev)"
  ;;
down) podman rm -f $NAME >/dev/null && echo down ;;
token) token ;;
reset) podman rm -f $NAME >/dev/null 2>&1 || true; rm -rf dev/ha-config dev/ha-refresh-token; echo reset ;;
*) echo "usage: $0 up|down|token|reset" >&2; exit 1 ;;
esac
