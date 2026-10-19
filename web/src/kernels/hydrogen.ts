// Kernel of the hydrogen views (chapter C11). Pure functions: no DOM, no clock, no graphics.
//
// Every formula here is taken from evidence/derivations/c11/DERIVATION.md (checked by
// evidence/derivations/c11/REVIEW.md); the result number stands beside each function.
// Reference implementation and golden values: numerics/src/Hydrogen.jl ->
// web/tests/golden/hydrogen.json (the reference uses the general Laguerre and Legendre
// formulas in exact arithmetic; this file uses the expanded closed forms).
//
// MODEL. Spinless nonrelativistic two-body Coulomb problem, Z = 1. psi_nlm is a function of
// the RELATIVE coordinate r = r_e - r_p (Result 1.3), not of the electron position.
// UNITS. Lengths in a_mu = a_0 (1 + m_e/m_p) (reduced mass, Result 2.2); x = r / a_mu.
//   R_nl in a_mu^(-3/2); psi in a_mu^(-3/2); densities per volume in a_mu^(-3);
//   the radial density x^2 R^2 in a_mu^(-1). Energies use the reduced mass mu unless a
//   function says otherwise.
// PHASES. Condon-Shortley (Result 4.1): Y_l^{-m} = (-1)^m conj(Y_l^m), Y_1^{+-1} = -+ ...
//
// Normalisation is not re-derived numerically here: Result 3.2 (radial, exact for n <= 6),
// Result 4.1 (81 exact inner products) and Result 5.1 (14 exact norms) establish it, and
// numerics/test/runtests.jl repeats those checks in exact rational arithmetic.

export type Complex = readonly [number, number];
export type Vec3 = readonly [number, number, number];
/** a source of uniform numbers in [0, 1), e.g. ctx.random of the demo harness or makeRng(seed) */
export type Uniform = () => number;

// ── constants (CODATA 2022, sources/codata-2022/allascii.txt; DERIVATION.md Result 8.1) ──
/** m_e / m_p, line 117 "electron-proton mass ratio" */
export const M_E_OVER_M_P = 5.446170214889e-4;
/** a_0 in m (infinite nuclear mass), line 61 "Bohr radius" */
export const A_0_M = 5.29177210544e-11;
/** R_infinity in 1/m, line 309 "Rydberg constant" */
export const RYDBERG_PER_M = 10973731.568157;
/** h in J/Hz (exact), line 271 */
export const PLANCK_J_S = 6.62607015e-34;
/** c in m/s (exact), line 330 */
export const LIGHT_M_PER_S = 299792458;
/** e in C (exact), line 132; also 1 eV in J, line 124 */
export const ELEMENTARY_CHARGE_C = 1.602176634e-19;

/** Result 1b.1 and 2.2 for a mass ratio q = m_e/m_p: a = m_e/M, b = m_p/M, a_mu/a_0 = 1 + q, mu/m_e = 1/(1+q). */
export function massFractions(q: number = M_E_OVER_M_P): { q: number; a: number; b: number; aMuOverA0: number; muOverMe: number } {
  if (!(q >= 0)) throw new Error('hydrogen: the mass ratio m_e/m_p must not be negative');
  return { q, a: q / (1 + q), b: 1 / (1 + q), aMuOverA0: 1 + q, muOverMe: 1 / (1 + q) };
}
/** a_mu in m for the mass ratio q (Result 2.2: a_mu = a_0 (1 + m_e/m_p)) */
export function aMuMetres(q: number = M_E_OVER_M_P): number { return A_0_M * (1 + q); }

export type MassConvention = 'reduced' | 'electron';
/**
 * Result 2.2 / 8.2: E_n = -eta h c R_inf / n^2 with eta = mu/m_e = 1/(1+q) for the reduced
 * mass ('reduced') and eta = 1 for infinite nuclear mass ('electron'). Internal energy of the
 * relative motion, not the total energy of a moving atom (Result 1b.3).
 */
export function energyLevel(n: number, convention: MassConvention = 'reduced', q: number = M_E_OVER_M_P): { eV: number; J: number } {
  checkN(n);
  const eta = convention === 'reduced' ? 1 / (1 + q) : 1;
  const J = -(eta * PLANCK_J_S * LIGHT_M_PER_S * RYDBERG_PER_M) / (n * n);
  return { eV: J / ELEMENTARY_CHARGE_C, J };
}
/** hbar / |E_1(mu)| in s: the unit of the dimensionless time tau = |E_1(mu)| t / hbar; hbar = h / (2 pi) */
export function timeUnitSeconds(q: number = M_E_OVER_M_P): number {
  return PLANCK_J_S / (2 * Math.PI) / Math.abs(energyLevel(1, 'reduced', q).J);
}
/**
 * Result 1b.2: psi(t) = exp(-i E_n t / hbar) psi(0) and E_n = -|E_1| / n^2, so the phase of a
 * stationary state advances by tau / n^2, tau = |E_1| t / hbar. The density does not change.
 */
