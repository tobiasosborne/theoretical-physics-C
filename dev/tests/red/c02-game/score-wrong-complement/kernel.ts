// RED FIXTURE: the kernel with the score pi_1 e(omega_1) + pi_2 e(omega_2)
// (the complement 1 - e(omega_2) of the second outcome is missing).
export * from '../../../../web/src/kernels/gpt';
import { evaluate, surdAdd, surdScale, type Effect, type Problem, type Surd, type Theory } from '../../../../web/src/kernels/gpt';
export function score(t: Theory, e: Effect, p: Problem): Surd {
  return surdAdd(surdScale(p.pi1, evaluate(t, e, p.omega1)), surdScale(p.pi2, evaluate(t, e, p.omega2)));
}
