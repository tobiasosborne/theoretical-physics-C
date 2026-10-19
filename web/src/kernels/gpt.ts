// Kernel of chapter C2 (general probabilistic theories): the explorer c02.demo.explorer and
// the game c02.demo.distinguish. Pure functions, no DOM, no clock, no graphics.
//
// SOURCE OF THE MATHEMATICS: evidence/derivations/c02/DERIVATION.md, as checked and
// corrected by REVIEW.md in the same directory. "section N" below refers to DERIVATION.md.
// Reference implementation (independent, Julia, exact): numerics/gpt/ ->
// web/tests/golden/gpt.json; tests: web/tests/kernels/gpt*.test.ts.
//
// CONVENTIONS (the derivation's coordinates)
//   classical bit  section 3.2: state p = (p0, p1), p_i >= 0, p0 + p1 = 1; effect
//                  q = (q0, q1) with e(p) = q0 p0 + q1 p1; E(K) = [0,1]^2; unit (1, 1).
//   square bit     section 3.3: state r in [-1,1]^2; effect (b, ax, ay) with
//                  e(r) = b + a.r; E(K) = {|ax| + |ay| <= min(b, 1-b)}; unit (1, 0, 0).
//   qubit          sections 3.4, 3.5: state r in R^3, |r| <= 1 (Bloch ball,
//                  rho = (I + r.sigma)/2); effect (b, a) with e(r) = b + a.r = tr(rho E),
//                  E = b I + a.sigma; E(K) = {|a| <= min(b, 1-b)}; unit (1, 0, 0, 0).
//   score          section 4.1: P(e) = pi_1 e(omega_1) + pi_2 (1 - e(omega_2)): measure
//                  {e, 1_K - e}, guess state 1 on the outcome e and state 2 otherwise.
//   optimum        section 4.3 (polytopes: maximum over the finitely many vertices of
//                  E(K)), section 4.4 (ball: (1 + max(|delta|, L))/2, delta = pi_1 - pi_2,
//                  L = |pi_1 r_1 - pi_2 r_2|).
//
// EXACTNESS. A rational is a pair of integers (bigint). Where the qubit needs a square
// root, a number is x + y*sqrt(m) with x, y rational and m a squarefree integer, and the
// vector part of a ball effect is a = sqrt(m)*w with w rational: then a.a = m w.w is
// rational, so membership in E(K) is decided in rationals, and e(r) on a rational state is
// again of the form x + y*sqrt(m). Comparisons of such numbers are decided by squaring
// (cmpSurd), never by rounding.
//
// TOLERANCE POLICY. Membership in K and in E(K) is exact (isState, isEffect): a boundary
// point is inside, a point outside by any amount is outside. No tolerance exists on that
// path. The only floating-point membership test is ballEffectInsideFloat, for effects given
// in doubles (drawing, brute-force tests); its tolerance is derived at its definition.
//
// EXTENSION. A theory is a PolytopeTheory (any list of rational state vertices, in
// probability coordinates or in affine coordinates) or a BallTheory (any dimension). The
// classical trit, the regular 4-gon and the disc of DERIVATION.md sections 3.6, 3.7, 3.9
// are further values of these two types. Regular n-gons with irrational vertices need
// coordinates in a number field or the 1e-14 floating-point policy of section 3.10; that is
// a third variant of Theory with the same functions, not a change of the interface.
import levelsFile from './gpt.levels.json';

// ── rationals ───────────────────────────────────────────────────────────────────────────
export interface Rat { readonly n: bigint; readonly d: bigint }   // n/d, d > 0, gcd(n, d) = 1
export type Vec = readonly Rat[];

