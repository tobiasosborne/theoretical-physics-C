// Kernel of the demos of chapter c01 (c01.demo.*): finite probability weights, events and
// indicator functions, exact expectation and variance, mixtures, the simplex of weights, the
// weight of a relative frequency (binomial) with the Chebyshev bound, a seeded sampler, and
// the densities on the real line of section c01.s4. Pure functions, no DOM, no clock.
// Reference implementation and golden values (one script, two files):
//   julia web/tests/golden/reference/prob.jl            writes web/tests/golden/prob.json
//                                                       and web/tests/golden/prob-density.json
//   julia web/tests/golden/reference/prob.jl --check    exit 1 unless both are reproduced
//
// Conventions (chapter c01, definitions D53 to D56).
//   outcome set   X = {0, ..., n-1} (indices; the demo attaches labels)
//   weight        p(i) = a[i] / D with integer numerators a[i] >= 0 and D = a[0] + ... + a[n-1] > 0,
//                 so p(i) >= 0 and the weights sum to 1 by construction (D54)
//   event         a list of distinct indices S; its indicator function chi_S (c01.eq.indikator-def)
//   measurement   f(i) = f[i], integers
//   expectation   E[f]   = sum_i p(i) f(i)                       (D55)
//   variance      Var[f] = E[(f - E[f])^2] = E[f^2] - E[f]^2     (D56, c01.prop.varianz)
// A sample is a list of outcomes; its relative frequencies h(i) = c[i] / N are themselves a
// weight (c01.eq.haeufigkeit), so "mean and variance of the sample" are the expectation and
// variance of f in the weight h. No (N - 1) correction is applied anywhere.
//
// Exactness. Every result on a finite outcome set is an exact fraction of integers,
// computed with BigInt and returned in lowest terms with a positive denominator. Only the
// densities of section c01.s4 (the last block of this file) are evaluated in floating point;
// their accuracy is stated there.
//
// Sampler. words(seed) is the generator mulberry32 (32-bit state; the same function the
// demo harness uses for ctx.random). An outcome is drawn by rejection: with
// L = D * floor(2^32 / D), a word w >= L is discarded, otherwise the outcome is the index i
// with a[0] + ... + a[i-1] <= (w mod D) < a[0] + ... + a[i]. If the words were uniform on
// {0, ..., 2^32 - 1}, each outcome i would have probability exactly a[i] / D. The words are
// not random: the generator is a deterministic function of the seed. Nothing is claimed
// here about its statistical quality, and nothing about how fast relative frequencies
// approach the weights; what can be proved is theorem c01.thm.haeufigkeit, a statement
// about the product weight, which binomialWeight and the bounds below evaluate exactly.

export interface Fraction { num: bigint; den: bigint }

function gcd(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y !== 0n) { [x, y] = [y, x % y]; }
  return x;
}

/** num / den in lowest terms, den > 0 */
export function fraction(num: bigint, den: bigint): Fraction {
  if (den === 0n) throw new Error('prob: zero denominator');
  const g = gcd(num, den) || 1n;
  const s = den < 0n ? -1n : 1n;
  return { num: (s * num) / g, den: (s * den) / g };
}

export function toNumber(q: Fraction): number {
  return Number(q.num) / Number(q.den);
}

/** integer numerators of a weight: non-negative integers, not all zero */
export function checkWeight(a: readonly number[]): void {
  if (a.length === 0) throw new Error('prob: empty outcome set');
  let d = 0;
  for (const x of a) {
    if (!Number.isInteger(x) || x < 0) throw new Error('prob: numerators must be non-negative integers');
    d += x;
  }
  if (d <= 0) throw new Error('prob: the numerators must not all vanish');
  if (d >= 2 ** 21) throw new Error('prob: denominator too large for the sampler');
}

/** D = a[0] + ... + a[n-1] */
export function denominator(a: readonly number[]): number {
  checkWeight(a);
  return a.reduce((s, x) => s + x, 0);
}

function moments(a: readonly number[], f: readonly number[]): { d: bigint; s1: bigint; s2: bigint } {
  if (a.length !== f.length) throw new Error('prob: weight and measurement differ in length');
  let d = 0n, s1 = 0n, s2 = 0n;
  for (let i = 0; i < a.length; i++) {
    if (!Number.isInteger(a[i]) || a[i] < 0) throw new Error('prob: numerators must be non-negative integers');
    if (!Number.isInteger(f[i])) throw new Error('prob: measurement values must be integers');
    const ai = BigInt(a[i]), fi = BigInt(f[i]);
    d += ai; s1 += ai * fi; s2 += ai * fi * fi;
  }
  if (d <= 0n) throw new Error('prob: the numerators must not all vanish');
  return { d, s1, s2 };
}

