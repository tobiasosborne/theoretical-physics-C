// What the reader can set in the C2 demos: an effect and states on exact lattices, per
// theory. No DOM, no physics of its own: every effect and state goes through the kernel.
//
// LATTICES (design choices, not physics): the controls move in steps of 1/GRID so that
// the arithmetic is exact: the demos show exact fractions and symbolic roots, together with
// decimal approximations that are explicitly marked (format.ts); irrational effect
// coefficients are roots, not fractions. Qubit effects are (b, s d/|d|) with b and s on
// that grid and d an integer direction in the drawn section plane with entries of modulus
// at most NDIR; this lattice contains the optimal effects of the levels exactly.
//
// DRAWING COORDINATES. All three theories are drawn with the centre of K at the origin:
//   bit     r = p0 - p1 in [-1, 1] (the chapter's centred coordinate);  e = b + a r with
//           b = (q0+q1)/2, a = (q0-q1)/2  (substitute p0 = (1+r)/2, p1 = (1-r)/2 in e = q0 p0 + q1 p1)
//   square  (r_x, r_y);  e = b + a.r
//   qubit   the section of the qubit state ball by a coordinate plane through the centre,
//           coordinates (r_i, r_j); e = b + a.r with a in that plane
import {
  ballEffectPolar, ballNormSquared, isEffect, isState, rat, ratToNumber, req, sqrtRat, vectorEffect, ZERO,
  type BallEffect, type BallTheory, type Effect, type PolytopeTheory, type Rat, type Theory, type Vec,
} from '../../kernels/gpt';

/** steps per unit of the controls. Design choice. */
export const GRID = 20;
/** largest entry of a qubit direction vector. Design choice. */
export const NDIR = 6;

export interface EffectView { b: number; a: [number, number] }
export interface SliderDesc { key: string; min: number; max: number; value: number; text: string }

function igcd(a: number, b: number): number { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; }
/** primitive integer directions (i, j), max(|i|, |j|) <= NDIR, by increasing angle from (1, 0) */
export const DIRECTIONS: ReadonlyArray<readonly [number, number]> = (() => {
  const out: Array<[number, number]> = [];
  for (let i = -NDIR; i <= NDIR; i++) for (let j = -NDIR; j <= NDIR; j++) if ((i || j) && igcd(i, j) === 1) out.push([i, j]);
  const ang = (d: [number, number]) => { const t = Math.atan2(d[1], d[0]); return t < 0 ? t + 2 * Math.PI : t; };
  return out.sort((p, q) => ang(p) - ang(q));
})();

const g = (k: number): Rat => rat(k, GRID);

export abstract class EffectModel {
  abstract readonly theory: Theory;
  /** the exact effect, always in E(K) */
  abstract effect(): Effect;
  abstract view(): EffectView;
  abstract sliders(): SliderDesc[];
  abstract setSlider(key: string, value: number): void;
  /** arrow keys: one lattice step in the screen direction (dx, dy), y up, in the picture of K */
  abstract nudge(dx: number, dy: number): void;
  /** one lattice step of b */
  abstract nudgeB(d: number): void;
  /** drag of the gradient handle: target a in drawing coordinates, b kept */
  abstract dragA(ax: number, ay: number): void;
  /** drag of b in the picture of E(K) */
  abstract dragB(b: number): void;
  /** set to a kernel effect if it lies on the lattice; false otherwise */
  abstract setEffect(e: Effect): boolean;
  abstract state(): number[];
  abstract restore(s: readonly number[]): void;
  /** the lattice point nearest to (b, a) in drawing coordinates */
  setNear(b: number, ax: number, ay: number): void { this.dragB(b); this.dragA(ax, ay); }
  protected check(): void {
    if (!isEffect(this.theory, this.effect())) throw new Error('c02 model: the controls left E(K)');
  }
}

