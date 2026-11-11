# Demos for lectures 7 and 8: designs

2026-11-11. Design only: nothing here is built or committed. Sources: `latex/lectures/de/vl07.tex`,
`latex/lectures/de/vl08.tex`, `latex/figures/fig_vl07_dichte.tex`, `latex/figures/fig_vl08_fourier.tex`.
Harness conventions studied in `c01.demo.dichte`, `c03.demo.komplex`, `c03.demo.kreuz`,
`c03.demo.spektren`, `web/src/kernels/{hilbert,prob}.ts`, `web/README.md`.

## 0. Where the demos live

**Chapter.** Lectures 7 and 8 feed the planned chapter C5, "Welcher Hilbertraum? Das Teilchen auf
der Geraden" / "Which Hilbert space? The particle on a line" (`docs/plan/research/curriculum/REPORT.md`,
C5: reuse vl07 whole, vl08 Fourier, momentum space, quantisation rules, `fig_vl07_dichte`).
Proposed directory `content/c05-teilchen/` (German slug, as `c03-hilbertraum`, `c11-wasserstoff`).

| Demo | Still (figure ID) | Still exists? |
|---|---|---|
| `c05.demo.zerfliessen` | `c05.fig.fourier` (port of `fig_vl08_fourier`) | yes |
| `c05.demo.detektor` | `c05.fig.dichte` (port of `fig_vl07_dichte`) | yes |
| `c05.demo.kommutator` | `c05.fig.kommutator` | no: new figure |
| `c05.demo.wellenpaket` | `c05.fig.synthese` | no: new figure |

**Smallest stub.** `content/c05-teilchen/chapter.json` (`id` c05, `slug` teilchen, both titles,
`effective_theory` from REPORT C5, `zoom_scale` single-system, `prerequisites` c03, c04, `assets`: the
two figures and the two demos); `de.tex` and `en.tex` with `\chapter` and one Kern section holding
the two `tpcfigure`s, each with `\demo{...}` and a caption that carries the physics alone (the
script prose after each figure is the natural caption); `figures/dichte.tex` and
`figures/fourier.tex`, ported from the script figures with the colour names `cgblue`,
`birrenorange`, `spacecadet`, `birrengray` replaced by plate roles (`tpc-q1`..`tpc-q3`,
`tpc-plate-ink`, `tpc label`, `tpc axis`) as the c03 figures do. A push publishes, so the stub is
real course text, not a placeholder; in practice the demos should ship with the first c05 Kern
section rather than ahead of it. Whether two figures in one section pass `check_levels` is to be
seen from `./ci.sh --fast --chapters c05`, not assumed.

**Notation the stub has to settle** (the demos take labels from the registry):
- `sym.fourier-transform` is `\widehat{f}` (fixed in C5, used in c11), but vl08 writes
  `\widetilde{\Psi}`, and the course puts hats on operators. One of them has to give.
- `sym.standard-deviation` is `\Delta x`; vl08 writes `\sigma_t`, `\sigma_p`. The readouts need one.
- New rows: wave function Ψ(x,t), momentum wave function Φ(p,t), spreading time τ. The detector
  is `sym.effect-operator` (F) with an interval subscript; `sym.hbar`, `sym.position-operator`,
  `sym.momentum-operator`, `sym.commutator` exist.
- REPORT puts "wave-packet spreading" under C7, while vl08 has it in its free-particle section.
  `c05.demo.zerfliessen` hangs on the Fourier figure, which is C5 either way.

**One kernel**, `web/src/kernels/particle.ts`, golden file `web/tests/golden/particle.json`, Julia
reference `numerics/generate/particle_golden.jl` (standard library only, as `numerics/Project.toml`
requires: own Romberg or Gauss-Legendre quadrature in BigFloat, as `web/tests/golden/reference/prob.jl`
does), test `web/tests/kernels/particle.test.ts`, which also checks each demo's default state against
the numbers of its still (the pattern of `hilbert.test.ts`). Reused: `Complex`, `cmul`, `abs2`,
`phaseFactor` from `hilbert.ts`; `gaussDensity`, `gaussInterval` from `prob.ts`.

