<!-- ROLE: the assembled plan for the Theo C upgrade. Authored by the orchestrator on
     2026-10-09 from nine research lanes (docs/plan/research/*/REPORT.md) and one hostile
     codex review (docs/plan/research/review/REVIEW.md). UPDATE POLICY: TJO's decisions in
     section 1 are filled in by TJO; everything else is amended with a dated note.
     STATUS: draft v1; TJO's decisions D1-D10 recorded 2026-10-11 in section 1.3. The codex
     review (research/review/REVIEW.md, written 2026-10-11) is folded in as section 13, with
     in-place corrections marked "Corrected 2026-10-11 (review ...)". Phase 0 decisions made
     by the Phase 0 coordinator on TJO's behalf are in section 14. -->

# Plan: Theoretische Physik C, from script to layered course

## 0. What this is

TJO's brief (`BRIEF.md`) asks for one comprehensive print PDF with a gentle Lehramt route
and optional rigour, one HTML page per chapter with interactive demos, real games, 3D videos,
a coherent design across all of them, two languages, and physics that is correct everywhere
and ground-truthed against local sources. The physics path runs from general probabilistic
theories through single-system quantum mechanics, many particles, Fock space, statistical
mechanics and thermodynamics, each level an effective theory of the one below.

Nine lanes researched this on 2026-10-09 (Opus and Sonnet subagents, codex gpt-6.1 at xhigh;
no Fable subagents). The hostile codex review did not exist when this plan was assembled; it
was written on 2026-10-11 and is folded in as section 13. Their reports are the evidence base and are linked throughout. The lanes
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
| S2 | Three depths: Kern (running text, the Lehramt route), Vertiefung (inline blocks after the core result, own counters 6.V1), Fundament (per-chapter appendix, own counters 6.F1). The Kern route is meant to be complete on its own and never false as stated. Corrected 2026-10-11 (review G, C15): the build checks structure only (no dangling references, identical numbering, depth of cited definitions); that Kern is semantically self-contained and honest remains a reviewer obligation. | layered-docs 5.2-5.3, prototype builds clean in both editions, checker exits 1 on a planted dangling reference |
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

### 1.3 TJO's decisions, 2026-10-11

Given in session on 2026-10-11. Where a decision departs from the recommendation in 1.2,
this section governs; sections 4, 9 and 12 carry dated notes. Lines marked "Reading:" are
the orchestrator's interpretation and are open to correction.

| # | Decision | Consequence |
|---|---|---|
| D1 | MTPro2 in print, STIX Two online. | Option (a). The print math face stays a build switch so a STIX print build exists for searchable PDFs and for comparing against the web. |
| D2 | Light ground preferred; the ground is a feature flag. | `ground = light` is the default and the only mode whose stills are print figures. `ground = dark` must build from the same scene and tokens. |
| D3 | All five packages are good in their way; build all of them behind feature flags. | The package is a build parameter of the token pipeline, not a one-off choice. Every artifact (print, web, demo, video) must take its type and colour from tokens only, with no package-specific values in content. PKG-2 stays flagged as not production-ready until Companion Math passes its own rules. |
| D4 | (a). | Kern is finite-dimensional GPT and C^d quantum theory; trace class and normal states in Vertiefung; order-unit spaces in Fundament. TJO's deviations from Ludwig-Werner are still unwritten. |
| D5 | Kern / Vertiefung / Fundament, EN Core / Deeper / Foundations. | As proposed. |
| D6 | Reed-Simon and Cycon-Froese-Kirsch-Simon supplied. | Reading: these are the registered authorities for hydrogen "after B. Simon" (Reed-Simon II for Kato-Rellich, CFKS for Schroedinger operators); Teschl is a secondary cross-check. Reduced mass versus fixed nucleus is still open. |
| D7 | Bratteli-Robinson 1-2 supplied. | On disk as of 2026-10-11 (see below). Still missing: Ludwig, Busch-Lahti-Werner, Callen or Lieb-Yngvason, Bargmann; the reMarkable symmetry notes are untranscribed. |
| D8 | Three smoke tests: (A) the first lecture, (B) the hydrogen atom, (C) the actual probabilistic-theory foundations. | Replaces the single authoring pilot in Phase 0; see the dated note in section 9. Reading: (A) is the opening of the new course built from `vl01` (C0-C1), (B) is C11, (C) is C2. |
| D9 | Everything on GitHub. | Repository, site (Pages) and offline artifacts all hosted there. The repository has no remote yet. |
| D10 | Fonts stay local unless open source. | No commercial font file (MTPro2, Times LT Std, Whitney, Baskerville 10 Pro, Companion Math) enters the repository, the site or any distributed web artifact. They are used only in local print builds; every package needs an open-source fallback (STIX Two, Inter, Libertinus, Iosevka) for the web and for CI. PDFs embedding subsetted commercial fonts are distributed only as far as each licence allows; that check is still owed. |

Two further decisions, same day:

- **Hydrogen is the two-body problem.** The chapter starts from electron plus proton on
  L^2(R^3) (x) L^2(R^3), separates centre-of-mass and relative coordinates in full, and
  arrives at the relative Hamiltonian with the reduced mass. The fixed-nucleus model is not
  the starting point. The renderer, the Bohr radius and every energy therefore use the
  reduced mass, and the claims ledger must say which of a_0 (infinite nuclear mass) and
  a_mu = a_0 m_e/mu each formula uses. This closes the open point in D6.
  - Source locus, read from the page image on 2026-10-11: Reed-Simon III, section XI.4,
    p. 55 (`sources/reed-simon-3`, DjVu page 62). It gives the unitary U on L^2(R^6) for
    R = (mu_1 r_1 + mu_2 r_2)/(mu_1 + mu_2), r_12 = r_1 - r_2, the transformed Hamiltonian
    -Delta_R/(2(mu_1+mu_2)) - Delta_r12/(2m) + V(r_12) with 1/m = 1/mu_1 + 1/mu_2, and the
    decomposition h_0 (x) I + I (x) H on C_0^inf(R^3) (x) C_0^inf(R^3). Self-adjointness
    of the two-body operator for V in L^2 + L^inf is by Kato's theorem (their X.16, in
    volume II). The kinetic-term computation is left there as Problem 40, so the Kern
    text must carry it out itself and type it "derived".
  - Notation: Reed-Simon write mu_i for the masses and m for the reduced mass, with
    hbar = 1; the script writes m_e, m_p and mu. This goes in the translation guide, next
    to the existing collision of mu with the chemical potential.
  - Cycon-Froese-Kirsch-Simon section 3.2 (pp. 29-30, eqs. 3.6-3.8) has the N-body
    version in atomic coordinates. Read from the text layer only; its formulas are not
    yet checked against the page image.
  - Consequence for the renderer: psi_nlm is a function of the relative coordinate
    r_e - r_p. A cloud drawn as "where the electron is" about a fixed point is the
    relative-coordinate density; the caption has to say so. `vl16.tex` lines 20-30
    currently introduce the fixed nucleus first and mention the reduction in passing,
    and define a_0 with m_e.
- **Work proceeds without the missing sources** (Ludwig, Busch-Lahti-Werner, Callen or
  Lieb-Yngvason, Bargmann). The ground-truth rule is unchanged: a statement that needs one
  of them is written from a source that is on disk, or is typed "stated without proof" with
  the missing source named, never sourced from memory.
  - Corrected 2026-10-11 (review A1, G): evidence type and proof presentation are separate.
    "Stated without proof" is a presentation choice, not an evidence status. A sourced
    theorem may omit its proof and stay admitted. A statement that depends on a source not
    on disk is admitted only through a local source or a reviewed derivation; otherwise it
    stays out of the material and goes on the gap list for TJO (`evidence/gaps.json`).
    TJO's decision to proceed without those books stands.

Sources supplied on 2026-10-11, in `~/Downloads` (never committed; to be unpacked into the
gitignored source registry in Phase 0a):

| File | sha256 | Contents |
|---|---|---|
| `Functional analysis.zip` | `ea36ca07d67e0e6a8d9ede984443c8a6992c66a6b907b58d5c20bdfd910a1ee3` | Reed-Simon I (1980 per its copyright page; corrected 2026-10-11 from 1981), II (1975), III (1979), IV (1978); Cycon-Froese-Kirsch-Simon (1987); all DjVu |
| `Functional analysis(1).zip` | `a1cce0cd24f161e282a3924fc75fded69f30df4bc1248514c9ffd05433f6601b` | Bratteli-Robinson vol. 1 and vol. 2, PDF |
| `...Cycon...Schroedinger_Operators...Springer(1987).djvu` | `258d6a27235d48ffdb3a34098014594e7a297b370f8c5053e37861436c99ba00` | CFKS, same size as the copy inside the first zip |

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
  (Kato-Rellich; corrected 2026-10-11 (review G) to match D6: Reed-Simon II and CFKS are the
  primary authorities, Teschl the cross-check), proof of Wigner's theorem, Bratteli-Robinson Fock-space
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
  maths (pdftotext turns "rho >= 0" into garbage). STIX Two is the Times-family face the
  specimens preferred for identical rendering everywhere. The A/B image shows the print
  difference is small. Corrected 2026-10-11 (review C4, C5, G): STIX is not technically
  unique (MathJax 4 ships a Termes face), and the failed extraction is a measured property of
  the present XeLaTeX pipeline, not a proven impossibility for Type 1 fonts.
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
and Inter. Corrected 2026-10-11 (review A12, G): only lane B ranked PKG-5b first; lane A
recommended PKG-1/1S.

**Note, 2026-10-11 (D3, D10):** TJO chose to build all five packages behind feature flags
rather than pick one. The recommendation above now describes the default flag setting, not
the only build. Commercial faces are local-print only; each package's web and CI builds use
its open-source fallback.

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

**Rejected, 2026-10-11 (TJO):** the page counts and lecture-slot counts in the next paragraph are the lanes' historical figures. TJO has rejected them as unreliable; they are not to be used for planning, and no replacement estimate is made. Only what was actually done is recorded.

Scope: about 278 Kern pages plus 236 depth pages, about 545 with front and back matter. The
current 84-page script covers roughly a quarter of the Kern pages of the 14 chapters it feeds
(corrected 2026-10-11, review G: the enumerated reuse set has 14 chapters, not 13).
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
- **Claims and provenance**: every theorem-like unit has a typed evidence status
  (source-quoted / source-backed / derived / numerically-checked / author-stipulated), a
  separate presentation field (proof included / omitted / linked) and a depth. Corrected
  2026-10-11 (review A1, G): "stated without proof" is no longer an evidence status; every external fact has a
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

**Rejected, 2026-10-11 (TJO):** the time, effort and size figures in this section are the lanes' historical figures. TJO has rejected them as unreliable; they are not to be used for planning, and no replacement estimate is made. Only what was actually done is recorded.

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

**Rejected, 2026-10-11 (TJO):** the time, effort and size figures in this section are the lanes' historical figures. TJO has rejected them as unreliable; they are not to be used for planning, and no replacement estimate is made. Only what was actually done is recorded.

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

**Note, 2026-10-11 (D8):** TJO replaced the single pilot with three smoke tests, each taken
through every medium that applies (four print editions, chapter HTML, at least one demo,
and the package and ground flags):

- **Smoke A, the first lecture** (C0-C1, from `vl01`): the authoring contract, depth blocks,
  bilingual parity and the design flags on ordinary prose-and-figure material. Takes the
  place of 0b.
- **Smoke B, the hydrogen atom** (C11): unchanged from 0c.
- **Smoke C, the probabilistic-theory foundations** (C2, from Plavala): the source registry,
  provenance ledger and notation translation on material with no existing script text; the
  natural home of the first game ("Distinguish"), so it absorbs 0d.

0a still comes first and 0e still closes the phase. The size estimates above were made for
the old shape and have not been redone.

## 10. Risks

- **Scope.** The plan covers 22 chapters, 105 proposed artifacts and five media. The roadmap
  orders the work so that each phase is useful on its own. (A forecast of the total effort
  stood here; removed 2026-10-11, see the rejection note in section 9.)
- **Sources.** Corrected 2026-10-11 (review A12, G): Reed-Simon I-IV, CFKS and
  Bratteli-Robinson 1-2 are on disk since 2026-10-11 (section 1.3). Still absent: Ludwig,
  Busch-Lahti-Werner, Callen, Lieb-Yngvason, Bargmann. Source presence is not claim admission:
  each used locus still has to be read from the page image and registered. Fundament units
  that need an absent source cannot be written honestly without it. The 2016 Fock-space course exists only as videos and student notes with errors.
- **TJO's own content.** His deviations from Ludwig-Werner, the infinite-dimensional
  formulation, the Fock "extras", the symmetry notes and all of Part V exist nowhere in writing.
- **Font and licence.** MTPro2 blocks the web and Typst; Companion Math is not ready.
  Corrected 2026-10-11 (review C1-C3, G): D10 takes commercial web fonts out of scope
  altogether. "Installed" is not evidence of "licensed"; the local MTPro2 EULA
  (`/usr/share/texmf/doc/fonts/mtpro2/EULA.txt`) allows embedding in documents, and the
  terms for Times LT Std, Whitney and the Storm faces for distributed PDFs are unchecked.
- **E7.** The hydrogen renderer is the single largest technical risk and is placed in Phase 0
  for that reason.
- **Authoring contract.** Converting semantic LaTeX is where previous pipelines (GR, quantum
  computing) accumulated regex hacks; the pilot must stress it before any scale-up.
- **Review cadence.** One review round plus one repair wave per milestone, then stop and
  report what is left. (Statements about review time removed 2026-10-11 on TJO's instruction.)

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

D1-D10 were answered on 2026-10-11 (section 1.3). Phase 0a begins with the token file and the two databases, seeded
from `research/curriculum/notation-preinventory.md`, and the adoption of `levels.sty` into
`latex/tpc-style.sty`.

## 13. Codex review folded in, 2026-10-11

`research/review/REVIEW.md` (codex gpt-6.1-sol, xhigh, second run) reviewed the lanes and
this plan with D1-D10 taken as fixed. Its sections A, B and G are folded in here; C-F stay in
the review and are referred to where they changed the Phase 0 design. In-place corrections
above are marked "Corrected 2026-10-11 (review ...)".

### 13.1 Contradictions (review A) and how the plan now reads

| # | Contradiction | Resolution in this plan |
|---|---|---|
| A1 | "Stated without proof" used as an evidence status, which would admit unsupported claims | Evidence type and presentation are separate (corrections in sections 1.3 and 6). A claim without a local source or reviewed derivation is not in the material; it is a row in `evidence/gaps.json`. The claims checker rejects any other status. |
| A2 | Kern is "finite-dimensional" (D4) yet contains the box, oscillator, hydrogen and Fock space | D4 stands for the GPT and postulate chapters (C2, C4). The plan owes an explicit finite-to-continuum bridge: where the restriction ends (C5), which L^2 definitions enter Kern, which browser matrices are truncations. Smoke B states its own bridge; the general one is a Phase 1 item and a question for TJO (section 14). |
| A3 | Three depths, but the curriculum sorts material into two buckets, and the lanes disagree on where GPT material sits | The introductory GPT picture is Kern (curriculum lane, matches the brief). Every "Z" block of the curriculum must be assigned to V or F when its chapter is written; Smoke C does this for C2. |
| A4 | S3 "never small type or tint for depth" against PKG-3 (small margin blocks on grey) and PKG-4/5 (9.5 pt Vertiefung) | Invariant in every package: margin rule, run-in label, lead, dependency, return line, body size. Packages may vary only the rule's colour, weight and label face. The lane specimens of PKG-3/4/5 deviate and are not followed on this point. TJO to confirm (section 14). |
| A5, A6 | Native MathML "settled" against the tech lane's tested migration; MathJax serialisation is not a MathML-Core renderer | MathML stays the destination. Phase 0 treats conversion as a gate: a formula corpus from the smoke chapters must convert and render, with bold and `tr` spacing tests, and a recorded fallback. Not settled until that gate passes. |
| A7 | D1 (MTPro2 print, STIX web) against five packages with their own faces and D10's open fallbacks | Precedence: the package decides the faces; D1's pair is the default package's (PKG-1) resolution; `fonts=open` replaces every commercial face by the package's declared fallback. The resolved stack per package and mode is in `design/README.md`. "Exact everywhere" in the section 4 table holds only for the open-font packages. |
| A8 | "Nothing re-verified" for video reuse | Withdrawn. Shared kernels remove duplicate physics code; camera, clipping, opacity, timing and captions are checked per video. |
| A9 | "Still equals figure by construction" | Withdrawn as stated. Print and video have separate rendering contracts that share the scene state and tokens. |
| A10 | "Games are scored by a physical quantity" against stars, strokes and streaks in the catalogue | Each game states three things separately: the scientific success quantity, the game reward derived from it, and the proven optimum. "Distinguish" does so in Smoke C. |
| A11 | "Each level an effective theory of the one below" stated as fact | The ladder is TJO's organising stipulation. Each arrow gets its actual operation named in the text: GPT to QM is model selection; tensor product and Fock space are extensions; statistical mechanics and thermodynamics need coarse-graining and limit assumptions. |
| A12 | Stale statements in this plan | Corrected in place (header, sections 4, 5, 9, 10). |

### 13.2 Verifications (review B)

Confirmed independently by the review: the `vl16` Laguerre sign (line 85); the `vl16` 2p
normalisation (norm squared 1/2; correct magnitude 1/(8 sqrt(pi))) and the missing
Condon-Shortley signs, the latter as a convention inconsistency with `vl14.tex:149`; the
superseded k_B in `vl19`; Plavala finite-dimensional by axiom (`what_v4.tex:13-23`, S5) and
no occurrence of "Archimedean" in the source tree; singular states on B(H) exist in infinite
dimension (direct ultrafilter construction); the reduced-mass kinetic transformation; the
Astwood defects H14.1-H14.4 and H14.7 (with further ones at `:630-632`, `:810`, `:845`).

Qualified or refuted:

- `vl22.tex:25` canonical Lagrangian: an inconsistency between the multiplier's sign and the
  stationarity result that follows, not a wrong sign in isolation. The fix must define the
  multiplier (S - k_B beta (tr rho H - E) - k_B gamma (tr rho - 1)).
- `vl04.tex:70` Hermitian/self-adjoint: refuted as a false statement; `vl04.tex:62` defines
  Hermitian by A^dagger = A. The defect is the missing domain and scope. HANDOFF already says so.
- H14.5 "normal-ordered vacuum expectation is zero" holds only without a scalar term.
- `demos-games-video/IDEAS.md:671-672`: H = -Delta - Z/r has energies -Z^2/(4n^2); the stated
  -Z^2/(2n^2) needs -Delta/2.
- `curriculum/REPORT.md:236-238`: "convexity of potentials" is false as a blanket statement
  (Helmholtz free energy is concave in T).
- PKG-5's "18 %" half-maximum enclosed probability: the value is 0.1771; the claimed
  four-decimal grid convergence is withdrawn.
- "The gate animation path is physically wrong" (section 7, last paragraph): a gate endpoint
  does not fix the path; the generator has to be specified before that judgement.
- Not checked by the review: the Reed-Simon and CFKS loci of section 1.3. The Reed-Simon III
  p. 55 locus is re-read from the page image in Smoke B.

### 13.3 Corrections to the lane reports (review G)

The lane reports are kept as written (they are evidence of the campaign). Review section G
is their errata list and governs wherever a report is used: any brief that hands out a lane
report hands out `research/review/REVIEW.md` section G with it. The rows that concern this
plan are corrected in place above.

### 13.4 What the review changed in Phase 0

- The claims checker admits five evidence types only and fails on a claim in content that
  has none; unsupported statements live in `evidence/gaps.json`, not in the text (A1).
- The levels checker must fail on empty or stale logs and check the compiler exit and a label
  census, not only log strings (C15).
- The token pipeline must cover type scale and layout roles, not only colour (C12); essential
  graphics need 3:1 contrast with no thick-stroke exemption (C14).
- Hydrogen (F4, D): the chapter states the centre-of-mass preparation; the laboratory electron
  density of a factorised state is a convolution of the centre-of-mass density with the scaled
  relative density, and total energy is distinguished from internal energy.
- Per-source metadata is tracked as `sources/<key>/source.json` and `rights.json`; payloads and
  extracted text stay ignored (D).
- Scope: the review's proposed first release R0 is adopted as the working scope of the
  smokes (section 14, item 6). The review's section E figures and its remarks on review
  time are not carried over (TJO, 2026-10-11).

## 14. Phase 0 coordinator's decisions on TJO's behalf, 2026-10-11

Made by the Phase 0 coordinator (an agent), not by TJO. Each is open to correction.

1. Layout of the new course beside the old script: `docs/plan/phase0/COORDINATION.md` section 2.
2. Flag vocabulary `pkg`, `ground`, `math`, `fonts`, `edition`, `lang` with defaults PKG-1,
   light, STIX and open fonts in CI (same file, section 3).
3. Depth marking (review A4). Invariant in all five packages: Kern is the running text;
   a depth block is set at body size on the text measure, marked by a margin rule and a
   run-in label, and carries lead, dependency and return line; no tint and no small type
   for depth. Variable per package: the rule's colour and weight, the label's face and
   case, the spacing around the block. The PKG-3/4/5 lane specimens deviate from this and
   are not followed on this point. TJO to confirm, since it changes three of his five
   packages.
4. Fonts (review A7). The package decides its faces; D1's pair (MTPro2 in print, STIX Two
   on the web) is the resolution of the default package PKG-1. `fonts=open` replaces every
   commercial face with the package's declared open fallback; web and CI always use
   `fonts=open`. The resolved stack per package, medium and licence mode is tabulated in
   `design/README.md`.
5. Build matrix (review F1). Built exhaustively in CI: the four editions (full/Kern x DE/EN)
   with PKG-1, light ground, open fonts, for every smoke chapter. Spot-checked: the full DE
   edition for each of PKG-2..5 on the light ground, and PKG-1 and PKG-4 on the dark ground;
   the web page per chapter in PKG-1 light plus one screenshot per other package and for
   dark. Local-only, never in CI: `fonts=local math=mtpro2`. The full matrix is not built.
6. Scope (review E): the review's R0 cut is the working scope of the smokes. Hydrogen: the
   derivation and golden values cover n <= 3, the renderer n <= 2 with three small views
   (sampled relative-coordinate cloud, radial distribution with nodes, phase slice) and one
   short video. GPT: explorer and "Distinguish" on the classical bit, the qubit and the
   square bit, with a fixed level set. All five package flags on the three fixtures, PKG-2
   marked experimental. TJO to confirm.
7. D4 bridge (review A2, F5), not a reopening of D4. Kern is finite-dimensional in C0-C4
   (GPTs, the postulates, C^d). The restriction ends at C5 ("Which Hilbert space?"). From
   there Kern uses L^2(R^n) with: wave functions as square-integrable functions, the inner
   product as an integral, position and momentum as operators on stated function classes,
   eigenvalue problems with boundary conditions stated as modelling choices. Self-adjointness,
   domains and spectral theory stay in Vertiefung and Fundament. For hydrogen (Smoke B) the
   Kern text works on L^2(R^6) and L^2(R^3) in exactly this sense and says so. Browser
   computations: the hydrogen views evaluate closed formulas (no truncation); any matrix
   computation of an L^2 model in a demo is a truncation and is labelled as one. The wording
   of the bridge paragraph in C5 is TJO's; it is on the gap list.
8. Private and public checks (review D). Each source's `source.json` and `rights.json` are
   tracked; payload and extracted text stay ignored. Checks that need the private payloads
   (whole-quote provenance verification, manifest hashes) run only locally and write a
   receipt (`evidence/receipts/`) that public CI verifies for freshness against the ledger
   hashes; everything else runs anywhere.
9. CODATA 2022 (`sources/codata-2022/allascii.txt`, fetched from physics.nist.gov on
   2026-10-11, sha256 77fb90e6...) is the registered source for physical constants.
10. Standing rule from TJO, 2026-10-11, in his words: "numbers, especially pertaining to time,
    are untrusted. no number is admitted unless there is a physics derivation. estimates are
    nonsense." Applied as: no estimate of any kind anywhere (durations, effort, future page
    counts, costs, capacities); nobody estimates TJO's time; in the material and the ledger
    every number carries its derivation, its reproducible computation, or its source locus,
    and the claims checker enforces it; a design threshold is either measured by a script in
    the repository, or quoted from a standard with a locus, or marked as an unvalidated choice.
    Measurements actually taken (tests run, pages of a built PDF, hashes) are reported with
    the command that produced them; that last reading is the consultant's, not TJO's wording.
11. Reference implementation (S5 says Julia). In Phase 0 the derivations and their exact
    checks were written by codex in Python with sympy (`evidence/derivations/*/check_*.py`);
    Julia implementations written independently reproduce those golden values and feed the
    browser kernels' tests (`numerics/`, `numerics/gpt/`). So each number has two
    implementations; which one is called "the reference" is TJO's to say.
12. D64 "Rydberg-Energie" is blessed provisionally as a course definition with the wording
    "energy of the state 1s"; the name has no source on disk (gap G-0021).
13. `content/COURSE.json` lists the planned chapters c00-c21; a build lacking any of them is
    partial, so references into unwritten chapters are logged as external and do not fail.
14. Hydrogen chapter after review: "ground state", "the allowed energies" and "complete
    description" were withdrawn to "the constructed family of bound states", because no
    lower bound and no completeness result with a source on disk is in the chapter (gaps
    G-0015, G-0016). TJO may prefer to supply the source and restore the usual wording.
