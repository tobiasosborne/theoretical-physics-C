// c00.demo.planck: the radiation law and its limiting form (figure c00.fig.planck).
// (a) u/u_0 against s = h nu/(k_B T_0) for a temperature T chosen with the slider, over the
// three curves of the figure (T_0, 5/6 T_0, 2/3 T_0) and with the limiting form u_kl for T;
// the maximum of u is marked. (b) the ratio u/u_kl = x/(exp(x) - 1) against x = h nu/(k_B T),
// with an optional pair of bounds (c00.eq.schranken). A frequency cursor, dragged on either
// panel, links the two: the same nu sits at s in (a) and at x = s T_0/T in (b), so moving T
// slides the point along the one curve of (b). Play sweeps T. 2D, SVG on the plate.
//
// Every number shown is an input (T, the cursor, T_0) or is computed by
// web/src/kernels/planck.ts. u_kl is called the limiting form, as in the chapter; the
// chapter does not call it the classical prediction (GAP-TJO G-0024 in de.tex), so neither
// does this demo.
import type { DemoContext, DemoInstance, DemoMeta } from '../demo/types';
import {
  exponentX, frequencyOfS, limitingForm, lowerBound, PEAK_X, peakFrequency, ratio, reducedPeak, reducedU, reducedUkl,
  spectralDensity, upperBound,
} from '../kernels/planck';
import { ensureStyle, fix, noteBelow, onDrag, pen, sci, stageSvg, svgEl, toggle } from './c00/common';

export const meta: DemoMeta = { animated: true, aspect: 1.9, surface: 'plate' };

const SMAX = 7.2, YMAX = 2.1;           // panel (a) window: the figure's
const XMAX = 6, RMAX = 1.25;            // panel (b) window: the figure's
const TMIN = 1500, TMAX = 9000;         // slider range in K: a drawing choice
const PERIOD = 16;                      // seconds for one sweep of T up and down: a drawing choice
const N = 260;                          // points per curve: a drawing choice
const REF: Array<{ tau: number; label: string; dash: string }> = [
  { tau: 1, label: '*T*_0', dash: '' },
  { tau: 5 / 6, label: '⅚ *T*_0', dash: '5 2' },
  { tau: 2 / 3, label: '⅔ *T*_0', dash: '5 1.5 1.2 1.5' },
];