export function stationaryPhase(n: number, tau: number): number { checkN(n); return tau / (n * n); }

function checkN(n: number): void { if (!(n === 1 || n === 2 || n === 3)) throw new Error(`hydrogen: n = ${n} is outside the kernel (n <= 3)`); }
function checkNL(n: number, l: number): void {
  checkN(n);
  if (!(Number.isInteger(l) && l >= 0 && l < n)) throw new Error(`hydrogen: l = ${l} is not allowed for n = ${n}`);
}
function checkLM(l: number, m: number): void {
  if (!(l === 0 || l === 1 || l === 2) || !Number.isInteger(m) || Math.abs(m) > l) throw new Error(`hydrogen: (l, m) = (${l}, ${m}) is outside the kernel (l <= 2)`);
}

// ── Result 5.1: the six radial functions R_nl a_mu^(3/2), x = r / a_mu ───────────────────
const SQRT2 = Math.SQRT2, SQRT3 = Math.sqrt(3), SQRT5 = Math.sqrt(5), SQRT6 = Math.sqrt(6), SQRT30 = Math.sqrt(30);

export function radialR(n: number, l: number, x: number): number {
  checkNL(n, l);
  if (n === 1) return 2 * Math.exp(-x);
  if (n === 2) return l === 0 ? ((2 - x) * Math.exp(-x / 2)) / (2 * SQRT2) : (x * Math.exp(-x / 2)) / (2 * SQRT6);
  const e = Math.exp(-x / 3);
  if (l === 0) return (2 * (27 - 18 * x + 2 * x * x) * e) / (81 * SQRT3);
  if (l === 1) return (4 * x * (6 - x) * e) / (81 * SQRT6);
  return (4 * x * x * e) / (81 * SQRT30);
}
/** radial probability density x^2 R_nl(x)^2 in 1/a_mu: the density of |r|, NOT the density per volume */
export function radialDensity(n: number, l: number, x: number): number {
  const r = radialR(n, l, x);
  return x * x * r * r;
}

// ── Result 7.2: F_nl(x) = 1 - exp(-2x/n) Q_nl(x) ─────────────────────────────────────────
const TAIL: Record<string, readonly number[]> = {
  '1,0': [1, 2, 2],
  '2,0': [1, 1, 1 / 2, 0, 1 / 8],
  '2,1': [1, 1, 1 / 2, 1 / 6, 1 / 24],
  '3,0': [1, 2 / 3, 2 / 9, 0, 4 / 81, -8 / 729, 8 / 6561],
  '3,1': [1, 2 / 3, 2 / 9, 4 / 81, 2 / 243, -4 / 2187, 4 / 6561],
  '3,2': [1, 2 / 3, 2 / 9, 4 / 81, 2 / 243, 4 / 3645, 4 / 32805],
};
/** coefficients of Q_nl in ascending powers of x */
export function tailPolynomial(n: number, l: number): readonly number[] { checkNL(n, l); return TAIL[`${n},${l}`]; }
function horner(c: readonly number[], x: number): number {
  let s = 0;
  for (let i = c.length - 1; i >= 0; i--) s = s * x + c[i];
  return s;
}
/** probability that |r| <= x a_mu */
export function radialCdf(n: number, l: number, x: number): number {
  if (x <= 0) return 0;
  return 1 - Math.exp((-2 * x) / n) * horner(tailPolynomial(n, l), x);
}

/**
 * The residual bound of radialQuantile: the returned x satisfies |F(x) - p| <= this, with F
 * evaluated in double precision. A sample x = radialQuantile(u) with u uniform is therefore
 * an exact sample of a distribution whose CDF differs from F by at most this bound plus the
 * rounding error of F (measured against the reference: web/tests/kernels/hydrogen.test.ts).
 * 1e-12 is an unvalidated choice; any statistical test with N samples resolves about
 * 1/sqrt(N), so the bound is invisible to every test with N below 1e24.
 */
export const QUANTILE_RESIDUAL = 1e-12;
/**
 * x with F_nl(x) = p, by bisection on the closed-form CDF (F is continuous and strictly
 * increasing on x > 0 because its derivative x^2 R^2 is positive except at isolated nodes).
 * No truncation radius: the bracket is extended until F(hi) >= p, so no probability is cut.
 */
