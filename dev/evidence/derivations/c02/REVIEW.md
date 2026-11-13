Independent review of C02

The exact mathematics in the worked models and all 13 game levels agrees with my independent calculations. All 29 displayed source quotations occur verbatim at their cited physical TeX lines. The principal disagreement is with §7.4's description of the verifier: its quote coverage is incomplete, it does not check the document's mathematical entries, and its comparison with `golden.json` is not byte-for-byte. Rounded coordinates in `golden.json` also require an explicit approximation interpretation: some stored boundary effects are slightly infeasible if their decimal strings are treated as exact numbers.

I wrote independent mathematical checks in `/tmp/c02_independent_check.py` and `/tmp/c02_edge_cases.py`, with outputs in the corresponding `.out` files. They do not import `check_gpt.py`. Verifier probes are separately recorded in `/tmp/c02_verifier_probe.py` and its `.out` file. Probes changed copies under `/tmp`, not the originals. The only repository file written by this review is `evidence/derivations/c02/REVIEW.md`.

**A. Quote audit.** Filenames in the following table are relative to `docs/plan/research/curriculum/plavala-src/`. Every entry passes the verbatim test, including the TeX macros and the alignment syntax in §1.6. The context column records what the quotation supports, rather than treating literal agreement as mathematical validation.

| Result | Source locus | Verbatim | Context and scope |
|---|---|---|---|
| 1.1 | `basic_v3.tex:4` | YES | Real, finite-dimensional ambient space; compact convex state space. Nonemptiness is added explicitly by the derivation. |
| 1.2 | `basic_v3.tex:13` | YES | Mixture of states in K with weight in [0,1]; preparation availability is separate. |
| 1.3 | `basic_v3.tex:9` | YES | Requires x in K, y,z in K, and a strictly interior mixing weight; these conditions are retained. |
| 1.4 | `basic_v3.tex:57` | YES | Mathematical effect set; lines 59–65 impose bounds on every state and affinity for every mixing weight. |
| 1.5 | `basic_v3.tex:70` | YES | Constant-one effect, not an arbitrary dual functional. |
| 1.6 | `basic_v3.tex:78` | YES | Real affine functions with all-state/all-weight quantifiers. |
| 1.7 | `basic_v3.tex:79` | YES | Positive affine functions; no upper bound of one. |
| 1.8a | `basic_v3.tex:154` | YES | Linear dual of A(K). The surrounding text distinguishes pairing from an inner product. |
| 1.8b | `basic_v3.tex:158` | YES | Positivity is tested against all of A(K)+. |
| 1.9 | `basic_v3.tex:174` | YES | Evaluation embedding, with x in K and f in A(K); injectivity is additionally derived. |
| 1.10 | `basic_v3.tex:181` | YES | Equality is up to the evaluation isomorphism, explicitly stated at line 183 and retained. |
| 1.11 | `basic_v3.tex:133` | YES | Complement of an individual effect. It does not supply the general finite-measurement definition; the derivation labels that addition. |
| 1.12 | `basic_v3.tex:531` | YES | Full experimental availability is an assumption, named no-restriction in the following sentence on the same physical line. |
| 1.13 | `basic_v3.tex:118` | YES | Order interval in the pointwise order; the additional dual-cone conclusion is derived. |
| 1.14 | `basic_v3.tex:141` | YES | Positive f and nonnegative domination coefficient; `mplmacros.sty:282` defines the nonnegative-real notation. |
| 1.15 | `basic_v3.tex:145` | YES | The unit effect is an order unit. The derivation repairs the sign problem in the source proof at line 148. |
| 1.16 | `basic_v3.tex:92` | YES | Positive-function cone in the finite-dimensional framework, not a universal claim about ordered spaces. |
| 1.17 | `basic_v3.tex:81` | YES | Span and cone generation. The derivation correctly handles the zero-function exception omitted at line 84. |
| 1.18 | `basic_v3.tex:162` | YES | Positive dual cone of the closed, convex positive-function cone. |
| 2.1 | `basic_v3.tex:55` | YES | Consistency of mixing preparations and mixing probabilities is required operationally. |
| 2.2 | `basic_v3.tex:15` | YES | Preparation construction; the whole-number condition on the finite-run illustration is retained. |
| 2.3 | `basic_v3.tex:63` | YES | Affine identity; line 65 requires it for every real weight in [0,1]. |
| 3.2 | `CT_v3.tex:61` | YES | Classical bit. Probability coordinates are the derivation's choice; the source subsequently uses a different chart. |
| 3.3 | `boxworld_v3.tex:91` | YES | Effect hull for the square defined at lines 25–89. The affine change to [-1,1]^2 is valid. |
| 3.4 | `QT_v3.tex:11` | YES | Density operators; line 6 assumes a finite-dimensional complex Hilbert space. The derivation specialises to dimension two. |
| 3.6 | `CT_v3.tex:112` | YES | Classical trit as a triangle; its probability-coordinate effects are separately derived. |
| 4.1 | `basic_v3.tex:508` | YES | Binary discrimination, priors lambda and 1-lambda, fixed outcome-to-guess convention; lines 490–506 provide the hypotheses. |
| 4.2 | `basic_v3.tex:31` | YES | Compact convex finite-dimensional state space equals the convex hull of its extreme points; applicable to the established E(K). |
| 6.9 | `basic_v3.tex:124` | YES | The quoted unqualified classical pointwise-maximum assertion is false. The derivation explicitly rejects it with a correct counterexample. |

