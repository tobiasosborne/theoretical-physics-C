// c01.demo.varianz: the variance as the expectation value of the squared deviation (figure
// c01.fig.varianz, definition D56, c01.prop.varianz, c01.eq.var-indikator).
//
// Left, top: a weight p on X = {1, ..., 6} (bars, state role) and the expectation value E[f]
// of f(x) = x (dashed, effect role). The reader drags the top of a bar; the weight stays a
// weight (kernel renormalise, as in c01.demo.gewichte).
// Left, bottom: the squared deviations (f(x) - E[f])^2, a measurement (dashed outlines), and
// the products p(x) (f(x) - E[f])^2 (hatched); the column on the right stacks the products, and
// its height is Var[f] (D56).
// Right: Var[chi_S] = q (1 - q) with q = P[S] (c01.eq.var-indikator). The reader builds S by
// clicking outcomes (or a dot); the faint dots are all 64 events of the current weight. For a
// point weight every q is 0 or 1 and every dot sits at a zero of the parabola
// (c01.prop.punktgewicht).
//
// Every number shown is computed by web/src/kernels/prob.ts (weights, expectation,
// squaredDeviations, varianceTerms, variance, indicator, probability, allEvents,
// pointWeightIndex, renormalise) as an exact fraction.
// Clock: play runs the exact mixture lambda fair + (1 - lambda) (half on 3 and 4) between the two
// weights of the figure (kernel mixture): E[f] stays 7/2 while Var[f] moves between 35/12 and
// 1/4. Dragging a bar or choosing another weight leaves the mixture; then time changes nothing.
// Parameters: preset = fair | half | loaded | point.
import type { DemoContext, DemoInstance, DemoMeta } from '../demo/types';
import {
  allEvents, expectation, fadd, frac, indicator, mixture, nearestWeight, pointWeightIndex, probability, renormalise, squaredDeviations, toNumber, variance, varianceTerms, weights, indicatorVarianceValue } from '../kernels/prob';
import { Plate, bracket, choice, fq, it, mq, note, pointer } from './c01/kit';

export const meta: DemoMeta = { animated: true, aspect: 1.45, surface: 'plate' };

const K = 12;                                // the mixing weight lambda runs over multiples of 1/K
const SWEEP = 5;                             // seconds of play for lambda to run from 1 to 0: a presentation choice
const FAIR = [4, 4, 4, 4, 4, 4], HALF = [0, 0, 12, 12, 0, 0];   // the two weights of the figure, panels (a) and (b)

const D = 24;                                // denominator of the weights the reader can set
const F = [1, 2, 3, 4, 5, 6];                // the measurement f(x) = x
const LABELS = ['1', '2', '3', '4', '5', '6'];
const EVENTS = allEvents(6);                 // in the order of table c01.tab.ereignisse
const PRESETS = [
  { key: 'fair', de: 'fairer Würfel', en: 'fair die', a: [4, 4, 4, 4, 4, 4] },
  { key: 'half', de: 'je ½ auf 3 und 4', en: '½ each on 3 and 4', a: [0, 0, 12, 12, 0, 0] },
  { key: 'loaded', de: 'gezinkter Würfel', en: 'loaded die', a: [2, 4, 4, 4, 4, 6] },
  { key: 'point', de: 'Punktgewicht auf 3', en: 'point weight on 3', a: [0, 0, 24, 0, 0, 0] },
];
const SQ_TOPS = [2.5, 7, 10, 17, 26];          // scales of the lower panel (in units of f^2): a drawing choice

/** write χ_S of a text as italic χ with the italic subscript S (as the print figures set it) */
function subS(e: SVGTextElement): void {
  if (!e.textContent?.includes('χ_S')) return;
  const parts = e.textContent.split('χ_S');
  e.replaceChildren();
  parts.forEach((t, i) => {
    if (i > 0) {
      e.append(it('χ'));
      const ts = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
      ts.setAttribute('baseline-shift', 'sub'); ts.setAttribute('font-size', '75%'); ts.textContent = it('S');
      e.append(ts);
    }
    e.append(t);
  });
}

