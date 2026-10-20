// c03.demo.partialsummen: the admission test for l^2 (figure c03.fig.partialsummen, Vertiefung
// c03.v1). 2D, SVG on the plate; animated.
//
// TOP: the squared moduli |v_j|^2 = j^(-2s) of the column v_j = j^(-s) as bars, j = 1..N.
// BOTTOM: the partial sums S_N = sum_{j<=N} |v_j|^2 against N. Drawn always, as in the still: the
// chapter's three columns v_j = 1/j (s = 1, solid), 1/sqrt(j) (s = 1/2, dashed) and 1 (s = 0,
// dash-dotted), and the bound 2 of c03.eq.rate. Drawn for the chosen exponent s (state role): its
// partial sums, and either the N-independent bound 2s/(2s-1) and the limit (s > 1/2) or the lower
// bound int_1^(N+1) x^(-2s) dx, which grows without limit (s <= 1/2). Both bounds are the two
// comparisons with the integral of x^(-2s) that the chapter uses in c03.eq.rate for s = 1 and
// s = 1/2; for other s they are the same argument, not a claim of the chapter.
// PLAY: N grows; the axis is N <= 25 (as in the still) or N <= 10^6 on a logarithmic axis.
//
// Every number shown is an input (s, N) or computed by web/src/kernels/hilbert.ts (termSquare,
// partialSum, sumUpperBound, sumUpperBoundLimit, sumLowerBound, sumLimit). Default state: the still
// (N = 25, linear axis), with s = 1.
import type { DemoContext, DemoInstance, DemoMeta } from '../demo/types';
import { partialSum, sumLimit, sumLowerBound, sumUpperBoundLimit, termSquare } from '../kernels/hilbert';
import { choice, ensureStyle, fix, int, num, place, setAttrs, svgEl, tweener } from './c03/common';
import { growthClock, label, pathD, pool, scale, setBar, setPath, spread } from './c03/plot';

export const meta: DemoMeta = { animated: true, aspect: 1.6, surface: 'plate' };

type Mode = 'lin' | 'log';
const N_LIN = 25, N_LOG = 1e6;                       // the still's range; the far range: drawing choices
const PERIOD: Record<Mode, number> = { lin: 7.5, log: 12 };   // seconds per cycle: drawing choices
const GROW = 0.8;                                     // fraction of a cycle in which N grows
const Y_MAX: Record<Mode, number> = { lin: 5.2, log: 16 };
const S_MAX = 1.5;
const BAR_POOL = 40;                                   // bars drawn one by one in the log view; beyond, an area
const CHAPTER: Array<{ s: number; role: string; dash: string; de: string; en: string }> = [
  { s: 1, role: 'q1', dash: '', de: 'vⱼ = 1/j: zugelassen', en: 'vⱼ = 1/j: admitted' },
  { s: 0.5, role: 'q3', dash: '5 2', de: 'vⱼ = 1/√j: ≥ ln(N+1)', en: 'vⱼ = 1/√j: ≥ ln(N+1)' },
  { s: 0, role: 'q5', dash: '5 1.5 1.2 1.5', de: 'vⱼ = 1: N', en: 'vⱼ = 1: N' },
];

