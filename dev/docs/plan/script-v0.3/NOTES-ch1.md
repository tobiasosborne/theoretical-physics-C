# NOTES-ch1: script chapter 1 (vl01 / lec01), lane ch1

## What changed

Chapter 1 is rewritten as the kernel of the course chapters C0 (`content/c00-theorie`) and C1
(`content/c01-wahrscheinlichkeit`), in the course's order and notation. German first
(`latex/lectures/de/vl01.tex`), English as its translation (`latex/lectures/en/lec01.tex`).
Source of every paragraph, display, example, exercise and figure: `sync-ch1.md`.

Structure now:

1. Vorlesung: Die Geburt der Quantenmechanik (opening: quantum universe, decoherence, method;
   one sentence pointing to the web course)
   1. Warum eine neue Theorie nötig war (c00.s4): six findings as a list, Planck's law, hbar,
      photo effect in the single-photon model with threshold; the two Merksätze; Born; the
      working assumption
   2. Was eine physikalische Theorie liefert (c00.s1-s3): P0, deterministic as subset,
      "data for preparations + dynamics + measurement"; grey box "Jedes Experiment in drei
      Schritten" with the scheme figure; micro to macro, effective theories
   3. Wahrscheinlichkeit für Physiker (c01, Kern only)
      1. Ergebnisse und Präparationen (D53, D54, additivity, measure)
      2. Messungen und Erwartungswert (D55, linearity, relative frequencies)
      3. Ja-Nein-Messungen (indicator functions, E[chi_S] = P[S])
      4. Varianz und Determinismus (D56, Var[chi_S], determinism Merksatz; the point weight is
         written as p(a) = 1, the term itself is not introduced)
      5. Kontinuierliche Ergebnisse (densities, Gauss, moments, Var = M_2 - M_1^2)

Title: v0.2's "Der Geburt der Quantenmechanik" becomes "Die Geburt der Quantenmechanik"
(the new_text of M-0012). English: "The Birth of Quantum Mechanics" (unchanged).

Figure: `fig_vl01_planck.tex` is deleted. Its panel (b) and labels (Rayleigh-Jeans, UV
catastrophe, mean energy per mode, "frozen out") are claims the new course defers to C18 (G-0024),
so under rule 1 it could not stay as it was; the course's replacement (c00.fig.planck) needs the
limiting-form equation and a paragraph, which the kernel does not carry. New:
`latex/figures/fig_vl01_experiment.tex`, the course figure c00.fig.experiment redrawn with
tpc-style colours and tpc-macros TikZ styles (no design tokens), so it builds with
`scripts/check_lecture.sh` and in the masters as they stand. It sits in the grey box and replaces
v0.2's three-item enumerate there. `scripts/check_figures.py`: all 22 figures ok.

## Budgets (numbers measured, method stated)

