<!-- ROLE: the full per-concept catalogue of demo, game and video ideas for the
     Theoretische Physik C upgrade. Companion to REPORT.md in the same directory.
     Authored by the DEMOS-GAMES-VIDEO planning lane, 2026-10-09.
     UPDATE POLICY: planning artefact; superseded by whatever plan TJO blesses. -->

# Ideas catalogue: demos, games, videos

33 concepts along the path of `docs/plan/BRIEF.md`, each with at least one
animated interactive demo (D), one game (G) and one video (V). 105 ideas in
total. Idea ids are `Cnn-Dk`, `Cnn-Gk`, `Cnn-Vk`.

## Legend

- **Track**: `L` = Lehramt (zoomed-out path), `R` = rigorous track, `L+R` = both.
- **Effort** (agent-driven build, including the correctness tests and the
  German/English strings, *excluding* the shared engine it sits on; engine
  costs are in REPORT.md section 5):
  `S` = 0.5-2 days, `M` = 2-5 days, `L` = 5-12 days.
- **Engine**: `E1`..`E12`, defined in REPORT.md section 5. An idea is cheap
  once its engine exists.
- **Exact quantity**: the number that must come from a closed form or a
  verified solver, never from an eyeballed approximation. Where an idea
  necessarily uses a numerical method, the method and its error bound are
  named.
- **Test**: the golden value or invariant an automated test checks, and the
  reference it is checked against. The pattern is the one already used in
  `../generalrelativity/docs/demos/*.mjs` + `*.test.mjs` (physics kernel as a
  pure ES module, `node --test`-style assertions, no DOM).
- Games carry **Goal / rules / score**, **Why winning needs the physics**,
  and **Inspirations** (keys resolve in the table at the end of this file).
- Videos carry a **Storyboard** of 3-6 beats with the camera path, and
  **3D data**: what is rendered and where it comes from.
- Lecture numbers `vlNN` refer to `latex/lectures/de/vlNN.tex`.

## Concept index

| Id  | Concept | Lecture | Ideas |
|-----|---------|---------|-------|
| C01 | Probability: preparations, measurements, frequencies | vl01 | D1 G1 V1 |
| C02 | GPT state spaces and effects | new (Plavala) | D1 G1 V1 |
| C03 | Hilbert-space toolkit: spectra, functional calculus | vl02-05 | D1 G1 V1 |
| C04 | Postulates P1-P5 | vl06 | D1 G1 V1 |
| C05 | Born rule | vl06 | D1 G1 V1 |
| C06 | Preparation uncertainty | vl09 | D1 G1 V1 |
| C07 | Measurement uncertainty (joint measurability, error-disturbance) | new (Werner) | D1 G1 V1 |
| C08 | Qubit | vl06, vl17 | D1 G1 V1 |
| C09 | Particle on a line; Schroedinger equation | vl07-08 | D1 G1 V1 |
| C10 | Fourier transform and momentum space | vl08 | D1 G1 V1 |
| C11 | Spreading of the wavepacket | vl10 | D1 G1 V1 |
| C12 | Particle in a box | vl11 | D1 G1 V1 |
| C13 | Harmonic oscillator | vl12 | D1 G1 V1 |
| C14 | Finite well and tunnelling | vl13 | D1 G1 V1 |
| C15 | Symmetries and Wigner's theorem | new (Symmetries notes) | D1 G1 V1 |
| C16 | Dynamics as a one-parameter group | new + vl06 | D1 G1 V1 |
| C17 | Rotations: SO(3) and SU(2) | new | D1 G1 V1 |
| C18 | Angular momentum and spherical harmonics | vl14 | D1 G1 V1 |
| C19 | Spin and Stern-Gerlach | vl17 | D1 G1 V1 |
| C20 | Central potential | vl15 | D1 G1 V1 |
| C21 | Hydrogen I: exact orbital clouds | vl16 | D1-D5 G1 V1 |
| C22 | Hydrogen II: spectrum and dynamics | vl16 | D1 D2 G1 V1 |
| C23 | Hydrogen III: the rigorous Hamiltonian | new (Simon / Teschl) | D1 D2 G1 V1 |
| C24 | Tensor product, composite systems, entanglement | vl17 | D1 G1 V1 |
| C25 | Identical particles | vl18 | D1 G1 V1 |
| C26 | Fock space, creation/annihilation, CCR/CAR | new (advanced QM) | D1 G1 V1 |
| C27 | Entropy | vl19 | D1 G1 V1 |
| C28 | Microcanonical ensemble | vl20 | D1 G1 V1 |
| C29 | Temperature | vl21 | D1 G1 V1 |
| C30 | Canonical ensemble | vl22 | D1 G1 V1 |
| C31 | Thermodynamics and the effective-theory ladder | vl22 + new | D1 G1 V1 |
| C32 | Heat engines and Carnot | new | D1 G1 V1 |
| C33 | Thermodynamic potentials | new | D1 G1 V1 |

---

## C01 Probability: preparations, measurements, frequencies (vl01)

### C01-D1 Preparation-measurement table (demo)
- **Pitch**: a theory is a table p(k | preparation, measurement); watch the table fill from clicks.
- **Learner manipulates**: picks a preparation device (biased coin, die, a polariser source at angle) and a measurement (a partition or coarse-graining of outcomes, or a fuzzy response function f: Omega -> [0,1]); runs N = 1..10^5 trials; mixes two preparations with weight lambda.
- **Physics / exact quantity**: classical state mu on finite Omega (a point of the simplex), effect f with 0 <= f <= 1, p = sum_omega mu(omega) f(omega). p is computed in exact rational arithmetic; mixing is affine: p(lambda mu1 + (1-lambda) mu2) = lambda p(mu1) + (1-lambda) p(mu2). Frequencies come from a seeded PRNG.
- **Test**: (i) p exact for 20 rational cases; (ii) affinity identity to 0 ulp in rationals; (iii) for fixed seeds, |freq - p| <= sqrt(ln(2/delta)/(2N)) (Hoeffding) in at least (1-delta) of 1000 seeded runs, delta = 0.01.
- **Tech**: SVG histograms + 2D canvas. **Effort**: S (1-2 d). **Track**: L+R. **Engine**: E2, E12.

