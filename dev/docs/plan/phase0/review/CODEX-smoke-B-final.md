# Smoke B — independent Tier A review

Reviewer: codex gpt-6.1-sol, independent review 0e.

**Verdict: repairs required.** The independently checked two-body reduction, displayed bound-state functions, model numbers, and sampled kernel evaluations are correct. The findings below concern mathematical wording, unsupported completeness claims, figure captions, and gaps in validation. This bounded review is not an acceptance of checks marked COULD NOT CHECK.

Only this review and the listed page-image receipts were written in the repository. Scratch scripts, page renders, mutation fixtures, and logs are under `/tmp/smoke-b-review`. No repository generator or course build was run.

## Findings and repair instructions

Paths beginning `figures/` in this table are relative to `content/c11-wasserstoff/`. Apply prose repairs to the English counterpart as well.

| Severity | File and line / claim | Corrected statement or required action | Evidence |
|---|---|---|---|
| WRONG | `content/c11-wasserstoff/de.tex:464`; `figures/zerfliessen.tex:9,25` | Replace “gemeinsame Asymptote” by “gemeinsame asymptotische Steigung”. The positive-time asymptote is τ + k; draw separate asymptotes if the caption promises them. | `/tmp/smoke-b-review/audit.py` computed lim(√(1 − 6τ/5 + τ²) − τ) = −3/5. The dashed curve uses k = −3/5; the drawn line is τ. |
| WRONG | `content/c11-wasserstoff/de.tex:1464–1465`; `evidence/claims.json:3421`, `c11.cl.sa-relativ` hypothesis | A nonzero real scalar preserves the domains and essential self-adjointness, but scales the adjoint and closure: (cA)* = cA*, and closure(cA) = c closure(A). Replace the assertion that the closure itself is unchanged. The corollary's conclusion remains correct. | The adjoint identity follows by moving the real scalar through the inner-product defining equation; the closure identity follows by applying the invertible graph map (f,g) ↦ (f,cg). The existing wording says “noch den Abschluss”. |
| SCOPE | `content/c11-wasserstoff/de.tex:555`, `c11.cl.unorm` | Use ∫\|R\|²r² dr = ∫\|u\|² dr, or explicitly choose real radial solutions before writing R² and u². Keep that convention explicit in D72. | Multiplying the printed normalised real 1s radial function by i preserves its eigenvalue equation and physical norm but changes the printed R² integral to −1. `/tmp/smoke-b-review/audit.py` computed the real radial integral as 1. D66 chooses real functions in a depth block, after this generic Kern statement. |
| UNSUPPORTED | `content/c11-wasserstoff/de.tex:617,643–647,1240`; introduction at lines 14–15 | Say “the lowest energy in the constructed family” and “the constructed bound states and their densities have been described”. To call 1s the ground state without qualification, add a lower-bound argument. To claim a complete description or the allowed energies, supply the missing exhaustion/continuum result. | Theorem `c11.thm.spektrum` constructs solutions; lines 638–639 expressly do not prove absence of other bound states. `evidence/gaps.json:G-0016` leaves exhaustion and the remaining spectrum open. No lower-bound proof was found in the cited construction. |
| UNSUPPORTED | `content/c11-wasserstoff/de.tex:1015–1020` | Replace the universal statement “energies are not observable, only their differences are” by “For the spectral comparison made here, we use differences of the internal levels.” Tie that sentence to the added photon-energy convention. | Equation `c11.eq.linie` derives a gap and a wavelength under the assumptions at lines 1023–1029. It does not establish a general prohibition on measuring energy. No separate claim/source supports that prohibition. |
| MISMATCH | `content/c11-wasserstoff/de.tex:316,337–339`; `figures/kopien.tex:6–7`; `figures/ueberblick.tex:8`; `web/src/demos/c11.demo.cloud.ts:371,373`; storyboard scene `s6-lab` | Say “a scaled copy of the relative density”, with g_b(y) = b⁻³g(y/b), b = m_p/M. State that ρ_e = f*g_b. The storyboard should also name this scaling. | The correctly printed equation at lines 324–327 and sharp-COM limit at lines 369–377 imply this factor. Substitution R = x − br gives d³r = b⁻³d³R. The unscaled f*g wording silently uses b = 1; it is particularly misleading when the demo exaggerates the mass ratio. |
| MISMATCH | `content/c11-wasserstoff/de.tex:1216`; `figures/kugelschale.tex:5–8,23–29` | Explain the scaling of the three plotted curves. The thick curve is **four times** the product of the thin and dashed curves, not their product. The dashed curve is πa_μ³\|ψ₁₀₀\|², not unscaled \|ψ₁₀₀\|². | The file plots exp(−2x), x², and 4x²exp(−2x); its own header correctly describes the factor. The labels contain the scale factors, but the caption contradicts them. |
| MISMATCH | `evidence/claims.json:1675`, `c11.cl.separation` | Insert U in both statement strings: U H_tot Ψ = H_cm Ψ̃ + H_rel Ψ̃, or state the conjugated expression. | The TeX separation display at line 228 and independently checked change of coordinates use U H_tot Ψ. The ledger omits U and equates expressions in different coordinate representations. |
| MISMATCH | `scripts/c11/check_c11_formulas.py:456,533`; individual `c11.cl.psi*` numerical commands in `evidence/claims.json` | When checking one wavefunction, also check it against the reference R_nℓY_ℓm even when those entries were filtered out by `--only`. Alternatively, include its radial/harmonic dependencies in each ledger command. | In a `/tmp` copy, I changed both signs of ψ₂₁,±₁ in de.tex, en.tex, and formulas.json. `--only c11.eq.psi21pm` returned `0 failure(s)`. Adding `c11.eq.r21,c11.eq.y1pm` returned two `[product]` failures. The isolated command checks the mutual CS conjugation relation but not the absolute declared phase convention. |
| SCOPE | `scripts/c11/check_c11_formulas.py:110,143–146`; `content/c11-wasserstoff/formulas.json:note`; chapter header at `de.tex:5–8` | Limit the coverage claim to the exact grammar documented in the checker, or extend discovery to starred displays and registry-inserted definitions. Do not call it verification of every display. | A `/tmp` copy with an additional wrong `align*` display ψ₁₀₀(r,θ,φ) = 0 passed the **full** gate with `0 failure(s)`. Symbolic-index definitions, integrals, CDFs, and `\tpcdef` bodies are also outside its discovery rule. This limit is partly documented in the checker, but the JSON/header description is broader. |
| MISMATCH | `web/tests/kernels/hydrogen.test.ts:52` | Skip unsupported most-probable-radius cases explicitly; never return `c.expected` as the evaluated result. | The n > 2 branch compares the expected result with itself. It cannot test the kernel. The rest of the dispatch does import and evaluate the actual kernel. |
| SCOPE | `content/c11-wasserstoff/de.tex:400–404` | Qualify spreading in the Kern: a free packet eventually leaves every fixed bounded region; its width grows at large times when second moments exist, and it can initially narrow. The short Kern sentence should carry those meanings rather than rely on the depth block to supply them. | The depth block itself states the finite-moment hypothesis at lines 445–450, allows initial narrowing at lines 454–455, and proves local dispersal at lines 469–497. The calculations/argument were checked; monotone widening is not their conclusion. |
| SCOPE | `content/c11-wasserstoff/de.tex:52–57,879–889` | Preserve the honest “differential expression” framing, but say explicitly that eigenfunction equations hold off the collision point and as L² identities almost everywhere. Twice differentiable functions alone are not an operator domain on L². | The separation theorem already excludes r = 0 and defers domains. The 1s expression contains exp(−Z\|r\|/a_μ), whose directional derivatives at the origin disagree. The Kato statements concern the closure of the compact-support restriction. |
| MINOR | `content/c11-wasserstoff/de.tex:131` | Say that the full Jacobian preserves the integration volume, and that the particular planar cell in the figure has equal area. Do not state that arbitrary areas are preserved. | The independently computed determinant is −1. A Jacobian determinant controls full-dimensional volume; the displayed transformation is not orthogonal. For the stated illustrative mass ratio, the coordinate-axis vectors have unequal image lengths. |
| UNSUPPORTED | `evidence/gaps.json:184`, `G-0015` | Remove or source the parenthetical assertion that no origin boundary condition is needed for ℓ ≥ 1. An open request for a source should not assert the answer as established. | The row names an unread source for the radial-domain result, then states this additional conclusion. This review did not establish that theorem. |
| MINOR | `content/c11-wasserstoff/de.tex:1090–1093` | Say that the adopted natural-constant inputs come from CODATA; derived model values use those inputs, while illustrative parameters are choices. | The current “Alle Zahlen dieses Kapitels stammen aus der Liste” also encompasses the expressly chosen Gaussian width and illustrative mass ratios. |
| MISMATCH | `evidence/provenance.json:839–1020`, `P-0050` through `P-0059` | The ledger owner must fill `reviewer` and `review_receipt` with the identity and receipt mapping below, then regenerate the private-check receipt in the owner's authorised workflow. I did not edit the ledger. | `check_evidence.py:530–534` requires both fields on each page-image row and does not discover receipts by their `covers` field. The new receipt files validate, but the existing null links remain. Adding receipts also changes the input set bound by a prior private-check receipt. |

