C = `REVIEW-lec4.md` §B; S = `REVIEW-ch4.md`; M = `MUSE-ch4.md`. Locations refer to the supplied snapshots.

| Finding (source) | Verdict | File:line | Note |
|---|---|---|---|
| Infinite-dimensional “no matrices” claim (C) | CLOSED | `c03-de-now.tex:1321`, `1357` | Now says no **finite** matrix; adds basis, convergence and domain qualifications. |
| Rank-nullity and determinant prerequisites (C) | CLOSED | `c03-de-now.tex:1738`, `2065` | TJO’s acceptance is recorded in NOTES, derivations and claim notes. |
| D17 adjoint scope (C) | CLOSED | `c03-de-now.tex:1394` | Current registry body opens with finite dimension and qualifies the broader case separately. |
| D18 and Hermitian/self-adjoint distinction (C) | CLOSED | `c03-de-now.tex:1515`, `1553` | Finite-dimensional synonym retained; D18 removes domain terminology; broader comparison moves to c03.v5. |
| Missing symmetry hypothesis (C) | CLOSED | `c03-de-now.tex:1562`, `1616` | Both repaired statements now concern unbounded **symmetric** operators. |
| Unrestricted spectral-theorem claim (C) | CLOSED | `c03-de-now.tex:1645` | Correctly restricted to the comparison among symmetric operators. |
| Infinite matrix elements determine an operator (C) | CLOSED | `c03-de-now.tex:1598`, `1823` | Bounded, everywhere-defined case established; domain counterexample supplied. |
| Product sentence and example (separate request) | CLOSED | `c03-de-now.tex:1466` | Composition order and both matrix products are correct. |
| Projector role (separate request; M §4) | CLOSED | `c03-de-now.tex:1539`; `vl04-now.tex:49` | Matching yes/no-measurement wording. “Normierung” retained as TJO decided. |
| Hermitian/self-adjoint warning (S) | CLOSED BUT NEW PROBLEM | `vl04-now.tex:51`; `lec04-now.tex:51` | Mathematical correction succeeds, but imports a result outside the Kern; see below. |
| Hat convention and chapter seam (S; M §4) | CLOSED | `vl04-now.tex:22`, `24` | Approved exceptions and later chapters’ notation are stated. |
| Adjoint between different spaces; unexplained underlying vector (S; M §1) | CLOSED | `vl04-now.tex:67` | Bridge restored; bold vector explained. |
| Additional scalar-identity example (S) | CLOSED | `vl04-now.tex:121` | Witness removed; correct normality statement retained. |
| Adjoint matrix qualification and isometry normality (M §4) | CLOSED | `vl04-now.tex:31`, `65`, `57` | Coordinate entries distinguished from orthonormal matrix elements; finite-dimensional qualification restored. |
| Eigenvalue multiplicity and converse ambiguity (M §4) | CLOSED | `vl04-now.tex:121`, `124` | Repeated zero is correct; necessary conditions are explicitly identified. |
| Composition order and matrix-index explanation (M §§1–2) | CLOSED | `vl04-now.tex:17`, `60`, `65` | Right-first order and column/row meanings are clear. |
| Definition sentence interrupted by display (M §5) | PARTLY | `vl04-now.tex:27`, `31` | Shorter lead-in helps, but “ist durch [display] festgelegt” still interrupts the sentence. Complete the lead-in before the display. |

New findings:

| Severity | File:line | Problem | Fix | Evidence |
|---|---|---|---|---|
| SCOPE | `vl04-now.tex:51`; `lec04-now.tex:51` | The repaired paragraph asserts equivalence for operators on the whole space, extending beyond the Kern’s finite-dimensional statement. The mathematics is correct; its placement violates the script’s scope rule. | State the finite-dimensional synonym, then give a short web-course pointer for restricted domains. | Kern: `c03-de-now.tex:1553`, current D18. The broader result is `c03-de-now.tex:1649`, inside c03.v5. Script BRIEF rule 1 requires Kern correspondence. |

Checked and correct:

- Exact product verification: \(EF=\operatorname{diag}(1,0)\), \(FE=\operatorname{diag}(0,1)\).
- The bounded \(\ell^2\) reconstruction proof works: boundedness gives \(Tv_N\to Tv\), and Schwarz gives convergence of each coordinate. This establishes uniqueness from the matrix elements.
- The multiplication counterexample works: both domains give \(j\delta_{jk}\), but \(v_j=1/j^2\) belongs to the maximal domain and has infinite support. Independently computed \(\|v\|^2=\pi^4/90\) and \(\|Mv\|^2=\pi^2/6\).
- Revised Gram–Schmidt arithmetic, normalization and dependent-vector relation are correct.
- \(B\)’s characteristic polynomial is \(\lambda^2(\lambda-1)\), confirming the repeated zero.
- Repaired DE/EN passages agree; checked changed displays match.
- `check_c03.py --verify` returned `ALL OK`; script parity passed. The snapshots matched the current files when checked.

COULD NOT CHECK: rendered PDF/web layout and fresh source-image provenance were not checked in this bounded pass.