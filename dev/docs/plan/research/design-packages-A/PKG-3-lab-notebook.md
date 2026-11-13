<!-- ROLE: design package PKG-3 for the Theo C upgrade (design-packages-A lane, print-first stance).
     Authored 2026-10-09. Follows docs/plan/research/PACKAGE-TEMPLATE.md. Colour values from tokens.py
     (tokens-tables.md, tokens-pkg-3.json); specimens in specimens/pkg3.*.
     UPDATE POLICY: append dated corrections; regenerate colour tables, never hand-edit them. -->

# PKG-3 "The lab notebook"

## 1. Name and philosophy

One family, one set of glyphs, in every medium: STIX Two Text and STIX Two Math (OFL, Tiro Typeworks
for the STI Pub publishers, https://github.com/stipub/stixfonts) for text, mathematics, labels, HUD
and video; Iosevka only for code. A wide outer margin carries sidenotes and short Vertiefung blocks,
so the depth axis is a place on the page: the running text column is the Kern route, the margin is
the way down. Colour is a lab notebook's: black ink, one blue, and Paul Tol's verified high-contrast
roles. It optimises for exact identity between print, web, game and video, for an accessible PDF,
and for a Typst future. It refuses a second typeface for display, sans-serif labels, tints for
depth and any colour that has not been measured. Lineage: Tufte's books and Tufte-LaTeX/Tufte CSS
(https://ctan.org/pkg/tufte-latex, https://edwardtufte.github.io/tufte-css/), gwern.net's semantic
zoom with sidenotes (https://gwern.net/design), Distill's `l-gutter` (https://distill.pub/guide/),
Paul Tol's schemes (https://pypi.org/project/tol-colors/), and the plain look of a research notebook.

## 2. Math-font decision

Option (a) of design-research/REPORT.md 2.3: **STIX Two everywhere.** The same OpenType MATH font
runs in XeLaTeX/LuaLaTeX (`unicode-math`), Typst, MathJax 4 (`mathjax-stix2`,
https://docs.mathjax.org/en/v4.0/output/fonts.html), native MathML via `@font-face`, three.js label
overlays, and video equations (TeX- or Typst-rendered SVG). Print-screen match is exact up to
rasterisation; compare `specimens/pkg3-1.png` and `specimens/pkg3-html.png`. Costs against PKG-1:
STIX is darker and has a larger x-height than Times LT + MTPro2 (`specimens/detail-eq.png`, strips 1
and 3), it has no bold math and no script optical sizes (Vieth, TUGboat 44:2,
https://tug.org/TUGboat/tb44-2/tb137vieth-otmath.pdf). Gains: the PDF's mathematics is Unicode
(`pdftotext` of the specimen returns "𝜌 ≥ 0 mit tr 𝜌 = 1"), so search, copy-paste and tagged PDF
(Typst 0.14, https://typst.app/blog/2025/typst-0.14) work. The installed STIX is 2.12; pin 2.14
(https://github.com/stipub/stixfonts/releases/tag/v2.14) in the build. Libertinus (installed in the
TeX tree, coherent Serif/Sans/Mono/Math) was considered and rejected for this package because MathJax 4
has no Libertinus font, which breaks "the same glyphs in every renderer".

## 3. Typography

**Print** (A4; `specimens/pkg3.tex`, XeLaTeX, 1 page, 0 overfull boxes).

| Role | Face | Size / leading |
|---|---|---|
| Body | STIX Two Text Regular | 10.5/14 pt |
| Math | STIX Two Math | with body |
| Sidenotes, margin Vertiefung | STIX Two Text | 8.5/11 pt, ragged right |
| Caption | STIX Two Text; label "Abb. 6.1" small caps; lead sentence italic | 9.5/12 pt |
| Figure labels | STIX Two Text Italic (prose), STIX Two Math (symbols) | 8-9 pt |
| Chapter title | STIX Two Text Italic | 20/24 pt |
| Chapter number (margin) | STIX Two Text, accent | 26 pt |
| Kicker, run-in heads | STIX Two Text small caps (real `smcp`), letter-spaced 5 units; SemiBold small caps for "postulat P4" | 10.5 pt |
| Section | STIX Two Text Italic | 13/16 pt |
| Mono (code only) | Iosevka (OFL, installed) | 8.5 pt |

STIX Two Text's default figures are tabular (all ten digits advance 495 units), so readouts and
tables align without a feature switch. Measure: text block 110 mm, 66-71 characters per full line.
Page: inner 20 mm, text 110 mm, gutter 7 mm, margin 55 mm, outer 18 mm; top 20 mm, bottom 22 mm
(specimen 16/14 mm). The 10.5 pt body is deliberate: STIX's x-height makes 10.5 pt read like Times
at 11 pt, and the narrow column keeps the margin at 55 mm.

Margin system: numbered sidenotes aligned with their call; Vertiefung blocks up to about 14 margin
lines without display mathematics are set in the margin on a light-grey plate (`marginnote`), with
the label "Vertiefung 6.V2", the dependency line in italic and the return line "Zurück zum Kern.";
longer blocks, or blocks with display math, fall back to the layered-docs inline device (1.5 pt rule
in the outer margin, run-in label). This is a **deliberate deviation** from layered-docs/REPORT.md
recommendation 3 for short blocks. Its benefit is measurable: a core-only build (layered-docs 5.7)
that drops margin blocks leaves every page break of the running text unchanged, so page numbers, not
only equation numbers, agree between the full and the core-only PDF.

**Web** (`specimens/pkg3.html`, `pkg3-html-dark.png`, `pkg3-html-phone.png`).

```css
--f-text: 'STIX Two Text', serif;    --f-math: 'STIX Two Math', math;   /* WOFF2, OFL */
--f-label: var(--f-text);            --f-mono: 'Iosevka', ui-monospace, monospace;
--fs-body: 1.0625rem; --lh: 1.55; --fs-small: .9375rem; --fs-note: .8125rem; --fs-h1: 2.125rem;
--body-w: 36rem; --gutter: 2.5rem; --margin-w: 17rem;   /* about 66 characters at 17 px */
```

**Games and video:** STIX Two Text SemiBold for HUD values and titles, Regular for labels, STIX Two
Math for equations. One family in every medium is the point of the package.

## 4. Colour

Paul Tol's high-contrast scheme for the data roles (hex values from `tol-colors`; measured in
design-research/palette-measurements.md as the only tested set that survives greyscale, CVD and
colour at once); blue doubles as accent and link (a notebook has one coloured ink). The environment is
drawn in ink with dots or hatching, so it costs no colour at all. Generated by `tokens.py`.

| role | print-light | screen-light | screen-dark | video (night mode; see 8) |
|---|---|---|---|---|
| ink | `#000000` | `#111111` | oklch(0.93 0 0) `#E8E8E8` | `#EEEEEE` |
| paper | `#FFFFFF` | `#FFFFFF` | oklch(0.19 0 0) `#141414` | `#0B0B0B` |
| rule | `#BEBEBE` | `#CECECE` | `#3D3D3D` | `#383838` |
| accent = link | Tol blue `#004488` | `#004488` | oklch(0.78 0.09 250) `#8BBCEF` | `#8CC3FC` |
| **state** | `#004488` (L 0.39) | `#004488` | `#8BBCEF` | `#8CC3FC` |
| **effect / measurement** | Tol red `#BB5566` (L 0.58) | `#BB5566` | oklch(0.70 0.13 12) `#E37A89` | `#EE7D8D` |
| **energy / dynamics** | Tol yellow `#DDAA33` (L 0.77) | `#DDAA33` | oklch(0.84 0.14 84) `#F5C252` | `#FFC84C` |
| environment / bath | ink, dotted or hatched | ink | ink | ink |
| highlight | oklch(0.955 0.045 90) `#FCF0CF` | `#FCF0CF` | `#332A13` | `#2E250E` |
| margin plate | oklch(0.965 0 0) `#F3F3F3` | `#F3F3F3` | `#1F1F1F` | `#161616` |

Ladder n = 1..4: print `#002244`, `#1A5998`, `#478CC4`, `#84C0E4`; dark `#BAE5FF`, `#80B7E7`,
`#4F8AC6`, `#285E9F` (min dL 0.16). Role assignment as PKG-1. Because accent and state share the
blue, headings never use the accent except the chapter number and the Vertiefung label; in figures
blue always means state.

Checks: body 21.0:1 print, 18.9:1 screen; link 9.6:1 print and screen, 9.2:1 dark; data roles min dL
0.18 (effect/energy), min dE_OK deuteranopia 0.213, protanopia 0.162 (the best of the three
packages). Energy yellow has 2.1:1 on white: fills and thick strokes only. Greyscale:
`specimens/greyscale-figures.png` (bottom strip).

## 5. Layout grid

```
 A4, 210 mm
 |20|<--------- text 110 --------->|7|<----- margin 55 ----->|18|
 |  | Die Bornsche Regel (it. 20)  | | 6 (26 pt, blue)        |  |
 |  | ZOOMSTUFE 1 (sc)             | |                        |  |
 |  | body STIX 10.5/14, 68 chars  | | 1 sidenote 8.5/11      |  |
 |  | +--------------------------+ | |                        |  |
 |  | | POSTULAT P4 ...    (6.1) | | |                        |  |  0.5 pt ink frame
 |  | +--------------------------+ | |                        |  |
 |  | [ figure 110 mm, or 172 mm spanning the margin ]       |  |
 |  | Messgeräte sind also ...     | |[Vertiefung 6.V2      ] |  |  grey plate, margin
 |  |                              | |[Voraussetzung: ...   ] |  |
 |  |                              | |[... Zurück zum Kern. ] |  |
```

Web: `[body 36rem][gutter 2.5rem][margin 17rem]`; sidenotes and margin Vertiefung blocks float into
the margin (Tufte CSS technique) as `<details open>` on wide screens and collapse to closed
`<details>` in the text flow below 62rem (`pkg3-html-phone.png`). A three.js demo or game spans body
plus margin (55.5rem) at 16:10 with its readouts in the margin column beside it, like a notebook's
side calculation. Displayed equations wider than the phone column scroll horizontally
(`overflow-x:auto`, visible in the phone render); authoring rule: break display lines at about 30 em.

## 6. Figure style

Axes 0.45 pt, boundaries 0.7 pt, data 1.0 pt, levels 1.3 pt, energy arrows 1.8 pt, helper lines
0.35 pt dashed, leaders 0.3 pt. Markers 1.9 pt filled for data, open for references. Forbidden
regions: ink hatching at 55 % (`envC!55`), as a band. Labels in STIX italic for prose, STIX Two Math
for symbols, both at 8-9 pt, placed directly at the curve; never a legend box. Colour only for the
three roles plus the ladder; everything else ink. Captions: small-caps label, italic lead sentence
with the message, self-contained. Figures for print and web are generated from the same source
(TikZ to PDF and to SVG via `dvisvgm`, or Typst/CeTZ later) so labels are the same glyphs.

```latex
% PKG-3 figure preamble sketch (colours from tokens-pkg-3.json; Paul Tol high-contrast)
\definecolor{stateC}{HTML}{004488} \definecolor{effectC}{HTML}{BB5566} \definecolor{energyC}{HTML}{DDAA33}
\definecolor{lad1}{HTML}{002244} \definecolor{lad2}{HTML}{1A5998}
\definecolor{lad3}{HTML}{478CC4} \definecolor{lad4}{HTML}{84C0E4}
\tikzset{
  state/.style={draw=stateC, line width=1.0pt},   effect/.style={draw=effectC, line width=1.0pt},
  energy/.style={draw=energyC, line width=1.8pt}, boundary/.style={draw=black, line width=0.7pt},
  environment/.style={draw=black, line width=0.6pt, densely dotted},
  axisstyle/.style={draw=black, line width=0.45pt, -{Stealth[length=4pt, width=3pt]}},
  forbidden/.style={pattern=north east lines, pattern color=black!55},
  lbl/.style={font=\small}, lbltext/.style={font=\itshape\footnotesize},
}
\pgfplotscreateplotcyclelist{tpclevels}{{lad1,line width=1.0pt},{lad2,line width=1.0pt},
  {lad3,line width=1.0pt},{lad4,line width=1.0pt},{lad1,line width=1.0pt,dashed}}
\pgfplotsset{tpcplot/.append style={axis line style={black, line width=0.45pt},
  every axis title/.style={font=\itshape\small}, legend style={draw=none}}}
```

## 7. Interactive components

Everything in STIX Two Text: buttons 15 px SemiBold small caps, ink on white with a 1 px ink border
and square corners (a notebook stamp, like the postulate box); primary button ink-filled. Slider:
`accent-color` = controlled role. Readouts: STIX tabular digits (default), 1 px rule frame. Toggles:
checkbox plus label, no switches. Depth: `<details>` with summary "Vertiefung 6.V2" in SemiBold blue.
Focus: 2 px blue outline offset 2 px. Dark mode: neutral greys (no tinted darks), token column
screen-dark. three.js: white background (dark `#141414`), one directional key light plus ambient,
matte materials, 1 px ink axes with tick labels as HTML overlays in STIX Two Math on opaque white
plates; no fog, no bloom. Game HUD: a single ruled strip at the top (like a notebook header line)
with the score as a probability in STIX SemiBold tabular, the level as "Versuch 3", nothing animated
that carries no information.

```css
:root{ --c-ink:#111111; --c-paper:#FFFFFF; --c-rule:#CECECE; --c-accent:#004488; --c-link:#004488;
  --c-state:#004488; --c-effect:#BB5566; --c-energy:#DDAA33; --c-plate:#F3F3F3;
  --f-text:'STIX Two Text',serif; --f-math:'STIX Two Math',math; }
@media (prefers-color-scheme:dark){ :root:not([data-theme=light]){ --c-ink:#E8E8E8; --c-paper:#141414;
  --c-rule:#3D3D3D; --c-accent:#8BBCEF; --c-link:#8BBCEF; --c-state:#8BBCEF; --c-effect:#E37A89;
  --c-energy:#F5C252; --c-plate:#1F1F1F; } }
math{font-family:var(--f-math)}
.btn{font:600 .9375rem/1 var(--f-text);font-variant:all-small-caps;letter-spacing:.05em;
  color:var(--c-ink);background:var(--c-paper);border:1px solid var(--c-ink);border-radius:0;padding:.45em .9em}
.btn.primary{background:var(--c-ink);color:var(--c-paper)}
.readout{font-family:var(--f-text);border:1px solid var(--c-rule);padding:.1em .5em;min-width:7.5em}
.control input[type=range]{accent-color:var(--c-state)}
:is(.btn,input,summary):focus-visible{outline:2px solid var(--c-link);outline-offset:2px}
.marginblock{float:right;clear:right;width:var(--margin-w);
  margin-right:calc(-1*(var(--margin-w) + var(--gutter)));background:var(--c-plate);padding:.6rem .7rem;
  font-size:var(--fs-note);line-height:1.4}
.marginblock>summary{font-weight:600;color:var(--c-accent)}
@media (max-width:62rem){.marginblock{float:none;width:auto;margin:.6rem 0 .6rem 1.5rem}}
```

## 8. Video style

16:9, 3840 x 2160, 30 fps, and, unlike PKG-1 and PKG-2, **on white**: videos use the print-light
tokens, so any frame is a print figure without re-rendering, and the video looks like the notebook
page coming alive (the night-mode column is for demos and games). Camera: orthographic wherever the
physics is 2D; 3D with a fixed 35-degree vertical field of view, constant-speed moves between named
viewpoints, axes always drawn. Title card: chapter number in blue STIX 200 px, title in STIX Italic
96 px, nothing else. Lower thirds: STIX small caps 40 px on a white plate with a 1 px ink rule.
Equations: the book's own source rendered by XeLaTeX or Typst to SVG and revealed term by term (manim
grammar, https://github.com/3b1b/manim; or Motion Canvas, https://motioncanvas.io/docs, sharing the
web's TypeScript). Materials: state `#004488`, effect `#BB5566`, energy `#DDAA33`, all matte; the 2p
density as a volume render on white with the ladder blues as a sequential map (dark = dense). Risk:
saturated video on white is less cinematic than dark grounds; the trade is exact reuse.

## 9. Bilingual rules

As PKG-1 (csquotes, siunitx `locale=DE`/`UK`, ngerman hyphenation with `\emergencystretch`, upright
d, e, i and operator names, run-in labels switched by the build, `lang` attribute on web pages).
Additionally, because STIX is used in games and video, readouts there format numbers by locale
(`Intl.NumberFormat('de-DE')` gives "0,741"), and the in-game language switch changes labels only,
never symbols.

## 10. Coherence proof: the Born rule

- **Print.** Postulat P4 in a 0.5 pt ink frame, "postulat P4" in SemiBold small caps, p(E|rho) =
  tr(rho E) in STIX Two Math; figure 6.1a with the state in Tol blue and the detector axis in Tol red;
  Vertiefung 6.V2 (states as functionals) in the margin beside the next paragraph (pkg3-1.png).
- **Web page.** Identical glyphs in MathML; the same margin block as an open `<details>` on wide
  screens and a closed one on phones; slider with a blue thumb, readout "p = 0,741" in STIX tabular
  digits (pkg3-html.png, pkg3-html-dark.png, pkg3-html-phone.png).
- **Demo.** White three.js Bloch sphere, blue state arrow, red detector axis, the probability as a
  red segment on the axis, overlay "p = tr(rho E) = 0,741" in STIX on a white plate.
- **Game HUD.** Ruled header strip: "Versuch 3 · Klickrate 0,74 · Ziel ≥ 0,90" in STIX SemiBold.
- **Video frame.** White ground, same sphere and colours, the equation set by the book's TeX source,
  lower third "Bornsche Regel" in STIX small caps; the frame can be placed in the PDF unchanged.

## 11. Costs and risks

- Licences: none. STIX Two and Iosevka are OFL; Tol's colour values are published for free use
  (https://pypi.org/project/tol-colors/); no web, app or video fees. 0 EUR.
- Build complexity: lowest. One font stack for XeLaTeX, Typst, MathJax 4, MathML, three.js and video;
  the Typst pilot (design-research recommendation 10) can start immediately.
- Repo changes: `tpc-style.sty` switches from `mtpro2`+`mathspec` to `unicode-math` with STIX
  (`fontspec` must load STIX by file name: `STIX Two Text` is not visible to fontconfig on this
  machine, measured when the first compile failed with "The font STIX Two Text cannot be found");
  geometry to the 20/110/7/55/18 grid; `marginnote` for margin Vertiefung blocks; colours; figures.
- Risks: (1) TJO prefers Times + MathTime; STIX is close but not the same (darker, larger x-height,
  different Greek). (2) A 55 mm margin costs pages (about 10-15 % more than a 2.5 cm-margin layout
  [estimate]). (3) Margin blocks collide when two fall on one page; `marginnote` does not avoid
  collisions (`marginfix` or KOMA `scrlayer-notecolumn` would, both installed per
  layered-docs/REPORT.md 3.2). (4) Single-family discipline is unforgiving: without a sans, labels
  rely on italics and small caps, which are weaker at 8 pt than Whitney.

## 12. Verdict

PKG-3 is right if identity across media, an accessible PDF, zero licence cost and a Typst path matter
more than MathTime's exact look. It is the package that most directly delivers the brief's
"consistent and coherent across all these constructs", at the price of TJO's stated font preference.