## What was independently verified

### Chapter mathematics and physics

`python3 /tmp/smoke-b-review/audit.py` completed after correcting a scratch-only symbolic handling issue. It imports neither the chapter checker nor the derivation checker. Its final run is recorded in `/tmp/smoke-b-review/audit.log`.

- From the coordinate matrix, it computed determinant −1 in each component and −1 in the full space, the inverse printed in the chapter, and A diag(1/m_e,1/m_p) Aᵀ = diag(1/M,1/μ). This independently verifies the chain-rule coefficients, cancellation of mixed terms, kinetic coefficients, and the unit absolute Jacobian. The potential substitution and tensor expression then follow directly. The theorem correctly restricts itself to differential expressions off the collision set.
- Holding an electron or proton coordinate fixed gives the chapter's two marginal integrals. Changing to R gives electron scaling b⁻³ and proton scaling a⁻³ with reflection, where a = m_e/M and b = m_p/M. Integrating either marginal over x gives the product of the separate normalisations. The sharp-COM formula and subsequent infinite-proton-mass limit are correct. A delta localisation is explicitly a limit of normalised packets, not an L² state.
- The COM Fourier-support argument correctly excludes a nonzero L² eigenfunction: its Fourier transform would be supported on a sphere or point of zero volume. The variance identity follows by expanding the stated R(t); the free-kernel bound and approximation argument establish local dispersal. The additive energy formula is correct as the finite kinetic quadratic-form expectation. The internal energy is not the total energy of a normalised moving atom.
- The substitution u = rR gave zero symbolic residual in the printed radial identity. The mass/length/energy substitutions give the printed dimensionless radial equation and κ_n = Z/(na_μ). The constructed-family count gives the chapter's counts for the displayed principal quantum numbers. This does not establish exhaustion of the spectrum.
- The scratch script independently constructed radial functions from the finite Laguerre sum and harmonics from differentiated Legendre polynomials. Every literal radial, harmonic, and wavefunction expression in formulas.json matched those references in the stated reduced-mass units and CS convention. It checked radial normalisation and radial differential equations, and the factorised inner products of the explicit wavefunctions. The command computed **14 wavefunctions and 91 distinct orthogonal pairs**, agreeing with the full gate's counts.
- The Rodrigues normalisation proof in the Vertiefung is sound for the integer α = 2ℓ + 1 used here: integration by parts kills lower-degree polynomials, the leading coefficient fixes the weighted norm, and the three-term relation supplies the extra power needed for the radial measure. The polynomial termination argument constructs solutions and honestly does not prove that nonterminating series cannot be normalised.
- The scratch script independently integrated the moments and reconstructed every printed CDF polynomial by integrating the density monomials. Differentiation returned r²R². The radial-node values and ground-family radial maximum agree. The moment recurrence passed the finite constructed-function checks; a fully independent general integration-by-parts derivation is COULD NOT CHECK.