There are **no literal quotation mismatches** and no unsupported attribution of the derived polygon formulas or discrimination examples to Plavala. There are the following qualifications and omissions:

- **Finite dimension:** this is a postulate of the adopted framework, not a deduction that every physical theory is finite-dimensional. `what_v4.tex:12–28` explicitly identifies the finite-dimensional Euclidean postulate as a simplification; `QT_v3.tex:6` repeats the finite-dimensional quantum assumption. §§1.1 and 7.2 retain this scope correctly.
- **Restricted effects:** §1.12's shorthand “an allowed subset” omits the consistency conditions immediately given in `basic_v3.tex:533`: 0 and u belong to E, E is convex, and state separation is usually assumed. Separation concerns distinct states. The shorthand is a necessary description, not a sufficient definition of a consistent restricted theory. Complementary outcomes and measurement availability must also be specified. This omission does not affect the unrestricted examples.
- **Measurements:** line 133 proves existence of a mathematical complement. It does not prove experimental availability of every multi-outcome list. §§1.11 and 7.2 correctly mark that additional convention; `basic_v3.tex:545` explicitly allows further measurement restrictions.
- **Self-duality:** `QT_v3.tex:25–31` uses the Hilbert–Schmidt identification for quantum operators. It says nothing about universal self-duality of GPT cones. The derivation's classical, square, polygon and Lorentz-cone conclusions are marked as derived and specify their coordinates/inner products.
- **Archimedean:** a case-insensitive search of all eight permitted source files finds no occurrence of “Archim”. §7.2 is correct to avoid attributing that terminology or the brief's universal assertion to Plavala. For this particular construction one can independently define the Archimedean condition as: f+epsilon*u is positive for every epsilon>0 implies f is positive. Pointwise evaluation proves it immediately by taking epsilon down to zero. This proves a property of A(K), not the brief's assertion about all physical theories.

The citations to `IDEAS.md` in §§3.3, 4.6, 6.3 and 7.2 are **COULD NOT CHECK**: that file is outside the authorised reading scope. Their mathematical replacements are checked below. The other run's reading history, arXiv version metadata, external references and claimed historical negative test are also **COULD NOT CHECK**.

**B1. Independent effect geometry.** I enumerated vertices from the state-value inequalities using my own Fraction-based Gaussian elimination for the bit, trit and first-release square. I chose independent evaluation rows and all zero/one endpoint assignments, solved the corresponding systems, and rejected candidates violating any remaining inequality. For the six regular polygons I independently constructed their state vertices and enumerated active intersections numerically; none of their effect formulas was used to generate the enumeration.

The classical bit has e(p)=q0*p0+q1*p1, with E(K)=[0,1]^2 and exactly (0,0), (0,1), (1,0), (1,1) as extreme effects. These agree exactly with the document and `golden.json`. The trit's analogous enumeration gives the eight zero/one triples.

