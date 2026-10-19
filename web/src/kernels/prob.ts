// Kernel of the demo c01.demo.haeufigkeit: finite probability weights, exact expectation
// and variance, and a seeded sampler. Pure functions, no DOM, no clock.
// Reference implementation and golden values:
// web/tests/golden/reference/prob.jl -> web/tests/golden/prob.json.
//
// Conventions (chapter c01, definitions D53 to D56).
//   outcome set   X = {0, ..., n-1} (indices; the demo attaches labels)
//   weight        p(i) = a[i] / D with integer numerators a[i] >= 0 and D = a[0] + ... + a[n-1] > 0,
//                 so p(i) >= 0 and the weights sum to 1 by construction (D54)
//   measurement   f(i) = f[i], integers
//   expectation   E[f]   = sum_i p(i) f(i)                       (D55)
//   variance      Var[f] = E[(f - E[f])^2] = E[f^2] - E[f]^2     (D56, c01.prop.varianz)
// A sample is a list of outcomes; its relative frequencies h(i) = c[i] / N are themselves a
// weight (c01.eq.haeufigkeit), so "mean and variance of the sample" are the expectation and
// variance of f in the weight h. No (N - 1) correction is applied anywhere.
//
// Exactness. Every result is an exact fraction of integers, computed with BigInt and
// returned in lowest terms with a positive denominator.
//
// Sampler. words(seed) is the generator mulberry32 (32-bit state; the same function the
// demo harness uses for ctx.random). An outcome is drawn by rejection: with
// L = D * floor(2^32 / D), a word w >= L is discarded, otherwise the outcome is the index i
// with a[0] + ... + a[i-1] <= (w mod D) < a[0] + ... + a[i]. If the words were uniform on
// {0, ..., 2^32 - 1}, each outcome i would have probability exactly a[i] / D. The words are
// not random: the generator is a deterministic function of the seed. Nothing is claimed
// here about its statistical quality, and nothing about how fast relative frequencies
// approach the weights.

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
