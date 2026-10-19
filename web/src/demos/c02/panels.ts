// The two 2D pictures of the C2 demos, as SVG on the plate:
//   KPanel  the state space K with states and an effect f drawn as an affine function
//           (bit: its graph over the segment; square and qubit section: its level lines)
//   EPanel  the effect set E(K) with e as a point (bit: the square [0,1]^2 standing on the
//           corner 0; square bit: the double pyramid; qubit section: the double cone)
// Geometry comes from the formulas of evidence/derivations/c02/DERIVATION.md sections
// 3.2 to 3.5, in the drawing coordinates of model.ts. The pictures hold no state of their
// own: draw(scene) is a function of the scene. Colour: state and effect roles only.
import type { Theory } from '../../kernels/gpt';
import type { EffectView } from './model';
import { circle, clipLine, diamond, el, line, m, poly, sub, text, type Part } from './svg';

export interface Marker {
  p: [number, number];
  label: Part[];
  style: 'filled' | 'open' | 'small';
  /** handle id if the reader can move it */
  handle?: string;
  aria?: string;
}
export interface KScene {
  theory: Theory;
  effect: EffectView;
  /** a second effect drawn in thin solid lines (the optimal effect after the commit) */
  ghost: EffectView | null;
  states: Marker[];
  segment: [[number, number], [number, number]] | null;
  axisNames: [Part[], Part[]];
  /** the effect can be moved here */
  live: boolean;
  aria: { a: string; q0: string; q1: string };
  /** names of the pure states of the bit, left and right */
  ends: [string, string];
}
export interface ExtremeMark { b: number; a: [number, number]; state: 'plain' | 'found' | 'optimal'; id: number; aria?: string }
export interface EScene {
  theory: Theory;
  effect: EffectView;
  extremes: ExtremeMark[];
  /** a face of optimal effects between two extreme points (tie) */
  optimalEdge: [ExtremeMark, ExtremeMark] | null;
  live: boolean;
  aria: string;
  unitLabel: Part[];
  /** labels of the two side vertices of the bit's square, and of the axes otherwise */
  sideLabels: [Part[], Part[]];
}

type DragFn = (handle: string, x: number, y: number) => void;

abstract class Panel {
  readonly svg: SVGSVGElement;
  protected readonly deco: SVGGElement;
  protected readonly handles = new Map<string, SVGGElement>();
  protected W = 320;
  constructor(host: HTMLElement, protected readonly onDrag: DragFn, label: string) {
    this.svg = el('svg', { role: 'group', 'aria-label': label });
    this.deco = el('g', { 'aria-hidden': 'true' });
    this.svg.append(this.deco);
    host.append(this.svg);
  }
  protected abstract toWorld(px: number, py: number, handle: string): [number, number];
  protected size(): void {
    const w = this.svg.clientWidth;
    this.W = w > 0 ? w : 320;
    this.svg.setAttribute('viewBox', `0 0 ${this.W} ${this.W}`);
  }
  /** a focusable, draggable handle; its marker is drawn by `inner` */
  protected handle(id: string, x: number, y: number, inner: string, aria: string, live: boolean): void {
    let h = this.handles.get(id);
    if (!h) {
      const g = el('g', { class: 'c02-h', 'data-handle': id, role: 'application' });
      g.addEventListener('pointerdown', (ev) => {
        if (g.getAttribute('aria-disabled') === 'true') return;
        g.setPointerCapture(ev.pointerId);
        g.focus({ preventScroll: true });
        ev.preventDefault();
      });
      g.addEventListener('pointermove', (ev) => {
        if (!g.hasPointerCapture(ev.pointerId)) return;
        const r = this.svg.getBoundingClientRect();
        const [wx, wy] = this.toWorld(((ev.clientX - r.left) * this.W) / r.width, ((ev.clientY - r.top) * this.W) / r.height, id);
        this.onDrag(id, wx, wy);
      });
      this.svg.append(g);
      this.handles.set(id, g);
      h = g;
    }
    h.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
    h.setAttribute('aria-label', aria);
    h.setAttribute('aria-disabled', String(!live));
    if (live) h.setAttribute('tabindex', '0'); else h.removeAttribute('tabindex');
    h.style.cursor = live ? '' : 'default';
    h.innerHTML = `<circle r="17" class="hit"/>${inner}`;
    h.dataset.used = '1';
  }
  protected begin(): void { this.size(); for (const h of this.handles.values()) delete h.dataset.used; }
  protected end(html: string): void {
    this.deco.innerHTML = html;
    for (const [id, h] of this.handles) if (!h.dataset.used) { h.remove(); this.handles.delete(id); }
  }
}

