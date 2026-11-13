#!/usr/bin/env bash
# Assemble the students' site in build/pages/:
#
#   index.html                    the landing page (scripts/pages/index.html)
#   pdf/TheoretischePhysikC.pdf   the script, German   } open fonts only
#   pdf/TheoreticalPhysicsC.pdf   the script, English  }
#   web/                          one page per lecture (web/tools/lecture/)
#   VERSION                       commit and date
#
# .github/workflows/pages.yml runs this on every push to master and deploys
# the tree to GitHub Pages. Run it by hand to look at the result:
#
#   scripts/publish_pages.sh && xdg-open build/pages/index.html
#
# The two PDF builds and the site build run side by side; with warm caches
# (build/figures, build/site) the whole thing takes well under a minute.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
PAGES="$ROOT/build/pages"
info() { echo "[pages] $*"; }

[[ -x web/node_modules/.bin/tsx ]] || { echo "publish_pages.sh: run (cd web && npm ci) first" >&2; exit 2; }

# Figures once (PDF and web image, both languages), then PDFs and site together.
python3 scripts/build_figures.py --svg
./build.sh & pdf=$!                      # never --local-fonts here
web/node_modules/.bin/tsx web/tools/lecture/build.ts --no-figures & site=$!
fail=0
wait $pdf || fail=1
wait $site || fail=1
[[ $fail -eq 0 ]] || { echo "publish_pages.sh: a build failed" >&2; exit 1; }

rm -rf "$PAGES"; mkdir -p "$PAGES/pdf"
cp scripts/pages/index.html "$PAGES/index.html"
touch "$PAGES/.nojekyll"
cp latex/TheoretischePhysikC.pdf latex/TheoreticalPhysicsC.pdf "$PAGES/pdf/"
cp -r build/site "$PAGES/web"
find "$PAGES/web" -name '*.sha256' -delete
rm -f "$PAGES/web/site.json"
printf '%s %s\n' "$(git rev-parse --short HEAD)" "$(date +%Y-%m-%d)" > "$PAGES/VERSION"

# Font gate: no commercial font may leave this machine.
command -v pdffonts >/dev/null || { echo "publish_pages.sh: pdffonts (poppler-utils) is needed for the font gate" >&2; exit 1; }
for f in "$PAGES"/pdf/*.pdf; do
    if pdffonts "$f" | awk 'NR>2{print $1}' | grep -Eiq 'MT2|MTPro|Whitney|TimesLTStd|Times LT|Minion|Baskerville|Lucida'; then
        echo "publish_pages.sh: $f embeds a commercial font" >&2; exit 1
    fi
done
info "assembled build/pages ($(du -sh "$PAGES" | cut -f1)); fonts: open only"
