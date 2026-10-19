#!/usr/bin/env bash
# build_course.sh — build the new course from content/, one source, four editions
#
# Usage:
#   scripts/course/build_course.sh [options]
#
#   --chapters c00,c11     build only these chapters (IDs; default: every
#                          chapter under the content root except test chapters)
#   --with-test-chapter    include c99-contract-test in the default set
#   --edition full|kern    default full
#   --lang de|en           default de
#   --all-editions         full DE, full EN, Kern DE, Kern EN
#                          (with --lang or --edition given: all of the other axis)
#   --spot                 the spot matrix instead: full DE for pkg 2..5 on the
#                          light ground and pkg 1 and 4 on the dark ground,
#                          into <out>/spot/pkgN-<ground>/
#   --pkg 1..5             design package            (default 1)
#   --ground light|dark    ground                    (default light)
#   --math stix|mtpro2     math face                 (default stix)
#   --fonts open|local     text faces                (default open)
#   --content DIR          content root              (default content/)
#   --out DIR              output directory          (default build/course/)
#   --verbose              show xelatex output
#   --help
#
# Output: <out>/tpc-<lang>-<edition>.pdf and .log, working files in
# <out>/tpc-<lang>-<edition>/, among them build.json: the build record
# (compiler exit status, passes, sha256 of every source: chapters, styles,
# masters, registry/generated/**, design/build/pkgN-<ground>/**) that
# check_levels.py uses to refuse missing, failed or stale builds.  Exit status 0 only if every requested
# edition has zero TeX errors and zero undefined references or citations.
#
# References into chapters that are not part of a partial build are
# reported as "external" and do not fail the build; in a build of the
# whole course there is no such thing and they fail as undefined.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CONTENT="$ROOT/content"
OUT="$ROOT/build/course"
CHAPTERS=""
WITH_TEST=0
EDITION=""
LANG_=""
ALL=0
SPOT=0
PKG=1
GROUND=light
MATH=stix
FONTS=open
VERBOSE=0
TEST_CHAPTER_RE='^c99-'
MAX_PASSES=5

RED='\033[0;31m'; GREEN='\033[0;32m'; BLUE='\033[0;34m'; NC='\033[0m'
info() { echo -e "${BLUE}[info]${NC} $*"; }
ok()   { echo -e "${GREEN}[ok]${NC}   $*"; }
err()  { echo -e "${RED}[err]${NC}  $*" >&2; }
usage() { sed -n '2,/^$/p' "$0" | sed 's/^# \?//'; }

while [[ $# -gt 0 ]]; do
    case "$1" in
        --chapters)          CHAPTERS="$2"; shift 2 ;;
        --with-test-chapter) WITH_TEST=1; shift ;;
        --edition)           EDITION="$2"; shift 2 ;;
        --lang)              LANG_="$2"; shift 2 ;;
        --all-editions)      ALL=1; shift ;;
        --spot)              SPOT=1; shift ;;
        --pkg)               PKG="$2"; shift 2 ;;
        --ground)            GROUND="$2"; shift 2 ;;
        --math)              MATH="$2"; shift 2 ;;
        --fonts)             FONTS="$2"; shift 2 ;;
        --content)           CONTENT="$(cd "$2" && pwd)"; shift 2 ;;
        --out)               mkdir -p "$2"; OUT="$(cd "$2" && pwd)"; shift 2 ;;
        --verbose)           VERBOSE=1; shift ;;
        --help|-h)           usage; exit 0 ;;
        *)                   err "unknown option: $1"; usage; exit 2 ;;
    esac
done

check_value() { # name value allowed...
    local name="$1" value="$2"; shift 2
    for a in "$@"; do [[ "$value" == "$a" ]] && return 0; done
    err "--$name must be one of: $*  (got '$value')"; exit 2
}
[[ -n "$EDITION" ]] && check_value edition "$EDITION" full kern
[[ -n "$LANG_" ]]   && check_value lang "$LANG_" de en
check_value pkg "$PKG" 1 2 3 4 5
check_value ground "$GROUND" light dark
check_value math "$MATH" stix mtpro2
check_value fonts "$FONTS" open local

if [[ $ALL -eq 1 ]]; then
    LANGS="${LANG_:-de en}"; EDITIONS="${EDITION:-full kern}"
else
    LANGS="${LANG_:-de}"; EDITIONS="${EDITION:-full}"
fi

