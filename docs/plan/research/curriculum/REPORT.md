<!-- ROLE: curriculum lane report for the Theo C upgrade plan. Author: curriculum lane (Opus), 2026-10-09.
     Inputs: docs/plan/BRIEF.md (authority), docs/plan/CONTEXT.md, latex/lectures/de/vl01-vl22.tex
     (commit 27234fd), README.md, transcripts/MAPPING.md, Astwood notes, Plavala arXiv:2103.07469v2.
     Companion files: notation-preinventory.md (symbols, definitions), PROVENANCE.md (hashes), plavala-src/. -->

# Curriculum lane: chapter plan, hazards, sources, notation seed, scope

## 0. Summary

- 22 chapters (C0-C21) in five parts, plus one optional chapter (C22, scattering). Each chapter has a
  gentle Lehramt track that is complete and true as written, and rigorous zoom-ins that name theorems.
- The 84-page script (vl01-vl22) feeds 13 of 22 chapters at about a quarter of target density. Nothing
  exists for C2, C8, C9, C14 (student notes only), C18, C19-C21.
- Estimated print size: about 280 pages gentle track plus about 235 pages of zoom-ins, about 545 pages with
  front and back matter (section 6). At 27.5 lecture slots against 25 recorded videos, the gentle track is
  slightly too long for one semester; section 6 says what to cut.
- Verified defects in the current script (section 2): sign error in `L_2^s` (vl16.tex:85), wrong
  normalisation of `ψ_{21±1}` (vl16.tex:94, norm squared 0.5), superseded `k_B` (vl19.tex:21), sign/factor
  error in the canonical Lagrangian (vl22.tex:25), "hermitesch (Synonym: selbstadjungiert)" (vl04.tex:70);
  each also in the English edition.
- Plavala's framework is finite-dimensional by axiom (S5 in what_v4.tex); it never defines "Archimedean"
  (0 hits in the source). The BRIEF's P2 ("positive linear functionals on B(H) with norm 1") is not the
  same set as the density operators in infinite dimension. Both points need a decision (Open questions 1-2).

## 1. Chapter list

Format per chapter: EN / DE working title. **Eff.**: the effective-theory sentence. **L**: Lehramt goals.
**Z**: rigorous zoom-ins. **Pre**: prerequisites. **Reuse**: existing files (all paths `latex/lectures/de/`
unless stated; AST = Astwood notes, see section 3).
### Part I. The fundamental level: probabilistic theories
#### C0. What a physical theory supplies / Was eine physikalische Theorie liefert
- Eff.: Every theory in this book is a rule that turns preparations and measurements into probabilities;
  later chapters are coarser rules of the same kind.
- L: three-stage experiment (preparation, transformation, measurement); the ladder GPT -> QM -> many
  particles -> Fock -> stat mech -> thermo, drawn once and revisited at each chapter end.
- Z: none (map of the zoom-ins).
- Pre: none. Reuse: vl01.tex §Vorgeschichte and greybox "Jedes Experiment in drei Schritten"; v01/v02
  commentary (MAPPING.md "Konzeptionelle Rahmung").
#### C1. Probability for physicists / Wahrscheinlichkeit für Physiker
- Eff.: Classical probability is the GPT whose state space is a simplex; determinism is the special case of
  the vertices (BRIEF item 1).
- L: finite sample space, distributions as preparations, random variables and indicator functions as
  measurements, expectation as pairing, mixing as convex combination, P0.
- Z: measure-theoretic probability on R (sigma-additivity, densities); the simplex characterisation
  (PLA CT_v3.tex defines classical theory as the simplex case).
- Pre: C0. Reuse: vl01.tex §Wahrscheinlichkeit (all).
#### C2. General probabilistic theories / Allgemeine probabilistische Theorien
- Eff.: Preparations form a convex set, tests are affine functions on it, and nothing else is assumed; quantum
  theory is one choice of convex set.
- L: state space as compact convex set in R^n (PLA Def. S1-S5); pure states as extreme points; effects as
  affine maps to [0,1]; unit effect; measurement = effects summing to the unit (PLA Prop.
  channels-measurements-effects); channels as affine maps; three worked examples with pictures: bit
  (segment), qubit (Bloch ball), gbit (square, PLA boxworld_v3.tex).
- Z: duality theorem `K = {φ ∈ A(K)^{*+} : ⟨φ,1_K⟩ = 1}` (PLA Thm basic-dual-stateSpace, via strict
  hyperplane separation); effect algebras, convex effect algebras and order unit spaces are equivalent
  (PLA §basic-connection, Gudder-Pulmannova cited there); Archimedean order unit spaces in infinite
  dimension (not in PLA; source needed, section 3 S02/S18); no-restriction hypothesis; min/max tensor
  products and entanglement in GPTs (PLA tensor_v3.tex); no-broadcasting (PLA compatibility_v3.tex).
- Pre: C1, linear algebra in R^n. Reuse: nothing in vl01-vl22; the qubit disc in fig_vl06_messung is the
  seed of the Bloch-ball picture.
#### C3. The Hilbert-space toolkit / Werkzeugkasten Hilbertraum
- Eff.: Complex inner-product geometry is the bookkeeping device that quantum theory's convex set happens to
  need; it is a tool, not a postulate about reality.
- L: C^n, inner product, orthonormal bases, Gram-Schmidt, adjoint, Hermitian/unitary/positive/projector
  matrices, trace, spectral decomposition and functional calculus for matrices, L^2 as the infinite-
  dimensional example with a warning box.
- Z: completeness; l^2 and L^2; bounded vs unbounded operators; domains; symmetric vs self-adjoint; spectral
  theorem (TES Ch. 3); trace class and the duality `T(H)^* = B(H)` (RS I [UNVERIFIED theorem number]).
- Pre: C1 (linear algebra). Reuse: vl02.tex, vl03.tex, vl04.tex, vl05.tex (all four, about 5600 words).
#### C4. Quantum theory as a probabilistic theory / Quantentheorie als probabilistische Theorie
- Eff.: Quantum theory is the GPT whose state space is the density operators of a Hilbert space; the
  postulates P1-P5 are a specialisation of C2, not new principles.
- L: P1-P4 for finite dimension (matrices only): density matrices, effects `0 ≤ F ≤ 𝟙`, Born rule
  `tr(ρF)`, POVMs, PVMs, the qubit worked through all postulates; Schrödinger and Heisenberg pictures;
  "observable = Hermitian matrix" as the PVM special case.
- Z: normal states = density operators, singular states on `B(H)` exist in infinite dimension (BR I
  [UNVERIFIED section]); Gleason's theorem (Gleason 1957) and Busch's effect version, valid also in
  dimension 2 (Busch 2003); Naimark dilation; instruments and Lüders rule; complete positivity.
- Pre: C2, C3. Reuse: vl06.tex (Postulate 1-5, qubit examples, POVM paragraph), fig_vl06_messung.
#### C5. Which Hilbert space? The particle on a line / Welcher Hilbertraum? Das Teilchen auf der Geraden
- Eff.: Experiments, not a quantisation rule, select `L^2(R)` with position and momentum; classical mechanics
  is the effective theory of decohered quantum dynamics (BRIEF item 5).
- L: position measurement as a PVM on intervals (`F_{[a,b]}`), `|Ψ|^2` as density, momentum via Fourier
  transform, free Hamiltonian, CCR as a computed identity on nice functions; "quantisation" presented as a
  heuristic with a warning.
