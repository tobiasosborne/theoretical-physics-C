// c01.demo.erwartung: the expectation value as a balance point (figure c01.fig.erwartung,
// definition D55, c01.prop.erwartung). The weights p(x) stand as masses on a beam at the
// positions f(x); the beam rests on a fulcrum at c. The net moment about c is
//     sum_x p(x) (f(x) - c) = E[f] - c        (linearity, c01.prop.erwartung)
// and the beam is level exactly when it vanishes, that is when c = E[f]. The reader drags the
// fulcrum (or uses its slider) and the tops of the bars (the weight stays a weight: kernel
// renormalise, as in c01.demo.gewichte); the number line below shows min f <= E[f] <= max f
// (c01.prop.erwartung, part 4).
//
// Drawing choice, not physics: the tilt angle is TILT_MAX * tanh((E[f] - c) / TILT_SCALE),
// monotone in the moment, clamped below TILT_MAX, zero exactly when the moment is zero (decided
// by the kernel's exact comparison). A real rigid beam off balance would tip over completely.
//
// Every number shown is computed by web/src/kernels/prob.ts (expectation, moment, weights,
// renormalise, fcmp) as an exact fraction. The fulcrum moves on the lattice of multiples of
// 1/24, which contains every expectation value of a weight with denominator 24 and integer f.
// Clock: play moves the fulcrum back and forth between min f and max f (a triangle wave on the
// lattice); the beam levels exactly as the fulcrum passes E[f]. Nothing else depends on time.
// Parameters: preset = fair | loaded | point | three.
import type { DemoContext, DemoInstance, DemoMeta } from '../demo/types';
import { expectation, fcmp, frac, moment, renormalise, toNumber, weights, type Fraction } from '../kernels/prob';
import { Plate, bracket, choice, fq, it, mq, note, pointer } from './c01/kit';

export const meta: DemoMeta = { animated: true, aspect: 1.75, surface: 'plate' };

const SWEEP = 6;                               // seconds of play for the fulcrum to cross from min f to max f: a presentation choice

const D = 24;                                  // denominator of the weights the reader can set
const L = 24;                                  // the fulcrum moves on multiples of 1/L
const TILT_MAX = (8 * Math.PI) / 180;          // largest tilt of the drawing: a drawing choice
const TILT_SCALE = 0.6;                        // moment (in units of f) at which the tilt is tanh(1) of the largest

interface Preset { key: string; de: string; en: string; a: number[]; f: number[]; labels: string[] }
const PRESETS: Preset[] = [
  { key: 'fair', de: 'fairer Würfel', en: 'fair die', a: [4, 4, 4, 4, 4, 4], f: [1, 2, 3, 4, 5, 6], labels: ['1', '2', '3', '4', '5', '6'] },
  { key: 'loaded', de: 'gezinkter Würfel', en: 'loaded die', a: [2, 4, 4, 4, 4, 6], f: [1, 2, 3, 4, 5, 6], labels: ['1', '2', '3', '4', '5', '6'] },
  { key: 'point', de: 'Punktgewicht auf 3', en: 'point weight on 3', a: [0, 0, 24, 0, 0, 0], f: [1, 2, 3, 4, 5, 6], labels: ['1', '2', '3', '4', '5', '6'] },
  { key: 'three', de: 'drei Ergebnisse, f = −1, 0, 1', en: 'three outcomes, f = −1, 0, 1', a: [12, 6, 6], f: [-1, 0, 1], labels: ['1', '2', '3'] },
];