| | v0.2 | v0.3 | how counted |
|---|---|---|---|
| words, German | 2366 | 1990 (1963 before the repair wave) | `wc -w latex/lectures/de/vl01.tex` (the brief's baseline count) |
| words, German | 2095 | 1642 | `texcount -1 -sum` |
| words, English | 2650 / 2373 | 2158 / 1806 | `wc -w` / `texcount -1 -sum` |
| display equations | 17 | 15 (12 numbered, 3 unnumbered) | `equation`, `equation*` environments |
| definition environments | 0 | 0 | |
| defined terms (semantic inventory) | 29 | 27 | see "Definition inventory" below; the earlier `\emph` count did not measure this |
| examples | 4 | 3 | `beispiel` / `example` |
| exercises | 2 | 2 | `übung` / `exercise` |
| figures | 1 | 1 | |
| boxes | 2 yellow, 1 grey, 1 historical | 3 merksatz, 1 grey | |
| key-equation boxes (`\eqbox`) | 2 | 2 (hbar, E[f]) | |
| pages, standalone | 7 (de), 7 (en) | 5 (de), 5 (en) | `scripts/check_lecture.sh 1 de/en` |
| pages, full German master | chapter 1 on pp. 2-7, chapter 2 from p. 8 | chapter 1 on pp. 2-6 (p. 6 full), chapter 2 from p. 7 | full `TheoretischePhysikC.tex` built twice with xelatex in a scratch copy of `latex/`, current style, local fonts, with the ch2 lane's vl02 as it stood at 2026-10-22 morning |

The page figure is for the current style. The final number with the new design is the
coordinator's to measure (brief: chapters 1 + 2 together at most 9 pages).

## What was cut, and why

- Organisation, Stud.IP, topic list, error bounty (v0.2:4-21, 23): semester logistics; the topic
  list is replaced by the one sentence on the ladder, as in the migration map.
- Textbook remark "verbindlich ist dieses Skript": the script is now deprecated in favour of the
  web course, so the sentence would be false; replaced by the single web-course pointer.
- Cloud quantum computers and the promise of exercises on them (v0.2:28): not a kernel idea;
  G-0070 is still open for TJO. The "zum ersten Mal" defect (M-0051) goes with it.
- Planck figure and its caption (v0.2:49-53): see Figure above.
- The cavity with a small hole (v0.2:47 second half): costs a sentence plus the
  thermal-equilibrium premise that REVIEW-lec1 required; not needed for the kernel.
- History 1925-1927 (Schrödinger, Heisenberg, Born-Jordan, Dirac, Wiener, Hilbert, von Neumann,
  Wigner, Weyl), the German-originals box, "best model we have" (v0.2:72-76, 85, 87): Vertiefung
  c00.v2 in the course. Kept: Born 1926 (the statistical interpretation, which the kernel needs)
  and the corrected years of the six findings in parentheses.
- Planck law derivation details: limiting form, bounds, divergence (c00 Kern + c00.v1): not in
  v0.2 either; the kernel only quotes the law.
- From C1 Kern: the loaded-die numbers, the frequency figure, the full properties proposition,
  mixtures, indicator rules beyond chi_S^2 = chi_S, decomposition of measurements, the
  three-outcome worked example with its table, angular momentum preview, the language table,
  the uniform density, the 1/x^2 example, all propositions' proofs except one-line reasons.
  C1 Vertiefungen (simplex, frequencies theorem, Gauss normalisation) are out by the brief.
- Displays turned inline: `f: X -> R` (v0.2 eq@130), `E[f] = sum P[{x}] f(x)` (eq@165),
  `E[x^2] = ?` (eq@171), `E[f] = int P(dx) f(x)` (eq@179); dropped: the split Gauss integral
  (eq@195, replaced by the symmetry argument of c01.ex.gauss).

## Migration records applied (for the evidence lane; status changes are yours)

- **M-0012** applied: section title "Die Geburt der Quantenmechanik". Its other two loci
  (v0.2:37 "das richtiges Spektrum. Die konstante", v0.2:59 "Beobachung") no longer exist: the
  text is rewritten from c00 and reads "Das richtige liefert ...", "Planck hat die Konstante h
  ...", and the photo-effect sentence is new.
- **M-0050** applied: no 1899 for Planck (now 1900), Lenard without year and Einstein "ab 1905",
  Franck-Hertz 1914 (not ~1911), Davisson-Germer 1927 (not 1929). Note: the record's new_text
  points to table c00.tab.jahre; in the script the years stand in parentheses in the list.
- **M-0051** applied in the parts that survive: photo effect as maximum kinetic energy at fixed
  material, single-photon model, non-relativistic; Stern-Gerlach with silver beam, two beams,
  fixed angular-momentum quantum number, finitely many component values. The "zum ersten Mal"
  locus (v0.2:28) and the Schrödinger-equivalence locus (v0.2:72) are cut, not rewritten.
- **M-0009** applied: relative frequencies, exact identity for the series mean, "h_N close to p"
  as a reading, not an exact count (vl01.tex:86-90).
- **M-0010** applied as the course realised it, not with the record's literal new_text: the
  classical sentence of v0.2:83 is kept (as in c00:427-430), and the special case is the
  determinism Merksatz (point weight <=> probabilities 0 or 1 <=> all variances 0). The record's
  last sentence ("jede klassische Präparation lässt sich so lesen ... fehlende Information") is
  not printed, because REVIEW-lec1 had it removed from c01 (SCOPE; G-0023 d).
- **M-0011** applied: Var = 0 iff f constant on the outcomes of positive weight, stated for
  finite outcome sets only; for densities only Var[P] = M_2 - M_1^2.
- **M-0006, M-0007, M-0008**: v0.1-only slips, already correct in v0.2; nothing to apply.

## What the checkers say (as of the end of this lane)

- `scripts/check_lecture.sh 1 de` and `1 en`: ok, 5 pages each, no errors, no undefined refs.
- `python3 scripts/check_parity.py --only 1`: ok (sections 9/9, maths 15/15, envs 5/5, labels
  2/2, figures 1/1, no language warning).
- `python3 scripts/check_figures.py`: all 22 ok.
- `python3 evidence/migrations/check_vl01_map.py` and `scripts/check_enrichment.py --only 1`:
  pass, because the evidence lane already points them at the v0.2 snapshot.
- `scripts/evidence/check_evidence.py` passes; `scripts/registry/check_registry.py` 0 errors.
  Running check_evidence rewrote `evidence/receipts/private-check.json` (an evidence-lane file
  that was already modified); please regenerate it on your side if you need your own run.
- Things a checker may flag later:
  - `evidence/gaps.json` G-0024 cites `latex/figures/fig_vl01_planck.tex:20-34` as a locus, and
    the vl01 map entry figure@49 names that file; the file is deleted in the working tree (it is
    in git history and in the v0.2 snapshot). If a check resolves gap loci against the live
    tree, it will fail.
  - Untracked build products `latex/figures/fig_vl01_planck.pdf` and `.png` are still on disk
    (ignored by git; not mine to delete, but stale).
  - The two old labels `eq:indicatorfunction` and `eq:ctsprob` are kept (same meaning) and are
    not referenced anywhere.

## Notation seams with chapters 3 to 22 (not touched)

- `k_B` (`\kB`) in chapter 1; vl22 writes `kT`.
- `\operatorname{Var}` in chapter 1 (registry `\Var`); vl09 writes `\text{var}` and `\Delta`.
- `u(\nu, T)` for the spectral energy density (COL-U); v0.2 had `U(\nu)`; no later chapter uses it.
- Chapter 1 says Ergebnismenge, Gewicht, Ja-Nein-Messung (registry); later chapters do not use
  the probability words, so there is no clash. "Präparation und Messung" matches vl06.
- The registry macros (`\Outcomes`, `\pw`, `\Prob`, `\ind`, `\hPlanck`, ...) are not provided by
  the masters, so chapter 1 writes their registered renderings out (table in `sync-ch1.md`).
  If the design lane makes the masters load `tpc-notation.sty`, chapter 1 can switch to the
  macros without changing a glyph.

## Open questions for TJO

1. Title: the grammar fix "Die Geburt der Quantenmechanik", or a title that says what the
   chapter now is (for instance "Theorie und Wahrscheinlichkeit")?
2. Years: the list prints the corrected years (Planck 1900, Einstein from 1905, Franck-Hertz
   1914, Stern-Gerlach 1922, de Broglie 1924, Davisson-Germer 1927) and Born 1926. In the course
   they live in the Vertiefung table. Keep them in the kernel, or drop all years?
3. Figure: the Planck figure is gone and the three-step scheme is in. The Planck law stays as a
   formula without a picture. Is that the right trade?
4. The script goes from probability straight to Hilbert space (vl02); C2 (GPT, D1 Präparations-
   verfahren, mixtures, pure states) is not in the script, and the ladder sentence names its
   stages without the GPT rung. Acceptable for the kernel?
5. "Deterministische Theorien fasse ich als Teilmenge der probabilistischen auf" and the
   determinism Merksatz are the course's framing (author-stipulated, G-0023 d). Confirm.
6. The exercises have no printed solutions (as in v0.2). The course has them (2 dice: 36;
   three outcomes: 2/3 and 14/3). Add one line each?

## Requests to other lanes

- Design: the figure uses only tpc-style colours (`cgblue`, `spacecadet`, `birrenorange`,
  `birrengray`) and tpc-macros styles (`lbl`, `axisstyle`); please keep those names working, as
  for the other 21 figures. Boxes used: `merksatz` (with and without title), `greybox` (titled);
  `\eqbox`; `beispiel`/`übung` (en: `example`/`exercise`).
- Evidence: the record statuses above; G-0024 locus; the receipt note.
- Coordinator: final page count with the new design for chapters 1 + 2.

## Definition inventory (repair wave, REVIEW.md KERNEL finding)

Criterion, applied identically to both versions: a *definition* is a passage that introduces a
term or symbol and fixes its meaning, by "heißt / nennt man / bezeichnet", by `\equiv` or a
defining formula, or by an apposition or gloss. One concept counts once; synonyms given together
count once (Messung = Observable = Zufallsvariable; Präparation = Zustand; Ergebnismenge =
Stichprobenraum = Elementarereignisraum). Not counted, on either side: terms only mentioned without
a meaning (Dekohärenz, Matrizenmechanik, ,,Welle-Teilchen Dualismus``, Unschärferelation);
glosses of symbols for quantities known from earlier courses (c, k / k_B, T, nu, lambda, m / m_e,
v); examples (die Augenzahl f(x) = x als Messung); principles stated in boxes (probabilistische
Theorie); ordinary descriptive phrases without emphasis (,,Summe der Messwerte`` in v0.2,
,,Mittelwert der Messreihe`` in v0.3). Source of v0.2: `git show HEAD:latex/lectures/de/vl01.tex`
(line numbers below are of that file); v0.3: the working-tree `vl01.tex` after this repair.

| # | v0.2 (HEAD vl01, line) | v0.3 (vl01, line) |
|---|---|---|
| 1 | Schwarzkörper (47) | Schwarzkörper (12) |
| 2 | Lichtquanten, E = h nu (37, 59) | Lichtquanten, E = h nu (12) |
| 3 | spektrale Energiedichte U(nu) (39) | u(nu, T), Energie pro Volumen im Intervall d nu (14-16) |
| 4 | reduzierte Planck-Konstante hbar (41-44) | reduzierte Planck-Konstante hbar (16-18) |
| 5 | Photoelektronen (55) | (none) |
| 6 | E_el = m v^2/2, Energie der Photoelektronen (57) | E_kin,max, maximale kinetische Energie (20-22) |
| 7 | Bindungsenergie W (59) | Bindungsenergie W (24) |
| 8 | Richtungsquantelung (62) | (none) |
| 9 | (none) | effektive Theorie, ,,eine Näherung an die grundlegende Physik darunter`` (53) |
| 10 | gezinkter Würfel (111, 126) | gezinkter Würfel (50) |
| 11 | Elementarereignisraum / Stichprobenraum X (98) | Ergebnismenge (Stichprobenraum) X (59) |
| 12 | Ereignisse S subset X (149-150) | Ereignisse (59) |
| 13 | Präparation (108) | Präparation (Zustand) (56, 59) |
| 14 | Wahrscheinlichkeitsverteilung p(x) with its two conditions (114-117) | Gewicht with its two conditions (59-62) |
| 15 | Durchführung, maps Wahrscheinlichkeitsfunktionen to Wahrscheinlichkeitsfunktionen (123) | (none: "durchgeführt" is a verb in the greybox, no meaning fixed) |
| 16 | Messung (Observable) = Zufallsvariable (129-137) | Messung (Observable, Zufallsvariable) (80) |
| 17 | Messwert f(x) (137) | Messwert f(x) (80) |
| 18 | Erwartungswert E[f] (138-140) | Erwartungswert E[f] (80-83) |
| 19 | (none) | relative Häufigkeit h_N (86) |
| 20 | zweiwertige Messungen, values 0 or 1 (142) | Ja-Nein-Messungen, values 0 and 1 (92-93) |
| 21 | Indikatorfunktion chi_S (143-149) | Indikatorfunktion chi_S (94-97) |
| 22 | P[S] (154) | Wahrscheinlichkeit P[S] (63) |
| 23 | Maß, Wahrscheinlichkeitsmaß (162) | Maß, Wahrscheinlichkeitsmaß (77) |
| 24 | Mengenfunktion P (162) | (none) |
| 25 | Erwartungswertfunktional E (162, 164) | (none) |
| 26 | Varianz Var[P] (210-213) | Varianz Var[f]; Var[P] as its case for the coordinate (108-110, 150-152) |
| 27 | (none) | deterministische Präparation (125) |
| 28 | Dichte p(x), p(x) dx = P(dx) (184-187) | Wahrscheinlichkeitsdichte (129) |
| 29 | notation int P(dx) f(x) (179-187) | notation int P(dx) f(x) (136) |
| 30 | Normal- / Gauß-Verteilung (194) | Normal- / Gauß-Verteilung (143) |
| 31 | Momente, n-tes Moment M_n (204-208) | Momente M_n (146-148) |
| 32 | Mittelwert M_1 (210) | Mittelwert M_1 (150) |
| | **29** | **27** |

Before the repair, v0.3 also introduced *Schwellenfrequenz* W/h (old line 24) and *Punktgewicht*
p_a (old line 122): 29 against 29, and 29 against 27 if one does not count the two labels
Mengenfunktion and Erwartungswertfunktional of v0.2. So the cap was not substantiated, as REVIEW.md
said. The repair removes both terms without removing a claim: the photo-effect sentence now says
"Unterhalb der Frequenz W/h", and the point weight is written as the condition p(a) = 1 (the
course's "auf einen Punkt konzentriert", c01:590-591; on a finite set p(a) = 1 for one a is the same
as being a point weight). Kept, as the course and the review want: relative Häufigkeit (the
corrected frequency account, M-0009) and deterministisch (the special case, M-0010/M-0011).

Result: v0.3 defines 27 terms, v0.2 29. Under the strictest reading for v0.2 (dropping the two
labels Mengenfunktion and Erwartungswertfunktional) it is 27 against 27, still within the cap.
The new definitions of v0.3 (effektive Theorie, relative Häufigkeit, deterministisch) are offset
by v0.2 definitions that are gone (Photoelektronen, Richtungsquantelung, Durchführung,
Mengenfunktion, Erwartungswertfunktional).

## Repair wave (REVIEW.md, 2026-10-22)

| finding | change (German; English in parity) |
|---|---|
| WRONG vl01:133, continuous expectation without its conditions | After display (9): "Dabei ist $a \leq b$, und den Erwartungswert verwenden wir nur, sofern $\int p(x) \abs{f(x)}\,\dd x < \infty$ ist. Gegenüber dem endlichen Fall ist also nur die Summe durch ein Integral ersetzt." (c01:894-898). No new display. sync rows 80, 81 |
| WRONG vl01:150, moments | "Nur $M_0 = 1$, die Normierung, existiert immer; $M_1$ heißt, sofern es existiert, \emph{Mittelwert}. Existieren $M_1$ und $M_2$, so ist die Varianz der Koordinate wie im endlichen Fall" (12), and "Mittelwert und Varianz tragen dann dieselbe Information wie $M_1$ und $M_2$." "Existieren M_1 und M_2" is the course's hypothesis (int abs(x) p and int x^2 p finite, c01:971-972), because the sentence before display (11) defines existence of M_n by finiteness of int abs(x)^n p; this avoids the new term "absolutes Moment". sync rows 88-90 |
| MISMATCH vl01:154, summary | "Für die hier betrachteten Modelle steht damit die Sprache bereit: Präparationen sind Gewichte oder Dichten, Messungen sind Funktionen, und beide zusammen ergeben bei endlichen Integralen Erwartungswerte." (c01:1033-1036). sync row 91 |
| KERNEL, definition count | Inventory above; "Schwellenfrequenz" and "Punktgewicht" cut (vl01:24, 122, 125); now 27 against 29. sync rows 19, 76, 77 |
| MINOR lec01:86 | "and the mean of the series satisfies the exact identity" |
| (chapter 2 finding) | see NOTES-ch2.md |

Counts after the repair: German `wc -w` 1990 (budget 2000), `texcount -1 -sum` 1642; English
2158 / 1806. Display equations 15 (v0.2: 17), unchanged by the repair. Examples 3, exercises 2.
Checks: `scripts/check_lecture.sh 1 de` and `1 en` ok, 5 pages each; `python3
scripts/check_parity.py` all 22 in parity (lecture 1: sections 9/9, maths 15/15, envs 5/5, labels
2/2, figures 1/1; the one warning is lecture 19, not this lane). Rendered pages 4 and 5 (de) and 5
(en) at 60 dpi and read them: the conditions sit directly under display (9) at the top of page 5,
the merksatz reads as intended.