- Z: domains of `Q` and `P`, self-adjointness, Schwartz space as a common core; Stone-von Neumann (HAL Ch.
  14) and why the CCR cannot hold for bounded operators or in finite dimension (trace argument); the
  Groenewold-van Hove obstruction to "quantisation maps" (HAL Ch. 13 [UNVERIFIED that it is proved there]).
- Pre: C3, C4. Reuse: vl07.tex (whole, including the `|x⟩⟨x|` warning), vl08.tex §Fourier, §Impuls-Raum,
  §Quantisierungsregeln, fig_vl07_dichte.
#### C6. Uncertainty: preparation versus measurement / Unschärfe: Präparation und Messung
- Eff.: The Kennard-Robertson inequality is a statement about preparations; measurement uncertainty is a
  different theorem about joint measurements, and both follow from the structure of C4.
- L: variance in a fixed state, Kennard `Δx Δp ≥ ħ/2` as "no preparation is sharp in both", explicit
  rejection of the "measure x then p" reading (vl09.tex Merksatz), a picture of the two different
  experiments.
- Z: Robertson with domain hypothesis `ψ ∈ D(AB) ∩ D(BA)` (TES Thm 8.2); counterexample family when the
  domain condition fails [source needed, UNVERIFIED]; Werner's joint-measurement relation (Werner 2004);
  error-disturbance (BLW PRL 2013); calibration error and the RMS-error critique (BLW RMP 2014).
- Pre: C4, C5. Reuse: vl09.tex (all, 580 words), fig_vl09_unschaerfe; v11 commentary.
#### C7. Solvable systems / Lösbare Systeme
- Eff.: Qubit, box and oscillator are idealised models; each idealisation (hard walls, exact quadratic
  potential) is an effective description valid in a stated energy range.
- L: qubit dynamics, particle in the box, finite well (bound states, matching conditions), harmonic
  oscillator by ladder operators, wave-packet spreading.
- Z: the box Hamiltonian as one self-adjoint extension among many (Dirichlet chosen by physics);
  completeness of Hermite functions; `a, a^†` domains and the number operator; Heisenberg-picture free
  evolution.
- Pre: C5, C6. Reuse: vl10.tex, vl11.tex, vl12.tex, vl13.tex; figures fig_vl10..fig_vl13
  (fig_vl11_kasten is the reference figure).
### Part II. The symmetry road (parallel to Part I, joins at C10)
#### C8. Symmetries and Wigner's theorem / Symmetrien und der Satz von Wigner
- Eff.: A symmetry is an automorphism of the GPT (states, effects, or rays); Wigner's theorem says that for
  quantum theory these are exactly unitary or antiunitary maps up to phase.
- L: symmetry as a map that preserves all probabilities; qubit rotations on the Bloch ball; statement of
  Wigner's theorem; why phases make representations projective; antiunitary time reversal.
- Z: ray form proof (Bargmann 1964); elementary proofs (Simon et al. 2008 and their 2014 correction);
  Fubini-Study proof (Freed 2012); Kadison form (affine bijections of the state space) and effect
  automorphisms (Cassinelli et al. LNP 654 [content UNVERIFIED]); Uhlhorn's orthogonality version
  [UNVERIFIED citation].
- Pre: C2, C4. Reuse: AST §Symmetries and Wigner's Theorem (proof follows Weinberg QFT I, see hazard
  H8.4); TJO reMarkable notes (not transcribed).
#### C9. Dynamics as a representation of R / Dynamik als Darstellung von R
- Eff.: Reversible dynamics is a continuous one-parameter group of symmetries; its generator is the
  Hamiltonian (BRIEF items 8-9, axiom P5).
- L: `U_t = e^{-itH/ħ}` for matrices, group law, derivative gives the Schrödinger equation, H must be
  Hermitian for unitarity; Galilei boosts as a second example; free particle.
