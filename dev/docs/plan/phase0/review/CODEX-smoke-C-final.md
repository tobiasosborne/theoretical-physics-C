# Independent Tier A review: Smoke C

**Verdict: repair before acceptance.** The main mathematics and the implemented discrimination kernel are correct under the chapter's stated assumptions. The chapter contains a false description of nonextreme qubit effects, missing qualifications in some Kern prose, and a reward rule that disagrees with the game. Some chapter-added results have correct proofs on the page but inaccurate derivation pointers. The author's framing also receives interpretations that his brief leaves open.

The German chapter was read in full. The derivation and its earlier review were treated as inputs, not certificates. Source statements were checked in their local context. Plávala filenames below are relative to docs/plan/research/curriculum/plavala-src/. Only docs/plan/phase0/review/REVIEW-smoke-C.md was written in the repository; computations, test copies, caches, and probes were placed under /tmp/smoke-c-tier-a/.

**Findings and repairs**

| Severity | File and line | Corrected statement or required action | Evidence |
|---|---|---|---|
| WRONG | content/c02-gpt/de.tex:538; en.tex:529 | Replace the claim that both zero/one planes of every nonextreme effect lie farther outside the ball. For a nonconstant nonextreme effect, at most one such plane touches the ball; one may still touch. Describe constant effects separately because their level sets need not be planes. | The feasible nonextreme effect f(r) = (1+r_z)/4 has its zero plane at r_z = -1 and its one plane at r_z = 3. It is a mixture of the zero effect and the sharp z effect. These heights were independently computed by /tmp/smoke-c-tier-a/additional.py and recorded in additional.json. |
| SCOPE | content/c02-gpt/de.tex:133; en.tex:131 | Replace the asserted fraction of experimental runs by a mixing label chosen with probability λ. If retaining an exact finite-run allocation, state the whole-number condition and do not use that illustration alone to justify all real mixing weights. | Plávala basic_v3.tex:15 explicitly requires λN and (1-λ)N to be whole numbers for that construction. The chapter's probability argument works directly with the random mixing label; an observed finite frequency need not equal its probability, as also noted in evidence/derivations/c02/REVIEW.md:84. |
| SCOPE | content/c02-gpt/de.tex:241 and :851; en.tex:237 | Require a nonzero coefficient vector when describing level sets. Say that nonconstant affine functions have parallel affine hyperplanes in the ambient coordinate space, intersected with the relevant state/effect set. A constant function has its whole domain as one level set. | The chapter explicitly admits constant effects at de.tex:269. Equation de.tex:184 permits a = 0. In the qubit effect coordinates (b,a), the ambient space is R^4, so a nonconstant score has hyperplane level sets rather than ordinary lines or planes. |
| SCOPE | content/c02-gpt/de.tex:448 and :1250; en.tex:442 and :1233 | Replace “smallest system/example of quantum theory” by “smallest nontrivial system/example”. | QT_v3.tex:6 does not exclude a one-dimensional Hilbert space. Specialising its density-operator definition at QT_v3.tex:11 to that dimension yields the single scalar state ρ = 1. The qubit is therefore not the smallest system without the qualification. |
| MISMATCH | content/c02-gpt/de.tex:670; en.tex:660 | Say that the discrimination task uses only measurements with two outcomes. Retain the three-outcome example as an illustration, and avoid claiming that the chapter uses only binary measurements. | de.tex:654 explicitly presents a three-outcome measurement. Its effect sum and probabilities are correct; the independent check gives (3/8, 1/2, 1/8). |
| MISMATCH | content/c02-gpt/de.tex:1202; en.tex:1183; web/src/demos/c02/reward.ts:18 | Align the manual with the implementation: three stars at P = P_opt exactly; otherwise two stars when P_opt - P ≤ 1/20; otherwise one star when P_opt - P ≤ 3/20. Present the numerical gaps as unvalidated design choices. Remove the strictly positive three-star tolerance and add the omitted two-star tier. | reward.ts:34 implements exactly these rules. The manual instead uses ε₁ > ε₃ > 0 and allows three stars below the optimum. /tmp/smoke-c-tier-a/probe.ts computed two stars for P = 999/1000 and P_opt = 1. The actual game rules at web/src/demos/c02.demo.distinguish.ts:176 agree with the implementation. |
| UNSUPPORTED | content/c02-gpt/de.tex:745; en.tex:733 | Replace “Für diesen Block heißt das genau / For this block that means exactly” by a separate mathematical statement about individual effects and measurement lists. Do not present it as TJO's intended interpretation of his measurements/instruments/POVMs sentence. | BRIEF.md:46 supplies the quoted stipulation, not this interpretation. evidence/gaps.json:121, G-0010, explicitly leaves its intended reading open. The mathematics of individual effects and measurement lists is correct, but does not identify instruments with single effects. |
| UNSUPPORTED | content/c02-gpt/de.tex:1248; en.tex:1231 | Remove the asserted “Modellwahl / choice of model” elaboration from the published framing. Keep its proposed interpretation in the open gap, and retain the brief's sentence about specialisation as a stipulation. | BRIEF.md:47 says “specialise”. The chapter's own comment at de.tex:1252 and G-0012 at evidence/gaps.json:146 identify “model selection” as the coordinator's reading. A hidden comment does not qualify the assertion presented to the reader. |
| UNSUPPORTED | content/c02-gpt/de.tex:472 and :521; evidence/claims.json:763 | Supply a local source locus for the name “Bloch-Kugel / Bloch ball”, or use “qubit state ball” pending that source. The mathematical construction can remain. | G-0013 at evidence/gaps.json:158 and the bloch claim's notes explicitly record the missing source for the name. The registered derivation supports the ball construction, not the historical/name attribution. No occurrence was found in the inspected lecture and Plávala source files by the rg search recorded during this review. |
| MISMATCH | evidence/claims.json:647, :929, :945, :1059; content/c02-gpt/de.tex:348, :945, :1044, :750 | Repair the derivation pointers for bit-zentriert, the centred-bit/uniform part of optimum, the square part of rein, and the centred part of kegel-bit. Point to the actual chapter derivations or add those derivations to the cited evidence document. Keep the derived evidence type. | The ledger itself acknowledges that these forms or arguments are absent from the cited DERIVATION.md sections. They are correct and derived in the chapter; independent checks here confirm them. The mismatch is between the cited derivation and the complete claim, not a false formula. |
| MINOR | evidence/claims.json:552, c02.cl.mehrfach; content/c02-gpt/de.tex:201 | Cite the induction printed at de.tex:204 as the derivation of the general finite-mixture identity. The cited DERIVATION.md:159 statement concerns mixtures of polytope vertices and does not itself write the general induction. | The chapter handles both λ_k < 1 and λ_k = 1 correctly. This is a citation-completeness repair. |
| MINOR | content/c02-gpt/de.tex:577 and :422; en.tex:568 | Explicitly omit zero-weight terms, or choose an arbitrary unit vector/sign when the corresponding coefficient vanishes. In the qubit proof, handle q = 0 as (b,0) = b·1_K + (1-b)·0. | de.tex:577 defines n only for q > 0 but uses it in the next displayed decomposition. DERIVATION.md:263 already supplies the missing zero case; its square decomposition at :197 explicitly omits zero-weight terms. The extremality conclusions are correct. |
| MINOR | web/src/demos/c02.demo.distinguish.ts:178; web/src/demos/c02.demo.explorer.ts:126; web/src/demos/c02/model.ts:5 | Replace blanket claims that every displayed number is exact, or an exact fraction, by: exact fractions and symbolic roots are displayed together with explicitly marked decimal approximations. | format.ts:32 rounds nonterminating decimal companions; the probe output for Q1 is “1/2 + √2/4 ≈ 0.8536”. The exact symbolic value is retained, and the approximation is correctly marked. Irrational effect coefficients are not fractions. |
| MINOR | web/tests/kernels/gpt.test.ts:48 and :74; web/tests/kernels/gpt-bruteforce.test.ts:43 | Treat generated-vertex membership/extremality checks as internal consistency checks, and document that the brute-force comparison reuses the kernel's floating membership predicate. Retain independent golden and boundary checks alongside them. | Effect enumeration already filters candidates by the same vertex inequalities, and isExtremeEffect tests membership in that generated list. These checks alone cannot certify the enumeration's completeness or the membership rule. Other tests genuinely compare kernel results with independently stored values and can fail. |