const VALUES = [0, 0.25, 0.5, 0.75, 1];

export class KPanel extends Panel {
  private bit = false;
  private get S(): number { return this.W / 3.3; }
  private X(x: number): number { return this.W / 2 + x * this.S; }
  private Y(y: number): number { return this.W / 2 - y * this.S; }
  // bit: the segment K at height yK, the graph of e between the heights of the values 0 and 1
  private get yK(): number { return this.W * 0.84; }
  private V(v: number): number { return this.W * (0.66 - 0.5 * v); }

  protected toWorld(px: number, py: number, handle: string): [number, number] {
    if (this.bit) return handle === 'q0' || handle === 'q1' ? [0, (0.66 - py / this.W) / 0.5] : [(px - this.W / 2) / this.S, 0];
    const x = (px - this.W / 2) / this.S, y = (this.W / 2 - py) / this.S;
    return handle === 'a' ? [x / 2, y / 2] : [x, y];       // the gradient handle sits at 2a
  }

  draw(sc: KScene): void {
    this.begin();
    this.bit = sc.theory.kind === 'polytope' && sc.theory.chart === 'probability';
    this.end(this.bit ? this.drawBit(sc) : this.drawPlane(sc));
  }

  private stateMarker(mk: Marker, x: number, y: number): string {
    return mk.style === 'filled' ? circle(x, y, 5.5, 's-pt') : mk.style === 'open' ? circle(x, y, 5, 's-open') : circle(x, y, 3.2, 's-pt');
  }

  private drawBit(sc: KScene): string {
    const { b, a } = sc.effect;
    const q1 = b - a[0], q0 = b + a[0];      // q0 = e(1, 0) at r = +1 (right), q1 = e(0, 1) at r = -1 (left)
    const xl = this.X(-1), xr = this.X(1);
    let s = '';
    for (const v of [0, 0.5, 1]) s += line(xl, this.V(v), xr, this.V(v), 'rule');
    s += line(xl, this.V(0), xl, this.V(1), 'rule') + line(xr, this.V(0), xr, this.V(1), 'rule');
    s += text(xl - 12, this.V(0) + 4, '0', { anchor: 'end', cls: 'mu' }) + text(xl - 12, this.V(0.5) + 4, '1/2', { anchor: 'end', cls: 'mu' }) + text(xl - 12, this.V(1) + 4, '1', { anchor: 'end', cls: 'mu' });
    s += line(xl, this.yK, xr, this.yK, 'ink-heavy') + circle(xl, this.yK, 3.6, 'dot') + circle(xr, this.yK, 3.6, 'dot');
    s += text(xl, this.yK + 30, sc.ends[0], { anchor: 'middle', cls: 'mu' }) + text(xr, this.yK + 30, sc.ends[1], { anchor: 'middle', cls: 'mu' });
    s += text(this.X(0), this.yK + 30, [m('K')], { anchor: 'middle' });
    if (sc.ghost && Math.abs(sc.ghost.b - b) + Math.abs(sc.ghost.a[0] - a[0]) > 1e-9) {
      const gl = sc.ghost.b - sc.ghost.a[0], gr = sc.ghost.b + sc.ghost.a[0];
      s += line(xl, this.V(gl), xr, this.V(gr), 'e-star');
      s += text(this.X(0.5), this.V((gl + 3 * gr) / 4) - 8, [m('f'), '*'], { anchor: 'middle', cls: 'ef' });
    }
    s += line(xl, this.V(q1), xr, this.V(q0), 'e-line');
    if (sc.segment) s += line(this.X(sc.segment[0][0]), this.yK, this.X(sc.segment[1][0]), this.yK, 's-line');
    for (const mk of sc.states) {
      const x = this.X(mk.p[0]), v = b + a[0] * mk.p[0];
      s += line(x, this.yK, x, this.V(v), 's-hair') + circle(x, this.V(v), 2.6, 's-pt');
      if (mk.handle) this.handle(mk.handle, x, this.yK, this.stateMarker(mk, 0, 0), mk.aria ?? '', true);
      else s += this.stateMarker(mk, x, this.yK);
      if (mk.label.length) s += text(x, this.yK - 11, mk.label, { anchor: 'middle', cls: 'st' });
    }
    this.handle('q1', xl, this.V(q1), diamond(0, 0, 7, 'e-pt'), sc.aria.q1, sc.live);
    this.handle('q0', xr, this.V(q0), diamond(0, 0, 7, 'e-pt'), sc.aria.q0, sc.live);
    s += text(xr + 10, this.V(q0) + 4, [m('f')], { cls: 'ef' });
    return s;
  }