function gcd(a: bigint, b: bigint): bigint {
  if (a < 0n) a = -a;
  if (b < 0n) b = -b;
  while (b !== 0n) { const t = a % b; a = b; b = t; }
  return a;
}
export function rat(n: bigint | number, d: bigint | number = 1n): Rat {
  let nn = BigInt(n), dd = BigInt(d);
  if (dd === 0n) throw new Error('rational with denominator zero');
  if (dd < 0n) { nn = -nn; dd = -dd; }
  const g = gcd(nn, dd) || 1n;
  return { n: nn / g, d: dd / g };
}
export const ZERO: Rat = rat(0n), ONE: Rat = rat(1n), HALF: Rat = rat(1n, 2n);
/** "n" or "n/d" */
export function parseRat(s: string): Rat {
  const m = /^(-?\d+)(?:\/(\d+))?$/.exec(s.trim());
  if (!m) throw new Error(`not an exact rational: ${JSON.stringify(s)}`);
  return rat(BigInt(m[1]), m[2] === undefined ? 1n : BigInt(m[2]));
}
export const ratToString = (a: Rat): string => (a.d === 1n ? `${a.n}` : `${a.n}/${a.d}`);
export const ratToNumber = (a: Rat): number => Number(a.n) / Number(a.d);
export const radd = (a: Rat, b: Rat): Rat => rat(a.n * b.d + b.n * a.d, a.d * b.d);
export const rsub = (a: Rat, b: Rat): Rat => rat(a.n * b.d - b.n * a.d, a.d * b.d);
export const rmul = (a: Rat, b: Rat): Rat => rat(a.n * b.n, a.d * b.d);
export const rdiv = (a: Rat, b: Rat): Rat => rat(a.n * b.d, a.d * b.n);
export const rneg = (a: Rat): Rat => ({ n: -a.n, d: a.d });
export const rsign = (a: Rat): number => (a.n > 0n ? 1 : a.n < 0n ? -1 : 0);
export const rcmp = (a: Rat, b: Rat): number => { const x = a.n * b.d - b.n * a.d; return x > 0n ? 1 : x < 0n ? -1 : 0; };
export const req = (a: Rat, b: Rat): boolean => a.n === b.n && a.d === b.d;
export const rabs = (a: Rat): Rat => (a.n < 0n ? rneg(a) : a);
export const rmin = (a: Rat, b: Rat): Rat => (rcmp(a, b) <= 0 ? a : b);
export const rmax = (a: Rat, b: Rat): Rat => (rcmp(a, b) >= 0 ? a : b);
export const vec = (...xs: Array<string | number | bigint | Rat>): Vec =>
  xs.map((x) => (typeof x === 'string' ? parseRat(x) : typeof x === 'object' ? x : rat(x)));
export const dot = (a: Vec, b: Vec): Rat => {
  if (a.length !== b.length) throw new Error(`scalar product of vectors of lengths ${a.length} and ${b.length}`);
  return a.reduce<Rat>((s, x, i) => radd(s, rmul(x, b[i])), ZERO);
};
export const vscale = (c: Rat, a: Vec): Vec => a.map((x) => rmul(c, x));
export const vadd = (a: Vec, b: Vec): Vec => a.map((x, i) => radd(x, b[i]));
export const vsub = (a: Vec, b: Vec): Vec => a.map((x, i) => rsub(x, b[i]));
export const veq = (a: Vec, b: Vec): boolean => a.length === b.length && a.every((x, i) => req(x, b[i]));
export const vecToNumbers = (a: Vec): number[] => a.map(ratToNumber);
export const vecToStrings = (a: Vec): string[] => a.map(ratToString);

// ── numbers x + y*sqrt(m) ───────────────────────────────────────────────────────────────
/** x + y*sqrt(m). Canonical: m squarefree and >= 2 when y != 0; otherwise y = 0 and m = 1. */
export interface Surd { readonly x: Rat; readonly y: Rat; readonly m: bigint }