**Chapter mathematics and Kern honesty**

The centred bit is correct. Substituting p₀ = (1+r)/2 and p₁ = (1-r)/2 into q₀p₀ + q₁p₁ gives b = (q₀+q₁)/2 and a = (q₀-q₁)/2. Its endpoint values are b+a and b-a, so the effect condition is exactly |a| ≤ min(b,1-b), including the boundaries. The corresponding homogeneous state coordinates t = P₀+P₁ and R = P₀-P₁ give t ≥ |R|, while the positive-function cone gives b ≥ |a|. The pairing becomes bt+aR.

The uniform optimum formula is correct for all the stated priors, including zero priors. Its definitions are δ = λ₁-λ₂ and v = λ₁r₁-λ₂r₂. L is |v| for the centred bit, max(|v_x|,|v_y|) for the square, and the Euclidean norm of v for the qubit. At fixed b, maximising v·a gives L min(b,1-b). The remaining function is affine on each side of b = 1/2, so its maximum is among λ₂, (1+L)/2, and λ₁. This proves P_opt = (1+max(|δ|,L))/2. At v = 0 the vector contribution is zero; no division by its norm is needed. The chapter's probability-coordinate bit formula agrees because d₀+d₁ = δ, d₀-d₁ = v, and |d₀|+|d₁| = max(|δ|,|v|).

