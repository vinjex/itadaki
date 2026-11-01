#!/bin/sh
# Releases a version: tests, checks the committed panel, bumps the manifest, then
# commits, tags and pushes. CI validates the tag and publishes the GitHub release.
set -e
cd "$(dirname "$0")/.."
VERSION="$1"
fail() { echo "$1" >&2; exit 1; }
echo "$VERSION" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+$' || fail "usage: $0 X.Y.Z"
[ "$(git branch --show-current)" = main ] || fail "not on main"
[ -z "$(git status --porcelain)" ] || fail "uncommitted changes"
git rev-parse -q --verify "refs/tags/v$VERSION" >/dev/null && fail "v$VERSION already exists"
scripts/test.sh
scripts/build-panel.sh
git diff --quiet custom_components/itadaki/frontend || fail "the committed panel was stale; commit the rebuilt one first"
NOTES=$(scripts/release-notes.sh)
[ -n "$NOTES" ] || fail "nothing to release"
printf 'v%s\n%s\n\nRelease? [y/N] ' "$VERSION" "$NOTES"
read -r answer
[ "$answer" = y ] || fail "aborted"
sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" custom_components/itadaki/manifest.json
git commit -qm "Release $VERSION" custom_components/itadaki/manifest.json
git tag -a "v$VERSION" -m "v$VERSION"
git push --atomic origin main "v$VERSION"
