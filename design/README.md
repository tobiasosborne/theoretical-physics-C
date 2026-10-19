<!-- ROLE: interface of the design-token pipeline for print style, web, demos and video.
     Owner: tokens work package (Phase 0a). UPDATE POLICY: change it in the same edit as
     design/tokens/, design/build_tokens.py or latex/tpc-design.sty; names listed here are stable. -->

# Design tokens: the interface

One source of type and colour. Edit `design/tokens/*.tokens.json` (DTCG, colours in OKLCH),
then run the compiler. Never edit `design/build/`. Content (`content/`, `web/src/`) uses
the names below and nothing else: no hex, no `\definecolor`, no font name.

```
python3 design/build_tokens.py --all       # 5 packages x 2 grounds -> design/build/pkgN-<ground>/
python3 design/build_tokens.py --check     # gate: measurements + generated files up to date
python3 design/build_tokens.py --table     # measured values as a Markdown table
python3 design/lint_content.py [paths]     # gate: no literals in content/ and web/src/
bash design/specimen/build_specimens.sh    # 10 one-page specimens -> build/design-specimens/
python3 scripts/check_red.py --gate tokens # planted failures are caught
```

Each `design/build/pkgN-<ground>/` holds `tpc-tokens.sty`, `tokens.css`, `tokens.glsl`,
`tokens.json`. `--tokens-dir`, `--base`, `--out-dir`, `--pkg`, `--ground`, `--measure`
point the compiler at other inputs (used by `tests/red/tokens/`).

## Flags

| Flag | Values | Meaning |
|---|---|---|
| `pkg` | `1`..`5` | design package. PKG-2 carries `production_ready: false` (a warning in every build). |
| `ground` | `light`, `dark` | `dark` darkens page chrome and the stage; the plate stays light. |
| `math` | `stix`, `mtpro2` | `stix` = the package's OpenType maths face via unicode-math. `mtpro2` = MathTime Pro 2; valid only with `fonts=local`, used only by PKG-1 (other packages: warning, OpenType face). |
| `fonts` | `open`, `local` | `open` = open-source faces only. `local` = commercial faces where installed; a missing face falls back to the open face with a warning. |

## Three surfaces

| Surface | Token | What is drawn on it | Roles to use |
|---|---|---|---|
| ground | `ground`, `ground-alt` | text, chrome | `ink`, `ink-muted`, `rule`, `accent`, `link`, `highlight`, `depth-*` |
| plate | `plate` | every 2D figure (TikZ, SVG). Light on both grounds. | `plate-ink`, `plate-muted`, `plate-rule`, `state`, `effect`, `dynamics`, `bath`, `bath-edge`, `q1`..`q6`, `grey-1`..`grey-5` |
| stage | `stage` | 3D demos and video frames | `stage-ink`, `stage-rule`, `stage-state`, `stage-effect`, `stage-dynamics`, `stage-bath`, `stage-bath-edge`, `stage-q1`..`stage-q6` |

With `ground=light` the stage is the plate and every `stage-*` equals its plate role, so a
still is a print figure. With `ground=dark` the stage is dark and the `stage-*` roles are
re-stepped for it (PKG-5 excepted: its stage stays light by design). Draw 2D figures with
plate roles on the plate, on either ground. Never put a plate role on the dark ground.

Rules: colour carries physics only (the physics roles and the ladder are never chrome);
`bath` is a fill and is always bounded or hatched in `bath-edge`; `effect` is dashed and
`dynamics` is heavier, so no role depends on hue alone.

## Colour names

Same names in all targets. TeX: `tpc-<name>` (xcolor). CSS: `--tpc-<name>`. GLSL:
`TPC_<NAME>` with `-` as `_` (linear sRGB `vec3`). JSON: `color["<name>"]` with `hex`,
`oklch`, `linear`.

| Name | Use |
|---|---|
| `ground`, `ground-alt` | page background; quiet tint for boxes, code, table stripes |
| `ink`, `ink-muted` | running text; captions and margin notes |
| `rule` | hairlines and borders on the ground |
| `accent` | headings, run-in labels, box rules (package identity; equals `ink` in PKG-5) |
| `link` | hyperlinks; underline them on screen |
| `highlight` | Merksatz and key-equation tint |
| `depth-k`, `depth-v`, `depth-f` | Kern (no marker, equals `ink`), Vertiefung, Fundament: margin rule and run-in label |
| `plate`, `plate-ink`, `plate-muted`, `plate-rule` | figure surface, its labels and axes, secondary labels, grid |
| `state`, `effect`, `dynamics`, `bath`, `bath-edge` | physics: state/preparation, effect/measurement, dynamics/energy, environment/bath (fill) and its boundary |
| `q1`..`q6` | quantum-number ladder, 1 = most ink |
| `grey-1`..`grey-5` | neutral greys on the plate, 1 lightest |
| `stage`, `stage-ink`, `stage-rule`, `stage-state`, `stage-effect`, `stage-dynamics`, `stage-bath`, `stage-bath-edge`, `stage-q1`..`stage-q6` | the same roles on the stage |

