<!-- ROLE: report of the DEMOS-GAMES-VIDEO planning lane: method, flagship shortlist,
     correctness notes for the hardest renders, the shared-engine plan, recommendations
     and open questions. The full catalogue of 105 ideas is IDEAS.md in this directory.
     Authored 2026-10-09 by the lane agent. UPDATE POLICY: planning artefact; TJO decides. -->

# Demos, games and videos for Theoretische Physik C

## 0. Summary

- `IDEAS.md` lists 105 ideas for 33 concepts along the BRIEF's path, from
  preparations and measurements to thermodynamic potentials. Each concept has
  at least one interactive demo, one game and one video. Hydrogen has 5 demos,
  2 more under C22, and 2 more under C23 (the rigorous Hamiltonian). Each idea
  states what is computed exactly, the test that checks it, the technology,
  the effort, the track and the engine it runs on.
- The ideas sit on 12 shared engines plus a reference harness (section 5).
  The engines cost about 55-80 agent-days. With the engines in place, each
  idea costs between half a day and 9 days. The full catalogue comes to about
  254-335 agent-days of item work. The ten flagships (section 2) come to
  about 125-180 agent-days including their engines.
- While reading the existing material I found two errors in the hydrogen
  lecture that a correctness test would have caught. Both are in both editions
  and both are inherited from the 2022 script (section 3.1). I also found one
  physics error in the author's earlier Bloch-sphere widget (section 3.2).
- Every inspiration was checked on the web on 2026-10-09. The Nature paper on
  Quantum Moves, the best-known "physics game" precedent, was retracted in
  2020 (code error): an argument for exactly solvable game levels (C13-G1).

## 1. Method

Bracketed keys such as [FAL] or [HMZ] resolve in the reference tables at the
end of `IDEAS.md`.

1. **Read.** I read `docs/plan/BRIEF.md`, `docs/plan/CONTEXT.md`, the README
   contents table, `_work/figure-plan.md` and `latex/figures/fig_vl11_kasten.tex`
   (the reference figure). Its standards carry over: geometry comes from the
   closed form, colour carries meaning, and a header comment names the
   formula. I also read the lecture sources that fix conventions:
   `latex/lectures/en/lec06, lec13, lec16, lec20, lec22`. For prior widgets I
   read `../generalrelativity/docs/geodesic-bump.html`,
   `../generalrelativity/web/widgets/two-charts.html`,
   `../generalrelativity/docs/demos/*.mjs` with their `*.test.mjs` (a pure
   physics module plus a Node test file), and
   `scratchpad/gh/quantumcomputing/docs/bloch-sphere.html`.
2. **Concept list.** I took the BRIEF's path in order and added three concepts
   that the path needs but did not list: C03 (Hilbert-space toolkit, vl02-05),
   C09 (particle on a line, vl07) and C24 (tensor product and entanglement,
   vl17). I split hydrogen into three concepts: C21 (clouds), C22 (spectrum
   and dynamics) and C23 (the rigorous Hamiltonian after Simon). That gives 33
   concepts.
3. **Selection criteria for each idea.**
   - The quantity on screen has a closed form, or comes from a solver with a
     stated error bound.
   - There is a test that fails if the physics is wrong. A test that only
     fails if the code crashes does not count.
   - For games, the winning strategy is the physics. Clicking at random or
     playing on reflexes must not win.
   - For videos, there are 3-6 beats with a camera path, and the 3D data comes
     from the same engine as the demos.
4. **Verification.**
   - Every inspiration URL was fetched or `curl`ed (status 200 unless marked
     in the reference table of `IDEAS.md`). Non-standard physics claims, and
     claims resting on sources not on disk (Reed-Simon, Busch 1986), are
     marked `[UNVERIFIED]`.
   - Golden values quoted here were recomputed in the lane scratchpad with
     pure Python: hydrogen normalisations, nodes, enclosing radii, `<r>`,
     `<r^2>`, `<1/r>`, `<100|z|210>`, finite-well level ratios.
   - The C07 criterion was read from arXiv:1511.07548 eq. (33); three.js
     example names from `https://threejs.org/examples/files.json`; the Julia
     reference packages (JuMP, HiGHS, SCS, Convex, WignerSymbols, QuadGK,
     HCubature, SpecialFunctions, FFTW, Distributions, Combinatorics) were
     checked to exist in `~/.julia/packages`.

## 2. Shortlist: the ten flagship artifacts

The ranking weighs four things:
- (a) what TJO asked for by name (hydrogen, preparation vs measurement
  uncertainty, Carnot, Fock space, the zoom-out spine);
