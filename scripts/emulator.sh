#!/usr/bin/env bash
# Drive the app on an Android emulator from the command line: boot it, install a build, look at the screen and
# tap it. Meant for checking UI changes without picking up the phone (also usable by an AI assistant).
#
#   scripts/emulator.sh start                 boot the emulator in a visible window (EMULATOR_WINDOW=0 for headless) and wait
#   scripts/emulator.sh install               build the app for the emulator (x86_64, backend at 10.0.2.2) and install it
#   scripts/emulator.sh install path/to.apk   install an existing APK instead of building
#   scripts/emulator.sh launch                start the app
#   scripts/emulator.sh screenshot [name]     save dist/screenshots/<name>.png (default: a timestamp) and print its path
#   scripts/emulator.sh ui                    list what is on screen: text, description and centre point of each element
#   scripts/emulator.sh tap <x> <y>           tap a point
#   scripts/emulator.sh tap-text "Discover"   tap the element whose text or content description matches (substring)
#   scripts/emulator.sh type "some text"      type into the focused field
#   scripts/emulator.sh key back|home|enter   press a key
#   scripts/emulator.sh swipe <x1> <y1> <x2> <y2>
#   scripts/emulator.sh logs                  recent app log lines (errors and JS console), then exit
#   scripts/emulator.sh stop                  shut the emulator down
#
# Every command targets the emulator only (EMULATOR_SERIAL, default emulator-5554), so a phone plugged in over USB
# is never touched. Needs the Android SDK (ANDROID_HOME) and /dev/kvm; the backend (Sail) must be running for the
# app to do anything useful: the emulator reaches this machine as 10.0.2.2.
set -euo pipefail

cd "$(dirname "$0")/.."

export ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"
PACKAGE="app.summitsync"
SERIAL="${EMULATOR_SERIAL:-emulator-5554}"
SHOTS="${SCREENSHOT_DIR:-dist/screenshots}"
LOG="${EMULATOR_LOG:-dist/emulator.log}"
ADB=("$ANDROID_HOME/platform-tools/adb" -s "$SERIAL")
[ -x "${ADB[0]}" ] || ADB=(adb -s "$SERIAL")

die() { echo "$*" >&2; exit 1; }

running() { "${ADB[@]}" get-state >/dev/null 2>&1; }

need_running() { running || die "No emulator at $SERIAL. Run: scripts/emulator.sh start"; }

