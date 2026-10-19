// Kernel gpt against the Julia reference (numerics/gpt -> tests/golden/gpt.json).
// Exact values are compared as canonical strings (no tolerance); the 'expected' doubles go
// through expectGolden with the tolerance stated and derived in the golden file.
//
// GPT_KERNEL=<path> runs the same tests against another kernel module (the red corpus
// tests/red/c02-game/ plants defective kernels this way).
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Vec } from '../../src/kernels/gpt';
import { expectGolden, loadGolden } from '../golden';

type Kernel = typeof import('../../src/kernels/gpt');
const K: Kernel = process.env.GPT_KERNEL ? await import(path.resolve(process.env.GPT_KERNEL)) : await import('../../src/kernels/gpt');

interface SurdJ { x: string; y: string; m: string }
type EffectJ = { f: string[] } | { b: string; w: string[]; m: string };
interface Case {
  kind: 'theory' | 'extreme_on_pure' | 'membership_effect' | 'membership_state' | 'level' | 'score' | 'optimum';
  theory: string; state_vertices?: string[][]; effect_vertices?: EffectJ[]; zero?: EffectJ; unit?: EffectJ; dim?: number;
  sharp?: Array<{ direction: string[]; effect: EffectJ }>;
  effect?: EffectJ; state?: string[]; value?: SurdJ; expected?: number; inside?: boolean;
  id?: string; level?: string; what?: string; omega_1?: string[]; omega_2?: string[]; priors?: string[];
  p_opt?: SurdJ; optimal_extreme_effects?: EffectJ[]; all_effects_optimal?: boolean; guess?: string;
  vertex_scores?: Array<{ effect: EffectJ; P: SurdJ }>; e1?: SurdJ; e2?: SurdJ; P?: SurdJ;
}
const golden = loadGolden<Case>('gpt');
const of = (kind: Case['kind']) => golden.cases.filter((c) => c.kind === kind);
const key = (e: EffectJ) => JSON.stringify(K.effectToJSON(K.effectFromJSON(e)));
const keys = (es: readonly EffectJ[]) => es.map(key).sort();
const problem = (c: Case) => ({ omega1: c.omega_1!.map(K.parseRat), omega2: c.omega_2!.map(K.parseRat), pi1: K.parseRat(c.priors![0]), pi2: K.parseRat(c.priors![1]) });
const inUnitInterval = (s: ReturnType<Kernel['surd']>) => K.cmpSurd(s, K.surd(K.ZERO)) >= 0 && K.cmpSurd(s, K.surd(K.ONE)) <= 0;

