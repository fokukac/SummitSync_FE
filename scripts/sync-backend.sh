#!/usr/bin/env bash
# Pulls everything the app shares with the Laravel backend (SummitSync_BE):
#   1. the OpenAPI document (Scramble export) -> src/api/openapi.json, then generated types -> src/api/schema.d.ts
#   2. the website's translation catalogs     -> src/i18n/locales
# Usage: npm run sync:backend   (BACKEND_DIR defaults to ../../SummitSync, the Sail checkout; SAIL_CONTAINER to its container)
set -euo pipefail

cd "$(dirname "$0")/.."
BACKEND_DIR="${BACKEND_DIR:-$(cd ../../SummitSync && pwd)}"
SAIL_CONTAINER="${SAIL_CONTAINER:-summitsync-laravel.test-1}"

docker exec -u sail "$SAIL_CONTAINER" php artisan scramble:export --path=storage/app/openapi.json
cp "$BACKEND_DIR/storage/app/openapi.json" src/api/openapi.json
npx openapi-typescript src/api/openapi.json -o src/api/schema.d.ts

rm -rf src/i18n/locales
cp -r "$BACKEND_DIR/resources/js/i18n/locales" src/i18n/locales

echo "Synced. Review the diff, then run: npm run typecheck"