- (b) teaching value for the Lehramt audience;
- (c) uniqueness: no good existing artifact does it;
- (d) how much engine work it pays for that other ideas then reuse.

Efforts include the item work only. Engine costs are in section 5.

| Rank | Artifact (ids) | Track | Items effort |
|------|----------------|-------|--------------|
| 1 | Hydrogen cloud explorer: exact point sampler, analytic volume renderer, phase slice (C21-D1, C21-D2, C21-D5) | L+R | 13-20 d |
| 2 | Hydrogen video pair: flight through the atom; Lyman-alpha in slow motion (C21-V1, C22-V1) | L | 8-12 d |
| 3 | Shake the trap: an exactly solvable control game (C13-G1) | L+R | 3 d |
| 4 | Distinguish: optimal measurements across five theories, with the state-space/dual demo (C02-G1, C02-D1) | L+R | 6-9 d |
| 5 | Two uncertainty principles: joint-measurability demo plus the two videos (C07-D1, C07-V1, C06-V1) | L+R | 8-10 d |
| 6 | Bloch ball done right, plus the Stern-Gerlach bench and Spin router (C08-D1, C19-D1, C19-G1) | L+R | 7-8 d |
| 7 | Dirac's belt video plus the Orient game (C17-V1, C17-G1) | L+R | 6-7 d |
| 8 | Engine designer plus Carnot with a real fluid (C32-G1, C32-D1) | L+R | 8-13 d |
| 9 | Operator golf plus the occupation abacus (C26-G1, C26-D1) | R (+L) | 4-6 d |
| 10 | Zoom ladder plus "Powers of ten, for physics" (C31-D1, C31-V1) | L+R | 9-13 d |

Reasoning, one paragraph each:

1. **Hydrogen cloud explorer.** TJO insists on several hydrogen demos and
   on literal cloud renders of the correct densities. The point sampler
   draws from the exact density by a factorised inverse CDF (section 3.1),
   so every dot is a correct detection event. The volume renderer evaluates
   the closed form in the shader, so there is no grid error. The phase slice
   shows what the usual pictures hide: complex orbitals carry a winding phase
   and an azimuthal probability current. Engine E7 then also drives C20-V1,
   C21-D3/D4/G1, C22-D1/V1, C23-D2 and the hydrogen shot in C31-V1. Nearest
   precedents: Falstad's applet [FAL] (phase colour, no exact sampling or
   tests) and Orbital Viewer [OV] (desktop).
2. **Hydrogen videos.** TJO asked for 3D videos and named hydrogen. Both
   reuse E7 offline: the fly-through has node shells at radii computed from
   the formula; the breathing 1s-2p superposition has the golden value
   `<100|z|210> = (128 sqrt 2/243) a_0 = 0.74494 a_0` (checked here).
3. **Shake the trap.** This is the cheapest flagship and the one most
   clearly a real game: drag a harmonic trap to move an atom without
   sloshing it. A moved harmonic trap keeps a coherent state coherent, so
   the fidelity is exactly `exp(-|alpha_f|^2)`, where alpha_f comes from the
   classical driven oscillator. The game's score cannot be a numerical
   artefact. That is exactly how Quantum Moves' published claims failed (the
   retraction is noted under [QM2] in `IDEAS.md`). Lehramt students can play
   it from classical intuition; rigorous-track students can be asked to prove
   the formula.
4. **Distinguish.** TJO's framing starts from GPTs (Plavala, the dual cone
   of effects). I found no existing game that makes the dual cone playable.
   The game's optimum is an extreme effect, computed by LP for polytopes and
   by the Helstrom formula for the qubit. Playing it teaches why the effect
   space is the dual of the state space, which is the P2/P3 step of the
   postulates.
5. **Two uncertainty principles.** The BRIEF says of preparation vs
   measurement uncertainty that "everyone screws this up". The joint-
   measurability disc `lambda_x^2 + lambda_z^2 <= 1` [HMZ eq. (33), crediting
   Busch 1986] is an exact, small, visual result. The split-screen video
   (C07-V1) keeps the two notions apart by construction: two benches versus
   one device.
6. **Bloch ball done right, with Stern-Gerlach.** The qubit is the
   workhorse of the course (vl06 examples, vl17). The earlier widget animates
   gates along non-physical paths (section 3.2). Fixing this is cheap and
   visible. The Stern-Gerlach bench and the router game reuse the same E5
   rotation engine and carry spin-1 correctly through Wigner d-matrices.
7. **Dirac's belt and Orient.** The 4 pi periodicity of SU(2) is the
   conceptual pivot of "rotations are projective representations" (BRIEF
   item 11). The belt video has an exact frame field with checkable boundary
   conditions. The Orient game makes the binary octahedral group (48
   elements) the game board.