const setText = (s: readonly number[]) => (s.length === 0 ? '∅' : `{${s.map((i) => LABELS[i]).join(', ')}}`);

export function mount(stage: HTMLElement, ctx: DemoContext): DemoInstance {
  const plate = new Plate(stage, ctx);
  const T = ctx.text;
  const P = ctx.symbol('sym.probability-weight');
  const E = ctx.symbol('sym.expectation');
  const V = ctx.symbol('sym.variance');
  const PR = ctx.symbol('sym.probability');
  const CHI = ctx.symbol('sym.indicator');

  // ── state ─────────────────────────────────────────────────────
  const start = Math.max(0, PRESETS.findIndex((p) => p.key === (ctx.params.preset ?? 'fair')));
  // Clock: while `mix` holds, the weight is the exact mixture lambda fair + (1 - lambda) half
  // (kernel mixture), and play runs lambda back and forth (a triangle wave); E[f] stays 7/2.
  // The reader's lambda is the value at the current time. Dragging a bar leaves the mixture.
  let mix = PRESETS[start].key === 'fair' || PRESETS[start].key === 'half';
  let now = 0, lastTime = -1;
  let phase = PRESETS[start].key === 'half' ? 0 : 1;          // lambda at time 0: 1 is the fair die of panel (a)
  const tri = (u: number) => { const r = ((u % 2) + 2) % 2; return r <= 1 ? r : 2 - r; };
  const kAt = () => Math.round(tri(phase + now / SWEEP) * K);
  const setK = (k: number) => { phase = k / K - now / SWEEP; };
  let a = mix ? mixture(FAIR, HALF, kAt(), K) : PRESETS[start].a.slice();
  let a0 = a.slice();
  /** leave the mixture: the weight in 24ths nearest to the current one, as the start of an edit */
  const leaveMix = () => { if (mix) { mix = false; a = nearestWeight(weights(a).map(toNumber), D); a0 = a.slice(); presets.set(-1); } };
  const at24 = (i: number) => Math.round(toNumber(weights(a)[i]) * D);
  let sel = 2;
  let S: number[] = [1, 3, 5];                 // "even": {2, 4, 6}
  let hover: { kind: 'bar' | 'sq' | 'chip' | 'dot'; i: number } | null = null;
  let frozen: { top: number; sqTop: number } | null = null;
  let geom = { x0: 0, slot: 1, yA0: 0, yA1: 0, top: 1, chipY: 0, cx0: 0, cx1: 1, cy0: 0, cy1: 1, ctop: 0.3, yB0: 0, yB1: 0, sqTop: 1 };

  const eventIndex = () => EVENTS.findIndex((e) => e.length === S.length && e.every((x, j) => x === S[j]));

  // ── controls ──────────────────────────────────────────────────
  const lam = ctx.ui.slider({
    label: T('Mischungsgewicht lambda: lambda mal fairer Würfel plus (1 − lambda) mal je ½ auf 3 und 4', 'mixing weight lambda: lambda times the fair die plus (1 − lambda) times ½ each on 3 and 4'),
    labelHtml: '<math><mi>λ</mi></math>',
    min: 0, max: K, step: 1, value: kAt(), primary: true,
    format: (v) => fq(frac(v, K)),
    onInput: (v) => { setK(v); mix = true; a = mixture(FAIR, HALF, v, K); a0 = a.slice(); presets.set(-1); sync(); say(); },
  });
  const presets = choice(ctx, PRESETS.map((p) => T(p.de, p.en)), start, (i) => {
    const key = PRESETS[i].key;
    if (key === 'fair' || key === 'half') { mix = true; setK(key === 'fair' ? K : 0); a = mixture(FAIR, HALF, kAt(), K); lam.set(kAt()); }
    else { mix = false; a = PRESETS[i].a.slice(); }
    a0 = a.slice(); sync(); say();
  });
  const outcome = ctx.ui.slider({
    label: T('Ergebnis x, dessen Gewicht der nächste Regler setzt', 'outcome x whose weight the next slider sets'),
    labelHtml: '<math><mi>x</mi></math>',
    min: 1, max: 6, step: 1, value: sel + 1,
    onInput: (v) => { sel = v - 1; a0 = a.slice(); value.set(at24(sel)); },
  });
  const value = ctx.ui.slider({
    label: T('Gewicht p(x) des gewählten Ergebnisses, in 24steln', 'weight p(x) of the chosen outcome, in 24ths'),
    labelHtml: `${P.mathml}<math><mo>(</mo><mi>x</mi><mo>)</mo></math>`,
    min: 0, max: D, step: 1, value: at24(sel),
    format: (v) => fq(frac(v, D)),
    onInput: (v) => { leaveMix(); a = renormalise(a0, sel, v); presets.set(-1); say(); },
  });
  const eventSlider = ctx.ui.slider({
    label: T('Ereignis S (alle 64 Teilmengen, nach Größe geordnet)', 'event S (all 64 subsets, ordered by size)'),
    labelHtml: '<math><mi>S</mi></math>',
    min: 0, max: EVENTS.length - 1, step: 1, value: eventIndex(),
    format: (v) => setText(EVENTS[v]),
    onInput: (v) => { S = EVENTS[v].slice(); say(); },
  });
  const Ef = bracket(E.mathml, '<mi>f</mi>'), Vf = bracket(V.mathml, '<mi>f</mi>');
  const PS = bracket(PR.mathml, '<mi>S</mi>'), VS = bracket(V.mathml, CHI.mathml.replace(/^<math[^>]*>/, '').replace(/<\/math>$/, ''));
  const outE = ctx.ui.readout(T('Erwartungswert von f', 'expectation value of f'), Ef);
  const outV = ctx.ui.readout(T('Varianz von f', 'variance of f'), Vf);
  const outP = ctx.ui.readout(T('Wahrscheinlichkeit von S', 'probability of S'), PS);
  const outVS = ctx.ui.readout(T('Varianz der Ja-Nein-Messung', 'variance of the yes-no measurement'), VS);
  const caption = note(ctx);
  const sync = () => { value.set(at24(sel)); outcome.set(sel + 1); eventSlider.set(eventIndex()); };
  const toggle = (i: number) => { S = S.includes(i) ? S.filter((x) => x !== i) : [...S, i].sort((x, y) => x - y); sync(); say(); };

  const say = () => {
    const q = probability(a, S);
    ctx.announce(T(
      `Erwartungswert ${fq(expectation(a, F))}, Varianz ${fq(variance(a, F))}; S = ${setText(S)}, P[S] = ${fq(q)}, Varianz der Ja-Nein-Messung ${fq(variance(a, indicator(S, 6)))}.`,
      `expectation value ${fq(expectation(a, F))}, variance ${fq(variance(a, F))}; S = ${setText(S)}, P[S] = ${fq(q)}, variance of the yes-no measurement ${fq(variance(a, indicator(S, 6)))}.`));
  };

  // ── pointer ───────────────────────────────────────────────────
  const colAt = (x: number) => { const i = Math.floor((x - geom.x0) / geom.slot); return i >= 0 && i < 6 ? i : -1; };
  const valueAt = (y: number) => {
    const top = frozen?.top ?? geom.top;
    return Math.max(0, Math.min(D, Math.round(((geom.yA0 - y) / (geom.yA0 - geom.yA1)) * top * D)));
  };
  const qX = (q: number) => geom.cx0 + q * (geom.cx1 - geom.cx0);
  const vY = (v: number) => geom.cy0 - (v / geom.ctop) * (geom.cy0 - geom.cy1);
  const dotAt = (x: number, y: number) => {
    let best = -1, bd = 0.9 * plate.fs;
    EVENTS.forEach((e, j) => {
      const q = toNumber(probability(a, e));
      const d = Math.hypot(qX(q) - x, vY(indicatorVarianceValue(q)) - y);
      if (d < bd) { bd = d; best = j; }
    });
    return best;
  };
  const inChips = (y: number) => Math.abs(y - geom.chipY) < 0.95 * plate.fs;
  const inBars = (y: number) => y > geom.yA1 - 1.5 * plate.fs && y < geom.yA0 + 0.2 * plate.fs;
  const inSq = (y: number) => y > geom.yB1 - 0.5 * plate.fs && y < geom.yB0;
  const dragging = pointer(plate.svg, {
    down: (x, y) => {
      if (x > geom.cx0 - plate.fs) {
        const j = dotAt(x, y);
        if (j >= 0) { S = EVENTS[j].slice(); sync(); say(); ctx.invalidate(); }
        return false;
      }
      const i = colAt(x);
      if (i < 0) return false;
      if (inChips(y)) { toggle(i); ctx.invalidate(); return false; }
      if (!inBars(y)) return false;
      leaveMix(); sel = i; a0 = a.slice(); frozen = { top: geom.top, sqTop: geom.sqTop };
      a = renormalise(a0, sel, valueAt(y));
      presets.set(-1); sync(); ctx.invalidate();
      return true;
    },
    move: (_x, y) => { const v = valueAt(y); if (v !== a[sel]) { a = renormalise(a0, sel, v); sync(); ctx.invalidate(); } },
    up: () => { a0 = a.slice(); frozen = null; say(); ctx.invalidate(); },
    hover: (x, y) => {
      let h: typeof hover = null;
      if (x > geom.cx0 - plate.fs) { const j = dotAt(x, y); if (j >= 0) h = { kind: 'dot', i: j }; }
      else { const i = colAt(x); if (i >= 0) h = inChips(y) ? { kind: 'chip', i } : inBars(y) ? { kind: 'bar', i } : inSq(y) ? { kind: 'sq', i } : null; }
      if (JSON.stringify(h) !== JSON.stringify(hover)) { hover = h; ctx.invalidate(); }
    },
    leave: () => { if (hover) { hover = null; ctx.invalidate(); } },
  });

  // ── drawing ───────────────────────────────────────────────────
  const paint = (ease: boolean) => {
    const fs = plate.begin(ease);
    const k = ctx.tokens;
    const { W, H } = plate;
    const ink = k.color('plate-ink'), muted = k.color('plate-muted'), rule = k.color('plate-rule'), state = k.color('state'), effect = k.color('effect');
    const dash = k.dash('effect').join(' ');
    const p = weights(a);
    const pv = p.map(toNumber);
    const ex = expectation(a, F), exv = toNumber(ex);
    const sq = squaredDeviations(a, F), sqv = sq.map(toNumber);
    const terms = varianceTerms(a, F), tv = terms.map(toNumber);
    const vf = variance(a, F);
    const point = pointWeightIndex(a);

    // geometry: left the weight (top) and the squared deviations (bottom), right the parabola
    const x0 = 3.0 * fs, xL = W * 0.6;
    const slot = (xL - x0) / 6.9;               // six columns and the stacked column
    const X = (u: number) => x0 + (u - 0.5) * slot;
    const yA1 = 2.4 * fs, yA0 = H * 0.42;
    const maxp = Math.max(...pv);
    const top = frozen?.top ?? (maxp <= 0.55 ? 0.6 : 1.08);
    const YA = (v: number) => yA0 - (v / top) * (yA0 - yA1);
    const chipY = yA0 + 1.35 * fs;
    const narrow = W < 500;                   // legend in two rows
    const yB1 = chipY + (narrow ? 4.6 : 3.6) * fs, yB0 = H - 2.6 * fs;
    const maxsq = Math.max(...sqv);
    const sqTop = frozen?.sqTop ?? SQ_TOPS.find((t) => t >= maxsq * 1.04) ?? maxsq * 1.08;
    const YB = (v: number) => yB0 - (v / sqTop) * (yB0 - yB1);
    const cx0 = W * 0.68, cx1 = W - 1.6 * fs, cy1 = yA1 + 1.6 * fs, cy0 = H * 0.62, ctop = 0.3;
    geom = { x0, slot, yA0, yA1, top, chipY, cx0, cx1, cy0, cy1, ctop, yB0, yB1, sqTop };
    const bw = Math.min(slot * 0.56, 3.6 * fs);

    // ── top: the weight and E[f]
    for (const q of [frac(1, 6), frac(1, 2), frac(1)]) {
      const v = toNumber(q);
      if (v > top) continue;
      plate.line(`ga-${fq(q)}`, x0 - 0.4 * fs, YA(v), x0 + 6 * slot, YA(v), rule, k.stroke('hair'));
      plate.fraction(`ta-${fq(q)}`, x0 - 0.6 * fs, YA(v), q, { anchor: 'end', fill: muted, size: fs * 0.9 });
    }
    plate.text('ta-0', x0 - 0.6 * fs, YA(0), '0', { anchor: 'end', fill: muted, baseline: 'middle', size: fs * 0.9 });
    plate.line('axa', x0 - 0.4 * fs, yA0, x0 + 6 * slot, yA0, ink, k.stroke('thin'));
    plate.text('na', x0 - 0.4 * fs, yA1 - 0.9 * fs, `${it(P.unicode)}(${it('x')})`, { anchor: 'start', math: true });
    for (let i = 0; i < 6; i++) {
      const cx = X(F[i]);
      const on = i === sel || (hover?.kind === 'bar' && hover.i === i);
      plate.rect(`bar-${i}`, cx - bw / 2, YA(pv[i]), bw, yA0 - YA(pv[i]), {
        fill: state, 'fill-opacity': on ? 0.32 : 0.16, stroke: state, 'stroke-width': k.stroke(on ? 'dynamics' : 'state'),
      });
      plate.line(`grip-${i}`, cx - bw * 0.3, YA(pv[i]), cx + bw * 0.3, YA(pv[i]), state, k.stroke('dynamics') * 1.6, { 'stroke-linecap': 'round' }, 'handles');
      // the outcome as a chip: hatched when it lies in S
      const inS = S.includes(i);
      const cw = Math.min(slot * 0.62, 2.2 * fs);
      plate.rect(`chip-${i}`, cx - cw / 2, chipY - 0.75 * fs, cw, 1.5 * fs, {
        fill: inS ? plate.hatchFill : k.color('plate'), stroke: inS ? ink : rule, 'stroke-width': k.stroke(inS || (hover?.kind === 'chip' && hover.i === i) ? 'regular' : 'thin'), rx: 3, class: 'c01-hit',
      }, 'marks', false);
      plate.text(`chipl-${i}`, cx, chipY, LABELS[i], { baseline: 'middle', weight: inS ? '600' : 'normal', layer: 'labels' }).style.pointerEvents = 'none';
    }
    plate.text('chip-name', x0 - 0.6 * fs, chipY, it('S'), { anchor: 'end', baseline: 'middle', math: true });
    // E[f], dashed, through both panels: on the outcome axis, since f(x) = x
    const ex0 = X(exv);
    plate.line('e-line', ex0, yA1 - 0.2 * fs, ex0, yA0, effect, k.stroke('effect'), { 'stroke-dasharray': dash }, 'marks');
    plate.line('e-line-b', ex0, yB1 - 0.4 * fs, ex0, yB0, effect, k.stroke('effect'), { 'stroke-dasharray': dash }, 'marks');
    // the label stands on the side of the line with more room
    const right = exv <= 3.5;
    const el = plate.text('e-lab', 0, yA1 - 1.1 * fs, `${E.unicode}[${it('f')}] =`, { anchor: 'start', fill: effect, baseline: 'middle', math: true });
    const lw = el.getComputedTextLength() + 0.6 * fs + (ex.den === 1n ? 0.7 : 1.4) * fs * String(ex.den === 1n ? ex.num : ex.den).length * 0.6;
    const lx = right ? ex0 + 0.35 * fs : ex0 - 0.35 * fs - lw;
    el.style.transform = `translate(${lx.toFixed(2)}px, ${(yA1 - 1.1 * fs).toFixed(2)}px)`;
    plate.fraction('e-val', lx + el.getComputedTextLength() + 0.6 * fs, yA1 - 1.1 * fs, ex, { anchor: 'start', fill: effect, size: fs * 0.95 });

    // ── bottom: squared deviations and the products
    for (const g of [1, 4, 9, 16, 25]) {
      if (g >= sqTop) continue;
      plate.line(`gb-${g}`, x0 - 0.4 * fs, YB(g), x0 + 6.9 * slot, YB(g), rule, k.stroke('hair'));
      plate.text(`tb-${g}`, x0 - 0.6 * fs, YB(g), String(g), { anchor: 'end', fill: muted, baseline: 'middle', size: fs * 0.9 });
    }
    plate.text('tb-0', x0 - 0.6 * fs, YB(0), '0', { anchor: 'end', fill: muted, baseline: 'middle', size: fs * 0.9 });
    plate.line('axb', x0 - 0.4 * fs, yB0, x0 + 6.9 * slot, yB0, ink, k.stroke('thin'));
    // legend: dashed = the squared deviation (a measurement), hatched = its weighted part
    // (on a narrow plate the two entries stand in two rows)
    const dev = `(${it('f')}(${it('x')}) − ${E.unicode}[${it('f')}])²`;
    const ly = narrow ? yB1 - 2.7 * fs : yB1 - 1.5 * fs;
    plate.rect('lg-sq', x0 - 0.4 * fs, ly - 0.5 * fs, 1.2 * fs, 1.0 * fs, { fill: 'none', stroke: effect, 'stroke-width': k.stroke('effect'), 'stroke-dasharray': dash }, 'marks', false);
    const lt = plate.text('lg-sq-t', x0 + 1.2 * fs, ly, dev, { anchor: 'start', baseline: 'middle', size: fs * 0.95, math: true });
    const lx2 = narrow ? x0 - 0.4 * fs : x0 + 1.2 * fs + lt.getComputedTextLength() + 1.4 * fs;
    const ly2 = narrow ? ly + 1.3 * fs : ly;
    plate.rect('lg-t', lx2, ly2 - 0.5 * fs, 1.2 * fs, 1.0 * fs, { fill: plate.hatchFill, stroke: ink, 'stroke-width': k.stroke('hair') }, 'marks', false);
    plate.text('lg-t-t', lx2 + 1.6 * fs, ly2, `${it(P.unicode)}(${it('x')}) ${dev}`, { anchor: 'start', baseline: 'middle', size: fs * 0.95, math: true });
    for (let i = 0; i < 6; i++) {
      const cx = X(F[i]);
      const on = hover?.kind === 'sq' && hover.i === i;
      plate.rect(`sq-${i}`, cx - bw / 2, YB(sqv[i]), bw, yB0 - YB(sqv[i]), {
        fill: 'none', stroke: effect, 'stroke-width': k.stroke(on ? 'dynamics' : 'effect'), 'stroke-dasharray': dash,
      });
      plate.rect(`term-${i}`, cx - bw / 2, YB(tv[i]), bw, yB0 - YB(tv[i]), { fill: plate.hatchFill, stroke: ink, 'stroke-width': k.stroke('hair') });
    }
    // the stacked products: height Var[f]
    const sx = X(7) - 0.1 * slot;
    let acc = 0;
    for (let i = 0; i < 6; i++) {
      plate.rect(`stack-${i}`, sx - bw / 2, YB(acc + tv[i]), bw, YB(acc) - YB(acc + tv[i]), { fill: plate.hatchFill, stroke: ink, 'stroke-width': k.stroke('thin') });
      acc += tv[i];
    }
    plate.line('stack-top', sx - bw / 2 - 0.4 * fs, YB(toNumber(vf)), sx + bw / 2 + 0.4 * fs, YB(toNumber(vf)), ink, k.stroke('regular'), {}, 'marks');
    // the value above the column, its name under it (in place of an outcome label)
    plate.fraction('stack-v', sx, YB(toNumber(vf)) - 1.15 * fs, vf, { size: fs * 0.92 });
    for (let i = 0; i < 6; i++) plate.text(`lb-${i}`, X(F[i]), yB0 + 1.3 * fs, LABELS[i], { fill: muted, size: fs * 0.9 });
    plate.text('lb-sum', sx + 0.1 * slot, yB0 + 1.3 * fs, `${V.unicode}[${it('f')}]`, { size: fs * 0.9, math: true });

    // ── right: Var[chi_S] = q (1 - q)
    subS(plate.text('c-title', (cx0 + cx1) / 2, yA1 - 0.9 * fs, `${V.unicode}[χ_S] = ${it('q')} (1 − ${it('q')}),  ${it('q')} = ${PR.unicode}[${it('S')}]`, { size: fs * 0.95, math: true }));
    plate.line('c-ax', cx0, cy0, cx1 + 0.6 * fs, cy0, ink, k.stroke('thin'));
    plate.line('c-ay', cx0, cy0, cx0, cy1 - 0.5 * fs, ink, k.stroke('thin'));
    plate.line('c-q', cx0, vY(0.25), cx1, vY(0.25), rule, k.stroke('hair'));
    plate.fraction('c-t14', cx0 - 0.4 * fs, vY(0.25), frac(1, 4), { anchor: 'end', fill: muted, size: fs * 0.9 });
    for (const [key, q, lab] of [['0', 0, '0'], ['h', 0.5, '½'], ['1', 1, '1']] as const) {
      plate.text(`c-x${key}`, qX(q), cy0 + 1.2 * fs, lab, { fill: muted, size: fs * 0.9 });
    }
    plate.text('c-xq', cx1 + 0.8 * fs, cy0 + 0.1 * fs, it('q'), { anchor: 'start', math: true, baseline: 'middle' });
    const curve: Array<[number, number]> = [];
    for (let j = 0; j <= 60; j++) { const q = j / 60; curve.push([qX(q), vY(indicatorVarianceValue(q))]); }
    plate.path('parabola', curve, { stroke: ink, 'stroke-width': k.stroke('regular') }, 'grid', false, false);
    // all 64 events of the current weight
    EVENTS.forEach((e, j) => {
      const q = toNumber(probability(a, e));
      const hov = hover?.kind === 'dot' && hover.i === j;
      plate.circle(`dot-${j}`, qX(q), vY(indicatorVarianceValue(q)), (hov ? 0.36 : 0.24) * fs, { fill: effect, 'fill-opacity': hov ? 0.9 : 0.28, stroke: 'none' }, 'data');
    });
    const qS = probability(a, S), qv = toNumber(qS);
    const vS = variance(a, indicator(S, 6));
    plate.line('c-guide', qX(qv), cy0, qX(qv), vY(toNumber(vS)), effect, k.stroke('effect'), { 'stroke-dasharray': dash }, 'marks');
    plate.circle('c-pt', qX(qv), vY(toNumber(vS)), 0.45 * fs, { fill: effect, stroke: k.color('plate'), 'stroke-width': k.stroke('regular') }, 'handles');
    const vy = cy0 + 2.9 * fs;
    plate.text('c-s', cx0, vy, `${it('S')} = ${setText(S)}`, { anchor: 'start', size: fs * 0.95, math: true });
    const l1 = plate.text('c-pl', cx0, vy + 1.9 * fs, `${it('q')} = ${PR.unicode}[${it('S')}] =`, { anchor: 'start', size: fs * 0.95, baseline: 'middle', math: true });
    plate.fraction('c-p', cx0 + l1.getComputedTextLength() + 0.6 * fs, vy + 1.9 * fs, qS, { anchor: 'start', size: fs * 0.95 });
    const l2 = plate.text('c-vl', cx0, vy + 4.0 * fs, `${V.unicode}[χ_S] =`, { anchor: 'start', size: fs * 0.95, baseline: 'middle', math: true });
    subS(l2);
    plate.fraction('c-v', cx0 + l2.getComputedTextLength() + 0.6 * fs, vy + 4.0 * fs, vS, { anchor: 'start', size: fs * 0.95 });
    if (point >= 0) {
      plate.text('c-point1', (cx0 + cx1) / 2, vY(0.25) - 2.2 * fs, T(`Punktgewicht auf ${LABELS[point]}:`, `point weight on ${LABELS[point]}:`), { size: fs * 0.9, weight: '600' });
      plate.text('c-point2', (cx0 + cx1) / 2, vY(0.25) - 1.0 * fs, T('jedes q ist 0 oder 1, jede Varianz 0', 'every q is 0 or 1, every variance 0'), { size: fs * 0.9 });
    }

    // hover readouts
    if (hover?.kind === 'bar') {
      const i = hover.i;
      plate.tip(X(F[i]), YA(pv[i]), [`${P.unicode}(${LABELS[i]}) = ${fq(p[i])}`]);
    } else if (hover?.kind === 'sq') {
      const i = hover.i;
      plate.tip(X(F[i]), YB(sqv[i]), [`(${LABELS[i]} − ${fq(ex)})² = ${fq(sq[i])}`, `${P.unicode}(${LABELS[i]}) · ${fq(sq[i])} = ${fq(terms[i])}`]);
    } else if (hover?.kind === 'chip') {
      plate.tip(X(F[hover.i]), chipY, [T(`${LABELS[hover.i]} ${S.includes(hover.i) ? 'aus S nehmen' : 'zu S hinzufügen'}`, `${S.includes(hover.i) ? 'remove' : 'add'} ${LABELS[hover.i]} ${S.includes(hover.i) ? 'from' : 'to'} S`)]);
    } else if (hover?.kind === 'dot') {
      const e = EVENTS[hover.i];
      const q = probability(a, e);
      plate.tip(qX(toNumber(q)), vY(indicatorVarianceValue(toNumber(q))), [`S = ${setText(e)}`, `q = ${PR.unicode}[S] = ${fq(q)}`, `q (1 − q) = ${fq(variance(a, indicator(e, 6)))}`]);
    }
    plate.end();

    const sum = terms.reduce((s, x) => fadd(s, x), frac(0));
    outE.set(`= ${fq(ex)}`);
    outV.set(`= ${fq(vf)}`);
    outP.set(`= ${fq(qS)}`);
    outVS.set(`= ${fq(vS)}`);
    caption.innerHTML = T(
      `Ziehen Sie die Balken oben. Unten stehen die Abweichungsquadrate (gestrichelt) und ihre mit ${P.mathml} gewichteten Anteile (schraffiert); gestapelt ergeben sie ${Vf} = ${mq(sum)}. Klicken Sie Ergebnisse an, um ein Ereignis <math><mi>S</mi></math> zu bilden: Rechts liegt ${VS} auf der Parabel, die Punkte sind alle 64 Ereignisse. Abspielen oder <math><mi>λ</mi></math> mischt den fairen Würfel und „je ½ auf 3 und 4“: ${Ef} bleibt ${mq(expectation(FAIR, F))}, ${Vf} wandert zwischen ${mq(variance(FAIR, F))} und ${mq(variance(HALF, F))}.`,
      `Drag the bars at the top. Below are the squared deviations (dashed) and their parts weighted by ${P.mathml} (hatched); stacked they give ${Vf} = ${mq(sum)}. Click outcomes to build an event <math><mi>S</mi></math>: on the right ${VS} lies on the parabola; the dots are all 64 events. Play, or <math><mi>λ</mi></math>, mixes the fair die and “½ each on 3 and 4”: ${Ef} stays ${mq(expectation(FAIR, F))}, ${Vf} moves between ${mq(variance(FAIR, F))} and ${mq(variance(HALF, F))}.`);
  };

  return {
    render(_frame, time) {
      const clock = time !== lastTime && lastTime >= 0;
      lastTime = time; now = time;
      if (mix && !dragging()) { a = mixture(FAIR, HALF, kAt(), K); lam.set(kAt()); value.set(at24(sel)); }
      paint(!ctx.deterministic && !ctx.reducedMotion && !dragging() && !clock);
    },
    destroy() { plate.svg.remove(); },
    info: () => ({ weight: a.join(','), expectation: fq(expectation(a, F)), variance: fq(variance(a, F)), event: setText(S), probability: fq(probability(a, S)), varianceIndicator: fq(variance(a, indicator(S, 6))) }),
  };
}

