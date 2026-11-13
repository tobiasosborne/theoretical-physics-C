# Review of the Theo C planning campaign — 2026-10-11

The campaign provides a useful basis for Phase 0 experiments, but **PLAN.md is not yet a reliable implementation specification**. Its most serious problems are an evidence-admission loophole, incompatible depth and package requirements, an unexplained transition out of finite-dimensional quantum theory, and a schedule that omits substantial validation and human-review work.

D1–D10 and the two additional decisions in PLAN §1.3 are treated as fixed. The findings below concern their implementation and consequences.

Research-file citations below are relative to `docs/plan/research/`. `PLAN` means [docs/plan/PLAN.md](/home/tobias/Projects/theoretical-physics-C/docs/plan/PLAN.md). The reviewed PLAN snapshot has SHA-256 prefix `22ddba5c7cef94c4`. No files were modified.

## A. Contradictions between lanes and within PLAN.md

1. **Evidence status versus omission of a proof: a release-blocking contradiction.**  
   The rigour lane explicitly separates evidence type from presentation: a sourced theorem may omit its proof; an unsupported claim cannot become admissible that way (`rigour-process/REPORT.md:247–267`). PLAN instead lists “stated without proof” as an evidence status (`PLAN:274–276`) and allows a statement requiring a missing source to be written that way with the missing source named (`PLAN:121–124`). The rigour lane is better supported and internally coherent. Preserve the decision to proceed without those books, but admit claims through available local sources or reviewed derivations. A missing citation plus an omitted proof must remain an unresolved private draft.

2. **Finite-dimensional Kern versus the actual Kern curriculum.**  
   Curriculum recommends finite-dimensional GPTs initially, followed by explicit \(L^2\) examples (`curriculum/REPORT.md:50–68,80–89`). Its accessibility table nevertheless calls “systems in a box” finite-dimensional (`:487`). PLAN simultaneously specifies Kern quantum theory in \(\mathbb C^d\) and includes the box, oscillator, hydrogen and Fock space (`PLAN:86,159–163`). Those exact models are infinite-dimensional. The explicit continuum examples are mathematically better supported. D4 remains fixed, but the plan must identify where the introductory finite-dimensional restriction ends, which continuum definitions enter Kern, and where numerical truncations are used.

3. **Three depth levels versus two curriculum buckets and inconsistent placement.**  
   Curriculum supplies Lehramt goals and “Z” material; it does not allocate that material between Vertiefung and Fundament (`curriculum/REPORT.md:27–29`). Layered-docs puts much GPT/order-unit material in Fundament (`layered-docs/REPORT.md:450–456`), whereas curriculum makes the GPT state/effect picture a core chapter (`curriculum/REPORT.md:47–59`). PLAN adopts three levels but inherits both allocations (`PLAN:159–169`). Curriculum is better supported for the author’s operationalist opening; layered-docs is better supported for navigation. Keep the introductory GPT picture in Kern and explicitly assign every rigorous block to V or F.

4. **“Never small type or tint for depth” versus three package specifications.**  
   Layered-docs prescribes body-size Vertiefung with a margin rule (`layered-docs/REPORT.md:326–332`); PLAN makes this categorical (`PLAN:46`). PKG-3 uses smaller margin blocks on grey plates (`design-packages-A/PKG-3-lab-notebook.md:46,61–68`), while PKG-4 and PKG-5 reduce Vertiefung to 9.5 pt (`design-packages-B/PKG-4-tokens-first-dark-video.md:49–51,143–146`; `PKG-5-explorable-textbook.md:47–49,125–129`). PKG-3 acknowledges its deviation; B claims to follow layered-docs. The rule-based proposal has stronger pedagogical justification, but no student comparison establishes a winner. Since all five packages must exist, specify which features are invariant and which are package variants; they cannot all satisfy S3 as written.

5. **Native MathML immediately versus a tested migration.**  
   Design recommends replacing MathJax 3 with build-time MathML (`design-research/REPORT.md:125,228`; `design-packages-B/REPORT.md:101–103`). Tech-stack recommends starting with pinned local MathJax and comparing converters against the expression corpus (`tech-stack/REPORT.md:154–169`). PLAN describes native MathML as settled (`PLAN:49,331–332`). The tech lane has stronger implementation evidence: the design specimens use hand-written MathML, and already expose variant and spacing problems. Keep the planned MathML destination, but make corpus conversion and fallback behavior Phase 0 acceptance gates.