export function radialQuantile(n: number, l: number, p: number): number {
  checkNL(n, l);
  if (!(p >= 0 && p < 1)) throw new Error(`hydrogen: radialQuantile needs 0 <= p < 1, got ${p}`);
  if (p === 0) return 0;
  let lo = 0, hi = n * n;
  while (radialCdf(n, l, hi) < p) { lo = hi; hi *= 2; if (hi > 1e6) throw new Error('hydrogen: radialQuantile could not bracket p'); }
  // x^2 R^2 <= 1 for n <= 3 (its maxima are below 0.6 / a_mu), so a bracket of width w
  // bounds the residual by w; stop well below QUANTILE_RESIDUAL or at the double spacing
  for (let i = 0; i < 200 && hi - lo > 1e-14; i++) {
    const mid = 0.5 * (lo + hi);
    if (mid <= lo || mid >= hi) break;
    if (radialCdf(n, l, mid) < p) lo = mid; else hi = mid;
  }
  const x = 0.5 * (lo + hi);
  if (!(Math.abs(radialCdf(n, l, x) - p) <= QUANTILE_RESIDUAL)) throw new Error(`hydrogen: radialQuantile residual above ${QUANTILE_RESIDUAL} at p = ${p}`);
  return x;
}
/** Result 7.3: radius of the sphere that encloses probability p, for every m (not a density isosurface) */
export function enclosedProbabilityRadius(n: number, l: number, p: number): number {
  if (!(p > 0 && p < 1)) throw new Error('hydrogen: enclosed probability needs 0 < p < 1');
  return radialQuantile(n, l, p);
}

// ── Result 7.1: moments, exact ───────────────────────────────────────────────────────────
/** <r>/a_mu = (3n^2 - l(l+1))/2, <r^2>/a_mu^2 = n^2 (5n^2 + 1 - 3l(l+1))/2, <1/r> a_mu = 1/n^2 */
export function radialMoments(n: number, l: number): { r: number; r2: number; inverseR: number } {
  checkNL(n, l);
  const L = l * (l + 1);
  return { r: (3 * n * n - L) / 2, r2: (n * n * (5 * n * n + 1 - 3 * L)) / 2, inverseR: 1 / (n * n) };
}

/**
 * Nodes of R_nl at x > 0: zeros of the polynomial factors of Result 5.1.
 * 2s: 2 - x; 3s: 2x^2 - 18x + 27, x = (9 -+ 3 sqrt 3)/2; 3p: 6 - x.
 */
export function radialNodes(n: number, l: number): number[] {
  checkNL(n, l);
  if (n === 2 && l === 0) return [2];
  if (n === 3 && l === 0) return [(9 - 3 * SQRT3) / 2, (9 + 3 * SQRT3) / 2];
  if (n === 3 && l === 1) return [6];
  return [];
}
/**
 * The most probable radius: the global maximum of x^2 R_nl^2, for n <= 2.
 * 1s: d/dx (x^2 e^{-2x}) = 2x(1 - x) e^{-2x}, zero at x = 1.
 * 2p: d/dx (x^4 e^{-x}) = x^3 (4 - x) e^{-x}, zero at x = 4.
 * 2s: d/dx (x^2 (2-x)^2 e^{-x}) = x (2-x) (x^2 - 6x + 4) e^{-x}, zeros x = 3 -+ sqrt 5 (x = 2 is the
 *     node); the two local maxima are at 3 - sqrt 5 and 3 + sqrt 5 and the outer one is the larger
 *     (compared numerically in the reference, numerics/src/Hydrogen.jl radial_maxima).
 */
export function mostProbableRadius(n: number, l: number): number {
  checkNL(n, l);
  if (n === 1) return 1;
  if (n === 2) return l === 0 ? 3 + SQRT5 : 4;
  throw new Error('hydrogen: mostProbableRadius is provided for n <= 2 only');
}
/** all local maxima of x^2 R_nl^2 for n <= 2, ascending in x */
export function radialDensityMaxima(n: number, l: number): number[] {
  checkNL(n, l);
  if (n === 1) return [1];
  if (n === 2) return l === 0 ? [3 - SQRT5, 3 + SQRT5] : [4];
  throw new Error('hydrogen: radialDensityMaxima is provided for n <= 2 only');
}

// ── Result 4.1: spherical harmonics, l <= 2, Condon-Shortley ─────────────────────────────
const PI = Math.PI;
/** Y_l^m(theta, phi) */
export function ylm(l: number, m: number, theta: number, phi: number): Complex {
  const st = Math.sin(theta), ct = Math.cos(theta);
  return ylmDirection(l, m, st * Math.cos(phi), st * Math.sin(phi), ct);
}
/**
 * Y_l^m at the unit vector (ux, uy, uz): cos(theta) = uz, sin(theta) e^{+-i phi} = ux +- i uy.
 *   Y_0^0 = 1/sqrt(4 pi);  Y_1^0 = sqrt(3/(4 pi)) uz;  Y_1^{+-1} = -+ sqrt(3/(8 pi)) (ux +- i uy);
 *   Y_2^0 = sqrt(5/(16 pi)) (3 uz^2 - 1);  Y_2^{+-1} = -+ sqrt(15/(8 pi)) uz (ux +- i uy);
 *   Y_2^{+-2} = sqrt(15/(32 pi)) (ux +- i uy)^2.
 */