# ── Discover chapters ─────────────────────────────────────────
shopt -s nullglob
all_dirs=()
for d in "$CONTENT"/c[0-9][0-9]-*/; do
    [[ -f "$d/de.tex" ]] && all_dirs+=("$(basename "$d")")
done
if [[ ${#all_dirs[@]} -eq 0 ]]; then
    err "no chapters (cNN-slug/de.tex) under $CONTENT"; exit 2
fi

selected=()
course_dirs=()   # the whole course: everything but test chapters
for d in "${all_dirs[@]}"; do
    [[ "$d" =~ $TEST_CHAPTER_RE ]] || course_dirs+=("$d")
done
if [[ -n "$CHAPTERS" ]]; then
    IFS=',' read -ra want <<< "$CHAPTERS"
    for id in "${want[@]}"; do
        found=0
        for d in "${all_dirs[@]}"; do
            if [[ "${d%%-*}" == "$id" ]]; then selected+=("$d"); found=1; fi
        done
        if [[ $found -eq 0 ]]; then err "no chapter '$id' under $CONTENT"; exit 2; fi
    done
else
    selected=("${course_dirs[@]}")
    if [[ $WITH_TEST -eq 1 ]]; then
        for d in "${all_dirs[@]}"; do
            [[ "$d" =~ $TEST_CHAPTER_RE ]] && selected+=("$d")
        done
    fi
fi
if [[ ${#selected[@]} -eq 0 ]]; then
    err "nothing to build (only test chapters exist; use --chapters c99 or --with-test-chapter)"
    exit 2
fi
IFS=$'\n' selected=($(printf '%s\n' "${selected[@]}" | sort -u)); unset IFS

# Partial: some chapter of the course proper is not in this build.
partial=0
[[ ${#course_dirs[@]} -eq 0 ]] && partial=1
for d in "${course_dirs[@]}"; do
    [[ " ${selected[*]} " == *" $d "* ]] || partial=1
done
# ...and so is a build while planned chapters are still unwritten: the plan
# (content/COURSE.json, "planned": ["c00", ...]) lists every chapter of the
# course; a planned chapter with no directory under content/ makes the build
# partial, so references into it are logged as external instead of failing.
# (Added by the Phase 0 coordinator, 2026-10-12.)
if [[ -f "$CONTENT/COURSE.json" ]]; then
    while read -r planned_id; do
        [[ -z "$planned_id" ]] && continue
        have=0
        for d in "${selected[@]}"; do [[ "${d%%-*}" == "$planned_id" ]] && have=1; done
        [[ $have -eq 0 ]] && partial=1
    done < <(python3 -c "import json,sys; print('\n'.join(json.load(open(sys.argv[1]))['planned']))" "$CONTENT/COURSE.json")
fi
chapter_list="$(IFS=,; echo "${selected[*]}")"

# ── Spot matrix ───────────────────────────────────────────────
if [[ $SPOT -eq 1 ]]; then
    spot_failed=0
    for combo in 2:light 3:light 4:light 5:light 1:dark 4:dark; do
        p="${combo%%:*}"; g="${combo##*:}"
        info "spot: pkg=$p ground=$g"
        "$0" --chapters "$(printf '%s\n' "${selected[@]}" | sed 's/-.*//' | paste -sd,)" \
             --content "$CONTENT" --out "$OUT/spot/pkg$p-$g" \
             --lang de --edition full --pkg "$p" --ground "$g" \
             --math "$MATH" --fonts "$FONTS" || spot_failed=1
    done
    if [[ $spot_failed -ne 0 ]]; then err "spot matrix FAILED"; exit 1; fi
    ok "spot matrix complete: $OUT/spot"
    exit 0
fi

DESIGN_DIR="$ROOT/design/build/pkg${PKG}-${GROUND}"
export max_print_line=10000   # no hard wraps in the log: the checkers read it
export TEXINPUTS=".:$ROOT/latex/course:$ROOT/latex:$ROOT/registry/generated:$DESIGN_DIR:$ROOT/design/build:${TEXINPUTS:-}"

info "chapters: $chapter_list$([[ $partial -eq 1 ]] && echo '  (partial build)')"
info "flags: pkg=$PKG ground=$GROUND math=$MATH fonts=$FONTS"

# ── One edition ───────────────────────────────────────────────
build_one() {
    local lang="$1" edition="$2"
    local job="tpc-$lang-$edition"
    local work="$OUT/$job"
    rm -rf "$work"; mkdir -p "$work"

    local defs="\\def\\tpcchapterlist{$chapter_list}\\def\\tpccontentroot{$CONTENT}"
    defs+="\\def\\tpcpkg{$PKG}\\def\\tpcground{$GROUND}\\def\\tpcmath{$MATH}\\def\\tpcfonts{$FONTS}"
    [[ $partial -eq 1 ]] && defs+="\\def\\tpcpartialbuild{1}"

    local pass=0 log="$work/$job.log" status=0
    while (( pass < MAX_PASSES )); do
        pass=$((pass + 1))
        local before=""
        [[ -f "$work/$job.aux" ]] && before="$(sha256sum "$work/$job.aux" "$work/$job.toc" 2>/dev/null | cut -d' ' -f1 | tr -d '\n')"
        status=0
        if [[ $VERBOSE -eq 1 ]]; then
            ( cd "$ROOT/latex" && xelatex -interaction=nonstopmode -file-line-error \
                -output-directory="$work" -jobname="$job" \
                "$defs\\input{course-$lang-$edition.tex}" ) || status=$?
        else
            ( cd "$ROOT/latex" && xelatex -interaction=nonstopmode -file-line-error \
                -output-directory="$work" -jobname="$job" \
                "$defs\\input{course-$lang-$edition.tex}" ) > /dev/null 2>&1 || status=$?
        fi
        [[ -f "$log" ]] || { err "$job: xelatex produced no log"; return 1; }
        local after
        after="$(sha256sum "$work/$job.aux" "$work/$job.toc" 2>/dev/null | cut -d' ' -f1 | tr -d '\n')"
        # stable: auxiliary files unchanged and no rerun request
        if (( pass >= 2 )) && [[ "$before" == "$after" ]] \
           && ! grep -q "Rerun to get\|Label(s) may have changed" "$log"; then
            break
        fi
    done

    python3 "$ROOT/scripts/course/build_record.py" --root "$ROOT" --content "$CONTENT" \
        --work "$work" --job "$job" --lang "$lang" --edition "$edition" \
        --chapters "$chapter_list" --partial "$partial" --exit-status "$status" \
        --passes "$pass" --pkg "$PKG" --ground "$GROUND" --math "$MATH" --fonts "$FONTS"

    local errors undefined multiply external pages
    errors=$(grep -c "^!\|^[^ ]*:[0-9][0-9]*: " "$log") || errors=0
    undefined=$(grep -c "LaTeX Warning: \(Reference\|Citation\) .* undefined" "$log") || undefined=0
    multiply=$(grep -c "LaTeX Warning: Label .* multiply defined" "$log") || multiply=0
    external=$(grep "^TPC-EXTERNAL-REF: " "$log" | sort -u | wc -l) || external=0
    pages=$(grep -oP 'Output written.*\(\K[0-9]+' "$log" | tail -1) || pages="?"

    cp "$log" "$OUT/$job.log"
    if [[ "$errors" -gt 0 || "$undefined" -gt 0 || "$multiply" -gt 0 || "$status" -ne 0 ]]; then
        err "$job: xelatex exit $status, $errors error(s), $undefined undefined reference(s), $multiply duplicate label(s) — $OUT/$job.log"
        { grep -A2 "^!\|^[^ ]*:[0-9][0-9]*: " "$log" || true; } | head -12 | sed 's/^/      /'
        { grep "LaTeX Warning: \(Reference\|Citation\) .* undefined\|multiply defined" "$log" || true; } \
            | sort -u | head -8 | sed 's/^/      /'
        rm -f "$OUT/$job.pdf"
        [[ -f "$work/$job.pdf" ]] && cp "$work/$job.pdf" "$OUT/$job.FAILED.pdf"
        return 1
    fi
    rm -f "$OUT/$job.FAILED.pdf"
    cp "$work/$job.pdf" "$OUT/$job.pdf"
    ok "$job.pdf  ${pages:-?} pages, $pass passes, 0 errors, 0 undefined references$([[ "$external" -gt 0 ]] && echo ", $external external reference(s)")"
    if [[ "$external" -gt 0 ]]; then
        grep "^TPC-EXTERNAL-REF: " "$log" | sort -u | sed 's/^/      /'
    fi
}

mkdir -p "$OUT"
failed=0
for lang in $LANGS; do
    for edition in $EDITIONS; do
        build_one "$lang" "$edition" || failed=1
    done
done
if [[ $failed -ne 0 ]]; then
    err "course build FAILED"
    exit 1
fi
ok "course build complete: $OUT"
