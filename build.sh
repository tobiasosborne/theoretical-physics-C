#!/usr/bin/env bash
# build.sh — Build tool for the Theoretische Physik C lecture notes
#
# Usage:
#   ./build.sh                Build both editions (German + English)
#   ./build.sh --de           Build the German edition only
#   ./build.sh --en           Build the English edition only
#   ./build.sh --draft        Fast single-pass build (no cross-refs)
#   ./build.sh --cmfonts      Computer Modern (no Times LT / Whitney / mtpro2)
#   ./build.sh --figures      Regenerate figure data via the Julia scripts
#   ./build.sh --preview F    Compile one TikZ figure to PNG
#   ./build.sh --clean        Remove generated files
#   ./build.sh --verbose      Show full xelatex output
#   ./build.sh --help         Show this help
#
# The PDFs are copied to the repo root when the build succeeds.

set -euo pipefail

PROJ_ROOT="$(cd "$(dirname "$0")" && pwd)"
LATEX_DIR="$PROJ_ROOT/latex"
SCRIPTS_DIR="$PROJ_ROOT/scripts"

DE_JOB="TheoretischePhysikC"
EN_JOB="TheoreticalPhysicsC"

CMFONTS=0
DRAFT=0
VERBOSE=0
ACTION="build"
TARGETS="de en"
PREVIEW_FILE=""

RED='\033[0;31m'; GREEN='\033[0;32m'; BLUE='\033[0;34m'
BOLD='\033[1m'; NC='\033[0m'
info() { echo -e "${BLUE}[info]${NC} $*"; }
ok()   { echo -e "${GREEN}[ok]${NC}   $*"; }
err()  { echo -e "${RED}[err]${NC}  $*" >&2; }

while [[ $# -gt 0 ]]; do
    case "$1" in
        --de)       TARGETS="de"; shift ;;
        --en)       TARGETS="en"; shift ;;
        --cmfonts)  CMFONTS=1; shift ;;
        --draft)    DRAFT=1; shift ;;
        --verbose)  VERBOSE=1; shift ;;
        --figures)  ACTION="figures"; shift ;;
        --clean)    ACTION="clean"; shift ;;
        --preview)  ACTION="preview"; PREVIEW_FILE="${2:-}"; shift 2 ;;
        --help|-h)  ACTION="help"; shift ;;
        *)          err "Unknown option: $1"; ACTION="help"; shift ;;
    esac
done

show_help() { sed -n '2,/^$/p' "$0" | sed 's/^# \?//'; }

# ── Figure data ───────────────────────────────────────────────
run_figures() {
    info "Regenerating figure data..."
    if ! command -v julia &>/dev/null; then
        err "Julia not found — install Julia 1.11+ to regenerate figure data."
        return 1
    fi
    julia --project="$SCRIPTS_DIR" -e 'using Pkg; Pkg.instantiate()'
    shopt -s nullglob
    local scripts=("$SCRIPTS_DIR"/sim_*.jl)
    if [[ ${#scripts[@]} -eq 0 ]]; then
        info "No sim_*.jl scripts yet — figures are currently self-contained."
        return 0
    fi
    for s in "${scripts[@]}"; do
        info "Running $(basename "$s")..."
        julia --project="$SCRIPTS_DIR" "$s"
    done
    ok "Figure data written to $LATEX_DIR/data/"
}

# ── One edition ───────────────────────────────────────────────
# $1 = job name, $2 = human-readable label
build_one() {
    local job="$1" label="$2"
    local main="$job.tex"

    if [[ ! -f "$LATEX_DIR/$main" ]]; then
        err "$main not found — skipping $label"
        return 1
    fi

    cd "$LATEX_DIR"

    local redirect=""
    [[ $VERBOSE -eq 0 ]] && redirect="> /dev/null 2>&1"

    local inject=""
    if [[ $CMFONTS -eq 1 ]]; then
        inject="\\PassOptionsToPackage{cmfonts}{tpc-style}"
    fi

    local xelatex_cmd="xelatex -interaction=nonstopmode"
    local passes=3
    [[ $DRAFT -eq 1 ]] && passes=1

    for ((i = 1; i <= passes; i++)); do
        info "$label: pass $i/$passes..."
        if [[ -n "$inject" ]]; then
            eval $xelatex_cmd -jobname="$job" "'${inject}\\input{$main}'" $redirect || true
        else
            eval $xelatex_cmd "$main" $redirect || true
        fi
    done

    # Report
    local errors=0 pages="?"
    errors=$(grep -c "^!" "$job.log" 2>/dev/null) || errors=0
    pages=$(grep -oP 'Output written.*\(\K[0-9]+' "$job.log" 2>/dev/null | tail -1) || pages="?"

    if [[ $errors -gt 0 ]]; then
        err "$label: $errors error(s) — see latex/$job.log"
        grep "^!" "$job.log" | sort | uniq -c | sort -rn | head -10
        cd "$PROJ_ROOT"
        return 1
    fi

    cp "$job.pdf" "$PROJ_ROOT/$job.pdf" 2>/dev/null || true
    ok "Built ${BOLD}$job.pdf${NC} ($pages pages, 0 errors)"
    cd "$PROJ_ROOT"
}

build_all() {
    local failed=0
    for t in $TARGETS; do
        case "$t" in
            de) build_one "$DE_JOB" "German " || failed=1 ;;
            en) build_one "$EN_JOB" "English" || failed=1 ;;
        esac
    done
    return $failed
}

clean() {
    info "Cleaning generated files..."
    cd "$LATEX_DIR"
    rm -f {"$DE_JOB","$EN_JOB"}.{aux,bbl,blg,log,out,toc,pdf,synctex.gz,fls,fdb_latexmk}
    rm -f lectures/de/*.aux lectures/en/*.aux
    rm -f figures/*.png figures/*.pdf
    cd "$PROJ_ROOT"
    rm -f "$DE_JOB.pdf" "$EN_JOB.pdf"
    ok "Cleaned"
}

preview_figure() {
    if [[ -z "$PREVIEW_FILE" ]]; then
        err "Usage: $0 --preview <figure.tex>"
        return 1
    fi
    bash "$SCRIPTS_DIR/tikz-preview.sh" "$PREVIEW_FILE"
}

case "$ACTION" in
    help)     show_help ;;
    figures)  run_figures ;;
    build)    build_all ;;
    clean)    clean ;;
    preview)  preview_figure ;;
esac