  /** the level line {b + a.r = c}, clipped to the window; null if a = 0 or it misses the window */
  private level(v: EffectView, c: number): [[number, number], [number, number]] | null {
    const n2 = v.a[0] * v.a[0] + v.a[1] * v.a[1];
    if (n2 < 1e-12) return null;
    const k = (c - v.b) / n2;
    return clipLine([v.a[0] * k, v.a[1] * k], [-v.a[1], v.a[0]], -1.58, 1.58, -1.58, 1.58);
  }
  private levelLine(v: EffectView, c: number, cls: string, label: Part[] | null, upper = true): string {
    const seg = this.level(v, c);
    if (!seg) return '';
    let s = line(this.X(seg[0][0]), this.Y(seg[0][1]), this.X(seg[1][0]), this.Y(seg[1][1]), cls);
    if (label) {
      // at the upper end, pulled back along the line and set off towards larger e
      const first = seg[0][1] > seg[1][1] + 1e-9 || (Math.abs(seg[0][1] - seg[1][1]) <= 1e-9 && seg[0][0] < seg[1][0]);
      const [p, q] = first === upper ? [seg[0], seg[1]] : [seg[1], seg[0]];
      const dl = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
      const na = Math.hypot(v.a[0], v.a[1]);
      const side = c > 0.5 ? 1 : -1;
      const x = this.X(p[0] + ((q[0] - p[0]) / dl) * 0.2 + (side * v.a[0] * 0.13) / na);
      const y = this.Y(p[1] + ((q[1] - p[1]) / dl) * 0.2 + (side * v.a[1] * 0.13) / na);
      s += text(Math.max(22, Math.min(this.W - 22, x)), Math.max(14, Math.min(this.W - 6, y + 4)), label, { anchor: 'middle', cls: 'ef' });
    }
    return s;
  }

  private drawPlane(sc: KScene): string {
    const ball = sc.theory.kind === 'ball';
    let s = '';
    s += ball ? circle(this.X(0), this.Y(0), this.S, 'k-body') : poly([[this.X(-1), this.Y(-1)], [this.X(1), this.Y(-1)], [this.X(1), this.Y(1)], [this.X(-1), this.Y(1)]], 'k-body');
    s += line(this.X(-1.22), this.Y(0), this.X(1.22), this.Y(0), 'rule') + line(this.X(0), this.Y(-1.22), this.X(0), this.Y(1.22), 'rule');
    s += text(this.X(1.24), this.Y(0) + 15, sc.axisNames[0], { anchor: 'end', cls: 'mu' }) + text(this.X(0) - 6, this.Y(1.24) + 9, sc.axisNames[1], { anchor: 'end', cls: 'mu' });
    if (!ball) for (const [x, y] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) s += circle(this.X(x), this.Y(y), 3.2, 'dot');
    s += text(this.X(-1) + 7, this.Y(-1) - 8, [m('K')]);
    const same = (g: EffectView) => Math.abs(g.b - sc.effect.b) + Math.abs(g.a[0] - sc.effect.a[0]) + Math.abs(g.a[1] - sc.effect.a[1]) < 1e-9;
    if (sc.ghost && !same(sc.ghost)) {
      // the second effect: thin solid lines, labelled at the lower ends (the reader's effect is labelled at the upper ends)
      s += this.levelLine(sc.ghost, 0, 'e-star', [m('f'), '* = 0'], false) + this.levelLine(sc.ghost, 1, 'e-star', [m('f'), '* = 1'], false);
      const gx = this.X(2 * sc.ghost.a[0]), gy = this.Y(2 * sc.ghost.a[1]);
      s += line(this.X(0), this.Y(0), gx, gy, 'e-star') + diamond(gx, gy, 5.5, 'e-open');
    }
    for (const c of VALUES) {
      const main = c === 0 || c === 1;
      s += this.levelLine(sc.effect, c, main ? 'e-line' : 'e-hair', main ? [m('f'), ` = ${c}`] : null);
    }
    if (sc.segment) s += line(this.X(sc.segment[0][0]), this.Y(sc.segment[0][1]), this.X(sc.segment[1][0]), this.Y(sc.segment[1][1]), 's-line');
    const tx = this.X(2 * sc.effect.a[0]), ty = this.Y(2 * sc.effect.a[1]);
    s += line(this.X(0), this.Y(0), tx, ty, 'e-star');
    for (const mk of sc.states) {
      const x = this.X(mk.p[0]), y = this.Y(mk.p[1]);
      if (mk.handle) this.handle(mk.handle, x, y, this.stateMarker(mk, 0, 0), mk.aria ?? '', true);
      else s += this.stateMarker(mk, x, y);
      if (mk.label.length) {
        const r = Math.hypot(mk.p[0], mk.p[1]);
        let ux = r > 0.05 ? mk.p[0] / r : 0.7, uy = r > 0.05 ? mk.p[1] / r : 0.7, dist = 17;
        // A state far out on a positive axis would put its label on the axis name (the name
        // of the first axis stands below its positive end, that of the second to the left
        // of its positive end). Turn the label away from the name: up and outward on the
        // first axis, to the right on the second. Layout only; the two bounds and the two
        // angles are unvalidated layout choices.
        const NEAR_AXIS = 0.2, FAR_OUT = 0.75;
        if (mk.p[0] > FAR_OUT && Math.abs(mk.p[1]) < NEAR_AXIS) { ux = Math.cos(55 * Math.PI / 180); uy = Math.sin(55 * Math.PI / 180); dist = 19; }
        else if (mk.p[1] > FAR_OUT && Math.abs(mk.p[0]) < NEAR_AXIS) { ux = Math.cos(30 * Math.PI / 180); uy = Math.sin(30 * Math.PI / 180); dist = 19; }
        s += text(x + ux * dist, y - uy * dist + 4, mk.label, { anchor: 'middle', cls: 'st' });
      }
    }
    this.handle('a', tx, ty, diamond(0, 0, 7, 'e-pt'), sc.aria.a, sc.live);
    return s;
  }
}

