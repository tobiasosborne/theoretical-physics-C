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
// - c03.fig.vollst (completeness relation, c03.eq.vollstaendigkeit): a basis is a list of columns
//   phi_j (vectors of Complex entries); the coefficients are c_j = <phi_j|psi> = phi_j^dagger psi,
//   the weights |c_j|^2, the components c_j phi_j. The demo works in the real plane inside C^2:
//   unitVector(alpha) = (cos alpha, sin alpha) and the turned basis phi_0 = (cos theta, sin theta),
//   phi_1 = (sin theta, -cos theta), which at theta = 45 degrees is e_+, e_- = (1, +-1)/sqrt 2.
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

// ── completeness: one vector in an orthonormal basis (c03.s7, c03.fig.vollst) ───────────────
export type Vec = readonly Complex[];
/** the unit vector (cos alpha, sin alpha) of the real plane in C^2 */
export function unitVector(alpha: number): Vec { return [[Math.cos(alpha), 0], [Math.sin(alpha), 0]]; }
/** the orthonormal basis phi_0 = (cos theta, sin theta), phi_1 = (sin theta, -cos theta); theta = pi/4 gives e_+, e_- */
export function rotatedBasis(theta: number): Vec[] {
  const c = Math.cos(theta), s = Math.sin(theta);
  return [[[c, 0], [s, 0]], [[s, 0], [-c, 0]]];
}
/** the coefficients c_j = <phi_j|psi> = phi_j^dagger psi (c03.prop.entwicklung) */
export function expansion(basis: readonly Vec[], psi: Vec): Complex[] { return basis.map((phi) => inner(phi, psi)); }
/** the weights |c_j|^2 */
export function weights(c: readonly Complex[]): number[] { return c.map(abs2); }
/** the components c_j phi_j */
export function components(basis: readonly Vec[], c: readonly Complex[]): Vec[] { return basis.map((phi, j) => scaleVec(c[j], phi)); }
/** the sum of the components sum_j c_j phi_j: psi again, in every orthonormal basis */
export function reassemble(basis: readonly Vec[], c: readonly Complex[]): Complex[] {
  const parts = components(basis, c);
  return parts[0].map((_, k) => parts.reduce<Complex>((s, p) => cadd(s, p[k]), [0, 0]));
}
/** the sum of the weights: ||psi||^2, the same in every orthonormal basis (c03.eq.kanonisch) */
export function totalWeight(w: readonly number[]): number { return w.reduce((s, x) => s + x, 0); }

// ── operator classes and where their eigenvalues lie (c03.s10-s12, c03.fig.spektren) ──────
// A matrix is a list of rows of Complex entries; it acts on columns, (A v)_j = sum_k A_jk v_k. The
// adjoint of a matrix is its conjugate transpose (D17 in C^n): (A^dagger)_jk = (A_kj)^*.
//
// CLASS TESTS (D18, D20, D89, D91, D92). Each algebraic test is a residual, the largest modulus of
// an entry of a matrix that vanishes exactly on the class: A^dagger - A (Hermitian), A^2 - A
// (with A^dagger = A: projector), A^dagger A - 1 and A A^dagger - 1 (unitary; in finite dimension
// either one suffices, c03.prop.isometrie), A^dagger A - A A^dagger (normal). A residual counts as
// zero below CLASS_TOL times the scale of the entries (rounding of doubles; the demos' operators
// have entries of order one). Positivity is tested by its definition: <psi|A psi> >= 0 for all
// psi. Since <c psi|A c psi> = |c|^2 <psi|A psi>, it suffices to look at ||psi|| = 1. With
// H = (A + A^dagger)/2 and K = (A - A^dagger)/(2i) (both Hermitian) one has
// Re <psi|A psi> = <psi|H psi> and Im <psi|A psi> = <psi|K psi>; the kernel finds the smallest
// value of <psi|H psi> and the largest |<psi|K psi>| over unit vectors, with the vectors psi
// that attain them, by Jacobi rotations (hermitianExtremes). A is positive iff A is Hermitian
// (c03.prop.positiv, part 2) and that smallest value is >= 0.
//
// EIGENVALUES (informal in c03.s12: A v = lambda v for some v != 0). Computed by the shifted QR
// algorithm on the matrix itself (reduction to Hessenberg form by a Givens rotation, Wilkinson
// shifts, deflation when a subdiagonal entry is below eps times its neighbours). The algorithm is
// backward stable: the computed eigenvalues are exact for a matrix within ~eps ||A|| of A. Close
// but distinct eigenvalues stay distinct (diag(0, 1e-6, 1) gives 0, 1e-6, 1); repeated ones come
// out repeated up to rounding, and exactly when the matrix is triangular (M(0), the zero operator).
// The roots of the characteristic polynomial are NOT used: rounding its coefficients would move
// two eigenvalues a distance d apart by ~eps/d. Eigenvalues that agree within LOCUS_TOL count as
// one in distinct(). The eigenvector of
// an eigenvalue is a null vector of A - lambda 1 (cross product of two rows for n = 3).
// LOCI (c03.eq.orte): real axis, half-axis lambda >= 0, the points 0 and 1, the unit circle; a
// point counts as on a locus within LOCUS_TOL. Normality alone constrains nothing.
export type Mat = Complex[][];
/** below this (times the scale of the entries) a residual of a class test counts as zero */
export const CLASS_TOL = 1e-12;
/** an eigenvalue within this distance of a locus counts as on it */
export const LOCUS_TOL = 1e-9;
const EPS = 2.220446049250313e-16;

