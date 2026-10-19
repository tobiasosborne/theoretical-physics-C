// Kernel hydrogen.ts against the Julia reference (numerics/src/Hydrogen.jl ->
// tests/golden/hydrogen.json), against the reviewed authority
// evidence/derivations/c11/golden.json, and statistical tests of the exact samplers.
//
// HYDROGEN_KERNEL=<path, relative to the working directory> runs the same tests on another
// module with the kernel's interface: the red corpus (tests/red/c11-render/) plants defects
// that way, without a second copy of the kernel.
//
// Normalisation of the densities is NOT re-tested here by quadrature: it is exact in
// DERIVATION.md Results 3.2, 4.1, 5.1 and repeated in exact rational arithmetic by
// numerics/test/runtests.jl; the golden comparison ties this kernel to those functions.
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { expectGolden, loadGolden } from '../golden';

type Kernel = typeof import('../../src/kernels/hydrogen');
const HERE = path.dirname(new URL(import.meta.url).pathname);
const REPO = path.resolve(HERE, '../../..');
const kernelFile = process.env.HYDROGEN_KERNEL ? path.resolve(process.cwd(), process.env.HYDROGEN_KERNEL) : path.resolve(HERE, '../../src/kernels/hydrogen.ts');
const K = (await import(kernelFile)) as Kernel;

type Tol = { abs?: number; rel?: number };
interface Case {
  fn: string; tol: string; n?: number; l?: number; m?: number; x?: number[]; p?: number[]; angles?: [number, number][];
  points?: [number, number, number][]; state?: string; sigma?: number; q?: number; names?: string[];
  expected: number | number[] | number[][]; variance?: number[];
}
const golden = loadGolden<Case>('hydrogen') as ReturnType<typeof loadGolden<Case>> & { tolerances: Record<string, Tol> };
const tolOf = (c: Case): Tol => golden.tolerances[c.tol] ?? golden.tolerance;

// measured deviations from the reference, per tolerance class (printed at the end)
const measured: Record<string, { abs: number; rel: number; n: number }> = {};
function record(cls: string, got: unknown, exp: unknown): void {
  if (Array.isArray(exp)) { exp.forEach((e, i) => record(cls, (got as unknown[])?.[i], e)); return; }
  if (typeof got !== 'number' || typeof exp !== 'number') return;
  const m = (measured[cls] ??= { abs: 0, rel: 0, n: 0 });
  const d = Math.abs(got - exp);
  m.abs = Math.max(m.abs, d); m.n++;
  if (exp !== 0 && Math.abs(exp) > 1e-12) m.rel = Math.max(m.rel, d / Math.abs(exp));
}

