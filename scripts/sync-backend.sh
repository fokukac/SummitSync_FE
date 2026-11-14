#!/usr/bin/env bash
# Pulls everything the app shares with the Laravel backend (the Laravel repo, ../be):
#   1. the OpenAPI document (Scramble export) -> src/api/openapi.json, then generated types -> src/api/schema.d.ts
#   2. the website's translation catalogs     -> src/i18n/locales
#   3. the website's activity icons           -> src/constants/activity-icons.ts
# Usage: npm run sync:backend   (BACKEND_DIR defaults to ../be, the Sail checkout; SAIL_CONTAINER to its container)
set -euo pipefail

cd "$(dirname "$0")/.."
BACKEND_DIR="${BACKEND_DIR:-$(cd ../be && pwd)}"
SAIL_CONTAINER="${SAIL_CONTAINER:-be-laravel.test-1}"

docker exec -u sail "$SAIL_CONTAINER" php artisan scramble:export --path=storage/app/openapi.json
cp "$BACKEND_DIR/storage/app/openapi.json" src/api/openapi.json
npx openapi-typescript src/api/openapi.json -o src/api/schema.d.ts

rm -rf src/i18n/locales
cp -r "$BACKEND_DIR/resources/js/i18n/locales" src/i18n/locales

node scripts/generate-activity-icons.mjs "$BACKEND_DIR"
npx prettier --write src/constants/activity-icons.ts > /dev/null

echo "Synced. Review the diff, then run: npm run typecheck"
