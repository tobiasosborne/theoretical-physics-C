// Kernel hilbert: the numbers of chapter c03 (Werkzeugkasten Hilbertraum) that its demos show.
//
// Pure functions: no DOM, no clock, no randomness. Golden test: web/tests/kernels/hilbert.test.ts
// against web/tests/golden/hilbert.json, written by the independent reference
// numerics/generate/hilbert_golden.jl (BigFloat, other algorithms; see there).
//
// CONVENTIONS (chapter c03, as in content/c03-hilbertraum/de.tex):
// - A complex number is a pair [re, im]. The Kreuz operation conjugates every entry and lays the
//   column down as a row (D76); the scalar product is v^dagger w = sum_j v_j^* w_j, antilinear in
//   the FIRST factor (c03.prop.skalarprodukt; the course convention).
// - l^2 test family (c03.v1): the column with entries v_j = j^(-s), j = 1, 2, ...; s = 1 is v_j = 1/j,
//   s = 1/2 is u_j = 1/sqrt(j), s = 0 the column of ones (c03.ex.rate, c03.ex.einsen). Its squared
//   moduli are |v_j|^2 = j^(-2s). The bounds are the two comparisons with the integral of the
//   decreasing function x^(-2s) used in c03.eq.rate:
//     upper  S_N <= 1 + int_1^N x^(-2s) dx       (= 2 - 1/N at s = 1, the first line of c03.eq.rate)
//     lower  S_N >= int_1^(N+1) x^(-2s) dx       (= ln(N+1) at s = 1/2, the second line)
//   For s > 1/2 the upper bound stays below 2s/(2s-1) (= 2 at s = 1) and the limit is
//   sum_j j^(-2s) (the Riemann zeta function at 2s; pi^2/6 at s = 1).
// - L^2 test functions (c03.v2): g(x) = exp(-x^2/2) with int_{-X}^{X} |g|^2 = sqrt(pi) erf(X) -> sqrt(pi)
//   (c03.eq.gauss), and the family f_s(x) = (1+|x|)^(-s): s = 1/2 is h(x) = 1/sqrt(1+|x|)
//   (c03.eq.log), s = 0 the constant 1 (c03.eq.eins); int_{-X}^{X} |f_s|^2 = 2 int_0^X (1+x)^(-2s) dx,
//   with limit 2/(2s-1) for s > 1/2 and none for s <= 1/2.
// - c03.fig.komplex: f(x) = m(x) exp(i k x) with a modulus m from the list above; the chapter's
//   function is m = g, k = 2.

export type Complex = readonly [number, number];

// ── complex numbers and the Kreuz operation (Kern, c03.s2) ────────────────────────────────
export const cadd = (a: Complex, b: Complex): Complex => [a[0] + b[0], a[1] + b[1]];
export const cmul = (a: Complex, b: Complex): Complex => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
/** complex conjugate: reflection in the real axis */
export const conj = (a: Complex): Complex => [a[0], -a[1]];
/** |a|^2 = (Re a)^2 + (Im a)^2 */
export const abs2 = (a: Complex): number => a[0] * a[0] + a[1] * a[1];

/** the phase factor e^(i theta) = [cos theta, sin theta] */
export const phaseFactor = (theta: number): Complex => [Math.cos(theta), Math.sin(theta)];
/** the multiple a v, entry by entry */
export function scaleVec(a: Complex, v: readonly Complex[]): Complex[] { return v.map((x) => cmul(a, x)); }

/** the row v^dagger: every entry conjugated (D76) */
export function dagger(v: readonly Complex[]): Complex[] { return v.map(conj); }

/** the terms v_j^* w_j of v^dagger w, j = 1..n (c03.eq.vw) */
export function innerTerms(v: readonly Complex[], w: readonly Complex[]): Complex[] {
  if (v.length !== w.length) throw new Error('hilbert.innerTerms: vectors of different length');
  return v.map((vj, j) => cmul(conj(vj), w[j]));
}
/** the terms v_j w_j of the row-times-column product WITHOUT conjugation (c03.ex.ohne-stern) */
export function plainTerms(v: readonly Complex[], w: readonly Complex[]): Complex[] {
  if (v.length !== w.length) throw new Error('hilbert.plainTerms: vectors of different length');
  return v.map((vj, j) => cmul(vj, w[j]));
}
/** running sums of a list of complex terms: [t_1, t_1 + t_2, ...] (head-to-tail addition) */
export function runningSums(terms: readonly Complex[]): Complex[] {
  const out: Complex[] = [];
  let s: Complex = [0, 0];
  for (const t of terms) { s = cadd(s, t); out.push(s); }
  return out;
}
/** v^dagger w = sum_j v_j^* w_j */
export function inner(v: readonly Complex[], w: readonly Complex[]): Complex {
  return innerTerms(v, w).reduce<Complex>((s, t) => cadd(s, t), [0, 0]);
}

