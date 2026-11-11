#!/usr/bin/env bash
# ci.sh — the gates of the Theoretische Physik C repository (old script and new course).
#
# Two tiers (CLAUDE.md, section "Gates"):
#
#   ./ci.sh --fast   Fast tier, before every commit. The static gates on the whole
#                    repository (structure, parity, enrichment, figure inclusion,
#                    tokens, content lint, registry, special functions, evidence,
#                    golden values, c11 formulas, levels lint), plus builds of the
#                    affected units only: the four editions of each affected course
#                    chapter with the build checks K1-K6, and, if the script is
#                    affected, both masters and the standalone figures. The affected
#                    units come from --chapters or, without it, from `git diff HEAD`
#                    and the untracked files.
#   ./ci.sh          Full tier, before every push (a push to master deploys the
#                    student site). Every gate of the fast tier for every unit, plus
#                    the web check with the browser gates, the game and hydrogen-view
#                    checks and the Julia reference tests.
#
# Independent gates run in parallel; the report is printed in a fixed order when all
# have finished, with the seconds each gate took.
#
# Private source payloads (gitignored: the books, the CODATA table, the Plavala arXiv
# source) are detected automatically. Without them the evidence and registry gates run
# in public mode and the gates that read a payload file are skipped and listed.
#
# Last known green: a full run (no --chapters) that passes on a clean tree moves the
# local tag ci-green to HEAD (lightweight, never pushed). A failing run prints the
# last green commit and the commits since, for git revert or git bisect.
#
# Options:
#   --chapters LIST  units to build, comma-separated: course chapter IDs (c03) and
#                    'script' (both masters and the script figures). In the full tier
#                    it narrows the course build, K1-K6 and the web check to these
#                    chapters; leave it out before a push.
#   --red            only the red corpus (tests/red/, frozen): run it after changing
#                    a gate script, and after a full tier (some cases read its builds)
#   --maps           only the migration-map checks of lectures 1-6 (frozen bookkeeping)
#   --parity         only the script parity check
#   --install-hook   install .git/hooks/pre-commit running ./ci.sh --fast
#
# Exit status is 0 only when every gate passes.

set -uo pipefail

PROJ_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJ_ROOT"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[0;33m'
BLUE='\033[0;34m'; BOLD='\033[1m'; NC='\033[0m'

MODE=full
UNITS=""
UNITS_GIVEN=0

while [[ $# -gt 0 ]]; do
    case "$1" in
        --fast)     MODE=fast; shift ;;
        --chapters) UNITS="${2:-}"; UNITS_GIVEN=1; shift 2 ;;
        --red)      MODE=red; shift ;;
        --maps)     MODE=maps; shift ;;
        --parity)   MODE=parity; shift ;;
        --install-hook)
            mkdir -p .git/hooks
            cat > .git/hooks/pre-commit <<'HOOK'
#!/usr/bin/env bash
exec "$(git rev-parse --show-toplevel)/ci.sh" --fast
HOOK
            chmod +x .git/hooks/pre-commit
            echo -e "${GREEN}installed .git/hooks/pre-commit (runs ci.sh --fast)${NC}"
            exit 0 ;;
        --help|-h)
            sed -n '2,/^$/p' "$0" | sed 's/^# \?//'; exit 0 ;;
        *) echo "Unknown option: $1" >&2; exit 2 ;;
    esac
done

JOBDIR="$(mktemp -d "${TMPDIR:-/tmp}/tpc-ci.XXXXXX")"
trap 'rm -rf "$JOBDIR"' EXIT
: > "$JOBDIR/failed"; : > "$JOBDIR/skipped"

# ── One gate: run it, report ok/FAIL with its time, record a failure ──────────
run_gate() {
    # run_gate "label" command...
    local label="$1"; shift
    local t0=$SECONDS out
    if out=$("$@" 2>&1); then
        printf "  %-38s ${GREEN}ok${NC}   %4ss  %s\n" "$label" "$((SECONDS - t0))" \
            "$(echo "$out" | tail -1 | cut -c1-80)"
        return 0
    fi
    printf "  %-38s ${RED}FAIL${NC} %4ss\n" "$label" "$((SECONDS - t0))"
    echo "$out" | tail -15 | sed 's/^/      /'
    echo "$label" >> "$JOBDIR/failed"
    return 1
}

