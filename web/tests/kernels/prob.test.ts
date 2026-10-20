import { describe, expect, it } from 'vitest';
import {
  allEvents, binomialWeight, indicatorVariance, indicatorVarianceValue, uniformDensity, inverseSquareMeanIntegrand, chebyshevBound, coarseBound, counts, deviationProbability, diceDoublesEvent, diceSumEvent, eventCounts, expectation, fadd, frac,
  frequencyVariance, gaussDensity, gaussInterval, indicator, indicatorTerms, inverseSquareDensity, inverseSquarePartial, mixture, moment, nearestWeight, pointWeightIndex,
  prefixSums, probability, properSplit, renormalise, runningMeans, sample, sampleMean, sampleVariance, squaredDeviations, toNumber, uniformHeight, uniformInterval,
  variance, varianceTerms, weights, words, type Fraction,
} from '../../src/kernels/prob';
import { binomialWeightValues, deviationTail, fractionToNumber, maxDeviation, ratioToNumber } from '../../src/kernels/prob';
import { expectGolden, loadGolden } from '../golden';

type Fn = 'expectation' | 'variance' | 'probability' | 'words' | 'sample' | 'prefixSums' | 'counts' | 'sampleMean' | 'sampleVariance'
  | 'renormalise' | 'nearestWeight' | 'mixture' | 'properSplit' | 'pointWeightIndex' | 'moment' | 'squaredDeviations' | 'varianceTerms'
  | 'indicatorTerms' | 'allEvents' | 'diceSumEvent' | 'binomialWeight' | 'deviationProbability' | 'chebyshevBound' | 'coarseBound'
  | 'frequencyVariance' | 'eventCounts' | 'uniformInterval' | 'deviationTail' | 'maxDeviation' | 'indicatorVariance';
type Pair = [number, number];
interface Case {
  fn: Fn;
  name?: string; a?: number[]; b?: number[]; f?: number[]; event?: number[]; seed?: number; count?: number; tail?: number;
  i?: number; j?: number; v?: number; x?: number[]; d?: number; k?: number; K?: number; c?: Pair; n?: number; s?: number;
  N?: number; q?: Pair; eps?: Pair; L?: Pair;
  /** integers (exact) */
  expected?: number | number[] | number[][];
  /** exact fractions as "num/den" (values beyond 2^53) */
  exact?: string[];
}
type Real = number | 'Infinity' | '-Infinity';
interface DensityCase { fn: 'gaussDensity' | 'gaussInterval' | 'inverseSquarePartial' | 'indicatorVarianceValue' | 'uniformDensity' | 'inverseSquareMeanIntegrand'; x?: Real; a?: Real; b?: Real; L?: [number, number]; expected: number | number[] }

const golden = loadGolden<Case>('prob');
const density = loadGolden<DensityCase>('prob-density');
const pair = (q: Fraction): number[] => [Number(q.num), Number(q.den)];
const fr = (p: Pair): Fraction => frac(p[0], p[1]);
const str = (q: Fraction): string => `${q.num}/${q.den}`;
const real = (x: Real): number => (x === 'Infinity' ? Infinity : x === '-Infinity' ? -Infinity : x);
/** exact comparison of fractions written as strings; fails like expectGolden */
function expectExact(got: string[], expected: string[], what: string): void {
  if (got.length !== expected.length) throw new Error(`golden mismatch: ${what}: ${got.length} values, reference ${expected.length}`);
  got.forEach((g, i) => { if (g !== expected[i]) throw new Error(`golden mismatch: ${what}[${i}]: kernel ${g}, reference ${expected[i]}`); });
}