export function mount(stage: HTMLElement, ctx: DemoContext): DemoInstance {
  ensureStyle();
  const svg = stageSvg(stage);
  const uid = `c00p-${Math.floor(ctx.random() * 1e9)}`;
  const T0 = Number(ctx.params.t0 ?? '6000') > 0 ? Number(ctx.params.t0 ?? '6000') : 6000;

  // ── state ─────────────────────────────────────────────────────
  const clampT = (t: number) => Math.min(TMAX, Math.max(TMIN, t));
  const clampS = (s: number) => Math.min(SMAX, Math.max(0.02, s));
  let chosenT = clampT(Number(ctx.params.T ?? T0));
  let cursor = clampS(Number(ctx.params.s ?? '1'));
  let bounds = ctx.params.bounds === '1';
  let now = 0;
  // T(time): a smooth sweep in log T between TMIN and TMAX that passes through the chosen T at the moment it is chosen
  const lp = (t: number) => (Math.log(t) - Math.log(TMIN)) / (Math.log(TMAX) - Math.log(TMIN));
  let phase = Math.acos(1 - 2 * lp(chosenT));
  let anchor = 0;
  const Tat = (time: number) => {
    const p = (1 - Math.cos(phase + (2 * Math.PI * (time - anchor)) / PERIOD)) / 2;
    return clampT(Math.exp(Math.log(TMIN) + p * (Math.log(TMAX) - Math.log(TMIN))));
  };
  const choose = (t: number) => { chosenT = clampT(t); phase = Math.acos(1 - 2 * lp(chosenT)); anchor = now; };

  // ── controls ──────────────────────────────────────────────────
  const Tsym = ctx.symbol('sym.temperature');
  const nuM = '<math><mi>ν</mi></math>';
  const fmtTHz = (s: number) => `${fix(ctx, frequencyOfS(s, T0) / 1e12, 1)} THz`;
  const sliderT = ctx.ui.slider({
    label: ctx.text('Temperatur T', 'temperature T'), labelHtml: Tsym.mathml,
    min: TMIN, max: TMAX, step: 10, value: chosenT, primary: true,
    format: (v) => `${fix(ctx, v, 0)} K`,
    onInput: (v) => choose(v),
  });
  const sliderNu = ctx.ui.slider({
    label: ctx.text('Frequenz ν des Zeigers', 'frequency ν of the cursor'), labelHtml: nuM,
    min: 0.02, max: SMAX, step: 0.01, value: cursor,
    format: fmtTHz,
    onInput: (v) => { cursor = clampS(v); },
  });
  toggle(ctx, ctx.text('Schranken zeigen', 'show the bounds'), bounds, (on) => { bounds = on; ctx.invalidate(); });
  const mi = (s: string) => `<math><mi>${s}</mi></math>`;
  const sub = (b: string, s: string) => `<math><msub><mi>${b}</mi><mi mathvariant="normal">${s}</mi></msub></math>`;
  const outX = ctx.ui.readout(ctx.text('x = hν/(k_B T) am Zeiger', 'x = hν/(k_B T) at the cursor'), mi('x'));
  const outU = ctx.ui.readout(ctx.text('Energiedichte u am Zeiger', 'energy density u at the cursor'), mi('u'));
  const outUkl = ctx.ui.readout(ctx.text('Grenzform u_kl am Zeiger', 'limiting form u_kl at the cursor'), sub('u', 'kl'));
  const outR = ctx.ui.readout(ctx.text('Verhältnis u/u_kl', 'ratio u/u_kl'), `<math><mi>u</mi><mo>/</mo><msub><mi>u</mi><mi mathvariant="normal">kl</mi></msub></math>`);
  const outPeak = ctx.ui.readout(ctx.text('Frequenz des Maximums von u', 'frequency of the maximum of u'), `<math><msub><mi>ν</mi><mi>max</mi></msub></math>`);
  noteBelow(ctx, ctx.text(
    `Bezugstemperatur T₀ = ${fix(ctx, T0, 0)} K, für die Zahlen gewählt; die Kurven hängen nur von T/T₀ ab. Die Frequenz des Zeigers lässt sich auf beiden Feldern mit der Maus ziehen.`,
    `Reference temperature T₀ = ${fix(ctx, T0, 0)} K, chosen for the numbers; the curves depend only on T/T₀. The cursor frequency can be dragged on either panel.`));

  // ── geometry (set by paint, used by dragging) ─────────────────
  let geo = { ax0: 0, ax1: 1, ay0: 1, ay1: 0, bx0: 0, bx1: 1, by0: 1, by1: 0 };
  let tau = chosenT / T0;
  onDrag(svg, (x, y) => {
    const g = geo;
    if (x >= g.ax0 - 10 && x <= g.ax1 + 10 && y <= g.ay0 + 30) cursor = clampS(((x - g.ax0) / (g.ax1 - g.ax0)) * SMAX);
    else if (x >= g.bx0 - 10 && x <= g.bx1 + 10 && y <= g.by0 + 30) cursor = clampS(((x - g.bx0) / (g.bx1 - g.bx0)) * XMAX * tau); // x = s T_0/T, inverted for the drag
    else return false;
    sliderNu.set(cursor);
    ctx.invalidate();
    return true;
  });

  const paint = () => {
    const P = pen(svg, stage, ctx.tokens, 46);
    const { k, W, H, fs } = P;
    const ink = k.color('plate-ink'), muted = k.color('plate-muted'), q1 = k.color('q1');
    const T = Tat(now);
    tau = T / T0;
    sliderT.set(T);
    const ax0 = 3.3 * fs, ax1 = 0.585 * W, ay1 = 2.3 * fs, ay0 = H - 3.1 * fs;
    const bx0 = ax1 + 4.4 * fs, bx1 = W - 1.2 * fs, by1 = ay1, by0 = ay0;
    geo = { ax0, ax1, ay0, ay1, bx0, bx1, by0, by1 };
    const XA = (s: number) => ax0 + (s / SMAX) * (ax1 - ax0), YA = (v: number) => ay0 - (v / YMAX) * (ay0 - ay1);
    const XB = (x: number) => bx0 + (x / XMAX) * (bx1 - bx0), YB = (v: number) => by0 - (v / RMAX) * (by0 - by1);

    const defs = svgEl('defs', {}, svg);
    const clipA = svgEl('clipPath', { id: `${uid}-a` }, defs); svgEl('rect', { x: ax0, y: ay1, width: ax1 - ax0, height: ay0 - ay1 }, clipA);
    const clipB = svgEl('clipPath', { id: `${uid}-b` }, defs); svgEl('rect', { x: bx0, y: by1, width: bx1 - bx0, height: by0 - by1 }, clipB);
    const pat = svgEl('pattern', { id: `${uid}-h`, width: 5, height: 5, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
    svgEl('line', { x1: 0, y1: 0, x2: 0, y2: 5, stroke: k.color('bath-edge'), 'stroke-width': k.stroke('thin') }, pat);
    P.rect(0, 0, W, H, { fill: k.color('plate') });

    const axes = (x0: number, x1: number, y0: number, y1: number, xt: Array<[number, string]>, yt: Array<[number, string]>, X: (v: number) => number, Y: (v: number) => number, xl: string, yl: string, title: string) => {
      P.line(x0, y0, x1 + 0.6 * fs, y0, ink, k.stroke('thin'));
      P.line(x0, y0, x0, y1 - 0.4 * fs, ink, k.stroke('thin'));
      for (const [v, s] of xt) { P.line(X(v), y0, X(v), y0 + 0.35 * fs, ink, k.stroke('hair')); P.text(X(v), y0 + 1.3 * fs, s, { anchor: 'middle' }); }
      for (const [v, s] of yt) { P.line(x0 - 0.35 * fs, Y(v), x0, Y(v), ink, k.stroke('hair')); P.text(x0 - 0.5 * fs, Y(v) + 0.35 * fs, s, { anchor: 'end' }); }
      P.text((x0 + x1) / 2, y0 + 2.65 * fs, xl, { anchor: 'middle' });
      P.text(x0 - 0.5 * fs, y1 - 0.85 * fs, yl, { anchor: 'start' });
      P.text(x1, y1 - 0.85 * fs, title, { anchor: 'end', fill: muted });
    };
    axes(ax0, ax1, ay0, ay1, [[0, '0'], [2, '2'], [4, '4'], [6, '6']], [[0, '0'], [1, '1'], [2, '2']], XA, YA,
      '*h**ν*/(*k*_B *T*_0)', '*u*/*u*_0', ctx.text('(a) Strahlungsgesetz und Grenzform', '(a) radiation law and limiting form'));
    axes(bx0, bx1, by0, by1, [[0, '0'], [2, '2'], [4, '4'], [6, '6']], [[0, '0'], [0.5, '½'], [1, '1']], XB, YB,
      '*x* = *h**ν*/(*k*_B *T*)', '*u*/*u*_{kl}', ctx.text('(b) das Verhältnis', '(b) the ratio'));

    // (a) reference curves of the figure, thin and muted, labelled at their maxima
    const ga = P.g({ 'clip-path': `url(#${uid}-a)` });
    const curve = (f: (s: number) => number, s0: number, s1: number, X: (v: number) => number, Y: (v: number) => number) => {
      const pts: Array<[number, number]> = [];
      for (let i = 0; i <= N; i++) { const s = s0 + ((s1 - s0) * i) / N; pts.push([X(s), Y(f(s))]); }
      return P.poly(pts);
    };
    for (const r of REF) {
      P.path(curve((s) => reducedU(s, r.tau), 0, SMAX, XA, YA), { fill: 'none', stroke: muted, 'stroke-width': k.stroke('thin'), ...(r.dash ? { 'stroke-dasharray': r.dash } : {}) }, ga);
      const pk = reducedPeak(r.tau);
      if (Math.abs(r.tau - tau) > 0.04) P.text(XA(pk.s) + 0.3 * fs, YA(pk.value) - 0.45 * fs, r.label, { fill: muted, anchor: 'start', size: 0.9 * fs });
    }
    // limiting form for T: it leaves the window where s^2 tau = YMAX
    const sExit = Math.min(SMAX, Math.sqrt(YMAX / tau));
    P.path(curve((s) => reducedUkl(s, tau), 0, sExit, XA, YA), { fill: 'none', stroke: ink, 'stroke-width': k.stroke('thin'), 'stroke-dasharray': '3 2' }, ga);
    P.text(XA(sExit) + 0.4 * fs, YA(Math.min(YMAX, reducedUkl(sExit, tau))) + 1.1 * fs, ctx.text('Grenzform *u*_{kl}', 'limiting form *u*_{kl}'), { anchor: 'start' });
    // the radiation law for T
    P.path(curve((s) => reducedU(s, tau), 0, SMAX, XA, YA), { fill: 'none', stroke: q1, 'stroke-width': k.stroke('state'), 'stroke-linejoin': 'round' }, ga);
    const pk = reducedPeak(tau);
    if (pk.value <= YMAX && pk.s <= SMAX) {
      P.line(XA(pk.s), YA(pk.value), XA(pk.s), ay0, q1, k.stroke('hair'), { 'stroke-dasharray': '2 2' });
      P.circle(XA(pk.s), YA(pk.value), 0.28 * fs, { fill: q1 });
      P.text(XA(pk.s) - 0.5 * fs, YA(pk.value) - 0.6 * fs, `*T* = ${fix(ctx, T, 0)} K`, { anchor: 'end', weight: '600' });
    } else {
      P.text(ax1, ay1 + 0.4 * fs, `*T* = ${fix(ctx, T, 0)} K ↑`, { anchor: 'end', weight: '600' });
    }

    // cursor in (a)
    const sc = cursor, uc = reducedU(sc, tau), uklc = reducedUkl(sc, tau);
    P.line(XA(sc), ay1, XA(sc), ay0, ink, k.stroke('hair'));
    if (uklc <= YMAX) P.circle(XA(sc), YA(uklc), 0.24 * fs, { fill: k.color('plate'), stroke: ink, 'stroke-width': k.stroke('thin') });
    if (uc <= YMAX) P.circle(XA(sc), YA(uc), 0.26 * fs, { fill: q1 });
    P.path(`M${XA(sc)} ${ay0 + 0.1 * fs} l${-0.45 * fs} ${0.75 * fs} l${0.9 * fs} 0 z`, { fill: ink });

    // (b) hatched distance to the limiting form, the line 1, the ratio, the optional bounds
    const gb = P.g({ 'clip-path': `url(#${uid}-b)` });
    const rpts: Array<[number, number]> = [];
    for (let i = 0; i <= N; i++) { const x = (XMAX * i) / N; rpts.push([XB(x), YB(ratio(x))]); }
    P.path(`${P.poly(rpts)} L${XB(XMAX)} ${YB(1)} L${XB(0)} ${YB(1)} Z`, { fill: `url(#${uid}-h)`, stroke: 'none' }, gb);
    P.line(XB(0), YB(1), XB(XMAX), YB(1), ink, k.stroke('thin'), { 'stroke-dasharray': '3 2' }, gb);
    P.text(XB(1.6), YB(1) - 0.45 * fs, '*u* = *u*_{kl}', { anchor: 'start' });
    if (bounds) {
      P.path(curve(lowerBound, 0, XMAX, XB, YB), { fill: 'none', stroke: muted, 'stroke-width': k.stroke('thin'), 'stroke-dasharray': '1 2.5', 'stroke-linecap': 'round' }, gb);
      P.path(curve(upperBound, 0, XMAX, XB, YB), { fill: 'none', stroke: muted, 'stroke-width': k.stroke('thin'), 'stroke-dasharray': '1 2.5', 'stroke-linecap': 'round' }, gb);
      P.text(XB(4.3), YB(upperBound(4.3)) - 0.5 * fs, '1/(1 + *x*/2)', { anchor: 'start', fill: muted, size: 0.9 * fs });
      P.text(XB(1.05), YB(lowerBound(1.05)) + 1.25 * fs, '*e*^{−*x*}', { anchor: 'end', fill: muted, size: 0.9 * fs });
    }
    P.path(P.poly(rpts), { fill: 'none', stroke: q1, 'stroke-width': k.stroke('state') }, gb);
    P.text(XB(2.7), YB(ratio(2.7)) + 1.5 * fs, '*x*/(*e*^*x* − 1)', { anchor: 'start' });
    const nu = frequencyOfS(sc, T0);
    const x = exponentX(nu, T);
    const xc = x, rc = ratio(xc);
    if (xc <= XMAX) {
      P.line(XB(xc), by1, XB(xc), by0, ink, k.stroke('hair'));
      P.circle(XB(xc), YB(rc), 0.3 * fs, { fill: q1 });
      P.path(`M${XB(xc)} ${by0 + 0.1 * fs} l${-0.45 * fs} ${0.75 * fs} l${0.9 * fs} 0 z`, { fill: ink });
      const right = xc < 3.6;
      P.text(XB(xc) + (right ? 0.6 : -0.6) * fs, YB(rc) + (rc > 0.85 ? 1.5 : -0.7) * fs, `*x* = ${fix(ctx, xc, 2)}`, { anchor: right ? 'start' : 'end', weight: '600' });
    } else {
      P.text(bx1, YB(0.18), `*x* = ${fix(ctx, xc, 2)} →`, { anchor: 'end', weight: '600' });
    }

    // readouts: all from the kernel
    outX.set(`= ${fix(ctx, x, 3)}`);
    outU.set(`= ${sci(ctx, spectralDensity(nu, T), 4)} J m⁻³ Hz⁻¹`);
    outUkl.set(`= ${sci(ctx, limitingForm(nu, T), 4)} J m⁻³ Hz⁻¹`);
    outR.set(bounds ? `${fix(ctx, lowerBound(x), 3)} ≤ ${fix(ctx, ratio(x), 3)} ≤ ${fix(ctx, upperBound(x), 3)}` : `= ${fix(ctx, ratio(x), 3)}`);
    outPeak.set(`= ${fix(ctx, peakFrequency(T) / 1e12, 1)} THz  (x = ${fix(ctx, PEAK_X, 3)})`);
  };

  return {
    render(_frame, time) { now = time; paint(); },
    resize: () => paint(),
    tokensChanged: () => paint(),
    destroy() { svg.remove(); },
    info: () => {
      const T = Tat(now), nu = frequencyOfS(cursor, T0);
      return { T, T0, nuHz: nu, x: exponentX(nu, T), ratio: ratio(exponentX(nu, T)), peakHz: peakFrequency(T), bounds };
    },
  };
}
