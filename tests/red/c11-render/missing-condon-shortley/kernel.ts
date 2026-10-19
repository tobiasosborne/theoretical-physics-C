// RED FIXTURE: spherical harmonics without the Condon-Shortley sign (-1)^m for m > 0:
// Y_1^{+1} = + sqrt(3/(8 pi)) sin(theta) e^{i phi}. Densities are unchanged; phases, the
// relation Y_l^{-m} = (-1)^m conj(Y_l^m) and every superposition are wrong. Must fail.
export * from '../../../../web/src/kernels/hydrogen';
import * as K from '../../../../web/src/kernels/hydrogen';

const strip = (m: number, c: K.Complex): K.Complex => (m > 0 && m % 2 === 1 ? [-c[0], -c[1]] : c);
export function ylm(l: number, m: number, theta: number, phi: number): K.Complex { return strip(m, K.ylm(l, m, theta, phi)); }
export function ylmDirection(l: number, m: number, ux: number, uy: number, uz: number): K.Complex { return strip(m, K.ylmDirection(l, m, ux, uy, uz)); }
export function psi(n: number, l: number, m: number, x: number, y: number, z: number): K.Complex { return strip(m, K.psi(n, l, m, x, y, z)); }
