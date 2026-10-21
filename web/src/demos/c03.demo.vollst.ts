// c03.demo.vollst: the completeness relation, one vector resolved in two orthonormal bases
// (figure c03.fig.vollst, Kern section c03.s7: c03.prop.entwicklung, c03.ex.zwei-basen). 2D, SVG on
// the plate.
//
// REAL VECTORS IN THE PLANE. The demo keeps to the real plane spanned by |e_0> and |e_1> inside C^2
// (as the still does: all coefficients are real there). The state is the unit vector
// |Psi> = cos(alpha) |e_0> + sin(alpha) |e_1>; the second orthonormal basis is turned by the angle
// theta: phi_0 = (cos theta, sin theta), phi_1 = (sin theta, -cos theta), so theta = 45 degrees is
// {|e_+>, |e_->} of the still. Complex coefficients would need a second plane per coefficient and
// hide the point; the kernel functions (expansion, weights, components) take complex columns.
//
// LEFT (a): the two bases as axes; |Psi> (thick arrow, handle on the unit circle) and, for each basis,
// the components c_j |phi_j| with c_j = <phi_j|Psi>; the two components close to a rectangle whose
// diagonal is |Psi> (basis {e_0, e_1}: dashed, role q1; basis {phi_0, phi_1}: dotted, role q3).
// RIGHT (b): the weights |c_j|^2 as bar segments, one bar per basis; the dashed line is the common
// total ||Psi||^2 = 1. Below: the weights and their sums, from the kernel.
// DRAG |Psi| on the circle (alpha) and the handle at the tip of the axis phi_0 (theta); both have a
// slider for the keyboard. Hover a bar segment: its coefficient c_j = <phi_j|Psi>. PLAY turns |Psi|
// (the weights of both bases swing, the sums stay 1) or the basis (the weights of the second basis
// swing against a state that stays put). Presets: the figure, the basis adapted to |Psi> (weights 1
// and 0), the same basis twice (theta = 0).
//
// Every number shown is an input (the angles) or computed by web/src/kernels/hilbert.ts
// (unitVector, rotatedBasis, expansion, weights, components, totalWeight). Default state: the
// figure, alpha = arctan(1/2) (|Psi> = (2, 1)/sqrt 5), theta = 45 degrees: weights 4/5, 1/5 and 9/10, 1/10.
import type { DemoContext, DemoInstance, DemoMeta } from '../demo/types';
import { components, expansion, rotatedBasis, totalWeight, unitVector, weights } from '../kernels/hilbert';
import { arrow, choice, div, ensureStyle, fix, num, place, setAttrs, svgEl, tweener } from './c03/common';

export const meta: DemoMeta = { animated: true, aspect: 1.9, surface: 'plate' };

const TAU = 2 * Math.PI;
const TURN = 24;                 // seconds of play for one full turn: a drawing choice
const NARROW = 560;              // below this stage width (CSS px) the panels are stacked: a drawing choice
const U = 1.5;                   // half-width of the plane in units: a drawing choice
const AXIS = 1.3;                // length of the axes in units: a drawing choice
const ALPHA_FIG = Math.atan2(1, 2), THETA_FIG = Math.PI / 4;   // the figure: |Psi> = (2, 1)/sqrt 5, e_+-

type Key = 'fig' | 'adapted' | 'same';
const wrap = (x: number) => { const y = x - TAU * Math.floor(x / TAU); return y >= TAU ? 0 : y; };
const SUB = ['₀', '₁'];
type Hot = { kind: 'psi' } | { kind: 'basis' } | { kind: 'seg'; b: 0 | 1; j: 0 | 1 } | null;

