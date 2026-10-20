// c01.demo.konzentration: how close the relative frequency of an event lies to its
// probability (Vertiefung c01.v2, figure c01.fig.konzentration, theorem c01.thm.haeufigkeit).
//
// Model: a coin X = {0, 1} with p(1) = q and the event S = {1}; N independent repetitions,
// H_N = (relative frequency of S). Three views on one plate:
//   left   M seeded series of a computer program (a sample, labelled as one): the running
//          relative frequency H_n against n = 1..N on a logarithmic n axis, with the band
//          |H - q| < eps;
//   right  the exact weight of H_N, P_N[H_N = k/N] = binom(N,k) q^k (1-q)^(N-k)
//          (c01.eq.binomial), as horizontal bars on the same vertical axis, in units of the
//          largest value as in the print figure; the values with |k/N - q| >= eps hatched;
//   below  the exact probability P_N[|H_N - q| >= eps] against N together with the bounds
//          q(1-q)/(N eps^2) and 1/(4 N eps^2) of c01.eq.gesetz, on logarithmic axes: the
//          bounds fall like 1/N; the exact probability of the displayed case is plotted beside them
//          (often far below them, as the text says it can be). No rate is claimed for it.
// Every number shown is an input (N, q, eps, seed) or computed by web/src/kernels/prob.ts:
// binomialWeight, binomialWeightValues, deviationTail, isDeviation, chebyshevBound,
// coarseBound (exact), sample and eventCounts (the seeded sampler). The sample says nothing
// beyond itself; the theorem is a statement about the product weight, which the right and
// lower views evaluate exactly.
// Parameters: n (N), q (numerator over 12), eps (numerator over 24), seed.
// Clock: play grows N from 1 to 1000 (the series extend, they are not redrawn).
import type { DemoContext, DemoInstance, DemoMeta } from '../demo/types';
import {
  binomialWeight, binomialWeightValues, chebyshevBound, coarseBound, deviationTail, eventCounts, frac, fractionToNumber, isDeviation, sample, toNumber, type Fraction,
} from '../kernels/prob';
import { Plate, fdec, fq, it, note, pointer } from './c01/kit';
import { rich, richWidth, type RichOpts, type Seg } from './c01/segments';

export const meta: DemoMeta = { animated: true, aspect: 1.32, surface: 'plate' };

const NMAX = 1000;      // longest series: a drawing choice
const M = 30;           // number of seeded series: a drawing choice
const QD = 12;          // q runs over the multiples of 1/12
const ED = 24;          // eps runs over the multiples of 1/24
const PERIOD = 14;      // seconds for N to run from 1 to NMAX while playing: a drawing choice
const PMIN = 1e-6;      // lower end of the probability axis of the lower view: a drawing choice
const PATH_PTS = 220;   // largest number of points of one drawn series: a drawing choice

// N values of the lower view: about 13 per decade, with the figure's 4, 16, 64
const GRID_N = [...new Set([...Array.from({ length: 40 }, (_, j) => Math.round(10 ** ((3 * j) / 39))), 4, 16, 64])].sort((a, b) => a - b);

// mathematical italic letters for SVG text in the maths face
const MI = { H: it('H'), N: it('N'), n: it('n'), q: it('q'), e: it('ε'), k: it('k') };