### C01-G1 Calibrate (game)
- **Pitch**: forecast the next click; a strictly proper scoring rule pays only for the true probability.
- **Goal / rules / score**: each round shows a hidden preparation (coin, die, polariser at unknown angle) and a short sample of past outcomes. The player states a probability vector q for the next outcome; the outcome is drawn from the true p; score += ln q(outcome) (logarithmic score). 50 rounds per level; an "oracle" who knows p is shown as a ghost score. Win: finish within 2 nats of the oracle.
- **Why winning needs the physics**: the expected log score sum_k p_k ln q_k is maximised uniquely at q = p (Gibbs' inequality), so the only winning strategy is to infer the probabilities the preparation defines, updating from frequencies. Over-confidence (q_k = 0 for an outcome that occurs) costs -infinity; the game clips at -10 and says why.
- **Exact quantity**: expected score and its maximum, closed form.
- **Test**: expected score maximised at q = p on a 10^4-point grid of the simplex for 3 outcomes; seeded replay determinism.
- **Tech**: SVG + canvas. **Effort**: S (1-2 d). **Track**: L. **Engine**: E12.
- **Inspirations**: [CT], [ST], [NC].

### C01-V1 What a theory hands you (video)
- **Storyboard**: (1) slow dolly along a lab bench: source, filter box, detector; clicks as flashes. (2) Each click drops a token; 3D histogram bars grow; camera rises to look down on them. (3) Pull back: the bars become one row of a 3D table over (preparation x effect); more rows fill. (4) Mixing slider: the table row moves linearly; cut to the probability simplex (triangle) in 3D with the state as a point sliding along a segment. (5) Vertices light up: deterministic preparations are the extreme points; caption "deterministic is a special case of probabilistic".
- **3D data**: bar heights from the seeded simulation of C01-D1; simplex geometry exact.
- **Tech**: offline three.js render (E11). **Effort**: M (2-3 d). **Track**: L.

---

## C02 GPT state spaces and effects (new; Plavala arXiv:2103.07469)

### C02-D1 A state space and its dual (demo)
- **Pitch**: drag a state, drag an effect, read off the probability; change the shape of the theory.
- **Learner manipulates**: chooses the state space K: triangle (classical trit), square (gbit / boxworld), regular n-gon (n = 3..12, the polygon models of [JGBB]), disc, Bloch ball (qubit). Drags a state omega in K and an effect e (shown as a level line or plane of an affine functional); toggles the cone view (K at height 1 in R^3, its cone A+, the dual cone A*+, the order unit u).
- **Physics / exact quantity**: effects E(K) = { e affine : 0 <= e(omega) <= 1 for all omega in K }; for a polytope this is the intersection of 2 x (number of vertices) half-spaces, computed by exact vertex enumeration in rational arithmetic (n-gon vertices use cos/sin of 2 pi k/n in double precision with a stated 1e-14 tolerance). p = e(omega).
- **Test**: every vertex of E(K) evaluates into [0,1] on every vertex of K; vertex count and coordinates agree with an independent Julia reference (an LP per facet with JuMP + HiGHS, both present in `~/.julia/packages` on 2026-10-09) for n = 3..12; the disc's cone is self-dual (inner product test on 10^4 random samples).
- **Tech**: SVG for 2D, three.js for cones. **Effort**: M (3-4 d). **Track**: R (L sees triangle vs disc only). **Engine**: E2.

### C02-G1 Distinguish (game)
- **Pitch**: two preparations, one click: build the measurement that tells them apart best, in five different theories.
- **Goal / rules / score**: a level gives states omega_1, omega_2 with priors pi_1, pi_2 in a theory K. The player constructs a two-outcome measurement {e, u - e} by dragging e inside E(K). Score = success probability P = pi_1 e(omega_1) + pi_2 (1 - e(omega_2)). One star for P >= P_opt - 0.02, three stars for P >= P_opt - 1e-3. Later levels: three states, three outcomes.
- **Why winning needs the physics**: the optimum sits on an extreme point of the effect space, which the player only finds by understanding the dual cone; the same pair of "orthogonal-looking" states is perfectly distinguishable in the square theory but not in the pentagon or the disc.
- **Exact quantity**: P_opt by linear programming over the vertices of E(K); for the qubit the Helstrom value P_opt = (1 + || pi_1 rho_1 - pi_2 rho_2 ||_1)/2.
- **Test**: LP optimum vs Helstrom closed form for the disc/ball levels (1e-12); in-browser LP vs Julia JuMP + HiGHS for polygon levels; every level verified solvable.
- **Tech**: SVG + three.js. **Effort**: M (3-5 d). **Track**: L+R. **Engine**: E2, E12.
- **Inspirations**: [EU], [HQ], [QG].

### C02-V1 Zoom in: from a triangle to a cone (video)
- **Storyboard**: (1) the classical-trit triangle floats at height 1 in R^3; camera orbits. (2) Rays from the origin sweep out the positive cone; the order unit appears as the plane that cuts the triangle back out. (3) The dual cone grows in a second colour; effects shown as the slab between 0 and u. (4) The base is replaced, step by step, by the square, pentagon, hexagon, ..., 12-gon, disc; each step is an exact polytope, crossfaded (the crossfade is labelled as a transition, not a physical family). (5) For the disc the cone and its dual coincide: self-duality. (6) Cut to the Bloch ball as the base of the cone of positive 2x2 matrices (a 3D slice of the 4D cone).
- **3D data**: exact cones and dual cones from E2.
- **Tech**: offline three.js (E11). **Effort**: M (3 d). **Track**: R.

---

## C03 Hilbert-space toolkit: spectra, diagonalisation, functional calculus (vl02-05)

### C03-D1 Spectral theorem at work (demo)
- **Pitch**: a Hermitian matrix is a set of axes and numbers; f(A) acts on the numbers.
- **Learner manipulates**: entries of a real-symmetric or Hermitian 2x2/3x3 matrix; the class (Hermitian, unitary, projector); a function f from a menu (exp(-i t .), sqrt, step, log).
- **Physics / exact quantity**: A = sum_k lambda_k P_k; f(A) = sum_k f(lambda_k) P_k. 2x2 closed form; 3x3 by the trigonometric closed form for the cubic (Smith 1961 [UNVERIFIED ref]) cross-checked by Jacobi rotations; spectra plotted in the complex plane (real axis, unit circle, {0,1}) as in the VL4 figure plan.
- **Test**: residual ||A V - V Lambda|| < 1e-12; f(A) via spectral sum vs Pade exp (for f = exp) vs Julia `exp` to 1e-12; projector idempotency.
- **Tech**: SVG + three.js ellipsoid. **Effort**: S (2 d). **Track**: L. **Engine**: E1.

### C03-G1 Three polarisers (game)
- **Pitch**: inserting a filter can let more light through; prove it with projectors.
- **Goal / rules / score**: transport a state from direction a to direction b (orthogonal in the first levels) through a chain of at most N projectors the player places at chosen angles. Score = surviving squared norm. Levels: real plane, then C^2 with complex phases, then the qubit Bloch sphere.
- **Why winning needs the physics**: projectors do not commute; the transmitted weight is prod_k cos^2(theta_k); the optimum for a 90 degree turn with N filters is cos^{2N}(pi/(2N)) (equal steps), which tends to 1. Players who think "more filters block more" lose.
- **Exact quantity**: transmitted weight, closed form; optimum closed form.
- **Test**: optimum vs numerical maximisation over angles for N = 1..10; score monotone in N.
- **Tech**: SVG. **Effort**: S (1-2 d). **Track**: L. **Engine**: E1, E12.
- **Inspirations**: [QG], [EU], [HQ].

### C03-V1 Functional calculus in four moves (video)
- **Storyboard**: (1) a 3x3 real-symmetric matrix shown as an ellipsoid (quadratic form), camera orbits. (2) The frame rotates into the eigenbasis (camera follows the rotation V). (3) Eigenvalues as bars along the axes. (4) f is applied to the bars (exp, square root, step function): the ellipsoid deforms axis by axis. (5) Rotate back: f(A).
- **3D data**: exact eigen-decomposition (E1).
- **Tech**: Manim or offline three.js (E11). **Effort**: S (1-2 d). **Track**: L.

---

## C04 The postulates P1-P5 (vl06)

### C04-D1 Postulate machine (demo)
- **Pitch**: a pipeline H -> rho -> E -> tr(rho E) -> U(t), which refuses illegal input and says which postulate it violates.
- **Learner manipulates**: P1 picks H = C^2 or C^3. P2 sets rho (Bloch vector for C^2; eigenvalues + eigenbasis for C^3). P3 sets an effect E. P4 reads tr(rho E). P5 switches on H and t.
- **Physics / exact quantity**: qubit effect E = a I + b.sigma is legal iff |b| <= a <= 1 - |b| (the "double cone"); tr(rho E) = a + b.r for rho = (I + r.sigma)/2. For C^3, positivity via eigenvalues (closed-form cubic, E1).
- **Test**: double-cone criterion equals the eigenvalue criterion on 10^5 random (a, b); 0 <= tr(rho E) <= 1 on all legal samples; an illegal sample always yields a stated violation.
- **Tech**: three.js (Bloch ball + effect double cone) + SVG. **Effort**: M (2-3 d). **Track**: L+R. **Engine**: E1.

### C04-G1 Postulate court (game)
- **Pitch**: a stranger proposes a "theory"; find the experiment that convicts it.
- **Goal / rules / score**: each level presents a candidate theory as a set of allowed states and detectors (matrices, or a shape). The player wins by submitting a counterexample: a state/effect pair with probability outside [0,1], a measurement whose effects do not sum to I, or a pair of legal states whose mixture the theory forbids. Some theories are legal; the player must then "acquit" and is scored on not crying wolf. Stars for the smallest counterexample (fewest matrix entries).
- **Why winning needs the physics**: counterexamples exist exactly when P2/P3 (positivity, normalisation, duality, convexity) fail; finding them requires knowing why each axiom is there.
- **Exact quantity**: probabilities in rational arithmetic for the hand-made levels.
- **Test**: every guilty level has a verified counterexample; every acquitted level is verified legal by exhaustive vertex checks (E2).
- **Tech**: SVG + MathJax/KaTeX matrices. **Effort**: M (3 d). **Track**: L+R. **Engine**: E1, E2, E12.
- **Inspirations**: [BABA], [EU], [SC].

### C04-V1 One probability, five postulates (video)
- **Storyboard**: (1) a Hilbert space as a labelled stage (P1). (2) The Bloch ball fills with states; extreme points glow (P2). (3) The effect double cone appears beside it; one effect is picked (P3). (4) A light-ray from state to effect lands on a ruler: tr(rho E) (P4). (5) A Hamiltonian rotates the ball; the ruler reading oscillates (P5). (6) Teaser: two balls side by side, joined by a tensor sign.
- **3D data**: exact Bloch geometry and rotations (E1, E5).
- **Tech**: offline three.js. **Effort**: M (2-3 d). **Track**: L+R.

---

## C05 Born rule (vl06)

### C05-D1 Clicks from tr(rho E) (demo)
- **Pitch**: probabilities become frequencies one click at a time.
- **Learner manipulates**: qubit state rho; a POVM from a menu (projective, trine, tetrahedral SIC) or a custom one; runs single shots or batches.
- **Physics / exact quantity**: p_k = tr(rho E_k), sum_k E_k = I; outcomes sampled by inverse CDF from p.
- **Test**: sum E_k = I to 1e-15; chi-square goodness of fit at fixed seeds; SIC: tr(E_j E_k) = 1/12 for j != k for the qubit SIC with E_k = (I + n_k.sigma)/4 and n_j.n_k = -1/3 (closed form check).
- **Tech**: three.js + SVG. **Effort**: S (1-2 d). **Track**: L. **Engine**: E1.

### C05-G1 Tomography race (game)
- **Pitch**: an unknown qubit, a budget of 300 shots; reconstruct it.
- **Goal / rules / score**: a hidden state (pure or mixed) is prepared on demand. The player buys shots of measurements along any axis (cost 1 shot each), sees the clicks, and submits an estimate s. Score = fidelity F(rho, sigma) = (1 + r.s + sqrt((1-|r|^2)(1-|s|^2)))/2 (qubit closed form). Win: F >= 0.98 at the given budget; leaderboard per budget.
- **Why winning needs the physics**: the Born rule gives only (1 + r.n)/2 per axis; three mutually orthogonal axes are needed; mixed states hide the length |r|; the variance (1 - (r.n)^2)/N_shots tells where to spend shots.
- **Exact quantity**: the fidelity formula; the statistical model of the clicks.
- **Test**: closed-form fidelity vs Uhlmann fidelity (tr sqrt(sqrt rho sigma sqrt rho))^2 computed in Julia, 10^4 random pairs, 1e-12; estimator unbiasedness at fixed seeds.
- **Tech**: three.js + SVG. **Effort**: M (2-3 d). **Track**: L+R. **Engine**: E1, E12.
- **Inspirations**: [QG], [QUIRK], [HQ].

### C05-V1 The Born rule is a projection (video)
- **Storyboard**: (1) Bloch ball, state arrow. (2) An effect |n><n| appears as an axis. (3) The arrow projects onto the axis; a ruler reads (1 + r.n)/2. (4) Clicks rain into two detectors in that ratio. (5) The axis sweeps a great circle; the curve cos^2(theta/2) is traced in 3D beside the ball.
- **3D data**: exact geometry; click counts from seeded sampling.
- **Tech**: offline three.js. **Effort**: S (1-2 d). **Track**: L.

---

## C06 Preparation uncertainty (vl09)

### C06-D1 Where states live in the (Delta x, Delta p) plane (demo)
- **Pitch**: every preparation is a point; the hyperbola Delta x Delta p = hbar/2 is a wall nobody crosses.
- **Learner manipulates**: a state from a family (Gaussian of width s, squeezed vacuum, displaced/coherent, HO eigenstates |n>, box eigenstates, two-Gaussian "cat", box-shaped psi) or a superposition of the first 12 HO eigenstates (sliders).
- **Physics / exact quantity**: Delta x and Delta p from ladder algebra (x = l (a + a^dag)/sqrt 2, p = i hbar (a^dag - a)/(sqrt 2 l)) as finite sums for HO-basis states; closed forms for Gaussians; the Robertson-Schroedinger bound with covariance shown as a second curve.
- **Test**: Gaussians and squeezed states saturate Delta x Delta p = hbar/2 to 1e-14; |n> gives (n + 1/2) hbar; box ground state gives (hbar/2) sqrt(pi^2/3 - 2) ~ 0.568 hbar (closed form from <x^2> and <p^2> of phi_1) [derivation to be checked against vl09/vl11].
- **Tech**: SVG + 2D canvas. **Effort**: S (2 d). **Track**: L+R. **Engine**: E3, E6.

### C06-G1 Uncertainty golf (game)
- **Pitch**: reach a target box in the (Delta x, Delta p) plane; some holes are behind the wall.
- **Goal / rules / score**: build a state from up to 8 HO components (amplitudes and phases) or from Gaussian primitives to land inside a target rectangle in the (Delta x, Delta p) plane in as few edits as possible. Some targets lie below the hyperbola: the correct move is "declare impossible", which scores only if the player cites the bound. Par for each hole is computed offline.
- **Why winning needs the physics**: the player must know which states saturate the bound (Gaussians), how squeezing trades Delta x against Delta p, and that no superposition can beat hbar/2.
- **Exact quantity**: Delta x, Delta p by finite sums (exact up to double rounding).
- **Test**: par solutions verified; impossible holes verified below the bound.
- **Tech**: SVG. **Effort**: M (2-3 d). **Track**: L. **Engine**: E3, E12.
- **Inspirations**: [EU], [OM], [HQ].

### C06-V1 Preparation uncertainty is about many runs (video)
- **Storyboard**: (1) one source, many identical runs; a switch sends half the runs to an x-detector and half to a p-detector (two separate experiments, rendered as two benches). (2) Two histograms grow. (3) Their widths multiply; the product never goes below hbar/2. (4) Cut to phase space: the Wigner function of the Gaussian as a 3D surface; its marginals cast as shadows onto the x- and p-walls. (5) Same for a cat state: the surface dips negative between the lobes (labelled "quasi-probability"), yet the shadows are honest probability densities. (6) Caption: no joint measurement was made.
- **3D data**: closed-form Wigner functions of Gaussian and cat states.
- **Tech**: offline three.js. **Effort**: M (3 d). **Track**: L+R.

---

## C07 Measurement uncertainty: joint measurability, error-disturbance (new; Werner school)

### C07-D1 When can two unsharp spins be measured together? (demo)
- **Pitch**: make sigma_x and sigma_z fuzzy enough and a single device measures both.
- **Learner manipulates**: sharpness lambda_x, lambda_z in [0,1] of the unsharp POVMs E^x_pm = (I pm lambda_x sigma_x)/2 and E^z_pm = (I pm lambda_z sigma_z)/2; (rigorous mode) the angle between the two axes.
- **Physics / exact quantity**: for orthogonal axes the pair is jointly measurable iff lambda_x^2 + lambda_z^2 <= 1 ([HMZ] eq. (33), crediting Busch 1986). Inside the disc the demo shows the explicit joint POVM G_ab = (I + a lambda_x sigma_x + b lambda_z sigma_z)/4, a, b = pm 1, whose marginals are the two unsharp observables; outside it shows the negative eigenvalue (1 - sqrt(lambda_x^2 + lambda_z^2))/4 < 0.
- **Test**: eigenvalues of G_ab equal (1 pm sqrt(lambda_x^2+lambda_z^2))/4 exactly; marginals reproduce E^x, E^z; an SDP feasibility check in Julia (JuMP or Convex.jl with SCS, all present in `~/.julia/packages` on 2026-10-09) agrees with the disc criterion on 10^3 random points; non-orthogonal axes are checked only numerically by the SDP until the general criterion is ground-truthed against Busch 1986.
- **Tech**: SVG + three.js. **Effort**: M (2-3 d). **Track**: R (L sees the disc picture). **Engine**: E1.

### C07-G1 Error-disturbance duel (game)
- **Pitch**: build one device that measures position and momentum of whatever comes in; the referee picks the worst-case states.
- **Goal / rules / score**: the player designs a covariant phase-space measurement by choosing a probe (Gaussian of tunable squeezing, or one of a few non-Gaussian shapes). The device's x- and p-marginals are the ideal distributions smeared by fixed kernels (one from the probe's position density, one from its momentum density). The referee runs a test suite of incoming states and reports state-independent errors (worst case over the suite). Each level weights the two errors differently (e.g. "position matters 4x as much"); score = weighted error; win below the level threshold.
- **Why winning needs the physics**: the product of the two kernel widths is bounded below by hbar/2 (the probe obeys preparation uncertainty), so the optimum is a probe squeezed in the ratio set by the weights; Gaussian probes are optimal for the RMS figure of merit; the game makes the device-centred (not state-centred) error notion of [BLW13] concrete.
- **Exact quantity**: marginals as convolutions computed on a grid by FFT (E3) with stated error < 1e-10; for Gaussian probe and Gaussian inputs, closed forms. The precise statement that marginals are convolutions with the probe's (reflected) densities must be ground-truthed against [BLW14] before build.
- **Test**: closed-form Gaussian case vs FFT convolution; weighted optimum vs analytic squeezing ratio.
- **Tech**: SVG + canvas. **Effort**: L (5-7 d). **Track**: R. **Engine**: E3, E12.
- **Inspirations**: [OM], [QG], [EU].

### C07-V1 Two uncertainty principles; never confuse them (video)
- **Storyboard**: (1) split screen. Left: preparation uncertainty, two separate benches (as C06-V1). Right: measurement uncertainty, one device with two pointers. (2) Left: two histograms from two experiments. Right: one joint histogram over the (x, p) pointer plane. (3) Right: the joint histogram is the state's phase-space picture blurred by the probe's kernel; the blur ellipse has area at least the hbar/2 bound. (4) Morph the probe squeezing: the blur ellipse turns, one marginal sharpens, the other widens. (5) Qubit coda: the lambda_x^2 + lambda_z^2 <= 1 disc of C07-D1 drawn in 3D as a cylinder slice.
- **3D data**: closed-form Gaussian phase-space densities and blur kernels.
- **Tech**: offline three.js. **Effort**: M (3-4 d). **Track**: L+R.

---

## C08 Qubit (vl06, vl17)

### C08-D1 Bloch ball, done right (demo)
- **Pitch**: states fill the ball; unitaries are rotations; gates move along their actual one-parameter path.
- **Learner manipulates**: Bloch vector r (|r| <= 1, mixed states inside); a Hamiltonian H = (hbar omega/2) n.sigma (axis n, frequency); gates X, Y, Z, H, S, T; time t.
- **Physics / exact quantity**: r(t) = R(n, omega t) r(0) (Rodrigues); a gate U = exp(-i theta n.sigma/2) is animated along s -> R(n, s theta) r, s in [0,1]. Not by interpolating (theta, phi): the author's earlier Bloch page linearly interpolates the polar angles (`quantumcomputing/docs/bloch-sphere.html` lines 569-600), which draws non-physical paths, e.g. a Hadamard on |0> travels along the x-z meridian, whereas the rotation about (x+z)/sqrt 2 bulges out to |y| = 1/sqrt 2 at mid-path. The SU(2) sign after a 2 pi rotation is shown in a corner counter.
- **Test**: r(t) vs Bloch vector of exp(-iHt) rho exp(iHt) (2x2 matrix exponential) to 1e-14; |r| conserved; midpoint of the H path equals (1/2, 1/sqrt 2, 1/2) up to the sign of y set by the rotation sense; U(2 pi) = -I.
- **Tech**: three.js. **Effort**: S-M (2 d). **Track**: L. **Engine**: E1, E5.

### C08-G1 Qubit golf (game)
- **Pitch**: reach the target state in the fewest strokes.
- **Goal / rules / score**: from a start state reach a target state (fidelity >= 0.999) using a gate set given per hole (pi/2 rotations about x and z; then H and T; then continuous rotations with cost = total angle). Par from an offline search.
- **Why winning needs the physics**: gates are rotations; order matters; global phase is invisible (so many "different" targets are the same hole); for continuous rotations the cheapest single rotation from r to s is about the axis r x s by the angle between them.
- **Exact quantity**: par by breadth-first search over gate words up to length 12 (discrete sets) and by the closed-form geodesic (continuous).
- **Test**: every hole solvable; par reproduced by the BFS; fidelity formula as in C05-G1.
- **Tech**: three.js. **Effort**: M (2-3 d). **Track**: L. **Engine**: E1, E5, E12.
- **Inspirations**: [HQ], [QO], [EU].