export function mount(stage: HTMLElement, ctx: DemoContext): DemoInstance {
  ensureStyle();
  const svg = svgEl('svg', { 'aria-hidden': 'true' });
  const layer = div('c03-layer');
  stage.append(svg, layer);
  const tw = tweener(ctx, stage);
  const capture = Boolean(ctx.params.stage);

  // ── state ───────────────────────────────────────────────────────────────────────────────
  // shown angle = offset + (turning ? omega * time : 0); the reader's choices set the offsets
  const omega = TAU / TURN;
  let now = 0;
  let turns: 'psi' | 'basis' = ctx.params.turn === 'basis' ? 'basis' : 'psi';
  let aOff = ctx.params.alpha !== undefined ? wrap((Number(ctx.params.alpha) * Math.PI) / 180) : ALPHA_FIG;
  let tOff = ctx.params.theta !== undefined ? wrap((Number(ctx.params.theta) * Math.PI) / 180) : THETA_FIG;
  let alpha = aOff, theta = tOff;
  let startKey: Key | null = ctx.params.alpha === undefined && ctx.params.theta === undefined ? 'fig' : null;
  const shown = () => {
    alpha = wrap(aOff + (turns === 'psi' ? omega * now : 0));
    theta = wrap(tOff + (turns === 'basis' ? omega * now : 0));
  };
  shown();
  let hot: Hot = null;

  // the reader sets what is shown now; the turning angle keeps turning from there
  const setAlpha = (a: number) => { aOff = wrap(a - (turns === 'psi' ? omega * now : 0)); shown(); };
  const setTheta = (t: number) => { tOff = wrap(t - (turns === 'basis' ? omega * now : 0)); shown(); };

  // ── controls ────────────────────────────────────────────────────────────────────────────
  const presetCtl = choice<Key>(ctx, ctx.text('Beispiel', 'example'), [
    { value: 'fig', html: ctx.text('Abbildung', 'figure'), title: ctx.text('|Ψ⟩ = (2, 1)/√5 und die Basis |e₊⟩, |e₋⟩ (θ = 45°) wie in der Abbildung', '|Ψ⟩ = (2, 1)/√5 and the basis |e₊⟩, |e₋⟩ (θ = 45°) as in the figure') },
    { value: 'adapted', html: ctx.text('Basis passend zu Ψ', 'basis adapted to Ψ'), title: ctx.text('θ = α: |Ψ⟩ ist der erste Basisvektor, die Gewichte sind 1 und 0', 'θ = α: |Ψ⟩ is the first basis vector, the weights are 1 and 0') },
    { value: 'same', html: ctx.text('gleiche Basis', 'same basis'), title: ctx.text('θ = 0: die zweite Basis ist die erste, die Gewichte stimmen überein', 'θ = 0: the second basis is the first, the weights agree') },
  ], startKey, (k) => {
    tw.tween();
    if (k === 'fig') { setAlpha(ALPHA_FIG); setTheta(THETA_FIG); }
    else if (k === 'adapted') { setTheta(alpha); }
    else { setTheta(0); }
    syncSliders();
  });
  const turnCtl = choice<'psi' | 'basis'>(ctx, ctx.text('Beim Abspielen dreht sich', 'while playing, this turns'), [
    { value: 'psi', html: ctx.text('Vektor Ψ', 'the vector Ψ'), title: ctx.text('Abspielen dreht den Vektor |Ψ⟩ langsam um den Ursprung', 'play turns the vector |Ψ⟩ slowly about the origin') },
    { value: 'basis', html: ctx.text('zweite Basis', 'the second basis'), title: ctx.text('Abspielen dreht die zweite Basis langsam, |Ψ⟩ bleibt stehen', 'play turns the second basis slowly, |Ψ⟩ stays put') },
  ], turns, (k) => {
    // what is shown now stays; only the clock term moves to the other angle
    const a = alpha, t = theta;
    turns = k;
    setAlpha(a); setTheta(t);
    syncSliders();
  });
  const deg = (r: number) => (r * 180) / Math.PI;
  const alphaSlider = ctx.ui.slider({
    label: ctx.text('Winkel α des Vektors Ψ (cos α, sin α)', 'angle α of the vector Ψ = (cos α, sin α)'),
    labelHtml: '<math><mi>α</mi></math>' + ctx.text(' von ', ' of ') + '<math><mo>|</mo><mi mathvariant="normal">Ψ</mi><mo>⟩</mo></math>',
    min: 0, max: 360, step: 1, value: deg(alpha), primary: true,
    format: (d) => `${num(ctx, d, 1)}°`,
    onInput: (d) => { tw.still(); setAlpha((d * Math.PI) / 180); presetCtl.set(null); },
  });
  const thetaSlider = ctx.ui.slider({
    label: ctx.text('Drehwinkel θ der zweiten Basis (θ = 45° ist |e₊⟩, |e₋⟩)', 'rotation θ of the second basis (θ = 45° is |e₊⟩, |e₋⟩)'),
    labelHtml: '<math><mi>θ</mi></math>' + ctx.text(' der Basis ', ' of the basis ') + '<math><mo>{</mo><mo>|</mo><msub><mi>φ</mi><mn>0</mn></msub><mo>⟩</mo><mo>,</mo><mo>|</mo><msub><mi>φ</mi><mn>1</mn></msub><mo>⟩</mo><mo>}</mo></math>',
    min: 0, max: 360, step: 1, value: deg(theta),
    format: (d) => `${num(ctx, d, 1)}°`,
    onInput: (d) => { tw.still(); setTheta((d * Math.PI) / 180); presetCtl.set(null); },
  });
  const syncSliders = () => { alphaSlider.set(deg(alpha)); thetaSlider.set(deg(theta)); };

  // ── persistent drawing ──────────────────────────────────────────────────────────────────
  const gStatic = svgEl('g', {}, svg);
  const gRect = svgEl('g', {}, svg), gAxes = svgEl('g', {}, svg), gArrows = svgEl('g', {}, svg), gBars = svgEl('g', {}, svg);
  const gHandles = svgEl('g', {}, svg), gLabels = svgEl('g', {}, svg);
  const rectPath = [0, 1].map(() => svgEl('path', { fill: 'none', 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, gRect));
  const axisE = [0, 1].map(() => arrow(gAxes));
  const axisF = [0, 1].map(() => arrow(gAxes));
  const comp = [0, 1].map(() => [0, 1].map(() => arrow(gArrows)));
  const psiArrow = arrow(gArrows);
  const handle = () => { const g = svgEl('g', { class: 'c03-move' }, gHandles); const el = svgEl('circle', { cx: 0, cy: 0 }, g); return { g, el }; };
  const psiHandle = handle(), basisHandle = handle();
  const label = () => {
    const g = svgEl('g', { class: 'c03-move' }, gLabels);
    const t = svgEl('text', {}, g);
    t.style.fontFamily = 'var(--tpc-family-label)';
    return { g, t };
  };
  const nameE = [label(), label()], nameF = [label(), label()], nameP = label(), compLab = [[label(), label()], [label(), label()]];
  const titleA = label(), titleB = label();
  const segRect = [0, 1].map(() => [0, 1].map(() => svgEl('rect', { class: 'c03-move', x: 0, y: 0, width: 1, 'vector-effect': 'non-scaling-stroke' }, gBars)));
  const barFrame = [0, 1].map(() => svgEl('rect', { fill: 'none' }, gBars));
  const barHead = [label(), label()], segLab = [[label(), label()], [label(), label()]];
  const totalLine = svgEl('line', { 'stroke-dasharray': '5 3.5' }, gBars), totalLab = label();
  const lines = [div('c03-tag', layer), div('c03-tag', layer), div('c03-tag c03-hot', layer)];

  let geo = { W: 1, H: 1, fs: 12, cx: 0, cy: 0, k: 1, side: 1, bx: 0, by: 0, bw: 1, rowPitch: 1, barH: 1, ty: 0, narrow: false, lineY: 0 };
  const toA = (x: number, y: number): [number, number] => [geo.cx + geo.k * x, geo.cy - geo.k * y];
  const layout = () => {
    let box = stage.getBoundingClientRect();
    const narrow = !capture && box.width > 0 && box.width < NARROW;
    const want = narrow ? '0.62' : String(meta.aspect);
    if (!capture && stage.style.aspectRatio !== want) { stage.style.aspectRatio = want; box = stage.getBoundingClientRect(); }
    const W = Math.max(200, box.width), H = Math.max(160, box.height);
    const fs = Math.min(ctx.tokens.font('label').sizePx, narrow ? W / 27 : W / 44);
    const titleH = 2.6 * fs, readH = (narrow ? 8.2 : 5.4) * fs;
    let side: number, cx: number, cy: number, bx: number, by: number, bw: number;
    if (narrow) {
      const barsH = 12.5 * fs;
      side = Math.max(120, Math.min(W - 1.5 * fs, H - titleH - readH - titleH - barsH));
      cx = W / 2; cy = titleH + side / 2;
      bw = Math.min(W - 3 * fs, 26 * fs); bx = (W - bw) / 2; by = titleH + side + titleH + 1.6 * fs;
      geo = { W, H, fs, cx, cy, k: side / (2 * U), side, bx, by, bw, rowPitch: 5.6 * fs, barH: 1.7 * fs, ty: 1.2 * fs, narrow, lineY: titleH + side + 1.1 * fs };
    } else {
      side = Math.max(120, Math.min(H - titleH - readH, W * 0.5));
      bw = Math.max(10 * fs, Math.min(W - side - 7 * fs, 27 * fs));
      const total = side + 3.2 * fs + bw, left = (W - total) / 2;
      cx = left + side / 2; cy = titleH + side / 2;
      bx = left + side + 3.2 * fs; by = cy - 4.2 * fs;
      geo = { W, H, fs, cx, cy, k: side / (2 * U), side, bx, by, bw, rowPitch: 5.6 * fs, barH: 1.7 * fs, ty: 1.2 * fs, narrow, lineY: 0 };
    }
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  };

  const text = (l: ReturnType<typeof label>, x: number, y: number, s: string, anchor: 'start' | 'end' | 'middle', fill: string, size = 1, weight = '400') => {
    const wEst = 0.56 * size * geo.fs * [...s].length, pad = 0.3 * geo.fs;
    if (anchor === 'start') x = Math.min(x, geo.W - pad - wEst);
    else if (anchor === 'end') x = Math.max(x, pad + wEst);
    else x = Math.max(pad + wEst / 2, Math.min(geo.W - pad - wEst / 2, x));
    place(l.g, `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`);
    setAttrs(l.t, { x: 0, y: 0, 'text-anchor': anchor, fill, 'font-size': size * geo.fs, 'font-weight': weight, stroke: ctx.tokens.color('plate'), 'stroke-width': 0.28 * geo.fs, 'stroke-linejoin': 'round', 'paint-order': 'stroke' });
    if (l.t.textContent !== s) l.t.textContent = s;
  };

  let staticKey = '';
  const drawStatic = () => {
    const t = ctx.tokens;
    gStatic.replaceChildren();
    const [x0, y0] = toA(0, 0);
    svgEl('circle', { cx: x0, cy: y0, r: geo.k, fill: 'none', stroke: t.color('plate-rule'), 'stroke-width': t.stroke('thin'), 'stroke-dasharray': '2 4' }, gStatic);
  };

  let segGeo: Array<Array<{ x: number; y: number; w: number; h: number }>> = [[], []];
  let model = { c: [[[0, 0], [0, 0]], [[0, 0], [0, 0]]] as Array<Array<readonly [number, number]>>, w: [[0, 0], [0, 0]] as number[][], tot: [1, 1], parts: [] as number[][][][], psi: [0, 0] };

  const paint = () => {
    layout();
    const t = ctx.tokens, fs = geo.fs;
    const ink = t.color('plate-ink'), plate = t.color('plate'), muted = t.color('plate-muted'), state = t.color('state'), q1 = t.color('q1'), q3 = t.color('q3');
    const key = [geo.W, geo.H, t.pkg, t.ground].join('|');
    if (key !== staticKey) { staticKey = key; drawStatic(); }

    // the kernel: both bases, the coefficients, the weights, the components
    const psi = unitVector(alpha);
    const bases = [rotatedBasis(0), rotatedBasis(theta)];
    const cs = bases.map((b) => expansion(b, psi));
    const ws = cs.map(weights);
    const parts = bases.map((b, i) => components(b, cs[i]).map((v) => v.map((z) => z[0])));
    const tot = ws.map(totalWeight);
    model = { c: cs as never, w: ws, tot, parts: parts as never, psi: psi.map((z) => z[0]) };
    const is45 = Math.abs(theta - Math.PI / 4) < 1e-9;
    const nm = [[`e${SUB[0]}`, `e${SUB[1]}`], is45 ? ['e₊', 'e₋'] : [`φ${SUB[0]}`, `φ${SUB[1]}`]];
    const cn = [[`c${SUB[0]}`, `c${SUB[1]}`], is45 ? ['c₊', 'c₋'] : [`c′${SUB[0]}`, `c′${SUB[1]}`]];
    const cols = [q1, q3];
    const hotSeg = hot?.kind === 'seg' ? hot : null;

    // ── (a) the plane ──
    const [ox, oy] = toA(0, 0);
    // rectangles: 0, c_0 phi_0, Psi, c_1 phi_1
    [0, 1].forEach((b) => {
      const p0 = toA(parts[b][0][0], parts[b][0][1]), p1 = toA(parts[b][1][0], parts[b][1][1]), pp = toA(model.psi[0], model.psi[1]);
      rectPath[b].setAttribute('d', `M ${ox.toFixed(2)} ${oy.toFixed(2)} L ${p0[0].toFixed(2)} ${p0[1].toFixed(2)} L ${pp[0].toFixed(2)} ${pp[1].toFixed(2)} L ${p1[0].toFixed(2)} ${p1[1].toFixed(2)} Z`);
      setAttrs(rectPath[b], { stroke: cols[b], 'stroke-width': t.stroke('thin'), 'stroke-dasharray': b === 0 ? '6 4' : '1.2 4' });
    });
    // axes: e_0, e_1 fixed (ink), phi_0, phi_1 turned (q3)
    const ends: Array<[number, number]> = [[AXIS, 0], [0, AXIS]];
    const fb = bases[1].map((v) => [v[0][0] * AXIS, v[1][0] * AXIS] as [number, number]);
    [0, 1].forEach((j) => {
      const e = toA(ends[j][0], ends[j][1]);
      setAttrs(axisE[j].shaft, { stroke: ink, 'stroke-width': t.stroke('thin') }); setAttrs(axisE[j].head, { fill: ink });
      axisE[j].set(ox, oy, e[0], e[1], 0.5 * fs);
      const f = toA(fb[j][0], fb[j][1]);
      setAttrs(axisF[j].shaft, { stroke: q3, 'stroke-width': t.stroke('thin') }); setAttrs(axisF[j].head, { fill: q3 });
      axisF[j].set(ox, oy, f[0], f[1], 0.5 * fs);
    });
    // components and the state
    [0, 1].forEach((b) => [0, 1].forEach((j) => {
      const a = comp[b][j], v = parts[b][j];
      const p = toA(v[0], v[1]);
      const on = hotSeg !== null && hotSeg.b === b && hotSeg.j === j;
      setAttrs(a.shaft, { stroke: cols[b], 'stroke-width': t.stroke(on ? 'state' : 'regular'), 'stroke-linecap': 'butt' });
      setAttrs(a.head, { fill: cols[b] });
      a.set(ox, oy, p[0], p[1], 0.62 * fs);
      a.g.style.opacity = Math.hypot(v[0], v[1]) < 1e-9 ? '0' : '1';
    }));
    const pp = toA(model.psi[0], model.psi[1]);
    setAttrs(psiArrow.shaft, { stroke: state, 'stroke-width': t.stroke('state'), 'stroke-linecap': 'butt' });
    setAttrs(psiArrow.head, { fill: state });
    psiArrow.set(ox, oy, pp[0], pp[1], 0.8 * fs);
    // handles: Psi on the circle, the second basis at the tip of phi_0
    const r = 0.5 * fs;
    const hp = hot?.kind === 'psi', hb = hot?.kind === 'basis';
    place(psiHandle.g, `translate(${pp[0].toFixed(2)}px, ${pp[1].toFixed(2)}px)`);
    setAttrs(psiHandle.el, { r: hp ? 1.2 * r : r, fill: state, stroke: hp ? ink : plate, 'stroke-width': t.stroke(hp ? 'regular' : 'thin') });
    const bt = toA(fb[0][0] * 1.0, fb[0][1] * 1.0);
    place(basisHandle.g, `translate(${bt[0].toFixed(2)}px, ${bt[1].toFixed(2)}px)`);
    setAttrs(basisHandle.el, { r: hb ? 1.25 * r : 1.05 * r, fill: plate, stroke: q3, 'stroke-width': t.stroke(hb ? 'state' : 'regular') });

    // labels of the plane
    const near = (j: number) => {
      // the turned axis j is within 9 degrees of an axis e (either sign): its name would sit on the name of the e axis
      const a = Math.atan2(fb[j][1], fb[j][0]);
      return [0, Math.PI / 2, Math.PI, -Math.PI / 2].some((q) => Math.abs(Math.atan2(Math.sin(a - q), Math.cos(a - q))) < 0.157);
    };
    const nearPsi = (j: number) => {
      const a = Math.atan2(fb[j][1], fb[j][0]) - alpha;
      return Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) < 0.157;
    };
    const place1 = (l: ReturnType<typeof label>, x: number, y: number, ux: number, uy: number, s: string, fill: string, off: number, size = 1, weight = '400') => {
      // a label beyond the point (x, y) of the plane, in direction (ux, -uy screen), on the side of the direction
      const [sx, sy] = toA(x, y);
      const dx = ux * off, dy = -uy * off;
      const anchor = ux > 0.35 ? 'start' : ux < -0.35 ? 'end' : 'middle';
      text(l, sx + dx, sy + dy + 0.35 * fs + (uy < -0.3 ? 0.4 * fs : 0), s, anchor, fill, size, weight);
    };
    [0, 1].forEach((j) => {
      place1(nameE[j], ends[j][0], ends[j][1], j === 0 ? 1 : 0, j === 0 ? 0 : 1, `|${nm[0][j]}⟩`, ink, 0.55 * fs);
      const hide = near(j);
      const ux = fb[j][0] / AXIS, uy = fb[j][1] / AXIS;
      place1(nameF[j], fb[j][0], fb[j][1], ux, uy, `|${nm[1][j]}⟩`, q3, 1.1 * fs);
      nameF[j].g.style.opacity = hide || nearPsi(j) ? '0' : '1';
      nameF[j].g.classList.add('c03-fade');
    });
    place1(nameP, model.psi[0], model.psi[1], Math.cos(alpha + 1.05), Math.sin(alpha + 1.05), '|Ψ⟩', state, 1.0 * fs, 1.08, '600');
    [0, 1].forEach((b) => [0, 1].forEach((j) => {
      const v = parts[b][j], other = parts[b][1 - j];
      const len = Math.hypot(v[0], v[1]), ol = Math.hypot(other[0], other[1]) || 1;
      // beside the middle of the arrow, away from the rectangle (opposite to the other component)
      let ux = -other[0] / ol, uy = -other[1] / ol;
      if (ol < 1e-9) { ux = -v[1] / (len || 1); uy = v[0] / (len || 1); }
      const on = hotSeg !== null && hotSeg.b === b && hotSeg.j === j;
      place1(compLab[b][j], v[0] / 2, v[1] / 2, ux, uy, `${cn[b][j]}|${nm[b][j]}⟩`, cols[b], 0.5 * fs, 0.95, on ? '600' : '400');
      compLab[b][j].g.style.opacity = len < 0.14 ? '0' : '1';
      compLab[b][j].g.classList.add('c03-fade');
    }));
    text(titleA, geo.cx, geo.ty, ctx.text('(a) Ein Vektor, zwei Basen', '(a) One vector, two bases'), 'middle', ink, 1);

    // ── (b) the weights ──
    const rows = [0, 1];
    rows.forEach((b) => {
      const y = geo.by + b * geo.rowPitch;
      const w = ws[b];
      const x1 = geo.bx + geo.bw * w[0];
      segGeo[b] = [{ x: geo.bx, y, w: geo.bw * w[0], h: geo.barH }, { x: x1, y, w: geo.bw * w[1], h: geo.barH }];
      [0, 1].forEach((j) => {
        const s = segGeo[b][j];
        const on = hotSeg !== null && hotSeg.b === b && hotSeg.j === j;
        place(segRect[b][j], `translate(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px) scale(${Math.max(s.w, 0.0001).toFixed(3)}, 1)`);
        setAttrs(segRect[b][j], { height: s.h, fill: cols[b], 'fill-opacity': j === 0 ? 0.55 : 0.18, stroke: on ? ink : t.color('plate-rule'), 'stroke-width': on ? t.stroke('regular') : t.stroke('hair') });
      });
      setAttrs(barFrame[b], { x: geo.bx, y, width: geo.bw, height: geo.barH, stroke: muted, 'stroke-width': t.stroke('thin') });
      text(barHead[b], geo.bx, y - 0.45 * fs, `{|${nm[b][0]}⟩, |${nm[b][1]}⟩}`, 'start', cols[b] === q1 ? ink : ink, 0.98, '600');
      text(segLab[b][0], geo.bx, y + geo.barH + 1.35 * fs, `|${cn[b][0]}|² = ${fix(ctx, w[0], 3)}`, 'start', ink, 0.95, hotSeg?.b === b && hotSeg.j === 0 ? '600' : '400');
      text(segLab[b][1], geo.bx + geo.bw, y + geo.barH + 1.35 * fs, `|${cn[b][1]}|² = ${fix(ctx, w[1], 3)}`, 'end', ink, 0.95, hotSeg?.b === b && hotSeg.j === 1 ? '600' : '400');
      for (const l of [segLab[b][0], segLab[b][1]]) l.g.classList.add('c03-fade');
    });
    const topY = geo.by - 1.7 * fs, botY = geo.by + geo.rowPitch + geo.barH + 0.5 * fs;
    setAttrs(totalLine, { x1: geo.bx + geo.bw, x2: geo.bx + geo.bw, y1: topY + 0.4 * fs, y2: botY, stroke: ink, 'stroke-width': t.stroke('thin') });
    text(totalLab, geo.bx + geo.bw, topY, '⟨Ψ|Ψ⟩ = 1', 'end', ink, 0.98);
    text(titleB, geo.bx + geo.bw / 2, geo.narrow ? geo.lineY : geo.ty, ctx.text('(b) Gewichte |cⱼ|²', '(b) Weights |cⱼ|²'), 'middle', ink, 1);

    // ── the readout ──
    lines[0].textContent = `{|${nm[0][0]}⟩, |${nm[0][1]}⟩}:  |${cn[0][0]}|² + |${cn[0][1]}|² = ${fix(ctx, ws[0][0], 3)} + ${fix(ctx, ws[0][1], 3)} = ${fix(ctx, tot[0], 3)}`;
    lines[1].textContent = `{|${nm[1][0]}⟩, |${nm[1][1]}⟩}:  |${cn[1][0]}|² + |${cn[1][1]}|² = ${fix(ctx, ws[1][0], 3)} + ${fix(ctx, ws[1][1], 3)} = ${fix(ctx, tot[1], 3)}`;
    lines[0].style.color = ink; lines[1].style.color = ink;
    lines[2].style.color = muted; lines[2].style.fontWeight = '400';
    if (hotSeg) {
      const c = cs[hotSeg.b][hotSeg.j][0];
      lines[2].textContent = `${cn[hotSeg.b][hotSeg.j]} = ⟨${nm[hotSeg.b][hotSeg.j]}|Ψ⟩ = ${fix(ctx, c, 3)},  |${cn[hotSeg.b][hotSeg.j]}|² = ${fix(ctx, ws[hotSeg.b][hotSeg.j], 3)}`;
      lines[2].style.color = ink;
    } else {
      lines[2].textContent = ctx.text(
        `α = ${num(ctx, deg(alpha), 1)}°, θ = ${num(ctx, deg(theta), 1)}°: jede Basis zerlegt denselben |Ψ⟩; die Aufteilung ändert sich, die Summe nicht.`,
        `α = ${num(ctx, deg(alpha), 1)}°, θ = ${num(ctx, deg(theta), 1)}°: each basis resolves the same |Ψ⟩; the split changes, the sum does not.`);
    }
    [0, 1, 2].forEach((i) => {
      lines[i].style.fontSize = `${(i === 2 ? 0.95 : 1.05) * fs}px`;
      lines[i].style.textAlign = 'center';
      lines[i].style.whiteSpace = 'normal';
      lines[i].style.width = `${(geo.W - 2 * fs).toFixed(0)}px`;
      const top = geo.H - (geo.narrow ? 7.4 : 4.9) * fs + 1.45 * i * fs;
      place(lines[i], `translate(${(geo.W / 2).toFixed(1)}px, ${top.toFixed(1)}px) translate(-50%, 0)`);
    });
  };

  // ── dragging ────────────────────────────────────────────────────────────────────────────
  let drag: 'psi' | 'basis' | null = null;
  const local = (e: PointerEvent) => { const b = stage.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top] as const; };
  const pick = (x: number, y: number): Hot => {
    const R = 1.3 * geo.fs;
    const pp = toA(model.psi[0], model.psi[1]);
    const fb = rotatedBasis(theta)[0];
    const bt = toA(fb[0][0], fb[1][0]);
    const dp = Math.hypot(pp[0] - x, pp[1] - y), db = Math.hypot(bt[0] - x, bt[1] - y);
    if (dp < R && dp <= db) return { kind: 'psi' };
    if (db < R) return { kind: 'basis' };
    for (const b of [0, 1] as const) for (const j of [0, 1] as const) {
      const s = segGeo[b][j];
      if (s && s.w > 0 && x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) return { kind: 'seg', b, j };
    }
    return null;
  };
  const moveTo = (x: number, y: number) => {
    if (!drag) return;
    const a = wrap(Math.atan2(-(y - geo.cy), x - geo.cx));
    if (drag === 'psi') setAlpha(a); else setTheta(a);
    presetCtl.set(null);
    syncSliders();
    ctx.invalidate();
  };
  const onDown = (e: PointerEvent) => {
    const [x, y] = local(e);
    const p = pick(x, y);
    if (!p || p.kind === 'seg') return;
    tw.still();
    drag = p.kind; hot = p;
    stage.setPointerCapture(e.pointerId);
    e.preventDefault();
    moveTo(x, y);
  };
  const onMove = (e: PointerEvent) => {
    const [x, y] = local(e);
    if (drag) { moveTo(x, y); return; }
    const p = pick(x, y);
    stage.style.cursor = p && p.kind !== 'seg' ? 'grab' : '';
    const same = (a: Hot, b: Hot) => JSON.stringify(a) === JSON.stringify(b);
    if (!same(p, hot)) { hot = p; ctx.invalidate(); }
  };
  const onUp = () => {
    if (drag) ctx.announce(ctx.text(
      `α = ${num(ctx, deg(alpha), 1)}°, θ = ${num(ctx, deg(theta), 1)}°: Gewichte ${fix(ctx, model.w[0][0], 3)}, ${fix(ctx, model.w[0][1], 3)} und ${fix(ctx, model.w[1][0], 3)}, ${fix(ctx, model.w[1][1], 3)}; Summe 1`,
      `α = ${num(ctx, deg(alpha), 1)}°, θ = ${num(ctx, deg(theta), 1)}°: weights ${fix(ctx, model.w[0][0], 3)}, ${fix(ctx, model.w[0][1], 3)} and ${fix(ctx, model.w[1][0], 3)}, ${fix(ctx, model.w[1][1], 3)}; sum 1`));
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
      shown();
      syncSliders();
      paint();
    },
    resize() { staticKey = ''; paint(); },
    tokensChanged() { staticKey = ''; paint(); },
    destroy() {
      stage.removeEventListener('pointerdown', onDown); stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerup', onUp); stage.removeEventListener('pointercancel', onUp); stage.removeEventListener('pointerleave', onLeave);
      svg.remove(); layer.remove();
    },
    info: () => ({ alpha, theta, turns, weights0: JSON.stringify(model.w[0]), weights1: JSON.stringify(model.w[1]), total0: model.tot[0], total1: model.tot[1] }),
  };
}