start() {
  if running; then
    echo "Emulator already running ($SERIAL)."
    return
  fi

  local avd="${AVD:-$("$ANDROID_HOME/emulator/emulator" -list-avds | head -n 1)}"
  [ -n "$avd" ] || die "No AVD found; create one in Android Studio's Device Manager."

  mkdir -p "$(dirname "$LOG")"
  echo "Booting $avd ..."
  # A visible window by default so a human can watch; EMULATOR_WINDOW=0 runs headless (screenshots still work).
  local flags=(-no-snapshot-save -no-audio -no-boot-anim -gpu swiftshader_indirect)
  [ "${EMULATOR_WINDOW:-1}" = "1" ] || flags+=(-no-window)
  nohup "$ANDROID_HOME/emulator/emulator" -avd "$avd" -port "${SERIAL##*-}" "${flags[@]}" >"$LOG" 2>&1 &

  "${ADB[@]}" wait-for-device 2>/dev/null || true
  local waited=0
  until [ "$("${ADB[@]}" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ]; do
    sleep 3
    waited=$((waited + 3))
    [ "$waited" -lt 240 ] || die "The emulator did not finish booting in 4 minutes (log: $LOG)."
  done
  # Animations off: taps and screenshots land on a settled screen.
  for setting in window_animation_scale transition_animation_scale animator_duration_scale; do
    "${ADB[@]}" shell settings put global "$setting" 0
  done
  echo "Ready ($SERIAL)."
}

install() {
  need_running
  local apk="${1:-}"

  if [ -z "$apk" ]; then
    ABIS=x86_64 ./scripts/build-apk.sh 10.0.2.2
    apk="dist/summitsync-test.apk"
  fi

  "${ADB[@]}" install -r "$apk"
}

launch() {
  need_running
  "${ADB[@]}" shell monkey -p "$PACKAGE" -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1
  echo "Launched $PACKAGE."
}

screenshot() {
  need_running
  mkdir -p "$SHOTS"
  local file="$SHOTS/${1:-$(date +%Y%m%d-%H%M%S)}.png"
  "${ADB[@]}" exec-out screencap -p >"$file"
  echo "$file"
}

# Prints "text | description | x y" for every visible element that has either.
elements() {
  "${ADB[@]}" shell uiautomator dump /sdcard/ui.xml >/dev/null
  "${ADB[@]}" exec-out cat /sdcard/ui.xml | python3 -I -c '
import re, sys, xml.etree.ElementTree as ET
for node in ET.fromstring(sys.stdin.read()).iter("node"):
    text, desc = node.get("text", ""), node.get("content-desc", "")
    box = re.findall(r"\d+", node.get("bounds", ""))
    if (text or desc) and len(box) == 4:
        x1, y1, x2, y2 = map(int, box)
        print(f"{text} | {desc} | {(x1 + x2) // 2} {(y1 + y2) // 2}")
'
}

tap_text() {
  need_running
  local wanted="$1" line
  local all
  all="$(elements)"
  # An element whose text or description is exactly the wanted text wins over a longer one that merely contains it.
  line="$(grep -iE -- "^($(printf '%s' "$wanted" | sed 's/[][\.*^$(){}?+|/]/\\&/g')) \| |\| ($(printf '%s' "$wanted" | sed 's/[][\.*^$(){}?+|/]/\\&/g')) \| " <<<"$all" | head -n 1 || true)"
  [ -n "$line" ] || line="$(grep -iF -- "$wanted" <<<"$all" | head -n 1 || true)"
  [ -n "$line" ] || die "Nothing on screen matches \"$wanted\" (see: scripts/emulator.sh ui)."
  local point="${line##*| }"
  # shellcheck disable=SC2086
  "${ADB[@]}" shell input tap $point
  echo "Tapped \"$wanted\" at $point."
}

logs() {
  need_running
  # React Native's JS console goes to ReactNativeJS; native crashes to AndroidRuntime.
  "${ADB[@]}" logcat -d -t 400 ReactNativeJS:V AndroidRuntime:E '*:S' | tail -n 80
}

command="${1:-}"
shift || true

case "$command" in
  start) start ;;
  stop) "${ADB[@]}" emu kill >/dev/null 2>&1 || true; echo "Stopped." ;;
  install) install "$@" ;;
  launch) launch ;;
  screenshot) screenshot "$@" ;;
  ui) need_running; elements ;;
  tap) need_running; [ $# -eq 2 ] || die "Usage: tap <x> <y>"; "${ADB[@]}" shell input tap "$1" "$2" ;;
  tap-text) [ $# -eq 1 ] || die 'Usage: tap-text "text"'; tap_text "$1" ;;
  type) need_running; [ $# -eq 1 ] || die 'Usage: type "text"'; "${ADB[@]}" shell input text "${1// /%s}" ;;
  key)
    need_running
    case "${1:-}" in
      back) "${ADB[@]}" shell input keyevent KEYCODE_BACK ;;
      home) "${ADB[@]}" shell input keyevent KEYCODE_HOME ;;
      enter) "${ADB[@]}" shell input keyevent KEYCODE_ENTER ;;
      *) die "Usage: key back|home|enter" ;;
    esac
    ;;
  swipe) need_running; [ $# -eq 4 ] || die "Usage: swipe <x1> <y1> <x2> <y2>"; "${ADB[@]}" shell input swipe "$@" 300 ;;
  logs) logs ;;
  *) sed -n '2,24p' "$0" | sed 's/^# \{0,1\}//'; [ -z "$command" ] || exit 1 ;;
esac