The exact dimensionless moment results from `audit.py`, ordered as (⟨1/x⟩,⟨x⟩,⟨x²⟩), were:

| State | Independently integrated moments |
|---|---|
| 1s | (1, 3/2, 3) |
| 2s | (1/4, 6, 42) |
| 2p | (1/4, 5, 30) |
| 3s | (1/9, 27/2, 207) |
| 3p | (1/9, 25/2, 180) |
| 3d | (1/9, 21/2, 126) |

The source-image audit confirms that X.15 has the real-valued L²(ℝ³) + L∞(ℝ³) hypothesis and **both** conclusions printed in the chapter. X.16 has the finite collection of real measurable three-coordinate potentials and the essential-self-adjointness conclusion on the compact-support core in the higher-dimensional space. Its statement does not supply the closure's domain, and the chapter correctly does not add one. X.16, after mass scaling and orthogonal rotation, is the appropriate two-body theorem. The chapter does not incorrectly treat the pair potential as L²(ℝ⁶).

The Coulomb splitting calculation is correct: the radial measure cancels the inverse-square singularity in |V|², giving the printed 4πc²b, and the outer piece is bounded by c/b. The unit vector in the two-body rotation has squared components summing to one. The printed Reed–Simon III sentence literally uses “self-adjoint” on the compact-support space; the chapter correctly uses the essential-self-adjointness conclusion of X.16 instead. The direction caveat for the book's pullback is also real and correctly recorded.

