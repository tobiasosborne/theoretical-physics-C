// c05.demo.detektor: the position detector sees only the area under |Psi|^2 (figure c05.fig.dichte;
// design docs/plan/lec78/DEMOS.md 2.2). 2D, SVG on the plate; not animated.
//
// LEFT (a): Re Psi (role q1, solid) and Im Psi (role q2, dashed) with the envelope +-|Psi| (dotted).
// The part inside [a, b] is drawn strong, the rest faint: the strong piece is F_[a,b] Psi, since
// (F Psi)(y) = Psi(y) on [a, b] and 0 outside (c05.eq.ortsdetektor). "Detektor anwenden" applies F;
// a second application changes nothing (F^2 = F). RIGHT (b): p(x) = |Psi|^2 with [a, b] shaded and a
// strip of width eps at c. The reader drags a, b and c, changes the carrier k (nothing in (b) moves)
// and shrinks eps: the strip probability P_eps goes to zero while P_eps/eps settles at p(c).
// States: the Gaussian packet of the lecture 7 exercise (sigma = 1, centre 0; the still) or the box
// state of the lecture 7 example (1/sqrt 2 on [-1, 1]).
//
// PLAY: the carrier k sweeps 0 -> 6 -> 0 in 12 seconds (a drawing choice): Re Psi and Im Psi change
// completely, p(x) and the probabilities stay where they are.
//
// Every number shown is an input (a, b, c, k, eps) or computed by web/src/kernels/particle.ts.
// Default state: the still (Gaussian, k = 3, [a, b] = [-0.5, 1.5], c = -1.8, eps = 0.2).
import type { DemoContext, DemoInstance, DemoMeta } from '../demo/types';
import { detected, intervalProbability, stateAt, stateDensity, stripRatio, type State } from '../kernels/particle';
import { choice, ensureStyle, fix, num, svgEl } from './c03/common';
import { label, pathD, scale } from './c03/plot';

export const meta: DemoMeta = { animated: true, aspect: 1.9, surface: 'plate' };
const K_PERIOD = 12, K_MAX = 6;

const X0 = -4.2, X1 = 4.2, LIM = 4;
const EPS = [1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01, 5e-3, 2e-3, 1e-3, 5e-4, 2e-4, 1e-4, 5e-5, 2e-5, 1e-5, 5e-6, 2e-6, 1e-6];
const SAMPLES = 600;