/** n = c^2 m with m squarefree, by trial division (the integers here are small) */
function squarePart(n: bigint): { c: bigint; m: bigint } {
  if (n <= 0n) throw new Error('squarePart needs a positive integer');
  let c = 1n, m = 1n;
  for (let p = 2n; p * p <= n; p++) {
    let e = 0;
    while (n % p === 0n) { n /= p; e++; }
    c *= p ** BigInt(e >> 1);
    if (e & 1) m *= p;
  }
  return { c, m: m * n };
}
/** sqrt(r) = c*sqrt(m) for a rational r >= 0, m squarefree */
export function sqrtRat(r: Rat): { c: Rat; m: bigint } {
  if (r.n < 0n) throw new Error('square root of a negative rational');
  if (r.n === 0n) return { c: ZERO, m: 1n };
  const { c, m } = squarePart(r.n * r.d);        // sqrt(n/d) = sqrt(n d)/d
  return { c: rat(c, r.d), m };
}
export function surd(x: Rat, y: Rat = ZERO, m: bigint = 1n): Surd {
  if (y.n === 0n) return { x, y: ZERO, m: 1n };
  if (m < 1n) throw new Error('radicand must be a positive integer');
  const sp = squarePart(m);
  const yy = rmul(y, rat(sp.c));
  return sp.m === 1n ? { x: radd(x, yy), y: ZERO, m: 1n } : { x, y: yy, m: sp.m };
}
export const surdEq = (a: Surd, b: Surd): boolean => req(a.x, b.x) && req(a.y, b.y) && a.m === b.m;
export function surdAdd(a: Surd, b: Surd): Surd {
  if (a.y.n === 0n) return surd(radd(a.x, b.x), b.y, b.m);
  if (b.y.n === 0n) return surd(radd(a.x, b.x), a.y, a.m);
  if (a.m !== b.m) throw new Error('sum of square roots of different radicands (not needed by this kernel)');
  return surd(radd(a.x, b.x), radd(a.y, b.y), a.m);
}
export const surdScale = (c: Rat, a: Surd): Surd => surd(rmul(c, a.x), rmul(c, a.y), a.m);
export const surdNeg = (a: Surd): Surd => surd(rneg(a.x), rneg(a.y), a.m);
export const surdSub = (a: Surd, b: Surd): Surd => surdAdd(a, surdNeg(b));
/** nearest-double evaluation; error bound: tolerance note of web/tests/golden/gpt.json */
export const surdToNumber = (a: Surd): number => (a.y.n === 0n ? ratToNumber(a.x) : ratToNumber(a.x) + ratToNumber(a.y) * Math.sqrt(Number(a.m)));
export const surdIsRational = (a: Surd): boolean => a.y.n === 0n;

/** sign of A + B*sqrt(m), decided in rationals */
function sign1(A: Rat, B: Rat, m: bigint): number {
  const sa = rsign(A), sb = rsign(B);
  if (sb === 0) return sa;
  if (sa === 0) return sb;
  if (sa === sb) return sa;
  // A and B*sqrt(m) have opposite signs: |A| against |B| sqrt(m), compared through the squares
  return sa * rsign(rsub(rmul(A, A), rmul(rmul(B, B), rat(m))));
}
/** sign of a - b, decided in rationals (at most two squarings); 0 exactly when a = b */
export function cmpSurd(a: Surd, b: Surd): number {
  const dx = rsub(a.x, b.x);
  if (a.y.n === 0n) return sign1(dx, rneg(b.y), b.m);
  if (b.y.n === 0n) return sign1(dx, a.y, a.m);
  if (a.m === b.m) return sign1(dx, rsub(a.y, b.y), a.m);
  // U = dx + a.y sqrt(a.m), V = b.y sqrt(b.m): sign of U - V
  const su = sign1(dx, a.y, a.m), sv = rsign(b.y);
  if (su !== sv) return su > sv ? 1 : -1;
  // equal nonzero signs (sv != 0 here): compare U^2 = dx^2 + a.y^2 a.m + 2 dx a.y sqrt(a.m) with V^2
  const d = sign1(rsub(radd(rmul(dx, dx), rmul(rmul(a.y, a.y), rat(a.m))), rmul(rmul(b.y, b.y), rat(b.m))), rmul(rat(2n), rmul(dx, a.y)), a.m);
  return su > 0 ? d : -d;
}

// ── theories ────────────────────────────────────────────────────────────────────────────
export interface PolytopeTheory {
  readonly kind: 'polytope';
  readonly id: string;
  /** 'probability': h(p) = p (section 3.2). 'affine': h(r) = (1, r) (section 3.3). e(x) = f . h(x). */
  readonly chart: 'probability' | 'affine';
  readonly stateVertices: readonly Vec[];      // ext K
  readonly rows: readonly Vec[];               // h(vertex), one per vertex
  readonly zero: Vec;
  readonly unit: Vec;                          // the unit effect 1_K
  readonly effectVertices: readonly Vec[];     // ext E(K), computed by enumerateEffectVertices
  readonly ref: string;
}
export interface BallTheory {
  readonly kind: 'ball';
  readonly id: string;
  readonly dim: number;                        // K = {r in R^dim : r.r <= 1}
  readonly ref: string;
}
export type Theory = PolytopeTheory | BallTheory;