export function ylmDirection(l: number, m: number, ux: number, uy: number, uz: number): Complex {
  checkLM(l, m);
  if (l === 0) return [1 / Math.sqrt(4 * PI), 0];
  const s = m > 0 ? 1 : -1;            // sign of m: (ux + i s uy)
  if (l === 1) {
    if (m === 0) return [Math.sqrt(3 / (4 * PI)) * uz, 0];
    const c = -s * Math.sqrt(3 / (8 * PI));      // m = +1: minus; m = -1: plus
    return [c * ux, c * s * uy];
  }
  if (m === 0) return [Math.sqrt(5 / (16 * PI)) * (3 * uz * uz - 1), 0];
  if (Math.abs(m) === 1) {
    const c = -s * Math.sqrt(15 / (8 * PI)) * uz;
    return [c * ux, c * s * uy];
  }
  const c = Math.sqrt(15 / (32 * PI));           // (ux + i s uy)^2 = ux^2 - uy^2 + 2 i s ux uy
  return [c * (ux * ux - uy * uy), c * 2 * s * ux * uy];
}

/** psi_nlm at the relative position (x, y, z) in a_mu; value in a_mu^(-3/2). Result 5.1: psi = R_nl Y_l^m. */
export function psi(n: number, l: number, m: number, x: number, y: number, z: number): Complex {
  checkNL(n, l); checkLM(l, m);
  const r = Math.hypot(x, y, z);
  const R = radialR(n, l, r);
  if (r === 0) return l === 0 ? [R / Math.sqrt(4 * PI), 0] : [0, 0];   // R_nl(0) = 0 for l > 0
  const [yr, yi] = ylmDirection(l, m, x / r, y / r, z / r);
  return [R * yr, R * yi];
}

// ── the states of the views (n <= 2) ─────────────────────────────────────────────────────
export type StateKey = '1s' | '2s' | '2p0' | '2p+1' | '2p-1' | '2px' | '2py';
export interface HState {
  key: StateKey; n: number; l: number;
  /** m for an eigenstate of L_z; null for the real combinations, which are not */
  m: number | null;
  /** psi = sum_k c_k psi_{n l m_k}: the declared superposition (one term for an eigenstate) */
  terms: ReadonlyArray<{ m: number; c: Complex }>;
  /** |Y|^2 = (1/(4 pi)) (1 + c2 P_2(rhat . axis)): c2 = 0 (s), 2 (lobes along axis), -1 (ring about axis) */
  c2: number; axis: Vec3;
  /** density of the azimuth about the z axis: uniform for eigenstates of L_z */
  azimuth: 'uniform' | 'cos2' | 'sin2';
}
const INV_SQRT2 = 1 / SQRT2;
/**
 * The real 2p orbitals are DECLARED superpositions, not m-eigenstates:
 *   2p_x = (psi_{2,1,-1} - psi_{2,1,+1}) / sqrt 2,   2p_y = i (psi_{2,1,-1} + psi_{2,1,+1}) / sqrt 2.
 * With Result 4.1 their angular factors are sqrt(3/(4 pi)) x/r and sqrt(3/(4 pi)) y/r: real functions.
 * |Y_1^0|^2 = (3/(4 pi)) t^2 = (1/(4 pi)) (1 + 2 P_2(t)); |Y_1^{+-1}|^2 = (3/(8 pi)) (1 - t^2) = (1/(4 pi)) (1 - P_2(t)).
 */
export const STATES: Readonly<Record<StateKey, HState>> = {
  '1s': { key: '1s', n: 1, l: 0, m: 0, terms: [{ m: 0, c: [1, 0] }], c2: 0, axis: [0, 0, 1], azimuth: 'uniform' },
  '2s': { key: '2s', n: 2, l: 0, m: 0, terms: [{ m: 0, c: [1, 0] }], c2: 0, axis: [0, 0, 1], azimuth: 'uniform' },
  '2p0': { key: '2p0', n: 2, l: 1, m: 0, terms: [{ m: 0, c: [1, 0] }], c2: 2, axis: [0, 0, 1], azimuth: 'uniform' },
  '2p+1': { key: '2p+1', n: 2, l: 1, m: 1, terms: [{ m: 1, c: [1, 0] }], c2: -1, axis: [0, 0, 1], azimuth: 'uniform' },
  '2p-1': { key: '2p-1', n: 2, l: 1, m: -1, terms: [{ m: -1, c: [1, 0] }], c2: -1, axis: [0, 0, 1], azimuth: 'uniform' },
  '2px': { key: '2px', n: 2, l: 1, m: null, terms: [{ m: -1, c: [INV_SQRT2, 0] }, { m: 1, c: [-INV_SQRT2, 0] }], c2: 2, axis: [1, 0, 0], azimuth: 'cos2' },
  '2py': { key: '2py', n: 2, l: 1, m: null, terms: [{ m: -1, c: [0, INV_SQRT2] }, { m: 1, c: [0, INV_SQRT2] }], c2: 2, axis: [0, 1, 0], azimuth: 'sin2' },
};
export const STATE_KEYS: readonly StateKey[] = ['1s', '2s', '2p0', '2p+1', '2p-1', '2px', '2py'];

