<!-- ROLE: seed for the blessed notation and definitions databases (curriculum lane, 2026-10-09).
     NOT blessed. Every row is a proposal plus the conflicts found. TJO decides. -->

# Notation and definitions pre-inventory

Sources compared (keys as in REPORT.md section 3):
`TPC` = this repo, `latex/tpc-macros.sty` and `latex/lectures/de/vl01-vl22.tex` at commit 8bfab65;
`PLA` = Plavala arXiv:2103.07469v2 source (`plavala-src/`, macros in `plavala-src/mplmacros.sty`);
`AST` = Astwood notes `advancedquantum.tex` (sha256 0e88fd13...);
`TES` = Teschl, GSM 157, 2nd ed. (local scratch copy, sha256 ee2cfd1c...);
`BR`, `RS`, `HAL`, `BLW` = Bratteli-Robinson, Reed-Simon, Hall, Busch-Lahti-Werner (not on disk:
their entries are marked [UNVERIFIED] until a local copy is registered).

## A. Symbols (68 rows)

"Proposal" is a starting point only. "!!" marks a hard collision that must be resolved before any
chapter is written.

| # | symbol (proposal) | meaning | conflicts and source usage |
|---|---|---|---|
| 1 | `\mathcal H` | Hilbert space | TPC `\Hil`; PLA `\Ha`; AST uses `H` (one particle) and `\Hh` (many particles) |
| 2 | `⟨φ\|ψ⟩` | inner product, antilinear in the first slot | TPC, PLA (stated in QT_v3.tex), TES agree; RS, BR, HAL slot convention [UNVERIFIED] |
| 3 | `B(\mathcal H)` | bounded operators | PLA uses `\bound_H` for the *self-adjoint* operators and `\lin` for all; TPC macro `\Lop` = "bounded operators / Liouvillian" (two meanings in one macro) !! |
| 4 | `B(\mathcal H)_{sa}` | real space of bounded self-adjoint operators (the order unit space of QT) | PLA `\bound_H(\Ha)` |
| 5 | `T(\mathcal H)` | trace-class operators (the base norm space of QT) | RS/TES notation for trace class [UNVERIFIED symbol] |
| 6 | `\mathcal D(\mathcal H)` | density operators | PLA `\dens`; collides with `D(A)` (domain) and `\mathcal S(\mathbb R^n)` (Schwartz) if `\mathcal S(\mathcal H)` is chosen instead !! |
| 7 | `\mathcal E(\mathcal H)` | effect operators `0 ≤ F ≤ 𝟙` | PLA `\effect` |
| 8 | `K` | GPT state space (compact convex) | PLA; collides with `K` = complex conjugation in Wigner proofs !! |
| 9 | `E(K)`, `A(K)`, `A(K)^+`, `A(K)^{*+}` | effect algebra, affine functions, positive cone, dual cone | PLA basic_v3.tex |
| 10 | `1_K` / `u` | unit effect / order unit | PLA `1_K`; order unit `u` in PLA basic_v3.tex |
| 11 | `⟨ρ, F⟩` | state-effect pairing, state first | PLA `\<x,f\>`; TPC `tr(ρF)`; BR `ω(A)` [UNVERIFIED] |
| 12 | `F`, `F_x`, `F(S)` | effect; POVM elements; POVM on outcome set `S` | TPC Postulat 3 uses `F`; BRIEF writes `E`; PLA `f`; BLW sans-serif `\mathsf{E}`,`\mathsf{Q}`,`\mathsf{P}` [UNVERIFIED]; `F` collides with Helmholtz free energy, `E` with energy !! |
| 13 | `\mathcal C(K_A,K_B)` | channels | PLA `\chan`; collides with `C(X)` continuous functions |
| 14 | `Δ_n` | classical simplex, `n` outcomes | PLA `S_n`; collides with entropy `S`, symmetric group `S_N`, spin `\hat S` !! |
| 15 | `ext K`, `conv`, `cone` | extreme points, hulls | PLA |
| 16 | `⊗_{min}`, `⊗_{max}` | minimal/maximal GPT tensor products | PLA `\tmin` = dotted ⊗, `\tmax` = hat ⊗, `\treal` = tilde ⊗ |
| 17 | `ρ` | density operator (preparation) | PLA `x` (GPT state), `ρ` (QT); BR `ω` for algebraic states |
| 18 | `ω` | algebraic state on `B(\mathcal H)` or a C*-algebra | BR; collides with angular frequency `ω` (oscillator) |
| 19 | `𝟙` | identity operator | TPC `\mathbb I`; PLA `\mathds 1` (macro `\I`) |
| 20 | `tr` | trace | TPC `\tr`; PLA `\Tr` |
| 21 | `A^\dagger` | adjoint | TES, RS, BR use `A^*` |
| 22 | `\hat A` | operator hat | TPC Merksatz in vl04.tex; PLA, TES, BR, AST no hats. Decide whether hats survive into the rigorous track |
| 23 | `\hbar` | reduced Planck constant | TPC SI units; TES `\hbar=1, 2m=1` (`H=-Δ-γ/\|x\|`, TES §10.2); BR `\hbar=1` |
| 24 | `U_t = e^{-itH/\hbar}` | Schrödinger-picture evolution | TPC vl06.tex; TES Thm 5.3 `U(t)=\exp(-itA)`; AST uses both `e^{-itH}` and `e^{itH}` |
| 25 | `A_t = U_t^\dagger A U_t` | Heisenberg picture | TPC vl06.tex; BR `τ_t(A)=e^{itH}Ae^{-itH}` [UNVERIFIED] (same sign) |
| 26 | `\hat f(k)=(2π)^{-1/2}\int f(x)e^{-ikx}dx` | Fourier transform | TPC vl08.tex; TES §7.1 `(2π)^{-n/2}` with `e^{-ipx}`; momentum wave function needs `(2π\hbar)^{-1/2}` with `e^{-ipx/\hbar}` |
| 27 | `\hat x`, `\hat p` (gentle) / `Q`, `P` (rigorous) | position, momentum | HAL `X`,`P`; BLW `Q`,`P`; TES `x`,`p` |
| 28 | `[A,B]`, `\{A,B\}` | commutator, anticommutator | AST `[\cdot,\cdot]_s` with `s=±1`, and states `[\cdot,\cdot]_+` = anticommutator although `s=+1` labels bosons !! |
| 29 | `\hat L_j`, `\hat{\mathbf L}^2`, `\hat L_\pm` | orbital angular momentum | TPC vl14.tex |
| 30 | `\hat S_j`, `\hat J_j` | spin, general angular momentum | TPC vl17.tex reuses `ℓ` for spin `1/2`; propose `s` for spin, `j` for general |
| 31 | `ℓ, m` | angular quantum numbers | TES writes `l` |
| 32 | `Y_ℓ^m` | spherical harmonics with Condon-Shortley `(-1)^m` | TPC vl14.tex includes `(-1)^m`; must be propagated to hydrogen `ψ_{21±1}` (vl16.tex line 94 drops it) |
| 33 | `L_n^{(α)}` | generalised Laguerre, modern convention | TPC vl16.tex uses `L^{2ℓ+1}_{n-ℓ-1}` (modern); older physics texts use `L^{2ℓ+1}_{n+ℓ}` [UNVERIFIED which texts] |
| 34 | `a_0`, `\mathrm{Ry}` | Bohr radius, Rydberg energy | value: CODATA 2022 `5.29177210544(82)e-11 m` (NIST); TPC vl16.tex has the CODATA 2018 value |
| 35 | `m_{red}` | reduced mass | TPC vl16.tex `μ`; collides with chemical potential `μ` !! |
| 36 | `Z` | nuclear charge number | collides with partition function `Z`/`\mathcal Z` |
| 37 | `\mathcal Z` | canonical partition function | TPC defines both `\Zst` and `\Zc` as `\mathcal Z` |
| 38 | `Ξ` | grand canonical partition function | none yet |
| 39 | `U_π` | permutation operator | TPC vl18.tex: `U_π(φ_1⊗…) = φ_{π^{-1}(1)}⊗…`; AST: `U(σ)\|x_1..x_N⟩ = \|x_{σ(1)}..⟩` (opposite convention) !! |
| 40 | `P_±` | (anti)symmetriser | TPC, AST agree |
| 41 | `\mathcal H_±^{\otimes N}` | N-boson/fermion space | AST `\mathcal H_s^N`, `Γ_{s,N}`; BR `P_±\mathcal F` [UNVERIFIED] |
| 42 | `\mathcal F_±(\mathcal H)` or `Γ_±(\mathcal H)` | Fock space | AST `Γ_s`; BR `\mathcal F_±` [UNVERIFIED] |
| 43 | `Ω` | Fock vacuum | TPC macro `\Om` = microcanonical state count !! ; TPC vl20.tex uses `N_E` for the count |
| 44 | `a(f)`, `a^\dagger(f)` | annihilation (antilinear in `f`), creation (linear in `f`) | AST, BR agree on linearity [BR UNVERIFIED] |
| 45 | `a_μ`, `\hat n_μ`, `\hat N = dΓ(𝟙)` | mode operators, number operators | AST |
| 46 | `Γ(A)`, `dΓ(H)` | second-quantisation functor and its derivation | AST, BR [UNVERIFIED] |
| 47 | `\hat Ψ(x)`, `\hat Ψ(f)` | field operator, smeared field | AST writes `\hatΨ(f)=a(f)`; with `\hatΨ(x)=\sum_μ φ_μ(x)a_μ` the correct identity is `\hatΨ(f)=a(\bar f)` |
| 48 | `:A:` | normal ordering relative to a named vacuum | not in TPC |
| 49 | `S_{vN}(ρ)=-tr ρ\ln ρ` | von Neumann entropy, dimensionless | TPC vl19.tex `S(ρ)=-k tr ρ log ρ` (with `k`) |
| 50 | `S = k_B S_{vN}` | thermodynamic entropy | collides with simplex `S_n` (PLA) and spin `S` |
| 51 | `k_B` | Boltzmann constant, exact `1.380649e-23 J/K` (SI 2019) | TPC vl19.tex: `k`, value `1.38064852e-23` (CODATA 2014); macro `\kB` exists unused |
| 52 | `\ln` vs `\log` | natural logarithm | TPC writes `log` and states it is natural; quantum information uses `\log_2` |
| 53 | `β=1/(k_B T)` | inverse temperature | TPC vl22.tex |
| 54 | `T` | temperature | collides with time-reversal `T`/`Θ`, trace class `T(\mathcal H)`, kinetic energy |
| 55 | `U` | internal energy | collides with unitary `U_t` !! |
| 56 | `F` (or IUPAC `A`) | Helmholtz free energy | collides with effect `F` !! |
| 57 | `G`, `H_{enth}` | Gibbs energy, enthalpy | enthalpy `H` collides with Hamiltonian `H` !! |
| 58 | `μ`, `N`, `V`, `p` | chemical potential, particle number, volume, pressure | `V` collides with potential `V(r)` and PLA vector space `V`; `p` with momentum and probability !! |
| 59 | `Q`, `W`, `đQ` | heat, work (on the system), inexact differential | TPC vl22.tex `ΔU = Q + W`; sign convention must be stated once |
| 60 | `η`, `η_C` | efficiency, Carnot efficiency | none yet |
| 61 | `σ_x, σ_y, σ_z` | Pauli matrices | AST superscripts `σ^x`; AST `σ^+ = [[0,0],[1,0]]`, i.e. `\|1⟩⟨0\|` in the basis where `σ^z\|0⟩=\|0⟩` (opposite to many QI texts) |
| 62 | `σ(A)` | spectrum | collides with Pauli `σ` |
| 63 | `D(A)` | operator domain | collides with `\mathcal D(\mathcal H)` |
| 64 | `L^2(\mathbb R^n)`, `H^2(\mathbb R^3)`, `C_c^\infty`, `\mathcal S(\mathbb R^n)` | function spaces | `H^2` Sobolev collides with `H` Hamiltonian; TES §10.2 uses `H^2(\mathbb R^3)` as the hydrogen domain |
| 65 | `Δ` | Laplacian | TPC `\lap`; collides with `Δx` (standard deviation) and `Δ` (energy-shell width, vl20.tex) !! |
| 66 | `\mathbb E`, `\mathbb P`, `\mathrm{var}` | expectation, probability, variance | TPC vl01.tex |
| 67 | `τ_t`, `ω_β` | time automorphisms, KMS state | BR [UNVERIFIED] |
| 68 | `Θ` | antiunitary time reversal | none yet |