function evaluate(c: Case): unknown {
  const { n, l, m } = c as Required<Pick<Case, 'n' | 'l' | 'm'>>;
  switch (c.fn) {
    case 'R': return c.x!.map((x) => K.radialR(n, l, x));
    case 'radialDensity': return c.x!.map((x) => K.radialDensity(n, l, x));
    case 'radialCdf': return c.x!.map((x) => K.radialCdf(n, l, x));
    case 'tailPolynomial': return [...K.tailPolynomial(n, l)];
    case 'radialQuantile': return c.p!.map((p) => K.radialQuantile(n, l, p));
    case 'radialNodes': return K.radialNodes(n, l);
    case 'mostProbableRadius': return K.mostProbableRadius(n, l);
    case 'moments': { const mo = K.radialMoments(n, l); return [mo.r, mo.r2, mo.inverseR]; }
    case 'ylm': return c.angles!.map(([t, p]) => [...K.ylm(l, m, t, p)]);
    case 'thetaDensityCoefficients': return [...K.thetaDensityCoefficients(l, m)];
    case 'thetaCdfCoefficients': return [...K.thetaCdfCoefficients(l, m)];
    case 'psi': return c.points!.map(([x, y, z]) => [...K.psi(n, l, m, x, y, z)]);
    case 'psiState': return c.points!.map(([x, y, z]) => [...K.psiState(c.state as never, x, y, z)]);
    case 'labHarmonics': {
      const b = K.massFractions(c.q!).b;
      const v = c.x!.map((x) => K.labHarmonics(n, l, c.sigma!, b, x));
      return [v.map((u) => u[0]), v.map((u) => u[1])];
    }
    case 'constants': {
      const f = K.massFractions();
      const all: Record<string, number> = {
        m_e_over_m_p: K.M_E_OVER_M_P, mu_over_m_e: f.muOverMe, a_0: K.A_0_M, a_mu: K.aMuMetres(),
        E_1_m_e_eV: K.energyLevel(1, 'electron').eV, E_1_mu_eV: K.energyLevel(1, 'reduced').eV,
        E_1_m_e_J: K.energyLevel(1, 'electron').J, E_1_mu_J: K.energyLevel(1, 'reduced').J,
      };
      return c.names!.map((k) => all[k]);
    }
    case 'timeUnit': return K.timeUnitSeconds();
    default: throw new Error(`golden case with unknown fn '${c.fn}'`);
  }
}
const label = (c: Case): string => {
  const a = [c.n, c.l, c.m].filter((v) => v !== undefined).join(',');
  return `${c.fn}(${c.state ?? a}${c.sigma !== undefined ? `; sigma=${c.sigma}, q=${c.q}` : ''})`;
};

describe(`kernel hydrogen against ${golden.reference.implementation}`, () => {
  it('has golden cases of every kind', () => {
    const kinds = new Set(golden.cases.map((c) => c.fn));
    for (const k of ['R', 'radialDensity', 'radialCdf', 'tailPolynomial', 'radialQuantile', 'radialNodes', 'mostProbableRadius', 'moments', 'ylm',
      'thetaDensityCoefficients', 'thetaCdfCoefficients', 'psi', 'psiState', 'labHarmonics', 'constants', 'timeUnit']) expect(kinds.has(k), k).toBe(true);
  });
  for (const c of golden.cases) {
    if (c.fn === 'mostProbableRadius' && c.n! > 2) {
      it.skip(`${label(c)}: unsupported by the kernel (n > 2)`, () => {});
      continue;
    }
    it(label(c), () => {
      const got = evaluate(c);
      record(c.tol, got, c.expected);
      expectGolden(got, c.expected as never, tolOf(c), label(c));
    });
  }
  it('reports the measured deviations (they must stay below the stated tolerances)', () => {
    for (const [cls, m] of Object.entries(measured)) {
      console.log(`hydrogen golden: class ${cls}: ${m.n} values, largest absolute deviation ${m.abs.toExponential(2)}, largest relative deviation ${m.rel.toExponential(2)}`);
    }
    expect(Object.keys(measured).length).toBeGreaterThan(0);
  });
});

