// Kernel particle: the numbers of chapter c05 (the particle on a line) that its demos show,
// c05.demo.zerfliessen and c05.demo.detektor (design: docs/plan/lec78/DEMOS.md).
//
// Pure functions: no DOM, no clock, no randomness. Golden test: web/tests/kernels/particle.test.ts
// against web/tests/golden/particle.json, written by the independent reference
// numerics/generate/particle_golden.jl (BigFloat quadrature of the integrals, not these closed forms).
//
// UNITS (no physical constant enters): lengths in sigma0, wave numbers in 1/sigma0, momenta in
// hbar/sigma0 (so p and k carry the same number), times in tau0 = 2 m sigma0^2 / hbar
// (c05.eq.zerfliessen at sigma = sigma0). Then hbar/(2m) = 1 and, for a packet of width sigma,
// tau = sigma^2, the drift hbar k0 t / m is 2 k0 t, and the phase hbar k^2 t / 2m is k^2 t.
//
// THE PACKET (lecture 7 exercise, centred at a, carrier k0; lecture 8 has k0 = 0):
//   Psi(x,0) = (2 pi sigma^2)^(-1/4) exp(-(x-a)^2/(4 sigma^2)) exp(i k0 x).
// Its Fourier transform (c05.eq.phik, a Gaussian integral):
//   PsiT(k) = (2 sigma^2/pi)^(1/4) exp(-sigma^2 (k-k0)^2) exp(-i (k-k0) a).            (D1)
// Substituting k = k0 + q in c05.eq.freieloesung:
//   Psi(x,t) = exp(i k0 x - i k0^2 t) Psi_0(x - 2 k0 t, t),                              (D2)
// with Psi_0 the packet of lecture 8 (eq:gausspaket), here with s = t/sigma^2:
//   Psi_0(x,t) = (sigma (1 + i s) sqrt(2 pi))^(-1/2) exp(-(x-a)^2 / (4 sigma^2 (1 + i s))).
// So |Psi(x,t)|^2 is a Gaussian about a + 2 k0 t of width sigma_t = sigma sqrt(1 + t^2/sigma^4)
// (c05.eq.zerfliessen), and the momentum wave function (c05.eq.impulszeit) is
//   Phi(u,t) = PsiT(u) exp(-i u^2 t),   |Phi|^2 Gaussian about k0 of width 1/(2 sigma).
// The box state (lecture 7, Beispiel): Psi(x) = exp(i k x)/sqrt 2 on [-1, 1], zero outside.
import { abs2, cmul, phaseFactor, type Complex } from './hilbert';
import { gaussDensity, gaussInterval } from './prob';

const SQRT_2PI = Math.sqrt(2 * Math.PI);

// ── widths and times ─────────────────────────────────────────────────────────────────────
/** tau / tau0 = sigma^2 */
export function spreadTime(sigma: number): number { return sigma * sigma; }
/** sigma_t = sigma sqrt(1 + t^2/tau^2) */
export function spreadWidth(sigma: number, t: number): number { const s = t / spreadTime(sigma); return sigma * Math.sqrt(1 + s * s); }
/** sigma_p = hbar/(2 sigma), in units hbar/sigma0 */
export function momentumWidth(sigma: number): number { return 1 / (2 * sigma); }
/** centre of |Psi(x,t)|^2: a + hbar k0 t / m */
export function packetCentre(a: number, k0: number, t: number): number { return a + 2 * k0 * t; }

// ── position space ───────────────────────────────────────────────────────────────────────
/** Psi(x,t) of the free Gaussian packet, D2 with eq:gausspaket */
export function freePsi(x: number, t: number, sigma: number, a: number, k0: number): Complex {
  const s = t / spreadTime(sigma);
  const y = x - 2 * k0 * t - a;
  // 1/(1 + i s) = (1 - i s)/(1 + s^2); the exponent -(y^2/4 sigma^2)(1 - i s)/(1 + s^2)
  const d = 1 + s * s;
  const e = (y * y) / (4 * sigma * sigma * d);
  const mod = Math.pow(d, -0.25) / Math.sqrt(sigma * SQRT_2PI) * Math.exp(-e);
  // (1 + i s)^(-1/2) has argument -atan(s)/2
  const arg = -0.5 * Math.atan(s) + e * s + k0 * x - k0 * k0 * t;
  return [mod * Math.cos(arg), mod * Math.sin(arg)];
}
/** |Psi(x,t)|^2: a Gaussian about a + 2 k0 t of width sigma_t */
export function freeDensity(x: number, t: number, sigma: number, a: number, k0: number): number {
  const w = spreadWidth(sigma, t);
  return gaussDensity((x - packetCentre(a, k0, t)) / w) / w;
}
/** P[|x| > X] at time t: the weight outside the drawn window */
export function outsideWindow(X: number, t: number, sigma: number, a: number, k0: number): number {
  const w = spreadWidth(sigma, t), c = packetCentre(a, k0, t);
  return 1 - gaussInterval((-X - c) / w, (X - c) / w);
}

