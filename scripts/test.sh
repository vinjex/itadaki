#!/bin/sh
exec "$(dirname "$0")/run.sh" python -m pytest -q -p no:cacheprovider "$@"
