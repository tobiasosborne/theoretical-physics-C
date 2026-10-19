#!/usr/bin/env bash
# Run one web tool from any directory; paths in the arguments are relative to where you are.
#   bash web/run.sh build   [options]     tools/build/main.ts      build the site
#   bash web/run.sh corpus  [options]     tools/corpus/main.ts     formula corpus gate (static)
#   bash web/run.sh static  [options]     tools/checks/static.ts   ids, links, external, demos
#   bash web/run.sh browser [options]     tools/checks/browser.ts  Playwright gates
#   bash web/run.sh capture [options]     tools/capture/capture.ts frame capture
#   bash web/run.sh shots   [options]     tools/shots/shot.ts      screenshots
#   bash web/run.sh test    [vitest args] vitest run               kernel golden tests, unit tests
#   bash web/run.sh fonts   [--check]     tools/fonts/collect_fonts.py
set -euo pipefail
WEB="$(cd "$(dirname "$0")" && pwd)"
tool="${1:-}"; shift || true
if [[ ! -x "$WEB/node_modules/.bin/tsx" ]]; then
    echo "web: node_modules missing; run: (cd web && npm ci)" >&2; exit 2
fi
case "$tool" in
    build)   exec "$WEB/node_modules/.bin/tsx" "$WEB/tools/build/main.ts" "$@" ;;
    corpus)  exec "$WEB/node_modules/.bin/tsx" "$WEB/tools/corpus/main.ts" "$@" ;;
    static)  exec "$WEB/node_modules/.bin/tsx" "$WEB/tools/checks/static.ts" "$@" ;;
    browser) exec "$WEB/node_modules/.bin/tsx" "$WEB/tools/checks/browser.ts" "$@" ;;
    capture) exec "$WEB/node_modules/.bin/tsx" "$WEB/tools/capture/capture.ts" "$@" ;;
    shots)   exec "$WEB/node_modules/.bin/tsx" "$WEB/tools/shots/shot.ts" "$@" ;;
    test)    exec "$WEB/node_modules/.bin/vitest" run --root "$WEB" "$@" ;;
    fonts)   exec python3 "$WEB/tools/fonts/collect_fonts.py" "$@" ;;
    *) sed -n '2,10p' "$0" | sed 's/^# \?//'; exit 2 ;;
esac
