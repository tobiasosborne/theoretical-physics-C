# NOTES, lane ch2 (script chapter 2: vl02 / lec02)

## What changed

`latex/lectures/de/vl02.tex` rewritten as the Kern of `content/c03-hilbertraum` sections c03.s1 to
c03.s3; `latex/lectures/en/lec02.tex` translated from it in strict parity. Every item is mapped in
`sync-ch2.md`. Structure now follows c03:

- 2 Vorlesung: Hilbertraum (title kept from v0.2)
  - 2.1 Komplexe Vektoren (D75, C^1 and C^2, Beispiel: computing in C^2)
  - 2.2 Kreuz-Operation und Skalarprodukt (D76, figure, why the conjugation, v^dagger v >= 0,
    the (1, i) remark, Beispiel: v^dagger w = -2i and w^dagger v = 2i)
  - 2.3 Unendlich viele Einträge (fields motivate infinite dimension; columns and functions; the
    one pointer sentence to the web course for l^2 and square-integrable functions; hand-over to
    Dirac notation and vl03)

Figure: `fig_vl02_raeume.tex` (partial sums in l^2, partial integrals in L^2) deleted, together
with its ignored preview `fig_vl02_raeume.png`. New `latex/figures/fig_vl02_kreuz.tex`: panel (a)
of the course figure c03.fig.kreuz (conjugation = reflection in the real axis, v = (2+i, -1+2i)),
redrawn with the script's TikZ styles (`axisstyle`, `lbl`, colours `cgblue`, `spacecadet`,
`birrengray` from tpc-style/tpc-macros) so it builds with `check_lecture.sh` and in both masters.
Panel (b) (row times column) left out because display (6) does the same computation.
`scripts/check_figures.py`: all 22 figures ok.

## Budgets (numbers)

Words counted with `wc -w` on the source file (the method of the BRIEF baseline 766); `texcount -1
-sum` given as well.

| | v0.2 | v0.3 | budget |
|---|---|---|---|
| words de, `wc -w` | 766 | 622 (620 before the repair wave) | <= 650 |
| words de, `texcount -1 -sum` | 526 | 505 | |
| words en, `wc -w` | 825 | 668 | parity |
| words en, `texcount -1 -sum` | 585 | 551 | |
| display equations (equation environments) | 16 | 6 | <= 16 |
| definition environments | 0 | 0 (inline `\emph`, as v0.2) | <= 0 |
| examples (`beispiel`) | 2 | 2 | <= 2 |
| figures | 1 | 1 | |
| greybox / eqbox | 1 / 1 | 0 / 0 | |
| defined terms (semantic inventory) | 11 | 9 | see "Definition inventory" below (supersedes the earlier 8 / 6, which left out the two operations, <f, g> and the l^2 gloss) |
| pages, `check_lecture.sh 2 de` / `2 en` | | 2 / 2 (second page under half full) | |

Pages in the full German master (current design, built in a scratch copy, with vl01 in whatever
state the ch1 lane had on disk at 2026-10-22 and identical otherwise): with the v0.2 vl02,
chapter 2 runs from page 8 to page 11 (chapter 3 starts on 11), document 84 pages; with the new
vl02, chapter 2 runs from page 8 to the top of page 10 (chapter 3 starts on 10), document 83 pages.
So chapter 2 is about one and a half pages and saves one page. The final page count with the new
design is the coordinator's measurement.

Checks run: `scripts/check_lecture.sh 2 de` ok (2 pages), `2 en` ok (2 pages),
`python3 scripts/check_parity.py --only 2` ok (sections 4/4, maths 6/6, envs 2/2, figs 1/1),
`python3 scripts/check_figures.py` ok, `python3 evidence/migrations/check_vl02_map.py` ok (it now
reads the v0.2 snapshot), `python3 scripts/check_enrichment.py --only 2` ok. Rendered pages read
(standalone de and en, and pages 8 to 10 of the scratch master).

## What was cut and why

Everything about infinite dimension beyond one pointer sentence, because in c03 it is Vertiefung or
Fundament (D4, PLAN.md 1.3 and 14.7): the inner-product series for infinite columns, the vector of
ones, the eqbox l^2 condition, square-integrable functions and the integral <f, g>, the non-example
f = 1, the partial-sums/partial-integrals figure, the rate remark, and the greybox "Drei Räume, drei
Systeme" (c03.v3). The table at the end of `sync-ch2.md` says where each went.

