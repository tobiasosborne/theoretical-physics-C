// c11.demo.phase: a planar slice of psi(r) through the origin, for the states with n <= 2.
// Lightness shows the modulus |psi| (linear, relative to the largest modulus in the slice),
// hue shows the phase arg(psi) on a cyclic map built in OKLCH from the plate and state tokens
// (web/src/demos/c11/oklch.ts: constant lightness and chroma around the cycle; measured in
// web/tests/kernels/hydrogen-phasemap.test.ts). Where psi = 0 the picture is the plate
// itself; the nodal lines are also drawn. The time slider advances the phase by tau / n^2
// (stationary state, DERIVATION.md Result 1b.2): the colours turn, the lightness does not.
//
// 2D: a canvas for the slice and the legend, HTML labels. Every value comes from the kernel.
import type { DemoContext, DemoInstance, DemoMeta } from '../demo/types';
import {
  angularNodes, modulus, phase as argOf, psiState, radialNodes, radialQuantile, stationaryPhase, STATE_KEYS, STATES, timeUnitSeconds,
  type StateKey,
} from '../kernels/hydrogen';
import { captionBelow, choice, div, ensureStyle, fix, mn, mo, msup, row, stateText, svgEl, sym } from './c11/common';
import { makePhaseMap, type PhaseMap } from './c11/oklch';

export const meta: DemoMeta = { animated: true, aspect: 1.62, surface: 'plate' };

type Plane = 'xz' | 'xy';
const TAU_MAX = 4;          // the slider runs over tau from -4 pi to 4 pi: over this range the n = 2 states turn once
const TURN_SECONDS = 6;     // seconds of play for tau to advance by 2 pi: a drawing choice
const MAX_PIXELS = 420;     // side of the computed slice in pixels (upper limit): a drawing choice

