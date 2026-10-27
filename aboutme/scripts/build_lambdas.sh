#!/usr/bin/env bash
# Builds one zip per Lambda into aboutme/lambdas/dist/<function>.zip with
# production dependencies only.
#
# Reproducible: every file's mtime is fixed and the file list is sorted before
# zipping with -X, so the same source gives the same bytes. Without this,
# source_code_hash changes on every build and Terraform sees drift.
set -euo pipefail

cd "$(dirname "$0")/../lambdas"

dist="$PWD/dist"
rm -rf "$dist"
mkdir -p "$dist"

npm ci

for entry in currentContribs:current-contribs recentRuns:recent-runs topTracks:top-tracks; do
  dir="${entry%%:*}"
  name="${entry##*:}"
  stage="$(mktemp -d)"

  (cd "$dir" && npm ci && npm run build)

  cp "$dir"/dist/* "$stage"/
  cp "$dir"/package.json "$dir"/package-lock.json "$stage"/
  (cd "$stage" && npm ci --omit=dev --ignore-scripts --no-audit --no-fund)

  find "$stage" -exec touch -t 202001010000.00 {} +
  (cd "$stage" && find . -type f | LC_ALL=C sort | zip -Xq "$dist/$name.zip" -@)

  rm -rf "$stage"
done