describe(`kernel gpt against ${golden.reference.implementation}`, () => {
  it('has golden cases of every kind', () => {
    for (const k of ['theory', 'extreme_on_pure', 'membership_effect', 'membership_state', 'level', 'score', 'optimum'] as const) expect(of(k).length, k).toBeGreaterThan(0);
  });

  describe('theories: state vertices, effect vertices, zero and unit', () => {
    for (const c of of('theory')) {
      it(c.theory, () => {
        const t = K.theoryById(c.theory);
        expect(JSON.stringify(K.effectToJSON(K.zeroEffect(t)))).toBe(key(c.zero!));
        expect(JSON.stringify(K.effectToJSON(K.unitEffect(t)))).toBe(key(c.unit!));
        if (t.kind === 'polytope') {
          expect(t.stateVertices.map((v) => K.vecToStrings(v).join(',')).sort()).toEqual(c.state_vertices!.map((v) => v.join(',')).sort());
          expect(keys(t.effectVertices.map((f) => K.effectToJSON(K.vectorEffect(f))))).toEqual(keys(c.effect_vertices!));
          // INTERNAL CONSISTENCY ONLY, not a certificate: the kernel's enumeration of effect
          // vertices already filters candidates by the same state-vertex inequalities that
          // isEffect tests, and isExtremeEffect tests membership in that generated list. The
          // two lines below cannot detect an incomplete enumeration or a wrong membership
          // rule. The independent checks are the two golden comparisons above (vertex lists
          // against web/tests/golden/gpt.json, produced by the Julia reference) and the
          // golden membership and boundary cases further down.
          expect(t.stateVertices.every((v) => K.isState(t, v))).toBe(true);
          expect(t.effectVertices.every((f) => K.isEffect(t, K.vectorEffect(f)) && K.isExtremeEffect(t, K.vectorEffect(f)))).toBe(true);
        } else {
          expect(t.dim).toBe(c.dim);
          for (const s of c.sharp!) {
            const e = K.sharpEffect(s.direction.map(K.parseRat));
            expect(JSON.stringify(K.effectToJSON(e)), `sharp effect along ${s.direction}`).toBe(key(s.effect));
            expect(K.isEffect(t, e) && K.isExtremeEffect(t, e)).toBe(true);
          }
        }
      });
    }
  });

  describe('every extreme effect maps every pure state into [0, 1]', () => {
    it('golden values', () => {
      for (const c of of('extreme_on_pure')) {
        const t = K.theoryById(c.theory);
        const e = K.effectFromJSON(c.effect!);
        const what = `${c.theory}: e = ${JSON.stringify(c.effect)} on ${c.state}`;
        expect(K.isExtremeEffect(t, e), what).toBe(true);
        const v = K.evaluate(t, e, c.state!.map(K.parseRat));
        expect(K.surdToJSON(v), what).toEqual(c.value);
        expect(inUnitInterval(v), what).toBe(true);
        expectGolden(K.surdToNumber(v), c.expected!, golden.tolerance, what);
      }
    });
    // INTERNAL CONSISTENCY ONLY: the lists are the kernel's own, and the enumeration kept
    // exactly the candidates with values in [0, 1] on the state vertices, so the interval
    // assertion cannot fail by itself. What is independent here is the count against the
    // golden file; the golden values are compared in the test above.
    it('polytopes: all vertices of E(K) on all vertices of K (the kernel\'s own lists)', () => {
      for (const t of K.THEORIES) {
        if (t.kind !== 'polytope') continue;
        const n = of('extreme_on_pure').filter((c) => c.theory === t.id).length;
        expect(n, t.id).toBe(t.effectVertices.length * t.stateVertices.length);
        for (const f of t.effectVertices) for (const v of t.stateVertices) expect(inUnitInterval(K.evaluate(t, K.vectorEffect(f), v)), t.id).toBe(true);
      }
    });
    it('qubit: 0, 1_K and the sharp effects of a lattice of directions on a lattice of rational pure states', () => {
      const t = K.QUBIT_BALL;
      // rational points of the unit sphere from the stereographic parametrisation
      // n = (2s, 2t, 1 - s^2 - t^2)/(1 + s^2 + t^2), which has n.n = 1 identically
      const pure: Vec[] = [];
      const par = [-3, -2, -1, -0.5, 0, 0.5, 1, 2, 3].map((x) => K.rat(Math.round(x * 2), 2));
      for (const s of par) for (const u of par) {
        const q = K.radd(K.ONE, K.radd(K.rmul(s, s), K.rmul(u, u)));
        const n = [K.rdiv(K.rmul(K.rat(2), s), q), K.rdiv(K.rmul(K.rat(2), u), q), K.rdiv(K.rsub(K.rat(2), q), q)];
        expect(K.req(K.dot(n, n), K.ONE)).toBe(true);
        pure.push(n, n.map(K.rneg));
      }
      const effects = [K.zeroEffect(t), K.unitEffect(t)];
      for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) for (let k = -3; k <= 3; k++) if (i || j || k) effects.push(K.sharpEffect(K.vec(i, j, k)));
      let bad = 0;
      for (const e of effects) {
        if (!K.isExtremeEffect(t, e) || !K.isEffect(t, e)) bad++;
        for (const n of pure) if (!inUnitInterval(K.evaluate(t, e, n))) bad++;
      }
      expect(bad).toBe(0);
      // e(n) = 1 and e(-n) = 0 for the sharp effect along a rational pure state n
      for (const n of pure) {
        const e = K.sharpEffect(n);
        expect(K.surdEq(K.evaluate(t, e, n), K.surd(K.ONE)) && K.surdEq(K.evaluate(t, e, n.map(K.rneg)), K.surd(K.ZERO))).toBe(true);
      }
    });
  });

  describe('membership', () => {
    it('E(K): boundary effects are inside, effects outside by 10^-30 are outside', () => {
      for (const c of of('membership_effect')) {
        const t = K.theoryById(c.theory);
        expect(K.isEffect(t, K.effectFromJSON(c.effect!)), `membership in E(K) of ${c.theory}: ${JSON.stringify(c.effect)} (reference: ${c.inside ? 'inside' : 'outside'})`).toBe(c.inside);
      }
      expect(of('membership_effect').some((c) => c.inside) && of('membership_effect').some((c) => !c.inside)).toBe(true);
    });
    it('K', () => {
      for (const c of of('membership_state')) {
        const t = K.theoryById(c.theory);
        expect(K.isState(t, c.state!.map(K.parseRat)), `membership in K of ${c.theory}: ${c.state}`).toBe(c.inside);
      }
    });
    it('ball effects in doubles: exact boundary effects are inside the derived tolerance, effects outside by 2^-48 are not', () => {
      for (let i = -4; i <= 4; i++) for (let j = -4; j <= 4; j++) for (let k = -4; k <= 4; k++) {
        if (!(i || j || k)) continue;
        for (const [bn, bd] of [[1, 2], [1, 4], [3, 4], [1, 10], [7, 10]]) {
          const b = K.rat(bn, bd);
          const s = K.rmin(b, K.rsub(K.ONE, b));
          const e = K.ballEffectPolar(b, s, K.vec(i, j, k));
          expect(K.isEffect(K.QUBIT_BALL, e)).toBe(true);
          const a = e.w.map((x) => K.ratToNumber(x) * Math.sqrt(Number(e.m)));
          expect(K.ballEffectInsideFloat(K.ratToNumber(b), a), `boundary effect b = ${bn}/${bd}, direction (${i},${j},${k})`).toBe(true);
          const f = 1 + 2 ** -47 / K.ratToNumber(s);      // excess s * 2^-47/s = 2^-47 > 2^-49
          expect(K.ballEffectInsideFloat(K.ratToNumber(b), a.map((x) => x * f))).toBe(false);
        }
      }
    });
  });

  describe('score P(e) = pi_1 e(omega_1) + pi_2 (1 - e(omega_2))', () => {
    for (const c of of('score')) {
      it(`level ${c.level}: e = ${JSON.stringify(c.effect)}`, () => {
        const t = K.theoryById(c.theory);
        const e = K.effectFromJSON(c.effect!);
        const p = problem(c);
        const what = `score of level ${c.level} at e = ${JSON.stringify(c.effect)}`;
        expect(K.surdToJSON(K.evaluate(t, e, p.omega1)), `${what}: e(omega_1)`).toEqual(c.e1);
        expect(K.surdToJSON(K.evaluate(t, e, p.omega2)), `${what}: e(omega_2)`).toEqual(c.e2);
        expectGolden(K.surdToNumber(K.score(t, e, p)), c.expected!, golden.tolerance, what);
        expect(K.surdToJSON(K.score(t, e, p)), what).toEqual(c.P);
      });
    }
    it('some golden score separates 1 - e(omega_2) from e(omega_2)', () => {
      expect(of('score').some((c) => K.parseRat(c.priors![1]).n !== 0n && !(c.e2!.x === '1/2' && c.e2!.y === '0'))).toBe(true);
    });
  });

  describe('P_opt and the optimal extreme effects', () => {
    for (const c of [...of('level'), ...of('optimum')]) {
      it(c.kind === 'level' ? `level ${c.id}` : `${c.theory}: ${c.what}`, () => {
        const t = K.theoryById(c.theory);
        const p = problem(c);
        const o = K.optimum(t, p);
        const what = c.kind === 'level' ? `P_opt of level ${c.id}` : `P_opt (${c.what})`;
        expectGolden(K.surdToNumber(o.pOpt), c.expected!, golden.tolerance, what);
        expect(K.surdToJSON(o.pOpt), what).toEqual(c.p_opt);
        expect(keys(o.optimal.map(K.effectToJSON)), `${what}: optimal extreme effects`).toEqual(keys(c.optimal_extreme_effects!));
        expect(o.allOptimal, what).toBe(c.all_effects_optimal);
        for (const e of o.optimal) {
          expect(K.isEffect(t, e) && K.isExtremeEffect(t, e), what).toBe(true);
          expect(K.cmpSurd(K.score(t, e, p), o.pOpt), what).toBe(0);
        }
        // section 4.1: max(pi_1, pi_2) <= P_opt <= 1
        expect(K.cmpSurd(o.pOpt, K.surd(K.guessScore(p))) >= 0 && K.cmpSurd(o.pOpt, K.surd(K.ONE)) <= 0, what).toBe(true);
        if (c.kind === 'level') {
          expect(K.ratToString(K.guessScore(p))).toBe(c.guess);
          if (t.kind === 'polytope') {
            expect(o.candidates.length).toBe(c.vertex_scores!.length);
            for (const vs of c.vertex_scores!) {
              const mine = o.candidates.find((x) => JSON.stringify(K.effectToJSON(x.effect)) === key(vs.effect));
              expect(mine && K.surdToJSON(mine.P), `${what}: score at the vertex ${JSON.stringify(vs.effect)}`).toEqual(vs.P);
            }
          }
        }
      });
    }

    const lv = (id: string) => of('level').find((c) => c.id === id)!;
    it('S2 is the tie: two optimal extreme effects, and the segment between them is optimal too (hazard 6.5)', () => {
      const c = lv('S2'); const t = K.SQUARE_BIT; const p = problem(c);
      const o = K.optimum(t, p);
      expect(keys(o.optimal.map(K.effectToJSON))).toEqual(keys([{ f: ['1/2', '1/2', '0'] }, { f: ['1/2', '0', '1/2'] }]));
      const mid = K.vectorEffect(K.vec('1/2', '1/4', '1/4'));
      expect(K.isEffect(t, mid) && !K.isExtremeEffect(t, mid) && K.cmpSurd(K.score(t, mid, p), o.pOpt) === 0).toBe(true);
    });
    it('Q2: guessing is optimal: the unit effect alone, P_opt = max(pi_1, pi_2) = 9/10, the best sharp effect gives 5/8', () => {
      const c = lv('Q2'); const t = K.QUBIT_BALL; const p = problem(c);
      const o = K.optimum(t, p);
      expect(o.optimal.length === 1 && K.effectsEqual(o.optimal[0], K.unitEffect(t))).toBe(true);
      expect(K.surdToJSON(o.pOpt)).toEqual({ x: '9/10', y: '0', m: '1' });
      expect(K.ratToString(K.guessScore(p))).toBe('9/10');
      expect(K.surdToJSON(K.score(t, K.sharpEffect(K.vec(0, 0, 1)), p))).toEqual({ x: '5/8', y: '0', m: '1' });
    });
    it('S1, S2: perfectly distinguishable in the square bit; Q1: pure states that are not', () => {
      for (const id of ['S1', 'S2']) expect(K.surdToJSON(K.optimum(K.SQUARE_BIT, problem(lv(id))).pOpt)).toEqual({ x: '1', y: '0', m: '1' });
      const p = problem(lv('Q1'));
      expect(K.req(K.dot(p.omega1, p.omega1), K.ONE) && K.req(K.dot(p.omega2, p.omega2), K.ONE)).toBe(true);
      const o = K.optimum(K.QUBIT_BALL, p);
      expect(K.surdToJSON(o.pOpt)).toEqual({ x: '1/2', y: '1/4', m: '2' });
      expect(K.cmpSurd(o.pOpt, K.surd(K.ONE))).toBe(-1);
    });
  });

  describe('exact comparison of numbers x + y*sqrt(m)', () => {
    const s = (x: string, y = '0', m = 1) => K.surd(K.parseRat(x), K.parseRat(y), BigInt(m));
    it('brackets (2 + sqrt 2)/4 = 0.85355339059327376220... between neighbouring decimals of 16 digits', () => {
      const p = s('1/2', '1/4', 2);
      expect(K.cmpSurd(p, s('8535533905932737/10000000000000000'))).toBe(1);
      expect(K.cmpSurd(p, s('8535533905932738/10000000000000000'))).toBe(-1);
      expect(K.cmpSurd(p, p)).toBe(0);
    });
    it('different radicands, signs and canonical forms', () => {
      expect(K.cmpSurd(s('1/2', '3/20', 5), s('1/2', '1/4', 2))).toBe(-1);       // 0.8354 < 0.8536
      expect(K.cmpSurd(s('0', '1', 2), s('0', '1', 3))).toBe(-1);
      expect(K.cmpSurd(s('0', '-1', 2), s('0', '-1', 3))).toBe(1);
      expect(K.cmpSurd(s('3', '-2', 2), s('0', '1/10', 3))).toBe(-1);            // 0.1716 < 0.1732
      expect(K.cmpSurd(s('3', '-2', 2), s('0', '99/1000', 3))).toBe(1);          // 0.1716 > 0.1715
      expect(K.surdToJSON(s('1', '2', 12))).toEqual({ x: '1', y: '4', m: '3' });
      expect(K.surdToJSON(s('1', '2', 9))).toEqual({ x: '7', y: '0', m: '1' });
      expect(K.cmpSurd(s('0', '1', 8), s('0', '2', 2))).toBe(0);
    });
  });
});
