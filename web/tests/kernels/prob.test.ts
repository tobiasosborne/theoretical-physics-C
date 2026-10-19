import { describe, expect, it } from 'vitest';
import { counts, expectation, prefixSums, probability, runningMeans, sample, sampleMean, sampleVariance, toNumber, variance, weights, words, type Fraction } from '../../src/kernels/prob';
import { expectGolden, loadGolden } from '../golden';

interface Case {
  fn: 'expectation' | 'variance' | 'probability' | 'words' | 'sample' | 'prefixSums' | 'counts' | 'sampleMean' | 'sampleVariance';
  name?: string; a?: number[]; f?: number[]; event?: number[]; seed?: number; count?: number; tail?: number;
  expected: number[];
}

const golden = loadGolden<Case>('prob');
const pair = (q: Fraction): number[] => [Number(q.num), Number(q.den)];

describe(`kernel prob against ${golden.reference.implementation}`, () => {
  it('has golden cases of every kind', () => {
    const kinds = new Set(golden.cases.map((c) => c.fn));
    for (const k of ['expectation', 'variance', 'probability', 'words', 'sample', 'prefixSums', 'counts', 'sampleMean', 'sampleVariance']) expect(kinds.has(k as Case['fn'])).toBe(true);
  });
  it('compares exactly', () => { expect(golden.tolerance.abs).toBe(0); });
  for (const c of golden.cases) {
    const what = `${c.fn}(${c.name ?? ''}${c.seed !== undefined ? `, seed ${c.seed}` : ''}${c.count !== undefined ? `, N = ${c.count}` : ''})`;
    it(what, () => {
      let got: number[];
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
      }
      expectGolden(got, c.expected, golden.tolerance, what);
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
