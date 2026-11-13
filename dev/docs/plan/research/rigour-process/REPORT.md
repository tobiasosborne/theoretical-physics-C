# Correctness and rigour process

Status: proposed process, dated 2026-10-09. No files were modified.

Use a small, versioned knowledge registry inside this repository. Every published factual unit must resolve to a local source, a reviewed derivation, or a declared computation. PDF, HTML, demonstrations, games and videos must consume the same definitions, notation and verified physical data.

This implements the requirements in [BRIEF.md](/home/tobias/Projects/theoretical-physics-C/docs/plan/BRIEF.md). The process borrows provenance, dependency and review controls from rk; it does not require rediscovering textbook mathematics.

The existing read-only checks returned:

| Check | Coverage | Failures | Warnings |
|---|---:|---:|---:|
| Enrichment | 22 lectures | 0 | 7 |
| German–English parity | 22 lectures | 0 | 2 |
| Figure structure | 22 figures | 0 | 0 |

These results establish structural preservation and parity. They do not establish physics correctness. In particular, the printed hydrogen \(2p,\ m=\pm1\) functions have squared norm \(1/2\); see section D.

## A. Source registry

### A.1 Registration contract

Use an immutable key for each edition or version:

```text
sources/<key>/
    source.json
    manifest.sha256
    rights.json
    payload/                 original archive, TeX, PDF, scan or recording
    extracted/               exact unpacked source or extracted text
    extraction.json          tool, version, options, input/output hashes
    loci.json                page, line, equation and timestamp anchors
```

`payload/` and `extracted/` are private and gitignored by default. Registering a source does not imply permission to redistribute it.

Required `source.json` fields:

| Field | Contract |
|---|---|
| `schema_version`, `key` | Versioned schema; unique, immutable source key. |
| `title`, `authors` | Checked against the source itself. |
| `edition`, `version`, `language` | Exact edition, arXiv version or recording version. |
| `identifiers` | DOI, arXiv ID, ISBN, video ID or repository commit, as applicable. |
| `retrieval` | URL or acquisition route, date and original filename. |
| `files` | Relative paths, media types and SHA-256 values. |
| `authority_for` | Topics and permitted scope of use. |
| `limitations` | Dimensionality, hypotheses, known errors and secondary-source status. |
| `rights_ref` | Rights record governing storage, quotations and distribution. |
| `supersedes`, `errata` | Links to other versions and registered corrections. |

Registration proceeds in this order:

1. Acquire an authorized local copy and verify its identity.
2. Hash the original bytes before extraction.
3. Prefer available author TeX; retain the corresponding PDF for equation numbering and visual inspection.
4. Hash every extracted member and every generated text extraction.
5. Register bounded loci and inspect each locus used by teaching content.

Do not overwrite registered versions. A revised paper, new scan or corrected transcription receives a new version and invalidates affected downstream evidence.

### A.2 Locus contract

A citation must identify more than a book or paper.

- **TeX:** member path, SHA-256, inclusive line window, and equation/theorem label where available.
- **PDF:** PDF SHA-256, physical PDF page index, printed page number, extraction line window, and equation/theorem number.
- **Scanned book:** the same fields plus a page-image region and a checked transcription.
- **Video:** local recording or clip SHA-256, start/end timestamps, frame anchors, and checked transcript lines.
- **Code:** immutable commit or snapshot hash, file and line window, and relevant test or output record.

Use explicit page-index conventions. Printed page 12 and PDF page index 12 are different identifiers.

PDF extraction and OCR require a human check against the page image, especially for minus signs, subscripts, fractions and hypotheses. A byte match against incorrect OCR verifies the transcription’s bytes, not the original mathematics.

For handwritten notes, preserve the original document, export a local PDF, and check the transcription against its pages. Do not treat an agent transcription as the primary source.

### A.3 Storage and licensing

Commit metadata, hashes, extraction instructions, bibliographic records, permitted short evidence quotations, and project-authored derivations. Commit source bodies only when the recorded license or permission permits repository redistribution.

Keep licensed books, unlicensed third-party manuscripts, their substantial text extractions, and large recordings in gitignored storage. Provide a local hydration command that checks the committed manifest against the acquired files. A missing private source fails verification; it must not become an automatic skip.