// ── the l^2 family v_j = j^(-s) (Vertiefung c03.v1) ───────────────────────────────────────
/** |v_j|^2 = j^(-2s) */
export function termSquare(s: number, j: number): number { return Math.pow(j, -2 * s); }

/** (y^a - 1)/a evaluated as expm1(a ln y)/a; the limit ln y at a = 0 */
function powm1OverA(lnY: number, a: number): number {
  return a === 0 ? lnY : Math.expm1(a * lnY) / a;
}

// Euler-Maclaurin for sum_j f(j), f(x) = x^(-sigma): B_2k / (2k)!, k = 1..8
const B2K_OVER_FACT = [1 / 12, -1 / 720, 1 / 30240, -1 / 1209600, 1 / 47900160, -691 / 1307674368000, 1 / 74724249600, -3617 / 10670622842880000];
/** direct sums are used up to this index; beyond it the Euler-Maclaurin tail (error far below 1e-16 relative) */
const EM_M = 64;
function directSum(sigma: number, n: number): number {
  let s = 0;
  for (let j = n; j >= 1; j--) s += Math.pow(j, -sigma);       // smallest terms first
  return s;
}
/** sum_{k} B_2k/(2k)! f^(2k-1)(x) for f(x) = x^(-sigma) */
function emDerivativeSeries(sigma: number, x: number): number {
  // f^(m)(x) = (-1)^m sigma (sigma+1) ... (sigma+m-1) x^(-sigma-m)
  let total = 0;
  let poch = sigma;                         // (sigma)_1
  let pw = Math.pow(x, -sigma - 1);         // x^(-sigma-1)
  for (let k = 1; k <= B2K_OVER_FACT.length; k++) {
    const m = 2 * k - 1;
    total += B2K_OVER_FACT[k - 1] * -poch * pw;      // (-1)^m = -1 for odd m
    poch *= (sigma + m) * (sigma + m + 1);
    pw /= x * x;
  }
  return total;
}

/** S_N(s) = sum_{j=1}^{N} j^(-2s), N a positive integer, s >= 0 */
export function partialSum(s: number, N: number): number {
  if (!Number.isInteger(N) || N < 1) throw new Error('hilbert.partialSum: N must be a positive integer');
  const sigma = 2 * s;
  if (N <= EM_M) return directSum(sigma, N);
  const M = EM_M;
  const head = directSum(sigma, M);
  // int_M^N x^(-sigma) dx = M^(1-sigma) ((N/M)^(1-sigma) - 1)/(1-sigma)
  const integral = Math.pow(M, 1 - sigma) * powm1OverA(Math.log(N / M), 1 - sigma);
  const ends = (Math.pow(N, -sigma) - Math.pow(M, -sigma)) / 2;
  return head + integral + ends + emDerivativeSeries(sigma, N) - emDerivativeSeries(sigma, M);
}

/** lim_N S_N(s) = sum_j j^(-2s) for s > 1/2; Infinity for s <= 1/2 (the partial sums are unbounded) */
export function sumLimit(s: number): number {
  const sigma = 2 * s;
  if (!(sigma > 1)) return Infinity;
  const M = EM_M;
  // sum_{j>M} f(j) = int_M^inf f - f(M)/2 - sum_k B_2k/(2k)! f^(2k-1)(M)
  return directSum(sigma, M) + Math.pow(M, 1 - sigma) / (sigma - 1) - Math.pow(M, -sigma) / 2 - emDerivativeSeries(sigma, M);
}

/** upper bound 1 + int_1^N x^(-2s) dx of S_N(s) (c03.eq.rate, first line, at s = 1: 2 - 1/N) */
export function sumUpperBound(s: number, N: number): number { return 1 + powm1OverA(Math.log(N), 1 - 2 * s); }
/** N-independent bound 2s/(2s-1) for s > 1/2 (= 2 at s = 1); Infinity otherwise */
export function sumUpperBoundLimit(s: number): number { return 2 * s > 1 ? (2 * s) / (2 * s - 1) : Infinity; }
/** lower bound int_1^(N+1) x^(-2s) dx of S_N(s) (c03.eq.rate, second line, at s = 1/2: ln(N+1)) */
export function sumLowerBound(s: number, N: number): number { return powm1OverA(Math.log(N + 1), 1 - 2 * s); }