export interface VectorEffect { readonly kind: 'vector'; readonly f: Vec }
/** (b, a) with a = sqrt(m)*w. Canonical: m squarefree; m = 1 when w = 0. */
export interface BallEffect { readonly kind: 'ball'; readonly b: Rat; readonly w: Vec; readonly m: bigint }
export type Effect = VectorEffect | BallEffect;

/** exact Gaussian elimination; null if the matrix is singular */
function solve(A: readonly Vec[], rhs: Vec): Vec | null {
  const n = A.length;
  const M: Rat[][] = A.map((row, i) => [...row, rhs[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    while (p < n && M[p][c].n === 0n) p++;
    if (p === n) return null;
    [M[c], M[p]] = [M[p], M[c]];
    const piv = M[c][c];
    M[c] = M[c].map((x) => rdiv(x, piv));
    for (let r = 0; r < n; r++) {
      if (r === c || M[r][c].n === 0n) continue;
      const k = M[r][c];
      M[r] = M[r].map((x, j) => rsub(x, rmul(k, M[c][j])));
    }
  }
  return M.map((row) => row[n]);
}

/**
 * ext E(K) for K = conv(vertices) (section 3.1): E(K) = {f : 0 <= H_i . f <= 1 for every
 * vertex row H_i}; f is a vertex exactly when its active bounds have full rank. Every
 * choice of D rows with a value 0 or 1 each is solved exactly and kept if feasible.
 */
export function enumerateEffectVertices(rows: readonly Vec[]): Vec[] {
  const D = rows[0].length;
  const found: Vec[] = [];
  const pick: Array<{ i: number; v: Rat }> = [];
  const visit = (start: number) => {
    if (pick.length === D) {
      const f = solve(pick.map((c) => rows[c.i]), pick.map((c) => c.v));
      if (f && rows.every((h) => { const t = dot(h, f); return rsign(t) >= 0 && rcmp(t, ONE) <= 0; }) && !found.some((g) => veq(g, f))) found.push(f);
      return;
    }
    for (let i = start; i < rows.length; i++) for (const v of [ZERO, ONE]) { pick.push({ i, v }); visit(i + 1); pick.pop(); }
  };
  visit(0);
  // a fixed order: lexicographic in the coordinates
  return found.sort((a, b) => { for (let i = 0; i < D; i++) { const c = rcmp(a[i], b[i]); if (c) return c; } return 0; });
}

export function makePolytope(id: string, chart: 'probability' | 'affine', stateVertices: readonly Vec[], ref: string): PolytopeTheory {
  const rows = stateVertices.map((v) => (chart === 'affine' ? [ONE, ...v] : [...v]));
  const D = rows[0].length;
  const unit: Vec = chart === 'affine' ? [ONE, ...stateVertices[0].map(() => ZERO)] : stateVertices[0].map(() => ONE);
  return { kind: 'polytope', id, chart, stateVertices, rows, zero: Array.from({ length: D }, () => ZERO), unit, effectVertices: enumerateEffectVertices(rows), ref };
}

/** section 3.2: the classical bit in probability coordinates, ext K = {(1,0), (0,1)} */
export const CLASSICAL_BIT: PolytopeTheory = makePolytope('classical_bit', 'probability', [vec(1, 0), vec(0, 1)], 'DERIVATION.md section 3.2');
/** section 3.3: the square bit (boxworld), K = [-1,1]^2 */
export const SQUARE_BIT: PolytopeTheory = makePolytope('square_bit', 'affine', [vec(-1, -1), vec(-1, 1), vec(1, -1), vec(1, 1)], 'DERIVATION.md section 3.3');
/** sections 3.4, 3.5: the qubit as the Bloch ball */
export const QUBIT_BALL: BallTheory = { kind: 'ball', id: 'qubit_ball', dim: 3, ref: 'DERIVATION.md sections 3.4, 3.5' };
/** the theories of the first release, in the order of the learning sequence */
export const THEORIES: readonly Theory[] = [CLASSICAL_BIT, SQUARE_BIT, QUBIT_BALL];
export function theoryById(id: string): Theory {
  const t = THEORIES.find((x) => x.id === id);
  if (!t) throw new Error(`unknown theory: ${id}`);
  return t;
}

// ── effects ─────────────────────────────────────────────────────────────────────────────
export const vectorEffect = (f: Vec): VectorEffect => ({ kind: 'vector', f });
/** the ball effect (b, sqrt(m)*w), brought to canonical form */
export function ballEffect(b: Rat, w: Vec, m: bigint = 1n): BallEffect {
  if (w.every((x) => x.n === 0n)) return { kind: 'ball', b, w, m: 1n };
  if (m < 1n) throw new Error('radicand must be a positive integer');
  const sp = squarePart(m);
  return { kind: 'ball', b, w: vscale(rat(sp.c), w), m: sp.m };
}
/** the ball effect (b, s*d/|d|): length s >= 0 (rational) along the rational direction d != 0 */
export function ballEffectPolar(b: Rat, s: Rat, d: Vec): BallEffect {
  if (rsign(s) < 0) throw new Error('the length of a must not be negative');
  if (s.n === 0n) return ballEffect(b, d.map(() => ZERO));
  const { c, m } = sqrtRat(dot(d, d));              // |d| = c sqrt(m);  s d/|d| = sqrt(m) * (s/(c m)) d
  if (c.n === 0n) throw new Error('direction must not be the zero vector');
  return ballEffect(b, vscale(rdiv(s, rmul(c, rat(m))), d), m);
}
/** section 3.5: the extreme effect (1/2, n/2) with n = d/|d| */
export const sharpEffect = (d: Vec): BallEffect => ballEffectPolar(HALF, HALF, d);
/** |a|^2 = m w.w, a rational */
export const ballNormSquared = (e: BallEffect): Rat => rmul(rat(e.m), dot(e.w, e.w));

export function zeroEffect(t: Theory): Effect {
  return t.kind === 'polytope' ? vectorEffect(t.zero) : ballEffect(ZERO, Array.from({ length: t.dim }, () => ZERO));
}
/** the unit effect 1_K (section 1.5) */
export function unitEffect(t: Theory): Effect {
  return t.kind === 'polytope' ? vectorEffect(t.unit) : ballEffect(ONE, Array.from({ length: t.dim }, () => ZERO));
}
function pair<T extends Theory>(t: T, e: Effect): void {
  if ((t.kind === 'polytope') !== (e.kind === 'vector')) throw new Error(`effect of kind '${e.kind}' does not belong to the theory ${t.id}`);
  const len = e.kind === 'vector' ? e.f.length : e.w.length;
  const want = t.kind === 'polytope' ? t.zero.length : t.dim;
  if (len !== want) throw new Error(`effect with ${len} coordinates in the theory ${t.id}, which needs ${want}`);
}
export function effectsEqual(a: Effect, b: Effect): boolean {
  if (a.kind === 'vector' && b.kind === 'vector') return veq(a.f, b.f);
  // canonical forms: sqrt(m) w = sqrt(m') w' with distinct squarefree m, m' and w != 0 is impossible
  if (a.kind === 'ball' && b.kind === 'ball') return req(a.b, b.b) && veq(a.w, b.w) && a.m === b.m;
  return false;
}
/** the complementary effect 1_K - e (section 1.11) */
export function complement(t: Theory, e: Effect): Effect {
  pair(t, e);
  if (t.kind === 'polytope' && e.kind === 'vector') return vectorEffect(vsub(t.unit, e.f));
  const be = e as BallEffect;
  return ballEffect(rsub(ONE, be.b), vscale(rat(-1n), be.w), be.m);
}

/** p = e(omega), exact (sections 3.2, 3.3, 3.4) */
export function evaluate(t: Theory, e: Effect, state: Vec): Surd {
  pair(t, e);
  if (t.kind === 'polytope' && e.kind === 'vector') return surd(dot(e.f, t.chart === 'affine' ? [ONE, ...state] : state));
  const be = e as BallEffect;
  return surd(be.b, dot(be.w, state), be.m);
}

/**
 * Membership in E(K), exact; boundary effects are inside.
 * Polytope (section 3.1): 0 <= e(v) <= 1 on every vertex v of K.
 * Ball (section 3.4): 0 <= b <= 1 and |a|^2 = m w.w <= min(b, 1-b)^2, all rational.
 */
export function isEffect(t: Theory, e: Effect): boolean {
  pair(t, e);
  if (t.kind === 'polytope' && e.kind === 'vector') {
    return t.rows.every((h) => { const v = dot(h, e.f); return rsign(v) >= 0 && rcmp(v, ONE) <= 0; });
  }
  const be = e as BallEffect;
  if (rsign(be.b) < 0 || rcmp(be.b, ONE) > 0) return false;
  const lim = rmin(be.b, rsub(ONE, be.b));
  return rcmp(ballNormSquared(be), rmul(lim, lim)) <= 0;
}

/**
 * Membership in K, exact; boundary states are inside.
 * Ball: r.r <= 1. Polytope: x is a state exactly when 1_K(x) = 1 and f(x) >= 0 for every
 * extreme effect f. This is section 1.10 (the states are the normalised positive
 * functionals on A(K)^+) with section 1.17 (A(K)^+ is the cone generated by E(K)) and the
 * fact that E(K) is the convex hull of its vertices.
 */
export function isState(t: Theory, x: Vec): boolean {
  if (t.kind === 'ball') return x.length === t.dim && rcmp(dot(x, x), ONE) <= 0;
  const h = t.chart === 'affine' ? [ONE, ...x] : x;
  if (h.length !== t.unit.length) return false;
  return req(dot(t.unit, h), ONE) && t.effectVertices.every((f) => rsign(dot(f, h)) >= 0);
}

/** the mixture lambda x + (1 - lambda) y (section 1.2), 0 <= lambda <= 1 */
export function mix(lambda: Rat, x: Vec, y: Vec): Vec {
  if (rsign(lambda) < 0 || rcmp(lambda, ONE) > 0) throw new Error('mixing weight outside [0, 1]');
  return vadd(vscale(lambda, x), vscale(rsub(ONE, lambda), y));
}

/** e is an extreme point of E(K): a vertex (polytope); 0, 1_K or (1/2, n/2), |n| = 1 (ball, section 3.5) */
export function isExtremeEffect(t: Theory, e: Effect): boolean {
  pair(t, e);
  if (t.kind === 'polytope' && e.kind === 'vector') return t.effectVertices.some((f) => veq(f, e.f));
  const be = e as BallEffect;
  const n2 = ballNormSquared(be);
  if (n2.n === 0n) return be.b.n === 0n || req(be.b, ONE);
  return req(be.b, HALF) && req(n2, rat(1n, 4n));
}

/**
 * Floating-point membership of a ball effect (b, a) given in doubles, for drawing and for
 * brute-force tests only: |a| <= min(b, 1-b) + BALL_FLOAT_TOLERANCE.
 *
 * Derivation of the tolerance, u = 2^-53 (IEEE 754 double, round to nearest; each of
 * +, *, sqrt returns the exact result times (1 + d), |d| <= u):
 *  (i)  An exact boundary effect, |a*| = min(b*, 1-b*) <= 1/2, stored in doubles: each
 *       coordinate moves by at most u |a_i*|, so |a| <= |a*| + u/2, and b moves by at most
 *       u, so min(b, 1-b) >= min(b*, 1-b*) - u. Excess of the stored effect: at most 3u/2.
 *  (ii) Computed norm: the squares carry (1 + d), the two additions of nonnegative terms
 *       another (1 + d) each, the square root halves the relative error and adds one d:
 *       computed = |a| (1 + t), |t| <= (1 + u)^(5/2) - 1 < 3u, so with |a| <= 1/2 + 3u/2 the
 *       absolute error is below 1.6 u. Computed 1 - b: error at most u. min is exact.
 *  Sum: 3u/2 + 1.6u + u < 4.1 u. The tolerance is 8u = 2^-50, the next power of two above.
 * An effect outside E(K) by more than 2^-49 is rejected by the same count.
 */
export const BALL_FLOAT_TOLERANCE = 2 ** -50;
export function ballEffectInsideFloat(b: number, a: readonly number[]): boolean {
  let s = 0;
  for (const x of a) s += x * x;
  return Math.sqrt(s) <= Math.min(b, 1 - b) + BALL_FLOAT_TOLERANCE;
}

// ── the discrimination problem (section 4) ──────────────────────────────────────────────
export interface Problem { readonly omega1: Vec; readonly omega2: Vec; readonly pi1: Rat; readonly pi2: Rat }

/** P(e) = pi_1 e(omega_1) + pi_2 (1 - e(omega_2))  (section 4.1) */
export function score(t: Theory, e: Effect, p: Problem): Surd {
  const e1 = evaluate(t, e, p.omega1);
  const e2 = evaluate(t, e, p.omega2);
  return surdAdd(surdScale(p.pi1, e1), surdScale(p.pi2, surdSub(surd(ONE), e2)));
}
/** the better of the two constant measurements, max(pi_1, pi_2) (section 4.1: e = 1_K scores pi_1, e = 0 scores pi_2) */
export const guessScore = (p: Problem): Rat => rmax(p.pi1, p.pi2);

export interface Optimum {
  readonly pOpt: Surd;
  /** all optimal extreme effects when that list is finite; with allOptimal: the zero and the unit effect as representatives */
  readonly optimal: readonly Effect[];
  /** every effect has the same score (ball: L = delta = 0, section 4.4; polytope: all vertices tie) */
  readonly allOptimal: boolean;
  readonly method: 'vertices' | 'closed-form';
  /** polytope: the score at every vertex of E(K); ball: the three candidates of section 4.4 */
  readonly candidates: ReadonlyArray<{ effect: Effect; P: Surd }>;
  /** ball only: delta = pi_1 - pi_2, v = pi_1 r_1 - pi_2 r_2, L = |v| */
  readonly ball?: { delta: Rat; v: Vec; L: Surd };
}

/**
 * P_opt and the optimal extreme effects.
 * Polytope (sections 4.2, 4.3): the score is affine in e, so its maximum over E(K) is
 * attained at a vertex; all vertices are evaluated.
 * Ball (section 4.4): P_opt = (1 + max(|delta|, L))/2; optimal extreme effects: 1_K when
 * delta >= L, 0 when -delta >= L, (1/2, v/(2L)) when L >= |delta| and L > 0, with ties at
 * equality; if L = delta = 0 every effect scores 1/2. |delta| against L is decided by
 * comparing the rationals delta^2 and v.v.
 */
export function optimum(t: Theory, p: Problem): Optimum {
  if (t.kind === 'polytope') {
    const candidates = t.effectVertices.map((f) => { const effect = vectorEffect(f); return { effect, P: score(t, effect, p) }; });
    let best = candidates[0].P;
    for (const c of candidates) if (cmpSurd(c.P, best) > 0) best = c.P;
    const optimal = candidates.filter((c) => cmpSurd(c.P, best) === 0).map((c) => c.effect);
    return { pOpt: best, optimal, allOptimal: optimal.length === candidates.length, method: 'vertices', candidates };
  }
  const delta = rsub(p.pi1, p.pi2);
  const v = vsub(vscale(p.pi1, p.omega1), vscale(p.pi2, p.omega2));
  const L2 = dot(v, v);
  const sq = sqrtRat(L2);
  const L = surd(ZERO, sq.c, sq.m);
  const zero = zeroEffect(t), unit = unitEffect(t);
  const candidates: Array<{ effect: Effect; P: Surd }> = [{ effect: zero, P: surd(p.pi2) }, { effect: unit, P: surd(p.pi1) }];
  if (L2.n !== 0n) candidates.push({ effect: sharpEffect(v), P: surd(HALF, rmul(HALF, sq.c), sq.m) });
  const c = rcmp(rmul(delta, delta), L2);
  const constant = rsign(delta) > 0 ? unit : zero;
  const pConst = surd(rmul(HALF, radd(ONE, rabs(delta))));
  const ball = { delta, v, L };
  if (c > 0) return { pOpt: pConst, optimal: [constant], allOptimal: false, method: 'closed-form', candidates, ball };
  if (c === 0) {
    if (L2.n === 0n) return { pOpt: surd(HALF), optimal: [zero, unit], allOptimal: true, method: 'closed-form', candidates, ball };
    return { pOpt: pConst, optimal: [constant, sharpEffect(v)], allOptimal: false, method: 'closed-form', candidates, ball };
  }
  return { pOpt: surd(HALF, rmul(HALF, sq.c), sq.m), optimal: [sharpEffect(v)], allOptimal: false, method: 'closed-form', candidates, ball };
}

// ── levels of the game "Distinguish" ────────────────────────────────────────────────────
export interface SurdJSON { x: string; y: string; m: string }
export type EffectJSON = { f: string[] } | { b: string; w: string[]; m: string };
export interface LevelJSON {
  id: string; theory: string; omega_1: string[]; omega_2: string[]; priors: string[];
  p_opt: SurdJSON; optimal_extreme_effects: EffectJSON[]; all_effects_optimal: boolean;
  derivation: string; note: string;
}
export interface Level {
  readonly id: string;
  readonly theory: Theory;
  readonly problem: Problem;
  /** the stored optimum (generated by numerics/gpt/generate.jl; checked by verifyLevel) */
  readonly pOpt: Surd;
  readonly optimal: readonly Effect[];
  readonly allOptimal: boolean;
  /** where the level and its optimum are derived */
  readonly derivation: string;
  readonly note: string;
}
export const surdFromJSON = (j: SurdJSON): Surd => surd(parseRat(j.x), parseRat(j.y), BigInt(j.m));
export const surdToJSON = (s: Surd): SurdJSON => ({ x: ratToString(s.x), y: ratToString(s.y), m: `${s.m}` });
export const effectFromJSON = (j: EffectJSON): Effect => ('f' in j ? vectorEffect(j.f.map(parseRat)) : ballEffect(parseRat(j.b), j.w.map(parseRat), BigInt(j.m)));
export const effectToJSON = (e: Effect): EffectJSON => (e.kind === 'vector' ? { f: vecToStrings(e.f) } : { b: ratToString(e.b), w: vecToStrings(e.w), m: `${e.m}` });

export function parseLevels(file: { levels: LevelJSON[] }): Level[] {
  return file.levels.map((j) => ({
    id: j.id,
    theory: theoryById(j.theory),
    problem: { omega1: j.omega_1.map(parseRat), omega2: j.omega_2.map(parseRat), pi1: parseRat(j.priors[0]), pi2: parseRat(j.priors[1]) },
    pOpt: surdFromJSON(j.p_opt),
    optimal: j.optimal_extreme_effects.map(effectFromJSON),
    allOptimal: j.all_effects_optimal,
    derivation: j.derivation,
    note: j.note,
  }));
}

const showSurd = (s: Surd): string => (s.y.n === 0n ? ratToString(s.x) : `${ratToString(s.x)} + ${ratToString(s.y)}*sqrt(${s.m})`);

/**
 * A level is admitted only if its stored data are consistent with this kernel: the states
 * are in K, the priors are a probability vector, every stored optimal effect is in E(K)
 * and is extreme and attains the stored P_opt, and the stored P_opt and the stored set of
 * optimal extreme effects equal what optimum() computes. Throws with the reason otherwise.
 */
export function verifyLevel(l: Level): void {
  const { theory: t, problem: p } = l;
  if (!isState(t, p.omega1) || !isState(t, p.omega2)) throw new Error(`level ${l.id}: a state is not in K`);
  if (rsign(p.pi1) < 0 || rsign(p.pi2) < 0 || !req(radd(p.pi1, p.pi2), ONE)) throw new Error(`level ${l.id}: the priors are not a probability vector`);
  if (l.optimal.length === 0) throw new Error(`level ${l.id}: no optimal effect is stored`);
  for (const e of l.optimal) {
    if (!isEffect(t, e)) throw new Error(`level ${l.id}: a stored optimal effect is not in E(K): the level is not solvable at its claimed optimum ${showSurd(l.pOpt)}`);
    if (!isExtremeEffect(t, e)) throw new Error(`level ${l.id}: a stored optimal effect is not an extreme point of E(K)`);
  }
  const o = optimum(t, p);
  if (cmpSurd(o.pOpt, l.pOpt) !== 0) throw new Error(`level ${l.id}: stored P_opt ${showSurd(l.pOpt)} differs from the computed optimum ${showSurd(o.pOpt)}`);
  for (const e of l.optimal) {
    const P = score(t, e, p);
    if (cmpSurd(P, l.pOpt) !== 0) throw new Error(`level ${l.id}: a stored optimal effect scores ${showSurd(P)}, not the stored P_opt ${showSurd(l.pOpt)}`);
  }
  if (o.allOptimal !== l.allOptimal || o.optimal.length !== l.optimal.length || !o.optimal.every((e) => l.optimal.some((f) => effectsEqual(e, f)))) {
    throw new Error(`level ${l.id}: the stored set of optimal extreme effects differs from the computed set`);
  }
}

/** the fixed level set of the first release, in the order of the learning sequence (DERIVATION.md section 5.1) */
export const LEVELS: readonly Level[] = parseLevels(levelsFile as { levels: LevelJSON[] });
