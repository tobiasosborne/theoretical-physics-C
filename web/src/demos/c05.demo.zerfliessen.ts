// c05.demo.zerfliessen: three Gaussian packets spread in position space while their momentum
// densities stay put (figure c05.fig.fourier, set in motion; design docs/plan/lec78/DEMOS.md 2.1).
// 2D, SVG on the plate; animated.
//
// LEFT (a): |Psi(x,t)|^2 of the packets sigma0/2, sigma0, 2 sigma0 (roles q1, q2, q3; solid, dashed,
// dotted, as in the still) with their +-sigma_t rulers in a strip above the curves. RIGHT (b):
// |Phi(p,t)|^2 of the same packets with +-sigma_p rulers; it does not change with t
// (c05.eq.impulszeit). The chosen packet is drawn strong, the others faint. "Phase" overlays
// Re Phi(p,t) and +-|Phi| of the chosen packet in (b): the phase exp(-i p^2 t/2m hbar) winds faster
// and faster under a fixed envelope, which is step 2 of the three steps and all of the dynamics.
// The carrier k0 moves every packet at the same speed in (a) and the curves in (b) to p = hbar k0.
// PLAY: t runs from 0 to 2 tau0 in 8 seconds (a drawing choice) and holds. The slider also reaches
// back to t = -2 tau0: c05.eq.zerfliessen holds for negative t as well, so the packet was wider
// before t = 0 and has been focusing; t = 0 is its narrowest moment.
//
// Units (kernel particle.ts): x in sigma0, p in hbar/sigma0, t in tau0 = 2 m sigma0^2/hbar. Every
// number shown is an input (t, k0, the packet) or computed by web/src/kernels/particle.ts.
// Default state: the still (t = 0, k0 = 0, middle packet chosen, phase off).
import type { DemoContext, DemoInstance, DemoMeta } from '../demo/types';
import { freeDensity, momentumDensity, momentumPhi, momentumWidth, outsideWindow, packetCentre, spreadTime, spreadWidth, widthProduct } from '../kernels/particle';
import { choice, ensureStyle, fix, num, svgEl, toggle } from './c03/common';
import { label, pathD, scale } from './c03/plot';

export const meta: DemoMeta = { animated: true, aspect: 1.9, surface: 'plate' };

const SIGMAS = [0.5, 1, 2] as const;
const ROLES = ['q1', 'q2', 'q3'] as const;
const DASH = ['', '6 3', '1.5 3'];
const X_MAX = 10, U_MAX = 2.5, T_MAX = 2;
const PERIOD = 9, RUN = 8;             // seconds: t runs 0 -> 2 in RUN, then holds until PERIOD
const SAMPLES = 300;

