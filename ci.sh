#!/usr/bin/env bash
# ci.sh — Local CI for the Theoretische Physik C lecture notes.
#
# Runs the checks that must hold before a change is committed:
#
#   1. structure    both masters \input exactly the lectures that exist
#   2. parity       German and English editions agree structurally
#      (scripts/check_parity.py: sections, display maths, environments,
#       labels, references, figures, key-equation boxes, stray German)
#   3. enrichment   the v0.2 German lectures still contain every equation,
#      label, heading and environment the archived v0.1 had
#   4. figures      every TikZ figure compiles on its own, is included
#      by its lecture, and has all its prose behind \tpcifenglish
#   5. build        both editions compile with zero LaTeX errors
#
# Usage:
#   ./ci.sh              Run everything
#   ./ci.sh --fast       Skip the full PDF builds (checks 1-4 only)
#   ./ci.sh --parity     Parity check only
#   ./ci.sh --install-hook   Install as .git/hooks/pre-commit
#
# Exit status is 0 only when every stage passes.

set -uo pipefail

PROJ_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJ_ROOT"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[0;33m'
BLUE='\033[0;34m'; BOLD='\033[1m'; NC='\033[0m'

FAST=0
PARITY_ONLY=0

while [[ $# -gt 0 ]]; do
    case "$1" in
        --fast)   FAST=1; shift ;;
        --parity) PARITY_ONLY=1; shift ;;
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

STAGES_RUN=0
STAGES_FAILED=0

stage() {
    STAGES_RUN=$((STAGES_RUN + 1))
    echo
    echo -e "${BLUE}${BOLD}── $1 ${NC}"
}

fail_stage() {
    STAGES_FAILED=$((STAGES_FAILED + 1))
    echo -e "${RED}✗ $1${NC}"
}

pass_stage() {
    echo -e "${GREEN}✓ $1${NC}"
}

# ══════════════════════════════════════════════════════════════
#  1. Structure — masters and lecture files agree
# ══════════════════════════════════════════════════════════════
check_structure() {
    stage "Structure"
    local ok=1

    local de_files en_files
    de_files=$(find latex/lectures/de -name 'vl[0-9][0-9].tex' 2>/dev/null | wc -l)
    en_files=$(find latex/lectures/en -name 'lec[0-9][0-9].tex' 2>/dev/null | wc -l)
    echo "  German lectures : $de_files"
    echo "  English lectures: $en_files"

    if [[ "$de_files" -ne "$en_files" ]]; then
        fail_stage "lecture counts differ ($de_files German, $en_files English)"
        ok=0
    fi

    # Every \input in a master must resolve to a file on disk.
    local missing=0
    while read -r path; do
        [[ -z "$path" ]] && continue
        if [[ ! -f "latex/$path.tex" ]]; then
            echo -e "  ${RED}missing${NC}: latex/$path.tex (\\input from a master)"
            missing=$((missing + 1))
        fi
    done < <(grep -ohP '\\input\{\K[^}]+' latex/TheoretischePhysikC.tex \
                                           latex/TheoreticalPhysicsC.tex 2>/dev/null)

    # ...and every lecture on disk must be \input by its master.
    local unref=0
    for f in latex/lectures/de/vl[0-9][0-9].tex; do
        [[ -e "$f" ]] || continue
        local stem="lectures/de/$(basename "$f" .tex)"
        grep -q "\\\\input{$stem}" latex/TheoretischePhysikC.tex || {
            echo -e "  ${YELLOW}orphan${NC}: $f is not \\input by the German master"
            unref=$((unref + 1)); }
    done
    for f in latex/lectures/en/lec[0-9][0-9].tex; do
        [[ -e "$f" ]] || continue
        local stem="lectures/en/$(basename "$f" .tex)"
        grep -q "\\\\input{$stem}" latex/TheoreticalPhysicsC.tex || {
            echo -e "  ${YELLOW}orphan${NC}: $f is not \\input by the English master"
            unref=$((unref + 1)); }
    done

    if [[ $missing -gt 0 ]]; then
        fail_stage "$missing \\input target(s) missing"
        ok=0
    fi
    if [[ $unref -gt 0 ]]; then
        fail_stage "$unref lecture file(s) not referenced by a master"
        ok=0
    fi
    [[ $ok -eq 1 ]] && pass_stage "structure consistent"
}

# ══════════════════════════════════════════════════════════════
#  2. Parity — German vs English
# ══════════════════════════════════════════════════════════════
check_parity() {
    stage "Parity (German leading)"
    if [[ ! -d latex/lectures/en ]] || \
       [[ -z "$(ls -A latex/lectures/en 2>/dev/null)" ]]; then
        echo -e "  ${YELLOW}skipped${NC}: no English edition yet"
        return 0
    fi
    if python3 scripts/check_parity.py; then
        pass_stage "editions in parity"
    else
        fail_stage "editions out of parity"
    fi
}