### CODATA and precision

The scratch parser read the named rows directly from `sources/codata-2022/allascii.txt`, independently of repository numerical modules. The input loci are mass ratio line 117, Bohr radius line 61, Rydberg constant line 309, its energy-in-eV row line 311, Planck constant line 271, light speed line 330, and elementary charge line 132. The quotes in P-0060 through P-0066 match verbatim after collapsing layout whitespace, the same comparison convention used by the evidence checker.

Using the exact defining constants and the adjusted ratio/radius/Rydberg inputs, `audit.py` computed:

| Quantity | Independent central value | First-order absolute-derivative sum |
|---|---|---|
| μ/m_e | 0.9994556794247615215 | 9.38976955826347 × 10⁻¹⁵ |
| a_μ, m | 5.294654094602462778 × 10⁻¹¹ | 8.20496328615412 × 10⁻²¹ |
| E₁ with m_e, eV | −13.60569312299051376 | 1.48781038119840 × 10⁻¹¹ |
| E₁ with μ, eV | −13.59828726428328935 | 1.49977596770640 × 10⁻¹¹ |
| λ for 2 → 1, nm | 121.5684456172674402 | 1.34079704027939 × 10⁻¹⁰ |
| λ for 3 → 2, nm | 656.4696063332441769 | 7.24030401750871 × 10⁻¹⁰ |

The printed central values and upward-rounded uncertainty scales agree. The shorter Kern precision is supported by the input precision. The absolute-derivative sum bounds the first-order standard-deviation scale by the triangle inequality, without assuming independent inputs; it is not a deterministic error interval. The chapter calls it a scale rather than a propagated standard uncertainty. No covariance-based propagation was independently checked.

The chapter states the point-charge, spinless, nonrelativistic Coulomb scope, absence of a light field, and omission of recoil/radiative and resolved-line corrections. The wavelength comparison adds its photon-gap assumption explicitly and declines to infer rates or selection rules. Those qualifications are adequate for the printed model numbers.

### Kern honesty and prerequisites

The findings table lists the problematic Kern statements found in this review: generic real-square normalisation, unscaled convolution prose, the completeness/ground-state language, the energy-observability generalisation, and qualifications on spreading and differential expressions. I found no reduced-mass formula silently replaced by m_e and no orbital label that identifies the relative coordinate as a laboratory electron coordinate. The unscaled convolution prose is the fixed-nucleus shortcut that remains.

The Kern's introduction to L² gives normalised wavefunctions, integral inner products, formal differential expressions, and an explicit deferral of domains. That is an honest elementary bridge, subject to the clarification in the table. `G-0019` still reserves the operational/course wording for TJO; this review does not supply that framing.

Depth material invoked by the Kern is: the proof/meaning of COM spreading in c11.v1, the proof of the general energy construction and radial normalisation in c11.v2, the optional continuation to the displayed higher states in c11.v3, input precision in c11.v4, general moments/CDFs/probability surfaces in c11.v5, and operator domains in c11.f1. These are openly linked. The explicit low-state formulas, their displayed checks, and the elementary radial means do not need the general D66 formula to be usable. D69 uses R_nℓ in the Kern, where the necessary low-state R_nℓ have already been written out; it must not be read as an independent complete eigenbasis assertion.

