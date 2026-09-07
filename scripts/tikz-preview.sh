#!/usr/bin/env bash
# tikz-preview.sh — Compile one TikZ figure on its own and render it to PNG.
#
# Usage:
#   scripts/tikz-preview.sh latex/figures/fig_vl03_hilbert.tex
#   scripts/tikz-preview.sh --keep-pdf latex/figures/fig_vl03_hilbert.tex
#
# The input file holds only the figure body (a tikzpicture, a pgfplots
# axis, or the center/minipage scaffolding around them) — the same text
# that gets \input into a lecture.  This wraps it in a standalone
# document loading the real tpc-* packages, so a figure that previews
# correctly here also compiles inside the notes.
#
# Output: <figure>.png beside the source, at 300 dpi.

set -euo pipefail

KEEP_PDF=0
if [[ "${1:-}" == "--keep-pdf" ]]; then KEEP_PDF=1; shift; fi

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 [--keep-pdf] <figure.tex>" >&2
  exit 1
fi

INPUT="$(realpath "$1")"
BASENAME="$(basename "$INPUT" .tex)"
DIR="$(dirname "$INPUT")"
PROJ_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LATEX_DIR="$PROJ_ROOT/latex"
TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

# The standalone class plus the project's own packages: one source of
# truth for colours, macros and plot styles, so previews cannot drift
# from how the figure renders in the notes.
cat > "$TMPDIR/preview.tex" <<HEREDOC
\\documentclass[border=6pt,varwidth=17cm]{standalone}
\\usepackage[german,cmfonts]{tpc-style}
\\usepackage{tpc-macros}
\\usepackage{tpc-tikz-templates}
\\begin{document}
\\input{$INPUT}
\\end{document}
HEREDOC

# Make data/ reachable through the relative paths figures use.
ln -sfn "$LATEX_DIR/data" "$TMPDIR/data"

cd "$TMPDIR"
if ! TEXINPUTS=".:$LATEX_DIR:" xelatex -interaction=nonstopmode \
      -halt-on-error preview.tex > compile.log 2>&1; then
  echo "error: $BASENAME failed to compile" >&2
  grep -A4 "^!" compile.log | head -30 >&2
  exit 1
fi

if command -v pdftoppm &>/dev/null; then
  pages=$(pdfinfo preview.pdf | awk '/^Pages:/ {print $2}')
  pdftoppm -png -r 300 -singlefile -f "$pages" -l "$pages" preview.pdf "$DIR/$BASENAME"
  echo "wrote $DIR/$BASENAME.png"
else
  cp preview.pdf "$DIR/$BASENAME.pdf"
  echo "wrote $DIR/$BASENAME.pdf (no pdftoppm available)"
fi

[[ $KEEP_PDF -eq 1 ]] && cp preview.pdf "$DIR/$BASENAME.pdf" && \
  echo "wrote $DIR/$BASENAME.pdf"

exit 0
