# NOTES-en-ch5-6: English of lectures 5 and 6 (course C3 s13-s15, C4; script chapters 5, 6), 2026-11-05

Brief: `docs/plan/lec56/BRIEF.md` (D-DE: German first, English follows). The German (commits
f399986, f7478a6) is unchanged; this round translates it.

## What was written
- `content/c03-hilbertraum/en.tex`: sections c03.s13 (The trace), c03.s14 (Eigenvalues and
  diagonalisation, block c03.v7), c03.s15 (Functions of operators); header comment updated.
- `content/c04-quantentheorie/en.tex`: new, the whole chapter.
- `latex/lectures/en/lec05.tex`, `lec06.tex`: rewritten from the v0.2 English to the v0.3 German
  (the v0.2 English stays as Git members of `sources/tpc-script-v0.2`).
- Figures: `content/c03-hilbertraum/figures/diagonal.tex`, `content/c04-quantentheorie/figures/messung.tex`,
  `latex/figures/fig_vl05_diagonal.tex`, `fig_vl06_messung.tex` already carry their English
  through `\tpcifenglish`; nothing changed.
- Evidence: no ledger change needed. Every c03/c04 claim row is now tagged once in `en.tex`
  (the 38 "unused claim" findings of `check_evidence.py --public` are gone).

## Postulates P0-P5
- Course: the displays carry TJO's English verbatim in the English branch of `\tpcifenglish`
  (already in the German commit; identical displays by M1). As in the German, the marker "(*)"
  of P1 is left out and the course's symbols are used (F for E, `\BdOp{\Hil}`, `\Id`).
- Script (`lec06.tex`): the boxes are TJO's English verbatim with the same symbol substitutions.
  The German script paraphrases two of them for the script reader (P1 "einer probabilistischen
  Theorie" for "for a GPT"; P2 "auf den Operatoren" for "on B(H)"). The English keeps TJO's
  words and glosses them outside the boxes: "(a GPT, a general probabilistic theory)" in the
  introduction, "Here B(H) is the set of operators on H." after P2. These are the only places
  where the English script says more than the German.
- P5 keeps TJO's spelling "Heisenberg/Schroedinger" (as the course display does).

## Budgets (guides)
`wc -w` after the repairs: lec05 1387 (vl05 1277), lec06 2033 (vl06 1863); English runs about 7-10% longer than the
German, as in earlier chapters. English master: 82 pages (was 84 with the v0.2 chapters 5-6);
chapter 5 pp. 17-20, chapter 6 pp. 20-25. No overfull boxes in chapters 5-6.

## Migration records
M-0064..M-0072 stay `recorded`: NOTES-ch5 makes `applied` wait for the script snapshot that pins
chapters 5-6 (with the vl04 hat-seam sentence), which is not part of this round.

## German defects found (not fixed; German is not touched in this round)
1. `content/c03-hilbertraum/de.tex` header comment (lines 31-33): "In c03 kommen weder Zustände
   als Operatoren noch Pauli-Matrizen vor" is stale; σ_x appears from c03.ex.hadamard on. Comment
   only; the English header says it correctly.
2. Shared with the English (the course display is one line for both languages, so it cannot be
   changed from the English side): P1 omits TJO's marker "(*)" and its note ("Many-body QM is an
   extension of this axiom, and introduces the tensor operation, direct sum."), so P1 is not
   strictly verbatim in either language (codex review, last item). The course paragraph after P1
   carries the note's content in prose (tensor product, Chapter 12).

## Open for TJO
1. The two glosses in the English script (GPT, B(H)) next to your verbatim P1 and P2; or should
   the English boxes paraphrase as the German ones do?
2. "Schroedinger" in P5 (verbatim from BRIEF.md) or "Schrödinger".
3. Whether P1 should carry "(*)" and its note again (German defect 2 above); a change to the
   course display touches de.tex and en.tex together.
4. The German wording of P0-P5 is still the chapter author's translation (GAP-TJO, NOTES-ch6).

## Review
codex gpt-6.1-sol xhigh: `REVIEW-en-ch5-6.md`: 0 blocker, 0 major, 18 minor, 4 nit (prose and
terminology; no mathematical mistranslation). One repair wave: findings 1-3 and 5-22 applied as
proposed (finding 7 also in the c03.fig.diagonal caption). Not applied: finding 4 ("nontrivial
mixture" for "echte Mischung"): "proper mixture" is the term the English C1 already uses (c01
en.tex:568-628), so it stays for consistency. The P1 "(*)" item is a German/shared defect (above).