The following statements, displayed calculations, and worked examples were checked and found correct, subject to the findings above:

- The affine-coordinate lemma and its rearrangement of signed affine coefficients into two convex combinations; the finite-mixture induction; complement and convexity of the effect set.
- The bit state/effect descriptions, square state/effect descriptions, their extreme-effect proofs, and the square midpoint counterexample to unique pure-state decomposition. Every pair of distinct square corners differs in a coordinate, whose appropriately signed axis effect gives values one and zero. The independent script checked all ordered distinct corner pairs.
- The qubit's unique Hermitian trace-one parametrisation, density-matrix eigenvalues, affine mixing, sphere purity, effect-matrix eigenvalues, trace pairing, and complete list of extreme effects. Symbolic determinants and matrix multiplication were recomputed with SymPy. The pure-state and effect extremality arguments are valid; the zero-vector proof notation needs the minor repair in the table.
- The r ↦ r² counterexample: its endpoint values agree and its midpoint value differs, so it is not affine. The affine-interpolation caption, bit/square effect evaluations, Bloch-state mixtures, sharp-effect probability, and three-outcome measurement arithmetic agree with /tmp/smoke-c-tier-a/check.py.
- The score, constant-guess bounds, positive-prior criterion for perfect discrimination, coordinate score, compactness of E(K), and existence of an extreme maximiser. The chapter distinguishes existence from uniqueness and explicitly permits an optimal face.
- The qubit trace-norm formula, antipodal-pure-state criterion, non-antipodal pure-state example, and biased-prior constant-guess example.
- The polygon and disc effect formulas, extreme-effect counts, pentagon/hexagon examples, common diamond/pentagon/disc pair, and the qualification that the axis-aligned square cannot produce the same comparison with the unit disc.
- The polygon cone-duality statements with the declared circumradius and ordinary scalar product, the odd/even distinction, the disc's cone self-duality, and the weaker rotation/scaling isomorphism.

For zerlegung, Plávala basic_v3.tex:24 assumes K = conv(B), and :31 supplies that assumption with B = ext(K), within the finite-dimensional compact-convex framework at :4. Thus the cited lines support exactly the chapter's bound using the ambient dimension. Independently, compactness gives endpoints for a line through an interior point. A boundary point lies in a proper supporting face: take exterior points approaching it, minimise their distances to K, and pass to a convergent subsequence of the normalised displacement vectors; the closest-point inequality gives the supporting hyperplane. Induction on affine dimension expresses those endpoints using extreme points. If a resulting finite combination has more than d+1 terms, an affine dependence among its points permits subtracting a multiple of the dependence from the weights until one weight vanishes, preserving nonnegativity, the sum, and the represented point. Repetition gives the bound. This also explains why redundant ambient coordinates do not invalidate it.

For oeraum, pointwise order satisfies the ordered-vector-space axioms, bounded affine functions are dominated by a nonnegative multiple of the constant-one function, and the effect definition gives the order interval. The assembly is valid. The source's possibly negative upper-bound coefficient at basic_v3.tex:148 is repaired by the absolute-value bound in DERIVATION.md:109 and the chapter's base-cone proof.

For rueckweg, basic_v3.tex:320 states the same finite-dimensional, convex, closed, pointed, generating cone hypotheses, and :326–328 explicitly asserts E(S(E)) = E. Its “one can show that” wording supports source-backed/proof-omitted presentation; it does not constitute a printed proof. Independent verification proceeds through the canonical evaluation map v ↦ [ψ ↦ ψ(v)]. Order-unit bounds on both signs of a vector show that a nonzero positive functional has strictly positive value on u, and bound its normalised coordinate values. Consequently the normalised dual slice is closed, bounded, and convex. The dual cone spans V*, and normalisation expresses each nonzero positive functional as a positive multiple of a slice point. Hence an affine function on that slice has a unique linear extension to V*, represented by an element v of V. The closed-cone bidual identity then makes positivity of that function equivalent to v ∈ C, and its upper bound equivalent to u-v ∈ C. Thus its effect interval is canonically [0,u]. The equality is an identification under this evaluation map, not an equality of untyped vectors and functions.