// ── functions on the line (Vertiefung c03.v2) ─────────────────────────────────────────────
const SQRT_PI = Math.sqrt(Math.PI);
/**
 * erf(x). |x| < 3: erf(x) = 2/sqrt(pi) e^(-x^2) sum_n 2^n x^(2n+1)/(1 3 5 ... (2n+1)) (all terms
 * positive); |x| >= 3: erfc by its continued fraction (Lentz), erf = 1 - erfc.
 */
export function erf(x: number): number {
  if (x < 0) return -erf(-x);
  if (x === 0) return 0;
  if (x < 3) {
    let term = x, sum = x;
    for (let n = 1; n < 200; n++) {
      term *= (2 * x * x) / (2 * n + 1);
      sum += term;
      if (term < 1e-17 * sum) break;
    }
    return (2 / SQRT_PI) * Math.exp(-x * x) * sum;
  }
  return 1 - erfcLarge(x);
}
/** erfc(x) for x >= 3: e^(-x^2)/sqrt(pi) * 1/(x + (1/2)/(x + 1/(x + (3/2)/(x + ...)))) */
function erfcLarge(x: number): number {
  // modified Lentz for b0 + a1/(b1 + a2/(b2 + ...)) with b_k = x, a_k = k/2
  const tiny = 1e-300;
  let f = x, C = x, D = 0;
  for (let k = 1; k < 300; k++) {
    const a = k / 2;
    D = x + a * D; if (D === 0) D = tiny; D = 1 / D;
    C = x + a / C; if (C === 0) C = tiny;
    const delta = C * D;
    f *= delta;
    if (Math.abs(delta - 1) < 1e-16) break;
  }
  return Math.exp(-x * x) / SQRT_PI / f;
}

/** int_{-X}^{X} e^(-x^2) dx = sqrt(pi) erf(X): |g|^2 for g = e^(-x^2/2) (c03.eq.gauss) */
export function gaussPartial(X: number): number { return SQRT_PI * erf(X); }
/** int_{-inf}^{x} e^(-t^2) dt = (sqrt(pi)/2)(1 + erf(x)), the area swept from the left */
export function gaussCumulative(x: number): number {
  return x >= 0 ? (SQRT_PI / 2) * (1 + erf(x)) : (SQRT_PI / 2) * (x <= -3 ? erfcLarge(-x) : 1 - erf(-x));
}
/** int_{-inf}^{inf} e^(-x^2) dx = sqrt(pi) */
export function gaussLimit(): number { return SQRT_PI; }

/** int_{-X}^{X} (1+|x|)^(-2s) dx = 2 ((1+X)^(1-2s) - 1)/(1-2s); 2 ln(1+X) at s = 1/2 (c03.eq.log), 2X at s = 0 (c03.eq.eins) */
export function powerPartial(s: number, X: number): number { return 2 * powm1OverA(Math.log1p(X), 1 - 2 * s); }
/** |f_s(x)|^2 = (1+|x|)^(-2s) */
export function powerAbs2(s: number, x: number): number { return Math.pow(1 + Math.abs(x), -2 * s); }
/** limit 2/(2s-1) for s > 1/2; Infinity otherwise */
export function powerLimit(s: number): number { return 2 * s > 1 ? 2 / (2 * s - 1) : Infinity; }

export type Modulus = 'gauss' | 'power' | 'one';
/** the modulus m(x): g = e^(-x^2/2), h = (1+|x|)^(-1/2), or 1 */
export function modulus(kind: Modulus, x: number): number {
  return kind === 'gauss' ? Math.exp(-x * x / 2) : kind === 'power' ? 1 / Math.sqrt(1 + Math.abs(x)) : 1;
}
/** f(x) = m(x) e^(i k x) as [Re f, Im f] (c03.fig.komplex: m = g, k = 2) */
export function phased(kind: Modulus, k: number, x: number): Complex {
  const m = modulus(kind, x);
  return [m * Math.cos(k * x), m * Math.sin(k * x)];
}
/** |f(x)|^2 = m(x)^2: the phase e^(ikx) has modulus 1 and drops out (c03.ex.gauss) */
export function phasedAbs2(kind: Modulus, x: number): number { const m = modulus(kind, x); return m * m; }
/** int_{-X}^{X} |f|^2 for f = m e^(ikx); X = Infinity gives the whole line (Infinity if divergent) */
export function phasedPartial(kind: Modulus, X: number): number {
  if (kind === 'gauss') return X === Infinity ? SQRT_PI : gaussPartial(X);
  if (kind === 'power') return X === Infinity ? Infinity : powerPartial(0.5, X);
  return X === Infinity ? Infinity : 2 * X;
}
