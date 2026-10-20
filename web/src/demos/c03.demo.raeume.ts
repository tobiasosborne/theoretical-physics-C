// c03.demo.raeume: three spaces, three systems (figure c03.fig.raeume, Vertiefung c03.v3). 2D, SVG
// on the plate; animated.
//
// As in the still, one vector in each space and its squared moduli, on one vertical scale:
// (a) C^2, the vector v/2 with v = (1+i, 1-i) of c03.eq.c2-vektoren: two bars 1/2;
// (b) l^2, the column v_j = 1/j: the bars 1/j^2, j = 1..12, and infinitely many more;
// (c) L^2(R), f(x) = e^(-x^2/2): the curve |f(x)|^2 = e^(-x^2) with the area under it.
// PLAY: the scalar product of each vector with itself is built up, as the caption of the still
// says: in (a) a sum of two bars, in (b) a sum of infinitely many (N runs to 10^4), in (c) the
// area under the curve, swept from the left. Below each panel a gauge shows the running value
// on one common scale (labelled as the part summed so far, never as v^dagger v), and below it the
// complete value from the kernel: v^dagger v = 1, sum 1/j^2, <f|f> = sqrt(pi).
//
// Every number shown is computed by web/src/kernels/hilbert.ts (innerTerms, inner, termSquare,
// partialSum, sumLimit, phasedAbs2, gaussCumulative, gaussLimit) from the vectors above.
import type { DemoContext, DemoInstance, DemoMeta } from '../demo/types';
import { gaussCumulative, gaussLimit, inner, innerTerms, partialSum, phasedAbs2, sumLimit, termSquare, type Complex } from '../kernels/hilbert';
import { ensureStyle, fix, int, num, svgEl } from './c03/common';
import { growthClock, label, pathD } from './c03/plot';

export const meta: DemoMeta = { animated: true, aspect: 2.1, surface: 'plate' };
const NARROW = 560;                        // below this stage width (CSS px) the panels are stacked: a drawing choice

const PERIOD = 11, GROW = 0.82;           // seconds per cycle and its growing part: drawing choices
const N_MAX = 1e4;                         // the column (b) is summed up to this N while playing
const X_FROM = -4, X_TO = 4;               // the area (c) is swept over this range: e^(-16) is below the drawing resolution
const BARS = 12;                           // bars drawn in (b), as in the still
const V2: Complex[] = [[0.5, 0.5], [0.5, -0.5]];   // v/2, v = (1+i, 1-i)

