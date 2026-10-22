#!/usr/bin/env bash
# publish_pages.sh — publish the student-facing site to GitHub Pages.
#
# Builds everything with OPEN fonts only (the commercial fonts never leave this
# machine) and assembles build/pages/, the tree GitHub Pages serves at
#   https://tobiasosborne.github.io/theoretical-physics-C/
# Normally .github/workflows/pages.yml runs this script with --no-push on a GitHub
# runner after every push to master and deploys build/pages/ itself. Without
# --no-push the script instead pushes the tree as the orphan branch gh-pages (a
# fallback for when the workflow cannot run; Pages must then be switched back to
# that branch in the repository settings).
#
# Layout of the published tree (all links relative, so it works at any base URL):
#   index.html                    landing page for students (scripts/pages/index.html)
#   VERSION                       master commit and date the site was built from
#   pdf/TheoretischePhysikC.pdf   the complete script, German  (build.sh: course design,
#   pdf/TheoreticalPhysicsC.pdf   the complete script, English  open fonts, the default)
#   pdf/tpc-{de,en}-{full,kern}.pdf   the new course, four editions (build_course.sh)
#   web/                          the chapter web edition (web/run.sh build)
#
# Usage:
#   scripts/publish_pages.sh              build everything, assemble, push
#   scripts/publish_pages.sh --skip-build reuse build/pub-course, build/pub-web and
#                                         build/pub-script from a previous run
#   scripts/publish_pages.sh --no-push    build and assemble only (inspect build/pages/)
#
# Exit status 0 only if every build succeeded, no PDF embeds a commercial font, and
# (unless --no-push) origin/gh-pages equals the commit that was pushed.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
SKIP_BUILD=0; PUSH=1
for a in "$@"; do
    case "$a" in
        --skip-build) SKIP_BUILD=1 ;;
        --no-push) PUSH=0 ;;
        --help|-h) sed -n '2,/^set -euo/p' "$0" | sed '$d' | sed 's/^# \?//'; exit 0 ;;
        *) echo "publish_pages.sh: unknown option $a" >&2; exit 2 ;;
    esac
done

COURSE="$ROOT/build/pub-course"
WEB="$ROOT/build/pub-web"
SCRIPT="$ROOT/build/pub-script"
PAGES="$ROOT/build/pages"
info() { echo "[pages] $*"; }

# ── 1. builds (open fonts only) ───────────────────────────────────────────────
if [[ $SKIP_BUILD -eq 0 ]]; then
    info "course: four editions -> $COURSE"
    bash scripts/course/build_course.sh --all-editions --fonts open --math stix --out "$COURSE"
    info "web: site -> $WEB"
    bash web/run.sh build --course-build "$COURSE" --out "$WEB"
    # the static gates default to every chapter including the contract test c99, which the
    # site build leaves out; name the real chapters
    chapters="$(ls -d content/c[0-9][0-9]-*/ | sed 's#content/\(c[0-9][0-9]\)-.*#\1#' | grep -v '^c99$' | paste -sd,)"
    bash web/run.sh static --site "$WEB/site" --standalone "$WEB/standalone" --chapters "$chapters"
    info "script: both editions in the course design, open fonts -> $SCRIPT"
    # build.sh copies its PDFs to the repo root; keep whatever is there (it may be
    # the local print with commercial fonts) and take ours from latex/.
    mkdir -p "$SCRIPT" build/root-pdf-backup
    for j in TheoretischePhysikC TheoreticalPhysicsC; do
        [[ -f "$j.pdf" ]] && cp -p "$j.pdf" "build/root-pdf-backup/$j.pdf"
    done
    ./build.sh            # the default build: open fonts only (never --local-fonts here)
    for j in TheoretischePhysikC TheoreticalPhysicsC; do
        cp -p "latex/$j.pdf" "$SCRIPT/$j.pdf"
        [[ -f "build/root-pdf-backup/$j.pdf" ]] && cp -p "build/root-pdf-backup/$j.pdf" "$j.pdf"
    done
fi
for f in "$COURSE"/tpc-de-full.pdf "$COURSE"/tpc-de-kern.pdf "$COURSE"/tpc-en-full.pdf \
         "$COURSE"/tpc-en-kern.pdf "$SCRIPT"/TheoretischePhysikC.pdf "$SCRIPT"/TheoreticalPhysicsC.pdf \
         "$WEB"/site/index.html; do
    [[ -f "$f" ]] || { echo "publish_pages.sh: missing $f" >&2; exit 1; }