// oblique projection of (b; a_x, a_y): a drawing choice without mathematical meaning
const KX = 0.45 * Math.cos((35 * Math.PI) / 180), KY = 0.45 * Math.sin((35 * Math.PI) / 180);

export class EPanel extends Panel {
  private flat = false;
  private get S(): number { return this.W / 1.6; }
  private P(b: number, a: readonly [number, number]): [number, number] {
    const x = this.flat ? a[0] : a[0] + KX * a[1], y = this.flat ? b : b + KY * a[1];
    return [this.W / 2 + x * this.S, this.W * 0.87 - y * this.S];
  }
  protected toWorld(px: number, py: number): [number, number] {
    return [(px - this.W / 2) / this.S, (this.W * 0.87 - py) / this.S];
  }

  draw(sc: EScene, onPick: (id: number) => void): void {
    this.begin();
    const t = sc.theory;
    this.flat = t.kind === 'polytope' && t.chart === 'probability';
    const { b, a } = sc.effect;
    const lim = Math.min(b, 1 - b);
    const O = this.P(0, [0, 0]), U = this.P(1, [0, 0]);
    let s = '';
    const ring = (r: number): Array<[number, number]> => {
      const pts: Array<[number, number]> = [];
      for (let i = 0; i < 96; i++) { const th = (2 * Math.PI * i) / 96; pts.push(this.P(0.5, [r * Math.cos(th), r * Math.sin(th)])); }
      return pts;
    };
    if (this.flat) {
      const L = this.P(0.5, [-0.5, 0]), R = this.P(0.5, [0.5, 0]);
      s += poly([O, R, U, L], 'k-body');
      s += line(O[0], O[1], U[0], U[1], 'rule');
      s += line(...this.P(b, [-lim, 0]), ...this.P(b, [lim, 0]), 'e-sec');
      s += text(L[0] - 9, L[1] + 4, sc.sideLabels[0], { anchor: 'end', cls: 'mu' }) + text(R[0] + 9, R[1] + 4, sc.sideLabels[1], { cls: 'mu' });
    } else if (t.kind === 'polytope') {
      const Xp = this.P(0.5, [0.5, 0]), Xm = this.P(0.5, [-0.5, 0]), Yp = this.P(0.5, [0, 0.5]), Ym = this.P(0.5, [0, -0.5]);
      s += poly([O, Xp, U, Xm], 'face');
      for (const p of [O, U]) s += line(p[0], p[1], Yp[0], Yp[1], 'thin');                    // edges to the far vertex
      s += line(Xp[0], Xp[1], Yp[0], Yp[1], 'thin') + line(Xm[0], Xm[1], Yp[0], Yp[1], 'thin');
      s += line(O[0], O[1], U[0], U[1], 'rule');
      for (const p of [O, U]) for (const q of [Xp, Xm, Ym]) s += line(p[0], p[1], q[0], q[1], 'ink');
      s += line(Xp[0], Xp[1], Ym[0], Ym[1], 'ink') + line(Xm[0], Xm[1], Ym[0], Ym[1], 'ink');
      s += poly([this.P(b, [lim, 0]), this.P(b, [0, lim]), this.P(b, [-lim, 0]), this.P(b, [0, -lim])], 'e-sec');
      s += text(Xp[0] + 12, Xp[1] + 4, sc.sideLabels[0], { cls: 'mu' }) + text(Yp[0] + 12, Yp[1] - 6, sc.sideLabels[1], { cls: 'mu' });
    } else {
      const eq = ring(0.5);
      // the outline: from each apex the two lines that touch the equator ellipse
      const tangents = (apex: [number, number]): Array<[number, number]> => {
        let lo = eq[0], hi = eq[0], alo = Infinity, ahi = -Infinity;
        for (const p of eq) { const an = Math.atan2(Math.abs(p[1] - apex[1]), p[0] - apex[0]); if (an < alo) { alo = an; lo = p; } if (an > ahi) { ahi = an; hi = p; } }
        return [lo, hi];
      };
      const tO = tangents(O), tU = tangents(U);
      s += poly([O, tO[0], tO[1]], 'face') + poly([U, tU[0], tU[1]], 'face') + poly(eq, 'face');
      s += line(O[0], O[1], U[0], U[1], 'rule');
      for (const p of tO) s += line(O[0], O[1], p[0], p[1], 'ink');
      for (const p of tU) s += line(U[0], U[1], p[0], p[1], 'ink');
      s += poly(eq, 'ink');
      if (lim > 1e-9) { const sec: Array<[number, number]> = []; for (let i = 0; i < 96; i++) { const th = (2 * Math.PI * i) / 96; sec.push(this.P(b, [lim * Math.cos(th), lim * Math.sin(th)])); } s += poly(sec, 'e-sec'); }
      const Xp = this.P(0.5, [0.5, 0]), Yp = this.P(0.5, [0, 0.5]);
      s += text(Xp[0] + 12, Xp[1] + 4, sc.sideLabels[0], { cls: 'mu' }) + text(Yp[0] + 12, Yp[1] - 8, sc.sideLabels[1], { cls: 'mu' });
    }
    s += text(O[0], O[1] + 19, '0', { anchor: 'middle' }) + text(U[0], U[1] - 11, sc.unitLabel, { anchor: 'middle' });
    if (sc.optimalEdge) { const p = this.P(sc.optimalEdge[0].b, sc.optimalEdge[0].a), q = this.P(sc.optimalEdge[1].b, sc.optimalEdge[1].a); s += line(p[0], p[1], q[0], q[1], 'ink-heavy'); }
    // the stem of e: from the axis to e inside its cross-section
    const E = this.P(b, a), A = this.P(b, [0, 0]);
    s += line(A[0], A[1], E[0], E[1], 'e-sec');
    this.end(s);
    // extreme points (clickable when found), then the point e on top
    this.svg.querySelectorAll('.c02-x').forEach((n) => n.remove());
    for (const x of sc.extremes) {
      const p = this.P(x.b, x.a);
      const g = el('g', { class: 'c02-x', transform: `translate(${p[0].toFixed(2)} ${p[1].toFixed(2)})`, 'data-extreme': x.id, 'data-state': x.state });
      g.innerHTML = (x.state === 'optimal' ? circle(0, 0, 9.5, 'opt') : '') + circle(0, 0, 3.6, x.state === 'plain' ? 'ring' : 'dot') + (x.state === 'plain' ? '' : '<circle r="12" class="hit"/>');
      if (x.state === 'plain') g.style.cursor = 'default'; else g.addEventListener('click', () => onPick(x.id));
      this.svg.insertBefore(g, this.deco.nextSibling);
    }
    this.handle('e', E[0], E[1], diamond(0, 0, 7.5, 'e-pt'), sc.aria, sc.live);
    this.svg.append(this.handles.get('e')!);
  }
  /** drag in this picture: the bit's square is two-dimensional (b and a); otherwise the height b */
  get twoDimensional(): boolean { return this.flat; }
}

export const UNIT_LABEL: Part[] = ['1', sub('K')];
