# Handoff: Theoretische Physik C

## Repo

`/home/tobias/Projects/theoretical-physics-C` — git, `master`; origin https://github.com/tobiasosborne/theoretical-physics-C.

Modelled on `../generalrelativity`: same build/CI shape, adapted for a
two-language course.

## Status

**2026-10-29: lectures 3 and 4 at the new level (course C3 and script v0.3 chapters 3-4).**
Brief and TJO's decisions: `docs/plan/lec34/BRIEF.md` (hats on operators, none on the identity,
states, Pauli matrices or ket-bras; budgets are guides, exceptions stated with reasons, no
counting hacks; standard linear algebra accepted as a prerequisite; G-0072 answered and closed).
Course: vl04 migrated into C3 as c03.s8-s12 (Kern) plus Vertiefungen c03.v5 (bounded vs
unbounded, symmetric vs self-adjoint) and c03.v6 (right shift), figure `c03.fig.spektren`;
registry D87-D94, CONV-HAT, D17/D18 rewritten; provenance P-0318..P-0330, receipt R-0153;
vl04 map (90 items) and `check_vl04_map.py` in ci.sh; M-0052..M-0063 for the vl04 defects;
hats swept through c02 and c11. Script: `vl03`/`lec03` and `vl04`/`lec04` rewritten as the
kernel of c03.s4-s12 (sync tables `docs/plan/script-v0.3/sync-ch3.md`, `sync-ch4.md`; budget
exceptions with reasons in `NOTES-ch3.md`, `NOTES-ch4.md`); M-0005, M-0017..M-0024 and
M-0052..M-0063 applied; snapshot `sources/tpc-script-v0.3.1` (record its commit hash in
`identifiers.git_commit` next); chapters 3+4 take 8 pages instead of 9. The running-head bug
(page before a lecture start showed the next lecture's title) is fixed in `tpc-course.sty`.
Reviews (codex gpt-6.1-sol xhigh; muse for a student's second opinion): REVIEW-lec3-second,
REVIEW-ch3, MUSE-ch3, REVIEW-ch4, MUSE-ch4, evidence/derivations/c03/REVIEW-lec4, and a
re-review of both repair waves `docs/plan/lec34/REREVIEW-repairs.md` (all closed). Gates run
individually and in parallel, all green: parity, figures (22 standalone + inclusion),
enrichment, registry, special functions, tokens, content lint, levels lint and the four-edition
course build with K1-K6, the full web check with browser gates, evidence private and public,
the four map checks, every red-corpus group, c03/c11 maths, both masters (DE 88, EN 84 pages,
0 errors, 0 undefined references). Julia gates not run: no kernel or numerics file changed.
Open: the demo `c03.demo.spektren` (not built; the figure is static); gaps G-0073 (photon-number
remark), G-0074 ("Observablen" vs "scharfe Observablen"), G-0075 (hat-exception wording),
G-0077 (chapter-4 cuts) for TJO; script chapters 5-22 still write operators without hats (the
seam is printed in chapter 4); the CI redesign (measured: course editions ~8-9 min, Julia ~6,
Python ~4, masters ~3, all serial and uncached; plan in the 2026-10-29 session: remove
duplicates, fix the `ci.sh` build gate that can pass without a PDF, parallelise, then
content-hash caching and affected-only runs; codex input/output audit kept in the session
scratchpad, not in the repo).

**2026-10-26: new machine; everything builds and the full `./ci.sh` passes (6 stages, 29
contract gates).** Fresh Linux Mint 22.3: TeX Live 2023 from apt (`texlive-full`, the same
release as the Pages runner), node 24.11.1 through nvm, Playwright's Chromium, Julia through
juliaup, `python3-sympy`, `python3-mpmath`, `python3-scipy`. The commercial print faces are local
again: MathTime Pro 2 and Lucida in TEXMFLOCAL with their maps in
`/usr/local/share/texmf/web2c/updmap.cfg`, the OpenType faces (Times LT Std, Whitney, ...) in
`~/.local/share/fonts`. Debian's `OSFONTDIR` is only `/usr/share/fonts`, and `tpc-style` asks for
Whitney by file name, so that directory is linked into `~/texmf/fonts/opentype/`. Two fixes
that a clean machine exposed: (1) `tpc-course.sty` chose the end-of-proof box by
`\ifdefined\setmathfont`, but mathspec (the mtpro2 path) defines `\setmathfont` as well, so
`./build.sh --local-fonts` failed on the missing `\mdlgwhtsquare`; it now tests the symbol
itself. (2) The static demos gate (`web/tools/checks/static.ts`) required bundles for the test
chapter c99, which the site build leaves out; the old machine passed only on stale c99
bundles in `build/web/` from 2026-10-11. It now requires bundles only for the chapters the
site contains and still checks the registration of every chapter. The golden files carry
the generating Julia version and are compared byte for byte; all nine were regenerated under
Julia 1.13.3, and only that stamp line changed. Open: `vl05.tex`/`lec05.tex` type the minus
sign as U+2212 in maths (12 places); under mtpro2 it falls back to a Latin Modern glyph
(print edition, German pp. 21 and 24). Replacing it with `-` needs a migration record.

**2026-10-22: script v0.3, chapters 1 and 2 as the kernel of the new course, new design.**
TJO's request and the rules: `docs/plan/script-v0.3/BRIEF.md`. The main script
(`latex/Theor*.tex`) is now typeset in the course design (`tpc-course` option
`layout=script`, pkg 1, STIX Two, open fonts; `./build.sh` default, `--local-fonts` for the
commercial faces) with a "compact kernel, full course on the web" notice on the title page.
`vl01`/`lec01` and `vl02`/`lec02` were rewritten as the Kern of C0, C1 and c03.s1-s3 within
the v0.2 budgets (words, displays, definitions; chapters 1+2 now 8 pages, were 9); every
item maps to the course in `sync-ch1.md`/`sync-ch2.md`. One codex gpt-6.1 review
(`REVIEW.md`) and one repair wave (in the NOTES files). The v0.2 text of the four files is
kept as Git members of `sources/tpc-script-v0.2`; maps, registry and enrichment read it from
there (`scripts/evidence/snapshot.py`); the live files are `sources/tpc-script-v0.3` (no
commit hash recorded yet: write it into its source.json and the ten applied records' notes,
then `pin_snapshot.py` + `check_evidence.py --private`). Committed on TJO's instruction
before the full `./ci.sh` had finished; all non-build gates passed (evidence, parity,
enrichment, figures, maps, registry, red corpus). Open: overfull displays in vl08 (table),
vl12, vl14, vl15, vl20 and two lines of lec01 under the narrower measure;
`scripts/check_lecture.sh` still uses the old style; open questions for TJO in the NOTES
files (titles, ℓ² named but not defined, M-0010 and "applied by removal").

**2026-10-21: student-facing site on GitHub Pages.** TJO is sharing the repo with the
students, who will not compile anything and mostly read on phones. `README.md` now opens
with a bilingual "Für Studierende · For students" table of direct links, and
`scripts/publish_pages.sh` builds everything with open fonts only (the font gate in the
script refuses any PDF that embeds MTPro2, Whitney, Times LT Std, Minion or Baskerville),
assembles `build/pages/` (landing page `scripts/pages/index.html`, `pdf/` with the two
complete-script PDFs built `--cmfonts` and the four course editions, `web/` with the chapter
site minus c99, `VERSION`). The workflow `.github/workflows/pages.yml` runs that script with
`--no-push` on every push to master on a GitHub runner (TeX Live 2023 from apt, Iosevka from
its release zip, node) and deploys `build/pages/` to GitHub Pages at
https://tobiasosborne.github.io/theoretical-physics-C/ (Pages build type `workflow`). So the
students' links update themselves after every push. The script can also push the tree
itself as the orphan branch `gh-pages` (its default without `--no-push`), but on
2026-10-21 this machine's upstream measured about 16 kB/s (`curl` upload test) and GitHub
answered every pack above a few hundred kB with HTTP 408, so that path is a fallback only.
`\mbf` was added to the Computer Modern branch of `latex/tpc-style.sty`; `build.sh --cmfonts`
had been broken by it.

**2026-10-21: Lecture 3 (vl03) migrated into chapter C3.** `latex/lectures/de/vl03.tex` is
migrated into `content/c03-hilbertraum/` as new Kern sections c03.s4 (Dirac-Notation),
c03.s5 (Skalarprodukte), c03.s6 (Hilbertraum, transcluding registry D14), c03.s7 (Basen,
with subsection c03.s7.1 Gram-Schmidt), the Vertiefung c03.v4 (bases with a countable
infinite index set, after Reed-Simon I section II.3) and the figure c03.fig.vollst with the
interactive demo c03.demo.vollst (kernel functions in `web/src/kernels/hilbert.ts`, golden
values from `numerics/generate/hilbert_golden.jl`). The vl03 subsection "Operatoren" is
deferred to Lecture 4 (vl04) in the map. New registry rows: definitions D81-D86, notation
sym.ket, sym.bra, sym.norm, sym.kronecker-delta; the macros `\ket`, `\bra`, `\norm` were
removed from `registry/allowed-tex.json` so the registry is their only owner. D14's body was
extended with the meaning of "vollständig" (TJO should see this). Evidence: claims
`c03.cl.*`, derivations under "Lecture 3" in `evidence/derivations/c03/DERIVATION.md` with
`check_c03.py`, provenance P-0152..P-0164 (Reed-Simon I page images), and an independent
page-image check by codex gpt-6.1 recorded in receipt
`evidence/receipts/reviews/R-0152.json`. The migration map is
`evidence/migrations/maps/vl03-map.json`, checked by `evidence/migrations/check_vl03_map.py`
(wired into `ci.sh` as "vl03 migration map complete"). Migration records M-0017..M-0024
cover the vl03 defects: psi_j for phi_j in the expansion, the Gram-Schmidt footnote, the
completeness condition quantified over j,k, a missing `\langle`, typos, the `\emph` boundary
at lines 188-189, the ambiguous "diese Liste", and typos in the deferred Operatoren part.
All are `recorded`; none is applied to vl03.tex. Two codex gpt-6.1 reviews exist:
`docs/review/lectures/REVIEW-lec3.md` (voice and correctness) and
`evidence/derivations/c03/REVIEW-lec3.md` (page-image provenance, mathematics, migration
records). One repair wave closed every finding, but the repaired prose itself has had no
second review. The new gaps row G-0072 in `evidence/gaps.json` lists what was left out for
TJO: the spoken |e_±> remark, the Schwarz-behind-uncertainty sentence, the dropped dimension
count, Gram-Schmidt always giving a basis, and the Kern/Vertiefung split for bases. Sums
over uncountable index sets are absent from the course by the repair's choice. Next: Lecture
4 (vl04, operators) goes into C3 by the same recipe (author, two codex reviews, repair,
demo); the vl03 Operatoren items are already in the vl03 map as deferred.

**2026-10-20: Lectures 1 and 2 drafted, every figure of C0, C1, C3 an interactive demo.**
Commits 2ca1f61 and eac21e6 cover this. Lecture 1 (C0, C1 from vl01) was revised in TJO's
voice, with history dates corrected against NobelPrize.org. Lecture 2 is a new C3 from vl02:
complex vectors, the Kreuz-Operation, and the scalar product in Kern; l^2 and L^2(R) in
Vertiefung; Cauchy-Schwarz, equivalence classes and completeness in Fundament. The vl02
migration map and M-0013..M-0016 are in place. There are 20 demos across c00, c01 and c03,
with golden values from Julia references. The reviews are under `docs/review/lectures/`.

**2026-10-20: public release audit.** The repo is published at
https://github.com/tobiasosborne/theoretical-physics-C under AGPL-3.0-or-later (`LICENSE`).
Six classification passes (Sonnet for docs, archive, evidence; Haiku for LaTeX, code, red
corpus) found no secrets and no book text. Excluded from the public tree and purged from
history, see the "Public-release exclusions" block in `.gitignore`: `archive/corrections/`
(student-submitted corrections with names and a private email), `archive/admin/` (exam topic
cards, consent-form template), every compiled PDF that embeds subsets of the commercial fonts
(MTPro2, Whitney, Times LT Std, Minion), and the sources-inventory lane report, which lists
local copies of third-party books and private folders. The wording "lawfully acquired" /
"origin of the scan is not recorded" was dropped from `sources/*/rights.json` and
`source.json` and the private receipt regenerated. Licence mentions changed from Apache 2.0 to
AGPL. All of this is reversible by editing `.gitignore`. The history was rewritten with
`git filter-repo` (commit map in `.git/filter-repo/commit-map`, pre-rewrite bundle kept by TJO);
the snapshot commits pinned in `sources/*/source.json` were remapped to the new hashes and the
four untracked PDFs dropped from the member lists and the manifest.


**2026-10-09: a planning campaign for a major upgrade is complete and landed in
`docs/plan/`.** Read `docs/plan/BRIEF.md` (TJO's requirements, verbatim), then
`docs/plan/PLAN.md` (the assembled plan, draft v1), then the lane reports under
`docs/plan/research/<lane>/REPORT.md`. The script itself is unchanged by that campaign
and the status below still holds for it.

### The upgrade campaign in one paragraph

TJO wants one comprehensive print PDF with a gentle Lehramt route (Kern) and optional
depth (Vertiefung, Fundament), one HTML page per chapter with three.js demos, real games,
3D videos, one coherent design, two languages, and physics that is correct and
ground-truthed everywhere. The physics path runs GPT -> single-system QM -> many
particles -> Fock space -> statistical mechanics -> thermodynamics. Nine lanes (Opus,
Sonnet, codex gpt-6.1 xhigh; no Fable) researched it and built evidence: a working
two-edition LaTeX prototype with a checker (`docs/plan/research/layered-docs/prototype/`),
five design packages with compiled print and rendered web specimens
(`docs/plan/research/design-packages-{A,B}/specimens/`), two token compilers, a 22-chapter
curriculum with hazards and a notation pre-inventory, 105 demo/game/video ideas with
correctness tests, and architecture and rigour-process designs. `PLAN.md` section 1.2
lists the ten decisions only TJO can make.

**2026-10-11: TJO answered D1-D10; they are recorded in `PLAN.md` section 1.3.** In short:
MTPro2 in print and STIX Two online; light video ground by default with dark as a flag; all
five design packages built behind feature flags; finite-dimensional Kern; the proposed depth
names; three smoke tests in Phase 0 (first lecture, hydrogen, GPT foundations); everything
on GitHub; commercial fonts never leave the local machine. Reed-Simon I-IV,
Cycon-Froese-Kirsch-Simon and Bratteli-Robinson 1-2 are now in `~/Downloads` (hashes in
section 1.3), unpacked with extracted text into the gitignored `sources/<key>/`; only
`sources/MANIFEST.sha256` is tracked. Hydrogen is to be done as the full two-body problem
with the reduced mass (locus: Reed-Simon III, XI.4, p. 55), and work proceeds without the
sources still missing. Phase 0a is unblocked and not started.

The first codex review run (2026-10-09) hit its time limit and wrote no `REVIEW.md`; its
log is `codex-run1.log`. A second run with an addendum to `PROMPT.md` was started on
2026-10-11 with `timeout 5400`.

### Phase 0 in progress (2026-10-11, coordinator's log)

The working contract for Phase 0 is `docs/plan/phase0/COORDINATION.md`; the coordinator's
decisions on TJO's behalf are `PLAN.md` section 14; the codex plan review
(`docs/plan/research/review/REVIEW.md`) is folded into `PLAN.md` section 13. Nothing of
Phase 0 is committed. Status of each package is kept in the table at the end of this file
("Phase 0 status").

### Verified defects in the current script

Update 2026-10-12: the two `vl16` defects below are fixed in `vl16.tex` and `lec16.tex`
(migration records `evidence/migrations/M-0001.json`, `M-0002.json`, status `applied`;
`ENRICHMENT_EXCEPTIONS` entry for lecture 16; report in
`docs/plan/phase0/review/CODEX-migration-vl16-final.md`). The English edition of the old
script now builds to 81 pages (`./ci.sh`, stage Build). The `vl22`, `vl19`/`a_0` and `vl04`
items are recorded as M-0003..M-0005 and not applied. The three `vl01` wording slips listed
under "Next" exist only in the archived v0.1; v0.2 already has them corrected (checked by the
Smoke A review).

All inherited from v0.1 and present in both editions. Each needs a fix in the German,
then the English, then an `ENRICHMENT_EXCEPTIONS` entry (or, under the plan, a migration
record). Verified independently by two lanes and by the codex review:

- `vl16.tex:85` the generalised Laguerre polynomial `L_2^s` has `-x^2/2`; it must be
  `+x^2/2` (DLMF 18.5.12).
- `vl16.tex:94` `psi_{21+-1}` has prefactor `1/(8 sqrt(2 pi))`, norm squared 0.5; it must
  be `1/(8 sqrt(pi))`, and the Condon-Shortley sign for m=+1 is missing.
- `vl22.tex:25` the canonical-ensemble Lagrangian carries `+beta tr(rho H)`, which gives
  `rho ~ exp(+beta H/k)`; the sign contradicts the stationarity equation that follows.
- `vl19.tex:21` `k_B = 1.38064852e-23` is CODATA 2014; since 2019 it is exactly
  `1.380649e-23 J/K`. `a_0` in `vl16.tex` is likewise a superseded CODATA value.
- `vl04.tex:70` "hermitesch (Synonym: selbstadjungiert)": true for matrices, false in
  infinite dimension. The codex review notes the file defines Hermitian as `A^dagger = A`,
  so this is a scope omission rather than a false equation.

### Pending when the session closed

- The codex hostile review (`docs/plan/research/review/REVIEW.md`) was still running; its
  prompt is `PROMPT.md` beside it. If `REVIEW.md` is absent, re-run:
  `timeout 3600 codex exec -s read-only -c model_reasoning_effort="xhigh" -o docs/plan/research/review/REVIEW.md - < docs/plan/research/review/PROMPT.md`
  then fold its sections A (contradictions), B (verifications), G (corrections) into
  `PLAN.md` with a dated note.
- `docs/plan/research/curriculum/plavala-src/` (arXiv source, gitignored) and the Teschl
  PDF (scratchpad only) must never be committed.
- Shallow clones of TJO's `presentations`, `mathtime-otf`, `quantumcomputing`,
  `quantum-noise-and-decoherence` repos and of `mastwood/advancedquantum` (the student
  notes for TJO's 2016 advanced QM course, playlist
  https://www.youtube.com/playlist?list=PLDfPUNusx1Eo60qx3Od2KLUL4b7VDPo9F) lived in the
  session scratchpad and are gone; re-clone when needed.

### The script (unchanged by the campaign)


**Complete and green.** `./ci.sh` passes all five stages. Both editions
build: German 84 pages, English 80 pages, zero LaTeX errors and zero
dangling references in either. All 22 lectures are in structural parity,
and all 22 figures are drawn, placed, reviewed and language-switched.

| Stage | State |
|-------|-------|
| Archive of the original materials | done |
| Bilingual LaTeX toolchain, `build.sh`, `ci.sh` | done |
| Transcripts of all 25 lecture videos | done |
| Video ↔ script mapping | done |
| **Script v0.2 (German), commentary folded in** | **done** |
| Lecture figures | 22/22 drawn, placed and independently reviewed |
| English edition | 22/22 translated, all in parity |
| Parity CI | green |

## What was done

### Archive

The source zip is unpacked and sorted into `archive/`. `Vorlesungen23–26`
in it are **Theoretische Physik A** (Zweikörperstoß, lineare Algebra,
Eigenwertprobleme, starrer Körper), not part of this course — the original
master file has them commented out. The course is `vl01`–`vl22`.

`archive/third-party/` holds Prof. Hammerer's script. It is gitignored and
was never processed: it is not ours to redistribute.

### Transcripts

`scripts/fetch_transcripts.py` pulls YouTube's original-language (`de-orig`)
auto-captions for all 25 videos. The distro `yt-dlp` (2024.04) is too old for
the current playlist API and silently returns zero entries; a current binary
is vendored at `_work/bin/yt-dlp` and the script prefers it.

The raw ASR garbles technical vocabulary badly — "kalla produkt" for
Skalarprodukt, "rektor" for Vektor, "The warble" for Observable. So
`transcripts/clean/v01–v25.md` are reconstructions, rebuilt against the
script (which is the authority for notation), each separating what the
lecture covered from the commentary that never reached the written notes.
515 such passages are flagged across the course.

`transcripts/MAPPING.md` records the video ↔ lecture correspondence and how
it was derived — by counting timestamped outline rows per script section
rather than trusting per-video self-reports, then checking every conflict
against the `.tex` sources. The primary chain is strictly monotonic.

### Script v0.2

265 additions across the 22 lectures; prose grows 11,177 → 19,126 words.
Everything from v0.1 is preserved, and `scripts/check_enrichment.py`
enforces that against the archived original.

The largest gap closed was `vl17`/`vl21`: the composite-system Hamiltonian
$\widehat H_1 \otimes I + I \otimes \widehat H_2$ is now stated and labelled
in `vl17`, and `vl21` — previously 152 words for a 90-minute lecture — now
derives the equilibrium condition from it and explains why logarithmic
derivatives appear.

### English edition

22 lectures translated from the German, which leads. Prose 20,193 → 23,309
words. `scripts/check_parity.py` holds the two editions together: same
sectioning, same display equations symbol for symbol (after stripping
`\text{...}`, which is legitimately translated), same environments under
the German/English name pairs, same labels, references, figures and
key-equation boxes, and no untranslated German.

### Errors found in v0.1

Ten in total. Each is recorded in `ENRICHMENT_EXCEPTIONS` in
`scripts/check_enrichment.py` with its justification, and most cite the
timestamp in the lecture video where the corrected version is said at the
board — none was changed on an agent's say-so alone.

The two that change physics:

- **`vl12`** — the ground-state ODE read $d\phi_0/dx = -(m\omega/\hbar)\phi_0$,
  missing its factor of $x$. As written it follows neither from
  $\langle x|\widehat a|\phi_0\rangle = 0$ nor from the Gaussian printed on
  the next line.
- **`vl22`** — $\langle\widehat H\rangle = \sum_j E_j e^{-\beta E_j}/\mathcal Z$
  was equated to $+\frac{1}{\mathcal Z}\frac{\partial\mathcal Z}{\partial\beta}$.
  Since $\partial_\beta \mathcal Z = -\sum_j E_j e^{-\beta E_j}$, that set a
  quantity equal to its own negative.

The rest: a stray `\\` before `\end{align}` in `vl12` that was a hard LaTeX
error truncating the build at 33 pages; Hermite polynomials stated in $x$
though defined in $z$; `d/dx` for `d²/dx²` in the stationary Schrödinger
equation in both `vl11` and `vl13`; `∂²/(∂x∂z)` for `∂²/(∂x∂y)` in the
$[L_1,L_2]$ working in `vl14` (it cancels, so the commutator was never
wrong); a duplicated `\label{eq:amcr}` in `vl17` that made a `\ref` resolve
to the wrong equation; the photoelectric-effect box in `vl01` using $\nu$
for both velocity and frequency; and literal Unicode `Ψ`, `∈`, `−` with no
glyph in the maths font.

Three wording slips were left alone under the no-deletion rule; they are
listed under "Next".

## Next

Nothing is outstanding for the course itself. Worth doing at some point:

1. **Cosmetic**: `fig_vl09_unschaerfe` emits 15 `nullfont` warnings inside
   the full document although it is clean standalone, and the rendering
   shows no defect. Not chased down.
2. **Three v0.1 wording slips** the enrichment agents reported but left
   alone under the no-deletion rule:
   - `vl01` "eine endliche Menge ist.Menge ist." (doubled), "die Summer der
     Messwerte" (typo), "Dividiert durch N" outside maths mode
   - `vl02` "einen unendlich dimensionalen Vektorraumes" (case)
   - `vl03` the expansion formula writes $|\psi_j\rangle$ for
     $|\phi_j\rangle$; Gram-Schmidt says $|\Phi_k\rangle = 0$ for
     $|\Psi_k\rangle = 0$ (its own footnote says so). The English edition
     carries these across verbatim, as instructed — fixing them means
     fixing the German first, then the English, then adding an
     `ENRICHMENT_EXCEPTIONS` entry.
   - `vl03` line 188/189: the closing quote and trailing word sit inside
     `\emph{}`, so they typeset italic.
3. **Notation**: `vl04` declares the hat convention for operators, but the
   surrounding v0.1 text still writes $A, B, C$ bare while the new figure
   writes $\widehat A$. Making that consistent touches `vl03`–`vl05` and is
   a deliberate editorial decision, so it was left.
4. A web edition, following the `web/` pipeline in `../generalrelativity`.

## Layout

```
latex/
  TheoretischePhysikC.tex     German master — the leading edition
  TheoreticalPhysicsC.tex     English master
  tpc-style.sty               [german]/[english]/[cmfonts]; theorem envs
                              exist under both language names, one counter;
                              \tpcifenglish{EN}{DE} for figure prose
  tpc-macros.sty              QM/stat-mech macros in the script's own
                              notation (\widehat, \mathcal{H}, \tr)
  tpc-tikz-templates.sty      tpcplot / tpcpotential / tpclevelplot / tpc3d
  lectures/de/vl01–vl22.tex   German lectures (v0.2)
  lectures/en/lec01–lec22.tex English lectures
  figures/fig_vlNN_*.tex      22 figures, one file serving both editions
transcripts/
  raw/                        auto-captions (gitignored, regenerable)
  clean/v01–v25.md            reconstructed lectures
  MAPPING.md, mapping.json
archive/                      the original materials, sorted
scripts/
  fetch_transcripts.py  check_parity.py  check_enrichment.py
  check_figures.py      tikz-preview.sh   check_lecture.sh
build.sh   ci.sh   README.md
```

## Build and check

```bash
./build.sh --de            # German edition
./build.sh --preview F     # render one figure to PNG
./ci.sh                    # structure → parity → enrichment → figures → build
./ci.sh --fast             # skip the PDF builds
./ci.sh --install-hook     # run --fast on every commit
```

`scripts/check_lecture.sh N de|en` compiles a single lecture in a temp
directory — safe to run many at once, which is what lets parallel agents
check their own work.

## Conventions worth keeping

- **The German edition leads.** Content changes go there first, then across.
- **Figures are one file, both editions.** Prose inside a figure goes through
  `\tpcifenglish{English}{Deutsch}`; symbols stay bare. That is also what
  lets `check_parity.py` compare the two editions' figure sets directly.
- **Figure geometry comes from the formula**, never freehand.
  `fig_vl11_kasten.tex` is the reference: colour carries the quantum number,
  reference lines are neutral grey, forbidden regions are hatched so they
  survive greyscale printing.
- **Enrichment adds, never rewrites.** `check_enrichment.py` fails if a v0.1
  equation, label, heading or environment goes missing. Intentional
  departures get an `ENRICHMENT_EXCEPTIONS` entry with a reason.

## What the review and translation passes turned up

The independent figure review found something to fix in **every one of the
22 figures**. Two were physically wrong:

- `fig_vl01_planck` drew the Rayleigh-Jeans parabola for 4000 K, but on an
  axis running to $8.8\times10^{14}$ Hz it sat almost exactly on the
  *6000 K* Planck curve — so the figure asserted the opposite of its own
  caption. $U_{RJ} \approx U$ only holds for $h\nu \ll kT$, a window
  invisible at that scale.
- `fig_vl05_diagonal` labelled its matrix $A$ with eigenvalues 3 and 1,
  while the $A$ three lines above it in the lecture is $\sigma_x$, with
  eigenvalues $\pm 1$: it had silently drawn $A + 2I$. Its header also
  called panel (b) a $-45°$ rotation of (a), but $U$ is Hadamard with
  $\det U = -1$ — a reflection, which disagrees with a rotation on exactly
  the arrows drawn.

The rest were craft: labels sitting on lines, right-hand panels clipped,
curves running through axis arrowheads, greyscale collisions. One figure
(`vl04`) had a bare `normal:` outside `\tpcifenglish`, which would have put
a German word in the English PDF without failing any build.

**`check_parity.py` was changed during the translation run**, by a
translation agent, and the change was audited before being kept:

- Its `\text{...}` stripping used a regex that could not match nested
  braces, so a case label like `\text{für $|x|<\frac{L}{2}$}` kept its
  German inside the compared string and failed honestly translated
  equations. That is now a balanced-brace walk — a genuine fix.
- It now also harvests `\text{...}` bodies out of display maths and scans
  them for German. `prose_only()` strips maths wholesale, so untranslated
  prose inside an equation had previously been invisible. This *strengthens*
  the check.
- Six words were dropped from `GERMAN_MARKERS` — "also", "hat", "was",
  "man", "die", "operator" — because they are ordinary English and the
  comparison is case-insensitive ("operator" alone occurs 112 times in the
  English edition). That weakens detection, so it was verified separately:
  the English sources contain no umlaut or eszett outside proper names, and
  a scan with the original stricter list returns four hits, all "von
  Neumann". Every occurrence of the dropped words was checked and is
  genuine English ("for a die, for instance"; "the hat is there to remind
  us").

## Phase 0 status

Kept by the Phase 0 coordinator (an agent). Nothing here is committed. Each row names the
gate command; "passed" means the coordinator ran it, on the date given.

| Package | State | Where | Gate (run from the repo root) |
|---|---|---|---|
| Contract and rules | in force | `docs/plan/phase0/COORDINATION.md`, `PLAN.md` sections 13-14 | n/a |
| Tokens, five packages x two grounds | landed 2026-10-11 | `design/`, `latex/tpc-design.sty` | `python3 design/build_tokens.py --check`; `python3 design/lint_content.py` |
| Notation, definitions, conventions, translation | landed 2026-10-11; most rows `proposed` | `registry/`, `scripts/registry/` | `python3 scripts/registry/check_registry.py` |
| Source registry, claims, provenance, gaps, migrations | landed 2026-10-11 | `sources/*/source.json`, `evidence/`, `scripts/evidence/` | `python3 scripts/evidence/check_evidence.py --private` (needs the private payloads), `--public` |
| Depth system, authoring contract, four editions | landed 2026-10-11 | `latex/tpc-levels.sty`, `latex/tpc-course.sty`, `latex/course/`, `docs/authoring/`, `scripts/course/` | `bash scripts/course/build_course.sh --all-editions --with-test-chapter && python3 scripts/course/check_levels.py --with-test-chapter` |
| TeX to HTML converter, site, demo harness, capture | landed 2026-10-11 | `web/` | `bash web/check.sh --chapters <ids>` (after the print build) |
| Red corpus | one directory per gate | `tests/red/<gate>/` | `python3 scripts/check_red.py` |
| Hydrogen derivation and independent check (codex) | done 2026-10-11 | `evidence/derivations/c11/` | `python3 evidence/derivations/c11/check_hydrogen.py --verify` |
| GPT derivation and independent check (codex) | done 2026-10-11 | `evidence/derivations/c02/` | `python3 evidence/derivations/c02/check_gpt.py --verify` |

All of these are wired into `./ci.sh` as the stage "Contracts". The smoke chapters and the
0e review are tracked below this table as they land.

### Smokes and 0e (status on 2026-10-12, end of the Phase 0 run)

`./ci.sh` (all six stages, including the stage "Contracts" with the four-edition course
build, the web gates in a headless browser, the Julia reference tests, the game play check
and the whole red corpus) passed on 2026-10-12; log of that run: `build/coord-ci-full2.log`
(not tracked).

| Item | State | Where |
|---|---|---|
| Smoke B, hydrogen (C11): chapter in four editions, formula gate | written, reviewed by codex, one repair wave, closure checked | `content/c11-wasserstoff/`, `scripts/c11/`, `tests/red/c11-formulas/`, `docs/plan/phase0/review/{REVIEW,REPAIR}-smoke-B.md` |
| Smoke B: three views, Julia reference, video | built; kernel checked in the Smoke B review; views and video not looked at by a person | `web/src/kernels/hydrogen.ts`, `web/src/demos/c11.*`, `numerics/`, `web/video/`, `tests/red/c11-render/`; video under `build/web/video/` (not tracked) |
| Smoke C, GPT foundations (C2): chapter in four editions with the game manual | written, reviewed, repaired, closure checked | `content/c02-gpt/`, `evidence/derivations/c02/`, `docs/plan/phase0/review/REVIEW-smoke-C.md` |
| Smoke C: explorer and the game "Distinguish" | built, reviewed with the chapter | `web/src/kernels/gpt.ts`, `web/src/demos/c02.*`, `numerics/gpt/`, `tests/red/c02-game/` |
| Smoke A, first lecture (C0, C1): chapters, HTML, one demo, vl01 migration map | written, reviewed, repaired, closure checked | `content/c00-theorie/`, `content/c01-wahrscheinlichkeit/`, `evidence/migrations/`, `docs/plan/phase0/review/{REVIEW,REPAIR}-smoke-A.md` |
| 0e: contracts review and repair | reviewed, one repair wave; the closure check lists what stays open | `docs/plan/phase0/review/REVIEW-contracts.md`, `REPAIR-contracts.md`, `CLOSURE.md` |

Open after the one repair wave (details in `docs/plan/phase0/review/CLOSURE.md`): the gates
check bookkeeping and structure, not whether a quote or derivation supports its claim; that
stays a reviewer's job on every unit (`COORDINATION.md` section 8). Not enforced: fractions and
number words under the numbers rule, numbers in figure files, one-sentence quote length,
package-grid lengths in the lint, proof availability per edition, binding of the web
converter to the build's .aux hash, red cases for several failure families.

Waiting for TJO: `evidence/gaps.json` (32 rows), `registry/COLLISIONS.md`, and the list in
`PLAN.md` section 14.

Concurrent chapter builds must not share `build/course/`: build with
`bash scripts/course/build_course.sh --chapters <ids> --all-editions --out build/<name>` and
pass `--build build/<name>` to `check_levels.py` and `--course-build build/<name> --out
build/<name>-web` to `web/check.sh`.