describe('kernel hydrogen against the authority evidence/derivations/c11/golden.json', () => {
  const A = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence/derivations/c11/golden.json'), 'utf8')) as {
    constants: Record<string, { value: string }>;
    radial: Array<{ n: number; l: number; moments: Record<string, string>; samples: Array<{ r_over_a_mu: number; R_times_a_mu_to_3_over_2: string; cdf: string }> }>;
  };
  // the authority states 17 significant digits; a double carries 15 to 17. 1e-14 relative and
  // 1e-15 absolute (cancellation in the CDF at small x) are unvalidated choices.
  const tol = { rel: 1e-14, abs: 1e-15 };
  it('radial samples and CDF samples', () => {
    for (const e of A.radial) for (const s of e.samples) {
      expectGolden(K.radialR(e.n, e.l, s.r_over_a_mu), Number(s.R_times_a_mu_to_3_over_2), tol, `R(${e.n},${e.l}) at ${s.r_over_a_mu}`);
      expectGolden(K.radialCdf(e.n, e.l, s.r_over_a_mu), Number(s.cdf), tol, `F(${e.n},${e.l}) at ${s.r_over_a_mu}`);
    }
  });
  it('moments', () => {
    for (const e of A.radial) {
      const m = K.radialMoments(e.n, e.l);
      expectGolden([m.r, m.r2, m.inverseR], [Number(e.moments.r_over_a_mu), Number(e.moments.r_squared_over_a_mu_squared), Number(e.moments.inverse_r_times_a_mu)], tol, `moments(${e.n},${e.l})`);
    }
  });
  it('constants with their mass convention', () => {
    const c = (k: string) => Number(A.constants[k].value);
    expectGolden(K.M_E_OVER_M_P, c('m_e_over_m_p'), tol, 'm_e/m_p');
    expectGolden(K.massFractions().muOverMe, c('mu_over_m_e'), tol, 'mu/m_e');
    expectGolden(K.A_0_M, c('a_0'), tol, 'a_0');
    expectGolden(K.aMuMetres(), c('a_mu'), tol, 'a_mu');
    expectGolden(K.energyLevel(1, 'reduced').eV, c('E_1_mu_eV'), tol, 'E_1(mu) in eV');
    expectGolden(K.energyLevel(1, 'electron').eV, c('E_1_m_e_eV'), tol, 'E_1(m_e) in eV');
    expectGolden(K.energyLevel(1, 'reduced').J, c('E_1_mu_J'), tol, 'E_1(mu) in J');
    expectGolden(K.energyLevel(2, 'reduced').eV, c('E_1_mu_eV') / 4, tol, 'E_2 = E_1 / 4');
  });
});

describe('laboratory density (DERIVATION.md Result 1b.1)', () => {
  it('reproduces the value of the derivation: 1s, sigma = 0.7 a_mu, |x| = a_mu, CODATA mass ratio', () => {
    // DERIVATION.md Result 1b.1: rho_e = 0.037922550162930973 / a_mu^3 (REVIEW.md B2 confirms it to 28 digits)
    const got = K.labElectronDensity('1s', 0.7, K.M_E_OVER_M_P, 1, 0, 0);
    console.log(`hydrogen: rho_e(1s, sigma 0.7, |x| = 1) = ${got} (derivation 0.037922550162930973), relative deviation ${Math.abs(got / 0.037922550162930973 - 1).toExponential(2)}`);
    expectGolden(got, 0.037922550162930973, golden.tolerances.lab, 'rho_e of the derivation');
    expect(K.labElectronDensity('1s', 0.7, K.M_E_OVER_M_P, 0, 0.6, -0.8)).toBeCloseTo(got, 14);   // spherical
  });
  it('is A_0 + c2 A_2 P_2: along and across the axis of each state, and the line profiles agree with psi', () => {
    const sigma = 0.7, q = 0.25, b = K.massFractions(q).b, x = 3;
    const [a0, a2] = K.labHarmonics(2, 1, sigma, b, x);
    expect(K.labElectronDensity('2p0', sigma, q, 0, 0, x)).toBeCloseTo(a0 + 2 * a2, 15);
    expect(K.labElectronDensity('2p0', sigma, q, x, 0, 0)).toBeCloseTo(a0 - a2, 15);
    expect(K.labElectronDensity('2px', sigma, q, x, 0, 0)).toBeCloseTo(a0 + 2 * a2, 15);
    expect(K.labElectronDensity('2py', sigma, q, 0, -x, 0)).toBeCloseTo(a0 + 2 * a2, 15);
    expect(K.labElectronDensity('2p+1', sigma, q, 0, 0, x)).toBeCloseTo(a0 - a2, 15);
    expect(K.labElectronDensity('2p-1', sigma, q, 0, x, 0)).toBeCloseTo(a0 + a2 / 2, 15);
    const xs = [-4, -1.5, 0, 0.5, 2, 6];
    for (const key of K.STATE_KEYS) {
      const s = K.STATES[key];
      const prof = K.lineProfiles(key, sigma, q, 1, xs);
      xs.forEach((v, i) => {
        expect(prof.relative[i]).toBeCloseTo(K.densityState(key, v * s.axis[0], v * s.axis[1], v * s.axis[2]), 15);
        expect(prof.laboratory[i]).toBeCloseTo(K.labElectronDensity(key, sigma, q, v * s.axis[0], v * s.axis[1], v * s.axis[2]), 15);
      });
    }
    // a node of the relative density is filled in the laboratory density
    expect(K.densityState('2p0', 0, 0, 0)).toBe(0);
    expect(K.labElectronDensity('2p0', sigma, q, 0, 0, 0)).toBeGreaterThan(1e-4);
  });
  it('batch positions agree with the single-sample map r_e = R + b r, r_p = R - a r', () => {
    const rand = K.makeRng(3), q = 0.25, sigma = 1.7;
    const { a, b } = K.massFractions(q);
    const centre = new Float64Array(30), relative = new Float64Array(30), e = new Float64Array(30), p = new Float64Array(12);
    for (let i = 0; i < 10; i++) { centre.set(K.sampleCentreOfMass(1, rand), 3 * i); relative.set(K.sampleRelative('2s', rand), 3 * i); }
    K.laboratoryPositions(centre, relative, sigma, q, e, p, 10);
    for (let i = 0; i < 30; i++) expect(e[i]).toBeCloseTo(sigma * centre[i] + b * relative[i], 14);
    for (let i = 0; i < 12; i++) expect(p[i]).toBeCloseTo(sigma * centre[i] - a * relative[i], 14);
  });
});

