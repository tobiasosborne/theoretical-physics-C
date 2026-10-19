// The reward of c02.demo.distinguish (web/src/demos/c02/reward.ts): a design choice, kept
// apart from the physical score and the proven optimum. Tested: three stars exactly at
// P = P_opt; the two thresholds are inclusive; a score above the optimum is an error.
import { describe, expect, it } from 'vitest';
import { parseRat, surd, surdSub, LEVELS, optimum, score, zeroEffect } from '../../src/kernels/gpt';
import { ONE_STAR_GAP, REWARD, stars, TWO_STAR_GAP } from '../../src/demos/c02/reward';

const s = (x: string, y = '0', m = 1) => surd(parseRat(x), parseRat(y), BigInt(m));

describe('reward of Distinguish', () => {
  it('states its status and its two thresholds', () => {
    expect(REWARD.status).toMatch(/design choice/);
    expect(REWARD.status).toMatch(/not validated/);
    expect([TWO_STAR_GAP, ONE_STAR_GAP].map((r) => `${r.n}/${r.d}`)).toEqual(['1/20', '3/20']);
  });
  it('three stars exactly at the optimum, also for an optimum with a square root', () => {
    const opt = s('1/2', '1/4', 2);
    expect(stars(opt, opt)).toBe(3);
    expect(stars(s('8535533905932737/10000000000000000'), opt)).toBe(2);      // below by less than 1e-16: not three
  });
  it('thresholds are inclusive', () => {
    const opt = s('3/4');
    expect(stars(surdSub(opt, surd(TWO_STAR_GAP)), opt)).toBe(2);
    expect(stars(s('139/200'), opt)).toBe(1);                                  // gap 11/200 > 1/20
    expect(stars(surdSub(opt, surd(ONE_STAR_GAP)), opt)).toBe(1);
    expect(stars(s('119/200'), opt)).toBe(0);                                  // gap 31/200 > 3/20
  });
  it('a score above the proven optimum is refused', () => {
    expect(() => stars(s('4/5'), s('3/4'))).toThrow(/exceeds the proven optimum/);
  });
  it('every level: an optimal extreme effect earns three stars, the zero effect fewer', () => {
    for (const l of LEVELS) {
      const o = optimum(l.theory, l.problem);
      expect(stars(score(l.theory, o.optimal[0], l.problem), l.pOpt), l.id).toBe(3);
      expect(stars(score(l.theory, zeroEffect(l.theory), l.problem), l.pOpt), l.id).toBeLessThan(3);
    }
  });
});
