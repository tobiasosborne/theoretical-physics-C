<!-- ROLE: report of the design-packages-A lane (print-first, classical lineage) for the Theo C upgrade.
     Authored 2026-10-09 by the lane agent (Claude Opus). Companion files: PKG-1/2/3 package files,
     tokens.py (+ tokens-tables.md, tokens-pkg-{1,2,3}.json), measure.py, specimens/.
     UPDATE POLICY: append dated corrections; regenerate generated files instead of editing them. -->

# Design packages A: print-first, classical lineage

## How I worked

1. Read the brief, CONTEXT, the package template, the design-research report, landscape and palette
   measurements (and both specimen sheets), the sources inventory, TJO's `presentations/STYLE_GUIDE.md`,
   `latex/tpc-style.sty`, `latex/tpc-tikz-templates.sty`, `latex/figures/fig_vl11_kasten.tex`, and
   `../mathfonts` (README, HANDOFF, verifier report v0.140). The layered-docs report landed while I
   worked; all three packages adopt its devices (Kern / Vertiefung / Fundament, run-in label,
   dependency and return lines, "Tiefe" for depth and "Zoom" only for the physics axis). PKG-3
   deviates for short blocks and says why.
2. Colour: `tokens.py` authors every role in OKLCH for four modes, gamut-maps to sRGB, and checks
   WCAG contrast, the greyscale lightness budget and CVD separability (Machado matrices as in the
   design-research script). Output: `tokens-tables.md` and DTCG-style `tokens-pkg-N.json`, which the
   HTML generator reads. No colour in the package files was typed by hand.
3. Print: one shared German page (`specimens/body-de.tex`: chapter head, sidenote, Postulat P4 box,
   two displays, a two-panel TikZ figure computed from formulas, a Vertiefung block) and a shared
   figure (`fig-born.tex`); each `pkgN.tex` only defines the semantic macros. Compiled with
   `timeout 120 xelatex`, rendered with `pdftoppm -r 110`, inspected, fixed, recompiled. Extra
   checks: equation detail strips (`detail-eq.png`), greyscale render of the three figures
   (`greyscale-figures.png`), text extraction with `pdftotext`, characters per line (`measure.py`).
4. Web: `specimens/make_html.py` writes `pkgN.html` from the same content with the package's tokens,
   hand-written MathML, an inline SVG of the figure and a working slider. Rendered with Playwright's
   installed Chromium headless shell (`~/.cache/ms-playwright/chromium_headless_shell-1228`) called
   directly with `--screenshot` (the Playwright npm package is not installed in this repo); fonts
   load from local files (`--allow-file-access-from-files`) and are never embedded, since Times,
   Whitney, Baskerville 10 Pro and Companion Math are licensed or private. Renders: light for all
   three, dark for PKG-1 and PKG-3, phone width (420 px) for PKG-3.