`chapter.json` declares c05 and c10 as prerequisites. Lines 514–526 take the angular Laplacian identity from c10 and identify the finite harmonic range checked here; they do not attempt to prove the missing angular-momentum chapter. The prerequisite is declared. I did not verify that the not-yet-written c10 will actually supply its promised content.

The existence-only theorem, the explicit non-exhaustion sentence, and the open gaps are good scope statements. The conflicting “fully described” and ground-state assertions are listed for repair. A radial boundary-domain theorem and the continuum are COULD NOT CHECK, not established by normalisability alone.

### Evidence ledger and numerical-check honesty

A direct JSON inventory found **92 `c11.` claims**. The evidence categories generally fit: source rows for tensor identification, Kato statements and constants; derivation rows for coordinate/COM/radial algebra; exact symbolic numerical-check rows for the explicit functions; and source-backed rows for applying Kato after proving its Coulomb hypotheses. The substantive exceptions and limits are in the findings table.

The coordinate claims cite the matching two-body derivation section; the COM claims cite the matching marginal/Fourier section; the radial construction claims cite the radial and Laguerre sections; moment/CDF claims cite the corresponding section; and the Kato applications cite REVIEW.md A2 together with actual page-image rows. These links are useful, but an anchor-existence check is not a proof audit. In particular, `c11.cl.norm100` and `c11.cl.pnl` point to the section containing their input functions rather than their printed worked derivations, and the energy-gap ratio's lecture-verdict pointer is less direct than its worked chapter equation. A repair should use the actual derivation locus where practical.

`c11_numerics.py` reads CODATA for values and delegates explicit-function checks to the formula gate. Its golden comparisons are consistency checks, not independent confirmation of physics. The isolated ψ commands have the reproduced sign-validation gap. The full orthonormality command runs the full gate and tests actual expressions. The dedicated maximum and angular-Laplacian checks contain meaningful differential calculations. Exhaustive execution and semantic auditing of every individual ledger command is COULD NOT CHECK.

The generic evidence checker validates links, anchors, numerical exit values, and receipts; it cannot decide whether a paragraph really derives a theorem. Receipt validation here invoked its `review_receipt_ok` function with bytecode writing disabled and passed schema, filename ID, coverage, verdict, reviewer-identity and exact member/quote binding checks (the pending ledger reviewer was supplied in memory for this validation). A complete `check_evidence.py --private` run on a scratch repository copy is COULD NOT CHECK. It was not run in the repository.

### Formula gate

The required commands completed successfully:

```text
PYTHONDONTWRITEBYTECODE=1 python3 scripts/c11/check_c11_formulas.py
check_c11_formulas: content/c11-wasserstoff: 25 listed formulas (3 Laguerre polynomials, 9 spherical harmonics, 6 radial functions, 14 wave functions, 91 wave-function pairs); 50 displays of this kind in de.tex and en.tex
check_c11_formulas: 0 failure(s)
```

```text
PYTHONDONTWRITEBYTECODE=1 python3 scripts/check_red.py --gate c11-formulas
caught  tests/red/c11-formulas/laguerre-vl16-line85
caught  tests/red/c11-formulas/missing-condon-shortley
caught  tests/red/c11-formulas/psi21-vl16-line94
caught  tests/red/c11-formulas/tex-expression-mismatch
caught  tests/red/c11-formulas/tex-not-identical
caught  tests/red/c11-formulas/unlisted-display

6 red case(s), 0 problem(s)
```

Within its discovered grammar, the gate genuinely checks the TeX RHS against the stored expression, reference conventions, norms, inner products, radial residuals, and Cartesian Schrödinger residuals. It does not merely compare duplicate literal formulas. A wrong listed prefactor is constrained by normalisation; a wrong CS harmonic sign is constrained by the reference. Wavefunction signs are constrained by the product check in the full run. The mutation tests in the table establish the `--only` and display-discovery limits.

### Figures

Inspection of the mathematical plot expressions found the correct reduced-mass units for the effective potential, radial functions, radial densities, density slices, and term scheme. The effective-potential expression is ℓ(ℓ+1)/x² − 2/x in Rydberg units, consistent with its axis. The term heights use −1/n² and the Lyman/Balmer arrows end at the stated levels. The convolution figure uses the physical CODATA b factor and the Gaussian density convention. Its plotted laboratory value at x = 1 agrees with the independently evaluated convolution below.