**Units of all demos.** Lengths in σ0 (the middle packet of the Fourier figure), wave numbers in
1/σ0, momenta in ħ/σ0 (so p and k carry the same number), times in τ0 = 2mσ0²/ħ (eq:gausspaket at
σ = σ0). Then for a packet of width σ: τ = σ² τ0, the shift ħk0t/m is 2k0t, and the phase
ħk²t/2m is k²t. No physical constant enters a demo, so no ledger row is needed.

**Derived here, used below.** For Ψ(x,0) = (2πσ²)^(-1/4) e^(-(x-a)²/4σ²) e^(ik0x) (the vl07
exercise packet, centred at a; vl08's packet is k0 = 0), eq:phik and eq:gaussintegrale give

    Ψ̃(k) = (2σ²/π)^(1/4) e^(-σ²(k-k0)²) e^(-i(k-k0)a).                         (D1)

Substituting k = k0 + q into eq:freieloesung splits the phase as ħk²t/2m = ħk0²t/2m + (ħk0t/m)q +
ħq²t/2m; the q-integral is the k0 = 0 case at the shifted point, so

    Ψ_k0(x,t) = e^(ik0x - iħk0²t/2m) Ψ_0(x - ħk0t/m, t),                        (D2)

with Ψ_0 from eq:gausspaket. Hence |Ψ(x,t)|² is a Gaussian with centre a + ħk0t/m and width
σ_t = σ√(1+t²/τ²). By eq:impulszeit and D1, |Φ(p,t)|² is a Gaussian with centre ħk0 and
σ_p = ħ/2σ for all t, so σ_t σ_p = (ħ/2)√(1+t²/τ²). Two packets of widths σ1, σ2 have equal
σ_t when σ1² + t²/σ1² = σ2² + t²/σ2² (units above), that is at t = σ1σ2 τ0, with common width
√(σ1²+σ2²). D2 was checked against a quadrature of eq:freieloesung at four parameter sets (agreement
to 1e-10 or better, scratch script, not in the repo; the Julia reference repeats this check).

## 1. Ranking

Teaching value per unit of build effort, highest first.

| # | Demo | Value | Effort | Why this place |
|---|---|---|---|---|
| 1 | `c05.demo.zerfliessen` | high | medium | the time axis is exactly what the still cannot show; still exists; closed forms |
| 2 | `c05.demo.detektor` | medium-high | low | the core formula of vl07; still exists; dragging code exists (`c01/kit.ts`) |
| 3 | `c05.demo.kommutator` | medium-high | low, plus a new still | unique, nothing like it in the course; needs a small new figure |
| 4 | `c05.demo.wellenpaket` | medium-high | medium, plus a new still | the plane-wave warning made concrete; most parameters, new figure |

## 2. Designs

### 2.1 `c05.demo.zerfliessen`: three packets spread, the momentum panel does not move

**Take-away.** Free evolution changes only phases in momentum space: |Φ(p,t)|² stays fixed while
|Ψ(x,t)|² spreads, and the narrowest packet spreads fastest.

**On screen.** The still at t = 0, set in motion. Left, (a): |Ψ(x,t)|² of the three packets
σ0/2, σ0, 2σ0 (colours q1-q3 as the still), with their ±σ_t rulers above the curves; x/σ0 in
[-10, 10] (the still's [-5, 5] is too narrow: at t = 2τ0 the narrowest packet has σ_t = 4.03σ0).
Right, (b): |Φ(p,t)|² of the same packets with ±σ_p rulers, pσ0/ħ in [-2.5, 2.5] as in the still.
Between the panels the three steps of the Merksatz, F, multiply by e^(-iħk²t/2m), F^-1, as a
labelled arrow row.

**Controls.** Play (harness); time t/τ0 in [0, 2], step 0.01, primary slider (play runs it in 8 s,
a drawing choice). Packet choice σ0/2 | σ0 | 2σ0 (`choice` of `c03/common.ts`, default σ0): the chosen
one is drawn strong, the others faint. Toggle "Phase": overlays Re Φ(p,t) and ±|Φ| (dotted) of the
chosen packet in (b). Carrier k0σ0 in [-1, 1], step 0.25, default 0. Readouts for the chosen packet:
τ/τ0, σ_t/σ0, σ_pσ0/ħ, σ_tσ_p/ħ.

**What the student does and sees.** Drags t. (b) never moves. The rulers in (a) cross: at
t = τ0/2 the σ0/2 and σ0 packets are equally wide (1.118σ0), at t = τ0 the σ0/2 and 2σ0 packets
(2.062σ0), at t = 2τ0 the σ0 and 2σ0 packets (2.236σ0, the σ0/2 packet is at 4.031σ0): the order
of widths reverses. The product readout starts at 0.5 and grows (√2/2 = 0.707 for σ0 at t = τ0).
With "Phase" on, Re Φ(p,t) winds faster and faster in p under a fixed envelope: step 2 of the
recipe is visible, and it is the whole of the dynamics. With k0 ≠ 0 all packets drift at the same
speed 2k0 σ0/τ0, and the curves in (b) sit at ħk0 and still do not move.

**Formulas.** eq:freieloesung, eq:phik and the Merksatz "in drei Schritten"; eq:gausspaket and the
unlabelled σ_t equation after it; eq:impulszeit; σ_p = ħ/2σ (unlabelled, after the Fourier
figure); D1, D2 above.

**Misconceptions.** "Spreading means the momentum becomes less sharp" (σ_p is constant).
"σ_xσ_p = ħ/2 holds for a Gaussian at all times" (only at t = 0). "The narrowest packet stays the
narrowest" (it is overtaken at t = τ0/2).

**Phone.** Below 560 px stage width the demo sets its own aspect (0.62) and stacks (a) over (b),
as `c03.demo.kreuz` does; the step row becomes one line between them; readouts wrap below the stage.

**Kernel** (`particle.ts`; nothing existing covers Gaussian packets in time; `hydrogen.ts` has only
centre-of-mass sampling):
- `freePsi(x, t, sigma, a, k0): Complex`: D2 with eq:gausspaket; (1 + it/σ²)^(-1/2) in polar form
  (modulus (1+s²)^(-1/4), argument -atan(s)/2, s = t/σ²).
- `freeDensity(x, t, sigma, a, k0): number`: Gaussian, centre a + 2k0t, width `spreadWidth`.
- `spreadWidth(sigma, t) = sigma*sqrt(1 + t²/sigma⁴)`; `spreadTime(sigma) = sigma²`.
- `momentumPhi(u, t, sigma, a, k0): Complex`: D1 times e^(-iu²t).
- `momentumDensity(u, sigma, k0)`; `momentumWidth(sigma) = 1/(2 sigma)`.
- `outsideWindow(X, t, sigma, a, k0)`: 1 - P[|x| ≤ X] via `gaussInterval` (shown only above 0.001).

**Reference values** (Julia): Ψ(x,t) by BigFloat quadrature of eq:freieloesung with D1, D1 itself
checked against a quadrature of eq:phik; σ ∈ {1/2, 1, 2}, t ∈ {0, 1/2, 1, 2}, (a, k0) ∈ {(0, 0),
(-1, 0.75), (0.5, -1)}, x at the centre, ±1σ_t, ±3σ_t and one tail point. σ_t by quadrature of the
second moment of |Ψ|² (independent of the closed form) at the crossing times, expected √5/2, √17/2,
√5. ∫p|Φ(p,t)|²dp and ∫p²|Φ(p,t)|²dp at t = 0, 1, 2 (constant). Still agreement at t = 0: peaks of
|Ψ|² 0.79788, 0.39894, 0.19947 and of |Φ|² 0.39894, 0.79788, 1.59577 (the still's header).

### 2.2 `c05.demo.detektor`: the detector sees only the area under |Ψ|²

**Take-away.** A position detector on [a, b] answers with probability ∫_a^b |Ψ|² dx; the
oscillating, signed parts of Ψ do not enter, and a detector for a single point answers never.

**On screen.** The still: left, Re Ψ and Im Ψ with the envelope ±|Ψ|; right, p(x) = |Ψ|² with the
interval [a, b] shaded and a thin strip of width ε at c. New against the still: in the left panel
the part of Ψ inside [a, b] is drawn strong and the rest faint. That strong piece is F_[a,b]Ψ, since
⟨y|F_[a,b]|Ψ⟩ = ∫_a^b ⟨y|x⟩⟨x|Ψ⟩dx = Ψ(y) for y in [a, b] and 0 outside (eq:ortsdetektor, eq:posbasis).

**Controls.** Drag a, b and c on the right panel (`pointer` of `c01/kit.ts`), mirrored by sliders
a, b in [-4, 4], step 0.05 (keyboard, screen reader). Carrier k in [0, 6], step 0.5, default 3. Strip
width ε on a log slider from 1 down to 10^-6, default 0.2. State: Gaussian packet (vl07 exercise,
σ = 1, centre 0) | box state (vl07 Beispiel, 1/√2 on [-1, 1]). Button "Detektor noch einmal":
applies F again; nothing changes (F² = F). Readouts: P[x ∈ [a, b]]; strip probability P_ε; P_ε/ε
next to p(c).

**What the student does and sees.** Moves k: Re Ψ and Im Ψ change completely, p(x) and the readout
do not move. Drags the interval: the readout follows the area. Shrinks ε: P_ε goes to zero
(0.0158 at ε = 0.2, 7.9·10^-8 at ε = 10^-6), while P_ε/ε settles at p(c) = 0.07895. A density is
not a probability; the point detector |x⟩⟨x| has nothing to report. Box state: P = 0.75 on the
still's interval [-0.5, 1.5].

**Formulas.** eq:ortsdetektor; the P4 display P[x ∈ [a,b]] = ∫_a^b |Ψ|²; p(x) = |Ψ(x)|²; F² = F and
(|x⟩⟨x|)² = δ(0)|x⟩⟨x| (unlabelled, before the Merksatz); the exercise packet; the Beispiel.

**Misconceptions.** "Ψ is the density" (Re Ψ is negative in places). "The carrier changes where the
particle is found." "The probability of finding it at x is p(x)" (it is p(c)ε for a small strip,
and zero for a point).

**Phone.** Panels stacked (aspect 0.7 below 560 px); drag handles get a touch target of at least
2 em; readouts below the stage. Overlap: `c01.demo.dichte` already drags an interval over a
Gaussian density, and `c03.demo.komplex` already shows |f|² independent of k. This demo earns its
place by joining both to the detector operator and by the ε-limit; it should reuse their code.

**Kernel:**
- `packet(x, sigma, a, k): Complex` = `freePsi` at t = 0; `boxState(x, k): Complex`.
- `intervalProbability(state, a, b)`: Gaussian via `prob.ts` `gaussInterval((a-x0)/σ, (b-x0)/σ)`
  (exists); for b - a < 1e-3 a 5-point Gauss-Legendre rule on [a, b] instead, to avoid the
  cancellation of two tails; box: |[a, b] ∩ [-1, 1]|/2 exactly.
- `stripRatio(state, c, eps)` = P_ε/ε.

**Reference values.** |Ψ|² integrated from the complex Ψ (carrier included, so its cancellation is
tested, not assumed) by BigFloat Romberg: P[-0.5, 1.5] = 0.624655260005155 for k ∈ {0, 3, 6} (the
still's 0.62466); strip [-1.9, -1.7] = 0.0158489 (the still's header quotes p(c)ε = 0.0158); P_ε/ε at
c = -1.8 for ε = 10^-1, ..., 10^-6 (0.0790238, ..., 0.0789502) and p(-1.8) = 0.0789502; box state
[-0.5, 1.5] = 3/4, [0.9, 1.1] = 1/20.

### 2.3 `c05.demo.kommutator`: x then p against p then x

**Take-away.** x̂p̂ and p̂x̂ differ by iħ for every function, and the reason is the Leibniz rule;
of the three orderings of xp only the symmetric one has real expectation values.

**On screen.** Two rows. Top: f, then f′, then x f′ ("erst ableiten, dann multiplizieren", so
x̂p̂f = -iħ x f′). Bottom: f, then x f, then (x f)′ (p̂x̂f = -iħ(xf)′). The common factor -iħ is
stated in the row headers, the curves show the real functions behind it. Right column: (x f)′ - x f′
drawn over f (dotted): they coincide, so (x̂p̂ - p̂x̂)f = iħf.

**Controls.** Function: Gaussian (2π)^(-1/4) e^(-(x-a)²/4) | odd function (2π)^(-1/4) x e^(-x²/4)
(both normalised, by eq:gaussintegrale). Centre a in [-3, 3], step 0.1 (Gaussian only); play sweeps
a. Readouts: ⟨f|x̂p̂f⟩, ⟨f|p̂x̂f⟩, ⟨f|½(x̂p̂ + p̂x̂)f⟩, in units of ħ.

**What the student does and sees.** Moves a: x f′ and (x f)′ grow with a and look almost alike,
yet their difference stays f, same shape, same place. The readouts stay at 0.5iħ, -0.5iħ and 0 for
every f and a. Derivation for the caption: for real normalised f, ∫x f f′dx = ½∫x(f²)′dx = -½ by
parts, so ⟨f|x̂p̂f⟩ = -iħ∫x f f′dx = iħ/2 and ⟨f|p̂x̂f⟩ = -iħ∫f(xf)′dx = -iħ(1 - ½) = -iħ/2. An
imaginary expectation value means x̂p̂ is not Hermitian.

**Formulas.** The product-rule display before eq:ccr; eq:ccr; the operator-ordering paragraph
(three candidates, only the symmetric mean Hermitian); eq:phermitesch.

**Misconceptions.** "xp - px is zero, or only matters for special functions." "The order of
operators is a matter of convention." "x̂p̂ is an observable because x and p are."

**Phone.** Below 560 px: two columns (top row left, bottom row right) of three small plots each,
the difference panel full width below; aspect about 0.6.

**Kernel** (nothing existing covers it):
- `testFunction(kind, a, x): { f, df }`, closed forms.
- `xThenP(kind, a, x) = x df` and `pThenX(kind, a, x) = f + x df` (the real factors behind -iħ).
- `orderedExpectations(kind, a): { xp: Complex, px: Complex, sym: Complex }` by composite Simpson
  on [a - 12, a + 12] (computed, not hard-coded, so the readout is a calculation).

**Reference values.** f, f′, x f′, (xf)′ from independently typed derivatives at
x ∈ {-2, 0, 0.7, 3}, a ∈ {0, 1.5, -3}, and the odd function; expectations by BigFloat quadrature:
xp = 0.5i, px = -0.5i, sym = 0 in all cases.

**New still** `c05.fig.kommutator`: the two rows and the difference panel at a = 0, one TikZ file,
geometry from the closed forms.

### 2.4 `c05.demo.wellenpaket`: a packet built from plane waves

**Take-away.** A single plane wave is not a state; a finite sum of plane waves is periodic; only
the integral over k gives one normalisable packet.

**On screen.** Main panel: Re S, Im S and |S|² of the sum
S(x) = Σ_{j=-n}^{n} Ψ̃(k_j) e^(ik_jx) Δk/√(2π), k_j = k0 + jΔk (a Riemann sum of eq:freieloesung at
t = 0), with the exact |Ψ|² dotted; packet σ = 1, a = 0, k0 = 3 as in the dichte figure. Inset: the
weights |Ψ̃(k_j)|² as bars on the k axis over the curve |Ψ̃(k)|² (D1). For N = 2n + 1 ≤ 7 the
component waves are drawn faint behind the sum.

**Controls.** Number of waves N = 2n + 1, n in [0, 12]; spacing Δk in [0.25, 1.5]/σ, step 0.05.
Readouts: N; the period 2π/Δk; ∫_{-10}^{10}|S|²dx; max |S - Ψ| on the window.

**What the student does and sees.** N = 1: |S|² is flat (0.00794 at Δk = 0.25), and the window
integral only grows with the window: no normalisation (vl08's warning). N = 3, 5: beats. N = 7 at
Δk = 1: copies of the packet every 2π σ ≈ 6.28σ, each of height 0.3990 against 0.3989 for |Ψ(0)|²;
the window holds three (integral 3.06). Every term has period 2π/Δk, so the sum has it too; shrinking
Δk pushes the copies out. n = 12 at Δk = 0.25: the sum matches Ψ to 6·10^-6 on [-10, 10] and the
window integral is 1.0000.

**Formulas.** eq:invfourier, eq:freieloesung at t = 0, eq:phik, D1, the plane-wave warning after
the Merksatz.

**Misconceptions.** "A plane wave is a particle with momentum ħk somewhere." "A few waves make a
packet." "The packet has one wavelength."

**Phone.** One main panel, inset above it; two sliders; aspect 1.0 below 560 px.

**Kernel:** `packetFT(k, sigma, a, k0): Complex` (D1; the same function as `momentumPhi` at t = 0);
`planeWaveSum(x, n, dk, sigma, a, k0): Complex` (direct sum, at most 25 terms by about 600 points
per frame); `planeWaveWeights(n, dk, sigma, a, k0)`.

**Reference values.** Direct BigFloat sums at x ∈ {0, 1.3, 2π/Δk, 2π/Δk + 1.3} (periodicity), for
(n, Δk) ∈ {(0, 0.25), (3, 1), (12, 0.5), (12, 0.25)}; Ψ̃ by quadrature of eq:phik; the window
integrals above by Romberg.

**New still** `c05.fig.synthese`: three rows, N = 1; N = 7 at Δk = 1; N = 25 at Δk = 0.25.

## 3. Recommendation

**Build first: `c05.demo.zerfliessen` and `c05.demo.detektor`.** Both hang on figures that already
exist, so they need no new TikZ and their stills are already reviewed. Together they cover the
centre of each lecture: the detector formula of vl07 and the free-particle recipe of vl08. The
spreading demo has the highest value of the four, because time is exactly what a printed figure
lacks. The detector demo is cheap, since its parts exist in `c01.demo.dichte` and `prob.ts`. Both
use one new kernel with closed forms only.

Next comes `c05.demo.kommutator`: cheap code, no overlap with anything in the course, but a new still
to draw and review.

**Deliberately not built:**
- *Re/Im/phase view of a carrier packet on its own*: `c03.demo.komplex` already shows it, inset
  |f|² independent of k included; the detector demo carries the k-independence where it matters.
- *A separate width-product slider*: the spreading demo at t = 0 with its packet choice is the
  still plus the product readout; a continuous σ adds nothing the three packets do not show.
- *A PDE solver* (split-step, Crank-Nicolson): vl07 and vl08 have only the free particle, whose
  closed forms are exact; a solver brings discretisation errors the golden test would have to bound.
  If anywhere, it belongs to C7 (box, well, oscillator).
- *Momentum moments from Ψ against from Φ* (eq:pmomenteort): a comparison of effort, with nothing
  for the hands to do.
- *Free particle in 3D*: vl08 itself says the problem is already solved coordinate by coordinate.
- *Sampled detector clicks*: `c01` frequency demos and `c11.demo.cloud` already sample densities.
- *The quantisation table*: nothing to compute.
