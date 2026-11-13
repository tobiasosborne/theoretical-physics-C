# NOTES-ch5: script chapter 5 (vl05), German, 2026-11-04

Brief: `docs/plan/lec56/BRIEF.md`. Sync table: `sync-ch5.md`. English (`lec05.tex`) follows later.

## What changed
- Chapter 5 is now the condensed Kern of c03.s13-c03.s15: trace (with cyclicity for maps between
  two spaces and tr|Ψ⟩⟨Φ| = ⟨Φ|Ψ⟩), eigenvalues and (unitary) diagonalisation in both directions,
  the spectral decomposition, orthogonality of eigenvectors of Hermitian operators, the
  finite-dimensional spectral theorem (stated; proof in the web course), the Hadamard example, the
  functional calculus and U_t.
- Position basis deferred to chapter 7 / C5 (D-POS): one-line pointer in the opening paragraph.
- Hats throughout. The qubit matrix is σ_x (Pauli matrix, no hat), basis |0⟩, |1⟩.
- The qubit time-evolution example moved here from chapter 6 (it belongs to the functional
  calculus), with an energy ε (M-0070).

## Budgets (guides, D-BUDGET-FLEX)
- Words (`wc -w`): 1277 after the muse repairs (v0.2: 1835). texcount not run (TeX not installed on this machine yet).
- Displays: 11 (v0.2: 33, of which about 10 were the position basis).
- Examples: 2 (v0.2: 1). Exception: the time-evolution example came from chapter 6; chapters 5+6
  together have 4 examples (v0.2: 5).
- Definitions: 3 definition environments (trace; eigenvalue/eigenvector/eigenspace and
  diagonal/diagonalisable; f(A)); v0.2 had the same notions inline.
- Pages: not measured yet (no TeX).

## Migration records (recorded, applied in the German text)
M-0064 (A: V → A), M-0065 (U: H → L²(R)), M-0066 (H3.3: diagonalisability without
finite-dimensional scope), M-0067 (typos, A/H), M-0068 (U+2212 minus), M-0070 (energy unit).
Status goes to `applied` when the English follows and chapters 5-6 are pinned in a script snapshot.

## Open
- **Hat seam sentence in vl04.tex** still says "ab Vorlesung 5". Changing vl04.tex now makes the
  applied records M-0005, M-0024, M-0052..M-0063 stale (they hash the live file through
  `tpc-script-v0.3.1`). Change it to "ab Vorlesung 7" together with the snapshot step
  (new snapshot `tpc-script-v0.3.2`, vl04 member of v0.3.1 to a Git member), not before.
- For TJO: the spectral theorem is stated without proof in the script ("Beweis im Webkurs"); the
  course proves it (c03.thm.spektral).

## Reviews
- codex: `evidence/derivations/c03/REVIEW-lec5.md` (0 blocker, 1 major, 8 minor; all applied).
- muse (student's eye): `MUSE-ch5-6.md`. Applied: "unitär diagonalisierbar" (D97 renamed, course
  convention stated), fixed reference basis and U^† written out, why eigenvalues are real, diag
  defined, Lagrange interpolation named, the series argument completed, the ellipse axes made
  precise. Not applied (length; later chapters): the differential Schrödinger equation, the
  group law U_{s+t} = U_s U_t, dropping the two-space cyclicity (chapter 6 needs the ket/bra case).
