# Independent review of c03

Repository: `/home/tobias/Projects/theoretical-physics-C`. All repository access was read-only; report and rendered scan pages are in the scratch directory. Reviewed both chapter editions in full, DERIVATION.md, definitions D75–D80, the c03 claim rows, and all five figure sources.

## A. Provenance rows

For **each row**, independently ran `sha256sum` and `ddjvu -format=pnm -page=N -scale=150 … pN.pnm`. Read the resulting page images (PNG conversions), including printed page numbers; did not use `djvutxt`. Shared pages were checked against each quotation separately. Per-row execution records: `provenance-checks.json`.

All eleven actual hashes equal `a9eb38970c669d4c315cba20580bc996eb024623af036c6c6d51bab1fdba9e36`.

“Supports claim” respects the ledger's scope/notes: some quotations support a definition or an accompanying remark, while the chapter supplies the proposition's proof.

| id | sha ok | page ok | quote ok | supports claim | verdict |
|---|---|---|---|---|---|
| P-0140 | Yes | Yes: 51 → 40 | Yes | Yes: definition/inner product, as scoped in notes | **PASS** — Example 3 gives precisely the quoted sequence space and conjugation convention. |
| P-0141 | Yes | Yes: 81 → 69 | Yes | Yes: Banach completeness at p=2 | **PASS** — Example 3 explicitly says ℓ_p is Banach in its p-norm. |
| P-0142 | Yes | Yes: 80 → 68 | Yes | Yes: p=2, Lebesgue measure | **PASS** — Theorem III.1(b) is the quoted Riesz–Fisher completeness statement. |
| P-0143 | Yes | Yes: 51 → 40 | Yes | Yes: L² Hilbert-space assertion | **PASS** — Example 4 states the assertion and the conjugated-first-factor integral. |
| P-0144 | Yes | Yes: 50 → 38 | Yes | Yes: specialize and square | **PASS** — The Schwarz corollary applies to every inner-product space, hence ℂⁿ. |
| P-0145 | Yes | Yes: 49 → 37 | Yes | Yes: opposite-convention remark only | **PASS** — The opening paragraph contains the quoted warning about other texts. |
| P-0146 | Yes | Yes: 29 → 17 | Yes | Yes: apply to F=\|f−g\|² and G=0 | **PASS** — The definition states a.e. equivalence iff the L¹ difference integral vanishes. |
| P-0147 | Yes | Yes: 29 → 17 | Yes | Yes: absence of intrinsic point values | **PASS** — The quoted sentence concerns classes; the stated L² transfer uses the same relation. |
| P-0148 | Yes | Yes: 30 → 18 | Yes | Yes: uniqueness of a continuous representative | **PASS** — The opening continuation is faithful; the L² extension is valid for Lebesgue a.e. equality. |
| P-0149 | Yes | **No: 20 → 6, not 8** | Yes | Yes: completeness of ℝ used in the proof | **FAIL** — The quotation is present, but the image visibly prints page **6**. |
| P-0150 | Yes | Yes: 81 → 69 | Yes | Yes: density remark only, p<∞ | **PASS** — Example 3 defines finitely supported sequences f and states their density in ℓ_p. |

P-0149 fix: retain DjVu index 20 and change `locus.printed_page` to `"6"`; synchronize references to this passage listed below. Section A has **10 PASS, 1 FAIL**.

## B. Mathematics and text

Paths below are repository-relative. Severity describes section B only.

1. **Medium — A semidefinite form is called an inner product before quotienting.** `registry/definitions.json:2827`–2828 (D78), `content/c03-hilbertraum/de.tex:365`–367, `en.tex:316`–318. On the stated space of actual piecewise-continuous functions, χ_{\{0\}} is nonzero but has zero self-product, as the chapter correctly demonstrates later. Thus D78 and the block's takeaway are literally false as inner-product assertions. **Fix:** call this the preliminary integral pairing, reserve “inner product” and L² for classes under a.e. equality, and explicitly distinguish the preliminary function space from D80. Also change D78's note at `registry/definitions.json:2867`: nonnegativity holds already for functions; **positive definiteness** requires classes.

2. **Medium — Decay at infinity is not the general L² admission criterion.** `de.tex:450`–451; `en.tex:398`–399. The examples are correct, but the unrestricted conclusion “what decides … is how fast” a function vanishes suggests pointwise decay is necessary. Even continuous L² functions need not tend to zero: disjoint triangular bumps of height 1 centered at positive integers, with half-widths 2^(−n−2), have summable squared integrals but value 1 at every integer. **Fix:** say “These examples show that tending to zero alone is insufficient; the criterion is the integral of the squared modulus.”

