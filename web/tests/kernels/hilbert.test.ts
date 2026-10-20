// Golden test of web/src/kernels/hilbert.ts against numerics/generate/hilbert_golden.jl
// (web/tests/golden/hilbert.json), and agreement of the kernel with the data of the chapter's
// still figures (content/c03-hilbertraum/figures/*.tex), so that each demo at its default state
// shows the numbers its still shows.
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import {
  dagger, erf, phaseFactor, scaleVec, gaussCumulative, gaussLimit, gaussPartial, inner, innerTerms, partialSum, phased, phasedAbs2, plainTerms, powerAbs2, powerLimit, powerPartial,
  runningSums, sumLimit, sumLowerBound, sumUpperBound, sumUpperBoundLimit, type Complex, type Modulus,
} from '../../src/kernels/hilbert';
import { expectGolden, loadGolden } from '../golden';

type Num = number | 'Infinity';
interface Case {
  fn: string; tol: string; name?: string;
  v?: number[][]; w?: number[][]; s?: number; theta?: number; N?: number[]; X?: number[]; x?: number[]; k?: number; kind?: Modulus;
  expected: Num | Num[] | number[][];
}
interface G { tolerances: Record<string, { abs?: number; rel?: number }> }

const golden = loadGolden<Case>('hilbert');
const tolerances = (golden as unknown as G).tolerances;
const measured = new Map<string, { abs: number; rel: number }>();
const note = (cls: string, got: number, exp: number) => {
  const m = measured.get(cls) ?? { abs: 0, rel: 0 };
  const d = Math.abs(got - exp);
  m.abs = Math.max(m.abs, d);
  if (exp !== 0) m.rel = Math.max(m.rel, d / Math.abs(exp));
  measured.set(cls, m);
};
const flat = (x: unknown): number[] => (Array.isArray(x) ? x.flatMap(flat) : [x as number]);
const cx = (v: number[][]): Complex[] => v.map((p) => [p[0], p[1]] as Complex);

describe(`kernel hilbert against ${golden.reference.implementation}`, () => {
  it('states a tolerance for every class it uses', () => {
    for (const c of golden.cases) expect(tolerances[c.tol], c.tol).toBeDefined();
    expect(tolerances.exact.abs).toBe(0);
  });
  for (const c of golden.cases) {
    const what = `${c.fn}(${[c.name, c.kind, c.s !== undefined ? `s = ${c.s}` : '', c.k !== undefined ? `k = ${c.k}` : '', c.theta !== undefined ? `theta = ${c.theta}` : ''].filter(Boolean).join(', ')})`;
    it(what, () => {
      const tol = tolerances[c.tol];
      let got: unknown;
      switch (c.fn) {
        case 'dagger': got = dagger(cx(c.v!)); break;
        case 'phaseFactor': got = phaseFactor(c.theta!); break;
        case 'scaleVec': got = scaleVec(phaseFactor(c.theta!), cx(c.v!)); break;
        case 'innerScaledFirst': got = inner(scaleVec(phaseFactor(c.theta!), cx(c.v!)), cx(c.w!)); break;
        case 'innerTerms': got = innerTerms(cx(c.v!), cx(c.w!)); break;
        case 'runningSums': got = runningSums(innerTerms(cx(c.v!), cx(c.w!))); break;
        case 'inner': got = inner(cx(c.v!), cx(c.w!)); break;
        case 'plainTerms': got = plainTerms(cx(c.v!), cx(c.w!)); break;
        case 'partialSum': got = c.N!.map((n) => partialSum(c.s!, n)); break;
        case 'sumUpperBound': got = c.N!.map((n) => sumUpperBound(c.s!, n)); break;
        case 'sumLowerBound': got = c.N!.map((n) => sumLowerBound(c.s!, n)); break;
        case 'sumUpperBoundLimit': got = sumUpperBoundLimit(c.s!); break;
        case 'sumLimit': got = sumLimit(c.s!); break;
        case 'erf': got = c.x!.map(erf); break;
        case 'gaussPartial': got = c.X!.map(gaussPartial); break;
        case 'gaussCumulative': got = c.x!.map(gaussCumulative); break;
        case 'gaussLimit': got = gaussLimit(); break;
        case 'powerPartial': got = c.X!.map((X) => powerPartial(c.s!, X)); break;
        case 'powerLimit': got = powerLimit(c.s!); break;
        case 'powerAbs2': got = c.x!.map((x) => powerAbs2(c.s!, x)); break;
        case 'phased': got = c.x!.map((x) => phased(c.kind!, c.k!, x)); break;
        case 'phasedAbs2': got = c.x!.map((x) => phasedAbs2(c.kind!, x)); break;
        default: throw new Error(`unknown case ${c.fn}`);
      }
      if (c.expected === 'Infinity') { expect(got).toBe(Infinity); return; }
      expectGolden(got, c.expected as number | number[] | number[][], tol, what);
      const g = flat(got), e = flat(c.expected);
      g.forEach((v, i) => note(c.tol, v, e[i]));
    });
  }
  afterAll(() => {
    for (const [cls, m] of measured) console.log(`hilbert golden: class ${cls}: largest deviation abs ${m.abs.toExponential(2)}, rel ${m.rel.toExponential(2)}`);
  });
});

