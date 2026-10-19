// c01.demo.haeufigkeit: one seeded series of runs with a finite probability weight
// (figure c01.fig.haeufigkeit). Left: relative frequencies h_N(x) of the first N outcomes
// (hatched bars) against the weights p(x) (heavy marks). Right: the mean of the
// measurement f over the first n outcomes, n = 1..N, against E[f]. 2D, SVG on the plate.
//
// Every number shown is an input (weight, measurement, seed, N) or is computed by
// web/src/kernels/prob.ts: exact expectation and variance of f in the weight p and in the
// weight h_N of the sample (c01.eq.haeufigkeit, c01.eq.stichprobenmittel). The series is a
// deterministic function of the seed; N only decides how much of it is shown. The demo
// makes no statement about how fast h_N approaches p: what can be proved is theorem
// c01.thm.haeufigkeit of the chapter.
import type { DemoContext, DemoInstance, DemoMeta } from '../demo/types';
import { counts, expectation, runningMeans, sample, toNumber, variance, weights, type Fraction } from '../kernels/prob';

export const meta: DemoMeta = { animated: true, aspect: 1.9, surface: 'plate' };

const NS = 'http://www.w3.org/2000/svg';
const NMAX = 2000;          // longest series shown: a drawing choice
const PERIOD = 16;          // seconds for one run of the slider from N = 1 to NMAX: a drawing choice

interface Preset { key: string; de: string; en: string; a: number[]; f: number[]; labels: string[] }
// weights as integer numerators a over their sum; measurement f; outcome labels
const PRESETS: Preset[] = [
  { key: 'loaded', de: 'gezinkter Würfel', en: 'loaded die', a: [1, 2, 2, 2, 2, 3], f: [1, 2, 3, 4, 5, 6], labels: ['1', '2', '3', '4', '5', '6'] },
  { key: 'fair', de: 'fairer Würfel', en: 'fair die', a: [1, 1, 1, 1, 1, 1], f: [1, 2, 3, 4, 5, 6], labels: ['1', '2', '3', '4', '5', '6'] },
  { key: 'coin', de: 'faire Münze', en: 'fair coin', a: [1, 1], f: [0, 1], labels: ['0', '1'] },
  { key: 'biased', de: 'Münze 1 : 3', en: 'coin 1 : 3', a: [1, 3], f: [0, 1], labels: ['0', '1'] },
  { key: 'point', de: 'Punktgewicht auf 3', en: 'point weight on 3', a: [0, 0, 1, 0, 0, 0], f: [1, 2, 3, 4, 5, 6], labels: ['1', '2', '3', '4', '5', '6'] },
];