Plavala’s v2 uses arXiv’s non-exclusive distribution license. The conservative repository policy is to keep its source bodies private unless separate redistribution permission is recorded. Free access and a TeX download are insufficient evidence of permission to vendor the complete work. [Paper and license link](https://arxiv.org/abs/2103.07469v2), [license terms](https://arxiv.org/licenses/nonexclusive-distrib/1.0/license.html).

Separate the private evidence ledger from the public bibliography. Restricted quotations may remain private while public artifacts carry conventional citations and project-authored explanations.

The existing treatment of Hammerer’s script establishes a useful precedent: it is gitignored and excluded from redistribution. [HANDOFF.md](/home/tobias/Projects/theoretical-physics-C/HANDOFF.md).

### A.4 Source triage

Availability below distinguishes a verified local copy from an acquisition route. Exact theorem/page authorities remain `[UNVERIFIED]` until registered locally.

| Source | Availability and next action | Intended authority |
|---|---|---|
| **Plavala, arXiv:2103.07469v2** | Local TeX archive verified at `/home/tobias/Downloads/arXiv-2103.07469v2.tar.gz`; register first. PDF and TeX are also available through arXiv. | Finite-dimensional GPT state/effect geometry, cones, duality and the finite-dimensional quantum example. It does not by itself justify an unrestricted infinite-dimensional extension. [Primary source](https://arxiv.org/abs/2103.07469v2). |
| **Bratteli–Robinson, volumes 1–2** | Not located by the filename inventory reported in CONTEXT. Acquire exact editions through TJO or institutional access. Exact chapter/theorem selections `[UNVERIFIED]`. | Volume 1: operator algebras, states and symmetries. Volume 2: quantum statistical mechanics and equilibrium structure; identify the precise Fock/CCR/CAR sections after acquisition. [Volume 1](https://link.springer.com/book/10.1007/978-3-662-02520-8), [volume 2](https://link.springer.com/book/10.1007/978-3-662-03444-6). |
| **Reed–Simon / B. Simon** | Reed–Simon not located locally. Select volume II for self-adjointness, then register the required sections. Simon’s accessible review provides an immediate acquisition route for Kato’s results. | Operator domains, self-adjointness, relative bounds and quadratic forms. Hydrogen formulas require their own equation-level evidence; citing a self-adjointness theorem does not verify orbital normalization. [Simon’s bibliography](https://math.caltech.edu/simon/simon.html), [Kato review, arXiv:1711.00528](https://arxiv.org/abs/1711.00528). |
| **Busch–Lahti–Werner** | Not registered locally; acquire versioned arXiv TeX/PDF now. | Preparation versus measurement uncertainty, operational error definitions, and the hypotheses of error/disturbance bounds. Use distinct claims for distinct inequalities. [Measurement uncertainty](https://arxiv.org/abs/1312.4392), [root-mean-square error](https://arxiv.org/abs/1312.4393), [error/disturbance relation](https://arxiv.org/abs/1306.1565). |
| **Ludwig, Foundations of Quantum Mechanics** | Not located locally. Acquire the chosen language and edition. Publisher lists preparation/registration, ensembles/effects, transformations and group representations. | The operational framework from which TJO takes inspiration. It is not authority for TJO’s deviations or his exact P0–P5 sequence. [Volume I](https://link.springer.com/book/10.1007/978-3-642-86751-4). |
| **Wigner / Bargmann** | Original works not registered. Candidate references: Bargmann’s 1964 Wigner proof and 1954 ray-representation paper. Local access and precise loci `[UNVERIFIED]`. A modern primary proof is available on arXiv. | Ray symmetries preserving quantum transition probabilities; projective representations under stated hypotheses. Do not attribute a theorem about arbitrary GPT symmetries to Wigner. [Bargmann 1964](https://doi.org/10.1063/1.1704188), [Bargmann 1954](https://doi.org/10.2307/1969831), [modern primary proof](https://arxiv.org/abs/0808.0779). |
| **TJO’s Theo C scripts** | Archived v0.1 TeX and current v0.2 TeX are local. Register immutable snapshots and their corrections. | What was written and taught; established course terminology and author choices. Mathematical statements remain subject to derivation/source checks because the archive contains errors. |
| **TJO’s videos and symmetry notes** | Reconstructed Theo C transcripts are local. Local original recordings are not established by this inspection. The symmetry `.rmdoc` exists. Acquire recordings or bounded source clips; export and transcribe the handwritten notes. | What TJO actually said or wrote, including corrections at the board. Reconstructed transcripts require primary-media confirmation. |
| **Astwood’s advanced-QM notes** | Local TeX clone verified at the scratchpad path given in CONTEXT. Register its commit and relocate its evidence snapshot to durable storage. Redistribution permission `[UNVERIFIED]`. | Secondary reconstruction of TJO’s advanced course. Cross-check against local videos and Bratteli–Robinson before admission. [Repository](https://github.com/mastwood/advancedquantum). |

The verified Plavala archive SHA-256 is:

```text
67548d09b2acc74f680a77a099d23ceb5a10e7980d883b0f57843e1e2ca8ec64
```

This is an observation from this inspection, not a source registration already installed in the repository.

## B. Notation and definitions databases

### B.1 Canonical storage

Use versioned, schema-validated JSON as the initial authored database. Generate readable `notation.md` and `definitions.md` from it. A generated SQLite index may be added later for queries; it must not become a second editable source.

This preserves the useful AQM rules: unique ownership, “first fixed in”, stable definition numbers, and explicit choices. [Notation]( /home/tobias/Projects/arithmetic-quantum-mechanics/notation.md), [definitions](/home/tobias/Projects/arithmetic-quantum-mechanics/definitions.md).

### B.2 Notation schema

One record owns each canonical symbol and meaning.

| Field group | Required fields |
|---|---|
| Identity | `symbol_id`, `revision`, `canonical_token`, `status`, `superseded_by`. |
| Meaning | `meaning_de`, `meaning_en`, `definition_id`, mathematical type, domain and units/dimensions. |
| Ownership | `first_fixed_in` as a stable definition/content ID; introducing chapter and anchor. |
| Conventions | Applicable sign, inner-product, Fourier, trace, basis and normalization convention IDs. |
| Names | German and English names, approved abbreviations and accessible spoken forms. |
| TeX | Unique canonical macro, argument signature and expansion specification. |
| Rendering | Unicode fallback, web-math expression and required rendering capabilities. |
| Web/3D | Generated MathML/KaTeX representation; three.js label specification and accessible label. |
| Migration | Legacy aliases and source-scoped translation references. |

Do not independently author equivalent TeX, MathML and three.js strings. Author one rendering specification and generate its supported representations.

Global meanings must not share an ambiguous canonical token. Bound variables may reuse conventional letters inside explicit typed scopes. Their bindings are recorded locally; they do not acquire new global meanings.

For example, Hilbert space, Hamiltonian, classical energy, effect and expectation need distinct semantic IDs even where a source uses overlapping letters.

Record conventions as data: “linear in the second argument”, ordinary versus normalized trace, and phase conventions are executable inputs to checking and rendering.

### B.3 Definitions schema

Each definition has:

```text
id: D<number>
revision, status, superseded_by
name_de, name_en, aliases
canonical_body_de, translated_body_en
symbol_ids, parameter_types, domain
choices, conventions, restrictions
origin: source-adapted | author-stipulated
provenance_ids, property_claim_ids
first_fixed_in, translation_of_de_hash
```

Each language body has one owned location. Numbers are never reused or renumbered.

A definition specifies its choices inside its body: basis, topology, domain, boundary condition, normalization or allowed measurements. Assertions of existence, equivalence, positivity, uniqueness or completeness become separate claims.

Repeated display is allowed through generated transclusion:

```text
render_definition(D17, language, view)
```

A chapter may show a definition again for convenience, but cannot maintain a second authored version. Short reminders link to the owning definition; formally equivalent alternative characterizations require a claim.

### B.4 Shared consumption

```text
authored notation + definitions + conventions
    -> generated LaTeX macros and definition fragments
    -> generated web JSON and math-rendering configuration
    -> generated bilingual labels, glossary and accessibility text
```

Both PDF masters import the generated macros. HTML mathematics uses the generated configuration. Demonstrations and shaders obtain physical parameter names, units and labels by semantic ID. Games and video overlays use the same exports.

The existing `tpc-macros.sty` becomes a compatibility wrapper during migration. It must not maintain independent meanings or redefine generated macros.

Every export records schema version and input hashes. Regeneration followed by comparison detects stale outputs. Generated files are never hand-edited.

### B.5 Translation guide between sources

Each translation row records:

```text
source key + version + locus + verified quote
source token, source type and convention
canonical symbol/definition IDs
mapping formula and inverse, if applicable
conditions, losses and non-equivalences
supporting claim IDs and reviewer receipt
```

Translation is a typed mathematical correspondence, not search-and-replace.

Verified Plavala examples can seed the guide:

| Plavala notation | Proposed course correspondence | Required distinction |
|---|---|---|
| \(K\) | Normalized state space | A convex set is distinct from its linear span or state cone. |
| \(A(K)^+\) | Positive cone in the effect/observable space | Keep it distinct from the positive state cone. |
| \(A(K)^{*+}\) | Positive dual cone | Record the pairing and normalization functional. |
| \(1_K\) | Order unit | Map it explicitly to the quantum identity. |
| \(E(K)\) | Allowed effect interval in the selected model | State any no-restriction assumption. |

These tokens are present in local `basic_v3.tex`, especially lines 56–81, 114–119 and 203–224 of the verified archive.

Add the Theo C density-operator correspondence through the trace pairing. Populate Bratteli–Robinson’s actual tokens only after examining the registered edition. Its translation rows must expose general versus normal states and the relevant dual/predual distinction; guessed book notation is prohibited.

### B.6 Build checker

For new admitted content, the checker must fail on:

1. Duplicate IDs, canonical macros, definitions or conflicting global meanings.
2. Unknown mathematical symbols, unresolved bound variables or unsupported syntax.
3. Local macro definitions that override registry exports.
4. A raw authored definition outside the definitions database.
5. Unknown definition references, invalid first-use ordering or undeclared convention changes.
6. Physical labels in figures, controls, shaders or overlays that bypass registered IDs.
7. Stale exports or a renderer that drops a symbol, accent or subscript.

Use a constrained mathematical syntax and parse it structurally. A regex scan cannot certify arbitrary TeX or natural-language equivalence. Unsupported constructs must fail explicitly or receive a reviewed parser extension.

Mechanical deduplication covers IDs, aliases, formal definition blocks and transclusions. Review still checks disguised prose redefinitions. The checker must state this limit.

Source quotations are exempt from canonical notation only inside verified, source-scoped quote nodes. Quotation marks alone do not provide an exemption.

## C. Claims and provenance for teaching text

### C.1 Units and coverage

Assign stable IDs to theorem-like statements, formulas, worked results, exercise answers, factual explanations and physical assertions in captions or narration.

Group closely related explanatory sentences when one bounded source locus supports them. Do not create a ledger row for every connective sentence. Every factual sentence must nevertheless belong to an identified support scope.

A citation at the end of a chapter does not support every statement in that chapter.

### C.2 Typed evidence and presentation

Keep evidence type separate from teaching presentation:

| Evidence type | Admission requirement |
|---|---|
| `source-quoted` | Exact source wording, verified locally at the registered locus. |
| `source-backed` | Course paraphrase or notation adaptation; verified source evidence and reviewed scope correspondence. |
| `derived-in-repo` | Written derivation with explicit premises, definitions and evidence dependencies. |
| `numerically-checked` | Named implementation, independent reference, domain, tolerance and reproducible run record. |
| `author-stipulated` | Explicit author choice, with its scope and consequences separated. |

Presentation is independently typed:

```text
proof-included
proof-omitted-Lehramt
proof-expansion-linked
```

“Stated without proof for Lehramt” is a presentation choice. A locally sourced textbook theorem can retain its full source-backed status while omitting its proof. An unproved new claim cannot become acceptable by selecting that presentation.

### C.3 CLAIMS and PROVENANCE records

A claim record contains:

```text
id, kind, canonical statement, hypotheses
definition_ids, convention_ids, evidence_type
evidence_dependencies, provenance_ids
derivation/test paths, author, review receipt
presentation variants, owning artifacts
```

The `PROVENANCE` ledger contains:

```text
id, supported claim IDs and exact support scope
source key, source/payload hash, extraction hash
member path, page/line/time window, equation/theorem anchor
whole quote, normalization rule, verified match offsets
source hypotheses, course correspondence, reviewer
rights classification
```

Quotes must match wholly and contiguously within the stated window. Permit declared whitespace normalization only. Do not silently remove words, reverse inequalities, normalize signs or accept a matching substring as sufficient evidence.

For example, local Plavala `basic_v3.tex:4` contains the contiguous phrase “real, finite-dimensional vector space”. Its member hash is:

```text
ab317d371c85b9f8b3b823300f6746b3947d0e1674e546332a6dd200d72905ec
```

That evidence establishes the stated scope. It does not establish an infinite-dimensional extension.

A matched quote proves neither entailment nor correct application. Review must compare the source hypotheses with the course claim and inspect surrounding text.

### C.4 Derived support

Compute support from the selected evidence route:

- Missing, stale, refuted or unsupported dependencies block admission.
- An additional modeling assumption produces a visible conditional qualification naming its ID.
- Numerical evidence supports the specified computation or finite test domain; it cannot establish a universal theorem.
- A derivation depending only on numerical evidence cannot print as analytically established.
- Alternative evidence routes are explicit. An unused source or failed experiment must not silently become a supporting dependency.
- Cycles and unresolved dependencies fail.

A correctly sourced theorem does not need an in-repository proof DAG of all the textbook’s lemmas. The source statement is the evidence boundary.

### C.5 Derived zoom annotations

Maintain separate graphs for evidence and learner prerequisites.

For each presentation node, record required concepts and a reviewed local depth requirement. Derive its minimum mathematical zoom from the maximum depth of its prerequisite closure. Calculate statement and proof-expansion views separately.

Do not derive difficulty from evidence status. A proof omitted for Lehramt is not less true; a numerical check is not automatically an elementary explanation.

Keep TJO’s physical scale route separate:

```text
GPT -> single system -> many particles -> Fock space
    -> ensembles -> thermodynamics
```

Transitions asserting approximation, information loss or emergence require their own assumptions and claims. The route itself is an author-selected organization.

The PDF includes all admitted expansions and their references. HTML may hide them initially, but cannot introduce essential scientific content absent from the canonical PDF.

### C.6 Author deviations and P0–P5

Register the operational framing and incremental postulate sequence as TJO’s presentation stipulations, with pointers to the brief and approved author text.

A source may motivate a stipulation. It does not establish that TJO’s exact choice is universally required.

The initial Tier A review must resolve these scope issues:

- Whether the course starts with finite-dimensional GPTs or an explicitly sourced infinite-dimensional framework.
- Whether P2 discusses all states on \(B(\mathcal H)\), normal states, or both; density-operator and vector-state statements must use the corresponding scope.
- The distinction between an effect, a POVM and an instrument. State-update data cannot be supplied by an effect alone.
- The designated observable/effect space and any no-restriction assumption in P3.
- The precise symmetry hypotheses behind Wigner statements and the continuity assumptions and source for P5.
- The hypotheses of each preparation or measurement uncertainty inequality.

An author stipulation can choose a model or vocabulary. It cannot make a contradictory mathematical property true or excuse an incorrect physical prediction.

## D. Figure, demo, game and video correctness

### D.1 Common asset contract

Every scientific asset has an immutable ID and a machine-readable companion record:

```text
asset ID, kind, owning concepts and language variants
formula/claim IDs, definition and convention IDs
physical model, units, parameters and valid domain
data generator, code hash, reference implementation
data hashes, seeds, tolerances and test coverage
render transforms, labels, approximation disclosures
review receipt and generated-output hashes
```

Retain the existing formula-provenance header convention. Strengthen it from a descriptive comment to a validated contract. The reference figure demonstrates formula-driven geometry, but the current figure checker only warns about a missing leading comment. [Reference figure](/home/tobias/Projects/theoretical-physics-C/latex/figures/fig_vl11_kasten.tex), [checker](/home/tobias/Projects/theoretical-physics-C/scripts/check_figures.py).

### D.2 Gates

| Gate | Required result |
|---|---|
| **D0: inventory** | Every expected figure, demo, game and video is registered. Every major concept has its required explanatory asset. |
| **D1: model and provenance** | All formulas and physical statements resolve to admitted evidence; units, scope and approximations are explicit. |
| **D2: independent computation** | Golden values agree with an independently implemented Julia reference. Relevant invariants and limiting cases pass. |
| **D3: representation** | Coordinates, scale, colour, projection, interpolation and opacity preserve the declared meaning. |
| **D4: interaction and scoring** | Every control remains inside the verified domain; scoring and feedback resolve to a theorem or tested computed quantity. |
| **D5: bilingual rendering** | Both languages consume identical physics and translated registry labels. |
| **D6: review and freshness** | Independent physics review and visual inspection are recorded against current inputs and outputs. |

A compiling figure or attractive render does not satisfy D1–D3.

For every interactive demo, test its production numerical kernel against Julia. The reference must not import the production implementation or reproduce the same unexamined algorithm. Prefer an alternative method: recurrence versus closed forms, direct matrix calculation versus optimized formulas, or quadrature versus sampling.

Each game must identify its physical success criterion. Difficulty and reward multipliers may be author choices; correctness feedback and optimality claims require evidence. Tests cover deterministic scores, stochastic expectations, limiting cases and invalid strategies.

Video frame sequences consume the same verified dataset or production kernel as the corresponding demo. Each frame records time, parameters and data identity. Check physics for the complete sequence; inspect representative rendered frames and every scene transition for display defects. Camera motion and visual time scaling must not silently imply physical motion.

### D.3 Worked gate: hydrogen orbital cloud

This is a proposed acceptance specification. It is not certification of an implementation already present.

**Model.** Initially support the nonrelativistic Coulomb bound-state model with relative coordinate \(\mathbf r\), nuclear charge \(Z\), and a declared mass convention. Distinguish reduced-mass coordinates from a fixed-nucleus approximation. Spin, fine structure and radiative corrections are outside this initial model and are labelled accordingly.

The operator-domain claim is separate from numerical agreement. Register the self-adjoint Hamiltonian and its domain from the selected Simon/Reed–Simon source; a finite discretized matrix cannot establish self-adjointness of the continuum operator. Simon’s Kato review supplies the relevant theorem and perturbation framework. [Primary review, section 7](https://arxiv.org/html/1711.00528v1).

**Density.** Use normalized eigenfunctions

\[
\psi_{n\ell m}(\mathbf r)=R_{n\ell}(r)Y_\ell^m(\theta,\phi),
\qquad
\rho(\mathbf r)=|\psi_{n\ell m}(\mathbf r)|^2,
\qquad
\int_{\mathbb R^3}\rho\,d^3r=1.
\]

This is spatial probability density per volume. It differs from the radial marginal \(r^2|R_{n\ell}(r)|^2\). The model and normalization have independent teaching-source precedents in [MIT’s hydrogen notes](https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/e34ceed6a6ec944a3c761fcbbf48be5f_MIT8_04S16_LecNotes22.pdf); acquire their local copy before using them as course evidence.

Fix and register spherical-harmonic normalization, phase convention and generalized Laguerre convention. Real \(p_x,p_y,p_z\) orbitals are declared normalized combinations; they are not interchangeable with individual complex \(m\)-eigenstates.

**Initial domain.** Support \(1\leq n\leq4\), all allowed \(\ell,m\): 30 complex eigenstates. Add real combinations explicitly. Every exposed additional state or superposition extends the contract and tests.

**Sampling.**

- Sample radial position from the normalized radial marginal and direction from \(|Y_\ell^m|^2d\Omega\).
- Uniform polar angle is invalid unless justified by the target distribution.
- Alternatively use Cartesian rejection sampling with a separately checked envelope.
- Draw equal-weight probability samples. Do not weight sampled points by density a second time.
- Choose a truncation radius whose omitted probability is at most \(10^{-6}\); record the omitted mass and conditional sampling rule.
- Record the PRNG, seed, algorithm and sample count.

For a normalized \(1s\) state, with \(b=Z/a_\mu\), use analytic checks derived from

\[
\rho_{1s}(r)=\frac{b^3}{\pi}e^{-2br},\qquad
F_{1s}(r)=1-e^{-2br}(1+2br+2b^2r^2).
\]

The reference derivation must be admitted before these become golden tests.

**Proposed tolerances.** These are engineering acceptance limits, subject to Tier A review before implementation.

| Check | Acceptance |
|---|---|
| Julia quadrature of full normalization | Absolute error \(\leq10^{-8}\). |
| Production Float64 density at golden points | Error \(\leq10^{-12}\rho_{\max}+10^{-10}|\rho_{\rm ref}|\). |
| GPU Float32 density, if computed in shaders | Error \(\leq10^{-6}\rho_{\max}+10^{-5}|\rho_{\rm ref}|\). |
| Truncated probability mass | Tail \(\leq10^{-6}\), checked independently. |
| Sampling census | \(10^6\) fixed-seed samples per tested state; radial CDF error \(\leq0.004\), plus preregistered angular and spatial-bin checks. |
| Nodes | Correct locations and density values within the declared numerical tolerance. |
| Stationary eigenstate sequence | Density invariant under time evolution within kernel tolerance. |
| Superposition sequence | Interference and normalization agree with independent Julia values at every generated time sample. |

The sampling contract records the number of comparisons and a family-wise statistical error budget. Seeds are fixed before running; failures cannot be repaired by selecting another seed.

**Rendering.** A cloud is a statistical representation of the density, not a trajectory. Declare point-sprite size or smoothing bandwidth. Perspective, occlusion and tone mapping mean projected brightness is not automatically proportional to three-dimensional density.

If density controls opacity, document and test that transfer function. For volume rendering, use a step-size-consistent opacity rule and verify the field before compositing. Density remains nonnegative; phase/sign colour belongs to a separately labelled quantity.

**Existing red fixtures.** The current source prints the \(2p,\ m=\pm1\) coefficient as \(1/(8\sqrt{2\pi})\). With its other factors, direct integration gives

\[
\int|\psi_{21,\pm1}|^2\,d^3r
=\frac{24\cdot8}{128\cdot3}
=\frac12.
\]

This follows from the printed expression and exact elementary integration; it is not a Julia test performed during this task. [Printed function](/home/tobias/Projects/theoretical-physics-C/latex/lectures/de/vl16.tex:94).

The same chapter prints a negative leading \(x^2/2\) term in \(L_2^s\), whereas the standard generalized Laguerre convention has a positive term. [Local expression](/home/tobias/Projects/theoretical-physics-C/latex/lectures/de/vl16.tex:85), [NIST expression](https://dlmf.nist.gov/18.5.E17_5).

Use both as initial failing fixtures. Do not silently normalize away a wrong formula before checking it.

## E. Review cadence adapted from rk

Apply rk’s protections at admission and release boundaries. Scratch notes and design experiments can remain unadmitted. The authoritative precedents are [rk’s model policy](/home/tobias/Projects/rk/CLAUDE.md), [rk-light](/home/tobias/Projects/rk/skills/rk-light/SKILL.md), and its [incident ledger](/home/tobias/Projects/rk/skills/rk-light/references/lessons.md).

### E.1 Roles and cadence

- **Opus:** definitions, physics exposition, derivations and modeling decisions.
- **Sonnet:** implementation, source extraction, generators, checkers and translation mechanics.
- **Codex GPT-6.1:** independent second-family review; `xhigh` for Tier A, `high` for Tier B.
- **TJO:** author stipulations, course scope and unresolved interpretive decisions.

Reviewer differs from author and does not implement the repair in the same session. Record family, model, role and reviewed hashes. Give the reviewer the artifact, contracts and source bytes, not the author’s persuasive account of why it is correct.

One milestone receives one review round and one repair wave. The review returns separate blockers and follow-ups.

After repair, verify the specific findings mechanically against the original review’s acceptance predicates. Record the reviewed snapshot, repair diff, evidence and final release hash. Do not fabricate a fresh reviewer verdict for changed bytes.

If a repair requires a new substantive argument beyond those predicates, the affected unit remains unadmitted. The cap limits review loops; it does not permit releasing known-wrong physics. Reduce scope or withhold the milestone.

After closure, relevant changes invalidate acceptance. Reuse unchanged source-backed claims and numerical results by dependency hash.

### E.2 Tiers

| Tier | Project examples | Review requirement |
|---|---|---|
| **A** | Physics statements and hypotheses; notation/definitions; source-to-course correspondence; P0–P5; uncertainty distinctions; domains; scoring criteria; physical colour/opacity mappings; gate semantics, schemas and tolerances. | Independent review before admission. |
| **B** | Implementations under approved contracts: numerical kernels, sampling, export pipelines, controls, substantial translations and rendering integration. | Batch review at the milestone, with existing tests and fixtures. |
| **C** | Bookkeeping, formatting, file plumbing, nonsemantic typography and mechanically validated fixture additions. | Routine checks; no dedicated review round. |

Classification follows consequences. A colour change that changes the represented physical quantity is Tier A, even if the code change is one line.

Every validity gate ships with a failing fixture and a passing fixture. Verify that a targeted mutation reaches the failing gate. Use incidents from HANDOFF and section D before inventing synthetic cases.

Reports print checked/expected counts, errors and declared exclusions. Missing inputs, malformed records and crashes fail closed. Processes have explicit time and memory bounds.

## F. Bilingual discipline

### F.1 Translation identity

Every bilingual content unit records:

```text
content ID
German revision and content hash
English translation_of_de_hash
shared claim, formula, definition and asset IDs
translation reviewer and status
```

German is authored and reviewed first. English translates that approved revision. A German change makes its English counterpart stale. An English-discovered correction returns to German first.

Use the same physical datasets and computations in both languages. Localization may change prose, decimal presentation and interface text; it may not change units, parameters or scoring behavior without a recorded semantic change.

### F.2 Extend `check_parity.py`

Retain existing structural checks and add:

1. Matching content IDs and current German-origin hashes.
2. Matching hypotheses, claim statuses, source IDs and modeling qualifications.
3. Matching inline mathematics, display mathematics, units and numerical parameters.
4. Matching definition references and generated definition views.
5. Matching demonstrations, controls, domains, defaults, scoring rules and physical data hashes.
6. Complete translation catalogs for captions, tooltips, legends, accessibility text, errors, subtitles and video overlays.
7. Equal scientific coverage across PDF and HTML exports.
8. Explicit exceptions for untranslated quotations and names; no blanket language exclusion.

The current parity checker removes complete `\text{...}` bodies, including embedded mathematics. Preserve and compare embedded expressions such as \(|x|<L/2\) while translating the surrounding prose. [Current normalization](/home/tobias/Projects/theoretical-physics-C/scripts/check_parity.py:231).

Use semantic formula IDs and parsed expressions rather than treating all text wrappers as nonmathematical.

Language-marker scans remain useful diagnostics. They cannot establish correct translation of negation, quantifiers, necessity or sufficiency. The translation review checks these explicitly.

### F.3 Archive preservation

Replace numerical edit allowances in `ENRICHMENT_EXCEPTIONS` with exact records:

```text
old source hash + unit ID + old expression hash
new unit ID + new expression hash
reason + supporting provenance/derivation + review receipt
```

The current `math_edited: N` allowance can excuse an unrelated edit within the same count. [Current comparison](/home/tobias/Projects/theoretical-physics-C/scripts/check_enrichment.py:227).

For the major upgrade, preserve coverage through a migration map:

```text
archived unit -> retained | corrected | relocated | superseded
```

Keep old labels as redirects where practical. Growth ratios and unchanged headings are suitable for light enrichment, but should not dictate the new chapter structure. Corrections require evidence; preservation must not protect an incorrect equation.

## G. Minimal viable process and later work

### G.1 Before the first new chapter

The following must exist and pass:

1. **Process contract:** stable IDs, evidence types, release rules, tiers and ownership.
2. **Source registration:** Plavala and the relevant Theo C snapshot, with manifests, rights records and usable loci.
3. **Initial databases:** all notation, definitions and conventions required by the first chapter; include explicit unresolved choices.
4. **Generators:** one database exporting LaTeX, web JSON, definitions and bilingual labels.
5. **Claims/provenance checker:** whole-quote verification, dependency validation, freshness and truthful coverage.
6. **Red corpus:** altered quote, missing premise, duplicate symbol, duplicate definition, stale translation, incorrect normalization and unregistered asset.
7. **One complete pilot:** an existing small concept rendered in both PDF and HTML, with one formula-derived figure or demo, an independent Julia golden test and bilingual parity.
8. **Review receipt:** one independent GPT-6.1 Tier A review of the contracts and pilot, followed by the bounded repair wave.
9. **Legacy inventory:** known defects and a migration plan for all existing chapters; archived content remains identified as inherited and unadmitted.

This setup need not extract every book or populate definitions for the entire course. It must exercise the complete admission path with real content.

A reviewed chapter is not certification of the comprehensive book. Before the upgraded canonical PDF is released, every included inherited and new factual unit must satisfy the same evidence requirements.

### G.2 Before each later artifact appears

Do not postpone its correctness contract:

- First hydrogen cloud: normalization, basis, sampling and rendering gates.
- First game: scoring and feedback evidence.
- First video: verified frame-data lineage and bilingual narration/subtitles.
- First Fock chapter: registered source, normalization and operator-domain conventions.
- First uncertainty chapter: separately registered preparation and measurement inequalities.

### G.3 Work that can wait

A database UI, generated SQLite search index, graphical claims DAG, broad automatic rehydration, exhaustive cross-browser matrices, large performance suites and formal proof escalation can follow demonstrated need.

Keep the initial tooling local and small. The source and definition registries, independent reference tests, reviewer separation and release coverage cannot wait.

## Recommendations

1. **Establish the admission contract before drafting.** Use versioned JSON, generated notation/definition views and a small local checker. Trade-off: modest initial setup prevents multiple competing mathematical vocabularies.

2. **Register Plavala and decide the finite/infinite-dimensional boundary first.** Trade-off: limiting the initial scope simplifies teaching; a broader framework requires additional sources and sharper definitions.

3. **Treat archive preservation and physics verification as separate gates.** Replace count-based exceptions with exact transformations. Trade-off: more migration records permit justified corrections without weakening regression protection.

4. **Make independent Julia checks mandatory for every demo and physical scoring rule.** Trade-off: maintaining a second implementation costs work but detects shared formula, normalization and algorithm errors.

5. **Use hydrogen as the numerical acceptance pilot.** Its existing normalization and polynomial errors supply real red fixtures. Trade-off: early attention to one demanding example tests the process more effectively than many superficial fixtures.

6. **Bind every language and medium to shared semantic IDs and hashes.** Trade-off: constrained authoring reduces freedom to improvise labels while making drift detectable.

7. **Review once per milestone and withhold unresolved incorrect content.** Trade-off: bounded reviews may reduce release scope; they avoid indefinite review loops without lowering the correctness requirement.

## Open questions for TJO

1. Should the opening GPT treatment be finite-dimensional, with infinite-dimensional systems introduced later, or should the initial framework cover both?

2. In P2, should the main teaching track use normal states/density operators, with general states on \(B(\mathcal H)\) in an expansion? How should the broader pure-state statement be presented?

3. Which departures from Ludwig–Werner and which parts of P0–P5 should be stated explicitly as your adopted framework?

4. Which exact Bratteli–Robinson, Reed–Simon and Ludwig editions should be authoritative, and what authorized local copies are available?

5. Should new operator notation retain the existing hat convention throughout? Which global symbol collisions should be resolved by changing notation?

6. Should the first hydrogen renderer use reduced mass by default, or the script’s fixed-nucleus approximation with an explicit alternative?

7. What publication license should govern your new text and generated media, and what permission exists to reuse Astwood’s notes?

8. Does “at least one picture per page” mean every substantive PDF page, allowing documented exceptions for references and indexes?