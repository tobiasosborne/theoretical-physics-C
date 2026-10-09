# Technical architecture review

Reviewed 2026-10-09. The requested files were read in order. No files were modified. Estimates below are planning estimates, marked `[UNVERIFIED]`; they are not measured implementation results.

**Recommendation:** retain XeLaTeX for the canonical print edition. Extend authoring with a small, explicit semantic contract that generates chapter HTML and video-script exports. Use Julia for numerical reference implementations and verified datasets, TypeScript for browser interactions, and three.js for rendering. Validate this architecture on a bilingual hydrogen chapter before migrating the course.

## Evidence and current limitations

The repository already contains valuable infrastructure: 22 bilingual lecture pairs, shared TikZ figures, archived originals, reconstructed transcripts, and five local CI stages. These are documented in [HANDOFF.md](/home/tobias/Projects/theoretical-physics-C/HANDOFF.md) and implemented in [ci.sh](/home/tobias/Projects/theoretical-physics-C/ci.sh).

The following executables were verified on this machine:

| Tool | Observed installation |
|---|---|
| XeLaTeX, LuaLaTeX | Both available on PATH |
| Pandoc | 3.1.3 |
| Typst | 0.14.2 |
| Julia | 1.12.5 |
| Node | Installation under the Node 24.11.1 directory |
| Bun, Python 3 | Available on PATH |
| ffmpeg | 6.1.1 |
| fmd | 0.4.3 |
| Manim, Blender | No executable found on PATH; installations elsewhere `[UNVERIFIED]` |
| Playwright | Prior use documented in GR; current browser installation and GPU operation `[UNVERIFIED]` |

The parity checker was run: **all 22 lecture pairs passed, with two warnings**. Full CI and document builds were not run because they generate files.

Passing parity does not establish physical correctness. Two concrete defects remain in the inspected hydrogen source:

- [vl16.tex:85](/home/tobias/Projects/theoretical-physics-C/latex/lectures/de/vl16.tex:85) gives the quadratic term of \(L_2^s(x)\) as \(-x^2/2\). The standard generalized Laguerre polynomial has \(+x^2/2\). This follows from the finite-sum definition in [DLMF 18.5.12](https://dlmf.nist.gov/18.5#E12).
- [vl16.tex:94](/home/tobias/Projects/theoretical-physics-C/latex/lectures/de/vl16.tex:94) gives the \(2p,\ m=\pm1\) coefficient as \(1/(8\sqrt{2\pi})\). Direct integration gives norm squared \(1/2\). The normalized magnitude is \(1/(8\sqrt{\pi})\), with phase signs fixed separately by the chosen spherical-harmonic convention. See [DLMF 14.30](https://dlmf.nist.gov/14.30).

These defects should become the first numerical red fixtures. They demonstrate why “the German and English equations agree” and “the equations are correct” require separate gates.

## A. Single-source authoring

### Define the source contract first

“One source of truth” should mean one versioned content graph, rather than one physical file. German and English prose are separate authored translations within that graph. Scientific equations, definitions, asset identities, and numerical parameters should be shared.

Every substantial block should have:

| Field | Purpose |
|---|---|
| `id` | Permanent identity across languages and output targets |
| `kind` | Explanation, definition, theorem, proof, example, exercise, solution |
| `tracks` | Membership in course routes, such as Lehramt and advanced |
| `depth` | Explanatory detail, such as overview, working derivation, rigorous treatment |
| `scale` | GPT, single system, many particles, Fock space, statistical mechanics, thermodynamics |
| `prerequisites` | Explicit dependencies for navigation and route validation |
| `claims`, `definitions`, `equations` | Links to scientific authorities |
| `assets`, `narration` | Figure, demo, game, and video references |

**Physical scale and explanatory depth must be separate.** A rigorous thermodynamic argument can have high detail while remaining macroscopic. The brief uses “zoom” in both senses.

The canonical PDF must contain every scientific explanation and derivation. Interactive assets need static figures and sufficient explanations in print. A link to a demo cannot substitute for required content.

HTML should contain the full chapter, with details collapsed according to the selected route. Following a link into a collapsed block should open its ancestors. Equation and theorem identities must remain stable when visibility changes.

Video scripts should select and arrange blocks by identity. Narration can be authored separately within the same graph, but must reference shared claims, equations, and assets.

### Comparison

Ratings below are architectural judgments for this project.

| Authoring system | Print typography | German/English | Track, depth, and target rendering |
|---|---|---|---|
| **XeLaTeX/LuaLaTeX + Pandoc** | Best preservation of the existing Times LT Std + MTPro2 edition. Full control over mathematical layout and pagination. | Existing working bilingual arrangement; shared figures already switch language. | Custom semantic environments can become print markings, HTML disclosures, and script selections. Requires a bounded authoring grammar. |
| **Typst** | Strong programmable typography. Times text is feasible; faithful MathTime depends on an accepted OpenType math font. Existing TikZ can remain externally generated assets. | Language settings select hyphenation patterns; translations still require shared identities. | Functions and metadata can express tracks and depth. Native HTML export remains experimental. |
| **MyST / Jupyter Book** | PDF export through LaTeX or Typst. A custom LaTeX template can preserve preferred typography; default templates do not establish fidelity. | UTF-8 prose is straightforward. Translation parity and language-specific template behavior need project conventions. | Structured directives and AST transforms fit semantic blocks. Custom rendering extension points require a feasibility test. |
| **Quarto** | PDF through LaTeX, with font and template configuration. Legacy MTPro2 requires more than setting `mathfont`. | Document-language configuration supports separate editions. Shared block identities and translation checking remain project responsibilities. | Conditional content is built in. Track navigation, canonical inclusion rules, and script export need filters. |
| **Custom Markdown + LaTeX math, including fmd** | Markdown generated into the existing LaTeX template can retain high fidelity. Fidelity of fmd’s direct PDF output to Times + MathTime is `[UNVERIFIED]`. | Plain text is convenient for translation. Local fmd documentation describes German hyphenation support. | Explicit fenced blocks provide a good semantic surface, but the project owns their transformations and validation. |
| **TypeScript-first: MDX/Astro/Svelte, generating LaTeX** | Potentially good after substantial work on a document exporter. Framework rendering alone supplies no canonical LaTeX book. | Translation dictionaries and localized routes are feasible. Prose should remain distinct from executable component logic. | Excellent interaction composition. Print and script projections require a restricted component vocabulary with defined static equivalents. |

Supporting documentation: [Pandoc architecture and conversion limits](https://pandoc.org/MANUAL.html), [Typst mathematics](https://typst.app/docs/reference/math/), [Typst language and hyphenation](https://typst.app/docs/reference/text/text/), [MyST PDF export](https://mystmd.org/guide/creating-pdf-documents), [MyST plugins](https://mystmd.org/guide/plugins), [Quarto PDF](https://quarto.org/docs/output-formats/pdf-basics.html), [Quarto conditional content](https://quarto.org/docs/authoring/conditional.html), [fmd](https://github.com/Dicklesworthstone/franken_markdown), [MDX](https://mdxjs.com/docs/what-is-mdx/), [Astro MDX](https://docs.astro.build/en/guides/integrations-guide/mdx/), [SvelteKit static generation](https://svelte.dev/docs/kit/adapter-static).

| System | Maintenance by LLM agents | CI checkability | Principal risk |
|---|---|---|---|
| LaTeX + Pandoc | Familiar mathematical source; safe if content avoids arbitrary macro programming. | Existing parity plus block manifests, conversion fixtures, and output coverage. | Unrestricted TeX exceeds Pandoc’s document model; unsupported content can disappear. |
| Typst | Functions and structured values are inspectable; mathematical syntax must be migrated. | Compiler diagnostics, metadata queries, render fixtures, shared identity checks. | Font project and experimental HTML become simultaneous dependencies. |
| MyST / Jupyter Book | Readable directives and structured documents. | AST inspection, export manifests, build diagnostics, browser tests. | Framework/theme integration and incomplete custom renderer extension points. |
| Quarto | Readable Markdown with established build configuration. | Pandoc filters and document inventories provide useful hooks. | Accumulating format conditionals, execution engines, and template exceptions. |
| Custom Markdown/fmd | Simple authoring; custom compiler ownership is substantial. | Excellent if every transformation has a contract and fixtures. | Rebuilding publishing machinery and accepting unsupported math silently. |
| TypeScript-first | Typed components help; mixing prose with application code increases editing hazards. | Strong component tests; document completeness needs a separate extractor. | Arbitrary runtime JSX cannot reliably be converted into a comprehensive book. |

Jupyter Book 2 is a distribution of the MyST document engine. It should not be evaluated as the older Sphinx-based Jupyter Book 1 pipeline. [Jupyter Book documentation](https://jupyterbook.org/stable/)

### Font and engine implications

The current style explicitly loads `mathspec`. That package targets XeLaTeX, so switching the executable to LuaLaTeX is not a drop-in upgrade. Treat LuaLaTeX as a separately tested print backend. [Current style](/home/tobias/Projects/theoretical-physics-C/latex/tpc-style.sty:75), [mathspec documentation](https://ctan.org/pkg/mathspec)

Typst requires an OpenType mathematics font. TJO’s `mathtime-otf` project is therefore relevant, but its inspected PRD rejects the archived implementation as untrustworthy and starts with a new provenance-driven source model. Production readiness of the rebuilt font is `[UNVERIFIED]`. It should not be on the teaching project’s critical path. [Local MathTime PRD](/tmp/claude-1000/-home-tobias-Projects-theoretical-physics-C/235a3d3d-d7d4-4e21-a935-01a7e791a128/scratchpad/gh/mathtime-otf/PRD.md)

Typst’s current documentation still describes HTML export as incomplete and experimental. Newer documentation also describes features beyond the installed 0.14.2 release; these must not be assumed available locally. [Typst HTML export](https://typst.app/docs/reference/html/)

The installed `fmd` reports 0.4.3, while the inspected local README describes 0.4.2. Its HTML emitter converts supported mathematics to MathML and falls back to TeX delimiters when parsing fails. The precise source-to-installed-binary correspondence and course-wide macro coverage are `[UNVERIFIED]`. [Local emitter](/home/tobias/Projects/franken_markdown/src/html.rs:285)

### Recommendation and fallback

**Primary:** constrained semantic LaTeX, XeLaTeX print, Pandoc-assisted HTML, and a common intermediate content graph.

The semantic layer should resolve permitted includes, block metadata, equation references, and asset references before target rendering. It must reject unsupported commands and unconsumed raw blocks. It must not attempt to interpret arbitrary TeX.

Keep mathematical expressions in shared fragments addressed by stable IDs. German and English prose should reference those fragments rather than duplicate them. Translatable prose inside mathematics needs explicit fields; removing whole `\text{...}` arguments is too coarse.

The GR pipeline is a prototype to characterize, not a compiler to copy unchanged:

- `preprocess.py` contains bounded-depth macro substitutions and diagram placeholders.
- `postprocess.py` maintains captions independently from LaTeX and infers assets from directory contents.
- Missing widgets become visible placeholders instead of build failures.
- `gr-filter.lua` embeds generated raw HTML.
- `template.html` loads a floating MathJax major version from a CDN.

Replace these behaviors with explicit asset records, structured transformations, pinned dependencies, and failures on missing content. [GR preprocessing](/home/tobias/Projects/generalrelativity/web/preprocess.py), [postprocessing](/home/tobias/Projects/generalrelativity/web/postprocess.py), [filter](/home/tobias/Projects/generalrelativity/web/gr-filter.lua)

**Fallback:** Pandoc Markdown with the same block schema and LaTeX mathematics, generating LaTeX into the retained print template.

Select this fallback if the pilot shows that enforcing a sufficiently expressive LaTeX subset requires excessive parser work. It changes the authoring surface while preserving the numerical, asset, and gate architecture. Quarto is a reasonable wrapper for this fallback if it demonstrably reduces build code.

Do not maintain independently edited LaTeX and Markdown editions.

## B. Web stack for demos and games

### Rendering and application structure

Use **three.js with WebGL 2 initially**. Three.js and WebGPU are different layers: three.js can also provide a WebGPU renderer. Its current `WebGPURenderer` documents fallback to WebGL 2. This provides a migration route without requiring a native WebGPU engine now. [WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html), [WebGPURenderer](https://threejs.org/docs/pages/WebGPURenderer.html)

A native WebGPU implementation adds responsibility for scene management, resource lifetimes, shaders, device limits, and recovery. Adopt it only for a demonstrated compute or rendering bottleneck. WebGPU capability must be detected at runtime; the API also has secure-context requirements. [Browser API documentation](https://developer.mozilla.org/en-US/docs/Web/API/GPU)

Use [TypeScript](https://www.typescriptlang.org/tsconfig/strict.html) in strict mode and [Vite](https://vite.dev/guide/build) for development and production bundling. Run `tsc --noEmit` separately: Vite transpiles TypeScript without type checking. [Vite TypeScript behavior](https://vite.dev/guide/features#typescript)

Separate four responsibilities:

```text
verified kernel/data -> domain state -> presentation state -> renderer
                                      -> game rules
                                      -> video timeline
```

The domain layer must have no DOM, wall clock, or graphics imports. Use small pure modules with explicit complex-number, unit, and coordinate conventions.

For state:

- Use explicit state records and pure reducers for controls and games.
- Keep camera orientation separate from physical state.
- Use fixed simulation steps or analytic time evaluation.
- Record random seeds and actions for replay.
- Make reset restore all scientific parameters.
- Serialize shareable parameters into a versioned URL or JSON record.
- Add a UI framework only when control complexity justifies it.

Games must use the same scientific kernels as demonstrations. A state-discrimination game, for example, should generate outcomes from the specified preparation and POVM, with deterministic replay for tests.

### Mathematics

| Renderer | Fit | Costs and limits |
|---|---|---|
| **MathJax 3** | Lowest migration risk from GR; TeX macros, equation handling, and accessibility facilities. | Startup work, font assets, and asynchronous typesetting need deliberate handling. |
| **KaTeX** | Suitable for build-time rendering and frequent small formula updates. | Its supported command set must be tested against the course corpus. Preferred print fonts are a separate issue. |
| **Temml / native MathML** | Useful for static mathematics with browser-native layout and build-time conversion. | Browser, font, macro, and accessibility behavior need a tested support matrix. |
| **fmd MathML** | Worth evaluating because it is locally available. | Course macro coverage and failure reporting need characterization. |

Sources: [MathJax 3](https://docs.mathjax.org/en/v3.2/), [KaTeX supported functions](https://katex.org/docs/supported.html), [Temml](https://temml.org/), [Temml administration](https://temml.org/docs/en/administration).

Start the pilot with pinned, locally packaged MathJax. Compare Temml/fmd against every inline and display expression before selecting a replacement. MathJax 4 is now current; using version 3 is a migration decision that requires an explicit pin, not an assumption that it is latest. [MathJax version notice](https://docs.mathjax.org/en/v3.2/)

Generate macro definitions from the notation registry. Generate equation numbering and links from the content graph.

Wait for initial typesetting, then serialize dynamic typesetting operations through `typesetPromise`. The GR template’s check for an existing `MathJax` object does not establish startup completion. [MathJax asynchronous typesetting](https://docs.mathjax.org/en/v3.2/web/typeset.html)

### Site and offline artifacts

Generate two distributions from the same build:

| Distribution | Purpose |
|---|---|
| Static site | Chapter navigation, search, shared assets, smaller repeated downloads |
| Standalone demo/game HTML | Download, classroom use, email/LMS distribution, operation without network access |

A standalone artifact must inline its JavaScript, CSS, required fonts, numerical data, and optional WASM. It must avoid unresolved imports, runtime CDN loads, sibling-file fetches, and lazy chunks.

Vite’s normal output is not automatically one HTML file. Add a packaging step and test the result through `file://` with external network access blocked. Site caching and a service worker can support offline revisits; they do not replace a directly downloadable artifact.

Use one scoped widget implementation for both distributions. Several widgets in a chapter must not share global element IDs or uncontrolled event listeners. Pause hidden demos and dispose of GPU resources.

A \(128^3\) scalar Float32 field occupies 8 MiB before metadata. Base64 alone expands that to approximately 10.7 MiB. Such assets favor shared site downloads or individual demo files over duplicating several volumes inside every chapter.

### Browser kernels

| Approach | Recommended use |
|---|---|
| Hand-written TypeScript | Small analytic kernels, low-dimensional linear algebra, probability calculations, and modest simulations |
| Rust → WASM | Larger pure kernels, repeated array operations, or established numerical code |
| C/C++ → WASM | Existing tested libraries worth preserving |
| Julia → WASM | Isolated experiment; suitability of the required package stack `[UNVERIFIED]` |
| Julia-generated data | Default for expensive, reproducible fields and trajectories |

Rust and C have documented browser interfaces through [wasm-bindgen](https://rustwasm.github.io/docs/wasm-bindgen/) and [Emscripten](https://emscripten.org/docs/porting/connecting_cpp_and_javascript/Interacting-with-code.html). Julia-to-WASM tooling exists, but it should be evaluated on the actual kernel rather than assumed to support the GR simulation environment. [WebAssemblyCompiler.jl](https://github.com/tshort/WebAssemblyCompiler.jl)

WASM does not establish correctness. Native and browser builds still need independent comparison with Julia reference values.

### Testing demonstrations

Each demo must expose:

- A deterministic `setState` and `renderAt(time)` interface.
- Scientific diagnostics independent of rendered pixels.
- Supported parameter ranges and rejected invalid inputs.
- Model, kernel, and dataset identities.

Use [Playwright](https://playwright.dev/docs/test-snapshots) to test controls, replay, resizing, multiple instances, collapsed containers, offline loading, and graphics failure recovery.

Screenshots detect presentation regressions. Numerical assertions establish scientific behavior. GPU screenshot comparisons need tolerances and a pinned reference environment; exact pixels across devices are not a reasonable acceptance condition.

## C. Video pipeline

| Tool | Suitable work | Connection to verified data | Main cost |
|---|---|---|---|
| [Manim Community](https://docs.manim.community/en/stable/) | Equations, constructions, coordinate plots, staged derivations | Load verified curves, matrices, and trajectories; animate their presentation | Additional Python/rendering stack; mathematical typography needs configuration |
| [Blender](https://docs.blender.org/api/main/index.html) with Python | Volume renders, lighting, detailed camera work | Import generated fields or geometry; script scene construction | Installation, adapter validation, render time, and more presentation machinery |
| three.js + Chromium + [ffmpeg](https://ffmpeg.org/ffmpeg.html) | Videos derived directly from browser demonstrations | Reuse the tested scene and data loader | Browser/GPU setup and deterministic frame capture |
| [Remotion](https://www.remotion.dev/docs/three) | Narration, titles, captions, timed compositions, embedded 3D | Wrap shared assets or scenes in frame-based compositions | React integration and applicable licensing conditions |
| [Motion Canvas](https://motioncanvas.io/docs/) | TypeScript vector animation and narration synchronization | Load verified data and animate diagrams | Separate animation model; specialized 3D integration `[UNVERIFIED]` |

Blender’s documentation describes background Python execution and VDB import. Exact compatibility of a proposed Julia-to-VDB adapter is `[UNVERIFIED]` and requires a round-trip test. [Background scripting](https://developer.blender.org/docs/handbook/building_blender/python_module/), [VDB import](https://docs.blender.org/manual/en/5.1/modeling/geometry_nodes/input/import/vdb.html)

ffmpeg is installed. Manim and Blender were not found on PATH. Remotion and Motion Canvas installation status is `[UNVERIFIED]`. Remotion’s license must be evaluated for the actual institutional use. [Remotion license](https://www.remotion.dev/license)

**Start with three.js frame rendering plus ffmpeg.** It provides the shortest path from a tested demonstration to a video.

Render frame \(k\) at explicit time \(k/f\). Do not record real-time playback and accept dropped frames. Wait for data, fonts, mathematics, and shader readiness before capture. Use a lossless image sequence as the intermediate artifact.

A storyboard record should reference:

```text
scene ID; content IDs; dataset hashes; camera keyframes;
physical parameters; annotation IDs; narration IDs; duration
```

Camera interpolation may be artistic. Interpolation of physical states must have a scientific definition.

The same storyboard should produce narration text, a shot list, subtitle exports, and a render manifest. Narration requires language-specific timing; German and English need semantic parity rather than identical duration.

Add Blender when volume-render quality justifies it. Add Manim or Motion Canvas when derivation animation becomes a recurring requirement. Keep them as renderers of verified inputs.

## D. Numerical ground truth

### Layered design

| Layer | Responsibility |
|---|---|
| Sources and conventions | Hashed local references; verified quotations; notation translations; units; phases; domains |
| Mathematical model | Hamiltonian, boundary conditions, analytic expressions, assumptions, expected identities |
| Julia reference | High-precision evaluation, independent checks, quadrature, solver convergence |
| Distribution | Versioned datasets, browser fixtures, plotting tables, manifests |
| Renderers | TikZ/pgfplots, browser scenes, video frames; documented visual mappings |

Julia is already used by GR to generate `.dat` files consumed by figures. The inspected chart script also derives tangent vectors from the surface Jacobian. Preserve this pattern and add explicit tests and manifests. [GR simulation](/home/tobias/Projects/generalrelativity/scripts/sim_lec03_charts.jl)

Use Julia’s [Test](https://docs.julialang.org/en/v1/stdlib/Test/) framework. Separate pure numerical modules from generation scripts that write files.

### Hydrogen acceptance example

Specify the model explicitly: the nonrelativistic Coulomb Hamiltonian, nucleus charge \(Z\), chosen mass convention, and named operator domain. Grounding its self-adjointness requires the local Simon/Reed–Simon source requested by the brief; that source remains unavailable according to CONTEXT.

The browser must evaluate or consume the normalized wavefunction
\[
\psi_{n\ell m}=R_{n\ell}Y_\ell^m,
\qquad
\rho=|\psi_{n\ell m}|^2.
\]
The radial implementation must use the normalized generalized-Laguerre expression, with its notation translated explicitly from the reference. [DLMF Coulomb solutions](https://dlmf.nist.gov/18.39#ii)

Required tests:

| Contract | Check |
|---|---|
| Normalization | Integrate \(|R|^2r^2\,dr\) and \(|Y|^2\,d\Omega\) independently |
| Low states | Compare general routines against independent closed forms |
| Spectrum | Verify energy values and declared \(Z\)/mass scaling |
| Nodes | Check radial and angular zeros |
| Eigenfunction | Check differential-equation residual away from singular points |
| Orthogonality | Integrate representative distinct states |
| Conventions | Test negative \(m\), complex phase, axes, and real-orbital combinations |
| Sampling | Compare generated clouds with reference region probabilities |
| Rendering field | Compare uploaded texture values with the verified CPU field |

A Cartesian cloud uses density \(|\psi|^2\) with respect to \(dx\,dy\,dz\). A radial probability plot uses \(r^2|R|^2\). Confusing them must fail a dedicated fixture.

Real \(p_x,p_y,p_z\) orbitals require declared linear combinations of complex \(m\) states. Coherent superpositions require interference terms; mixtures require weighted densities. They cannot share an implementation that merely blends pictures.

Exact analytic wavefunctions still require finite numerical evaluation and finite rendering. The contract should prohibit invented shapes while bounding floating-point, truncation, interpolation, and sampling errors. It should not claim exact pixels.

For a cloud:

- Sample the verified density, or render its verified scalar field.
- Record domain bounds and omitted probability mass.
- Preserve nodes.
- Label opacity and color mappings.
- Treat phase as a separate displayed quantity.
- State the enclosed probability for an isosurface; do not present it as the whole cloud.
- Avoid per-orbital rescaling unless the comparison explicitly uses that convention.

### Formats and manifests

| Artifact | Proposed format |
|---|---|
| Models, units, parameters, conventions | Versioned JSON |
| Plot curves and trajectories | UTF-8 whitespace tables with named columns and 17 significant digits |
| Small browser fixtures | JSON; high-precision reference values as decimal strings |
| Large fields | Little-endian Float32/Float64 binary with JSON sidecar |
| Complex fields | Separate real/imaginary arrays with explicit ordering |
| Meshes and camera paths | Geometry arrays or GLB plus scientific metadata |
| Storyboards | JSON or YAML referencing content and asset IDs |
| Provenance and release records | JSON manifests plus SHA-256 file lists |

Binary sidecars must specify dimensions, axis order, stride, coordinate bounds, sample locations, units, normalization, and scalar type. Reject incorrect byte lengths and nonfinite values.

Generate pgfplots tables from the same reference dataset, rather than independently recomputing curves in TikZ. [PGFPlots](https://ctan.org/pkg/pgfplots)

Every dataset manifest should bind:

```text
schema version; model ID; formula IDs; source hashes;
generator hash; Julia environment; parameters; seed;
precision; tolerances; domain; error estimates; output hashes
```

A hash identifies bytes. Tests and review establish what those bytes mean.

### Proposed layout

```text
content/
  chapters/<chapter>/de.tex en.tex
  equations/<id>.tex
  graph.json
registry/
  notation.json definitions.json models.json
  figures.json demos.json games.json
sources/<key>/
  manifest.sha256 source files
evidence/
  CLAIMS.md PROVENANCE.md CONVENTIONS.md DEAD-ROUTES.md
numerics/
  Project.toml Manifest.toml
  src/ test/ generate/
datasets/<model>/<dataset>/
  manifest.json values.dat field.f32le field.json
print/
  templates/ figures/
web/
  src/kernels/ src/demos/ src/games/ src/components/
video/
  storyboards/ renderers/
scripts/
tests/
  corpus/ parity/ cross-language/ browser/ layout/
build/
  ir/ pdf/ site/ standalone/ scripts/ video/
releases/<release>/
  manifest.json checks.json
```

Generated output is never hand-edited. Compact golden datasets belong in version control. Large releases need durable storage and hashes; ordinary builds should consume verified datasets, with regeneration as an explicit operation.

### Cross-implementation comparison

Test Julia and TypeScript at:

- Analytically distinguished points.
- Origin and axis limits.
- Nodes and near-nodes.
- Tail regions.
- Parameter boundaries.
- A reproducible randomized corpus.

Compare complex amplitudes before taking their squared magnitude. Density-only comparisons can miss phase defects.

Use mixed tolerances:
\[
|x_{\rm TS}-x_{\rm ref}|
\leq \varepsilon_{\rm abs}+\varepsilon_{\rm rel}|x_{\rm ref}|.
\]

Provisional dimensionless thresholds of \(10^{-12}\) absolute and \(10^{-10}\) relative for small Float64 analytic kernels are `[UNVERIFIED]`. Set final thresholds from conditioning, precision studies, and supported parameter ranges. GPU fields need a separate quantization and interpolation budget.

Independent Julia and TypeScript implementations are useful. Two implementations generated from the same erroneous expression are a consistency check, not independent ground truth.

## E. CI and gates

Keep one local entry point, `ci.sh`, with machine-readable results and checked/expected counts. Adopt rk’s red-fixture, provenance, independent-review, and bounded-process practices. Its zero-runtime-dependency rule belongs to rk itself and does not fit a graphics application. [rk culture](/home/tobias/Projects/rk/CLAUDE.md), [rk-light protocol](/home/tobias/Projects/rk/skills/rk-light/SKILL.md)

| Stage | Required acceptance |
|---|---|
| Structure | Unique IDs; resolved dependencies; valid chapter and route graph; required translations |
| Provenance | Registered local sources, valid hashes, checked quotations, fresh review receipts |
| Parity | Matching scientific structure and identities across languages |
| Enrichment/migration | Every legacy item mapped, retained, corrected, or explicitly superseded |
| Numerics | Every demo/game model has correctness tests and independent reference comparisons |
| Assets | Every figure has provenance; every demo has a static print representation |
| Conversion | No dropped blocks, unknown commands, placeholders, or missing assets |
| PDF | Fresh successful build, resolved references, layout coverage, visual review |
| Web | Links, mathematics, bilingual controls, interaction tests, offline operation |
| Video | Valid timelines, frame manifests, expected duration, referenced dataset hashes |
| Release | Complete required inventory and fresh acceptance evidence |

### Existing checks to strengthen

The current parity checker:

- Compares section levels rather than semantic section identity.
- Checks display mathematics but not all inline mathematics.
- Converts labels and references into sets, losing duplicate detection.
- Removes complete text-like arguments, including any mathematics nested inside them.
- Has no demo, game, caption, or script parity contract.

Preserve its useful checks while moving comparison to shared block and equation identities. [check_parity.py](/home/tobias/Projects/theoretical-physics-C/scripts/check_parity.py)

The build scripts suppress compiler exit failures with `|| true`; missing logs can produce an error count of zero. `build.sh` also suppresses PDF-copy failure. `ci.sh` uses a single compilation pass and may consume existing auxiliary state. These are acceptance weaknesses.

Require a clean build directory, checked process exit status, fresh output existence, reference convergence, and atomic publication of successful outputs. Missing expected outputs must fail.

### Numerical and figure gates

Every demo record must identify its model tests, supported domain, reference fixtures, and print fallback. Require `checked N/N`; an empty discovered test set cannot pass a nonempty demo inventory.

Every figure must carry a machine-readable provenance header:

```text
figure ID; model/formula IDs; local source and locator;
dataset hash; generator hash; units; parameter values;
visual scaling; approximations; review receipt
```

For TikZ, the header can be a structured comment. SVG, PNG, and video frames need corresponding sidecars.

Extend the current header check: it presently treats a leading comment as sufficient descriptive evidence. [check_figures.py](/home/tobias/Projects/theoretical-physics-C/scripts/check_figures.py)

### One picture per page

Count qualifying visuals in the **final PDF**, separately for German and English.

Instrument figure wrappers to record shipped page numbers and occupied bounds. [zref](https://ctan.org/pkg/zref) provides relevant position/reference machinery; the exact instrumentation requires a pilot.

Do not count only embedded raster images: TikZ commonly appears as vector drawing operations. Do not count decorative rules or tiny badges as pictures.

Require:

- At least one qualifying visual per page under the agreed page policy.
- Visible, unclipped bounds and a caption or accessible description.
- A concept-to-visual relationship.
- Visual review of rendered pages.

Counting figures in source is insufficient: one lecture can occupy several pages, and translation changes pagination.

HTML has no fixed page height. Apply the web contract to each chapter and concept block, with visual coverage and responsive-layout tests.

### Web and bilingual gates

Check every generated local link and fragment. Follow external links in a separate bounded check; transient remote failure must be distinguished from a broken internal build.

For MathJax:

- Wait for startup and subsequent typesetting.
- Compare rendered mathematics with the expected expression inventory.
- Fail on errors and unconsumed expressions.
- Test initially collapsed blocks and dynamic controls.
- Test repeated opening without duplicated numbering.

For bilingual web parity, compare:

- Block, equation, definition, and claim IDs.
- Track/depth metadata and prerequisites.
- Figure, dataset, demo, and game identities.
- Parameter ranges, units, defaults, and rules.
- Captions, alt text, controls, feedback, and narration coverage.

Structural equality cannot verify translation meaning. Scientific translations require independent review.

### Gate discipline

Ship red fixtures for each gate, including the two hydrogen defects, duplicate labels, lost nested mathematics, missing widgets, wrong axis ordering, degree/radian mistakes, stale data, CDN dependence, and stale PDFs.

Use one review round and one repair wave per milestone. Unresolved correctness blockers remain blocked; smaller residual concerns enter the next milestone. A renderer author should not be the sole reviewer of its scientific contract.

## F. Effort and sequencing

Estimates are `[UNVERIFIED]`, expressed in engineer-days of focused work. They exclude waiting for source access, TJO decisions, and full video production.

| Phase | Scope | Rough size | Exit condition |
|---|---|---:|---|
| **0a: contracts** | Content/asset schema, conventions, provenance, build isolation, initial red corpus | 5–8 days | Missing or stale evidence fails mechanically |
| **0b: authoring pilot** | Bilingual semantic chapter; print, HTML, scripts; shared equation identities | 7–12 days | Cross-target completeness and parity pass |
| **0c: hydrogen pilot** | Verified low-state kernel, cloud/slice views, standalone HTML, short video | 10–18 days | Normalization, browser comparison, field checks, offline capture pass |
| **0d: acceptance integration** | Browser, page coverage, asset manifests, reproducible release | 5–8 days | One complete slice passes all gates |
| **1: baseline migration** | Map the existing 22 lecture pairs into the accepted contract | 12–22 days | Every legacy item has an explicit destination or disposition |
| **2: new content** | GPT, symmetries, Fock space, expanded thermodynamics | 3–8 days per substantial chapter | Source-backed bilingual chapter accepted |
| **3: media** | Simple demos 2–5 days; games 5–10; demanding 3D assets 8–15 | Per artifact | Scientific, interaction, print, and accessibility contracts pass |

Phase 0 totals approximately **27–46 engineer-days**, including the first complete teaching slice. This is the minimum useful infrastructure exercise, not a finished course.

Build hydrogen early because it tests the hardest common requirements: exact mathematics, conventions, volume data, 3D rendering, quantitative error, bilingual labels, offline packaging, and video reuse.

Also include a small preparation/measurement game in phase 0 or early phase 1. It tests the operationalist framing and game-state architecture that hydrogen alone does not exercise.

Before committing to the authoring recommendation, make the pilot include nested proofs, cases, cross-chapter references, translated text inside equations, several widgets, and long German captions. Those are conversion stress cases.

Compare a short Typst specimen using an available accepted math font. Preserve the result as evidence, but keep MathTime OTF development outside the course schedule.

### Keep

- Archives, corrections, transcript reconstructions, and mapping evidence.
- German-leading editorial practice.
- Shared bilingual figure identities.
- Existing print style as the baseline.
- Formula-derived figure geometry.
- Local CI entry point and standalone figure previews.
- GR’s separation between numerical generation and figure rendering.

### Retire or replace after characterization

- Duplicated scientific equations between translations.
- Independently maintained web captions.
- Runtime CDN dependencies in offline artifacts.
- Widget formulas repeated without reference comparisons.
- Regex substitutions used as an unrestricted TeX parser.
- Placeholder success paths and filesystem-based asset guessing.
- Compiler failures suppressed during acceptance.
- Permanently append-only content editing as the upgrade’s governing rule.

The existing enrichment policy protected reconstruction. The new course changes its conceptual structure. Replace “never rewrite” with explicit migration mappings and source-backed correction records. Preserve the old editions as immutable evidence.

## Recommendations

1. **Retain XeLaTeX and add constrained semantic authoring.** It preserves proven print typography and existing content. The trade-off is a small compiler contract that must be tested before expansion.

2. **Use one content graph and shared scientific identities.** It enables print, HTML, and script parity. The trade-off is initial metadata work and stricter authoring rules.

3. **Make Julia the reference implementation and dataset generator.** Independent TypeScript comparisons and analytic tests provide stronger evidence than visual inspection. The trade-off is maintaining two numerical implementations where live browser evaluation is required.

4. **Use TypeScript, Vite, and three.js/WebGL 2 first.** They support demos, games, and video reuse with manageable scope. WebGPU can follow measured need; native WebGPU would add substantial renderer ownership.

5. **Generate a static site and standalone offline demos from the same implementation.** The site shares assets efficiently; standalone files support classrooms and LMS distribution. The trade-off is a separate packaging and offline-test stage.

6. **Start video production by rendering the tested browser scene frame by frame.** Add Blender for volume quality and Manim/Motion Canvas for derivations when justified. The trade-off is browser/GPU capture variability.

7. **Use Markdown plus generated LaTeX as the fallback.** Switch if semantic LaTeX conversion proves too costly. Preserve the same registries, datasets, and gates so the decision does not restart the project.

8. **Gate every output on scientific evidence and completeness.** Begin with the demonstrated hydrogen errors and current build failure modes. The trade-off is review and fixture effort before producing large amounts of new material.

## Open questions for TJO

1. Is Times + MathTime required for the first release, or may an accepted OpenType alternative be used if another authoring system proves preferable?

2. Which course routes should exist, and how many explanatory depth levels should the print edition display?

3. Should “one picture per page” apply literally to title, contents, bibliography, and index pages? What qualifies as a picture?

4. Where are the primary sources for hydrogen/self-adjointness, uncertainty, GPT conventions, and Fock space? Can the advanced-course notes and handwritten symmetry notes be supplied in reviewable form?

5. Which browser/device baseline and offline distribution method must be supported in actual classrooms?

6. Should games assess mastery, guide exploration, or both? Is persistent student progress required?

7. What are the expected video languages, lengths, narration method, and production volume?

8. How much TJO review time is available per chapter and per scientific model, and who can independently review the rigorous track?

9. Is the initial release meant to cover the existing 22 lectures, or the full expanded GPT-to-thermodynamics course?