For the square [-1,1]^2, the vertex bounds reduce to

\[
|a_x|+|a_y|\leq b,\qquad |a_x|+|a_y|\leq1-b.
\]

The enumeration gives exactly

\[
(0,0,0),\ (1,0,0),\ (1/2,\pm1/2,0),\ (1/2,0,\pm1/2).
\]

Both the defining set and this vertex list agree with §3.3 and the rational strings in `golden.json`. The count in §3.1 assumes the input points are the distinct vertices; a redundant generating list would give additional redundant inequalities.

For the qubit, write a general Hermitian effect as E=bI+a.sigma. Its eigenvalues are b±||a||, so the operator interval 0<=E<=I is precisely ||a||<=min(b,1-b). The trace pairing with rho(r)=(I+r.sigma)/2 is b+a.r. An operator in this interval with an eigenvalue strictly between zero and one can be perturbed in both directions along that eigenvector, so it is not extreme. Conversely, positivity of E and I-E forces any convex decomposition of a projection to agree on its range and kernel. Thus the extreme effects are exactly 0, I and the rank-one projections, equivalently (1/2,n/2) with ||n||=1. This agrees with §§3.4–3.5 and the stored parametric family. Sphere points are exactly the extreme states.

The disc has the same coefficient inequalities and extreme-effect description in two components. Its stored parametric family also agrees. Literal finite vertex arrays would be incorrect for the disc and qubit ball; their `null` arrays plus families are appropriate.

| Regular polygon n | Independently enumerated effects | Maximum coordinate discrepancy from stored list | Standard self-dual at unit radius | Standard self-dual at the stated scaled radius |
|---:|---:|---:|:---:|:---:|
| 3 | 8 | 2.22e-16 | no | yes |
| 4 | 6 | 1.11e-16 | no | no |
| 5 | 12 | 1.11e-16 | no | yes |
| 6 | 8 | 2.22e-16 | no | no |
| 7 | 16 | 1.39e-16 | no | yes |
| 8 | 10 | 8.33e-17 | no | no |

The odd/even formulas also have a valid general proof: three independent active bounds for a nonconstant planar effect require a supporting edge at one endpoint value and opposite support at the other. The opposite support is a vertex for odd n and an edge for even n. Solving those endpoint conditions gives exactly §3.7's F/complement and G families. The proof is not an extrapolation from the six numerical cases.

**B2. Affinity, compactness and extreme maximisers.** The affinity argument is a proof under its stated operational assumptions. With a mixing label chosen with probabilities lambda and 1-lambda, conditional outcome probabilities f(x), f(y) give lambda*f(x)+(1-lambda)*f(y). Operational identification of that randomised preparation with the state lambda*x+(1-lambda)*y then gives the affine identity. The finite-N frequency illustration alone does not establish an identity for arbitrary irrational weights, but §2.3 explicitly states the all-weight preparation/consistency assumption. No independence between successive experimental runs is needed for this probability argument; an observed finite frequency is not guaranteed to equal its expectation.

The compactness argument is sound. Choose d+1 affinely independent points of K spanning its affine hull. Rearranging an affine relation as equality of two convex combinations proves that an affine function is determined by its values at those points. The resulting finite evaluation isomorphism puts every effect in a bounded coefficient set because those values lie in [0,1]. All remaining state-value inequalities are closed half-spaces. Consequently E(K) is closed, bounded and convex in finite dimension, hence compact.

The maximum argument is also sound. P is a continuous affine functional on that compact set, so a maximiser exists. The finite-dimensional convex-hull-of-extremes theorem quoted in §4.2 expresses it as a finite convex combination of extreme effects; every positively weighted component must share its maximal score. Independently, successive coordinate maximisations on the compact optimal face select a singleton face and hence an extreme maximiser. These arguments establish existence of an extreme optimum, while allowing whole optimal faces.

**B3. Every game level.** I checked the priors, both states, feasibility and extremality of each displayed exact effect, its outcome probabilities and its attained score. Polytope optima were recomputed over my independently enumerated full extreme-effect lists. Qubit and disc optima were computed from actual 2x2 matrices using the spectral certificate derived below. Full-coordinate nonlinear optimisation supplied supplementary agreement for the nontrivial ball/disc examples; solver residuals were inspected rather than treating a success flag as a certificate. The trivial-guess level is certified spectrally.

