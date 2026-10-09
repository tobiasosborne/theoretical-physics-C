<!-- ROLE: the assembled plan for the Theo C upgrade. Authored by the orchestrator on
     2026-10-09 from nine research lanes (docs/plan/research/*/REPORT.md) and one hostile
     codex review (docs/plan/research/review/REVIEW.md). UPDATE POLICY: TJO's decisions in
     section 1 are filled in by TJO; everything else is amended with a dated note.
     STATUS: draft v1, awaiting TJO's decisions. -->

# Plan: Theoretische Physik C, from script to layered course

## 0. What this is

TJO's brief (`BRIEF.md`) asks for one comprehensive print PDF with a gentle Lehramt route
and optional rigour, one HTML page per chapter with interactive demos, real games, 3D videos,
a coherent design across all of them, two languages, and physics that is correct everywhere
and ground-truthed against local sources. The physics path runs from general probabilistic
theories through single-system quantum mechanics, many particles, Fock space, statistical
mechanics and thermodynamics, each level an effective theory of the one below.

Nine lanes researched this on 2026-10-09 (Opus and Sonnet subagents, codex gpt-6.1 at xhigh;
no Fable subagents). Their reports are the evidence base and are linked throughout. The lanes
also built things: a working two-edition LaTeX prototype with a checker, five design
packages with compiled print and rendered web specimens, a token compiler, and a numerical
check of the hydrogen formulas. Everything is under `docs/plan/research/`.

| Lane | Report | What it settled |
|---|---|---|
| sources-inventory (Sonnet) | `research/sources-inventory/REPORT.md` | what is on disk, what is missing, the toolchain |
| curriculum (Opus) | `research/curriculum/REPORT.md`, `notation-preinventory.md` | 22 chapters, hazards, source ledger, scope |
| layered-docs (Opus) | `research/layered-docs/REPORT.md`, `prototype/` | depth levels, marking, a checked prototype |
| design-research (Opus) | `research/design-research/REPORT.md`, `LANDSCAPE.md` | the post-Tufte landscape, the math-font constraint |
| design-packages-A (Opus) | `research/design-packages-A/` | PKG-1, PKG-2, PKG-3 with specimens |
| design-packages-B (Opus) | `research/design-packages-B/` | PKG-4, PKG-5 with specimens and token compiler |
| demos-games-video (Opus) | `research/demos-games-video/REPORT.md`, `IDEAS.md` | 105 ideas, 10 flagships, 12 engines |
| tech-stack (codex) | `research/tech-stack/REPORT.md` | authoring, web, video, data, CI, phases |
| rigour-process (codex) | `research/rigour-process/REPORT.md` | registries, provenance, gates, review cadence |
| review (codex) | `research/review/REVIEW.md` | contradictions, verifications, gaps, cuts |

## 1. Decisions

### 1.1 Settled by evidence (TJO may overrule)

| # | Decision | Evidence |
|---|---|---|
| S1 | Two axes, two words: "Zoom" is the physics scale (GPT to thermodynamics); "Tiefe / depth" is the rigour axis. | layered-docs 5.1 |
| S2 | Three depths: Kern (running text, the Lehramt route), Vertiefung (inline blocks after the core result, own counters 6.V1), Fundament (per-chapter appendix, own counters 6.F1). The Kern route is complete on its own, never false as stated, and this is a build check, not a promise. | layered-docs 5.2-5.3, prototype builds clean in both editions, checker exits 1 on a planted dangling reference |
| S3 | Depth is marked by a margin rule plus run-in label, lead sentence, dependency statement and return line; never by tint or small type. Tint stays for element types (Merksatz, Beispiel, ...). | layered-docs 5.4, MTW and Knuth checked against local sources |
| S4 | Print stays XeLaTeX with a small semantic authoring contract that generates chapter HTML and video scripts; Typst is piloted on one chapter, not adopted. | tech-stack A, design-research 2 |
| S5 | Julia is the reference implementation. Every demo, game score and video frame is driven by data or formulas with a Julia golden test. | tech-stack D, rigour-process D, demos 3.0 |
| S6 | Web: TypeScript, Vite, three.js on WebGL 2 first; WebGPU only where measured need appears. Math on the web is pre-rendered MathML (Temml or MathJax 4 server-side) with the same OpenType MATH font as print where the package allows. | tech-stack B, design-research 2.5 |
| S7 | Video: the tested three.js scene rendered frame by frame under headless Chromium plus ffmpeg; Blender only if volumetric quality demands it; Manim or Motion Canvas for 2D derivations if needed. | tech-stack C, demos 7 |
| S8 | One design-token file (DTCG format, OKLCH) compiles to `.sty`, CSS, GLSL and the video palette. The colour budget for greyscale is 3-4 data roles at least 0.15 apart in OKLCH lightness; everything else redundantly coded. | design-research principles 1, 3; both package lanes measured it |
| S9 | The current palette is replaced: three figure colours print as one grey and the link colour fails WCAG AA. | design-research palette-measurements.md |
| S10 | Rigour follows rk-light adapted to teaching: source registry with sha256 manifests, one notation database and one definitions database generating LaTeX and web JSON, a claims and provenance ledger with whole-quote verification, reviewer != author, one review round plus one repair wave per milestone, codex as the second model family. | rigour-process A-E |
| S11 | The existing enrichment rule "never rewrite" is replaced by explicit migration records; the v0.1 and v0.2 editions are preserved as immutable evidence. | tech-stack F, rigour-process 3 |
| S12 | Hydrogen is the pilot for everything hard (exact maths, conventions, 3D, video, bilingual labels, offline packaging), using the two errors in `vl16.tex` as the first red fixtures. | tech-stack F, rigour-process 5, demos flagship 1 |
| S13 | Games are formal puzzles scored by a physical quantity with exactly solvable levels and a printable manual in the book's layout; no gamified kitsch. The Quantum Moves retraction is the cautionary case. | design-research 4, demos 4 |

### 1.2 Decisions only TJO can make

Ranked by how much downstream work they unblock. Each has the lanes' recommendation.

| # | Decision | Options | Recommendation |
|---|---|---|---|
| D1 | **Math font.** | (a) Times LT Std + MTPro2 in print, STIX Two on screen; (b) STIX Two everywhere; (c) finish `mathtime-otf` and clear its licence for web | Run the blind A/B in `design-packages-A/specimens/ab-pkg1-mtpro2-vs-stix.png`. If you cannot reliably pick MathTime, take (b): exact print-screen match, searchable PDF maths, Typst possible, zero licence risk. MTPro2 PDFs have non-extractable maths (measured). |
| D2 | **Video ground.** | dark stage (3Blue1Brown-like) or light ground (stills are print figures by construction) | Light ground for anything that must appear in the book; dark allowed for standalone explainer videos. Decide before any 3D work; it is the largest downstream cost. |
| D3 | **Design package.** | PKG-1 Times+MathTime perfected; PKG-3 lab notebook; PKG-4 tokens first, dark video; PKG-5 explorable textbook; PKG-2 Baskerville companion (not ready) | PKG-1 with the math switch (D1) for identity, taking PKG-5's two rules (figures on a light plate; colour means physics only) and PKG-4's token pipeline. See section 4. |
| D4 | **GPT scope.** Plavala is finite-dimensional by axiom and never says "Archimedean". The brief's P2 (positive functionals on B(H) of norm 1) includes singular states in infinite dimension; density operators are the normal states. | (a) Kern is finite-dimensional GPT and C^d quantum theory, with trace class and normal states in Vertiefung and order-unit spaces in Fundament; (b) infinite-dimensional from the start | (a). You must write down your deviations from Ludwig-Werner and the infinite-dimensional formulation you want; no source on disk has them. |
| D5 | **Depth names.** | Kern / Vertiefung / Fundament (EN Core / Deeper / Foundations) or your own | Adopt as proposed; the words are already familiar to German readers. |
| D6 | **Which hydrogen treatment "after B. Simon".** | Reed-Simon II (Kato-Rellich); Teschl (free, has Kato-Rellich, the l=0 boundary condition, the factorisation method, same sign and Fourier conventions as the script) | Teschl as the registered authority for Fundament; Reed-Simon cited where Teschl defers. Decide reduced mass vs fixed nucleus for the first renderer. |
| D7 | **Sources to supply.** | Bratteli-Robinson 1-2, Reed-Simon 1-2, Ludwig, Busch-Lahti-Werner, Callen or Lieb-Yngvason, Bargmann; your reMarkable "Symmetries and QM" notes; the 2016 advanced QM course beyond Astwood's notes | One directory of authorised copies so they can be hashed; transcribe the reMarkable notes before Part II is written. |
| D8 | **First-release scope.** | full 22 chapters (about 545 pages) or a slice | See section 9: Phase 0 pilot (hydrogen plus one GPT game), then Part I and Part II first. |
| D9 | **Distribution.** | hosted site plus single-file offline pages; whether the core-only PDF is distributed; whether games count as coursework | Host on GitHub Pages like GR, ship offline single-file demos for classrooms, distribute both PDFs. |
| D10 | **Licences and permissions.** | Whitney web licence; MTPro2 second seat; Storm permission for Companion Math; Astwood notes (no LICENSE file); Wilming's notes marked do-not-distribute; Hammerer script | Astwood's notes are a map to your videos, not reusable text. Wilming and Hammerer are not cited. Whitney is dropped on the web unless you hold a web licence. |

## 2. Deliverables

1. **The canonical print PDF**, German leading, English in parity, all three depths, at least one
   figure per substantive page, built in four editions from one source: full DE, full EN,
   Kern-only DE, Kern-only EN. Every edition builds with zero errors and zero undefined
   references, and Kern numbering is identical across editions.
2. **One HTML page per chapter**, generated from the same source: Kern open, Vertiefung as
   collapsible blocks, Fundament as a linked section, definitions as popups, demos embedded
   at the figure they correspond to, bilingual.
3. **Interactive demos** (39 proposed, 10 flagships) built on 12 shared engines, each with a
   Julia golden test and a Playwright smoke test, available embedded and as single-file offline
   pages.
4. **Games** (33 proposed), each a formal puzzle with a physical score, exactly solvable levels,
   and a printable manual page in the book's layout.
5. **Videos** (33 proposed), rendered from the same tested scenes, bilingual captions, stills
   reusable as print figures when D2 is light ground.
6. **The infrastructure**: token file and compiler, notation and definitions databases with
   generators, source registry, claims and provenance ledger, checkers, CI.

## 3. The depth system

From `research/layered-docs/REPORT.md` section 5 and the prototype in
`research/layered-docs/prototype/` (`levels.sty`, `check_levels.py`).

- **Kern** (Lehramt route): finite-dimensional GPTs and quantum theory in C^d; Born rule with
  matrices; box, oscillator, finite well with boundary conditions stated as modelling choices;
  Wigner's theorem stated and proved for the qubit only; angular momentum algebra; hydrogen
  spectrum and orbitals; tensor products; Fock space as occupation numbers; entropy, ensembles,
  temperature; the laws, Carnot, potentials. Assumes linear algebra and calculus only.
- **Vertiefung**: trace class and normal states, unbounded operators and domains, the spectral
  theorem, Stone's theorem, Wigner's theorem in general, the measurement-uncertainty theorem,
  CCR/CAR algebraically, the fundamental hypothesis examined.
- **Fundament**: order-unit spaces (Plavala), self-adjointness of the Coulomb Hamiltonian
  (Kato-Rellich, Teschl), proof of Wigner's theorem, Bratteli-Robinson Fock-space
  constructions, Lieb-Yngvason entropy if adopted.

Invariants, each a CI check: K1 complete (Kern cites only Kern definitions), K2 no dangling
references (a plain `\ref` from Kern into a deeper block fails the build), K3 honest
simplification (every Kern claim carries its scope in the claims ledger), K4 same numbers in
every edition, K5 Kern exercises and figures use Kern material only, K6 both languages have the
same sequence of depth blocks.

Each switch into depth carries a lead ("Wozu: ..."), a dependency statement ("Voraussetzung:
Kern 6.1-6.3; nicht nötig für Kapitel 7") and a return line ("Zurück zum Kern: ..."). This is
MTW's dependency statement plus Victor's ladder, and the evidence base (signalling, leads,
segmenting, seductive-detail placement; DOIs in the report) favours it.

## 4. Design

Five packages were built to one template (`research/PACKAGE-TEMPLATE.md`), each with a compiled
German print specimen and a rendered HTML specimen. The specimens are the evidence; look at
them before deciding.

| Package | Type | Print-screen match | Video stills as figures | Licence | Identity fit | Specimen |
|---|---|---|---|---|---|---|
| PKG-1 Times and MathTime, perfected | Times LT Std + MTPro2 print, STIX Two screen, Whitney labels, teal re-stepped | family only; exact for TeX-rendered video | yes if light ground | owned for print; Whitney web unverified | highest | `design-packages-A/specimens/pkg1-1.png`, `pkg1s-1.png` (STIX variant) |
| PKG-2 Baskerville Companion | Baskerville 10 Pro + Companion Math v0.140 | only with Storm permission | yes | unresolved | high in spirit | `pkg2-1.png` |
| PKG-3 Lab notebook | STIX Two everywhere, wide margin, Tol colours | exact | yes | 0 EUR | lowest | `pkg3-1.png` |
| PKG-4 Tokens first, dark video | STIX Two + Inter + Iosevka, teal accent, dark stage | exact for text and maths | no (needs a print twin) | 0 EUR | good | `design-packages-B/specimens/pkg4-1.png`, `pkg4-web-dark.png` |
| PKG-5 Explorable textbook | Libertinus family, light plate, colour means physics only, camera presets | exact everywhere | yes by construction | 0 EUR | moderate | `pkg5-1.png`, `pkg5-web-light.png` |

Findings that hold whichever package wins:

- MTPro2 is Type 1: it cannot reach Typst, MathJax or MathML, and its PDFs have non-extractable
  maths (pdftotext turns "rho >= 0" into garbage). STIX Two is the only Times-family face that
  renders identically everywhere. The A/B image shows the print difference is small.
- Companion Math v0.140 fails three of its own hard rules, has a low math axis and swash
  italic Z and N; it is not production-ready and needs Storm's permission beyond print.
- Whitney lacks U+2192; labels must take arrows from the math font.
- Both token compilers (`design-packages-A/tokens.py`, `design-packages-B/tokens/build_tokens.py`)
  generate every colour from OKLCH and measure contrast, greyscale gaps and colour-vision
  deficiency; the merged pipeline should use lane A's mode layout and lane B's generator targets.
- Chromium rendered `mathvariant="bold"` as italic; bold symbols must be Unicode bold letters,
  and `tr` spacing must be added by hand. The TeX-to-MathML converter needs tests for both.

**Recommendation (D3):** PKG-1 as the identity, with the print math face as a build switch
(MTPro2 or STIX Two, decided by D1), plus PKG-5's rules that figures sit on a light plate in
every mode and that colour carries physics only, plus the PKG-4 token pipeline. If D1 chooses
STIX Two everywhere, this collapses into what lane B called PKG-5b: PKG-5's rules with STIX Two
and Inter, which both package lanes independently ranked as the thing to build first.

Physics colour roles (shared by all packages): state, effect/measurement, dynamics/energy,
environment/bath, plus a quantum-number ladder. Each role is one OKLCH lightness step apart.

## 5. Curriculum

From `research/curriculum/REPORT.md`. 22 chapters in five parts plus an optional scattering
appendix. Each chapter has an effective-theory sentence, Kern goals, named zoom-ins,
prerequisites and the existing files it reuses.

| Part | Chapters | Existing material |
|---|---|---|
| I. Probabilistic theories | C0 What a theory supplies; C1 Probability for physicists; C2 General probabilistic theories; C3 Hilbert-space toolkit; C4 Quantum theory as a probabilistic theory; C5 Which Hilbert space? The particle on a line; C6 Uncertainty: preparation versus measurement; C7 Solvable systems | vl01-vl13 for all but C2 |
| II. Symmetry road | C8 Symmetries and Wigner's theorem; C9 Dynamics as a representation of R; C10 Rotations and angular momentum; C11 Hydrogen | vl14-vl17 parts; Astwood for C8; reMarkable notes untranscribed |
| III. Many particles | C12 Composite systems; C13 Identical particles; C14 Fock space | vl17-vl18; Astwood (student notes, errors listed) and the 2016 videos for C14 |
| IV. Statistical mechanics | C15 Ensembles and entropy; C16 Microcanonical ensemble and the fundamental hypothesis; C17 Canonical and grand canonical; C18 Quantum gases and radiation | vl19-vl22; nothing for C18 |
| V. Thermodynamics | C19 The laws; C20 Machines and Carnot; C21 Potentials | nothing; TJO must supply |

Scope: about 278 Kern pages plus 236 depth pages, about 545 with front and back matter. The
current 84-page script covers roughly a quarter of the Kern pages of the 13 chapters it feeds.
Kern needs 27.5 lecture slots against 25 recorded; candidates for "depth only in lecture" are
C18, half of C3 and the finite well in C7.

Correctness hazards (section 2 of the report) are listed per chapter with the authority to
check against. The ones the brief insists on: preparation versus measurement uncertainty
(Busch-Lahti-Werner 2014; Werner-Farrelly 2019, not 2016); "quantisation" as a fallacy;
domains of position and momentum; Hermitian versus self-adjoint; the l=0 boundary condition
at r=0 (Teschl Thm 10.9); the sign of the canonical Lagrangian; the equal-a-priori hypothesis;
tensor product versus (anti)symmetric subspace; Fock-space ordering and the vacuum.

Verified defects in the current script, all also in the English edition and all inherited
from v0.1: `vl16.tex:85` Laguerre sign; `vl16.tex:94` 2p normalisation (norm squared 0.5) and
missing Condon-Shortley sign; `vl22.tex:25` canonical Lagrangian sign; `vl04.tex:70` Hermitian
called a synonym of self-adjoint; `vl19.tex:21` superseded k_B. These are the first red
fixtures and the first migration records.

Notation: `research/curriculum/notation-preinventory.md` has 68 symbols and 52 definitions with
German and English names. Collisions to settle in one session before any writing: F, U, H, S,
Omega, Delta, mu, p, V and K each mean two or more things across the sources.

## 6. Rigour

From `research/rigour-process/REPORT.md`, adapted from `../rk` and rk-light.

- **Source registry** `sources/<key>/`: TeX preferred, PDF otherwise, sha256 manifest, rights
  record, page or line windows. Plavala (arXiv source, in hand), the Theo C snapshots, Teschl
  (free PDF, personal use only, never committed), and the books TJO supplies (D7). Astwood is
  registered as a map to the videos, not as a quotable source.
- **Notation database and definitions database**: versioned JSON, one symbol once with its
  LaTeX macro, Unicode, MathML rendering, German and English names, depth, and "first fixed
  in"; one numbered definition once, never renumbered, every choice named inside it. Generators
  emit `tpc-notation.sty`, `notation.json` for the web and the bilingual label tables. A checker
  fails the build on an unregistered symbol or a restated definition. A translation guide maps
  Plavala's cone notation, the script's density-operator notation and Bratteli-Robinson's.
- **Claims and provenance**: every theorem-like unit has a typed status (quoted / derived /
  numerically checked / stated without proof) and a depth; every external fact has a
  provenance row whose quote is verified whole inside the hashed source. TJO's own framing
  (operationalism, P0-P5, "quantisation is a fallacy") is recorded as stipulation, not as
  cited fact.
- **Gates**: figure headers state the generating formula (already the convention); every demo
  has a golden test against Julia; every game score is a computed quantity with a test; every
  video frame sequence is generated from the same data; one-picture-per-page, link, MathML
  render and bilingual parity checks on the web; the four-edition build with K1-K6.
- **Hydrogen gate as the worked example**: exact factorised inverse-CDF sampling; normalisation
  by exact rational arithmetic; Kolmogorov-Smirnov test of sampled radii; moment checks for
  <r>, <r^2>, <1/r>; analytic evaluation along each ray (a 3D texture for 6s would need about
  7e8 voxels); isosurfaces at fixed enclosed probability; a cyclic perceptually uniform phase
  map; Condon-Shortley phases stated.
- **Review cadence**: implementers Opus and Sonnet; Tier A (physics correctness, notation and
  definitions databases, claims ledger, gate logic) reviewed by codex gpt-6.1 at xhigh before
  landing; Tier B batched per milestone; one review round plus one repair wave, hard stop.
- **Red corpus** before any gate: altered quote, missing premise, duplicate symbol, duplicate
  definition, stale translation, wrong normalisation, unregistered asset.

## 7. Media

From `research/demos-games-video/REPORT.md` and `IDEAS.md` (105 ideas: 39 demos, 33 games,
33 videos; 40 Kern-only, 12 depth-only, 53 both).

Engines, in build order: E0 reference harness; E12 game shell; E1 qubit and small-matrix core;
E3 one-dimensional Schroedinger (drives 14 concepts); E6 special functions with exact
coefficients; E5 SU(2)/SO(3) representations (rotations, angular momentum, spin, Stern-Gerlach,
Clebsch-Gordan); E7 hydrogen renderer (the largest single risk); E11 offline video pipeline;
E2 convex geometry for GPTs; E8 many-body and Fock; E9 counting and ensembles; E10
thermodynamics with real fluid data (CoolProp); E4 audio bridge. About 55-80 agent-days.

Flagships, ranked: hydrogen cloud explorer; the hydrogen video pair; "Shake the trap"
(driven oscillator, score F = exp(-|alpha_f|^2), exactly solvable); "Distinguish" (GPT dual
cones); the two uncertainty principles; Bloch ball done right plus Stern-Gerlach; Dirac's belt
and "Orient"; engine designer and Carnot with real water data; operator golf and the occupation
abacus; the zoom ladder and "Powers of ten, for physics". About 125-180 agent-days including
engines.

Also found: the earlier Bloch-sphere widget in the quantumcomputing repo animates gates by
interpolating angles, so its paths are not the physical ones; the GR widgets and the Theo C
style use two different values for the same colour name.

## 8. Technical architecture

From `research/tech-stack/REPORT.md`.

- **Authoring**: XeLaTeX remains the print engine. A small, explicit semantic contract (stable
  IDs on every chapter, section, equation, definition, figure and depth block; content and
  asset schema) lets one converter produce chapter HTML and video scripts. The fallback is
  Markdown plus generated LaTeX with the same registries and gates, so the decision does not
  restart the project. The pilot must include nested proofs, cases, cross-chapter references,
  translated text inside equations, several widgets and long German captions.
- **Numerical ground truth**: Julia (installed, with DifferentialEquations and StaticArrays)
  writes datasets with hash manifests; TikZ/pgfplots, the browser and the video renderer
  consume the same data or the same formulas; TypeScript implementations are compared against
  Julia golden values.
- **Web**: TypeScript, Vite, three.js on WebGL 2; MathML pre-rendered; static site plus
  standalone offline pages from one implementation; Playwright smoke tests (chromium installed).
- **Video**: headless Chromium frame capture of the tested scene plus ffmpeg; Blender and Manim
  are not installed and are added only on demonstrated need.
- **CI**: extend `ci.sh` with the four-edition build and K1-K6, the notation and definitions
  checker, provenance verification, golden tests, page coverage, link and render checks.
- **Keep**: archives, corrections, transcripts and mapping, German-leading practice, shared
  bilingual figure identities, formula-derived geometry, the local CI entry point.
- **Retire**: equations duplicated between translations, separately maintained web captions,
  CDN dependencies in offline artifacts, widget formulas without reference comparisons, regex
  as a TeX parser, and append-only editing as the governing rule.

## 9. Roadmap

Estimates are agent-days of focused work and are planning figures, not measurements.

| Phase | Scope | Size | Exit |
|---|---|---|---|
| 0a contracts | token file and compiler; notation and definitions databases with generators; source registry with Plavala and the script snapshots; claims and provenance checker; red corpus; `levels.sty` adopted | 8-12 | every gate has a red fixture; a planted error fails mechanically |
| 0b authoring pilot | one bilingual chapter (C4 or C11) through print (four editions) and HTML with the semantic contract; Typst specimen kept as evidence | 7-12 | parity and K1-K6 pass; TJO signs off the look |
| 0c hydrogen pilot | E0, E6, E7 for n <= 3; cloud and slice views; standalone HTML; one short video; the two `vl16` defects fixed with migration records | 10-18 | normalisation, sampling, browser-vs-Julia and offline capture gates pass |
| 0d first game | E12 plus "Distinguish" or "Shake the trap" | 5-8 | score test passes; manual page typeset |
| 0e review | codex Tier A review of contracts and pilots; one repair wave | 2-3 | receipt on file |
| 1 migration | map all 22 existing lectures into C0-C17 with migration records; fix the five verified defects; settle the notation collisions | 12-22 | every legacy item has a destination |
| 2 Part I and II | C0-C11, Kern first then depth; TJO supplies the GPT deviations and the transcribed symmetry notes | 3-8 per chapter | source-backed bilingual chapters accepted |
| 3 Parts III-V | C12-C21; Fock from the 2016 videos and Bratteli-Robinson; thermodynamics from TJO's text | 3-8 per chapter | same |
| 4 media | remaining engines and flagships, then the catalogue by priority | 125-180 for flagships; 254-335 for the full catalogue | each artifact passes its contract |

Phase 0 is 32-53 agent-days and ends with one complete, reviewed slice of the course in every
medium. Nothing in phases 1-4 starts before 0e.

## 10. Risks

- **Scope.** 545 pages, 105 artifacts and five media is several person-years of agent work
  with one human reviewer. The roadmap orders the work so that each phase is useful on its own.
- **Sources.** The books the brief names are not on disk. Fundament cannot be written honestly
  without them. The 2016 Fock-space course exists only as videos and student notes with errors.
- **TJO's own content.** His deviations from Ludwig-Werner, the infinite-dimensional
  formulation, the Fock "extras", the symmetry notes and all of Part V exist nowhere in writing.
- **Font and licence.** MTPro2 blocks the web and Typst; Whitney's web licence is unverified;
  Companion Math is not ready.
- **E7.** The hydrogen renderer is the single largest technical risk and is placed in Phase 0
  for that reason.
- **Authoring contract.** Converting semantic LaTeX is where previous pipelines (GR, quantum
  computing) accumulated regex hacks; the pilot must stress it before any scale-up.
- **Review capacity.** One review round plus one repair wave per milestone is the only way the
  schedule closes; TJO's review time per chapter is the real bottleneck.

## 11. Open questions for TJO

Section 1.2 holds the ten decisions. Further questions raised by the lanes and not folded
into those:

1. Exam scope: is Vertiefung examinable for BSc students, and Fundament never?
2. Web default: open in Kern for everyone, or remember the reader's last depth?
3. Upright d, e, i throughout, including the German edition?
4. Tone of depth markers: invitation ("Wozu: ...") or Knuth-style warning?
5. May the existing greybox and intuition boxes be redesigned, since depth no longer uses tint?
6. Does "one picture per page" apply to front and back matter?
7. Should games assess mastery (with persistent progress) or guide exploration?
8. Video language, length, narration method and expected volume?
9. Is installing Blender or Manim acceptable if the headless three.js route falls short?
10. Should the scattering material become an appendix?

## 12. Next step

Once D1-D5 are answered, Phase 0a begins with the token file and the two databases, seeded
from `research/curriculum/notation-preinventory.md`, and the adoption of `levels.sty` into
`latex/tpc-style.sty`.