3. **Medium — The photon example conflates a mode with one photon.** `de.tex:343`–347 and `de.tex:472`; `en.tex:297`–300 and `en.tex:418`; `evidence/derivations/c03/DERIVATION.md:167`–169. A single quantized field mode has the oscillator's number-state space ℓ²; the one-photon sector of that one mode is one-dimensional. A travelling photon in a fibre requires a specified mode/wave-packet description. The cited lecture repeats the loose wording but does not resolve it. **Fix:** write “a single quantized electromagnetic mode, with arbitrary photon occupation,” and identify the number basis. For the L² particle entry, specify a spinless particle or its spatial degree of freedom.

4. **Medium — General states are conflated with state vectors.** `de.tex:66`–68, `de.tex:354`–355 and the system table at `de.tex:469`; corresponding `en.tex:42`–44, `en.tex:305`–306, `en.tex:415`. Vectors represent pure states after normalization and identification of overall phase; mixed qubit states from c02 require density operators. **Fix:** qualify these previews as “pure states can be represented by …”; give a short forward reference for normalization, rays, and mixed states.

5. **Medium — Kern relies on definitions and examples confined to depth blocks.** `de.tex:465`–490 (`en.tex:412`–436), outside both depth environments. “Damit haben wir …”, the ℓ²/L² system table, and the figure caption require D77/D78 and examples `c03.ex.rate`/`c03.ex.gauss`, which a Kern reader has skipped. This conflicts with the finite-dimensional bridge at `de.tex:221`–226. **Fix:** move this box and figure into a depth block, or make them a self-contained optional preview with no dependency on skipped definitions/examples. The completeness paragraph at `de.tex:494`–501 is a forward pointer, not itself an operational dependency.

6. **Medium — The second Vertiefung has an undeclared prerequisite.** `de.tex:362`–364 says v1 helps but is unnecessary; its proof at `de.tex:409` uses inequality `c03.eq.ab`, proved only inside v1 at `de.tex:288`–295. Same issue at `en.tex:313`–315 and `en.tex:358`. **Fix:** repeat the two scalar inequalities and their short justification in v2, or declare v1 a prerequisite. The optional analogy to `c03.ex.einsen` at `de.tex:430` should also be self-contained if v1 stays optional.

7. **Medium — The blanket rule about infinities is unsupported and misleading.** `de.tex:683`–688; `en.tex:624`–628. A divergent expression requires checking domains, limits, and the observable; simply discarding the calculation is not a mathematical rule. Finite Hilbert norm does not ensure finite moments of unbounded observables: normalized coefficients c_j=C/j lie in ℓ², but for positive energies proportional to j the first-moment series diverges. **Fix:** restrict the warning to normalized probabilities and state that divergent observable calculations require a domain/integrability check or a revised approximation. Supply a source if retaining a broader physical claim.

8. **Medium — Unsupported running-prose assertions.** `de.tex:35`–38 (`en.tex:17`–19) asserts that the reason for complex scalars is unknown and no better alternative has been found, without an evidentiary citation or defined comparison. `de.tex:598` (`en.tex:540`–541) says wavefunctions are “usually continuous,” without a class of models or regularity assumptions. **Fix:** replace the first with the scoped stipulation “We use the standard complex Hilbert-space formulation”; replace the second with “For wavefunctions admitting a continuous representative, the following statement is useful.” Neither needs the unsupported generalization.

9. **Low — Wrong printed-page reference propagates beyond provenance.** `de.tex:625`, `en.tex:568`, `evidence/derivations/c03/DERIVATION.md:16`, `registry/definitions.json:2901`, and `evidence/claims.json:4964` identify the completeness-of-ℝ passage as page 8. The rendered DjVu page 20 prints **6**. **Fix:** change these references to page 6, including the D79 origin's reference to this passage. This is the same defect that fails P-0149; the completeness statement and ℂⁿ proof remain correct.

10. **Low — D79's final sentence can imply inherited completeness.** `registry/definitions.json:2874`–2875: “Dasselbe gilt für einen Unterraum …” / “The same holds for a subspace …” follows the completeness definition. Read as a completeness assertion it is false, as F in the chapter shows. **Fix:** “These definitions also apply to any subspace, equipped with the restricted distance; completeness need not be inherited.” Explicitly refer to D80 for the L² metric. The fact that the proposed distance satisfies the triangle inequality also lacks a proof/citation here; add the norm triangle inequality, e.g. citing the already inspected Reed–Simon Theorem III.1(a), p. 68, for L², and deriving the finite/sequence versions from Cauchy–Schwarz.

11. **Low — An indefinite integral is equated to a constant.** `de.tex:438`; `en.tex:386`; abbreviated again in `evidence/derivations/c03/DERIVATION.md:95`. Written literally, `∫ exp(−y²/2) dy = √(2π)` is false. **Fix:** put bounds −∞ and ∞ on these integrals. The following displayed substitution and its value √π are correct.