8. **Engine designer and real-fluid Carnot.** "Then come machines; Carnot."
   Running the real-water Carnot demo on IAPWS-95 data gives the strongest
   correctness invariant in the thermodynamics part: the efficiency must come
   out as 1 - T_c/T_h whatever the substance. The game's physics enforces the
   second law instead of checking a rule. Its power-efficiency trade-off
   leads to the Curzon-Ahlborn efficiency [CA].
9. **Operator golf and abacus.** Fock space is the step most likely to lose
   Lehramt students. A game in which the sqrt(n+1) factors and the fermionic
   signs decide the score makes the CCR/CAR tangible. The fermionic part is
   exact in a 2^M-dimensional space. The bosonic truncation is displayed,
   never hidden.
10. **Zoom ladder and Powers of ten.** This is the course's spine and the
    entry point of the "choose your own adventure" navigation. It is also
    the place where "every theory is an effective theory of the one below"
    becomes visible. It reuses every engine, so it should be built last.

Next five: C28-V1 (Maxwell distribution from the energy shell), C12-D1 (box
carpets, revivals), C10-V1 (Fourier transform as a quarter turn), C05-G1
(tomography race), C25-G1 (Pauli stacker).

## 3. Correctness-first notes on the hardest renders

### 3.0 The general rule

Every artifact has four parts. This is the GR repo's pattern, tightened:

1. **Kernel.** A physics kernel as a pure ES module, with no DOM and no
   randomness except a seeded PRNG passed in.
2. **Reference.** An independent reference: a Julia script, or
   exact/rational arithmetic, or a closed form in a different
   parametrisation.
3. **Test file.** It asserts golden values and invariants against that
   reference. CI runs it.
4. **Provenance header.** Like the TikZ figure headers, it names the
   formula, the lecture equation it comes from, the conventions (phase,
   units, signs) and the test file.

Videos are rendered from the same kernel. The render script writes the kernel
version and the test-suite hash into the video's metadata.

### 3.1 Hydrogen orbital clouds

**Errors in the current notes.** Both are in `latex/lectures/de/vl16.tex` and
`latex/lectures/en/lec16.tex`, and both are inherited from
`archive/skript-2022/Vorlesungen16.tex`.

- **Line 85**, `L_2^s(x) = -x^2/2 - (s+2)x + (s+1)(s+2)/2`. The leading sign
  is wrong. The generalised Laguerre polynomial is
  `L_2^s(x) = x^2/2 - (s+2)x + (s+1)(s+2)/2` ([DLMF] ch. 18, three-term
  recurrence). Check at s = 1, x = 0.7: the recurrence gives 1.145; the line
  in the notes gives 0.655.
- **Line 94**, `psi_{21pm1}`. The prefactor `1/(8 sqrt(2 pi))` gives
  normalisation 1/2: the integral of |psi|^2 is 0.5000, computed by
  quadrature here. The correct prefactor is `1/(8 sqrt pi)`, as in the
  standard tables (for example `1/sqrt(64 pi)` in Griffiths [UNVERIFIED
  edition and page]). With the Condon-Shortley phase that the rest of the
  notes imply, the m = +1 function also carries a factor -1. The other two
  entries on the list (1s, 2s, 2p m = 0) normalise to 1.

These are exactly the errors a normalisation test catches in its first run.
This lane edits nothing outside its directory; the fix belongs to whichever
lane owns the content (see Open questions).

**Exact sampling.** For a single orbital the density factorises as
`r^2 R_nl(r)^2 dr x [P_l^|m|(x)]^2 dx x Phi(phi) dphi`, with x = cos theta.
Each factor is sampled by inverse CDF:

- **Radial.** `r^2 R_nl^2` is a polynomial times `e^{-2Zr/(n a_0)}`. Its CDF
  is a finite closed-form sum: integrate term by term with
  `int_0^r t^k e^{-bt} dt` as a lower incomplete gamma of integer order.
  Invert it by bisection to 1e-15 relative. Bisection is robust because the
  CDF is monotone; Newton steps can follow for speed.
- **Polar.** `[P_l^|m|(x)]^2` is a polynomial in x. Integrate its
  coefficients exactly (rationals) and invert by bisection.
- **Azimuthal.** Complex orbitals have Phi uniform. Real orbitals have
  `cos^2(m phi)` or `sin^2(m phi)`, with CDF
  `phi/(2 pi) pm sin(2 m phi)/(4 pi m)`, inverted by bisection.
