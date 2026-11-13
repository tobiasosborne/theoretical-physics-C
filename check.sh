#!/usr/bin/env bash
# Check the lecture notes before a push. Everything here is fast.
#
#   ./check.sh           parity, figures, both PDFs, the lecture site
#   ./check.sh --fast    without the PDFs (a few seconds)
#   ./check.sh --tests   also the unit tests of the demo kernels (vitest)
#
#   parity    the German and English lectures agree in structure, display
#             equations, labels, references and figures
#   figures   every figure is included by one lecture in both editions and
#             has no German outside \tpcifenglish
#   pdf       both editions build: no LaTeX error, no undefined reference
#   site      every lecture converts to a web page; the two editions place
#             the same demos and figures
#
# The checks of the parked course (registry, evidence, red corpus, Julia
# references) are in dev/ci.sh and are not part of this.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"
FAST=0; TESTS=0
for a in "$@"; do
    case "$a" in
        --fast) FAST=1 ;;
        --tests) TESTS=1 ;;
        *) sed -n '2,/^$/p' "$0" | sed 's/^# \?//'; exit 2 ;;
    esac
done
RED='\033[0;31m'; GREEN='\033[0;32m'; NC='\033[0m'
failed=()
step() {   # $1 = name, rest = command
    local name="$1"; shift
    local log; log="$(mktemp)"
    local t0=$SECONDS
    if "$@" > "$log" 2>&1; then
        echo -e "${GREEN}ok${NC}    $name ($((SECONDS - t0)) s)"
    else
        echo -e "${RED}FAIL${NC}  $name"; tail -25 "$log"; failed+=("$name")
    fi
    rm -f "$log"
}
tsx="web/node_modules/.bin/tsx"
[[ -x $tsx ]] || { echo "check.sh: run (cd web && npm ci) first" >&2; exit 2; }

step parity  python3 scripts/check_parity.py
step figures python3 scripts/check_figures.py
if [[ $FAST -eq 0 ]]; then
    step pdf ./build.sh
    step site "$tsx" web/tools/lecture/build.ts
else
    step site "$tsx" web/tools/lecture/build.ts
fi
[[ $TESTS -eq 1 ]] && step tests web/node_modules/.bin/vitest run --root web

if [[ ${#failed[@]} -gt 0 ]]; then
    echo -e "${RED}failed: ${failed[*]}${NC}"; exit 1
fi
echo -e "${GREEN}all checks passed${NC}"
