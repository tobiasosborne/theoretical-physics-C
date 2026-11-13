# NOTES: design lane (script v0.3)

## What changed

- `latex/tpc-course.sty`: new option `layout=course|script` (default `course`, so the four
  course editions are unchanged by it). Section "SCRIPT LAYOUT" holds everything for
  `layout=script`:
  - The v0.2 sectioning maps one level down: `\section{Vorlesung: X}` is set like a course
    chapter (label line "Vorlesung N", title in the h1 role, counter `chapter`, the
    "Vorlesung: " / "Lecture: " prefix is dropped), `\section*` and `\subsection` take the
    course `\section` style, `\subsubsection` the course `\subsection`. Equations, figures and
    theorem-like units number within the lecture (N.k), as in the course. Lectures run on
    without a page break; the heading is kept with its first lines and the running-head mark
    cannot be stranded on the page before.
  - `\parbox` wider than the line is set at line width (the 14 cm Postulat boxes of vl06,
    vl17, vl18, vl20, vl22).
  - `\input{figures/fig_...}` is set at the figure's natural width: centred on the text
    measure when it fits, otherwise flush with the text and running into the (empty) margin
    column, never wider than `\tpcfigurewidth`.
  - Old figure colours: `birrenorange`, `birrengreen`, `birrengray` take token colours
    (`tpc-dynamics`, `tpc-effect`, `tpc-grey-4`); the plot colormaps are rebuilt from tokens.
    `cgblue`, `spacecadet`, `munsell`, `banana`, `isabelline` were already re-pointed by the
    course layer. `birrenred` has no token and keeps its value.
  - `\emergencystretch=2em` (v0.2 paragraphs were broken for 160 mm).
  - Title page: `\tpcscriptversion`, `\tpcscriptnotice`, `\tpcscripttitle`.
- `tpc-course.sty`, also affecting the course (fixes, no layout change intended):
  `\RequirePackage` restored after mathspec (math=mtpro2 failed in tpc-levels with
  "amsmath must be loaded earlier than mathspec"); box titles get `\nobreak` (a box title
  could stand alone at a page foot); with an OpenType maths face the QED box is STIX's white
  square instead of msam10.