describe('conventions', () => {
  it('Condon-Shortley: Y_l^{-m} = (-1)^m conj(Y_l^m), and Y_1^{+1} is negative on the positive x axis', () => {
    const y11 = K.ylm(1, 1, Math.PI / 2, 0);
    if (!(y11[0] < 0)) throw new Error(`Condon-Shortley sign missing: Y_1^1(pi/2, 0) = ${y11[0]} must be negative (Result 4.1)`);
    for (const l of [1, 2]) for (let m = 1; m <= l; m++) for (const [t, p] of [[0.4, 0.3], [1.3, 2.2], [2.5, 5.1]]) {
      const a = K.ylm(l, m, t, p), b = K.ylm(l, -m, t, p);
      const s = m % 2 === 0 ? 1 : -1;
      expect(Math.abs(b[0] - s * a[0]) + Math.abs(b[1] + s * a[1]), `Condon-Shortley sign, l=${l}, m=${m}`).toBeLessThan(1e-15);
    }
    expect(K.psi(2, 1, 1, 1, 0, 0)[0]).toBeLessThan(0);
    expect(K.psi(2, 1, -1, 1, 0, 0)[0]).toBeGreaterThan(0);
  });
  it('the real combinations are real and are not m-eigenstates', () => {
    for (const [x, y, z] of [[0.3, -0.4, 0.5], [1, 2, -2], [-3, 0.5, 4]]) {
      expect(Math.abs(K.psiState('2px', x, y, z)[1])).toBeLessThan(1e-16);
      expect(Math.abs(K.psiState('2py', x, y, z)[1])).toBeLessThan(1e-16);
      // 2p_x(x, y, z) = 2p_0 with the axes relabelled (x, y, z) -> (y, z, x)
      expect(Math.abs(K.psiState('2px', x, y, z)[0] - K.psiState('2p0', y, z, x)[0])).toBeLessThan(1e-15);
      expect(Math.abs(K.psiState('2py', x, y, z)[0] - K.psiState('2p0', z, x, y)[0])).toBeLessThan(1e-15);
    }
    expect(K.STATES['2px'].m).toBeNull();
    expect(K.STATES['2px'].terms.length).toBe(2);
  });
  it('the phase winds once about the z axis for 2p_{+1} and backwards for 2p_{-1}', () => {
    const at = (key: '2p+1' | '2p-1', phi: number) => K.phase(K.psiState(key, 2 * Math.cos(phi), 2 * Math.sin(phi), 0.3));
    const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
    for (const phi of [0.2, 1.4, 3.0, 4.4]) {
      expect(Math.abs(wrap(at('2p+1', phi + 0.5) - at('2p+1', phi) - 0.5))).toBeLessThan(1e-12);
      expect(Math.abs(wrap(at('2p-1', phi + 0.5) - at('2p-1', phi) + 0.5))).toBeLessThan(1e-12);
    }
    expect(K.stationaryPhase(2, 8 * Math.PI)).toBeCloseTo(2 * Math.PI, 14);
  });
  it('nodal sets: psi vanishes on them and not beside them', () => {
    for (const key of K.STATE_KEYS) {
      const s = K.STATES[key];
      const { planes, lines } = K.angularNodes(key);
      for (const nrm of planes) {
        // two vectors spanning the plane
        const u = [nrm[1], nrm[2], nrm[0]], v = [nrm[2], nrm[0], nrm[1]];
        for (const [a, b] of [[1.3, -0.7], [-2.2, 3.1], [0.4, 5]]) {
          const p = [a * u[0] + b * v[0], a * u[1] + b * v[1], a * u[2] + b * v[2]];
          expect(K.modulus(K.psiState(key, p[0], p[1], p[2])), `${key} on its nodal plane`).toBeLessThan(1e-17);
          expect(K.modulus(K.psiState(key, p[0] + 0.5 * nrm[0], p[1] + 0.5 * nrm[1], p[2] + 0.5 * nrm[2]))).toBeGreaterThan(1e-6);
        }
      }
      for (const d of lines) for (const t of [-3, 0.5, 4]) {
        expect(K.modulus(K.psiState(key, t * d[0], t * d[1], t * d[2])), `${key} on its nodal line`).toBeLessThan(1e-17);
        expect(K.modulus(K.psiState(key, t * d[0] + 0.5 * d[2], t * d[1] + 0.3 * d[2], t * d[2] + 0.5 * d[0]))).toBeGreaterThan(1e-6);
      }
      for (const r of K.radialNodes(s.n, s.l)) expect(Math.abs(K.radialR(s.n, s.l, r))).toBeLessThan(1e-16);
    }
  });
  it('quantile residual bound', () => {
    let worst = 0;
    const rand = K.makeRng(7);
    for (const [n, l] of [[1, 0], [2, 0], [2, 1], [3, 0], [3, 1], [3, 2]]) for (let i = 0; i < 2000; i++) {
      const u = K.uniform53(rand);
      worst = Math.max(worst, Math.abs(K.radialCdf(n, l, K.radialQuantile(n, l, u)) - u));
    }
    console.log(`hydrogen: largest |F(quantile(u)) - u| over 12000 uniform u: ${worst.toExponential(2)} (bound ${K.QUANTILE_RESIDUAL})`);
    expect(worst).toBeLessThanOrEqual(K.QUANTILE_RESIDUAL);
  });
});