export const csub = (a: Complex, b: Complex): Complex => [a[0] - b[0], a[1] - b[1]];
export const cdiv = (a: Complex, b: Complex): Complex => {
  const d = abs2(b);
  return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d];
};
export const cabs = (a: Complex): number => Math.hypot(a[0], a[1]);

/** the identity 1 on C^n */
export function identityMat(n: number): Mat {
  return Array.from({ length: n }, (_, j) => Array.from({ length: n }, (_, k) => (j === k ? [1, 0] : [0, 0]) as Complex));
}
/** the adjoint: conjugate transpose */
export function adjointMat(a: Mat): Mat { return a[0].map((_, j) => a.map((row) => conj(row[j]))); }
export function matMul(a: Mat, b: Mat): Mat {
  return a.map((row) => b[0].map((_, k) => row.reduce<Complex>((s, x, j) => cadd(s, cmul(x, b[j][k])), [0, 0])));
}
export function matSub(a: Mat, b: Mat): Mat { return a.map((row, j) => row.map((x, k) => csub(x, b[j][k]))); }
export function matScale(z: Complex, a: Mat): Mat { return a.map((row) => row.map((x) => cmul(z, x))); }
/** A v */
export function matVec(a: Mat, v: readonly Complex[]): Complex[] {
  return a.map((row) => row.reduce<Complex>((s, x, k) => cadd(s, cmul(x, v[k])), [0, 0]));
}
/** the largest modulus of an entry */
export function maxAbsEntry(a: Mat): number { return Math.max(...a.flatMap((row) => row.map(cabs))); }
/** <psi|A psi> = psi^dagger (A psi) */
export function expectation(a: Mat, psi: readonly Complex[]): Complex { return inner(psi, matVec(a, psi)); }
/** H = (A + A^dagger)/2: Re <psi|A psi> = <psi|H psi> */
export function hermitianPart(a: Mat): Mat { const d = adjointMat(a); return a.map((row, j) => row.map((x, k) => [(x[0] + d[j][k][0]) / 2, (x[1] + d[j][k][1]) / 2] as Complex)); }
/** K = (A - A^dagger)/(2i): Im <psi|A psi> = <psi|K psi> */
export function antiHermitianPart(a: Mat): Mat {
  const d = adjointMat(a);
  // (x - y)/(2i) = -i (x - y)/2
  return a.map((row, j) => row.map((x, k) => { const u = csub(x, d[j][k]); return [u[1] / 2, -u[0] / 2] as Complex; }));
}

/** sort complex numbers by real part (ties within 1e-9), then by imaginary part */
export function sortComplex(zs: readonly Complex[]): Complex[] {
  return [...zs].sort((p, q) => (Math.abs(p[0] - q[0]) > 1e-9 ? p[0] - q[0] : p[1] - q[1]));
}