## B. Definitions to fix (52 candidates, numbering provisional, never renumber once blessed)

Each must name every choice inside the definition (rule from `../arithmetic-quantum-mechanics/definitions.md`).

| # | term (EN / DE) | authority to ground-truth against | note |
|---|---|---|---|
| 1 | preparation procedure / Präparationsverfahren | Ludwig I; PLA what_v4.tex | equivalence classes of procedures |
| 2 | yes-no test, effect / Ja-Nein-Test, Effekt | PLA what_v4.tex, basic_v3.tex Def. of `E(K)` | |
| 3 | state space (GPT) / Zustandsraum | PLA Def. S1-S5 (finite-dimensional, S5) | S5 must be named as a restriction |
| 4 | mixture, pure state, face | PLA basic_v3.tex | |
| 5 | effect algebra (abstract and linear) | PLA basic_v3.tex (Foulis-Bennett) | |
| 6 | order unit space; Archimedean | PLA basic_v3.tex (order unit); Archimedean property not defined in PLA | BRIEF insists on "Archimedean"; PLA never uses the word (grep, 0 hits) |
| 7 | base norm, order unit norm | PLA basic_v3.tex/QT_v3.tex (trace norm, operator norm) | |
| 8 | channel / Kanal | PLA channels_v3.tex Def. | affine map between state spaces |
| 9 | measurement (n outcomes) / Messung | PLA Prop. channels-measurements-effects | equals a POVM |
| 10 | instrument / Instrument | PLA channels_v3.tex | |
| 11 | classical theory / klassische Theorie | PLA CT_v3.tex | simplex |
| 12 | no-restriction hypothesis | PLA QT_v3.tex (mentioned) | |
| 13 | GPT tensor product (min, max) | PLA tensor_v3.tex | |
| 14 | Hilbert space / Hilbertraum | TPC vl03.tex Def.; RS I | completeness stated, not omitted |
| 15 | bounded operator, operator norm | RS I | |
| 16 | densely defined operator, domain | RS I/II, TES | |
| 17 | adjoint (bounded and unbounded) | TES, RS | |
| 18 | symmetric (= Hermitian) operator / symmetrischer (hermitescher) Operator | TES, HAL Ch. 9 | NOT a synonym of self-adjoint (TPC vl04.tex line 70 says it is) |
| 19 | self-adjoint, essentially self-adjoint | TES §2, RS | |
| 20 | positive operator, `A ≤ B` | TPC vl06.tex, PLA | |
| 21 | trace class, trace | RS I, TES §6.3 | |
| 22 | density operator / Dichteoperator | TPC vl06.tex Postulat 2; PLA | |
| 23 | normal state vs. state on `B(\mathcal H)` | BR I [UNVERIFIED section] | needed for BRIEF P2 |
| 24 | POVM, PVM / POVM, projektorwertiges Maß | TPC vl06.tex; Heinosaari-Ziman | |
| 25 | sharp observable, self-adjoint operator correspondence | spectral theorem (TES Ch. 3) | |
| 26 | Born rule `p = tr(ρF)` | TPC Postulat 4 | |
| 27 | Wigner symmetry (ray form), Kadison symmetry (state form), effect automorphism | Bargmann 1964; Cassinelli et al. LNP 654 | three definitions, one theorem |
| 28 | projective unitary representation | Bargmann 1964; HAL Ch. 16 | |
| 29 | strongly continuous one-parameter unitary group, generator | TES Thm 5.3 | |
| 30 | Hamiltonian (as generator) | TES §5.1 | sign convention fixed here |
| 31 | preparation uncertainty (variance) | TES Thm 8.2 (domain `D(AB)∩D(BA)`) | |
| 32 | measurement error, joint measurement | BLW RMP 2014, PRL 2013 | |
| 33 | representation of a Lie algebra; angular momentum operators | HAL Ch. 16-17; TES §8.2 | |
| 34 | irreducible representation; spin `j` | HAL Ch. 17 | |
| 35 | tensor product of Hilbert spaces and operators | TPC vl17.tex | |
| 36 | entangled / separable state | PLA tensor_v3.tex; TPC vl17.tex | |
| 37 | permutation operator `U_π` | TPC vl18.tex | convention conflict with AST, row 39 above |
| 38 | (anti)symmetric subspace | TPC vl18.tex; AST | |
| 39 | Fock space, vacuum | BR II §5.2 [UNVERIFIED subsection]; AST | |
| 40 | creation / annihilation operator | BR II §5.2; AST | `\sqrt N` factor convention |
| 41 | CCR / CAR (and Weyl form) | BR II; HAL Ch. 14 | |
| 42 | normal ordering | BR II [UNVERIFIED] | relative to a vacuum |
| 43 | `Γ(A)`, `dΓ(H)` | AST; BR II | |
| 44 | von Neumann entropy | TPC vl19.tex | dimensionless or with `k_B` |
| 45 | microcanonical state | TPC vl20.tex | spectral projector of `H` on the shell |
| 46 | Gibbs (canonical) state; partition function | TPC vl22.tex | requires `e^{-βH}` trace class |
| 47 | grand canonical state on Fock space | BR II [UNVERIFIED] | |
| 48 | KMS state | BR II §5.3 [UNVERIFIED] | rigorous track only |
| 49 | temperature (microcanonical, canonical, thermodynamic) | TPC vl21.tex, vl22.tex; Lieb-Yngvason §5 [UNVERIFIED section] | three definitions to reconcile |
| 50 | adiabatic accessibility, simple system | Lieb-Yngvason Phys. Rep. 310 | |
| 51 | heat, work, cycle, efficiency | Callen; Carnot 1824 | |
| 52 | thermodynamic potential (Legendre transform) | Callen Ch. 5 [UNVERIFIED chapter] | |