// ── statistical tests of the samplers, fixed seeds ─────────────────────────────────────
//
// N samples, drawn with the kernel's seeded generator (mulberry32, 53-bit uniforms).
//
// (1) Kolmogorov-Smirnov statistic D_N = sup |F_N - F| against the closed-form CDF.
//   DERIVED acceptance bound. Take K points x_1 < ... < x_{K-1} with F(x_j) = j/K. N F_N(x_j) is
//   binomial with mean N F(x_j) and variance N F (1 - F) <= N/4, so by Chebyshev's inequality
//   P(|F_N(x_j) - F(x_j)| >= eps) <= 1/(4 N eps^2), and by the union bound the largest of the
//   K - 1 deviations is below eps except with probability (K-1)/(4 N eps^2). Between two grid
//   points F_N and F are both non-decreasing and F rises by 1/K, hence
//   D_N <= max_j |F_N(x_j) - F(x_j)| + 1/K. So  P(D_N >= eps + 1/K) <= (K-1)/(4 N eps^2).
//   With the false-alarm level ALPHA (an explicit choice): eps = sqrt((K-1)/(4 N ALPHA)).
//   K is chosen to make the bound small (a choice; any K gives a valid bound).
//   This bound is loose. A second, sharper threshold D_N <= KS_SHARP / sqrt(N) is applied as
//   well; KS_SHARP = 2 is an UNVALIDATED CHOICE (its false-alarm probability is not derived here).
//
// (2) Moments. For N independent samples of a quantity with mean mu and variance v, the sample
//   mean has variance v/N, so by Chebyshev P(|mean - mu| >= k sqrt(v/N)) <= 1/k^2. With
//   k = 1/sqrt(ALPHA) the false-alarm probability is at most ALPHA. mu and v are exact
//   (Result 7.1; the variances <r^2> - <r>^2, <r^4> - <r^2>^2, <r^-2> - <1/r>^2 are computed in
//   exact rational arithmetic by the reference and stored in the golden file).
//
// (3) Chi-square of the angular histogram with B bins of probabilities p_i (from the closed-form
//   CDFs): X^2 = sum (O_i - N p_i)^2 / (N p_i). E[(O_i - N p_i)^2] = N p_i (1 - p_i), hence
//   E[X^2] = sum (1 - p_i) = B - 1, and since X^2 >= 0 Markov's inequality gives
//   P(X^2 >= (B-1)/ALPHA) <= ALPHA: the DERIVED bound. Sharper UNVALIDATED CHOICE applied as
//   well: X^2 <= (B-1) + CHI_SHARP sqrt(2 (B-1)), CHI_SHARP = 4.
const ALPHA = 0.01;        // false-alarm level of the derived bounds: an explicit choice
const KS_SHARP = 2;        // unvalidated choice
const CHI_SHARP = 4;       // unvalidated choice
const N = 200000;          // sample size: a choice
const KS_GRID = 32;        // K of the derived KS bound: a choice
const ksDerived = (n: number) => Math.sqrt((KS_GRID - 1) / (4 * n * ALPHA)) + 1 / KS_GRID;