# ══════════════════════════════════════════════════════════════
#  2b. Enrichment — v0.2 still contains everything v0.1 had
# ══════════════════════════════════════════════════════════════
check_enrichment() {
    stage "Enrichment (v0.2 vs archived v0.1)"
    if [[ ! -d archive/skript-2022 ]]; then
        echo -e "  ${YELLOW}skipped${NC}: no archived v0.1 to compare against"
        return 0
    fi
    if python3 scripts/check_enrichment.py; then
        pass_stage "v0.1 content preserved"
    else
        fail_stage "enrichment dropped content from v0.1"
    fi
}

# ══════════════════════════════════════════════════════════════
#  3. Figures — each compiles standalone
# ══════════════════════════════════════════════════════════════
check_figures() {
    stage "Figures"
    shopt -s nullglob
    local figs=(latex/figures/fig_*.tex)
    if [[ ${#figs[@]} -eq 0 ]]; then
        echo -e "  ${YELLOW}skipped${NC}: no figures yet"
        return 0
    fi
    local bad=0
    for f in "${figs[@]}"; do
        if bash scripts/tikz-preview.sh "$f" > /dev/null 2>&1; then
            printf "  %-46s ${GREEN}ok${NC}\n" "$(basename "$f")"
        else
            printf "  %-46s ${RED}FAIL${NC}\n" "$(basename "$f")"
            bad=$((bad + 1))
        fi
    done
    if [[ $bad -gt 0 ]]; then
        fail_stage "$bad of ${#figs[@]} figure(s) failed to compile"
    else
        pass_stage "all ${#figs[@]} figure(s) compile"
    fi

    # Compiling is not enough: a figure serves both editions, so its prose
    # must be language-switched and it must actually be included somewhere.
    echo
    if python3 scripts/check_figures.py; then
        pass_stage "figures included and language-switched"
    else
        fail_stage "figure inclusion or bilingual problems"
    fi
}

# ══════════════════════════════════════════════════════════════
#  4. Build — both editions, zero errors
# ══════════════════════════════════════════════════════════════
check_build() {
    stage "Build"
    local bad=0
    for pair in "TheoretischePhysikC:German" "TheoreticalPhysicsC:English"; do
        local job="${pair%%:*}" label="${pair##*:}"
        if [[ ! -f "latex/$job.tex" ]]; then
            printf "  %-10s ${YELLOW}skipped${NC} (no master)\n" "$label"
            continue
        fi
        # A master with no lecture files yet is not a failure.
        local n_inputs
        n_inputs=$(grep -c '\\input{lectures/' "latex/$job.tex" || true)
        local n_present=0
        while read -r path; do
            [[ -f "latex/$path.tex" ]] && n_present=$((n_present + 1))
        done < <(grep -ohP '\\input\{\K lectures/[^}]+' "latex/$job.tex" 2>/dev/null \
                 || grep -ohP '\\input\{\Klectures/[^}]+' "latex/$job.tex" 2>/dev/null)
        if [[ $n_present -eq 0 && $n_inputs -gt 0 ]]; then
            printf "  %-10s ${YELLOW}skipped${NC} (no lecture sources yet)\n" "$label"
            continue
        fi

        ( cd latex && xelatex -interaction=nonstopmode "$job.tex" \
            > /dev/null 2>&1 ) || true
        local errors pages
        errors=$(grep -c "^!" "latex/$job.log" 2>/dev/null) || errors=0
        pages=$(grep -oP 'Output written.*\(\K[0-9]+' "latex/$job.log" 2>/dev/null \
                | tail -1) || pages="?"
        if [[ "$errors" -gt 0 ]]; then
            printf "  %-10s ${RED}FAIL${NC}  %s error(s)\n" "$label" "$errors"
            grep "^!" "latex/$job.log" | sort | uniq -c | sort -rn | head -5 \
                | sed 's/^/      /'
            bad=$((bad + 1))
        else
            printf "  %-10s ${GREEN}ok${NC}    %s pages\n" "$label" "$pages"
        fi
    done
    if [[ $bad -gt 0 ]]; then
        fail_stage "$bad edition(s) failed to build"
    else
        pass_stage "both editions build cleanly"
    fi
}

# ══════════════════════════════════════════════════════════════
#  5. Phase 0 contracts — the new course beside the old script
#     (docs/plan/phase0/COORDINATION.md). Each gate is one command.
# ══════════════════════════════════════════════════════════════
run_gate() {
    # run_gate "label" command...
    local label="$1"; shift
    local out
    if out=$("$@" 2>&1); then
        printf "  %-34s ${GREEN}ok${NC}   %s\n" "$label" "$(echo "$out" | tail -1 | cut -c1-90)"
        return 0
    fi
    printf "  %-34s ${RED}FAIL${NC}\n" "$label"
    echo "$out" | tail -15 | sed 's/^/      /'
    return 1
}

check_contracts() {
    stage "Contracts (tokens, registry, evidence, levels, red corpus)"
    local bad=0
    run_gate "tokens up to date + measured" python3 design/build_tokens.py --check || bad=$((bad+1))
    run_gate "no design literals in content"  python3 design/lint_content.py || bad=$((bad+1))
    run_gate "notation/definitions registry"  python3 scripts/registry/check_registry.py || bad=$((bad+1))
    run_gate "special-function conventions"   python3 scripts/registry/check_special_functions.py || bad=$((bad+1))
    # Private mode needs the gitignored source payloads; public mode checks the receipt.
    if [[ -f sources/reed-simon-3/reed-simon-3.djvu ]]; then
        run_gate "claims/provenance (private)" python3 scripts/evidence/check_evidence.py --private || bad=$((bad+1))
    fi
    run_gate "claims/provenance (public)"     python3 scripts/evidence/check_evidence.py --public || bad=$((bad+1))
    for d in evidence/derivations/*/; do
        for chk in "$d"check_*.py; do
            [[ -f "$chk" ]] || continue
            run_gate "golden values $(basename "$d")" python3 "$chk" --verify || bad=$((bad+1))
        done
    done
    # Chapter-specific gates on the real content.
    run_gate "c11 formulas (norms, signs, ODEs)" python3 scripts/c11/check_c11_formulas.py || bad=$((bad+1))
    run_gate "c11 convolution figure data"       python3 scripts/c11/make_faltung.py --check || bad=$((bad+1))
    run_gate "vl01 migration map complete"       python3 evidence/migrations/check_vl01_map.py || bad=$((bad+1))
    run_gate "vl02 migration map complete"       python3 evidence/migrations/check_vl02_map.py || bad=$((bad+1))
    if [[ $FAST -eq 1 ]]; then
        run_gate "course lint (depth, IDs, parity)" python3 scripts/course/check_levels.py --with-test-chapter --lint-only || bad=$((bad+1))
        run_gate "web: build + static gates"       bash web/check.sh --fast || bad=$((bad+1))
        for g in tokens registry evidence; do
            run_gate "red corpus: $g" python3 scripts/check_red.py --gate "$g" || bad=$((bad+1))
        done
    else
        run_gate "course: four editions"       bash scripts/course/build_course.sh --all-editions --with-test-chapter || bad=$((bad+1))
        run_gate "course: K1-K6 on the builds" python3 scripts/course/check_levels.py --with-test-chapter || bad=$((bad+1))
        run_gate "web: build + browser gates"  bash web/check.sh || bad=$((bad+1))
        if command -v julia >/dev/null 2>&1; then
            run_gate "Julia reference: hydrogen"   julia --project=numerics numerics/test/runtests.jl || bad=$((bad+1))
            run_gate "Julia golden reproduced"     julia --project=numerics numerics/generate/hydrogen_golden.jl --check || bad=$((bad+1))
            run_gate "Julia reference: GPT"        julia --project=numerics/gpt numerics/gpt/test/runtests.jl || bad=$((bad+1))
            run_gate "Julia GPT golden reproduced" julia --project=numerics/gpt numerics/gpt/generate.jl --check || bad=$((bad+1))
            run_gate "Julia c00 golden reproduced" julia --project=numerics numerics/generate/c00_golden.jl --check || bad=$((bad+1))
            run_gate "Julia c03 golden reproduced" julia --project=numerics numerics/generate/hilbert_golden.jl --check || bad=$((bad+1))
            run_gate "Julia c01 golden reproduced" julia --startup-file=no web/tests/golden/reference/prob.jl --check || bad=$((bad+1))
        else
            printf "  %-34s ${RED}FAIL${NC}  julia not found\n" "Julia reference"; bad=$((bad+1))
        fi
        run_gate "game: levels played to optimum" web/node_modules/.bin/tsx web/tests/kernels/gpt-play.browser.ts --standalone build/web/standalone || bad=$((bad+1))
        run_gate "hydrogen views mount, repeat"   web/node_modules/.bin/tsx web/video/c11-views-check.ts --standalone build/web/standalone || bad=$((bad+1))
        run_gate "red corpus: all gates"       python3 scripts/check_red.py --require tokens registry evidence levels web c11-formulas c11-render c02-game red-runner || bad=$((bad+1))
    fi
    if [[ $bad -gt 0 ]]; then
        fail_stage "$bad contract gate(s) failed"
    else
        pass_stage "contracts hold"
    fi
}

# ══════════════════════════════════════════════════════════════
#  Run
# ══════════════════════════════════════════════════════════════
echo -e "${BOLD}Theoretische Physik C — local CI${NC}"

if [[ $PARITY_ONLY -eq 1 ]]; then
    check_parity
else
    check_structure
    check_parity
    check_enrichment
    check_figures
    [[ $FAST -eq 0 ]] && check_build
    check_contracts
fi

echo
echo "══════════════════════════════════════════════════════════"
if [[ $STAGES_FAILED -gt 0 ]]; then
    echo -e "${RED}${BOLD}CI FAILED${NC} — $STAGES_FAILED of $STAGES_RUN stage(s) failed"
    exit 1
fi
echo -e "${GREEN}${BOLD}CI PASSED${NC} — $STAGES_RUN stage(s)"
exit 0
