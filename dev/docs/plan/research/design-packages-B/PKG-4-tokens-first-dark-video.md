<!-- ROLE: design package PKG-4 (design-packages-B lane, Claude Opus, 2026-10-09), per PACKAGE-TEMPLATE.md.
     Specimens: specimens/pkg4.{tex,pdf,html,-1.png}, pkg4-web-{light,dark}.png. Tokens: tokens/ (generated).
     UPDATE POLICY: edit the OKLCH source in tokens/build_tokens.py, regenerate, then update the tables here. -->

# PKG-4 "Tokens first, dark-ground video"

## 1. Name and philosophy

**Tokens first, dark-ground video.** One design-token file is the only place a colour, a type size or a
spacing value is decided; the print style file, the web CSS, the three.js shaders, the game HUD and the
video palette are compiled from it. Four modes are designed together: print-light, screen-light,
screen-dark and video (dark ground). The canonical PDF is derived from screen-light by one rule (pure white
paper, the same role lightness), so the book and the web pages are one typographic object; 3D scenes,
games and videos share the dark ground of the video mode, the way 3Blue1Brown's videos give each object
one colour on a dark stage (manim defaults: https://github.com/3b1b/manim). The book's math font is
also the web's math font (STIX Two through native MathML).

It optimises for: identical identity across five media at near-zero per-chapter design labour (the
lesson of the Distill hiatus, https://distill.pub/2021/distill-hiatus/); reader-controlled live figures
inline with prose (Ciechanowski, https://ciechanow.ski/archives/); depth that opens in place, with
popups for definitions (gwern.net, https://gwern.net/design); embedded retrieval questions (Quantum
Country, https://quantum.country/). It refuses: hand-picked colours in any file other than the token
source; scroll-driven figures (Kosara, https://eagereyes.org/blog/2016/the-scrollytelling-scourge);
text over moving 3D without an opaque plate (Liquid Glass criticism, https://pxlnv.com/blog/on-liquid-glass/);
inverted images as "dark mode" (EU guide, https://data.europa.eu/apps/data-visualisation-guide/dark-mode).

## 2. Math-font decision

**Option (a): STIX Two Text + STIX Two Math everywhere** (OFL 1.1, https://github.com/stipub/stixfonts;
v2.14 April 2025). The same OTF files serve XeLaTeX/LuaLaTeX (`unicode-math`), Typst, native MathML in
the browser (`@font-face` WOFF2) and SVG equations for video (XeLaTeX + `dvisvgm`, both installed).
Consequence: print and screen math match glyph for glyph; specimen `specimens/pkg4.pdf` and
`specimens/pkg4-web-light.png` show the same STIX glyphs (font list from `pdffonts`: STIXTwoText-Regular,
-Italic, -SemiBold, STIXTwoMath-Regular, Inter, Iosevka; Playwright reported STIX Two Text and STIX Two
Math as loaded). Cost against TJO's Times + MathTime preference: STIX Two is darker and sets wider
than Times LT Std, has no bold math weight (Vieth, TUGboat 44:2, https://tug.org/TUGboat/tb44-2/tb137vieth-otmath.pdf,
Table 2) and no script optical sizes. If `mathtime-otf` succeeds and the PCTeX licence permits web
embedding, the token file swaps `font.math` and nothing else changes.

## 3. Typography

All faces are free (OFL) and installed: STIX Two (TeX tree `stix2-otf`), Inter (`fc-list`, also TeX tree
`inter`), Iosevka (`fc-list`). Whitney is installed but is not used: its web licence is a separate
commercial purchase (https://www.typography.com/fonts/whitney, price [UNVERIFIED]); Inter carries the
sans role in every medium so the HUD, the web UI and the book labels are the same face. Print (A4, XeLaTeX, KOMA):

| role | face | size / leading |
|---|---|---|
| body | STIX Two Text Regular | 10.5/13.9 pt (measured `\baselineskip` 13.86 pt) |
| math | STIX Two Math, `math-style=ISO` | follows body |
| small (Vertiefung blocks) | STIX Two Text | 9.5/12.5 pt |
| footnote | STIX Two Text | 8.5/11 pt |
| margin notes | Inter Regular, ink-muted | 7.8/10.6 pt |
| captions | Inter; message sentence in SemiBold ink, rest Regular ink-muted | 7.8/10.4 pt |
| figure labels | Inter 7 pt for words; STIX Two Math for symbols | |
| kicker | Inter SemiBold caps, tracking 8 % | 8/10 pt |
| chapter title | STIX Two Text Regular | 19/23 pt |
| section | STIX Two Text SemiBold | 12.5/16 pt |
| mono | Iosevka, `Scale=MatchLowercase` | 9 pt |

Page: inner margin 22 mm, text block 108 mm, gap 6 mm, margin column 50 mm, outer margin 24 mm
(22 + 108 + 6 + 50 + 24 = 210); top 22 mm, bottom 26 mm. Measured on the specimen: 69-75 characters
per full body line (`pdftotext`), inside Butterick's 45-90 (https://practicaltypography.com/line-length.html),
above Bringhurst's 66 by about 10 %. Sidenotes via `\marginpar` (production: `sidenotes` or KOMA
`scrlayer-notecolumn`, both installed). `microtype` protrusion on (XeTeX supports protrusion, not expansion).

Web (same roles, CSS custom properties; WOFF2 subsets of the files above, self-hosted):
```css
--f-text: "STIX Two Text", "STIX Two Math", serif;   --f-math: "STIX Two Math", math;
--f-sans: "Inter", system-ui, sans-serif;             --f-mono: "Iosevka", monospace;
--fs-body: 1.1875rem; --lh-body: 1.55; --fs-small: .875rem; --fs-cap: .8125rem;
--fs-h1: 2.25rem; --fs-kicker: .75rem; --measure: 66ch; --gutter: 15rem; --gap: 2rem;
```

Games and video: Inter (SemiBold for values, Regular for keys, tabular figures `font-variant-numeric:
tabular-nums`) for HUD and lower thirds; STIX Two Text for title cards; STIX Two Math for every symbol.

## 4. Colour

Source: `tokens/build_tokens.py` (OKLCH, the only hand-authored numbers) -> `tokens/pkg4.tokens.json`
(DTCG 2025.10 colour objects, https://www.designtokens.org/) -> `pkg4-tokens.sty`, `pkg4-tokens.css`,
`pkg4-tokens.glsl`, `pkg4-measurements.md`. Hex below is generated, never typed. Cells: hex, OKLCH L C h.

| role | print-light | screen-light | screen-dark | video |
|---|---|---|---|---|
| paper | `#FFFFFF` 1.000 0 0 | `#F7FBFC` 0.985 0.004 230 | `#10161A` 0.195 0.012 240 | `#090F14` 0.165 0.014 240 |
| paper-alt | `#F0F4F7` 0.965 0.006 230 | `#EBF1F4` 0.955 0.008 230 | `#192025` 0.240 0.014 240 | `#131B20` 0.215 0.016 240 |
| ink | `#111921` 0.210 0.020 245 | `#151E26` 0.230 0.020 245 | `#DFE6E9` 0.920 0.008 230 | `#EBEFF2` 0.950 0.006 230 |
| ink-muted | `#545C63` 0.470 0.015 245 | `#575F66` 0.480 0.015 245 | `#A4ACB1` 0.740 0.012 230 | `#ABB2B6` 0.760 0.010 230 |
| rule | `#BFC5CA` 0.820 0.010 240 | `#C5CBD0` 0.840 0.010 240 | `#3C4449` 0.380 0.014 240 | `#373E44` 0.360 0.014 240 |
| accent | `#2E5B75` 0.450 0.065 236 | `#2E5B75` | `#72C5E1` 0.780 0.090 222 | `#73CCEA` 0.800 0.095 222 |
| link | `#066082` 0.460 0.092 232 | `#066082` | `#6BCDE9` 0.800 0.100 218 | `#71D4EF` 0.820 0.100 218 |
| **state** | `#003F60` 0.350 0.080 240 | `#003F60` | `#66CCF4` 0.800 0.110 226 | `#63D4FE` 0.820 0.118 226 |
| **dynamics** | `#B12B35` 0.505 0.170 22 | `#B12B35` | `#F2716C` 0.700 0.160 24 | `#FD736F` 0.720 0.170 24 |
| **effect** | `#C68206` 0.660 0.140 72 | `#C68206` | `#FDCD5C` 0.870 0.140 86 | `#FFD167` 0.880 0.134 86 |
| **environment** | `#CCCAC5` 0.840 0.008 90 | `#CCCAC5` | `#484E52` 0.420 0.010 240 | `#43494D` 0.400 0.010 240 |

Identity: `accent` is TJO's slide colour dk2 `#335B74` (`presentations/STYLE_GUIDE.md` System A),
re-derived in OKLCH at L 0.45; the dark-mode accent and state hues sit near his accent1 `#1CADE4`.
Physics roles: **state/preparation** = deep teal-blue (cyan on dark); **dynamics/energy/Hamiltonian/time
evolution** = red; **effect/measurement/detector** = amber; **environment/bath/forbidden region** = warm
grey, always hatched. Quantum-number ladders: tints 100/75/55/38 % of state (OKLCH L 0.35/0.52/0.65/0.76
for n = 1..4) plus direct labels; never a categorical cycle.

Measured (from `tokens/pkg4-measurements.md`, Machado 2009 matrices as in `design-research/palette_cvd_check.py`):

| mode | data-role L | min dL | min dE_OK | deutan | protan |
|---|---|---|---|---|---|
| print-light | state 0.35, dynamics 0.50, effect 0.66, environment 0.84 | 0.154 | 0.206 | 0.165 | 0.110 |
| video | dynamics 0.72, state 0.82, effect 0.88, environment 0.40 | 0.060 | 0.226 | 0.166 | 0.205 |

Print-light meets the 0.15 greyscale budget (specimens/greyscale-figures.png shows the figure in grey).
The dark modes are not designed to survive greyscale (they are never printed); they keep dE_OK >= 0.166
under deutan simulation. The protan minimum 0.110 (dynamics vs effect, red vs amber) is below Tol
high-contrast's 0.162; mitigated by dash patterns (section 6). WCAG 2.2 contrast on paper: body ink
17.7:1 (print), 16.2:1 (screen-light), 14.4:1 (screen-dark); link 7.0:1 / 6.7:1 / 10.0:1 (all above 4.5:1;
the current `munsell` link has 3.82:1); state 11.2:1, dynamics 6.4:1, effect 3.18:1 print and 3.06:1
screen-light (above the 3:1 non-text threshold of SC 1.4.11 only; never used for text in light modes;
the specimen darkens effect-coloured text by 20 % black, `tpc-effect!80!black`).

## 5. Layout grid

Print page (A4 portrait, single-sided layout; recto/verso mirrored in the book class):

```
|22|<------------ 108 text ------------>|6|<---- 50 margin ---->|24|
    KAPITEL 6  POSTULATE  (kicker, accent)
    Die Bornsche Regel (19 pt)
    body ........................................  sidenote (Inter 7.8)
    [P4 box: paper-alt fill, 2 pt accent rule left]
    figure 108 mm or 164 mm (text+gap+margin)        "Live: tpc/6.3-born"
    Vertiefung block ..........................  |  VERTIEFUNG 6.V1
    (9.5 pt, run-in bold label)                    |  T-06.3a
```

Web: a Distill-style named grid (https://distill.pub/guide/): `[body] minmax(0,66ch) [gap] 2rem
[gutter] 15rem`; `.wide` spans body+gutter; a full-bleed track exists for 3D stages. Below 900 px the
gutter collapses into the body and sidenotes become indented asides with a 2 px rule (checked at 390 px:
no horizontal overflow). A three.js demo sits in a `.wide` "stage" with the video-mode ground
(`#090F14`) in every page mode, aspect 16:9, controls below the stage on the page ground. A game embeds
full-bleed at 16:9 with its HUD inside the stage.

Depth tracks follow `layered-docs/REPORT.md` (Kern / Vertiefung / Fundament; "zoom" is kept for the
physics axis): Kern is unmarked. Vertiefung blocks: print 9.5 pt, a 1.2 pt accent rule 3 mm outside the
text block, margin label "VERTIEFUNG 6.V1" plus the permanent Stacks-style tag (https://stacks.math.columbia.edu/tags),
a run-in bold label, own equation counter (6.V1), and a closing "Zurück:" line that rejoins the core.
Web: `<details>` (stretchtext, works without JavaScript) with the same outer accent rule, a circled +/-
toggle and the tag; definitions referenced in running text open as hover/focus popups (gwern pattern)
that show the definitions-database entry (D-number, tag). Fundament appendices are reached by a margin
signpost "-> F6.2" in print and a popup on the web. Print opens all blocks.

## 6. Figure style

Line weights: axis 0.6 pt ink; state curves 1.1 pt; dynamics and effect 0.8 pt; leaders 0.3 pt;
grid 0.25 pt `rule`, only when values must be read. Markers: state circle 3 pt, effect triangle 3.4 pt,
dynamics square 2.8 pt. Redundant coding per role (greyscale and CVD): state solid; dynamics dashed
(3 pt on, 1.5 pt off) or arrows; effect = 35 % tint area bounded by 0.8 pt edges; environment = 45 degree
hatching at 0.4 pt, ink-muted, never a hue. Forbidden regions (V = infinity, classically forbidden zones)
are environment-hatched. Axes: open (no box), arrowheads only for physical axes without numeric scale,
ticks outward 2 pt, tick labels Inter 7 pt with decimal comma. Labels: direct, at the curve end or the
area's top, in the role colour; no legends. Colour carries: identity (role) only. Quantum number: state
lightness ramp + label; temperature: sequential perceptually uniform map (Crameri batlow,
https://doi.org/10.5281/zenodo.1243862) with a labelled bar; complex phase: cyclic map (Crameri romaO)
with a phase wheel; time: small multiples, never a hue. Caption rule (Doumont, https://www.tug.org/books/reviews/tb103reviews-doumont.html):
first sentence in SemiBold states the message; the rest names data, parameters and the live-demo tag.

TikZ preamble (extends `latex/tpc-tikz-templates.sty`; colour names are generated):

```latex
\input{tokens/pkg4-tokens.sty}            % tpc-state, tpc-effect, ... and tpcvid-* twins
\usetikzlibrary{patterns,arrows.meta}
\tikzset{
  tpc thin/.style={line width=0.4pt}, tpc std/.style={line width=0.8pt},
  tpc thick/.style={line width=1.1pt}, tpc axis/.style={line width=0.6pt,draw=tpc-ink},
  role state/.style={draw=tpc-state,tpc thick},
  role dynamics/.style={draw=tpc-dynamics,tpc std,dash pattern=on 3pt off 1.5pt},
  role effect/.style={draw=tpc-effect,tpc std,fill=tpc-effect,fill opacity=0.35},
  role environment/.style={pattern=north east lines,pattern color=tpc-ink-muted!70},
  role label/.style={font=\sffamily\scriptsize,inner sep=1pt},
  leader/.style={draw=tpc-ink,line width=0.3pt},
}
\pgfplotsset{tpcplot/.append style={tick label style={font=\sffamily\scriptsize},
  axis line style={tpc axis}}}
\pgfplotscreateplotcyclelist{tpcroles}{
  {tpc-state,tpc thick},{tpc-dynamics,tpc std,dashed},{tpc-effect,tpc std,densely dotted}}
\pgfplotscreateplotcyclelist{tpcladder}{% n = 1..4, lightness ramp in the state hue
  {tpc-state,tpc thick},{tpc-state!75,tpc thick},{tpc-state!55,tpc thick},{tpc-state!38,tpc thick}}
% video twin of the same figure: \colorlet{tpc-state}{tpcvid-state} etc. inside a dark-ground scope
```

## 7. Interactive components

Controls (specimen `pkg4.html`): Inter 14 px labels; range sliders with `accent-color: var(--c-accent)`;
readouts right-aligned, tabular numerals, decimal comma, 4.5:1 or better; the headline readout in the
role colour of the quantity (probability = effect). Buttons: 1 px rule border, 3 px radius, no
shadows. Focus: 3 px ring in 45 % accent (`color-mix`), never removed. Depth toggle: circled + / -
in accent. Popups: paper-alt card, 1 px rule, 6/18 px shadow, open on hover and on keyboard focus.
Dark mode: `prefers-color-scheme` plus a `data-theme` override; it is the screen-dark token set, not a
filter. three.js scenes: ground `#090F14` (video mode) in every page mode; one hemisphere light
(0.6) plus one key directional light (0.8), no fog, no bloom; materials `MeshStandardMaterial` with
role albedo from `pkg4-tokens.glsl` (linear sRGB); axis gizmo lower-left, 48 px, ink-muted shafts,
labels x, y, z in STIX Two Math italic via `CSS2DRenderer`
(https://threejs.org/docs/#examples/en/renderers/CSS2DRenderer) so labels are real text in the book's
font; text never sits on the 3D canvas without an opaque paper-alt plate. Game HUD: a strip inside the
stage on `paper` (video), keys Inter 11 px caps tracked 8 %, values Inter SemiBold 22 px, progress bars
in the role colour of the scored physical quantity, a one-line instruction in ink-muted. Scores are
physical quantities (probability, fidelity, entropy), never points or streaks.

```css
/* excerpt of tokens/pkg4-tokens.css (generated) + the slider/readout component */
:root { --c-paper:#F7FBFC; --c-paper-alt:#EBF1F4; --c-ink:#151E26; --c-ink-muted:#575F66;
  --c-rule:#C5CBD0; --c-accent:#2E5B75; --c-link:#066082;
  --c-state:#003F60; --c-dynamics:#B12B35; --c-effect:#C68206; --c-environment:#CCCAC5; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --c-paper:#10161A; --c-paper-alt:#192025; --c-ink:#DFE6E9; --c-ink-muted:#A4ACB1;
  --c-rule:#3C4449; --c-accent:#72C5E1; --c-link:#6BCDE9;
  --c-state:#66CCF4; --c-dynamics:#F2716C; --c-effect:#FDCD5C; --c-environment:#484E52; } }
.mode-video { --c-paper:#090F14; --c-paper-alt:#131B20; --c-ink:#EBEFF2; --c-state:#63D4FE;
  --c-dynamics:#FD736F; --c-effect:#FFD167; --c-environment:#43494D; }
.ctl { display:grid; grid-template-columns:7.5rem 1fr 5.5rem; gap:.4rem .8rem; align-items:center;
  font:.875rem/1.2 var(--f-sans); }
.ctl output { font-variant-numeric:tabular-nums; text-align:right; }
input[type=range] { accent-color:var(--c-accent); width:100%; }
input[type=range]:focus-visible { outline:none; border-radius:8px;
  box-shadow:0 0 0 3px color-mix(in oklch, var(--c-accent) 45%, transparent); }
.readout .big { font:600 1.6rem var(--f-sans); color:var(--c-effect); }
```

## 8. Video style

16:9, master 3840 x 2160, delivery 1920 x 1080, 30 fps (60 fps for continuous camera moves). Ground:
video `paper` `#090F14`; all colours from the video mode. Camera: fixed labelled axes and a visible
scale in every 3D shot; moves only between named viewpoints at constant angular speed (design-research
REPORT section 5). Title card: kicker Inter SemiBold caps in accent, title STIX Two Text at 1/10 of frame
height, chapter tag in ink-muted; no logo animation. Lower third: opaque paper-alt plate, 6 px accent rule
at left (the P4 box of the book), Inter 500 at 1/24 of frame height, on screen 4 s. Equations:
typeset by XeLaTeX with the book preamble, exported as SVG with `dvisvgm`, recoloured per role from the
tokens; they fade in (300 ms) and never morph unless the morph is the derivation step. No on-screen
sentence duplicates narration (Mayer redundancy; TJO "READ or LISTEN"). Colour roles to 3D materials:
albedo = video-mode role hex in linear sRGB; emissive 0 except for detector clicks; environment surfaces
as 40 % grey with a procedural hatch texture. Toolchain: three.js offline frame capture via Playwright
(installed) piped to ffmpeg (installed), Motion Canvas (https://motioncanvas.io/docs) for 2D;
Blender only for volumetric orbitals. Stills: a dark-ground still is not a print figure. Every scene
renders a print twin in print-light mode from the same scene code (a mode switch, not an inversion);
the twin is what goes into the PDF. Cost: two renders and two visual checks per figure.

## 9. Bilingual rules

German leads. Quotes: German „…“ and English “…” via `csquotes` `\enquote` (`autostyle`), never TeX
ligature quotes; web `<q>` with `lang`-scoped CSS `quotes`. Decimal comma in German, point in English:
`siunitx` `locale=DE/UK`; web and games `Intl.NumberFormat(lang)`; video captions rendered per language.
Hyphenation: `babel` `ngerman` patterns; CSS `hyphens:auto` with `lang="de"` (the specimen hyphenates
"Wahr-scheinlichkeit" correctly in Chromium). Upright d, e, i per ISO 80000-2 and DIN 1338 via `\dd`,
`\eu`, `\iu` (MathML: `<mi mathvariant="normal">`); `math-style=ISO` makes capital Greek italic, as
ISO prescribes. Language tokens: TeX `\tpcifenglish{en}{de}` (existing); web, demos, games and video
read one string table `strings.{de,en}.json` keyed by permanent tags (T-06.3a), so a label never exists
in one medium only.

## 10. Coherence proof: the Born rule

- **Print** (`specimens/pkg4.pdf`): P4 box with 2 pt accent rule; `ρ` in state blue `#003F60`, `E` in
  amber; Abb. 1 shows `|ψ_2|²` in a box, walls hatched (environment), detector window as a 35 % amber area;
  caption states "die farbige Fläche ist der Detektor"; margin: "Live: tpc/6.3-born".
- **Web** (`specimens/pkg4.html`): the same text in STIX Two via MathML; the same figure as SVG with
  sliders n, a, b; readout `0,34` in amber, computed from the closed form (checked: n = 1, a = 0,
  b = 0.5 gives 0,50); Vertiefung 6.V1 expands in place.
- **Demo**: Bloch ball on the `#090F14` stage; state vector r in cyan `#63D4FE`, effect axis n in amber
  `#FFD167`; readout p = (1 + r·n)/2 (equal to tr(ρE) for ρ = (1 + r·σ)/2, E = (1 + n·σ)/2) in Inter.
- **Game HUD** ("Detektor-Wette"): dark strip, keys RUNDE / FENSTERBREITE / p (THEORIE) / KLICKS, p in
  amber, progress bar amber, expected clicks 3,4 of 10 stated as p times trials.
- **Video frame**: dark ground; the box scene of Abb. 1 in video colours; equation p = tr(ρE) top right in
  STIX Two Math with ρ cyan and E amber; lower third "Bornsche Regel · P4" on a paper-alt plate.
  Same symbols, colours by role and face in all five; only the ground changes between page and stage.

## 11. Costs and risks

Licences: 0 EUR (all OFL). Optional Whitney web licence to restore TJO's slide face: price
[UNVERIFIED]. Build: the token compiler exists as a 172-line Python script (`tokens/build_tokens.py`,
no dependencies) emitting `.sty`, `.css`, `.glsl`, JSON and measurements; add Typst and Motion Canvas
emitters (about one day). Web math: pre-render TeX to MathML server-side with Temml (https://temml.org/,
font-agnostic) instead of client-side MathJax 3 as in `../generalrelativity/web/template.html`.
Repo changes: `latex/tpc-style.sty` replaces `mtpro2` + `mathspec` with `unicode-math` + STIX Two, Times
LT Std with STIX Two Text, Whitney with Inter; `\definecolor` block replaced by the generated
`tpc-tokens.sty`; the 5-colour `tpccolors` cycle in `tpc-tikz-templates.sty` replaced by `tpcroles`;
22 TikZ figures re-mapped to roles; geometry changed to 108 + 50 mm. Risks: (1) STIX Two lacks bold math
(bold vectors need `\symbf` from the regular font's bold alphabet, which exists; bold operators do not);
(2) native MathML renders slightly differently across Chromium/Firefox/Safari; observed here in Chromium
149: MathML Core ignores `mathvariant` other than "normal", so bold symbols must be Unicode math
alphanumerics (Temml output must be checked for this); (3) dark-ground video stills cannot be reused as
print figures, so every 3D figure costs a print twin; (4) on screens the amber effect role at 3.06:1
is weak for thin strokes; keep strokes at least 0.8 pt / 2 px with an area tint; (5) a light page with a
dark stage is a strong contrast jump on screen-light pages (intended, but test with students).

## 12. Verdict

Choose PKG-4 if one maintainable system across PDF, web, games and video matters more than
Times + MathTime in print and if the videos should look like the 3Blue1Brown tradition the students
already know. It costs a print twin for every dark-ground scene and accepts STIX Two in place of
MathTime.
