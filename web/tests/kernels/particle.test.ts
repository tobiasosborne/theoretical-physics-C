// Golden test of web/src/kernels/particle.ts against numerics/generate/particle_golden.jl
// (web/tests/golden/particle.json), and agreement of each c05 demo's default state with the
// numbers of its still (content/c05-teilchen/figures/dichte.tex, fourier.tex).
import { describe, expect, it } from 'vitest';
import {
  freeDensity, freePsi, intervalProbability, momentumDensity, momentumPhi, momentumWidth, spreadWidth, stateDensity, stripRatio, widthProduct, type State,
} from '../../src/kernels/particle';
import { expectGolden, loadGolden } from '../golden';

interface Case {
  fn: string; x?: number; t?: number; sigma?: number; a?: number; b?: number; k0?: number; u?: number;
  state?: State; k?: number; c?: number; eps?: number; expected: number | number[];
}
const golden = loadGolden<Case>('particle');

describe(`kernel particle against ${golden.reference.implementation}`, () => {
  it('has golden cases', () => { expect(golden.cases.length).toBeGreaterThan(100); });
  for (const c of golden.cases) {
    const what = `${c.fn}(${JSON.stringify({ ...c, expected: undefined })})`;
    it(what, () => {
      let got: unknown;
      switch (c.fn) {
        case 'freePsi': got = freePsi(c.x!, c.t!, c.sigma!, c.a!, c.k0!); break;
        case 'freeDensity': got = freeDensity(c.x!, c.t!, c.sigma!, c.a!, c.k0!); break;
        case 'momentumPhi': got = momentumPhi(c.u!, c.t!, c.sigma!, c.a!, c.k0!); break;
        case 'momentumDensity': got = momentumDensity(c.u!, c.sigma!, c.k0!); break;
        case 'spreadWidth': got = spreadWidth(c.sigma!, c.t!); break;
        case 'intervalProbability': got = intervalProbability(c.state!, c.a!, c.b!); break;
        case 'stripRatio': got = stripRatio(c.state!, c.c!, c.eps!); break;
        case 'stateDensity': got = stateDensity(c.state!, c.x!); break;
        default: throw new Error(`unknown case ${c.fn}`);
      }
      expectGolden(got, c.expected, golden.tolerance, what);
    });
  }
});

describe('c05 demos at their default state show the numbers of their stills', () => {
  it('c05.fig.fourier: peaks of |Psi|^2 and |Phi|^2 and the product hbar/2 at t = 0', () => {
    const r5 = (v: number) => Math.round(v * 1e5) / 1e5;
    expect([0.5, 1, 2].map((s) => r5(freeDensity(0, 0, s, 0, 0)))).toEqual([0.79788, 0.39894, 0.19947]);
    expect([0.5, 1, 2].map((s) => r5(momentumDensity(0, s, 0)))).toEqual([0.39894, 0.79788, 1.59577]);
    expect([0.5, 1, 2].map(momentumWidth)).toEqual([1, 0.5, 0.25]);
    for (const s of [0.5, 1, 2]) expect(widthProduct(s, 0)).toBe(0.5);
  });
  it('c05.fig.dichte: P[x in [-0.5, 1.5]] = 0.62466, strip area 0.0158, p(c) = 0.07895', () => {
    expect(Math.round(intervalProbability('gauss', -0.5, 1.5) * 1e5) / 1e5).toBe(0.62466);
    expect(Math.round(intervalProbability('gauss', -1.9, -1.7) * 1e4) / 1e4).toBe(0.0158);
    expect(Math.round(stateDensity('gauss', -1.8) * 1e5) / 1e5).toBe(0.07895);
  });
});