Reading only Kern, the problematic mathematical/prose loci are de.tex:133, :241, :448, :538, :670, :851, and :1250, plus the framing elaboration at :1248 and reward mismatch at :1202. Finite dimension is stated in Kern at :25 and in transcluded D3 at :78. The no-restriction hypothesis is explicitly adopted for the chapter at :665. Positivity of both priors is stated where it is needed at :831, with the zero-prior exception at :842. I found no further missing hypothesis of those kinds.

The Kern definitions transcluded at :78, :93, :173, :258, :282, :288, :636, :638, and :660 are all registered at Kern depth. Extraction of Kern references found no ordinary definition/equation/theorem reference into a depth-only definition or label. The zoom links advertise optional proofs; the needed statements themselves are available in Kern.

**Evidence ledger**

/tmp/smoke-c-tier-a/check.py counted 55 c02 claims and checked all 38 distinct provenance rows they cite. Every quotation is a verbatim substring of its stated physical-line window, and every cited member hash matches. Literal quotation agreement was kept separate from mathematical support. In particular, the measurement quote from channels_v3.tex:253 preserves the source's mistyped 1_{S_n}; its context at :258 states the correctly typed 1_K, and the chapter's claim is derived independently.

The following table covers every c02 claim. Names in its first column have the prefix c02.cl.

| Claim suffixes | Evidence audit |
|---|---|
| rahmen-liefert; rahmen-probabilistisch; rahmen-sprache; rahmen-dual; rahmen-spezialisierung; rahmen-archimedisch | author-stipulated fits BRIEF.md:44–47. English reproduces the sentences or identified clauses; clause-initial capitalisation, quotation typography, terminal punctuation, and removal of Markdown emphasis are documented editorial changes. German preserves their meaning, including the first-person qualifications. The subsequent interpretations are separate findings. |
| zerlegung | source-backed fits basic_v3.tex:24 and :31 together; their hypotheses are retained through D3. |
| affin | source-quoted fits basic_v3.tex:63, with the operational assumptions at :15 and :55 and the all-weight quantifier at :65. The finite-frequency illustration needs the table's repair. |
| koordinaten; effekt-mischung; kompakt | derived fits DERIVATION.md §1.19 and the printed chapter proofs. |
| mehrfach | derived is correct, but its actual general induction is in the chapter; repair the pointer as listed. |
| komplement | source-backed fits basic_v3.tex:133 and its proof at :136. |
| bit-zustaende; bit-effekte | CT_v3.tex:6, :17, :61 and DERIVATION.md §3.2 support the source-backed/derived types respectively. |
| bit-zentriert | Correct derived result on the page; centred-coordinate derivation is absent from its cited section. |
| quadrat-zustaende; quadrat-mitte; quadrat-effekte | The source-backed state/midpoint claims fit boxworld_v3.tex:15, :20, :26–52 and CT_v3.tex:17 after the explicit affine coordinate change. The derived effect claim fits DERIVATION.md §3.3. |
| qubit-zustaende; pauli | Source-backed support is QT_v3.tex:6, :11 and the matrices/naming in latex/lectures/de/vl17.tex:28–36. Dimension is specialised explicitly. |
| bloch; qubit-effekte | derived fits DERIVATION.md §§3.4–3.5. The unsourced name and the caption are separate findings, not errors in those derivations. |
| messung | derived fits DERIVATION.md §1.11; the general channel/list equivalence also appears in channels_v3.tex:258. |
| erfolg | source-backed fits basic_v3.tex:508 with the stated renaming of states and priors. |
| schranken; perfekt; erfolg-koordinaten; extremal; spurnorm | derived fits DERIVATION.md §§4.1, 4.4, 4.2, and 4.5 as applicable. |
| optimum | The source document derives the classical probability-coordinate, square, and ball formulas. The new centred-bit form and uniform proof are correct chapter derivations; repair their evidence pointer. |
| rein | The ball criterion and Q1 example fit DERIVATION.md §6.2. The general square-corner assertion is proved correctly in the chapter but is absent from the cited section. |
| hoehe; basis; dualkegel | source-quoted/derived/source-quoted fit basic_v3.tex:179–183, DERIVATION.md §1.10, and basic_v3.tex:386 respectively. The chapter correctly excludes the zero functional from uniqueness/normalisation. |
| kegel-bit; kegel-quadrat; kegel-qubit | The square and qubit formulas fit DERIVATION.md §§3.3 and 3.5. The centred bit is correct but needs the pointer repair. |
| vieleck; vieleck-effekte; gleiches-paar; selbstdual | derived fits DERIVATION.md §§3.7, 3.9, 4.6–4.7, and 3.8–3.9 as applicable. Their coordinate/radius qualifications are retained. |
| oeraum | source-backed fits the assembly of basic_v3.tex:101, :141, :145, :118 with its definition at :299. It is not falsely labelled a verbatim single theorem. |
| rueckweg | source-backed fits basic_v3.tex:320–330; proof-omitted accurately describes the source's explicit assertion and bidual proof hint. |
| level-b1; level-b2; level-s1; level-s2; level-q1; level-q2; level-p1; level-h1; level-c1; level-c2; level-c3 | numerically-checked fits check_gpt.py's level_specs_primary/extra and check_levels. The named command first recomputes and verifies generated data, then prints the stored result; it does not merely print a hard-coded expected constant. The displayed exact expressions and rounded chapter decimals agree with independent calculations. |