The following probabilities refer to the exact effects in the document; P denotes the optimum in the same row. The final column counts all optimal extreme effects.

| Level | Recomputed exact optimum | e(omega1) | e(omega2) | Optimal extreme effects |
|---|---|---|---|---:|
| B1 | 1 | 1 | 0 | 1 |
| B2 | 3/4 | 3/4 | 1/4 | 1 |
| S1 | 1 | 1 | 0 | 1 |
| S2 | 1 | 1 | 0 | 2 |
| Q1 | (2+sqrt(2))/4 | P | 1-P | 1 |
| Q2 | 9/10 | 1 | 1 | 1 |
| T1 | 1 | 1 | 0 | 2 |
| P1 | (1+sqrt(5))/4 | 1 | (3-sqrt(5))/2 | 2 |
| H1 | 1 | 1 | 0 | 1 |
| D1 | (2+sqrt(2))/4 | P | 1-P | 1 |
| C1 | 1 | 1 | 0 | 1 |
| C2 | (55-7*sqrt(5))/40 | 1 | (7*sqrt(5)-15)/20 | 1 |
| C3 | (8+5*sqrt(2))/16 | 1/2+7*sqrt(2)/20 | 1/2-11*sqrt(2)/40 | 1 |

All exact formulas, stored approximate scores and stored finite tie counts agree. In S2 the winners are X+ and Y+, with their whole connecting segment optimal. In T1 the winners are (1,0,0) and (1,0,1), with the unused third coefficient free along the connecting segment. P1's two winners are the displayed complement of F2 and F4=(c/(1+c),h/(1+c),-j/(1+c)); their convex combinations are also optimal. No additional extreme-effect ties occur in these levels.

For Q2, D has eigenvalues 21/40 and 11/40, both strictly positive. Hence E=I uniquely maximises the score: always guess state 1, obtaining 9/10. The best rank-one effect gives 5/8, so omitting the trivial effect would materially change the answer.

I also rederived the document's classical, square and ball formulas. Maximising each classical coefficient independently gives sum_i max(pi1*p1i,pi2*p2i). Evaluating the six square extremes gives (1+max(|delta|,|vx|,|vy|))/2. For a ball/disc, maximising a.v at fixed b gives ||v||*min(b,1-b), whose piecewise-linear b objective is maximised at 0, 1/2 or 1. This yields (1+max(|delta|,||v||))/2, with precisely the choices and boundary ties in §4.4.

**B4. Independent qubit derivation and random tests.** Put D=pi1*rho1-pi2*rho2 and diagonalise the actual Hermitian 2x2 matrix as D=U*diag(lambda1,lambda2)*U†. In that basis,

\[
P(E)=\pi_2+\operatorname{tr}(DE)
=\pi_2+\sum_j\lambda_j\langle j|E|j\rangle.
\]

The operator interval implies each diagonal entry is between zero and one. Therefore tr(DE)<=sum_j max(lambda_j,0), attained by the projection onto the strictly positive eigenspace. Since tr(D)=pi1-pi2,

\[
P_{\rm opt}=\pi_2+\frac{\operatorname{tr}D+\|D\|_1}{2}
=\frac{1+\|\pi_1\rho_1-\pi_2\rho_2\|_1}{2}.
\]

This derivation includes semidefinite D and does not assume equal priors or purity. In Bloch coordinates D=(delta*I+v.sigma)/2 has eigenvalues (delta±||v||)/2, so ||D||1=max(|delta|,||v||), confirming §4.5.

I generated 12,000 matrix instances directly as GG†/tr(GG†), including general complex mixed states and rank-one pure states, with unequal priors and zero-prior endpoints. I compared the attained positive-eigenspace score, an SVD trace norm and the Bloch formula; the maximum disagreement was 8.88e-16. Computed eigenvalue signs classified 1,966 instances as positive semidefinite, 1,913 as negative semidefinite and 8,121 as indefinite. Independently generated operator-interval effects never exceeded the spectral bound.