/** E[f] = sum_i a[i] f[i] / D */
export function expectation(a: readonly number[], f: readonly number[]): Fraction {
  const { d, s1 } = moments(a, f);
  return fraction(s1, d);
}

/** Var[f] = E[f^2] - E[f]^2 = (D sum a f^2 - (sum a f)^2) / D^2 */
export function variance(a: readonly number[], f: readonly number[]): Fraction {
  const { d, s1, s2 } = moments(a, f);
  return fraction(d * s2 - s1 * s1, d * d);
}

/** P[S] = sum over i in S of a[i] / D; S is a list of distinct indices */
export function probability(a: readonly number[], event: readonly number[]): Fraction {
  const d = BigInt(denominator(a));
  let s = 0n;
  const seen = new Set<number>();
  for (const i of event) {
    if (!Number.isInteger(i) || i < 0 || i >= a.length || seen.has(i)) throw new Error('prob: bad event');
    seen.add(i);
    s += BigInt(a[i]);
  }
  return fraction(s, d);
}

/** mulberry32: the sequence of 32-bit words of a seed (an endless generator function) */
export function words(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0; // tpc-lint: allow(mulberry32 state increment, not a colour)
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return (t ^ (t >>> 14)) >>> 0;
  };
}

const TWO32 = 2 ** 32;

/** the first `count` outcomes (indices) drawn from the weight a with the generator of `seed` */
export function sample(a: readonly number[], seed: number, count: number): number[] {
  const d = denominator(a);
  const limit = d * Math.floor(TWO32 / d);
  const next = words(seed);
  const out: number[] = [];
  while (out.length < count) {
    const w = next();
    if (w >= limit) continue;
    let r = w % d;
    let i = 0;
    while (r >= a[i]) { r -= a[i]; i++; }
    out.push(i);
  }
  return out;
}

/** counts c[i] of the outcomes among the first `upTo` entries of a sample */
export function counts(outcomes: readonly number[], n: number, upTo = outcomes.length): number[] {
  const c = new Array<number>(n).fill(0);
  for (let k = 0; k < Math.min(upTo, outcomes.length); k++) c[outcomes[k]]++;
  return c;
}

/** mean of f over a sample with counts c: the expectation of f in the weight c[i] / N */
export function sampleMean(c: readonly number[], f: readonly number[]): Fraction {
  return expectation(c, f);
}

/** variance of f in the weight c[i] / N of a sample (no N - 1 correction) */
export function sampleVariance(c: readonly number[], f: readonly number[]): Fraction {
  return variance(c, f);
}

/** the weight as fractions p(i) = a[i] / D in lowest terms; for counts c this is the weight h(i) = c[i] / N of a sample */
export function weights(a: readonly number[]): Fraction[] {
  const d = BigInt(denominator(a));
  return a.map((x) => fraction(BigInt(x), d));
}

/** s[n-1] = f(x_1) + ... + f(x_n) for the first `upTo` outcomes of a sample (integers) */
export function prefixSums(outcomes: readonly number[], f: readonly number[], upTo = outcomes.length): number[] {
  const out: number[] = [];
  let s = 0;
  for (let k = 0; k < Math.min(upTo, outcomes.length); k++) {
    s += f[outcomes[k]];
    out.push(s);
  }
  return out;
}

/** m[n-1] = (f(x_1) + ... + f(x_n)) / n: the mean of f over the first n outcomes, n = 1..upTo */
export function runningMeans(outcomes: readonly number[], f: readonly number[], upTo = outcomes.length): number[] {
  return prefixSums(outcomes, f, upTo).map((s, k) => s / (k + 1));
}

// ── fractions ───────────────────────────────────────────────────────────────────────────