- Z: Stone's theorem (TES Thm 5.3; Stone 1932); why continuity is assumed; projective representations of R
  are equivalent to true ones (Bargmann's theorem [UNVERIFIED citation]); Galilei group and mass
  superselection [UNVERIFIED]; open-system dynamics are channels, not symmetries.
- Pre: C8. Reuse: vl06.tex Postulat 5, vl08.tex §Lösung freies Teilchen, vl10.tex, vl17.tex §Dynamik
  zusammengesetzter Systeme.
#### C10. Rotations and angular momentum / Drehungen und Drehimpuls
- Eff.: Angular momentum is the representation theory of SO(3) and its double cover SU(2); spin is what
  projective representations add.
- L: rotation matrices, generators, commutation relations, ladder operators, multiplets `j = 0, 1/2, 1, ...`,
  spherical harmonics, Pauli matrices, Stern-Gerlach, adding two spins 1/2.
- Z: Lie group to Lie algebra (HAL Ch. 16); irreducible representations of su(2) (HAL Ch. 17); lifting
  projective representations of SO(3) to SU(2); `L^2(S^2) = ⊕_ℓ` (2ℓ+1)-dimensional irreducibles; why
  orbital ℓ is integer (true representation of SO(3) on `L^2(R^3)`).
- Pre: C8, C9, C3. Reuse: vl14.tex, vl17.tex §Spin (first half), fig_vl14_multiplett, fig_vl17_bloch.
#### C11. Hydrogen / Wasserstoff
- Eff.: The Coulomb Hamiltonian is a two-body model with a point nucleus, no spin-orbit coupling and no
  field quantisation; its exact solution is the reference against which fine structure, Lamb shift and
  hyperfine splitting are the next corrections.
- L: reduction to relative motion, separation in spherical coordinates, radial equation with the
  centrifugal barrier, spectrum `E_n`, degeneracy `n^2`, orbitals as probability densities, spectral lines.
- Z: self-adjointness of `-Δ - γ/|x|` on `H^2(R^3)` by Kato-Rellich (TES §10.2, Thm 6.4; Kato 1951);
  essential spectrum `[0,∞)`; virial theorem (TES Thm 10.4); partial-wave decomposition and the l = 0 limit-
  circle boundary condition at r = 0 (TES Thm 10.9); factorisation method `A_l = Q_l^* Q_l - c_l^2` (TES
  Thm 10.11); Runge-Lenz vector and SO(4) degeneracy (HAL Ch. 18).
- Pre: C7, C10. Reuse: vl15.tex, vl16.tex, fig_vl15_effpot, fig_vl16_termschema (after the fixes in H11.1).
### Part III. Many particles
#### C12. Composite systems / Zusammengesetzte Systeme
- Eff.: Independent preparability forces the tensor product; entanglement is what the tensor product
  contains beyond the classical product of simplices.
- L: tensor product of vectors and matrices, `dim` multiplies, `H_1⊗𝟙 + 𝟙⊗H_2`, partial trace, EPR state,
  reduced states are mixed.
- Z: GPT min/max tensor products and why QT sits strictly between (PLA tensor_v3.tex); local tomography
  [UNVERIFIED source]; Schmidt decomposition.
- Pre: C4, C9. Reuse: vl17.tex §Zusammengesetzte Systeme, §Dynamik, §Verschränkung.
#### C13. Identical particles / Identische Teilchen
- Eff.: For identical particles the labelled tensor product over-describes; the physical states live on the
  symmetric or antisymmetric subspace, and which one is an empirical input (spin-statistics is a theorem
  only in relativistic QFT).
- L: permutation operators, bosons and fermions, Slater determinants, Pauli exclusion, exchange density
  picture (fig_vl18_statistik).
- Z: superselection between symmetry sectors; mixed-symmetry sectors for N ≥ 3; configuration-space view
  and anyons in 2D (Leinaas-Myrheim 1977 [UNVERIFIED citation]; AST §Relative Space).
- Pre: C12. Reuse: vl18.tex (identical particles part), AST §Fock Space first two subsections.
#### C14. Fock space / Fockraum
- Eff.: When particle number is not fixed, Fock space is the state space; creation and annihilation
  operators are a coordinate system on it, and fields are their smeared versions.
- L: direct sum of N-particle spaces, vacuum, occupation-number basis with explicit small examples (2 modes,
  3 fermions), `a^†`, `a`, CCR/CAR, number operator, Jordan-Wigner for fermions on qubits, one-body
  Hamiltonians `Σ h_{μν} a^†_μ a_ν`, two-body terms, free Fermi gas.
- Z: `Γ(A)` and `dΓ(H)`; boundedness of CAR operators versus unboundedness of CCR operators; Fock
  representation and uniqueness of the vacuum; field operators as operator-valued distributions; quasi-free
  states; Bose-Hubbard and coherent-state variational bounds (BR II §5.2 [UNVERIFIED subsections]; AST).
- Pre: C13. Reuse: AST §Fock Space, §CAR/CCR, §Examples (after the corrections in H14).
### Part IV. Zoom out and lose information: statistical mechanics
#### C15. Ensembles and entropy / Ensembles und Entropie
- Eff.: A macrostate is a state of knowledge; entropy measures how much of the microscopic description has
  been discarded.
- L: micro- vs macrostate, ensembles as mixtures, non-uniqueness of ensemble decompositions, von Neumann
  entropy, matrix logarithm, invariance and additivity.
- Z: concavity, subadditivity, Klein's inequality [UNVERIFIED source]; Schur concavity.
- Pre: C4, C12. Reuse: vl18.tex §Statistische Physik, vl19.tex, fig_vl19_entropie.
#### C16. The microcanonical ensemble and the fundamental hypothesis / Mikrokanonisches Ensemble und die Grundannahme
- Eff.: The equal-a-priori hypothesis (or maximum entropy) replaces dynamics by a single state; temperature
  is the slope of entropy, defined so that systems in contact share it.
- L: microcanonical state as normalised spectral projector on an energy shell, `S = k_B ln N_E`, two
  systems in contact, `1/T = ∂S/∂E` at fixed V, N, negative temperature for bounded spectra.
- Z: three justifications compared: equal a priori (fundamental hypothesis), maximum entropy (Jaynes
  1957), canonical typicality (Popescu-Short-Winter 2006; Goldstein et al. 2006); von Neumann's quantum
  ergodic and H-theorem (von Neumann 1929, Tumulka translation) and its limits (arXiv:1003.2129);
  Boltzmann's H-theorem (classical, Stosszahlansatz).
- Pre: C15, C12. Reuse: vl20.tex, vl21.tex, fig_vl20_mikro, fig_vl21_kontakt.
#### C17. Canonical and grand canonical ensembles / Kanonisches und großkanonisches Ensemble
- Eff.: A small system in contact with a large one is described by the Gibbs state; the bath's details drop
  out except for one number, β (and μ for particle exchange).
- L: Gibbs state by Lagrange multipliers, partition function, `⟨H⟩ = -∂ ln Z/∂β`, `S = k_B(β⟨H⟩ + ln Z)`,
  two-level system, oscillator; grand canonical state on Fock space, Bose and Fermi occupation numbers.
- Z: Gibbs variational principle and uniqueness of the maximiser; trace-class condition on `e^{-βH}`;
  equivalence of ensembles [UNVERIFIED source]; KMS condition (BR II §5.3 [UNVERIFIED]).
- Pre: C16, C14 (for grand canonical). Reuse: vl22.tex (canonical part), fig_vl22_boltzmann.
#### C18. Quantum gases and radiation / Quantengase und Strahlung
- Eff.: Ideal Bose and Fermi gases are the many-body effective theories that explain black-body radiation,
  degeneracy pressure and condensation; Planck's law closes the loop to C0.
- L: photon gas and Planck's law, Debye model, degenerate Fermi gas, Bose-Einstein condensation (as
  occupation of the ground state).
- Z: thermodynamic limit and BEC as a limit statement; Lieb-Robinson-type locality (Wilming notes, local,
  not for redistribution).
- Pre: C17, C14. Reuse: vl01.tex Planck formula (historical part only); AST §Degenerate Electron Gas.
### Part V. The ultimate effective theory: thermodynamics
#### C19. The laws of thermodynamics / Die Hauptsätze
- Eff.: Thermodynamics is the effective theory that survives when only a few macroscopic variables are kept;
  its laws are consequences of stat mech, and conversely stand alone as axioms (Lieb-Yngvason).
- L: state variables, equilibrium, zeroth to third law, quasi-static processes, heat and work with one sign
  convention, entropy increase for isolated systems explained as coarse-graining.
- Z: Lieb-Yngvason axioms and the entropy principle (Phys. Rep. 310); Carathéodory's formulation
  [UNVERIFIED source]; third law as unattainability (Masanes-Oppenheim 2017).
- Pre: C16, C17. Reuse: vl22.tex §Hauptsätze (needs the corrections in H19).
#### C20. Machines: cycles and Carnot / Maschinen: Kreisprozesse und Carnot
- Eff.: Every heat engine is bounded by the Carnot efficiency, a statement that needs only the second law
  and therefore holds for quantum machines too.
- L: cycles in p-V and T-S diagrams, Carnot cycle, efficiency `1 - T_c/T_h`, refrigerators and heat pumps
  (school-relevant), Otto cycle; a qubit Otto engine as the bridge to C4.
- Z: Carnot's theorem from the second law (Carnot 1824; Callen); reversible vs irreversible; finite-time
  bounds (Curzon-Ahlborn [UNVERIFIED citation]).
- Pre: C19. Reuse: none.
#### C21. Thermodynamic potentials / Thermodynamische Potentiale
- Eff.: Potentials are Legendre transforms that let one control temperature, pressure or chemical potential
  instead of their conjugates; stat mech computes them as logarithms of partition functions.
- L: U, F, H, G, Ω; Legendre transform with pictures; Maxwell relations; heat capacities;
  `F = -k_B T ln Z`, `Ω = -k_B T ln Ξ`; stability as convexity.
- Z: concavity of entropy and convexity of potentials; Gibbs-Duhem; phase coexistence via non-strict
  convexity [UNVERIFIED source].
- Pre: C19, C17. Reuse: none.

**C22 (optional). Scattering / Streutheorie.** Eff.: cross sections are the effective description of
asymptotic states. Zoom only: Møller operators, asymptotic completeness, Born approximation (AST
§Scattering; TES Ch. 12). Pre: C9, C11.

## 2. Correctness hazards per chapter

Each line: hazard -> correct statement -> authority. "Script defect" marks a place where the current text
is wrong or loose (file and line at commit 27234fd).

- **C0/C1** H1.1 Determinism is the vertex case of the simplex, not the absence of probability (PLA CT_v3.tex).
  H1.2 A density `p(x)` is not a probability; only integrals over sets are.