Additional explicit cases checked both strict trivial guesses, identical equal-prior states, orthogonal states, both zero-prior endpoints and both boundary ties. For example pi1=3/4, r1=(0,0,1/3), r2=(0,0,-1) gives D=diag(1/2,0) and optimum 3/4. Every effect diag(1,t), 0<=t<=1, is optimal, including the positive-eigenspace projection and I. Reversing the construction gives the corresponding tie with the zero effect. If D=0, every effect scores 1/2. The document's tie qualifications are correct.

**B5. Cross-theory distinction.** The explicit pair (1,0), (-3/4,1/4) is common to the unit diamond, unit pentagon and unit disc. Its second point has diamond norm |x|+|y|=1 and squared disc norm 5/8. The pentagon's five supporting-edge slacks are approximately 1.26883343, 0.33949012, 0.05901699, 0.81501838 and 1.56272605, all strictly positive.

The diamond effect (1+x-y)/2 gives values 1 and 0. Independent enumeration gives the stated pentagon optimum (55-7*sqrt(5))/40, approximately 0.98368810394; its winning effect is (c+x)/(1+c). The disc distance is 5*sqrt(2)/4 and its optimum is (8+5*sqrt(2))/16, approximately 0.94194173824. Thus the precise claim in §4.6 is true, including the explicit states and optimal effects. The interior-point argument separately proves imperfection for the pentagon and disc.

Section 4.7 is also correct: for a common pair in the axis-aligned square and unit disc, a perfect square axis effect forces the corresponding state coordinates to be +1 and -1. Disc membership forces their remaining coordinates to vanish, so they are antipodal and also perfectly distinguishable in the disc. The diamond comparison must keep its stated chart; changing only the square chart does not preserve the common Euclidean geometry of the three theories.

**B6. Self-duality.** These are claims about unnormalised state cones, not equality of normalised state sets with effect intervals.

| Claim | Cone and pairing | Independent conclusion |
|---|---|---|
| Classical bit, §3.2 | Nonnegative orthant in probability coordinates; standard dot product | Self-dual. Testing each coordinate ray is necessary and sufficient for dual positivity. |
| Square, §3.3 | t>=max(\|X\|,\|Y\|); standard dot product on the homogeneous triples | Dual is s>=\|A\|+\|B\|. Unequal; (1,1,1) witnesses failure of equality. |
| Qubit, §3.5 | Lorentz cone t>=\|\|R\|\| in homogeneous Bloch coordinates | Self-dual under the standard dot product. PSD 2x2 matrices are self-dual under tr(XY). In equal operator coefficient conventions this pairing is twice the coefficient dot product. |
| Trit, §3.6 | Nonnegative orthant in probability coordinates | Self-dual under the standard dot product. |
| Polygons, §3.8 | Cone generated by (1,R*v_k); standard dot product | Dual slice vertices are -m_j/(R*c_n), obtained independently by intersecting pairs of state-ray inequalities. Unit-radius cones are unequal to their duals. Odd n becomes self-dual at R=sqrt(sec(pi/n)); even n retains the half-step angular offset. |
| Disc, §3.9 | Lorentz cone t>=sqrt(X^2+Y^2); standard dot product | Self-dual by the same necessity/sufficiency argument as the qubit cone. |

The polygon derivation of the dual rays, radius and angle is valid for every n>=3. The computation was independently repeated for n=3,...,8. The rotation/scaling map in §3.8 is a valid cone isomorphism; it does not prove equality under the specified inner product. No stronger assertion about alternative inner products for even polygons is made. A nonorthogonal coordinate change changes the transported inner product, explaining the different standard-inner-product conclusions for the probability trit and unit regular triangle. These distinctions are handled correctly in the document.

**B7. Supplied verifier.** I ran exactly:

```text
python3 evidence/derivations/c02/check_gpt.py --verify
```

Exit status: **0**. The complete output, and therefore its output tail, was:

```text
PASS: 11 theories, 13 levels; symbolic/rational identities and independent LPs.
```

The script has substantial real checks: exhaustive rational vertex enumeration; symbolic matrix identities; independently solved numerical polygon intersections; score and extremality tests; finite vertex maxima; direct state-inequality LPs; and spectral comparisons. It reads the actual TeX files at `check_gpt.py:446–447`, rather than checking quotes against hard-coded copies. I found no optimum check that merely compares a value with itself.