/** psi of a view state at the relative position (x, y, z): the coherent sum of its terms */
export function psiState(key: StateKey, x: number, y: number, z: number): Complex {
  const s = STATES[key];
  if (!s) throw new Error(`hydrogen: unknown state '${key}'`);
  let re = 0, im = 0;
  for (const t of s.terms) {
    const [a, b] = psi(s.n, s.l, t.m, x, y, z);
    re += t.c[0] * a - t.c[1] * b;
    im += t.c[0] * b + t.c[1] * a;
  }
  return [re, im];
}
/**
 * The zero set of psi for a view state, besides the radial nodes (spheres |r| = radialNodes):
 * planes through the origin (given by their unit normals) and lines through the origin (given
 * by their directions). From Result 5.1 in Cartesian form: psi_210 ~ z, 2p_x ~ x, 2p_y ~ y
 * vanish on a plane; psi_21+-1 ~ x +- i y vanishes on the z axis only.
 */
export function angularNodes(key: StateKey): { planes: Vec3[]; lines: Vec3[] } {
  switch (key) {
    case '2p0': return { planes: [[0, 0, 1]], lines: [] };
    case '2px': return { planes: [[1, 0, 0]], lines: [] };
    case '2py': return { planes: [[0, 1, 0]], lines: [] };
    case '2p+1': case '2p-1': return { planes: [], lines: [[0, 0, 1]] };
    default: return { planes: [], lines: [] };
  }
}
/** |psi|^2 per volume, in a_mu^(-3), at the relative position */
export function densityState(key: StateKey, x: number, y: number, z: number): number {
  const [re, im] = psiState(key, x, y, z);
  return re * re + im * im;
}
/** arg(psi) in (-pi, pi]; 0 where psi = 0 (the phase is undefined there) */
export function phase(c: Complex): number { return c[0] === 0 && c[1] === 0 ? 0 : Math.atan2(c[1], c[0]); }
export function modulus(c: Complex): number { return Math.hypot(c[0], c[1]); }

// ── exact sampling ───────────────────────────────────────────────────────────────────────
/**
 * mulberry32, the generator of the demo harness (web/src/demo/harness.ts, function rng):
 * 32-bit state, deterministic for a seed. Used by tests; a demo passes ctx.random instead.
 */