### C08-V1 Larmor precession and dephasing (video)
- **Storyboard**: (1) magnetic field arrow, Bloch vector tilted from it; camera orbits slowly. (2) Exact precession about the field. (3) Switch on dephasing: the vector spirals inward (Bloch equations with T2, closed-form solution), labelled as an open-system model, not as P5 dynamics. (4) A cloud of 200 spins with spread Larmor frequencies fans out (inhomogeneous dephasing), then a pi-pulse refocuses them (spin echo) at t = 2 tau.
- **3D data**: closed-form rotations; echo from exact per-spin rotations.
- **Tech**: offline three.js. **Effort**: M (2-3 d). **Track**: L+R.

---

## C09 Particle on a line; the Schroedinger equation (vl07-08)

### C09-D1 Probability on the line (demo)
- **Pitch**: paint psi, pick an interval, read P(x in S); press play.
- **Learner manipulates**: draws amplitude and phase of psi(x) (auto-normalised); chooses an interval S; chooses V (free, step, harmonic, box) and runs time.
- **Physics / exact quantity**: P(S) = int_S |psi|^2; dynamics by split-operator FFT (E3), which is unitary to machine precision; complex psi shown by domain colouring (hue = arg psi via a perceptually uniform cyclic map [KOV]).
- **Test**: Gaussian interval probabilities vs erf closed form (1e-12); norm conservation over 10^4 steps (1e-12); free Gaussian vs analytic psi(x,t) (1e-9 at the default grid).
- **Tech**: 2D canvas / WebGL. **Effort**: S (2 d). **Track**: L. **Engine**: E3.

### C09-G1 Catch the particle (game)
- **Pitch**: you have a detector window and five tries; a miss is information too.
- **Goal / rules / score**: a wavepacket evolves in a potential. At any moment the player places a detector window of fixed width and fires. A click wins the round; a non-click updates the state (Lueders rule: psi -> (1 - chi_S) psi / norm) and play continues. Score = rounds won in 10 levels with 5 tries each.
- **Why winning needs the physics**: P(click) = int_S |psi(x,t)|^2, so the window belongs where the density peaks; after a miss the state has a hole and evolves differently (negative-result measurement), which changes the best next move.
- **Exact quantity**: interval probability by quadrature on the solver grid; the post-measurement state.
- **Test**: post-miss state normalised and zero on S; expected-score computation vs Monte Carlo of 10^5 seeded games.
- **Tech**: canvas. **Effort**: M (2-3 d). **Track**: L. **Engine**: E3, E12.
- **Inspirations**: [QG], [SCH] (Wavepackets.html), [NC].

### C09-V1 Phase is not decoration (video)
- **Storyboard**: (1) a moving Gaussian drawn as a 3D corkscrew: (x, Re psi, Im psi). (2) Camera swings to look down the x axis: the circle of phase. (3) Swing to side: the envelope |psi| and its shadow |psi|^2 on the floor. (4) Increase the momentum: the corkscrew winds tighter; the shadow moves faster. (5) Two packets superpose: the corkscrews interfere; the shadow shows fringes.
- **3D data**: analytic free Gaussian psi(x,t).
- **Tech**: offline three.js. **Effort**: S (1-2 d). **Track**: L.

---

## C10 Fourier transform and momentum space (vl08)

### C10-D1 Hear the transform (demo)
- **Pitch**: a short sound has a wide spectrum; so does a narrow wavepacket.
- **Learner manipulates**: width, carrier momentum, chirp, and shape (Gaussian, box, two packets) of psi(x); plays the sound.
- **Physics / exact quantity**: psi~(p) = (2 pi hbar)^{-1/2} int psi(x) e^{-ipx/hbar} dx by FFT on a grid sized so that the Gaussian tail beyond the grid is < 1e-15; box -> sinc analytic. WebAudio plays the envelope |psi| as a time envelope on an audible carrier; the spectrum analyser shows the matching spread (the mapping x -> t, p -> frequency is stated on screen as an analogy).
- **Test**: Gaussian <-> Gaussian (1e-12); Parseval; box <-> sinc; shift <-> phase ramp.
- **Tech**: canvas + WebAudio. **Effort**: S (2 d). **Track**: L. **Engine**: E3 (FFT), E4.

### C10-G1 Spectrum sculptor (game)
- **Pitch**: given a momentum distribution, build the wavefunction that has it.
- **Goal / rules / score**: target |psi~(p)|^2 (and in hard mode the full complex psi~). The player places Gaussian wavelets (position, width, momentum, phase). Score = overlap |<target|psi>|^2. Levels teach: a shift in x is a phase ramp in p; narrow in x is wide in p; two separated packets give fringes in p whose spacing is 2 pi hbar / separation.
- **Why winning needs the physics**: Fourier duality; the |psi~|^2-only levels are degenerate (many psi), the full-psi~ levels force the phases right.
- **Exact quantity**: overlaps of Gaussian sums in closed form (no grid).
- **Test**: closed-form overlaps vs FFT numerics (1e-12).
- **Tech**: canvas. **Effort**: M (2-3 d). **Track**: L. **Engine**: E3, E12.
- **Inspirations**: [JZ], [EU], [OM].

### C10-V1 The Fourier transform is a quarter turn (video)
- **Storyboard**: (1) Gaussian packet off-centre; its Wigner function as a 3D surface over (x, p). (2) The surface rotates rigidly about the origin by angle alpha; marginals as shadows on the x- and p-walls. (3) At alpha = pi/2 the x-shadow is the momentum density: the Fourier transform. (4) Caption: rotation in phase space is harmonic-oscillator evolution for a quarter period (fractional Fourier transform), a forward link to C13. (5) Repeat with a cat state.
- **3D data**: closed-form Wigner functions, exact rotation.
- **Tech**: offline three.js. **Effort**: M (2-3 d). **Track**: L+R.

---

## C11 Spreading of the wavepacket (vl10)

### C11-D1 Quantum packet vs classical swarm (demo)
- **Pitch**: the spreading is classical: a swarm of classical particles with the same x and p distributions spreads identically.
- **Learner manipulates**: initial width sigma_0, mass (electron, C60, dust grain), time (log slider), number of classical particles.
- **Physics / exact quantity**: sigma(t) = sigma_0 sqrt(1 + (hbar t/(2 m sigma_0^2))^2). For a free particle and a Gaussian state the Wigner function is positive and evolves by classical free flight, so the classical swarm's position histogram converges to |psi(x,t)|^2 exactly; this is the vl10 claim "spreading is a classical effect".
- **Test**: sigma(t) vs split-operator numerics (1e-10); swarm sample variance vs sigma(t)^2 (statistical, seeded, 4 sigma bound); timescale tau = 2 m sigma_0^2/hbar reproduces the vl10 orders of magnitude (electron ~1e-16 s, 1 microgram dust ~1e13 s).
- **Tech**: canvas. **Effort**: S (1-2 d). **Track**: L+R. **Engine**: E3.

### C11-G1 Sniper (game)
- **Pitch**: hit a detector at distance d at time T; a sharper packet is not a better shot.
- **Goal / rules / score**: choose sigma_0 and launch momentum p_0; score = P(x(T) in window) computed exactly. Levels change mass, distance, time, window width.
- **Why winning needs the physics**: sigma(T)^2 = sigma_0^2 + (hbar T/(2 m sigma_0))^2 is minimised at sigma_0* = sqrt(hbar T/(2m)), giving sigma(T)_min = sqrt(hbar T/m); players who squeeze sigma_0 lose.
- **Exact quantity**: window probability via erf; optimum in closed form.
- **Test**: numeric maximisation agrees with the closed form (1e-9).
- **Tech**: canvas. **Effort**: S (1-2 d). **Track**: L. **Engine**: E3, E12.
- **Inspirations**: [KSP], [EU], [QM2].

### C11-V1 Electron and dust grain (video)
- **Storyboard**: (1) two 3D Gaussian clouds, one labelled electron, one dust grain, same initial width scale shown by a ruler. (2) A logarithmic clock runs from 1e-18 s to 1e15 s; the electron cloud blooms at ~1e-16 s. (3) The dust cloud waits until ~1e13 s. (4) Overlay of a classical swarm on the electron cloud: identical. (5) Caption from vl10's grey box: why real particles nevertheless stay localised (decoherence; stated, not simulated).
- **3D data**: isotropic 3D Gaussian (product of the 1D formula), sampled points.
- **Tech**: offline three.js. **Effort**: S (1-2 d). **Track**: L.

---

## C12 Particle in a box (vl11)

### C12-D1 Superpositions, carpets, revivals (demo)
- **Pitch**: mix eigenstates; watch the quantum carpet weave and the state come back.
- **Learner manipulates**: coefficients c_n (n <= 20, amplitude and phase bars); time; view switch: |psi(x,t)|^2 animation or the (x, t) carpet image.
- **Physics / exact quantity**: phi_n(x) = sqrt(2/L) sin(n pi x/L), E_n = n^2 E_1, psi(x,t) = sum c_n phi_n e^{-i E_n t/hbar} (exact finite sum, as in fig_vl11_kasten.tex). Revival time T_rev = 2 pi hbar/E_1 = 4 m L^2/(pi hbar).
- **Test**: psi(x, T_rev) = psi(x, 0) to 1e-12; psi(x, T_rev/2) = -psi(L - x, 0) (mirror revival, from phi_n(L-x) = (-1)^{n+1} phi_n(x)); orthonormality by Gauss-Legendre quadrature.
- **Tech**: WebGL texture for the carpet + canvas. **Effort**: S (2 d). **Track**: L+R. **Engine**: E3.

### C12-G1 Fractional revival (game)
- **Pitch**: arrange the phases so that the particle is where you want it, when you want it.
- **Goal / rules / score**: target: P(particle in region R at time t*) >= threshold, using at most k eigenstates. Later levels: be in the left third at T_rev/3 and in the right third at 2 T_rev/3. Score by probability achieved and number of modes used.
- **Why winning needs the physics**: phases advance as n^2; at rational fractions of T_rev the state is a finite sum of shifted copies (fractional revivals, Talbot effect); the player must use the spectrum, not trial and error.
- **Exact quantity**: P(R, t) in closed form (integrals of products of sines).
- **Test**: closed-form P vs quadrature; each level solvable (offline optimiser).
- **Tech**: canvas. **Effort**: M (3 d). **Track**: L+R. **Engine**: E3, E12.
- **Inspirations**: [EU], [OM], [QM2].

### C12-V1 The quantum carpet in 3D (video)
- **Storyboard**: (1) |psi(x,t)|^2 of an initially localised packet as a height field over (x, t), camera low along the t axis. (2) Rise to show the carpet's diagonal channels. (3) Mark T_rev/2 (mirror image) and T_rev (full revival) with planes. (4) Overhead view: the Talbot-like pattern.
- **3D data**: exact sum of 60 modes on a 1024 x 2048 grid; the truncation error of the initial packet at 60 modes reported in the video description.
- **Tech**: offline three.js. **Effort**: S (2 d). **Track**: L.

---

## C13 Harmonic oscillator (vl12)

### C13-D1 Ladder and phase space (demo)
- **Pitch**: a and a^dagger are buttons; the Wigner function turns like a clock hand.
- **Learner manipulates**: a superposition of |0>..|20>; buttons a, a^dagger, displacement alpha, squeezing r; time.
- **Physics / exact quantity**: a|n> = sqrt n |n-1>, a^dagger|n> = sqrt(n+1)|n+1>; Hermite functions by the stable three-term recurrence; Wigner functions of |n>: W_n = ((-1)^n/(pi hbar)) e^{-2H/(hbar omega)} L_n(4H/(hbar omega)) with H the classical energy; time evolution is rigid rotation of W at angular frequency omega (exact for the HO).
- **Test**: Hermite functions orthonormal (Gauss-Hermite quadrature, 1e-13); on the truncated space [a, a^dagger] = 1 - (N+1)|N><N| exactly (the demo displays the truncation honestly); coherent-state <x>(t) = sqrt 2 l Re(alpha e^{-i omega t}).
- **Tech**: canvas + three.js surface. **Effort**: M (2-3 d). **Track**: L+R. **Engine**: E3, E6.