const csqrt = (z: Complex): Complex => {
  const r = cabs(z);
  if (r === 0) return [0, 0];
  const re = Math.sqrt((r + z[0]) / 2), im = Math.sqrt((r - z[0]) / 2);
  return [re, z[1] < 0 ? -im : im];
};
/**
 * A Givens rotation G = [[c, s], [-s^*, c]] (c real) with G (x, y) = (rho, 0).
 * Applied to rows i, j from the left and as G^dagger to columns i, j from the right it is a similarity.
 */
function givens(x: Complex, y: Complex): { c: number; s: Complex } {
  const ax = cabs(x), ay = cabs(y);
  if (ay === 0) return { c: 1, s: [0, 0] };
  if (ax === 0) return { c: 0, s: [1, 0] };
  const r = Math.hypot(ax, ay), u: Complex = [x[0] / ax, x[1] / ax];
  return { c: ax / r, s: cmul(u, [y[0] / r, -y[1] / r]) };
}
function rotRows(h: Complex[][], g: { c: number; s: Complex }, i: number, j: number, k0: number, k1: number): void {
  const ms: Complex = [-g.s[0], g.s[1]];                         // -s^*
  for (let k = k0; k <= k1; k++) {
    const a = h[i][k], b = h[j][k];
    h[i][k] = cadd([g.c * a[0], g.c * a[1]], cmul(g.s, b));
    h[j][k] = cadd(cmul(ms, a), [g.c * b[0], g.c * b[1]]);
  }
}
function rotCols(h: Complex[][], g: { c: number; s: Complex }, i: number, j: number, k0: number, k1: number): void {
  const sc = conj(g.s), ms: Complex = [-g.s[0], -g.s[1]];      // G^dagger = [[c, -s], [s^*, c]]
  for (let k = k0; k <= k1; k++) {
    const a = h[k][i], b = h[k][j];
    h[k][i] = cadd([g.c * a[0], g.c * a[1]], cmul(b, sc));
    h[k][j] = cadd(cmul(a, ms), [g.c * b[0], g.c * b[1]]);
  }
}
/** the eigenvalue of [[a, b], [c, d]] closer to d (the Wilkinson shift) and the other one */
function eig2(a: Complex, b: Complex, c: Complex, d: Complex): [Complex, Complex] {
  const half = cmul(csub(a, d), [0.5, 0]);
  const root = csqrt(cadd(cmul(half, half), cmul(b, c)));
  const mid = cmul(cadd(a, d), [0.5, 0]);
  const l1 = cadd(mid, root), l2 = csub(mid, root);
  return cabs(csub(l1, d)) <= cabs(csub(l2, d)) ? [l1, l2] : [l2, l1];
}

/** the eigenvalues of A (any small n), with multiplicity, sorted by sortComplex: shifted QR on the Hessenberg form */
export function eigenvalues(a: Mat): Complex[] {
  const n = a.length;
  const h: Complex[][] = a.map((row) => row.map((x) => [x[0], x[1]] as Complex));
  // Hessenberg form: zero h[i][k] for i > k + 1 by rotations in the rows k+1, i
  for (let k = 0; k < n - 2; k++) for (let i = k + 2; i < n; i++) {
    const g = givens(h[k + 1][k], h[i][k]);
    rotRows(h, g, k + 1, i, 0, n - 1);
    rotCols(h, g, k + 1, i, 0, n - 1);
    h[i][k] = [0, 0];
  }
  const out: Complex[] = [];
  let hi = n - 1, iter = 0;
  const small = (k: number) => cabs(h[k][k - 1]) <= EPS * (cabs(h[k][k]) + cabs(h[k - 1][k - 1])) || cabs(h[k][k - 1]) < 1e-300;
  while (hi >= 0) {
    if (hi === 0) { out.push(h[0][0]); break; }
    if (small(hi)) { out.push(h[hi][hi]); hi--; iter = 0; continue; }
    let lo = hi - 1;
    while (lo > 0 && !small(lo)) lo--;
    if (hi - lo === 1) {
      // a 2x2 block: its two eigenvalues in closed form
      const [l1, l2] = eig2(h[lo][lo], h[lo][hi], h[hi][lo], h[hi][hi]);
      out.push(l1, l2); hi -= 2; iter = 0; continue;
    }
    if (++iter > 200) throw new Error('hilbert.eigenvalues: QR did not converge');
    let mu = eig2(h[hi - 1][hi - 1], h[hi - 1][hi], h[hi][hi - 1], h[hi][hi])[0];
    if (iter % 11 === 0) mu = cadd(h[hi][hi], [cabs(h[hi][hi - 1]), 0]);      // exceptional shift
    for (let k = lo; k <= hi; k++) h[k][k] = csub(h[k][k], mu);
    const gs: Array<{ c: number; s: Complex }> = [];
    for (let k = lo; k < hi; k++) {
      const g = givens(h[k][k], h[k + 1][k]);
      rotRows(h, g, k, k + 1, lo, hi);
      h[k + 1][k] = [0, 0];
      gs.push(g);
    }
    gs.forEach((g, i) => rotCols(h, g, lo + i, lo + i + 1, lo, hi));
    for (let k = lo; k <= hi; k++) h[k][k] = cadd(h[k][k], mu);
  }
  return sortComplex(out);
}
/** the different values among sorted eigenvalues (values within tol, relative, count as one) */
export function distinct(zs: readonly Complex[], tol = LOCUS_TOL): Complex[] {
  const out: Complex[] = [];
  for (const z of zs) if (!out.some((w) => cabs(csub(w, z)) <= tol * Math.max(1, cabs(z)))) out.push(z);
  return out;
}