describe(`kernel prob against ${golden.reference.implementation}`, () => {
  it('has golden cases of every kind', () => {
    const kinds = new Set(golden.cases.map((c) => c.fn));
    for (const k of ['expectation', 'variance', 'probability', 'words', 'sample', 'prefixSums', 'counts', 'sampleMean', 'sampleVariance',
      'renormalise', 'nearestWeight', 'mixture', 'properSplit', 'pointWeightIndex', 'moment', 'squaredDeviations', 'varianceTerms', 'indicatorTerms',
      'allEvents', 'diceSumEvent', 'binomialWeight', 'deviationProbability', 'chebyshevBound', 'coarseBound', 'frequencyVariance', 'eventCounts', 'uniformInterval']) {
      expect(kinds.has(k as Fn), k).toBe(true);
    }
  });
  it('compares exactly', () => { expect(golden.tolerance.abs).toBe(0); });
  for (const c of golden.cases) {
    const what = `${c.fn}(${c.name ?? ''}${c.seed !== undefined ? `, seed ${c.seed}` : ''}${c.count !== undefined ? `, N = ${c.count}` : ''})`;
    it(what, () => {
      let got: number | number[] | number[][] = [];
      let exact: string[] | null = null;
      switch (c.fn) {
        case 'expectation': got = pair(expectation(c.a!, c.f!)); break;
        case 'variance': got = pair(variance(c.a!, c.f!)); break;
        case 'probability': got = pair(probability(c.a!, c.event!)); break;
        case 'words': { const g = words(c.seed!); got = Array.from({ length: c.count! }, () => g()); break; }
        case 'sample': { const s = sample(c.a!, c.seed!, c.count!); got = c.tail ? s.slice(-c.tail) : s; break; }
        case 'prefixSums': got = prefixSums(sample(c.a!, c.seed!, c.count!), c.f!); break;
        case 'counts': got = counts(sample(c.a!, c.seed!, c.count!), c.a!.length); break;
        case 'sampleMean': got = pair(sampleMean(counts(sample(c.a!, c.seed!, c.count!), c.a!.length), c.f!)); break;
        case 'sampleVariance': got = pair(sampleVariance(counts(sample(c.a!, c.seed!, c.count!), c.a!.length), c.f!)); break;
        case 'renormalise': got = renormalise(c.a!, c.i!, c.v!); break;
        case 'nearestWeight': got = nearestWeight(c.x!, c.d!); break;
        case 'mixture': got = mixture(c.a!, c.b!, c.k!, c.K!); break;
        case 'properSplit': { const r = properSplit(c.a!, c.i!, c.j!); got = [r.q, r.r, pair(r.eps)]; break; }
        case 'pointWeightIndex': got = pointWeightIndex(c.a!); break;
        case 'moment': got = pair(moment(c.a!, c.f!, fr(c.c!))); break;
        case 'squaredDeviations': got = squaredDeviations(c.a!, c.f!).map(pair); break;
        case 'varianceTerms': got = varianceTerms(c.a!, c.f!).map(pair); break;
        case 'indicatorTerms': got = indicatorTerms(c.a!, c.event!).map(pair); break;
        case 'allEvents': got = allEvents(c.n!); break;
        case 'diceSumEvent': got = diceSumEvent(c.s!); break;
        case 'binomialWeight': exact = binomialWeight(c.N!, fr(c.q!)).map(str); break;
        case 'deviationProbability': exact = [str(deviationProbability(c.N!, fr(c.q!), fr(c.eps!)))]; break;
        case 'chebyshevBound': exact = [str(chebyshevBound(c.N!, fr(c.q!), fr(c.eps!)))]; break;
        case 'coarseBound': exact = [str(coarseBound(c.N!, fr(c.eps!)))]; break;
        case 'frequencyVariance': exact = [str(frequencyVariance(c.N!, fr(c.q!)))]; break;
        case 'eventCounts': got = eventCounts(sample(c.a!, c.seed!, c.count!), c.event!); break;
        case 'indicatorVariance': got = pair(indicatorVariance(fr(c.q!))); break;
        case 'uniformInterval': got = pair(uniformInterval(fr(c.L!), fr(c.a as Pair), fr(c.b as Pair))); break;
        case 'deviationTail': exact = [str(deviationTail(c.N!, fr(c.q!), fr(c.eps!)))]; break;
        case 'maxDeviation': got = pair(maxDeviation(counts(sample(c.a!, c.seed!, c.count!), c.a!.length), c.a!)); break;
      }
      if (c.exact) expectExact(exact ?? [], c.exact, what);
      else expectGolden(got, c.expected!, golden.tolerance, what);
    });
  }
});

