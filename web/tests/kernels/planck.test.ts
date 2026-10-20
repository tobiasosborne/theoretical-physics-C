// Kernel planck.ts against the Julia reference (numerics/src/c00_reference.jl ->
// tests/golden/planck.json, regenerated and checked by numerics/generate/c00_golden.jl),
// and the inequalities the chapter derives (c00.eq.schranken).
import { afterAll, describe, expect, it } from 'vitest';
import * as K from '../../src/kernels/planck';
import { expectGolden, loadGolden } from '../golden';

type Tol = { abs?: number; rel?: number };
interface Case { fn: string; tol: string; x?: number[]; s?: number[]; tau?: number; T?: number | number[]; nu?: number[]; T0?: number[]; names?: string[]; expected: number | number[] }
const golden = loadGolden<Case>('planck') as ReturnType<typeof loadGolden<Case>> & { tolerances: Record<string, Tol> };
const tolOf = (c: Case): Tol => golden.tolerances[c.tol] ?? golden.tolerance;
const worst: Record<string, number> = {};
const note = (cls: string, got: unknown, exp: unknown) => {
  const g = Array.isArray(got) ? got : [got], e = Array.isArray(exp) ? exp : [exp];
  e.forEach((v, i) => { if (typeof v === 'number' && v !== 0) worst[cls] = Math.max(worst[cls] ?? 0, Math.abs((g[i] as number) - v) / Math.abs(v)); });
};

describe(`kernel planck against ${golden.reference.implementation}`, () => {
  for (const c of golden.cases) {
    const what = `${c.fn}${c.T !== undefined ? ` T=${c.T}` : ''}${c.tau !== undefined ? ` tau=${c.tau}` : ''}`;
    it(what, () => {
      let got: number | number[];
      switch (c.fn) {
        case 'constants': got = [K.H_J_S, K.K_B_J_PER_K, K.C_M_PER_S]; break;
        case 'ratio': got = c.x!.map(K.ratio); break;
        case 'lowerBound': got = c.x!.map(K.lowerBound); break;
        case 'upperBound': got = c.x!.map(K.upperBound); break;
        case 'reducedU': got = c.s!.map((s) => K.reducedU(s, c.tau!)); break;
        case 'reducedUkl': got = c.s!.map((s) => K.reducedUkl(s, c.tau!)); break;
        case 'exponentX': got = c.nu!.map((nu) => K.exponentX(nu, c.T as number)); break;
        case 'spectralDensity': got = c.nu!.map((nu) => K.spectralDensity(nu, c.T as number)); break;
        case 'limitingForm': got = c.nu!.map((nu) => K.limitingForm(nu, c.T as number)); break;
        case 'u0': got = c.T0!.map(K.u0); break;
        case 'peakX': got = K.PEAK_X; break;
        case 'peakValue': got = K.PEAK_VALUE; break;
        case 'peakFrequency': got = (c.T as number[]).map(K.peakFrequency); break;
        default: throw new Error(`unknown case ${c.fn}`);
      }
      note(c.tol, got, c.expected);
      expectGolden(got, c.expected as number | number[], tolOf(c), what);
    });
  }
  it('covers every exported formula', () => {
    const kinds = new Set(golden.cases.map((c) => c.fn));
    for (const k of ['constants', 'ratio', 'lowerBound', 'upperBound', 'reducedU', 'reducedUkl', 'exponentX', 'spectralDensity', 'limitingForm', 'u0', 'peakX', 'peakValue', 'peakFrequency']) expect(kinds.has(k)).toBe(true);
  });
  afterAll(() => { console.log(`planck: measured maximum relative deviation per class ${JSON.stringify(worst)}`); });
});

describe('kernel planck: relations of chapter c00', () => {
  const xs = Array.from({ length: 400 }, (_, i) => 1e-6 + i * 0.05);
  it('the bounds of c00.eq.schranken hold', () => {
    for (const x of xs) {
      expect(K.lowerBound(x)).toBeLessThanOrEqual(K.ratio(x) * (1 + 1e-15));
      expect(K.ratio(x)).toBeLessThanOrEqual(K.upperBound(x) * (1 + 1e-15));
    }
  });
  it('u/u_kl equals the ratio of x alone (c00.eq.grenzform)', () => {
    for (const T of [300, 3000, 6000]) for (const nu of [1e12, 1e14, 6e14]) {
      const r = K.spectralDensity(nu, T) / K.limitingForm(nu, T);
      expect(Math.abs(r - K.ratio(K.exponentX(nu, T)))).toBeLessThan(1e-14);
    }
  });
  it('the reduced form is u/u_0 with s = h nu/(k_B T_0)', () => {
    const T0 = 6000;
    for (const tau of [1, 5 / 6, 2 / 3]) for (const s of [0.3, 1, 2.8, 6]) {
      const nu = K.frequencyOfS(s, T0);
      expect(Math.abs(K.spectralDensity(nu, tau * T0) / K.u0(T0) / K.reducedU(s, tau) - 1)).toBeLessThan(1e-13);
      expect(Math.abs(K.limitingForm(nu, tau * T0) / K.u0(T0) / K.reducedUkl(s, tau) - 1)).toBeLessThan(1e-13);
    }
  });
  it('the maximum is a maximum', () => {
    for (const tau of [0.5, 1, 1.3]) {
      const p = K.reducedPeak(tau);
      for (const d of [-1e-3, 1e-3]) expect(K.reducedU(p.s + d, tau)).toBeLessThan(p.value);
      expect(Math.abs(K.reducedU(p.s, tau) / p.value - 1)).toBeLessThan(1e-13);
    }
  });
});