Its limitations are concrete:

1. **Incomplete quotation coverage.** `check_gpt.py:442` recognises only the exact column-zero quote syntax, and line 443 requires merely at least 15 matches, while this document has 29. In a temporary copy I indented the §1.1 block quote by one space and changed “finite-dimensional” to “infinite-dimensional”. That remains a Markdown block quote, but `check_source_quotes()` passed because it skipped the line. The same incorrect quote without indentation was correctly rejected. The actual snapshot's 29 quotations all match; the claimed general detection guarantee fails.
2. **Document mathematics is not compared with the generated data.** Apart from quotations, the script does not parse the Markdown results or level tables. In a temporary copy I changed B2's documented optimum from 3/4 to 1/4, left the script and original golden data intact, and `--verify` still passed. It verifies the script's definitions against its computations and regenerated data, not arbitrary mathematical assertions in `DERIVATION.md`.
3. **Text equality is not byte equality.** `check_gpt.py:488` uses `read_text()`, which normalises line endings. A temporary `golden.json` with every LF changed to CRLF had different bytes and passed full `--verify` with exit status 0. The corrected claim is equality of decoded text after newline normalisation against the generated canonical text.
4. **Some purported geometry checks cannot detect changes in the stored claim.** At line 102 the square witness is a fixed true arithmetic expression independent of the theory object and its self-duality flag. The bit, square, trit and ball self-duality metadata are assigned directly at lines 99–100, 149 and 307. The mathematical proofs justify the current values, but these assignments and a constant witness are not independent computations of those flags. Polygon duality is genuinely compared with independently constructed rays at lines 277–298.
5. **Coverage of random qubits is narrower than a general qubit test.** Lines 421–434 generate 200 mixed-state pairs with each Bloch coordinate in [-1/2,1/2], so every norm is at most sqrt(3)/2. Those samples omit pure states and the outer shell. Their integer inputs become floating-point arrays, so the spectral checks themselves are numerical, despite rationally representable inputs. The document supplies proofs; my independent tests extend the numerical coverage.
6. **Tolerance labels require care.** The explicit 1e-12 score comparisons and 1e-14 geometry comparisons are suitably tight for these examples. However, the HiGHS calls at lines 234–239 set no feasibility-tolerance options, and membership checks inspect only `success`, not equality residuals or weights. The stored `LP: 1e-12` is a score-comparison threshold, not a configured LP feasibility tolerance. No incorrect current level follows from this gap; their independent membership checks and substantial interior margins agree.
7. **Serialized feasibility is not checked exactly.** Checks use the pre-serialization symbolic effects and floating approximations; canonical regeneration does not establish that the rounded decimal strings define exact effects. See the precision hazard below.

**C. Verdict for every numbered result.** AGREE refers to the mathematical statement with its explicitly adopted hypotheses and exact coordinates. Approximate golden coordinates are covered by the separate precision qualification. The out-of-scope `IDEAS.md` citations and historical assertions remain COULD NOT CHECK even where the associated mathematics agrees.

