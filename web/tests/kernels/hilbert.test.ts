// Golden test of web/src/kernels/hilbert.ts against numerics/generate/hilbert_golden.jl
// (web/tests/golden/hilbert.json), and agreement of the kernel with the data of the chapter's
// still figures (content/c03-hilbertraum/figures/*.tex), so that each demo at its default state
// shows the numbers its still shows.
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import {
  components, dagger, erf, expansion, reassemble, rotatedBasis, totalWeight, unitVector, weights, phaseFactor, scaleVec, gaussCumulative, gaussLimit, gaussPartial, inner, innerTerms, partialSum, phased, phasedAbs2, plainTerms, powerAbs2, powerLimit, powerPartial,
  runningSums, sumLimit, sumLowerBound, sumUpperBound, sumUpperBoundLimit, type Complex, type Modulus,
  CLASS_KEYS, SPEKTREN, SPEKTREN_STEPS, classReport, distinct, eigenvalues, eigenvector, expectation, hermitianExtremes, matVec, onLocus, spektrenOperator, spektrenParam,
  type ClassKey, type Mat, type SpektrenKey,
} from '../../src/kernels/hilbert';
import { expectGolden, loadGolden } from '../golden';

type Num = number | 'Infinity';
interface Case {
  fn: string; tol: string; name?: string;
  op?: SpektrenKey; p?: number; m?: number[][][];
  v?: number[][]; w?: number[][]; alpha?: number; basis?: number[][][]; psi?: number[][]; s?: number; theta?: number; N?: number[]; X?: number[]; x?: number[]; k?: number; kind?: Modulus;
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
    const what = `${c.fn}(${[c.name, c.kind, c.op, c.p !== undefined ? `p = ${c.p}` : '', c.s !== undefined ? `s = ${c.s}` : '', c.k !== undefined ? `k = ${c.k}` : '', c.theta !== undefined ? `theta = ${c.theta}` : ''].filter(Boolean).join(', ')})`;
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
        case 'expansion': got = expansion(rotatedBasis(c.theta!), unitVector(c.alpha!)); break;
        case 'weights': got = weights(expansion(rotatedBasis(c.theta!), unitVector(c.alpha!))); break;
        case 'components': got = components(rotatedBasis(c.theta!), expansion(rotatedBasis(c.theta!), unitVector(c.alpha!))); break;
        case 'reassemble': got = reassemble(rotatedBasis(c.theta!), expansion(rotatedBasis(c.theta!), unitVector(c.alpha!))); break;
        case 'totalWeight': got = totalWeight(weights(expansion(rotatedBasis(c.theta!), unitVector(c.alpha!)))); break;
        case 'expansionExplicit': got = expansion(c.basis!.map(cx), cx(c.psi!)); break;
        case 'weightsExplicit': got = weights(expansion(c.basis!.map(cx), cx(c.psi!))); break;
        case 'spektrenOperator': got = spektrenOperator(c.op!, c.p!); break;
        case 'spektrenEigenvalues': got = eigenvalues(spektrenOperator(c.op!, c.p!)); break;
        case 'spektrenResiduals': { const r = classReport(spektrenOperator(c.op!, c.p!)).residual; got = [r.herm, r.square, r.unitL, r.unitR, r.normal]; break; }
        case 'spektrenClasses': { const r = classReport(spektrenOperator(c.op!, c.p!)); got = CLASS_KEYS.map((k) => (r.member[k] ? 1 : 0)); break; }
        case 'spektrenLoci': { const ev = eigenvalues(spektrenOperator(c.op!, c.p!)); got = CLASS_KEYS.map((k) => (ev.every((z) => onLocus(k, z)) ? 1 : 0)); break; }
        case 'spektrenMinRe': got = classReport(spektrenOperator(c.op!, c.p!)).minRe.value; break;
        case 'spektrenMaxIm': got = classReport(spektrenOperator(c.op!, c.p!)).maxIm.value; break;
        case 'eigenvaluesExplicit': got = eigenvalues(c.m!.map(cx)); break;
        case 'hermitianExtremes': { const h = hermitianExtremes(c.m!.map(cx)); got = [h.min, h.max]; break; }
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

describe('kernel hilbert: c03.fig.vollst', () => {
  const alpha = Math.atan2(1, 2), theta = Math.PI / 4;
  const psi = unitVector(alpha);
  it('the default state of the demo is the figure: weights 4/5, 1/5 and 9/10, 1/10, sums 1', () => {
    const tex = fs.readFileSync(path.join(FIG, 'vollst.tex'), 'utf8');
    const w0 = weights(expansion(rotatedBasis(0), psi)), w1 = weights(expansion(rotatedBasis(theta), psi));
    expect(Math.abs(w0[0] - 4 / 5)).toBeLessThan(1e-15); expect(Math.abs(w0[1] - 1 / 5)).toBeLessThan(1e-15);
    expect(Math.abs(w1[0] - 9 / 10)).toBeLessThan(1e-15); expect(Math.abs(w1[1] - 1 / 10)).toBeLessThan(1e-15);
    for (const s of ['\\tfrac45', '\\tfrac15', '\\tfrac{9}{10}', '\\tfrac{1}{10}', '(0,1.85) rectangle (0.8,2.4)', '(0,0.45) rectangle (0.9,1.0)']) expect(tex, s).toContain(s);
    expect(Math.abs(totalWeight(w0) - 1)).toBeLessThan(1e-15); expect(Math.abs(totalWeight(w1) - 1)).toBeLessThan(1e-15);
  });
  it('the component vectors of the figure: (0.894427, 0), (0, 0.447214), (0.670820, 0.670820), (0.223607, -0.223607), diagonal (0.894427, 0.447214)', () => {
    const tex = fs.readFileSync(path.join(FIG, 'vollst.tex'), 'utf8');
    const close = (a: readonly Complex[], b: number[]) => a.forEach((z, k) => expect(Math.abs(z[0] - b[k]), String(b)).toBeLessThan(0.5e-6));
    const p0 = components(rotatedBasis(0), expansion(rotatedBasis(0), psi)), p1 = components(rotatedBasis(theta), expansion(rotatedBasis(theta), psi));
    close(p0[0], [0.894427, 0]); close(p0[1], [0, 0.447214]);
    close(p1[0], [0.670820, 0.670820]); close(p1[1], [0.223607, -0.223607]);
    close(psi, [0.894427, 0.447214]);
    for (const s of ['0.894427,0', '0,0.447214', '0.670820,0.670820', '0.223607,-0.223607', '0.894427,0.447214']) expect(tex, s).toContain(s);
    for (const th of [0, theta, 1.234]) { const b = rotatedBasis(th); const r = reassemble(b, expansion(b, psi)); expect(Math.abs(r[0][0] - psi[0][0]) + Math.abs(r[1][0] - psi[1][0])).toBeLessThan(1e-15); }
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

describe('kernel hilbert: c03.fig.spektren', () => {
  const tex = fs.readFileSync(path.join(FIG, 'spektren.tex'), 'utf8');
  const r2 = Math.SQRT2;
  const near = (a: Complex, b: Complex, tol = 1e-12) => Math.hypot(a[0] - b[0], a[1] - b[1]) < tol;
  const residualOf = (a: Mat, lam: Complex, v: Complex[]) => Math.max(...matVec(a, v).map((x, i) => Math.hypot(x[0] - (lam[0] * v[i][0] - lam[1] * v[i][1]), x[1] - (lam[0] * v[i][1] + lam[1] * v[i][0]))));
  it('the defaults of the demo are A, B, C of the still: 0, +-sqrt 2; 0, 1; three points at -30, 90, 210 degrees', () => {
    for (const s of ['({-sqrt(2)},0)', '({sqrt(2)},0)', '(0,0) circle (4.4pt)', '(1,0) circle (4.4pt)', '\\foreach \\a in {-30,90,210}']) expect(tex, s).toContain(s);
    const at = (k: SpektrenKey) => spektrenOperator(k, SPEKTREN[k].chapter!);
    const a = distinct(eigenvalues(at('A'))), b = distinct(eigenvalues(at('B'))), c = distinct(eigenvalues(at('C')));
    expect(a.length).toBe(3); expect(near(a[0], [-r2, 0])).toBe(true); expect(near(a[1], [0, 0])).toBe(true); expect(near(a[2], [r2, 0])).toBe(true);
    expect(b.length).toBe(2); expect(near(b[0], [0, 0])).toBe(true); expect(near(b[1], [1, 0])).toBe(true);
    const deg = c.map((z) => Math.round((Math.atan2(z[1], z[0]) * 180) / Math.PI)).sort((x, y) => x - y);
    expect(deg).toEqual([-150, -30, 90]);                     // 210 degrees = -150 degrees
    for (const z of c) expect(Math.abs(Math.hypot(z[0], z[1]) - 1)).toBeLessThan(1e-14);
  });
  it('the matrices are those of c03.eq.abc', () => {
    expect(spektrenOperator('A', 0)).toEqual([[[0, 0], [1, 0], [0, 0]], [[1, 0], [0, 0], [1, 0]], [[0, 0], [1, 0], [0, 0]]]);
    expect(spektrenOperator('B', 1).flat().every((z) => z[0] === 1 / 3 && z[1] === 0)).toBe(true);
    expect(spektrenOperator('C', 1)).toEqual([[[0, 0], [1, 0], [0, 0]], [[0, 0], [0, 0], [0, 1]], [[-1, 0], [0, 0], [0, 0]]]);
  });
  it('c03.eq.nicht-positiv: the smallest <psi|A psi> is -sqrt 2, at psi = (1/2, -1/sqrt 2, 1/2)', () => {
    const a = spektrenOperator('A', 0), r = classReport(a);
    expect(Math.abs(r.minRe.value + r2)).toBeLessThan(1e-14);
    ([[0.5, 0], [-1 / r2, 0], [0.5, 0]] as Complex[]).forEach((z, i) => expect(near(r.minRe.psi[i], z, 1e-14)).toBe(true));
    const e = expectation(a, [[0.5, 0], [-1 / r2, 0], [0.5, 0]]);
    expect(Math.abs(e[0] + r2)).toBeLessThan(1e-15); expect(e[1]).toBe(0);
  });
  it('the eigenvectors named in c03.s12 are eigenvectors, and the kernel finds them for the simple eigenvalues', () => {
    const A = spektrenOperator('A', 0), B = spektrenOperator('B', 1), C = spektrenOperator('C', 1);
    const cases: Array<[Mat, Complex, Complex[], boolean]> = [
      [A, [r2, 0], [[1, 0], [r2, 0], [1, 0]], true], [A, [0, 0], [[1, 0], [0, 0], [-1, 0]], true], [A, [-r2, 0], [[1, 0], [-r2, 0], [1, 0]], true],
      [B, [1, 0], [[1, 0], [1, 0], [1, 0]], true], [B, [0, 0], [[1, 0], [-1, 0], [0, 0]], false],
    ];
    for (const lam of distinct(eigenvalues(C))) {
      const l2: Complex = [lam[0] * lam[0] - lam[1] * lam[1], 2 * lam[0] * lam[1]];
      cases.push([C, lam, [[1, 0], lam, [l2[1], -l2[0]]], true]);   // (1, lambda, -i lambda^2)
    }
    for (const [m, lam, v, simple] of cases) {
      expect(residualOf(m, lam, v)).toBeLessThan(1e-14);
      if (!simple) continue;
      const k = eigenvector(m, lam);
      const nv = Math.sqrt(v.reduce((s, z) => s + z[0] * z[0] + z[1] * z[1], 0));
      const ov = inner(k, v);
      expect(Math.abs(Math.hypot(ov[0], ov[1]) - nv)).toBeLessThan(1e-13);      // parallel: |<k|v>| = ||v||
    }
  });
  it('over the whole range of every family: in the class => eigenvalues on its locus (c03.eq.orte); the classes are the ones derived by hand', () => {
    const expected: Record<SpektrenKey, (p: number) => Record<ClassKey, boolean>> = {
      A: (s) => ({ herm: true, pos: s >= 1.42, proj: false, unit: false, normal: true }),
      B: (s) => ({ herm: true, pos: s >= 0, proj: s === 0 || s === 1, unit: false, normal: true }),
      C: (r) => ({ herm: r === 0, pos: r === 0, proj: r === 0, unit: r === 1, normal: true }),
      M: (t) => ({ herm: t === 1, pos: false, proj: false, unit: Math.abs(t) === 1, normal: Math.abs(t) === 1 }),
      Q: (t) => ({ herm: t === 0, pos: t === 0, proj: t === 0, unit: false, normal: t === 0 }),
    };
    let points = 0, offLocusInClass = 0, onLocusNotInClass = 0;
    for (const key of Object.keys(SPEKTREN) as SpektrenKey[]) for (let k = 0; k <= SPEKTREN_STEPS; k++) {
      const p = spektrenParam(key, k), a = spektrenOperator(key, p);
      const ev = eigenvalues(a), r = classReport(a);
      expect(r.member, `${key}(${p})`).toEqual(expected[key](p));
      for (const c of CLASS_KEYS) {
        const on = ev.every((z) => onLocus(c, z));
        if (r.member[c] && !on) offLocusInClass++;
        if (!r.member[c] && on) onLocusNotInClass++;
      }
      for (const lam of distinct(ev)) expect(residualOf(a, lam, eigenvector(a, lam)), `${key}(${p}) ${lam}`).toBeLessThan(1e-10);
      // the witnesses: <psi|A psi> at the returned vectors has the reported real and imaginary parts
      const e1 = expectation(a, r.minRe.psi), e2 = expectation(a, r.maxIm.psi);
      expect(Math.abs(e1[0] - r.minRe.value)).toBeLessThan(1e-13);
      expect(Math.abs(Math.abs(e2[1]) - r.maxIm.value)).toBeLessThan(1e-13);
      expect(r.maxIm.value > 1e-12).toBe(!r.member.herm);
      points++;
    }
    expect(points).toBe(5 * (SPEKTREN_STEPS + 1));
    expect(offLocusInClass).toBe(0);
    expect(onLocusNotInClass).toBeGreaterThan(0);     // the loci are necessary, not sufficient
  });
  it('close eigenvalues stay apart, repeated ones come out repeated', () => {
    const d = (...x: number[]): Mat => x.map((v, i) => x.map((_, j) => (i === j ? [v, 0] : [0, 0]) as Complex));
    expect(distinct(eigenvalues(d(0, 1e-6, 1))).length).toBe(3);
    expect(distinct(eigenvalues(d(0, 1e-7, 1))).length).toBe(3);
    expect(distinct(eigenvalues(spektrenOperator('B', 1)))).toHaveLength(2);
    expect(distinct(eigenvalues(spektrenOperator('C', 0)))).toEqual([[0, 0]]);
    expect(eigenvalues(spektrenOperator('M', 0))).toEqual([[0, 0], [0, 0]]);
    expect(distinct(eigenvalues(spektrenOperator('C', 0.01)))).toHaveLength(3);
  });
  it('the grid of the parameters: every family runs over [min, min + 2] in steps of 0.01 and hits its special points exactly', () => {
    expect(spektrenParam('A', 30)).toBe(0); expect(spektrenParam('B', 150)).toBe(1); expect(spektrenParam('C', 100)).toBe(1);
    expect(spektrenParam('M', 0)).toBe(-1); expect(spektrenParam('M', 200)).toBe(1); expect(spektrenParam('Q', 0)).toBe(0);
    expect(spektrenParam('A', 171)).toBe(1.41); expect(spektrenParam('A', 172)).toBe(1.42);
  });
});
