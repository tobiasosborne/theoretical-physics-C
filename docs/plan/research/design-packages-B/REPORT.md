<!-- ROLE: report of the design-packages-B lane (screen-first, contemporary lineage) for the Theo C upgrade.
     Authored by Claude Opus on 2026-10-09. Packages: PKG-4-tokens-first-dark-video.md,
     PKG-5-explorable-textbook.md. UPDATE POLICY: append dated corrections; regenerate tokens, do not hand-edit. -->

# Design packages B: screen-first, contemporary lineage

## Method

1. Read `docs/plan/BRIEF.md`, `docs/plan/CONTEXT.md`, `research/PACKAGE-TEMPLATE.md`, the design-research
   lane (`REPORT.md`, `LANDSCAPE.md`, `palette-measurements.md`, specimens `abc.png`, `def.png`), the
   sources inventory (installed fonts and tools), TJO's `presentations/STYLE_GUIDE.md` (System A, Whitney
   teal), the layered-docs report (`research/layered-docs/REPORT.md`, which appeared during this lane), the
   repo's `latex/tpc-style.sty` and `latex/tpc-tikz-templates.sty`, and the shipped demos
   `../generalrelativity/docs/geodesic-bump.html` and `quantumcomputing/docs/bloch-sphere.html` (both:
   light ground, system-ui sans, grey control panel, client-side MathJax 3, hex colours typed per page).
2. Authored both palettes once, in OKLCH, in `tokens/build_tokens.py` (172 lines, no dependencies). It
   writes DTCG colour objects (`pkg4.tokens.json`, `pkg5.tokens.json`), the targets (`-tokens.sty`,
   `-tokens.css`, `-tokens.glsl`) and the measurements (`pkgN-measurements.md`: WCAG 2.2 contrast,
   OKLab lightness steps, min pairwise OKLab distance under the Machado 2009 deutan/protan matrices used
   by `design-research/palette_cvd_check.py`). Lightness values were iterated until print-light met the
   0.15 greyscale budget and every role used for strokes reached 3:1 on white.
3. Wrote one XeLaTeX page per package (`specimens/pkg4.tex`, `specimens/pkg5.tex`: German text, display
   maths, theorem box, margin note, TikZ figure, Vertiefung block), compiled with `timeout 120 xelatex`
   (0 errors, 0 overfull boxes, 0 missing-character warnings in the final logs), rendered page 1 at
   110 dpi and inspected the PNGs; several rounds fixed an orphaned word in a box, an empty box title, a
   label overlapping a lobe, and an over-wide plane in the 3D figure. `pdffonts` confirms every face is
   embedded. A greyscale conversion of both figures is `specimens/greyscale-figures.png`.
4. For PKG-5, wrote a scene-graph prototype (`specimens/scene/scene_2pz.py`, 129 lines): the hydrogen 2p_z
   half-maximum contour (roots of r^2 e^-r cos^2(theta) = 2 e^-2, |theta| <= 45 degrees, r from 0.7612 to
   4.1559 a0 on the axis), an orthographic camera, labels and gizmo, emitted as TikZ (print) and as SVG
   (web) from the same projected coordinates, plus a numerical check: probability inside the contour
   0.1772, normalisation 1.0000 (midpoint rule, 3000 x 600; 1500 x 400 agrees to 4 digits).
5. Wrote one HTML page per package (`specimens/pkgN.html`, built from `pkgN.template.html` by
   `make_html.py`, which pastes the generated token CSS and, for PKG-5, the scene SVG), with native
   MathML, light and dark via `prefers-color-scheme`, a slider + readout component computing real
   physics, and a game HUD. Rendered light and dark at 1280 px with the installed Playwright 1.61 /
   Chromium 149 (`specimens/pkgN-web-{light,dark}.png`), inspected them, and checked: all @font-face
   faces loaded; no horizontal overflow at 390 px; readouts correct (PKG-4: n = 1, [0, 0.5] gives 0,50;
   PKG-5: f = 0.25 / 0.10 give 0,409 / 0,655, equal to the Python values 0.4088 / 0.6553).

Changes to the brief's starting ideas. PKG-4 kept, with Inter instead of Whitney as the one sans (Whitney's
web licence is a separate purchase; one free face in every medium beats a print/web split). PKG-5 kept,
with two additions that make the idea work: a **plate** token (figures stay light in every mode, so a
still equals a figure even in dark mode) and **colour reserved for physics** (monochrome chrome). Both
packages follow layered-docs: the depth axis is called Vertiefung, not zoom, which stays the name of the
physics axis.

