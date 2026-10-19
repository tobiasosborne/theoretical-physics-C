#!/usr/bin/env bash
# build_specimens.sh -- build the flag specimen for all five packages x two grounds.
#
#   bash design/specimen/build_specimens.sh
#
# Output (not tracked): build/design-specimens/pkgN-<ground>.{pdf,png,html}
# Always fonts=open math=stix, so it runs wherever the open faces are installed.
# Exits nonzero if any of the ten builds has a LaTeX error, is not one page, has
# an overfull box or a missing glyph, or if the token build is stale.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="$ROOT/build/design-specimens"
WORK="$OUT/work"
mkdir -p "$WORK"
rm -f "$OUT"/pkg*-*.pdf "$OUT"/pkg*-*.png "$OUT"/pkg*-*.html
cd "$ROOT"

python3 design/build_tokens.py --check >/dev/null || {
  echo "specimens: tokens fail --check; run python3 design/build_tokens.py --all"; exit 1; }

export TEXINPUTS="$ROOT/latex:$ROOT/design/build:$ROOT/design/specimen:"
fail=0
for pkg in 1 2 3 4 5; do
  for ground in light dark; do
    job="pkg${pkg}-${ground}"
    ( cd "$WORK" && for pass in 1 2; do
        timeout 180 xelatex -interaction=nonstopmode -halt-on-error -jobname="$job" \
          "\def\tpcspecpkg{${pkg}}\def\tpcspecground{${ground}}\input{specimen.tex}" \
          >"$job.stdout" 2>&1 || break
      done )
    log="$WORK/$job.log"
    errs=$(grep -c '^!' "$log" 2>/dev/null || true)
    over=$(grep -c '^Overfull' "$log" 2>/dev/null || true)
    miss=$(grep -c 'Missing character' "$log" 2>/dev/null || true)
    pages=$(pdfinfo "$WORK/$job.pdf" 2>/dev/null | awk '/^Pages/{print $2}')
    status=ok
    if [[ ! -f "$WORK/$job.pdf" || "${errs:-1}" != 0 || "${pages:-0}" != 1 \
          || "${over:-1}" != 0 || "${miss:-1}" != 0 ]]; then
      status=FAIL; fail=$((fail + 1))
    else
      cp "$WORK/$job.pdf" "$OUT/$job.pdf"
      pdftoppm -r 110 -png -singlefile "$OUT/$job.pdf" "$OUT/$job"
    fi
    python3 design/specimen/make_html.py "$pkg" "$ground" "$OUT/$job.html" || {
      status=FAIL; fail=$((fail + 1)); }
    printf '%-12s %-4s errors=%s overfull=%s missing-glyphs=%s pages=%s\n' \
      "$job" "$status" "${errs:-?}" "${over:-?}" "${miss:-?}" "${pages:-?}"
  done
done
n=$(ls "$OUT"/pkg*-*.pdf 2>/dev/null | wc -l)
echo "specimens: $n PDF(s) in build/design-specimens, $fail failure(s)"
[[ $fail -eq 0 && $n -eq 10 ]]