/** a unit vector, its phase chosen so that the first entry of noticeable size is real and positive */
function normalisePhase(v: readonly Complex[]): Complex[] {
  const nrm = Math.sqrt(v.reduce((s, x) => s + abs2(x), 0));
  if (nrm === 0) throw new Error('hilbert.normalisePhase: zero vector');
  const big = Math.max(...v.map(cabs));
  const lead = v.find((x) => cabs(x) > 0.1 * big)!;
  const ph = cdiv(conj(lead), [cabs(lead), 0]);              // lead^* / |lead|
  return v.map((x) => { const y = cmul(ph, x); return [y[0] / nrm, y[1] / nrm] as Complex; });
}

/** a unit vector v with A v = lambda v (n = 2, 3): a null vector of A - lambda 1 */
export function eigenvector(a: Mat, lambda: Complex): Complex[] {
  const n = a.length;
  const m = a.map((row, j) => row.map((x, k) => (j === k ? csub(x, lambda) : x)));
  const scale = Math.max(1, maxAbsEntry(m));
  // a null vector of one row r = (r_0, ..., r_{n-1}) (bilinear, no conjugation): v_k = r_j, v_j = -r_k
  const fromRow = (r: Complex[]): Complex[] => {
    const k = r.reduce((b, x, i) => (cabs(x) > cabs(r[b]) ? i : b), 0);
    const j = k === 0 ? 1 : 0;
    const v: Complex[] = r.map(() => [0, 0]);
    if (cabs(r[k]) <= 1e-12 * scale) { v[0] = [1, 0]; return v; }
    v[j] = r[k]; v[k] = [-r[j][0], -r[j][1]];
    return v;
  };
  if (n === 2) {
    const r = cabs(m[0][0]) + cabs(m[0][1]) >= cabs(m[1][0]) + cabs(m[1][1]) ? m[0] : m[1];
    return normalisePhase(fromRow(r));
  }
  if (n !== 3) throw new Error('hilbert.eigenvector: only n = 2 and n = 3');
  const cross = (p: Complex[], q: Complex[]): Complex[] => [
    csub(cmul(p[1], q[2]), cmul(p[2], q[1])),
    csub(cmul(p[2], q[0]), cmul(p[0], q[2])),
    csub(cmul(p[0], q[1]), cmul(p[1], q[0])),
  ];
  const cands = [cross(m[0], m[1]), cross(m[0], m[2]), cross(m[1], m[2])];
  const size = (v: Complex[]) => Math.sqrt(v.reduce((s, x) => s + abs2(x), 0));
  const best = cands.reduce((b, v) => (size(v) > size(b) ? v : b));
  if (size(best) > 1e-9 * scale * scale) return normalisePhase(best);
  // rank <= 1: a null vector of the largest row
  const row = m.reduce((b, r) => (size(r) > size(b) ? r : b));
  return normalisePhase(fromRow(row));
}

/**
 * Smallest and largest value of <psi|H psi> over unit vectors psi, for Hermitian H, with vectors
 * that attain them. Cyclic Jacobi rotations on the real symmetric matrix [[X, -Y], [Y, X]] of
 * H = X + iY (its eigenvector (x, y) gives psi = x + iy).
 */