done

# ── 2. assemble ───────────────────────────────────────────────────────────────
rm -rf "$PAGES"; mkdir -p "$PAGES/pdf"
cp scripts/pages/index.html "$PAGES/index.html"
touch "$PAGES/.nojekyll"
cp "$COURSE"/tpc-de-full.pdf "$COURSE"/tpc-de-kern.pdf "$COURSE"/tpc-en-full.pdf "$COURSE"/tpc-en-kern.pdf "$PAGES/pdf/"
cp "$SCRIPT"/TheoretischePhysikC.pdf "$SCRIPT"/TheoreticalPhysicsC.pdf "$PAGES/pdf/"
cp -r "$WEB/site" "$PAGES/web"
# the contract test chapter is not for students
rm -rf "$PAGES"/web/de/c99 "$PAGES"/web/en/c99
rm -f "$PAGES"/web/standalone/c99.*
printf '%s %s\n' "$(git rev-parse --short HEAD)" "$(date +%Y-%m-%d)" > "$PAGES/VERSION"

# ── 3. font gate: no commercial font may leave this machine ───────────────────
bad=0
for f in "$PAGES"/pdf/*.pdf; do
    if pdffonts "$f" 2>/dev/null | awk 'NR>2{print $1}' | grep -Eiq 'MT2|MTPro|Whitney|TimesLTStd|Times LT|Minion|Baskerville'; then
        echo "publish_pages.sh: $f embeds a commercial font" >&2; bad=1
    fi
done
[[ $bad -eq 0 ]] || exit 1
info "assembled $PAGES ($(du -sh "$PAGES" | cut -f1)); fonts: open only"
[[ $PUSH -eq 1 ]] || exit 0

# ── 4. orphan commit on gh-pages, force-pushed (history of the branch is one commit) ──
WT="$ROOT/build/pages-wt"
git worktree remove --force "$WT" 2>/dev/null || true
git branch -D gh-pages 2>/dev/null || true
git worktree add --detach "$WT" HEAD >/dev/null
(
    cd "$WT"
    git checkout -q --orphan gh-pages
    git rm -rfq . >/dev/null 2>&1 || true
    find . -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
    cp -r "$PAGES"/. .
    # One pack of the whole site (about 120 MB) is answered with HTTP 408 by GitHub from
    # this machine, and HTTP/2 drops mid-transfer. So the branch is pushed as a short
    # series of commits, each a few tens of megabytes, over HTTP/1.1, with retries. The
    # first push is forced (the branch is rebuilt from scratch every time).
    push() {  # push <force|ff>
        local n
        for n in 1 2 3; do
            if [[ $1 == force ]]; then
                git -c http.version=HTTP/1.1 -c http.postBuffer=524288000 push --force origin gh-pages && return 0
            else
                git -c http.version=HTTP/1.1 -c http.postBuffer=524288000 push origin gh-pages && return 0
            fi
            echo "[pages] push attempt $n failed; retrying" >&2
        done
        return 1
    }
    commit() {  # commit <message> <paths...>
        local msg="$1"; shift
        git add -A -- "$@"
        git -c user.name="$(git -C "$ROOT" config user.name)" -c user.email="$(git -C "$ROOT" config user.email)" \
            commit -qm "$msg" || true
    }
    v="$(cat VERSION)"
    commit "Publish $v: landing page and PDFs" index.html VERSION .nojekyll pdf
    push force
    commit "Publish $v: web assets" web/assets
    push ff
    commit "Publish $v: chapter pages" web/index.html web/de web/en
    push ff
    commit "Publish $v: standalone demos (de)" web/standalone/*.de.html
    push ff
    commit "Publish $v: standalone demos (en)" web/standalone/*.en.html
    push ff
    commit "Publish $v: rest" .
    push ff
)
local_sha="$(git -C "$WT" rev-parse HEAD)"
git worktree remove --force "$WT"
git fetch -q origin gh-pages
remote_sha="$(git rev-parse origin/gh-pages)"
[[ "$local_sha" == "$remote_sha" ]] || { echo "publish_pages.sh: push did not land ($local_sha vs $remote_sha)" >&2; exit 1; }
info "published $local_sha -> https://tobiasosborne.github.io/theoretical-physics-C/"
