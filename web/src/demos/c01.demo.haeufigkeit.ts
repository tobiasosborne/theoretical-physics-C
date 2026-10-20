// c01.demo.haeufigkeit: one seeded series of runs with a finite probability weight
// (figure c01.fig.haeufigkeit). Left: relative frequencies h_N(x) = N(x)/N of the first N
// outcomes (hatched bars) against the weights p(x) (heavy marks); while the clock runs and N
// is small, the newest outcome falls into its bar as a die face (or coin). Right: the mean of
// the measurement f over the first n outcomes, n = 1..N, against E[f]. 2D, SVG on the plate.
//
// Every number shown is an input (weight, measurement, seed, N) or is computed by
// web/src/kernels/prob.ts: exact expectation and variance of f in the weight p and in the
// weight h_N of the sample (c01.eq.haeufigkeit, c01.eq.stichprobenmittel), the largest
// deviation max_x |h_N(x) - p(x)| (maxDeviation). The series is a deterministic function of
// the seed; N only decides how much of it is shown. The demo makes no statement about how
// fast h_N approaches p: what can be proved is theorem c01.thm.haeufigkeit of the chapter
// (demo c01.demo.konzentration).
// Parameters: preset = loaded | fair | coin | biased | point, n (N), seed.
import type { DemoContext, DemoInstance, DemoMeta } from '../demo/types';
import { counts, expectation, maxDeviation, runningMeans, sample, toNumber, variance, weights, type Fraction } from '../kernels/prob';
import { Plate, choice, fboth, fdec, fq, it, note, pointer } from './c01/kit';
import { rich, type Seg } from './c01/segments';

export const meta: DemoMeta = { animated: true, aspect: 1.9, surface: 'plate' };

const NMAX = 2000;          // longest series shown: a drawing choice
const PERIOD = 16;          // seconds for one run of the slider from N = 1 to NMAX: a drawing choice
const TOKEN_MAX = 40;       // the falling die face is drawn while N <= TOKEN_MAX: a drawing choice
const FALL = 0.7;           // share of the time between two outcomes the face takes to fall: a drawing choice

interface Preset { key: string; de: string; en: string; a: number[]; f: number[]; labels: string[]; die: boolean }
// weights as integer numerators a over their sum; measurement f; outcome labels
const PRESETS: Preset[] = [
  { key: 'loaded', de: 'gezinkter Würfel', en: 'loaded die', a: [1, 2, 2, 2, 2, 3], f: [1, 2, 3, 4, 5, 6], labels: ['1', '2', '3', '4', '5', '6'], die: true },
  { key: 'fair', de: 'fairer Würfel', en: 'fair die', a: [1, 1, 1, 1, 1, 1], f: [1, 2, 3, 4, 5, 6], labels: ['1', '2', '3', '4', '5', '6'], die: true },
  { key: 'coin', de: 'faire Münze', en: 'fair coin', a: [1, 1], f: [0, 1], labels: ['0', '1'], die: false },
  { key: 'biased', de: 'Münze 1 : 3', en: 'coin 1 : 3', a: [1, 3], f: [0, 1], labels: ['0', '1'], die: false },
  { key: 'point', de: 'Punktgewicht auf 3', en: 'point weight on 3', a: [0, 0, 1, 0, 0, 0], f: [1, 2, 3, 4, 5, 6], labels: ['1', '2', '3', '4', '5', '6'], die: true },
];
// pip positions of a die face on a 3 x 3 grid (-1, 0, 1)
const PIPS: Record<number, Array<[number, number]>> = {
  1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
};

