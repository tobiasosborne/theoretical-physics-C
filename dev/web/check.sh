#!/usr/bin/env bash
# web/check.sh — build the site and run every web gate.
#
#   bash web/check.sh --chapters c99            everything
#   bash web/check.sh --chapters c00,c11 --fast skip the browser gates (no Playwright)
#
#   --chapters LIST   chapter IDs (default: every chapter except test chapters)
#   --fast            skip the Playwright gates (c7, nav, corpus rendering, demos, standalone)
#   --pkg N --ground light|dark    design of the pages (default 1, light)
#   --figure-variants LIST         passed to the build (see web/README.md)
#   --content DIR --course-build DIR --out DIR   other inputs and output
#
# Needs the print build first (numbers come from its .aux):
#   bash scripts/course/build_course.sh --chapters <LIST> --all-editions
# Exit status 0 only if every stage passes. Each stage is also a command of its own:
# see web/README.md, section "Gates".
set -uo pipefail
WEB="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$WEB/.." && pwd)"
CHAPTERS=""; FAST=0; BUILD_ARGS=(); CONTENT=""; OUT="$ROOT/build/web"
while [[ $# -gt 0 ]]; do
    case "$1" in
        --chapters) CHAPTERS="$2"; shift 2 ;;
        --fast) FAST=1; shift ;;
        --pkg|--ground|--figure-variants|--course-build) BUILD_ARGS+=("$1" "$2"); shift 2 ;;
        --content) CONTENT="$2"; BUILD_ARGS+=("$1" "$2"); shift 2 ;;
        --out) OUT="$2"; BUILD_ARGS+=("$1" "$2"); shift 2 ;;
        --help|-h) sed -n '2,/^set -uo/p' "$0" | sed '$d' | sed 's/^# \?//'; exit 0 ;;
        *) echo "check.sh: unknown option $1" >&2; exit 2 ;;
    esac
done
CH=(); [[ -n "$CHAPTERS" ]] && CH=(--chapters "$CHAPTERS")
CT=(); [[ -n "$CONTENT" ]] && CT=(--content "$CONTENT")

if [[ ! -d "$WEB/node_modules" ]]; then
    echo "── web: npm ci"
    (cd "$WEB" && npm ci --no-audit --no-fund) || { echo "web: FAIL npm ci"; exit 1; }
fi

failed=0; ran=0
stage() { # name, command...
    local name="$1"; shift
    ran=$((ran + 1))
    echo "── web: $name"
    if "$@"; then :; else failed=$((failed + 1)); echo "web: FAIL stage: $name"; fi
}

stage "types (tsc --noEmit)"          bash -c "cd '$WEB' && mkdir -p '$ROOT/build/web/gen' && node_modules/.bin/tsx -e \"import {writeGen} from './tools/build/gen.ts'; import {defaultPaths} from './tools/convert/env.ts'; writeGen(defaultPaths(), 1, 'light')\" && node_modules/.bin/tsc --noEmit -p tsconfig.json"
stage "fonts (open, with licence)"    bash "$WEB/run.sh" fonts --check
stage "no literals in web/src"        python3 "$ROOT/design/lint_content.py" "$WEB/src"
stage "build (converter, bundles)"    bash "$WEB/run.sh" build "${CH[@]}" "${BUILD_ARGS[@]}"
stage "unit and kernel golden tests"  bash "$WEB/run.sh" test
stage "formula corpus (convert)"      bash "$WEB/run.sh" corpus "${CH[@]}" "${CT[@]}"
stage "pages: ids, links, external, demos"  bash "$WEB/run.sh" static --site "$OUT/site" --standalone "$OUT/standalone" "${CH[@]}" "${CT[@]}"
if [[ $FAST -eq 0 ]]; then
    stage "browser: c7, nav, corpus, demos, standalone"  bash "$WEB/run.sh" browser --out "$OUT" "${CH[@]}" "${CT[@]}"
else
    echo "── web: browser gates skipped (--fast)"
fi

echo
if [[ $failed -ne 0 ]]; then
    echo "web: FAILED: $failed of $ran stage(s)"
    exit 1
fi
echo "web: ok: $ran stage(s)$([[ $FAST -eq 1 ]] && echo ' (browser gates skipped)')"