describe('kernel prob: properties derived in chapter c01', () => {
  it('relative frequencies are a weight: counts add up to N', () => {
    const s = sample([1, 2, 2, 2, 2, 3], 5, 500);
    expect(counts(s, 6).reduce((x, y) => x + y, 0)).toBe(500);
    expect(counts(s, 6, 37).reduce((x, y) => x + y, 0)).toBe(37);
  });
  it('a sample is a prefix of a longer sample with the same seed', () => {
    expect(sample([1, 1, 1], 9, 300).slice(0, 50)).toEqual(sample([1, 1, 1], 9, 50));
  });
  it('the variance of a point weight vanishes and nothing else is drawn from it', () => {
    expect(variance([0, 5, 0], [3, -4, 8])).toEqual({ num: 0n, den: 1n });
    expect(new Set(sample([0, 5, 0], 2, 100))).toEqual(new Set([1]));
  });
  it('the last running mean is the mean of the sample, and the weights of a sample add up to 1', () => {
    const a = [1, 2, 2, 2, 2, 3], f = [1, 2, 3, 4, 5, 6];
    const s = sample(a, 4, 250);
    const means = runningMeans(s, f);
    expect(means.length).toBe(250);
    expect(means[249]).toBeCloseTo(toNumber(sampleMean(counts(s, 6), f)), 12);
    expect(means[0]).toBe(f[s[0]]);
    const h = weights(counts(s, 6));
    expect(h.reduce((x, q) => x + toNumber(q), 0)).toBeCloseTo(1, 12);
    expect(weights(a)[5]).toEqual({ num: 1n, den: 4n });
  });
  it('refuses a weight that is not one', () => {
    expect(() => expectation([0, 0], [1, 2])).toThrow();
    expect(() => expectation([1, -1, 2], [1, 2, 3])).toThrow('numerators must be non-negative integers');
    expect(() => variance([1, -1, 2], [1, 2, 3])).toThrow('numerators must be non-negative integers');
    expect(() => expectation([1, 0.5, 2], [1, 2, 3])).toThrow('numerators must be non-negative integers');
    expect(() => variance([1, 0.5, 2], [1, 2, 3])).toThrow('numerators must be non-negative integers');
    expect(() => sample([1, -1, 2], 1, 3)).toThrow();
  });
  it('accepts sample counts above the sampler denominator limit in the moment routines', () => {
    const c = [2 ** 21, 2 ** 21];
    expect(sampleMean(c, [0, 1])).toEqual({ num: 1n, den: 2n });
    expect(sampleVariance(c, [0, 1])).toEqual({ num: 1n, den: 4n });
  });
});

describe(`kernel prob, densities, against ${density.reference.implementation}`, () => {
  it('states a tolerance', () => { expect(density.tolerance.abs).toBeGreaterThan(0); });
  for (const c of density.cases) {
    const what = `${c.fn}(${c.x ?? ''}${c.a !== undefined ? `${c.a}, ${c.b}` : c.b ?? ''})`;
    it(what, () => {
      let got: number | number[];
      switch (c.fn) {
        case 'gaussDensity': got = gaussDensity(real(c.x!)); break;
        case 'gaussInterval': got = gaussInterval(real(c.a!), real(c.b!)); break;
        case 'inverseSquarePartial': { const r = inverseSquarePartial(real(c.b!)); got = [r.mass, r.mean]; break; }
        case 'indicatorVarianceValue': got = indicatorVarianceValue(real(c.x!)); break;
        case 'uniformDensity': got = uniformDensity(frac(c.L![0], c.L![1]), real(c.x!)); break;
        case 'inverseSquareMeanIntegrand': got = inverseSquareMeanIntegrand(real(c.x!)); break;
      }
      expectGolden(got, c.expected, density.tolerance, what);
    });
  }
});

