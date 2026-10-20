// c03.demo.partialintegrale: the same admission test for functions (figure
// c03.fig.partialintegrale, Vertiefung c03.v2). 2D, SVG on the plate; animated.
//
// TOP: |f(x)|^2 on the line; the area between -X and X is shaded. BOTTOM: the partial integrals
// F(X) = int_{-X}^{X} |f(x)|^2 dx against X. Drawn always, as in the still: f = e^(-x^2/2) (solid,
// with its limit sqrt(pi), c03.eq.gauss), f = 1/sqrt(1+|x|) (dashed, 2 ln(1+X), c03.eq.log) and
// f = 1 (dash-dotted, 2X, c03.eq.eins). Drawn for the chosen function (state role): either the
// Gaussian, or f_s(x) = (1+|x|)^(-s), whose members s = 1/2 and s = 0 are the chapter's h and 1; for
// s > 1/2 its partial integrals stay below the limit 2/(2s-1), for s <= 1/2 they grow without
// bound (the closed form of c03.eq.log for general s; not a claim of the chapter).
// PLAY: X grows; the axis is X <= 4.4 (as in the still) or X <= 10^6 on a logarithmic axis.
//
// Every number shown is an input (s, X) or computed by web/src/kernels/hilbert.ts (gaussPartial,
// gaussLimit, powerPartial, powerLimit, modulus). Default state: the still (X = 4.3), Gaussian.
import type { DemoContext, DemoInstance, DemoMeta } from '../demo/types';
import { gaussLimit, gaussPartial, phasedAbs2, powerAbs2, powerLimit, powerPartial } from '../kernels/hilbert';
import { choice, ensureStyle, fix, num, place, setAttrs, svgEl, tweener } from './c03/common';
import { growthClock, label, pathD, scale, setPath, spread } from './c03/plot';

export const meta: DemoMeta = { animated: true, aspect: 1.6, surface: 'plate' };

type Mode = 'lin' | 'log';
type Kind = 'gauss' | 'power';
const X_LIN = 4.3, X_LOG = 1e6;                       // the still's range; the far range: drawing choices
const PERIOD: Record<Mode, number> = { lin: 7.5, log: 12 };
const GROW = 0.8;
const Y_MAX: Record<Mode, number> = { lin: 5.2, log: 30 };
const S_MAX = 1.5;
const SAMPLES = 240;                                   // points per curve: a drawing choice
const CHAPTER: Array<{ kind: Kind; s: number; role: string; dash: string; de: string; en: string }> = [
  { kind: 'gauss', s: 0, role: 'q1', dash: '', de: 'f = exp(−x²/2): √π', en: 'f = exp(−x²/2): √π' },
  { kind: 'power', s: 0.5, role: 'q3', dash: '5 2', de: 'f = 1/√(1+|x|): 2 ln(1+X)', en: 'f = 1/√(1+|x|): 2 ln(1+X)' },
  { kind: 'power', s: 0, role: 'q5', dash: '5 1.5 1.2 1.5', de: 'f = 1: 2X', en: 'f = 1: 2X' },
];

