<!-- ROLE: design package PKG-2 for the Theo C upgrade (design-packages-A lane, print-first stance).
     Authored 2026-10-09. Follows docs/plan/research/PACKAGE-TEMPLATE.md. Colour values from tokens.py
     (tokens-tables.md, tokens-pkg-2.json); specimens in specimens/pkg2.*.
     UPDATE POLICY: append dated corrections; regenerate colour tables, never hand-edit them. -->

# PKG-2 "Baskerville Companion"

## 1. Name and philosophy

A warm, book-like package: Baskerville 10 Pro (František Štorm, installed) for text, TJO's own
Baskerville Companion Math (`../mathfonts`, v0.140, private prototype) for mathematics, Whitney for
labels and interface, and a two-colour "rubricated" palette (black text, red labels, as in
red-and-black book printing, https://en.wikipedia.org/wiki/Rubrication). It optimises for the reading
experience of a long book: oldstyle figures in prose, small-caps labels, centred chapter openings,
generous leading. It refuses boxes, tints and sans-serif display headings. Lineage: Stripe Press
(redrawn figures, per-book identity, https://press.stripe.com/), Hochuli's micro-typography as one
spacing system (https://hyphenpress.co.uk/), Bringhurst's classical page, and TJO's own
"Quantum Algorithms 2022" deck, which already pairs Whitney with Baskerville 10 Pro on near-black
`#141C26` with gold `#F2DC9B` (`presentations/STYLE_GUIDE.md` section 4). It is also the only
package in which the mathematics is designed for the text face rather than borrowed.

## 2. Math-font decision

None of the three options of design-research/REPORT.md 2.3 exactly: a fourth, **the author's own
OpenType MATH font in print, Typst and (licence permitting) native MathML.** Companion Math is an
OpenType MATH font, so XeLaTeX, LuaLaTeX and Typst all use it (`../mathfonts/proofs/*-typst.pdf`), and
MathML Core can use it through `@font-face` (rendered in `specimens/pkg2-html.png`). MathJax 4 cannot
(it ships only its own eleven fonts, https://docs.mathjax.org/en/v4.0/output/fonts.html), so the web
must use native MathML (Chromium since 109, https://mathml.igalia.com/news/2023/01/10/mathml-in-chromium-project-is-completed/)
with Temml (https://temml.org/) or Typst 0.15 producing it. Print-screen match is therefore exact
where the fonts may be shipped, and falls back to STIX Two Math (the design-research specimen F
shows how badly a foreign math face sits next to a bookface) where they may not.

**Honest assessment of Companion Math v0.140** (from `../mathfonts/HANDOFF.md`,
`research/verifier/report-v0.140.md`, and the specimens here):

| Done | Still lacking |
|---|---|
| Baskerville-derived math Latin and Greek; Greek redesigned in four styles (232 code points, 464 script alternates) | Verifier v0.140: 27 pass, 15 edge, 12 fail, 1 severe; 3 hard-rule failures (radical stroke contrast 1.087, integral with 5 curve tangent breaks where at most 2 are allowed, arrow shaft 1.417 x the operator rule) |
| Integrals redesigned, four finite sizes, script optical compensation | Arbitrary-height integral assembly not implemented; contour and surface integrals still STIX donor shapes |
| Builds reproducibly with provenance, 65 tests, mutation testing | Math axis 0.535 x-height, below every professional font in the corpus (0.545 to 0.617): in the specimen, = and the fraction bars read low and small beside the Baskerville text (`specimens/detail-eq.png`, middle strip) |
| Works in XeLaTeX and Typst | Inline math is too dark against the prose (0.722 versus corpus maximum 0.704); parentheses too light (thickest stroke 0.736 n-stem, corpus minimum 0.783) |
| | Italic capitals Z and N come out as swashes in math (design-research specimen E, partition function Z); the text italic of Baskerville 10 Pro also has a swash Z (this lane's specimen: italic "Zustände" in the Vertiefung title), so German italic labels beginning with Z need roman or small caps |
| | Selection by author review only, no blind or foundry review; most of the repertoire is STIX Two Math donor material |
| | Contains outlines extracted from Storm's Baskerville 10 Pro: `../mathfonts/README.md` states that the local workflow "does not imply permission to redistribute" them. Web or game use needs written permission from Storm Type Foundry |

Verdict on the font: excellent text-math harmony in Latin and Greek, not yet a font a 300-page physics
book can rely on. PKG-2 therefore names a **commercial variant PKG-2M**: Minion Pro (installed) with
Minion Math (Johannes Küster, OpenType MATH, 4 weights x 5 optical sizes,
https://luc.devroye.org/fonts-46519.html). Minion Math is not installed and was not tested here; its
price was reported as about 700 EUR per licence in 2012
(https://email.esm.psu.edu/pipermail/macosx-tex/2012-April/048745.html; current price [UNVERIFIED]).

## 3. Typography

**Print** (A4; `specimens/pkg2.tex`, XeLaTeX, 1 page, 0 overfull boxes).

| Role | Face | Size / leading |
|---|---|---|
| Body | Baskerville 10 Pro, oldstyle figures (`Numbers=OldStyle`) | 11/14 pt |
| Math | Baskerville Companion Math v0.140 (lining figures) | with body |
| Small (dependency lines) | Baskerville 10 Pro Italic | 9.5/12.5 pt |
| Sidenotes (marginal glosses) | Baskerville 10 Pro, rubric numeral | 9/12 pt |
| Caption | Baskerville 10/12.5; label "Abb. 6.1" small caps; lead sentence italic | 10/12.5 pt |
| Chapter kicker | small caps, letter-spaced 6 units, rubric: "vorlesung 6" | 11 pt |
| Chapter title | Baskerville 10 Pro roman, centred | 20/24 pt |
| Section | small caps, letter-spaced | 11 pt |
| Figure labels (prose) | Whitney Book | 8 pt |
| Mono | Iosevka (OFL, installed) | 9 pt |

Measure: text block 124 mm, 66-71 characters per full line (pdftotext of the specimen; Baskerville
sets wider than Times, so the block is 10 mm wider than PKG-1 for the same count). Page: inner 24 mm,
text 124 mm, gutter 6 mm, margin column 40 mm, outer 16 mm; top 20 mm, bottom 22 mm with folio. The
identical content needed top/bottom margins of 12/9 mm and a leading of 14.0 pt (instead of 14.4) to
stay on one page, against 15/12 mm for PKG-1 and 16/14 mm for PKG-3: at equal nominal size PKG-2
costs roughly 5-8 % more height than PKG-1 [estimate from one page]. Leading should not go below
14 pt; Baskerville's long ascenders need it. Sidenotes: unnumbered in the gloss tradition would be
classical, but numbered rubric oldstyle numerals are used so web and print share anchors.

**Web** (`specimens/pkg2.html`).

```css
--f-text: 'Baskerville 10 Pro', 'Libre Baskerville', Baskerville, serif;  /* Storm webfont licence */
--f-math: 'Baskerville Companion Math', 'STIX Two Math', math;            /* only if Storm permits */
--f-label: 'Whitney', 'Source Sans 3', sans-serif;
--fs-body: 1.1875rem; --lh: 1.6; --fs-small: 1rem; --fs-note: .875rem; --fs-h1: 2.375rem;
--body-w: 39rem; --gutter: 2.25rem; --margin-w: 14rem;  font-variant-numeric: oldstyle-nums;
```

Baskerville needs 19 px on screen (its x-height is small); Libre Baskerville (OFL, Google Fonts) is a
screen-drawn fallback with a much larger x-height and would change the page's colour.

**Games and video:** Whitney Semibold for HUD and controls (Baskerville is not a HUD face); titles in
Baskerville 10 Pro small caps; equations TeX-rendered with Companion Math.

## 4. Colour

Rubricated: ink black, rubric red for labels and the effect role, Prussian blue for states, ochre for
energy. Generated by `tokens.py`; full JSON in `tokens-pkg-2.json`. Video ground and highlight are
taken from TJO's 2022 deck.

| role | print-light | screen-light | screen-dark | video |
|---|---|---|---|---|
| ink | `#000000` | oklch(0.24 0.014 60) `#241E19` | oklch(0.92 0.012 85) `#E8E4DC` | `#EFEBE2` |
| paper | `#FFFFFF` | oklch(0.975 0.012 88) `#FAF6EE` | oklch(0.21 0.010 60) `#1C1714` | `#141C26` (deck accent1) |
| rule | `#B7B7B7` | `#CFCAC1` | `#453E39` | `#3D3732` |
| accent (rubric) | oklch(0.50 0.15 30) `#A8372A` | `#A8372A` | oklch(0.74 0.13 35) `#F18B71` | `#FC8E72` |
| link | oklch(0.42 0.09 255) `#284E7D` | `#284E7D` | oklch(0.80 0.08 250) `#97C2F0` | `#9DC9F7` |
| **state** | oklch(0.38 0.10 262) `#234077` | `#234077` | oklch(0.78 0.09 258) `#94B9F1` | `#96C0FE` |
| **effect / measurement** | oklch(0.56 0.15 30) `#BC4A3C` | `#BC4A3C` | oklch(0.70 0.15 30) `#ED7665` | `#F87966` |
| **energy / dynamics** | oklch(0.76 0.13 80) `#DCA744` | `#D7A03D` | oklch(0.86 0.13 85) `#F8CA65` | `#FFD16B` |
| environment / bath | oklch(0.62 0.015 70) `#8C857D` + dashes or hatching | `#8C857D` | `#7F7973` | `#79736D` |
| highlight | oklch(0.95 0.04 88) `#FAEED1` | `#F6E8C8` | `#372C19` | `#F2DC9B` (deck accent3; foreground emphasis) |

Ladder n = 1..4: print `#172A5A`, `#355695`, `#5C88C1`, `#8CBDE8`; dark/video `#C2E2FF`, `#8AB4EA`,
`#5E86C8`, `#3F5B9B` (min dL 0.16). Physics roles as in PKG-1 (state, effect, energy, environment,
ladder). Note the deliberate double use of rubric red: labels and the effect role share a hue at
different lightness (0.50 versus 0.56); in figures, labels are ink, so the two never meet.

Checks: body on paper 21.0:1 print, 15.3:1 screen-light (cream paper); link 8.5:1 print, 7.9:1
screen-light; rubric labels 6.5:1 / 6.0:1 (AA for text); data roles min dL 0.18 (state/effect),
min dE_OK deuteranopia 0.203, protanopia 0.175. Energy has 2.2:1 on white: fills and thick strokes
only, as in PKG-1. Greyscale: `specimens/greyscale-figures.png` (middle strip).

## 5. Layout grid

```
 A4, 210 mm
 |24|<------------- text 124 ------------->|6|<- margin 40 ->|16|
 |  |            VORLESUNG 6 (rubric sc)    | |               |  |
 |  |         Die Bornsche Regel (20 pt)    | |               |  |
 |  |   Zoomstufe 1 - ... (italic)          | |               |  |
 |  | body Baskerville 11/14, oldstyle 1890 | | 1 gloss 9 pt  |  |
 |  |---------------------------------------| |               |  |  hairline 0.4 pt rubric
 |  | POSTULAT P4 Bornsche Regel. ... (6.1) | |               |  |
 |  |---------------------------------------| |               |  |
 |  | VERTIEFUNG 6.V2 Titel. Voraussetzung..|▌|               |  |  ▌ 1 pt rubric rule
 |  | ... ZURÜCK ZUM KERN. ...              |▌|               |  |
```

Web: the same three-column grid as PKG-1 (`[body 39rem][gutter 2.25rem][margin 14rem]`), cream
paper, centred chapter head. A three.js demo or game sits full width of body plus margin on a paper
plate with a 1 px rule; captions in the body column. Depth (layered-docs 5.4/5.5): Vertiefung =
`<details>`, summary "vertiefung 6.V2" in rubric small caps plus the italic title; a 1.5 px rubric
rule in the gutter; dependency line in italic; "zurück zum kern." in rubric small caps. Body size,
no tint (layered-docs recommendation 3). The postulate uses hairlines above and below instead of a
box, so box shapes stay free for element types.

## 6. Figure style

Line weights a touch lighter than PKG-1 to match Baskerville's colour: axes 0.45 pt, boundaries
0.7 pt, data 1.0 pt, levels 1.3 pt, energy arrows 1.8 pt, helpers 0.35 pt dashed. Markers 1.9 pt.
Axes without boxes; tick labels in Companion Math lining figures (prose numbers in oldstyle, axis
numbers lining). Hatching for forbidden regions in the warm environment grey. Labels direct; symbols
in Companion Math `\small`, prose in Whitney Book 8 pt (the deck pairing), never Baskerville italic
for words beginning with Z (swash). Captions: label in small caps, first sentence in italic carries
the message.

```latex
% PKG-2 figure preamble sketch (colours from tokens-pkg-2.json)
\definecolor{stateC}{HTML}{234077} \definecolor{effectC}{HTML}{BC4A3C}
\definecolor{energyC}{HTML}{DCA744} \definecolor{envC}{HTML}{8C857D} \definecolor{rubric}{HTML}{A8372A}
\definecolor{lad1}{HTML}{172A5A} \definecolor{lad2}{HTML}{355695}
\definecolor{lad3}{HTML}{5C88C1} \definecolor{lad4}{HTML}{8CBDE8}
\tikzset{
  state/.style={draw=stateC, line width=1.0pt},   effect/.style={draw=effectC, line width=1.0pt},
  energy/.style={draw=energyC, line width=1.8pt}, boundary/.style={draw=black, line width=0.7pt},
  axisstyle/.style={draw=black, line width=0.45pt, -{Stealth[length=4pt, width=3pt]}},
  forbidden/.style={pattern=north east lines, pattern color=envC},
  lbl/.style={font=\small}, lbltext/.style={font=\sffamily\footnotesize},  % sans = Whitney Book
}
\pgfplotscreateplotcyclelist{tpclevels}{{lad1,line width=1.0pt},{lad2,line width=1.0pt},
  {lad3,line width=1.0pt},{lad4,line width=1.0pt},{lad1,line width=1.0pt,dashed}}
\pgfplotsset{tpcplot/.append style={axis line style={black, line width=0.45pt},
  every axis title/.style={font=\scshape\small, text=rubric}}}
```

## 7. Interactive components

Controls are set in Whitney (Baskerville at control sizes looks fussy): buttons Whitney Semibold
15 px on cream with a 1 px rule; primary buttons ink-filled (not red: red is for labels and effects);
slider `accent-color` = controlled role; readouts in Whitney tabular figures in a 1 px rule frame;
focus 2 px link-blue outline offset 2 px. Dark mode: warm-dark column (`#1C1714`), never inverted.
three.js: cream background `#FAF6EE` (dark `#1C1714`), warm hemisphere light, matte materials
(roughness 0.7), axis labels as HTML overlays in Companion Math on opaque cream plates. Game HUD:
Whitney on an opaque plate, score as a probability, level titles in Baskerville small caps.

```css
:root{ --c-ink:#241E19; --c-paper:#FAF6EE; --c-rule:#CFCAC1; --c-rubric:#A8372A; --c-link:#284E7D;
  --c-state:#234077; --c-effect:#BC4A3C; --c-energy:#D7A03D; --c-environment:#8C857D; }
@media (prefers-color-scheme:dark){ :root:not([data-theme=light]){ --c-ink:#E8E4DC; --c-paper:#1C1714;
  --c-rule:#453E39; --c-rubric:#F18B71; --c-link:#97C2F0; --c-state:#94B9F1; --c-effect:#ED7665;
  --c-energy:#F8CA65; } }
body{font:400 1.1875rem/1.6 var(--f-text);font-variant-numeric:oldstyle-nums;color:var(--c-ink);
  background:var(--c-paper)}
.label{font-variant:all-small-caps;letter-spacing:.06em;color:var(--c-rubric)}
.postulate{border-block:1px solid var(--c-rubric);padding:.6rem 0;margin:1.3rem 0}
.readout{font:400 .9375rem/1.3 var(--f-label);font-variant-numeric:tabular-nums lining-nums;
  border:1px solid var(--c-rule);border-radius:2px;padding:.1em .5em}
.btn{font:600 .9375rem/1 var(--f-label);background:var(--c-paper);color:var(--c-ink);
  border:1px solid var(--c-rule);border-radius:2px;padding:.45em .9em}
.btn.primary{background:var(--c-ink);color:var(--c-paper)}
:is(.btn,input,summary):focus-visible{outline:2px solid var(--c-link);outline-offset:2px}
details.zoom{position:relative}
details.zoom::after{content:"";position:absolute;inset:0 auto 0 calc(100% + 1.45rem);
  width:1.5px;background:var(--c-rubric)}
```

## 8. Video style

16:9, 3840 x 2160, 30 fps. Ground `#141C26` (TJO's 2022 deck), ink `#EFEBE2`, emphasis gold
`#F2DC9B` used as a foreground colour (never as a fill behind text). Camera as PKG-1 (fixed field
of view, motivated moves only). Title cards: Baskerville 10 Pro small caps, letter-spaced, 110 px,
with the chapter number in rubric `#FC8E72`; lower thirds Whitney Book on an opaque plate. Equations
typeset by XeLaTeX with Companion Math to SVG, revealed term by term. Materials: state
`#96C0FE`, effect `#F87966`, energy `#FFD16B`; the 2p density as a volume render with a ramp from
ground to state hue. Print reuse: re-render with print-light tokens on white (the ground colour of
the video is never printed).

## 9. Bilingual rules

As PKG-1 (csquotes, siunitx locale, ngerman hyphenation, upright d, e, i, run-in labels switched by
the build), plus: oldstyle figures in German and English prose, lining figures in mathematics, tables
and axes (`Numbers=OldStyle` for the main font, Companion Math digits are lining); German small-caps
labels are lower case in the source ("vertiefung") and set with `Letters=SmallCaps`, never faked
from capitals; no italic labels starting with Z (Zustand, Zeit, Zerfall), because of the swash Z.

## 10. Coherence proof: the Born rule

- **Print.** "postulat P4" in rubric small caps between two rubric hairlines, *Bornsche Regel.* in
  italic, p(E|rho) = tr(rho E) in Companion Math (specimens/pkg2-1.png); figure 6.1a with the state in
  Prussian blue and the detector axis in rubric red.
- **Web page.** Cream page, same hairlines, MathML in Companion Math, slider in Whitney with a
  Prussian-blue thumb, readout "p = 0,741" (specimens/pkg2-html.png).
- **Demo.** Bloch sphere on a cream plate, state arrow `#234077`, detector axis `#BC4A3C`, labels in
  Companion Math on cream plates.
- **Game HUD.** Whitney plate "Klickrate 0,74", level title "Detektor-Wette" in Baskerville small caps.
- **Video frame.** `#141C26` ground, gold emphasis on the term tr(rho E) as it is explained, state
  `#96C0FE`, axis `#F87966`, title in Baskerville small caps.

## 11. Costs and risks

- Licences: Baskerville 10 Pro desktop and Whitney installed. Storm webfont/app licence price not
  found ([UNVERIFIED]; Storm Type Foundry, http://www.stormtype.com, named in the font's metadata).
  Permission to publish Companion Math (derived from Storm outlines) is unresolved and blocks every
  medium except print and video. Whitney webfont as PKG-1. Variant 2M: Minion Math about 700 EUR per
  licence (2012 report, [UNVERIFIED] now); Minion Pro web use [UNVERIFIED].
- Build complexity: highest of the three. The math font is a moving target maintained in a sibling
  repo; every font release needs the book's regression pages re-proofed. Native MathML only on the
  web (no MathJax fallback in the same face). Typst works.
- Repo changes: as PKG-1 plus `unicode-math` instead of `mtpro2`/`mathspec`, oldstyle figures, a
  pinned copy (by sha256) of the Companion Math OTF referenced by the build.
- Risks: (1) the font fails 3 of its own hard rules today; a book typeset now would need re-proofing
  after every fix. (2) Licence: Storm may refuse distribution of derived outlines, which would leave
  the web on STIX Two Math, a visible mismatch. (3) Swash Z/N in math italic collides with the
  partition function Z and particle number N, both central in chapters 19-22. (4) About 5-8 % more
  pages than PKG-1.

## 12. Verdict

PKG-2 is right if TJO wants the book to look like nobody else's physics book and is willing to carry
Companion Math to a release-quality v1 (hard rules passing, swash capitals replaced, licence cleared)
before the print edition freezes. Until then it is a goal state, not a package to start production in.