export const frac = (num: number | bigint, den: number | bigint = 1): Fraction => fraction(BigInt(num), BigInt(den));
export const fadd = (x: Fraction, y: Fraction): Fraction => fraction(x.num * y.den + y.num * x.den, x.den * y.den);
export const fsub = (x: Fraction, y: Fraction): Fraction => fraction(x.num * y.den - y.num * x.den, x.den * y.den);
export const fmul = (x: Fraction, y: Fraction): Fraction => fraction(x.num * y.num, x.den * y.den);
export function fdiv(x: Fraction, y: Fraction): Fraction {
  if (y.num === 0n) throw new Error('prob: division by zero');
  return fraction(x.num * y.den, x.den * y.num);
}
/** -1, 0 or 1 as x <, =, > y */
export function fcmp(x: Fraction, y: Fraction): number {
  const d = x.num * y.den - y.num * x.den;
  return d < 0n ? -1 : d > 0n ? 1 : 0;
}

// ── weights: changing, mixing, splitting ────────────────────────────────────────────────

/**
 * Share `total` among the indices `idx` in proportion to the integers w[j] (j in idx), as
 * integers: each gets floor(total w[j] / W), and the remaining units go one each to the
 * largest remainders total w[j] mod W, ties to the smaller index (largest-remainder rule).
 * If all w[j] vanish, the shares are equal (the same rule with w[j] = 1).
 */
function share(total: number, w: readonly number[], idx: readonly number[]): Map<number, number> {
  const ws = idx.map((j) => w[j]);
  const W0 = ws.reduce((s, x) => s + x, 0);
  const weights = W0 > 0 ? ws : ws.map(() => 1);
  const W = W0 > 0 ? W0 : idx.length;
  const out = new Map<number, number>();
  const rem: Array<{ j: number; r: number }> = [];
  let given = 0;
  idx.forEach((j, k) => {
    const prod = total * weights[k];
    const q = Math.floor(prod / W);
    out.set(j, q);
    given += q;
    rem.push({ j, r: prod - q * W });
  });
  rem.sort((x, y) => (y.r - x.r) || (x.j - y.j));
  for (let k = 0; k < total - given; k++) out.set(rem[k].j, out.get(rem[k].j)! + 1);
  return out;
}

/**
 * The weight with p(i) = v / D, D = sum(a) unchanged, and the other outcomes sharing the rest
 * (D - v) / D in proportion to their old numerators (largest-remainder rule; equal shares if
 * all others were 0). The result is again a weight with denominator D (D54): the operation a
 * reader performs when dragging one bar while the weight stays normalised.
 */
export function renormalise(a: readonly number[], i: number, v: number): number[] {
  const d = denominator(a);
  if (!Number.isInteger(i) || i < 0 || i >= a.length) throw new Error('prob: bad outcome index');
  if (!Number.isInteger(v) || v < 0 || v > d) throw new Error('prob: new numerator outside 0..D');
  if (a.length === 1) return [d];
  const others = a.map((_, j) => j).filter((j) => j !== i);
  const s = share(d - v, a, others);
  return a.map((_, j) => (j === i ? v : s.get(j)!));
}

/**
 * Integer numerators, over D, of the weight nearest to the non-negative parts of x: negative
 * entries are set to 0, the rest is scaled to the sum D and rounded by the largest-remainder
 * rule (ties to the smaller index). Used to snap a dragged point to the lattice of weights
 * with denominator D.
 */
export function nearestWeight(x: readonly number[], d: number): number[] {
  if (!Number.isInteger(d) || d <= 0) throw new Error('prob: D must be a positive integer');
  const y = x.map((v) => (Number.isFinite(v) && v > 0 ? v : 0));
  const sum = y.reduce((s, v) => s + v, 0);
  if (!(sum > 0)) throw new Error('prob: no positive entry');
  const t = y.map((v) => (v * d) / sum);
  const out = t.map(Math.floor);
  const order = t.map((v, j) => ({ j, r: v - out[j] })).sort((p, q) => (q.r - p.r) || (p.j - q.j));
  const left = d - out.reduce((s, v) => s + v, 0);
  for (let k = 0; k < left; k++) out[order[k].j]++;
  return out;
}

/** gcd of the entries, used to bring numerators to the smallest common denominator */
function reduce(c: bigint[]): number[] {
  let g = 0n;
  for (const x of c) g = gcd(g, x);
  if (g === 0n) throw new Error('prob: the numerators must not all vanish');
  return c.map((x) => Number(x / g));
}

/**
 * The mixture lambda p + (1 - lambda) q with lambda = k / K, 0 <= k <= K (c01.eq.mischung),
 * as integer numerators over their smallest common denominator. p has numerators a, q has b.
 */
