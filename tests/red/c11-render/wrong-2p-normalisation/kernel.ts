// RED FIXTURE: the kernel with the defect of vl16 line 94 planted: psi_{2,1,+-1} with the
// prefactor 1/(8 sqrt(2 pi)) instead of -+ 1/(8 sqrt(pi)), i.e. too small by sqrt 2 (norm 1/2).
// Everything else is the real kernel. The golden test must fail with "golden mismatch".
export * from '../../../../web/src/kernels/hydrogen';
import * as K from '../../../../web/src/kernels/hydrogen';

export function psi(n: number, l: number, m: number, x: number, y: number, z: number): K.Complex {
  const c = K.psi(n, l, m, x, y, z);
  return n === 2 && l === 1 && Math.abs(m) === 1 ? [c[0] / Math.SQRT2, c[1] / Math.SQRT2] : c;
}
