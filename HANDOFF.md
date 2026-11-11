# Handoff: Theoretische Physik C

Repository `/home/tobiasosborne/Projects/theoretical-physics-C`, branch `master`, origin
https://github.com/tobiasosborne/theoretical-physics-C. Workflow rules: `CLAUDE.md`. The
history is in `git log`; the long handoff of the Phase 0 campaign and lectures 1-4 is in the
earlier versions of this file (`git log -p HANDOFF.md`).

## Status (2026-11-11)

- **Script.** Chapters 1-6 are script v0.3, the compact kernel of the course in the course
  design; chapters 7-22 are v0.2. The postulates P1-P5 in chapter 6 and in C4 carry the v0.2
  wording (TJO's decision D-WORTLAUT, 2026-11-06). Operators carry hats in chapters 1-6
  only; the seam is at chapter 6/7. Masters: German 84 pages, English 81, 0 errors.
- **Course.** Chapters c00 (Theorie), c01 (Wahrscheinlichkeit), c02 (GPT, with the game
  "Distinguish"), c03 (Hilbertraum, sections s1-s15 from lectures 2-5), c04
  (Quantentheorie, from lecture 6) and c11 (Wasserstoff), German and English, in four PDF
  editions and the web edition with demos. Lectures 1-6 are done in both languages (last
  content commits 79a8566 and ba2906f).
- **Workflow simplified (2026-11-11).** `CLAUDE.md` is the one rule file. Ledger rows are
  required only for numbers, constants and externally sourced statements; one author, one
  review, one repair per lecture; `./ci.sh --fast` before each commit, `./ci.sh` as a
  periodic sweep that moves the local tag `ci-green`; the red corpus is frozen behind
  `./ci.sh --red`, the lecture 1-6 migration maps behind `./ci.sh --maps`. Edited script
  lectures and content no longer trip hash checks: the evidence gate reads the hashed
  version of an edited tracked file from Git history. Without the private payloads, the
  gates that need them are skipped and listed.

## Open for TJO

- **Private receipt.** It was refreshed on 2026-11-11. Whenever a ledger, a source record
  or `check_evidence.py` changes, run `python3 scripts/evidence/check_evidence.py --private`
  on a machine with the payloads and commit `evidence/receipts/private-check.json`; until
  then the public check passes with a warning that the receipt is stale.
- Gaps in `evidence/gaps.json` (36 open rows), among them G-0073 (photon-number remark),
  G-0074 ("Observablen" vs "scharfe Observablen"), G-0075 (hat-exception wording), G-0077
  (chapter-4 cuts), G-0011 (no-restriction hypothesis in P3).
- `registry/COLLISIONS.md` and `docs/plan/PLAN.md` section 14 (decisions taken on TJO's
  behalf in Phase 0).
- The hat-seam sentence in `vl04.tex` still says "ab Vorlesung 5"; it should say 7.
- From the lecture 5-6 round (`docs/plan/script-v0.3/NOTES-ch5.md`, `NOTES-ch6.md`,
  `NOTES-en-ch5-6.md`): the spectral theorem stated without proof in script chapter 5; the
  sharpened closed-systems sentence in chapter 6; the two glosses next to the verbatim
  English P1 and P2 boxes; "Schroedinger" or "Schrödinger" in P5.
- Demo `c03.demo.spektren`: whether r = 0 stays selectable, the parameter ranges, the small
  plane in the 620 px column.
- Overfull displays in v0.2 chapters vl08 (table), vl12, vl14, vl15, vl20.
- Not enforced by any gate, a reviewer's job: whether a quote entails its claim, whether a
  derivation derives what it is cited for, numbers written as fractions, number words or in
  figure files.

## Environment

- The private source payloads (`sources/<key>/*` except `source.json` and `rights.json`,
  `docs/plan/research/curriculum/plavala-src/`) are gitignored and copied by hand between
  machines; `sha256sum -c sources/MANIFEST.sha256` checks a copy (the 14 entries under
  `tpc-script-v0.2/git/` are read from Git and are absent on disk by design).
- Commercial print fonts (MathTime Pro 2, Lucida in TEXMFLOCAL; Times LT Std, Whitney in
  `~/.local/share/fonts`, linked into `~/texmf/fonts/opentype/` because Debian's
  `OSFONTDIR` is only `/usr/share/fonts`) are local only; `./build.sh --local-fonts` uses
  them. Everything published uses open fonts.
- Toolchain: TeX Live 2023, node through nvm, Julia 1.13.3 through juliaup, Playwright's
  Chromium, `python3-sympy`, `python3-mpmath`, `python3-scipy`. `codex exec` (gpt-6.1-sol,
  `-c model_reasoning_effort="xhigh"`) has been the independent reviewer.
- Site: `.github/workflows/pages.yml` runs `scripts/publish_pages.sh --no-push` on every
  push to master and deploys https://tobiasosborne.github.io/theoretical-physics-C/. The
  script's own push to the orphan branch `gh-pages` is a fallback only.
- `scripts/check_lecture.sh` still builds a single lecture in the old style; the gates do
  not use it.
- `archive/third-party/` (Hammerer's script) is not ours to redistribute; it stays ignored.
