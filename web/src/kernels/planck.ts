// Kernel of the demo c00.demo.planck: the radiation law, its limiting form and their ratio
// (chapter c00, figure c00.fig.planck). Pure functions: no DOM, no clock, no graphics.
// Reference implementation and golden values: numerics/src/c00_reference.jl via
// numerics/generate/c00_golden.jl -> web/tests/golden/planck.json.
//
// Formulas (content/c00-theorie/de.tex):
//   c00.eq.planck     u(nu, T)    = (8 pi h nu^3 / c^3) / (exp(h nu/(k_B T)) - 1)
//   c00.eq.grenzform  u_kl(nu, T) = 8 pi nu^2 k_B T / c^3,   u/u_kl = x/(exp(x) - 1),  x = h nu/(k_B T)
//   c00.eq.schranken  exp(-x) <= x/(exp(x) - 1) <= 1/(1 + x/2)          (x > 0)
//   figure (a)        s = h nu/(k_B T_0), tau = T/T_0, u_0 = 8 pi (k_B T_0)^3/(h^2 c^3):
//                     u/u_0 = s^3/(exp(s/tau) - 1),   u_kl/u_0 = s^2 tau
//   maximum           at fixed T, u has its maximum in nu where x = PEAK_X, the positive root
//                     of 3 (1 - exp(-x)) = x (set the derivative of nu^3/(exp(a nu) - 1) to 0)
// Units: SI. nu in Hz, T in K, u and u_kl in J s m^-3 (energy per volume and per frequency).
// Domain: nu > 0, T > 0 as in the chapter; at x = 0 the ratio returns its limit 1.

// ── constants: CODATA 2022, sources/codata-2022/allascii.txt (all three exact) ──
/** h in J/Hz, line 271 "Planck constant" */
export const H_J_S = 6.62607015e-34;
/** k_B in J/K, line 62 "Boltzmann constant" */
export const K_B_J_PER_K = 1.380649e-23;
/** c in m/s, line 330 "speed of light in vacuum" */
export const C_M_PER_S = 299792458;

function checkPositive(v: number, what: string): void {
  if (!(v > 0) || !Number.isFinite(v)) throw new Error(`planck: ${what} must be positive and finite`);
}

/** x = h nu / (k_B T) */
export function exponentX(nuHz: number, T: number): number {
  checkPositive(nuHz, 'the frequency'); checkPositive(T, 'the temperature');
  return (H_J_S * nuHz) / (K_B_J_PER_K * T);
}

/** u(nu, T) in J s m^-3, c00.eq.planck */
export function spectralDensity(nuHz: number, T: number): number {
  const x = exponentX(nuHz, T);
  return (8 * Math.PI * H_J_S * nuHz ** 3) / C_M_PER_S ** 3 / Math.expm1(x);
}

/** u_kl(nu, T) in J s m^-3, c00.eq.grenzform */
export function limitingForm(nuHz: number, T: number): number {
  checkPositive(nuHz, 'the frequency'); checkPositive(T, 'the temperature');
  return (8 * Math.PI * nuHz ** 2 * K_B_J_PER_K * T) / C_M_PER_S ** 3;
}

/** u/u_kl = x/(exp(x) - 1); 1 at x = 0 (the limit); 0 where exp(x) overflows */
export function ratio(x: number): number {
  if (!(x >= 0)) throw new Error('planck: x must not be negative');
  if (x === 0) return 1;
  const d = Math.expm1(x);
  return Number.isFinite(d) ? x / d : 0;
}
/** lower bound exp(-x) of the ratio, c00.eq.schranken */
export function lowerBound(x: number): number { return Math.exp(-x); }
/** upper bound 1/(1 + x/2) of the ratio, c00.eq.schranken */
export function upperBound(x: number): number { return 1 / (1 + x / 2); }

/** u/u_0 = s^3/(exp(s/tau) - 1), s = h nu/(k_B T_0), tau = T/T_0 (figure c00.fig.planck (a)); 0 at s = 0 */
export function reducedU(s: number, tau: number): number {
  checkPositive(tau, 'T/T_0');
  if (!(s >= 0)) throw new Error('planck: s must not be negative');
  if (s === 0) return 0;
  const d = Math.expm1(s / tau);
  return Number.isFinite(d) ? s ** 3 / d : 0;
}
/** u_kl/u_0 = s^2 tau */
export function reducedUkl(s: number, tau: number): number {
  checkPositive(tau, 'T/T_0');
  return s * s * tau;
}
/** u_0 = 8 pi (k_B T_0)^3/(h^2 c^3) in J s m^-3 */
export function u0(T0: number): number {
  checkPositive(T0, 'the reference temperature');
  return (8 * Math.PI * (K_B_J_PER_K * T0) ** 3) / (H_J_S ** 2 * C_M_PER_S ** 3);
}
/** s = h nu/(k_B T_0) -> nu in Hz */
export function frequencyOfS(s: number, T0: number): number { return (s * K_B_J_PER_K * T0) / H_J_S; }

/**
 * PEAK_X: the positive root of g(x) = x - 3 (1 - exp(-x)), by Newton's method from x = 3
 * (g is convex for x > 0 with g(0) = 0, g'(0) = -2 < 0, so the positive root is unique and
 * Newton from the right converges monotonically). Stops when the step is below 4 ulp.
 */
function solvePeak(): number {
  let x = 3;
  for (let i = 0; i < 60; i++) {
    const e = Math.exp(-x);
    const step = (x - 3 * (1 - e)) / (1 - 3 * e);
    x -= step;
    if (Math.abs(step) < 4 * Number.EPSILON * x) break;
  }
  return x;
}
export const PEAK_X: number = solvePeak();
/** x^3/(exp(x) - 1) at x = PEAK_X: the maximum of u/u_0 at tau = 1 */
export const PEAK_VALUE: number = PEAK_X ** 3 / Math.expm1(PEAK_X);
/** frequency of the maximum of u(., T): PEAK_X k_B T / h, in Hz */
export function peakFrequency(T: number): number {
  checkPositive(T, 'the temperature');
  return (PEAK_X * K_B_J_PER_K * T) / H_J_S;
}
/** the maximum of u/u_0 at tau = T/T_0: at s = PEAK_X tau, value PEAK_VALUE tau^3 */
export function reducedPeak(tau: number): { s: number; value: number } {
  checkPositive(tau, 'T/T_0');
  return { s: PEAK_X * tau, value: PEAK_VALUE * tau ** 3 };
}