export function mount(stage: HTMLElement, ctx: DemoContext): DemoInstance {
  ensureStyle();
  const svg = svgEl('svg', { 'aria-hidden': 'true' });
  stage.append(svg);
  const tw = tweener(ctx, stage);
  const uid = `c03ps${Math.floor(ctx.random() * 1e9)}`;

  // ── state ───────────────────────────────────────────────────────────────────────────────
  let mode: Mode = ctx.params.mode === 'log' ? 'log' : 'lin';
  let s = Math.max(0, Math.min(S_MAX, Number(ctx.params.s ?? '1')));
  if (!Number.isFinite(s)) s = 1;
  const clock = growthClock(PERIOD[mode], GROW, Number(ctx.params.u ?? '1'));
  let lastTime = -1, nu = N_LIN;
  const nuOf = (u: number) => (mode === 'lin' ? 1 + (N_LIN - 1) * u : 10 ** (6 * u));
  const uOf = (n: number) => (mode === 'lin' ? (n - 1) / (N_LIN - 1) : Math.log10(n) / 6);

  // ── controls ────────────────────────────────────────────────────────────────────────────
  const nSlider = ctx.ui.slider({
    label: ctx.text('Anzahl N der summierten Einträge', 'number N of entries summed'),
    labelHtml: '<math><mi>N</mi></math>',
    min: 0, max: 1, step: 0.001, value: 1, primary: true,
    format: (u) => int(ctx, Math.floor(nuOf(u))),
    onInput: (u) => { tw.still(); clock.setU(u); },
  });
  const sSlider = ctx.ui.slider({
    label: ctx.text('Exponent s in v_j = j^(−s)', 'exponent s in v_j = j^(−s)'),
    labelHtml: ctx.text('Exponent ', 'exponent ') + '<math><mi>s</mi></math>' + ctx.text(' in ', ' in ') + '<math><msub><mi>v</mi><mi>j</mi></msub><mo>=</mo><msup><mi>j</mi><mrow><mo>−</mo><mi>s</mi></mrow></msup></math>',
    min: 0, max: S_MAX, step: 0.01, value: s,
    format: (v) => fix(ctx, v, 2),
    onInput: (v) => { tw.still(); s = v; presetCtl.set(null); },
  });
  const presetCtl = choice<'1' | '0.5' | '0'>(ctx, ctx.text('Spalten aus dem Text', 'columns of the text'), [
    { value: '1', html: '<math><msub><mi>v</mi><mi>j</mi></msub><mo>=</mo><mn>1</mn><mo>/</mo><mi>j</mi></math>', title: ctx.text('v_j = 1/j, s = 1', 'v_j = 1/j, s = 1') },
    { value: '0.5', html: '<math><msub><mi>u</mi><mi>j</mi></msub><mo>=</mo><mn>1</mn><mo>/</mo><msqrt><mi>j</mi></msqrt></math>', title: ctx.text('u_j = 1/√j, s = 1/2', 'u_j = 1/√j, s = 1/2') },
    { value: '0', html: '<math><msub><mi>v</mi><mi>j</mi></msub><mo>=</mo><mn>1</mn></math>', title: ctx.text('lauter Einsen, s = 0', 'all ones, s = 0') },
  ], s === 1 ? '1' : s === 0.5 ? '0.5' : s === 0 ? '0' : null, (k) => { tw.tween(); s = Number(k); sSlider.set(s); });
  choice<Mode>(ctx, ctx.text('Achse', 'axis'), [
    { value: 'lin', html: ctx.text('N bis 25', 'N up to 25'), title: ctx.text('lineare Achse, N bis 25 wie in der Abbildung', 'linear axis, N up to 25 as in the figure') },
    { value: 'log', html: ctx.text('N bis 10⁶, logarithmisch', 'N up to 10⁶, logarithmic'), title: ctx.text('logarithmische Achse, N bis eine Million', 'logarithmic axis, N up to one million') },
  ], mode, (k) => { tw.still(); const n = Math.floor(nu); mode = k; clock.setPeriod(PERIOD[mode]); clock.setU(Math.max(0, Math.min(1, uOf(Math.min(n, mode === 'lin' ? N_LIN : N_LOG))))); });
  const outS = ctx.ui.readout(ctx.text('Teilsumme', 'partial sum'), '<math><munderover><mo>∑</mo><mrow><mi>j</mi><mo>=</mo><mn>1</mn></mrow><mi>N</mi></munderover><msup><mrow><mo>|</mo><msub><mi>v</mi><mi>j</mi></msub><mo>|</mo></mrow><mn>2</mn></msup></math>');
  const outV = ctx.ui.readout(ctx.text('Urteil', 'verdict'));

  // ── drawing ─────────────────────────────────────────────────────────────────────────────
  const gStatic = svgEl('g', {}, svg);
  const defs = svgEl('defs', {}, svg);
  const clipTop = svgEl('clipPath', { id: `${uid}-top` }, defs), clipBot = svgEl('clipPath', { id: `${uid}-bot` }, defs);
  const clipTopR = svgEl('rect', {}, clipTop), clipBotR = svgEl('rect', {}, clipBot);
  const gTop = svgEl('g', { 'clip-path': `url(#${uid}-top)` }, svg);
  const bars = pool(gTop, 'rect');
  const tail = svgEl('path', { class: 'c03-move' }, gTop);
  const gBot = svgEl('g', { 'clip-path': `url(#${uid}-bot)` }, svg);
  const gChapter = svgEl('g', {}, gBot);
  const lower = svgEl('path', { class: 'c03-move', fill: 'none' }, gBot);
  const boundG = svgEl('g', { class: 'c03-move' }, gBot), boundL = svgEl('line', {}, boundG);
  const limitG = svgEl('g', { class: 'c03-move' }, gBot), limitL = svgEl('line', {}, limitG);
  const live = svgEl('path', { class: 'c03-move', fill: 'none' }, gBot);
  const dots = pool(gBot, 'circle');
  const liveExit = svgEl('g', {}, gBot);
  const gLabels = svgEl('g', {}, svg);

  const paint = (time: number) => {
    if (time !== lastTime) { if (lastTime >= 0) tw.still(); lastTime = time; }
    const u = clock.u(time);
    nSlider.set(u);
    nu = nuOf(u);
    const N = Math.max(1, Math.floor(nu + 1e-9)), frac = mode === 'lin' ? nu - N : 0;
    const nMax = mode === 'lin' ? N_LIN : N_LOG;
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
    const mL = 3.6 * fs, mR = 13.5 * fs;
    const topY0 = 1.9 * fs, topY1 = topY0 + (narrow ? 0.2 : 0.24) * H;
    const botY0 = topY1 + 2.2 * fs, botY1 = H - 2.6 * fs;
    const xs = mode === 'lin' ? scale('lin', 0, 26, mL, W - mR) : scale('log10', 10 ** -0.3, 10 ** 6.15, mL, W - mR);
    const yT = scale('lin', 0, 1.08, topY1, topY0);
    const yMax = Y_MAX[mode];
    const yB = scale('lin', 0, yMax, botY1, botY0);
    setAttrs(clipTopR, { x: mL - 2, y: topY0 - 4, width: W - mR - mL + 4, height: topY1 - topY0 + 4 });
    setAttrs(clipBotR, { x: mL - 2, y: botY0 - 1.2 * fs, width: W - mR - mL + 4 + 0.6 * fs, height: botY1 - botY0 + 1.2 * fs + 2 });

    // ── axes, ticks, chapter curves (rebuilt) ──
    gStatic.replaceChildren(); gChapter.replaceChildren(); gLabels.replaceChildren();
    const line = (g: Element, x1: number, y1: number, x2: number, y2: number, stroke: string, w: number, dash?: string) =>
      svgEl('line', { x1, y1, x2, y2, stroke, 'stroke-width': w, ...(dash ? { 'stroke-dasharray': dash } : {}) }, g);
    for (const [y0, y1, sc, ticks] of [[topY0, topY1, yT, [0, 0.5, 1]], [botY0, botY1, yB, mode === 'lin' ? [0, 1, 2, 3, 4, 5] : [0, 4, 8, 12, 16]]] as const) {
      line(gStatic, mL, y1, W - mR + 0.6 * fs, y1, ink, k.stroke('thin'));
      line(gStatic, mL, y1, mL, y0 - 0.4 * fs, ink, k.stroke('thin'));
      for (const t of ticks) {
        line(gStatic, mL - 0.3 * fs, sc(t), mL, sc(t), ink, k.stroke('hair'));
        if (t > 0) line(gStatic, mL, sc(t), W - mR, sc(t), rule, k.stroke('hair'));
        label(ctx, gStatic, mL - 0.5 * fs, sc(t) + 0.33 * fs, num(ctx, t, 1), fs, { anchor: 'end', fill: muted, size: 0.85 });
      }
    }
    const xt = mode === 'lin' ? [0, 5, 10, 15, 20, 25] : [1, 10, 100, 1e3, 1e4, 1e5, 1e6];
    const sup = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶'];
    for (const t of xt) {
      line(gStatic, xs(t), botY1, xs(t), botY1 + 0.3 * fs, ink, k.stroke('hair'));
      line(gStatic, xs(t), topY1, xs(t), topY1 + 0.25 * fs, ink, k.stroke('hair'));
      const lab = mode === 'lin' ? String(t) : t < 1e3 ? String(t) : `10${sup[Math.round(Math.log10(t))]}`;
      label(ctx, gStatic, xs(t), botY1 + 1.25 * fs, lab, fs, { anchor: 'middle', fill: muted, size: 0.85 });
    }
    label(ctx, gStatic, W - mR + 0.9 * fs, botY1 + 0.35 * fs, 'N', fs, { italic: true });
    label(ctx, gStatic, W - mR + 0.9 * fs, topY1 + 0.35 * fs, 'j', fs, { italic: true });
    label(ctx, gStatic, mL - 0.3 * fs, topY0 - 0.6 * fs, `|vⱼ|² = j⁻²ˢ, s = ${fix(ctx, s, 2)}`, fs, { fill: state });
    label(ctx, gStatic, mL - 0.3 * fs, botY0 - 0.9 * fs, ctx.text('Teilsummen  Σⱼ₌₁ᴺ |vⱼ|²', 'partial sums  Σⱼ₌₁ᴺ |vⱼ|²'), fs);

    // the sampled indices of a curve up to n
    const samples = (n: number): number[] => {
      if (mode === 'lin') return Array.from({ length: n }, (_, i) => i + 1);
      const out = new Set<number>();
      const M = 260;
      for (let i = 0; i <= M; i++) out.add(Math.max(1, Math.min(n, Math.round(10 ** ((Math.log10(n) * i) / M)))));
      return [...out].sort((a, b) => a - b);
    };
    const yTop = botY0 - 0.6 * fs;
    const clampY = (y: number) => Math.max(yTop, y);
    // a curve up to n (and a fraction f of the next step); it ends where it leaves the panel at the top
    const curve = (sv: number, n: number, f: number) => {
      const js = samples(n);
      const raw: Array<[number, number]> = js.map((j) => [xs(j), yB(partialSum(sv, j))]);
      if (f > 0 && n < nMax) {
        const a = partialSum(sv, n), b = partialSum(sv, n + 1);
        raw.push([xs(n + f), yB(a + (b - a) * f)]);
      }
      const pts: Array<[number, number]> = [];
      let exit = false;
      for (const p of raw) {
        if (p[1] >= yTop) { pts.push(p); continue; }
        const q = pts[pts.length - 1];
        if (q) pts.push([q[0] + ((p[0] - q[0]) * (q[1] - yTop)) / (q[1] - p[1]), yTop]);
        exit = true;
        break;
      }
      return { pts, exit, dotCount: Math.min(pts.length, n) };
    };
    const exitMark = (g: Element, p: readonly [number, number], col: string) =>
      svgEl('path', { d: `M ${p[0] - 0.32 * fs} ${p[1] + 0.1 * fs} L ${p[0]} ${p[1] - 0.45 * fs} L ${p[0] + 0.32 * fs} ${p[1] + 0.1 * fs}`, fill: 'none', stroke: col, 'stroke-width': k.stroke('regular'), 'stroke-linejoin': 'round' }, g);
    // the bound 2 of c03.eq.rate (as in the still)
    line(gChapter, mL, yB(2), W - mR, yB(2), muted, k.stroke('hair'));
    const ends: Array<{ y: number; text: string; fill: string }> = [];
    ends.push({ y: yB(2), text: ctx.text('Schranke 2', 'bound 2'), fill: muted });
    for (const c of CHAPTER) {
      const cv = curve(c.s, N, frac);
      const col = k.color(c.role);
      svgEl('path', { d: pathD(cv.pts), fill: 'none', stroke: col, 'stroke-width': k.stroke('regular'), ...(c.dash ? { 'stroke-dasharray': c.dash } : {}), 'stroke-linejoin': 'round' }, gChapter);
      if (mode === 'lin') for (const p of cv.pts.slice(0, cv.exit ? cv.pts.length - 1 : cv.dotCount)) svgEl('circle', { cx: p[0], cy: p[1], r: 0.17 * fs, fill: col }, gChapter);
      const last = cv.pts[cv.pts.length - 1];
      if (cv.exit) exitMark(gChapter, last, col);
      ends.push({ y: last[1], text: ctx.text(c.de, c.en), fill: col });
    }

    // ── the chosen column (persistent elements, eased on presets) ──
    const sq = (j: number) => termSquare(s, j);
    // bars
    let nb = 0;
    const barMax = mode === 'lin' ? Math.min(N_LIN, N + 1) : Math.min(BAR_POOL, N);
    for (let j = 1; j <= barMax; j++) {
      const h = j <= N ? sq(j) : sq(j) * frac;
      const w = mode === 'lin' ? 0.5 * (xs(1) - xs(0)) : xs(j + 0.4) - xs(j - 0.4);
      const r = bars.get(nb++);
      setBar(r, xs(j), yT(0), w, yT(0) - yT(h));
      setAttrs(r, { fill: k.color('state'), 'fill-opacity': 0.28, stroke: state, 'stroke-width': k.stroke('thin') });
    }
    bars.hideFrom(nb);
    if (mode === 'log' && N > BAR_POOL) {
      const js = samples(N).filter((j) => j > BAR_POOL);
      const top = [[xs(BAR_POOL + 0.5), yT(sq(BAR_POOL + 1))] as [number, number], ...js.map((j) => [xs(j), yT(sq(j))] as [number, number])];
      setPath(tail, `${pathD(top)} L ${xs(N).toFixed(2)} ${yT(0).toFixed(2)} L ${xs(BAR_POOL + 0.5).toFixed(2)} ${yT(0).toFixed(2)} Z`);
      setAttrs(tail, { fill: state, 'fill-opacity': 0.28, stroke: state, 'stroke-width': k.stroke('thin') });
      tail.style.display = '';
    } else tail.style.display = 'none';
    // partial sums
    const lv = curve(s, N, frac);
    const pts = lv.pts;
    setPath(live, pathD(pts));
    setAttrs(live, { stroke: state, 'stroke-width': k.stroke('state'), 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
    let nd = 0;
    if (mode === 'lin') for (const p of pts.slice(0, lv.exit ? pts.length - 1 : lv.dotCount)) {
      const c = dots.get(nd++);
      setAttrs(c, { cx: 0, cy: 0, r: 0.27 * fs, fill: state });
      place(c, `translate(${p[0].toFixed(2)}px, ${p[1].toFixed(2)}px)`);
    }
    dots.hideFrom(nd);
    const SN = partialSum(s, N);
    const admitted = 2 * s > 1;
    // bounds of the chosen column
    const ub = sumUpperBoundLimit(s), lim = sumLimit(s);
    const yClamp = (v: number) => Math.max(botY0 - 0.9 * fs, yB(v));
    place(boundG, `translate(0px, ${(admitted ? yClamp(ub) : botY0 - 3 * fs).toFixed(2)}px)`);
    setAttrs(boundL, { x1: mL, x2: W - mR, y1: 0, y2: 0, stroke: state, 'stroke-width': k.stroke('thin'), 'stroke-dasharray': '6 3' });
    place(limitG, `translate(0px, ${(admitted ? yClamp(lim) : botY0 - 3 * fs).toFixed(2)}px)`);
    setAttrs(limitL, { x1: mL, x2: W - mR, y1: 0, y2: 0, stroke: state, 'stroke-width': k.stroke('hair') });
    boundG.style.opacity = admitted ? '1' : '0'; limitG.style.opacity = admitted ? '1' : '0';
    boundG.classList.add('c03-fade'); limitG.classList.add('c03-fade');
    liveExit.replaceChildren();
    if (lv.exit) exitMark(liveExit, pts[pts.length - 1], state);
    if (!admitted) {
      const lp: Array<[number, number]> = samples(Math.max(1, N)).map((j) => [xs(j), yB(sumLowerBound(s, j))] as [number, number]).filter((p) => p[1] >= yTop);
      setPath(lower, pathD(lp));
      setAttrs(lower, { stroke: state, 'stroke-width': k.stroke('thin'), 'stroke-dasharray': '1.5 2.5', 'stroke-linecap': 'round' });
      lower.style.display = '';
    } else lower.style.display = 'none';

    // ── labels at the right end ──
    const sTxt = fix(ctx, s, 2);
    const liveEnd = pts[pts.length - 1];
    ends.push({ y: liveEnd[1], text: `s = ${sTxt}: ${num(ctx, SN, 4)}`, fill: state });
    if (admitted) {
      if (Math.abs(ub - 2) > 1e-12) ends.push({ y: yClamp(ub), text: `${ctx.text('Schranke', 'bound')} ${num(ctx, ub, 3)}${yB(ub) < botY0 - 0.9 * fs ? ' ↑' : ''}`, fill: state });
      ends.push({ y: yClamp(lim), text: `${ctx.text('Grenzwert', 'limit')} ${num(ctx, lim, 4)}${yB(lim) < botY0 - 0.9 * fs ? ' ↑' : ''}`, fill: state });
    } else {
      const lb = sumLowerBound(s, N);
      ends.push({ y: clampY(yB(lb)), text: `${ctx.text('untere Schranke', 'lower bound')} ${num(ctx, lb, 3)}`, fill: state });
    }
    const placed = spread(ends.map((e) => e.y), 1.15 * fs, botY0 - 1.0 * fs, botY1 - 0.2 * fs);
    ends.forEach((e, i) => {
      label(ctx, gLabels, W - mR + 0.9 * fs, placed[i] + 0.33 * fs, e.text, fs, { fill: e.fill, size: 0.88 });
    });
    // the current N and S_N above the bottom panel, at the right
    label(ctx, gLabels, W - mR, botY0 - 0.9 * fs, `N = ${int(ctx, N)}`, fs, { anchor: 'end', fill: ink });

    outS.set(`${num(ctx, SN, 4)}  (N = ${int(ctx, N)}, s = ${sTxt})`);
    outV.set(admitted
      ? ctx.text(`s > 1/2: zugelassen, alle Teilsummen < 2s/(2s−1) = ${num(ctx, ub, 3)}`, `s > 1/2: admitted, every partial sum < 2s/(2s−1) = ${num(ctx, ub, 3)}`)
      : ctx.text('s ≤ 1/2: nicht zugelassen, die Teilsummen wachsen über alle Grenzen', 's ≤ 1/2: not admitted, the partial sums grow without bound'));
    return { N, SN };
  };

  let lastInfo = { N: N_LIN, SN: partialSum(s, N_LIN) };
  return {
    render(_frame, time) { lastInfo = paint(time); },
    resize() { /* the next render reads the stage size */ },
    tokensChanged() { /* colours are read at draw time */ },
    destroy() { svg.remove(); },
    info: () => ({ mode, s, N: lastInfo.N, S_N: lastInfo.SN, limit: sumLimit(s), bound: sumUpperBoundLimit(s) }),
  };
}
