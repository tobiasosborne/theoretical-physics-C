# Handoff: Theoretische Physik C

## Repo

`/home/tobias/Projects/theoretical-physics-C` — git, `master`. Not yet pushed anywhere.

Modelled on `../generalrelativity`: same build/CI shape, adapted for a
two-language course.

## Status

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