/** classical bit: q0 = k0/GRID, q1 = k1/GRID, the derivation's coordinates */
export class BitModel extends EffectModel {
  k0 = GRID / 2; k1 = GRID / 2;
  constructor(readonly theory: PolytopeTheory) { super(); }
  effect(): Effect { return vectorEffect([g(this.k0), g(this.k1)]); }
  view(): EffectView { return { b: (this.k0 + this.k1) / (2 * GRID), a: [(this.k0 - this.k1) / (2 * GRID), 0] }; }
  sliders(): SliderDesc[] {
    return [{ key: 'q0', min: 0, max: GRID, value: this.k0, text: '' }, { key: 'q1', min: 0, max: GRID, value: this.k1, text: '' }];
  }
  setSlider(key: string, v: number): void {
    const c = Math.max(0, Math.min(GRID, Math.round(v)));
    if (key === 'q0') this.k0 = c; else this.k1 = c;
  }
  private ok(k: number): boolean { return k >= 0 && k <= GRID; }
  /** left/right tilt the graph (right: the right end, over (1, 0), up and the left end down); up/down shift it */
  nudge(dx: number, dy: number): void {
    if (dx && this.ok(this.k0 + dx) && this.ok(this.k1 - dx)) { this.k0 += dx; this.k1 -= dx; }
    if (dy) this.nudgeB(dy);
  }
  nudgeB(d: number): void { if (this.ok(this.k0 + d) && this.ok(this.k1 + d)) { this.k0 += d; this.k1 += d; } }
  dragA(ax: number): void { const b = this.view().b; this.setBA(b, ax); }
  dragB(b: number): void { this.setBA(b, this.view().a[0]); }
  /** nearest lattice point to q0 = b + a, q1 = b - a; E(K) = [0,1]^2, so clamping each coordinate keeps it inside */
  setBA(b: number, a: number): void { this.setSlider('q0', (b + a) * GRID); this.setSlider('q1', (b - a) * GRID); }
  override setNear(b: number, ax: number): void { this.setBA(b, ax); }
  setEnd(i: 0 | 1, q: number): void { this.setSlider(i === 0 ? 'q0' : 'q1', q * GRID); }
  setEffect(e: Effect): boolean {
    if (e.kind !== 'vector') return false;
    const k = e.f.map((x) => ratToNumber(x) * GRID);
    if (!k.every((x) => Number.isInteger(x) && x >= 0 && x <= GRID)) return false;
    [this.k0, this.k1] = k;
    return true;
  }
  state(): number[] { return [this.k0, this.k1]; }
  restore(s: readonly number[]): void { [this.k0, this.k1] = s; }
}

/** square bit: (b, ax, ay) = (kb, kx, ky)/GRID with |kx| + |ky| <= min(kb, GRID - kb) */
export class SquareModel extends EffectModel {
  kb = GRID / 2; kx = 0; ky = 0;
  constructor(readonly theory: PolytopeTheory) { super(); }
  private lim(kb = this.kb): number { return Math.min(kb, GRID - kb); }
  effect(): Effect { return vectorEffect([g(this.kb), g(this.kx), g(this.ky)]); }
  view(): EffectView { return { b: this.kb / GRID, a: [this.kx / GRID, this.ky / GRID] }; }
  sliders(): SliderDesc[] {
    const h = GRID / 2;
    return [{ key: 'ax', min: -h, max: h, value: this.kx, text: '' }, { key: 'ay', min: -h, max: h, value: this.ky, text: '' }, { key: 'b', min: 0, max: GRID, value: this.kb, text: '' }];
  }
  setSlider(key: string, v: number): void {
    v = Math.round(v);
    if (key === 'b') { this.setB(v); return; }
    const other = Math.abs(key === 'ax' ? this.ky : this.kx);
    const m = Math.max(0, this.lim() - other);
    const c = Math.max(-m, Math.min(m, v));
    if (key === 'ax') this.kx = c; else this.ky = c;
  }
  /** a new b; if a no longer fits, it is shortened towards 0 (each coordinate truncated) */
  private setB(kb: number): void {
    this.kb = Math.max(0, Math.min(GRID, kb));
    const s = Math.abs(this.kx) + Math.abs(this.ky), l = this.lim();
    if (s > l) { this.kx = Math.trunc((this.kx * l) / s); this.ky = Math.trunc((this.ky * l) / s); }
  }
  nudge(dx: number, dy: number): void {
    if (Math.abs(this.kx + dx) + Math.abs(this.ky + dy) <= this.lim()) { this.kx += dx; this.ky += dy; }
  }
  nudgeB(d: number): void { this.setB(this.kb + d); }
  dragA(ax: number, ay: number): void {
    let x = ax * GRID, y = ay * GRID;
    const l = this.lim(), s = Math.abs(x) + Math.abs(y);
    if (s > l) { x = s ? (x * l) / s : 0; y = s ? (y * l) / s : 0; }
    let kx = Math.round(x), ky = Math.round(y);
    while (Math.abs(kx) + Math.abs(ky) > l) { if (Math.abs(kx) >= Math.abs(ky)) kx -= Math.sign(kx); else ky -= Math.sign(ky); }
    this.kx = kx; this.ky = ky;
  }
  dragB(b: number): void { this.setB(Math.round(b * GRID)); }
  setEffect(e: Effect): boolean {
    if (e.kind !== 'vector') return false;
    const k = e.f.map((x) => ratToNumber(x) * GRID);
    if (!k.every(Number.isInteger) || !isEffect(this.theory, e)) return false;
    [this.kb, this.kx, this.ky] = k;
    return true;
  }
  state(): number[] { return [this.kb, this.kx, this.ky]; }
  restore(s: readonly number[]): void { [this.kb, this.kx, this.ky] = s; }
}