| Result | Verdict | Evidence or correction |
|---|---|---|
| 1.1 | AGREE | Exact quotation; finite-dimensional compact-convex framework and explicit nonemptiness qualification. |
| 1.2 | AGREE | Mixture definition and preparation distinction retained. |
| 1.3 | AGREE | Extreme-point definition retains its hypotheses. |
| 1.4 | AGREE | All-state bounds and affine identity. |
| 1.5 | AGREE | Constant-one effect. |
| 1.6 | AGREE | Real affine function space. |
| 1.7 | AGREE | Pointwise positive affine cone. |
| 1.8a | AGREE | Linear dual; correct space. |
| 1.8b | AGREE | Positive dual cone; correct quantifier. |
| 1.9 | AGREE | Evaluation is positive, normalised, injective and affine. |
| 1.10 | AGREE | Correct evaluation isomorphism and nonzero-ray normalisation. |
| 1.11 | AGREE | Complement and finite probability-list derivation; operational availability explicitly added. |
| 1.12 | AGREE | Correct no-restriction statement; restricted-subset shorthand needs the consistency qualifications listed in A. |
| 1.13 | AGREE | Order interval and dual-cone characterisation. |
| 1.14 | AGREE | Positive order unit and nonnegative domination scalar. |
| 1.15 | AGREE | Continuity and compactness give a valid nonnegative bound. |
| 1.16 | AGREE | Closed, convex, pointed, generating positive-function cone. |
| 1.17 | AGREE | Normalise nonzero positive functions; use differences for the span. |
| 1.18 | AGREE | Closed, convex, pointed, generating state cone in this framework. |
| 1.19 | AGREE | Finite evaluation-map proof establishes compactness and convexity. |
| 2.1 | AGREE | Exact consistency assumption. |
| 2.2 | AGREE | Preparation assumption and integer-count limitation represented accurately. |
| 2.3 | AGREE | Conditional-probability proof under the all-weight operational assumptions. |
| 3.1 | AGREE | Vertex inequalities and full-rank active-constraint criterion; take the input list to be distinct vertices for the stated count. |
| 3.2 | AGREE | Exact independent bit enumeration and probability-coordinate cone dual. |
| 3.3 | AGREE | Exact independent square enumeration and non-self-duality witness; naming provenance COULD NOT CHECK. |
| 3.4 | AGREE | Direct Hermitian matrix eigenvalues and trace pairing. |
| 3.5 | AGREE | Sphere purity, projection extremes and Lorentz/PSD self-duality. |
| 3.6 | AGREE | Exact independent trit enumeration and orthant dual. |
| 3.7 | AGREE | General supporting-edge proof and all six independent polygon enumerations. |
| 3.8 | AGREE | Independently derived dual rays; stated radius/angle/inner-product qualifications are essential. |
| 3.9 | AGREE | Disc effect interval, extreme families and Lorentz-cone dual. |
| 3.10 | AGREE | Encoding and listed precision describe approximations; they do not guarantee exact feasibility of decoded decimal boundary points. |
| 4.1 | AGREE | Score, guessing baselines and positive-prior perfection criterion. |
| 4.2 | AGREE | Compactness plus finite-dimensional extreme-point theorem; existence only. |
| 4.3 | AGREE | Independent extreme-effect maxima and classical/square formulas. |
| 4.4 | AGREE | Piecewise-linear ball optimisation, including apices and ties. |
| 4.5 | AGREE | Independent spectral derivation, random matrices and explicit degenerate cases. |
| 4.6 | AGREE | Common states, feasible effects and all three optima verified; claim about `IDEAS.md` COULD NOT CHECK. |
| 4.7 | AGREE | Perfect square axis effect plus disc membership forces antipodes. |
| 5.1 | AGREE | All six exact levels, S2 ties and Q2's unique trivial guess. |
| 5.2 | AGREE | All seven exact extra levels, including the two P1 winners. |
| 6.1 | AGREE | Effect interval versus positive dual cone; unrestricted optimum is an upper bound under restrictions. |
| 6.2 | AGREE | Pure-state counterexamples and ball antipodality criterion. |
| 6.3 | AGREE | Correct functions/state-cone distinction; alleged wording in `IDEAS.md` COULD NOT CHECK. |
| 6.4 | AGREE | Polygon self-duality is qualified by radius and pairing. |
| 6.5 | AGREE | Optimal faces may contain nonextreme effects. |
| 6.6 | AGREE | Affinity becomes linearity after homogenisation. |
| 6.7 | AGREE | Measurement is a normalised outcome list; instruments require further structure. |
| 6.8 | AGREE | Zero prior invalidates the inference from score one to distinguishability. |
| 6.9 | AGREE | Exact source quote but false source assertion; classical midpoint counterexample and coefficientwise lattice correction are valid. |
| 6.10 | AGREE | Correct zero-division, zero-ray uniqueness and sign exceptions at the cited source lines. |
| 7.1 | AGREE | Listed mathematical claims follow within the adopted framework; machine labels have the limitations identified in B7. |
| 7.2 | AGREE | Relevant source/scope gaps; a derived Archimedean property can be added as in A without universal attribution. |
| 7.3 | COULD NOT CHECK | The other run's historical account of what it did not inspect cannot be independently established from these artifacts. The stated exclusions delimit this review too. |
| 7.4 | DISAGREE | Correct statement: the current run passes, its 29 recognised quotes match the source, and regenerated data agrees as newline-normalised text. Complete quote coverage, verification of document mathematics and byte-for-byte comparison are not provided. Temporary indented-quote, wrong-B2-table and CRLF probes demonstrate the failures. |

