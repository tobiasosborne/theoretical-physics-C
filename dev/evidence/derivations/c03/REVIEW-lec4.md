## A. Page-image provenance

For every row, an independent `sha256sum` matched `member_sha256`:

`a9eb38970c669d4c315cba20580bc996eb024623af036c6c6d51bab1fdba9e36`

I rendered the requested DjVu pages with `ddjvu -format=pnm -scale=150` and read the images in memory. No text layer was used.

| Row | Verdict | Reason |
|---|---|---|
| P-0318 | PASS | Hash matches; scan 18 prints 8. Faithful boundedness inequality; supports the definition used by `c03.cl.beschraenkt`, whose matrix estimate is separately derived. |
| P-0319 | PASS | Hash matches; scan 98 prints 84. Faithful Hellinger–Toeplitz statement, including everywhere-definedness and symmetry. |
| P-0320 | PASS | Hash matches; scan 98 prints 84. Faithful passage explaining why unbounded symmetric physical operators require restricted domains. |
| P-0321 | PASS | Hash matches; scan 261 prints 249. Faithful opening sentence; supports the contextual assertion about important unbounded operators. |
| P-0322 | PASS | Hash matches; scan 267 prints 255. Faithful definition of symmetric/Hermitian, including domain inclusion and equality of action. |
| P-0323 | PASS | Hash matches; scan 267 prints 255. Faithful equivalent inner-product characterization of symmetry. |
| P-0324 | PASS | Hash matches; scan 267 prints 255. Faithful self-adjointness definition, including equality of domains. |
| P-0325 | PASS | Hash matches; scan 268 prints 256. Faithful spectral-theorem/unitary-group passage in the comparison of symmetric and self-adjoint operators. Preserve that context; see B. |
| P-0326 | PASS | Hash matches; scan 199 prints 187. Faithful self-adjoint matrix criterion. Supports the explicitly identified special case; the general adjoint-element formula is separately derived. |
| P-0327 | PASS | Hash matches; scan 209 prints 197. Faithful right-shift example: \(A^*A=I\), failure of surjectivity, hence nonunitarity. |
| P-0328 | PASS | Hash matches; scan 209 prints 197. Faithful norm-preserving definition of isometry; consistent with the separately derived shift calculation. |

## B. Mathematics findings

`de.tex` and `en.tex` below mean the **frozen scratch copies**, not the changing repository files.

| Severity | File:line | Problem | Fix | Evidence |
|---|---|---|---|---|
| WRONG | `de.tex:1319`, `1354`; `en.tex:1130`, `1157` | “No matrices … as a table of numbers” in infinite dimension is false and contradicts the subsequent infinite-table analogy. Infinite matrix representations exist; their interpretation requires hypotheses. | Say “no finite matrix”; qualify the infinite-table analogy by the chosen basis, convergence and domain. | The chapter itself uses infinite matrix elements at `de.tex:1779` and the explicit shift at `1722`. |
| UNSUPPORTED | `de.tex:1695`, `2018` | **Evidence gap, not incorrect mathematics:** rank-nullity and the determinant criterion are imported without a local proof/source. Their acceptance as prerequisites remains explicitly unresolved. | Supply a local proof/source or record an approved prerequisite. | `DERIVATION.md:445`, `513`; `NOTES-author.md:132`; ground-truth rule in `docs/plan/phase0/COORDINATION.md:12`. |
| SCOPE | `registry/definitions.json:645`, `646` — D17, inserted at `de.tex:1388` | The reusable definition starts with arbitrary \(\mathcal H\)/D87, then gives adjoint identities without an explicit finite-dimensional or bounded-operator scope. The chapter’s proof establishes the finite-dimensional case. Everywhere-definedness alone does not guarantee an everywhere-defined adjoint. | Put the finite-dimensional hypothesis at the opening; describe broader cases separately. | `de.tex:1394`, `1462`; D87 permits arbitrary Hilbert spaces. |
| SCOPE | `de.tex:1533`; `en.tex:1304`; D18 at `registry/definitions.json:701` | Infinite dimension alone does not make Hermitian and self-adjoint different. Bounded everywhere-defined operators retain the equivalence. D18 also imports D16/D19 domain terminology into the Kern body. | Keep the finite-dimensional synonym in Kern; put the restricted-domain terminology and comparison in c03.v5, explicitly identifying the usage “Hermitian = symmetric.” | `de.tex:1606` proves the everywhere-defined equivalence; P-0322/P-0324 distinguish domains. |
| SCOPE | `de.tex:1577`; `en.tex:1346` | The transition suggests that unboundedness alone prevents an operator from being everywhere defined. Hellinger–Toeplitz requires symmetry. | Write “Unbounded **symmetric** operators cannot be everywhere defined.” | The actual theorem at `de.tex:1580` and P-0319 include the symmetry hypothesis. |
| SCOPE | `de.tex:1603`; `en.tex:1372` | “Only self-adjoint operators have the spectral theorem” loses the source’s symmetric-versus-self-adjoint context. Normal operators also have a spectral theorem. | Qualify the comparison as concerning symmetric operators; retain the self-adjoint-generator statement for unitary dynamics. | P-0325’s surrounding paragraph supplies that context. The computed normal, non-self-adjoint \(iI\) is already a counterexample to the unrestricted wording. |
| SCOPE | `de.tex:1776`, `1779`; `en.tex:1522`, `1524` | The infinite-dimensional extension mentions convergence but omits domain information. Matrix elements alone need not determine an unbounded operator, even when all basis vectors belong to its domain. | Restrict uniqueness to bounded everywhere-defined operators, or require the domain and suitable core information. | The multiplication operator at `de.tex:1562`, restricted to finitely supported sequences or given its maximal domain at `1569`, has identical canonical matrix elements but different domains. |

