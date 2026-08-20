#!/usr/bin/env bash
# Fetch every page exactly as a browser would, then check content and structure.
set -euo pipefail

PORT=${VERIFY_PORT:-4399}
OUT=$(mktemp -d)
trap 'npx astro dev stop >/dev/null 2>&1 || true; rm -rf "$OUT"' EXIT

npx astro build >/dev/null

AUTH_DISABLED=1 npx astro dev --port "$PORT" >"$OUT/dev.log" 2>&1 &
for _ in $(seq 1 60); do
  curl -sf -o /dev/null "http://localhost:$PORT/" && break
  sleep 0.5
done

ROUTES=(/ /milestones /weeks /workshops /playbook /playbook/inventory /playbook/revenue
        /playbook/offline /playbook/online-organic /playbook/influencer
        /playbook/performance /playbook/b2b /grading /flea /faq /signin)

python3 - "$OUT" "${ROUTES[@]}" <<'PY'
import json, sys, pathlib
out = pathlib.Path(sys.argv[1])
pages = {r: (r.strip('/').replace('/', '-') or 'index') + '.html' for r in sys.argv[2:]}
(out / 'pages.json').write_text(json.dumps(pages))
PY

status=0
for r in "${ROUTES[@]}"; do
  f="$OUT/$(echo "${r#/}" | tr '/' '-')"; [ "$r" = "/" ] && f="$OUT/index"
  curl -sf "http://localhost:$PORT$r" -o "$f.html" || { echo "  ✗ fetch failed: $r"; status=1; }
done

cat "$OUT"/*.html > "$OUT/union.html"
echo "--- content (all pages together) ---"
python3 scripts/verify_content.py "$OUT/union.html" || status=1

echo "--- structure, links, dashes ---"
python3 scripts/verify_pages.py "$OUT" || status=1

exit $status
