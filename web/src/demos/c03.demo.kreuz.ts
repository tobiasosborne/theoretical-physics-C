// c03.demo.kreuz: the Kreuz operation and the scalar product in C^2 (figure c03.fig.kreuz,
// Kern section c03.s2). 2D, SVG on the plate.
//
// LEFT, the complex plane of the entries: v_1, v_2 (filled discs, state role) and w_1, w_2
// (filled squares, ladder role q5) are dragged; the entries of the row v^dagger (open circles)
// follow as their mirror images in the real axis (D76). RIGHT, the plane of the products: the
// terms v_j^* w_j as arrows added head to tail; the last head is v^dagger w (c03.eq.vw). Below,
// row times column with the current numbers.
// Switches: the order w^dagger v (the result is mirrored: c03.prop.skalarprodukt, rule 1), w = v
// (every term |v_j|^2 lies on the non-negative real axis: c03.eq.selbst), and the product
// WITHOUT conjugation (c03.ex.ohne-stern: v = (1, i) gets "length" 0).
// PLAY turns v into alpha v with the phase factor alpha = e^(i theta), theta growing: the entries of
// v turn one way, their mirror images the other, and v^dagger w turns with alpha^* (rule 3 of
// c03.prop.skalarprodukt: antilinear in the first factor); with the order swapped, w^dagger v
// turns with alpha (rule 2); with w = v the value v^dagger v stays where it is.
//
// Every number shown is an input (the entries, on a grid of 1/2 in [-3, 3]) or computed by
// web/src/kernels/hilbert.ts (dagger, innerTerms, plainTerms, runningSums). Default state: the
// figure's example, part (b): v = (1+i, 1-i), w = (1, -1), v^dagger w = -2i. Here v_1^* = v_2 and
// v_2^* = v_1, so coinciding points share one label. The preset "Abbildung (a)" is the vector
// v = (2+i, -1+2i) of part (a), with the same w.
import type { DemoContext, DemoInstance, DemoMeta } from '../demo/types';
import { conj, innerTerms, phaseFactor, plainTerms, runningSums, scaleVec, type Complex } from '../kernels/hilbert';
import {
  arrow, bold, choice, complexMathml, complexText, div, ensureStyle, m, num, place, setAttrs, star, sub, svgEl, toggle, tweener, withDagger, type Arrow,
} from './c03/common';

export const meta: DemoMeta = { animated: true, aspect: 1.75, surface: 'plate' };

const LIM = 3;            // entries are dragged within [-LIM, LIM]^2: a drawing choice
const SNAP = 0.5;         // grid of the entries: halves keep every product exact and short
const U = 3.7;            // half-width of the entries plane in units
const NARROW = 560;      // below this stage width (CSS px) the two planes are stacked: a drawing choice
const TURN = 12;          // seconds of play for one full turn of the phase theta: a drawing choice
// half-widths of the products plane and their grid steps; the smallest that holds the arrows with room for labels
const RANGES: Array<[number, number]> = [[1.5, 0.5], [2, 0.5], [3, 1], [4, 1], [6, 2], [8, 2], [12, 4], [16, 4], [24, 8], [32, 8], [48, 16]];

type Key = 'fig' | 'beispiel' | 'uebung' | 'ohne';
interface Preset { v: [Complex, Complex]; w: [Complex, Complex]; lock: boolean; plain: boolean; swap: boolean }
const PRESETS: Record<Key, Preset> = {
  fig: { v: [[2, 1], [-1, 2]], w: [[1, 0], [-1, 0]], lock: false, plain: false, swap: false },
  beispiel: { v: [[1, 1], [1, -1]], w: [[1, 0], [-1, 0]], lock: false, plain: false, swap: false },
  uebung: { v: [[0, 1], [2, 0]], w: [[1, 0], [0, 1]], lock: false, plain: false, swap: false },
  ohne: { v: [[1, 0], [0, 1]], w: [[1, 0], [0, 1]], lock: true, plain: true, swap: false },
};
const SUBS = ['₁', '₂'];

