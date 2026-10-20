// c01.demo.dichte: densities on the real line (section c01.s4, figure c01.fig.dichte,
// c01.eq.dichte, Merksatz "Eine Dichte ist keine Wahrscheinlichkeit").
//
// Three densities, one at a time:
//   Gauss       p(x) = exp(-x^2/2)/sqrt(2 pi) (c01.eq.gauss). The reader drags the endpoints a <= b;
//               the hatched area is P[[a, b]] (kernel gaussInterval). Beyond the drawn range an
//               endpoint is -infinity or +infinity. Default [1/2, 3/2], as in the figure. With
//               a = b the area, and so the probability, is 0.
//   uniform     p = 1/L on [0, L] (c01.eq.gleich has L = 1/2, height 2 > 1, area 1). The reader
//               changes L: the height 1/L can be any positive number, the area stays 1.
//               Exact (uniformHeight, uniformInterval).
//   1/x^2       the density of c01.ex.kein-mittelwert, cut off at b: the area 1 - 1/b tends to 1,
//               the integral of x p(x) = 1/x is ln b and grows without bound (c01.eq.kein-mittelwert):
//               this density has no mean (inverseSquarePartial).
// Every number shown is an input or computed by web/src/kernels/prob.ts; the floating-point
// values are rounded for display only. Clock: Gauss: the interval [a, b] slides to the right
// (its width kept); uniform: L runs between 1/12 and 2; 1/x^2: b runs from 1 to 10^6.
// Parameters: mode = gauss | uniform | inverse, a, b (Gauss), L (numerator over 12).
import type { DemoContext, DemoInstance, DemoMeta } from '../demo/types';
import {
  frac, gaussDensity, gaussInterval, inverseSquareDensity, inverseSquareMeanIntegrand, inverseSquarePartial, toNumber, uniformDensity, uniformHeight, uniformInterval, type Fraction,
} from '../kernels/prob';
import { Plate, choice, fdec, fq, it, mq, note, pointer } from './c01/kit';

export const meta: DemoMeta = { animated: true, aspect: 1.75, surface: 'plate' };

type Mode = 'gauss' | 'uniform' | 'inverse';
const MODES: Mode[] = ['gauss', 'uniform', 'inverse'];
const NPTS = 161;           // points of every drawn curve (the same number, so that curves can morph)
const NAREA = 90;           // points along the top of a hatched area
const XG = 4;               // the Gauss plot covers [-4, 4]; beyond that an endpoint is infinite
const GSTEP = 0.05;         // lattice of the Gauss endpoints
const L12 = 12;             // L is a multiple of 1/12, from 1/12 to 2
const SLIDE = 10;           // seconds for the Gauss interval to cross the plot while the clock runs
const LSWEEP = 8;           // seconds for L to run from 1/12 to 2
const BSWEEP = 12;          // seconds for b to run from 1 to 10^6 (log scale)