`tokens.json` also has `print` (values that differ in the `.sty` on the light ground: text
is 100 % K on unprinted paper) and `video` (`width`, `height`, `fps`, `ground`, `ink`,
`rule`, `state`, `effect`, `dynamics`, `bath`, `ladder[6]`, `frame`, `frame_ink`, `accent`,
`stills_are_print_figures`).

## LaTeX: `latex/tpc-design.sty`

```latex
\usepackage[pkg=1,ground=light,math=stix,fonts=open]{tpc-design}   % XeLaTeX only
```

Option values may be macros. The loader finds `pkgN-<ground>/tpc-tokens.sty` under
`design/build/` up to three directories above the working directory, or under `root=<dir>`,
or on `TEXINPUTS` (add `design/build`). It loads xcolor (`[table]`), amsmath, amssymb,
mathrsfs and unicode-math (or, for `math=mtpro2`, tcolorbox, mtpro2 and mathspec exactly as
`tpc-style.sty` does). Order with `tpc-style.sty`:

| Wanted | Works |
|---|---|
| `math=stix` | `tpc-design` then `tpc-style` (it then takes its `cmfonts` branch automatically), or `\usepackage[cmfonts]{tpc-style}` then `tpc-design`. `tpc-style` without `cmfonts` first is an error with that advice. |
| `math=mtpro2,fonts=local` | either order |

| Provided | |
|---|---|
| colours | `tpc-<name>` for every name above |
| font commands | `\tpcfontbody` `\tpcfontsmall` `\tpcfontlabel` `\tpcfonthi` `\tpcfonthii` `\tpcfonthiii` `\tpcfontnumeral` `\tpcfontmono` `\tpcfontdepth` (size, leading, family, weight, shape; use inside a group). `\rmfamily`, `\sffamily`, `\ttfamily` and the maths font are the package's faces. |
| size macros | `\tpcbodysize` `\tpcbodyleading` |
| page lengths | `\tpcmeasure` `\tpcmargininner` `\tpcmargingap` `\tpcmarginwidth` `\tpcmargintop` `\tpcmarginbottom` `\tpcfigurewidth` (text + gap + margin) `\tpcplatepad` |
| spacing lengths | `\tpcspacexs` `\tpcspaces` `\tpcspacem` `\tpcspacel` `\tpcspacexl` `\tpcspacexxl` (0.25, 0.5, 1, 1.5, 2, 3 body leadings) |
| stroke lengths | `\tpcstrokehair` `\tpcstrokethin` `\tpcstrokeregular` `\tpcstrokestate` `\tpcstrokeeffect` `\tpcstrokedynamics` `\tpcstrokebath` `\tpcstrokedepthv` `\tpcstrokedepthf` `\tpcstrokebox` |
| dash macros | `\tpcdasheffect` `\tpcdashbath` (TikZ: `dash pattern/.expanded=\tpcdasheffect`) |
| commands | `\tpcapplypage` (preamble; sets the package's page grid and body size, off by default); `\tpcplate{...}` (argument on the plate in plate ink) |
| state | `\tpcdesignpkg` `\tpcdesignground` `\tpcdesignfonts` `\tpcdesignmath` (the engine actually used), `\iftpcdark`, `\tpctoktitle`, `\tpctokproductionready` |
| TikZ styles (if TikZ is loaded) | `tpc plate`, `tpc axis`, `tpc grid`, `tpc leader`, `tpc label`, `tpc state`, `tpc effect`, `tpc dynamics`, `tpc bath`, `tpc bath hatch`, `tpc bath edge`, `tpc fill state|effect|dynamics`, `tpc tint state|effect|dynamics`, `tpc q1`..`tpc q6`, `tpc fill q1`..`q6`, and `tpc stage`, `tpc stage label`, `tpc stage state|effect|dynamics|bath`, `tpc stage bath hatch|edge`, `tpc stage q1`..`q6` |

On `ground=dark` the loader sets `\pagecolor{tpc-ground}` and the default text colour to
`tpc-ink`; anything that hard-codes black (TikZ default draw colour, tcolorbox `coltext`)
must be given a token. With hyperref loaded, link colours become `tpc-link`. For PKG-2 with
`fonts=local`, define `\tpccompanionmathpath` (directory with trailing slash) before loading.

## CSS: `tokens.css`

Colours sit on `:root:not([data-tpc-ground="<other>"]), [data-tpc-ground="<this>"]`, so a
page may import one build, or both and switch with the `data-tpc-ground` attribute. Other
properties on `:root`:

| Property | |
|---|---|
| `--tpc-font-serif|sans|mono|math` | open font stacks (the web never uses a commercial face) |
| `--tpc-size-<role>`, `--tpc-leading-<role>`, `--tpc-family-<role>`, `--tpc-weight-<role>`, `--tpc-style-<role>`, `--tpc-caps-<role>` | roles `body small label h1 h2 h3 numeral mono depth-label` |
| `--tpc-space-xs|s|m|l|xl|xxl` | rem |
| `--tpc-measure-text|gap|margin` | text column, gutter, margin column |
| `--tpc-stroke-<name>` | px; names as the stroke lengths above (`hair thin regular state effect dynamics bath depth-v depth-f box`) |
| `--tpc-dash-effect`, `--tpc-dash-bath` | for `stroke-dasharray` |

## Depth marking (the same in every package)

Body size, a rule in the outer margin over the block's length, a run-in label, no tint, no
small type. A package varies only: rule colour (`depth-v`, `depth-f`), rule weight
(`\tpcstrokedepthv`, `\tpcstrokedepthf`), label face and case (`\tpcfontdepth`, which
`--check` holds at body size). Vertiefung: single rule. Fundament: double rule.

## Font stacks

The package decides its faces. `fonts=open` replaces every commercial face by the declared
fallback. Web and CI are always `fonts=open`, `math=stix`. D1's pair (MathTime print, STIX
Two web) is PKG-1's resolution, not a global rule.