export function mount(stage: HTMLElement, ctx: DemoContext): DemoInstance {
  ensureStyle();
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  const g2 = canvas.getContext('2d');
  if (!g2) throw new Error('c11.demo.phase: no 2D canvas');
  const svg = svgEl('svg', { 'aria-hidden': 'true' });
  const layer = div('c11-layer c11-plate-ink');
  stage.append(canvas, svg, layer);

  let key: StateKey = STATE_KEYS.includes(ctx.params.state as StateKey) ? (ctx.params.state as StateKey) : '2p+1';
  const defaultPlane = (k: StateKey): Plane => (k === '2p+1' || k === '2p-1' || k === '2py' ? 'xy' : 'xz');
  let plane: Plane = ctx.params.plane === 'xz' || ctx.params.plane === 'xy' ? ctx.params.plane : defaultPlane(key);
  let now = 0;
  let tau0 = Number(ctx.params.tau ?? '0') * Math.PI;   // tau at play time 0
  const tauAt = (time: number) => { const t = tau0 + (2 * Math.PI * time) / TURN_SECONDS + TAU_MAX * Math.PI; const m = 2 * TAU_MAX * Math.PI; return (((t % m) + m) % m) - TAU_MAX * Math.PI; };

  const planeCtl = { set: (_: Plane) => {} };
  choice<StateKey>(ctx, ctx.text('Zustand', 'state'), STATE_KEYS.map((k) => ({
    value: k, html: stateText(ctx, k).shortHtml,
    title: ctx.text(`Zustand ${stateText(ctx, k).short}`, `state ${stateText(ctx, k).short}`),
  })), key, (k) => { key = k; plane = defaultPlane(k); planeCtl.set(plane); });
  const pc = choice<Plane>(ctx, ctx.text('Schnittebene', 'plane of the slice'), [
    { value: 'xz', html: 'y = 0', title: ctx.text('Schnittebene y = 0 (x-z-Ebene)', 'plane y = 0 (x-z plane)') },
    { value: 'xy', html: 'z = 0', title: ctx.text('Schnittebene z = 0 (x-y-Ebene)', 'plane z = 0 (x-y plane)') },
  ], plane, (p) => { plane = p; });
  planeCtl.set = pc.set;
  const slider = ctx.ui.slider({
    label: ctx.text('Zeit tau = |E_1| t / hbar, in Vielfachen von pi', 'time tau = |E_1| t / hbar, in multiples of pi'),
    labelHtml: row('<math><mi>τ</mi></math>', mo('/'), '<math><mi>π</mi></math>'),
    min: -TAU_MAX, max: TAU_MAX, step: 0.125, value: tauAt(0) / Math.PI, primary: true,
    format: (v) => fix(ctx, v, 3),
    onInput: (v) => { tau0 = v * Math.PI - (2 * Math.PI * now) / TURN_SECONDS; },
  });
  const caption = captionBelow(ctx);

  let map: PhaseMap = makePhaseMap(ctx.tokens.rgb('plate'), ctx.tokens.rgb('state'));
  const aMu = sym(ctx, 'sym.bohr-radius-reduced');

  const draw = (time: number) => {
    const k = ctx.tokens;
    const box = stage.getBoundingClientRect();
    const W = Math.max(160, box.width), H = Math.max(120, box.height);
    const fs = Math.min(k.font('label').sizePx, W / 34);
    layer.replaceChildren(); svg.replaceChildren();
    layer.style.fontSize = `${fs}px`;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const s = STATES[key];
    const tau = tauAt(time);
    const dPhase = stationaryPhase(s.n, tau);
    // geometry: square plot on the left, legend on the right
    const mL = 3.0 * fs, mT = 1.9 * fs, mB = 2.8 * fs;
    const side = Math.min(H - mT - mB, W * 0.64 - mL);
    const x0 = mL, y0 = mT;
    const ext = Math.ceil(radialQuantile(s.n, s.l, 0.99));     // half-width of the window in a_mu: encloses 99 % radially
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    // one canvas over the whole stage; the slice and the legend are images inside it
    const cw = Math.round(W * dpr), ch = Math.round(H * dpr);
    if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
    g2.fillStyle = k.color('plate');
    g2.fillRect(0, 0, cw, ch);

    const N = Math.max(32, Math.min(MAX_PIXELS, Math.round(side * dpr)));
    const img = g2.createImageData(N, N);
    const re = new Float64Array(N * N), im = new Float64Array(N * N);
    let max = 0;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const u = ((i + 0.5) / N - 0.5) * 2 * ext, v = (0.5 - (j + 0.5) / N) * 2 * ext;     // u to the right, v up
      const c = plane === 'xz' ? psiState(key, u, 0, v) : psiState(key, u, v, 0);
      re[j * N + i] = c[0]; im[j * N + i] = c[1];
      const m = modulus(c);
      if (m > max) max = m;
    }
    for (let p = 0; p < N * N; p++) {
      const c: [number, number] = [re[p], im[p]];
      const str = max > 0 ? modulus(c) / max : 0;
      const b = map.bytes(argOf(c) + dPhase, str);
      img.data[4 * p] = b[0]; img.data[4 * p + 1] = b[1]; img.data[4 * p + 2] = b[2]; img.data[4 * p + 3] = 255;
    }
    const tmp = document.createElement('canvas');
    tmp.width = N; tmp.height = N;
    tmp.getContext('2d')!.putImageData(img, 0, 0);
    g2.imageSmoothingEnabled = true;
    g2.drawImage(tmp, Math.round(x0 * dpr), Math.round(y0 * dpr), Math.round(side * dpr), Math.round(side * dpr));

    // frame, ticks, axis names (components of the relative coordinate)
    const ink = k.color('plate-ink');
    const PX = (u: number) => x0 + ((u + ext) / (2 * ext)) * side, PY = (v: number) => y0 + ((ext - v) / (2 * ext)) * side;
    svg.append(svgEl('rect', { x: x0, y: y0, width: side, height: side, fill: 'none', stroke: k.color('plate-rule'), 'stroke-width': k.stroke('thin') }));
    const step = ext <= 6 ? 2 : 5;
    const text = (x: number, y: number, t: string, anchor: string) => {
      const e = svgEl('text', { x, y, 'text-anchor': anchor, fill: ink, 'font-size': fs * 0.9 });
      e.style.fontFamily = 'var(--tpc-family-label)'; e.textContent = t; svg.append(e);
    };
    for (let t = -Math.floor(ext / step) * step; t <= ext; t += step) {
      svg.append(svgEl('line', { x1: PX(t), y1: y0 + side, x2: PX(t), y2: y0 + side + 0.35 * fs, stroke: ink, 'stroke-width': k.stroke('thin') }));
      svg.append(svgEl('line', { x1: x0 - 0.35 * fs, y1: PY(t), x2: x0, y2: PY(t), stroke: ink, 'stroke-width': k.stroke('thin') }));
      text(PX(t), y0 + side + 1.35 * fs, String(t).replace('-', '−'), 'middle');
      text(x0 - 0.55 * fs, PY(t) + 0.32 * fs, String(t).replace('-', '−'), 'end');
    }
    const tag = (x: number, y: number, html: string, cls = '', align: 'left' | 'center' | 'right' = 'center') => {
      const d = div(`c11-tag ${cls}`, layer);
      d.innerHTML = html; d.style.left = `${x}px`; d.style.top = `${y}px`;
      d.style.transform = `translate(${align === 'left' ? '0' : align === 'center' ? '-50%' : '-100%'}, -50%)`;
    };
    const mi = (c: string) => `<math><mi>${c}</mi></math>`;
    tag(x0 + side / 2, y0 + side + 2.1 * fs, row(mi('x'), mo('/'), aMu));
    tag(x0 - 0.4 * fs, y0 - 0.95 * fs, row(mi(plane === 'xz' ? 'z' : 'y'), mo('/'), aMu), '', 'left');

    // nodal set in this plane (kernel: radialNodes, angularNodes), drawn as dashed hairlines
    const dash = k.dash('effect').join(' ');
    const nodeStroke = { stroke: ink, 'stroke-width': k.stroke('thin'), 'stroke-dasharray': dash, fill: 'none' };
    for (const r of radialNodes(s.n, s.l)) svg.append(svgEl('circle', { cx: PX(0), cy: PY(0), r: (r / (2 * ext)) * side, ...nodeStroke }));
    const { planes, lines } = angularNodes(key);
    const normal = plane === 'xz' ? [0, 1, 0] : [0, 0, 1];
    let wholePlane = false;
    const segment = (du: number, dv: number) => svg.append(svgEl('line', { x1: PX(-ext * du), y1: PY(-ext * dv), x2: PX(ext * du), y2: PY(ext * dv), ...nodeStroke }));
    for (const n of planes) {
      if (Math.abs(n[0] * normal[0] + n[1] * normal[1] + n[2] * normal[2]) === 1) { wholePlane = true; continue; }
      // intersection of the nodal plane with the slice: direction perpendicular to n inside the slice
      const nu = n[0], nv = plane === 'xz' ? n[2] : n[1];
      segment(-nv, nu);
    }
    for (const d of lines) {
      const du = d[0], dv = plane === 'xz' ? d[2] : d[1];
      if (du === 0 && dv === 0) svg.append(svgEl('circle', { cx: PX(0), cy: PY(0), r: 0.25 * fs, fill: k.color('plate'), stroke: ink, 'stroke-width': k.stroke('regular') }));
      else segment(du, dv);
    }
    if (wholePlane) tag(x0 + side / 2, y0 + side / 2, row(stateText(ctx, key).psi, mo('='), mn('0')) + ' ' + ctx.text('in dieser ganzen Ebene', 'in this whole plane'), 'c11-warn');

    // legend: a disc with the phase as angle and the strength as radius
    const lx = x0 + side + 1.4 * fs, lw = W - lx - 0.6 * fs;
    const rad = Math.max(12, Math.min(lw / 2 - 2.2 * fs, (H - mT - mB) / 2 - 3.2 * fs, 6.5 * fs));
    const cx = lx + lw / 2, cy = y0 + 0.6 * fs + rad + 1.3 * fs;
    const LN = Math.round(2 * rad * dpr);
    const limg = g2.createImageData(LN, LN);
    const plateBytes = map.bytes(0, 0);
    for (let j = 0; j < LN; j++) for (let i = 0; i < LN; i++) {
      const u = ((i + 0.5) / LN - 0.5) * 2, v = (0.5 - (j + 0.5) / LN) * 2;
      const rr = Math.hypot(u, v);
      const b = rr <= 1 ? map.bytes(Math.atan2(v, u), rr) : plateBytes;
      const p = 4 * (j * LN + i);
      limg.data[p] = b[0]; limg.data[p + 1] = b[1]; limg.data[p + 2] = b[2]; limg.data[p + 3] = 255;
    }
    g2.putImageData(limg, Math.round((cx - rad) * dpr), Math.round((cy - rad) * dpr));
    svg.append(svgEl('circle', { cx, cy, r: rad, fill: 'none', stroke: k.color('plate-rule'), 'stroke-width': k.stroke('thin') }));
    const pi = '<math><mi>π</mi></math>';
    tag(cx, y0 - 0.95 * fs, ctx.text('Farbton: ', 'hue: ') + row('<math><mi>arg</mi></math>', '<math><mi>ψ</mi></math>'));
    tag(cx + rad + 0.6 * fs, cy, mn('0'), '', 'left');
    tag(cx, cy - rad - 0.75 * fs, row(pi, mo('/'), mn('2')));
    tag(cx - rad - 0.6 * fs, cy, pi, '', 'right');
    tag(cx, cy + rad + 0.8 * fs, row(mo('−'), pi, mo('/'), mn('2')));
    tag(cx, cy + rad + 2.3 * fs, ctx.text('Helligkeit: ', 'lightness: ') + row(mo('|'), '<math><mi>ψ</mi></math>', mo('|')), 'c11-muted-plate');
    tag(cx, cy + rad + 3.5 * fs, ctx.text('Mitte 0, Rand Maximum', 'centre 0, rim maximum'), 'c11-muted-plate');

    const st = stateText(ctx, key);
    const tSec = tau * timeUnitSeconds();
    const E1 = row('<math><mo>|</mo></math>', '<math><msub><mi>E</mi><mn>1</mn></msub></math>', '<math><mo>|</mo></math>');
    const planeName = plane === 'xz' ? 'y = 0' : 'z = 0';
    caption.innerHTML = ctx.text(
      `Schnitt ${planeName} durch ${st.psi} (${st.quantum}), Z = 1; die Achsen sind Komponenten der Relativkoordinate ${sym(ctx, 'sym.relative-coordinate')} = ${sym(ctx, 'sym.electron-position')} − ${sym(ctx, 'sym.proton-position')} in ${aMu} (reduzierte Masse). `
      + `Gestrichelt: Knoten (${row('<math><mi>ψ</mi></math>', mo('='), mn('0'))}). Größter Betrag in diesem Schnitt: ${fix(ctx, max, 4)} ${msup(aMu, mn('−3/2'))}. `
      + `Zeit ${row('<math><mi>τ</mi></math>', mo('='), E1, '<math><mi>t</mi></math>', mo('/'), sym(ctx, 'sym.hbar'))} = ${fix(ctx, tau / Math.PI, 3)} π, also t = ${fix(ctx, tSec * 1e18, 1)} as (mit ${E1} zur reduzierten Masse); `
      + `die Phase ist um τ/n² = ${fix(ctx, dPhase / Math.PI, 3)} π weitergedreht, die Dichte bleibt gleich.`,
      `Slice ${planeName} through ${st.psi} (${st.quantum}), Z = 1; the axes are components of the relative coordinate ${sym(ctx, 'sym.relative-coordinate')} = ${sym(ctx, 'sym.electron-position')} − ${sym(ctx, 'sym.proton-position')} in ${aMu} (reduced mass). `
      + `Dashed: nodes (${row('<math><mi>ψ</mi></math>', mo('='), mn('0'))}). Largest modulus in this slice: ${fix(ctx, max, 4)} ${msup(aMu, mn('−3/2'))}. `
      + `Time ${row('<math><mi>τ</mi></math>', mo('='), E1, '<math><mi>t</mi></math>', mo('/'), sym(ctx, 'sym.hbar'))} = ${fix(ctx, tau / Math.PI, 3)} π, that is t = ${fix(ctx, tSec * 1e18, 1)} as (with ${E1} for the reduced mass); `
      + `the phase has advanced by τ/n² = ${fix(ctx, dPhase / Math.PI, 3)} π, the density is unchanged.`);
  };

  return {
    render(_frame, time) {
      now = time;
      slider.set(Math.round((tauAt(time) / Math.PI) * 1e6) / 1e6);
      draw(time);
    },
    tokensChanged() { map = makePhaseMap(ctx.tokens.rgb('plate'), ctx.tokens.rgb('state')); },
    info: () => ({ state: key, plane, tau_over_pi: tauAt(now) / Math.PI, map_L: map.L, map_C: map.C, map_hue0: map.hue0 }),
    destroy() { canvas.remove(); svg.remove(); layer.remove(); },
  };
}
