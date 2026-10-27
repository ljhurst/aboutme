#!/usr/bin/env bash
# Runs every Lambda's unit tests; a Lambda without a test:unit script is skipped.
set -euo pipefail

cd "$(dirname "$0")/../lambdas"

npm ci

for dir in */; do
  [ -f "$dir/package.json" ] || continue
  (cd "$dir" && npm ci && npm run test:unit --if-present)
done