Two Kern sentences of c03.s2 were left out on purpose: "Mit dem Skalarprodukt berechnen wir später
Wahrscheinlichkeiten" (vl03.tex:132 says it, so chapter 2 would duplicate it) and the four
calculation rules (c03.prop.skalarprodukt), which vl03's subsection Skalarprodukte introduces as the
axioms; chapter 2 must not pre-empt it. Also left out: c03's bridge "the Kern stays finite-dimensional
up to Kapitel 4, infinite dimension enters in Kapitel 5", because the script's numbering differs
(vl05 already works in l^2(N) and L^2(R)), so the sentence would be false in the script. The
(1, i) example (c03.ex.ohne-stern) is kept as one sentence instead of an example environment.

## Migration records applied (for the evidence lane)

- M-0013: applied by removal. The sentence "die Norm aber logarithmisch gegen unendlich" is gone
  with the rate remark; the word Norm does not occur in chapter 2.
- M-0014: applied. The new text says that setting n = infinity in the formulas can make the inner
  product diverge (row 30 of sync-ch2.md); componentwise rules for infinite columns are not
  restated as a general inner-product formula.
- M-0015: applied by removal. Chapter 2 no longer defines the integral <f, g> or calls it a scalar
  product; L^2(R) is not named (the pointer sentence speaks of functions with a finite integral of
  the squared modulus, D78).
- M-0016: all three applied. (1) functions, not the space, assign a complex number to each x
  (row 29); (2) "Einträgen" (row 28); (3) bold v under the dagger, written `\vb{v}\adj` (row 15).

Status changes of these records are the evidence lane's. The vl02 migration map's `figure@131`
entry describes the v0.2 figure, which is now deleted from `latex/figures/`; the map itself still
checks (snapshot), but anything that resolves `latex/figures/fig_vl02_raeume.tex` from the map or
from provenance would now miss the file (I found no such reference outside the map, M-0013 and the
v0.2 lecture). The v0.2 copy of the figure is in my scratchpad if the evidence lane wants it for the
snapshot: `/tmp/claude-1000/-home-tobias-Projects-theoretical-physics-C/b740e269-7072-4706-bae0-8d34df7e6fc4/scratchpad/v02/fig_vl02_raeume.tex`.

## Seams with vl03 (and later chapters), BRIEF rule 2

Chapter 2 uses the new course's notation; chapters 3+ are untouched.

1. Vectors: chapter 2 writes `\vb{v}` (bold, `\boldsymbol`, registry D75/D76); v0.2 wrote `\mbf{v}`
   (`\mathbf`). vl03 writes vectors unbold, `v \in V`, and switches at once to kets `|v\rangle`.
2. The space: chapter 2 calls it `\mathbb{C}^n` (D75) and no longer introduces the letter V; vl03
   opens with "Sei V ein komplexer Vektorraum" (generic, reads fine).
3. Dagger: chapter 2 `\vb{v}\adj` (macro `\adj` = `^{\dagger}`, sym.adjoint); vl03 writes `^\dag` /
   `^\dagger` by hand. Same glyph.
4. Name: chapter 2 "Kreuz-Operation" (registry D76, c03); vl03 "Kreuzoperation" (no hyphen).
   English "dagger operation" in both.
5. Inner product: chapter 2 only `\vb{v}\adj\vb{w}`; vl03 introduces `\langle v|w\rangle \equiv
   (|v\rangle)^\dag |w\rangle`. Clean hand-over, no clash.
6. Hilbert space: chapter 2 says that with dagger and inner product C^n becomes a Hilbert space and
   that the missing condition, completeness, always holds in C^n; vl03's definition (vollständig,
   footnote "keine große Rolle") and "Für uns ist ein Hilbertraum also schlicht ein komplexer
   Vektorraum mit Skalarprodukt" agree with that.
7. l^2: v0.2 vl02 defined l^2 (eqbox); now it is only named in the pointer sentence. vl05.tex:5, 13,
   17 and vl11.tex:88 use `\ell^2(\mathbb{N})` with the argument; chapter 2 writes `\ell^2` as the
   registry and c03 do. vl05.tex:21 defines L^2(R) itself, as a space "bestehend aus
   quadratintegrierbaren Funktionen", which is the formulation REVIEW-lec2.md row 1 flags as wrong
   for the course (classes, D80); out of scope here, listed for TJO.
8. The inner product of functions: v0.2 vl02 wrote `\langle f, g\rangle` (with a comma); chapter 2 no
   longer has it. vl05.tex:21-24 restates the square-integrability condition, and vl06.tex:30
   defines `\langle \Phi|\Psi\rangle` for L^2(R^3) as an integral. I did not check every later use
   of the L^2(R) inner product for a silent dependence on the removed v0.2 formula.

## Requests to other lanes