The radial-function and CDF scratch evaluations include x = 1 and x = 2.7 for every plotted radial state; these supply independently evaluated points for those formulas. They are not an exhaustive extraction-and-comparison of every TikZ curve. The wrong common-asymptote and shell-product captions, and unscaled-copy prose, are recorded above.

**COULD NOT CHECK:** two independently recomputed plotted points for every curve in every figure; every tabulated convolution point; every schematic coordinate/arrow; uncertainty-plot endpoints; rendered axis/layout and shading fidelity. No figure was rendered into a repository build. Formula inspection is not a substitute for those checks.

### Kernel, views, tests, and storyboard

`node /tmp/smoke-b-review/kernel-check.mjs` imported the actual `web/src/kernels/hydrogen.ts` using Node's type stripping. Its reference values came from my SymPy/mpmath script, not a repository golden file. The final command passed. It compared the radial functions/CDFs at **30 points**, harmonics at **18 points**, and Gaussian-convolution harmonics at **4 points**. It also checked quantile residuals, angular density against the independently constructed harmonics, azimuth inverse residuals, and Cartesian real-orbital expressions.

The command printed these maximum absolute deviations:

| Check | Measured maximum |
|---|---|
| R_nℓ | 5.551115123125783 × 10⁻¹⁷ |
| Radial CDF | 2.7755575615628914 × 10⁻¹⁶ |
| Y_ℓm | 1.6653345369377348 × 10⁻¹⁶ |
| Convolution A₀/A₂ | 9.194034422677078 × 10⁻¹⁷ |
| Radial inverse-CDF residual | 1.2212453270876722 × 10⁻¹⁵ |
| Angular density identity | 2.220446049250313 × 10⁻¹⁶ |
| Azimuth inverse-CDF residual | 2.220446049250313 × 10⁻¹⁶ |

The convolution reference directly integrated the polar angle and radius rather than using the kernel's scaled harmonic functions. The independently computed 1s laboratory density at σ = 0.7 a_μ and |x| = a_μ was 0.037922550162930974 a_μ⁻³; at |x| = 2a_μ it was 0.0071840290332138325 a_μ⁻³. The other comparisons included a nonphysical b = 0.8 as an implementation check. These are numerical consistency results, not certified quadrature bounds.

The cloud calls `sampleRelative`, which uses the inverse of the radial CDF of r²R², the polar law integrated from |Y|², and the appropriate azimuth law. The real combinations are (ψ₂₁,−₁ − ψ₂₁,+₁)/√2 and i(ψ₂₁,−₁ + ψ₂₁,+₁)/√2, giving real angular factors proportional to x/r and y/r. Their coefficient norms and orthogonality of their components give unit norm. `common.ts` labels them as those superpositions; they are not labelled as m eigenstates. The laboratory map uses R + br and R − ar. Captions explicitly label relative coordinates, reduced-mass lengths, and exaggerated laboratory mass ratios as unphysical. Correct the convolution prose as noted above.

The phase view adds τ/n² to arg ψ, consistent with exp(−iE_nt/ℏ) and negative E_n under τ = |E₁|t/ℏ. The independent kernel command evaluated the stated phase example at n = 2, τ = 8π as 6.283185307179586 radians. The demo's playback rate is labelled as a drawing choice; the caption converts τ to physical model time. Density is unchanged.

The storyboard's nodal sphere, nodal plane, relative-coordinate, enclosed-probability-sphere, and phase-winding captions follow from their cited formulas. Its laboratory scene inherits the unscaled-convolution wording issue. The expanding Gaussian sequence is a chosen family of preparations; the cited marginal claim does not itself establish a particular free-packet time evolution.

The tests mostly dispatch to the actual imported kernel, not a copied implementation. The expected-answer fallback is the concrete exception in the table. The statistical thresholds include derived Chebyshev/union and moment bounds and explicitly label sharper acceptance thresholds as unvalidated choices. Their derivations assume independent draws; the fixed seeded generator run is an implementation check, not a proof of that probabilistic assumption. The angular histogram's expected probabilities also call kernel CDF helpers, so independent reference checks remain necessary.