export function mount(stage: HTMLElement, ctx: DemoContext): DemoInstance {
  ensureStyle();
  const svg = svgEl('svg', {});
  svg.setAttribute('aria-hidden', 'true');
  svg.style.position = 'absolute'; svg.style.inset = '0'; svg.style.width = '100%'; svg.style.height = '100%';
  svg.style.touchAction = 'none';
  stage.append(svg);

  const p = ctx.params;
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
  const par = (key: string, d: number) => { const v = Number(p[key] ?? d); return Number.isFinite(v) ? v : d; };
  let state: State = p.state === 'box' ? 'box' : 'gauss';
  let a = clamp(par('a', -0.5), -LIM, LIM), b = clamp(par('b', 1.5), -LIM, LIM), c = clamp(par('c', -1.8), -LIM, LIM);
  let k = clamp(par('k', 3), 0, 6);
  let ei = clamp(Math.round(par('eps', 2)), 0, EPS.length - 1);
  let applied = 0;                         // how often the detector has been applied
  // the carrier clock: a triangle wave 0 -> K_MAX -> 0; the slider sets the phase on the rising branch
  let kOff = k / (2 * K_MAX), now = 0;
  const kAt = (time: number) => { const ph = time / K_PERIOD + kOff; const f = ph - Math.floor(ph); return 2 * K_MAX * (f <= 0.5 ? f : 1 - f); };
  if (a > b) [a, b] = [b, a];

  choice<State>(ctx, ctx.text('Zustand', 'state'), [
    { value: 'gauss', html: ctx.text('Gauß-Paket', 'Gaussian packet'), title: ctx.text('das Gaußsche Wellenpaket, σ = 1', 'the Gaussian wave packet, σ = 1') },
    { value: 'box', html: ctx.text('Kastenzustand', 'box state'), title: ctx.text('der Kastenzustand: 1/√2 auf [−1, 1]', 'the box state: 1/√2 on [−1, 1]') },
  ], state, (v) => { state = v; });
  const sa = ctx.ui.slider({ label: ctx.text('linker Rand a des Detektors', 'left end a of the detector'), labelHtml: '<math><mi>a</mi></math>', min: -LIM, max: LIM, step: 0.05, value: a, primary: true, format: (v) => fix(ctx, v, 2), onInput: (v) => { a = Math.min(v, b); } });
  const sb = ctx.ui.slider({ label: ctx.text('rechter Rand b des Detektors', 'right end b of the detector'), labelHtml: '<math><mi>b</mi></math>', min: -LIM, max: LIM, step: 0.05, value: b, format: (v) => fix(ctx, v, 2), onInput: (v) => { b = Math.max(v, a); } });
  const sk = ctx.ui.slider({ label: ctx.text('Wellenzahl k im Faktor e^(ikx)', 'wave number k in the factor e^(ikx)'), labelHtml: '<math><mi>k</mi></math>', min: 0, max: K_MAX, step: 0.5, value: k, format: (v) => fix(ctx, v, 1), onInput: (v) => { kOff = v / (2 * K_MAX) - now / K_PERIOD; } });
  const sc = ctx.ui.slider({ label: ctx.text('Ort c des Streifens', 'position c of the strip'), labelHtml: '<math><mi>c</mi></math>', min: -LIM, max: LIM, step: 0.05, value: c, format: (v) => fix(ctx, v, 2), onInput: (v) => { c = v; } });
  ctx.ui.slider({
    label: ctx.text('Breite ε des Streifens', 'width ε of the strip'), labelHtml: '<math><mi>ε</mi></math>',
    min: 0, max: EPS.length - 1, step: 1, value: ei, format: (v) => num(ctx, EPS[v], 6), onInput: (v) => { ei = v; },
  });
  const bApply = ctx.ui.button(ctx.text('Detektor anwenden', 'apply the detector'), () => { applied += 1; ctx.announce(ctx.text(`Detektor ${applied}-mal angewandt; die Wahrscheinlichkeit bleibt ${num(ctx, intervalProbability(state, a, b), 4)}`, `detector applied ${applied} times; the probability stays ${num(ctx, intervalProbability(state, a, b), 4)}`)); });
  ctx.ui.button(ctx.text('zurück zu Ψ', 'back to Ψ'), () => { applied = 0; });
  const rP = ctx.ui.readout(ctx.text('Wahrscheinlichkeit P[x in [a, b]]', 'probability P[x in [a, b]]'), '<math><mi>ℙ</mi><mo>[</mo><mi>x</mi><mo>∈</mo><mo>[</mo><mi>a</mi><mo>,</mo><mi>b</mi><mo>]</mo><mo>]</mo></math>');
  const rE = ctx.ui.readout(ctx.text('Streifen P_ε', 'strip P_ε'), '<math><msub><mi>P</mi><mi>ε</mi></msub></math>');
  const rR = ctx.ui.readout(ctx.text('P_ε/ε und p(c)', 'P_ε/ε and p(c)'), '<math><msub><mi>P</mi><mi>ε</mi></msub><mo>/</mo><mi>ε</mi></math>');

  // geometry of the last paint, for the pointer
  let G = { x0: 0, x1: 1, yTop: 0, yBase: 1 };
  const xOf = (px: number) => X0 + ((px - G.x0) / (G.x1 - G.x0)) * (X1 - X0);
  let grab: 'a' | 'b' | 'c' | null = null;
  const at = (ev: PointerEvent) => { const r = svg.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; };
  const onDown = (ev: PointerEvent) => {
    const [px, py] = at(ev);
    if (px < G.x0 - 10 || px > G.x1 + 10 || py < G.yTop - 10 || py > G.yBase + 40) return;
    const x = xOf(px);
    const d = { a: Math.abs(x - a), b: Math.abs(x - b), c: Math.abs(x - c) };
    grab = (Object.keys(d) as Array<'a' | 'b' | 'c'>).reduce((m, q) => (d[q] < d[m] ? q : m), 'a');
    svg.setPointerCapture(ev.pointerId);
    ev.preventDefault();
    onMove(ev);
  };
  const onMove = (ev: PointerEvent) => {
    if (!grab) return;
    const x = Math.round(clamp(xOf(at(ev)[0]), -LIM, LIM) * 20) / 20;
    if (grab === 'a') { a = Math.min(x, b); sa.set(a); }
    if (grab === 'b') { b = Math.max(x, a); sb.set(b); }
    if (grab === 'c') { c = x; sc.set(c); }
    ctx.invalidate();
  };
  const onUp = () => { grab = null; };
  svg.addEventListener('pointerdown', onDown);
  svg.addEventListener('pointermove', onMove);
  svg.addEventListener('pointerup', onUp);
  svg.addEventListener('pointercancel', onUp);

  const small = (v: number, digits: number) => (v === 0 ? '0' : v < 1e-3 ? v.toExponential(digits).replace('-', '−') : fix(ctx, v, digits + 2));
  const paint = () => {
    const t = ctx.tokens;
    let box = stage.getBoundingClientRect();
    const narrow = !p.stage && box.width > 0 && box.width < 560;
    const want = narrow ? '0.7' : String(meta.aspect);
    if (!p.stage && stage.style.aspectRatio !== want) { stage.style.aspectRatio = want; box = stage.getBoundingClientRect(); }
    const W = Math.max(260, box.width), H = Math.max(160, box.height);
    const fs = Math.min(t.font('label').sizePx, W / (narrow ? 30 : 48));
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.replaceChildren();
    const ink = t.color('plate-ink'), muted = t.color('plate-muted'), q1 = t.color('q1'), q2 = t.color('q2');
    const top = 1.8 * fs, gap = narrow ? 0 : 4 * fs;
    const PA = narrow ? { x0: 1.5 * fs, x1: W - 1.5 * fs, yTop: top, yBase: H / 2 - 1.6 * fs } : { x0: 1.5 * fs, x1: (W - gap) / 2, yTop: top, yBase: H - 2.8 * fs };
    const PB = narrow ? { x0: 3 * fs, x1: W - 1.5 * fs, yTop: H / 2 + 1.4 * fs, yBase: H - 2.8 * fs } : { x0: (W + gap) / 2 + 1.5 * fs, x1: W - 1.5 * fs, yTop: top, yBase: H - 2.8 * fs };
    G = PB;
    const line = (x1: number, y1: number, x2: number, y2: number, stroke: string, w: number, extra: Record<string, string | number> = {}) =>
      svgEl('line', { x1, y1, x2, y2, stroke, 'stroke-width': w, ...extra }, svg);
    const xs = Array.from({ length: SAMPLES + 1 }, (_, i) => X0 + ((X1 - X0) * i) / SAMPLES);
    const inside = (x: number) => x >= a && x <= b;

    // ── (a) Psi ──
    const sxA = scale('lin', X0, X1, PA.x0, PA.x1);
    const amp = state === 'gauss' ? Math.pow(2 * Math.PI, -0.25) : Math.SQRT1_2;
    const syA = scale('lin', -amp * 1.12, amp * 1.12, PA.yBase, PA.yTop + 1.6 * fs);
    line(PA.x0, syA(0), PA.x1, syA(0), ink, t.stroke('thin'));
    label(ctx, svg, PA.x1, syA(0) + 1.2 * fs, 'x', fs, { anchor: 'end', italic: true });
    const psiAt = (x: number) => (applied > 0 ? detected(state, x, k, a, b) : stateAt(state, x, k));
    const env: Array<[number, number]> = [], envN: Array<[number, number]> = [];
    for (const x of xs) { const m = Math.sqrt(stateDensity(state, x)) * (applied > 0 && !inside(x) ? 0 : 1); env.push([sxA(x), syA(m)]); envN.push([sxA(x), syA(-m)]); }
    for (const e of [env, envN]) svgEl('path', { d: pathD(e), fill: 'none', stroke: muted, 'stroke-width': t.stroke('thin'), 'stroke-dasharray': '1.5 2.5' }, svg);
    // Re and Im, strong inside [a, b], faint outside
    for (const [part, col, dash] of [[0, q1, ''], [1, q2, '5 3']] as const) {
      for (const strong of [false, true]) {
        const segs: Array<Array<[number, number]>> = [];
        let cur: Array<[number, number]> | null = null;
        for (const x of xs) {
          if (inside(x) === strong) { cur ??= []; cur.push([sxA(x), syA(psiAt(x)[part])]); }
          else if (cur) { segs.push(cur); cur = null; }
        }
        if (cur) segs.push(cur);
        for (const sgm of segs) svgEl('path', { d: pathD(sgm), fill: 'none', stroke: col, 'stroke-width': strong ? t.stroke('state') : t.stroke('regular'), 'stroke-opacity': strong ? 1 : 0.3, 'stroke-linejoin': 'round', ...(dash ? { 'stroke-dasharray': dash } : {}) }, svg);
      }
    }
    label(ctx, svg, PA.x0, PA.yTop, applied > 0
      ? ctx.text(`(a) F̂Ψ, Detektor ${applied}-mal angewandt: dasselbe`, `(a) F̂Ψ, detector applied ${applied} times: the same`)
      : ctx.text('(a) Ψ ist komplex', '(a) Ψ is complex'), fs, { size: 0.95 });
    label(ctx, svg, PA.x0, PA.yTop + 1.25 * fs, `${ctx.text('Re Ψ durchgezogen, Im Ψ gestrichelt, ±|Ψ| gepunktet', 'Re Ψ solid, Im Ψ dashed, ±|Ψ| dotted')};  k = ${fix(ctx, k, 2)}`, fs, { size: 0.78, fill: muted });

    // ── (b) p(x) ──
    const sx = scale('lin', X0, X1, PB.x0, PB.x1);
    const pMax = state === 'gauss' ? 0.4 : 0.5;
    const sy = scale('lin', 0, pMax * 1.2, PB.yBase, PB.yTop + 1.6 * fs);
    const area = (lo: number, hi: number) => {
      const pts: Array<[number, number]> = [[sx(lo), sy(0)]];
      const n = 120;
      for (let i = 0; i <= n; i++) { const x = lo + ((hi - lo) * i) / n; pts.push([sx(x), sy(stateDensity(state, x))]); }
      pts.push([sx(hi), sy(0)]);
      return pathD(pts) + ' Z';
    };
    if (b > a) svgEl('path', { d: area(a, b), fill: q1, 'fill-opacity': 0.22, stroke: 'none' }, svg);
    const eps = EPS[ei];
    const ePx = Math.max(1, sx(c + eps / 2) - sx(c - eps / 2));
    svgEl('rect', { x: sx(c) - ePx / 2, y: sy(stateDensity(state, c)), width: ePx, height: Math.max(0, sy(0) - sy(stateDensity(state, c))), fill: q1, 'fill-opacity': 0.65 }, svg);
    line(PB.x0, sy(0), PB.x1, sy(0), ink, t.stroke('thin'));
    line(PB.x0, sy(0), PB.x0, PB.yTop + 1.4 * fs, ink, t.stroke('thin'));
    for (const v of state === 'gauss' ? [0.1, 0.2, 0.3, 0.4] : [0.25, 0.5]) {
      line(PB.x0 - 0.3 * fs, sy(v), PB.x0, sy(v), ink, t.stroke('hair'));
      label(ctx, svg, PB.x0 - 0.45 * fs, sy(v) + 0.33 * fs, num(ctx, v, 2), fs, { anchor: 'end', size: 0.8, fill: muted });
    }
    svgEl('path', { d: pathD(xs.map((x) => [sx(x), sy(stateDensity(state, x))] as [number, number])), fill: 'none', stroke: ink, 'stroke-width': t.stroke('state'), 'stroke-linejoin': 'round' }, svg);
    // handles: a, b (detector) and c (strip)
    const handle = (x: number, name: string, col: string) => {
      line(sx(x), sy(0), sx(x), sy(stateDensity(state, x)), col, t.stroke('thin'));
      svgEl('circle', { cx: sx(x), cy: sy(0) + 1.0 * fs, r: 0.75 * fs, fill: t.color('plate'), stroke: col, 'stroke-width': t.stroke('regular') }, svg);
      label(ctx, svg, sx(x), sy(0) + 1.3 * fs, name, fs, { anchor: 'middle', size: 0.85, italic: true, halo: false, fill: col });
    };
    handle(a, 'a', q1); handle(b, 'b', q1); handle(c, 'c', ink);
    const P = intervalProbability(state, a, b);
    const Pe = intervalProbability(state, c - eps / 2, c + eps / 2);
    label(ctx, svg, PB.x0, PB.yTop, ctx.text('(b) p = |Ψ|² ist die Dichte', '(b) p = |Ψ|² is the density'), fs, { size: 0.95 });
    label(ctx, svg, PB.x1, PB.yTop + 1.25 * fs, `ℙ[x ∈ [a,b]] = ${fix(ctx, P, 4)}`, fs, { anchor: 'end', weight: '600' });
    label(ctx, svg, PB.x1, PB.yTop + 2.5 * fs, `ε = ${num(ctx, eps, 6)}:  Pε = ${small(Pe, 2)}`, fs, { anchor: 'end', size: 0.85 });
    if (!narrow) label(ctx, svg, PB.x1, H - 0.5 * fs, ctx.text('a, b und c lassen sich ziehen', 'drag a, b and c'), fs, { anchor: 'end', size: 0.78, fill: muted });
    bApply.disabled = b <= a;

    rP.set(fix(ctx, P, 5));
    rE.set(small(Pe, 3));
    rR.set(`${fix(ctx, stripRatio(state, c, eps), 6)}  (p(c) = ${fix(ctx, stateDensity(state, c), 6)})`);
  };

  return {
    render(_frame, time) { now = time; k = kAt(time); sk.set(k); paint(); },
    destroy() {
      svg.removeEventListener('pointerdown', onDown); svg.removeEventListener('pointermove', onMove);
      svg.removeEventListener('pointerup', onUp); svg.removeEventListener('pointercancel', onUp);
      svg.remove();
    },
    info: () => ({ state, a, b, c, k, eps: EPS[ei], applied, P: intervalProbability(state, a, b), stripRatio: stripRatio(state, c, EPS[ei]) }),
  };
}