skip_gate() {
    # skip_gate "label" "reason"
    printf "  %-38s ${YELLOW}skip${NC}         %s\n" "$1" "$2"
    echo "$1 ($2)" >> "$JOBDIR/skipped"
}

# gate_if FILE "label" command...  — run the gate if the payload FILE is on this machine
gate_if() {
    local need="$1" label="$2"; shift 2
    if [[ -e "$need" ]]; then run_gate "$label" "$@"
    else skip_gate "$label" "needs the private payload $need"; fi
}
PAYLOAD_PROBE=sources/reed-simon-3/reed-simon-3.djvu     # any book payload: private mode
CODATA=sources/codata-2022/allascii.txt
PLAVALA=docs/plan/research/curriculum/plavala-src/basic_v3.tex

# ── Jobs: each runs in the background into its own file; reported in start order ─
JOBS=(); PIDS=(); GROUPS_=()
job() {
    # job "group" "name" command...   (a function running one or more run_gate)
    local group="$1" name="$2"; shift 2
    JOBS+=("$name"); GROUPS_+=("$group")
    ( "$@" ) > "$JOBDIR/$name.out" 2>&1 &
    PIDS+=($!)
}

report_jobs() {
    local i last=""
    for i in "${!JOBS[@]}"; do
        wait "${PIDS[$i]}" 2>/dev/null
        if [[ "${GROUPS_[$i]}" != "$last" ]]; then
            echo
            echo -e "${BLUE}${BOLD}── ${GROUPS_[$i]} ${NC}"
            last="${GROUPS_[$i]}"
        fi
        cat "$JOBDIR/${JOBS[$i]}.out"
    done
}

# ══════════════════════════════════════════════════════════════
#  Script (latex/): structure, figures, masters
# ══════════════════════════════════════════════════════════════
structure_check() {
    # Both masters \input exactly the lectures on disk, and the lecture counts agree.
    local bad=0 de_files en_files path f stem
    de_files=$(find latex/lectures/de -name 'vl[0-9][0-9].tex' | wc -l)
    en_files=$(find latex/lectures/en -name 'lec[0-9][0-9].tex' | wc -l)
    if [[ "$de_files" -ne "$en_files" ]]; then
        echo "lecture counts differ ($de_files German, $en_files English)"; bad=1
    fi
    while read -r path; do
        [[ -z "$path" ]] && continue
        [[ -f "latex/$path.tex" ]] || { echo "missing: latex/$path.tex (\\input from a master)"; bad=1; }
    done < <(grep -ohP '\\input\{\K[^}]+' latex/TheoretischePhysikC.tex latex/TheoreticalPhysicsC.tex)
    for f in latex/lectures/de/vl[0-9][0-9].tex; do
        stem="lectures/de/$(basename "$f" .tex)"
        grep -q "\\\\input{$stem}" latex/TheoretischePhysikC.tex \
            || { echo "orphan: $f is not \\input by the German master"; bad=1; }
    done
    for f in latex/lectures/en/lec[0-9][0-9].tex; do
        stem="lectures/en/$(basename "$f" .tex)"
        grep -q "\\\\input{$stem}" latex/TheoreticalPhysicsC.tex \
            || { echo "orphan: $f is not \\input by the English master"; bad=1; }
    done
    [[ $bad -eq 0 ]] && echo "$de_files German and $en_files English lectures, all \\input by their masters"
    return $bad
}

compile_figures() {
    # Every script figure compiles on its own (scripts/tikz-preview.sh), eight at a time.
    shopt -s nullglob
    local figs=(latex/figures/fig_*.tex) failed
    failed=$(printf '%s\n' "${figs[@]}" | xargs -P 8 -I{} \
        sh -c 'bash scripts/tikz-preview.sh "$1" >/dev/null 2>&1 || echo "  failed: $1"' _ {})
    if [[ -n "$failed" ]]; then
        echo "$failed"; echo "$(echo "$failed" | wc -l) of ${#figs[@]} figure(s) failed to compile"
        return 1
    fi
    echo "all ${#figs[@]} figure(s) compile"
}