No MISMATCH was found in the English spot-checks.

## C. Defects in `git HEAD:latex/lectures/de/vl04.tex`

Duplicates between the notes are consolidated.

- **5:** Quoted sentence is present. Diagnosis is right under the course convention: states are density operators; vectors represent pure states through their normalized projectors.
- **8:** Grammar error is present; “ein Hilbertraum” is correct. `NOTES-ch4.md` incorrectly cites old line **9**.
- **13:** “endlich dimensional” is present; the proposed spelling cleanup is appropriate.
- **39:** Quoted grammatical errors are present. The mathematical scope diagnosis is right: conjugate transpose requires the standard coordinate inner product, or an orthonormal matrix representation.
- **69, isometries:** Quoted statement is present and mathematically correct: finite dimension makes every isometry normal. This is a clarification item, not a mathematical defect.
- **69 and 207, `---`:** Both occur; their removal implements the stated prose-style rule.
- **70:** “selbstadjugierte” is present. Typo and missing scope diagnosis are right; unrestricted symmetry does not imply self-adjointness.
- **81:** Missing `\rangle` is present; diagnosis is right.
- **85:** Quoted justification is present. Adding the expansion formula improves the justification; the resulting equation is correct in its finite-dimensional scope.
- **89:** Quoted overclaim is present. Diagnosis is right: infinite sums require convergence checks, and unbounded operators additionally require domain/core conditions.
- **96–100:** Bare vector symbols are present. They conflict with the local decoration convention; this is a notation issue, not incorrect linear algebra.
- **121:** Wrong quantifier and incomplete application notation are present. Quantify over \(\chi\) and write \((|\Psi\rangle\langle\Phi|)|\chi\rangle\).
- **156, language:** “is” and the comma are present; proposed correction is right.
- **156, photon-number model:** Assertion is present. Unsupported by the supplied evidence; that does not establish physical falsity.
- **174:** “einen Unitärmatrix” is present; grammatical diagnosis is right.
- **199:** \(A\) is present immediately before the display for \(C\); correction to \(C\) is right.
- **207:** Quoted normality restriction is present. The implications are correct; normality is unnecessary for these forward implications. MINOR clarification, not a false calculation.
- **M-0024’s moved material:** The cited errors are in HEAD’s `vl03.tex:256`, `260`, `271`, not vl04. The listed language corrections are appropriate.

## Checked and correct

- Read the entire requested German interval, the Lecture 4 derivations, all requested definition bodies, CONV-HAT and the spectrum figure source.
- Adjoint existence/uniqueness, weighted-inner-product example, adjoint rules, polarization proof, positivity implications, finite-dimensional isometry/unitarity argument, ket/bra maps, operator expansions and exercise solution are correct under their stated finite-dimensional hypotheses.
- Hellinger–Toeplitz itself, domain-based symmetry/self-adjointness, and the right-shift calculations are correct. The included Kern proofs do not require the Vertiefung proofs.
- Independently recomputed the characteristic polynomials: \(A\) has \(0,\pm\sqrt2\); \(B\) has \(1,0,0\), counting multiplicity; \(C\) has the stated cube roots of \(-i\). Plotting only the distinct points \(0,1\) for \(B\) is correct. TikZ coordinates agree with the generating formulas.
- Hats follow the stated exceptions. No new reader-facing sentence calls Hilbert-space vectors “the states.”
- Eight DE/EN spot-checks agree: operator scope `1328/1135`, notation `1373/1170`, adjoint `1393/1187`, weighted product `1448/1238`, Hellinger–Toeplitz `1579/1349`, shift `1718/1473`, ket-bras `1870/1594`, spectra `2011/1720`. All **23** displays match after whitespace normalization.
- `python3 evidence/derivations/c03/check_c03.py --verify` exited successfully with `ALL OK`.

## COULD NOT CHECK

A fresh course PDF/web build and rendered figure layout were not checked; the filesystem refused scratch writes. Figure mathematics was checked from TikZ. I did not establish the claimed absence of photon-number sources across the entire repository. No repository file or review receipt was modified.