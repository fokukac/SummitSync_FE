#!/usr/bin/env bash
# Rebuilds every app icon from the SVGs in assets/brand (the website's mountain mark on the brand amber).
# Needs Inkscape and ImageMagick. Usage: scripts/generate-icons.sh [path/to/be]   (also refreshes the website's favicons)
set -euo pipefail
cd "$(dirname "$0")/.."

png() { inkscape "assets/brand/$1.svg" --export-type=png --export-filename="$2" --export-width="$3" >/dev/null 2>&1; }

png icon assets/images/icon.png 1024
png android-foreground assets/images/android-icon-foreground.png 1024
png android-background assets/images/android-icon-background.png 1024
png android-monochrome assets/images/android-icon-monochrome.png 1024
png splash-icon assets/images/splash-icon.png 512
png favicon assets/images/favicon.png 48

if [ "${1:-}" != "" ]; then
  be="$1/public"
  cp assets/brand/favicon.svg "$be/favicon.svg"
  png icon "$be/apple-touch-icon.png" 180
  for size in 16 32 48; do png favicon "/tmp/summitsync-favicon-$size.png" "$size"; done
  convert /tmp/summitsync-favicon-16.png /tmp/summitsync-favicon-32.png /tmp/summitsync-favicon-48.png "$be/favicon.ico"
fi