build_master() {
    # build_master JOB OUTDIR — one xelatex pass of a master into OUTDIR. Fails unless
    # xelatex exits 0, the log has no '!' error and a non-empty PDF was written.
    local job="$1" out="$2" status=0 errors pages
    mkdir -p "$out"
    rm -f "$out/$job.pdf" "$out/$job.log"
    ( cd latex && max_print_line=10000 xelatex -interaction=nonstopmode -output-directory="$out" "$job.tex" \
        > /dev/null 2>&1 ) || status=$?
    if [[ ! -s "$out/$job.log" ]]; then
        echo "xelatex (exit $status) wrote no log for $job"; return 1
    fi
    errors=$(grep -c "^!" "$out/$job.log") || errors=0
    pages=$(grep -oP 'Output written.*\(\K[0-9]+' "$out/$job.log" | tail -1) || pages=""
    if [[ "$errors" -gt 0 || "$status" -ne 0 || ! -s "$out/$job.pdf" || -z "$pages" ]]; then
        echo "$job: xelatex exit $status, $errors error(s), PDF $([[ -s "$out/$job.pdf" ]] && echo written || echo missing)"
        grep "^!" "$out/$job.log" | sort | uniq -c | sort -rn | head -5
        return 1
    fi
    echo "$job.pdf: $pages pages, 0 errors ($out)"
}

# ══════════════════════════════════════════════════════════════
#  Course (content/): builds, build checks, web
# ══════════════════════════════════════════════════════════════
course_chapters_all() {
    # every chapter ID under content/, the test chapter c99 included
    local d
    for d in content/c[0-9][0-9]-*/; do
        [[ -f "$d/de.tex" ]] && basename "$d" | cut -d- -f1
    done
}

affected_units() {
    # Units touched by the working tree against HEAD (tracked changes and untracked
    # files): course chapter IDs, and 'script'. Shared course inputs mark every
    # chapter; the shared styles latex/tpc-*.sty mark every chapter and the script.
    local p all=0 script=0 chs=""
    while read -r p; do
        [[ -z "$p" ]] && continue
        case "$p" in
            latex/tpc-*.sty)                  all=1; script=1 ;;
            latex/course/*|content/COURSE.json|registry/generated/*|design/tokens/*|design/build_tokens.py|scripts/course/*)
                                              all=1 ;;
            content/c[0-9][0-9]-*/*)          chs+=" $(echo "${p#content/}" | cut -d- -f1)" ;;
            latex/*)                          script=1 ;;
        esac
    done < <( { git diff --name-only HEAD --; git ls-files --others --exclude-standard; } 2>/dev/null )
    [[ $all -eq 1 ]] && chs="$(course_chapters_all | tr '\n' ' ')"
    local out=() c
    for c in $(echo "$chs" | tr ' ' '\n' | sort -u); do
        ls -d content/"$c"-*/de.tex >/dev/null 2>&1 && out+=("$c")
    done
    [[ $script -eq 1 ]] && out+=(script)
    (IFS=,; echo "${out[*]}")
}

course_chain() {
    # course_chain OUTDIR WEB(0|1) [CHAPTER-LIST]  — build, K1-K6, then the web gates.
    local out="$1" web="$2" list="${3:-}" sel=() wsel=()
    if [[ -n "$list" ]]; then sel=(--chapters "$list"); wsel=(--chapters "$list")
    else sel=(--with-test-chapter); fi
    run_gate "course: four editions" bash scripts/course/build_course.sh "${sel[@]}" \
        --all-editions --out "$out/course" || return 1
    run_gate "course: K1-K6 on the builds" python3 scripts/course/check_levels.py "${sel[@]}" \
        --build "$out/course" --no-lint
    [[ $web -eq 1 ]] || return 0
    run_gate "web: build + browser gates" bash web/check.sh "${wsel[@]}" \
        --course-build "$out/course" --out "$out/web" || return 1
    if [[ -z "$list" || ",$list," == *",c02,"* ]]; then
        run_gate "game: levels played to optimum" web/node_modules/.bin/tsx \
            web/tests/kernels/gpt-play.browser.ts --standalone "$out/web/standalone"
    fi
    if [[ -z "$list" || ",$list," == *",c11,"* ]]; then
        run_gate "hydrogen views mount, repeat" web/node_modules/.bin/tsx \
            web/video/c11-views-check.ts --standalone "$out/web/standalone"
    fi
}