// ── momentum space ───────────────────────────────────────────────────────────────────────
/** PsiT(k) = Phi(k, 0), D1 */
export function packetFT(k: number, sigma: number, a: number, k0: number): Complex {
  const q = k - k0;
  const mod = Math.pow((2 * sigma * sigma) / Math.PI, 0.25) * Math.exp(-sigma * sigma * q * q);
  return [mod * Math.cos(-q * a), mod * Math.sin(-q * a)];
}
/** Phi(u,t) = PsiT(u) exp(-i u^2 t) (c05.eq.impulszeit) */
export function momentumPhi(u: number, t: number, sigma: number, a: number, k0: number): Complex {
  return cmul(packetFT(u, sigma, a, k0), phaseFactor(-u * u * t));
}
/** |Phi(u,t)|^2, the same for every t: a Gaussian about k0 of width 1/(2 sigma) */
export function momentumDensity(u: number, sigma: number, k0: number): number {
  const w = momentumWidth(sigma);
  return gaussDensity((u - k0) / w) / w;
}
/** sigma_t sigma_p in units of hbar */
export function widthProduct(sigma: number, t: number): number { return spreadWidth(sigma, t) * momentumWidth(sigma); }

// ── the detector (c05.eq.ortsdetektor, c05.eq.intervall) ─────────────────────────────────
export type State = 'gauss' | 'box';
/** the state at t = 0: the Gaussian packet (sigma = 1, centre 0) or the box state, carrier k */
export function stateAt(state: State, x: number, k: number): Complex {
  if (state === 'gauss') return freePsi(x, 0, 1, 0, k);
  return Math.abs(x) <= 1 ? [Math.cos(k * x) / Math.SQRT2, Math.sin(k * x) / Math.SQRT2] : [0, 0];
}
/** p(x) = |Psi(x)|^2; independent of k */
export function stateDensity(state: State, x: number): number {
  return state === 'gauss' ? gaussDensity(x) : Math.abs(x) <= 1 ? 0.5 : 0;
}
// 5-point Gauss-Legendre rule on [-1, 1]
const GL5_X = [0, 0.5384693101056831, -0.5384693101056831, 0.906179845938664, -0.906179845938664];
const GL5_W = [0.5688888888888889, 0.47862867049936647, 0.47862867049936647, 0.23692688505618908, 0.23692688505618908];
/** P[x in [a, b]] = int_a^b |Psi|^2 dx */
export function intervalProbability(state: State, a: number, b: number): number {
  if (a > b) [a, b] = [b, a];
  if (state === 'box') return Math.max(0, Math.min(b, 1) - Math.max(a, -1)) / 2;
  // a narrow strip: Gauss-Legendre instead of the difference of two tails (cancellation)
  if (b - a < 1e-3) return 2 * glMean(state, (a + b) / 2, (b - a) / 2) * ((b - a) / 2);
  return gaussInterval(a, b);
}
/** mean of p over [m - h, m + h], 5-point Gauss-Legendre (exact enough for h < 1e-3) */
function glMean(state: State, m: number, h: number): number {
  let s = 0;
  for (let i = 0; i < 5; i++) s += GL5_W[i] * stateDensity(state, m + h * GL5_X[i]);
  return s / 2;
}
/** P_eps / eps for the strip [c - eps/2, c + eps/2]; tends to p(c) */
export function stripRatio(state: State, c: number, eps: number): number {
  // formed from the centre and the half-width, so that eps is not rounded through c +- eps/2
  if (state === 'gauss' && eps < 1e-3) return glMean(state, c, eps / 2);
  return intervalProbability(state, c - eps / 2, c + eps / 2) / eps;
}
/** |Psi(y)|^2 after the detector: (F Psi)(y) = Psi(y) on [a, b], 0 outside; F^2 = F */
export function detected(state: State, y: number, k: number, a: number, b: number): Complex {
  return y >= Math.min(a, b) && y <= Math.max(a, b) ? stateAt(state, y, k) : [0, 0];
}
export { abs2 };