// ── the stills ─────────────────────────────────────────────────────────────────────────────
const FIG = path.join(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..', 'content', 'c03-hilbertraum', 'figures');
const coordinates = (tex: string, afterMarker: string): Array<[number, number]> => {
  const at = tex.indexOf(afterMarker);
  if (at < 0) throw new Error(`marker ${afterMarker} not found`);
  const block = tex.slice(at, tex.indexOf('};', at));
  return [...block.matchAll(/\(([-\d.]+),([-\d.]+)\)/g)].map((m) => [Number(m[1]), Number(m[2])]);
};

describe('kernel hilbert reproduces the data of the still figures', () => {
  it('c03.fig.partialsummen: S_N for v_j = 1/j, 1/sqrt(j), 1 to four places', () => {
    const tex = fs.readFileSync(path.join(FIG, 'partialsummen.tex'), 'utf8');
    const series: Array<[string, number]> = [['\\addplot[tpc q1', 1], ['\\addplot[tpc q3', 0.5], ['\\addplot[tpc q5', 0]];
    for (const [marker, s] of series) {
      const pts = coordinates(tex, marker);
      expect(pts.length).toBeGreaterThan(4);
      for (const [n, y] of pts) expect(Math.abs(partialSum(s, n) - y), `s = ${s}, N = ${n}`).toBeLessThanOrEqual(0.5e-4 + 1e-12);
    }
  });
  it('c03.fig.partialsummen: the bound 2 of c03.eq.rate is the kernel bound at s = 1', () => {
    expect(sumUpperBoundLimit(1)).toBe(2);
    for (let n = 2; n <= 25; n++) {
      expect(Math.abs(sumUpperBound(1, n) - (2 - 1 / n))).toBeLessThan(1e-15);
      expect(partialSum(1, n)).toBeLessThanOrEqual(sumUpperBound(1, n));
      expect(partialSum(0.5, n)).toBeGreaterThanOrEqual(sumLowerBound(0.5, n));
      expect(Math.abs(sumLowerBound(0.5, n) - Math.log(n + 1))).toBeLessThan(1e-15);
    }
  });
  it('c03.fig.partialintegrale: sqrt(pi) erf(X) at X = 0, 0.1, ..., 4.3 to four places, and the two closed forms', () => {
    const tex = fs.readFileSync(path.join(FIG, 'partialintegrale.tex'), 'utf8');
    const pts = coordinates(tex, '\\addplot[tpc q1');
    expect(pts.length).toBe(44);
    for (const [X, y] of pts) expect(Math.abs(gaussPartial(X) - y), `X = ${X}`).toBeLessThanOrEqual(0.5e-4 + 1e-12);
    expect(tex).toContain('{2*ln(1+x)}');
    expect(tex).toContain('{2*x}');
    for (const X of [0.3, 1, 2.6, 4.3]) {
      expect(Math.abs(powerPartial(0.5, X) - 2 * Math.log(1 + X))).toBeLessThan(1e-14);
      expect(Math.abs(powerPartial(0, X) - 2 * X)).toBeLessThan(1e-14);
    }
    expect(tex).toContain('1.7725');
    expect(Math.abs(gaussLimit() - 1.7725)).toBeLessThan(0.5e-4);
  });
  it('c03.fig.komplex: f = exp(-x^2/2) exp(2ix), |f| = exp(-x^2/2)', () => {
    const tex = fs.readFileSync(path.join(FIG, 'komplex.tex'), 'utf8');
    expect(tex).toContain('exp(-x^2/2) exp(2ix)');
    for (const x of [-3, -1, 0, 0.4, 1, 2.5]) {
      const f = phased('gauss', 2, x);
      expect(Math.abs(f[0] - Math.exp(-x * x / 2) * Math.cos(2 * x))).toBeLessThan(1e-15);
      expect(Math.abs(Math.hypot(f[0], f[1]) - Math.exp(-x * x / 2))).toBeLessThan(1e-15);
      expect(Math.abs(phasedAbs2('gauss', x) - Math.exp(-x * x))).toBeLessThan(1e-15);
    }
  });
  it('c03.fig.kreuz: v = (2+i, -1+2i) conjugates to (2-i, -1-2i); (b) v^dagger w = -2i', () => {
    expect(dagger([[2, 1], [-1, 2]])).toEqual([[2, -1], [-1, -2]]);
    expect(inner([[1, 1], [1, -1]], [[1, 0], [-1, 0]])).toEqual([0, -2]);
  });
  it('c03.fig.raeume: |(1 +- i)/2|^2 = 1/2; the bars 1/j^2; the area sqrt(pi)', () => {
    const v: Complex[] = [[0.5, 0.5], [0.5, -0.5]];
    expect(inner(v, v)).toEqual([1, 0]);
    expect(innerTerms(v, v)).toEqual([[0.5, 0], [0.5, 0]]);
    expect(Math.abs(gaussCumulative(2.6) - gaussCumulative(-2.6) - gaussPartial(2.6))).toBeLessThan(1e-15);
  });
});

describe('kernel hilbert: rules of c03.prop.skalarprodukt on samples', () => {
  const pts: Complex[][] = [[[1, 2], [-0.5, 1.5]], [[3, -1], [0, 2]], [[-2.5, 0.5], [1, 1]]];
  it('w^dagger v = (v^dagger w)^*, v^dagger v >= 0 and real', () => {
    for (const v of pts) for (const w of pts) {
      const a = inner(v, w), b = inner(w, v);
      expect(b[0]).toBe(a[0]); expect(b[1] + a[1]).toBe(0);
      const vv = inner(v, v);
      expect(vv[1]).toBe(0); expect(vv[0]).toBeGreaterThan(0);
      for (const t of innerTerms(v, v)) { expect(t[1]).toBe(0); expect(t[0]).toBeGreaterThanOrEqual(0); }
    }
  });
  it('without conjugation v = (1, i) has "length" 0 (c03.ex.ohne-stern)', () => {
    const t = plainTerms([[1, 0], [0, 1]], [[1, 0], [0, 1]]);
    expect(runningSums(t)[1]).toEqual([0, 0]);
  });
  it('partial sums are increasing and continuous across the Euler-Maclaurin seam', () => {
    for (const s of [0, 0.3, 0.5, 0.8, 1, 1.4]) {
      let prev = 0;
      for (let n = 1; n <= 200; n++) { const S = partialSum(s, n); expect(S).toBeGreaterThan(prev); prev = S; }
      expect(Math.abs(partialSum(s, 65) - partialSum(s, 64) - Math.pow(65, -2 * s))).toBeLessThan(1e-13);
    }
  });
});