## C. Theorem-environment names (DE / EN)

Current TPC (`latex/tpc-style.sty` lines 164-178): Theorem/Theorem, Lemma/Lemma, Proposition/Proposition,
Korollar/Corollary, Definition/Definition, Beispiel/Example, Übung/Exercise, Lösung/Solution,
Bemerkung/Remark, Notiz/Note, Notation/Notation, Physikalische Anschauung/Physical intuition,
Vermutung/Conjecture, Prototyp-Definition/Prototype definition; plus tcolorboxes merksatz, greybox,
intuition, historical; "Postulat" is typeset by hand in a banana-coloured box, not an environment.

Open choices: German mathematical convention is "Satz" for theorem; TPC uses "Theorem". Needed new
environments: Postulat/Postulate (numbered P0-P6, matching BRIEF), Beweis/Proof (exists via amsthm),
Zoom/Zoom-in (rigorous-track box), Warnung/Pitfall (for the hazard list), Effektive Theorie/Effective
theory (one per chapter).

---

## Correction note, 2026-10-11

Added by the Phase 0 coordinator from the codex review (`../review/REVIEW.md`, sections B and G;
path relative to `docs/plan/research/`). The text above is left as written, as evidence of the
campaign; where it conflicts with this note, the note governs.

- Line 113: see the vl04 correction in curriculum/REPORT.md's note: scope omission, not a false equation.