12. **Low — Logarithmic growth is stronger than the supplied estimate.** `de.tex:328` and caption `de.tex:336`; `en.tex:283`–284 and `en.tex:291`. The proof gives only H_N ≥ ln(N+1), which proves divergence, not “grows like a logarithm.” **Fix:** add the elementary upper bound H_N ≤ 1+ln N, or say only “diverges.” The logarithmic-growth statement itself is true.

13. **Low — Partial-sum caption overstates the plotted data.** `de.tex:332`–337; `en.tex:288`–292 versus `content/c03-hilbertraum/figures/partialsummen.tex:24`–33. The first two curves contain 25 values rounded to four decimals; the all-ones curve contains only N=1,…,5 because of the vertical range. “N=1,…,25, summed exactly” does not describe all displayed data literally. **Fix:** say “values rounded to four decimals; the all-ones curve is shown only through N=5.” All stored numbers are correctly rounded.

14. **Low — Riemann-sum bound contradicts its own parenthesis.** `evidence/derivations/c03/DERIVATION.md:122`–123 first bounds every tagged sum for χ_{\{0\}} by the mesh. If 0 is a partition endpoint, both adjacent intervals can select it as tag, giving up to twice the mesh, as the parenthesis already recognizes. **Fix:** use 2·mesh throughout. The zero-integral conclusion is correct.

15. **Low — Figure “total size” needs the square.** `de.tex:489`–490; `en.tex:434`–436. The summed bar heights and area in `figures/raeume.tex:18`, `:32`, `:42` represent the **squared norm**, not the norm/length. **Fix:** replace “Gesamtgröße” / “total size” with “squared norm” and label panel (a)'s ordinate consistently for v/2 rather than the original v. The caption's component values 1/2 are correct.

Verification: `python3 -B evidence/derivations/c03/check_c03.py` completed with **ALL OK**. Independently recomputed every stored partial-sum and Gaussian-integral figure coordinate; all agree to the stated four-decimal precision. All 23 equation environments are identical between de.tex and en.tex. Read and compared the remaining prose, inline formulas, environment metadata, and registry definition translations: **no additional substantive German/English meaning mismatch found**. The two Cauchy–Schwarz proofs, ℓ² closure/convergence proof, function-space estimates, a.e.-class argument, ℂⁿ completeness proof, terminating-sequence counterexample, all numerical examples, and the exercise solution are mathematically sound, subject to the qualifications above. All five captions match their figure formulas/styles apart from findings 13 and 15. The quoted completeness theorem correctly specifies D80, rather than claiming completeness of the preliminary piecewise-continuous function space.

The following verdict concerns **section A alone**.

OVERALL: FAIL

---

## Repairs by the chapter author (2026-10-20, after this review)

The review above was run with `codex exec` (model gpt-6.1-sol, reasoning effort high,
sandbox limited to a scratch directory) on the prompt in `PROMPT-review.md`. Line numbers in
it refer to the files as they were before these repairs.

- A, P-0149: printed page corrected from 8 to 6 in provenance, claim hypothesis, D79 (origin
  and source locus), DERIVATION.md and both `\srcref` loci. The quote and the DjVu index were
  confirmed by the reviewer; the review receipt R-0140 covers the corrected row.
- B1: D78 now calls ⟨f|g⟩ on functions an integral with all properties of an inner product
  except definiteness; it becomes an inner product on the classes of D80. Lead and return line
  of Vertiefung c03.v2 changed accordingly.
- B2: closing sentence of example c03.ex.gauss and its title changed ("going to zero is not
  enough; what decides is whether the integral of the squared modulus is finite").
- B3: "a mode of light in an optical fibre" instead of "a photon"; "spinless particle".
  Recorded for TJO as G-0033 (e).
- B4: "pure" states, with a forward pointer to density matrices (vl06, Postulat 2).
- B5: the Kern box now says in words what l^2 and L^2(R) are and that the Kern uses only C^n
  up to Chapter 4; it no longer relies on the depth blocks' definitions.
- B6: the two scalar inequalities are repeated with their one-line proofs in the proof of
  c03.prop.ltwo.
- B7: the rule of thumb is kept as TJO's spoken remark but marked as not mathematical, with
  the derived counterexample sum_j j |1/j|^2 = infinity; G-0033 (f).
- B8: "usually continuous" replaced; the sentence "why complex, we do not know" is kept as
  TJO's framing (script vl02.tex:6, lecture v02 [77:16]) and listed as G-0033 (c).
- B9: see A. B10: D79's last sentence rephrased ("need not be complete"). B11: limits added.
  B12: "grow beyond all bounds, at least like a logarithm". B13: caption states rounding and
  the range of the all-ones curve. B14: DERIVATION.md uses 2·mesh. B15: caption says "inner
  product of the vector with itself".
