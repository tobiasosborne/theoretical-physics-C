// RED FIXTURE: a sampler that draws the radius from R_nl^2 instead of r^2 R_nl^2 (the
// density per volume mistaken for the density of the distance). For 1s, R^2 = 4 exp(-2x)
// normalised is 2 exp(-2x), with inverse CDF x = -ln(1 - u)/2; for the other states the
// radius is rescaled the same wrong way. The Kolmogorov-Smirnov test must fail.
export * from '../../../../web/src/kernels/hydrogen';
import * as K from '../../../../web/src/kernels/hydrogen';

export function sampleRadius(n: number, l: number, u: number): number {
  if (n === 1) return -Math.log(1 - u) / 2;
  // crude numerical inverse of the CDF of R^2 on a grid: enough to be wrong in the intended way
  const M = 4000, xmax = 60 * n;
  let total = 0;
  const cum = new Float64Array(M + 1);
  for (let i = 1; i <= M; i++) { const x = (xmax * (i - 0.5)) / M; total += K.radialR(n, l, x) ** 2; cum[i] = total; }
  let i = 1;
  while (i < M && cum[i] / total < u) i++;
  return (xmax * (i - 0.5)) / M;
}