export function mixture(a: readonly number[], b: readonly number[], k: number, kk: number): number[] {
  if (a.length !== b.length) throw new Error('prob: the weights differ in length');
  if (!Number.isInteger(k) || !Number.isInteger(kk) || kk <= 0 || k < 0 || k > kk) throw new Error('prob: lambda = k / K needs 0 <= k <= K');
  const da = BigInt(denominator(a)), db = BigInt(denominator(b));
  const K = BigInt(kk), L = BigInt(k);
  return reduce(a.map((x, j) => L * BigInt(x) * db + (K - L) * BigInt(b[j]) * da));
}

/**
 * The construction of the proof of c01.prop.punktgewicht (c01.eq.echte-mischung): for two
 * different outcomes i, j with p(i) > 0 and p(j) > 0 and eps = min(p(i), p(j)),
 *   q = p + eps (p_i - p_j),   r = p - eps (p_i - p_j),   p = q/2 + r/2.
 * q and r are returned as numerators over D = sum(a).
 */
export function properSplit(a: readonly number[], i: number, j: number): { q: number[]; r: number[]; eps: Fraction } {
  const d = denominator(a);
  if (i === j || a[i] === undefined || a[j] === undefined) throw new Error('prob: two different outcomes are needed');
  if (a[i] <= 0 || a[j] <= 0) throw new Error('prob: both outcomes need positive weight');
  const e = Math.min(a[i], a[j]);
  const q = a.slice(), r = a.slice();
  q[i] += e; q[j] -= e; r[i] -= e; r[j] += e;
  return { q, r, eps: frac(e, d) };
}

/** the index a if p is the point weight p_a (c01.eq.punktgewicht), otherwise -1 */
export function pointWeightIndex(a: readonly number[]): number {
  checkWeight(a);
  const nz = a.map((x, j) => (x > 0 ? j : -1)).filter((j) => j >= 0);
  return nz.length === 1 ? nz[0] : -1;
}

// ── measurements: balance point and spread ──────────────────────────────────────────────

/** sum_x p(x) (f(x) - c) = E[f] - c: the net moment about the point c of the beam of c01.fig.erwartung */
export function moment(a: readonly number[], f: readonly number[], c: Fraction): Fraction {
  return fsub(expectation(a, f), c);
}

/** (f(x) - E[f])^2 for every outcome x: the squared deviation, itself a measurement (D56) */
export function squaredDeviations(a: readonly number[], f: readonly number[]): Fraction[] {
  const m = expectation(a, f);
  return f.map((v) => { const d = fsub(frac(v), m); return fmul(d, d); });
}

/** p(x) (f(x) - E[f])^2 for every outcome x; their sum is Var[f] (D56) */
export function varianceTerms(a: readonly number[], f: readonly number[]): Fraction[] {
  const p = weights(a);
  return squaredDeviations(a, f).map((s, j) => fmul(p[j], s));
}

// ── events and indicator functions ──────────────────────────────────────────────────────

/** chi_S on {0, ..., n-1} as a list of 0 and 1 (c01.eq.indikator-def) */
export function indicator(event: readonly number[], n: number): number[] {
  const out = new Array<number>(n).fill(0);
  for (const i of event) {
    if (!Number.isInteger(i) || i < 0 || i >= n || out[i] === 1) throw new Error('prob: bad event');
    out[i] = 1;
  }
  return out;
}

/** p(x) chi_S(x) for every outcome x; their sum is E[chi_S] = P[S] (c01.eq.indikator) */
export function indicatorTerms(a: readonly number[], event: readonly number[]): Fraction[] {
  const chi = indicator(event, a.length);
  return weights(a).map((q, j) => (chi[j] === 1 ? q : frac(0)));
}

/**
 * All 2^n events of {0, ..., n-1}, ordered by size and then lexicographically, as in table
 * c01.tab.ereignisse: {}, {0}, {1}, ..., {0,1}, {0,2}, ..., {0,...,n-1}.
 */
export function allEvents(n: number): number[][] {
  if (!Number.isInteger(n) || n < 0 || n > 16) throw new Error('prob: 0 <= n <= 16');
  const out: number[][] = [];
  const pick = (start: number, size: number, cur: number[]) => {
    if (cur.length === size) { out.push(cur.slice()); return; }
    for (let j = start; j < n; j++) { cur.push(j); pick(j + 1, size, cur); cur.pop(); }
  };
  for (let size = 0; size <= n; size++) pick(0, size, []);
  return out;
}

