#!/bin/sh
set -eu
ROOT=${1:-.}
FILE="$ROOT/index.html"
grep -q '<h1>BOS-Spur-Simulator</h1>' "$FILE"
grep -q '<title>T Mission | BOS-Spur-Simulator</title>' "$FILE"
grep -q '<p class="eyebrow">T MISSION</p>' "$FILE"
grep -q 'assets/telekom-logo-current.png' "$FILE"
grep -q 'LIVE DEMO' "$FILE"
if grep -q '<h1>Connected Response</h1>' "$FILE"; then
  echo 'FAILED: old visible H1 still present' >&2
  exit 1
fi
echo 'PASSED: header branding contract'
