// c01.demo.gewichte: a probability weight on the outcome set X = {1, ..., 6} of a die
// (figure c01.fig.gewichte, definition D54). The reader drags the top of a bar; the weight
// stays a weight: the other bars share the rest in proportion to their heights at the start
// of the drag, so all values stay >= 0 and their sum stays 1. The column on the right stacks
// the six values: its height is always 1.
//
// Every value is a multiple of 1/24 (the fair die is 4/24, the loaded die of
// c01.eq.gezinkt is (2, 4, 4, 4, 4, 6)/24). Every number shown is computed by
// web/src/kernels/prob.ts (renormalise, weights, pointWeightIndex) as an exact fraction.
// Clock: the weight travels from the reader's weight through the three weights of the figure
// (fair, loaded, point weight on 3, and round again), each leg an exact mixture
// lambda q + (1 - lambda) p with lambda a multiple of 1/24 (kernel mixture, c01.eq.mischung):
// every picture on the way is again a weight. A touch of a control takes over the weight shown
// (snapped to the 1/24 lattice, kernel nearestWeight).
// Parameters: preset = fair | loaded | point.
import type { DemoContext, DemoInstance, DemoMeta } from '../demo/types';
import { fadd, frac, mixture, nearestWeight, pointWeightIndex, renormalise, toNumber, weights, type Fraction } from '../kernels/prob';
import { Plate, choice, fq, it, mq, note, pointer } from './c01/kit';

export const meta: DemoMeta = { animated: true, aspect: 1.75, surface: 'plate' };

const LEG = 2.5;                      // seconds per leg of the tour while the clock runs: a drawing choice

const D = 24;                         // common denominator of the values the reader can set
const LABELS = ['1', '2', '3', '4', '5', '6'];
const PRESETS = [
  { key: 'fair', de: 'fairer Würfel', en: 'fair die', a: [4, 4, 4, 4, 4, 4] },
  { key: 'loaded', de: 'gezinkter Würfel', en: 'loaded die', a: [2, 4, 4, 4, 4, 6] },
  { key: 'point', de: 'Punktgewicht auf 3', en: 'point weight on 3', a: [0, 0, 24, 0, 0, 0] },
];