- Masters `latex/TheoretischePhysikC.tex`, `latex/TheoreticalPhysicsC.tex`: `amsart[reqno]`,
  load `tpc-course[layout=script, pkg=1, ground=light, math=stix, fonts=open]` (fonts and
  maths are flags `\tpcfonts`, `\tpcmath` that build.sh may predefine), set
  `\input@path` to `../registry/generated/` so `tpc-notation.sty` loads even when compiled by
  hand from latex/; title page with "Fassung v0.3 · date" / "Version v0.3 · date" and the
  notice (DE: "Dieses Skript ist der kompakte Kern der Vorlesung. Der vollständige Kurs ist
  der Webkurs: URL"; EN: "This script is the compact core of the lecture course. The full
  course is the web course: URL"); `\clearpage` after the contents.
- `build.sh`: default = new design with open fonts; `--local-fonts` = fonts=local,
  math=mtpro2 (TJO's print only); `--cmfonts` accepted and ignored (old callers). Fails on any
  undefined reference or citation.
- `scripts/publish_pages.sh`: builds the script with `./build.sh` (default, open fonts). Font
  gate unchanged; checked: it refuses the `--local-fonts` PDF and passes the open ones.
- `ci.sh`: not changed (its build stage compiles the masters directly; they are
  self-contained).

## Build results (2026-10-22)

- `./build.sh`: DE 89 pages, EN 85 pages, 0 errors, 0 undefined references. Fonts embedded:
  STIX Two Text/Math, Inter, Iosevka only.
- `./build.sh --local-fonts`: DE 89, EN 88 pages, 0 errors (Times LT Std, Whitney, MTPro2).
- Course gate `build_course.sh --all-editions --with-test-chapter --out build/design-lane`:
  four editions, 0 errors, 0 undefined references. `check_levels.py` reported only B0
  "stale build" (tpc-course.sty was edited while it ran); it must be rerun.
- `./ci.sh`: not run by this lane (coordinator's final gate).

## Page counts (from the .toc; start page + span to the next lecture)

Before: HEAD (v0.2), `build.sh --cmfonts` (as published). After: new design, open fonts.
The title page and contents now take 2 pages (lecture 1 starts on page 3).

| Lecture | DE before | DE after | EN before | EN after |
|---|---|---|---|---|
| 1 | 2+6 | 3+5 | 2+6 | 3+5 |
| 2 | 8+3 | 8+2 | 8+3 | 8+2 |
| 3 | 11+5 | 10+5 | 11+5 | 10+5 |
| 4 | 16+3 | 15+4 | 16+3 | 15+3 |
| 5 | 19+6 | 19+5 | 19+5 | 18+5 |
| 6 | 25+6 | 24+6 | 24+6 | 23+6 |
| 7 | 31+4 | 30+5 | 30+4 | 29+5 |
| 8 | 35+7 | 35+8 | 34+7 | 34+7 |
| 9 | 42+2 | 43+2 | 41+1 | 41+2 |
| 10 | 44+3 | 45+3 | 42+4 | 43+3 |
| 11 | 47+3 | 48+4 | 46+3 | 46+4 |
| 12 | 50+6 | 52+5 | 49+5 | 50+5 |
| 13 | 56+3 | 57+4 | 54+3 | 55+3 |
| 14 | 59+3 | 61+3 | 57+3 | 58+3 |
| 15 | 62+3 | 64+3 | 60+3 | 61+3 |
| 16 | 65+2 | 67+2 | 63+2 | 64+2 |
| 17 | 67+4 | 69+4 | 65+4 | 66+4 |
| 18 | 71+5 | 73+6 | 69+4 | 70+5 |
| 19 | 76+2 | 79+3 | 73+3 | 75+3 |
| 20 | 78+2 | 82+2 | 76+2 | 78+2 |
| 21 | 80+2 | 84+2 | 78+1 | 80+1 |
| 22 | 82+4 | 86+4 | 79+5 | 81+5 |
| total | 85 | 89 | 83 | 85 |

Chapters 1+2 (DE): before pages 2 to 10 (9 pages); after pages 3 to 10 (8 pages; lecture 2
ends on page 10, where lecture 3 starts). Budget of 9 met. (Before = old v0.2 text; after =
the ch1/ch2 lanes' new text, so the difference is text and design together.)

## Looked at (pdftoppm -r 60)

Title page DE and EN, contents, lecture 1 start, page 8 (Beispiel, displays), page 26
(Postulat boxes clamped, greybox), pages 50/51 (fig_vl11_kasten with greybox and key
equation box), pages 68/69 (vl16: inline pgfplots figure, key equation, termschema figure).

## Open issues

- Display equations wider than 114 mm stick out into the margin column: vl12 l.85 (7 pt),
  vl14 l.62/l.69 (22, 25 pt), vl15 l.24 (55 pt), vl20 l.54 (9 pt); table vl08 l.225-236
  (46 pt DE, 59 pt EN). Fixing needs source edits in vl08-vl20 (outside this round).
- EN lec01: overfull lines at l.23-25 (19 pt, "Liénard-Wiechert ... Franck-Hertz") and
  l.111-113 (16 pt, long inline Var formula). For the ch1 lane.
- fig_vl09_unschaerfe: nodes with `\\[-1pt]` but no `align=` print "-1pt" into nullfont
  (15 "Missing character" warnings, pre-existing in v0.2). Needs `align=...` on those nodes
  (figure owner).
- No STIX Two glyph gaps found (no missing-character warnings besides the one above; „“ are
  present).
- tpc-notation.sty loads in the script without clashes with tpc-macros or the lectures
  (both builds clean).
- Lectures do not start on a new page (to keep the page count down). One-line change in
  `\tpcscript@lecture` if TJO wants each lecture on a fresh page (about +10 pages).

## Requests to other lanes / coordinator

- Rerun `check_levels.py --with-test-chapter --build build/design-lane` after a fresh
  `build_course.sh` (only B0 stale-build findings; caused by my edits during the run).
- `scripts/check_lecture.sh` (not mine) still compiles one lecture in the old style; to see the
  new design it should load `\usepackage[lang=de|en,layout=script]{tpc-course}` with
  `amsart[reqno]`, `\setcounter{chapter}{N-1}` instead of `section`, and TEXINPUTS including
  `registry/generated` and `design/build/pkg1-light`.
- Evidence lane: none.
