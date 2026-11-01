#!/bin/sh
# Release notes for a ref: the commit subjects since the previous release tag, without
# release and internal-only commits.
set -e
REF="${1:-HEAD}"
PREV=$(git describe --tags --abbrev=0 --match 'v*' "$REF^" 2>/dev/null || true)
git log --no-merges --format='- %s' ${PREV:+"$PREV.."}"$REF" | grep -v -e '^- Release [0-9]' -e '^- Internal:' || true