- **Superpositions** `sum_k c_k psi_k` with sum |c_k|^2 = 1 and K terms.
  Propose from the mixture `q = (1/K) sum_k |psi_k|^2`: pick k uniformly,
  then sample `|psi_k|^2` exactly. Accept with probability
  `|psi|^2 / (K q)`. This is valid because Cauchy-Schwarz gives
  `|psi|^2 <= (sum |c_k|^2)(sum |psi_k|^2) = K q`. The acceptance rate is
  at least 1/K. The method is exact, and there is no Markov chain whose
  convergence would need diagnosing.

**Normalisation and golden values.**
- Integrals by exact rational arithmetic (`int_0^inf r^k e^{-br} dr = k!/b^{k+1}`).
- Moment tests in units Z = 1, a_0 = 1, all re-verified here by quadrature:
  - `<r> = (3n^2 - l(l+1))/2`;
  - `<r^2> = (n^2/2)(5n^2 + 1 - 3l(l+1))`;
  - `<1/r> = 1/n^2`;
  - most probable radius n^2 for l = n - 1.
- Sampler tests: Kolmogorov-Smirnov on 10^6 radii against the exact CDF
  (fixed seeds, p > 0.01); a chi-square test of the cos theta histogram
  against `[P_l^m]^2`; moment estimates within 3 standard errors.
- Independent reference: Julia `SpecialFunctions`/`HypergeometricFunctions`
  for Laguerre polynomials, plus a separate implementation of Y_l^m from
  [DLMF] 14.30. Two code paths, one test.

**Resolution.** Grids are the wrong tool here. Numbers computed in the
scratchpad:

| Orbital | Radius enclosing 99.9% | Radial nodes |
|---------|------------------------|--------------|
| 6s | 101 a_0 | 1.85, 6.34, 13.8, 25.2, 42.8 a_0 |
| 4s | 49.8 a_0 | 1.87, 6.61, 15.5 a_0 |

Resolving the inner node of 6s with 8 voxels per feature needs a voxel of
about 0.23 a_0. Over a 202 a_0 box that is about 880^3, roughly 7 x 10^8
voxels, which is not feasible as a browser 3D texture.

So:
- **Interactive renders (C21-D2)** evaluate |psi|^2 analytically at each ray
  sample. Laguerre and Legendre come from three-term recurrences in the
  shader, which is cheap for n <= 7. The ray step adapts to the local
  length scale, and the step rule is documented.
- **Offline renders (C21-V1)** use the same analytic evaluation in an offline
  ray marcher. Alternatively they bake a 1024^3 grid for Mitsuba's
  heterogeneous medium [MIT], with a stated error from comparing
  column integrals.
- **Tests** compare column integrals at fixed pixels with Julia
  `QuadGK`/`HCubature`.

**Iso-surfaces.** Never "a nice-looking density threshold". The level `c_p`
is defined so that `{|psi|^2 >= c_p}` encloses probability p (50% or 90%),
estimated from 10^7 exact samples with a stated Monte Carlo error of about
0.002, and shipped as a table with its provenance.

**Colour.**
- Density maps to opacity/brightness linearly by default. A log transfer
  function is offered and labelled.
- The phase of complex orbitals uses a perceptually uniform cyclic map
  ([KOV]; colorcet CET-C maps). A rainbow HSV wheel is not used: its
  perceptual non-uniformity invents structure.
- Only relative phase is physical. The legend says so, and the hue origin is
  fixed by a stated convention (Condon-Shortley; R_nl positive near r = 0).
- Real orbitals use a two-colour diverging sign map from the course palette.
- The density display must survive greyscale (the fig_vl11 rule). Brightness
  carries |psi|^2; hue carries only phase.

**Honesty labels.** Point clouds show where detections would occur, not
"the electron's path"; scale bars are in a_0; the reduced-mass correction is
a toggle with its size shown (about 5 x 10^-4 relative for hydrogen).

### 3.2 Spin and the Bloch sphere

- **The earlier widget's error.**
  `quantumcomputing/docs/bloch-sphere.html` (lines 569-600) animates a gate
  by linearly interpolating the polar angles (theta, phi) between the start
  and end states. A unitary moves the Bloch vector along the orbit of its
  one-parameter group, a circle about the rotation axis, and that is a
  different path. Two examples:
  - Hadamard on |0>: the interpolated path runs along the x-z meridian. The
    true path, a rotation by pi about (x+z)/sqrt 2, passes through
    (1/2, ±1/sqrt 2, 1/2), with the sign set by the rotation sense.
  - X on |+i>: the interpolated path runs along the equator. The true path
    goes over a pole.

  Rule: animate `r(s) = R(n, s theta) r(0)` (Rodrigues); test the midpoint
  against the 2x2 matrix exponential.