**What the chapter author may take.** The finite-dimensional state/effect construction, correctly distinguished cones and pairing, conditional affinity proof, compactness proof, existence of an extreme optimum, exact bit/square/qubit geometry, explicitly normalised polygon/disc constructions, all 13 exact levels and the arbitrary-prior qubit trace-norm formula are safe within the stated assumptions. The source counterexample and zero/sign repairs in §§6.9–6.10 should be retained.

**What the author should not take.** Do not treat the verifier's PASS as an audit of every mathematical sentence or every possible quote format. Do not use the approximate JSON strings as exact feasible boundary coordinates. Do not generalise the finite-dimensional construction to the brief's infinite-dimensional or universal physical assertions, equate measurements/instruments with individual effects, omit operational effect/measurement restrictions, or drop the pairing and coordinate conventions from self-duality and cross-theory comparisons. External polygon identification, arXiv metadata, `IDEAS.md` wording, instruments, dynamics, tensor products and infinite-dimensional theorems remain **COULD NOT CHECK** under this review's scope.

**Hazards not adequately covered in the derivation.**

- **Rounded boundary effects can leave E(K).** For Q1 and D1, treating the stored decimal strings as exact rationals gives ||a||^2-1/4 = 196572699899009641 / 5000000000000000000000000000000000, approximately 3.931454e-17, which is positive. Thus the exact-decimal matrix has a negative eigenvalue and an eigenvalue above one. C3 likewise exceeds the squared radius by approximately 2.262682e-17. Stored polygon state/effect decimals also produce small feasibility violations, reaching approximately 1.164386e-16 for n=7. These are rounding effects, not counterexamples to the exact formulas. A chapter or game should reconstruct exact expressions or explicitly enforce a feasible coefficient representation; a serialization match is not a positivity certificate.
- **Restricted sets need structural conditions.** The omitted conditions at `basic_v3.tex:533` matter when moving beyond the examples. Also, the existence proof for an unrestricted optimum does not automatically apply to a nonclosed allowed effect set; use a supremum unless compactness of the allowed set is established.
- **Conic hull terminology differs in the source.** `cones_v3.tex:5` defines cone(X) as nonnegative scalar multiples, without sums. For a convex set K or E(K), this already agrees with its convex conic hull. For a finite list of vertex rays, it does not: positive sums must be included. Section 3.8 does include them correctly, but the chapter should avoid silently transferring the source definition to arbitrary generating lists.
- **A cited general dual-cone lemma lacks closedness.** `duals_v3.tex:70` asserts that a pointed cone has a generating dual without assuming closure. As written this is false: C={(x,y):y>0} union {0} is a convex pointed generating cone, while C*={(0,b):b>=0} has one-dimensional span. The closed positive-function cones used in §1.18 avoid this counterexample. Correct the general lemma by assuming a closed convex pointed cone; do not copy its statement without those conditions.
- **Affine-domain and origin issues in source proofs.** `basic_v3.tex:227` writes f(0) for f initially defined only on K; an affine extension and a chosen origin are needed when 0 is not in K. The source's subset lemma at lines 336–346 also uses equality of linear spans to identify affine-function spaces. That is insufficient: in V=R, K_B={1} and K_A=[0,1] have the same linear span but affine-function spaces of dimensions one and two. For coefficient identification use the same affine hull; otherwise use a restriction map. The derivation's own affine-basis argument avoids both problems.
- **Numerical solver status is not a feasibility proof.** My supplementary full-coordinate optimiser reported success on Q2 while returning an effect outside the ball interval by approximately 4.6e-8 and an apparent score slightly above 0.9. The spectral bound exposed it immediately. Validate constraints in their original form, especially at trivial-effect apices; do not promote a solver's success flag or a small squared-constraint residual into an exact certificate.