export function mount(stage: HTMLElement, ctx: DemoContext): DemoInstance {
  ensureStyle();
  const svg = svgEl('svg', { 'aria-hidden': 'true' });
  stage.append(svg);
  const capture = Boolean(ctx.params.stage);
  const clock = growthClock(PERIOD, GROW, Number(ctx.params.u ?? '1'));
  const slider = ctx.ui.slider({
    label: ctx.text('Fortschritt der Summen', 'progress of the sums'),
    min: 0, max: 1, step: 0.001, value: 1, primary: true,
    format: (u) => `${Math.round(100 * u)} %`,
    onInput: (u) => clock.setU(u),
  });
  const terms = innerTerms(V2, V2);                    // |v_j/2|^2 as v_j^* v_j
  const totalA = inner(V2, V2)[0];
  const limB = sumLimit(1), totalC = gaussLimit();
  let info = { u: 1, a: totalA, b: 0, N: N_MAX, c: totalC };

  const paint = (time: number) => {
    const u = clock.u(time);
    slider.set(u);
    const k = ctx.tokens;
    let box = stage.getBoundingClientRect();
    // a narrow stage (a phone) stacks the three panels: the demo asks its own stage for a taller shape
    const narrow = !capture && box.width > 0 && box.width < NARROW;
    const want = narrow ? '0.5' : String(meta.aspect);
    if (!capture && stage.style.aspectRatio !== want) { stage.style.aspectRatio = want; box = stage.getBoundingClientRect(); }
    const W = Math.max(200, box.width), H = Math.max(130, box.height);
    const fs = Math.min(k.font('label').sizePx, narrow ? W / 30 : W / 48);
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.replaceChildren();
    const ink = k.color('plate-ink'), muted = k.color('plate-muted'), rule = k.color('plate-rule'), state = k.color('state');
    const line = (x1: number, y1: number, x2: number, y2: number, stroke: string, w: number) => svgEl('line', { x1, y1, x2, y2, stroke, 'stroke-width': w }, svg);
    // geometry: the three panels as in the still (widths 2.2 : 4.3 : 5.7 of the figure's units)
    const gap = 2.4 * fs, mL = 2.6 * fs, mR = 1.4 * fs;
    const unitsW = [3.4, 4.6, 5.9];
    const scaleX = (W - mL - mR - 2 * gap) / unitsW.reduce((a, b) => a + b, 0);
    const x0s = [mL, mL + unitsW[0] * scaleX + gap, mL + (unitsW[0] + unitsW[1]) * scaleX + 2 * gap];
    const widths = unitsW.map((u) => u * scaleX);
    // per panel: left edge, width and the vertical frame (one common vertical scale in every panel)
    const rowH = H / 3;
    const frame = (i: number) => {
      const top = narrow ? i * rowH : 0, bottom = narrow ? (i + 1) * rowH : H;
      return {
        x0: narrow ? mL : x0s[i], w: narrow ? (i === 0 ? 0.5 : i === 1 ? 0.8 : 1) * (W - mL - mR) : widths[i],
        yTop: top + 1.6 * fs, yBase: bottom - 7.6 * fs, gaugeY: bottom - 3.5 * fs, bottom,
      };
    };
    let yTop = 0, yBase = 0, gaugeY = 0, H_ = H;
    const use = (i: number) => { const f = frame(i); yTop = f.yTop; yBase = f.yBase; gaugeY = f.gaugeY; H_ = f.bottom; return f; };
    const Y = (v: number) => yBase - (v / 1.2) * (yBase - yTop);
    const gaugeH = 0.8 * fs;
    const gaugeW = narrow ? W - mL - mR : widths[0];
    const G = (x0: number, w: number, v: number) => x0 + (v / 2) * w;      // gauge: 0..2 across the panel

    // ── (a) C^2 ──
    {
      const { x0, w } = use(0);
      line(x0, yBase, x0 + w, yBase, ink, k.stroke('thin'));
      line(x0, yBase, x0, Y(1.2), ink, k.stroke('thin'));
      for (const v of [0.5, 1]) {
        line(x0, Y(v), x0 + w * 0.92, Y(v), rule, k.stroke('hair'));
        label(ctx, svg, x0 - 0.4 * fs, Y(v) + 0.33 * fs, v === 0.5 ? '½' : '1', fs, { anchor: 'end', fill: muted, size: 0.9 });
      }
      let run = 0;
      terms.forEach((t, j) => {
        const done = Math.max(0, Math.min(1, 2 * u - j));          // bar j is added during u in [j/2, (j+1)/2]
        run += t[0] * done;
        const cx = x0 + ((j + 1) / 3) * w, bw = 0.3 * w;
        svgEl('rect', { x: cx - bw / 2, y: Y(t[0]), width: bw, height: yBase - Y(t[0]), fill: state, 'fill-opacity': 0.18, stroke: state, 'stroke-width': k.stroke('thin') }, svg);
        if (done > 0) svgEl('rect', { x: cx - bw / 2, y: Y(t[0] * done), width: bw, height: yBase - Y(t[0] * done), fill: state, 'fill-opacity': 0.55 }, svg);
        label(ctx, svg, cx, yBase + 1.15 * fs, String(j + 1), fs, { anchor: 'middle', fill: muted, size: 0.9 });
      });
      label(ctx, svg, x0 + w + 0.2 * fs, yBase + 0.35 * fs, 'j', fs, { italic: true });
      label(ctx, svg, x0, yTop - 0.5 * fs, '|vⱼ|²', fs, { anchor: 'middle' });
      label(ctx, svg, x0 + w / 2, yBase + 2.4 * fs, ctx.text('(a) ℂ²: Qubit', '(a) ℂ²: qubit'), fs, { anchor: 'middle', weight: '600' });
      gauge(x0, w, run, totalA, ctx.text(`bisher summiert: ${num(ctx, run, 4)}`, `summed so far: ${num(ctx, run, 4)}`), ctx.text(`v†v = Summe von zwei Balken = ${num(ctx, totalA, 4)}`, `v†v = sum of two bars = ${num(ctx, totalA, 4)}`));
      info.a = run;
    }
    // ── (b) l^2 ──
    {
      const { x0, w } = use(1);
      line(x0, yBase, x0 + w, yBase, ink, k.stroke('thin'));
      line(x0, yBase, x0, Y(1.2), ink, k.stroke('thin'));
      for (const v of [0.5, 1]) line(x0, Y(v), x0 + w * 0.95, Y(v), rule, k.stroke('hair'));
      const N = Math.max(0, Math.floor(10 ** (Math.log10(N_MAX) * u) * (u > 0 ? 1 : 0)));
      const slot = (w * 0.86) / (BARS + 0.5);
      for (let j = 1; j <= BARS; j++) {
        const cx = x0 + j * slot, bw = 0.6 * slot, h = termSquare(1, j);
        const on = j <= N;
        svgEl('rect', { x: cx - bw / 2, y: Y(h), width: bw, height: yBase - Y(h), fill: state, 'fill-opacity': on ? 0.55 : 0.18, stroke: state, 'stroke-width': k.stroke('thin') }, svg);
        if (j === 1 || j === 5 || j === 10) label(ctx, svg, cx, yBase + 1.15 * fs, String(j), fs, { anchor: 'middle', fill: muted, size: 0.9 });
      }
      label(ctx, svg, x0 + (BARS + 1.1) * slot, Y(0.07), '⋯', fs, { anchor: 'middle', fill: N > BARS ? state : ink, weight: N > BARS ? '600' : '400' });
      label(ctx, svg, x0 + w + 0.2 * fs, yBase + 0.35 * fs, 'j', fs, { italic: true });
      label(ctx, svg, x0, yTop - 0.5 * fs, '|vⱼ|² = 1/j²', fs, { anchor: 'start' });
      label(ctx, svg, x0 + w / 2, yBase + 2.4 * fs, ctx.text('(b) ℓ²: Oszillator', '(b) ℓ²: oscillator'), fs, { anchor: 'middle', weight: '600' });
      const SN = N >= 1 ? partialSum(1, N) : 0;
      gauge(x0, w, SN, limB, `Σⱼ₌₁ᴺ |vⱼ|², N = ${int(ctx, N)}: ${num(ctx, SN, 4)}`, ctx.text(`v†v = Summe unendlich vieler Balken = ${num(ctx, limB, 4)}`, `v†v = sum of infinitely many bars = ${num(ctx, limB, 4)}`));
      info.b = SN; info.N = N;
    }
    // ── (c) L^2(R) ──
    {
      const { x0, w } = use(2);
      const X = (x: number) => x0 + ((x + 2.9) / 5.8) * w;
      const xs = Array.from({ length: 241 }, (_, i) => -2.9 + (5.8 * i) / 240);
      const sweep = X_FROM + (X_TO - X_FROM) * u;
      const pts = xs.map((x) => [X(x), Y(phasedAbs2('gauss', x))] as [number, number]);
      svgEl('path', { d: `${pathD(pts)} L ${X(2.9)} ${yBase} L ${X(-2.9)} ${yBase} Z`, fill: state, 'fill-opacity': 0.18 }, svg);
      const swept = xs.filter((x) => x <= sweep);
      if (swept.length > 1) {
        const sp = swept.map((x) => [X(x), Y(phasedAbs2('gauss', x))] as [number, number]);
        const xe = Math.min(2.9, sweep);
        sp.push([X(xe), Y(phasedAbs2('gauss', xe))]);
        svgEl('path', { d: `${pathD(sp)} L ${X(xe)} ${yBase} L ${X(-2.9)} ${yBase} Z`, fill: state, 'fill-opacity': 0.55 }, svg);
      }
      svgEl('path', { d: pathD(pts), fill: 'none', stroke: state, 'stroke-width': k.stroke('state') }, svg);
      line(X(-2.9), yBase, X(2.9) + 0.6 * fs, yBase, ink, k.stroke('thin'));
      line(X(0), yBase, X(0), Y(1.2), ink, k.stroke('thin'));
      line(X(-2.8), Y(1), X(2.8), Y(1), rule, k.stroke('hair'));
      for (const t of [-2, 2]) { line(X(t), yBase - 0.2 * fs, X(t), yBase + 0.2 * fs, ink, k.stroke('hair')); label(ctx, svg, X(t), yBase + 1.15 * fs, t < 0 ? '−2' : '2', fs, { anchor: 'middle', fill: muted, size: 0.9 }); }
      label(ctx, svg, X(2.9) + 0.8 * fs, yBase + 0.35 * fs, 'x', fs, { italic: true });
      label(ctx, svg, X(0), yTop - 0.5 * fs, '|f(x)|² = exp(−x²)', fs, { anchor: 'middle' });
      label(ctx, svg, x0 + w / 2, yBase + 2.4 * fs, ctx.text('(c) L²(ℝ): Teilchen auf der Geraden', '(c) L²(ℝ): particle on a line'), fs, { anchor: 'middle', weight: '600' });
      const area = gaussCumulative(sweep);
      gauge(x0, w, area, totalC, `∫ ${ctx.text('von', 'from')} −∞ ${ctx.text('bis', 'to')} x = ${fix(ctx, sweep, 1)}: ${num(ctx, area, 4)}`, ctx.text(`⟨f|f⟩ = Fläche unter der Kurve = √π = ${num(ctx, totalC, 4)}`, `⟨f|f⟩ = area under the curve = √π = ${num(ctx, totalC, 4)}`));
      info.c = area;
    }
    info.u = u;

    function gauge(x0: number, _panelW: number, v: number, end: number, now: string, endText: string) {
      const w = gaugeW;          // one width, hence one scale 0..2, for the three gauges
      svgEl('rect', { x: x0, y: gaugeY, width: w, height: gaugeH, fill: 'none', stroke: rule, 'stroke-width': k.stroke('hair') }, svg);
      svgEl('rect', { x: x0, y: gaugeY, width: Math.max(0, G(x0, w, v) - x0), height: gaugeH, fill: state, 'fill-opacity': 0.55 }, svg);
      line(G(x0, w, end), gaugeY - 0.35 * fs, G(x0, w, end), gaugeY + gaugeH + 0.35 * fs, ink, k.stroke('regular'));
      for (const t of [0, 1, 2]) label(ctx, svg, G(x0, w, t), gaugeY + gaugeH + 1.0 * fs, String(t), fs, { anchor: t === 0 ? 'start' : t === 2 ? 'end' : 'middle', fill: muted, size: 0.8 });
      label(ctx, svg, x0, gaugeY - 0.45 * fs, now, fs, { size: 0.9 });
      label(ctx, svg, x0, H_ - 0.35 * fs, endText, fs, { size: 0.85, fill: muted });
    }
  };

  return {
    render(_frame, time) { paint(time); },
    destroy() { svg.remove(); },
    info: () => ({ ...info }),
  };
}
