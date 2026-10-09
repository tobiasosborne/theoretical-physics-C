<!-- ROLE: design package PKG-5 (design-packages-B lane, Claude Opus, 2026-10-09), per PACKAGE-TEMPLATE.md.
     Specimens: specimens/pkg5.{tex,pdf,html,-1.png}, pkg5-web-{light,dark}.png; scene prototype specimens/scene/.
     UPDATE POLICY: edit the OKLCH source in tokens/build_tokens.py or the scene in scene_2pz.py, regenerate. -->

# PKG-5 "Explorable textbook: one scene, three views"

## 1. Name and philosophy

**Explorable textbook.** Every figure is a frozen frame of a live object. A figure is stored once, as a
scene graph (camera, objects with physics roles, labels in both languages, parameters, data source);
the print figure, the web demo and the video are three renderers of that graph. A video still taken at
a named camera preset *is* a print figure, because both come from the same scene state, on the same light
ground, with the same fonts. Colour is reserved for physics: page chrome (headings, links, rules, boxes,
controls) is monochrome, so any colour a student sees means state, effect, dynamics or environment.

Lineage: Ciechanowski's essays, where each figure is the running physical model with one or two reader
controls (https://ciechanow.ski/archives/); Bret Victor's explorable explanations and the ladder of
abstraction (https://worrydream.com/ExplorableExplanations/); Penrose, diagrams computed from
mathematical statements plus a reusable style (https://penrose.cs.cmu.edu/siggraph20); Living Papers,
one source to PDF and interactive web (https://idl.uw.edu/living-papers-paper); Our World in Data's
Grapher, where a chart is a JSON configuration and ships its data (https://ourworldindata.org/owid-grapher);
gwern.net's monochrome chrome (https://gwern.net/design); Needham's captions that carry the argument
(*Visual Complex Analysis*, 25th anniversary edition, OUP 2023). It refuses: dark-ground video (it
would break still = figure); perspective cameras in any frame that carries a measurement; legends
(direct labels only); colour on chrome; any figure drawn by hand that could be computed.

## 2. Math-font decision

A variant of **option (a), one OpenType MATH family everywhere**, with **Libertinus** in place of STIX
Two: Libertinus Serif, Libertinus Math, Libertinus Sans and Libertinus Mono (OFL,
https://github.com/alerque/libertinus; installed in the TeX tree `libertinus-fonts`). Reason: the scene
graph puts words and symbols into the same frame at small sizes in three renderers; a superfamily whose
sans, serif and math were drawn together keeps labels, captions, HUD and equations one voice. The
design-research specimen D judged Libertinus "coherent, lighter, good on screen; not Times"
(`design-research/specimens/def.png`). Consequence: exact print-screen match (the same OTF files in
XeLaTeX `unicode-math`, in the browser through native MathML, and in video through SVG from XeLaTeX;
Playwright confirmed all six Libertinus faces loaded). Cost: TJO's Times preference is not met; no bold
math weight (Vieth Table 2, https://tug.org/TUGboat/tb44-2/tb137vieth-otmath.pdf); the rules below do
not depend on the face, so PKG-5 with STIX Two (PKG-5b) is a token change.

## 3. Typography

Print (A4, XeLaTeX, KOMA):

| role | face | size / leading |
|---|---|---|
| body | Libertinus Serif Regular | 11/14.4 pt (measured `\baselineskip` 14.42 pt) |
| math | Libertinus Math, `math-style=ISO` | follows body |
| Vertiefung blocks | Libertinus Serif | 9.5/12.5 pt |
| footnote, margin notes | Libertinus Serif, ink-muted | 8.5/11 pt |
| captions | Libertinus Serif: message sentence italic, details roman | 9/11.5 pt |
| figure labels, HUD, controls | Libertinus Sans (words), Libertinus Math (symbols) | 8 pt print |
| theorem labels | Libertinus Serif small caps (real `smcp`) | body size |
| chapter title / kicker | Libertinus Serif 20/24 pt / Libertinus Sans 8.5 pt | |
| mono | Libertinus Mono | 8.5 pt |

Page: inner 24 mm, text 112 mm, gap 6 mm, margin column 44 mm, outer 24 mm; top 22, bottom 26 mm.
Measured 70-75 characters per full body line. The full-width band (text + gap + margin = 162 mm) is the
figure band: a 16:9 frame in it is 162 x 91 mm, the same aspect as the video. Margin notes by
`\marginpar`; each figure carries a margin "Live" marker with its scene id.

Web (fonts as WOFF2 from https://github.com/alerque/libertinus/releases, self-hosted):
```css
--f-text: "Libertinus Serif", "Libertinus Math", serif; --f-math: "Libertinus Math", math;
--f-sans: "Libertinus Sans", sans-serif; --f-mono: "Libertinus Mono", monospace;
--fs-body: 1.25rem; --lh: 1.5; --fs-small: .95rem; --fs-cap: .875rem; --fs-h1: 2.5rem;
--measure: 64ch; --gutter: 14rem; --gap: 2rem; --hair: 1px;
```
Libertinus has a smaller x-height than STIX Two, so the web body is 20 px, not 19. Games and video:
Libertinus Sans for HUD values and lower thirds (lining tabular numerals), Libertinus Serif for title cards.

## 4. Colour

Source and pipeline as in PKG-4 (`tokens/build_tokens.py` -> `tokens/pkg5.tokens.json` -> `.sty`, `.css`,
`.glsl`, `pkg5-measurements.md`). New role **plate**: the ground of every figure, demo, HUD and video.
It stays light in every mode; in screen-dark only the page chrome goes dark around light plates.

| role | print-light | screen-light | screen-dark | video |
|---|---|---|---|---|
| paper | `#FFFFFF` 1.000 0 0 | `#FCFCF9` 0.990 0.003 90 | `#181714` 0.205 0.006 90 | `#FAF9F6` 0.982 0.004 90 |
| plate | `#FFFFFF` | `#FCFCF9` | `#F8F7F4` 0.975 0.004 90 | `#FAF9F6` |
| ink | `#161616` 0.200 0 0 | `#1B1A18` 0.220 0.004 90 | `#E3E1DD` 0.910 0.006 90 | `#161616` |
| ink-muted | `#5F5D5A` 0.480 0.006 90 | `#62605D` | `#A6A4A0` 0.720 0.006 90 | `#5F5D5A` |
| rule | `#C5C4C1` 0.820 0.004 90 | `#CBCAC8` | `#494844` 0.400 0.006 90 | `#C5C4C1` |
| accent | = ink (monochrome chrome) | = ink | = ink | = ink |
| link | `#302E28` 0.300 0.010 90, underlined | same | `#D3D1CA` 0.860 0.010 90 | same |
| **state** | `#014069` 0.360 0.090 245 | same in every mode (on plate) | same | same |
| **effect** | `#017A58` 0.515 0.108 165 | same | same | same |
| **dynamics** | `#D6781C` 0.665 0.150 58 | same | same | same |
| **environment** | `#CCCAC6` 0.840 0.006 90, hatched | same | same | same |

Because figures always sit on a light plate, the data roles need one value only: the colour of a
probability cloud is literally the same hex on paper, on screen, in a game and in a video. Physics roles:
**state/preparation** = deep blue (TJO's dk2 hue family, h 245); **effect/measurement/detector** = green
(h 165, near TJO's accent4/accent5 greens); **dynamics/energy/time evolution** = orange; **environment/
bath/forbidden** = warm grey, hatched. Ladders: tints 100/75/55/38 % of state (L 0.36/0.52/0.66/0.77 for
n = 1..4) plus labels. Measured: data-role L 0.36 / 0.51 / 0.66 / 0.84, min dL 0.150 (meets the
greyscale budget exactly), min dE_OK 0.200 normal, 0.196 deutan, 0.106 protan (effect vs dynamics; mitigated
by dash patterns). WCAG 2.2 on white: body ink 18.1:1, link 13.6:1 (identified by underline, not hue),
state 10.8:1, effect 5.35:1, dynamics 3.20:1 (2.99:1 on the screen-dark plate: at the 3:1 non-text
threshold; never used for text). In screen-dark: ink 13.7:1, link 11.7:1 on `#181714`.

## 5. Layout grid

```
|24|<----------- 112 text ----------->|6|<-- 44 margin -->|24|
    16  Das Wasserstoffatom (Sans 8.5)
    Wo ist das Elektron? (20 pt)
    body ......................................  margin note (serif 8.5)
    ------ hairline ------------------------------
    POSTULAT P4 (BORNSCHE REGEL). run-in, no fill
    ------ hairline ------------------------------
    [ figure band 162 mm: scene frame, 16:9 or cropped to content ]
    caption: italic message sentence. roman details   > Live F-16.2
    Vertiefung 16.V1 (9.5 pt) ................. |      (V) T-16.2b
```

Web: the same named grid as PKG-4 (`[body] 64ch [gap] 2rem [gutter] 14rem`, `.wide` = body+gutter).
A demo is a `.plate` spanning body+gutter: a frame-tag bar on top (scene id, camera preset, slice; on
the right "Rahmen = Abb. 16.2 im PDF" when the live state equals the print state, otherwise "Live-Rahmen
(nicht im PDF)"), the frame, then controls on the same plate. A game is a full-bleed plate at 16:9
with its HUD inside. Below 900 px the gutter folds into the body (390 px checked: no overflow; display
equations scroll horizontally inside their box).

Depth tracks per `layered-docs/REPORT.md` (Kern / Vertiefung / Fundament; "zoom" reserved for the physics
axis): Kern unmarked. Vertiefung: 9.5 pt, a 0.4 pt ink hairline 3 mm outside the text block, small-caps
run-in label "Vertiefung 16.V1", a circled V and the permanent tag in the margin, own equation counter,
closing "Zurück:" line. Web: `<details>` with the same hairline on the outer side, circled V, small-caps
label and tag; closed by default, print opens all. Every figure additionally carries the "Live" marker:
in the PDF a hyperlink to the demo at that exact scene state; on paper the tag F-16.2 is the URL path.

## 6. Figure style

The visual grammar of the scene graph (prototype: `specimens/scene/scene_2pz.py`, one scene emitted as
TikZ for print and SVG for the web from the same projected coordinates; `scene_2pz.json` is the graph).

- **Cameras**: four presets only. V0 front (azimuth 0, elevation 0), V1 standard oblique (azimuth 35,
  elevation 20), V2 top (elevation 90), V3 along the object's symmetry axis. Orthographic in every frame
  that can become a figure; perspective only in free-orbit web mode, with a "snap to V1" control. z up,
  right-handed, quantisation axis = z.
- **Axis gizmo**: lower left, screen-space size (12 mm print, 48 px web, 1/20 of frame height in video),
  0.5 pt ink arrows, italic x, y, z in the math font at 1.25 x arrow length. Present in every 3D frame.
- **Colour roles with redundant encoding**: state = 1.0 pt solid line plus 18 % tint fill; effect = 0.8 pt
  solid boundary plus 30 % tint and boundary ticks; dynamics = 0.8 pt dashed (3/1.5 pt) and arrows for
  flow; environment = 45 degree hatching 0.4 pt ink-muted, never a hue. Planes that belong to an object
  (a nodal plane belongs to the state) take the object's role, dashed outline, 6 % tint.
- **Labels**: screen-space, constant size (never scaled by depth), direct, outside the object, leader
  0.3 pt to the nearest silhouette point; preferred side right, then above; each label stores `{de, en}`.
- **Line weights**: axes 0.5-0.6 pt, data 0.8-1.0 pt, leaders 0.3 pt, gizmo 0.5 pt, grids omitted.
- **Colour for quantities**: quantum number = state tint ladder + label; temperature = sequential
  Crameri batlow (https://doi.org/10.5281/zenodo.1243862) with a labelled bar; complex phase = cyclic
  romaO with a phase wheel; time = small multiples or ghosted earlier frames at 30/60 % opacity.
- **Captions** (Doumont): first sentence italic, the message ("Die Fläche halber Maximaldichte umschließt
  nur 18 % der Wahrscheinlichkeit"); then camera preset, scale (1 a0 = 6 mm), slice, and the statement
  that the geometry is computed. Every figure id equals its scene id and demo URL.

TikZ preamble (role styles consistent with `latex/tpc-tikz-templates.sty`; geometry comes from the emitter):

```latex
\input{tokens/pkg5-tokens.sty}
\usetikzlibrary{patterns,arrows.meta}
\tikzset{
  tpc thin/.style={line width=0.4pt}, tpc std/.style={line width=0.8pt},
  tpc thick/.style={line width=1.0pt}, tpc axis/.style={line width=0.5pt,draw=tpc-ink},
  role state/.style={draw=tpc-state,tpc thick,fill=tpc-state,fill opacity=0.18,draw opacity=1},
  role state plane/.style={draw=tpc-state,line width=0.5pt,dash pattern=on 2pt off 1.5pt,
                           fill=tpc-state,fill opacity=0.06},
  role effect/.style={draw=tpc-effect,tpc std,fill=tpc-effect,fill opacity=0.30},
  role dynamics/.style={draw=tpc-dynamics,tpc std,dash pattern=on 3pt off 1.5pt,-{Stealth[length=4pt]}},
  role environment/.style={pattern=north east lines,pattern color=tpc-ink-muted},
  gizmo/.style={tpc axis,-{Stealth[length=3pt]}},
  leader/.style={draw=tpc-ink,line width=0.3pt},
  scene label/.style={font=\sffamily\footnotesize,inner sep=1pt,anchor=west},
}
% A frame is never drawn by hand: scene_<id>.py writes scene_<id>.tikz using only these styles,
% so the same object has the same look in every figure of the book.
```

## 7. Interactive components

Controls (specimen `pkg5.html`): Libertinus Sans 14 px labels; sliders `accent-color: ink` (black thumb,
the chrome is monochrome); readouts lining tabular numerals with decimal comma; the headline readout in
the role colour of the quantity (`p(V)` of a state region = state blue). Buttons: 1 px ink outline, 3 px
radius, transparent fill. Focus: double ring (2 px plate, then 2 px ink), works on any ground. The
"Rahmen einfrieren" button serialises the current scene state to JSON; committed to the repo, that JSON
becomes a print figure through the TikZ emitter, so "freeze" is the authoring tool, not a gimmick. Dark
mode: chrome to dark tokens; plates stay light (`#F8F7F4`); no inverted figures. three.js: background =
plate; `OrthographicCamera` at the preset; one hemisphere light (0.8) and one directional (0.5), no
shadows (they imply a floor that is not in the physics); `MeshLambertMaterial` in role colours plus 1 px
ink silhouettes (`EdgesGeometry`) so 3D frames read as line art; orbitals as ray-marched density with
opacity proportional to |psi|^2 in the state hue (transfer function printed on the frame tag) and the
iso-contour as a line overlay; labels and gizmo letters as HTML through `CSS2DRenderer` with MathML.
Game HUD: on the same plate, 1 px ink frame, keys in Libertinus Sans all-small-caps, values Libertinus
Serif Semibold, a meter with ink outline and a 2 px ink target tick, fill in the role colour.

```css
:root { --c-paper:#FCFCF9; --c-plate:#FCFCF9; --c-ink:#1B1A18; --c-ink-muted:#62605D;
  --c-rule:#CBCAC8; --c-link:#302E28; --c-state:#014069; --c-effect:#017A58;
  --c-dynamics:#D6781C; --c-environment:#CCCAC6; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --c-paper:#181714; --c-plate:#F8F7F4; --c-ink:#E3E1DD; --c-ink-muted:#A6A4A0;
  --c-rule:#494844; --c-link:#D3D1CA; } }          /* data roles unchanged: they live on plates */
.plate { background:var(--c-plate); color:#161616; padding:.75rem 1rem 1rem; border-radius:2px;
  --c-ink:#161616; --c-ink-muted:#5E5D59; --c-rule:#CDCCC8; }   /* light island in any mode */
.frame-tag { display:flex; justify-content:space-between; font:var(--fs-cap)/1.3 var(--f-sans);
  color:var(--c-ink-muted); border-bottom:var(--hair) solid var(--c-rule); }
.ctl { display:grid; grid-template-columns:9rem 1fr 4.5rem; gap:.5rem .8rem; align-items:center;
  font:var(--fs-cap)/1.2 var(--f-sans); }
.ctl output { font-variant-numeric:tabular-nums lining-nums; text-align:right; }
input[type=range] { accent-color:var(--c-ink); width:100%; }
input[type=range]:focus-visible, button:focus-visible { outline:none; border-radius:3px;
  box-shadow:0 0 0 2px var(--c-plate), 0 0 0 4px var(--c-ink); }
.ro .big { font:600 1.5rem var(--f-text); color:var(--c-state); }
```

## 8. Video style

16:9, master 3840 x 2160, delivery 1920 x 1080, 30 fps. Ground: video plate `#FAF9F6` (L 0.982, not pure
white, to limit glare on a projector); stills exported for print knock the ground out to transparent.
Cameras: only V0-V3; a move is a transition between presets at constant angular speed with 0.5 s ease
in/out; no hand-held drift, no dolly zooms. Title card: Libertinus Serif 400 at 1/12 frame height on the
plate, a 1 px ink hairline, scene id in Libertinus Sans ink-muted. Lower thirds: Libertinus Sans on the
plate above a 1 px ink rule, 4 s. Equations: XeLaTeX with the book preamble -> SVG (`dvisvgm`), placed in
screen space; symbols take role colours only where the figure does. Narration carries sentences; the
frame carries labels (Mayer redundancy). 3D materials: albedo = the single role hex (it never changes
with mode). Toolchain: the three.js page of the demo, driven frame by frame by Playwright (installed)
and piped to ffmpeg (installed); Blender optional for volumetric orbitals, reading the same scene JSON.
Still reuse: any frame at a preset is a print figure by construction. Line work is re-emitted as vector
TikZ from the same scene state; volumetrics are rendered at 600 dpi and placed under the vector
overlay. A CI check compares the scene JSON of each print figure with the video's keyframe at the same
preset, so drift between media is a failing test.

## 9. Bilingual rules

As PKG-4: `csquotes` „…“ / “…”; `siunitx` `locale=DE/UK`, `Intl.NumberFormat` in demos, games and HUDs;
`ngerman` hyphenation and CSS `hyphens:auto` with `lang`; upright d, e, i (ISO 80000-2, DIN 1338) via
`\dd`, `\eu`, `\iu` and `<mi mathvariant="normal">`; `math-style=ISO`. Specific to PKG-5: every label and
caption lives in the scene graph as `{de, en}`; the TikZ emitter, the web demo and the video read the
same strings, so a figure cannot exist in one language only. Theorem labels use real small caps (`smcp`,
present in Libertinus Serif).

## 10. Coherence proof: hydrogen 2p_z

- **Print** (`specimens/pkg5.pdf`): ψ_210 and |ψ_210|² displayed in Libertinus Math; P4 in hairline rules
  in its position form p(V) = tr(ρ E_V) = ∫_V |ψ|² d³x; Abb. 16.2: slice y = 0, camera V1, the half-maximum
  contour (computed: it exists for |ϑ| <= 45 degrees, from r = 0.761 to 4.156 a0 on the axis) as blue line
  plus 18 % tint, nodal plane dashed in the state colour, gizmo lower left; caption message "nur 18 %"
  (integrated: 0.1772, normalisation check 1.0000); margin "Live F-16.2".
- **Web** (`specimens/pkg5.html`): the same frame from the same coordinates on a light plate; slider f
  recomputes the contour and P(inside) in JavaScript (f = 0.25 gives 0,409, f = 0.10 gives 0,655, equal to
  the Python integration); the frame tag flips to "Live-Rahmen (nicht im PDF)" when f leaves 0.50.
- **Demo** (three.js): the same scene with the full surface of revolution, orbit allowed, "snap to V1"
  returns to the print frame; density cloud in state blue on the plate.
- **Game HUD** ("Fang das Elektron"): plate, keys in small caps; p(V) 0,409 in state blue; target tick at
  0,500 on an ink-outlined meter; the solution f ≈ 0.185 is a computed number, not a tuned one.
- **Video frame**: the same plate and camera V1; the camera moves V1 -> V3 (looking down the z axis), where the
  outline is a circle, showing the rotational symmetry; it returns to V1 and the end frame is Abb. 16.2 exactly.

## 11. Costs and risks

Licences: 0 EUR (OFL). Build: the scene-graph schema plus three emitters (TikZ, three.js loader, video
driver) is the main new tool; the prototype emitter is 129 lines of Python for one scene; a general
version with silhouettes of surfaces of revolution, hidden-line handling and label collision avoidance is
an estimated 2-4 weeks [estimate]. Repo changes: as PKG-4 for fonts and colours (`tpc-style.sty`:
`unicode-math` + Libertinus; tokens `.sty`); the 22 existing TikZ figures stay hand-written TikZ at first and
migrate to scene files only when they gain a demo; geometry to 112 + 44 mm. Risks: (1) not Times; TJO
may reject the face (PKG-5b with STIX Two is the fallback); (2) orthographic frames look flatter than
perspective renders and less "cinematic" than dark-ground video; (3) light-ground video on a projector in a
dark hall glares (mitigated by the 0.982 plate, still worse than dark); (4) Libertinus Math coverage is
smaller than STIX Two or New Computer Modern (Vieth 2023); every symbol in the notation database must be
checked for a glyph (no missing-glyph warnings in the specimens); (5) MathML Core in Chromium 149 ignored
`mathvariant="bold"` in the specimen (rendered italic x), so bold symbols must be Unicode math
alphanumerics (𝐱), which a server-side converter must emit; (6) a hidden-line-correct TikZ emitter for
general 3D scenes is real engineering; volumetric figures will be raster in print.

## 12. Verdict

Choose PKG-5 if "every figure is live and every live state can be printed" is the organising promise of
the course and one colour per physical role must be literally identical on paper, screen and video. It
costs a scene-graph toolchain and gives up Times, dark-ground cinema and the slide identity's colour on
chrome.