const momentCases = golden.cases.filter((c) => c.fn === 'moments');
const exactMoments = (n: number, l: number) => {
  const c = momentCases.find((k) => k.n === n && k.l === l)!;
  return { mean: c.expected as number[], variance: c.variance! };
};

describe('samplers (fixed seeds)', () => {
  const SEEDS: Record<string, number> = { '1,0': 11, '2,0': 12, '2,1': 13, '3,0': 14, '3,1': 15, '3,2': 16 };
  for (const [n, l] of [[1, 0], [2, 0], [2, 1], [3, 0], [3, 1], [3, 2]]) {
    it(`radius (n, l) = (${n}, ${l}): Kolmogorov-Smirnov and moments, N = ${N}, seed ${SEEDS[`${n},${l}`]}`, () => {
      const rand = K.makeRng(SEEDS[`${n},${l}`]);
      const xs = new Array<number>(N);
      for (let i = 0; i < N; i++) xs[i] = K.sampleRadius(n, l, K.uniform53(rand));
      const D = K.ksStatistic(xs, (x) => K.radialCdf(n, l, x));
      const { mean, variance } = exactMoments(n, l);
      const got = [0, 0, 0];
      for (const x of xs) { got[0] += x; got[1] += x * x; got[2] += 1 / x; }
      const k = 1 / Math.sqrt(ALPHA);
      const z = got.map((s, i) => (s / N - mean[i]) / Math.sqrt(variance[i] / N));
      console.log(`hydrogen sampler: (n,l)=(${n},${l}) seed ${SEEDS[`${n},${l}`]} N=${N}: KS D=${D.toExponential(4)} (D sqrt(N)=${(D * Math.sqrt(N)).toFixed(3)}; derived bound ${ksDerived(N).toFixed(4)}, sharp ${(KS_SHARP / Math.sqrt(N)).toExponential(3)}); `
        + `moment deviations in standard errors: <r> ${z[0].toFixed(2)}, <r^2> ${z[1].toFixed(2)}, <1/r> ${z[2].toFixed(2)} (bound ${k})`);
      if (!(D < ksDerived(N))) throw new Error(`KS test failed: D = ${D} exceeds the derived bound ${ksDerived(N)} for sampled radii (n, l) = (${n}, ${l})`);
      if (!(D < KS_SHARP / Math.sqrt(N))) throw new Error(`KS test failed: D = ${D} exceeds ${KS_SHARP}/sqrt(N) for sampled radii (n, l) = (${n}, ${l})`);
      z.forEach((v, i) => { if (!(Math.abs(v) < k)) throw new Error(`moment test failed: ${['<r>', '<r^2>', '<1/r>'][i]} of (n, l) = (${n}, ${l}) deviates by ${v} standard errors`); });
    });
  }

  const BT = 8, BP = 8;
  const ANG_SEEDS: Record<string, number> = { '1s': 21, '2s': 22, '2p0': 23, '2p+1': 24, '2p-1': 25, '2px': 26, '2py': 27 };
  for (const key of K.STATE_KEYS) {
    it(`relative position, state ${key}: chi-square of the angular histogram and KS of |r|, N = ${N}, seed ${ANG_SEEDS[key]}`, () => {
      const s = K.STATES[key];
      const rand = K.makeRng(ANG_SEEDS[key]);
      const counts = new Float64Array(BT * BP);
      const radii = new Array<number>(N);
      for (let i = 0; i < N; i++) {
        const [x, y, z] = K.sampleRelative(key, rand);
        const r = Math.hypot(x, y, z);
        radii[i] = r;
        const t = z / r;
        let phi = Math.atan2(y, x); if (phi < 0) phi += 2 * Math.PI;
        const it_ = Math.min(BT - 1, Math.floor(((t + 1) / 2) * BT)), ip = Math.min(BP - 1, Math.floor((phi / (2 * Math.PI)) * BP));
        counts[it_ * BP + ip]++;
      }
      const mEff = s.m === null ? 1 : s.m;
      let chi = 0;
      for (let a = 0; a < BT; a++) for (let b = 0; b < BP; b++) {
        const pt = K.thetaCdf(s.l, mEff, -1 + (2 * (a + 1)) / BT) - K.thetaCdf(s.l, mEff, -1 + (2 * a) / BT);
        const pp = K.azimuthCdf(s.azimuth, (2 * Math.PI * (b + 1)) / BP) - K.azimuthCdf(s.azimuth, (2 * Math.PI * b) / BP);
        const e = N * pt * pp;
        chi += (counts[a * BP + b] - e) ** 2 / e;
      }
      const dof = BT * BP - 1;
      const D = K.ksStatistic(radii, (x) => K.radialCdf(s.n, s.l, x));
      console.log(`hydrogen sampler: state ${key} seed ${ANG_SEEDS[key]} N=${N}: chi-square ${chi.toFixed(2)} on ${BT}x${BP} bins (mean ${dof}; derived bound ${(dof / ALPHA).toFixed(0)}, sharp ${(dof + CHI_SHARP * Math.sqrt(2 * dof)).toFixed(1)}); KS of |r| D=${D.toExponential(4)}`);
      if (!(chi < dof / ALPHA)) throw new Error(`chi-square test failed: ${chi} exceeds the derived bound ${dof / ALPHA} for the angles of ${key}`);
      if (!(chi < dof + CHI_SHARP * Math.sqrt(2 * dof))) throw new Error(`chi-square test failed: ${chi} exceeds ${dof} + ${CHI_SHARP} sqrt(2 ${dof}) for the angles of ${key}`);
      if (!(D < KS_SHARP / Math.sqrt(N))) throw new Error(`KS test failed: D = ${D} for |r| of the sampled positions of ${key}`);
    });
  }

  it(`centre-of-mass packet and laboratory positions, N = ${N}, seed 31`, () => {
    const rand = K.makeRng(31);
    const sigma = 0.7, q = 0.25;
    const { a, b } = K.massFractions(q);
    const rho2 = new Array<number>(N), rho2b = new Array<number>(N);
    let e2 = 0, p2 = 0, rel = 0;
    for (let i = 0; i < N; i++) {
      const s = K.sampleLaboratory('2p0', sigma, q, rand);
      rho2[i] = s.centre[0] ** 2 + s.centre[1] ** 2;
      rho2b[i] = s.centre[0] ** 2 + s.centre[2] ** 2;
      e2 += s.electron[0] ** 2 + s.electron[1] ** 2 + s.electron[2] ** 2;
      p2 += s.proton[0] ** 2 + s.proton[1] ** 2 + s.proton[2] ** 2;
      // the relative coordinate is recovered exactly: r = r_e - r_p (Result 1.1)
      rel = Math.max(rel, Math.abs(s.electron[2] - s.proton[2] - s.relative[2]), Math.abs(s.electron[0] - s.proton[0] - s.relative[0]));
    }
    expect(rel).toBeLessThan(1e-12);
    // two components of R: R_x^2 + R_y^2 has CDF 1 - exp(-rho^2 / sigma^2) for f = (pi sigma^2)^(-3/2) exp(-R^2/sigma^2)
    const cdf = (v: number) => 1 - Math.exp(-v / (sigma * sigma));
    const D1 = K.ksStatistic(rho2, cdf), D2 = K.ksStatistic(rho2b, cdf);
    // E|r_e|^2 = E|R|^2 + b^2 E r^2 = 3 sigma^2/2 + b^2 <r^2> (R and r independent, E R = 0); likewise the proton with a.
    // Var(|R + b r|^2) <= E|R + b r|^4 <= 8 (E|R|^4 + b^4 E r^4); E|R|^4 = 15 (sigma^2/2)^2 for three
    // independent normal components of variance sigma^2/2 (E R_i^4 = 3 s^4, E R_i^2 R_j^2 = s^4).
    const { mean, variance } = exactMoments(2, 1);
    const r2 = mean[1], r4 = variance[1] + mean[1] ** 2;
    const k = 1 / Math.sqrt(ALPHA);
    const bound = (w: number) => k * Math.sqrt((8 * (15 * (sigma * sigma / 2) ** 2 + w ** 4 * r4)) / N);
    const de = e2 / N - (1.5 * sigma * sigma + b * b * r2), dp = p2 / N - (1.5 * sigma * sigma + a * a * r2);
    console.log(`hydrogen sampler: laboratory, seed 31 N=${N}: KS of R_x^2+R_y^2 D=${D1.toExponential(4)}, of R_x^2+R_z^2 D=${D2.toExponential(4)}; `
      + `<|r_e|^2> deviates by ${de.toExponential(3)} (bound ${bound(b).toExponential(3)}), <|r_p|^2> by ${dp.toExponential(3)} (bound ${bound(a).toExponential(3)})`);
    expect(D1).toBeLessThan(KS_SHARP / Math.sqrt(N));
    expect(D2).toBeLessThan(KS_SHARP / Math.sqrt(N));
    expect(Math.abs(de)).toBeLessThan(bound(b));
    expect(Math.abs(dp)).toBeLessThan(bound(a));
  });

  it('the generator replays exactly for a seed', () => {
    const a = K.makeRng(5), b = K.makeRng(5), c = K.makeRng(6);
    const va = Array.from({ length: 5 }, () => K.sampleRelative('2p+1', a));
    const vb = Array.from({ length: 5 }, () => K.sampleRelative('2p+1', b));
    const vc = Array.from({ length: 5 }, () => K.sampleRelative('2p+1', c));
    expect(va).toEqual(vb);
    expect(va).not.toEqual(vc);
  });
});