6. **MathJax serialization is being mistaken for a complete native-MathML renderer.**  
   PLAN’s “Temml or MathJax 4 server-side” wording hides different responsibilities (`PLAN:49`). MathJax 4 can serialize its internal MathML, but its documentation identifies unsupported native-browser features, including equation labels, alignment attributes and font variants. A serializer therefore needs a MathML-Core adaptation and equation-layout contract. This reinforces the tech lane’s caution. [MathJax’s own explanation](https://docs.mathjax.org/en/v4.0/output/mathml.html).

7. **Font identity versus five package flags and open fallbacks.**  
   D1 selects MTPro2 print/STIX online; D3 requires all package type systems; D10 requires open web/CI fallbacks (`PLAN:83,85,92`). Original PKG-2 depends on Companion Math, and PKG-5 uses Libertinus (`design-packages-A/PKG-2-baskerville-companion.md:24–32`; `design-packages-B/PKG-5-explorable-textbook.md:29–39`). PLAN supplies no precedence rule. Moreover, “exact everywhere” in its package table is no longer true for commercial packages using fallbacks (`PLAN:188–219`). Specify the resolved font stack for every package, medium and licence mode. Treat D1’s pair as the default unless an explicitly documented package override applies.

8. **Shared video kernels versus “nothing re-verified.”**  
   Demos says browser video reuse requires nothing further to be verified (`demos-games-video/REPORT.md:549–551`). Rigour requires representation checks across frame sequences and transitions (`rigour-process/REPORT.md:389,448–450`); tech explicitly bounds rendering errors (`tech-stack/REPORT.md:292–302`). The latter positions are better supported. Shared kernels reduce duplicated scientific computation; they do not verify camera meaning, clipping, opacity, frame timing, annotations or captions.

9. **Light ground and “still equals figure” versus actual exports.**  
   PKG-5 claims identity by construction, but proposes background removal, vector re-emission and separate 600-dpi volumetric rendering (`design-packages-B/PKG-5-explorable-textbook.md:218–231`). PKG-4 still specifies dark stages despite light being the new default (`PKG-4-tokens-first-dark-video.md:139–141,199–201`; `PLAN:84,193`). Shared scene state is supported; effortless identical output is not. Define separate print and video rendering contracts, even when both use light ground.

10. **Games scored by physical quantities versus the actual catalogue.**  
    PLAN requires physical scores and exactly solvable levels (`PLAN:56,147–148`). The demos lane also allows stars, strokes, guess counts and streaks (`demos-games-video/REPORT.md:413–427`; `demos-games-video/IDEAS.md:684,760`). These can be legitimate game mechanics, but the reports do not support the universal description. Distinguish the scientific success criterion, game reward and proven optimum. Stochastic wins also cannot literally require the correct strategy on every run.

11. **The physics ladder conflates specialization, extension and approximation.**  
    Curriculum says quantum postulates are a specialization “not new principles,” and that independent preparability forces the tensor product (`curriculum/REPORT.md:71–72,155–160`). Rigour correctly requires separate claims for approximation and information loss (`rigour-process/REPORT.md:319–332`). PLAN repeats “each level an effective theory of the one below” as factual description (`PLAN:15–17`). GPT-to-QM is model selection; tensor products and Fock space are extensions; thermodynamic limits and coarse-graining require additional assumptions. Retain the author’s organizing ladder, but label each arrow’s actual mathematical operation.

12. **PLAN contains stale or overstated synthesis.**  
    It still says the named books are absent (`PLAN:381–382`), although §1.3 records their arrival. It says both package lanes independently preferred PKG-5b (`PLAN:213–214`), although A preferred PKG-1/1S (`design-packages-A/REPORT.md:92–108`). It also references a completed hostile review that does not exist (`PLAN:3,36`). These are editorial errors, not author decisions.

## B. Physics and mathematics claims independently checked

`AST` below denotes:

`/tmp/claude-1000/-home-tobias-Projects-theoretical-physics-C/41bc9063-4c51-4d50-ad39-483bbfd2f07a/scratchpad/gh/advancedquantum/Source Files/advancedquantum.tex`

Its SHA-256 is `0e88fd13da42e60c6def5b9cac28999090602879cb207c830c58903f616a74ce`, matching the curriculum ledger. Checks used the source bytes, elementary derivations, Python/SymPy, numerical quadrature and small occupation-basis matrices.

| Claim | Verdict and evidence |
|---|---|
| **vl16 Laguerre leading sign** | **CONFIRMED.** `latex/lectures/de/vl16.tex:85` prints \(-x^2/2\). The finite-sum definition gives \(L_2^{(s)}(x)=x^2/2-(s+2)x+(s+1)(s+2)/2\). At \(s=1,x=0.7\), correct and printed values are 1.145 and 0.655. The printed polynomial also fails the Laguerre differential equation. [DLMF 18.5.12](https://dlmf.nist.gov/18.5#E12). |
| **vl16 \(2p,m=\pm1\) normalization** | **CONFIRMED.** At `vl16.tex:94`, set \(Z/a_0=1\). The norm is \((128\pi)^{-1}\times\int_0^\infty r^4e^{-r}dr\times\int\sin^2\theta\,d\Omega=(128\pi)^{-1}\times24\times8\pi/3=1/2\). The normalized coefficient magnitude is \(1/(8\sqrt\pi)\). |
| **Missing \(2p\) phase signs** | **CONFIRMED as a convention inconsistency.** `latex/lectures/de/vl14.tex:149` fixes \(Y_1^1=-\sqrt{3/(8\pi)}\sin\theta e^{i\phi}\). With the same radial convention, the coefficients in `vl16.tex:94` should be \(\mp1/(8\sqrt\pi)\). A single orbital’s global phase does not affect its density; inconsistent phases do affect specified superpositions. |
| **vl22 canonical Lagrangian** | **CONFIRMED as an inconsistency of multiplier definitions.** `latex/lectures/de/vl22.tex:25` gives \(-k_B\operatorname{tr}\rho\ln\rho+\beta\operatorname{tr}\rho H\). Including normalization, stationarity gives \(\rho\propto e^{+\beta H/k_B}\), whereas `:41–46` gives \(e^{-\beta H}\). Use \(S-k_B\beta(\operatorname{tr}\rho H-E)-k_B\gamma(\operatorname{tr}\rho-1)\), or distinguish the arbitrary multiplier from inverse temperature. A plus sign alone is not wrong before its multiplier is defined. |
| **vl04 Hermitian/self-adjoint synonym** | **REFUTED as an unconditional defect in that sentence.** `latex/lectures/de/vl04.tex:62` explicitly defines “Hermitian” by \(A^\dagger=A\), which is the self-adjoint condition when domains are included. The real defect is omitted domain/scope information and later reliance on mere symmetry. For example, \(-i\,d/dx\) on \(H_0^1(0,1)\) is symmetric, while its adjoint has domain \(H^1(0,1)\); it is not self-adjoint. Rewrite the scope, rather than claiming the terminology alone proves an error. |
| **vl19 Boltzmann constant** | **CONFIRMED.** `latex/lectures/de/vl19.tex:21` uses \(1.38064852\times10^{-23}\). The current SI defining value is exactly \(1.380649\times10^{-23}\,\mathrm{J\,K^{-1}}\). [BIPM defining constants](https://www.bipm.org/en/measurement-units/si-defining-constants). |
| **H14.1 creation/annihilation bracket** | **CONFIRMED, with an additional report error.** AST `:637–640` combines the wrong bracket convention/order with an inner product whose argument dependence is incompatible with creation linearity and annihilation antilinearity. With \(s=+1\) for bosons, the uniform relation is \(a(f)a^\dagger(g)-s\,a^\dagger(g)a(f)=\langle f,g\rangle I\). AST `:630–632` also defines the reordered product with unswapped arguments. Curriculum `REPORT.md:351–352` quotes a corrected preceding identity rather than what AST actually prints. |
| **H14.2 field bracket** | **CONFIRMED.** AST `:844` needs \(\Psi^\dagger(y)\); two annihilation fields have zero CCR/CAR bracket. AST `:845` additionally drops \(\delta_{\mu\nu}\), which is required to collapse the double sum to the completeness kernel. |
| **H14.3 interaction ordering** | **CONFIRMED.** AST `:870` uses \(\Psi^\dagger(x)\Psi^\dagger(y)V(x,y)\Psi(x)\Psi(y)\). The conventional positive pair interaction uses annihilators in reverse order. In an independently constructed two-mode CAR representation, \(\langle11|c_1^\dagger c_2^\dagger c_2c_1|11\rangle=1\), while AST’s order gives \(-1\). The discrete formula at AST `:797` also loses the factor \(s\) present at `:792`. |
| **H14.4 smearing conjugation** | **CONFIRMED under AST’s stated convention.** From AST `:829` and `:838`, \(\int f(x)\Psi(x)\,dx=a(\bar f)\), because \(a(g)=\sum_\mu\langle g,\phi_\mu\rangle a_\mu\). The alternative convention \(\int\bar f\,\Psi=a(f)\) is equally valid if declared consistently. |
| **H14.5 normal-order vacuum expectation** | **REFUTED as a universal formula.** Curriculum `REPORT.md:357–358` says \(\langle\Omega|:A:|\Omega\rangle=0\). Counterexample: \(A=I\). The statement holds for normally ordered polynomials with no scalar term, relative to the specified vacuum. Dependence on the chosen vacuum is **CONFIRMED**. This is a general hazard; the cited AST file supplies no normal-ordering passage establishing it as an AST error. |
| **H14.6 finite bosonic truncation** | **CONFIRMED as a general hazard.** A finite matrix commutator has trace zero. With cutoff \(N\), the ladder matrices satisfy \([a,a^\dagger]=I-(N+1)|N\rangle\langle N|\). For \(N=3\), the diagonal is \((1,1,1,-3)\). This is not itself an identified AST mistake. |
| **H14.7 omitted occupation ket** | **CONFIRMED.** AST `:395` and `:522` list seven vectors for an eight-dimensional tensor product, omitting \(|110\rangle\). |
| **H14.7 algebra examples** | **CONFIRMED.** AST `:725` should name \(M_n(F)\), since \(GL_n(F)\) is not a vector space and excludes zero. AST `:726` should use pointwise multiplication of scalar-valued continuous functions, not composition. |
| **H14.7 permutation convention** | **CONFIRMED.** AST `:389` uses \(\sigma\) where Theo C uses \(\sigma^{-1}\). With ordinary function composition, AST’s formula is an anti-representation. It requires an opposite multiplication convention or correction, not an unexplained substitution. |
| **Plavala finite-dimensional by axiom** | **CONFIRMED for the inspected v2 source.** `curriculum/plavala-src/what_v4.tex:13–23` explicitly enumerates S1–S5; S5, at `:20`, requires a subset of a real finite-dimensional vector space. `basic_v3.tex:4` and `QT_v3.tex:6` reiterate the restriction. |
| **Plavala never uses “Archimedean”** | **CONFIRMED for this source tree.** Case-insensitive search of `curriculum/plavala-src/` returns zero occurrences. This does not establish anything about other publications or editions. |
| **All positive norm-one functionals on \(B(H)\) strictly contain density-operator states in infinite dimension** | **CONFIRMED by a direct construction.** Choose an orthonormal sequence \(e_n\) and a free ultrafilter \(\mathcal U\). Then \(\omega(A)=\lim_{\mathcal U}\langle e_n,Ae_n\rangle\) is linear, positive and unital, hence norm one. It vanishes on every rank-one projection. If \(\omega(A)=\operatorname{tr}(\rho A)\), positivity would force every diagonal entry of \(\rho\) to vanish and therefore \(\operatorname{tr}\rho=0\), contradicting normalization. |

The last result does **not** by itself make an all-states formulation inconsistent. \(B(H)\) still acts on its states by evaluation. Curriculum `REPORT.md:269–272` should say that \(B(H)\) is not the **full Banach bidual** of \(B(H)^*\), rather than declaring the physical state/effect pairing to fail without qualification.

Additional checks found material errors:

- **CONFIRMED:** AST `:810` incorrectly conjugates the coefficients of the creation operator. Its definition at `:607–610` requires \(a^\dagger(\psi)=\sum_\mu\psi_\mu a_\mu^\dagger\).
- **REFUTED:** `demos-games-video/IDEAS.md:671–672` combines \(H=-\Delta-Z/r\) with energies \(-Z^2/(2n^2)\). Substituting \(e^{-Zr/2}\) gives ground energy \(-Z^2/4\). Use \(-\tfrac12\Delta-Z/r\) for \(-Z^2/(2n^2)\).
- **REFUTED:** blanket “convexity of potentials” in `curriculum/REPORT.md:236–238`. For a stable system, \(F_{TT}=-C_V/T\le0\): Helmholtz free energy is concave in temperature. Convexity/concavity must be stated variable by variable.
- **CONFIRMED:** the reduced-mass kinetic transformation cancels mixed derivatives and yields coefficients \(1/(m_e+m_p)\) and \(1/\mu\). This checks the algebraic consequence of the fixed two-body decision.
- **REFUTED:** the PKG-5 four-digit convergence claim (`design-packages-B/REPORT.md:28–32`). Independent angular integration followed by radial quadrature gives half-maximum enclosed probability **0.1770911323**. Recomputing the stated midpoint grids gives approximately **0.1771655942** at \(1500\times400\) and **0.1771024484** at \(3000\times600\); they round differently at four decimal places. The caption “18%” remains valid.
- **REFUTED as a uniqueness claim:** a gate endpoint does not determine its physical animation path (`demos-games-video/REPORT.md:291–304`; `PLAN:313–315`). A fixed chosen Hamiltonian gives the proposed circular orbit, but a time-dependent Hamiltonian can generate other smooth pure-state paths. Specify the generator before calling an existing interpolation physically wrong.
- **COULD NOT CHECK:** the exact Reed–Simon/CFKS theorem applications and page-image evidence asserted in `PLAN:102–115`. The supplied-source manifest exists, but those book passages were not independently audited in this review. Numerical orbital checks cannot substitute for that audit.

## C. Overclaims and unverified load-bearing facts

The following uncertainties affect architecture, scope, cost or admissibility. Cosmetic uncertainties such as a precedent’s page count are excluded.

1. **MTPro2 licensing was not actually unavailable.**  
   `design-packages-A/PKG-1-times-mathtime.md:270–276` speculates about a second-seat purchase and embedding. The local [EULA](/usr/share/texmf/doc/fonts/mtpro2/EULA.txt:14) permits use on up to five licensee computers and embedding in documents; `:23–25` addresses modifications for the licensee’s own use. It prohibits other transfers of font files. This resolves part of the uncertainty, conditional on the applicable licence and licensee. It does not establish permission to redistribute browser font binaries.

2. **Installed is not evidence of owned/licensed.**  
   “Owned for print” in `design-packages-A/REPORT.md:81` and `PKG-1-times-mathtime.md:270` exceeds the inventory’s evidence. Whitney, Times and Storm licence terms applicable to the actual installations remain **COULD NOT CHECK**. D10 removes commercial web-font shipping from scope; it does not establish rights for distributed PDFs or derived font assets.

3. **Companion Math’s print/video rights are also unresolved.**  
   `design-packages-A/PKG-2-baskerville-companion.md:243–247` says permission blocks every medium “except print and video.” The report supplies no licence supporting those exceptions. Local-only use, document embedding, rendered artwork and redistribution of derivative outlines need separate recorded treatment.

4. **Type 1 does not make accessible PDF mathematics impossible.**  
   `design-packages-A/PKG-1-times-mathtime.md:39–43` extrapolates failed specimen extraction into universal impossibility. PDF supports ToUnicode mappings and replacement text; the present XeLaTeX pipeline may lack them, but that is an implementation limitation requiring investigation. Unicode extraction from STIX likewise does not certify reading order or accessible mathematical structure. [Adobe PDF reference, §§9.10 and 14.9.4](https://developer.adobe.com/document-services/docs/assets/35e4369068f86065372c18787171a17e/PDF_ISO_32000-1.pdf).

5. **STIX is not the only Times-family cross-media option.**  
   `design-research/REPORT.md:27,106`, `design-packages-B/REPORT.md:92` and `PLAN:199–200` overclaim uniqueness. MathJax 4 also supplies `mathjax-termes`. Rejecting Termes after specimen comparison is a supported aesthetic judgment; claiming technical exclusivity is not. D1 need not change. [MathJax font list](https://docs.mathjax.org/en/v4.0/output/fonts.html).

6. **Typst MathML status is confirmed upstream, not locally.**  
   The design lane’s 0.15 claim is correct: native MathML arrived in June 2026. HTML export remains experimental. The inspected machine has 0.14.2 (`sources-inventory/REPORT.md:147`; `tech-stack/REPORT.md:94`). A pilot using 0.15 needs an explicit pinned toolchain. [Typst release announcement](https://typst.app/blog/2026/typst-0.15/).

7. **Browser MathML support is not equivalent to course compatibility.**  
   `design-research/REPORT.md:26,121` turns broad support into a stronger cross-media promise. MathML Core deliberately supports only `mathvariant="normal"` on `<mi>`; the reported bold behavior is therefore expected, not an unexplained Chromium defect. No complete formula corpus or browser/assistive-technology matrix has passed. [MathML Core identifier specification](https://www.w3.org/TR/mathml-core/#the-mi-element).

8. **MathML fallback and offline MathJax assets are unspecified.**  
   `design-research/REPORT.md:125,228` names a fallback without detection, equation-numbering or semantic-parity rules. MathJax 4 fonts can load additional ranges asynchronously; “packaged locally” must include those ranges and extensions. `PLAN:331–332` omits this work. [MathJax font-loading documentation](https://docs.mathjax.org/en/v4.0/output/fonts.html).

9. **Headless WebGL/video feasibility has not been demonstrated.**  
   A browser installation and successful SVG/MathML screenshot do not establish GPU context creation, float readback, shader compatibility or acceptable 4K throughput (`sources-inventory/REPORT.md:155`; `design-packages-B/REPORT.md:33–39`; `demos-games-video/REPORT.md:459`). Tech correctly marks GPU operation unverified (`tech-stack/REPORT.md:24`). Require an actual orbital capture test with recorded renderer, flags and timings. [Chromium’s headless-GPU guidance](https://chromium.googlesource.com/chromium/src/+/HEAD/docs/gpu/using-gpu-hardware-in-headless-chrome.md).

10. **CoolProp WASM exists; the proposed integration remains unverified.**  
    Official documentation supplies `coolprop.js` and `coolprop.wasm`, confirming availability. It does not prove the plan’s pinned HEOS integration, single-file offline packaging, flash-domain handling or cycle accuracy (`demos-games-video/REPORT.md:369–388,458`). NIST comparisons may share the underlying formulation and therefore check implementation rather than independent physics. [CoolProp JavaScript wrapper](https://coolprop.org/coolprop/wrappers/Javascript/index.html).

11. **Optional renderers are routes, not validated fallbacks.**  
    Motion Canvas 3D integration, Remotion licensing/installation and Julia-to-VDB compatibility are explicitly unverified (`tech-stack/REPORT.md:223–227`). Mitsuba’s proposed large-grid route has no measured memory, generation or render budget (`demos-games-video/REPORT.md:261–264,508–523`). Do not count these as ready contingency paths.

12. **The token compilers do not yet implement the promised design system.**  
    Both mainly generate colours (`design-packages-A/tokens.py:2–12`; `design-packages-B/tokens/build_tokens.py:1–14`). Type scales and grids remain separately authored (`design-packages-A/specimens/make_html.py:33–40`). Mode encodings differ (`design-packages-B/REPORT.md:62–64`). DTCG-style custom extensions are not proof of interoperable theming. PLAN’s “tokens only” requirement (`PLAN:85`) needs schema, layout and component-policy work.

13. **Greyscale thresholds are engineering proposals, not perceptual guarantees.**  
    `design-research/palette-measurements.md:13–15` labels one distance rule unverified and uses OKLab lightness as a printer proxy. Conclusions that no six/seven-hue palette can survive grey, or only three/four roles can exist, exceed the tested palette set (`:84–88`; `design-research/REPORT.md:28,203`). Require printed examples, small-label tests and redundant encoding.

14. **Some accessibility rules are factually unsafe.**  
    Thickening a 2.2:1 energy arrow does not waive essential-graphics contrast requirements (`design-packages-A/PKG-1-times-mathtime.md:122–123`; A `REPORT.md:111–112`). PKG-5 calls 2.99:1 “at” the 3:1 threshold (`design-packages-B/PKG-5-explorable-textbook.md:100–101`), which is below it. Test essential boundaries or supply equivalent sufficiently contrasted encoding. [WCAG non-text contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

15. **The layered checker proves only a tiny structural example.**  
    `layered-docs/prototype/check_levels.py:13–32` checks selected log strings and first label fields. Empty logs/auxiliaries can pass; file-line-style errors are not matched; no compiler exit, freshness, expected-label census or bibliography completeness is checked. I reran the stored green fixture: three labels passed. That does not prove Kern self-containment (`layered-docs/REPORT.md:419–422`; `PLAN:45`).

16. **Semantic authoring remains an unbuilt compiler contract.**  
    Unsupported-command rejection, transclusion, translated equation text, counters and cross-target completeness are specifications, not demonstrated capabilities (`tech-stack/REPORT.md:100–118,507`; `rigour-process/REPORT.md:219–235`). This work is larger than extending a Pandoc filter with one environment.

17. **The infinite-dimensional framework still lacks admitted source correspondences.**  
    Order-unit axioms, the chosen dual/predual, no-restriction assumptions and normal-state identification remain incomplete (`curriculum/REPORT.md:54–58,68,76–78,253–272`). Bratteli–Robinson’s arrival enables checking; it does not retroactively verify the guessed sections or notation.

18. **Several advanced quantum claims have incomplete authorities or hypotheses.**  
    This includes Groenewold–van Hove, half-line momentum, uncertainty-domain counterexamples, Uhlhorn/effect symmetry versions, projective representations of \(\mathbb R\), Galilei mass superselection, local tomography and anyons (`curriculum/REPORT.md:86–99,117–130,159–169,279–308`). In particular, orthogonality-preserving qubit maps need not satisfy Wigner’s conclusion. Allocate these to verified statements, reviewed derivations or deferred blocks.

19. **Preparation/measurement uncertainty cannot inherit an absent-source exemption.**  
    BLW-dependent quantitative claims remain load-bearing (`curriculum/REPORT.md:91–99,287–294`; `demos-games-video/IDEAS.md:234–240`). The finite qubit joint-measurability example has a separate identified source (`IDEAS.md:994`) and an elementary matrix route. It must not be presented as verification of a position–momentum error-disturbance theorem.

20. **The statistical-mechanics bridge is under-sourced and under-qualified.**  
    Klein’s inequality, typicality, ensemble equivalence, KMS conditions, negative-temperature conventions and shell-width claims lack complete admitted support (`curriculum/REPORT.md:187,194–205,376–382`; `demos-games-video/REPORT.md:348–359`). Finite bath, coupling, shell and limiting assumptions change the conclusions.

21. **Parts V and the real-fluid flagship have no replacement evidence plan.**  
    Lieb–Yngvason, Callen, Carathéodory and finite-time engine authorities are missing or unverified (`curriculum/REPORT.md:216–238,389–401`). Curzon–Ahlborn efficiency is model-dependent, not a universal maximum-power bound. The decision to proceed requires named available alternatives or reviewed derivations.

22. **“Zero error,” exact arithmetic and exact optimum promises exceed their contracts.**  
    Analytic shaders still have floating-point and ray-integration error (`demos-games-video/REPORT.md:540–543` versus `tech-stack/REPORT.md:292`). Sign-times-square-root-of-rational arithmetic is not closed under arbitrary sums of words or complex amplitudes (`demos-games-video/REPORT.md:339–342`; `IDEAS.md:760–763`). A bounded word enumerator proves par only within its stated search space.

23. **Pedagogical recommendations are not evidence of this course’s learning outcomes.**  
    Layered-docs explicitly found no experiment establishing an optimal number of depth levels (`layered-docs/REPORT.md:260–264`). General signalling and multimedia results do not prove that one picture per page improves this Lehramt course (`design-research/REPORT.md:153–157`). These are design hypotheses to test with students.

## D. Gaps against the brief

- **Student and classroom use is thin.** The curriculum lists prerequisites and honest simplifications (`curriculum/REPORT.md:466–493`), but no lane supplies a typical student session, lecture-room workflow, diagnostic prerequisite task or student usability study. Specify preparation before class, projector demonstrations, paired game work and return from detours. Include trainee teachers testing whether explanations can be reused with pupils.

- **Assessment is still an open question rather than a deliverable.** Learning goals lack a mapped exercise sequence, worked examples, misconception checks, teacher-facing solutions and exam alignment. “Games as graded work” remains unanswered (`demos-games-video/REPORT.md:575–578`; `PLAN:399,405`). Each Kern section needs assessable outcomes independently of games.

- **Accessibility has not become a complete acceptance contract.** Contrast, keyboard access and MathML are mentioned, but screen-reader mathematical speech, PDF reading order, nonvisual equivalents to clouds, reduced motion, pause controls, touch targets and video descriptions are largely unspecified. `PLAN:137–150` contains no required accessibility result per artifact.

- **Hosting is named; distribution is not operationally designed.** “Everything on GitHub” (`PLAN:91`) leaves repository/site/release-asset structure, large-video handling, caching, URL stability and retention unspecified. Offline files need tested font/WASM bundling and operation under classroom `file://` constraints (`tech-stack/REPORT.md:173–186`).

- **Private evidence and public CI are unresolved.** Source bodies are private, and missing evidence must fail verification (`rigour-process/REPORT.md:81–87`). Public GitHub runners will not possess those books or commercial fonts. Define where source-admission checks run, how receipts are bound to commits, and what public CI verifies. The current blanket `sources/*/` ignore rule also hides per-source metadata unless exceptions are added (`.gitignore:47–49`).

- **Translation is specified more fully than PLAN acknowledges, but is uncosted.** Rigour has a sound German-first hash/freshness workflow (`rigour-process/REPORT.md:503–536`). PLAN should preserve it explicitly and budget scientific translation review, captions, instructions, errors, alt text and narration. Structural parity cannot verify negation or hypotheses.

- **The 25 transcripts have no actionable reuse ledger.** The plan retains them but gives no extraction assignments or coverage accounting (`PLAN:337–338`). `transcripts/MAPPING.md:32–39` identifies board corrections and alternative derivations. Map those passages to new content IDs, identify which require recording confirmation, and preserve the distinction between reconstructed transcript and primary recording.

- **Migration lacks a cutover procedure.** The lanes correctly propose a legacy map (`tech-stack/REPORT.md:399,532`; `rigour-process/REPORT.md:550–556`), but PLAN does not define parallel masters, old URLs/labels, current-course support or the handoff from 22-pair parity to chapter/block parity. Keep legacy CI running until the replacement inventory is complete.

- **The original corrections archive lacks an explicit audit task.** Preserving it is not enough. It should feed the defect ledger and migration records, with unresolved student corrections assigned for review.

- **Astwood requires a rights and reliability review.** No LICENSE means no affirmative redistribution licence; it does not prohibit learning facts from the notes. Separate private verification, citation, quotation, copied exposition and reused figures. The plan’s “map only” policy is sensible, but no owner or completion gate handles that review (`curriculum/REPORT.md:425`; `PLAN:267`).

- **The two-body hydrogen chapter needs a centre-of-mass teaching contract.** Relative orbitals alone do not specify a laboratory electron cloud or the complete two-body state. Add a normalized COM preparation, coordinate interpretation, total versus internal energy, and limitations of any anchored-cloud display.

- **Picture coverage and workload remain undefined.** BRIEF `:98` asks for at least one picture per page; PLAN silently narrows this to substantive pages (`PLAN:137`) while leaving exceptions open (`:404`). There is no measured visual-production budget, review allocation, agent-spend ceiling or operational maintenance owner.

## E. Effort realism and an achievable first release

The media estimate is a **catalogue estimate, not a calibrated delivery schedule**. I independently summed the effort fields:

| Work | Reported | Sum of listed fields |
|---|---:|---:|
| Demos | 86–119 days | 86–119 |
| Games | 84–108 days | **86–111** |
| Videos | 84–108 days | 84–108 |
| Items | 254–335 days | **256–338** |
| Engines, including E0 | about 55–80 days | **56–81** |
| Items plus engines | implicitly 309–415 days | **312–419** |

The mismatch is small compared with the uncertainty, but the totals should be generated. At an illustrative 220 working days per year, the listed media alone represent roughly **1.4–1.9 agent-years**, before the expanded book, commercial/open font regressions, deployment and maintenance. Concurrency does not remove shared-engine dependencies or TJO’s review queue.

The reports also disagree about whether independent review is included: demos defines an agent-day as including review/repair, then adds 15–20% for an independent reviewer (`demos-games-video/REPORT.md:494–496`). Tech estimates use engineer-days and exclude full video production (`tech-stack/REPORT.md:489`). PLAN relabels these as agent-days without calibration (`PLAN:345`).

The **545-page total is arithmetically plausible**: 278 Kern + 236 deeper pages = 514, plus about 30 front/back pages. Its educational and production plausibility is untested. The 27.5 lecture slots sum correctly, but 25 historical recordings are not evidence of the current semester’s contact hours. Moving rigorous work out of lectures does not remove reading, exercise or review effort.

Human review is the decisive constraint. Merely reading 514 substantive pages at an illustrative 10–20 minutes per page takes 86–171 hours for one language, excluding detailed proofs, source correspondences and asset behavior. Reviewing 105 artifacts at 1–3 hours each adds 105–315 hours. These are capacity illustrations, not validated estimates; the plan must measure pilot throughput.

**Recommended cut: release R0 as an explicitly partial, reviewed pilot volume.**

- **Chapters:** C0–C1, C2 and C11, matching smoke tests A, C and B. Include the Kern prerequisite material from C3/C4/C9/C10 needed to make the hydrogen chapter independently readable. Keep the existing 22-lecture course available during this pilot.
- **Hydrogen:** initially \(n\le2\), with the full two-body derivation and reduced mass. Ship three small views: sampled relative-coordinate cloud, radial distribution/nodes, and a labelled phase slice. Produce one 30–60-second 3D video from the accepted scene. Defer \(n=7\), broad superpositions, current fields, continuum scattering and alternative radial extensions.
- **GPT flagship:** a small state/effect explorer and “Distinguish” game limited to the classical bit, qubit and square-bit models. Use a small fixed level set with independently checked optima.
- **Packages:** retain all five feature flags as decided. Test all five on the three smoke fixtures with explicit open fallbacks. Ship the default public rendering; keep PKG-2 visibly experimental. Defer a general scene-to-TikZ engine and package-specific bespoke media.
- **Defer:** real-fluid Carnot, the general engine designer, Dirac’s belt/Orient, Fock games, the animated zoom ladder and the remaining catalogue. A static course map can explain the future route without depending on every engine.

Use **50–80 agent-days and 40–60 TJO hours as an initial R0 planning envelope**, not a delivery promise. Re-estimate after one complete smoke fixture, including reviewer time and all package checks. Record agent-hours, tokens/spend, render time, repair rate and accepted pages per week. The unchanged 32–53-day Phase 0 total is not defensible after the added pilots and flags (`PLAN:359–375`).

## F. Consequences and risks of the fixed decisions that PLAN does not yet account for

1. **D3 creates a compatibility matrix, not merely five palettes.**  
   Four language/depth print editions × five packages already gives 20 fallback PDF builds per smoke fixture; local commercial variants add more. Browser themes, grounds and artifact types add further cases. Define exhaustive structural checks, representative visual checks and supported combinations. Cite package-specific exceptions explicitly (`PLAN:85,137–140,363–364`).

2. **D1/D10 separate public CI from the preferred print build.**  
   Open-font CI cannot certify MTPro2 line breaks or commercial-font glyph coverage. Require local preferred-font build receipts tied to source/font hashes, plus public fallback builds. Also define the accessible companion output; a searchable STIX PDF is not automatically an accessible one (`PLAN:83,92,218–219`).

3. **D8 makes three distinct acceptance experiments.**  
   A tests editorial flow and ordinary conversion; B tests continuum physics/rendering; C tests new foundations and source correspondence. One must not stand in for another. Smoke C’s game also needs E2 and, for qubits, E1—not only E12 as the old 0d row suggests. Give each fixture bounded content, dependencies and exit criteria (`PLAN:350–375`).

4. **The two-body hydrogen decision changes every coordinate-dependent artifact.**  
   With \(R=(m_ex_e+m_px_p)/M\), \(r=x_e-x_p\), one has \(x_e=R+(m_p/M)r\). For a factorized COM/relative preparation, the laboratory electron density is a convolution, not simply \(|\psi_{n\ell m}(x_e)|^2\). Internal levels and total energy must also be distinguished. PLAN recognizes relative-coordinate captions but does not yet specify the COM state or laboratory marginal (`PLAN:96–120`).

5. **D4 requires an explicit finite-to-continuum bridge.**  
   Finite-dimensional postulates do not directly cover exact hydrogen or the oscillator. Record which Kern definitions extend to \(L^2\), which operator claims are stated with hypotheses, and which browser matrices are truncations. This is necessary to implement D4 honestly, not a reopening of it (`PLAN:86,159–166`).

6. **D6/D7 change the authority and acquisition backlog.**  
   Reed–Simon, CFKS and Bratteli–Robinson are now supplied; the risk section must stop describing them as absent. Register exact editions, source members, checked image loci and notation translations. CFKS text extraction remains explicitly unchecked against images (`PLAN:88–89,113–115,126–133`). Source presence is not completed claim admission.

7. **Proceeding without the missing sources requires an alternate-evidence map.**  
   For every Ludwig-, BLW-, Callen-, Lieb–Yngvason- or Bargmann-dependent unit, name an available local authority, provide a reviewed derivation, or defer that unit. In particular, keep finite joint-measurability examples distinct from BLW error-disturbance claims. “Stated without proof” cannot supply evidence (`PLAN:121–124`).

8. **D5 fixes names but not block semantics.**  
   Allocate curriculum Z material to V/F; define separate counters for equations, definitions, theorems, exercises and figures; make every detour return safely to Kern. Package variations must preserve that meaning. The prototype currently demonstrates only equation numbering and a signpost (`PLAN:87,171–175`; `layered-docs/prototype/levels.sty:7–16`).

9. **D9 requires a public/private release architecture.**  
   GitHub hosting must accommodate public metadata and artifacts while keeping restricted sources and commercial fonts local. Specify private evidence hydration, public CI receipts, downloadable offline files, video release storage and stable links. “Everything on GitHub” is not a source-redistribution permission (`PLAN:91–92`).

10. **D2 and the review cadence require explicit cost and closure rules.**  
    Light/dark variants still need transfer-function, label and visibility checks. After the single repair wave, verify repaired findings against their original predicates; changed scientific arguments remain unadmitted. PLAN’s “receipt on file” exit and “hard stop” wording do not capture this discipline (`PLAN:84,290,353`; `rigour-process/REPORT.md:479–485`). Schedule work to TJO’s available review capacity and an explicitly defined R0 release inventory.

## G. Corrections required before the reports are used

| File and line | Correction |
|---|---|
| `PLAN:3,36,381–386` | Remove the nonexistent completed-review attribution; update the stale source and commercial-web-font risks against §1.3. |
| `PLAN:45`; `layered-docs/REPORT.md:419–422` | Replace “provably self-contained”/“build check, not a promise” with the demonstrated structural coverage and the remaining semantic reviewer obligations. |
| `PLAN:121–124,274–276` | Preserve the decision to proceed, but separate evidence type from proof presentation. Unsupported statements remain unadmitted. |
| `PLAN:167–169` | Update hydrogen’s primary-authority allocation to match D6; retain Teschl as the stated cross-check. |
| `PLAN:213–214` | Remove the claim that both package lanes independently ranked PKG-5b first. A recommended PKG-1/1S; B recommended PKG-5b. |
| `PLAN:239`; `curriculum/REPORT.md:12,527` | The enumerated reuse set contains **14 chapters**, not 13. |
| `curriculum/REPORT.md:262–263`; `notation-preinventory.md:113` | Narrow the vl04 defect to scope/domain omissions. Its explicit \(A^\dagger=A\) definition does not itself confuse symmetry with self-adjointness. |
| `curriculum/REPORT.md:351–352,357–358` | Quote AST’s actual malformed preceding identity; add the swapped-argument defect. Qualify the zero vacuum expectation by absence of a scalar term. |
| `curriculum/REPORT.md:155,236–238,487` | Independent preparability does not force the quantum tensor product; potentials require variable-specific convexity/concavity; a particle in a box is not finite-dimensional without truncation. |
| `demos-games-video/IDEAS.md:671–672` | Correct the kinetic-energy convention or the hydrogen energies: \(-\Delta-Z/r\) has \(-Z^2/(4n^2)\). |
| `demos-games-video/IDEAS.md:612–613,637,643` | Propagate the reduced-mass decision: relative-coordinate current uses \(\mu\); internal energies, lengths and isotope parameters need one consistent mass convention. |
| `demos-games-video/REPORT.md:490–493`; `PLAN:357` | Generate totals from the catalogue: games 86–111, items 256–338, engines 56–81 agent-days. Label whether phase estimates include already-built engines. |
| `demos-games-video/REPORT.md:294–304,427,540–551` | State the chosen gate generator; replace “Fisher information equals heat capacity” with the parameter-dependent identity; remove “error is zero” and “nothing re-verified.” |
| `demos-games-video/IDEAS.md:760–763,785–788` | Extend exact arithmetic to sums or restrict levels. Shannon entropy is a lower bound, not generally the attainable twenty-questions par; use the optimal decision-tree expected length. |
| `design-research/REPORT.md:22`; `curriculum/REPORT.md:413,415` | Remove invented attributions to BRIEF: it names neither the three alleged designers nor the alleged 2016 publication date or “Quantum mechanics beyond Hilbert space” title. |
| `design-research/REPORT.md:27,106`; `design-packages-B/REPORT.md:92`; `PLAN:199–200` | Replace STIX’s alleged technical uniqueness with the supported specimen preference; acknowledge MathJax’s Termes option. |
| `design-packages-A/PKG-1-times-mathtime.md:39–43,270–276`; A `REPORT.md:81` | Separate measured extraction failure from universal PDF impossibility; replace second-seat speculation with the applicable local EULA; distinguish installed from licensed. |
| `design-packages-A/PKG-1-times-mathtime.md:122–123`; B `PKG-5-explorable-textbook.md:100–101` | Remove the thick-stroke contrast exemption and the claim that 2.99:1 meets 3:1. |
| `design-packages-B/REPORT.md:28–32`; `PKG-5-explorable-textbook.md:248` | Correct the half-maximum probability to approximately **0.1771** and withdraw the claimed four-decimal convergence of the stated grids. |