export function mount(stage: HTMLElement, ctx: DemoContext): DemoInstance {
  ensureStyle();
  const svg = svgEl('svg', { 'aria-hidden': 'true' });
  stage.append(svg);
  const tw = tweener(ctx, stage);
  const uid = `c03pi${Math.floor(ctx.random() * 1e9)}`;

  let mode: Mode = ctx.params.mode === 'log' ? 'log' : 'lin';
  let kind: Kind = ctx.params.f === 'power' ? 'power' : 'gauss';
  let s = Math.max(0, Math.min(S_MAX, Number(ctx.params.s ?? '0.5')));
  if (!Number.isFinite(s)) s = 0.5;
  const clock = growthClock(PERIOD[mode], GROW, Number(ctx.params.u ?? '1'));
  let lastTime = -1, X = X_LIN;
  const xOf = (u: number) => (mode === 'lin' ? X_LIN * u : ((10 ** (6 * u) - 1) * X_LOG) / (X_LOG - 1));
  const uOf = (x: number) => (mode === 'lin' ? x / X_LIN : Math.log10(1 + (x * (X_LOG - 1)) / X_LOG) / 6);
  // |f|^2 and F of the chosen function, from the kernel
  const abs2 = (k: Kind, sv: number, x: number) => (k === 'gauss' ? phasedAbs2('gauss', x) : powerAbs2(sv, x));
  const F = (k: Kind, sv: number, x: number) => (k === 'gauss' ? gaussPartial(x) : powerPartial(sv, x));
  const limitOf = (k: Kind, sv: number) => (k === 'gauss' ? gaussLimit() : powerLimit(sv));

  const xSlider = ctx.ui.slider({
    label: ctx.text('Grenze X des Integrals', 'limit X of the integral'),
    labelHtml: '<math><mi>X</mi></math>',
    min: 0, max: 1, step: 0.001, value: 1, primary: true,
    format: (u) => num(ctx, xOf(u), mode === 'lin' ? 2 : 0),
    onInput: (u) => { tw.still(); clock.setU(u); },
  });
  const sSlider = ctx.ui.slider({
    label: ctx.text('Exponent s in f(x) = (1+|x|)^(−s)', 'exponent s in f(x) = (1+|x|)^(−s)'),
    labelHtml: ctx.text('Exponent ', 'exponent ') + '<math><mi>s</mi></math>' + ' in <math><mi>f</mi><mo>(</mo><mi>x</mi><mo>)</mo><mo>=</mo><msup><mrow><mo>(</mo><mn>1</mn><mo>+</mo><mo>|</mo><mi>x</mi><mo>|</mo><mo>)</mo></mrow><mrow><mo>−</mo><mi>s</mi></mrow></msup></math>',
    min: 0, max: S_MAX, step: 0.01, value: s,
    format: (v) => fix(ctx, v, 2),
    onInput: (v) => { tw.still(); s = v; kind = 'power'; presetCtl.set(null); },
  });
  type P = 'g' | 'h' | 'one';
  const presetCtl = choice<P>(ctx, ctx.text('Funktionen aus dem Text', 'functions of the text'), [
    { value: 'g', html: '<math><mi>f</mi><mo>=</mo><msup><mi>e</mi><mrow><mo>−</mo><msup><mi>x</mi><mn>2</mn></msup><mo>/</mo><mn>2</mn></mrow></msup></math>', title: ctx.text('die Gauß-Funktion', 'the Gaussian') },
    { value: 'h', html: '<math><mi>f</mi><mo>=</mo><mn>1</mn><mo>/</mo><msqrt><mn>1</mn><mo>+</mo><mo>|</mo><mi>x</mi><mo>|</mo></msqrt></math>', title: ctx.text('h(x) = 1/√(1+|x|), s = 1/2', 'h(x) = 1/√(1+|x|), s = 1/2') },
    { value: 'one', html: '<math><mi>f</mi><mo>=</mo><mn>1</mn></math>', title: ctx.text('die konstante Funktion 1, s = 0', 'the constant function 1, s = 0') },
  ], kind === 'gauss' ? 'g' : s === 0.5 ? 'h' : s === 0 ? 'one' : null, (k) => {
    tw.tween();
    if (k === 'g') kind = 'gauss'; else { kind = 'power'; s = k === 'h' ? 0.5 : 0; sSlider.set(s); }
  });
  choice<Mode>(ctx, ctx.text('Achse', 'axis'), [
    { value: 'lin', html: ctx.text('X bis 4,3', 'X up to 4.3'), title: ctx.text('lineare Achse wie in der Abbildung', 'linear axis as in the figure') },
    { value: 'log', html: ctx.text('X bis 10⁶, logarithmisch', 'X up to 10⁶, logarithmic'), title: ctx.text('logarithmische Achse, X bis eine Million', 'logarithmic axis, X up to one million') },
  ], mode, (k) => { tw.still(); const x = X; mode = k; clock.setPeriod(PERIOD[mode]); clock.setU(Math.max(0, Math.min(1, uOf(Math.min(x, mode === 'lin' ? X_LIN : X_LOG))))); });
  const outF = ctx.ui.readout(ctx.text('Integral', 'integral'), '<math><msubsup><mo>∫</mo><mrow><mo>−</mo><mi>X</mi></mrow><mi>X</mi></msubsup><msup><mrow><mo>|</mo><mi>f</mi><mo>(</mo><mi>x</mi><mo>)</mo><mo>|</mo></mrow><mn>2</mn></msup><mi>d</mi><mi>x</mi></math>');
  const outV = ctx.ui.readout(ctx.text('Urteil', 'verdict'));

  const gStatic = svgEl('g', {}, svg);
  const defs = svgEl('defs', {}, svg);
  const clipBot = svgEl('clipPath', { id: `${uid}-bot` }, defs);
  const clipBotR = svgEl('rect', {}, clipBot);
  const gTop = svgEl('g', {}, svg);
  const area = svgEl('path', { class: 'c03-move' }, gTop);
  const graph = svgEl('path', { class: 'c03-move', fill: 'none' }, gTop);
  const edgeL = svgEl('line', { class: 'c03-move' }, gTop), edgeR = svgEl('line', { class: 'c03-move' }, gTop);
  const gBot = svgEl('g', { 'clip-path': `url(#${uid}-bot)` }, svg);
  const gChapter = svgEl('g', {}, gBot);
  const limitG = svgEl('g', { class: 'c03-move c03-fade' }, gBot), limitL = svgEl('line', {}, limitG);
  const live = svgEl('path', { class: 'c03-move', fill: 'none' }, gBot);
  const liveDot = svgEl('circle', { class: 'c03-move' }, gBot);
  const gLabels = svgEl('g', {}, svg);

  const paint = (time: number) => {
    if (time !== lastTime) { if (lastTime >= 0) tw.still(); lastTime = time; }
    const u = clock.u(time);
    xSlider.set(u);
    X = xOf(u);
    const xMax = mode === 'lin' ? X_LIN : X_LOG;
    const k = ctx.tokens;
    let box = stage.getBoundingClientRect();
    // a narrow stage (a phone): the demo asks its own stage for a taller shape and a larger type
    const narrow = !ctx.params.stage && box.width > 0 && box.width < 560;
    const want = narrow ? '0.95' : String(meta.aspect);
    if (!ctx.params.stage && stage.style.aspectRatio !== want) { stage.style.aspectRatio = want; box = stage.getBoundingClientRect(); }
    const W = Math.max(240, box.width), H = Math.max(150, box.height);
    const fs = Math.min(k.font('label').sizePx, W / (narrow ? 33 : 42));
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const ink = k.color('plate-ink'), muted = k.color('plate-muted'), rule = k.color('plate-rule'), state = k.color('state');
    const mL = 3.6 * fs, mR = 14 * fs;
    const topY0 = 1.9 * fs, topY1 = topY0 + (narrow ? 0.2 : 0.24) * H;
    const botY0 = topY1 + 3.2 * fs, botY1 = H - 2.6 * fs;
    const xT = mode === 'lin' ? scale('lin', -4.4, 4.4, mL, W - mR) : scale('log1p', -1.4e6, 1.4e6, mL, W - mR);
    const xB = mode === 'lin' ? scale('lin', 0, 4.4, mL, W - mR) : scale('log1p', 0, 1.4e6, mL, W - mR);
    const yT = scale('lin', 0, 1.08, topY1, topY0);
    const yMax = Y_MAX[mode];
    const yB = scale('lin', 0, yMax, botY1, botY0);
    const yTop = botY0 - 0.6 * fs;
    setAttrs(clipBotR, { x: mL - 2, y: botY0 - 1.2 * fs, width: W - mR - mL + 4 + 0.6 * fs, height: botY1 - botY0 + 1.2 * fs + 2 });

    gStatic.replaceChildren(); gChapter.replaceChildren(); gLabels.replaceChildren();
    const line = (g: Element, x1: number, y1: number, x2: number, y2: number, stroke: string, w: number, dash?: string) =>
      svgEl('line', { x1, y1, x2, y2, stroke, 'stroke-width': w, ...(dash ? { 'stroke-dasharray': dash } : {}) }, g);
    // axes
    line(gStatic, xT(0), topY1, xT(0), topY0, rule, k.stroke('hair'));
    for (const [y0, y1, sc, ticks] of [[topY0, topY1, yT, [0, 0.5, 1]], [botY0, botY1, yB, mode === 'lin' ? [0, 1, 2, 3, 4, 5] : [0, 10, 20, 30]]] as const) {
      line(gStatic, mL, y1, W - mR + 0.6 * fs, y1, ink, k.stroke('thin'));
      const x0 = mL;
      line(gStatic, x0, y1, x0, y0 - 0.4 * fs, ink, k.stroke('thin'));
      for (const t of ticks) {
        line(gStatic, x0 - 0.3 * fs, sc(t), x0, sc(t), ink, k.stroke('hair'));
        if (t > 0) line(gStatic, mL, sc(t), W - mR, sc(t), rule, k.stroke('hair'));
        label(ctx, gStatic, x0 - 0.5 * fs, sc(t) + 0.33 * fs, num(ctx, t, 1), fs, { anchor: 'end', fill: muted, size: 0.85 });
      }
    }
    const sup = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶'];
    const tickLab = (t: number) => (mode === 'lin' ? num(ctx, t, 1) : Math.abs(t) < 1e3 ? num(ctx, t, 0) : `${t < 0 ? '−' : ''}10${sup[Math.round(Math.log10(Math.abs(t)))]}`);
    const xtT = mode === 'lin' ? [-4, -3, -2, -1, 0, 1, 2, 3, 4] : [-1e6, -1e4, -100, -10, 0, 10, 100, 1e4, 1e6];
    for (const t of xtT) {
      line(gStatic, xT(t), topY1, xT(t), topY1 + 0.3 * fs, ink, k.stroke('hair'));
      label(ctx, gStatic, xT(t), topY1 + 1.25 * fs, tickLab(t), fs, { anchor: 'middle', fill: muted, size: 0.85 });
    }
    const xtB = mode === 'lin' ? [0, 1, 2, 3, 4] : [0, 1, 10, 100, 1e3, 1e4, 1e5, 1e6];
    for (const t of xtB) {
      line(gStatic, xB(t), botY1, xB(t), botY1 + 0.3 * fs, ink, k.stroke('hair'));
      label(ctx, gStatic, xB(t), botY1 + 1.25 * fs, tickLab(t), fs, { anchor: 'middle', fill: muted, size: 0.85 });
    }
    label(ctx, gStatic, W - mR + 0.9 * fs, botY1 + 0.35 * fs, 'X', fs, { italic: true });
    label(ctx, gStatic, W - mR + 0.9 * fs, topY1 + 0.35 * fs, 'x', fs, { italic: true });
    const fName = kind === 'gauss' ? 'f(x) = exp(−x²/2)' : `f(x) = (1+|x|)⁻ˢ, s = ${fix(ctx, s, 2)}`;
    label(ctx, gStatic, mL - 0.3 * fs, topY0 - 0.6 * fs, `|f(x)|²  ${ctx.text('für', 'for')}  ${fName}`, fs, { fill: state });
    label(ctx, gStatic, mL - 0.3 * fs, botY0 - 1.0 * fs, ctx.text('Integral von −X bis X', 'integral from −X to X'), fs);

    // sample points of x in [0, x1] (lin: uniform; log: uniform in log10(1 + x))
    const grid = (x1: number, n = SAMPLES): number[] => Array.from({ length: n + 1 }, (_, i) => (mode === 'lin' ? (x1 * i) / n : 10 ** ((Math.log10(1 + x1) * i) / n) - 1));
    const curve = (kd: Kind, sv: number) => {
      const pts: Array<[number, number]> = [];
      let exit = false;
      for (const x of grid(X)) {
        const p: [number, number] = [xB(x), yB(F(kd, sv, x))];
        if (p[1] >= yTop) { pts.push(p); continue; }
        const q = pts[pts.length - 1];
        if (q) pts.push([q[0] + ((p[0] - q[0]) * (q[1] - yTop)) / (q[1] - p[1]), yTop]);
        exit = true; break;
      }
      return { pts, exit };
    };
    const exitMark = (g: Element, p: readonly [number, number], col: string) =>
      svgEl('path', { d: `M ${p[0] - 0.32 * fs} ${p[1] + 0.1 * fs} L ${p[0]} ${p[1] - 0.45 * fs} L ${p[0] + 0.32 * fs} ${p[1] + 0.1 * fs}`, fill: 'none', stroke: col, 'stroke-width': k.stroke('regular'), 'stroke-linejoin': 'round' }, g);

    // the line sqrt(pi) of the still
    const sq = gaussLimit();
    line(gChapter, mL, yB(sq), W - mR, yB(sq), muted, k.stroke('hair'));
    const ends: Array<{ y: number; text: string; fill: string }> = [{ y: yB(sq), text: `√π = ${num(ctx, sq, 4)}`, fill: muted }];
    for (const c of CHAPTER) {
      const cv = curve(c.kind, c.s);
      const col = k.color(c.role);
      svgEl('path', { d: pathD(cv.pts), fill: 'none', stroke: col, 'stroke-width': k.stroke('regular'), ...(c.dash ? { 'stroke-dasharray': c.dash } : {}), 'stroke-linejoin': 'round' }, gChapter);
      const last = cv.pts[cv.pts.length - 1];
      if (cv.exit) exitMark(gChapter, last, col);
      ends.push({ y: last[1], text: ctx.text(c.de, c.en), fill: col });
    }

    // top: |f|^2 on the whole axis, the area between -X and X
    const xsTop = grid(xMax * 1.4).filter((x) => x <= (mode === 'lin' ? 4.4 : 1.4e6));
    const full = [...xsTop.slice(1).reverse().map((x) => -x), ...xsTop];
    setPath(graph, pathD(full.map((x) => [xT(x), yT(abs2(kind, s, x))] as [number, number])));
    setAttrs(graph, { stroke: state, 'stroke-width': k.stroke('state'), 'stroke-linejoin': 'round' });
    const inner = grid(X, SAMPLES);
    const sym = [...inner.slice(1).reverse().map((x) => -x), ...inner];
    const top = sym.map((x) => [xT(x), yT(abs2(kind, s, x))] as [number, number]);
    setPath(area, `${pathD(top)} L ${xT(X).toFixed(2)} ${yT(0).toFixed(2)} L ${xT(-X).toFixed(2)} ${yT(0).toFixed(2)} Z`);
    setAttrs(area, { fill: state, 'fill-opacity': 0.24, stroke: 'none' });
    for (const [e, x] of [[edgeL, -X], [edgeR, X]] as const) {
      setAttrs(e, { x1: 0, x2: 0, y1: yT(0), y2: yT(abs2(kind, s, x)), stroke: state, 'stroke-width': k.stroke('thin') });
      place(e, `translate(${xT(x).toFixed(2)}px, 0px)`);
    }

    // bottom: the chosen function
    const lv = curve(kind, s);
    setPath(live, pathD(lv.pts));
    setAttrs(live, { stroke: state, 'stroke-width': k.stroke('state'), 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
    liveExit.replaceChildren();
    const lend = lv.pts[lv.pts.length - 1];
    if (lv.exit) exitMark(liveExit, lend, state);
    setAttrs(liveDot, { cx: 0, cy: 0, r: lv.exit ? 0 : 0.3 * fs, fill: state });
    place(liveDot, `translate(${lend[0].toFixed(2)}px, ${lend[1].toFixed(2)}px)`);
    const FX = F(kind, s, X), lim = limitOf(kind, s);
    const finite = Number.isFinite(lim);
    const yClamp = (v: number) => Math.max(yTop, yB(v));
    place(limitG, `translate(0px, ${(finite ? yClamp(lim) : yTop).toFixed(2)}px)`);
    setAttrs(limitL, { x1: mL, x2: W - mR, y1: 0, y2: 0, stroke: state, 'stroke-width': k.stroke('thin'), 'stroke-dasharray': '6 3' });
    limitG.style.opacity = finite && kind !== 'gauss' ? '1' : '0';
    // a guide from the shaded area's right edge down to the current point
    guide.replaceChildren();
    svgEl('line', { x1: xT(X), y1: topY1, x2: lend[0], y2: lend[1], stroke: state, 'stroke-width': k.stroke('hair'), 'stroke-dasharray': '2 3' }, guide);

    const label0 = kind === 'gauss' ? 'exp(−x²/2)' : `s = ${fix(ctx, s, 2)}`;
    ends.push({ y: lend[1], text: `${label0}: ${num(ctx, FX, 4)}`, fill: state });
    if (finite && kind !== 'gauss') ends.push({ y: yClamp(lim), text: `${ctx.text('Grenzwert', 'limit')} 2/(2s−1) = ${num(ctx, lim, 3)}${yB(lim) < yTop ? ' ↑' : ''}`, fill: state });
    const placed = spread(ends.map((e) => e.y), 1.15 * fs, botY0 - 1.0 * fs, botY1 - 0.9 * fs);
    ends.forEach((e, i) => label(ctx, gLabels, W - mR + 0.9 * fs, placed[i] + 0.33 * fs, e.text, fs, { fill: e.fill, size: 0.88 }));
    label(ctx, gLabels, W - mR, botY0 - 1.0 * fs, `X = ${num(ctx, X, mode === 'lin' ? 2 : 0)}`, fs, { anchor: 'end' });

    outF.set(`${num(ctx, FX, 4)}  (X = ${num(ctx, X, mode === 'lin' ? 2 : 0)})`);
    outV.set(finite
      ? ctx.text(`quadratintegrierbar: das Integral bleibt unter ${num(ctx, lim, 4)}`, `square integrable: the integral stays below ${num(ctx, lim, 4)}`)
      : ctx.text('nicht quadratintegrierbar: das Integral wächst über alle Grenzen', 'not square integrable: the integral grows without bound'));
    return { X, FX };
  };
  const liveExit = svgEl('g', {}, gBot);
  const guide = svgEl('g', {}, svg);

  let lastInfo = { X: X_LIN, FX: gaussPartial(X_LIN) };
  return {
    render(_frame, time) { lastInfo = paint(time); },
    destroy() { svg.remove(); },
    info: () => ({ mode, f: kind, s, X: lastInfo.X, F: lastInfo.FX }),
  };
}