/** the pairs (x1, x2) of two dice, x1, x2 in {1, ..., 6}, with x1 + x2 = s (c01.fig.ereignis) */
export function diceSumEvent(s: number): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  for (let x1 = 1; x1 <= 6; x1++) { const x2 = s - x1; if (x2 >= 1 && x2 <= 6) out.push([x1, x2]); }
  return out;
}

/** the pairs (x, x) of two dice */
export function diceDoublesEvent(): Array<[number, number]> {
  return [1, 2, 3, 4, 5, 6].map((x) => [x, x] as [number, number]);
}

// ── repetitions: the weight of the relative frequency ────────────────────────────────────

function binom(n: number, k: number): bigint {
  if (k < 0 || k > n) return 0n;
  let r = 1n;
  const m = Math.min(k, n - k);
  for (let j = 1; j <= m; j++) r = (r * BigInt(n - m + j)) / BigInt(j);
  return r;
}

function checkQ(q: Fraction): void {
  if (q.num < 0n || q.num > q.den) throw new Error('prob: q must lie in [0, 1]');
}

/**
 * P_N[H_N = k / N] = binom(N, k) q^k (1 - q)^(N - k), k = 0..N (c01.eq.binomial): the weight
 * of the relative frequency of an event of probability q after N independent repetitions,
 * with t^0 = 1 also for t = 0.
 */
export function binomialWeight(n: number, q: Fraction): Fraction[] {
  if (!Number.isInteger(n) || n < 1) throw new Error('prob: N must be a positive integer');
  checkQ(q);
  const a = q.num, b = q.den - q.num, d = q.den ** BigInt(n);
  const out: Fraction[] = [];
  for (let k = 0; k <= n; k++) out.push(fraction(binom(n, k) * a ** BigInt(k) * b ** BigInt(n - k), d));
  return out;
}

/** whether |k/N - q| >= eps, decided exactly */
export function isDeviation(k: number, n: number, q: Fraction, eps: Fraction): boolean {
  const dev = fsub(frac(k, n), q);
  return fcmp(dev.num < 0n ? fraction(-dev.num, dev.den) : dev, eps) >= 0;
}

/** P_N[|H_N - q| >= eps], exactly, from binomialWeight */
export function deviationProbability(n: number, q: Fraction, eps: Fraction): Fraction {
  if (eps.num <= 0n) throw new Error('prob: eps must be positive');
  const w = binomialWeight(n, q);
  let s = frac(0);
  w.forEach((x, k) => { if (isDeviation(k, n, q, eps)) s = fadd(s, x); });
  return s;
}

/** the Chebyshev bound q (1 - q) / (N eps^2) of c01.eq.gesetz (it may exceed 1) */
export function chebyshevBound(n: number, q: Fraction, eps: Fraction): Fraction {
  checkQ(q);
  if (eps.num <= 0n || !Number.isInteger(n) || n < 1) throw new Error('prob: N >= 1 and eps > 0');
  return fdiv(fmul(q, fsub(frac(1), q)), fmul(frac(n), fmul(eps, eps)));
}

/** the coarser bound 1 / (4 N eps^2) of c01.eq.gesetz */
export function coarseBound(n: number, eps: Fraction): Fraction {
  if (eps.num <= 0n || !Number.isInteger(n) || n < 1) throw new Error('prob: N >= 1 and eps > 0');
  return fdiv(frac(1), fmul(frac(4 * n), fmul(eps, eps)));
}

/** the variance q (1 - q) / N of H_N (c01.eq.gesetz-momente) */
export function frequencyVariance(n: number, q: Fraction): Fraction {
  checkQ(q);
  return fdiv(fmul(q, fsub(frac(1), q)), frac(n));
}

/** c[n-1] = number of the first n outcomes of a sample that lie in the event, n = 1..upTo */
export function eventCounts(outcomes: readonly number[], event: readonly number[], upTo = outcomes.length): number[] {
  const inS = new Set(event);
  const out: number[] = [];
  let c = 0;
  for (let k = 0; k < Math.min(upTo, outcomes.length); k++) { if (inS.has(outcomes[k])) c++; out.push(c); }
  return out;
}