export function mount(stage: HTMLElement, ctx: DemoContext): DemoInstance {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.position = 'absolute';
  svg.style.inset = '0';
  svg.style.width = '100%';
  svg.style.height = '100%';
  stage.append(svg);
  const el = (name: string, attrs: Record<string, string | number>, parent: Element = svg) => {
    const e = document.createElementNS(NS, name);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
    parent.append(e);
    return e;
  };
  const hatchId = `tpcd-hatch-${ctx.id.replace(/\W/g, '-')}-${Math.floor(ctx.random() * 1e9)}`;

  // ── state ─────────────────────────────────────────────────────
  let preset = Math.max(0, PRESETS.findIndex((p) => p.key === ctx.params.preset));
  let run = 0;                                    // "new series" counts up; the seed is ctx.seed + run
  let now = 0;
  const clampN = (n: number) => Math.max(1, Math.min(NMAX, Math.round(n)));
  // slider position s in 0..100 <-> N = NMAX^(s/100): equal steps of the slider multiply N by the same factor
  const toN = (s: number) => clampN(Math.pow(NMAX, s / 100));
  const toS = (n: number) => (100 * Math.log(clampN(n))) / Math.log(NMAX);
  const wrap = (v: number) => ((v % 100) + 100) % 100;
  // s(time) = (100 time / PERIOD + offset) mod 100: the series grows while the clock runs and passes
  // through the chosen N at the moment it is chosen
  let offset = toS(Number(ctx.params.n ?? '120'));
  let series: number[] = [];
  const draw = () => sample(PRESETS[preset].a, (ctx.seed + run) >>> 0, NMAX);
  series = draw();

  // ── controls ──────────────────────────────────────────────────
  const fmtInt = (n: number) => n.toLocaleString(ctx.lang);
  const fmtDec = (v: number) => v.toLocaleString(ctx.lang, { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  const fmtFrac = (q: Fraction) => (q.den === 1n ? `${q.num}` : `${q.num}/${q.den}`);
  const both = (q: Fraction, exactOnly = false) => (q.den === 1n || exactOnly ? fmtFrac(q) : `${fmtFrac(q)} ≈ ${fmtDec(toNumber(q))}`);
  const slider = ctx.ui.slider({
    label: ctx.text('Anzahl N der gezeigten Durchläufe', 'number N of runs shown'),
    labelHtml: '<math><mi>N</mi></math>',
    min: 0, max: 100, step: 0.5, value: offset, primary: true,
    format: (s) => fmtInt(toN(s)),
    onInput: (s) => { offset = s - (100 * now) / PERIOD; },
  });
  const presetButtons = PRESETS.map((p, i) => {
    const b = ctx.ui.button(ctx.text(p.de, p.en), () => { preset = i; series = draw(); mark(); ctx.invalidate(); say(); });
    return b;
  });
  // the chosen weight is marked by aria-pressed and by a filled dot in front of its name (not by colour alone)
  const mark = () => presetButtons.forEach((b, i) => {
    b.setAttribute('aria-pressed', i === preset ? 'true' : 'false');
    b.textContent = `${i === preset ? '● ' : '○ '}${ctx.text(PRESETS[i].de, PRESETS[i].en)}`;
  });
  mark();
  ctx.ui.button(ctx.text('neue Messreihe', 'new series'), () => { run += 1; series = draw(); ctx.invalidate(); say(); });
  const E = ctx.symbol('sym.expectation'), V = ctx.symbol('sym.variance');
  const outE = ctx.ui.readout(ctx.text('Erwartungswert von f im Gewicht p', 'expectation value of f in the weight p'), `${E.mathml}<math><mo>[</mo><mi>f</mi><mo>]</mo></math>`);
  const outV = ctx.ui.readout(ctx.text('Varianz von f im Gewicht p', 'variance of f in the weight p'), `${V.mathml}<math><mo>[</mo><mi>f</mi><mo>]</mo></math>`);
  const outM = ctx.ui.readout(ctx.text('Mittelwert von f über die ersten N Durchläufe', 'mean of f over the first N runs'));
  const outS = ctx.ui.readout(ctx.text('Varianz von f in den relativen Häufigkeiten der ersten N Durchläufe', 'variance of f in the relative frequencies of the first N runs'));
  const outSeed = ctx.ui.readout(ctx.text('Startwert der Messreihe', 'seed of the series'));

  const current = () => {
    const p = PRESETS[preset];
    const n = toN(wrap((100 * now) / PERIOD + offset));
    const c = counts(series, p.a.length, n);
    return { p, n, c };
  };
  const say = () => {
    const { p, n, c } = current();
    ctx.announce(ctx.text(
      `${p.de}, N = ${n}: Mittelwert ${fmtDec(toNumber(expectation(c, p.f)))}, Erwartungswert ${fmtDec(toNumber(expectation(p.a, p.f)))}.`,
      `${p.en}, N = ${n}: mean ${fmtDec(toNumber(expectation(c, p.f)))}, expectation value ${fmtDec(toNumber(expectation(p.a, p.f)))}.`));
  };

  // ── drawing ───────────────────────────────────────────────────
  const paint = () => {
    const k = ctx.tokens;
    const box = stage.getBoundingClientRect();
    const W = Math.max(160, box.width), H = Math.max(120, box.height);
    const font = k.font('label');
    const fs = Math.min(font.sizePx, W / 34);
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.replaceChildren();
    const ink = k.color('plate-ink'), muted = k.color('plate-muted'), rule = k.color('plate-rule'), state = k.color('state'), effect = k.color('effect');
    const defs = el('defs', {});
    const pat = el('pattern', { id: hatchId, width: 5, height: 5, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
    el('line', { x1: 0, y1: 0, x2: 0, y2: 5, stroke: k.color('bath-edge'), 'stroke-width': k.stroke('thin') }, pat);
    el('rect', { x: 0, y: 0, width: W, height: H, fill: k.color('plate') });
    const text = (x: number, y: number, s: string, anchor = 'middle', fill = ink) => {
      const t = el('text', { x, y, 'text-anchor': anchor, fill, 'font-size': fs });
      (t as SVGTextElement).style.fontFamily = font.family;
      t.textContent = s;
      return t;
    };
    const line = (x1: number, y1: number, x2: number, y2: number, stroke: string, w: number, dash?: number[]) => {
      const l = el('line', { x1, y1, x2, y2, stroke, 'stroke-width': w });
      if (dash) l.setAttribute('stroke-dasharray', dash.join(' '));
      return l;
    };

    const { p, n, c } = current();
    const pw = weights(p.a), hw = weights(c);          // p(x) and h_N(x) as exact fractions
    const m = p.a.length;
    const mT = 1.9 * fs, mB = 2.6 * fs;
    const y0 = H - mB, y1 = mT;

    // left panel: bars
    const xa = 3.0 * fs, xb = W * 0.56;
    const hMax = Math.max(...pw.map(toNumber), ...hw.map(toNumber));
    const top = Math.min(1, hMax * 1.12);
    const Y = (v: number) => y0 - (v / top) * (y0 - y1);
    line(xa, y0, xb, y0, ink, k.stroke('thin'));
    line(xa, y0, xa, y1 - 0.3 * fs, ink, k.stroke('thin'));
    // axis marks at the weights that occur, and at 0
    const marks = new Map<string, Fraction>();
    for (const q of pw) if (q.num > 0n) marks.set(fmtFrac(q), q);
    text(xa - 0.4 * fs, y0 + 0.35 * fs, '0', 'end', muted);
    for (const [label, q] of marks) {
      const v = toNumber(q);
      if (v > top) continue;
      line(xa, Y(v), xb, Y(v), rule, k.stroke('hair'));
      text(xa - 0.4 * fs, Y(v) + 0.35 * fs, label, 'end', muted);
    }
    const slot = (xb - xa) / m;
    for (let i = 0; i < m; i++) {
      const cx = xa + (i + 0.5) * slot;
      const bw = Math.min(slot * 0.5, 3.2 * fs);
      const h = toNumber(hw[i]);
      el('rect', { x: cx - bw / 2, y: Y(h), width: bw, height: Math.max(0, y0 - Y(h)), fill: `url(#${hatchId})`, stroke: ink, 'stroke-width': k.stroke('hair') });
      const pv = toNumber(pw[i]);
      line(cx - bw * 0.8, Y(pv), cx + bw * 0.8, Y(pv), state, k.stroke('state'));
      text(cx, y0 + 1.3 * fs, p.labels[i]);
    }
    // legend
    el('rect', { x: xa + 0.6 * fs, y: 0.35 * fs, width: 1.3 * fs, height: 0.9 * fs, fill: `url(#${hatchId})`, stroke: ink, 'stroke-width': k.stroke('hair') });
    text(xa + 2.2 * fs, 1.15 * fs, `${ctx.text('rel. Häufigkeit', 'rel. frequency')}, N = ${fmtInt(n)}`, 'start');
    line(xa + 13.6 * fs, 0.8 * fs, xa + 15.2 * fs, 0.8 * fs, state, k.stroke('state'));
    text(xa + 15.6 * fs, 1.15 * fs, 'p(x)', 'start');
    text((xa + xb) / 2, H - 0.35 * fs, ctx.text('Ergebnis x', 'outcome x'), 'middle', muted);

    // right panel: running mean of f against E[f]
    const xc = xb + 4.2 * fs, xd = W - 0.8 * fs;
    const fMin = Math.min(...p.f), fMax = Math.max(...p.f);
    const YF = (v: number) => (fMax === fMin ? (y0 + y1) / 2 : y0 - ((v - fMin) / (fMax - fMin)) * (y0 - y1));
    const XN = (i: number) => (n === 1 ? xc : xc + ((i - 1) / (n - 1)) * (xd - xc));
    line(xc, y0, xd, y0, ink, k.stroke('thin'));
    line(xc, y0, xc, y1 - 0.3 * fs, ink, k.stroke('thin'));
    text(xc - 0.4 * fs, YF(fMin) + 0.35 * fs, String(fMin), 'end', muted);
    if (fMax !== fMin) text(xc - 0.4 * fs, YF(fMax) + 0.35 * fs, String(fMax), 'end', muted);
    text(xc, y0 + 1.3 * fs, '1', 'middle', muted);
    if (n > 1) text(xd, y0 + 1.3 * fs, fmtInt(n), 'end', muted);
    const ex = expectation(p.a, p.f);
    const eY = YF(toNumber(ex));
    line(xc, eY, xd, eY, state, k.stroke('state'));
    const means = runningMeans(series, p.f, n);
    let path = '';
    means.forEach((v, j) => { path += `${j === 0 ? 'M' : ' L'} ${XN(j + 1).toFixed(2)} ${YF(v).toFixed(2)}`; });
    if (n === 1) el('circle', { cx: xc, cy: YF(means[0]), r: 0.25 * fs, fill: effect });
    else el('path', { d: path, fill: 'none', stroke: effect, 'stroke-width': k.stroke('effect'), 'stroke-dasharray': k.dash('effect').join(' '), 'stroke-linejoin': 'round' });
    text(xd, eY - 0.45 * fs, `${E.unicode}[f] = ${fmtFrac(ex)}`, 'end');
    text((xc + xd) / 2, 1.15 * fs, ctx.text('Mittelwert von f (gestrichelt)', 'mean of f (dashed)'), 'middle');
    text((xc + xd) / 2, H - 0.35 * fs, ctx.text('Durchläufe n', 'runs n'), 'middle', muted);

    outE.set(`= ${both(ex)}`);
    outV.set(`= ${both(variance(p.a, p.f))}`);
    outM.set(`${fmtDec(toNumber(expectation(c, p.f)))}  (N = ${fmtInt(n)})`);
    outS.set(fmtDec(toNumber(variance(c, p.f))));
    outSeed.set(String((ctx.seed + run) >>> 0));
  };

  return {
    render(_frame, time) {
      now = time;
      slider.set(wrap((100 * time) / PERIOD + offset));
      paint();
    },
    resize: () => paint(),
    tokensChanged: () => paint(),
    destroy() { svg.remove(); },
    info: () => {
      const { p, n, c } = current();
      return { preset: p.key, seed: (ctx.seed + run) >>> 0, N: n, counts: c.join(','), mean: toNumber(expectation(c, p.f)), expectation: toNumber(expectation(p.a, p.f)) };
    },
  };
}