export function mount(stage: HTMLElement, ctx: DemoContext): DemoInstance {
  const plate = new Plate(stage, ctx);
  const T = ctx.text;
  const PR = ctx.symbol('sym.probability');
  const pW = ctx.symbol('sym.probability-weight').unicode;

  // ── state ─────────────────────────────────────────────────────
  let mode: Mode = MODES.includes(ctx.params.mode as Mode) ? (ctx.params.mode as Mode) : 'gauss';
  const snap = (v: number) => Math.round(v / GSTEP) * GSTEP;
  let ga = snap(Number(ctx.params.a ?? '0.5')), gb = snap(Number(ctx.params.b ?? '1.5'));      // slider values in [-4.05, 4.05]
  let lk = Math.min(24, Math.max(1, Number(ctx.params.L ?? '6')));                             // L = lk / 12
  let ua = 0, ub = 12;                                                                          // uniform: [a, b] in 24ths: default [0, 1/2]
  let bs = 2;                                                                                   // 1/x^2: b = 10^bs
  let cover = true;                                                                             // uniform: the interval covers all of [0, L]
  let now = 0, lastTime = -1;
  let t0 = 0;                     // the harness time of the reader's last input: the clock moves the state from there
  let hoverX: number | null = null;
  let G = { x0: 0, x1: 0, y0: 0, y1: 0, xmin: -XG, xmax: XG };
  const inf = (v: number) => (v < -XG - 1e-9 ? -Infinity : v > XG + 1e-9 ? Infinity : v);
  const fmtEnd = (v: number) => (v === -Infinity ? '−∞' : v === Infinity ? '+∞' : fdec(ctx, v, 2));
  const UMIN = -6, UMAX = 60;     // uniform endpoints in 24ths: from -1/4 to 5/2

  // clock-driven values: a function of the state at t0 and of the time dt = now - t0 since then
  const tri = (u: number) => { const r = ((u % 2) + 2) % 2; return r <= 1 ? r : 2 - r; };
  const mod = (x: number, m: number) => ((x % m) + m) % m;
  const dt = () => Math.max(0, now - t0);
  /** Gauss endpoints shown: finite endpoints slide to the right (wrapping), infinite ones stay infinite */
  const gaussAB = (): [number, number] => {
    const a = inf(ga), b = inf(gb), d = dt();
    if (d === 0) return [a, b];
    const fa = Number.isFinite(a), fb = Number.isFinite(b);
    if (fa && fb) {
      const w = b - a, span = 2 * XG - w;
      if (span <= 0) return [a, b];
      const lo = snap(-XG + mod(a + XG + (span * d) / SLIDE, span));
      return [lo, snap(lo + w)];
    }
    if (fa) return [snap(-XG + mod(a + XG + (2 * XG * d) / SLIDE, 2 * XG)), b];
    if (fb) return [a, snap(-XG + mod(b + XG + (2 * XG * d) / SLIDE, 2 * XG))];
    return [a, b];
  };
  const curL = () => (dt() === 0 ? lk : 1 + Math.round(tri((lk - 1) / 23 + dt() / LSWEEP) * 23));
  const curU = (): [number, number] => (cover ? [0, 2 * curL()] : [ua, ub]);
  const curB = () => (dt() === 0 ? bs : Math.round(mod(bs + (6 * dt()) / BSWEEP, 6) * 100) / 100);
  /** an input arrives: the state shown becomes the state at t0 = now, so that every control selects exactly its value */
  const bake = () => {
    const [a, b] = gaussAB();
    ga = a === -Infinity ? -XG - GSTEP : a; gb = b === Infinity ? XG + GSTEP : b;
    lk = curL();
    [ua, ub] = curU();
    bs = curB();
    t0 = now;
  };
  const sync = () => {
    const [a, b] = gaussAB(), [u0, u1] = curU();
    sa.set(a === -Infinity ? -XG - GSTEP : a); sb.set(b === Infinity ? XG + GSTEP : b);
    sl.set(curL()); sua.set(u0); sub.set(u1); sbx.set(curB());
  };

  // ── controls ──────────────────────────────────────────────────
  const names = [T('Gauß-Dichte', 'Gauss density'), T('gleichmäßige Dichte', 'uniform density'), T('Dichte 1/x² (ohne Mittelwert)', 'density 1/x² (no mean)')];
  choice(ctx, names, MODES.indexOf(mode), (i) => { bake(); mode = MODES[i]; hoverX = null; showSliders(); sync(); });
  const sa = ctx.ui.slider({
    label: T('linker Endpunkt a (ganz links: minus unendlich)', 'left endpoint a (far left: minus infinity)'), labelHtml: '<math><mi>a</mi></math>',
    min: -XG - GSTEP, max: XG + GSTEP, step: GSTEP, value: ga, primary: true, format: (v) => fmtEnd(inf(v)),
    onInput: (v) => { bake(); ga = snap(v); if (ga > gb) gb = ga; sync(); },
  });
  const sb = ctx.ui.slider({
    label: T('rechter Endpunkt b (ganz rechts: plus unendlich)', 'right endpoint b (far right: plus infinity)'), labelHtml: '<math><mi>b</mi></math>',
    min: -XG - GSTEP, max: XG + GSTEP, step: GSTEP, value: gb, format: (v) => fmtEnd(inf(v)),
    onInput: (v) => { bake(); gb = snap(v); if (gb < ga) ga = gb; sync(); },
  });
  const sl = ctx.ui.slider({
    label: T('Länge L des Intervalls [0, L], in Zwölfteln', 'length L of the interval [0, L], in twelfths'), labelHtml: '<math><mi>L</mi></math>',
    min: 1, max: 24, step: 1, value: lk, format: (v) => fq(frac(v, L12)),
    onInput: (v) => { bake(); lk = v; if (cover) ub = 2 * lk; sync(); },
  });
  // uniform endpoints: the same lattice (1/24) and the same order rule as dragging (a stops at b, b stops at a)
  const setU = (which: 'a' | 'b', v: number) => {
    if (which === 'a') ua = Math.max(UMIN, Math.min(v, ub)); else ub = Math.min(UMAX, Math.max(v, ua));
    cover = ua <= 0 && ub >= 2 * lk;
  };
  const sua = ctx.ui.slider({
    label: T('linker Endpunkt a, in 24steln', 'left endpoint a, in 24ths'), labelHtml: '<math><mi>a</mi></math>',
    min: UMIN, max: UMAX, step: 1, value: ua, format: (v) => fq(frac(v, 24)),
    onInput: (v) => { bake(); setU('a', v); sync(); },
  });
  const sub = ctx.ui.slider({
    label: T('rechter Endpunkt b, in 24steln', 'right endpoint b, in 24ths'), labelHtml: '<math><mi>b</mi></math>',
    min: UMIN, max: UMAX, step: 1, value: ub, format: (v) => fq(frac(v, 24)),
    onInput: (v) => { bake(); setU('b', v); sync(); },
  });
  const sbx = ctx.ui.slider({
    label: T('Abschneidepunkt b, logarithmisch: b = 10 hoch s', 'cut-off b, logarithmic: b = 10 to the s'), labelHtml: '<math><mi>b</mi></math>',
    min: 0, max: 6, step: 0.01, value: bs, format: (v) => (10 ** v).toLocaleString(ctx.lang, { maximumFractionDigits: v < 2 ? 2 : 0 }),
    onInput: (v) => { bake(); bs = v; sync(); },
  });
  // show only the sliders of the current density (the slider labels are found through their inputs)
  const inputs = () => [...(stage.parentElement?.querySelectorAll('.tpcd-controls input[type=range]') ?? [])] as HTMLInputElement[];
  const showSliders = () => {
    const [ia, ib, il, iua, iub, ibx] = inputs();
    const vis = (el: HTMLInputElement | undefined, on: boolean) => { const w = el?.closest('label'); if (w) (w as HTMLElement).style.display = on ? '' : 'none'; };
    vis(ia, mode === 'gauss'); vis(ib, mode === 'gauss'); vis(il, mode === 'uniform'); vis(iua, mode === 'uniform'); vis(iub, mode === 'uniform'); vis(ibx, mode === 'inverse');
  };
  showSliders();
  const uniformButtons = [
    ctx.ui.button(T('[0, L] ganz', 'all of [0, L]'), () => { bake(); mode = 'uniform'; ua = 0; ub = 2 * lk; cover = true; sync(); }),
  ];
  const gaussButtons = [
    ctx.ui.button(T('[0, ∞): Symmetrie', '[0, ∞): symmetry'), () => { bake(); ga = 0; gb = XG + GSTEP; sync(); }),
    ctx.ui.button(T('a = b: ein Punkt', 'a = b: one point'), () => { bake(); gb = ga = Math.max(-XG, Math.min(XG, ga)); sync(); }),
  ];
  const caption = note(ctx);
  const showButtons = () => {
    uniformButtons.forEach((b) => { b.style.display = mode === 'uniform' ? '' : 'none'; });
    gaussButtons.forEach((b) => { b.style.display = mode === 'gauss' ? '' : 'none'; });
  };

  // ── pointer: drag an endpoint (Gauss, uniform) or the cut-off (1/x^2) ─
  const xOf = (px: number) => G.xmin + ((px - G.x0) / (G.x1 - G.x0)) * (G.xmax - G.xmin);
  let grab: 'a' | 'b' | 'ua' | 'ub' | 'bx' | null = null;
  const dragging = pointer(plate.svg, {
    down: (px, py) => {
      if (px < G.x0 - plate.fs || px > G.x1 + plate.fs || py < G.y1 - plate.fs || py > G.y0 + 3 * plate.fs) return false;
      bake();
      const x = xOf(px);
      if (mode === 'gauss') { const [a, b] = [Math.max(-XG, inf(ga)), Math.min(XG, inf(gb))]; grab = Math.abs(x - a) <= Math.abs(x - b) ? 'a' : 'b'; }
      else if (mode === 'uniform') { grab = Math.abs(x - ua / 24) <= Math.abs(x - ub / 24) ? 'ua' : 'ub'; }
      else grab = 'bx';
      move(px);
      return true;
    },
    move: (px) => move(px),
    up: () => { grab = null; ctx.invalidate(); },
    hover: (px, py) => { const h = px >= G.x0 && px <= G.x1 && py >= G.y1 && py <= G.y0 ? xOf(px) : null; if (h !== hoverX) { hoverX = h; ctx.invalidate(); } },
    leave: () => { if (hoverX !== null) { hoverX = null; ctx.invalidate(); } },
  });
  const move = (px: number) => {
    const x = xOf(px);
    if (grab === 'a') { ga = snap(Math.max(-XG - GSTEP, Math.min(x, gb))); if (px < G.x0) ga = -XG - GSTEP; }
    if (grab === 'b') { gb = snap(Math.min(XG + GSTEP, Math.max(x, ga))); if (px > G.x1) gb = XG + GSTEP; }
    if (grab === 'ua') setU('a', Math.round(x * 24));
    if (grab === 'ub') setU('b', Math.round(x * 24));
    if (grab === 'bx') { bs = Math.max(0, Math.min(6, Math.log10(Math.max(1, x)))); if (x >= G.xmax) bs = Math.max(bs, Math.log10(G.xmax)); }
    t0 = now;
    sync();
    ctx.invalidate();
  };

  // ── drawing ───────────────────────────────────────────────────
  const paint = (ease: boolean) => {
    showButtons();
    const fs = plate.begin(ease);
    const k = ctx.tokens;
    const { W, H } = plate;
    const ink = k.color('plate-ink'), muted = k.color('plate-muted'), rule = k.color('plate-rule'), state = k.color('state'), effect = k.color('effect');
    const x0 = 3.0 * fs, x1 = W * 0.64, y0 = H - 3.2 * fs, y1 = 2.0 * fs;
    const L = frac(curL(), L12);
    const Lv = toNumber(L);
    const xmin = mode === 'gauss' ? -XG : mode === 'uniform' ? -0.25 : 0;
    const xmax = mode === 'gauss' ? XG : mode === 'uniform' ? Math.max(1.25, Lv + 0.35) : 10;
    const height = toNumber(uniformHeight(L));
    const ymax = mode === 'gauss' ? 0.45 : mode === 'uniform' ? Math.max(2.4, height * 1.12) : 1.12;
    G = { x0, x1, y0, y1, xmin, xmax };
    const X = (x: number) => x0 + ((x - xmin) / (xmax - xmin)) * (x1 - x0);
    const Y = (y: number) => y0 - (Math.min(y, ymax * 1.02) / ymax) * (y0 - y1);
    const dens = (x: number) => (mode === 'gauss' ? gaussDensity(x) : mode === 'uniform' ? uniformDensity(L, x) : inverseSquareDensity(x));

    // the curve: NPTS points; the uniform density has its two jumps as vertical segments
    const pts: Array<[number, number]> = [];
    if (mode === 'uniform') {
      const nL = Math.round(NPTS * 0.2), nM = NPTS - 2 * nL - 4;
      // the jumps are drawn as vertical segments: at 0 from the value just left of it, at L to the value just right of it
      const left = (x: number) => dens(x - 1e-9 * (xmax - xmin)), right = (x: number) => dens(x + 1e-9 * (xmax - xmin));
      for (let i = 0; i < nL; i++) { const x = xmin + (i / nL) * (0 - xmin); pts.push([x, dens(x)]); }
      pts.push([0, left(0)], [0, dens(0)]);
      for (let i = 0; i <= nM; i++) { const x = (i / nM) * Lv; pts.push([x, dens(x)]); }
      pts.push([Lv, dens(Lv)], [Lv, right(Lv)]);
      for (let i = 1; pts.length < NPTS; i++) { const x = Lv + (i / (NPTS - pts.length + i)) * (xmax - Lv); pts.push([x, dens(x)]); }
    } else if (mode === 'inverse') {
      const n0 = 20;
      for (let i = 0; i < n0; i++) pts.push([(i / n0) * 1, 0]);
      pts.push([1, 0]);
      for (let i = 0; pts.length < NPTS; i++) { const u = i / (NPTS - n0 - 2); pts.push([1 + u * (xmax - 1), inverseSquareDensity(1 + u * (xmax - 1))]); }
    } else {
      for (let i = 0; i < NPTS; i++) { const x = xmin + (i / (NPTS - 1)) * (xmax - xmin); pts.push([x, gaussDensity(x)]); }
    }
    // the hatched area over [lo, hi]
    let lo: number, hi: number, prob: string, probExact: Fraction | null = null;
    if (mode === 'gauss') {
      const [a, b] = gaussAB();
      lo = Math.max(xmin, a); hi = Math.min(xmax, b);
      prob = fdec(ctx, gaussInterval(a, b), 4);
    } else if (mode === 'uniform') {
      const [u0, u1] = curU();
      const a = frac(u0, 24), b = frac(u1, 24);
      lo = toNumber(a); hi = toNumber(b);
      probExact = uniformInterval(L, a, b);
      prob = fq(probExact);
    } else {
      lo = 1; hi = Math.min(xmax, 10 ** curB());
      prob = '';
    }
    const area: Array<[number, number]> = [[X(lo), Y(0)]];
    for (let i = 0; i < NAREA; i++) {
      const x = lo + (i / (NAREA - 1)) * (hi - lo);
      // the uniform density: follow its jumps inside the interval
      const xi = mode === 'uniform' && i > 0 && i < NAREA - 1 ? Math.min(Math.max(x, Math.min(Math.max(0, lo), hi)), hi) : x;
      area.push([X(xi), Y(dens(xi))]);
    }
    area.push([X(hi), Y(0)]);

    // axes
    plate.line('axis-x', x0 - 0.3 * fs, y0, x1 + 0.6 * fs, y0, ink, k.stroke('thin'));
    plate.line('axis-y', X(Math.max(0, xmin)), y0, X(Math.max(0, xmin)), y1 - 0.6 * fs, ink, k.stroke('thin'));
    plate.text('name-y', X(Math.max(0, xmin)), y1 - 1.0 * fs, `${it(pW)}(${it('x')})`, { math: true });
    plate.text('name-x', x1 + 1.2 * fs, y0, it('x'), { math: true, baseline: 'middle' });
    const xt = mode === 'gauss' ? [-3, -2, -1, 0, 1, 2, 3] : mode === 'uniform' ? [0, 1, 2].filter((v) => v <= xmax) : [0, 1, 2, 4, 6, 8];
    for (const t of xt) {
      plate.line(`xt-${mode}-${t}`, X(t), y0, X(t), y0 + 0.35 * fs, ink, k.stroke('thin'));
      plate.text(`xtl-${mode}-${t}`, X(t), y0 + 1.25 * fs, String(t).replace('-', '−'), { fill: muted, size: fs * 0.9 });
    }
    const yt = mode === 'gauss' ? [0.1, 0.2, 0.3, 0.4] : mode === 'uniform' ? [1, 2, ...(height > 2.5 ? [Math.round(height)] : [])] : [0.5, 1];
    for (const t of yt) {
      plate.line(`yg-${mode}-${t}`, x0, Y(t), x1, Y(t), t === 1 && mode === 'uniform' ? muted : rule, k.stroke(t === 1 && mode === 'uniform' ? 'thin' : 'hair'), t === 1 && mode === 'uniform' ? { 'stroke-dasharray': '3 3' } : {});
      plate.text(`ytl-${mode}-${t}`, x0 - 0.5 * fs, Y(t), Number.isInteger(t) ? String(t) : fdec(ctx, t, 1), { anchor: 'end', baseline: 'middle', fill: muted, size: fs * 0.9 });
    }

    // the area, the curve, and for 1/x^2 the integrand x p(x) = 1/x of the mean (dashed: it belongs to the measurement x)
    plate.path('area', area, { fill: plate.hatchFill, stroke: k.color('bath-edge'), 'stroke-width': k.stroke('thin') }, 'data', true);
    plate.path('curve', pts.map(([x, y]) => [X(x), Y(y)]), { stroke: state, 'stroke-width': k.stroke('state'), 'stroke-linejoin': 'round' }, 'marks');
    if (mode === 'inverse') {
      const m: Array<[number, number]> = [];
      for (let i = 0; i < NPTS; i++) { const x = 1 + (i / (NPTS - 1)) * (xmax - 1); m.push([X(x), Y(inverseSquareMeanIntegrand(x))]); }
      plate.path('mean-curve', m, { stroke: effect, 'stroke-width': k.stroke('effect'), 'stroke-dasharray': k.dash('effect').join(' ') }, 'marks');
      plate.text('mean-name', X(5.2), Y(inverseSquareMeanIntegrand(5.2)) - 0.9 * fs, `${it('x')} ${it(pW)}(${it('x')}) = 1/${it('x')}`, { math: true, fill: effect, anchor: 'start' });
      plate.text('p-name', X(2.1), Y(inverseSquareDensity(2.1)) - 0.5 * fs, `${it(pW)}(${it('x')}) = 1/${it('x')}²`, { math: true, fill: state, anchor: 'start' });
    }
    // endpoint handles: leaders and knobs on the axis
    const handle = (key: string, x: number, label: string, infinite: number) => {
      const cx = infinite < 0 ? x0 - 0.2 * fs : infinite > 0 ? x1 + 0.2 * fs : X(x);
      plate.line(`lead-${key}`, cx, y0, cx, infinite ? y0 : Y(dens(x)), ink, k.stroke('thin'), { 'stroke-dasharray': '2 2' }, 'marks');
      plate.path(`knob-${key}`, [[cx, y0 + 0.15 * fs], [cx - 0.55 * fs, y0 + 1.0 * fs], [cx + 0.55 * fs, y0 + 1.0 * fs]], { fill: ink, class: 'c01-grab' }, 'handles', true);
      plate.text(`knob-l-${key}`, cx, y0 + 2.2 * fs, label, { math: true, weight: '600' });
    };
    if (mode === 'gauss') {
      const [a, b] = gaussAB();
      handle('a', Math.max(xmin, a), a === -Infinity ? `${it('a')} = −∞` : it('a'), a === -Infinity ? -1 : 0);
      handle('b', Math.min(xmax, b), b === Infinity ? `${it('b')} = +∞` : it('b'), b === Infinity ? 1 : 0);
    } else if (mode === 'uniform') {
      const [u0, u1] = curU();
      handle('a', u0 / 24, it('a'), 0);
      handle('b', u1 / 24, it('b'), 0);
    } else {
      const b = 10 ** curB();
      handle('b', Math.min(xmax, b), b > xmax ? `${it('b')} →` : it('b'), b > xmax ? 1 : 0);
    }

    // the side panel: what the area is
    const px = W * 0.69, pr = W - 0.8 * fs;
    const big = fs * 1.35;
    let ty = y1 + 0.6 * fs;
    const line = (key: string, s: string, o: { size?: number; fill?: string; math?: boolean; weight?: string } = {}) => {
      plate.text(key, px, ty, s, { anchor: 'start', size: o.size ?? fs, fill: o.fill ?? ink, math: o.math, weight: o.weight });
      ty += (o.size ?? fs) * 1.45;
    };
    if (mode === 'gauss') {
      const [a, b] = gaussAB();
      line('s1', T('Fläche über [a, b]:', 'area over [a, b]:'), { fill: muted });
      line('s2', `${PR.unicode}[[${fmtEnd(a)}, ${fmtEnd(b)}]]`, { math: true });
      line('s3', `= ${prob}`, { size: big, weight: '600' });
      ty += 0.4 * fs;
      line('s4', a === b ? T('ein Punkt: Wahrscheinlichkeit 0', 'one point: probability 0') : a === 0 && b === Infinity ? T('½, aus Symmetrie', '½, by symmetry') : T('auf 4 Stellen gerundet', 'rounded to 4 places'), { fill: muted, size: fs * 0.9 });
      line('s5', T('Fläche unter der ganzen Kurve:', 'area under the whole curve:'), { fill: muted, size: fs * 0.9 });
      line('s6', `${fdec(ctx, gaussInterval(-Infinity, Infinity), 4)}`, { size: fs * 0.9 });
    } else if (mode === 'uniform') {
      line('s1', T('Höhe 1/L:', 'height 1/L:'), { fill: muted });
      line('s2', `${it(pW)}(${it('x')}) = ${fq(uniformHeight(L))}`, { size: big, weight: '600', math: true });
      line('s3', T('Fläche über [a, b]:', 'area over [a, b]:'), { fill: muted });
      line('s4', `${PR.unicode}[[${fq(frac(curU()[0], 24))}, ${fq(frac(curU()[1], 24))}]] = ${prob}`, { math: true });
      ty += 0.3 * fs;
      line('s5', height > 1 ? T('Die Höhe ist größer als 1,', 'The height exceeds 1,') : T('Höhe mal Breite:', 'height times width:'), { fill: muted, size: fs * 0.9 });
      line('s6', `${fq(uniformHeight(L))} · ${fq(L)} = ${fq(uniformInterval(L, frac(-1), frac(100)))}`, { size: fs * 0.95 });
    } else {
      const b = 10 ** curB();
      const r = inverseSquarePartial(b);
      const fmtB = b.toLocaleString(ctx.lang, { maximumFractionDigits: b < 100 ? 2 : 0 });
      line('s1', `${it('b')} = ${fmtB}`, { math: true, weight: '600' });
      line('s2', T('Fläche ∫₁ᵇ p dx = 1 − 1/b', 'area ∫₁ᵇ p dx = 1 − 1/b'), { fill: muted, size: fs * 0.9 });
      line('s3', fdec(ctx, r.mass, 6), { size: big, fill: state, weight: '600' });
      // gauge: tends to 1
      const gw = pr - px;
      plate.rect('g1-back', px, ty - 0.6 * fs, gw, 0.7 * fs, { fill: 'transparent', stroke: rule, 'stroke-width': k.stroke('thin') }, 'grid');
      plate.rect('g1', px, ty - 0.6 * fs, gw * r.mass, 0.7 * fs, { fill: state, 'fill-opacity': 0.35, stroke: state, 'stroke-width': k.stroke('thin') });
      plate.text('g1-1', px + gw, ty + 0.75 * fs, '1', { anchor: 'end', size: fs * 0.8, fill: muted });
      ty += 1.9 * fs;
      line('s4', T('∫₁ᵇ x p dx = ln b', '∫₁ᵇ x p dx = ln b'), { fill: muted, size: fs * 0.9 });
      line('s5', fdec(ctx, r.mean, 3), { size: big, fill: effect, weight: '600' });
      // gauge: grows without bound (scale up to ln 10^6)
      const gmax = inverseSquarePartial(1e6).mean;
      plate.rect('g2-back', px, ty - 0.6 * fs, gw, 0.7 * fs, { fill: 'transparent', stroke: rule, 'stroke-width': k.stroke('thin'), 'stroke-dasharray': '3 2' }, 'grid');
      plate.rect('g2', px, ty - 0.6 * fs, gw * (r.mean / gmax), 0.7 * fs, { fill: effect, 'fill-opacity': 0.3, stroke: effect, 'stroke-width': k.stroke('thin') });
      for (const t of [5, 10]) {
        plate.line(`g2-t${t}`, px + gw * (t / gmax), ty - 0.75 * fs, px + gw * (t / gmax), ty + 0.25 * fs, muted, k.stroke('thin'), {}, 'marks');
        plate.text(`g2-l${t}`, px + gw * (t / gmax), ty + 0.95 * fs, String(t), { size: fs * 0.8, fill: muted });
      }
      plate.text('g2-1', px + gw, ty + 2.1 * fs, T('ohne Schranke für b → ∞', 'unbounded as b → ∞'), { anchor: 'end', size: fs * 0.8, fill: muted });
    }
    // hover: the height of the density at x, which is not a probability
    if (hoverX !== null && !dragging()) {
      const h = dens(hoverX);
      plate.circle('hover-dot', X(hoverX), Y(h), 0.3 * fs, { fill: state }, 'hover', false);
      plate.tip(X(hoverX), Y(h), [`${pW}(${fdec(ctx, hoverX, 2)}) = ${fdec(ctx, h, 3)}`, T('eine Dichte, keine Wahrscheinlichkeit', 'a density, not a probability')]);
    }
    plate.end();

    caption.innerHTML = mode === 'gauss'
      ? T(`Ziehen Sie die Endpunkte <math><mi>a</mi></math> und <math><mi>b</mi></math>. Die Wahrscheinlichkeit ist die schraffierte Fläche, nicht die Höhe der Kurve; für <math><mi>a</mi><mo>=</mo><mi>b</mi></math> ist sie 0. Ganz außen ist ein Endpunkt unendlich.`,
        `Drag the endpoints <math><mi>a</mi></math> and <math><mi>b</mi></math>. The probability is the hatched area, not the height of the curve; for <math><mi>a</mi><mo>=</mo><mi>b</mi></math> it is 0. At the far ends an endpoint is infinite.`)
      : mode === 'uniform'
        ? T(`Ändern Sie <math><mi>L</mi></math>: Die Höhe ${mq(uniformHeight(L))} wird beliebig groß, die Fläche bleibt 1. Bei <math><mi>L</mi><mo>=</mo><mfrac><mn>1</mn><mn>2</mn></mfrac></math> ist das Gleichung (c01.eq.gleich).`,
          `Change <math><mi>L</mi></math>: the height ${mq(uniformHeight(L))} becomes as large as you like, the area stays 1. At <math><mi>L</mi><mo>=</mo><mfrac><mn>1</mn><mn>2</mn></mfrac></math> this is equation (c01.eq.gleich).`)
        : T('Verschieben Sie den Abschneidepunkt b. Die Fläche unter p strebt gegen 1, die unter x p(x) wächst wie ln b über jede Schranke: Diese Präparation hat keinen Mittelwert.',
          'Move the cut-off b. The area under p tends to 1, the one under x p(x) grows like ln b beyond every bound: this preparation has no mean.');
    void probExact;
  };

  return {
    render(_frame, time) {
      const clock = time !== lastTime && lastTime >= 0;
      lastTime = time; now = time;
      if (dt() > 0) sync();            // the controls show what is drawn
      paint(!ctx.deterministic && !ctx.reducedMotion && !dragging() && !clock);
    },
    destroy() { plate.svg.remove(); },
    info: () => {
      const [a, b] = gaussAB();
      const [u0, u1] = curU();
      return { mode, a: fmtEnd(a), b: fmtEnd(b), probability: gaussInterval(a, b), L: `${curL()}/${L12}`, uniformInterval: `${u0}/24,${u1}/24`, cutoff: 10 ** curB() };
    },
  };
}