- Design lane: `vl02.tex`/`lec02.tex` use `\section`, `\subsection`, `beispiel`/`example`, `\vb`,
  `\adj`, `\abs`, `\emph`, nothing else special. The figure uses the tpc-macros TikZ styles
  `axisstyle`, `lbl` and the tpc-style colours `cgblue`, `spacecadet`, `birrengray`, `white`;
  please keep those defined when the masters switch. German quotes are typed as Unicode „“, English
  as ``''.
- Evidence lane: see "Migration records applied" above. The new figure is not in any migration map
  (it is an adaptation of c03.fig.kreuz panel (a)); `check_figures.py` passes without changes.

## Open questions for TJO

1. Title: chapter 2 keeps "Vorlesung: Hilbertraum" like the other script chapters; the course
   chapter is called "Werkzeugkasten Hilbertraum". Switch?
2. l^2 and L^2: the script's later chapters (vl05, vl06, vl07, vl11) use l^2(N) and L^2(R) as known
   spaces. With the BRIEF's single pointer sentence, l^2 is named but not defined in the script, and
   L^2(R) is first defined in vl05. Acceptable for the "kernel" script, or should chapter 2 keep one
   more sentence (the admission condition as a formula)?
3. The pointer sentence names the web course chapter by title ("Werkzeugkasten Hilbertraum"), not by
   number, because "Kapitel 3" means vl03 in the script. A URL is not given in the text (the title
   page carries it). OK?
4. The (1, i) remark and the reflection figure are new to the script (both Kern in c03, ground-truthed
   there: c03.cl.ohne-stern, c03.fig.kreuz). Keep both, or drop the figure to save a quarter page?

## Definition inventory (repair wave, REVIEW.md KERNEL finding)

Same criterion as in NOTES-ch1.md: a definition introduces a term or symbol and fixes its meaning
(by "heißt / bezeichnet", `\equiv`, a defining formula, or a gloss); one concept counts once;
terms only named without a meaning are not counted (Hilbertraum, Vollständigkeit, Norm, Notation
von Dirac, Qubit, harmonischer Oszillator). v0.2: `git show HEAD:latex/lectures/de/vl02.tex`.

| # | v0.2 (HEAD vl02, line) | v0.3 (vl02, line) |
|---|---|---|
| 1 | komplexer Vektor (8-14) | komplexer Vektor (10-13) |
| 2 | (none: "Einträge" used at 85, not defined) | Einträge (10) |
| 3 | Multiplikation mit Skalar (17-23) | Multiplikation mit einem Skalar, entrywise (14) |
| 4 | Addition (24-34) | Addition, entrywise (14) |
| 5 | Kreuz-Operation (35-42) | Kreuz-Operation (32-36) |
| 6 | Skalarprodukt v^dagger w (43-51) | Skalarprodukt (32-36) |
| 7 | komplexer Vektorraum V, notation C^n (53, 57) | komplexer Vektorraum C^n (14) |
| 8 | Dimension (57) | Dimension (14) |
| 9 | l^2, the admitted vectors (108-112) | l^2 as a gloss in the pointer sentence, "Spalten mit endlicher Summe der Betragsquadrate (den Raum l^2)" (57) |
| 10 | quadratintegrierbar (114-117) | (none: "Funktionen mit endlichem Integral des Betragsquadrats" names no term) |
| 11 | L^2(R) (114) | (none) |
| 12 | <f, g> as an integral (119-121) | (none) |
| | **11** | **9** |

Result: chapter 2 defines 9 terms against 11 in v0.2; within the cap, nothing to cut. The repair
wave adds no term ("reine Zustände" is a qualifier, defined nowhere in chapter 2 and not in v0.2
either; the course defines it in C2, which the script does not carry, see NOTES-ch1 question 4).

## Repair wave (REVIEW.md, 2026-10-22)

| finding | change (German; English in parity) |
|---|---|
| WRONG vl02:16 | "Zweidimensionale komplexe Vektoren beschreiben die reinen Zustände eines Qubits." (c03 de.tex:76-83); English "the pure states of a qubit". sync row 9 |
| WRONG vl02:57 | "mit Funktionen beschreibt man etwa die reinen Zustände eines Teilchens ohne Spin in einer Dimension." (c03 de.tex:370-374); English "the pure states of a spinless particle". sync row 29 |
| KERNEL, definition count | inventory above: 9 against 11, no cut needed |

Counts after the repair: German `wc -w` 622 (budget 650), `texcount -1 -sum` 505; English 668 /
551. Display equations 6 (v0.2: 16). Checks: `scripts/check_lecture.sh 2 de` and `2 en` ok, 2
pages each; `python3 scripts/check_parity.py` all 22 in parity (lecture 2: sections 4/4, maths 6/6,
envs 2/2, figures 1/1). Rendered both German pages at 60 dpi and read them.
