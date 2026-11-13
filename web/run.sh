#!/usr/bin/env bash
# Front end of the web tools, so that nobody has to remember the tsx paths:
#   bash web/run.sh build [--lectures 7,8] [--out DIR]   the lecture site -> build/site
#   bash web/run.sh test  [vitest args]                  unit tests of the demo kernels
#   bash web/run.sh serve [port]                         serve build/site on localhost
set -euo pipefail
WEB="$(cd "$(dirname "$0")" && pwd)"
tool="${1:-}"; shift || true
if [[ ! -x "$WEB/node_modules/.bin/tsx" ]]; then
    echo "web: node_modules missing; run: (cd web && npm ci)" >&2; exit 2
fi
case "$tool" in
    build) exec "$WEB/node_modules/.bin/tsx" "$WEB/tools/lecture/build.ts" "$@" ;;
    test)  exec "$WEB/node_modules/.bin/vitest" run --root "$WEB" "$@" ;;
    serve) exec python3 -m http.server "${1:-8000}" --bind 127.0.0.1 --directory "$WEB/../build/site" ;;
    *) sed -n '2,5p' "$0" | sed 's/^# \?//'; exit 2 ;;
esac
