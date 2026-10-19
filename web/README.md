<!-- ROLE: interface of the web work package: converter, site, demo harness, gates.
     Owner: web. Demo authors read sections 4-7; the coordinator reads section 8.
     UPDATE POLICY: change together with the code it describes; web/src/demo/types.ts is
     the authority for the demo interface. -->

# web/: converter, site, demos

One chapter source (`content/cNN-slug/{de,en}.tex`, the closed language of
`docs/authoring/CONTRACT.md`) becomes a chapter page per language. Demos are TypeScript
modules that draw; a harness gives them tokens, labels, a clock and a deterministic mode.

```
(cd web && npm ci)                                               # once; versions are pinned
bash scripts/course/build_course.sh --chapters c99 --all-editions   # print first: numbers
bash web/check.sh --chapters c99                                 # build + every gate
bash web/check.sh --chapters c99 --fast                          # without the browser gates
```

Output, all under `build/web/`:

| Path | What |
|---|---|
| `ir/<chapter>.<lang>.json` | intermediate tree (stable IDs, numbers, MathML) |
| `site/<lang>/<chapter>/index.html` | chapter page; `<chapter>` is the ID (`c11`) |
| `site/assets/` | `site.js`, `site.css`, `tokens/pkgN-<ground>.css`, `fonts/`, `figures/<variant>/`, `demos/<id>.js` |
| `standalone/<id>.<lang>.html` | one file per demo and language, everything inlined (copy in `site/standalone/`) |
| `corpus/index.html`, `corpus.json` | the formula corpus |
| `site.json` | what was built |
| `gen/` | generated inputs of the bundles (`labels.json`, `video.json`, `temml.css`) |

## 1. Layout

```
web/
  package.json, package-lock.json   exact versions; no CDN anywhere
  check.sh                          build + all gates (for ci.sh)
  run.sh                            one tool:  bash web/run.sh build|corpus|static|browser|capture|shots|test|fonts
  tools/convert/                    tex.ts (tokenizer) parse.ts (parser) mathconv.ts (mathematics)
                                    aux.ts (print numbers) figures.ts render.ts htmlscan.ts env.ts ir.ts
  tools/build/                      main.ts (the build) bundles.ts (Vite, standalone) gen.ts
  tools/corpus/                     formula corpus
  tools/checks/                     static.ts, browser.ts (+ inpage.js)
  tools/capture/                    frame capture -> PNG -> mp4
  tools/fonts/collect_fonts.py      open fonts -> assets/fonts
  src/site/                         page runtime and stylesheet
  src/demo/                         harness: types.ts harness.ts tokens.ts three.ts demo.css
  src/demos/<id>.ts                 one module per demo; the file name is the registration
  src/kernels/<name>.ts             pure functions, no DOM
  tests/                            vitest: kernels (golden), converter units
  assets/fonts/                     bundled open fonts, licences, manifest
```

The converter is TypeScript (run with `tsx`): Temml is a JavaScript library and is used
through its tree API, the IR types are shared with the renderer, and one toolchain serves
converter, bundles and tests.

## 2. The converter

`tools/convert/tex.ts` tokenizes (control words, control symbols, characters, blanks,
paragraph breaks; every token has file, line, column). `parse.ts` is a recursive parser for
exactly the constructs of the contract; the lists (environments, text macros, control
symbols, forbidden words, ID grammar, statuses) are read from
`docs/authoring/contract.json` at run time. Anything else stops the build:

```
content/c11-wasserstoff/de.tex:42:7: \footnote is forbidden in content files (contract section 10)
```

Nothing is passed through and nothing is dropped. What the converter enforces itself:
shape and place of every construct, ID grammar and chapter prefix, uniqueness of IDs,
labels on numbered units and displays, one `\claim` on theorem-like units, the five keys of
a depth block, no block inside anything, Fundament blocks last, `\zoomref` targets, depth of
transcluded and cited definitions, assets declared in `chapter.json` and used, title equal
to `chapter.json`. It does not repeat the evidence checks or the DE/EN prose checks of
`scripts/course/check_levels.py`.