G-0009 accurately distinguishes the German translation from TJO's own wording. G-0010 remains open and is relevant to the interpretation finding. G-0011 is respected: the chapter adopts no restriction without claiming that TJO made it part of his postulate. G-0012 and G-0013 expose the framing/name findings above. G-0014 is stale relative to the implemented reward policy: update it together with the manual, retaining its unvalidated-design status.

**Game and independent level comparison**

The kernel implements P(f) = λ₁f(x₁) + λ₂(1-f(x₂)) exactly at gpt.ts:379. Polytope effect membership tests all state-vertex inequalities at :311. Qubit membership first checks b ∈ [0,1], then compares the rational squared vector norm with min(b,1-b)². This is correct, with inclusive boundaries and no tolerance on the exact path.

All levels in gpt.levels.json were recomputed independently. For the bit and square, the independent script enumerated feasible full-rank intersections of state-value bounds. For the qubit, it formed the actual weighted matrix difference and summed its positive eigenvalues. Optimal effect sets were compared exactly with the JSON, kernel output, Julia reference output, and manual.

| Level | Independently recomputed P_opt | Complete set of optimal extreme effects |
|---|---|---|
| B1 | 1 | (q₀,q₁) = (1,0) |
| B2 | 3/4 | (q₀,q₁) = (1,0) |
| S1 | 1 | (b,a_x,a_y) = (1/2,1/2,0) |
| S2 | 1 | (1/2,1/2,0) and (1/2,0,1/2) |
| Q1 | 1/2 + √2/4 | (b,a_x,a_y,a_z) = (1/2,√2/4,-√2/4,0) |
| Q2 | 9/10 | (1,0,0,0), the unit effect |

There is no mismatch in levels, states, priors, optima, or optimal extreme effects between the game's JSON and de.tex:1220–1225. The extra derivation levels and depth-block examples are not entries in the first-release game file; that distinction is explicit and is not a level mismatch.

Every listed optimum is representable exactly by the control model. The scratch model probe also checked every admissible lattice tuple for each implemented effect model against exact membership. Boundary probes accepted boundary effects and rejected deliberately perturbed effects outside the exact set.

Reward thresholds are labelled as unvalidated design choices in reward.ts and the actual rules panel in both languages. The manual likewise labels its thresholds as design choices, but specifies different rules. It omits the implementation's two-star tier. Exact symbolic probabilities and optima are shown; rounded decimal companions carry an approximation sign. The blanket “every number” wording needs the minor clarification in the findings.

The tests import the kernel; they are not stand-alone reimplementations passed off as production tests. The golden comparisons, independent score grid, exact boundary cases, explicit tie cases, and reward cases test real behaviour. Some generated-list assertions are only consistency checks, as identified above. A scratch mutant changed the production score's complementary second outcome to the uncomplemented outcome; the kernel suite then failed, confirming that the relevant tests detect that defect.

**Reproducible verification**

