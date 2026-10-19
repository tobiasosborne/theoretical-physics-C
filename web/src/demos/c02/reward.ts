// The reward of the game c02.demo.distinguish. Pure, no DOM.
//
// Three things are kept apart (docs/plan/PLAN.md, section 13.1, A10):
//   1. the physical quantity: the success probability P(e) (kernel gpt, score);
//   2. the proven optimum P_opt of the level (kernel gpt, optimum);
//   3. the reward: stars, computed here from P and P_opt.
//
// The reward rule is a DESIGN CHOICE, unvalidated: nothing in the physics singles out the
// two thresholds. Three stars need P = P_opt exactly (an exact comparison, no tolerance).
import { cmpSurd, rat, ratToString, surd, surdAdd, type Rat, type Surd } from '../../kernels/gpt';

/**
 * The reward rule, in one place. STATUS: a design choice that has not been validated; it
 * is not physics and not derived (evidence/gaps.json, row G-0014: the printed manual names
 * the thresholds without values, the values are these). The rules panel of the game shows
 * the values with this status in both languages.
 */
export const REWARD = {
  status: 'design choice, not validated, not physics',
  /** three stars: P = P_opt, compared exactly */
  threeStars: 'P = P_opt',
  /** two stars: P_opt - P <= twoStarGap */
  twoStarGap: rat(1, 20),
  /** one star: P_opt - P <= oneStarGap */
  oneStarGap: rat(3, 20),
} as const;
export const TWO_STAR_GAP: Rat = REWARD.twoStarGap;
export const ONE_STAR_GAP: Rat = REWARD.oneStarGap;
export const rewardThresholds = (): { two: string; one: string } => ({ two: ratToString(TWO_STAR_GAP), one: ratToString(ONE_STAR_GAP) });

export type Stars = 0 | 1 | 2 | 3;

/** Stars for a committed measurement with success probability P in a level with optimum pOpt. */
export function stars(P: Surd, pOpt: Surd): Stars {
  const c = cmpSurd(P, pOpt);
  if (c > 0) throw new Error('reward: the score exceeds the proven optimum; the level or the effect is inconsistent');
  if (c === 0) return 3;
  if (cmpSurd(surdAdd(P, surd(TWO_STAR_GAP)), pOpt) >= 0) return 2;
  if (cmpSurd(surdAdd(P, surd(ONE_STAR_GAP)), pOpt) >= 0) return 1;
  return 0;
}
