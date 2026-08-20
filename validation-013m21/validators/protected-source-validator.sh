#!/bin/sh
set -eu
ROOT=${1:-.}
MANIFEST=${2:-PROTECTED_SOURCE_SHA256.txt}
TMP=$(mktemp)
trap 'rm -f "$TMP"' EXIT
sed "s#  \./#  $ROOT/#" "$MANIFEST" > "$TMP"
sha256sum -c "$TMP"
