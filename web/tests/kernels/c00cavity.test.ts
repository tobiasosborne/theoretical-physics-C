// Kernel c00cavity.ts against the Julia reference in exact rational arithmetic
// (numerics/src/c00_reference.jl -> tests/golden/c00cavity.json, regenerated and checked by
// numerics/generate/c00_golden.jl), and the figure header of figures/hohlraum.tex.
import { afterAll, describe, expect, it } from 'vitest';
import * as K from '../../src/kernels/c00cavity';
import { expectGolden, loadGolden } from '../golden';

type Tol = { abs?: number; rel?: number };
interface PathCase {
  fn: 'cavityPath'; name: string; width: number; height: number; holeLo: number; holeHi: number; entryY: number; slope: number; maxReflections: number;
  expected: { points: number[][]; contacts: number[]; lengths: number[]; exited: boolean; reflections: number };
}
interface RemCase { fn: 'remaining'; tol: string; r: number[]; n: number[]; expected: number[][] }
type Case = PathCase | RemCase;
const golden = loadGolden<Case>('c00cavity') as ReturnType<typeof loadGolden<Case>> & { tolerances: Record<string, Tol> };
let worst = 0;

describe(`kernel c00cavity against ${golden.reference.implementation}`, () => {
  for (const c of golden.cases) {
    if (c.fn === 'cavityPath') {
      it(`cavityPath ${c.name} (slope ${c.slope})`, () => {
        const p = K.cavityPath({ width: c.width, height: c.height, holeLo: c.holeLo, holeHi: c.holeHi, entryY: c.entryY, slope: c.slope }, c.maxReflections);
        expect(p.contacts).toEqual(c.expected.contacts);
        expect(p.exited).toBe(c.expected.exited);
        expect(p.reflections).toBe(c.expected.reflections);
        expectGolden(p.points, c.expected.points, golden.tolerance, `${c.name} points`);
        expectGolden(p.lengths, c.expected.lengths, golden.tolerance, `${c.name} lengths`);
        p.points.forEach((q, i) => q.forEach((v, k) => { worst = Math.max(worst, Math.abs(v - c.expected.points[i][k])); }));
      });
    } else {
      it('remaining r^n', () => {
        const got = c.r.map((r) => c.n.map((n) => K.remaining(r, n)));
        expectGolden(got, c.expected, golden.tolerances[c.tol], 'remaining');
      });
    }
  }
  afterAll(() => { console.log(`c00cavity: measured maximum absolute deviation of the points ${worst} cm`); });
});

describe('kernel c00cavity: figure c00.fig.hohlraum', () => {
  it('reproduces the impacts listed in the figure header', () => {
    const p = K.cavityPath(K.FIGURE_GEOMETRY, 400);
    const header = [[1.9355, 2.4], [4, 1.12], [2.1935, 0], [0, 1.36], [1.6774, 2.4], [4, 0.96], [2.4516, 0]];
    header.forEach(([x, y], i) => { expect(Math.abs(p.points[i + 1][0] - x)).toBeLessThan(1e-4); expect(Math.abs(p.points[i + 1][1] - y)).toBeLessThan(1e-4); });
    expect(p.contacts.slice(1, 8)).toEqual([1, 1, 1, 1, 1, 1, 1]);
  });
  it('pointAt walks the path', () => {
    const p = K.cavityPath(K.FIGURE_GEOMETRY, 400);
    const q = K.pointAt(p, p.lengths[3]);
    expect(Math.abs(q.x - p.points[3][0]) + Math.abs(q.y - p.points[3][1])).toBeLessThan(1e-12);
    expect(q.reflections).toBe(3);
    expect(K.pointAt(p, 0.5 * (p.lengths[3] + p.lengths[4])).reflections).toBe(3);
  });
});