**Numbers** are those of the print full edition: `aux.ts` reads
`build/course/tpc-<lang>-full/tpc-<lang>-full.aux` and refuses it when `build.json` beside
it is missing, records a failed build, lacks the chapter, or carries another sha256 for a
chapter file or style file than the file has now. Every label of the source must be in the
`.aux` and every label of the chapter in the `.aux` must be in the source. Nothing is
counted by the converter.

**Mathematics** (section 3), **figures**: each `tpcfigure` is compiled with
`latex/course/figure-standalone.tex` (the command in that file's header) and
`pdftocairo -svg`, once per language and design variant, cached by content hash; the alt
text is the caption as plain text. **Definitions**: `\tpcdef{Dn}` is rendered from
`registry/generated/definitions.web.json`; `\defref{Dn}` is a link with the definition in
a popup. A test chapter's `fixture/tpc-definitions.tex` (`\tpcdeclaredef` records) is read
for its stand-in definitions.

**Page**: Kern is the open text. Every `vertiefung` and `fundament` is a `<details>`
block, closed by default, whose summary shows label, title, lead (Wozu), dependency
(Voraussetzung) and the return line; Fundament blocks stand in a section at the end of the
page. Marking as in print and the same in every package: body size, full measure, a rule
in the left margin (one for Vertiefung, two hairlines for Fundament), run-in label, no
tint, no small type. `\zoomref` is a signpost in the margin column (inline on narrow
screens) with the lead as popup. A link into a closed block opens it. Evidence tags
(`hergeleitet`, `ohne Beweis`, `Beweis ausgelagert`) stand in the margin as in print.
Without JavaScript the page is complete: blocks open by hand, links are links, stills
stand in for demos.

Top bar: depth (Kern / Kern + Vertiefung / Alles), language (keeps the anchor, or the
place being read), and "Gestaltung": package 1-5 and ground, stored per reader. The same
through the URL: `?pkg=4&ground=dark&depth=alles`. Build defaults: `--pkg N --ground g`.
The stills of other variants exist only if built: `--figure-variants all` or a list such
as `pkg4-dark,pkg5-light`; otherwise the switcher keeps the stills of the build's variant.

A reference into a chapter that is not in the build prints the ID in brackets, as print
does in a partial build, and is listed as external in the build output.

## 3. Mathematics: Temml, as a gate

TeX is converted to MathML at build time by Temml 0.14.0. Registry macros are expanded by
the converter itself, with the expansions of `registry/generated/notation.web.json`; the
legacy structural macros that `registry/allowed-tex.json` lists are read from
`latex/tpc-macros.sty`. Temml therefore sees plain amsmath and none of its built-in macros
can shadow a course macro. In a content file a control word in mathematics must be a
registry macro, a listed legacy macro, or in `allowed-tex.json`; otherwise:

```
content/.../de.tex:6:30: \weirdop is not a registered macro (...)
```

Equation numbers are passed to Temml as `\tag{n}` with the print number; an `align` row
gets its HTML id on its `<mtr>`. Temml's stylesheet is bundled without its font rules; the
face is the token `--tpc-font-math`.

The gate has two halves. Static (`bash web/run.sh corpus --chapters ...`): every inline and
display formula of the chapters in both languages, every usage line of the notation
registry, every formula in a registry definition and eight named probes must convert with
no error node, no raw macro name, no `mathvariant` containing "bold", no literal colour.
Browser (`bash web/run.sh browser --only corpus`): the corpus page and the chapter pages
are rendered in headless Chromium; no `<merror>`, no `<math>` or token element of size
zero, the bundled maths font is the one in use, the gap after `tr` is a thin space before
a letter and none before a parenthesis, bold probes are single Unicode bold letters.
MathJax was not needed and is not installed; it remains the recorded fallback if a later
chapter's corpus fails here.

## 4. A demo

A demo is the file `web/src/demos/<id>.ts`; `<id>` is the ID of the contract
(`c11.demo.cloud`) and the file name is the registration. `chapter.json` declares it
(`kind` `demo` or `game`, `still` = figure ID) and the text places it with `\demo{id}`
inside that figure. The build fails if a declared demo has no module.

```ts
import type { DemoContext, DemoInstance, DemoMeta } from '../demo/types';
import { radial } from '../kernels/hydrogen';        // physics lives in a kernel

export const meta: DemoMeta = { animated: true, aspect: 16 / 9, surface: 'stage', webgl2: true };

export function mount(stage: HTMLElement, ctx: DemoContext): DemoInstance {
  // build the drawing inside `stage`; add controls with ctx.ui
  return {
    render(frame, time) { /* draw the state at time = frame / ctx.fps */ },
    resize(width, height) {},
    tokensChanged() {},
    destroy() {},
    info() { return {}; },
  };
}
```

`mount(stage, ctx)` receives (authority: `src/demo/types.ts`):

| `ctx.` | |
|---|---|
| `id`, `lang` | demo ID; `'de'` or `'en'` |
| `tokens` | `color(name)` CSS colour, `rgb(name)`, `linear(name)` (0..1), `stroke(name)` px, `dash(name)`, `font(role)`, `pkg`, `ground`. Names as in `design/README.md` without `tpc-`: `tokens.color('stage-state')`. Read at draw time or in `tokensChanged`: the reader can switch package and ground. |
| `params` | strings from `data-params` of the embedding element and, on a standalone page or with `?demo=<id>`, from the URL query |
| `text(de, en)` | the string of the page language (for words that are not registry symbols) |
| `symbol(symbolId)` | `{ name, unicode, mathml }` of a registry symbol in the page language, e.g. `ctx.symbol('sym.trace')`; an unknown ID throws |
| `ui` | `slider({label, labelHtml?, min, max, step, value, format?, primary?, onInput})`, `button(label, onClick)`, `readout(label, labelHtml?)`. Native controls: keyboard and screen reader work without further code. `primary: true` marks the slider that the arrow keys move while the stage has focus. |
| `reducedMotion` | the reader asked for reduced motion |
| `deterministic`, `seed`, `random()` | deterministic mode; `random()` is the only randomness a demo may use (seeded, replays exactly) |
| `fps` | frames per second of the clock (`tokens.json`, `video.fps`) |
| `invalidate()` | ask for a redraw after a state change that did not come through `ui` |
| `announce(text)` | say a result to assistive technology |

Rules.

1. **No physics in the demo file.** Formulas are in `src/kernels/<name>.ts`: pure
   functions, no DOM, no clock, no graphics import, with stated conventions and a golden
   test (section 6). The demo calls the kernel and draws.
2. **`render(frame, time)` is a function of its arguments, the demo's own state and the
   tokens.** No `Date`, no `performance.now`, no `requestAnimationFrame`, no
   `Math.random`. The harness owns the clock: nothing moves until the reader presses play
   (or uses a control); the clock stops when the demo is off screen.
3. **Colours and faces come from `ctx.tokens`.** No literal colour or font name in
   `web/src` (`python3 design/lint_content.py`). 2D drawings use plate roles and
   `surface: 'plate'`; 3D scenes use `stage-*` roles and the default `surface: 'stage'`.
4. **Words**: symbols by `ctx.symbol(id)`, other words by `ctx.text(de, en)`.
5. **Every number a demo shows** is its input or computed by the kernel from it.
6. **The still must carry the content.** Without JavaScript or WebGL 2 the figure stays;
   a 3D demo creates its renderer with `createRenderer(stage, ctx)` from
   `src/demo/three.ts`, which throws `DemoUnsupported` when WebGL 2 is missing.
7. Several demos on one page: keep all state inside `mount`; no global IDs or listeners.

Deterministic mode: `standalone/<id>.<lang>.html?seed=1&frame=0` (or a chapter page with
`?demo=<id>&frame=0`). No clock runs; `window.__tpcDemo.renderFrame(n)` draws frame n,
`window.__tpcDemo.info()` returns what `info()` of the instance reports.
`&stage=1920x1080` fixes the stage size and hides the controls; `&ground=dark` selects the
ground. Further query parameters arrive in `ctx.params`.

## 5. Standalone pages and video frames

`build/web/standalone/<id>.<lang>.html` contains the demo bundle, the token CSS of the
build's package for both grounds, the label and maths fonts as data URIs, and nothing
else; it is tested from `file://` with the network cut.

```
bash web/run.sh capture --demo c11.demo.cloud --frames 150 [--gl swiftshader|gl-egl|vulkan] [--ground dark] [--size 1920x1080]
```

writes `build/web/capture/<id>-<gl>/frames/frame-00000.png ...`, `<id>.mp4` and
`capture.json` (renderer string, flags, measured timings). Headless WebGL 2 is shown to
work in `web/CAPTURE-NOTES.md`.

## 6. Golden tests

A kernel is tested against values written by the reference implementation (Julia).

```
web/tests/golden/<kernel>.json            { "kernel", "reference": {"implementation", "script"},
                                            "tolerance": {"abs"?, "rel"?}, "cases": [ {..., "expected": ...} ] }
web/tests/golden/reference/<kernel>.jl    writes that file (c99 only; course kernels: numerics/)
web/tests/kernels/<kernel>.test.ts        loadGolden(name), expectGolden(got, expected, tolerance, what)
```

`expectGolden` (in `tests/golden.ts`) compares numbers and nested arrays within
`max(abs, rel * |expected|)` and fails with a message starting "golden mismatch". A golden
file without a stated tolerance is refused. The tolerance is stated in the golden file by
whoever writes the reference, with its reason. Run: `bash web/run.sh test`. Example:
`src/kernels/shear.ts`, `tests/golden/shear.json`, `tests/kernels/shear.test.ts`.

## 7. Fonts

`python3 web/tools/fonts/collect_fonts.py` copies the open faces of `fonts=open` from the
TeX tree into `web/assets/fonts/` as WOFF2, each family only if its SIL OFL text is found
on the machine, with the licence beside it and `manifest.json` (source path, sha256).
Bundled: STIX Two Text, STIX Two Math, Inter, Libertinus Serif, Sans, Mono, Math.
Not bundled: Iosevka (installed without a licence file; the mono stack falls through to
the system face). No commercial face is looked for. `--check` is a gate.

## 8. Gates

`bash web/check.sh --chapters LIST [--fast]` runs all of them. One command each:

| Gate | Command | Fails when |
|---|---|---|
| contract | `bash web/run.sh build --parse-only --chapters LIST` | a construct outside the contract, with file:line |
| numbering | `bash web/run.sh build --chapters LIST` | print build missing, failed or stale; a label without a number |
| corpus | `bash web/run.sh corpus --chapters LIST` | a formula does not convert, or uses an unregistered macro |
| ids | `bash web/run.sh static --only ids --chapters LIST` | DE and EN pages differ in their IDs or their order |
| links | `bash web/run.sh static --only links` | an internal link or local resource does not resolve |
| external | `bash web/run.sh static --only external` | a script, stylesheet, font or other resource from another host |
| demos | `bash web/run.sh static --only demos --chapters LIST` | a demo of `chapter.json` has no module |
| golden, units | `bash web/run.sh test` | a kernel differs from its golden values; converter unit tests |
| fonts | `bash web/run.sh fonts --check` | a bundled font without licence record |
| literals | `python3 design/lint_content.py web/src` | a literal colour or font name |
| c7 | `bash web/run.sh browser --only c7 --chapters LIST` | with all blocks closed a visible link (not a signpost) points into closed content; block count differs from the source |
| nav, corpus, demos, standalone | `bash web/run.sh browser --only nav,corpus,demos,standalone` | see the header of `tools/checks/browser.ts` |

Red corpus: `python3 scripts/check_red.py --gate web` (`tests/red/web/`, 14 cases).
The browser gates need Playwright's Chromium: `(cd web && npx playwright install chromium)`.
