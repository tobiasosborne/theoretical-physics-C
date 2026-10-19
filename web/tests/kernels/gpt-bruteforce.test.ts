// Qubit: the closed form of DERIVATION.md section 4.4 against a brute-force maximisation of
// the score over a grid of effects in doubles (no use of the closed form, of extreme
// points or of exact arithmetic on the brute-force side).
//
// Grid: (b, a) with b in {0, h, ..., 1} and a in h * Z^3, h = 1/64 (all exact doubles),
// kept if ballEffectInsideFloat accepts it.
//
// LIMIT OF THIS TEST: ballEffectInsideFloat is the KERNEL's floating membership predicate.
// The brute-force side is therefore independent of the closed form, of the extreme points
// and of the exact arithmetic, but NOT of the kernel's membership rule: a wrong rule would
// move both sides together. The membership rule is checked independently by the golden
// membership and boundary cases of gpt.test.ts (web/tests/golden/gpt.json).
//
// Tolerance, derived from the grid spacing h. Write x = (b, a) in R^4, c = (1/2, 0) and
// P(x) = pi_2 + delta b + v.a, so grad P = (delta, v), |grad P| <= sqrt(2) (|delta| <= 1,
// |v| <= 1) and P(c) = 1/2.
//  1. The ball of radius rho = 1/(2 sqrt 2) around c lies in E(K): with t = |b - 1/2| and
//     n = |a|, t^2 + n^2 <= rho^2 gives n + t <= sqrt(2) rho = 1/2, i.e. n <= min(b, 1-b).
//  2. For an optimal x* and eta in [0, 1], x' = c + (1 - eta)(x* - c) has the ball of
//     radius eta rho around it inside E(K) (convexity).
//  3. The nearest grid point g to x' is at distance at most (h/2) sqrt(4) = h, so g is in
//     E(K) if eta rho >= h: take eta = h/rho = 2 sqrt(2) h.
//  4. P(x*) - P(g) <= eta (P(x*) - P(c)) + |grad P| h <= 2 sqrt(2) h * 1/2 + sqrt(2) h.
//  Hence  0 <= P_opt - max over the grid <= 2 sqrt(2) h.
// Upper side: a grid point accepted by the float test lies within BALL_FLOAT_TOLERANCE of
// E(K), so its score exceeds P_opt by at most sqrt(2) * 2^-50 plus the rounding of the
// score (three products and three sums of numbers of modulus at most 1: below 2^-50).
import path from 'node:path';
import { describe, expect, it } from 'vitest';

type Kernel = typeof import('../../src/kernels/gpt');
const K: Kernel = process.env.GPT_KERNEL ? await import(path.resolve(process.env.GPT_KERNEL)) : await import('../../src/kernels/gpt');

const N = 64, h = 1 / N;
const LOWER = 2 * Math.SQRT2 * h;
const UPPER = (Math.SQRT2 + 1) * 2 ** -50;

function bruteForce(r1: number[], r2: number[], pi1: number, pi2: number): number {
  let best = -Infinity;
  const R = N / 2;
  for (let ib = 0; ib <= N; ib++) {
    const b = ib * h;
    const lim = Math.min(ib, N - ib);          // |a| <= min(b, 1-b): no coordinate exceeds it
    for (let i = -lim; i <= lim; i++) for (let j = -lim; j <= lim; j++) for (let k = -lim; k <= lim; k++) {
      if (i * i + j * j + k * k > R * R + 1) continue;      // cheap pre-filter; the membership test decides
      const a = [i * h, j * h, k * h];
      if (!K.ballEffectInsideFloat(b, a)) continue;
      const e1 = b + a[0] * r1[0] + a[1] * r1[1] + a[2] * r1[2];
      const e2 = b + a[0] * r2[0] + a[1] * r2[1] + a[2] * r2[2];
      const P = pi1 * e1 + pi2 * (1 - e2);
      if (P > best) best = P;
    }
  }
  return best;
}

const instances: Array<{ what: string; r1: string[]; r2: string[]; pi1: string }> = [
  { what: 'level Q1', r1: ['1', '0', '0'], r2: ['0', '1', '0'], pi1: '1/2' },
  { what: 'level Q2', r1: ['0', '0', '1/4'], r2: ['0', '0', '-1/4'], pi1: '9/10' },
  { what: 'tie of REVIEW.md B4', r1: ['0', '0', '1/3'], r2: ['0', '0', '-1'], pi1: '3/4' },
  { what: 'generic, unequal priors', r1: ['1/2', '0', '1/2'], r2: ['0', '1/3', '0'], pi1: '2/3' },
  { what: 'antipodal pure states', r1: ['0', '0', '1'], r2: ['0', '0', '-1'], pi1: '1/2' },
  { what: 'two pure states', r1: ['1', '0', '0'], r2: ['3/5', '4/5', '0'], pi1: '1/2' },
  { what: 'the zero effect is optimal', r1: ['1/2', '0', '0'], r2: ['0', '0', '1/2'], pi1: '1/10' },
];

describe(`qubit: closed form against brute force on a grid of spacing 1/${N}`, () => {
  for (const c of instances) {
    it(c.what, () => {
      const p = { omega1: c.r1.map(K.parseRat), omega2: c.r2.map(K.parseRat), pi1: K.parseRat(c.pi1), pi2: K.rsub(K.ONE, K.parseRat(c.pi1)) };
      const closed = K.surdToNumber(K.optimum(K.QUBIT_BALL, p).pOpt);
      const brute = bruteForce(K.vecToNumbers(p.omega1), K.vecToNumbers(p.omega2), K.ratToNumber(p.pi1), K.ratToNumber(p.pi2));
      const gap = closed - brute;
      if (!(gap <= LOWER && gap >= -UPPER)) {
        throw new Error(`brute force mismatch: ${c.what}: closed form ${closed}, grid maximum ${brute}, difference ${gap} outside [${-UPPER}, ${LOWER}]`);
      }
      expect(gap).toBeLessThanOrEqual(LOWER);
    }, 60000);
  }
});