5. A late extra: `specimens/pkg1s.tex`, PKG-1 with the STIX Two stack in print (scaled 0.955 to
   match Times's x-height), side by side with PKG-1 in `ab-pkg1-mtpro2-vs-stix.png`.

All files were written with Bash heredocs or Python. No subagents.

## Compile and render problems (all resolved unless stated)

| Where | Problem | Resolution / status |
|---|---|---|
| pkg1 | `\captionsetup{name=Abb.}` undefined control sequence | `\addto\captionsngerman{\renewcommand\figurename{Abb.}}` |
| pkg1 | 19.5 pt overfull line: inline e^{-iHt/hbar} rho e^{iHt/hbar} in a 114 mm measure with MTPro2 | rewritten as rho -> U_t rho U_t^*; finding kept (MTPro2 sets wide) |
| pkg1 | "Missing character: There is no → (U+2192) in font Whitney-Book.otf" | arrow removed from Whitney labels; rule: arrows come from the math font |
| pkg1 | `pdftotext` returns "  0" for "rho >= 0" and "D" for "=" | not fixable: MTPro2 Type 1 has no usable ToUnicode; recorded as a PKG-1 cost |
| pkg2 | page ran to 2 pages (3 lines over) with the same content | margins 12/9 mm and leading 14.0 pt; finding: about 5-8 % more height than PKG-1 |
| pkg2 | swash Z in Baskerville 10 Pro Italic ("Zustände" in an italic title) | kept visible in the specimen as evidence; rule: no italic labels starting with Z |
| pkg3 | "The font STIX Two Text cannot be found" | STIX is in the TeX tree only, not fontconfig: load by file name |
| pkg3 | margin block left an empty paragraph with its marker | `marginnote` in vertical mode |
| all | crowded hydrogen ladder at 0.2 cm/eV; labels colliding | 0.5 cm/eV for n >= 2 and an explicit axis break below n = 2 (n = 1 drawn below it, stated in the source) |
| html | stretched parentheses, binary minus spacing, "|r |" spacing in MathML | `mrow` grouping, `form="prefix"`, fence forms |
| html | float into the margin ignored for grid items; coloured fringes on 𝟙 | wrapper `div`; `--disable-lcd-text` (subpixel AA, not a font problem) |
| html | phone width: display equation (6.2) wider than the column | `overflow-x:auto` (scrolls); authoring rule in PKG-3 section 5 |

Every final print specimen is one A4 page with 0 errors and 0 overfull boxes (`specimens/pkgN.log`).
`specimens/pkg2.pdf` was deleted after rendering `pkg2-1.png` because it embeds a subset of the private
Companion Math prototype (same practice as the design-research lane's `e.pdf`); rebuild it from `pkg2.tex`.

## The three packages

- **PKG-1 "Times and MathTime, perfected"** (`PKG-1-times-mathtime.md`): Times LT Std + MTPro2 in
  print, STIX Two on live screens, Whitney labels, TJO's teal re-stepped (state L 0.36, effect 0.56,
  energy 0.76). Mismatch confined to one rule: everything rendered through TeX (print, figures, video
  equations) uses MathTime; everything live (HTML, demos, games) uses STIX Two.
- **PKG-2 "Baskerville Companion"** (`PKG-2-baskerville-companion.md`): Baskerville 10 Pro + TJO's
  Companion Math v0.140, Whitney labels, rubricated palette, video in TJO's 2022 deck colours
  (`#141C26`, `#F2DC9B`); commercial variant PKG-2M with Minion Math (not installed, untested).
- **PKG-3 "The lab notebook"** (`PKG-3-lab-notebook.md`): STIX Two for everything, Tufte-descended
  20/110/7/55/18 mm grid, short Vertiefung blocks in the margin, Paul Tol high-contrast roles,
  videos on white so frames are print figures.

## Comparison

| Criterion | PKG-1 Times + MathTime | PKG-2 Baskerville Companion | PKG-3 Lab notebook |
|---|---|---|---|
| Print quality (specimens) | Best-integrated Times math; looser lines with inline math (wide MTPro2); 70 chars/line | Warmest page; Latin/Greek math matches the text; = and fraction bars low and small (axis 0.535 x-height, below every font in the verifier's corpus); swash Z/N | Even and dark; STIX's larger x-height lets 10.5 pt read like 11; one family limits label contrast |
| Print-screen match | Family only: MTPro2 versus STIX Two on screen (`detail-eq.png`, strips 1 vs 3); exact for TeX-rendered video and figures | Exact where Storm permits shipping the fonts; otherwise STIX Two Math next to Baskerville (bad, cf. design-research specimen F) | Exact: same glyphs in XeLaTeX, Typst, MathJax 4, MathML, three.js overlays, video |
| Greyscale survival (print figures) | Pass: data roles dL >= 0.20; ladder monotone (`greyscale-figures.png`) | Pass: dL >= 0.18 | Pass: dL >= 0.18; best CVD margins (deutan dE 0.213) |
| PDF text and accessibility | Math not extractable (measured) | Unicode math | Unicode math; tagged PDF via Typst possible |
| Licence cost | Owned for print; Whitney webfont subscription (reported USD 199/yr, [UNVERIFIED]); MTPro2 second seat USD 179 / 129 academic [UNVERIFIED] | Storm webfont/app licence price unknown; permission for derived Companion Math outlines unresolved; PKG-2M about 700 EUR (2012, [UNVERIFIED]) | 0 EUR |
| Build complexity | Medium: two math stacks; XeLaTeX only, no Typst | High: math font maintained in a sibling repo, re-proof per release; MathML only on web | Low: one stack; Typst pilot possible now |
| Fit to TJO's identity | Highest: his stated fonts, his Whitney-teal talk identity | High in spirit (his own font; his 2022 Whitney+Baskerville deck); red replaces teal | Lowest: neutral notebook, no Whitney, Tol blue instead of teal |

Side result (`ab-pkg1-mtpro2-vs-stix.png`): with PKG-1's grid, Whitney and colours held fixed,
swapping MTPro2 + Times for STIX Two at 0.955 scale changes the page less than any other variable
tested here. The visible differences are the Greek (rho, epsilon), the calligraphic H and the colour
of the text, which is slightly darker.

## Recommendations

1. **Adopt PKG-1 (grid, Whitney labels, re-stepped teal tokens, components, depth devices) and make
   the print math a build switch: MTPro2 (PKG-1) or STIX Two (PKG-1S, `specimens/pkg1s.tex`).** Run
   a blind side-by-side of the two printed pages with TJO. If he cannot reliably pick MathTime, ship
   PKG-1S. It removes the screen mismatch, the unreadable PDF math and the block on Typst, at no
   licence cost, and keeps his identity. Trade-off: PKG-1S gives up MathTime's look, which TJO prefers
   and which the specimens show is the better-integrated Times math.
2. **PKG-3 if coherence and accessibility are the deciding criteria.** It is the only package that
   meets "the same glyphs in every medium" literally. Its margin placement of short Vertiefung
   blocks keeps page breaks identical between the full and the core-only PDF. Trade-off: it drops
   Whitney and the teal identity, needs a 55 mm margin (more pages), and single-family labels are
   weaker at 8 pt.
3. **PKG-2 as the goal for a later edition, not for production now.** Start production with it only
   once Companion Math reaches a release-quality v1, defined as: its three failing hard rules pass,
   the axis is raised into the corpus range, non-swash Z and N exist in math italic, and Storm has
   granted written permission for derived outlines. Until then PKG-2M (Minion Math) is the commercial
   route to the same warm register. Trade-off: the most distinctive book, at the highest build and
   licence risk.
4. **Package-independent, do first.** Replace the current palette with one of the token files.
   Today cgblue, birrenred and birrengreen share L 0.53-0.55, and the link munsell is at 3.82:1 on
   white. Keep the energy role (L 0.76, about 2.2:1 on white) to fills, arrows of 1.8 pt or more,
   and ink-labelled areas. Add `microtype` protrusion, `csquotes`, `siunitx` locale switching and
   `\emergencystretch`. Load STIX by file name. Test every label font for the glyphs figures need,
   since Whitney lacks U+2192. Trade-off: all 22 figures need a recolouring pass with redundant
   encoding.
5. **Keep the generator approach.** One semantic body with per-package macro files, plus one token
   JSON read by TeX, CSS and the HTML generator, made switching packages a one-line change in this
   lane. The real repo should keep that property (design-research recommendation 1). Trade-off: about
   one day of tooling before visible output.

## Open questions for TJO

1. In a blind print-out of `specimens/pkg1.pdf` against `specimens/pkg1s.pdf`, which page do you
   prefer, and can you tell them apart at reading distance?
2. Is it acceptable that the canonical PDF's mathematics cannot be searched, copied or read aloud
   (PKG-1 with MTPro2)? Do accessibility rules for university teaching material apply to it?
3. Do you hold a Whitney webfont or app licence (Hoefler&Co)? If not, will you pay a recurring web
   fee, or should web labels use a free substitute (Source Sans 3)?
4. Companion Math: do you want to take it to v1 (hard rules, axis, non-swash Z/N), and will you ask
   Storm Type Foundry for permission to publish outlines derived from Baskerville 10 Pro? Should
   PKG-2M (Minion Math, about 700 EUR in 2012) be priced as a fallback?
5. Videos on a dark ground (PKG-1, PKG-2; your talks use black or white grounds) or on white (PKG-3;
   frames become print figures without re-rendering)?
6. Short Vertiefung blocks in the margin (PKG-3), or always inline with an outer-margin rule
   (layered-docs, PKG-1, PKG-2)?
7. Identity colour: your teal (PKG-1), rubric red (PKG-2), or a neutral notebook blue (PKG-3)?
8. Page budget: wide-margin layouts cost roughly 10-15 % more pages than the current 2.5 cm margins
   [estimate]. Is that acceptable for the printed edition? Is the print format A4, or a book trim
   such as 170 x 240 mm?
