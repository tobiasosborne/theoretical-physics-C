#!/usr/bin/env bash
# Build the lecture notes: TheoretischePhysikC.pdf and TheoreticalPhysicsC.pdf.
#
#   ./build.sh                 both editions, open fonts
#   ./build.sh --de            German only
#   ./build.sh --en            English only
#   ./build.sh --draft         one LaTeX pass (references may be stale)
#   ./build.sh --local-fonts   the commercial faces (MathTime Pro 2 etc.);
#                              never publish these PDFs
#   ./build.sh --tikz          draw the figures inside the document instead
#                              of including the cached figure PDFs (slow)
#   ./build.sh --preview F     render one figure file to PNG
#   ./build.sh --clean
#
# The figures are compiled once by scripts/build_figures.py and cached in
# build/figures/; the two editions are then built side by side.  A warm
# build takes well under a minute.
#
# Fails (exit 1) on a LaTeX error, a missing PDF, or an undefined reference.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
LATEX="$ROOT/latex"
DE_JOB="TheoretischePhysikC"
EN_JOB="TheoreticalPhysicsC"

FONTS=open; DRAFT=0; TIKZ=0; ACTION=build; TARGETS="de en"; PREVIEW=""

RED='\033[0;31m'; GREEN='\033[0;32m'; BLUE='\033[0;34m'; NC='\033[0m'
info() { echo -e "${BLUE}[info]${NC} $*"; }
ok()   { echo -e "${GREEN}[ok]${NC}   $*"; }
err()  { echo -e "${RED}[err]${NC}  $*" >&2; }

while [[ $# -gt 0 ]]; do
    case "$1" in
        --de)          TARGETS="de"; shift ;;
        --en)          TARGETS="en"; shift ;;
        --local-fonts) FONTS=local; shift ;;
        --cmfonts)     shift ;;                 # open fonts are the default
        --draft)       DRAFT=1; shift ;;
        --tikz)        TIKZ=1; shift ;;
        --clean)       ACTION=clean; shift ;;
        --preview)     ACTION=preview; PREVIEW="${2:-}"; shift 2 ;;
        --help|-h)     ACTION=help; shift ;;
        *)             err "unknown option: $1"; ACTION=help; shift ;;
    esac
done

# What a further pass could change: the .aux and .toc (absent on a clean tree).
state() { { cat "$1.aux" "$1.toc" 2>/dev/null || true; } | sha256sum; }

# $1 = job name, $2 = language.  Runs in a subshell, in parallel.
build_one() {
    local job="$1" lang="$2" inject="" passes=4
    cd "$LATEX"
    [[ $FONTS == local ]] && inject+="\\def\\tpcfonts{local}\\def\\tpcmath{mtpro2}"
    [[ $TIKZ -eq 0 ]] && inject+="\\def\\tpcfigcache{$ROOT/build/figures/$FONTS-$lang}"
    [[ $DRAFT -eq 1 ]] && passes=1

    rm -f "$job.pdf"
    local i before after
    for ((i = 1; i <= passes; i++)); do
        before=$(state "$job")
        xelatex -interaction=nonstopmode -halt-on-error -jobname="$job" \
            "${inject}\\input{$job.tex}" > "$job.stdout" 2>&1 || break
        after=$(state "$job")
        [[ "$before" == "$after" ]] && break       # settled
    done

    if [[ ! -f "$job.pdf" ]] || grep -q "^!" "$job.log"; then
        err "$job: LaTeX failed (latex/$job.log)"
        grep -A3 "^!" "$job.log" | head -12 >&2
        return 1
    fi
    if [[ $DRAFT -eq 0 ]] && grep -qE "(Reference|Citation) .* undefined" "$job.log"; then
        err "$job: undefined references"
        grep -E "(Reference|Citation) .* undefined" "$job.log" | sort -u | head -10 >&2
        return 1
    fi
    cp "$job.pdf" "$ROOT/$job.pdf"
    local pages
    pages=$(grep -oP 'Output written.*\(\K[0-9]+' "$job.log" | tail -1)
    ok "$job.pdf: $pages pages, $i pass(es)"
}

case "$ACTION" in
    help)  sed -n '2,/^$/p' "$0" | sed 's/^# \?//'; exit 0 ;;
    clean)
        rm -f "$LATEX"/*.{aux,log,out,toc,stdout,pdf} "$ROOT/$DE_JOB.pdf" "$ROOT/$EN_JOB.pdf"
        rm -rf "$ROOT/build/figures"
        ok "cleaned"; exit 0 ;;
    preview)
        [[ -n "$PREVIEW" ]] || { err "--preview needs a figure file"; exit 1; }
        exec bash "$ROOT/scripts/tikz-preview.sh" "$PREVIEW" ;;
esac

if [[ $TIKZ -eq 0 ]]; then
    langs=(); for t in $TARGETS; do langs+=(--lang "$t"); done
    python3 "$ROOT/scripts/build_figures.py" --fonts "$FONTS" "${langs[@]}"
fi

pids=()
for t in $TARGETS; do
    if [[ $t == de ]]; then (build_one "$DE_JOB" de) & else (build_one "$EN_JOB" en) & fi
    pids+=($!)
done
failed=0
for p in "${pids[@]}"; do wait "$p" || failed=1; done
exit $failed