export function mount(stage: HTMLElement, ctx: DemoContext): DemoInstance {
  const plate = new Plate(stage, ctx);
  const T = ctx.text;
  const E = ctx.symbol('sym.expectation'), V = ctx.symbol('sym.variance'), P = ctx.symbol('sym.probability-weight');

  // ── state ─────────────────────────────────────────────────────
  let preset = Math.max(0, PRESETS.findIndex((p) => p.key === ctx.params.preset));
  let run = 0;                                    // "new series" counts up; the seed is ctx.seed + run
  let now = 0, lastTime = -1;
  let hover: { x: number; y: number } | null = null;
  const clampN = (n: number) => Math.max(1, Math.min(NMAX, Math.round(n)));
  // slider position s in 0..100 <-> N = NMAX^(s/100): equal steps of the slider multiply N by the same factor
  const toN = (s: number) => clampN(Math.pow(NMAX, s / 100));
  const toS = (n: number) => (100 * Math.log(clampN(n))) / Math.log(NMAX);
  // (the end of the slider, s = 100, stays N = NMAX; past it the clock starts again at N = 1)
  const wrap = (v: number) => { const r = ((v % 100) + 100) % 100; return r === 0 && v > 0 ? 100 : r; };
  // s(time) = (100 time / PERIOD + offset) mod 100: the series grows while the clock runs and passes
  // through the chosen N at the moment it is chosen
  let offset = toS(Number(ctx.params.n ?? '120'));
  const sNow = () => wrap((100 * now) / PERIOD + offset);
  const draw = () => sample(PRESETS[preset].a, (ctx.seed + run) >>> 0, NMAX);
  let series = draw();

  // ── controls ──────────────────────────────────────────────────
  const fmtInt = (n: number) => n.toLocaleString(ctx.lang);
  const slider = ctx.ui.slider({
    label: ctx.text('Anzahl N der gezeigten Durchläufe', 'number N of runs shown'),
    labelHtml: '<math><mi>N</mi></math>',
    min: 0, max: 100, step: 0.5, value: offset, primary: true,
    format: (s) => fmtInt(toN(s)),
    onInput: (s) => { offset = s - (100 * now) / PERIOD; },
  });
  choice(ctx, PRESETS.map((p) => T(p.de, p.en)), preset, (i) => { preset = i; series = draw(); say(); });
  ctx.ui.button(T('neue Messreihe', 'new series'), () => { run += 1; series = draw(); say(); });
  const ef = `${E.mathml}<math><mo>[</mo><mi>f</mi><mo>]</mo></math>`;
  const outE = ctx.ui.readout(T('Erwartungswert von f im Gewicht p', 'expectation value of f in the weight p'), ef);
  const outV = ctx.ui.readout(T('Varianz von f im Gewicht p', 'variance of f in the weight p'), `${V.mathml}<math><mo>[</mo><mi>f</mi><mo>]</mo></math>`);
  const outM = ctx.ui.readout(T('Mittelwert von f über die ersten N Durchläufe', 'mean of f over the first N runs'));
  const outS = ctx.ui.readout(T('Varianz von f in den relativen Häufigkeiten der ersten N Durchläufe', 'variance of f in the relative frequencies of the first N runs'));
  const outD = ctx.ui.readout(T('größte Abweichung der relativen Häufigkeit vom Gewicht', 'largest deviation of the relative frequency from the weight'),
    '<math><munder><mo movablelimits="false">max</mo><mi>x</mi></munder><mo>|</mo><msub><mi>h</mi><mi>N</mi></msub><mo>(</mo><mi>x</mi><mo>)</mo><mo>−</mo><mi>p</mi><mo>(</mo><mi>x</mi><mo>)</mo><mo>|</mo></math>');
  const outSeed = ctx.ui.readout(T('Startwert der Messreihe', 'seed of the series'));
  const caption = note(ctx);

  const current = () => {
    const p = PRESETS[preset];
    const n = toN(sNow());
    const c = counts(series, p.a.length, n);
    return { p, n, c };
  };
  const say = () => {
    const { p, n, c } = current();
    ctx.announce(T(
      `${p.de}, N = ${n}: Mittelwert ${fdec(ctx, toNumber(expectation(c, p.f)))}, Erwartungswert ${fdec(ctx, toNumber(expectation(p.a, p.f)))}.`,
      `${p.en}, N = ${n}: mean ${fdec(ctx, toNumber(expectation(c, p.f)))}, expectation value ${fdec(ctx, toNumber(expectation(p.a, p.f)))}.`));
  };
  pointer(plate.svg, {
    hover: (x, y) => { hover = { x, y }; ctx.invalidate(); },
    leave: () => { if (hover) { hover = null; ctx.invalidate(); } },
  });

  // ── drawing ───────────────────────────────────────────────────
  const paint = (ease: boolean) => {
    const fs = plate.begin(ease);
    const k = ctx.tokens;
    const { W, H } = plate;
    const ink = k.color('plate-ink'), muted = k.color('plate-muted'), rule = k.color('plate-rule'), state = k.color('state'), effect = k.color('effect');
    const { p, n, c } = current();
    const pw = weights(p.a), hw = weights(c);          // p(x) and h_N(x) as exact fractions
    const m = p.a.length;
    const y0 = H - 2.6 * fs, y1 = 2.6 * fs;

    // left panel: bars
    const xa = 3.0 * fs, xb = W * 0.56;
    const hMax = Math.max(...pw.map(toNumber), ...hw.map(toNumber));
    const top = Math.min(1, hMax * 1.12);
    const Y = (v: number) => y0 - (v / top) * (y0 - y1);
    plate.line('ax-x', xa, y0, xb, y0, ink, k.stroke('thin'));
    plate.line('ax-y', xa, y0, xa, y1 - 0.3 * fs, ink, k.stroke('thin'));
    // axis marks at the weights that occur, and at 0
    const marks = new Map<string, Fraction>();
    for (const q of pw) if (q.num > 0n) marks.set(fq(q), q);
    plate.text('t0', xa - 0.4 * fs, y0, '0', { anchor: 'end', fill: muted, baseline: 'middle' });
    for (const [label, q] of marks) {
      const v = toNumber(q);
      if (v > top) continue;
      plate.line(`grid-${label}`, xa, Y(v), xb, Y(v), rule, k.stroke('hair'));
      plate.fraction(`tick-${label}`, xa - 0.4 * fs, Y(v), q, { anchor: 'end', fill: muted, size: fs * 0.95 });
    }
    const slot = (xb - xa) / m;
    const bw = Math.min(slot * 0.5, 3.2 * fs);
    for (let i = 0; i < 6; i++) {
      if (i >= m) continue;
      const cx = xa + (i + 0.5) * slot;
      const h = toNumber(hw[i]);
      const on = hover !== null && Math.abs(hover.x - cx) < slot / 2 && hover.x < xb;
      plate.rect(`bar-${i}`, cx - bw / 2, Y(h), bw, y0 - Y(h), { fill: plate.hatchFill, stroke: ink, 'stroke-width': k.stroke(on ? 'regular' : 'hair') });
      const pv = toNumber(pw[i]);
      plate.line(`p-${i}`, cx - bw * 0.8, Y(pv), cx + bw * 0.8, Y(pv), state, k.stroke('state'), {}, 'marks');
      plate.text(`lab-${i}`, cx, y0 + 1.3 * fs, p.labels[i]);
    }
    // legend
    plate.rect('lg-h', xa + 0.6 * fs, 0.45 * fs, 1.3 * fs, 0.9 * fs, { fill: plate.hatchFill, stroke: ink, 'stroke-width': k.stroke('hair') }, 'labels', false);
    // legend: h_N(x) = N(x)/N (c01.eq.haeufigkeit) and p(x); N at the right, all by measured widths
    const hN: Seg[] = [['m', it('h')], ['s', it('N')], ['m', it('(x)')]];
    const hLong: Seg[] = [...hN, ['m', ` = ${it('N(x)/N')}`]];
    const nLab: Seg[] = [['m', `${it('N')} = `], ['t', fmtInt(n)]];
    const pLab: Seg[] = [['m', it('p(x)')]];
    const room = xb - xa - 2.2 * fs - plate.measure(`${it('N')} = ${fmtInt(n)}`, fs, '600', true) - 4.4 * fs - plate.measure(it('p(x)'), fs, undefined, true);
    const hW = rich(plate, ctx, 'lg-h-t', xa + 2.2 * fs, 1.25 * fs, plate.measure(`${it('h(x) = N(x)/N')}`, fs, undefined, true) < room ? hLong : hN, { anchor: 'start' });
    rich(plate, ctx, 'lg-n', xb, 1.25 * fs, nLab, { anchor: 'end', weight: '600' });
    const lgx = xa + 2.2 * fs + hW + 1.4 * fs;
    plate.line('lg-p', lgx, 0.9 * fs, lgx + 1.6 * fs, 0.9 * fs, state, k.stroke('state'), {}, 'labels', false);
    rich(plate, ctx, 'lg-p-t', lgx + 2.0 * fs, 1.25 * fs, pLab, { anchor: 'start' });
    rich(plate, ctx, 'x-name', (xa + xb) / 2, H - 0.35 * fs, [['t', T('Ergebnis ', 'outcome ')], ['m', it('x')]], { fill: muted });

    // the newest outcome falls into its bar (a function of time; drawn while N is small)
    const nu = Math.pow(NMAX, sNow() / 100);
    const phase = nu - (n - 0.5);
    if (n <= TOKEN_MAX && phase >= 0 && phase < FALL) {
      const i = series[n - 1];
      const u = phase / FALL, e = 1 - (1 - u) * (1 - u);
      const cx = xa + (i + 0.5) * slot;
      const side = Math.min(1.7 * fs, bw * 0.9);
      const ty = (y1 - 0.4 * fs) + (Y(toNumber(hw[i])) - side / 2 - 0.15 * fs - (y1 - 0.4 * fs)) * e;
      if (p.die) {
        plate.rect('tok', cx - side / 2, ty - side / 2, side, side, { fill: k.color('plate'), stroke: ink, 'stroke-width': k.stroke('regular'), rx: side * 0.18 }, 'hover', false);
        const pips = PIPS[Number(p.labels[i])] ?? [];
        for (let j = 0; j < 6; j++) {
          const pp = pips[j];
          if (pp) plate.circle(`tok-pip-${j}`, cx + pp[0] * side * 0.27, ty + pp[1] * side * 0.27, side * 0.085, { fill: ink }, 'hover', false);
        }
      } else {
        plate.circle('tok', cx, ty, side / 2, { fill: k.color('plate'), stroke: ink, 'stroke-width': k.stroke('regular') }, 'hover', false);
        plate.text('tok-t', cx, ty, p.labels[i], { size: fs * 0.95, baseline: 'middle', layer: 'hover' }).classList.remove('c01-e');
      }
    }

    // right panel: running mean of f against E[f]
    const xc = xb + 4.2 * fs, xd = W - 0.8 * fs;
    const fMin = Math.min(...p.f), fMax = Math.max(...p.f);
    const YF = (v: number) => (fMax === fMin ? (y0 + y1) / 2 : y0 - ((v - fMin) / (fMax - fMin)) * (y0 - y1));
    const XN = (j: number) => (n === 1 ? xc : xc + ((j - 1) / (n - 1)) * (xd - xc));
    plate.line('r-ax-x', xc, y0, xd, y0, ink, k.stroke('thin'));
    plate.line('r-ax-y', xc, y0, xc, y1 - 0.3 * fs, ink, k.stroke('thin'));
    plate.text('r-min', xc - 0.4 * fs, YF(fMin), String(fMin), { anchor: 'end', fill: muted, baseline: 'middle' });
    if (fMax !== fMin) plate.text('r-max', xc - 0.4 * fs, YF(fMax), String(fMax), { anchor: 'end', fill: muted, baseline: 'middle' });
    plate.text('r-1', xc, y0 + 1.3 * fs, '1', { fill: muted });
    if (n > 1) plate.text('r-n', xd, y0 + 1.3 * fs, fmtInt(n), { anchor: 'end', fill: muted });
    const ex = expectation(p.a, p.f);
    const eY = YF(toNumber(ex));
    plate.line('r-e', xc, eY, xd, eY, state, k.stroke('state'), {}, 'marks');
    const means = runningMeans(series, p.f, n);
    // at most about two points per pixel of the panel
    const stride = Math.max(1, Math.floor(n / ((xd - xc) * 2)));
    const pts: Array<[number, number]> = [];
    for (let j = 0; j < means.length; j += stride) pts.push([XN(j + 1), YF(means[j])]);
    if (pts.length && (means.length - 1) % stride !== 0) pts.push([XN(means.length), YF(means[means.length - 1])]);
    if (n === 1) plate.circle('r-mean-1', xc, YF(means[0]), 0.25 * fs, { fill: effect }, 'data', false);
    else plate.path('r-mean', pts, { stroke: effect, 'stroke-width': k.stroke('effect'), 'stroke-dasharray': k.dash('effect').join(' '), 'stroke-linejoin': 'round' }, 'data', false, false);
    const exW = plate.fraction('r-e-lab', xd, eY - 1.0 * fs, ex, { anchor: 'end' });
    rich(plate, ctx, 'r-e-name', xd - exW - 0.2 * fs, eY - 1.0 * fs, [['m', `${E.unicode}[${it('f')}] =`]], { anchor: 'end' })
    rich(plate, ctx, 'r-title', (xc + xd) / 2, 1.25 * fs, [['t', T('Mittelwert von ', 'mean of ')], ['m', it('f')], ['t', T(' (gestrichelt)', ' (dashed)')]]);
    rich(plate, ctx, 'r-name', (xc + xd) / 2, H - 0.35 * fs, [['t', T('Durchläufe ', 'runs ')], ['m', it('n')]], { fill: muted });

    // hover readouts
    if (hover) {
      const { x, y } = hover;
      if (x >= xa && x <= xb && y >= y1 - fs && y <= y0 + 2 * fs) {
        const i = Math.floor((x - xa) / slot);
        if (i >= 0 && i < m) {
          plate.tip(xa + (i + 0.5) * slot, Math.min(Y(toNumber(hw[i])), Y(toNumber(pw[i]))), [
            `${it('x')} = ${p.labels[i]}:  ${it('N(x)')} = ${fmtInt(c[i])}`,
            `${it('N(x)/N')} = ${c[i]}/${n}${hw[i].den !== BigInt(n) ? ` = ${fq(hw[i])}` : ''}`,
            `${it(P.unicode)}${it('(x)')} = ${fq(pw[i])}`,
          ]);
        }
      } else if (x >= xc && x <= xd && y >= y1 && y <= y0) {
        const j = n === 1 ? 1 : Math.max(1, Math.min(n, Math.round(1 + ((x - xc) / (xd - xc)) * (n - 1))));
        plate.line('h-n', XN(j), y1, XN(j), y0, muted, k.stroke('thin'), {}, 'hover', false);
        plate.circle('h-pt', XN(j), YF(means[j - 1]), 0.22 * fs, { fill: effect }, 'hover', false);
        plate.tip(XN(j), YF(means[j - 1]), [`${it('n')} = ${fmtInt(j)}: ${T('Mittelwert', 'mean')} ${fdec(ctx, means[j - 1])}`]);
      }
    }
    plate.end();

    const dev = maxDeviation(c, p.a);
    outE.set(`= ${fboth(ctx, ex)}`);
    outV.set(`= ${fboth(ctx, variance(p.a, p.f))}`);
    outM.set(`${fdec(ctx, toNumber(expectation(c, p.f)))}  (N = ${fmtInt(n)})`);
    outS.set(fdec(ctx, toNumber(variance(c, p.f))));
    outD.set(`= ${fboth(ctx, dev)}`);
    outSeed.set(String((ctx.seed + run) >>> 0));
    caption.innerHTML = T(
      'Eine Messreihe eines Rechenprogramms mit festem Startwert, keine exakte Rechnung. Abspielen lässt die Reihe wachsen; die Säulen zusammen haben stets die Höhe 1. Wie oft große Abweichungen im Modell vorkommen, beantwortet der Satz in der Vertiefung „Wie nah liegen relative Häufigkeiten an den Wahrscheinlichkeiten?“.',
      'One series from a computer program with a fixed seed, not an exact calculation. Play lets the series grow; the bars together always have height 1. How often large deviations occur in the model is answered by the theorem in the depth block “How close are relative frequencies to the probabilities?”.');
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
      const { p, n, c } = current();
      return { preset: p.key, seed: (ctx.seed + run) >>> 0, N: n, counts: c.join(','), mean: toNumber(expectation(c, p.f)), expectation: toNumber(expectation(p.a, p.f)) };
    },
  };
}