## Findings that matter beyond the two packages

- A role palette that survives greyscale and reaches 3:1 for strokes on white fits only into OKLCH
  L about 0.35-0.67 for three hues plus one hatched grey (0.84). Both packages land there (PKG-4 L 0.35 /
  0.50 / 0.66 / 0.84, PKG-5 L 0.36 / 0.51 / 0.66 / 0.84). The lightest chromatic role is then at 3.1-3.2:1:
  usable for 0.8 pt strokes and tints, never for text.
- The weakest pair under protanopia is the warm pair (red/amber in PKG-4, green/orange in PKG-5):
  min dE_OK 0.106-0.110, versus 0.162 for Tol high-contrast. Dash patterns are therefore mandatory, not
  optional.
- MathML Core in Chromium 149 rendered `<mi mathvariant="bold">x</mi>` as italic x (observed in the PKG-5
  specimen); bold symbols had to be written as Unicode math alphanumerics (U+1D431). Any TeX-to-MathML
  converter in the pipeline must emit those; test it before committing to native MathML.
- `<mi>tr</mi><mo>&#x2061;</mo>` gave no space before ρ in Chromium; an explicit 0.17 em space was needed.
  A converter's operator spacing must be checked on the course's own macros (tr, Spur, ket notation).
- Lane A (`design-packages-A/tokens-pkg-*.json`) stores modes as `$extensions.modes` next to a default
  `$value`; this lane stores modes as sibling groups. Lane A's form is closer to DTCG (every token has a
  `$value`); the final token file should use it.

## Comparison

| criterion | PKG-4 Tokens first, dark-ground video | PKG-5 Explorable textbook |
|---|---|---|
| Print quality | High. STIX Two Text 10.5/13.9 pt with STIX Two Math, 108 mm measure (69-75 characters), Inter labels; a Times-like book. Lighter integration than Times + MTPro2 (design-research specimen A vs B). | High, different register. Libertinus 11/14.4 pt, 112 mm (70-75 characters), real small caps, hairline boxes, no tints on chrome; calm and bookish, not Times. |
| Print-screen match | Exact for text and math (same OTF files, native MathML). 3D, games and video are on a dark stage: same hues, different lightness. | Exact for text, math, figure, HUD and video: the data-role hex is identical in all four modes because figures sit on a light plate. |
| Greyscale survival | Print-light: min dL 0.154, all roles redundantly coded; checked in `greyscale-figures.png`. Dark modes not designed for grey (never printed). | Min dL 0.150 in every mode (one value per role); checked in `greyscale-figures.png`. |
| Video stills as print figures | No; each dark-ground scene needs a print twin rendered in print-light mode. | Yes, by construction (same scene state, same ground, CI-checkable). |
| Licence cost | 0 EUR (STIX Two, Inter, Iosevka: OFL). Optional Whitney web licence [UNVERIFIED price]. | 0 EUR (Libertinus family: OFL). |
| Build complexity | Low-medium: token compiler (exists), Temml MathML step, three.js stage, print twins for 3D. | Medium-high: token compiler plus a scene-graph schema and three emitters (TikZ, three.js, video driver); a general hidden-line TikZ emitter is 2-4 weeks [estimate]. |
| Fit to TJO's identity | Good: accent is his dk2 `#335B74` re-stepped in OKLCH, dark-mode cyan near his accent1; dark stage echoes his black-background slides; loses Whitney and Times. | Moderate: state blue and effect green come from his hue families, but chrome is monochrome and the face is Libertinus; closest to his "minimise visual noise" commandment. |
| Familiarity for students | 3Blue1Brown-like dark videos and a modern web article. | Ciechanowski-like light live figures; videos look like the book moving. |
| Main risk | Two looks (light page, dark stage) and a print twin per 3D figure. | Toolchain effort; light video glare; not Times. |

## Recommendations

1. **Adopt the token pipeline of PKG-4 regardless of which package wins** (one OKLCH source compiled to
   `.sty`, CSS, GLSL, JSON with measurements in CI). Trade-off: one more build step; in exchange every
   palette claim in this lane is reproducible (`python3 -I tokens/build_tokens.py`) and no colour is typed
   twice. Merge with lane A's token structure first.
