// Kernel photo.ts against the Julia reference (numerics/src/c00_reference.jl ->
// tests/golden/photo.json, regenerated and checked by numerics/generate/c00_golden.jl),
// and the relations of c00.eq.photoeffekt and c00.eq.schwelle.
import { afterAll, describe, expect, it } from 'vitest';
import * as K from '../../src/kernels/photo';
import { expectGolden, loadGolden } from '../golden';

type Tol = { abs?: number; rel?: number };
interface Case { fn: string; tol: string; W_eV?: number | number[]; nu?: number[]; E_eV?: number[]; expected: number[] }
const golden = loadGolden<Case>('photo') as ReturnType<typeof loadGolden<Case>> & { tolerances: Record<string, Tol> };
const tolOf = (c: Case): Tol => golden.tolerances[c.tol] ?? golden.tolerance;
const worst: Record<string, number> = {};

describe(`kernel photo against ${golden.reference.implementation}`, () => {
  for (const c of golden.cases) {
    const what = `${c.fn}${typeof c.W_eV === 'number' ? ` W=${c.W_eV} eV` : ''}`;
    it(what, () => {
      let got: number[];
      switch (c.fn) {
        case 'constants': got = [K.H_J_S, K.E_C, K.M_E_KG, K.C_M_PER_S]; break;
        case 'thresholdFrequency': got = (c.W_eV as number[]).map(K.thresholdFrequency); break;
        case 'kineticMax': got = c.nu!.map((nu) => K.kineticMax(nu, c.W_eV as number)); break;
        case 'maxSpeed': got = c.nu!.map((nu) => K.maxSpeed(nu, c.W_eV as number)); break;
        case 'speedOfEnergy': got = c.E_eV!.map(K.speedOfEnergy); break;
        default: throw new Error(`unknown case ${c.fn}`);
      }
      c.expected.forEach((v, i) => { const d = Math.abs(got[i] - v); worst[c.fn] = Math.max(worst[c.fn] ?? 0, v ? d / Math.abs(v) : d); });
      expectGolden(got, c.expected, tolOf(c), what);
    });
  }
  afterAll(() => { console.log(`photo: measured maximum deviation (relative, absolute at 0) ${JSON.stringify(worst)}`); });
});

describe('kernel photo: relations of chapter c00', () => {
  it('one slope h for every W (figure c00.fig.photoeffekt)', () => {
    for (const W of [1.5, 2, 3.2]) {
      const slope = (K.kineticMax(9e14, W) - K.kineticMax(7e14, W)) / 2e14;
      expect(Math.abs(slope * K.E_C / K.H_J_S - 1)).toBeLessThan(1e-9);
    }
  });
  it('the line starts at the threshold W/h', () => {
    for (const W of [1.5, 2, 3.2]) {
      expect(Math.abs(K.kineticMax(K.thresholdFrequency(W), W))).toBeLessThan(1e-14);
      expect(K.emits(K.thresholdFrequency(W) * (1 - 1e-9), W)).toBe(false);
      expect(K.emits(K.thresholdFrequency(W) * (1 + 1e-9), W)).toBe(true);
    }
  });
  it('every emitted electron is at most as fast as v_max', () => {
    for (const f of [0, 0.1, 0.5, 0.99, 1]) expect(K.emittedSpeed(1e15, 2, f)).toBeLessThanOrEqual(K.maxSpeed(1e15, 2));
    expect(K.emittedSpeed(1e15, 2, 0)).toBe(K.maxSpeed(1e15, 2));
  });
});