- python3 /tmp/smoke-c-tier-a/check.py passed after correction of a scratch JSON-serialisation error. Its output is check.out and its structured results are results.json. It verified provenance, symbolic matrix identities, the primary level optima/effect sets, 125 centred-bit cases, and 200 independently generated weighted-qubit matrix cases. The largest numerical spectral/formula disagreement was 3.3306690738754696e-16, as computed in that output.
- python3 /tmp/smoke-c-tier-a/additional.py passed. additional.json records 32805 square formula comparisons, independently constructed polygon dual slices, and the nonextreme-plane counterexample. check.py independently enumerated polygon effects for n = 3 through 8 and checked the depth-block polygon examples. The general polygon statements were also checked against the supporting-edge and cone-ray derivations in DERIVATION.md §§3.7–3.8.
- node --import tsx /tmp/smoke-c-tier-a/probe.ts passed. probe.out records exact kernel level results, representability of every stored optimal effect, boundary membership probes, formatting, and admissible model tuple counts of 441 for the bit, 1561 for the square, and 11616 for the qubit. These are counts of control tuples, not distinct mathematical effects.
- node --import tsx /tmp/smoke-c-tier-a/edge.ts printed PASS for 6 explicit qubit cases covering both boundary ties, identical states, and zero priors.
- python3 evidence/derivations/c02/check_gpt.py --verify exited successfully and printed: PASS: 11 theories, 13 levels; symbolic/rational identities and independent LPs. Its implementation was inspected: it recomputes the levels and compares regenerated data, but does not parse every mathematical assertion in the chapter or derivation prose.
- julia --startup-file=no --project=numerics/gpt numerics/gpt/generate.jl --check, with the writable depot directed to scratch, exited successfully and reported reproduction of web/tests/golden/gpt.json and web/src/kernels/gpt.levels.json.
- Vitest ran the requested gpt*.test.ts files against unchanged scratch copies of the kernel and supporting files, with all writable caches under /tmp. The command was ./node_modules/.bin/vitest run --config /tmp/smoke-c-tier-a/web/vitest.config.ts --root /tmp/smoke-c-tier-a/web. vitest.out records 4 passing test files and 118 passing tests.
- With GPT_KERNEL pointing at the scratch score mutant, the same configuration running tests/kernels/gpt.test.ts exited unsuccessfully; mutation.out records 69 failed and 28 passed tests. No production file was mutated.

**German/English parity**

The random sample was drawn reproducibly from chapter labels using the German file's SHA-256 as the random seed in check.py. Each selected unit was compared in its surrounding prose, not just by matching labels.

| Unit | German line | English line | Result |
|---|---:|---:|---|
| c02.s7, manual opening and reward prose | 1187 | 1169 | Same meaning; both share the implementation mismatch. |
| c02.prop.perfekt | 830 | 816 | Same strict-positive-prior hypotheses and equivalence. |
| c02.prop.rueckweg | 1311 | 1290 | Same cone hypotheses and conclusion. |
| c02.eq.bit | 292 | 288 | Same state set and endpoint coordinates. |
| c02.s3, affinity argument opening | 127 | 125 | Same argument; both need the finite-frequency qualification. |
| c02.eq.kegel-quadrat | 762 | 750 | Same cones and inequalities. |
| c02.eq.rahmen-probabilistisch | 41 | 41 | Same stipulated statement and first-person qualification. |
| c02.prop.vieleck | 1092 | 1075 | Same odd/even effect families and counts. |
| c02.thm.zerlegung | 110 | 109 | Same ambient-dimension bound and weights. |
| c02.s5, measurement definition and probabilities | 631 | 622 | Same definitions, normalisation, and binary special case. |

No mathematical or substantive translation discrepancy was found in these ten units. The additional spot checks of the centred-bit and optimum formulas, qubit effects, examples, and author-stipulated passages likewise preserved meaning.

**COULD NOT CHECK**

- Rendered PDF/HTML layout, figure drawings against their captions, actual browser dragging and keyboard interaction, persistence, and the complete rendered player flow. The pure models, formatter, and reward functions were checked; the browser integration was not run.
- An exhaustive semantic comparison of the entire English chapter. The random units and additional targeted checks above delimit the parity audit.
- The external works cited by Plávala, including Rockafellar. The local statements and their hypotheses were checked, and independent reasoning was supplied above; the external books were not inspected.
- TJO's intended resolution of the framing gaps, his German wording, and his universal Archimedean/infinite-dimensional stipulation. These remain stipulations or open gaps, not conclusions licensed by the finite-dimensional examples.
- Exhaustive numerical enumeration for polygon sizes outside the range checked by the scripts. Their general formulas were reviewed analytically, not inferred from the finite numerical sample.