export function makeRng(seed: number): Uniform {
  let a = seed >>> 0;
  return () => {
    a = (a + 1831565813) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** a uniform number in [0, 1) with 53 random bits from two draws of a 32-bit source (26 + 27 bits) */
export function uniform53(rand: Uniform): number {
  const hi = Math.floor(rand() * 67108864);      // 2^26
  const lo = Math.floor(rand() * 134217728);     // 2^27
  return (hi * 134217728 + lo) / 9007199254740992;   // / 2^53
}

/** inverse-CDF sample of |r| / a_mu from x^2 R_nl^2 (NOT from R^2), u uniform in [0, 1) */
export function sampleRadius(n: number, l: number, u: number): number { return radialQuantile(n, l, u); }

const THETA_DENSITY: Record<string, readonly number[]> = {
  '0,0': [1 / 2],
  '1,0': [0, 0, 3 / 2],
  '1,1': [3 / 4, 0, -3 / 4],
  '2,0': [5 / 8, 0, -15 / 4, 0, 45 / 8],
  '2,1': [0, 0, 15 / 4, 0, -15 / 4],
  '2,2': [15 / 16, 0, -15 / 8, 0, 15 / 16],
};
const THETA_CDF: Record<string, readonly number[]> = {
  '0,0': [1 / 2, 1 / 2],
  '1,0': [1 / 2, 0, 0, 1 / 2],
  '1,1': [1 / 2, 3 / 4, 0, -1 / 4],
  '2,0': [1 / 2, 5 / 8, 0, -5 / 4, 0, 9 / 8],
  '2,1': [1 / 2, 0, 0, 5 / 4, 0, -3 / 4],
  '2,2': [1 / 2, 15 / 16, 0, -5 / 8, 0, 3 / 16],
};
/**
 * Density h(t) of t = cos(theta) under |Y_l^m|^2 dOmega (the azimuth integrated out):
 * h = 2 pi |Y_l^m|^2 as a polynomial in t, from Result 4.1; depends on |m| only. Ascending powers.
 */
export function thetaDensityCoefficients(l: number, m: number): readonly number[] { checkLM(l, m); return THETA_DENSITY[`${l},${Math.abs(m)}`]; }
/** H(t) = int_{-1}^t h: H(-1) = 0, H(1) = 1. Ascending powers. */
export function thetaCdfCoefficients(l: number, m: number): readonly number[] { checkLM(l, m); return THETA_CDF[`${l},${Math.abs(m)}`]; }
export function thetaCdf(l: number, m: number, t: number): number { return horner(thetaCdfCoefficients(l, m), t); }

function bisect(f: (x: number) => number, lo: number, hi: number, target: number): number {
  for (let i = 0; i < 200; i++) {
    const mid = 0.5 * (lo + hi);
    if (mid <= lo || mid >= hi) break;
    if (f(mid) < target) lo = mid; else hi = mid;
  }
  return 0.5 * (lo + hi);
}
/** inverse-CDF sample of cos(theta) from |Y_l^m|^2: the root of the monotone polynomial H(t) = u, by bisection to the double spacing */
export function sampleCosTheta(l: number, m: number, u: number): number {
  const c = thetaCdfCoefficients(l, m);
  return bisect((t) => horner(c, t), -1, 1, u);
}
/**
 * CDF of the azimuth phi in [0, 2 pi): uniform, phi/(2 pi); density cos^2(phi)/pi (2p_x),
 * phi/(2 pi) + sin(2 phi)/(4 pi); density sin^2(phi)/pi (2p_y), phi/(2 pi) - sin(2 phi)/(4 pi).
 */
export function azimuthCdf(kind: HState['azimuth'], phi: number): number {
  const lin = phi / (2 * PI);
  return kind === 'uniform' ? lin : kind === 'cos2' ? lin + Math.sin(2 * phi) / (4 * PI) : lin - Math.sin(2 * phi) / (4 * PI);
}
export function sampleAzimuth(kind: HState['azimuth'], u: number): number {
  return kind === 'uniform' ? 2 * PI * u : bisect((p) => azimuthCdf(kind, p), 0, 2 * PI, u);
}
/**
 * One exact sample of the relative position from |psi|^2 d^3r, in a_mu. The density factorises
 * as [x^2 R^2] [h(t)] [azimuth density] for every state of the views, so the three coordinates
 * are drawn independently by inverse CDF. Consumes six draws of `rand`.
 */
export function sampleRelative(key: StateKey, rand: Uniform): Vec3 {
  const s = STATES[key];
  const r = sampleRadius(s.n, s.l, uniform53(rand));
  // for the real combinations the polar density is that of |m| = 1: int cos^2(phi) dphi / pi = 1
  const t = sampleCosTheta(s.l, s.m === null ? 1 : s.m, uniform53(rand));
  const phi = sampleAzimuth(s.azimuth, uniform53(rand));
  const st = Math.sqrt(Math.max(0, 1 - t * t));
  return [r * st * Math.cos(phi), r * st * Math.sin(phi), r * t];
}

// ── Result 1b.1: centre of mass; the laboratory densities ────────────────────────────────
/**
 * Centre-of-mass packet |Phi(R)|^2 = f(R) = (pi sigma^2)^(-3/2) exp(-|R|^2 / sigma^2): each
 * component of R is normal with variance sigma^2 / 2. Box-Muller: for two independent standard
 * normals the squared radius rho^2 has CDF 1 - exp(-rho^2/2) and the angle is uniform, so
 * rho = sqrt(-2 ln(1 - u1)), angle = 2 pi u2. Consumes eight draws (the fourth normal is dropped).
 */
export function sampleCentreOfMass(sigma: number, rand: Uniform): Vec3 {
  const s = sigma / SQRT2;
  const r1 = Math.sqrt(-2 * Math.log(1 - uniform53(rand))), a1 = 2 * PI * uniform53(rand);
  const r2 = Math.sqrt(-2 * Math.log(1 - uniform53(rand))), a2 = 2 * PI * uniform53(rand);
  return [s * r1 * Math.cos(a1), s * r1 * Math.sin(a1), s * r2 * Math.cos(a2)];
}
/**
 * One exact sample of the laboratory positions for the factorised state Phi(R) psi(r):
 * R and r are independent, r_e = R + b r, r_p = R - a r (Result 1.1 inverse coordinates).
 * The electron positions have the density rho_e = f * g_b, the proton positions rho_p = f * g~_a.
 */
export function sampleLaboratory(key: StateKey, sigma: number, q: number, rand: Uniform): { electron: Vec3; proton: Vec3; relative: Vec3; centre: Vec3 } {
  const { a, b } = massFractions(q);
  const R = sampleCentreOfMass(sigma, rand);
  const r = sampleRelative(key, rand);
  return {
    electron: [R[0] + b * r[0], R[1] + b * r[1], R[2] + b * r[2]],
    proton: [R[0] - a * r[0], R[1] - a * r[1], R[2] - a * r[2]],
    relative: r, centre: R,
  };
}

/**
 * The same map for many samples at once: centre[i] are samples of the centre of mass for
 * sigma = 1 (so sigma * centre is a sample for the width sigma: f scales with sigma),
 * relative[i] samples of r. Writes r_e = sigma R + b r for `count` samples and r_p = sigma R - a r
 * for as many of the first samples as `proton` has room for. Arrays hold x, y, z per sample.
 */
export function laboratoryPositions(centre: ArrayLike<number>, relative: ArrayLike<number>, sigma: number, q: number,
  electron: Float32Array | Float64Array, proton: Float32Array | Float64Array, count: number): void {
  const { a, b } = massFractions(q);
  for (let i = 0; i < 3 * count; i++) {
    const R = sigma * centre[i];
    electron[i] = R + b * relative[i];
    if (i < proton.length) proton[i] = R - a * relative[i];
  }
}

/**
 * e^{-z} i_0(z) and e^{-z} i_2(z), where i_0(z) = (1/2) int_-1^1 e^{zt} dt = sinh z / z and
 * i_2(z) = (1/2) int_-1^1 e^{zt} P_2(t) dt = sinh z/z - 3 cosh z/z^2 + 3 sinh z/z^3
 * (from int t^2 e^{zt} dt = d^2/dz^2 (2 sinh z / z)). For z < 1 the Taylor series
 *   i_0 = sum_{k even} z^k / (k+1)!,   i_2 = sum_{k even, k >= 2} (z^k / k!) k / ((k+1)(k+3))
 * (term by term from e^{zt} = sum z^k t^k / k!) avoid the cancellation of the closed form;
 * with terms up to k = 20 the first neglected term is below 1e-22 for z < 1.
 */
export function scaledI0(z: number): number {
  if (z < 1) {
    let s = 0, term = 1;
    for (let k = 0; k <= 20; k += 2) { s += term / (k + 1); term *= (z * z) / ((k + 1) * (k + 2)); }
    return s * Math.exp(-z);
  }
  return (1 - Math.exp(-2 * z)) / (2 * z);
}
export function scaledI2(z: number): number {
  if (z < 1) {
    let s = 0, term = (z * z) / 2;
    for (let k = 2; k <= 20; k += 2) { s += (term * k) / ((k + 1) * (k + 3)); term *= (z * z) / ((k + 1) * (k + 2)); }
    return s * Math.exp(-z);
  }
  const e = Math.exp(-2 * z);
  return ((1 - e) / (2 * z)) * (1 + 3 / (z * z)) - (3 * (1 + e)) / (2 * z * z);
}

/** number of Simpson panels of labHarmonics (a multiple of 4); an unvalidated choice, its error is measured in the golden test */
export const LAB_PANELS = 2000;
/** half-width of the integration window in units of sigma/b: outside it the Gaussian factor is below exp(-49) */
export const LAB_WINDOW = 7;
/**
 * Laboratory electron density for the Gaussian centre-of-mass packet of width sigma and a
 * relative density g(r) = R_nl(r)^2/(4 pi) (1 + c2 P_2(rhat . e)):
 *
 *   rho_e(x) = int f(x - b r) g(r) d^3r = A_0(|x|) + c2 A_2(|x|) P_2(xhat . e),
 *   A_L(x) = (pi sigma^2)^(-3/2) int_0^inf r^2 R_nl(r)^2 exp(-(x - b r)^2/sigma^2) [e^{-z} i_L(z)] dr,
 *   z = 2 b x r / sigma^2.
 *
 * Derivation: |x - b r|^2 = x^2 + b^2 r^2 - 2 b x r (xhat . rhat); the integral over the
 * directions of r of exp(z xhat.rhat) is 4 pi i_0(z), and of exp(z xhat.rhat) P_2(rhat.e) it is
 * 4 pi i_2(z) P_2(xhat.e): the tensor int dOmega K(xhat.rhat) rhat_i rhat_j is A delta_ij +
 * B xhat_i xhat_j, with 3A + B = 2 pi int K dt and A + B = 2 pi int K t^2 dt, hence
 * int K P_2(rhat.e) = B P_2(xhat.e), B = 2 pi int K P_2 dt. (Checked against a direct
 * three-dimensional quadrature in numerics/test/runtests.jl.)
 *
 * Returns [A_0, A_2] in a_mu^(-3); lengths in a_mu. Composite Simpson rule with LAB_PANELS
 * panels on |r - x/b| <= LAB_WINDOW sigma / b, cut at r = 0.
 * The spherical average of rho_e is A_0, so 4 pi x^2 A_0(x) is the laboratory radial density.
 */
export function labHarmonics(n: number, l: number, sigma: number, b: number, x: number): [number, number] {
  checkNL(n, l);
  if (!(sigma > 0) || !(b > 0 && b <= 1) || !(x >= 0)) throw new Error('hydrogen: labHarmonics needs sigma > 0, 0 < b <= 1, x >= 0');
  const c = x / b, w = (LAB_WINDOW * sigma) / b;
  const lo = Math.max(0, c - w), hi = c + w;
  const h = (hi - lo) / LAB_PANELS;
  const s2 = sigma * sigma;
  // Simpson sums with step h and with step 2h on the same nodes, combined as (16 S_h - S_2h)/15
  // (one Richardson step). No error bound is derived for it: the deviation from the reference
  // is measured in the golden test.
  let a0 = 0, a2 = 0, c0 = 0, c2 = 0;
  for (let i = 0; i <= LAB_PANELS; i++) {
    const r = lo + i * h;
    const d = x - b * r;
    const base = radialDensity(n, l, r) * Math.exp(-(d * d) / s2);
    const z = (2 * b * x * r) / s2;
    const f0 = base * scaledI0(z), f2 = base * scaledI2(z);
    const fine = i === 0 || i === LAB_PANELS ? 1 : i % 2 === 1 ? 4 : 2;
    a0 += fine * f0; a2 += fine * f2;
    if (i % 2 === 0) {
      const coarse = i === 0 || i === LAB_PANELS ? 1 : i % 4 === 2 ? 4 : 2;
      c0 += coarse * f0; c2 += coarse * f2;
    }
  }
  const norm = 1 / Math.pow(PI * s2, 1.5);
  const sh0 = (a0 * h) / 3, sh2 = (a2 * h) / 3, s2h0 = (c0 * 2 * h) / 3, s2h2 = (c2 * 2 * h) / 3;
  return [((16 * sh0 - s2h0) / 15) * norm, ((16 * sh2 - s2h2) / 15) * norm];
}
const P2 = (t: number) => (3 * t * t - 1) / 2;
/** laboratory electron density rho_e at the point (x, y, z), in a_mu^(-3) */
export function labElectronDensity(key: StateKey, sigma: number, q: number, x: number, y: number, z: number): number {
  const s = STATES[key];
  const { b } = massFractions(q);
  const r = Math.hypot(x, y, z);
  const [a0, a2] = labHarmonics(s.n, s.l, sigma, b, r);
  if (s.c2 === 0 || r === 0) return a0;
  const t = (x * s.axis[0] + y * s.axis[1] + z * s.axis[2]) / r;
  return a0 + s.c2 * a2 * P2(t);
}
/**
 * Profiles along the line through the origin with direction cosine t to the state's axis
 * (t = 1: along the lobes of 2p_0; t = 0: across them), at the distances xs (a_mu):
 * the relative density |psi|^2 and the laboratory electron density rho_e, both in a_mu^(-3).
 */
export function lineProfiles(key: StateKey, sigma: number, q: number, t: number, xs: readonly number[]): { relative: number[]; laboratory: number[] } {
  const s = STATES[key];
  const { b } = massFractions(q);
  const relative: number[] = [], laboratory: number[] = [];
  for (const x of xs) {
    const R = radialR(s.n, s.l, Math.abs(x));
    relative.push(((R * R) / (4 * PI)) * (1 + s.c2 * P2(t)));
    const [a0, a2] = labHarmonics(s.n, s.l, sigma, b, Math.abs(x));
    laboratory.push(a0 + s.c2 * a2 * P2(t));
  }
  return { relative, laboratory };
}
/** radial profiles at the radii xs: x^2 R^2 (relative) and 4 pi x^2 A_0(x) (laboratory electron), both in 1/a_mu */
export function radialProfiles(key: StateKey, sigma: number, q: number, xs: readonly number[]): { relative: number[]; laboratory: number[] } {
  const s = STATES[key];
  const { b } = massFractions(q);
  return {
    relative: xs.map((x) => radialDensity(s.n, s.l, x)),
    laboratory: xs.map((x) => 4 * PI * x * x * labHarmonics(s.n, s.l, sigma, b, x)[0]),
  };
}

// ── goodness-of-fit helpers used by the tests (pure, so they live here) ──────────────────
/** Kolmogorov-Smirnov statistic sup |F_N - F| of a sample against a continuous CDF */
export function ksStatistic(sample: readonly number[], cdf: (x: number) => number): number {
  const s = [...sample].sort((p, q) => p - q);
  const N = s.length;
  let d = 0;
  for (let i = 0; i < N; i++) {
    const f = cdf(s[i]);
    d = Math.max(d, (i + 1) / N - f, f - i / N);
  }
  return d;
}
