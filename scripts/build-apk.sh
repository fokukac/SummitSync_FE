#!/usr/bin/env bash
# Builds an installable Android APK of the app, locally, for testing on a phone.
#
#   scripts/build-apk.sh [backend-host]
#
# The phone must reach the backend, so the app is built against this machine's address on the local network
# (autodetected, or pass it: scripts/build-apk.sh 192.168.1.20). Phone and computer need to be on the same Wi-Fi,
# and the backend (Sail) running. The build allows plain http to that address; a real release build does not.
# The APK is signed with the debug key: fine for testing, not for the Play Store. Needs JDK 17 and the Android SDK
# (ANDROID_HOME). Output: dist/summitsync-test.apk
set -euo pipefail

cd "$(dirname "$0")/.."

HOST="${1:-$(ip -4 route get 1.1.1.1 | sed -n 's/.* src \([0-9.]*\).*/\1/p')}"
BACKEND_DIR="${BACKEND_DIR:-$(cd ../be && pwd)}"
# Only the phone's architecture by default (much faster); ABIS="arm64-v8a,x86_64" also covers an emulator.
ABIS="${ABIS:-arm64-v8a}"

if [ -z "$HOST" ]; then
  echo "Could not work out this machine's network address; pass it as the first argument." >&2
  exit 1
fi

export ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"
export APP_ALLOW_CLEARTEXT=1
export EXPO_PUBLIC_API_URL="http://$HOST"
export EXPO_PUBLIC_REVERB_HOST="$HOST"
export EXPO_PUBLIC_REVERB_PORT="${EXPO_PUBLIC_REVERB_PORT:-8080}"
# The Reverb app key is public by design (the website ships it to every browser); the secret is never read.
export EXPO_PUBLIC_REVERB_KEY="${EXPO_PUBLIC_REVERB_KEY:-$(sed -n 's/^REVERB_APP_KEY=//p' "$BACKEND_DIR/.env" | tr -d '"')}"

# Google sign-in: the web OAuth client id (public by design; the secret is never read).
export EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID="${EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID:-$(sed -n 's/^GOOGLE_CLIENT_ID=//p' "$BACKEND_DIR/.env" | tr -d '"')}"

echo "Backend: $EXPO_PUBLIC_API_URL   Realtime: $HOST:$EXPO_PUBLIC_REVERB_PORT   ABIs: $ABIS"

# The native project is generated from app.json / app.config.js (it is git-ignored), so rebuild it fresh each time.
npx expo prebuild --platform android --clean --no-install

cd android
./gradlew assembleRelease -PreactNativeArchitectures="$ABIS" --no-daemon

cd ..
mkdir -p dist
cp android/app/build/outputs/apk/release/app-release.apk dist/summitsync-test.apk
echo
echo "Done: $(pwd)/dist/summitsync-test.apk ($(du -h dist/summitsync-test.apk | cut -f1))"