// ── densities on the real line (section c01.s4) ─────────────────────────────────────────
// Floating point. gaussDensity is exp(-x^2/2)/sqrt(2 pi) (c01.eq.gauss). Interval
// probabilities use the upper tail Q(x) = (1/2) erfc(x / sqrt 2) for x >= 0:
//   erfc(u) = 1 - erf(u) with erf(u) = (2/sqrt pi) e^{-u^2} sum_n 2^n u^{2n+1} / (1 3 5 ... (2n+1))
//             (a series of positive terms) for u < 2.5,
//   erfc(u) = e^{-u^2} / (sqrt(pi) (u + (1/2)/(u + 1/(u + (3/2)/(u + ...)))))  (continued
//             fraction, 300 levels, evaluated from the tail) for u >= 2.5.
// The golden file compares with a reference that integrates the density numerically in
// 256-bit arithmetic; the stated tolerance there is the accuracy claimed here.

const SQRT2 = Math.SQRT2;
const SQRTPI = Math.sqrt(Math.PI);

export function gaussDensity(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

function erfcPos(u: number): number {
  if (u < 2.5) {
    let term = u, sum = u;
    const u2 = 2 * u * u;
    for (let n = 1; n < 400; n++) {
      term *= u2 / (2 * n + 1);
      sum += term;
      if (term <= sum * 1e-17) break;
    }
    return 1 - ((2 / SQRTPI) * Math.exp(-u * u) * sum);
  }
  let f = u;
  for (let k = 300; k >= 1; k--) f = u + (k / 2) / f;
  return Math.exp(-u * u) / (SQRTPI * f);
}

/** Q(x) = P[[x, infinity)] for the Gauss density, x >= 0 */
function upperTail(x: number): number {
  if (x === Infinity) return 0;
  return 0.5 * erfcPos(x / SQRT2);
}

/** P[[a, b]] = integral_a^b of the Gauss density (c01.eq.dichte); a <= b, +-Infinity allowed */
export function gaussInterval(a: number, b: number): number {
  if (Number.isNaN(a) || Number.isNaN(b) || a > b) throw new Error('prob: an interval needs a <= b');
  if (a >= 0) return upperTail(a) - upperTail(b);
  if (b <= 0) return upperTail(-b) - upperTail(-a);
  return 1 - upperTail(-a) - upperTail(b);
}

/**
 * The uniform density 1/L on [0, L] (c01.eq.gleich has L = 1/2): its height 1/L and the
 * probability of [a, b], the length of [a, b] within [0, L] divided by L. Exact.
 */
export function uniformHeight(l: Fraction): Fraction {
  if (l.num <= 0n) throw new Error('prob: L must be positive');
  return fdiv(frac(1), l);
}
export function uniformInterval(l: Fraction, a: Fraction, b: Fraction): Fraction {
  if (fcmp(a, b) > 0) throw new Error('prob: an interval needs a <= b');
  const lo = fcmp(a, frac(0)) > 0 ? a : frac(0);
  const hi = fcmp(b, l) < 0 ? b : l;
  if (fcmp(hi, lo) <= 0) return frac(0);
  return fmul(fsub(hi, lo), uniformHeight(l));
}

/**
 * The density 1/x^2 on [1, infinity) of c01.ex.kein-mittelwert, cut off at b >= 1
 * (c01.eq.kein-mittelwert): mass = integral_1^b dx / x^2 = 1 - 1/b and
 * mean = integral_1^b x dx / x^2 = ln b. The first tends to 1, the second grows without bound.
 */
export function inverseSquarePartial(b: number): { mass: number; mean: number } {
  if (!(b >= 1)) throw new Error('prob: b >= 1');
  return { mass: 1 - 1 / b, mean: Math.log(b) };
}

/** the density 1/x^2 for x >= 1, 0 otherwise */
export function inverseSquareDensity(x: number): number {
  return x >= 1 ? 1 / (x * x) : 0;
}

// ── repetitions, for drawing (demos c01.demo.konzentration, c01.demo.haeufigkeit) ──────
// Exact fractions with thousands of bits (binomial weights for N up to 1000) do not fit a
// double numerator and denominator; ratioToNumber divides them after shifting both to 64
// significant bits, which keeps the relative error within a few units in the last place.

function bitLength(x: bigint): number { return x === 0n ? 0 : x.toString(2).length; }

/** num / den as a double for integers of any size (den > 0); relative error a few ulp */
export function ratioToNumber(num: bigint, den: bigint): number {
  if (den <= 0n) throw new Error('prob: denominator must be positive');
  if (num === 0n) return 0;
  const neg = num < 0n, n = neg ? -num : num;
  const sn = Math.max(0, bitLength(n) - 64), sd = Math.max(0, bitLength(den) - 64);
  const v = (Number(n >> BigInt(sn)) / Number(den >> BigInt(sd))) * 2 ** (sn - sd);
  return neg ? -v : v;
}

/** a fraction as a double, also when numerator or denominator exceed the double range */
export function fractionToNumber(q: Fraction): number { return ratioToNumber(q.num, q.den); }

/** the unreduced numerators C(N,k) a^k b^(N-k), k = 0..N, over den = (a + b)^N, of the binomial weight with q = a / (a + b) */
function binomialNumerators(n: number, q: Fraction): { nums: bigint[]; den: bigint } {
  if (!Number.isInteger(n) || n < 1) throw new Error('prob: N must be a positive integer');
  checkQ(q);
  const a = q.num, b = q.den - q.num;
  const ap: bigint[] = [1n], bp: bigint[] = [1n];
  for (let k = 1; k <= n; k++) { ap.push(ap[k - 1] * a); bp.push(bp[k - 1] * b); }
  const nums: bigint[] = [];
  let c = 1n;
  for (let k = 0; k <= n; k++) {
    nums.push(c * ap[k] * bp[n - k]);
    c = (c * BigInt(n - k)) / BigInt(k + 1);
  }
  return { nums, den: q.den ** BigInt(n) };
}

/** the binomial weight of c01.eq.binomial as doubles (the exact values of binomialWeight, divided once) */
export function binomialWeightValues(n: number, q: Fraction): number[] {
  const { nums, den } = binomialNumerators(n, q);
  return nums.map((x) => ratioToNumber(x, den));
}

/** P_N[|H_N - q| >= eps] exactly; the same value as deviationProbability, summed on unreduced numerators */
export function deviationTail(n: number, q: Fraction, eps: Fraction): Fraction {
  if (eps.num <= 0n) throw new Error('prob: eps must be positive');
  const { nums, den } = binomialNumerators(n, q);
  let s = 0n;
  nums.forEach((x, k) => { if (isDeviation(k, n, q, eps)) s += x; });
  return fraction(s, den);
}

/** max over x of |h(x) - p(x)| for counts c (h = c / N) and a weight with numerators a: exact */
export function maxDeviation(c: readonly number[], a: readonly number[]): Fraction {
  if (c.length !== a.length) throw new Error('prob: counts and weight differ in length');
  const h = weights(c), p = weights(a);
  let m = frac(0);
  h.forEach((x, i) => {
    const d = fsub(x, p[i]);
    const ad = d.num < 0n ? fraction(-d.num, d.den) : d;
    if (fcmp(ad, m) > 0) m = ad;
  });
  return m;
}

// ── formulas drawn as curves (demos c01.demo.varianz, c01.demo.dichte) ─────────────────

/** Var[chi_S] = q (1 - q) for q = P[S] (c01.eq.var-indikator), exact */
export function indicatorVariance(q: Fraction): Fraction {
  checkQ(q);
  return fmul(q, fsub(frac(1), q));
}

/** the same, q (1 - q), for a real q in [0, 1]: the parabola of figure c01.fig.varianz (c) */
export function indicatorVarianceValue(q: number): number {
  if (!(q >= 0 && q <= 1)) throw new Error('prob: q must lie in [0, 1]');
  return q * (1 - q);
}

/** the uniform density on [0, L]: 1/L for 0 <= x <= L, 0 otherwise (c01.eq.gleich has L = 1/2) */
export function uniformDensity(l: Fraction, x: number): number {
  const h = uniformHeight(l);
  return x >= 0 && x <= toNumber(l) ? toNumber(h) : 0;
}

/**
 * The integrand x p(x) of the mean M_1 for the density 1/x^2 on [1, infinity)
 * (c01.eq.kein-mittelwert): 1/x for x >= 1, 0 otherwise.
 */
export function inverseSquareMeanIntegrand(x: number): number {
  return x >= 1 ? 1 / x : 0;
}
