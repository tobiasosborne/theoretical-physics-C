**A — Page-image provenance**

Ran `sha256sum` separately for every row; each matched `member_sha256`. Independently rendered and read the cited page images, without `djvutxt`. The sandbox blocked saving renders in the requested scratch directory, so images were rendered in memory.

| Row id | Verdict | Reason |
|---|---|---|
| P-0152 | PASS | Hash matches; image 48 prints 36; faithful quotation supports the explicitly scoped remark that Reed–Simon assume conjugate symmetry. |
| P-0153 | PASS | Hash matches; image 50 prints 38; Schwarz corollary matches and applies to every inner-product space. |
| P-0154 | PASS | Hash matches; image 50 prints 38; Theorem II.2 matches; its triangle inequality supports the finite-sum claim by iteration. |
| P-0155 | PASS | Hash matches; image 58 prints 46; general Gram–Schmidt step matches. Independent-input restriction is acknowledged; the chapter separately proves its extension. |
| P-0156 | PASS | Hash matches; image 58 prints 46; orthonormality and equality of initial spans are faithfully quoted, with the same acknowledged restriction. |
| P-0157 | PASS | Hash matches; image 56 prints 44; Theorem II.5 states the claimed existence theorem. |
| P-0158 | PASS | Hash matches; image 57 prints 45; both expansion and Parseval equations match, with the course’s inner-product convention. |
| P-0159 | PASS | Hash matches; image 57 prints 45; order-independent convergence statement matches and supports the convergence clause. |
| P-0160 | PASS | Hash matches; image 57 prints 45; square-summable-coefficient converse matches and supports the claimed converse. |
| P-0161 | PASS | Hash matches; image 56 prints 44; maximality definition matches; the equivalence claim additionally uses the separately cited expansion theorem. |
| P-0162 | PASS | Hash matches; image 154 prints 142; Lemma 3 states that the Hermite functions form an orthonormal basis of \(L^2(\mathbb R)\). |
| P-0163 | PASS | Hash matches; image 154 prints 142; the normalized Gaussian formula matches. |
| P-0164 | PASS | Hash matches; image 154 prints 142; both names for the functions appear as quoted. |

**B — Mathematics findings**

Below, `de.tex` and `en.tex` mean the files in `content/c03-hilbertraum/`. Locations identify the reviewed text; proposed fixes apply to both languages.

| Severity | File:line | Problem | Fix | Evidence |
|---|---|---|---|---|
| WRONG | `de.tex:1048`; `en.tex:916` | “A sum over infinitely many indices is a series” overlooks uncountable index sets, expressly allowed by D86. D86 defines nonnegative scalar sums, but the subsequent arbitrary-index vector sum lacks an interpretation. | Define vector sums by norm convergence over finite subsets, or explain that only countably many coefficients are nonzero and enumerate those. Specify norm convergence. | D86; inspected Reed–Simon p. 45 explicitly establishes countable support in the proof. |
| UNSUPPORTED | `de.tex:845`; `en.tex:738` | The specific claim about bounding a system’s energy using the triangle inequality has no worked bound or written supporting passage in the cited material. | Supply a concrete energy bound with its assumptions, or remove the energy example. | `vl03.tex:164` only says quantities can be bounded; the Lecture 3 derivation proves the vector-norm inequality, not an energy application. |
| SCOPE | `de.tex:883`; `en.tex:769` | Saying that completeness can be ignored and a Hilbert space is “simply” an inner-product space is unqualified. The following finite-dimensional example does not make the preceding general statement true. | Restrict the shortcut explicitly to the finite-dimensional Kern calculations; retain completeness for the infinite-dimensional results. | D14 requires completeness; the previously reviewed incomplete sequence-space example supplies a counterexample. |
| SCOPE | `de.tex:627`; `en.tex:548`; `registry/definitions.json:2953` | “Always” computing a bra-ket as the conjugate-row product overextends the standard-coordinate convention when D82 subsequently permits arbitrary inner products. Abstract bras are not defined by the column operation alone. | State that D81’s row formula uses the standard inner product. For a general chosen product, define the bra by its action \(w\mapsto\langle v,w\rangle\). | The chapter’s weighted example gives the representing row \((v_1^*,c\,v_2^*)\), rather than \((v_1^*,v_2^*)\). |
| MINOR | `de.tex:907`; `en.tex:788` | “Nothing at all to do with” overstates the distinction between completeness of a system and completeness of the space. They are different notions, but interact in the expansion theorem. | Say “This is a different notion of completeness.” | Reed–Simon p. 45 uses completeness of the space to obtain convergence in the basis-expansion proof. |
| MINOR | `de.tex:1186`; `en.tex:1042` | Calling the norm a “complex number” is technically compatible with real numbers being complex, but obscures the essential nonnegative-real restriction. | Write “the inner product is complex; the norm is nonnegative real.” | D83. |

No erroneous displayed calculation or invalid included proof was found. No material German–English mathematical mismatch was found.

The Kern’s finite expansion and Gram–Schmidt proofs do **not** depend on c03.v4. The assertion that \(\mathbb C^n\) is complete points to c03.f3 for its proof; this is an explicitly deferred proof, rather than a hidden dependency in the subsequent algebra.

**C — Migration records**

- **M-0017:** Cited text exists in DE/EN at line 195; diagnosis and correction are correct.
- **M-0018:** Cited text exists in DE/EN at line 216; diagnosis correctly identifies the zero denominator and agrees with the existing footnote.
- **M-0019:** Cited text exists in DE/EN at line 189; the completeness condition must quantify over vectors, not the summed indices.
- **M-0020:** Cited text exists in DE/EN at line 134; the missing `\langle` diagnosis is correct.
- **M-0021:** Cited German text exists at lines 5, 9 and 45; the wording diagnosis is correct.
- **M-0022:** Cited German text exists at lines 188–189; the misplaced emphasis boundaries are correctly diagnosed; English closes them correctly.
- **M-0023:** Cited text exists in DE/EN at line 221; the ambiguous antecedent diagnosis is correct but incomplete: “no vector” also needs “no **nonzero** vector.” The replacement already fixes this; record it explicitly in the diagnosis.
- **M-0024:** Cited German text exists at lines 256, 260 and 271; diagnosis is correct, but `new_text` at `M-0024.json:37` still puts the verb before its complement. Use “dass die Dimension von … \(n=2\) beträgt.”

**Checked and correct**

- All new displayed equations, included proofs, examples, exercise solution, definition bodies, requested notation rows, and the added c03.f1 sentence; qualifications are listed above.
- Figure source coordinates, projection rectangles, weights and caption agree. `check_c03.py` returned `ALL OK`.
- German–English comparison covered ket arithmetic, conjugation, weighted products, symmetry, Schwarz, triangle inequality, finite expansion, figure caption, Parseval, maximality, Hermite functions and Gram–Schmidt. All **32** new displayed-equation environments match after whitespace normalization.
- All checked migration source hashes match their recorded hashes.

**Could not check**

- Persisted render artifacts: the read-only sandbox denied output files. Visual inspection itself was completed.
- Compiled figure layout and lecture recordings; this review checked the figure source and written migration evidence.
- Earlier reviewed material was not re-audited. No repository files were modified.