- **C2**
  - H2.1 GPT state space is finite-dimensional *by axiom* S5 in PLA; infinite-dimensional statements need a
    different source -> PLA what_v4.tex.
  - H2.2 "Effects are the dual of states": in finite dimension `E(K) = [0,1_K] ⊂ A(K)` and `K` is
    recovered as the normalised dual cone (PLA Thm basic-dual-stateSpace); in infinite dimension one must
    say which dual (norm dual of the base norm space vs predual) -> Ludwig I; BR I [UNVERIFIED].
  - H2.3 "Archimedean": automatic for closed cones in finite dimension, a real condition in infinite
    dimension; PLA does not define it -> source needed (S02, S18, or Alfsen-Shultz [UNVERIFIED]).
  - H2.4 Max of two effects is generally not an effect (PLA basic_v3.tex, after Prop. basic-EA-interval).
- **C3**
  - H3.1 Script defect vl04.tex line 70: "hermitesch (Synonym: selbstadjungiert)". Correct: symmetric
    (Hermitian) and self-adjoint coincide for bounded operators only -> TES §2.2 [UNVERIFIED section]; HAL Ch. 9.
  - H3.2 Script defect vl04.tex line 5: "Die Vektoren des Hilbertraums beschreiben die Zustände"
    contradicts vl06.tex's own warning (states are density operators) -> vl06.tex; PLA QT_v3.tex.
  - H3.3 vl05.tex: "every Hermitian operator is diagonalisable" is true in finite dimension only; in
    infinite dimension spectral theorem with continuous spectrum -> TES Ch. 3.
- **C4**
  - H4.1 BRIEF P2 "positive linear functionals on B(H) with norm 1": in infinite dimension this set strictly
    contains the density operators (singular states exist); density operators = normal states -> BR I
    [UNVERIFIED section]. P3 "detectors = dual of states" then fails: the dual of `B(H)^*` is not `B(H)`.
    Correct pairing: `T(H)` with dual `B(H)`.
  - H4.2 Gleason needs dim ≥ 3 and sigma-additivity on projections; Busch's effect version also covers
    dim 2 -> Gleason 1957; Busch 2003.
  - H4.3 vl06.tex Postulat 5 says "H hermitesch => U_t unitary"; for unbounded H, symmetric is not enough,
    self-adjointness is required -> TES Thm 5.3.
  - H4.4 "Observables are Hermitian operators" is the PVM special case only (vl06.tex says this; keep it).
- **C5**
  - H5.1 "Quantisation" as an algorithm: no map on all classical observables satisfies Dirac's rule
    (Groenewold-van Hove) -> HAL Ch. 13 [UNVERIFIED]; v08 commentary.
  - H5.2 `|x⟩⟨x|` is not an operator (vl07.tex states this correctly); position eigenvectors are not in
    `L^2` -> vl07.tex; TES §8.1.
  - H5.3 `[x,p] = iħ` holds on a dense domain only; it cannot hold for bounded operators or in finite
    dimension; uniqueness (Stone-von Neumann) needs the Weyl form -> HAL Ch. 14.
  - H5.4 `p = -iħ d/dx` has no self-adjoint extension on a half-line and a one-parameter family on an
    interval -> RS II §X.1 [UNVERIFIED location].
- **C6**
  - H6.1 Preparation vs measurement uncertainty: Kennard-Robertson concerns two separate experiments on
    identically prepared systems; the error-disturbance trade-off is a separate theorem -> vl09.tex
    Merksatz; BLW PRL 2013; BLW RMP 2014; Werner-Farrelly arXiv:1904.06139.
  - H6.2 Script defect vl09.tex: "gilt für beliebige hermitesche Operatoren" and "beliebige Dichtematrix";
    for unbounded A, B the state must lie in `D(AB) ∩ D(BA)` -> TES Thm 8.2.
  - H6.3 Do not use Ozawa-type state-dependent error measures as the definition without saying that BLW
    reject them -> BLW RMP 2014.
- **C7**
  - H7.1 "The box Hamiltonian" is a choice of boundary condition (self-adjoint extension) -> RS II §X.1
    [UNVERIFIED]; TES Ch. 9.
  - H7.2 Matching conditions at a finite step: continuity of ψ and ψ' follows from ψ ∈ domain of the
    self-adjoint operator, not by assumption (MAPPING.md notes vl13 assumes them) -> TES Ch. 9.
- **C8**
  - H8.1 Wigner's theorem: the map is unitary or antiunitary on vectors and is determined up to a phase;
    representations of groups are therefore projective -> Bargmann 1964.
  - H8.2 "All symmetries are unitary": time reversal is antiunitary -> Bargmann 1964.
  - H8.3 Three inequivalent-looking hypotheses (rays and transition probabilities; affine bijections of
    states; effect automorphisms) yield the same conclusion; state which one is used -> Cassinelli et al.
    LNP 654 [UNVERIFIED]; Freed 2012.
  - H8.4 AST's proof follows Weinberg QFT I Ch. 2 App. A [UNVERIFIED location]; its last step ("we can
    always find Ξ") is asserted without proof. Use Bargmann or Simon et al. (with the 2014 correction).
- **C9**
  - H9.1 Stone's theorem requires (weak, hence strong) continuity -> TES Thm 5.3.
  - H9.2 "Dynamics are symmetries" holds for closed systems; open-system dynamics are channels.
  - H9.3 Sign convention `U_t = e^{-itH/ħ}` fixed once; AST mixes signs (§Dynamics in Fock Space).
- **C10**
  - H10.1 vl14.tex lists `ℓ = 0, 1/2, 1, ...` for `L̂`; then restricts to integers by single-valuedness of
    `e^{imφ}`. The single-valuedness argument is loose; the clean argument is that `L̂` generates a true
    representation of SO(3) on `L^2(R^3)` -> HAL Ch. 17 [UNVERIFIED section].
  - H10.2 vl14.tex Lemma "commuting Hermitian operators on H have common eigenvectors": false in infinite
    dimension (e.g. `Q` and `P_y` have none); for unbounded operators "commute" must mean commuting
    spectral projections -> TES §4.2.
  - H10.3 Spin 1/2 is a projective representation of SO(3), a true representation of SU(2).