export function mount(stage: HTMLElement, ctx: DemoContext): DemoInstance {
  ensureStyle();
  const svg = svgEl('svg', { 'aria-hidden': 'true' });
  svg.style.position = 'absolute'; svg.style.inset = '0'; svg.style.width = '100%'; svg.style.height = '100%';
  stage.append(svg);

  const p = ctx.params;
  let chosen = Math.max(0, Math.min(2, Math.round(Number(p.packet ?? '1')) || 0));
  if (p.packet === undefined) chosen = 1;
  let k0 = Math.max(-1, Math.min(1, Number(p.k0 ?? '0') || 0));
  let showPhase = p.phase === '1';
  // the clock: t = T_MAX * min(1, phase * PERIOD / RUN), phase in [0, 1); the slider moves the offset
  // the slider can set t < 0: then the clock runs from there up to T_MAX before it wraps to 0
  let t0 = Math.max(-T_MAX, Math.min(T_MAX, Number(p.t ?? '0') || 0)), base = 0;
  let now = 0, tNow = t0;
  const tAt = (time: number) => {
    const dt = time - base;
    if (t0 < 0) { const t = t0 + (dt * T_MAX) / RUN; if (t <= 0) return t; return tFrom(0, (t * RUN) / T_MAX); }
    return tFrom(t0, dt);
  };
  const tFrom = (start: number, dt: number) => { const ph = dt / PERIOD + (start / T_MAX) * (RUN / PERIOD); const f = ph - Math.floor(ph); return T_MAX * Math.min(1, (f * PERIOD) / RUN); };

  const tSlider = ctx.ui.slider({
    label: ctx.text('Zeit t in Einheiten von τ₀ = 2mσ₀²/ħ', 'time t in units of τ₀ = 2mσ₀²/ħ'),
    labelHtml: '<math><mi>t</mi><mo>/</mo><msub><mi>τ</mi><mn>0</mn></msub></math>',
    min: -T_MAX, max: T_MAX, step: 0.01, value: t0, primary: true,
    format: (v) => fix(ctx, v, 2),
    onInput: (v) => { t0 = v; base = now; },
  });
  const sig = (s: string) => `<math><mi>σ</mi><mo>=</mo>${s}</math>`;
  choice<string>(ctx, ctx.text('Paket', 'packet'), [
    { value: '0', html: sig('<msub><mi>σ</mi><mn>0</mn></msub><mo>/</mo><mn>2</mn>'), title: ctx.text('das schmale Paket, σ = σ₀/2', 'the narrow packet, σ = σ₀/2') },
    { value: '1', html: sig('<msub><mi>σ</mi><mn>0</mn></msub>'), title: ctx.text('das mittlere Paket, σ = σ₀', 'the middle packet, σ = σ₀') },
    { value: '2', html: sig('<mn>2</mn><msub><mi>σ</mi><mn>0</mn></msub>'), title: ctx.text('das breite Paket, σ = 2σ₀', 'the wide packet, σ = 2σ₀') },
  ], String(chosen), (v) => { chosen = Number(v); });
  toggle(ctx, ctx.text('Phase', 'phase'), null, showPhase, (on) => { showPhase = on; });
  ctx.ui.slider({
    label: ctx.text('Trägerwellenzahl k₀ in Einheiten von 1/σ₀', 'carrier wave number k₀ in units of 1/σ₀'),
    labelHtml: '<math><msub><mi>k</mi><mn>0</mn></msub><msub><mi>σ</mi><mn>0</mn></msub></math>',
    min: -1, max: 1, step: 0.25, value: k0, format: (v) => fix(ctx, v, 2),
    onInput: (v) => { k0 = v; },
  });
  const sub0 = (b: string) => `<msub><mi>${b}</mi><mn>0</mn></msub>`;
  const rTau = ctx.ui.readout(ctx.text('Zerfließzeit τ/τ₀', 'spreading time τ/τ₀'), `<math><mi>τ</mi><mo>/</mo>${sub0('τ')}</math>`);
  const rSt = ctx.ui.readout(ctx.text('Breite σ_t/σ₀', 'width σ_t/σ₀'), `<math><msub><mi>σ</mi><mi>t</mi></msub><mo>/</mo>${sub0('σ')}</math>`);
  const rSp = ctx.ui.readout(ctx.text('Impulsbreite σ_p σ₀/ħ', 'momentum width σ_p σ₀/ħ'), `<math><msub><mi>σ</mi><mi>p</mi></msub>${sub0('σ')}<mo>/</mo><mi>ħ</mi></math>`);
  const rPr = ctx.ui.readout(ctx.text('Produkt σ_t σ_p/ħ', 'product σ_t σ_p/ħ'), '<math><msub><mi>σ</mi><mi>t</mi></msub><msub><mi>σ</mi><mi>p</mi></msub><mo>/</mo><mi>ħ</mi></math>');

  const paint = () => {
    const k = ctx.tokens;
    let box = stage.getBoundingClientRect();
    const narrow = !p.stage && box.width > 0 && box.width < 560;
    const want = narrow ? '0.62' : String(meta.aspect);
    if (!p.stage && stage.style.aspectRatio !== want) { stage.style.aspectRatio = want; box = stage.getBoundingClientRect(); }
    const W = Math.max(260, box.width), H = Math.max(160, box.height);
    const fs = Math.min(k.font('label').sizePx, W / (narrow ? 30 : 48));
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.replaceChildren();
    const ink = k.color('plate-ink'), muted = k.color('plate-muted');
    const t = tNow;

    // panel boxes [x0, x1] x [yTop, yBase]
    const top = 2.6 * fs, gap = narrow ? 0 : 5 * fs;
    const panels = narrow
      ? [{ x0: 1.2 * fs, x1: W - 1.2 * fs, yTop: top, yBase: H / 2 - 2.6 * fs }, { x0: 1.2 * fs, x1: W - 1.2 * fs, yTop: H / 2 + 1.6 * fs, yBase: H - 2.4 * fs }]
      : [{ x0: 1.2 * fs, x1: (W - gap) / 2, yTop: top, yBase: H - 2.6 * fs }, { x0: (W + gap) / 2, x1: W - 1.2 * fs, yTop: top, yBase: H - 2.6 * fs }];
    const line = (x1: number, y1: number, x2: number, y2: number, stroke: string, w: number, extra: Record<string, string | number> = {}) =>
      svgEl('line', { x1, y1, x2, y2, stroke, 'stroke-width': w, ...extra }, svg);

    const drawPanel = (i: 0 | 1) => {
      const P = panels[i];
      const span = i === 0 ? X_MAX : U_MAX;
      const sx = scale('lin', -span, span, P.x0, P.x1);
      const rowH = 1.05 * fs;
      const strip = P.yTop + 1.4 * fs + 3 * rowH;           // rulers above, curves below
      const yMaxV = i === 0 ? 0.85 : 1.7;
      const sy = scale('lin', 0, yMaxV, P.yBase, strip + 0.6 * fs);
      // axis
      line(P.x0, P.yBase, P.x1, P.yBase, ink, k.stroke('thin'));
      const ticks = i === 0 ? [-10, -5, 0, 5, 10] : [-2, -1, 0, 1, 2];
      for (const v of ticks) {
        line(sx(v), P.yBase, sx(v), P.yBase + 0.3 * fs, ink, k.stroke('hair'));
        label(ctx, svg, sx(v), P.yBase + 1.25 * fs, num(ctx, v, 0), fs, { anchor: 'middle', fill: muted, size: 0.85 });
      }
      label(ctx, svg, P.x1, P.yBase - 0.4 * fs, i === 0 ? 'x/σ₀' : 'pσ₀/ħ', fs, { anchor: 'end', italic: true, size: 0.9 });
      label(ctx, svg, P.x0, P.yTop, i === 0
        ? `(a) ${ctx.text('Ortsraum', 'position space')}: |Ψ(x,t)|²`
        : `(b) ${ctx.text('Impulsraum', 'momentum space')}: |Φ(p,t)|²`, fs, { size: 0.95 });
      label(ctx, svg, (P.x0 + P.x1) / 2, P.yTop + 1.3 * fs, i === 0 ? '±σₜ' : '±σₚ', fs, { anchor: 'middle', fill: muted, size: 0.85 });
      // phase overlay first, so the densities stay on top
      if (i === 1 && showPhase) {
        const s = SIGMAS[chosen];
        const amp = Math.pow((2 * s * s) / Math.PI, 0.25);   // max |Phi|, a drawing scale only
        const mid = (P.yBase + strip) / 2, half = 0.45 * (P.yBase - strip);
        const h = (v: number) => mid - (v / amp) * half;
        const re: Array<[number, number]> = [], up: Array<[number, number]> = [], dn: Array<[number, number]> = [];
        for (let j = 0; j <= 2 * SAMPLES; j++) {
          const u = -span + (2 * span * j) / (2 * SAMPLES);
          const f = momentumPhi(u, t, s, 0, k0);
          const m = Math.hypot(f[0], f[1]);
          re.push([sx(u), h(f[0])]); up.push([sx(u), h(m)]); dn.push([sx(u), h(-m)]);
        }
        line(P.x0, mid, P.x1, mid, k.color('plate-rule'), k.stroke('hair'));
        for (const pts of [up, dn]) svgEl('path', { d: pathD(pts), fill: 'none', stroke: muted, 'stroke-width': k.stroke('thin'), 'stroke-dasharray': '1.5 2.5' }, svg);
        svgEl('path', { d: pathD(re), fill: 'none', stroke: k.color(ROLES[chosen]), 'stroke-width': k.stroke('thin') }, svg);
        label(ctx, svg, P.x1, strip + 0.4 * fs, `Re Φ(p,t), ±|Φ| (${ctx.text('eigener Maßstab', 'own scale')})`, fs, { anchor: 'end', size: 0.8, fill: muted });
      }
      SIGMAS.forEach((s, j) => {
        const strong = j === chosen;
        const col = k.color(ROLES[j]);
        const pts: Array<[number, number]> = [];
        for (let n = 0; n <= SAMPLES; n++) {
          const v = -span + (2 * span * n) / SAMPLES;
          const d = i === 0 ? freeDensity(v, t, s, 0, k0) : momentumDensity(v, s, k0);
          pts.push([sx(v), Math.max(strip, sy(d))]);
        }
        svgEl('path', { d: pathD(pts), fill: 'none', stroke: col, 'stroke-width': strong ? k.stroke('state') : k.stroke('regular'), 'stroke-opacity': strong ? 1 : 0.38, 'stroke-linejoin': 'round', ...(DASH[j] ? { 'stroke-dasharray': DASH[j] } : {}) }, svg);
        // ruler +- one standard deviation about the centre
        const c = i === 0 ? packetCentre(0, k0, t) : k0;   // for t < 0 the centre lies behind
        const w = i === 0 ? spreadWidth(s, t) : momentumWidth(s);
        const yR = P.yTop + 1.4 * fs + (j + 0.6) * rowH;
        const xa = sx(Math.max(-span, c - w)), xb = sx(Math.min(span, c + w));
        const op = strong ? 1 : 0.5;
        line(xa, yR, xb, yR, col, k.stroke('regular'), { 'stroke-opacity': op });
        if (c - w >= -span) line(xa, yR - 0.3 * fs, xa, yR + 0.3 * fs, col, k.stroke('regular'), { 'stroke-opacity': op });
        if (c + w <= span) line(xb, yR - 0.3 * fs, xb, yR + 0.3 * fs, col, k.stroke('regular'), { 'stroke-opacity': op });
        const txt = num(ctx, w, 3);
        label(ctx, svg, Math.min(xb + 0.4 * fs, P.x1 - 2.5 * fs), yR + 0.33 * fs, txt, fs, { fill: col, size: 0.8 });
        if (strong) {
          // drop lines of the chosen packet's ruler onto its own flank (density e^(-1/2) of the peak)
          for (const xv of [c - w, c + w]) {
            if (Math.abs(xv) > span) continue;
            const d = i === 0 ? freeDensity(xv, t, s, 0, k0) : momentumDensity(xv, s, k0);
            line(sx(xv), yR, sx(xv), Math.max(strip, sy(d)), muted, k.stroke('hair'), { 'stroke-dasharray': '2 3' });
          }
        }
      });
    };
    drawPanel(0); drawPanel(1);

    // the three steps, between or above the panels
    const s = SIGMAS[chosen];
    const stepText = ctx.text('Ψ(x,0) → 𝓕 → Ψ̃(k), mal e^(−iħk²t/2m) → 𝓕⁻¹ → Ψ(x,t)', 'Ψ(x,0) → 𝓕 → Ψ̃(k), times e^(−iħk²t/2m) → 𝓕⁻¹ → Ψ(x,t)');
    if (narrow) label(ctx, svg, W / 2, H / 2 + 0.2 * fs, stepText, fs, { anchor: 'middle', size: 0.78, fill: muted });
    else label(ctx, svg, W / 2, H - 0.4 * fs, stepText, fs, { anchor: 'middle', size: 0.85, fill: muted });
    label(ctx, svg, panels[0].x1, panels[0].yTop, `t = ${fix(ctx, t, 2)} τ₀`, fs, { anchor: 'end', weight: '600' });
    const out = outsideWindow(X_MAX, t, s, 0, k0);
    if (out > 0.001) label(ctx, svg, panels[0].x1, panels[0].yBase - 1.6 * fs, ctx.text(`${num(ctx, 100 * out, 1)} % außerhalb des Bildes`, `${num(ctx, 100 * out, 1)} % outside the window`), fs, { anchor: 'end', size: 0.8, fill: muted });

    rTau.set(fix(ctx, spreadTime(s), 2));
    rSt.set(fix(ctx, spreadWidth(s, t), 3));
    rSp.set(fix(ctx, momentumWidth(s), 3));
    rPr.set(fix(ctx, widthProduct(s, t), 3));
  };

  return {
    render(_frame, time) {
      now = time;
      tNow = tAt(time);
      tSlider.set(tNow);
      paint();
    },
    destroy() { svg.remove(); },
    info: () => ({ t: tNow, packet: chosen, sigma: SIGMAS[chosen], k0, phase: showPhase, sigmaT: spreadWidth(SIGMAS[chosen], tNow), product: widthProduct(SIGMAS[chosen], tNow) }),
  };
}
