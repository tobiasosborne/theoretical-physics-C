# Handoff: Theoretische Physik C

## What this repository is now

The lecture notes of the course TJO is giving, in German (leading) and
English, as a PDF and as one web page per lecture with interactive figures.
The larger "ultimate course" project is parked in `dev/` (see
`dev/README.md`; its own log up to 2026-10-29 is `dev/HANDOFF.md`).

Priority: material for the running lecture. Changes should reach the students
in minutes.

## Status (2026-11-13: the restructure)

- **Layout.** `latex/` (lectures, masters, figures, style), `web/` (lecture
  page builder, demos, kernels), `scripts/`, `build.sh`, `check.sh`. Everything
  else that belonged to the course project is under `dev/`. The state before
  the move is tagged `course-parked-2026-11-13`.
- **PDF build.** `./build.sh` builds both editions side by side. The 22+1 TikZ
  figures used to cost 137 s per LaTeX pass; `scripts/build_figures.py` now
  compiles each once per language into `build/figures/` (keyed by a hash of the
  figure and the style files) and the masters include the PDFs
  (`\tpcfigcache`, set by `build.sh`; a compile by hand still draws the TikZ).
  Warm build: about 10 s. German 84 pages, English 82.
- **Web pages.** `web/tools/lecture/` turns `latex/lectures/{de,en}` into one
  page per lecture and language (`build/site/<lang>/vlNN/`), an index, and
  redirects from the old chapter URLs. It counts equation, section and example
  numbers itself; they were compared against the PDF on 2026-11-13 and agree.
  It stops with file:line on any construct it does not know. Warm build: 3 s.
- **Web-only material** is written in the lecture files: `\webdemo{id}{caption}`
  (optionally `[fig_...]` to take the place of a static figure) and the
  `webonly` environment; both are no-ops in print (`tpc-style.sty`).
- **Demos.** The 27 demos of the chapter course are placed: lecture 1 (15),
  2 (5), 3 (1), 4 (1), 6 (3), 7 (3, reused from lectures 1 and 2), 16 (3).
  Captions and the `webonly` lead-ins were written by agents from the demo
  sources and the chapter texts; TJO has not read them yet. All 62 demo mounts
  (both languages) were checked in a headless browser.
- **Checks.** `./check.sh`: parity, figures, PDFs, site (about 15 s warm);
  `--tests` adds the kernel unit tests. The enrichment and migration-map gates
  went to `dev/` with the evidence they read.
- **Publishing.** `.github/workflows/pages.yml` runs
  `scripts/publish_pages.sh` on a push to master that touches `latex/`, `web/`
  or `scripts/`, with caches for TeX Live, the figures and the demo bundles.

## Open

- Lectures 5, 8 to 15 and 17 to 22 have only their static figure. Candidates
  for new animations, lecture by lecture, are in the 2026-11-13 session report;
  lectures 8 and 9 come first (the course is at lecture 7/8).
- Lectures 1 to 6 still say in a dozen places that a proof or an example
  "steht im Webkurs" / "is in the web course" (vl01:7, vl02:59, vl03:106,
  vl04:51, vl05:53, 57, 80, vl06:8, 26, 32, 108). The chapter pages they meant
  are no longer published. Either fold that material into `webonly` blocks or
  reword.
- `web/assets/stills/` holds the demo posters as copies from the last chapter
  build (21 MB; three of them are 2 to 4 MB). They are not regenerated.
- The hat seam (operators with hats in lectures 1 to 6, without from 7 on) and
  the gaps for TJO listed in `dev/HANDOFF.md` are unchanged.