- **C11**
  - H11.1 Script defects, verified numerically (PROVENANCE.md): vl16.tex line 85 `L_2^s(x)` must be
    `+x^2/2 - (s+2)x + (s+1)(s+2)/2`; vl16.tex line 94 `ψ_{21±1}` prefactor must be `∓1/(8√π)` (the
    script's `1/(8√(2π))` has norm squared 0.5; the sign follows Condon-Shortley as fixed in vl14.tex).
    Same lines in en/lec16.tex.
  - H11.2 vl15.tex `u(0)=0`: for ℓ ≥ 1 the operator is limit point at 0 and no condition is needed; for
    ℓ = 0 it is limit circle and `lim (f - r f') = 0` is a genuine boundary condition selected by the 3D
    domain `H^2(R^3)` -> TES Thm 10.9. An ℓ = 0 solution with `u(0) ≠ 0` has finite norm; it is excluded by
    the domain (kinetic energy), not by normalisability. `u(0)=0` does not mean `ψ(0)=0` for s states.
  - H11.3 vl15.tex radial momentum `p_r = -iħ(∂_r + 1/r)` is symmetric but not self-adjoint on
    `L^2((0,∞), r^2 dr)`; use it only formally -> RS II §X.1 [UNVERIFIED location].
  - H11.4 Self-adjointness of the Coulomb Hamiltonian is a theorem (Kato-Rellich, relative bound 0), with
    domain `H^2(R^3)` -> TES §10.2; Kato 1951.
  - H11.5 The `n^2` degeneracy is not accidental: SO(4) via the Runge-Lenz vector -> HAL Ch. 18.
  - H11.6 vl16.tex `a_0 = 5.29177210903(80)e-11 m` is CODATA 2018; CODATA 2022 gives
    `5.29177210544(82)e-11 m` -> NIST CODATA.
  - H11.7 Orbital renders must show `|ψ_{nℓm}|^2` of the stated Hamiltonian, and say which basis (complex
    `m` or real orbitals) -> BRIEF "Not negotiable".
- **C12**
  - H12.1 vl17.tex calls the tensor product "the" Hilbert space of the composite; the reason (independent
    preparability, local tomography) should be stated as an extra postulate (BRIEF footnote to P1).
- **C13**
  - H13.1 Script defect vl18.tex: "ρ is allowed iff `U_π ρ U_π^† = ρ` for all π". Permutation-invariant
    states include mixtures of the bosonic and fermionic sectors and, for N ≥ 3, states on mixed-symmetry
    sectors. The symmetrisation postulate is an additional restriction to one sector -> vl18.tex Postulat 6;
    BR II [UNVERIFIED]; Leinaas-Myrheim 1977 [UNVERIFIED].
  - H13.2 Spin-statistics: a postulate in non-relativistic QM, a theorem in relativistic QFT; vl18.tex
    Postulat 6 must say so.
  - H13.3 Labelled "electron 1" observables that do not commute with all `U_π` are not observables.
- **C14** (all in AST, sha256 0e88fd13..., line numbers of advancedquantum.tex)
  - H14.1 Line 637 writes `[a^†(φ_1), a(φ_2)]_s = ⟨φ_1|φ_2⟩𝟙`; the preceding line
    gives `a(φ_1)a^†(φ_2) = ⟨φ_1|φ_2⟩𝟙 + s a^†(φ_2)a(φ_1)`, i.e. `[a(φ_1), a^†(φ_2)]_∓ = ⟨φ_1|φ_2⟩𝟙`.
  - H14.2 Line 844: field commutator written `[Ψ(x), Ψ(y)]_s = δ(x-y)`; must be `[Ψ(x), Ψ^†(y)]_∓ = δ(x-y)`.
  - H14.3 Line 870, interaction term ordering: `½∫Ψ^†(x)Ψ^†(y)V(x,y)Ψ(y)Ψ(x)` (normal ordered); AST writes
    `Ψ(x)Ψ(y)`, which flips the sign for fermions.
  - H14.4 Line 838: `\hat Ψ(f) = a(\bar f)`, not `a(f)` (antilinearity).
  - H14.5 Normal ordering is defined relative to a chosen vacuum (set of annihilators); `⟨Ω|:A:|Ω⟩ = 0`
    holds for that vacuum only.
  - H14.6 Truncating a bosonic mode to finitely many levels breaks the CCR (`tr[a,a^†] = 0`); the gentle
    track must say so when it uses matrices.
  - H14.7 Lines 395, 522 omit `|110⟩`; lines 725-726: `GL_n(F)` is not an algebra (`M_n(F)`), `C(K)` has
    the pointwise product, not composition; permutation convention opposite to vl18.tex.
- **C15**
  - H15.1 vl19.tex example 2 says the maximally mixed state "contains maximal information"; it carries
    maximal *missing* information.
  - H15.2 vl19.tex `k = 1.38064852e-23` is CODATA 2014; since the 2019 SI redefinition
    `k_B = 1.380649e-23 J/K` exactly.
  - H15.3 Unitary evolution conserves `S_vN`; entropy increase concerns coarse-grained or macroscopic
    entropy -> von Neumann 1929; arXiv:1003.2129.
- **C16**
  - H16.1 vl18.tex/vl20.tex suggest that superpositions make "counting" ill-defined; the microcanonical state
    `P_shell / tr P_shell` (spectral projector) is basis-independent. Max-ent is a justification, not a
    repair -> vl20.tex; Jaynes 1957.
  - H16.2 vl20.tex "every Hamiltonian is Hermitian and hence diagonalisable": requires discrete spectrum
    (confined systems); state the finite-volume assumption -> TES Ch. 3.
  - H16.3 vl21.tex differentiates the integer-valued `N_E`; needs a smoothed density of states or the
    thermodynamic limit. `1/T = (∂S/∂E)_{V,N}`. With bounded spectra `T < 0` is legitimate, and heat flows
    from smaller to larger β -> Callen; Ramsey 1956 [UNVERIFIED citation].
  - H16.4 The equal-a-priori hypothesis is an assumption; typicality results prove a weaker, precise
    statement -> Popescu-Short-Winter 2006; Goldstein et al. 2006.
  - H16.5 Boltzmann's H-theorem uses the Stosszahlansatz; it does not contradict reversibility
    (Loschmidt) only because of that assumption [Boltzmann 1872, UNVERIFIED citation details].
- **C17**
  - H17.1 Script defect vl22.tex line 25: `f(ρ) = -k tr ρ log ρ + β tr(ρH)` gives `ρ ∝ e^{+βH/k}`; the
    stated stationarity condition `log ρ + βH + log Z = 0` corresponds to `-k tr ρ log ρ - kβ tr(ρH) - kγ tr ρ`.
  - H17.2 `e^{-βH}` must be trace class (true for box, oscillator; false for hydrogen: infinitely many bound
    states accumulate at 0 and the continuum) -> TES §10.2 (essential spectrum `[0,∞)`).
- **C19**
  - H19.1 vl22.tex: "3rd law ... equivalent to a statement about entropy"; unattainability and Nernst's heat
    theorem are distinct, related statements -> Masanes-Oppenheim 2017. Glasses violate the vanishing of
    entropy as T -> 0 because they are not in equilibrium, not unattainability.
  - H19.2 vl22.tex 2nd law "bei adiabatischen Prozessen ΔS ≥ 0": needs "adiabatically accessible" in the
    Lieb-Yngvason sense and equilibrium end states -> Lieb-Yngvason 1999.
  - H19.3 Heat and work are process quantities (`đQ`); fix the sign convention `ΔU = Q + W` (work done on
    the system) as vl22.tex does.
- **C20**
  - H20.1 Carnot efficiency bounds engines working between two reservoirs; it is not a bound for engines with
    non-thermal (e.g. squeezed) reservoirs [UNVERIFIED source].
- **C21**
  - H21.1 Legendre transform requires convexity/concavity; at phase coexistence the potentials are not
    strictly convex -> Callen [UNVERIFIED chapter].

## 3. Source ledger

Key | authority for | local | acquisition | licence and storage
---|---|---|---|---
S01 Plavala, "General probabilistic theories: an introduction", arXiv:2103.07469 (v2, 23 Aug 2021); Phys. Rep. 1033, 1-64 (2023), doi:10.1016/j.physrep.2023.09.001 | C2 definitions, C12 GPT tensor products | v2 source on disk (`~/Downloads/arXiv-2103.07469v2.tar.gz`, sha256 67548d09...; unpacked in `plavala-src/`); Phys. Rep. version not on disk | arXiv; Phys. Rep. via TIB/LUH | arXiv non-exclusive distribution licence 1.0 (checked on the abs page): keep private, do not commit `plavala-src/` to a public repo; quote with attribution (§ 51 UrhG). Diff v2 against the Phys. Rep. version before citing theorem numbers
S02 Ludwig, Foundations of Quantum Mechanics I (1983), II (1985), Springer TMP, transl. C. A. Hein (ISBN 3540116834) | C0-C4 operational framing, dual pairs | not on disk | TIB; SpringerLink [LUH access UNVERIFIED] | copyright; quote only
S03 Busch, Lahti, Werner, PRL 111, 160405 (2013), arXiv:1306.1565 | C6 error-disturbance | not on disk | arXiv | arXiv licence; quote only
S04 Busch, Lahti, Werner, Rev. Mod. Phys. 86, 1261 (2014), doi:10.1103/RevModPhys.86.1261, arXiv:1312.4393 | C6 RMS error critique | not on disk | arXiv | as S03
S05 Busch, Lahti, Werner, "Measurement uncertainty relations", J. Math. Phys. (2014), arXiv:1312.4392 [volume UNVERIFIED] | C6 measurement vs preparation | not on disk | arXiv | as S03
S06 Werner, "The uncertainty relation for joint measurement of position and momentum", arXiv:quant-ph/0405184 [journal UNVERIFIED] | C6 joint measurement | not on disk | arXiv | as S03
S07 Werner, Farrelly, "Uncertainty from Heisenberg to today", arXiv:1904.06139, Found. Phys. doi:10.1007/s10701-019-00265-z | C6 history and concepts | not on disk | arXiv | as S03. Note: BRIEF's "Found. Phys. 2016" is the 2016 talk; publication is 2019
S08 Bargmann, J. Math. Phys. 5, 862-868 (1964) | C8 Wigner proof | not on disk | AIP via TIB; scan at ncatlab.org (not mirrored) | copyright
S09 Simon, Mukunda, Chaturvedi, Srinivasan, Phys. Lett. A 372, 6847 (2008), arXiv:0808.0779; correction with Hamhalter, Phys. Lett. A 378, 2332 (2014) | C8 elementary proofs | not on disk | arXiv | arXiv licence. The BRIEF's title "Quantum mechanics beyond Hilbert space" was not found; this is the elementary-proof paper
S10 Freed, "On Wigner's theorem", Geom. Topol. Monogr. 18, 83-89 (2012), arXiv:1112.2133 | C8 geometric proof | not on disk | arXiv / msp.org (open) | open access
S11 Cassinelli, De Vito, Lahti, Levrero, LNP 654 (2004), doi:10.1007/b99455 | C8 Wigner in state/effect form, symmetry actions | not on disk | SpringerLink / TIB | copyright
S12 Weinberg, The Quantum Theory of Fields I (CUP 1995) | C8 (AST proof source) | not on disk | TIB | copyright
S13 Teschl, Mathematical Methods in Quantum Mechanics, 2nd ed., AMS GSM 157 (2014); PDF https://www.mat.univie.ac.at/~gerald/ftp/book-schroe/schroe2.pdf | C3, C5, C6, C9, C10, C11 (verified: Thm 5.3 Stone, Thm 6.4 Kato-Rellich, Thm 8.2 uncertainty, §10.2-10.4 hydrogen, Thm 10.9, Thm 10.11) | scratch copy only (sha256 ee2cfd1c..., 2026-10-09) | author's site; AMS print | free PDF "for personal online use only" per AMS (search result): do not commit; register path + hash only
S14 Reed, Simon, Methods of Modern Mathematical Physics I (1972/1980), II (1975), Academic Press | C3, C5, C11 (Kato-Rellich as Thm X.12 per a secondary source) | not on disk | TIB | copyright
S15 Kato, Trans. AMS 70, 195-211 (1951), doi:10.1090/S0002-9947-1951-0041010-X | C11 self-adjointness | not on disk | AMS (old Trans. AMS volumes are free on ams.org [UNVERIFIED]) | copyright
S16 Simon, "Tosio Kato's work on non-relativistic quantum mechanics", arXiv:1710.06999 (Bull. Math. Sci., doi:10.1007/s13373-018-0118-0) | C11 history | not on disk | arXiv | arXiv licence
S17 Hall, Quantum Theory for Mathematicians, GTM 267, Springer 2013 | C5 (Ch. 13-14), C6 (Ch. 12), C10 (Ch. 16-17), C11 (Ch. 18), C12 (Ch. 19) | not on disk | SpringerLink [LUH access UNVERIFIED]; TIB | copyright
S18 Bratteli, Robinson, Operator Algebras and QSM 1 (2nd ed. 1987), 2 (2nd ed. 1997), Springer | C4 normal states, C14 Fock/CCR/CAR (vol. 2 §5.2), C17 KMS (vol. 2 §5.3) [subsections UNVERIFIED] | not on disk | SpringerLink / TIB | copyright
S19 TJO, Advanced Quantum Theory videos (2016), playlist PLDfPUNusx1Eo60qx3Od2KLUL4b7VDPo9F; Astwood notes github.com/mastwood/advancedquantum | C13, C14, C8, C22 | AST clone in scratch (sha256 0e88fd13...); videos not downloaded | YouTube (TJO's own); GitHub | AST repo has no LICENSE file: all rights reserved by Astwood; use as a pointer to the videos, rewrite in TJO's words, ask Astwood before quoting
S20 Gleason, J. Math. Mech. 6, 885-893 (1957), doi:10.1512/iumj.1957.6.56050; Busch, PRL 91, 120403 (2003), arXiv:quant-ph/9909073 | C4 | not on disk | arXiv / TIB | copyright / arXiv
S21 Naimark dilation: original 1940/1943 [UNVERIFIED]; textbook route Heinosaari-Ziman, The Mathematical Language of Quantum Theory, CUP 2012 [UNVERIFIED] (cited by PLA QT_v3.tex) | C4 | not on disk | TIB | copyright
S22 Jaynes, Phys. Rev. 106, 620-630 (1957); 108, 171-190 (1957) | C16 max-ent | not on disk | APS via TIB | copyright
S23 Popescu, Short, Winter, Nat. Phys. 2, 754 (2006), arXiv:quant-ph/0511225; Goldstein, Lebowitz, Tumulka, Zanghì, PRL 96, 050403 (2006), arXiv:cond-mat/0511091 | C16 typicality | not on disk | arXiv | arXiv licence
S24 von Neumann, Z. Phys. 57, 30-70 (1929); English transl. Tumulka, EPJ H, doi:10.1140/epjh/e2010-00008-5, arXiv:1003.2133; commentary arXiv:1003.2129 | C16 quantum H-theorem | not on disk | arXiv | arXiv licence; original German public domain status [UNVERIFIED]
S25 Boltzmann 1872, Wiener Berichte [UNVERIFIED volume/page] | C16 H-theorem | not on disk | Biodiversity Heritage Library / archive.org [UNVERIFIED] | public domain
S26 Lieb, Yngvason, Phys. Rep. 310, 1-96 (1999), arXiv:cond-mat/9708200; short version arXiv:math-ph/9805005 | C19 axiomatic second law | not on disk | arXiv | arXiv licence
S27 Callen, Thermodynamics and an Introduction to Thermostatistics, 2nd ed., Wiley 1985 [UNVERIFIED edition details] | C19-C21 | not on disk | TIB | copyright
S28 Carnot, Réflexions sur la puissance motrice du feu (1824) | C20 | not on disk | Gallica (BnF) [UNVERIFIED URL] | public domain
S29 Masanes, Oppenheim, Nat. Commun. 8, 14538 (2017), doi:10.1038/ncomms14538, arXiv:1412.3828 | C19 third law | not on disk | open access | CC licence [UNVERIFIED which]
S30 NIST CODATA 2022 (`a_0`, https://physics.nist.gov/cgi-bin/cuu/Value?bohrrada0); SI 2019 `k_B` exact | C11, C15 constants | web | NIST | public
S31 This repo: v0.2 script vl01-vl22 (commit 27234fd), transcripts/clean, archive/skript-2021, -2022 | all reused chapters | on disk | - | AGPL-3.0-or-later (LICENSE); `archive/third-party/` excluded
S32 Hammerer Theo C, handwritten student notes, 88 scanned pages (`archive/third-party/Script_TheoC_VorlesungProfHammerer_Feb2020.pdf`, sha256 c107fa1b...) | comparison only (page 80 shows microcanonical ideal gas) | on disk | - | third party, not redistributable
S33 Wilming, "Dynamics and entanglement in quantum many-body systems", LUH lecture notes (22 Apr 2026, 52 pp., `~/Downloads/many-body-notes-current-upload.4.pdf`, sha256 4dfef908...) | C16 typicality, C18 Lieb-Robinson | on disk | author (LUH colleague) | marked "do not distribute": read only, ask before quoting
S34 TJO, "Symmetries and quantum mechanics" (`../remarkable-stuff/raw/Teaching/Symmetries and quantum mechanics.rmdoc`) | C8-C10, TJO's own route | on disk, untranscribed | transcription via the `codex-vision` skill | TJO's own
S35 `~/Downloads/TheoretischePhysikC.pdf` (63 pp., created 2022-10-12, sha256 0f60c2f5...) | earlier script version | on disk | - | TJO's own

Not on disk under `~/Projects` or `~/Downloads` (filename search, 2026-10-09): S02-S12, S14-S30 except S13 (scratch).

## 4. Notation and definitions pre-inventory (summary)

Full tables: `notation-preinventory.md` (68 symbols, 52 definitions, environment names). The hard
collisions that block writing:

1. `F`: effect (vl06.tex Postulat 3) vs Helmholtz free energy (C21). `E` (BRIEF) collides with energy.
2. `U`: unitary `U_t` vs internal energy. `H`: Hamiltonian vs enthalpy vs Sobolev `H^2`.
3. `S`: entropy vs Plavala's simplex `S_n` vs symmetric group `S_N` vs spin `Ŝ`.
4. `Ω`: Fock vacuum vs the TPC macro `\Om` (microcanonical count). `Δ`: Laplacian vs standard deviation vs
   energy-shell width. `μ`: reduced mass vs chemical potential. `p`: momentum vs pressure vs probability.
   `V`: potential vs volume vs vector space. `K`: GPT state space vs complex conjugation.
5. Pairing order: Plavala `⟨state, effect⟩` vs `tr(ρF)` (same order, keep it) vs BR `ω(A)`.
6. Units and signs: SI with `ħ` (TPC) vs `ħ = 1, 2m = 1` (Teschl: `H = -Δ - γ/|x|`) vs `ħ = 1` (BR). Time
   evolution `e^{-itH/ħ}` (TPC, Teschl Thm 5.3); AST uses both signs. Fourier: TPC symmetric
   `(2π)^{-1/2}e^{-ikx}` = Teschl's convention; momentum space needs `(2πħ)^{-1/2}e^{-ipx/ħ}`.
7. Permutation operator: vl18.tex uses `π^{-1}` indices, AST the opposite. Commutator subscript: AST's
   `[·,·]_s` contradicts its own `[·,·]_±` labelling.
8. Laguerre (modern `L^{(2ℓ+1)}_{n-ℓ-1}` in vl16.tex) vs older physics conventions; Condon-Shortley phase.
9. German environment names: TPC uses "Theorem" in German; the German convention is "Satz". New environments
   needed: Postulat, Zoom, Warnung (hazard box), Effektive Theorie.

## 5. Lehramt accessibility

Assumed: linear algebra (vectors, matrices, eigenvalues), one- and multivariable calculus, complex
numbers, Theo A/B mechanics and electrodynamics. Not assumed: measure theory, functional analysis, group
theory beyond examples.

Ch. | gentle track may assume | device that keeps the gentle track true
---|---|---
C0-C1 | finite sets, sums, integrals of densities | finite sample spaces first; continuous case stated with densities and "probability of an interval" only
C2 | R^2, R^3 geometry, convex combinations | state the finite-dimensional axiom S5 explicitly in the gentle text ("in this book state spaces are finite-dimensional unless a zoom says otherwise"); three pictures (segment, disc/ball, square)
C3 | matrices | every statement carries "for C^n" or "for matrices"; L^2 appears in a boxed "what changes in infinite dimension" list, each item linking to a zoom
C4 | 2x2 and 3x3 matrices | postulates stated for `C^d`; zoom box "same postulates for B(H): trace class, normal states"; never say "positive functionals on B(H)" in the gentle track
C5 | Fourier integrals (formal) | position measured on intervals (as vl07.tex); `|x⟩` only under integrals; CCR stated "for smooth, rapidly decaying ψ"
C6 | variance | Robertson stated "for states where all terms are finite"; the measurement-uncertainty theorem stated without proof plus a picture
C7 | ODEs with constant coefficients | boundary conditions stated as physical modelling choices, with a zoom on self-adjoint extensions
C8 | rotations of R^3 | Wigner's theorem stated, proved for the qubit only (Bloch ball automorphisms are O(3)); general proof zoomed
C9 | matrix exponential | Stone's theorem stated as "for finite matrices this is the exponential; the general case is a theorem"; `e^{-iHt}` computed via eigenbasis
C10 | commutators, matrices | multiplets by ladder operators (algebra only); topology of SO(3) vs SU(2) as a picture (belt trick) with zoom
C11 | separation of variables, power series | `u(0)=0` stated as "the condition that selects the physical (self-adjoint) Hamiltonian", with the honest reason in the zoom; Laguerre polynomials given, checked by substitution
C12-C13 | Kronecker products of matrices | dimensions small (qubits); every abstract statement has a 4x4 or 8x8 instance
C14 | matrices, binomial coefficients | finite mode number; fermions via Jordan-Wigner on qubits; bosons truncated with an explicit warning that truncation breaks the CCR (H14.6)
C15-C17 | Lagrange multipliers, matrix log via eigenvalues | finite-dimensional Hilbert spaces (systems in a box); thermodynamic limit only in zooms
C18 | sums to integrals (density of states) | the replacement of sums by integrals presented as an approximation with a stated error picture
C19-C21 | partial derivatives, exact differentials | Legendre transform drawn as tangent construction; Lieb-Yngvason only as zoom

The common device: each gentle-track statement carries its hypothesis in the sentence ("for a finite-
dimensional system", "for states in the domain"), and a margin marker points to the zoom that removes it.
A statement is never simplified by dropping its hypothesis.

## 6. Scope

Estimated print pages (gentle / zoom), lecture slots (90 min) for the gentle track, existing material:

Ch. | gentle | zoom | slots | existing (words, de) | status
---|---|---|---|---|---
C0 | 6 | 2 | 0.5 | vl01 part (~1000) | reuse
C1 | 10 | 6 | 0.5 | vl01 part (~1300) | reuse
C2 | 14 | 16 | 1.5 | none | new
C3 | 16 | 14 | 2 | vl02-05 (~5600) | reuse, compress
C4 | 14 | 14 | 1.5 | vl06 (~2150) | reuse, re-frame
C5 | 14 | 12 | 1.5 | vl07, vl08 (~3700) | reuse
C6 | 10 | 12 | 1 | vl09 (~580) | expand
C7 | 24 | 10 | 3 | vl10-13 (~5000) | reuse
C8 | 10 | 14 | 1 | AST §Wigner (student notes) | new
C9 | 10 | 10 | 1 | vl06/vl08/vl10 parts | new framing
C10 | 16 | 14 | 2 | vl14, vl17 part (~1550) | expand
C11 | 18 | 18 | 1.5 | vl15, vl16 (~1200) | expand, fix
C12 | 10 | 8 | 1 | vl17 part (~700) | reuse
C13 | 10 | 8 | 1 | vl18 part (~1100) | reuse, fix
C14 | 16 | 16 | 1.5 | AST (~6000 words, student) | new text
C15 | 10 | 6 | 1 | vl18 part, vl19 (~1550) | reuse
C16 | 12 | 12 | 1 | vl20, vl21 (~1050) | expand
C17 | 12 | 12 | 1 | vl22 part (~700) | expand, fix
C18 | 12 | 8 | 1 | none | new
C19 | 12 | 12 | 1 | vl22 part (~200) | new
C20 | 10 | 6 | 1 | none | new
C21 | 12 | 6 | 1 | none | new
total | 278 | 236 | 27.5 | | 
C22 (opt.) | 0 | 20 | 0 | AST §Scattering | optional

Totals: about 514 pages plus about 30 pages of front/back matter, notation tables and index, about 545
pages. The 84-page v0.2 script maps onto C0, C1, C3-C7, C10-C13, C15-C17 and covers roughly a quarter of
their gentle-track pages (at one figure per page and the added examples, its 22 lectures expand to about
170 gentle pages).

The 27.5 slots exceed the 25 recorded lectures (README.md). Candidates to move to "zoom only" for the
lecture: C18 (1 slot), half of C3 (assume Theo A/B linear algebra), half of C7 (finite well). That gives
about 25 slots.

What TJO must supply himself (no source on disk can substitute):
1. His deviations from Ludwig-Werner (BRIEF item 3 says he "deviates in several ways"; none are written down).
2. The infinite-dimensional "Archimedean order unit space" formulation he wants (PLA stops at finite dimension).
3. The "extras" beyond Bratteli-Robinson in the Fock-space course (only Astwood's student notes and the
   2016 videos exist; the notes have the errors listed in H14).
4. The route of his "Symmetries and quantum mechanics" notes (reMarkable, untranscribed).
5. Chapters C19-C21 (thermo, Carnot, potentials): no TJO script exists; the transcripts end at v25
   (canonical ensemble).
6. Which "B. Simon" treatment of hydrogen he means (Open question 3).

## Recommendations

1. **Fix the five verified script defects before any new writing** (H11.1, H15.2, H17.1, H3.1, H11.6), in
   both editions. Trade-off: touches v0.2 now; but every later chapter reuses these lines, and the parity
   checker will carry the fix across.
2. **Make Teschl (S13) the ground-truth text for C3, C5, C6, C9, C10, C11**, because it is free, local,
   verified to contain every rigorous claim this plan needs for the Coulomb problem (Kato-Rellich domain,
   l = 0 boundary condition, factorisation), and uses the same Fourier and time-evolution sign conventions
   as the script. Trade-off: units `ħ = 1, 2m = 1` need a translation table; its licence forbids committing
   the PDF.
3. **Ground C2 and C4 on Plavala for the finite-dimensional gentle track, and state axiom S5 openly.**
   Trade-off: the infinite-dimensional story (BRIEF P2, Archimedean OUS) then needs a second source (Ludwig
   or Bratteli-Robinson) acquired from TIB; until then C4's zoom cannot be ground-truthed.
4. **Resolve the notation collisions in section 4 (F, U, H, S, Ω, Δ, μ, p, V, K) in one decision session
   before writing C2.** Trade-off: some choices will depart from textbook habit (e.g. `A` for Helmholtz
   energy per IUPAC, or a different effect symbol).
5. **Rewrite the Fock-space chapter from TJO's 2016 videos and Bratteli-Robinson, using the Astwood notes
   only as a map.** Trade-off: more work than editing AST; but AST has at least six substantive errors
   (H14.1-H14.7) and no licence.
6. **Acquire from TIB, in this order:** Bratteli-Robinson 1-2, Hall GTM 267, Reed-Simon I-II, Ludwig I,
   Callen, Lieb-Yngvason (arXiv), BLW (arXiv), Bargmann 1964. Register each with a hash before any chapter
   cites it (rk provenance rule). Trade-off: library time; without it about 20 claims in this report stay
   [UNVERIFIED].
7. **Transcribe the reMarkable "Symmetries and quantum mechanics" notes** with the `codex-vision` skill
   before writing C8-C10, so TJO's own route, not Weinberg's, structures Part II.
8. **Keep scattering (C22) out of the semester and in the book only as an appendix zoom.** Trade-off: the
   advanced-course material on scattering then has no gentle version.

## Open questions for TJO

1. Is the finite-dimensional GPT (Plavala S5) enough for the gentle track, with infinite dimension only
   in zooms? If not, which source for infinite-dimensional Archimedean order unit spaces do you want
   (Ludwig, Alfsen-Shultz, your own)?
2. P2 as written ("positive linear functionals on B(H) with norm 1") includes singular states. Do you want
   normal states (density operators) as the definition, with singular states as a zoom remark?
3. Which hydrogen treatment is "after B. Simon": Reed-Simon II (Kato-Rellich), Simon's own papers, or a
   Teschl-style partial-wave analysis? Do you want the SO(4)/Runge-Lenz derivation of the spectrum in the
   rigorous track?
4. Scattering: appendix zoom, full chapter, or omitted?
5. Grand canonical ensemble and quantum gases (C17 second half, C18): in the semester, or book only?
6. Thermodynamics axiomatics: Callen-style postulates or Lieb-Yngvason adiabatic accessibility as the
   rigorous zoom of C19?
7. Which of your deviations from Ludwig-Werner must appear explicitly, and where?
8. Notation decisions: effect symbol (`F` or `E`), Helmholtz energy symbol (`F` or `A`), operator hats in
   the rigorous track, German "Satz" vs "Theorem", `k_B` vs `k`, `ln` vs `log`.
9. May Astwood's notes and Wilming's notes be quoted, or only used as pointers?
10. Is the "fundamental hypothesis" presented as equal a priori probabilities (Postulat) with max-ent and
    typicality as justifications, or is max-ent the postulate (as vl20.tex currently suggests)?

---

## Correction note, 2026-10-11

Added by the Phase 0 coordinator from the codex review (`../review/REVIEW.md`, sections B and G;
path relative to `docs/plan/research/`). The text above is left as written, as evidence of the
campaign; where it conflicts with this note, the note governs.

- Lines 12, 527: the enumerated reuse set has 14 chapters, not 13.
- Lines 262-263 (and notation-preinventory.md:113): the vl04 defect is a scope/domain omission; vl04.tex:62 defines Hermitian by A^dagger = A, so the sentence is not a false equation.
- Lines 351-352: the quoted identity is a corrected form, not what the Astwood notes print (:637-640); the notes also have a swapped-argument defect at :630-632.
- Lines 357-358: a normal-ordered vacuum expectation vanishes only for polynomials without a scalar term.
- Line 155: independent preparability does not force the quantum tensor product. Lines 236-238: convexity or concavity of potentials is variable by variable (Helmholtz free energy is concave in T). Line 487: a particle in a box is not finite-dimensional without truncation.
- Lines 269-272: say that B(H) is not the full Banach bidual of B(H)^*, rather than that the state/effect pairing fails.
- Lines 413, 415: attributions to BRIEF.md of a 2016 publication date and a title are not in the brief.