/**
 * qubit: (b, s d/|d|), b = kb/GRID, s = ks/GRID <= min(b, 1-b), d = DIRECTIONS[dir] in the
 * section plane spanned by the coordinate axes `axes`.
 */
export class BallModel extends EffectModel {
  kb = GRID / 2; ks = 0; dir = 0;
  constructor(readonly theory: BallTheory, readonly axes: readonly [number, number]) { super(); }
  private lim(kb = this.kb): number { return Math.min(kb, GRID - kb); }
  embed(u: Rat, v: Rat): Vec {
    const r: Rat[] = Array.from({ length: this.theory.dim }, () => ZERO);
    r[this.axes[0]] = u; r[this.axes[1]] = v;
    return r;
  }
  effect(): BallEffect { const d = DIRECTIONS[this.dir]; return ballEffectPolar(g(this.kb), g(this.ks), this.embed(rat(d[0]), rat(d[1]))); }
  view(): EffectView {
    const d = DIRECTIONS[this.dir], n = Math.hypot(d[0], d[1]), s = this.ks / GRID;
    return { b: this.kb / GRID, a: [(s * d[0]) / n, (s * d[1]) / n] };
  }
  sliders(): SliderDesc[] {
    const d = DIRECTIONS[this.dir];
    return [{ key: 'dir', min: 0, max: DIRECTIONS.length - 1, value: this.dir, text: `(${d[0]}, ${d[1]})`.replace(/-/g, '−') },
      { key: 's', min: 0, max: GRID / 2, value: this.ks, text: '' }, { key: 'b', min: 0, max: GRID, value: this.kb, text: '' }];
  }
  setSlider(key: string, v: number): void {
    v = Math.round(v);
    if (key === 'dir') this.dir = ((v % DIRECTIONS.length) + DIRECTIONS.length) % DIRECTIONS.length;
    else if (key === 's') this.ks = Math.max(0, Math.min(this.lim(), v));
    else { this.kb = Math.max(0, Math.min(GRID, v)); this.ks = Math.min(this.ks, this.lim()); }
  }
  /** the neighbouring lattice point (direction +-1 or length +-1) whose displacement points most along (dx, dy) */
  nudge(dx: number, dy: number): void {
    const n = DIRECTIONS.length;
    const here = this.view().a;
    if (this.ks === 0) {
      if (this.lim() < 1) return;
      let best = 0, bc = -Infinity;
      DIRECTIONS.forEach((d, i) => { const c = (d[0] * dx + d[1] * dy) / Math.hypot(d[0], d[1]); if (c > bc + 1e-12) { bc = c; best = i; } });
      this.dir = best; this.ks = 1;
      return;
    }
    const cand: Array<[number, number]> = [[(this.dir + 1) % n, this.ks], [(this.dir + n - 1) % n, this.ks], [this.dir, this.ks - 1]];
    if (this.ks + 1 <= this.lim()) cand.push([this.dir, this.ks + 1]);
    let pick: [number, number] | null = null, bc = 1e-9;
    for (const [d, s] of cand) {
      const v = DIRECTIONS[d], l = Math.hypot(v[0], v[1]);
      const ex = (s / GRID) * (v[0] / l) - here[0], ey = (s / GRID) * (v[1] / l) - here[1];
      const len = Math.hypot(ex, ey);
      const c = len ? (ex * dx + ey * dy) / len : 0;
      if (c > bc) { bc = c; pick = [d, s]; }
    }
    if (pick) { this.dir = pick[0]; this.ks = pick[1]; }
  }
  nudgeB(d: number): void { this.setSlider('b', this.kb + d); }
  dragA(ax: number, ay: number): void {
    const r = Math.hypot(ax, ay);
    const ks = Math.min(this.lim(), Math.round(r * GRID));
    if (ks === 0 || r === 0) { this.ks = 0; return; }
    let best = 0, bc = -Infinity;
    DIRECTIONS.forEach((d, i) => { const c = (d[0] * ax + d[1] * ay) / Math.hypot(d[0], d[1]); if (c > bc) { bc = c; best = i; } });
    this.dir = best; this.ks = ks;
  }
  dragB(b: number): void { this.setSlider('b', b * GRID); }
  setEffect(e: Effect): boolean {
    if (e.kind !== 'ball' || !isEffect(this.theory, e)) return false;
    const kb = ratToNumber(e.b) * GRID;
    if (!Number.isInteger(kb)) return false;
    if (e.w.every((x) => x.n === 0n)) { this.kb = kb; this.ks = 0; return true; }
    if (e.w.some((x, i) => x.n !== 0n && i !== this.axes[0] && i !== this.axes[1])) return false;   // not in the section plane
    const { c, m } = sqrtRat(ballNormSquared(e));                     // |a| = c sqrt(m)
    const ks = ratToNumber(c) * GRID;
    if (m !== 1n || !Number.isInteger(ks)) return false;
    const u = ratToNumber(e.w[this.axes[0]]), v = ratToNumber(e.w[this.axes[1]]);
    const idx = DIRECTIONS.findIndex((d) => d[0] * v === d[1] * u && d[0] * u + d[1] * v > 0);       // parallel, same sense
    if (idx < 0) return false;
    const before = this.state();
    this.kb = kb; this.ks = ks; this.dir = idx;
    // the lattice point must be this very effect (exact comparison through the kernel)
    const mine = this.effect();
    if (!(req(mine.b, e.b) && mine.m === e.m && mine.w.every((x, i) => req(x, e.w[i])))) { this.restore(before); return false; }
    return true;
  }
  state(): number[] { return [this.kb, this.ks, this.dir]; }
  restore(s: readonly number[]): void { [this.kb, this.ks, this.dir] = s; }
}

