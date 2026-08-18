#!/usr/bin/env bash
# Verification, now that pages render on demand.
#
# The checks have always run against real rendered HTML rather than source, and
# that stays true — there just isn't a `dist/index.html` to read any more. So we
# build, start the server with the gate explicitly open, and fetch the two pages
# exactly as a browser would.
set -euo pipefail

PORT=${VERIFY_PORT:-4399}
OUT=$(mktemp -d)
trap 'kill "${DEV_PID:-}" 2>/dev/null || true; rm -rf "$OUT"' EXIT

npx astro build >/dev/null

AUTH_DISABLED=1 npx astro dev --port "$PORT" >"$OUT/dev.log" 2>&1 &
DEV_PID=$!

for _ in $(seq 1 60); do
  curl -sf -o /dev/null "http://localhost:$PORT/" && break
  sleep 0.5
done

curl -sf "http://localhost:$PORT/"    -o "$OUT/index.html"
curl -sf "http://localhost:$PORT/v2/" -o "$OUT/v2.html"

status=0
for page in "$OUT/index.html:/" "$OUT/v2.html:/v2/"; do
  file=${page%%:*}; label=${page##*:}
  echo "--- $label ---"
  python3 scripts/verify_content.py  "$file" || status=1
  python3 scripts/verify_mapping.py  "$file" || status=1
  python3 scripts/verify_structure.py "$file" || status=1
done

echo "--- menu + search ---"
python3 scripts/verify_nav.py "$OUT/index.html" || status=1

echo "--- the sign-in page ---"
curl -sf "http://localhost:$PORT/signin" -o "$OUT/signin.html"
for r in not_allowed unverified access_denied signed_out; do
  curl -sf "http://localhost:$PORT/signin?reason=$r" -o "$OUT/r-$r.html"
  grep -q 'role="alert"' "$OUT/r-$r.html" || { echo "  ✗ no message for reason=$r"; status=1; }
done
echo " · renders, and every error state has its own message"
echo " · pages above rendered with AUTH_DISABLED=1"
exit $status