export function mount(stage: HTMLElement, ctx: DemoContext): DemoInstance {
  const plate = new Plate(stage, ctx);
  const T = ctx.text;
  const P = ctx.symbol('sym.probability-weight');

  // ── state ─────────────────────────────────────────────────────
  const start = Math.max(0, PRESETS.findIndex((p) => p.key === (ctx.params.preset ?? 'loaded')));
  let a = PRESETS[start].a.slice();
  let a0 = a.slice();                 // the weight at the start of the current drag
  let sel = 5;                        // the outcome the value slider moves (index)
  let hover = -1;
  let geom = { x0: 0, x1: 0, y0: 0, y1: 0, slot: 0 };
  let now = 0, t0 = 0, lastTime = -1;  // t0: the time of the reader's last change; the tour runs from there
  // the weight shown at time `now`: the reader's weight a, or a point of the tour
  const shown = (): number[] => {
    const u = (now - t0) / LEG;
    if (u <= 0) return a;
    const leg = Math.floor(u);
    const from = leg === 0 ? a : PRESETS[(leg - 1) % 3].a, to = PRESETS[leg % 3].a;
    return mixture(to, from, Math.round((u - leg) * D), D);
  };
  // a control was used: the weight shown becomes the reader's weight
  const touch = () => { if (now > t0) { a = nearestWeight(weights(shown()).map(toNumber), D); a0 = a.slice(); t0 = now; } };

  // ── controls ──────────────────────────────────────────────────
  const presets = choice(ctx, PRESETS.map((p) => T(p.de, p.en)), start, (i) => { touch(); a = PRESETS[i].a.slice(); a0 = a.slice(); sync(); say(); });
  const value = ctx.ui.slider({
    label: T('Gewicht p(x) des gewählten Ergebnisses, in 24steln', 'weight p(x) of the chosen outcome, in 24ths'),
    labelHtml: `${P.mathml}<math><mo>(</mo><mi>x</mi><mo>)</mo></math>`,
    min: 0, max: D, step: 1, value: a[sel], primary: true,
    format: (v) => fq(frac(v, D)),
    onInput: (v) => { touch(); a = renormalise(a0, sel, v); presets.set(-1); say(); },
  });
  const outcome = ctx.ui.slider({
    label: T('Ergebnis x, dessen Gewicht der nächste Regler setzt', 'outcome x whose weight the next slider sets'),
    labelHtml: '<math><mi>x</mi></math>',
    min: 1, max: 6, step: 1, value: sel + 1,
    onInput: (v) => { touch(); sel = v - 1; a0 = a.slice(); value.set(a[sel]); },
  });
  const outSum = ctx.ui.readout(T('Summe aller Gewichte', 'sum of all weights'), `<math><munder><mo>∑</mo><mi>x</mi></munder></math>${P.mathml}<math><mo>(</mo><mi>x</mi><mo>)</mo></math>`);
  const caption = note(ctx);
  const sync = () => { value.set(a[sel]); outcome.set(sel + 1); };

  const sumOf = (q: Fraction[]) => q.reduce((s, x) => fadd(s, x), frac(0));
  const say = () => {
    const p = weights(a);
    ctx.announce(LABELS.map((l, i) => `p(${l}) = ${fq(p[i])}`).join(', ') + T(`; Summe ${fq(sumOf(p))}`, `; sum ${fq(sumOf(p))}`));
  };

  // ── pointer: drag the top of a bar ────────────────────────────
  const barAt = (x: number) => {
    const { x0, slot } = geom;
    const i = Math.floor((x - x0) / slot);
    return i >= 0 && i < 6 ? i : -1;
  };
  const valueAt = (y: number) => {
    const { y0, y1 } = geom;
    return Math.max(0, Math.min(D, Math.round(((y0 - y) / (y0 - y1)) * D)));
  };
  const dragging = pointer(plate.svg, {
    down: (x, y) => {
      const i = barAt(x);
      if (i < 0 || y > geom.y0 + 2.2 * plate.fs || y < geom.y1 - 1.5 * plate.fs) return false;
      touch(); sel = i; a0 = a.slice();
      a = renormalise(a0, sel, valueAt(y));
      presets.set(-1); sync(); ctx.invalidate();
      return true;
    },
    move: (_x, y) => { const v = valueAt(y); if (v !== a[sel]) { a = renormalise(a0, sel, v); sync(); ctx.invalidate(); } },
    up: () => { a0 = a.slice(); say(); ctx.invalidate(); },
    hover: (x, y) => { const i = y > geom.y1 - 2 * plate.fs && y < geom.y0 + 2 * plate.fs ? barAt(x) : -1; if (i !== hover) { hover = i; ctx.invalidate(); } },
    leave: () => { if (hover !== -1) { hover = -1; ctx.invalidate(); } },
  });

  // ── drawing ───────────────────────────────────────────────────
  const paint = (ease: boolean) => {
    const fs = plate.begin(ease);
    const k = ctx.tokens;
    const { W, H } = plate;
    const ink = k.color('plate-ink'), muted = k.color('plate-muted'), rule = k.color('plate-rule'), state = k.color('state');
    const w = shown();
    const p = weights(w);
    const point = pointWeightIndex(w);

    const x0 = 3.2 * fs, x1 = W * 0.72;
    const y0 = H - 3.0 * fs, y1 = 2.8 * fs;
    const slot = (x1 - x0) / 6;
    geom = { x0, x1, y0, y1, slot };
    const Y = (v: number) => y0 - v * (y0 - y1);

    // axes and the marks of the print figure: 0, 1/6, 1/2, 1
    for (const q of [frac(1, 6), frac(1, 2), frac(1)]) {
      const v = Number(q.num) / Number(q.den);
      plate.line(`grid-${fq(q)}`, x0, Y(v), x1, Y(v), rule, k.stroke('hair'));
      plate.fraction(`tick-${fq(q)}`, x0 - 0.5 * fs, Y(v), q, { anchor: 'end', fill: muted, size: fs * 0.95 });
    }
    plate.text('tick-0', x0 - 0.5 * fs, Y(0), '0', { anchor: 'end', fill: muted, baseline: 'middle' });
    plate.line('axis-x', x0, y0, x1, y0, ink, k.stroke('thin'));
    plate.line('axis-y', x0, y0, x0, y1 - 0.8 * fs, ink, k.stroke('thin'));
    plate.text('axis-name', x0, y1 - 1.5 * fs, `${it(P.unicode)}(${it('x')})`, { anchor: 'middle', math: true, size: fs * 1.1 });
    plate.mixed('x-name', (x0 + x1) / 2, H - 0.45 * fs, [[T('Ergebnis ', 'outcome '), false], ['x', true]], { fill: muted });

    // bars
    const bw = Math.min(slot * 0.56, 4 * fs);
    for (let i = 0; i < 6; i++) {
      const cx = x0 + (i + 0.5) * slot;
      const v = Number(p[i].num) / Number(p[i].den);
      const on = i === sel || i === hover;
      plate.rect(`bar-${i}`, cx - bw / 2, Y(v), bw, y0 - Y(v), {
        fill: state, 'fill-opacity': on ? 0.32 : 0.16, stroke: state, 'stroke-width': k.stroke(on ? 'dynamics' : 'state'),
      });
      // the handle on the top edge: a short heavy line the reader grabs
      plate.line(`grip-${i}`, cx - bw * 0.32, Y(v), cx + bw * 0.32, Y(v), state, k.stroke('dynamics') * 1.6, { 'stroke-linecap': 'round' }, 'handles');
      plate.fraction(`val-${i}`, cx, Y(v) - 1.25 * fs, p[i], { size: fs * 0.95, fill: v === 0 ? muted : ink });
      plate.text(`lab-${i}`, cx, y0 + 1.35 * fs, LABELS[i], { weight: i === sel ? '600' : 'normal' });
    }
    // a hit area per column, so that the cursor shows where a drag starts
    for (let i = 0; i < 6; i++) plate.rect(`hit-${i}`, x0 + i * slot, y1 - 1.5 * fs, slot, y0 - y1 + 3 * fs, { fill: 'transparent', class: 'c01-grab' }, 'handles', false);

    // the stacked column: the six values on top of each other have height 1
    const cx0 = x1 + 3.4 * fs, cw = Math.min(3.2 * fs, (W - cx0) * 0.42);
    let acc = 0;
    for (let i = 0; i < 6; i++) {
      const v = Number(p[i].num) / Number(p[i].den);
      const on = i === sel || i === hover;
      plate.rect(`stack-${i}`, cx0, Y(acc + v), cw, Y(acc) - Y(acc + v), {
        fill: state, 'fill-opacity': on ? 0.34 : 0.1 + 0.04 * (i % 2), stroke: state, 'stroke-width': k.stroke('regular'),
      });
      plate.text(`stack-lab-${i}`, cx0 + cw / 2, Y(acc + v / 2), LABELS[i], {
        size: fs * 0.85, baseline: 'middle', fill: v * (y0 - y1) > fs * 0.95 ? ink : 'transparent',
      });
      acc += v;
    }
    plate.line('stack-top', cx0 - 0.6 * fs, Y(1), cx0 + cw + 0.6 * fs, Y(1), ink, k.stroke('regular'), {}, 'marks');
    const total = p.reduce((s, x) => fadd(s, x), frac(0));
    plate.text('stack-sum', cx0 + cw / 2, Y(1) - 0.75 * fs, `∑ ${it(P.unicode)}(${it('x')}) = ${fq(total)}`, { math: true });
    plate.text('stack-name', cx0 + cw / 2, y0 + 1.35 * fs, T('zusammen', 'stacked'), { fill: muted, size: fs * 0.9 });

    if (hover >= 0) {
      const v = Number(p[hover].num) / Number(p[hover].den);
      plate.tip(x0 + (hover + 0.5) * slot, Y(v), [`${P.unicode}(${LABELS[hover]}) = ${fq(p[hover])}${now > t0 ? '' : ` = ${a[hover]}/${D}`}`]);
    }
    plate.end();

    outSum.set(`= ${fq(total)}`);
    const det = point >= 0
      ? T(` <b>Punktgewicht auf ${LABELS[point]}: eine deterministische Präparation.</b>`, ` <b>Point weight on ${LABELS[point]}: a deterministic preparation.</b>`)
      : '';
    const tour = now > t0
      ? T(' Beim Abspielen wandert das Gewicht durch die drei Gewichte der Abbildung, jeder Schritt eine exakte Mischung <math><mi>λ</mi><mi>q</mi><mo>+</mo><mo>(</mo><mn>1</mn><mo>−</mo><mi>λ</mi><mo>)</mo><mi>p</mi></math>: wieder ein Gewicht.',
        ' While playing, the weight travels through the three weights of the figure, each step an exact mixture <math><mi>λ</mi><mi>q</mi><mo>+</mo><mo>(</mo><mn>1</mn><mo>−</mo><mi>λ</mi><mo>)</mo><mi>p</mi></math>: again a weight.')
      : '';
    caption.innerHTML = det + ' ' + T(
      `Ziehen Sie die Oberkante eines Balkens. Die anderen Balken teilen sich den Rest im Verhältnis ihrer Höhen: Alle Werte bleiben ${'<math><mo>≥</mo><mn>0</mn></math>'}, und ihre Summe bleibt ${mq(total)} (rechts gestapelt).`,
      `Drag the top of a bar. The other bars share the rest in proportion to their heights: every value stays ${'<math><mo>≥</mo><mn>0</mn></math>'}, and their sum stays ${mq(total)} (stacked on the right).`) + tour;
  };

  return {
    render(_frame, time) {
      const clock = lastTime >= 0 && time !== lastTime;
      lastTime = time; now = time;
      if (now > t0) { presets.set(-1); value.set(Math.round(toNumber(weights(shown())[sel]) * D)); }
      paint(!ctx.deterministic && !ctx.reducedMotion && !dragging() && !clock);
    },
    destroy() { plate.svg.remove(); },
    info: () => ({ weight: shown().join(','), denominator: shown().reduce((s, x) => s + x, 0), selected: sel + 1 }),
  };
}