### C13-G1 Shake the trap (game)
- **Pitch**: move the trap to carry the atom from A to B and leave it at rest in the ground state.
- **Goal / rules / score**: the player drags the trap centre x_c(t) over a fixed time window T (or draws the trajectory). Score = final fidelity with the ground state at B. Win: F >= 0.99; three stars for >= 0.9999.
- **Why winning needs the physics**: for a moving harmonic trap the ground state stays a coherent state whose centre obeys the classical driven oscillator equation; the final fidelity is exactly F = exp(-|alpha_f|^2) with alpha_f = ((x - x_B)/l + i p l/hbar)/sqrt 2 the leftover classical oscillation. Winning means cancelling the sloshing: integer-period moves, bang-bang profiles. Unlike Quantum Moves (whose Nature paper's quantitative results were retracted, see [QM2]) this level family is exactly solvable, so the score cannot be a numerical artefact.
- **Exact quantity**: alpha_f from the classical solution (closed form for piecewise-linear x_c); F = exp(-|alpha_f|^2).
- **Test**: closed form vs split-operator simulation of the full Schroedinger equation for 100 random trap paths (fidelity agreement 1e-8).
- **Tech**: canvas. **Effort**: M (3 d). **Track**: L+R. **Engine**: E3, E12.
- **Inspirations**: [QM2], [KSP], [OM].

### C13-V1 Coherent, squeezed, Fock, cat (video)
- **Storyboard**: (1) the coherent state's Wigner surface circling the origin. (2) A squeezed state: the ellipse rotates, its x-shadow breathes at 2 omega. (3) Fock state |3>: rings with negative dips (shown in a second colour, labelled quasi-probability). (4) A cat state: two lobes plus the interference ridge. (5) All four together, one HO period.
- **3D data**: closed-form Wigner functions (Laguerre for Fock, Gaussian for coherent and squeezed, sum formula for cat).
- **Tech**: offline three.js. **Effort**: M (3 d). **Track**: L+R.

---

## C14 Finite well and tunnelling (vl13)

### C14-D1 The graphical solution, live (demo)
- **Pitch**: deepen the well and watch bound states appear at the right moments.
- **Learner manipulates**: V_0 and L.
- **Physics / exact quantity**: in vl13's variables u = qL/2, alpha^2 = m V_0 L^2/(2 hbar^2): even states solve alpha^2/u^2 = 1/cos^2 u with tan u > 0; odd states the cotangent analogue; total bound states N = ceil(2 alpha/pi). Eigenfunctions with exponential tails drawn about their levels in the style of fig_vl11_kasten.tex.
- **Test**: roots by bracketed Brent to 1e-14 vs Julia BigFloat; N count for 100 random alpha; V_0 -> infinity limit reproduces box energies.
- **Tech**: SVG + canvas. **Effort**: S (2 d). **Track**: L. **Engine**: E3.

### C14-G1 Well designer (game)
- **Pitch**: build the well that produces the spectrum on the order sheet.
- **Goal / rules / score**: each order specifies k bound states, or a level ratio E_2'/E_1' (energies measured from the well bottom), or a level at a given energy. The player sets V_0 and L with a cost V_0 L^2 (proportional to alpha^2); score = accuracy x (cost bonus).
- **Why winning needs the physics**: alpha alone sets the number of states and the level ratios; the ratio E_2'/E_1' runs from 4 (deep, box-like) down to 2.828 at the threshold alpha = pi/2 where the second state appears (computed here by bisection; to be re-derived in the build's tests); a cheap well for k states needs alpha just above (k-1) pi/2.
- **Exact quantity**: roots as in C14-D1.
- **Test**: every order solvable; optimum alpha verified offline.
- **Tech**: SVG. **Effort**: S-M (2 d). **Track**: L. **Engine**: E3, E12.
- **Inspirations**: [PHET] (Bound States), [EU], [SC].

### C14-V1 Tunnelling through a barrier (video)
- **Storyboard**: (1) a packet approaches a rectangular barrier; height field of |psi(x,t)|^2 over (x, t). (2) Split: transmitted and reflected parts. (3) Raise the barrier: transmission falls exponentially. (4) Inset: the transmitted probability equals int |phi~(k)|^2 T(k) dk with T(k) the plane-wave transmission coefficient [1 + V_0^2 sinh^2(kappa a)/(4E(V_0 - E))]^{-1}.
- **3D data**: split-operator simulation (E3) checked against the k-integral (1e-6).
- **Tech**: offline three.js. **Effort**: M (2-3 d). **Track**: L+R.

---

## C15 Symmetries and Wigner's theorem (new; TJO's Symmetries notes, not yet transcribed)

### C15-D1 Maps that preserve transition probabilities (demo)
- **Pitch**: a symmetry is any map that keeps every |<phi|psi>|^2; on the qubit these are exactly rotations and reflections of the Bloch sphere.
- **Learner manipulates**: a cloud of 12 pure states on the Bloch sphere; a candidate map from a menu (rotation = unitary; reflection y -> -y = complex conjugation in the standard basis = antiunitary; point inversion; a "squash" of the sphere; a non-linear twist); or free composition of maps.
- **Physics / exact quantity**: |<phi|psi>|^2 = (1 + r.s)/2 for pure states with Bloch vectors r, s; the transition-probability matrix of the cloud is shown as a 12x12 heat map before and after. Qubit case of Wigner's theorem: the maps preserving it are induced by O(3); SO(3) <-> unitaries (mod phase), improper elements <-> antiunitaries.
- **Test**: heat map invariant to 1e-14 under random O(3); squash and twist change at least one entry by > 1e-3 (for the fixed cloud); conjugation acts on Bloch vectors as diag(1, -1, 1).
- **Tech**: three.js + SVG heat map. **Effort**: S-M (2 d). **Track**: L+R. **Engine**: E1, E5.

### C15-G1 Symmetry detective (game)
- **Pitch**: a black box applies a hidden symmetry; find it with as few probes as possible.
- **Goal / rules / score**: the player prepares probe states, sends them through the box, and measures transition probabilities between outputs and reference states (each measurement costs one query; outcome probabilities are given exactly in easy mode, as finite-shot frequencies in hard mode). The player then names the map: unitary with axis and angle, or antiunitary as (rotation) o (conjugation). Win: correct to 1 degree within the query budget.
- **Why winning needs the physics**: by Wigner's theorem the map is fixed (up to phase) by its action on enough states; two non-collinear probes fix a rotation up to a reflection, a third non-coplanar probe decides unitary vs antiunitary (handedness). The game teaches exactly this counting.
- **Exact quantity**: (1 + r.s)/2.
- **Test**: an offline solver identifies every level's map within budget; finite-shot levels pass at 95% with the optimal strategy (seeded Monte Carlo).
- **Tech**: three.js. **Effort**: M (3 d). **Track**: R. **Engine**: E1, E5, E12.
- **Inspirations**: [WOR], [EU], [QG].

### C15-V1 Wigner's theorem in three acts (video)
- **Storyboard**: (1) a cloud of pure states on the sphere; chords between pairs; caption: |<phi|psi>|^2 = cos^2(Theta/2), Theta the angle between Bloch vectors. (2) Rigid rotations move the cloud; chords keep their lengths: unitaries. (3) A mirror reflects the cloud: chords preserved, handedness flipped: antiunitary (time reversal). (4) A squash: chords change, red flags, not a symmetry. (5) Closing frame: the group O(3) as the symmetry group of the qubit, with the projective unitaries as its identity component.
- **3D data**: exact rotations/reflections.
- **Tech**: offline three.js. **Effort**: S-M (2 d). **Track**: R.

---

## C16 Dynamics as a one-parameter group (new + vl06)

### C16-D1 Phasor clocks (demo)
- **Pitch**: each energy eigencomponent is a clock hand; dynamics is all the clocks turning at once.
- **Learner manipulates**: a spectrum E_1..E_6 (sliders); initial amplitudes; time; a "compose" mode that runs U(s) then U(t) and compares with U(s+t).
- **Physics / exact quantity**: U(t) = sum_k e^{-i E_k t/hbar} P_k; group law U(s)U(t) = U(s+t), U(0) = I, strong continuity; the generator recovered as i hbar dU/dt at t = 0 (Stone's theorem, stated; finite-dimensional here). Observable expectations depend only on differences E_j - E_k (global phase).
- **Test**: group law to 1e-14; unitarity; numerical derivative at 0 recovers H to O(h^2).
- **Tech**: SVG + canvas. **Effort**: S (1-2 d). **Track**: L+R. **Engine**: E1.

### C16-G1 Clockwork return (game)
- **Pitch**: tune the spectrum so the state comes back exactly at the bell, and not before.
- **Goal / rules / score**: pick energies from a palette (integers and rationals in units of hbar omega) for a given initial superposition so that the state returns (fidelity 1) first at time T. Hard levels use incommensurate palettes: reach fidelity >= 0.99 at the earliest possible time (quasi-periodicity).
- **Why winning needs the physics**: exact return needs every difference (E_j - E_k) T/hbar in 2 pi Z; adding a constant to all energies changes nothing (global phase), which the player discovers and exploits.
- **Exact quantity**: return times via rational arithmetic (lcm of periods).
- **Test**: rational return-time solver vs brute-force time scan; level solvability.
- **Tech**: SVG. **Effort**: S (2 d). **Track**: L+R. **Engine**: E1, E12.
- **Inspirations**: [OM], [EU], [SC].

### C16-V1 From group to generator (video)
- **Storyboard**: (1) SU(2) drawn as S^3 by stereographic projection into R^3 (identity at the origin, -I at infinity). (2) One-parameter subgroups exp(-i t n.sigma/2) appear as great circles through the identity; every one of them also passes through -I, the projection point, so each projects to a straight line through the origin. (3) Zoom into the identity: all circles leave it with velocity -i n.sigma/2; the tangent space is the Lie algebra. (4) Pick a generator; the corresponding Bloch-sphere rotation plays in an inset. (5) Caption: dynamics = a representation of (R, +); P5.
- **3D data**: exact curves on S^3, stereographic projection.
- **Tech**: offline three.js. **Effort**: M (3 d). **Track**: R.

---

## C17 Rotations: SO(3) and SU(2) (new)

### C17-D1 Two rotations, two orders (demo)
- **Pitch**: rotate a die about x then z, and about z then x; compare. Then see the same in SU(2), where 2 pi is not the identity.
- **Learner manipulates**: angles and axes of two rotations; order; a slider for the total angle of a single rotation 0..4 pi.
- **Physics / exact quantity**: unit quaternions / SU(2) matrices U = cos(theta/2) I - i sin(theta/2) n.sigma; R_ij = (1/2) tr(sigma_i U sigma_j U^dagger); the path in the SO(3) ball (radius pi, antipodes identified) and in SU(2) (sign tracked). Small-angle commutator R_x(e) R_y(e) R_x(-e) R_y(-e) = R_z(e^2) + O(e^3) shows [J_x, J_y] = i J_z.
- **Test**: homomorphism R(U_1 U_2) = R(U_1) R(U_2) to 1e-14 on 10^4 random pairs; R(-U) = R(U); commutator expansion matches to O(e^3).
- **Tech**: three.js. **Effort**: M (2-3 d). **Track**: L+R. **Engine**: E5.

### C17-G1 Orient (game)
- **Pitch**: bring the die into the target orientation with the fewest quarter turns; in the spinor levels the belt must be untwisted too.
- **Goal / rules / score**: moves are quarter turns about the fixed x, y, z axes (later: arbitrary angles about two given axes). Stars for minimal moves. In spinor levels a belt connects the die to a wall: the target is an element of SU(2), so the player must arrive with the right sign (an odd number of full turns leaves a twist).
- **Why winning needs the physics**: non-commutativity; the rotation group of the cube is the 24-element octahedral group, its SU(2) lift the 48-element binary octahedral group; a target that looks reached in SO(3) can be the wrong sheet in SU(2).
- **Exact quantity**: group elements as integer-entry matrices (SO(3)) and quaternions with entries in {0, pm 1/2, pm 1/sqrt 2, pm 1} (SU(2)).
- **Test**: BFS on the Cayley graphs gives the par of every level; group orders 24 and 48 verified.
- **Tech**: three.js. **Effort**: M (3 d). **Track**: L+R. **Engine**: E5, E12.
- **Inspirations**: [EU], [EGAN], [QO].

### C17-V1 Dirac's belt (video)
- **Storyboard**: (1) a plate on a belt fixed to a wall; rotate the plate by 2 pi: the belt is twisted. (2) Try to untwist without rotating the plate: impossible (show failed attempts as ghosts). (3) Rotate another 2 pi (total 4 pi); loop the belt around the plate: the twist disappears. (4) Inset: Egan's ball picture of SO(3), the 4 pi loop shrinking through antipodal jumps. (5) Inset: the SU(2) sign counter shows -1 after 2 pi and +1 after 4 pi.
- **3D data**: the belt frame F(s, t) in SO(3) along the belt (s) and over time (t), given by an explicit null-homotopy of the 4 pi loop (to be taken from [EGAN] notes or arXiv:1001.1778 and verified): boundary conditions F(0, t) = I, F(1, t) = plate orientation, F(s, 0) = F(s, 1) = I.
- **Test**: boundary conditions to 1e-14; continuity (max frame jump between adjacent samples below a set bound).
- **Tech**: offline three.js (ribbon mesh). **Effort**: M (3-4 d). **Track**: L+R.

---

## C18 Angular momentum and spherical harmonics (vl14)

### C18-D1 Multiplet explorer (demo)
- **Pitch**: climb the (2l+1)-ladder with L_+ and L_-; see each |l, m> as a pattern on the sphere.
- **Learner manipulates**: l = 0..8; m; buttons L_+, L_-, L_z on superpositions; basis toggle complex Y_l^m vs real (cos/sin m phi) harmonics; display: phase-coloured sphere or radial plot |Y|.
- **Physics / exact quantity**: L_pm |l, m> = hbar sqrt(l(l+1) - m(m pm 1)) |l, m pm 1>; Y_l^m with the Condon-Shortley phase, from associated Legendre functions [DLMF] 14.30 (convention declared on screen; the notes' vl16 table currently drops the -1 for m = +1, see REPORT.md section 3.1).
- **Test**: orthonormality by Gauss-Legendre x trapezoid quadrature (exact for these polynomial integrands at sufficient order; 1e-14); L^2 Y = l(l+1) Y by a finite-difference Laplacian on the sphere (1e-6); Y_1^1 = -sqrt(3/(8 pi)) sin theta e^{i phi}.
- **Tech**: three.js. **Effort**: M (2-3 d). **Track**: L+R. **Engine**: E5, E6.

### C18-G1 Nodal detective (game)
- **Pitch**: name the harmonic from its nodes.
- **Goal / rules / score**: a rotatable, phase-coloured angular pattern appears; the player guesses (l, m) (real basis: (l, m, cos/sin)). After each guess the game reports, Wordle-style, which counts match: total nodal lines (l), meridian nodal planes (|m|, real basis), latitude cones (l - |m|). Win within 4 guesses; streak scoring.
- **Why winning needs the physics**: the node-counting rules; in the complex basis |Y_l^m|^2 is axially symmetric, so m is invisible in the density and must be read from the phase winding (m windings around the z axis), which the game makes the player notice.
- **Exact quantity**: patterns from C18-D1.
- **Test**: uniqueness of the answer given full feedback; node counts computed from zero sets match the rules for all (l, m), l <= 8.
- **Tech**: three.js. **Effort**: S-M (2 d). **Track**: L. **Engine**: E5, E6, E12.
- **Inspirations**: [WOR], [FAL], [OV].

### C18-V1 Coupling two angular momenta (video)
- **Storyboard**: (1) the product basis of j_1 = 1 and j_2 = 1/2 as a grid of dots in the (m_1, m_2) plane. (2) Diagonal lines of constant M = m_1 + m_2 light up. (3) Along each diagonal, the dots are recombined by Clebsch-Gordan rotations into |J, M> states; the grid reorganises into a 4-dot (J = 3/2) and a 2-dot (J = 1/2) column. (4) Each |J, M> shown as its spin-up/spin-down orbital pair on spheres. (5) Caption: 1 (x) 1/2 = 3/2 (+) 1/2.
- **3D data**: exact CG coefficients (E5: Racah formula in exact rationals under square roots).
- **Test**: CG orthogonality; comparison with [WS] for j <= 4.
- **Tech**: offline three.js or Manim. **Effort**: M (2-3 d). **Track**: R.

---

## C19 Spin and Stern-Gerlach (vl17)

### C19-D1 Sequential Stern-Gerlach bench (demo)
- **Pitch**: chain analysers at any angle, block beams, recombine them; the counters follow |<m'|D(R)|m>|^2.
- **Learner manipulates**: source (spin-1/2, spin-1, unpolarised or prepared), analysers (axis by drag), blocks, a recombining interferometer, counters.
- **Physics / exact quantity**: transition probabilities |d^j_{m'm}(beta)|^2 with Wigner d-matrices (spin-1/2: cos^2(beta/2), sin^2(beta/2); spin-1: d^1_{11} = (1 + cos beta)/2, d^1_{10} = -sin(beta)/sqrt 2, d^1_{1,-1} = (1 - cos beta)/2, d^1_{00} = cos beta); interferometers add amplitudes, not probabilities. Counts from seeded multinomial sampling.
- **Test**: d-matrices from the general formula vs these closed forms; unitarity of D^j for j <= 4; an unblocked recombining interferometer returns the input state exactly (the spin-1 version is the case that the OSP port of SPINS gets wrong, per [SPINS]).
- **Tech**: SVG + canvas. **Effort**: M (2-3 d). **Track**: L+R. **Engine**: E5.

### C19-G1 Spin router (game)
- **Pitch**: deliver as many atoms as possible in the target state, with a limited parts box.
- **Goal / rules / score**: a Zachtronics-style board: place analysers (fixed angle set), blocks and mirrors to route a beam from a source to a target detector that accepts only a given state. Score = transmitted fraction (exact), with parts cost as a second histogram axis.
- **Why winning needs the physics**: successive analysers multiply cos^2(Delta beta/2), with the half angle for spin-1/2; turning |+z> into |-z> with N intermediate analysers transmits at best [cos^2(pi/(2(N+1)))]^{N+1}; blocking a path in an interferometer can increase the count in another port.
- **Exact quantity**: products of d-matrix elements (amplitudes where paths recombine).
- **Test**: optimum formula vs brute-force search over angle sets; every level's par verified.
- **Tech**: SVG. **Effort**: M (3 d). **Track**: L. **Engine**: E5, E12.
- **Inspirations**: [QG], [SC], [SCH] (Spins.html).

### C19-V1 From the 1922 plate to the Bloch sphere (video)
- **Storyboard**: (1) the apparatus: oven, slit, magnet with shaped pole pieces, glass plate; camera follows a silver atom. (2) Classical expectation: a continuous smear (vector arrows uniformly distributed). (3) What is seen: two spots. (4) Rotate the magnet, block one spot, add a second magnet: 50/50 again. (5) Dissolve into the Bloch sphere with the analyser axes as diameters.
- **3D data**: idealised uniform-gradient deflection (labelled as idealised, not the 1922 field geometry); spots sampled from the exact probabilities.
- **Tech**: offline three.js. **Effort**: M (3 d). **Track**: L.

---

## C20 Central potential (vl15)

### C20-D1 Effective potential and radial states (demo)
- **Pitch**: angular momentum becomes a centrifugal wall; the radial problem is a 1D problem on a half-line.
- **Learner manipulates**: potential (Coulomb, 3D oscillator, spherical well), l, n_r.
- **Physics / exact quantity**: V_eff(r) = V(r) + hbar^2 l(l+1)/(2 m r^2); radial equation for u = r R with u(0) = 0; numerical eigenvalues by a finite-difference or Chebyshev discretisation on a mapped grid (E3 radial mode), checked against exact spectra: Coulomb E_n = -Z^2/(2 n^2) Hartree with n = n_r + l + 1; 3D oscillator E = hbar omega (2 n_r + l + 3/2).
- **Test**: numerical vs exact energies to 1e-10 for the first 10 levels per l; u ~ r^{l+1} near 0 (fit exponent within 1e-6).
- **Tech**: SVG + canvas. **Effort**: M (2-3 d). **Track**: L+R. **Engine**: E3, E6.

### C20-G1 Shooting gallery (game)
- **Pitch**: guess an energy, integrate outward, watch the solution blow up; bracket every bound state with as few shots as possible.
- **Goal / rules / score**: each shot fixes a trial E; the game integrates u(r) from r = 0 (Numerov) and shows it diverging up or down at large r, plus its node count. Goal: locate all bound states for a given l below a threshold to 3 significant digits within a shot budget.
- **Why winning needs the physics**: the node theorem (the n-th radial state has n - 1 nodes) and the sign of the divergence tell which side of an eigenvalue a guess lies; efficient players bisect using node counts.
- **Exact quantity**: Numerov integration with step-doubling error estimate; reference eigenvalues exact (Coulomb, oscillator) or from E3 (well).
- **Test**: Numerov eigenvalues vs exact to 1e-8; node count = n_r for every level.
- **Tech**: canvas. **Effort**: M (2-3 d). **Track**: L+R. **Engine**: E3, E12.
- **Inspirations**: [WOR], [EU], [OM].

### C20-V1 Separation of variables, built by hand (video)
- **Storyboard**: (1) a radial function u(r) on a line. (2) Spin the line about the origin: concentric shells of R(r)^2. (3) An angular pattern |Y|^2 painted on a sphere. (4) Multiply: shells x pattern = an orbital, assembled in place. (5) Raise l: the centrifugal barrier pushes density away from the origin (density ~ r^{2l} near 0).
- **3D data**: exact R_nl and Y_lm (E6).
- **Tech**: offline three.js (E7 renderer). **Effort**: M (2-3 d). **Track**: L.

---

## C21 Hydrogen I: exact orbital clouds (vl16; TJO requires several demos)

All C21 items share engine E7 and the correctness protocol of REPORT.md section 3.1.

### C21-D1 Exact orbital cloud by point sampling (demo)
- **Pitch**: a million electrons' worth of detections, each drawn from the exact |psi_nlm|^2.
- **Learner manipulates**: (n, l, m) for n <= 7; complex vs real basis; Z (hydrogen-like ions); point count 10^4..10^6; phase colouring on/off; clipping plane.
- **Physics / exact quantity**: psi_nlm = R_nl(r) Y_l^m(theta, phi) with R_nl from the closed form of vl16 (generalised Laguerre L^{2l+1}_{n-l-1}, recurrence of [DLMF] 18.9 [section number UNVERIFIED]) and Y_l^m from [DLMF] 14.30. Sampling is exact and factorised: r by inverse CDF of r^2 R_nl^2 (a polynomial times e^{-2Zr/(n a_0)}, whose CDF is a closed-form finite sum; inverted by bisection to 1e-15 relative); x = cos theta by inverse CDF of [P_l^|m|(x)]^2 (a polynomial, integrated exactly); phi uniform for complex orbitals, density proportional to cos^2(m phi) or sin^2(m phi) for real ones (CDF phi/(2 pi) pm sin(2 m phi)/(4 pi m)). No Metropolis chains, no rejection with unproven envelopes.
- **Test**: Kolmogorov-Smirnov test of 10^6 sampled radii vs the exact radial CDF (p > 0.01 at fixed seeds); <r> = (a_0/(2Z))[3n^2 - l(l+1)] within 3 standard errors; angular histogram vs [P_l^m]^2; normalisation of every psi_nlm, n <= 7, by exact rational integration (int r^k e^{-b r} dr = k!/b^{k+1}).
- **Tech**: WebGPU compute (three.js `webgpu_compute_particles` pattern [THREE]) with a CPU/Web-Worker fallback; points rendered as additive sprites. **Effort**: L (5-8 d, of which the sampler is in E7). **Track**: L+R. **Engine**: E6, E7.

### C21-D2 Volume renderer of the exact density (demo)
- **Pitch**: the orbital as a glowing cloud, rendered from the formula itself.
- **Learner manipulates**: (n, l, m), basis, transfer function (linear density, or log), iso-shells at enclosed probability 50% / 90%, a slicing plane, camera.
- **Physics / exact quantity**: ray marching in a fragment (or WebGPU compute) shader that evaluates |psi_nlm|^2 analytically at each sample (Laguerre and Legendre polynomials by recurrence in the shader), emission-absorption with emission proportional to density; no 3D texture, hence no interpolation error. Iso-level c_p chosen so that the region {|psi|^2 >= c_p} contains probability p, found offline by Monte Carlo from C21-D1 samples and shipped as a table.
- **Test**: for 16 fixed pixels, the shader's column integral int |psi|^2 ds along the ray (read back with a float render target) vs a Julia adaptive quadrature (relative error < 1e-4, limited by step size; step size documented); enclosed probability of the shipped iso-level re-estimated from 10^7 samples within 0.002.
- **Tech**: three.js WebGL2 `ShaderMaterial` (pattern of `webgl_volume_cloud` [THREE]) or WebGPU. **Effort**: L (6-9 d). **Track**: L+R. **Engine**: E6, E7.

### C21-D3 Radial distribution and nodes (demo)
- **Pitch**: why the 2s electron is mostly farther out than the 2p electron, and where the nodes are.
- **Learner manipulates**: (n, l); overlay up to 4 curves; a probe radius.
- **Physics / exact quantity**: P(r) = r^2 R_nl(r)^2; n - l - 1 radial nodes; most probable radius n^2 a_0/Z for l = n - 1; <r> formula; the cumulative probability up to the probe radius.
- **Test**: nodes match the zeros of L^{2l+1}_{n-l-1} (e.g. 4s nodes at 1.872, 6.611, 15.518 a_0, computed here by bisection; to be confirmed in the build); integral of P = 1; <r> exact.
- **Tech**: SVG. **Effort**: S (1-2 d). **Track**: L. **Engine**: E6.

### C21-D4 The hydrogen orbital table (demo)
- **Pitch**: every orbital up to n = 5 in one grid, at true relative scale or individually scaled.
- **Learner manipulates**: scale toggle (shared scale shows the n^2 growth), basis, hover for (n, l, m), click to open C21-D1/D2.
- **Physics / exact quantity**: thumbnails rendered by E7 (offline at build time, PNG with provenance metadata) from the same kernel as C21-D2.
- **Test**: thumbnails regenerated in CI and compared to stored hashes; scale bar length matches <r>.
- **Tech**: static grid + three.js on click. **Effort**: S-M (2 d). **Track**: L. **Engine**: E7.

### C21-D5 Slice, phase and probability current (demo)
- **Pitch**: complex orbitals are not static blobs: the phase winds and probability flows around the axis.
- **Learner manipulates**: (n, l, m), slice plane orientation, current arrows on/off.
- **Physics / exact quantity**: domain colouring of psi on the slice (brightness from |psi|^2, hue from arg psi on a cyclic perceptually uniform map [KOV]); probability current j = (hbar m/(m_e r sin theta)) |psi|^2 e_phi for psi_nlm (azimuthal, zero for m = 0 and for real orbitals).
- **Test**: j from the closed form vs j = (hbar/m_e) Im(psi* grad psi) by finite differences (1e-6); div j = 0 numerically.
- **Tech**: WebGL2 fragment shader on a plane + three.js arrows. **Effort**: M (2-3 d). **Track**: L+R. **Engine**: E6, E7.

### C21-G1 Orbital detective (game)
- **Pitch**: an unlabelled cloud; name it in four guesses.
- **Goal / rules / score**: a rotatable C21-D1 cloud of an unknown (n, l, m) (real basis in early levels, complex later, superpositions in the final world). After each guess: feedback on radial nodes, angular nodes, overall size. Win in <= 4 guesses.
- **Why winning needs the physics**: n - l - 1 radial nodes, l angular nodes, size ~ n^2 a_0/Z; complex m only via the phase colour; superposition levels require recognising interference between components.
- **Exact quantity**: renders from E7.
- **Test**: answer uniqueness under full feedback; node counts computed from the formula.
- **Tech**: three.js. **Effort**: M (2-3 d). **Track**: L. **Engine**: E7, E12.
- **Inspirations**: [WOR], [FAL], [PHET] (Models of the Hydrogen Atom).

### C21-V1 Flight through the hydrogen atom (video)
- **Storyboard**: (1) start far out: the 6s 99.9% shell (radius about 101 a_0) as a faint sphere. (2) Dolly inward through five radial node shells of 6s (at 1.85, 6.34, 13.8, 25.2, 42.8 a_0, computed here by bisection), each a dark gap in the cloud. (3) Cut to 4f and 5g real orbitals: slow orbit with the key light rotating. (4) Phase colouring switched on for a complex 4f, m = 3: the hue winds three times around the axis. (5) Pull back to a grid of all n = 4 orbitals; caption: same energy, n^2 = 16 states. (6) End on the 1s cloud for scale.
- **3D data**: analytic per-sample evaluation in the offline ray marcher (E11 using the E7 shader), or a Mitsuba 3 heterogeneous medium fed with a 1024^3 grid built from the exact formula [MIT]; 4K frames.
- **Tech**: offline render, E11. **Effort**: L (5-8 d). **Track**: L.

---

## C22 Hydrogen II: spectrum and dynamics (vl16)

### C22-D1 The breathing atom (demo)
- **Pitch**: superpose 1s and 2p and the cloud sloshes at the Lyman-alpha frequency.
- **Learner manipulates**: two or three components (n, l, m) with amplitudes; time (slow-motion factor shown).
- **Physics / exact quantity**: psi(t) = sum_k c_k psi_k e^{-i E_k t/hbar}, E_n = -13.6057 eV/n^2 (from CODATA via [NIST-CODATA], reduced-mass correction toggle). For (psi_100 + psi_210)/sqrt 2: <z>(t) = <100|z|210> cos(omega t) with <100|z|210> = (128 sqrt 2/243) a_0 = 0.74494 a_0 (closed form; checked numerically for this report) and omega = (E_2 - E_1)/hbar.
- **Test**: <z>(t) from 10^6 samples of C21-D1's sampler (rejection sampling with the proven envelope |psi|^2 <= sum_k |c_k|^2 sum_k |psi_k|^2 by Cauchy-Schwarz) vs the closed form within 3 standard errors.
- **Tech**: three.js (E7). **Effort**: M (3 d). **Track**: L+R. **Engine**: E6, E7.

### C22-D2 Spectrometer (demo)
- **Pitch**: the term scheme of vl16, with the lines you would see through a grating.
- **Learner manipulates**: series (Lyman, Balmer, Paschen), Z, reduced mass on/off, air vs vacuum wavelengths.
- **Physics / exact quantity**: 1/lambda = R_M Z^2 (1/n'^2 - 1/n^2), R_M = R_inf/(1 + m_e/M); colours of visible lines from CIE 1931 matching functions (the rendering of a colour is a display approximation and is labelled so). Fine structure is out of scope and stated as such.
- **Test**: Balmer-alpha..delta vs [NIST-ASD] observed wavelengths to the stated precision of the Bohr formula (agreement within the fine-structure scale, ~1e-5 relative).
- **Tech**: SVG + canvas. **Effort**: S (1-2 d). **Track**: L. **Engine**: none (formula only).

### C22-G1 Cascade (game)
- **Pitch**: an excited atom must emit exactly the photons on the order sheet.
- **Goal / rules / score**: start in |n, l, m>; at each step choose an electric-dipole decay to a lower state; the emitted line joins the player's spectrum. Goal: reproduce the target spectrum (e.g. H-alpha then Lyman-alpha). Forbidden choices are rejected with the reason (e.g. 2s -> 1s has Delta l = 0: no E1 decay, metastable). Score by matched lines and fewest rejected attempts.
- **Why winning needs the physics**: E_n differences pick the colours; Delta l = pm 1, Delta m in {0, pm 1} decide which paths exist.
- **Exact quantity**: selection rules derived in the engine from the angular integrals int Y* Y_1^q Y (Gaunt coefficients, exact via 3j symbols), not hard-coded.
- **Test**: computed angular integrals vanish exactly when the rule forbids and are non-zero otherwise, for all l <= 6; line energies exact.
- **Tech**: SVG. **Effort**: M (3 d). **Track**: L. **Engine**: E5, E6, E12.
- **Inspirations**: [OM], [SC], [PHET] (Models of the Hydrogen Atom).

### C22-V1 Lyman-alpha in slow motion (video)
- **Storyboard**: (1) a pure 2p (m = 0) cloud, static. (2) Admix 1s: the cloud starts to slosh along z; a clock shows real time (period 2 pi/omega ~ 0.41 fs). (3) Side panel: <z>(t) traced. (4) Caption: an oscillating charge density radiates at omega; the decay itself needs the quantised field and is beyond this course. (5) Same for a 3d-2p superposition (Balmer-alpha).
- **3D data**: E7 renders of the exact time-dependent density.
- **Tech**: offline render, E11. **Effort**: M (3-4 d). **Track**: L+R.

---

## C23 Hydrogen III: the rigorous Hamiltonian (new; B. Simon / Reed-Simon, not on disk; Teschl free online)

Every claim in this section must be ground-truthed against a local copy of the source before build; this lane could not do so (see REPORT.md, Open questions).

### C23-D1 Which boundary condition at r = 0? (demo)
- **Pitch**: on the half-line the radial operator needs a boundary condition; only one choice is the 3D hydrogen atom.
- **Learner manipulates**: a boundary-condition parameter for the l = 0 radial operator on (0, infinity); l.
- **Physics / exact quantity**: for l >= 1 the radial operator is limit point at 0 and needs no condition; for l = 0 it is limit circle at 0 and has a one-parameter family of self-adjoint realisations [claim to verify against [TES] chapters on the radial Schroedinger operator, UNVERIFIED]; the one that comes from the self-adjoint 3D operator -Delta - Z/|x| on H^2(R^3) (Kato-Rellich) is the one giving -Z^2/(2n^2). Spectra of the other realisations computed numerically (shooting with the correct small-r asymptotics, which include a logarithmic term for the Coulomb case [UNVERIFIED detail]).
- **Test**: physical choice reproduces -1/(2n^2) to 1e-10; spectra depend continuously on the parameter; independent Julia implementation agrees.
- **Tech**: SVG + canvas. **Effort**: L (5-7 d, mostly the analysis check). **Track**: R. **Engine**: E3.

### C23-D2 Accidental degeneracy (demo)
- **Pitch**: n^2 states at the same energy; classical Kepler ellipses of the same energy share it via the Runge-Lenz vector.
- **Learner manipulates**: n; a mixing angle that rotates within the degenerate n-shell; a classical panel with ellipses of the same energy and varying eccentricity.
- **Physics / exact quantity**: degeneracy n^2 = sum_{l<n} (2l+1); quantum: superpositions within the n-shell are stationary (exact); the explicit SO(4) generators and the parabolic basis as CG combinations of |n l m> [relation to be verified against a source before build, UNVERIFIED].
- **Test**: stationarity of mixed states (density time-independent to 1e-14); degeneracy count.
- **Tech**: three.js (E7) + SVG. **Effort**: M (3-5 d). **Track**: R. **Engine**: E5, E7.

### C23-G1 Self-adjoint or not? (game)
- **Pitch**: a deck of operator-plus-domain cards; call each one.
- **Goal / rules / score**: each card shows an operator and a domain (-i d/dx on [0,1] with various boundary conditions; -d^2/dx^2 on the half-line; the l = 0 and l = 1 radial operators; x^4 or -x^4 potentials). The player calls: symmetric? essentially self-adjoint? if not, deficiency indices? Score streaks; a wrong call reveals the worked solution of (A* pm i) u = 0.
- **Why winning needs the physics**: deficiency indices count L^2 solutions of (A* pm i) u = 0; the player must solve them, which is the skill the Simon-style treatment of hydrogen requires.
- **Exact quantity**: closed-form solutions of the deficiency equations on the cards.
- **Test**: every card's answer cross-checked against a textbook example [TES] and by a second reviewer (rk discipline); no card ships unreviewed.
- **Tech**: HTML + KaTeX/MathJax. **Effort**: M (3-4 d, mostly content review). **Track**: R. **Engine**: E12.
- **Inspirations**: [BABA], [EU], [WOR].

### C23-V1 The hydrogen spectrum as a lattice (video)
- **Storyboard**: (1) states as dots in 3D: (l, m) in the floor plane, energy vertical. (2) Levels fill: n = 1 single dot, n = 2 four dots, n = 3 nine, forming a stepped pyramid. (3) Highlight the l-multiplets inside each level (rotational symmetry) and then the full n^2 (hidden SO(4)). (4) Scale the vertical axis by -1/n^2 to show the accumulation at E = 0. (5) Caption: degeneracy = symmetry.
- **3D data**: exact level structure.
- **Tech**: offline three.js. **Effort**: S-M (2 d). **Track**: L+R.

---

## C24 Tensor product, composite systems, entanglement (vl17, end)

### C24-D1 Two qubits through the Schmidt lens (demo)
- **Pitch**: a two-qubit state is two Bloch balls plus one number that local operations cannot touch.
- **Learner manipulates**: four complex amplitudes (or presets: product, Bell, partially entangled); local rotations on A and B; a CNOT button.
- **Physics / exact quantity**: coefficient matrix C (2x2), Schmidt coefficients lambda_1, lambda_2 = singular values of C (closed form for 2x2); reduced states rho_A = C C^dagger, rho_B = (C^dagger C)^T with Bloch vectors of equal length |lambda_1^2 - lambda_2^2|; entanglement entropy h(lambda_1^2). Local unitaries rotate the two Bloch vectors and leave lambda unchanged.
- **Test**: closed-form SVD vs Julia `svd` (1e-14); tr rho_A^2 = tr rho_B^2; invariance of lambda under 10^4 random local unitaries.
- **Tech**: three.js (two balls) + SVG. **Effort**: M (2-3 d). **Track**: L+R. **Engine**: E1, E8.

### C24-G1 Entangle, disentangle (game)
- **Pitch**: reach the target two-qubit state with local moves and at most one entangling gate; some targets are provably out of reach.
- **Goal / rules / score**: moves are local rotations (free choice of axis in pi/4 steps) and a limited number of CNOTs. Reach the target (fidelity >= 0.999) in minimal moves, or press "impossible" and name the invariant that forbids it (Schmidt coefficients differ and no CNOT is left).
- **Why winning needs the physics**: local operations preserve the Schmidt coefficients; one CNOT can change them; product states are exactly those with lambda_2 = 0.
- **Exact quantity**: Schmidt coefficients; fidelity.
- **Test**: BFS solver gives par; every "impossible" level verified by the invariant.
- **Tech**: three.js. **Effort**: M (3 d). **Track**: L+R. **Engine**: E1, E8, E12.
- **Inspirations**: [HQ], [QO], [QUIRK].

### C24-V1 Two particles, one configuration space (video)
- **Storyboard**: (1) two particles in a 1D box; the joint density |psi(x_1, x_2)|^2 as a height field over the square. (2) Product state: a "plaid" surface; marginals as shadows on two walls. (3) Entangled state (phi_1 phi_2 + phi_2 phi_1 shape, distinguishable particles): diagonal structure that no product of shadows reproduces. (4) Measure x_1 (slice the surface): the conditional density of x_2 changes. (5) Caption: the state lives on the product space, not in "two copies of space".
- **3D data**: exact box eigenfunctions (E3).
- **Tech**: offline three.js. **Effort**: S-M (2 d). **Track**: L.
- **Precedent**: [SCH] (EntanglementInBox.html).

---

## C25 Identical particles (vl18)

### C25-D1 Exchange hole and bunching (demo)
- **Pitch**: same two orbitals, three kinds of particles; the diagonal tells them apart.
- **Learner manipulates**: one-particle states a, b (box or HO levels); statistics (distinguishable, bosons, fermions); a "same half of the box" probe.
- **Physics / exact quantity**: psi_pm = (a(x_1) b(x_2) pm b(x_1) a(x_2))/sqrt 2 (for a orthogonal to b); |psi_-|^2 = 0 on x_1 = x_2 exactly; P(both in left half) for each statistics in closed form (integrals of products of sines/Hermite functions).
- **Test**: diagonal zero to 1e-15; closed-form P vs quadrature; matches the VL18 figure plan entry.
- **Tech**: canvas + three.js surface. **Effort**: S (2 d). **Track**: L. **Engine**: E3, E8.

### C25-G1 Pauli stacker (game)
- **Pitch**: fill the levels fast; fermions refuse to share.
- **Goal / rules / score**: particles arrive one by one (Tetris pacing); the player drops each into a single-particle level of a 1D box, a 3D oscillator, or a hydrogen-like shell, with spin. Fermion rules forbid double occupation of a (level, spin) slot; boson levels stack without limit. Goals: build the N-particle ground state (minimal total energy), or a configuration with exactly a target energy, before the timer ends. Score = speed x accuracy.
- **Why winning needs the physics**: Pauli exclusion from antisymmetry, degeneracies ((N+1)(N+2) per 3D oscillator shell with spin, giving closed shells at 2, 8, 20, 40, 70), the Fermi energy; bosons pile into the lowest level.
- **Exact quantity**: total energies and degeneracies as integers.
- **Test**: enumerated ground states and degeneracies match closed forms for N <= 70.
- **Tech**: canvas. **Effort**: M (2-3 d). **Track**: L. **Engine**: E8, E12.
- **Inspirations**: [TET], [2048], [OM].

### C25-V1 Hong-Ou-Mandel (video)
- **Storyboard**: (1) two single-photon wavepackets approach a 50:50 beam splitter from two ports. (2) The four outcome paths drawn as amplitude arrows; the two "one in each output" amplitudes cancel for bosons. (3) Delay one photon by tau: the cancellation fades; the coincidence curve P_c(tau) is traced (the HOM dip). (4) The same with fermions (thought experiment): anti-bunching, P_c = 1 at tau = 0. (5) Return to the C25-D1 surfaces: bunching on the diagonal.
- **3D data**: P_c(tau) = (1 - |int phi_1*(omega) phi_2(omega) e^{i omega tau} d omega|^2)/2 for bosons, computed in closed form for Gaussian spectra.
- **Tech**: offline three.js. **Effort**: M (3 d). **Track**: L+R.

---

## C26 Fock space, creation/annihilation, CCR/CAR (new; advanced QM course, Astwood notes as secondary source)

### C26-D1 Occupation abacus (demo)
- **Pitch**: an abacus whose beads obey the CCR or the CAR; every move shows its amplitude and its sign.
- **Learner manipulates**: M modes (<= 8); statistics (bosons with occupation cutoff n_max, fermions); buttons a_k, a_k^dagger on superpositions; a "check commutators" panel.
- **Physics / exact quantity**: bosons: a_k^dagger |.., n_k, ..> = sqrt(n_k + 1) |.., n_k + 1, ..>; fermions with the Jordan-Wigner sign (-1)^{sum_{j<k} n_j}; on the truncated boson space [a, a^dagger] = 1 - (n_max + 1) |n_max><n_max| per mode, displayed, so the truncation is never hidden; fermion space 2^M-dimensional and exact.
- **Test**: {c_i, c_j^dagger} = delta_ij and {c_i, c_j} = 0 exactly (integer matrices) for M <= 8; CCR exact on all states with every n_k < n_max; number operator sum_k a_k^dagger a_k diagonal with the right integers.
- **Tech**: SVG. **Effort**: M (2-3 d). **Track**: L+R. **Engine**: E8.

### C26-G1 Operator golf (game)
- **Pitch**: from the vacuum to the target Fock state with the shortest operator word; the amplitude and the sign must be right.
- **Goal / rules / score**: the target is a Fock vector or a small superposition with a required amplitude (e.g. sqrt 6 |3, 0>, or -|1, 0, 1> for fermions). The player builds a word in a_k, a_k^dagger (and, in later worlds, sums of words). Score = strokes; a correct state with wrong amplitude or sign scores zero.
- **Why winning needs the physics**: the sqrt(n+1) factors, normal ordering (a a^dagger = a^dagger a + 1), and fermionic anticommutation signs; the shortest word for a given amplitude is not the obvious one.
- **Exact quantity**: amplitudes stored exactly as sign x sqrt(rational) products.
- **Test**: an enumerator over words up to length 8 gives par; exact arithmetic vs floating point cross-check.
- **Tech**: SVG + KaTeX. **Effort**: M (2-3 d). **Track**: R. **Engine**: E8, E12.
- **Inspirations**: [EU], [SC], [2048].

### C26-V1 Fock space as a tower (video)
- **Storyboard**: (1) floor N = 0: one point, the vacuum. (2) Floor N = 1: M points (one-particle space). (3) Floors N = 2, 3: lattice points counted exactly, C(M + N - 1, N) for bosons, C(M, N) for fermions; the fermion tower stops at N = M. (4) A creation operator is an elevator between floors; its amplitude printed on the cable. (5) Pull back: the direct sum of all floors; caption: an indefinite number of particles.
- **3D data**: exact counts and occupation configurations (E8).
- **Tech**: offline three.js. **Effort**: M (3 d). **Track**: L+R.

---

## C27 Entropy (vl19)

### C27-D1 Entropy inside the Bloch ball (demo)
- **Pitch**: entropy is a function of the distance from the surface.
- **Learner manipulates**: a qubit state; a measurement axis; mixing of two states.
- **Physics / exact quantity**: S(rho) = h((1 + |r|)/2), h the binary entropy; Shannon entropy of the outcomes of a projective measurement along n is h((1 + r.n)/2) >= S(rho), with equality iff n = pm r/|r|; concavity under mixing; the vl19 convention 0 log 0 = 0.
- **Test**: closed forms vs eigenvalue computation; minimum over a 10^4-point sphere grid attained at pm r.
- **Tech**: three.js + SVG. **Effort**: S (1-2 d). **Track**: L+R. **Engine**: E1.

### C27-G1 Twenty questions (game)
- **Pitch**: find the hidden microstate with yes/no questions; the entropy is your par.
- **Goal / rules / score**: a hidden configuration of 10 coins (the vl18 example) drawn from a stated distribution (uniform, biased coins, constrained to a macrostate). The player asks yes/no questions by selecting subsets (e.g. "is coin 3 heads?", or any set of configurations). Score = questions used; par = Shannon entropy in bits; leaderboard of the average over 20 rounds.
- **Why winning needs the physics**: the optimal average lies in [H, H + 1) (Huffman); questions that split probability, not configurations, in half are the efficient ones; constraining the macrostate lowers H.
- **Exact quantity**: H in bits; the Huffman expected length.
- **Test**: Huffman expected length in [H, H + 1) for every level distribution; question answering exact.
- **Tech**: SVG. **Effort**: S-M (2 d). **Track**: L. **Engine**: E9, E12.
- **Inspirations**: [WOR] (and the 3Blue1Brown Wordle-entropy video listed there), [ST], [CT].

### C27-V1 From ten coins to a gas (video)
- **Storyboard**: (1) the ten coins on a table; microstate HHTTTTHTHT (the vl18 example). (2) Bars of the multiplicity C(10, k). (3) N grows to 100, 10^4, 10^6: the bars narrow relative to N (log axis). (4) ln of the multiplicity divided by N tends to the binary entropy. (5) Caption: entropy counts missing information.
- **3D data**: exact binomials (BigInt) and their logarithms.
- **Tech**: offline three.js or Manim. **Effort**: S (1-2 d). **Track**: L.

---

## C28 Microcanonical ensemble (vl20)

### C28-D1 Energy shell counter (demo)
- **Pitch**: choose an energy window, count the states inside, take the logarithm.
- **Learner manipulates**: system (N spins in a field, as vl20's six-spin example; Einstein solid of N oscillators with q quanta; particle in a 3D box); the window [E, E + Delta].
- **Physics / exact quantity**: N_E by exact BigInt combinatorics (spins: sums of binomials; Einstein solid: C(q + N - 1, q); box: lattice points with n_x^2 + n_y^2 + n_z^2 in a shell, compared with the leading Weyl term (pi/6) R^3); rho = (1/N_E) sum over the window; S = k ln N_E.
- **Test**: the vl20 golden value N_E = 35 for six spins with the stated window; S = k ln 2 for the vl20 three-level example; Einstein-solid counts vs direct enumeration for small N, q.
- **Tech**: SVG + canvas. **Effort**: S (2 d). **Track**: L+R. **Engine**: E9.

### C28-G1 Macrostate casino (game)
- **Pitch**: bet on the macrostate of a system drawn uniformly from its energy shell.
- **Goal / rules / score**: the dealer draws a microstate uniformly from the shell (exact sampling) of a spin system or an Einstein-solid pair; the player bets on macrostates (number of up spins, energy share of subsystem A) at house odds. Grow a bankroll from 100 to 1000 chips.
- **Why winning needs the physics**: the probability of a macrostate is its multiplicity over N_E; the most probable macrostate dominates and its relative width shrinks as 1/sqrt N; the house sets odds that only a player who computes multiplicities can beat.
- **Exact quantity**: multiplicities (BigInt); exact uniform sampling.
- **Test**: odds = multiplicity ratios; chi-square test of the sampler at fixed seeds.
- **Tech**: SVG. **Effort**: S-M (2 d). **Track**: L. **Engine**: E9, E12.
- **Inspirations**: [ST], [CT], [NC] (Parable of the Polygons: macro patterns from micro rules).

### C28-V1 The energy shell and the birth of the Maxwell distribution (video)
- **Storyboard**: (1) one classical oscillator: the shell is a circle in phase space. (2) Two coordinates: a sphere; points uniform on it. (3) Higher dimension n: show the histogram of one coordinate of points uniform on S^{n-1} of radius R, density proportional to (1 - x^2/R^2)^{(n-3)/2}. (4) As n grows with R^2/n fixed, the histogram becomes a Gaussian: the Maxwell(-Boltzmann) distribution of one degree of freedom. (5) Quantum version: Einstein-solid lattice points on the simplex sum q_1 + .. + q_N = q.
- **3D data**: exact marginal formula; uniform points on spheres from normalised Gaussians (exact method).
- **Tech**: offline three.js. **Effort**: M (3 d). **Track**: L+R.

---

## C29 Temperature (vl21)

### C29-D1 Two Einstein solids in contact (demo)
- **Pitch**: energy flows until the slopes of ln Omega match; that slope is 1/kT.
- **Learner manipulates**: N_A, N_B, total quanta q; run stochastic exchange or jump to equilibrium.
- **Physics / exact quantity**: Omega_A(q_A) Omega_B(q - q_A), exact BigInt; maximum where Delta S_A/Delta q_A = Delta S_B/Delta q_B (finite-difference temperatures); relative width of the peak ~ 1/sqrt N; the exchange dynamics samples uniformly from the joint shell (random quantum hops between oscillators, which has the uniform distribution as its stationary state).
- **Test**: peak location vs analytic large-N estimate; stationary distribution of the hop dynamics vs exact multiplicities (chi-square, seeded).
- **Tech**: SVG + canvas. **Effort**: S (2 d). **Track**: L. **Engine**: E9.

### C29-G1 Heat-flow bets, with negative temperature (game)
- **Pitch**: connect two systems; predict which way the energy goes and where it stops.
- **Goal / rules / score**: pairs of systems (Einstein solids, two-level spin systems including population-inverted ones, a mix) are shown with their state; the player predicts the direction of flow and the equilibrium split. Score per correct direction and per accuracy of the split.
- **Why winning needs the physics**: flow follows 1/T = dS/dE, not energy per particle; a population-inverted spin system has dS/dE < 0 (negative temperature) and gives energy to any positive-temperature system.
- **Exact quantity**: multiplicities and their differences (BigInt).
- **Test**: predicted equilibrium = argmax of the exact product of multiplicities.
- **Tech**: SVG. **Effort**: M (2-3 d). **Track**: L+R. **Engine**: E9, E12.
- **Inspirations**: [ONI], [OM], [ST].

### C29-V1 Why heat flows from hot to cold (video)
- **Storyboard**: (1) two blocks of oscillators side by side; quanta as glowing beads. (2) The surface Omega_A Omega_B over q_A for N = 10, 100, 1000 as stacked 3D curves; the peak sharpens. (3) The tangent slopes of ln Omega_A and ln Omega_B drawn at the peak: equal. (4) Start off-peak; beads flow; the state climbs to the peak.
- **3D data**: exact counts (E9).
- **Tech**: offline three.js. **Effort**: S-M (2 d). **Track**: L.

---

## C30 Canonical ensemble (vl22)

### C30-D1 A small system in a big bath (demo)
- **Pitch**: the Boltzmann factor is what a small system sees of a huge microcanonical bath.
- **Learner manipulates**: small system (one oscillator, a three-level system, a two-level system); bath size N_B; total energy; alternatively beta directly.
- **Physics / exact quantity**: p(E_s) = Omega_B(q - E_s)/Omega_total (exact) converging to e^{-beta E_s}/Z; Z, U = -d ln Z/d beta, C, S; the vl22 maximum-entropy derivation shown for the three-level system as a constraint plane in the probability simplex with the entropy as height.
- **Test**: convergence of the exact marginal to the Boltzmann form; closed forms for Z (two-level, oscillator); the Schottky heat capacity C = k (beta Delta)^2 e^{beta Delta}/(1 + e^{beta Delta})^2.
- **Tech**: SVG + three.js. **Effort**: M (2-3 d). **Track**: L+R. **Engine**: E9.

### C30-G1 Thermometer from clicks (game)
- **Pitch**: estimate an unknown temperature from energy measurements, and choose the probe system wisely.
- **Goal / rules / score**: a hidden beta; the player chooses a probe (two-level system with tunable gap, oscillator) and buys energy measurements (each costs one coin). Submit an estimate of T; score = squared relative error, compared with the Cramer-Rao bound for that probe and budget.
- **Why winning needs the physics**: energies are Boltzmann-distributed; the Fisher information about beta is Var(H) = d^2 ln Z/d beta^2 = C/(k beta^2), so a good thermometer has a large heat capacity at the target T (gap ~ a few kT for a two-level probe).
- **Exact quantity**: Fisher information closed forms; maximum-likelihood estimator.
- **Test**: Fisher identity numerically; MLE variance approaches the Cramer-Rao bound (seeded Monte Carlo).
- **Tech**: SVG. **Effort**: M (3 d). **Track**: L+R. **Engine**: E9, E12.
- **Inspirations**: [CT], [ST], [OM].

### C30-V1 The Boltzmann factor emerges (video)
- **Storyboard**: (1) a single oscillator coupled to baths of growing size; 3D bars of p(E_s) settle onto an exponential. (2) Switch to the three-level system: the probability simplex as a triangle, entropy as a dome above it. (3) The constraint plane tr(rho H) = E slices the dome; the highest point on the slice is marked. (4) Vary E: the marked point traces the curve of Gibbs states from the uniform distribution (beta = 0) to the ground state (beta -> infinity).
- **3D data**: exact marginals (E9); entropy dome and Gibbs curve closed form.
- **Tech**: offline three.js. **Effort**: M (2-3 d). **Track**: L+R.

---

## C31 Thermodynamics and the effective-theory ladder (vl22 + new)

### C31-D1 The zoom ladder (demo; also the course map)
- **Pitch**: one slider from the GPT to thermodynamics; at each rung, what is kept and what is thrown away.
- **Learner manipulates**: zoom level; a reference system (a litre of helium at room conditions) followed through all rungs.
- **Physics / exact quantity**: per rung, the description and its size: Hilbert space dimension for N spins 2^N; Fock-space floors; the ensemble's parameters (E, V, N, or beta); thermodynamic state variables. Numbers computed (N from the ideal gas law at the stated conditions), not quoted.
- **Test**: computed N for the reference system vs CODATA-based arithmetic; every rung links to an existing demo.
- **Tech**: HTML/SVG with three.js embeds. **Effort**: M (3-4 d). **Track**: L+R. **Engine**: reuses all.

### C31-G1 Coarse-grainer (game)
- **Pitch**: predict the pressure on the wall with as few variables as possible.
- **Goal / rules / score**: a 2D hard-disk gas runs. The player chooses a description (track every particle; track cell densities at a chosen cell size; track only E, V, N) and predicts a future observable (wall pressure, density in a region after a partition is removed). Score combines prediction error and the number of variables (a two-axis Opus-Magnum-style histogram).
- **Why winning needs the physics**: in equilibrium (E, V, N) predict the pressure to within fluctuations ~ 1/sqrt N; out of equilibrium (just after the partition opens) a coarse field description is needed; tracking every particle is never the efficient answer.
- **Exact quantity**: event-driven hard-disk dynamics (exact collision times; energy conserved to rounding); low-density pressure vs the second-virial estimate with B_2 = pi sigma^2/2 for disks of diameter sigma.
- **Test**: energy conservation to 1e-12 relative over 10^6 collisions; speed distribution vs 2D Maxwell (KS); pressure at packing fraction 0.01 within the virial estimate plus statistical error.
- **Tech**: canvas + Web Worker. **Effort**: L (5-7 d). **Track**: L+R. **Engine**: E10 (MD module), E12.
- **Inspirations**: [NC], [SCH] (md/), [OM].

### C31-V1 Powers of ten, for physics (video)
- **Storyboard**: (1) a steam engine on a bench; caption: thermodynamics (E, V, N, S). (2) Zoom 10^-3: steam; a cloud of molecules (MD snapshot); caption: statistical mechanics, ensembles. (3) Zoom 10^-9: two colliding molecules; caption: many-body QM, Fock space. (4) Zoom 10^-10: one hydrogen atom, the exact 1s cloud (E7). (5) Zoom into the spin: a Bloch ball; then the state-space triangle of the GPT. (6) Fast zoom back out, rung labels flashing: "each theory is an effective theory of the one below".
- **3D data**: E7 hydrogen render, MD snapshot from C31-G1, Bloch ball (E1), an engine model (simple CSG, not data).
- **Tech**: offline render, E11. **Effort**: L (6-9 d). **Track**: L.
- **Precedent**: [POT].

---

## C32 Heat engines and Carnot (new)

### C32-D1 Carnot with a real working fluid (demo)
- **Pitch**: run a Carnot cycle with ideal gas, van der Waals gas, and real water through the two-phase dome; the efficiency does not care.
- **Learner manipulates**: working substance; T_h, T_c; the two volumes (or entropies) of the isothermal legs.
- **Physics / exact quantity**: P-V and T-S diagrams; for real fluids, states from a reference equation of state (IAPWS-95 for water [IAPWS], via CoolProp's JavaScript/WebAssembly build [COOL]); heat Q_h = T_h Delta S, work W = closed integral of P dV evaluated numerically along the path.
- **Test**: the invariant W/Q_h = 1 - T_c/T_h for every substance, with W from the numerical P dV integral and Q_h from T Delta S (agreement to 1e-6 relative tests the equation of state's thermodynamic consistency and our integrator); closed integral of dQ/T = 0; spot values vs [NISTW].
- **Tech**: SVG + CoolProp WASM. **Effort**: M (3-5 d). **Track**: L+R. **Engine**: E10.

### C32-G1 Engine designer (game)
- **Pitch**: build an engine from process segments and reservoirs; the histograms show efficiency, power and cost.
- **Goal / rules / score**: parts: isotherm, adiabat, isochore, isobar segments; reservoirs at fixed temperatures; heat exchangers with finite conductance (so that heat flow takes time). Each level sets a demand (minimum power, minimum efficiency, a parts budget). After a run, Opus-Magnum-style histograms place the design among other solutions on efficiency, power, cost.
- **Why winning needs the physics**: no design exceeds 1 - T_c/T_h (the simulation enforces the second law exactly, it is not a rule check); reversible cycles have zero power with finite conductances, so a power target forces irreversibility; for the endoreversible model with Newtonian heat transfer the efficiency at maximum power is 1 - sqrt(T_c/T_h) [CA], which expert players rediscover.
- **Exact quantity**: ideal-gas segment work and heat in closed form; entropy production per cycle >= 0.
- **Test**: Otto cycle efficiency 1 - r^{1 - gamma}; Curzon-Ahlborn optimum reproduced by numeric power maximisation; entropy production non-negative for every random design (property test, 10^4 designs).
- **Tech**: SVG + canvas. **Effort**: L (5-8 d). **Track**: L+R. **Engine**: E10, E12.
- **Inspirations**: [OM], [FAC], [ONI].

### C32-V1 Inside a Carnot cycle (video)
- **Storyboard**: (1) a piston-cylinder with a molecule cloud; the thermometer and the reservoir contacts. (2) The P-V-T surface of water from the equation of state, with the vapour dome; the cycle drawn on it. (3) Isothermal expansion through the dome: liquid boils at constant T and P. (4) Adiabatic legs: the state slides across the surface. (5) The enclosed area becomes the work; the efficiency counter lands on 1 - T_c/T_h.
- **3D data**: surface sampled from IAPWS-95 via CoolProp (E10); molecule cloud from a 2D MD run (labelled schematic in 3D).
- **Tech**: offline three.js. **Effort**: M (4-5 d). **Track**: L.
- **Precedent**: [CIE] (interactive engine explainer).

---

## C33 Thermodynamic potentials (new)

### C33-D1 Legendre transform machine (demo)
- **Pitch**: swap a variable for its slope; the free energy is read off the tangent lines.
- **Learner manipulates**: a convex U(S) at fixed V from a model (ideal gas, Einstein solid, van der Waals); a temperature T (tangent slope); potential selector (U, F, H, G) with their natural variables; the thermodynamic square, where clicking two corners derives a Maxwell relation.
- **Physics / exact quantity**: F(T) = min_S (U(S) - T S), intercepts of the tangent lines; Legendre involution for convex functions; Maxwell relations, e.g. (dS/dV)_T = (dP/dT)_V = R/(V_m - b) for van der Waals.
- **Test**: F** = U on a grid for convex models (1e-10); every Maxwell relation verified by finite differences on van der Waals and on CoolProp water (1e-6 relative).
- **Tech**: SVG. **Effort**: M (2-3 d). **Track**: L+R. **Engine**: E10.

### C33-G1 Maxwell maze (game)
- **Pitch**: turn an unmeasurable derivative into measurable ones with the fewest identity cards.
- **Goal / rules / score**: target expression, e.g. (dS/dP)_T, to be rewritten in terms of measurables (C_P, alpha, kappa_T, P, V, T). Cards: Maxwell relations, the triple-product rule, the chain rule, the definitions of C_V, C_P, alpha, kappa_T. Score = cards used; par from an offline search. Stage 2: choose which potential is minimised at fixed (T, P), (T, V), (S, P) in lab scenarios.
- **Why winning needs the physics**: the Legendre structure determines which relations exist; (dS/dP)_T = -(dV/dT)_P = -V alpha is the archetype.
- **Exact quantity**: each card is a symbolic identity; the final expression is evaluated on van der Waals and on CoolProp water and compared with the direct derivative.
- **Test**: numerical equality of start and end expressions (1e-6) for every par solution.
- **Tech**: SVG + KaTeX. **Effort**: M (3-4 d). **Track**: L+R. **Engine**: E10, E12.
- **Inspirations**: [EU], [SC], [BABA].

### C33-V1 Gibbs' thermodynamic surface (video)
- **Storyboard**: (1) the surface U(S, V) of water (from IAPWS-95) as a 3D sheet. (2) A tangent plane rolls over it; its slopes are T and -P. (3) In the coexistence region the plane touches the surface along a line (a ruled region): liquid and vapour share T and P. (4) The triple point: one plane touching at three points. (5) Caption: Gibbs (1873) drew this surface and Maxwell modelled it in clay [UNVERIFIED historical detail; to be sourced].
- **3D data**: U(S, V) computed from CoolProp (E10); tangent planes exact from the data.
- **Tech**: offline three.js. **Effort**: L (5-6 d). **Track**: L+R.

---

## References

Every URL below returned HTTP 200 to `curl -L` on 2026-10-09 unless marked.

### Game and demo inspirations

| Key | What | Where |
|-----|------|-------|
| [QG] | Quantum Game with Photons (Quantum Flytrap); Virtual Lab; paper: Migdal, Jankiewicz, Grabarz, Decaroli, Cochin, Opt. Eng. 61(8) 081808 (2022) | https://quantumgame.io ; https://lab.quantumflytrap.com ; doi:10.1117/1.OE.61.8.081808 |
| [HQ] | Hello Quantum (IBM Research + Univ. Basel, J. Wootton); described in arXiv:2202.07756 and arXiv:2012.09629. Current download location [UNVERIFIED] | https://arxiv.org/abs/2202.07756 |
| [QO] | Quantum Odyssey (Quarks Interactive), Steam app 2802710 | https://store.steampowered.com/app/2802710/ |
| [QM2] | Quantum Moves 2 (ScienceAtHome, Aarhus). Site timed out on 2026-10-09 [UNVERIFIED]. Note: the Nature 532, 210 (2016) paper on Quantum Moves was retracted in 2020 (code error); arXiv:1506.09091; https://en.wikipedia.org/wiki/Quantum_Moves | https://www.scienceathome.org/games/quantum-moves-2/ |
| [NC] | Nicky Case: explorable explanations, Parable of the Polygons, The Evolution of Trust | https://ncase.me ; https://ncase.me/polygons/ ; https://ncase.me/trust/ |
| [OM] | Opus Magnum (Zachtronics): cost / cycles / area histograms after each solve | https://www.zachtronics.com/opus-magnum/ |
| [SC] | SpaceChem (Zachtronics) | https://www.zachtronics.com/spacechem/ |
| [EU] | Euclidea: construction puzzles scored in L and E moves (stars for minimal solutions) | https://www.euclidea.xyz ; https://www.euclidea.xyz/faq |
| [BABA] | Baba Is You (Hempuli): rules are movable blocks. Site answered HTTP 406 to curl; existence verified via store listings in search results | https://hempuli.com/baba/ |
| [WOR] | Wordle; 3Blue1Brown, "Solving Wordle using information theory" (2022) | https://www.nytimes.com/games/wordle/index.html ; https://www.youtube.com/watch?v=v68zYyaEmEA |
| [QUIRK] | Quirk, drag-and-drop quantum circuit simulator (C. Gidney) | https://algassert.com/quirk |
| [CT] | Clearer Thinking, "Calibrate Your Judgment" | https://www.clearerthinking.org/tools/calibrate-your-judgment |
| [ST] | Seeing Theory (Brown University) | https://seeing-theory.brown.edu |
| [JZ] | J. Swanson, "An Interactive Introduction to Fourier Transforms" | https://www.jezzamon.com/fourier/ |
| [SCH] | D. Schroeder, HTML5 physics software (Spins.html, Wavepackets.html, EntanglementInBox.html, IsingModel, md/); Interactive MD, arXiv:1502.06169 | https://physics.weber.edu/schroeder/software/ |
| [SPINS] | D. McIntyre, SPINS Stern-Gerlach simulator (Oregon State); notes the unfixed spin-1 interferometer bug in the OSP port | https://sites.science.oregonstate.edu/~mcintyre/ph425/spins/ |
| [FAL] | P. Falstad, hydrogen atom applet; 1D QM applet | https://www.falstad.com/qmatom/ ; https://www.falstad.com/qm1d/ |
| [OV] | D. Manthey, Orbital Viewer | https://www.orbitals.com/orb/ov.htm |
| [PHET] | PhET: Models of the Hydrogen Atom; Quantum Bound States | https://phet.colorado.edu/en/simulations/models-of-the-hydrogen-atom ; https://phet.colorado.edu/en/simulations/bound-states |
| [QUVIS] | QuVis, St Andrews QM visualisation project | https://www.st-andrews.ac.uk/physics/quvis/ |
| [EGAN] | G. Egan, Dirac belt trick applet and notes; also Staley, arXiv:1001.1778 (Eur. J. Phys. 31, 2010) [author name UNVERIFIED] | https://www.gregegan.net/APPLETS/21/21.html ; https://www.gregegan.net/APPLETS/21/DiracNotes.html |
| [ONI] | Oxygen Not Included (Klei): thermal simulation sandbox | https://www.klei.com/games/oxygen-not-included |
| [FAC] | Factorio | https://www.factorio.com |
| [KSP] | Kerbal Space Program | https://www.kerbalspaceprogram.com |
| [TET] | Tetris | https://tetris.com |
| [2048] | 2048 | https://play2048.co |
| [CIE] | B. Ciechanowski, "Internal Combustion Engine" | https://ciechanow.ski/internal-combustion-engine/ |
| [POT] | C. and R. Eames, Powers of Ten (1977), Cooper Hewitt record [URL from search, not curl-checked] | https://collection.cooperhewitt.org/objects/35457285 |

### Physics, data and tool references

| Key | What | Where |
|-----|------|-------|
| [PLA] | M. Plavala, General probabilistic theories: an introduction | arXiv:2103.07469 ; local `~/Downloads/arXiv-2103.07469v2.tar.gz` |
| [JGBB] | Janotta, Gogolin, Barrett, Brunner, New J. Phys. 13, 063024 (2011): polygon state spaces | arXiv:1012.1215 |
| [HMZ] | Heinosaari, Miyadera, Ziman, An invitation to quantum incompatibility, J. Phys. A 49, 123001 (2016); eq. (33) and ref. [11] = P. Busch, Phys. Rev. D 33, 2253 (1986). Text checked locally in the lane scratchpad | arXiv:1511.07548 |
| [BLW13] | Busch, Lahti, Werner, Proof of Heisenberg's error-disturbance relation, PRL 111, 160405 (2013) | arXiv:1306.1565 |
| [BLW14] | Busch, Lahti, Werner, Quantum root-mean-square error and measurement uncertainty relations (title verified; journal reference Rev. Mod. Phys. 86, 1261 (2014) [UNVERIFIED]) | arXiv:1312.4393 |
| [CA] | Curzon, Ahlborn, Efficiency of a Carnot engine at maximum power output, Am. J. Phys. 43, 22-24 (1975) (DOI 10.1119/1.10023 not fetched: publisher 403) | https://doi.org/10.1119/1.10023 |
| [KOV] | P. Kovesi, Good colour maps: how to design them (cyclic maps for phase); colorcet | arXiv:1509.03700 ; https://colorcet.holoviz.org |
| [DLMF] | NIST DLMF: orthogonal polynomials (ch. 18), spherical harmonics (14.30) | https://dlmf.nist.gov/18.3 ; https://dlmf.nist.gov/14.30 |
| [NIST-ASD] | NIST Atomic Spectra Database, lines | https://physics.nist.gov/PhysRefData/ASD/lines_form.html |
| [NIST-CODATA] | CODATA constants | https://physics.nist.gov/cuu/Constants/ |
| [NISTW] | NIST Chemistry WebBook, fluid properties | https://webbook.nist.gov/chemistry/fluid/ |
| [IAPWS] | IAPWS-95 formulation for water | https://www.iapws.org/relguide/IAPWS-95.html |
| [COOL] | CoolProp JavaScript (Emscripten/WASM) wrapper, MIT licence | https://coolprop.org/coolprop/wrappers/Javascript/index.html |
| [WS] | WignerSymbols.jl (exact 3j/6j/CG) | https://github.com/Jutho/WignerSymbols.jl |
| [TES] | G. Teschl, Mathematical Methods in Quantum Mechanics (free online) | https://www.mat.univie.ac.at/~gerald/ftp/book-schroe/ |
| [MIT] | Mitsuba 3 participating media and grid volumes | https://mitsuba.readthedocs.io/en/stable/src/generated/plugins_media.html |
| [THREE] | three.js examples (list from https://threejs.org/examples/files.json, three 0.186.1 on jsDelivr on 2026-10-09): webgl_volume_cloud, webgl_texture3d, webgpu_volume_cloud, webgpu_compute_particles, webgpu_compute_texture_3d, webgpu_compute_audio | https://threejs.org/examples/ |
| [MANIM] | Manim Community; Motion Canvas; Remotion | https://www.manim.community ; https://motioncanvas.io ; https://www.remotion.dev |

---

## Correction note, 2026-10-11

Added by the Phase 0 coordinator from the codex review (`../review/REVIEW.md`, sections B and G;
path relative to `docs/plan/research/`). The text above is left as written, as evidence of the
campaign; where it conflicts with this note, the note governs.

- Lines 671-672: H = -Delta - Z/r has energies -Z^2/(4 n^2). For -Z^2/(2 n^2) the Hamiltonian is -Delta/2 - Z/r. No golden value may be generated from the uncorrected pairing.
- Lines 612-613, 637, 643: after TJO's two-body decision the relative-coordinate current uses mu, and internal energies, lengths and isotope parameters use one stated mass convention.
- Lines 760-763: sign-times-square-root-of-rational arithmetic is not closed under sums; extend it or restrict the levels. Lines 785-788: Shannon entropy is a lower bound for twenty-questions par, not in general attainable; use the optimal decision tree's expected length.