describe('kernel prob: properties of the new routines', () => {
  it('renormalise keeps D and the chosen value', () => {
    for (let v = 0; v <= 24; v++) {
      const b = renormalise([2, 4, 4, 4, 4, 6], 3, v);
      expect(b.reduce((x, y) => x + y, 0)).toBe(24);
      expect(b[3]).toBe(v);
      expect(b.every((x) => x >= 0 && Number.isInteger(x))).toBe(true);
    }
    expect(() => renormalise([1, 1], 0, 3)).toThrow();
  });
  it('nearestWeight returns a weight with denominator D', () => {
    for (const x of [[0.1, 0.7, 0.2], [-1, -2, 5], [0.333, 0.333, 0.334]]) expect(nearestWeight(x, 24).reduce((s, y) => s + y, 0)).toBe(24);
    expect(() => nearestWeight([0, -1], 12)).toThrow();
  });
  it('a mixture is a weight, and the split of the proof gives back p', () => {
    const m = mixture([1, 2, 2, 2, 2, 3], [0, 0, 1, 0, 0, 0], 5, 12);
    expect(m.every((x) => x >= 0)).toBe(true);
    const { q, r } = properSplit([1, 2, 2, 2, 2, 3], 5, 0);
    expect(mixture(q, r, 1, 2)).toEqual([1, 2, 2, 2, 2, 3]);
    expect(() => properSplit([0, 0, 1, 0, 0, 0], 2, 1)).toThrow('positive weight');
  });
  it('E[chi_S] = P[S], Var[chi_S] = P[S](1 - P[S]), and the variance terms add up to Var', () => {
    const a = [1, 2, 2, 2, 2, 3], S = [1, 3, 5];
    const sum = (v: Fraction[]) => v.reduce((x, y) => fadd(x, y), frac(0));
    expect(expectation(a, indicator(S, 6))).toEqual(probability(a, S));
    expect(sum(indicatorTerms(a, S))).toEqual(frac(7, 12));
    expect(variance(a, indicator(S, 6))).toEqual(frac(35, 144));
    expect(sum(varianceTerms(a, [1, 2, 3, 4, 5, 6]))).toEqual(frac(395, 144));
    expect(moment(a, [1, 2, 3, 4, 5, 6], frac(47, 12))).toEqual(frac(0));
  });
  it('the binomial weight sums to 1 and the bounds hold', () => {
    for (const [n, q, e] of [[16, frac(1, 2), frac(1, 4)], [50, frac(1, 3), frac(1, 10)], [200, frac(3, 4), frac(1, 20)]] as const) {
      expect(binomialWeight(n, q).reduce((x, y) => fadd(x, y), frac(0))).toEqual(frac(1));
      const p = toNumber(deviationProbability(n, q, e));
      expect(p).toBeLessThanOrEqual(toNumber(chebyshevBound(n, q, e)));
      expect(toNumber(chebyshevBound(n, q, e))).toBeLessThanOrEqual(toNumber(coarseBound(n, e)));
    }
  });
  it('allEvents has 2^n members; dice events have the expected sizes', () => {
    expect(allEvents(6).length).toBe(64);
    expect([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((s) => diceSumEvent(s).length)).toEqual([1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1]);
    expect(diceDoublesEvent().length).toBe(6);
  });
  it('densities: the uniform density of c01.eq.gleich has height 2 and mass 1; 1/x^2 has mass tending to 1', () => {
    expect(uniformHeight(frac(1, 2))).toEqual(frac(2));
    expect(uniformInterval(frac(1, 2), frac(-5), frac(5))).toEqual(frac(1));
    expect(uniformInterval(frac(1, 2), frac(1, 3), frac(1, 3))).toEqual(frac(0));
    expect(inverseSquareDensity(0.5)).toBe(0);
    expect(gaussInterval(0, Infinity)).toBeCloseTo(0.5, 15);
  });
});

describe('kernel prob: drawing values of the binomial weight (fork C)', () => {
  it('ratioToNumber handles numbers beyond the double range', () => {
    expect(ratioToNumber(1n, 2n ** 1000n)).toBe(2 ** -1000);
    expect(ratioToNumber(2n ** 2000n + 1n, 2n ** 2000n)).toBe(1);
    expect(ratioToNumber(-3n, 4n)).toBe(-0.75);
    expect(ratioToNumber(0n, 7n ** 900n)).toBe(0);
    expect(fractionToNumber(frac(2517, 32768))).toBe(2517 / 32768);
  });
  it('binomialWeightValues are the exact weights, to a few ulp, and sum to 1', () => {
    for (const [n, q] of [[16, frac(1, 2)], [40, frac(3, 4)], [300, frac(1, 12)], [1000, frac(5, 12)]] as const) {
      const v = binomialWeightValues(n, q);
      const ex = binomialWeight(n, q);
      v.forEach((x, k) => expect(Math.abs(x - fractionToNumber(ex[k]))).toBeLessThanOrEqual(1e-15 * Math.max(x, 1e-300)));
      expect(Math.abs(v.reduce((s, x) => s + x, 0) - 1)).toBeLessThan(1e-12);
    }
  });
  it('deviationTail equals deviationProbability', () => {
    for (const [n, q, e] of [[4, frac(1, 2), frac(1, 4)], [30, frac(1, 3), frac(1, 6)], [12, frac(1, 4), frac(1, 4)], [7, frac(1), frac(1, 24)]] as const) {
      expect(deviationTail(n, q, e)).toEqual(deviationProbability(n, q, e));
    }
  });
});