# ══════════════════════════════════════════════════════════════
#  Static gates: the same in both tiers, each its own job
# ══════════════════════════════════════════════════════════════
evidence_chain() {
    # Private mode needs the gitignored source payloads and writes the receipt that
    # public mode then checks; so private runs first when the payloads are here.
    if [[ -f $PAYLOAD_PROBE ]]; then
        run_gate "claims/provenance (private)" python3 scripts/evidence/check_evidence.py --private || return 1
    else
        skip_gate "claims/provenance (private)" "source payloads not on this machine"
    fi
    run_gate "claims/provenance (public)" python3 scripts/evidence/check_evidence.py --public
}

start_static_jobs() {
    local G="Static gates" d chk
    job "$G" structure  run_gate "structure (masters, lectures)" structure_check
    job "$G" parity     run_gate "script parity (DE/EN)"           python3 scripts/check_parity.py
    if [[ -d archive/skript-2022 ]]; then
        job "$G" enrich run_gate "enrichment (v0.1 preserved)"     python3 scripts/check_enrichment.py
    fi
    job "$G" figincl    run_gate "figures included, bilingual"     python3 scripts/check_figures.py
    job "$G" tokens     run_gate "tokens up to date + measured"    python3 design/build_tokens.py --check
    job "$G" lint       run_gate "no design literals in content"   python3 design/lint_content.py
    if [[ -f $PAYLOAD_PROBE ]]; then
        job "$G" registry run_gate "notation/definitions registry" python3 scripts/registry/check_registry.py --private
    else
        job "$G" registry run_gate "registry (public: no payloads)" python3 scripts/registry/check_registry.py --public
    fi
    job "$G" special    run_gate "special-function conventions"    python3 scripts/registry/check_special_functions.py
    job "$G" evidence   evidence_chain
    for d in evidence/derivations/*/; do
        for chk in "$d"check_*.py; do
            [[ -f "$chk" ]] || continue
            local need=.     # c02 quotes the Plavala source, c11 reads the CODATA table
            case "$(basename "$d")" in c02) need=$PLAVALA ;; c11) need=$CODATA ;; esac
            job "$G" "golden-$(basename "$d")-$(basename "$chk" .py)" \
                gate_if "$need" "golden values $(basename "$d")" python3 "$chk" --verify
        done
    done
    job "$G" c11form    run_gate "c11 formulas (norms, signs, ODEs)" python3 scripts/c11/check_c11_formulas.py
    job "$G" c11falt    gate_if "$CODATA" "c11 convolution figure data" python3 scripts/c11/make_faltung.py --check
    job "$G" levels     run_gate "course lint (depth, IDs, parity)" python3 scripts/course/check_levels.py --with-test-chapter --lint-only
}

start_julia_jobs() {
    local G="Julia reference"
    if ! command -v julia >/dev/null 2>&1; then
        job "$G" julia run_gate "Julia reference" false     # julia not on PATH
        return
    fi
    # hydrogen and c00 read the CODATA table
    job "$G" jl-hyd     gate_if "$CODATA" "Julia reference: hydrogen"   julia --project=numerics numerics/test/runtests.jl
    job "$G" jl-hydg    gate_if "$CODATA" "Julia golden reproduced"     julia --project=numerics numerics/generate/hydrogen_golden.jl --check
    job "$G" jl-gpt     run_gate "Julia reference: GPT"        julia --project=numerics/gpt numerics/gpt/test/runtests.jl
    job "$G" jl-gptg    run_gate "Julia GPT golden reproduced" julia --project=numerics/gpt numerics/gpt/generate.jl --check
    job "$G" jl-c00     gate_if "$CODATA" "Julia c00 golden reproduced" julia --project=numerics numerics/generate/c00_golden.jl --check
    job "$G" jl-c03     run_gate "Julia c03 golden reproduced" julia --project=numerics numerics/generate/hilbert_golden.jl --check
    job "$G" jl-c05     run_gate "Julia c05 golden reproduced" julia --project=numerics numerics/generate/particle_golden.jl --check
    job "$G" jl-c01     run_gate "Julia c01 golden reproduced" julia --startup-file=no web/tests/golden/reference/prob.jl --check
}

# ══════════════════════════════════════════════════════════════
#  Run
# ══════════════════════════════════════════════════════════════
T0=$SECONDS
echo -e "${BOLD}Theoretische Physik C — ci.sh ($MODE)${NC}"
[[ -f $PAYLOAD_PROBE ]] || echo "private source payloads not on this machine: public mode, payload gates skipped"
START_HEAD="$(git rev-parse HEAD 2>/dev/null)"
START_CLEAN=0; [[ -z "$(git status --porcelain 2>/dev/null)" ]] && START_CLEAN=1

case "$MODE" in
    parity)
        run_gate "script parity (DE/EN)" python3 scripts/check_parity.py ;;
    maps)
        echo -e "\n${BLUE}${BOLD}── Migration maps, lectures 1-6 ${NC}"
        for n in 01 02 03 04 05 06; do
            run_gate "vl$n migration map complete" python3 "evidence/migrations/check_vl${n}_map.py"
        done
        run_gate "enrichment with the maps" python3 scripts/check_enrichment.py --with-maps ;;
    red)
        echo -e "\n${BLUE}${BOLD}── Red corpus (tests/red/) ${NC}"
        run_gate "red corpus: all gates" python3 scripts/check_red.py --require tokens registry \
            evidence enrichment migration-maps levels web c11-formulas c11-render c02-game red-runner ;;
    fast|full)
        if [[ $MODE == fast && $UNITS_GIVEN -eq 0 ]]; then
            UNITS="$(affected_units)"
            echo "affected (git diff HEAD + untracked): ${UNITS:-nothing to build}"
        elif [[ $UNITS_GIVEN -eq 1 ]]; then
            echo "units: ${UNITS:-none}"
        fi
        script=0; chapters=""
        if [[ $MODE == full && $UNITS_GIVEN -eq 0 ]]; then
            script=1
        else
            for u in ${UNITS//,/ }; do
                if [[ $u == script ]]; then script=1; else chapters+="${chapters:+,}$u"; fi
            done
        fi

        start_static_jobs
        if [[ $script -eq 1 ]]; then
            job "Script build" figures run_gate "script figures compile" compile_figures
            job "Script build" master-de run_gate "German master" build_master TheoretischePhysikC "$PROJ_ROOT/build/ci-$MODE/script"
            job "Script build" master-en run_gate "English master" build_master TheoreticalPhysicsC "$PROJ_ROOT/build/ci-$MODE/script"
        fi
        if [[ $MODE == full && $UNITS_GIVEN -eq 0 ]]; then
            # the whole course into the default directories (build/course, build/web)
            job "Course and web" course course_chain "$PROJ_ROOT/build" 1
        elif [[ -n "$chapters" ]]; then
            job "Course and web" course course_chain "$PROJ_ROOT/build/ci-$MODE" \
                "$([[ $MODE == full ]] && echo 1 || echo 0)" "$chapters"
        fi
        [[ $MODE == full ]] && start_julia_jobs
        report_jobs ;;
esac

n_failed=$(grep -c . "$JOBDIR/failed" 2>/dev/null) || n_failed=0
echo
echo "══════════════════════════════════════════════════════════"
if [[ -s "$JOBDIR/skipped" ]]; then
    echo -e "${YELLOW}skipped${NC} (not run on this machine):"
    sed 's/^/  /' "$JOBDIR/skipped"
fi
if [[ $n_failed -gt 0 ]]; then
    echo -e "${RED}${BOLD}CI FAILED${NC} ($MODE, $((SECONDS - T0)) s) — $n_failed gate(s):"
    sed 's/^/  /' "$JOBDIR/failed"
    if git rev-parse -q --verify refs/tags/ci-green >/dev/null; then
        echo "last green (tag ci-green): $(git log -1 --format='%h %ad %s' --date=short ci-green)"
        echo "commits since:"
        git log --oneline ci-green..HEAD | sed 's/^/  /'
        echo "  (revert one: git revert <sha>; search: git bisect start HEAD ci-green)"
    else
        echo "no last green commit recorded yet (tag ci-green)"
    fi
    exit 1
fi
echo -e "${GREEN}${BOLD}CI PASSED${NC} ($MODE, $((SECONDS - T0)) s)"
if [[ $MODE == full && $UNITS_GIVEN -eq 0 ]]; then
    if [[ $START_CLEAN -eq 1 && -z "$(git status --porcelain)" && "$(git rev-parse HEAD)" == "$START_HEAD" ]]; then
        git tag -f ci-green HEAD >/dev/null && echo "ci-green -> $(git log -1 --format='%h %s' HEAD)"
    else
        echo "working tree not clean (or HEAD moved): ci-green not moved"
    fi
fi
exit 0