export function mount(stage: HTMLElement, ctx: DemoContext): DemoInstance {
  ensureStyle();
  const svg = svgEl('svg', { 'aria-hidden': 'true' });
  const layer = div('c03-layer');
  stage.append(svg, layer);
  const tw = tweener(ctx, stage);

  // ── state ───────────────────────────────────────────────────────────────────────────────
  const startKey: Key = (ctx.params.preset as Key) in PRESETS ? (ctx.params.preset as Key) : 'beispiel';
  const start = PRESETS[startKey];
  // vb, wb: the entries set by the reader (on the grid); v, w: what is shown, v = e^(i theta) vb
  let vb: Complex[] = [...start.v], wb: Complex[] = [...start.w];
  let v: Complex[] = vb, w: Complex[] = wb;
  let theta = 0, theta0 = 0, now = 0;
  let lock = ctx.params.lock === '1' || start.lock;
  let plain = ctx.params.plain === '1' || start.plain;
  let swap = ctx.params.swap === '1' || start.swap;
  if (lock) wb = [...vb];
  const refresh = () => { v = theta === 0 ? vb : scaleVec(phaseFactor(theta), vb); w = lock ? v : wb; };
  refresh();
  let hot: { kind: 'v' | 'w' | 'row'; j: number } | null = null;
  let range = RANGES[0][0], step = RANGES[0][1];

  const snap = (x: number) => Math.max(-LIM, Math.min(LIM, Math.round(x / SNAP) * SNAP));
  // a reader's change starts from what is shown: the turned entries are put back on the grid, theta = 0
  const bake = () => {
    if (theta !== 0) { vb = v.map((z) => [snap(z[0]), snap(z[1])] as Complex); if (lock) wb = [...vb]; }
    theta0 = -(2 * Math.PI * now) / TURN; theta = 0;
    refresh();
  };
  // the first factor gets the Kreuz; swap exchanges the roles of v and w
  const first = () => (swap ? w : v), second = () => (swap ? v : w);
  const fName = () => (swap ? 'w' : 'v'), sName = () => (swap ? 'v' : 'w');
  const row = (): Complex[] => (plain ? [...first()] : first().map(conj));
  const terms = (): Complex[] => (plain ? plainTerms(first(), second()) : innerTerms(first(), second()));

  // ── controls ────────────────────────────────────────────────────────────────────────────
  const presetCtl = choice<Key>(ctx, ctx.text('Beispiel', 'example'), [
    { value: 'fig', html: ctx.text('Abbildung (a)', 'figure (a)'), title: ctx.text('v = (2+i, −1+2i) aus Abbildung (a), w = (1, −1)', 'v = (2+i, −1+2i) of figure (a), w = (1, −1)') },
    { value: 'beispiel', html: ctx.text('Beispiel: −2i', 'example: −2i'), title: ctx.text('v = (1+i, 1−i), w = (1, −1): Beispiel aus dem Text, Abbildung (b)', 'v = (1+i, 1−i), w = (1, −1): the example of the text, figure (b)') },
    { value: 'uebung', html: ctx.text('Übung', 'exercise'), title: ctx.text('v = (i, 2), w = (1, i) aus der Übung', 'v = (i, 2), w = (1, i) of the exercise') },
    { value: 'ohne', html: ctx.text('Ohne Konjugation', 'without conjugation'), title: ctx.text('v = (1, i) mit sich selbst, ohne Stern', 'v = (1, i) with itself, without the star') },
  ], startKey, (k) => {
    const p = PRESETS[k];
    tw.tween();
    bake();
    vb = [...p.v]; wb = [...p.w]; lock = p.lock; plain = p.plain; swap = p.swap;
    if (lock) wb = [...vb];
    refresh();
    lockCtl.set(lock); plainCtl.set(plain); swapCtl.set(swap);
    syncSliders();
  });
  const swapCtl = toggle(ctx, ctx.text('Reihenfolge vertauschen: w†v', 'swap the order: w†v'), null, swap, (on) => { tw.tween(); swap = on; presetCtl.set(null); });
  const lockCtl = toggle(ctx, ctx.text('w = v setzen', 'set w = v'), null, lock, (on) => { tw.tween(); bake(); lock = on; if (on) wb = [...vb]; refresh(); presetCtl.set(null); syncSliders(); });
  const plainCtl = toggle(ctx, ctx.text('ohne Stern (nur umlegen)', 'without the star (lay down only)'), null, plain, (on) => { tw.tween(); plain = on; presetCtl.set(null); });
  // one slider per dragged real number, for the keyboard
  const sliders: Array<{ set(x: number): void }> = [];
  const parts: Array<{ vec: 'v' | 'w'; j: number; c: 0 | 1 }> = [];
  for (const vec of ['v', 'w'] as const) for (const j of [0, 1]) for (const c of [0, 1] as const) parts.push({ vec, j, c });
  for (const p of parts) {
    const name = `${p.c === 0 ? 'Re' : 'Im'} ${p.vec}${SUBS[p.j]}`;
    const vecNow = () => (p.vec === 'v' ? vb : wb);
    sliders.push(ctx.ui.slider({
      label: name,
      labelHtml: m(`<mo>${p.c === 0 ? 'Re' : 'Im'}</mo>${sub(`<mi>${p.vec}</mi>`, String(p.j + 1))}`),
      min: -LIM, max: LIM, step: SNAP, value: vecNow()[p.j][p.c], primary: p.vec === 'v' && p.j === 0 && p.c === 0,
      format: (x) => num(ctx, x, 1),
      onInput: (x) => { tw.still(); setEntry(p.vec, p.j, p.c === 0 ? [x, vecNow()[p.j][1]] : [vecNow()[p.j][0], x]); presetCtl.set(null); },
    }));
  }
  const syncSliders = () => parts.forEach((p, i) => sliders[i].set((p.vec === 'v' ? vb : wb)[p.j][p.c]));
  const setEntry = (vec: 'v' | 'w', j: number, z: Complex) => {
    bake();
    const zz: Complex = [snap(z[0]), snap(z[1])];
    if (vec === 'v' || lock) { vb = vb.map((x, i) => (i === j ? zz : x)); }
    if (vec === 'w' || lock) { wb = wb.map((x, i) => (i === j ? zz : x)); }
    refresh();
    syncSliders();
  };
  const phaseSlider = ctx.ui.slider({
    label: ctx.text('Phase θ des Faktors α = e^(iθ), mit dem v multipliziert wird', 'phase θ of the factor α = e^(iθ) that multiplies v'),
    labelHtml: '<math><mi>θ</mi></math>' + ctx.text(' in ', ' in ') + '<math><mi mathvariant="bold">v</mi><mo>↦</mo><msup><mi>e</mi><mrow><mi>i</mi><mi>θ</mi></mrow></msup><mi mathvariant="bold">v</mi></math>',
    min: 0, max: 360, step: 5, value: 0,
    format: (d) => `${Math.round(d)}°`,
    onInput: (d) => { tw.still(); theta0 = (d * Math.PI) / 180 - (2 * Math.PI * now) / TURN; },
  });

  // ── persistent drawing ──────────────────────────────────────────────────────────────────
  const gridE = svgEl('g', {}, svg), gridP = svgEl('g', {}, svg);
  const gLeaders = svgEl('g', {}, svg), gArrows = svgEl('g', {}, svg), gPoints = svgEl('g', {}, svg), gLabels = svgEl('g', {}, svg);
  const leaders: Arrow[] = [0, 1].map(() => arrow(gLeaders));
  const prodArrows: Arrow[] = [0, 1].map(() => arrow(gArrows));
  const mirrorLine = arrow(gArrows);
  const pointG = (shape: 'disc' | 'square' | 'ring') => {
    const g = svgEl('g', { class: 'c03-move' }, gPoints);
    const el = shape === 'square' ? svgEl('rect', {}, g) : svgEl('circle', {}, g);
    return { g, el, shape };
  };
  const rowPts = [0, 1].map(() => pointG('ring'));
  const vPts = [0, 1].map(() => pointG('disc'));
  const wPts = [0, 1].map(() => pointG('square'));
  const ghost = pointG('ring');
  const result = pointG('disc');
  const label = () => {
    const g = svgEl('g', { class: 'c03-move' }, gLabels);
    const t = svgEl('text', {}, g);
    t.style.fontFamily = 'var(--tpc-family-label)';
    return { g, t };
  };
  const vLab = [0, 1].map(label), wLab = [0, 1].map(label), rowLab = [0, 1].map(label), prodLab = [0, 1].map(label);
  const resLab = label(), ghostLab = label();
  const titleE = label(), titleP = label();
  const formula = div('c03-tag', layer);
  const warn = div('c03-tag c03-hot', layer);

  let geo = { W: 1, H: 1, fs: 12, cxE: 0, cyE: 0, kE: 1, cxP: 0, cyP: 0, kP: 1, side: 1, tyE: 0, tyP: 0, narrow: false };
  const capture = Boolean(ctx.params.stage);
  const toE = (z: Complex): [number, number] => [geo.cxE + geo.kE * z[0], geo.cyE - geo.kE * z[1]];
  const fromE = (x: number, y: number): Complex => [(x - geo.cxE) / geo.kE, -(y - geo.cyE) / geo.kE];
  const toP = (z: Complex): [number, number] => [geo.cxP + geo.kP * z[0], geo.cyP - geo.kP * z[1]];

  const drawGrid = (g: SVGGElement, cx: number, cy: number, k: number, half: number, step: number, labelEvery: number) => {
    g.replaceChildren();
    const t = ctx.tokens, fs = geo.fs;
    const rule = t.color('plate-rule'), ink = t.color('plate-ink'), muted = t.color('plate-muted');
    const n = Math.floor(half / step + 1e-9);
    for (let i = -n; i <= n; i++) {
      if (i === 0) continue;
      svgEl('line', { x1: cx + i * step * k, y1: cy - half * k, x2: cx + i * step * k, y2: cy + half * k, stroke: rule, 'stroke-width': t.stroke('hair') }, g);
      svgEl('line', { x1: cx - half * k, y1: cy - i * step * k, x2: cx + half * k, y2: cy - i * step * k, stroke: rule, 'stroke-width': t.stroke('hair') }, g);
      if (i % labelEvery === 0) {
        const lx = svgEl('text', { x: cx + i * step * k, y: cy + 1.15 * fs, 'text-anchor': 'middle', fill: muted, 'font-size': 0.82 * fs }, g);
        lx.style.fontFamily = 'var(--tpc-family-label)'; lx.textContent = num(ctx, i * step, 1);
        const ly = svgEl('text', { x: cx - 0.35 * fs, y: cy - i * step * k + 0.3 * fs, 'text-anchor': 'end', fill: muted, 'font-size': 0.82 * fs }, g);
        ly.style.fontFamily = 'var(--tpc-family-label)'; ly.textContent = num(ctx, i * step, 1);
      }
    }
    const ax = (x1: number, y1: number, x2: number, y2: number) => {
      const a = arrow(g);
      a.g.classList.remove('c03-move'); a.g.querySelectorAll('.c03-move').forEach((e) => e.classList.remove('c03-move'));
      setAttrs(a.shaft, { stroke: ink, 'stroke-width': t.stroke('thin') });
      setAttrs(a.head, { fill: ink });
      a.set(x1, y1, x2, y2, 0.55 * fs);
    };
    ax(cx - half * k, cy, cx + (half + 0.25 * step) * k, cy);
    ax(cx, cy + half * k, cx, cy - (half + 0.25 * step) * k);
    const tx = svgEl('text', { x: cx + (half + 0.3 * step) * k + 0.25 * fs, y: cy + 0.35 * fs, fill: ink, 'font-size': fs }, g);
    tx.style.fontFamily = 'var(--tpc-family-label)'; tx.textContent = 'Re';
    const ty = svgEl('text', { x: cx + 0.35 * fs, y: cy - (half + 0.3 * step) * k + 0.2 * fs, fill: ink, 'font-size': fs }, g);
    ty.style.fontFamily = 'var(--tpc-family-label)'; ty.textContent = 'Im';
  };

  let gridKey = '';
  const layout = () => {
    let box = stage.getBoundingClientRect();
    // a narrow stage (a phone) stacks the planes: the demo asks its own stage for a taller shape
    const narrow = !capture && box.width > 0 && box.width < NARROW;
    const want = narrow ? '0.52' : String(meta.aspect);
    if (!capture && stage.style.aspectRatio !== want) { stage.style.aspectRatio = want; box = stage.getBoundingClientRect(); }
    const W = Math.max(200, box.width), H = Math.max(120, box.height);
    if (narrow) {
      const fs = Math.min(ctx.tokens.font('label').sizePx, W / 27);
      const formulaH = 8.2 * fs, titleH = 2.4 * fs;
      const side = Math.min((H - formulaH - 2 * titleH) / 2, W - 1.5 * fs);
      const cyE = titleH + side / 2, cyP = cyE + side / 2 + titleH + side / 2;
      geo = { W, H, fs, side, cxE: W / 2, cyE, kE: side / (2 * U), cxP: W / 2, cyP, kP: 1, tyE: 1.1 * fs, tyP: cyE + side / 2 + 1.5 * fs, narrow };
    } else {
      const fs = Math.min(ctx.tokens.font('label').sizePx, W / 44);
      const formulaH = 5.6 * fs, titleH = 2.6 * fs;
      const side = Math.min(H - formulaH - titleH, (W - 4 * fs) / 2);
      const cy = titleH + side / 2 + 0.2 * fs;
      geo = { W, H, fs, side, cxE: W / 4 + 0.6 * fs, cyE: cy, kE: side / (2 * U), cxP: (3 * W) / 4 - 0.2 * fs, cyP: cy, kP: 1, tyE: 1.15 * fs, tyP: 1.15 * fs, narrow };
    }
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  };

  const pointStyle = (p: ReturnType<typeof pointG>, x: number, y: number, fill: string, stroke: string, r: number, sw: number) => {
    place(p.g, `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`);
    if (p.shape === 'square') setAttrs(p.el, { x: -r * 0.85, y: -r * 0.85, width: 1.7 * r, height: 1.7 * r, fill, stroke, 'stroke-width': sw });
    else setAttrs(p.el, { cx: 0, cy: 0, r, fill, stroke, 'stroke-width': sw });
  };
  const text = (l: ReturnType<typeof label>, x: number, y: number, s: string, anchor: 'start' | 'end' | 'middle', fill: string, size = 1, weight = '400', fit?: number) => {
    // fit: the x of the anchor point; a label that would leave the stage is turned to the other side of it
    if (fit !== undefined) {
      const wEst = 0.56 * size * geo.fs * [...s].length;
      const pad = 0.3 * geo.fs;
      if (anchor === 'start' && x + wEst > geo.W - pad) { anchor = 'end'; x = fit - (x - fit); }
      else if (anchor === 'end' && x - wEst < pad) { anchor = 'start'; x = fit + (fit - x); }
      else if (anchor === 'middle') x = Math.max(pad + wEst / 2, Math.min(geo.W - pad - wEst / 2, x));
    }
    place(l.g, `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`);
    setAttrs(l.t, { x: 0, y: 0, 'text-anchor': anchor, fill, 'font-size': size * geo.fs, 'font-weight': weight, stroke: ctx.tokens.color('plate'), 'stroke-width': 0.28 * geo.fs, 'stroke-linejoin': 'round', 'paint-order': 'stroke' });
    if (l.t.textContent !== s) l.t.textContent = s;
  };

  const paint = () => {
    layout();
    const t = ctx.tokens, fs = geo.fs;
    const ink = t.color('plate-ink'), plate = t.color('plate'), state = t.color('state'), wCol = t.color('q5'), muted = t.color('plate-muted');
    const tm = terms(), sums = runningSums(tm), res = sums[sums.length - 1];
    const rw = row();
    // products plane: the smallest range that holds every partial sum, every term and the mirror image
    const need = tm.reduce((a, z) => a + Math.hypot(z[0], z[1]), 0);      // bounds every partial sum and does not change when v turns
    [range, step] = RANGES.find(([r]) => need <= 0.8 * r) ?? RANGES[RANGES.length - 1];
    geo.kP = geo.side / (2 * range * 1.2);
    const key = [geo.W, geo.H, range, t.pkg, t.ground].join('|');
    if (key !== gridKey) {
      gridKey = key;
      drawGrid(gridE, geo.cxE, geo.cyE, geo.kE, U - 0.35, 1, 1);
      drawGrid(gridP, geo.cxP, geo.cyP, geo.kP, range * 1.12, step, 1);
    }
    const r = 0.42 * fs;
    const dg = theta === 0 ? 1 : 2;
    // entries plane
    const fN = fName(), sN = sName();
    // a row entry that lands on another entry of the first factor (v_1^* = v_2 in the example) is
    // named in that entry's label instead of a label of its own
    const fv = first();
    const same = (a: Complex, b: Complex) => Math.abs(a[0] - b[0]) < 1e-9 && Math.abs(a[1] - b[1]) < 1e-9;
    const alias = [0, 1].map((i) => [0, 1].filter((jj) => jj !== i && same(rw[jj], fv[i])).map((jj) => (plain ? `${fN}${SUBS[jj]}` : `${fN}${SUBS[jj]}*`)));
    const aliased = [0, 1].map((jj) => [0, 1].some((i) => i !== jj && same(rw[jj], fv[i])));
    const extra = (vec: 'v' | 'w', i: number) => (vec === fN && alias[i].length ? ` = ${alias[i].join(' = ')}` : '');
    for (const j of [0, 1]) {
      const [xv, yv] = toE(v[j]), [xw, yw] = toE(w[j]), [xr, yr] = toE(rw[j]);
      const isHotV = hot?.kind === 'v' && hot.j === j, isHotW = hot?.kind === 'w' && hot.j === j, isHotR = hot?.kind === 'row' && hot.j === j;
      pointStyle(wPts[j], xw, yw, wCol, isHotW ? ink : wCol, r * 0.95, t.stroke(isHotW ? 'regular' : 'hair'));
      wPts[j].g.style.opacity = v[j][0] === w[j][0] && v[j][1] === w[j][1] ? '0' : '1';
      wPts[j].g.classList.add('c03-fade');
      pointStyle(vPts[j], xv, yv, state, isHotV ? ink : state, r, t.stroke(isHotV ? 'regular' : 'hair'));
      const fCol = swap ? wCol : state;
      pointStyle(rowPts[j], xr, yr, plate, fCol, r * 1.05, t.stroke(isHotR ? 'state' : 'regular'));
      // mirror leader from the entry of the first factor to its conjugate (none when they coincide)
      const [xf, yf] = toE(first()[j]);
      const L = leaders[j];
      setAttrs(L.shaft, { stroke: muted, 'stroke-width': t.stroke('thin'), 'stroke-dasharray': '3 2.5' });
      setAttrs(L.head, { fill: muted });
      const off = Math.sign(yr - yf) * 1.15 * r;
      if (Math.abs(yr - yf) > 2.6 * r) L.set(xf, yf + off, xr, yr - off, 0.5 * fs); else L.set(xf, yf, xf, yf, 0);
      L.g.style.opacity = Math.abs(yr - yf) > 2.6 * r ? '1' : '0';
      // labels: right of the point in the right half, left of it in the left half (as in the figure)
      const side = (x: number) => (x >= geo.cxE ? 'start' : 'end');
      const dx = (x: number) => (x >= geo.cxE ? 1 : -1) * 1.15 * fs;
      const sameVW = v[j][0] === w[j][0] && v[j][1] === w[j][1];
      text(vLab[j], xv + dx(xv), yv + 0.36 * fs, `v${SUBS[j]}${extra('v', j)} = ${sameVW ? `w${SUBS[j]} = ` : ''}${complexText(ctx, v[j], dg)}`, side(xv), state, 0.95, isHotV ? '600' : '400');
      text(wLab[j], xw + dx(xw), yw + 0.36 * fs, `w${SUBS[j]}${extra('w', j)} = ${complexText(ctx, w[j], dg)}`, side(xw), wCol, 0.95, isHotW ? '600' : '400');
      wLab[j].g.style.opacity = sameVW ? '0' : '1';
      const rowName = plain ? `${fN}${SUBS[j]}` : `${fN}${SUBS[j]}*`;
      const coincides = Math.hypot(xr - xf, yr - yf) < 1;
      text(rowLab[j], xr + dx(xr), yr + 0.36 * fs, `${rowName} = ${complexText(ctx, rw[j], dg)}`, side(xr), swap ? wCol : state, 0.95, isHotR ? '600' : '400');
      rowLab[j].g.style.opacity = coincides || aliased[j] ? '0' : '1';
      for (const l of [wLab[j], rowLab[j]]) l.g.classList.add('c03-fade');
    }
    text(titleE, geo.cxE, geo.tyE, ctx.text(`Einträge von v und w; offen: die Zeile ${fN}${plain ? 'ᵀ' : '†'}`, `entries of v and w; open: the row ${fN}${plain ? 'ᵀ' : '†'}`), 'middle', ink, 1);
    // products plane
    const termName = (j: number) => (plain ? `${fN}${SUBS[j]}${sN}${SUBS[j]}` : `${fN}${SUBS[j]}*${sN}${SUBS[j]}`);
    // screen points of 0, s_1, s_2; labels go outside the triangle they span
    const P = [toP([0, 0]), toP(sums[0]), toP(sums[1])];
    const C = [(P[0][0] + P[1][0] + P[2][0]) / 3, (P[0][1] + P[1][1] + P[2][1]) / 3];
    // a second arrow that runs back along the first is drawn beside it
    const d0 = [P[1][0] - P[0][0], P[1][1] - P[0][1]], d1 = [P[2][0] - P[1][0], P[2][1] - P[1][1]];
    const cross = d0[0] * d1[1] - d0[1] * d1[0], dot = d0[0] * d1[0] + d0[1] * d1[1];
    const n0 = Math.hypot(d0[0], d0[1]), n1 = Math.hypot(d1[0], d1[1]);
    const back = n0 > 1 && n1 > 1 && Math.abs(cross) < 0.06 * n0 * n1 && dot < 0;
    for (const j of [0, 1]) {
      const a = prodArrows[j];
      let [x0, y0] = P[j], [x1, y1] = P[j + 1];
      const L = Math.hypot(x1 - x0, y1 - y0) || 1;
      let nx = -(y1 - y0) / L, ny = (x1 - x0) / L;
      const mx0 = (x0 + x1) / 2, my0 = (y0 + y1) / 2;
      const away = (mx0 - C[0]) * nx + (my0 - C[1]) * ny;
      if (Math.abs(away) < 0.5) { if ((j === 0) === (ny > 0)) { nx = -nx; ny = -ny; } } else if (away < 0) { nx = -nx; ny = -ny; }
      if (back && j === 1) { x0 += nx * 0.55 * fs; y0 += ny * 0.55 * fs; x1 += nx * 0.55 * fs; y1 += ny * 0.55 * fs; }
      const isHot = hot !== null && hot.j === j;
      setAttrs(a.shaft, { stroke: ink, 'stroke-width': t.stroke(isHot ? 'state' : 'regular'), 'stroke-linecap': 'round' });
      setAttrs(a.head, { fill: ink });
      a.set(x0, y0, x1, y1, 0.75 * fs);
      const lx = (x0 + x1) / 2 + nx * 1.0 * fs, ly = (y0 + y1) / 2 + ny * 1.0 * fs + 0.35 * fs + (ny > 0.3 ? 0.35 * fs : 0);
      text(prodLab[j], lx, ly, `${termName(j)} = ${complexText(ctx, tm[j], 2)}`, Math.abs(nx) < 0.35 ? 'middle' : nx > 0 ? 'start' : 'end', ink, 0.9, isHot ? '600' : '400', (x0 + x1) / 2);
    }
    const [xs, ys] = toP(res);
    pointStyle(result, xs, ys, ink, plate, 0.5 * fs, t.stroke('regular'));
    const resName = plain ? `${fN}ᵀ${sN}` : `${fN}†${sN}`;
    // result label: away from the triangle's centroid (up and right when it is degenerate)
    let ux = xs - C[0], uy = ys - C[1];
    const ul = Math.hypot(ux, uy);
    if (ul < 0.5 * fs) { ux = 0.7; uy = -0.7; } else { ux /= ul; uy /= ul; }
    const resRight = ux >= -0.2;
    text(resLab, xs + ux * 1.1 * fs, ys + uy * 1.1 * fs + 0.35 * fs + (uy > 0.3 ? 0.4 * fs : 0), `${resName} = ${complexText(ctx, res, 2)}`, resRight ? 'start' : 'end', ink, 1.02, '600', xs);
    // with the order swapped: the unswapped result as a ghost, joined to the result by its mirror line
    const other: Complex = plain ? res : conj(res);
    const [xg, yg] = toP(other);
    pointStyle(ghost, xg, yg, plate, muted, 0.45 * fs, t.stroke('thin'));
    const showGhost = swap && !plain && Math.abs(res[1]) > 1e-12;
    ghost.g.style.opacity = showGhost ? '1' : '0';
    ghostLab.g.style.opacity = showGhost ? '1' : '0';
    mirrorLine.g.style.opacity = showGhost ? '1' : '0';
    setAttrs(mirrorLine.shaft, { stroke: muted, 'stroke-width': t.stroke('thin'), 'stroke-dasharray': '3 2.5' });
    setAttrs(mirrorLine.head, { fill: muted });
    const offg = Math.sign(ys - yg) * 0.7 * fs;
    mirrorLine.set(xg, yg + offg, xs, ys - offg, 0.5 * fs);
    text(ghostLab, xg + (resRight ? 0.9 : -0.9) * fs, yg + 0.35 * fs, `v†w = ${complexText(ctx, other, 2)}`, resRight ? 'start' : 'end', muted, 0.9);
    for (const e of [ghost.g, ghostLab.g, mirrorLine.g, ...leaders.map((l) => l.g)]) e.classList.add('c03-fade');
    text(titleP, geo.cxP, geo.tyP, ctx.text('Produkte, Spitze an Ende addiert', 'products, added head to tail'), 'middle', ink, 1);

    // row times column, with the numbers
    const fB = bold(fN), sB = bold(sN);
    const cell = (s: string) => `<mtd>${s}</mtd>`;
    const rowSym = plain ? `<msup>${fB}<mi>T</mi></msup>` : withDagger(ctx, fB);
    const rowM = `<mrow><mo>(</mo><mtable columnspacing="0.8em"><mtr>${rw.map((z) => cell(complexMathml(ctx, z, dg))).join('')}</mtr></mtable><mo>)</mo></mrow>`;
    const colM = `<mrow><mo>(</mo><mtable rowspacing="0.15em"><mtr>${cell(complexMathml(ctx, second()[0], dg))}</mtr><mtr>${cell(complexMathml(ctx, second()[1], dg))}</mtr></mtable><mo>)</mo></mrow>`;
    const symTerm = (j: number) => `${plain ? sub(`<mi>${fN}</mi>`, String(j + 1)) : star(sub(`<mi>${fN}</mi>`, String(j + 1)))}${sub(`<mi>${sN}</mi>`, String(j + 1))}`;
    const hotJ = hot?.j;
    const termM = (j: number) => (hotJ === j ? `<mstyle mathvariant="bold">${'<mrow><mo>(</mo>' + complexMathml(ctx, tm[j], 2) + '<mo>)</mo></mrow>'}</mstyle>` : `<mrow><mo>(</mo>${complexMathml(ctx, tm[j], 2)}<mo>)</mo></mrow>`);
    const line1 = `<mrow>${rowSym}${sB}<mo>=</mo>${rowM}${colM}<mo>=</mo>${symTerm(0)}<mo>+</mo>${symTerm(1)}</mrow>`;
    const line2 = `<mrow><mo>=</mo>${termM(0)}<mo>+</mo>${termM(1)}<mo>=</mo><mrow>${complexMathml(ctx, res, 2)}</mrow></mrow>`;
    formula.innerHTML = geo.narrow ? `${m(line1)}<br>${m(line2)}` : m(`<mrow>${line1}${line2}</mrow>`);
    formula.style.fontSize = `${1.12 * fs}px`;
    formula.style.textAlign = 'center';
    place(formula, `translate(${(geo.W / 2).toFixed(1)}px, ${(geo.H - (geo.narrow ? 5.4 : 3.2) * fs).toFixed(1)}px) translate(-50%, -50%)`);
    // the remark the state calls for
    const vNonzero = first().some((z) => z[0] !== 0 || z[1] !== 0);
    const zeroLength = plain && lock && vNonzero && res[0] === 0 && res[1] === 0;
    const selfReal = !plain && lock && res[1] === 0;
    const deg = Math.round((theta * 180) / Math.PI);
    const turning = theta !== 0 && !plain;
    warn.textContent = zeroLength
      ? ctx.text('Ohne Stern: „Länge“ 0, obwohl v nicht der Nullvektor ist.', 'Without the star: “length” 0 although v is not the zero vector.')
      : turning && lock ? ctx.text(`v ↦ αv, α = e^(iθ), θ = ${deg}°: (αv)†(αv) = v†v bleibt, wo es ist.`, `v ↦ αv, α = e^(iθ), θ = ${deg}°: (αv)†(αv) = v†v stays where it is.`)
      : turning && swap ? ctx.text(`v ↦ αv, α = e^(iθ), θ = ${deg}°: w†(αv) = α·w†v dreht sich mit v (linear im zweiten Faktor).`, `v ↦ αv, α = e^(iθ), θ = ${deg}°: w†(αv) = α·w†v turns with v (linear in the second factor).`)
      : turning ? ctx.text(`v ↦ αv, α = e^(iθ), θ = ${deg}°: (αv)†w = α*·v†w dreht sich gegen v (antilinear im ersten Faktor).`, `v ↦ αv, α = e^(iθ), θ = ${deg}°: (αv)†w = α*·v†w turns against v (antilinear in the first factor).`)
      : selfReal ? ctx.text('w = v: jeder Summand ist |vⱼ|² ≥ 0, die Summe reell und nicht negativ.', 'w = v: every term is |vⱼ|² ≥ 0, the sum is real and not negative.')
        : plain ? ctx.text('Ohne Stern wird die Spalte nur umgelegt: Die offenen Kreise liegen auf den Einträgen selbst.', 'Without the star the column is only laid down: the open circles sit on the entries themselves.')
        : swap ? ctx.text('Vertauscht: w†v ist das Spiegelbild (v†w)* von v†w.', 'Swapped: w†v is the mirror image (v†w)* of v†w.') : '';
    warn.style.fontSize = `${0.95 * fs}px`;
    warn.style.color = zeroLength ? t.color('plate-ink') : t.color('plate-muted');
    warn.style.whiteSpace = 'normal'; warn.style.textAlign = 'center'; warn.style.width = `${(geo.W - 2 * fs).toFixed(0)}px`;
    place(warn, `translate(${(geo.W / 2).toFixed(1)}px, ${(geo.H - (geo.narrow ? 1.5 : 0.75) * fs).toFixed(1)}px) translate(-50%, -50%)`);
  };

  // ── dragging ────────────────────────────────────────────────────────────────────────────
  let drag: { kind: 'v' | 'w' | 'row'; j: number } | null = null;
  const pick = (x: number, y: number) => {
    const R = 1.25 * geo.fs;
    const cands: Array<{ kind: 'v' | 'w' | 'row'; j: number; d: number }> = [];
    const rw = row();
    for (const j of [0, 1]) {
      const add = (kind: 'v' | 'w' | 'row', z: Complex) => { const [px, py] = toE(z); const d = Math.hypot(px - x, py - y); if (d < R) cands.push({ kind, j, d }); };
      add('v', v[j]); add('w', w[j]); add('row', rw[j]);
    }
    cands.sort((a, b) => a.d - b.d || (a.kind === 'v' ? -1 : 1));
    return cands[0] ?? null;
  };
  const local = (e: PointerEvent) => { const b = stage.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top] as const; };
  const moveTo = (x: number, y: number) => {
    if (!drag) return;
    const z = fromE(x, y);
    if (drag.kind === 'row') {
      // the open circle is the conjugate of the first factor's entry (or the entry itself without the star)
      const target: Complex = plain ? z : conj(z);
      setEntry(swap ? 'w' : 'v', drag.j, target);
    } else setEntry(drag.kind, drag.j, z);
    presetCtl.set(null);
    ctx.invalidate();
  };
  const onDown = (e: PointerEvent) => {
    const [x, y] = local(e);
    const p = pick(x, y);
    if (!p) return;
    tw.still();
    drag = { kind: p.kind, j: p.j }; hot = drag;
    stage.setPointerCapture(e.pointerId);
    e.preventDefault();
    moveTo(x, y);
  };
  const onMove = (e: PointerEvent) => {
    const [x, y] = local(e);
    if (drag) { moveTo(x, y); return; }
    const p = pick(x, y);
    const h = p ? { kind: p.kind, j: p.j } : null;
    stage.style.cursor = p ? 'grab' : '';
    if (h?.kind !== hot?.kind || h?.j !== hot?.j) { hot = h; ctx.invalidate(); }
  };
  const onUp = () => {
    if (drag) {
      const tm = terms(), res = runningSums(tm)[1];
      ctx.announce(`${fName()}${plain ? 'ᵀ' : '†'}${sName()} = ${complexText(ctx, res, 2)}`);
    }
    drag = null;
  };
  const onLeave = () => { if (!drag && hot) { hot = null; ctx.invalidate(); } };
  stage.addEventListener('pointerdown', onDown);
  stage.addEventListener('pointermove', onMove);
  stage.addEventListener('pointerup', onUp);
  stage.addEventListener('pointercancel', onUp);
  stage.addEventListener('pointerleave', onLeave);
  stage.style.touchAction = 'none';

  return {
    render(_frame, time) {
      if (time !== now) tw.still();
      now = time;
      const t = theta0 + (2 * Math.PI * time) / TURN;
      theta = t - 2 * Math.PI * Math.floor(t / (2 * Math.PI));
      if (Math.abs(theta) < 1e-12 || Math.abs(theta - 2 * Math.PI) < 1e-12) theta = 0;
      refresh();
      phaseSlider.set((theta * 180) / Math.PI);
      paint();
    },
    resize() { gridKey = ''; paint(); },
    tokensChanged() { gridKey = ''; paint(); },
    destroy() {
      stage.removeEventListener('pointerdown', onDown); stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerup', onUp); stage.removeEventListener('pointercancel', onUp); stage.removeEventListener('pointerleave', onLeave);
      svg.remove(); layer.remove();
    },
    info: () => {
      const tm = terms(), res = runningSums(tm)[1];
      return { v: JSON.stringify(v), w: JSON.stringify(w), theta, swap, lock, plain, result: JSON.stringify(res), terms: JSON.stringify(tm), range };
    },
  };
}