**COULD NOT CHECK:** full Vitest execution, complete Julia-module execution and its tests, independent statistical goodness-of-fit runs, all view mounting/rendering behavior, video rendering/capture, every displayed caption at every control setting, arbitrary-state convolution accuracy and certified numerical error bounds. The supplied Julia implementation was inspected in part; it is not independently accepted in full by this review.

## Page-image receipts

I independently rendered and visually inspected the following pages using `ddjvu -format=pnm -page=N sources/<member> /tmp/smoke-b-review/<output>.pnm`. No book formula was taken from a text layer. The scan SHA256 values were independently recomputed and matched each provenance row. The receipts cover the quote/transcription and its source context; they do not certify every chapter assertion.

| Provenance | Source image and locus | Receipt written |
|---|---|---|
| P-0050 | Reed–Simon III, DjVu page 62, printed p. 55: tensor identification | `evidence/receipts/reviews/R-0050.json` |
| P-0051 | Reed–Simon I, DjVu page 66, printed p. 52: II.10(a), including the preceding separability hypothesis | `evidence/receipts/reviews/R-0051.json` |
| P-0052 | Reed–Simon III, DjVu page 62, printed p. 55: separated Hamiltonian and reduced mass; marked ellipsis confirmed | `evidence/receipts/reviews/R-0052.json` |
| P-0053 | Reed–Simon II, DjVu page 175, printed p. 165: X.15 | `evidence/receipts/reviews/R-0053.json` |
| P-0054 | Reed–Simon II, DjVu page 175, printed p. 165: definition of the sum of function classes | `evidence/receipts/reviews/R-0054.json` |
| P-0055 | Reed–Simon II, DjVu page 176, printed p. 166: X.16 statement | `evidence/receipts/reviews/R-0055.json` |
| P-0056 | Reed–Simon II, DjVu page 176, printed p. 166: rotation paragraph in the proof | `evidence/receipts/reviews/R-0056.json` |
| P-0057 | Reed–Simon II, DjVu page 176, printed p. 166: Coulomb example | `evidence/receipts/reviews/R-0057.json` |
| P-0058 | Reed–Simon III, DjVu page 62, printed p. 55: Kato application; literal wording and core caveat recorded | `evidence/receipts/reviews/R-0058.json` |
| P-0059 | Reed–Simon III, DjVu page 62, printed p. 55: pullback U | `evidence/receipts/reviews/R-0059.json` |

All these recorded rows were confirmed. No receipt was written for an unread page-image row. `review_receipt_ok` reported that all new receipts passed its current schema/ID/coverage/verdict and exact-binding checks (the pending reviewer link was supplied in memory). The ledger remains unlinked because it is outside this reviewer's write ownership. The schema/checker changed during final validation and added mandatory hash bindings; I added those bindings to the receipts and revalidated against the current checker. The inspected provenance quotes and loci, de.tex, en.tex, and formulas.json remained unchanged from the checked snapshot.

## German/English parity sample

The scratch selection command used `random.Random(20261012).sample(labels,10)` over labels read from de.tex. I compared the surrounding units, including prose and formulas. No substantive translation discrepancy was found in this sample. The Coulomb lemma's mathematical content agrees; the textual integral-extraction comparison differed because the translated prose places dollar-delimited expressions differently.

| Unit | German line | English line | Result |
|---|---|---|---|
| c11.s5 | 787 | 773 | Parity |
| c11.eq.hilbertraum | 60 | 59 | Parity |
| c11.eq.drehung | 1491 | 1464 | Parity |
| c11.eq.jacobi | 121 | 119 | Parity |
| c11.s1 | 24 | 23 | Parity |
| c11.eq.tilde | 106 | 104 | Parity |
| c11.eq.r32 | 959 | 943 | Parity |
| c11.lem.coulomb | 1428 | 1402 | Parity |
| c11.eq.y2pm1 | 938 | 922 | Parity |
| c11.eq.maximum | 1206 | 1185 | Parity |

## COULD NOT CHECK

The unfinished checks are explicit above: exhaustive per-claim semantic/command auditing; the general moment proof independently from scratch; radial boundary/operator-domain and spectral-exhaustion/continuum results; covariance-based uncertainty propagation; every figure's required sample points and rendered fidelity; full Julia/Vitest/statistical execution; mounted views and rendered video; and a complete private evidence-gate run on a scratch copy. The review makes no pass claim for those items. No missing result was supplied from physics or mathematics memory.