- **Sign and representation.** Show the SU(2) sign (U(2 pi) = -I) next to
  the SO(3) picture. Never draw a spin-1 state on a Bloch sphere: spin-1
  pure states are not a 2-sphere. Use Wigner d^1 probabilities, and if a
  picture is wanted, Majorana stars (optional, R track).
- **Mixed states and conventions.** Mixed states lie inside the ball;
  entropy and purity are functions of |r| (C27-D1). Rotation sense is fixed
  once in the notation database (U(R) = exp(-i theta n.S/hbar),
  right-handed, active) and shown in each demo.
- **Stern-Gerlach renders.** The pattern from an idealised uniform field
  gradient is labelled "idealised". The 1922 field geometry is not modelled.
  Spot populations come from |d^j_{m'm}|^2, sampled with a seeded
  multinomial.
- **Interferometers.** Recombined beams add amplitudes. The spin-1
  interferometer is the case where the OSP port of SPINS is documented to
  "lose atoms" [SPINS]. It becomes an explicit test: an unblocked
  interferometer returns the input state exactly.

### 3.3 Fock-space occupation animations

- **Identical glyphs.** Occupation-number pictures must not give identical
  particles identities. That rules out coloured or numbered balls moving
  between boxes, the commonest visual error. Draw occupation numbers as
  counts or stacks of identical glyphs. When a basis change is animated,
  animate the amplitudes, not little particles travelling.
- **Bosons need a cutoff.**
  - The demo shows `[a, a^dagger] = 1 - (n_max + 1)|n_max><n_max|` on the
    truncated space.
  - It picks n_max so that the weight above the cutoff is below 1e-12. For a
    coherent state the Poisson tail is computed exactly.
  - It warns when an operation pushes weight into the top level.
- **Fermions are exact**: 2^M dimensions, Jordan-Wigner signs
  `(-1)^{sum_{j<k} n_j}`, mode ordering fixed in the definitions database to
  match TJO's advanced-QM course; test `{c_i, c_j^dagger} = delta_ij` with
  integer matrices for M <= 8.
- **Amplitude arithmetic.** Amplitudes are kept exactly, as a sign times the
  square root of a rational. Floating point is used only for display. This
  is what lets Operator golf (C26-G1) refuse a state whose amplitude is off
  by a sign.
- **Dimension counts on the tower video** are exact binomials:
  C(M+N-1, N) for bosons, C(M, N) for fermions.

### 3.4 The microcanonical energy shell

- **Quantum.** The quantum "shell" is a window [E, E + Delta] in a discrete
  spectrum, as in vl20, not a surface. The demos count N_E exactly with
  BigInt and show that S/N depends on Delta only at subleading order. The
  golden values come from vl20: N_E = 35 for the six-spin figure, and
  S = k ln 2 for the three-level example.
- **Classical.** For N classical oscillators the shell is a sphere in 2N
  dimensions; sample it exactly by normalising a vector of independent
  Gaussians. Never present a 3D projection of the points as "the shell"
  (projections of high-dimensional uniform measures mislead). Show
  one-coordinate marginals: for S^{n-1} of radius R the density is
  proportional to `(1 - x^2/R^2)^{(n-3)/2}`, which tends to a Gaussian, the
  Maxwell distribution (C28-V1).
- **Concentration of measure.** The volume fraction of an n-ball within a
  relative distance epsilon of its surface is `1 - (1 - epsilon)^n`. State it
  with the numbers: 0.99996 for n = 1000 and epsilon = 0.01.
- **Exchange dynamics.** The "quanta hopping" animation (C29-D1) must have
  the uniform distribution on the joint shell as its stationary state. Test
  this against exact multiplicities, not by eye.

### 3.5 Carnot cycles with real fluid data

- **Equation of state.**
  - Water: IAPWS-95 [IAPWS], through CoolProp's WebAssembly build [COOL],
    with the version pinned and HEOS as the backend.
  - Spot values are checked against NIST WebBook [NISTW] in a test. The
    WebBook implements the same reference formulations for water [UNVERIFIED
    for each fluid; check per fluid].
  - Other fluids (CO2, nitrogen) use the CoolProp reference EoS for that
    fluid, and the reference paper is cited in the provenance header.
- **Inside the dome** isotherms are also isobars. Flash calculations use
  (T, s) or (P, h) inputs. Stay at least a stated margin away from the
  critical point (647.096 K, 22.064 MPa for water, per IAPWS-95). Near it,
  derivatives are ill-conditioned and the demo should say so.
- **The invariant tests.**
  - `W/Q_h = 1 - T_c/T_h`. W is the numerical closed integral of P dV along
    the computed path; Q_h = T_h Delta S. Tolerance 1e-6 relative.
  - `closed integral of dQ/T = 0`.
  - `closed integral of du = 0`.

  Because W and Q_h are computed independently, the first test checks both
  the EoS's thermodynamic consistency and our path integrator.
- **Van der Waals** below T_c has the unphysical loop. Apply the Maxwell
  equal-area construction and test the equal areas. Never draw the loop as
  physical without labelling it.
- **Labels.** Carnot cycles are idealisations; the demo shows Otto and
  Rankine for comparison.

### 3.6 Rules common to all renders

1. **Palette and design tokens.** Colour comes from the shared design
   tokens, and those must first be made consistent. `latex/tpc-style.sty`
   defines spacecadet = #0D284C, which the quantum-computing widget also
   uses. `../generalrelativity/docs/geodesic-bump.html` uses the same name
   for #3D7A55, which is birrengreen in tpc-style. One token file
   (CSS custom properties, generated from the design package) has to drive
   TikZ, web and video.
2. **Quasi-probabilities.** They are labelled as such wherever they appear:
   Wigner functions, and negative regions in a second colour.
3. **Approximations.** Every model choice is captioned: idealised fields,
   truncations, open-system models.
4. **Determinism.** Seeded PRNGs everywhere, so that a test and a video
   frame are reproducible.

## 4. What makes these games real games

A game in `IDEAS.md` qualifies only if it has all four of the following:

1. **A goal and a win condition.**
2. **A score**, typically one of:
   - Euclidea-style stars for minimal solutions [EU];
   - Opus-Magnum-style histograms on two or three axes [OM];
   - Wordle-style guess counts [WOR].
3. **A par computed offline by a solver.** The level designer then knows the
   optimum and the test suite knows every level is solvable.
4. **A dominant strategy that is the physics itself.** Some examples:
   - the log-score optimum is the true probability (C01-G1);
   - the extreme effect wins (C02-G1);
   - the classical sloshing cancels (C13-G1);
   - the Schmidt invariant proves impossibility (C24-G1);
   - the Fisher information equals the heat capacity (C30-G1).

The game shell (E12) also provides "declare impossible" moves, scored only
with a stated reason (no-go theorems as game moves), hint ladders, bilingual
strings and a keyboard path. No game needs accounts or servers.

The two strongest existing families of precedents point in different
directions:
- **Circuit and optics puzzles** (Quantum Game with Photons [QG], Hello
  Quantum [HQ], Quantum Odyssey [QO]) cover the qubit/two-qubit corner well.
  Our C05, C08 and C24 games should not try to outdo them. Their point is
  coupling to the course's notation and to the GPT framing.
- **Zachtronics and Euclidea mechanics** (optimisation under constraints,
  scored against the population) suit the topics where no physics game
  exists: dual cones, measurement uncertainty, Fock-space algebra, heat
  engines and Maxwell relations. Most new value lies there.

## 5. Engines: build these first

| Engine | Scope | Drives (ideas) | Effort |
|--------|-------|----------------|--------|
| E0 reference harness | Julia reference scripts and golden-data files with sha256 manifest; Node test runner; Playwright smoke test per page; provenance-header checker | all | M, 4-6 d |
| E1 qubit and small-matrix core | 2x2/3x3 complex linear algebra, closed-form eigen, Bloch map, POVMs, fidelity, entropy, matrix exponential | C03-C05, C08, C15, C16, C24, C27 | M, 3-4 d |
| E2 convex geometry / GPT | polytopes, cones, dual cones, exact-rational vertex enumeration in 2D/3D, small LP | C01, C02, C04 | M, 4-6 d |
| E3 1D Schroedinger | analytic bases (box, HO via Hermite recurrence), split-operator FFT propagator, finite-difference/Chebyshev eigensolver on mapped grids, radial mode with u(0) = 0, Numerov shooting, Wigner-function evaluation | C06, C07, C09-C14, C20, C23, C24, C25 | L, 6-9 d |
| E4 audio bridge | WebAudio playback of envelopes; spectrum analyser | C10 | S, 1 d |
| E5 rotation and representation engine | quaternions/SU(2), SO(3) from SU(2), Wigner D and d for any j, J_pm/J_z matrices, Clebsch-Gordan and 3j by exact Racah formula, finite rotation groups (24/48 elements) | C08, C15-C19, C22, C23 | M, 4-5 d |
| E6 special functions with exact coefficients | generalised Laguerre, associated Legendre, Y_l^m (complex and real, Condon-Shortley), Hermite; polynomial coefficients in rationals; closed-form CDFs and moments | C06, C13, C18, C20-C23 | M, 3-5 d |
| E7 hydrogen renderer | exact sampler (Web Worker and WebGPU compute), analytic ray-marching shader, iso levels by enclosed probability, phase/sign colouring, slice planes, current field; offline mode for E11 | C20, C21, C22, C23, C31 | L, 8-12 d |
| E8 many-body and Fock | tensor products, (anti)symmetrisers, Schmidt decomposition, occupation basis, Jordan-Wigner signs, truncated bosons with visible truncation, exact amplitude arithmetic | C24-C26 | M, 4-5 d |
| E9 counting and ensembles | BigInt binomials and multiplicities, log-multiplicities, exact uniform samplers on shells, Boltzmann marginals, Fisher information | C27-C30 | S-M, 2-3 d |
| E10 thermodynamics | EoS layer (ideal, van der Waals with Maxwell construction, CoolProp WASM adaptor), cycle builder and integrator, Legendre transforms, event-driven hard-disk MD | C31-C33 | L, 7-10 d |
| E11 offline video pipeline | deterministic headless rendering of three.js scenes (Playwright + fixed frame clock + ffmpeg, all on the machine per CONTEXT.md), scene-from-data descriptors, bilingual caption tracks, provenance metadata; optional Mitsuba path for volumes | all V ideas | L, 6-10 d |
| E12 game shell | levels as data, seeded RNG, par-solver hooks, stars and histograms, hint ladders, i18n, keyboard access, local persistence | all G ideas | M, 4-5 d |

Total for the engines: about 55-80 agent-days.

**Shared engines.** One 1D Schroedinger solver (E3) drives 14 concepts:
box, oscillator, finite well, wavepacket, Fourier pictures, tunnelling, both
uncertainty topics, the central-potential radial equation, the rigorous
hydrogen boundary-condition demo and the two-particle box. One SU(2)/SO(3)
engine (E5) drives rotations, angular momentum, spin and Stern-Gerlach,
Wigner symmetries, Clebsch-Gordan and the Cascade selection rules. E6 + E7
drive all hydrogen work; E9 drives statistical mechanics up to the canonical
ensemble.

**Build order** (each step unblocks the next tranche of flagships):

1. E0 + E12 + E1. Unblocks Bloch-ball-done-right, the C05 and C08 games, and
   proves the test-and-provenance loop on small code.
2. E3 + E6. Unblocks Shake the trap, the box/oscillator/well demos, and the
   C06/C07 work.
3. E5. Unblocks Stern-Gerlach, the Spin router, Orient and Dirac's belt.
4. E7, the largest single risk. Unblocks the hydrogen flagships.
5. E11. Unblocks all videos. It can run in parallel with step 4 if a second
   agent is available.
6. E2, E8, E9. Unblock Distinguish, the Fock games and the statistical
   mechanics demos.
7. E10. Unblocks Carnot and potentials.
8. The zoom ladder (C31) last, since it embeds the others.

## 6. Effort and sequencing

- **Totals** (from the effort fields of `IDEAS.md`): 39 demos 86-119 d,
  33 games 84-108 d, 33 videos 84-108 d; items 254-335 d; engines 55-80 d.
  The ten flagships: 72-101 d of items plus the engines they need (all but
  E4 and E9: 53-77 d), so about 125-180 agent-days.
- **Agent-day** = one agent working one day, including the rk review-and-
  repair round; not a human day. An independent reviewer per physics kernel
  adds roughly 15-20% [estimate, UNVERIFIED].
- **Tracks.** 40 ideas serve L only, 12 R only, 53 both. A Lehramt-first
  release ships the L and L+R items of C01-C22 first; the GPT-heavy rigorous
  items (C02-D1 full mode, C07-G1, C16-V1, C23) follow.
- **Print.** Every one of the 22 lectures gets at least one demo. Key frames
  of videos and static demo states, exported through E11 from the same
  kernels, serve the BRIEF's "one picture per page" without a second
  implementation.

## 7. Video pipeline (brief; the TECH-STACK lane owns the tooling decision)

Facts from CONTEXT.md and checks here:
- Neither Manim nor Blender is installed. Mitsuba is not installed: `import
  mitsuba` fails.
- ffmpeg, Node and Playwright are available.

The pipeline that shares the most with the demos is headless three.js:
- the same scene modules as the interactive pages;
- a fixed frame clock;
- frames captured by Playwright and encoded by ffmpeg.

This keeps the "same verified numbers drive figure, demo and video" property
for free. Manim [MANIM] fits the 2D-diagrammatic videos (C03-V1, C18-V1,
C27-V1) if TJO wants that look. It would need its own provenance checks,
because it would not share the JS kernels. Mitsuba 3 [MIT] is the option for
photoreal volumetric hydrogen shots. Its `heterogeneous` medium takes a
`gridvolume`, so it needs a baked grid, with the grid-error test of
section 3.1.

## Recommendations

Ranked. Each states the trade-off.

1. **Build the reference harness (E0) and the qubit core (E1) first, then
   ship Bloch-ball-done-right (C08-D1) as the pilot artifact.** It is small,
   it fixes a known error, and it proves the kernel + reference + test +
   provenance loop. Trade-off: the first visible result is modest, not the
   hydrogen showpiece.
2. **Make hydrogen (E6 + E7, flagships 1-2) the first large investment.**
   Correct the two vl16 errors in the same pass. This is what TJO asked for
   by name, and it is the largest technical risk (shader performance at
   n = 7, WebGPU availability). Trade-off: 16-24 agent-days of engine work
   before any of it is visible. Mitigate by shipping the point sampler
   (CPU worker) before the volume renderer.
3. **Use analytic per-sample evaluation for all hydrogen renders, not 3D
   textures.** Trade-off: more shader arithmetic and slower frames on weak
   GPUs. In exchange the error is zero by construction, and the resolution
   problem of section 3.1 (about 7 x 10^8 voxels for 6s) disappears.
4. **Adopt exactly solvable game mechanics wherever possible.** Shake the
   trap, Sniper, Distinguish, Operator golf and the counting games qualify.
   Trade-off: some fun levels (free-form potentials, anharmonic traps) are
   excluded or limited to verified numerics. The gain is that a score can
   never be a numerical artefact, as Quantum Moves showed it can.
5. **Build E11 (headless three.js video) instead of adopting Manim or
   Blender.** Trade-off: weaker typography and lighting out of the box; in
   exchange videos come from the tested kernels, with nothing re-verified.
6. **Prioritise the GPT and measurement-uncertainty games and demos (C02,
   C07) over further qubit games.** Trade-off: these topics are harder to
   make fun. But the qubit/circuit space is already well served by Quantum
   Game, Hello Quantum and Quantum Odyssey, and TJO's framing is distinctive
   exactly here.
7. **Unify the colour tokens across TikZ, web and video first.** Trade-off:
   a small delay; otherwise the spacecadet #3D7A55 vs #0D284C split repeats.
8. **Keep C23 (rigorous hydrogen) gated on sources.** Do not build the
   boundary-condition demo or the self-adjointness card game until Reed-Simon
   / Simon (or Teschl, which is free online) is registered locally and the
   claims marked `[UNVERIFIED]` in `IDEAS.md` are ground-truthed. Trade-off:
   the R track's hydrogen chapter lags the L track's.

## Open questions for TJO

1. **The vl16 errors.** Should they be fixed now in both editions (L_2^s sign
   on line 85; psi_{21pm1} prefactor 1/(8 sqrt pi) and the Condon-Shortley
   sign on line 94), or wait for the content rewrite? And which convention do
   you want declared: Condon-Shortley phase, and complex or real orbitals as
   the default display? Falstad defaults to real orbitals [FAL].
2. **Hydrogen budget.** How many hydrogen artifacts is "multiple demos"? The
   catalogue has 9 (C21-D1..D5, C22-D1/D2, C23-D1/D2) plus 2 videos and 2
   games. Which 3-4 must exist at first release?
3. **Games as graded work.** Should games be optional extras, or part of
   Lehramt coursework, for example "reach three stars in Distinguish" as an
   exercise? That changes the difficulty curve and whether scores need to be
   exportable.
4. **Video look.** Photoreal volumetric hydrogen (Mitsuba, baked grids,
   install required) or the same visual language as the web demos (headless
   three.js)? And do you want your own voice or captions only? German first,
   with English subtitles?
5. **The GPT examples.** Which state spaces should appear: classical simplex,
   square bit, regular polygons, qubit ball? Do polygon models fit your
   "keep the rabbit hole minimal" instruction, or should C02 use only
   simplex vs ball?
6. **Measurement uncertainty.** Which formulation is canonical for the
   course: the qubit joint-measurability disc (C07-D1), the
   Busch-Lahti-Werner position-momentum error-disturbance relation (C07-G1),
   or both? Both need ground-truthing against sources not on disk (Busch
   1986; BLW 2013/2014).
7. **Thermodynamics content.** There is no source yet for Carnot and the
   potentials. Which text should the C32/C33 artifacts be ground-truthed
   against? And is IAPWS-95 water through CoolProp acceptable as the
   real-fluid data source?
8. **Hosting and offline use.** One site with shared engines, or
   single-file HTML per artifact for offline classroom use? This decides
   whether engines are bundled per page.
9. **Prior widgets.** Correct the quantumcomputing Bloch page (3.2), or only supersede it?
