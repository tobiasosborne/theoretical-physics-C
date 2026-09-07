#!/usr/bin/env bash
# check_lecture.sh — Compile one lecture on its own.
#
# Usage:
#   scripts/check_lecture.sh 12          # German  latex/lectures/de/vl12.tex
#   scripts/check_lecture.sh 12 en       # English latex/lectures/en/lec12.tex
#   scripts/check_lecture.sh 12 de --pdf # keep the PDF next to the source
#
# Everything happens in a temporary directory, so many lectures can be
# checked at once without fighting over .aux files — which is what makes
# this safe to call from parallel agents.  Exit status is 0 only when the
# lecture compiles with no LaTeX errors.

set -uo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <lecture-number> [de|en] [--pdf]" >&2
  exit 2
fi

N=$(printf "%02d" "$((10#$1))")
LANG_CODE="${2:-de}"
KEEP_PDF=0
[[ "${3:-}" == "--pdf" || "${2:-}" == "--pdf" ]] && KEEP_PDF=1
[[ "${2:-}" == "--pdf" ]] && LANG_CODE="de"

PROJ_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LATEX_DIR="$PROJ_ROOT/latex"

case "$LANG_CODE" in
  de) SRC="$LATEX_DIR/lectures/de/vl$N.tex";  OPT="german"  ;;
  en) SRC="$LATEX_DIR/lectures/en/lec$N.tex"; OPT="english" ;;
  *)  echo "error: language must be de or en" >&2; exit 2 ;;
esac

if [[ ! -f "$SRC" ]]; then
  echo "error: $SRC not found" >&2
  exit 2
fi

TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

# amsart is what the masters use, so a lecture that compiles here compiles
# there.  \setcounter fixes the section number to the lecture number, which
# keeps equation numbers looking like they do in the full document.
cat > "$TMPDIR/one.tex" <<HEREDOC
\\documentclass[12pt,oneside]{amsart}
\\usepackage[$OPT]{tpc-style}
\\usepackage{tpc-macros}
\\usepackage{tpc-tikz-templates}
\\begin{document}
\\setcounter{section}{$((10#$N - 1))}
\\input{$SRC}
\\end{document}
HEREDOC

ln -sfn "$LATEX_DIR/data"    "$TMPDIR/data"    2>/dev/null || true
ln -sfn "$LATEX_DIR/figures" "$TMPDIR/figures" 2>/dev/null || true

cd "$TMPDIR"
TEXINPUTS=".:$LATEX_DIR:" xelatex -interaction=nonstopmode one.tex > /dev/null 2>&1
# Second pass so cross-references inside the lecture resolve.
TEXINPUTS=".:$LATEX_DIR:" xelatex -interaction=nonstopmode one.tex > /dev/null 2>&1

errors=$(grep -c "^!" one.log 2>/dev/null) || errors=0
pages=$(grep -oP 'Output written.*\(\K[0-9]+' one.log 2>/dev/null | tail -1) || pages="?"
undef=$(grep -c "Reference .* undefined" one.log 2>/dev/null) || undef=0
multi=$(grep -c "multiply defined" one.log 2>/dev/null) || multi=0

if [[ $KEEP_PDF -eq 1 && -f one.pdf ]]; then
  cp one.pdf "$(dirname "$SRC")/$(basename "$SRC" .tex).pdf"
fi

if [[ "$errors" -gt 0 ]]; then
  echo "FAIL  $(basename "$SRC"): $errors LaTeX error(s)"
  # An undefined \ref to another lecture is expected when compiling alone;
  # real errors are the ones that start with "!".
  grep -A5 "^!" one.log | head -40
  exit 1
fi

msg="ok    $(basename "$SRC"): $pages page(s)"
[[ "$multi" -gt 0 ]] && msg="$msg, ${multi} multiply-defined label(s)"
[[ "$undef" -gt 0 ]] && msg="$msg, ${undef} undefined ref(s) (cross-lecture refs are expected here)"
echo "$msg"
exit 0