export function mount(stage: HTMLElement, ctx: DemoContext): DemoInstance {
  const plate = new Plate(stage, ctx);
  const T = ctx.text;
  const P = ctx.symbol('sym.probability-weight');
  const E = ctx.symbol('sym.expectation');

  // ── state ─────────────────────────────────────────────────────
  let preset = Math.max(0, PRESETS.findIndex((p) => p.key === (ctx.params.preset ?? 'loaded')));
  let a = PRESETS[preset].a.slice();
  let a0 = a.slice();                          // the weight at the start of a drag
  let f = PRESETS[preset].f;
  let c: Fraction = expectation(a, f);         // the figure: the fulcrum at E[f]
  let sel = a.length - 1;
  let hover: { kind: 'bar'; i: number } | { kind: 'fulcrum' } | null = null;
  let frozenTop: number | null = null;         // the bar scale is kept while a bar is dragged
  let geom = { lo: 0, hi: 1, x0: 0, x1: 1, beamY: 0, hb: 1, top: 1 };

  // Clock: the fulcrum runs back and forth between min f and max f on the lattice (a triangle
  // wave in time); the reader's choice is the position at the current time.
  const cMin = () => frac(Math.min(...f));
  const cMax = () => frac(Math.max(...f));
  const clampC = (q: Fraction) => (fcmp(q, cMin()) < 0 ? cMin() : fcmp(q, cMax()) > 0 ? cMax() : q);
  let now = 0, lastTime = -1, phase = 0;
  const tri = (u: number) => { const r = ((u % 2) + 2) % 2; return r <= 1 ? r : 2 - r; };
  const span = () => L * (Math.max(...f) - Math.min(...f));
  const cAt = () => frac(L * Math.min(...f) + Math.round(tri(phase + now / SWEEP) * span()), L);
  const setC = (q: Fraction) => { c = clampC(q); phase = (toNumber(c) * L - L * Math.min(...f)) / span() - now / SWEEP; };
  setC(c);

  // ── controls ──────────────────────────────────────────────────
  const presets = choice(ctx, PRESETS.map((p) => T(p.de, p.en)), preset, (i) => {
    preset = i; a = PRESETS[i].a.slice(); a0 = a.slice(); f = PRESETS[i].f; setC(expectation(a, f));
    sel = Math.min(sel, a.length - 1); sync(); say();
  });
  const fulcrum = ctx.ui.slider({
    label: T('Lage c des Drehpunkts', 'position c of the fulcrum'),
    labelHtml: T('Drehpunkt ', 'fulcrum ') + '<math><mi>c</mi></math>',
    min: L * Math.min(...PRESETS.flatMap((q) => q.f)), max: L * Math.max(...PRESETS.flatMap((q) => q.f)), step: 1, value: Number(c.num * BigInt(L) / c.den), primary: true,
    format: () => fq(c),
    onInput: (v) => { setC(frac(v, L)); say(); },
  });
  ctx.ui.button(T('Drehpunkt auf 𝔼[f]', 'fulcrum to 𝔼[f]'), () => { setC(expectation(a, f)); sync(); say(); });
  const outcome = ctx.ui.slider({
    label: T('Ergebnis x, dessen Gewicht der nächste Regler setzt', 'outcome x whose weight the next slider sets'),
    labelHtml: '<math><mi>x</mi></math>',
    min: 1, max: 6, step: 1, value: sel + 1,
    format: () => PRESETS[preset].labels[sel],
    onInput: (v) => { sel = Math.min(v, a.length) - 1; a0 = a.slice(); value.set(a[sel]); },
  });
  const value = ctx.ui.slider({
    label: T('Gewicht p(x) des gewählten Ergebnisses, in 24steln', 'weight p(x) of the chosen outcome, in 24ths'),
    labelHtml: `${P.mathml}<math><mo>(</mo><mi>x</mi><mo>)</mo></math>`,
    min: 0, max: D, step: 1, value: a[sel],
    format: (v) => fq(frac(v, D)),
    onInput: (v) => { a = renormalise(a0, sel, v); presets.set(-1); say(); },
  });
  const Ef = bracket(E.mathml, '<mi>f</mi>');
  const outE = ctx.ui.readout(T('Erwartungswert von f', 'expectation value of f'), Ef);
  const outM = ctx.ui.readout(T('Moment um den Drehpunkt', 'moment about the fulcrum'),
    `<math><mrow><munder><mo>∑</mo><mi>x</mi></munder><mi>p</mi><mo>(</mo><mi>x</mi><mo>)</mo><mo>(</mo><mi>f</mi><mo>(</mo><mi>x</mi><mo>)</mo><mo>−</mo><mi>c</mi><mo>)</mo></mrow></math>`);
  const caption = note(ctx);
  const sync = () => {
    fulcrum.set(Math.round(toNumber(c) * L));
    outcome.set(sel + 1);
    value.set(a[sel]);
  };

  const say = () => {
    const m = moment(a, f, c);
    const s = fcmp(m, frac(0));
    ctx.announce(T(
      `Drehpunkt ${fq(c)}, Erwartungswert ${fq(expectation(a, f))}, Moment ${fq(m)}: ${s === 0 ? 'im Gleichgewicht' : s > 0 ? 'kippt nach rechts' : 'kippt nach links'}.`,
      `fulcrum ${fq(c)}, expectation value ${fq(expectation(a, f))}, moment ${fq(m)}: ${s === 0 ? 'balanced' : s > 0 ? 'tips to the right' : 'tips to the left'}.`));
  };

  // ── pointer ───────────────────────────────────────────────────
  const X = (u: number) => geom.x0 + ((u - geom.lo) / (geom.hi - geom.lo)) * (geom.x1 - geom.x0);
  const U = (x: number) => geom.lo + ((x - geom.x0) / (geom.x1 - geom.x0)) * (geom.hi - geom.lo);
  const barAt = (x: number) => {
    const unit = Math.abs(X(1) - X(0));
    let best = -1, bd = Infinity;
    f.forEach((v, i) => { const d = Math.abs(X(v) - x); if (d < bd) { bd = d; best = i; } });
    return bd < Math.min(unit * 0.5, 3 * plate.fs) ? best : -1;
  };
  const valueAt = (y: number) => {
    const top = frozenTop ?? geom.top;
    return Math.max(0, Math.min(D, Math.round(((geom.beamY - y) / geom.hb) * top * D)));
  };
  let mode: 'fulcrum' | 'bar' | null = null;
  const dragging = pointer(plate.svg, {
    down: (x, y) => {
      if (y > geom.beamY + 0.2 * plate.fs) {
        mode = 'fulcrum';
        setC(frac(Math.round(U(x) * L), L));
      } else {
        const i = barAt(x);
        if (i < 0) return false;
        mode = 'bar'; sel = i; a0 = a.slice(); frozenTop = geom.top;
        a = renormalise(a0, sel, valueAt(y));
        presets.set(-1);
      }
      sync(); ctx.invalidate();
      return true;
    },
    move: (x, y) => {
      if (mode === 'fulcrum') {
        const q = clampC(frac(Math.round(U(x) * L), L));
        if (fcmp(q, c) !== 0) { setC(q); sync(); ctx.invalidate(); }
      } else if (mode === 'bar') {
        const v = valueAt(y);
        if (v !== a[sel]) { a = renormalise(a0, sel, v); sync(); ctx.invalidate(); }
      }
    },
    up: () => { mode = null; a0 = a.slice(); frozenTop = null; say(); ctx.invalidate(); },
    hover: (x, y) => {
      let h: typeof hover = null;
      if (y > geom.beamY + 0.2 * plate.fs && y < geom.beamY + 3 * plate.fs && Math.abs(x - X(toNumber(c))) < 1.5 * plate.fs) h = { kind: 'fulcrum' };
      else if (y <= geom.beamY + 0.2 * plate.fs && y > geom.beamY - geom.hb - 2 * plate.fs) { const i = barAt(x); if (i >= 0) h = { kind: 'bar', i }; }
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
    const pr = PRESETS[preset];
    const p = weights(a);
    const pv = p.map(toNumber);
    const ex = expectation(a, f);
    const m = moment(a, f, c);
    const sgn = fcmp(m, frac(0));
    const fmin = Math.min(...f), fmax = Math.max(...f);

    const lo = fmin - 0.85, hi = fmax + 0.85;
    const x0 = 1.2 * fs, x1 = W - 1.2 * fs;
    const beamY = H * 0.56;
    const hb = beamY - 4.7 * fs;
    const maxp = Math.max(...pv);
    const top = frozenTop ?? (maxp <= 1 / 3 ? 1 / 3 : maxp <= 2 / 3 ? 2 / 3 : 1);
    geom = { lo, hi, x0, x1, beamY, hb, top };
    const unit = Math.abs(X(1) - X(0));

    // tilt (drawing choice, header): zero exactly when the moment is zero
    const theta = sgn === 0 ? 0 : TILT_MAX * Math.tanh(toNumber(m) / TILT_SCALE);
    const px = X(toNumber(c)), py = beamY;
    const rot = (x: number, y: number): [number, number] => {
      const dx = x - px, dy = y - py;
      return [px + dx * Math.cos(theta) - dy * Math.sin(theta), py + dx * Math.sin(theta) + dy * Math.cos(theta)];
    };

    // the beam
    const th = 0.36 * fs;
    const bl = X(lo + 0.25), br = X(hi - 0.25);
    plate.path('beam', [rot(bl, py - th), rot(br, py - th), rot(br, py), rot(bl, py)], { fill: ink, stroke: ink, 'stroke-width': k.stroke('thin'), 'stroke-linejoin': 'round' }, 'data', true);

    // the masses: bars of height p(x) standing on the beam at f(x)
    const bw = Math.min(unit * 0.5, 3.2 * fs);
    for (let i = 0; i < a.length; i++) {
      const cx = X(f[i]);
      const h = (pv[i] / top) * hb;
      const yb = py - th;
      const on = i === sel || (hover?.kind === 'bar' && hover.i === i);
      plate.path(`bar-${i}`, [rot(cx - bw / 2, yb), rot(cx + bw / 2, yb), rot(cx + bw / 2, yb - h), rot(cx - bw / 2, yb - h)], {
        fill: state, 'fill-opacity': on ? 0.32 : 0.16, stroke: state, 'stroke-width': k.stroke(on ? 'dynamics' : 'state'), 'stroke-linejoin': 'round',
      }, 'data', true);
      const [gx, gy] = rot(cx, yb - h);
      plate.line(`grip-${i}`, ...rot(cx - bw * 0.3, yb - h), ...rot(cx + bw * 0.3, yb - h), state, k.stroke('dynamics') * 1.6, { 'stroke-linecap': 'round' }, 'handles');
      plate.fraction(`val-${i}`, gx, gy - 1.2 * fs, p[i], { size: fs * 0.92, fill: pv[i] === 0 ? muted : ink });
      if (pr.labels.some((l, j) => l !== String(f[j]))) {      // name the outcome where f(x) differs from x
        const inside = h > 1.6 * fs;                         // inside the bar at its foot, or above its value
        const [lx, ly] = inside ? rot(cx, yb - 0.75 * fs) : rot(cx, yb - h - 2.6 * fs);
        plate.text(`lab-${i}`, lx, ly, `${it('x')} = ${pr.labels[i]}`, { size: fs * 0.85, fill: inside ? ink : muted, baseline: 'middle', math: true });
      }
    }

    // the fulcrum at c, on a short ground
    const fh = 1.5 * fs;
    const onF = hover?.kind === 'fulcrum' || mode === 'fulcrum';
    plate.path('fulcrum', [[px, py], [px - 0.75 * fh, py + fh], [px + 0.75 * fh, py + fh]], {
      fill: k.color('plate'), stroke: ink, 'stroke-width': k.stroke(onF ? 'dynamics' : 'regular'), 'stroke-linejoin': 'round', class: 'c01-grab',
    }, 'marks', true);
    plate.line('ground', px - 1.4 * fh, py + fh, px + 1.4 * fh, py + fh, ink, k.stroke('regular'), {}, 'marks');
    plate.rect('ground-hatch', px - 1.4 * fh, py + fh, 2.8 * fh, 0.45 * fs, { fill: plate.hatchFill }, 'grid');
    const cl = plate.text('c-lab', px + 1.4 * fh + 0.4 * fs, py + fh - 0.1 * fs, `${it('c')} =`, { size: fs * 0.95, anchor: 'start', baseline: 'middle', math: true });
    plate.fraction('c-val', px + 1.4 * fh + 0.75 * fs + cl.getComputedTextLength(), py + fh - 0.1 * fs, c, { size: fs * 0.9, anchor: 'start' });

    // the number line of the values f(x): E[f] lies between min f and max f
    const ny = H - 3.3 * fs;
    plate.line('nl', X(lo + 0.25), ny, X(hi - 0.25), ny, ink, k.stroke('thin'));
    for (let u = Math.ceil(lo + 0.25); u <= hi - 0.25; u++) {
      plate.line(`nl-t-${u}`, X(u), ny - 0.3 * fs, X(u), ny + 0.3 * fs, ink, k.stroke('thin'));
      plate.text(`nl-l-${u}`, X(u), ny + 1.35 * fs, String(u).replace('-', '−'), { size: fs * 0.9, fill: muted });
    }
    plate.line('range', X(fmin), ny, X(fmax), ny, effect, k.stroke('effect') * 1.8, { 'stroke-linecap': 'butt' }, 'marks');
    for (const [key, u] of [['rmin', fmin], ['rmax', fmax]] as const) plate.line(key, X(u), ny - 0.45 * fs, X(u), ny + 0.2 * fs, effect, k.stroke('effect'), {}, 'marks');
    plate.text('rmin-l', X(fmin), ny - 0.95 * fs, `min ${it('f')}`, { size: fs * 0.9, fill: effect, anchor: 'middle', math: true });
    plate.text('rmax-l', X(fmax), ny - 0.95 * fs, `max ${it('f')}`, { size: fs * 0.9, fill: effect, anchor: 'middle', math: true });
    // E[f]: dashed (it belongs to the measurement), from the number line up to the beam
    plate.line('e-line', X(toNumber(ex)), ny, X(toNumber(ex)), py + (X(toNumber(ex)) - px) * Math.tan(theta), effect, k.stroke('effect'), { 'stroke-dasharray': k.dash('effect').join(' ') }, 'marks');
    plate.circle('e-dot', X(toNumber(ex)), ny, 0.32 * fs, { fill: effect }, 'marks');
    plate.text('e-lab', X(toNumber(ex)) - 0.15 * fs, ny + 2.3 * fs, `${E.unicode}[${it('f')}] =`, { anchor: 'end', fill: effect, baseline: 'middle', math: true });
    plate.fraction('e-val', X(toNumber(ex)) + 0.15 * fs, ny + 2.3 * fs, ex, { anchor: 'start', fill: effect });

    // status in words
    const status = sgn === 0 ? T('im Gleichgewicht:', 'balanced:') : sgn > 0 ? T('rechts schwerer:', 'heavier on the right:') : T('links schwerer:', 'heavier on the left:');
    const rel = `${it('c')} ${sgn === 0 ? '=' : sgn > 0 ? '<' : '>'} ${E.unicode}[${it('f')}]`;
    const sm = plate.text('status-m', W - 0.8 * fs, 1.3 * fs, rel, { anchor: 'end', math: true, weight: sgn === 0 ? '600' : 'normal' });
    plate.text('status', W - 1.2 * fs - sm.getComputedTextLength(), 1.3 * fs, status, { anchor: 'end', weight: sgn === 0 ? '600' : 'normal' });
    const mw = plate.fraction('moment', W - 0.8 * fs, 3.0 * fs, m, { anchor: 'end' });
    plate.text('moment-l', W - 0.8 * fs - mw - 0.3 * fs, 3.0 * fs, `∑ ${it(P.unicode)}(${it('x')}) (${it('f')}(${it('x')}) − ${it('c')}) =`, { anchor: 'end', baseline: 'middle', math: true });

    if (hover?.kind === 'bar') {
      const i = hover.i;
      const [hx, hy] = rot(X(f[i]), py - th - (pv[i] / top) * hb);
      plate.tip(hx, hy, [`x = ${pr.labels[i]}:  ${P.unicode}(x) = ${fq(p[i])},  f(x) = ${String(f[i]).replace('-', '−')}`]);
    } else if (hover?.kind === 'fulcrum') {
      plate.tip(px, py + fh, [`c = ${fq(c)}`, `${E.unicode}[f] − c = ${fq(m)}`]);
    }
    plate.end();

    outE.set(`= ${fq(ex)}`);
    outM.set(`= ${fq(m)}`);
    caption.innerHTML = T(
      `Ziehen Sie den Drehpunkt oder die Oberkante eines Balkens. Das Moment um den Drehpunkt ist ${Ef}<math><mo>−</mo><mi>c</mi></math>; der Balken ist genau dann im Gleichgewicht, wenn ${'<math><mi>c</mi><mo>=</mo></math>'}${Ef} ist, hier ${mq(ex)}. Der Erwartungswert liegt immer zwischen dem kleinsten und dem größten Messwert. Abspielen führt den Drehpunkt zwischen dem kleinsten und dem größten Wert hin und her. Die Stärke der Neigung ist eine Zeichenwahl.`,
      `Drag the fulcrum or the top of a bar. The moment about the fulcrum is ${Ef}<math><mo>−</mo><mi>c</mi></math>; the beam is balanced exactly when ${'<math><mi>c</mi><mo>=</mo></math>'}${Ef}, here ${mq(ex)}. The expectation value always lies between the smallest and the largest value. Play moves the fulcrum back and forth between the smallest and the largest value. How far the beam tilts is a drawing choice.`);
  };

  return {
    render(_frame, time) {
      const clock = time !== lastTime && lastTime >= 0;
      lastTime = time; now = time;
      if (!dragging()) c = cAt();
      fulcrum.set(Math.round(toNumber(c) * L));
      paint(!ctx.deterministic && !ctx.reducedMotion && !dragging() && !clock);
    },
    destroy() { plate.svg.remove(); },
    info: () => ({ preset: PRESETS[preset].key, weight: a.join(','), fulcrum: fq(c), expectation: fq(expectation(a, f)), moment: fq(moment(a, f, c)) }),
  };
}
