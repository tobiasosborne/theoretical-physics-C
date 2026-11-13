# Theoretische Physik C: working rules

This file is the single source of workflow rules. Older rule documents
(`docs/plan/phase0/COORDINATION.md`, `docs/plan/*/BRIEF.md`) are history where they disagree
with it. `docs/authoring/CONTRACT.md` still defines the content language of the course.

## The project

Lecture notes for Theoretische Physik C by Tobias Osborne (TJO). German leads; English
follows in strict parity. Two trees:

- **Script** (`latex/`): masters `TheoretischePhysikC.tex` (DE) and `TheoreticalPhysicsC.tex`
  (EN), 22 lectures `latex/lectures/de/vlNN.tex` and `latex/lectures/en/lecNN.tex`, figures
  `latex/figures/fig_vlNN_*.tex`. Chapters 1-6 are script v0.3, the compact kernel of the
  course; chapters 7-22 are still v0.2 (operators without hats, seam at chapter 6/7).
- **Course** (`content/cNN-slug/{de,en}.tex`, `chapter.json`, `figures/`): chapters c00-c04
  and c11 so far; `c99-contract-test` is the test fixture. Built in four PDF editions (full and
  Kern, DE and EN) and a web edition with interactive demos (`web/`).

## Rules for content

- **German first**, then English in parity: `scripts/check_parity.py` (script),
  `check_levels.py` K6/M1 (course). Display maths is identical in both languages.
- **Course syntax** is the closed language of `docs/authoring/CONTRACT.md`. IDs are names,
  never renumbered. Notation and definitions live in `registry/` (regenerate the TeX and web
  exports with `python3 scripts/registry/gen_registry.py`); content never restates a
  definition.
- **Ground truth.** No physics from memory. A formula from a book is read from the rendered
  page image (`ddjvu`, `pdftoppm`), not from the `.txt` layer. A statement whose source is
  not on disk stays out and becomes a row in `evidence/gaps.json` for TJO.
- **Evidence where it earns its keep.** A ledger row is required for every number, every
  physical constant, and every formula or statement taken from an external source: `\num[id]`
  or `\claim` in content, the row in `evidence/claims.json`, provenance with a verified quote
  in `evidence/provenance.json`, `\srcref` where it helps the reader. What the text derives
  or TJO stipulates needs no claim, theorem-like units included. Derivation check scripts
  (`evidence/derivations/cNN/check_*.py`) stay and run in the gates; add one when a new
  derivation can be checked by a script. Existing rows and tags stay: every ledger row stays
  tagged once per language.
- **No estimates.** Every number is derived, computed by a script in the repo, or quoted
  from a source locus. Nobody estimates durations or effort.
- **Hats on operators** (`\op{A}`), not on the identity `\mathbb{I}`, states (density
  operators), Pauli matrices or ket-bras.
- **Figures**: one file serves both languages, prose through `\tpcifenglish{EN}{DE}`;
  geometry comes from the formula; colours by token name only.
- **Voice**: TJO's. Plain, direct, operationalist. No emoji, no em dashes in prose.
- **Never commit** the gitignored source payloads (`sources/*/*` except `source.json` and
  `rights.json`), `docs/plan/research/curriculum/plavala-src/`, `archive/third-party/`, or
  any commercial font. Published PDFs use open fonts only; the font gate in
  `scripts/publish_pages.sh` refuses a PDF that embeds MTPro2, Whitney, Times LT Std, Minion
  or Baskerville.

## Per-lecture procedure

1. **Author.** One author writes the whole lecture, German first: the course chapter(s) and
   the script chapter, registry rows for new notation and definitions, ledger rows where the
   evidence rule asks for them, a derivation check script where one applies. When script
   lecture N (7 or later) is rewritten, add `N: "<date>"` to `REWRITTEN_LECTURES` in
   `scripts/check_enrichment.py`. No migration maps, migration records or sync tables.
2. **Fast gates**: `./ci.sh --fast` until green.
3. **One review** per chapter, physics and voice together, by an independent reviewer (so
   far `codex exec` with gpt-6.1-sol at xhigh), written to
   `docs/review/lectures/REVIEW-<chapter>.md`.
4. **One repair wave.** No second review and no student's-eye ("muse") pass unless TJO asks.
5. **English**: `en.tex` and `lecNN.tex`, then `./ci.sh --fast` again.
6. **Commit and push.** Small commits, one logical change each. Add a short dated entry to
   the status section of `HANDOFF.md`.

Page and word budgets for script chapters are guides; if a chapter exceeds one, say why in
the commit message. No lanes, notes files or exception files.

## Gates

| Command | When | What |
|---|---|---|
| `./ci.sh --fast` | before every commit | static gates on the whole repo (structure, parity, enrichment, figure inclusion, tokens, content lint, registry, special functions, evidence, golden values, c11 formulas, levels lint) plus builds of the units touched in the working tree (`git diff HEAD` and untracked files) |
| `./ci.sh --fast --chapters c03,script` | same, units named | course chapters by ID; `script` = both masters and the script figures |
| `./ci.sh` | now and then: after a lecture or a batch of commits | full tier: every gate, every chapter, the web check with browser gates, the game and hydrogen-view checks, the Julia reference tests |
| `./ci.sh --red` | after changing a gate script (after a full run) | the red corpus `tests/red/`, frozen: not extended as routine work |
| `./ci.sh --maps` | rarely | the migration maps of lectures 1-6 (frozen bookkeeping, not in the tiers) |

Independent gates run in parallel. On a machine without the private source payloads the
evidence and registry gates run in public mode and the gates that read a payload are
skipped and listed at the end. After changing a ledger or `check_evidence.py`, run
`python3 scripts/evidence/check_evidence.py --private` where the payloads are, and commit
the refreshed receipt; until then public mode warns that it is stale.

Builds of the tiers go to `build/ci-fast/` and `build/ci-full/`, or `build/course` and
`build/web` for a whole-course full run. Your own builds go to your own directory:
`bash scripts/course/build_course.sh --chapters c03 --all-editions --out build/<name>`,
`python3 scripts/course/check_levels.py --chapters c03 --build build/<name>`,
`bash web/check.sh --chapters c03 --course-build build/<name> --out build/<name>-web`.

## Shipping, regressions, rollback

A push to master publishes to the students: `.github/workflows/pages.yml` runs
`scripts/publish_pages.sh --no-push` and deploys
https://tobiasosborne.github.io/theoretical-physics-C/. That is accepted, bugs included. The
answer to a bad push is a quick revert or a forward fix, not more gates before the push.

- A full run that passes on a clean tree moves the local tag `ci-green` to HEAD (never
  pushed). A failing run prints the last green commit and the commits since; find the
  culprit with `git bisect start HEAD ci-green` and the failing gate as the test.
- `git revert <sha>` and a push redeploy the site as it was: the Pages job builds everything
  from a clean checkout of the pushed commit and replaces the whole site.
- A Pages build that fails (a LaTeX error, a missing PDF, a commercial font) deploys
  nothing; the previous site stays live.

## Environment

- `export NVM_DIR=$HOME/.nvm; . $NVM_DIR/nvm.sh; export PATH=$HOME/.juliaup/bin:$PATH`
  (node, Julia 1.13.3: the golden files record the Julia version and are compared byte for
  byte).
- TeX Live 2023 with XeLaTeX, Playwright's Chromium for the browser gates, `python3-sympy`,
  `python3-mpmath`, `python3-scipy`.
- Commercial print faces (`./build.sh --local-fonts`) are local only.