export function hermitianExtremes(h: Mat): { min: number; minVec: Complex[]; max: number; maxVec: Complex[] } {
  const n = h.length, N = 2 * n;
  const S = Array.from({ length: N }, (_, a) => Array.from({ length: N }, (_, b) => {
    const j = a % n, k = b % n, z = h[j][k];
    // symmetrise: the input is Hermitian up to rounding
    const w = h[k][j];
    const X = (z[0] + w[0]) / 2, Y = (z[1] - w[1]) / 2;
    if (a < n && b < n) return X;
    if (a >= n && b >= n) return X;
    return a < n ? -Y : Y;
  }));
  const V: number[][] = Array.from({ length: N }, (_, a) => Array.from({ length: N }, (_, b) => (a === b ? 1 : 0)));
  for (let sweep = 0; sweep < 60; sweep++) {
    let off = 0;
    for (let p = 0; p < N; p++) for (let q = p + 1; q < N; q++) off += S[p][q] * S[p][q];
    if (off < 1e-34) break;
    for (let p = 0; p < N; p++) for (let q = p + 1; q < N; q++) {
      if (Math.abs(S[p][q]) < 1e-300) continue;
      const theta = (S[q][q] - S[p][p]) / (2 * S[p][q]);
      const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
      const c = 1 / Math.sqrt(t * t + 1), s = t * c;
      for (let r = 0; r < N; r++) { const a = S[r][p], b = S[r][q]; S[r][p] = c * a - s * b; S[r][q] = s * a + c * b; }
      for (let r = 0; r < N; r++) { const a = S[p][r], b = S[q][r]; S[p][r] = c * a - s * b; S[q][r] = s * a + c * b; }
      for (let r = 0; r < N; r++) { const a = V[r][p], b = V[r][q]; V[r][p] = c * a - s * b; V[r][q] = s * a + c * b; }
    }
  }
  let iMin = 0, iMax = 0;
  for (let i = 1; i < N; i++) { if (S[i][i] < S[iMin][iMin]) iMin = i; if (S[i][i] > S[iMax][iMax]) iMax = i; }
  const vec = (i: number) => normalisePhase(Array.from({ length: n }, (_, j) => [V[j][i], V[j + n][i]] as Complex));
  return { min: S[iMin][iMin], minVec: vec(iMin), max: S[iMax][iMax], maxVec: vec(iMax) };
}

export type ClassKey = 'herm' | 'pos' | 'proj' | 'unit' | 'normal';
export const CLASS_KEYS: readonly ClassKey[] = ['herm', 'pos', 'proj', 'unit', 'normal'];
export interface ClassReport {
  /** largest moduli of the entries of A^dagger - A, A^2 - A, A^dagger A - 1, A A^dagger - 1, A^dagger A - A A^dagger */
  residual: { herm: number; square: number; unitL: number; unitR: number; normal: number };
  /** which of these five matrices vanish (residual below CLASS_TOL): A^dagger = A, A^2 = A, A^dagger A = 1, A A^dagger = 1, A^dagger A = A A^dagger */
  equal: { herm: boolean; square: boolean; unitL: boolean; unitR: boolean; normal: boolean };
  /** the class tests (D18, D20, D89, D91, D92) */
  member: Record<ClassKey, boolean>;
  /** smallest Re <psi|A psi> over unit psi, and a psi attaining it (for Hermitian A: smallest <psi|A psi>) */
  minRe: { value: number; psi: Complex[] };
  /** largest |Im <psi|A psi>| over unit psi, and a psi attaining it (zero iff A is Hermitian, c03.prop.positiv) */
  maxIm: { value: number; psi: Complex[] };
}
export function classReport(a: Mat): ClassReport {
  const n = a.length, one = identityMat(n), d = adjointMat(a);
  const scale = Math.max(1, maxAbsEntry(a));
  const dA = matMul(d, a), Ad = matMul(a, d);
  const residual = {
    herm: maxAbsEntry(matSub(d, a)),
    square: maxAbsEntry(matSub(matMul(a, a), a)),
    unitL: maxAbsEntry(matSub(dA, one)),
    unitR: maxAbsEntry(matSub(Ad, one)),
    normal: maxAbsEntry(matSub(dA, Ad)),
  };
  const zero1 = (x: number) => x <= CLASS_TOL * scale, zero2 = (x: number) => x <= CLASS_TOL * scale * scale;
  const re = hermitianExtremes(hermitianPart(a)), im = hermitianExtremes(antiHermitianPart(a));
  const equal = { herm: zero1(residual.herm), square: zero2(residual.square), unitL: zero2(residual.unitL), unitR: zero2(residual.unitR), normal: zero2(residual.normal) };
  const imBig = Math.abs(im.max) >= Math.abs(im.min);
  const member: Record<ClassKey, boolean> = {
    herm: equal.herm,
    pos: equal.herm && re.min >= -CLASS_TOL * scale,
    proj: equal.herm && equal.square,
    unit: equal.unitL && equal.unitR,
    normal: equal.normal,
  };
  return { residual, equal, member, minRe: { value: re.min, psi: re.minVec }, maxIm: { value: Math.abs(imBig ? im.max : im.min), psi: imBig ? im.maxVec : im.minVec } };
}

