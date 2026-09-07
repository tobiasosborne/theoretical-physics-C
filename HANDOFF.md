# Handoff: Theoretische Physik C

## Repo

`/home/tobias/Projects/theoretical-physics-C` — git, `master`. Not yet pushed anywhere.

Modelled on `../generalrelativity`: same build/CI shape, adapted for a
two-language course.

## Status

**German script v0.2 is done and building cleanly: 79 pages, zero LaTeX
errors, zero dangling references.** 18 of 22 lecture figures drawn, 12 of
them placed in their lectures. The English edition has not been started.

| Stage | State |
|-------|-------|
| Archive of the original materials | done |
| Bilingual LaTeX toolchain, `build.sh`, `ci.sh` | done |
| Transcripts of all 25 lecture videos | done |
| Video ↔ script mapping | done |
| **Script v0.2 (German), commentary folded in** | **done** |
| Lecture figures | 18/22 drawn, 12/22 placed — see "Next" |
| English edition | not started; workflow staged |
| Parity CI | written and working; fails only because there is no English edition yet |

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

**Still unfixed, reported by the agents but left alone under the
no-deletion rule** — worth a pass:

- `vl01` "eine endliche Menge ist.Menge ist." (doubled), "die Summer der
  Messwerte" (typo), "Dividiert durch N" outside maths mode
- `vl02` "einen unendlich dimensionalen Vektorraumes" (case)
- `vl03` the expansion formula writes $|\psi_j\rangle$ for $|\phi_j\rangle$;
  Gram-Schmidt says $|\Phi_k\rangle = 0$ for $|\Psi_k\rangle = 0$

## Next

1. **Finish the figures.** 18 exist and all compile; 4 remain: `vl19`
   (Entropie), `vl20` (mikrokanonisch), `vl21` (Temperatur), `vl22`
   (kanonisch). Proposals for all of them are in `_work/figure-plan.md`.
2. **Place the 6 unplaced figures** — `vl01`, `vl10`, `vl15`, `vl16`,
   `vl17`, `vl18` have a figure file but no `\input{figures/...}` in the
   lecture yet, plus a sentence or two steering the reader.
3. **Review pass.** The independent review stage never ran for most
   figures. Known issue: `fig_vl01_planck` has panel (b) clipped on the
   right and panel (a)'s axis label colliding with it. Every figure should
   be rendered, looked at, and checked for clipping, overlap, and whether
   all prose is wrapped in `\tpcifenglish`.
4. **English edition.** A ready-to-run workflow is staged at
   `<scratchpad>/translate.js` — 22 translation agents plus a parity-repair
   stage. Launch with `Workflow({scriptPath: ...})`. Run it only after the
   figures are settled, so it translates the final German.
5. **Then `./ci.sh`** should go green end to end.

## Layout

```
latex/
  TheoretischePhysikC.tex     German master — the leading edition
  TheoreticalPhysicsC.tex     English master (lectures not written yet)
  tpc-style.sty               [german]/[english]/[cmfonts]; theorem envs
                              exist under both language names, one counter;
                              \tpcifenglish{EN}{DE} for figure prose
  tpc-macros.sty              QM/stat-mech macros in the script's own
                              notation (\widehat, \mathcal{H}, \tr)
  tpc-tikz-templates.sty      tpcplot / tpcpotential / tpclevelplot / tpc3d
  lectures/de/vl01–vl22.tex   German lectures (v0.2)
  lectures/en/                empty
  figures/fig_vlNN_*.tex      18 figures, one file serving both editions
transcripts/
  raw/                        auto-captions (gitignored, regenerable)
  clean/v01–v25.md            reconstructed lectures
  MAPPING.md, mapping.json
archive/                      the original materials, sorted
scripts/
  fetch_transcripts.py  check_parity.py  check_enrichment.py
  tikz-preview.sh       check_lecture.sh
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

## Note on the interrupted run

The figure workflow was stopped mid-flight. Two agents had already been lost
to a network outage (`vl05`, `vl09`) and were relaunched — both those figures
now exist. Everything on disk compiles and the build is clean, so the tree is
in a consistent state; the work that remains is the four missing figures, the
six unplaced ones, and the review pass.
