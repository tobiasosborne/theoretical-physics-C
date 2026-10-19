import { describe, expect, it } from 'vitest';
import { imageOfUnitSquare, multiply, shearMatrixX, shearMatrixY, trace, type Mat2 } from '../../src/kernels/shear';
import { expectGolden, loadGolden } from '../golden';

interface Case { fn: 'imageOfUnitSquare' | 'trace' | 'multiply'; matrix: 'shearMatrixX' | 'shearMatrixY'; param: number | [number, number]; expected: number | number[] | number[][] }

const golden = loadGolden<Case>('shear');
const make = { shearMatrixX, shearMatrixY };

describe(`kernel shear against ${golden.reference.implementation}`, () => {
  it('has golden cases', () => { expect(golden.cases.length).toBeGreaterThan(0); });
  for (const c of golden.cases) {
    it(`${c.fn}(${c.matrix}(${JSON.stringify(c.param)}))`, () => {
      const what = `${c.fn}(${c.matrix}(${JSON.stringify(c.param)}))`;
      let got: unknown;
      if (c.fn === 'multiply') {
        const [s, t] = c.param as [number, number];
        got = multiply(make[c.matrix](s), make[c.matrix](t));
      } else {
        const m: Mat2 = make[c.matrix](c.param as number);
        got = c.fn === 'trace' ? trace(m) : imageOfUnitSquare(m);
      }
      expectGolden(got, c.expected, golden.tolerance, what);
    });
  }
});