/** lambda on the locus of the class (c03.eq.orte); every lambda is on the "locus" of the normal operators */
export function onLocus(cls: ClassKey, z: Complex, tol = LOCUS_TOL): boolean {
  switch (cls) {
    case 'herm': return Math.abs(z[1]) <= tol;
    case 'pos': return Math.abs(z[1]) <= tol && z[0] >= -tol;
    case 'proj': return cabs(z) <= tol || cabs(csub(z, [1, 0])) <= tol;
    case 'unit': return Math.abs(cabs(z) - 1) <= tol;
    case 'normal': return true;
  }
}

// ── the operators of c03.demo.spektren ──
// A, B, C of c03.ex.drei (c03.eq.abc) on C^3, each in a one-parameter family that contains it:
// A + s 1, s B, r C; and two operators on C^2 that are not normal for most parameters:
// M(t) = |0><1| + t |1><0| (Hermitian at t = 1, unitary at t = +-1, normal only there; real
// eigenvalues +-sqrt t for t > 0) and Q(t) = |0><0| + t |0><1| (eigenvalues 0 and 1 for every t;
// a projector only at t = 0). The parameter runs over [min, min + 2] in steps of 0.01.
export type SpektrenKey = 'A' | 'B' | 'C' | 'M' | 'Q';
export const SPEKTREN: Record<SpektrenKey, { dim: 2 | 3; param: 's' | 'r' | 't'; min: number; chapter: number | null }> = {
  A: { dim: 3, param: 's', min: -0.3, chapter: 0 },
  B: { dim: 3, param: 's', min: -0.5, chapter: 1 },
  C: { dim: 3, param: 'r', min: 0, chapter: 1 },
  M: { dim: 2, param: 't', min: -1, chapter: null },
  Q: { dim: 2, param: 't', min: 0, chapter: null },
};
/** number of parameter steps of 0.01 over the range of every family */
export const SPEKTREN_STEPS = 200;
/** the parameter at step k (0..SPEKTREN_STEPS): min + k/100, rounded to the grid */
export function spektrenParam(key: SpektrenKey, k: number): number { return Math.round(SPEKTREN[key].min * 100 + k) / 100; }
/** the step of a parameter value */
export function spektrenStep(key: SpektrenKey, p: number): number { return Math.round(p * 100 - SPEKTREN[key].min * 100); }
/** the matrix of the operator of family key at parameter p */
export function spektrenOperator(key: SpektrenKey, p: number): Mat {
  const z = (re: number, im = 0): Complex => [re + 0, im + 0];
  switch (key) {
    case 'A': return [[z(p), z(1), z(0)], [z(1), z(p), z(1)], [z(0), z(1), z(p)]];
    case 'B': { const b = p / 3; return [[z(b), z(b), z(b)], [z(b), z(b), z(b)], [z(b), z(b), z(b)]]; }
    case 'C': return [[z(0), z(p), z(0)], [z(0), z(0), z(0, p)], [z(-p), z(0), z(0)]];
    case 'M': return [[z(0), z(1)], [z(p), z(0)]];
    case 'Q': return [[z(1), z(p)], [z(0), z(0)]];
  }
}