| pkg | medium, mode | serif | sans (labels) | mono | maths |
|---|---|---|---|---|---|
| 1 | print, `local` + `mtpro2` | Times LT Std ‡ | Whitney ‡ | Iosevka | MathTime Pro 2 ‡ |
| 1 | print, `local` + `stix` | Times LT Std ‡ | Whitney ‡ | Iosevka | STIX Two Math ×0.955 |
| 1 | print `open`; web/CI | STIX Two Text (print ×0.955) | Inter | Iosevka | STIX Two Math |
| 2 | print, `local` | Baskerville 10 Pro ‡ | Whitney ‡ | Iosevka | Companion Math ‡ (not production-ready) |
| 2 | print `open`; web/CI | Libertinus Serif | Inter | Iosevka | Libertinus Math |
| 3 | all | STIX Two Text | STIX Two Text | Iosevka | STIX Two Math |
| 4 | all | STIX Two Text | Inter | Iosevka | STIX Two Math |
| 5 | all | Libertinus Serif | Libertinus Sans | Libertinus Mono | Libertinus Math |

‡ commercial or private; local print only; never in the repository, the site or CI.
Open faces are all OFL. On this machine STIX Two, Libertinus and Inter come from the TeX
tree (loaded by file name), Iosevka from fontconfig. Whitney has no U+2192: take arrows
from the maths font.

## Measurements (`--check`)

Every threshold carries its status. **Quoted**: taken from a standard, with the locus.
**Unvalidated choice**: a number somebody picked; no measurement or study in this repository
backs it. An unvalidated threshold keeps the palettes apart from each other consistently; it
is not evidence that a palette is legible, in greyscale or to a colour-blind reader, and must
not be cited as such. `--table` prints the same statuses; `--check` prints them in one line.

| Check | Threshold | Status | Applies to |
|---|---|---|---|
| text contrast | >= 4.5:1 | quoted: WCAG 2.2, Success Criterion 1.4.3 Contrast (Minimum), Level AA, "a contrast ratio of at least 4.5:1", <https://www.w3.org/TR/WCAG22/#contrast-minimum> (read 2026-10-11; the standard is not on disk). The criterion exempts large text; applying 4.5 to every text role is a project choice | `ink`, `ink-muted`, `link`, `accent`, `depth-v`, `depth-f` on `ground`; `ink` and `link` on `ground-alt`; `ink` on `highlight`; `plate-ink`, `plate-muted` on `plate`; `stage-ink` on `stage` |
| stroke contrast | >= 3.0:1 | quoted: WCAG 2.2, Success Criterion 1.4.11 Non-text Contrast, Level AA, "a contrast ratio of at least 3:1 against adjacent color(s)" for "Parts of graphics required to understand the content", <https://www.w3.org/TR/WCAG22/#non-text-contrast> (read 2026-10-11; not on disk). No exemption for thick strokes: a project choice | `state`, `effect`, `dynamics`, `bath-edge`, `q1`..`q6` on `plate`; the `stage-*` twins on `stage` |
| greyscale gap | >= 0.15 OKLCH L, pairwise | unvalidated choice: proposed by the research lanes (PLAN S8) without validation | `state`, `effect`, `dynamics`, `bath`; and the stage twins |
| ladder step | >= 0.10 L, monotone | unvalidated choice of the tokens author | `q1`..`q6`; stage twins |
| CVD | min OKLab distance >= 0.10, deutan and protan, simulated with the matrices of Machado, Oliveira and Fernandes (2009) | unvalidated choice of the tokens author; the paper is not on disk and is the source of the simulation matrices only, not of the threshold | the four data roles; stage twins |
| depth label | equals body size and leading | an equality, no threshold (PLAN section 14 item 3) | `type.depth-label` |
| staleness | generated files byte-identical to a fresh build | an equality, no threshold | `design/build/` |

Run on the light ground twice (screen values and print values) and on the dark ground. A
failure prints package, ground, pair and value and exits 1. A waiver is an entry in the
package file under `$extensions["org.tpc"].waivers`
(`{"id", "check", "pair", "ground", "reason"}`) and is printed as a warning on every run.
There are none at present.