export function mount(stage: HTMLElement, ctx: DemoContext): DemoInstance {
  const plate = new Plate(stage, ctx);
  const T = ctx.text;
  const PR = ctx.symbol('sym.probability');

  // ── state ─────────────────────────────────────────────────────
  const int = (s: string | undefined, d: number, lo: number, hi: number) => { const v = Math.round(Number(s ?? d)); return Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : d; };
  let qk = int(ctx.params.q, 6, 0, QD);
  let ej = int(ctx.params.eps, 6, 1, ED / 2);
  let run = 0;
  let now = 0, lastTime = -1;
  let hover: { x: number; y: number } | null = null;
  const clampN = (n: number) => Math.max(1, Math.min(NMAX, Math.round(n)));
  const toN = (s: number) => clampN(Math.pow(NMAX, s / 100));
  const toS = (n: number) => (100 * Math.log(clampN(n))) / Math.log(NMAX);
  // (the end of the slider, s = 100, stays N = NMAX; past it the clock starts again at N = 1)
  const wrap = (v: number) => { const r = ((v % 100) + 100) % 100; return r === 0 && v > 0 ? 100 : r; };
  let offset = toS(int(ctx.params.n, 16, 1, NMAX));
  const sNow = () => wrap((100 * now) / PERIOD + offset);
  const q = () => frac(qk, QD);
  const eps = () => frac(ej, ED);
  const seed0 = () => (ctx.seed + run * M) >>> 0;

  // caches: the series per (q, run), the weight values per (N, q), the lower curve per (q, eps)
  const seriesCache = new Map<string, number[][]>();
  const series = (): number[][] => {
    const key = `${qk}:${run}`;
    let s = seriesCache.get(key);
    if (!s) {
      if (seriesCache.size > 8) seriesCache.clear();
      s = Array.from({ length: M }, (_, m) => eventCounts(sample([QD - qk, qk], (seed0() + m) >>> 0, NMAX), [1]));
      seriesCache.set(key, s);
    }
    return s;
  };
  const valCache = new Map<string, number[]>();
  const values = (n: number): number[] => {
    const key = `${n}:${qk}`;
    let v = valCache.get(key);
    if (!v) { if (valCache.size > 200) valCache.clear(); v = binomialWeightValues(n, q()); valCache.set(key, v); }
    return v;
  };
  const exactCache = new Map<string, Fraction[]>();
  const exactWeight = (n: number): Fraction[] => {
    const key = `${n}:${qk}`;
    let v = exactCache.get(key);
    if (!v) { if (exactCache.size > 8) exactCache.clear(); v = binomialWeight(n, q()); exactCache.set(key, v); }
    return v;
  };
  const tailCache = new Map<string, Fraction>();
  const tail = (n: number): Fraction => {
    const key = `${n}:${qk}:${ej}`;
    let v = tailCache.get(key);
    if (!v) { if (tailCache.size > 4000) tailCache.clear(); v = deviationTail(n, q(), eps()); tailCache.set(key, v); }
    return v;
  };

  // ── controls ──────────────────────────────────────────────────
  const fmtInt = (n: number) => n.toLocaleString(ctx.lang);
  const slider = ctx.ui.slider({
    label: T('Anzahl N der Wiederholungen', 'number N of repetitions'),
    labelHtml: '<math><mi>N</mi></math>',
    min: 0, max: 100, step: 0.5, value: sNow(), primary: true,
    format: (s) => fmtInt(toN(s)),
    onInput: (s) => { offset = s - (100 * now) / PERIOD; },
  });
  for (const n of [4, 16, 64]) ctx.ui.button(`N = ${n}`, () => { offset = toS(n) - (100 * now) / PERIOD; slider.set(sNow()); say(); });
  ctx.ui.slider({
    label: T('Wahrscheinlichkeit q des Ereignisses, in Zwölfteln', 'probability q of the event, in twelfths'),
    labelHtml: '<math><mi>q</mi></math>',
    min: 0, max: QD, step: 1, value: qk,
    format: (v) => fq(frac(v, QD)),
    onInput: (v) => { qk = v; say(); },
  });
  ctx.ui.slider({
    label: T('Abstand epsilon, in 24steln', 'distance epsilon, in 24ths'),
    labelHtml: '<math><mi>ε</mi></math>',
    min: 1, max: ED / 2, step: 1, value: ej,
    format: (v) => fq(frac(v, ED)),
    onInput: (v) => { ej = v; say(); },
  });
  ctx.ui.button(T('neue Messreihen', 'new series'), () => { run += 1; say(); });
  const devHtml = `<math><msub><mi>${PR.unicode}</mi><mi>N</mi></msub><mo>[</mo><mo>|</mo><msub><mi>H</mi><mi>N</mi></msub><mo>−</mo><mi>q</mi><mo>|</mo><mo>≥</mo><mi>ε</mi><mo>]</mo></math>`;
  const outP = ctx.ui.readout(T('Wahrscheinlichkeit einer Abweichung um mindestens epsilon, exakt', 'probability of a deviation by at least epsilon, exact'), devHtml);
  const outC = ctx.ui.readout(T('Tschebyscheff-Schranke', 'Chebyshev bound'), '<math><mfrac><mrow><mi>q</mi><mo>(</mo><mn>1</mn><mo>−</mo><mi>q</mi><mo>)</mo></mrow><mrow><mi>N</mi><msup><mi>ε</mi><mn>2</mn></msup></mrow></mfrac></math>');
  const outK = ctx.ui.readout(T('gröbere Schranke', 'coarser bound'), '<math><mfrac><mn>1</mn><mrow><mn>4</mn><mi>N</mi><msup><mi>ε</mi><mn>2</mn></msup></mrow></mfrac></math>');
  const outS = ctx.ui.readout(T('Stichprobe: Messreihen außerhalb des Bandes', 'sample: series outside the band'));
  const caption = note(ctx);

  // ── numbers ───────────────────────────────────────────────────
  const sci = (x: number): string => {
    if (x === 0) return '0';
    if (x >= 1e-3) return fdec(ctx, x, x >= 0.01 ? 4 : 5);
    const e = Math.floor(Math.log10(x));
    const m = x / 10 ** e;
    const sup = String(e).replace('-', '⁻').replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]);
    return `${fdec(ctx, m, 2)} · 10${sup}`;
  };
  const showExact = (f: Fraction): string => {
    const v = fractionToNumber(f);
    if (f.den === 1n) return fq(f);
    if (f.den < 10n ** 7n) return `${fq(f)} ≈ ${sci(v)}`;
    return `≈ ${sci(v)} ${T('(exakter Bruch, gerundet)', '(exact fraction, rounded)')}`;
  };
  const outsideCount = (n: number): number => series().reduce((s, c) => s + (isDeviation(c[n - 1], n, q(), eps()) ? 1 : 0), 0);
  const current = () => {
    const n = toN(sNow());
    return { n, dev: tail(n), cheb: chebyshevBound(n, q(), eps()), coarse: coarseBound(n, eps()), outside: outsideCount(n) };
  };
  const say = () => {
    const c = current();
    ctx.announce(T(
      `N = ${c.n}, q = ${fq(q())}, ε = ${fq(eps())}: exakte Wahrscheinlichkeit der Abweichung ${showExact(c.dev)}, Schranke ${fq(c.cheb)}; Stichprobe: ${c.outside} von ${M} Messreihen außerhalb.`,
      `N = ${c.n}, q = ${fq(q())}, ε = ${fq(eps())}: exact probability of the deviation ${showExact(c.dev)}, bound ${fq(c.cheb)}; sample: ${c.outside} of ${M} series outside.`));
  };

  pointer(plate.svg, {
    hover: (x, y) => { hover = { x, y }; ctx.invalidate(); },
    leave: () => { if (hover) { hover = null; ctx.invalidate(); } },
  });

  // ── drawing ───────────────────────────────────────────────────
  const rt = (key: string, x: number, y: number, segs: Seg[], o: RichOpts = {}) => rich(plate, ctx, key, x, y, segs, o);

  const paint = (ease: boolean) => {
    const fs = plate.begin(ease);
    const k = ctx.tokens;
    const { W, H } = plate;
    const ink = k.color('plate-ink'), muted = k.color('plate-muted'), rule = k.color('plate-rule'), state = k.color('state');
    const c = current();
    const N = c.n, qq = q(), ee = eps();
    const qv = toNumber(qq), ev = toNumber(ee);
    const S = series();

    // geometry
    const yTop = 2.3 * fs, yBot = H * 0.62;
    const xa = 3.0 * fs, xb = W * 0.55;
    const xr0 = xb + 4.6 * fs, xr1 = W - 1.0 * fs;
    const Y = (v: number) => yBot - v * (yBot - yTop);
    const Nax = Math.max(N, 2);
    const wide = W >= 520;
    const X = (n: number) => xa + (Math.log(n) / Math.log(Nax)) * (xb - xa);

    // the band |H - q| < eps over both upper views (open: dashed edges)
    const lo = Math.max(0, qv - ev), hi = Math.min(1, qv + ev);
    plate.rect('band', xa, Y(hi), xr1 - xa, Y(lo) - Y(hi), { fill: k.color('grey-1') }, 'back');
    if (qv + ev < 1) plate.line('band-hi', xa, Y(hi), xr1, Y(hi), muted, k.stroke('thin'), { 'stroke-dasharray': k.dash('effect').join(' ') });
    if (qv - ev > 0) plate.line('band-lo', xa, Y(lo), xr1, Y(lo), muted, k.stroke('thin'), { 'stroke-dasharray': k.dash('effect').join(' ') });

    // axes of the upper views
    plate.line('ax-y', xa, yBot, xa, yTop - 0.6 * fs, ink, k.stroke('thin'));
    plate.line('ax-x', xa, yBot, xb, yBot, ink, k.stroke('thin'));
    plate.line('ax-r', xr0, yBot + 0.4 * fs, xr0, yTop - 0.2 * fs, ink, k.stroke('thin'));
    plate.text('t0', xa - 0.45 * fs, Y(0), '0', { anchor: 'end', fill: muted, baseline: 'middle' });
    plate.text('t1', xa - 0.45 * fs, Y(1), '1', { anchor: 'end', fill: muted, baseline: 'middle' });
    if (Math.abs(Y(qv) - Y(0)) > 1.4 * fs && Math.abs(Y(qv) - Y(1)) > 1.4 * fs) plate.fraction('tq', xa - 0.45 * fs, Y(qv), qq, { anchor: 'end', fill: ink, size: fs * 0.95 });
    plate.line('q-line', xa, Y(qv), xb, Y(qv), state, k.stroke('state'), {}, 'marks');
    plate.text('n1', xa, yBot + 1.3 * fs, '1', { fill: muted });
    plate.text('nN', xb, yBot + 1.3 * fs, fmtInt(N), { fill: muted, anchor: 'end' });
    rt('n-name', (xa + xb) / 2, yBot + 1.3 * fs, [['m', MI.n], ['t', wide ? T(' (logarithmische Skala)', ' (logarithmic scale)') : T(' (log.)', ' (log.)')]], { size: fs * 0.95, fill: muted });
    rt('left-title', xa, 1.1 * fs, [['m', MI.H], ['s', MI.n], ['t', wide ? T(` in ${M} Messreihen (Stichprobe, Startwerte ${seed0()}…${seed0() + M - 1})`, ` in ${M} series (a sample, seeds ${seed0()}…${seed0() + M - 1})`) : T(`, ${M} Reihen (Stichprobe)`, `, ${M} series (sample)`)]], { anchor: 'start', size: fs * 0.95 });

    // the series
    const ns: number[] = [];
    if (N <= PATH_PTS) for (let n = 1; n <= N; n++) ns.push(n);
    else { let last = 0; for (let j = 0; j < PATH_PTS; j++) { const n = Math.round(Math.exp((j / (PATH_PTS - 1)) * Math.log(N))); if (n > last) { ns.push(n); last = n; } } }
    S.forEach((cnt, m) => {
      const pts = ns.map((n) => [N === 1 ? xb : X(n), Y(cnt[n - 1] / n)] as [number, number]);
      const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
      plate.pathD(`series-${m}`, d, {
        stroke: m === 0 ? ink : muted, 'stroke-width': m === 0 ? k.stroke('regular') : k.stroke('thin'), 'stroke-opacity': m === 0 ? 1 : 0.55, 'stroke-linejoin': 'round',
      }, 'data', false);
    });
    // end values, stacked to the right of the panel by multiplicity; outside the band: rings
    const mult = new Map<number, number>();
    const step = Math.min(0.5 * fs, (3.6 * fs) / Math.max(1, ...[...S.reduce((mm, cnt) => mm.set(cnt[N - 1], (mm.get(cnt[N - 1]) ?? 0) + 1), new Map<number, number>()).values()]));
    S.forEach((cnt, m) => {
      const kk = cnt[N - 1];
      const j = mult.get(kk) ?? 0; mult.set(kk, j + 1);
      const out = isDeviation(kk, N, qq, ee);
      plate.circle(`end-${m}`, xb + 0.55 * fs + j * step, Y(kk / N), out ? 0.26 * fs : 0.2 * fs, {
        fill: out ? k.color('plate') : (m === 0 ? ink : muted), stroke: out ? ink : 'none', 'stroke-width': k.stroke('regular'),
      });
    });

    // the exact weight of H_N
    const vals = values(N);
    const vmax = Math.max(...vals);
    const th = Math.max(0.9, Math.min(0.62 * fs, (0.72 * (yBot - yTop)) / N));
    let dIn = '', dOut = '';
    vals.forEach((v, kk) => {
      const L = (v / vmax) * (xr1 - xr0);
      if (L < 0.3) return;
      const y = Y(kk / N);
      const r = `M${xr0.toFixed(1)} ${(y - th / 2).toFixed(2)}h${L.toFixed(2)}v${th.toFixed(2)}h${(-L).toFixed(2)}Z`;
      if (isDeviation(kk, N, qq, ee)) dOut += r; else dIn += r;
    });
    plate.pathD('w-in', dIn || 'M0 0', { fill: state, 'fill-opacity': 0.8, stroke: 'none' }, 'data', false);
    plate.pathD('w-out', dOut || 'M0 0', { fill: plate.hatchFill, stroke: state, 'stroke-width': th > 3 ? k.stroke('thin') : 0 }, 'data', false);
    rt('right-title', (xr0 + xr1) / 2, 1.1 * fs, [['t', wide ? T('Gewicht von ', 'weight of ') : ''], ['m', MI.H], ['s', MI.N], ['t', wide ? T(', exakt', ', exact') : T(' exakt', ' exact')]], { size: fs * 0.95 });
    plate.text('right-scale', (xr0 + xr1) / 2, yBot + 1.3 * fs, T('Länge relativ zum Maximum', 'length relative to the maximum'), { fill: muted, size: fs * 0.85 });

    // lower view: probability of the deviation against N
    const yi0 = yBot + 3.4 * fs, yi1 = H - 2.0 * fs;
    const xi0 = xa, xi1 = W - 1.0 * fs;
    const LX = (n: number) => xi0 + (Math.log10(n) / 3) * (xi1 - xi0);
    const LY = (p: number) => yi0 + (Math.log10(Math.min(1, Math.max(PMIN, p))) / Math.log10(PMIN)) * (yi1 - yi0);
    plate.line('i-ax-x', xi0, yi1, xi1, yi1, ink, k.stroke('thin'));
    plate.line('i-ax-y', xi0, yi1, xi0, yi0, ink, k.stroke('thin'));
    for (const [p, lab] of [[1, '1'], [1e-3, '10⁻³'], [1e-6, '10⁻⁶']] as const) {
      if (p < 1) plate.line(`i-g-${lab}`, xi0, LY(p), xi1, LY(p), rule, k.stroke('hair'));
      plate.text(`i-t-${lab}`, xi0 - 0.4 * fs, LY(p), lab, { anchor: 'end', fill: muted, size: fs * 0.85, baseline: 'middle' });
    }
    for (const n of [1, 10, 100, 1000]) plate.text(`i-n-${n}`, LX(n), yi1 + 1.15 * fs, fmtInt(n), { fill: muted, size: fs * 0.85, anchor: n === 1 ? 'start' : n === 1000 ? 'end' : 'middle' });
    rt('i-name', (xi0 + xi1) / 2, yi1 + 1.15 * fs, [['m', MI.N]], { fill: muted, size: fs * 0.9 });
    const curve = (f: (n: number) => number) => GRID_N.map((n) => [LX(n), LY(f(n))] as [number, number]);
    plate.path('i-coarse', curve((n) => toNumber(coarseBound(n, ee))), { stroke: ink, 'stroke-width': k.stroke('regular'), 'stroke-dasharray': k.dash('effect').join(' ') }, 'data', false, false);
    plate.path('i-cheb', curve((n) => toNumber(chebyshevBound(n, qq, ee))), { stroke: ink, 'stroke-width': k.stroke('regular') }, 'data', false, false);
    const ex = GRID_N.map((n) => fractionToNumber(tail(n)));
    plate.path('i-exact', GRID_N.map((n, j) => [LX(n), LY(ex[j])] as [number, number]), { stroke: state, 'stroke-width': k.stroke('state'), 'stroke-linejoin': 'round' }, 'data', false, false);
    GRID_N.forEach((n, j) => {
      const below = ex[j] < PMIN;
      plate.circle(`i-pt-${n}`, LX(n), LY(ex[j]), 0.17 * fs, { fill: below ? k.color('plate') : state, stroke: state, 'stroke-width': k.stroke('thin') }, 'marks', false);
    });
    const devN = fractionToNumber(c.dev);
    plate.line('i-now', LX(N), yi0, LX(N), yi1, muted, k.stroke('thin'), {}, 'marks', false);
    plate.circle('i-now-pt', LX(N), LY(devN), 0.3 * fs, { fill: k.color('plate'), stroke: state, 'stroke-width': k.stroke('state') }, 'marks', false);
    // legend of the lower view
    const lgY = yi0 - 1.0 * fs;
    const lgS = fs * 0.9;
    const title: Seg[] = [['m', PR.unicode], ['s', MI.N], ['m', `[ |${MI.H}`], ['s', MI.N], ['m', ` − ${MI.q}| ≥ ${MI.e} ]`]];
    const chT: Seg[] = [['m', `${MI.q}(1 − ${MI.q})/(${MI.N}${MI.e}²)`]];
    const coT: Seg[] = [['m', `1/(4${MI.N}${MI.e}²)`]];
    const exW = 0.6 * fs + plate.measure(T('exakt', 'exact'), lgS);
    const items = exW + 2.0 * fs + richWidth(plate, chT, lgS) + 2.0 * fs + richWidth(plate, coT, lgS) + 2 * 1.2 * fs;
    const showTitle = richWidth(plate, title, lgS) + 1.5 * fs + items < xi1 - xi0;
    let lx = xi0 + 0.3 * fs;
    if (showTitle) lx += rt('i-lg-title', lx, lgY, title, { anchor: 'start', size: lgS }) + 1.5 * fs;
    lx = Math.max(lx, xi1 - items);
    plate.circle('i-lg-ex', lx, lgY - 0.3 * fs, 0.2 * fs, { fill: state, stroke: state }, 'labels', false);
    plate.text('i-lg-ex-t', lx + 0.6 * fs, lgY, T('exakt', 'exact'), { anchor: 'start', size: lgS });
    lx += exW + 1.2 * fs;
    plate.line('i-lg-ch', lx, lgY - 0.3 * fs, lx + 1.6 * fs, lgY - 0.3 * fs, ink, k.stroke('regular'), {}, 'labels', false);
    lx += 2.0 * fs + rt('i-lg-ch-t', lx + 2.0 * fs, lgY, chT, { anchor: 'start', size: lgS }) + 1.2 * fs;
    plate.line('i-lg-co', lx, lgY - 0.3 * fs, lx + 1.6 * fs, lgY - 0.3 * fs, ink, k.stroke('regular'), { 'stroke-dasharray': k.dash('effect').join(' ') }, 'labels', false);
    rt('i-lg-co-t', lx + 2.0 * fs, lgY, coT, { anchor: 'start', size: lgS });
    // values below the floor of the axis are drawn as hollow dots on it: say so
    const firstBelow = GRID_N.findIndex((_, j) => ex[j] < PMIN);
    if (firstBelow >= 0) {
      const fx = LX(GRID_N[firstBelow]);
      const lab = T('hohl: kleiner als 10⁻⁶', 'hollow: below 10⁻⁶');
      const w = plate.measure(lab, fs * 0.82);
      plate.text('i-floor', Math.min(fx + 0.6 * fs, xi1 - w), yi1 - 0.7 * fs, lab, { anchor: 'start', size: fs * 0.82, fill: muted });
    }

    // hover
    if (hover) {
      const { x, y } = hover;
      if (x >= xr0 && x <= xr1 && y >= yTop - 0.5 * fs && y <= yBot + 0.5 * fs) {
        const kk = Math.max(0, Math.min(N, Math.round(((yBot - y) / (yBot - yTop)) * N)));
        // the exact fraction for N <= 200; beyond, its value from binomialWeightValues (one division of the exact numbers)
        const tiny = vals[kk] === 0 && qk !== 0 && qk !== QD;   // positive, below the double range
        const sw = N <= 200 ? showExact(exactWeight(N)[kk]) : `${tiny ? '< 10⁻³⁰⁰' : `≈ ${sci(vals[kk])}`} ${T('(exakt berechnet, gerundet)', '(computed exactly, rounded)')}`;
        plate.tip(x, Y(kk / N), [`${PR.unicode}[${MI.H} = ${kk}/${N}] ${sw.startsWith('≈') || sw.startsWith('<') ? '' : '= '}${sw}`, isDeviation(kk, N, qq, ee) ? T(`Abweichung ≥ ${MI.e} (schraffiert)`, `deviation ≥ ${MI.e} (hatched)`) : T('im Band', 'inside the band')]);
      } else if (x >= xa && x <= xb && y >= yTop && y <= yBot) {
        const n = Math.max(1, Math.min(N, Math.round(Math.exp(((x - xa) / (xb - xa)) * Math.log(Nax)))));
        plate.line('h-n', X(n), yTop, X(n), yBot, muted, k.stroke('thin'), {}, 'hover', false);
        plate.tip(X(n), y, [`${MI.n} = ${fmtInt(n)}: ${T('Reihe 1', 'series 1')} ${MI.H} = ${S[0][n - 1]}/${n}`, T(`außerhalb: ${outsideCount(n)} von ${M}`, `outside: ${outsideCount(n)} of ${M}`)]);
      } else if (x >= xi0 && x <= xi1 && y >= yi0 - 0.5 * fs && y <= yi1) {
        const n = Math.max(1, Math.min(NMAX, Math.round(10 ** ((3 * (x - xi0)) / (xi1 - xi0)))));
        plate.line('h-n', LX(n), yi0, LX(n), yi1, muted, k.stroke('thin'), {}, 'hover', false);
        plate.tip(LX(n), y, [`${MI.N} = ${fmtInt(n)}: ${T('exakt', 'exact')} ${showExact(tail(n)).replace(/^([^≈])/, '= $1')}`, `${T('Schranke', 'bound')} ${fq(chebyshevBound(n, qq, ee))}, 1/(4${MI.N}${MI.e}²) = ${fq(coarseBound(n, ee))}`]);
      }
    }
    plate.end();

    const eq = (t: string) => (t.startsWith('≈') || t.startsWith('<') ? t : `= ${t}`);
    const withDec = (f: Fraction) => (f.den === 1n ? fq(f) : `${fq(f)} ≈ ${sci(toNumber(f))}`);
    outP.set(eq(showExact(c.dev)));
    outC.set(`= ${withDec(c.cheb)}${toNumber(c.cheb) > 1 ? T(' (größer als 1: keine Aussage)', ' (above 1: no information)') : ''}`);
    outK.set(`= ${withDec(c.coarse)}`);
    outS.set(T(`${c.outside} von ${M} (Anteil ${fdec(ctx, c.outside / M, 3)})`, `${c.outside} of ${M} (share ${fdec(ctx, c.outside / M, 3)})`));
    caption.innerHTML = T(
      'Grau: das Band <math><mo>|</mo><mi>H</mi><mo>−</mo><mi>q</mi><mo>|</mo><mo>&lt;</mo><mi>ε</mi></math>. Links eine Stichprobe: Messreihen eines Rechenprogramms mit festen Startwerten. Rechts das exakte Gewicht von <math><msub><mi>H</mi><mi>N</mi></msub></math> nach dem Satz über die Binomialverteilung; schraffiert die Werte mit Abweichung <math><mo>≥</mo><mi>ε</mi></math>. Unten deren exakte Wahrscheinlichkeit und die beiden Schranken: Die Schranken fallen wie <math><mn>1</mn><mo>/</mo><mi>N</mi></math>; für die eingestellten Werte liegt die exakte Wahrscheinlichkeit, wie das Bild zeigt, meist weit darunter. Die Schranke kann also grob sein, und sie sagt nichts über eine einzelne Messreihe.',
      'Grey: the band <math><mo>|</mo><mi>H</mi><mo>−</mo><mi>q</mi><mo>|</mo><mo>&lt;</mo><mi>ε</mi></math>. Left a sample: series of a computer program with fixed seeds. Right the exact weight of <math><msub><mi>H</mi><mi>N</mi></msub></math> from the binomial formula; hatched the values that deviate by <math><mo>≥</mo><mi>ε</mi></math>. Below their exact probability and the two bounds: the bounds fall like <math><mn>1</mn><mo>/</mo><mi>N</mi></math>; for the values set, the exact probability lies, as the picture shows, mostly far below them. So the bound can be coarse, and it says nothing about a single series.');
  };

  return {
    render(_frame, time) {
      const clock = time !== lastTime && lastTime >= 0;
      now = time; lastTime = time;
      slider.set(sNow());
      paint(!ctx.deterministic && !ctx.reducedMotion && !clock);
    },
    destroy() { plate.svg.remove(); },
    info: () => {
      const c = current();
      return { N: c.n, q: fq(q()), eps: fq(eps()), seed: seed0(), deviation: fractionToNumber(c.dev), chebyshev: toNumber(c.cheb), outside: c.outside, series: M };
    },
  };
}