export function makeEffectModel(t: Theory, axes: readonly [number, number] = [0, 2]): EffectModel {
  if (t.kind === 'ball') return new BallModel(t, axes);
  return t.chart === 'probability' ? new BitModel(t) : new SquareModel(t);
}

/** drawing coordinates of a state (see the header); for the qubit the state must lie in the section plane */
export function statePoint(t: Theory, x: Vec, axes: readonly [number, number] = [0, 2]): [number, number] {
  const n = x.map(ratToNumber);
  if (t.kind === 'ball') {
    if (n.some((c, i) => c !== 0 && i !== axes[0] && i !== axes[1])) throw new Error('c02 model: the state is not in the drawn section of the ball');
    return [n[axes[0]], n[axes[1]]];
  }
  return t.chart === 'probability' ? [n[0] - n[1], 0] : [n[0], n[1]];
}

/** the coordinate plane through the centre that contains both states (qubit levels) */
export function sectionFor(t: Theory, a: Vec, b: Vec): readonly [number, number] {
  if (t.kind !== 'ball') return [0, 1];
  const used = [0, 1, 2].filter((i) => a[i].n !== 0n || b[i].n !== 0n);
  if (used.length > 2) throw new Error('c02 model: the two states do not lie in a common coordinate plane');
  for (const cand of [[0, 2], [0, 1], [1, 2]] as const) if (used.every((i) => cand.includes(i as never))) return cand;
  return [0, 2];
}

/** a state of the explorer on the lattice of step 1/GRID, kept inside K */
export class StateModel {
  kx: number; ky: number;
  constructor(readonly theory: Theory, readonly axes: readonly [number, number], kx: number, ky: number) { this.kx = kx; this.ky = ky; this.clamp(); }
  /** bit: r = kx/GRID, p = ((1 + r)/2, (1 - r)/2) */
  vec(): Vec {
    const t = this.theory;
    if (t.kind === 'ball') { const r: Rat[] = Array.from({ length: t.dim }, () => ZERO); r[this.axes[0]] = g(this.kx); r[this.axes[1]] = g(this.ky); return r; }
    if (t.chart === 'probability') return [rat(GRID + this.kx, 2 * GRID), rat(GRID - this.kx, 2 * GRID)];
    return [g(this.kx), g(this.ky)];
  }
  point(): [number, number] { return statePoint(this.theory, this.vec(), this.axes); }
  private clamp(): void {
    const t = this.theory;
    this.kx = Math.max(-GRID, Math.min(GRID, Math.round(this.kx)));
    this.ky = Math.max(-GRID, Math.min(GRID, Math.round(this.ky)));
    if (t.kind === 'polytope' && t.chart === 'probability') { this.ky = 0; return; }
    if (t.kind === 'ball') while (this.kx * this.kx + this.ky * this.ky > GRID * GRID) { if (Math.abs(this.kx) >= Math.abs(this.ky)) this.kx -= Math.sign(this.kx); else this.ky -= Math.sign(this.ky); }
    if (!isState(t, this.vec())) throw new Error('c02 model: a state left K');
  }
  drag(x: number, y: number): void {
    if (this.theory.kind === 'ball') { const r = Math.hypot(x, y); if (r > 1) { x /= r; y /= r; } }
    this.kx = x * GRID; this.ky = y * GRID; this.clamp();
  }
  nudge(dx: number, dy: number): void {
    const before = [this.kx, this.ky];
    this.kx += dx; this.ky += dy;
    const t = this.theory;
    const inside = Math.abs(this.kx) <= GRID && Math.abs(this.ky) <= GRID && (t.kind !== 'ball' || this.kx * this.kx + this.ky * this.ky <= GRID * GRID);
    if (!inside) [this.kx, this.ky] = before;
    this.clamp();
  }
}