2. **Take PKG-5's plate rule and colour-for-physics rule into whichever package is chosen.** Figures,
   demos and HUDs on a light plate in every page mode make one role hex valid everywhere; monochrome
   chrome removes the collision between a teal link and a teal state. Trade-off: no dark 3D stages on the
   web; dark mode only darkens the frame around the figures.
3. **For the canonical PDF and the web, prefer PKG-4's type system (STIX Two + Inter) over PKG-5's
   Libertinus** unless TJO wants a deliberately non-Times book. Trade-off: STIX Two is darker and wider than
   Times LT + MTPro2 and has no bold math; it is the only Times-like face that reaches MathML, Typst and
   video unchanged. PKG-5b (PKG-5 rules with STIX Two + Inter) is a token change and is the combination
   this lane would build first.
4. **Decide the video ground before any 3D work** (open question 1): dark ground (PKG-4) costs a print twin
   per 3D figure; light ground (PKG-5) makes stills into figures for free but glares in a dark hall.
   Trade-off as stated; it is the decision with the largest downstream cost.
5. **Build the scene-graph emitter only for figures that have a demo.** Start with hydrogen (2p_z, 3d) and
   the box, where the prototype already works; keep the remaining 22 TikZ figures hand-written TikZ with
   role styles. Trade-off: two figure toolchains for a while; avoids a 4-week tool project before content.
6. **Pre-render maths to MathML server-side and test the converter on bold symbols and `tr` spacing**
   (both failed with naive hand-written MathML in Chromium 149). Trade-off: a Node step in the web build;
   retires client-side MathJax 3 and its Computer Modern look.
7. **Use Vertiefung markers as specified by layered-docs (outer rule, run-in label, own equation counter,
   "Zurück:" line), with PKG-4's 1.2 pt accent rule or PKG-5's 0.4 pt ink hairline.** Trade-off: a quiet
   marker is easy to overlook; it keeps depth independent of element type and survives greyscale.

## Open questions for TJO

1. Video ground: dark (3Blue1Brown tradition, print twins needed) or light (stills are book figures,
   brighter in the lecture hall)?
2. Typeface: is STIX Two an acceptable stand-in for Times + MathTime in the canonical PDF, or is a
   non-Times face (Libertinus) acceptable if it buys an exact match everywhere? Or should `mathtime-otf`
   be finished first?
3. Whitney: drop it in favour of a free sans (Inter) in every medium, or buy the web licence so the course
   carries your slide identity? (Price and terms not checked.)
4. Colour on chrome: may headings, links and boxes carry your teal (PKG-4), or should colour mean
   physics only (PKG-5)?
5. Role assignment: state = blue, effect/detector = amber (PKG-4) or green (PKG-5), dynamics/energy =
   red or orange, environment = hatched grey. Do these match how you draw on the board?
6. Is an orthographic, preset-camera look acceptable for 3D figures in the lectures, or do you want
   perspective renders for the hydrogen material?
7. Should the depth blocks use the layered-docs names (Kern / Vertiefung / Fundament) in the design
   too, so that "zoom" is reserved for the physics axis?

## Files

- `PKG-4-tokens-first-dark-video.md`, `PKG-5-explorable-textbook.md` (the packages, template order).
- `tokens/build_tokens.py` (source), `tokens/pkg{4,5}.tokens.json`, `-tokens.{sty,css,glsl}`,
  `pkg{4,5}-measurements.md` (all generated).
- `specimens/pkg{4,5}.tex` / `.pdf` / `-1.png` (print), `pkg{4,5}.html` / `-web-{light,dark}.png` (web),
  `pkg{4,5}.template.html` + `make_html.py`, `greyscale-figures.png`, `scene/scene_2pz.{py,json,tikz,svg.txt}`.
- Screenshots were taken with a 30-line Playwright script kept in the session scratchpad
  (`require` of `../physics-visualisations/viewer/node_modules/playwright`, Chromium 1228); it set
  `colorScheme` light/dark at 1280 x 900 and full-page capture.

---

## Correction note, 2026-10-11

Added by the Phase 0 coordinator from the codex review (`../review/REVIEW.md`, sections B and G;
path relative to `docs/plan/research/`). The text above is left as written, as evidence of the
campaign; where it conflicts with this note, the note governs.

- Lines 28-32: the half-maximum enclosed probability is about 0.1771; the claimed four-decimal convergence of the stated grids is withdrawn. Line 92: STIX is not technically unique.
