// c01.demo.mischung: a weight that is not a point weight is a proper mixture (figure
// c01.fig.mischung, the construction c01.eq.echte-mischung in the proof of proposition
// c01.prop.punktgewicht, and the mixture c01.eq.mischung).
//
// For a weight p on X = {1, ..., 6} and two outcomes a != b with p(a) > 0 and p(b) > 0, with
// eps = min(p(a), p(b)),
//   q = p + eps (p_a - p_b),   r = p - eps (p_a - p_b),   p = q/2 + r/2.
// The left panel shows the mixture m = lambda q + (1 - lambda) r; the reader moves lambda (slider,
// or the point on the segment from q to r below) and sees m slide from r (lambda = 0) to q
// (lambda = 1) through p (lambda = 1/2, outlined). Clicking a bar of q chooses a (the outcome q
// gains), clicking a bar of r chooses b. For a point weight there are no two such outcomes:
// then q = r = p, as part 4 of the proposition says.
// Default (the figure): the loaded die p = (1, 2, 2, 2, 2, 3)/12, a = 6, b = 1, eps = 1/12,
// lambda = 1/2; then q = (0, 2, 2, 2, 2, 4)/12 and r is the fair die.
//
// Every number shown is computed by web/src/kernels/prob.ts (properSplit, mixture, weights,
// pointWeightIndex) as an exact fraction; lambda is a multiple of 1/24 set by the reader.
// Clock: lambda runs back and forth (a triangle wave); nothing else depends on time.
// Parameters: preset = loaded | fair | two | point, a, b (outcomes 1..6), lambda (numerator over 24).
import type { DemoContext, DemoInstance, DemoMeta } from '../demo/types';
import { fcmp, frac, mixture, pointWeightIndex, properSplit, weights, type Fraction } from '../kernels/prob';
import { Plate, choice, fq, it, mq, note, pointer } from './c01/kit';

export const meta: DemoMeta = { animated: true, aspect: 1.65, surface: 'plate' };

const K = 24;                 // lambda is a multiple of 1/K
const SWEEP = 5;              // seconds for lambda to run from 0 to 1 while the clock runs: a drawing choice
const LABELS = ['1', '2', '3', '4', '5', '6'];
const PRESETS = [
  { key: 'loaded', de: 'gezinkter Würfel', en: 'loaded die', a: [1, 2, 2, 2, 2, 3] },
  { key: 'fair', de: 'fairer Würfel', en: 'fair die', a: [1, 1, 1, 1, 1, 1] },
  { key: 'two', de: 'je ½ auf 3 und 4', en: '½ each on 3 and 4', a: [0, 0, 1, 1, 0, 0] },
  { key: 'point', de: 'Punktgewicht auf 3', en: 'point weight on 3', a: [0, 0, 1, 0, 0, 0] },
];

export function mount(stage: HTMLElement, ctx: DemoContext): DemoInstance {
  const plate = new Plate(stage, ctx);
  const T = ctx.text;
  const Psym = ctx.symbol('sym.probability-weight');
  const pName = Psym.unicode;

  // ── state ─────────────────────────────────────────────────────
  let preset = Math.max(0, PRESETS.findIndex((p) => p.key === (ctx.params.preset ?? 'loaded')));
  let A = Math.min(6, Math.max(1, Number(ctx.params.a ?? '6'))) - 1;        // index of a
  let B = Math.min(6, Math.max(1, Number(ctx.params.b ?? '1'))) - 1;        // index of b
  let phase = Math.min(K, Math.max(0, Number(ctx.params.lambda ?? String(K / 2)))) / K;   // lambda at time 0
  let now = 0;
  let lastTime = -1;
  let hover: { panel: 'q' | 'r' | 'm'; i: number } | null = null;
  const tri = (u: number) => { const r = ((u % 2) + 2) % 2; return r <= 1 ? r : 2 - r; };
  const lambdaK = () => Math.round(tri(phase + now / SWEEP) * K);
  const setLambda = (k: number) => { phase = k / K - now / SWEEP; };

  const split = () => {
    const a = PRESETS[preset].a;
    if (A !== B && a[A] > 0 && a[B] > 0) { const s = properSplit(a, A, B); return { ok: true as const, q: s.q, r: s.r, eps: s.eps }; }
    return { ok: false as const, q: a.slice(), r: a.slice(), eps: frac(0) };
  };

  // ── controls ──────────────────────────────────────────────────
  choice(ctx, PRESETS.map((p) => T(p.de, p.en)), preset, (i) => {
    preset = i;
    // keep a and b where they are allowed, otherwise take the outcomes of largest and smallest positive weight
    const a = PRESETS[i].a;
    if (!(a[A] > 0 && a[B] > 0 && A !== B)) {
      const pos = a.map((x, j) => (x > 0 ? j : -1)).filter((j) => j >= 0);
      if (pos.length >= 2) { A = pos[pos.length - 1]; B = pos[0]; }
    }
    sA.set(A + 1); sB.set(B + 1); say();
  });
  const lam = ctx.ui.slider({
    label: T('Mischungsgewicht lambda', 'mixing weight lambda'), labelHtml: '<math><mi>λ</mi></math>',
    min: 0, max: K, step: 1, value: lambdaK(), primary: true, format: (v) => fq(frac(v, K)),
    onInput: (v) => { setLambda(v); say(); },
  });
  const sA = ctx.ui.slider({
    label: T('Ergebnis a, zu dem eps verschoben wird', 'outcome a to which eps is moved'), labelHtml: '<math><mi>a</mi></math>',
    min: 1, max: 6, step: 1, value: A + 1, onInput: (v) => { A = v - 1; say(); },
  });
  const sB = ctx.ui.slider({
    label: T('Ergebnis b, von dem eps weggenommen wird', 'outcome b from which eps is taken'), labelHtml: '<math><mi>b</mi></math>',
    min: 1, max: 6, step: 1, value: B + 1, onInput: (v) => { B = v - 1; say(); },
  });
  const outEps = ctx.ui.readout(T('epsilon = min(p(a), p(b))', 'epsilon = min(p(a), p(b))'), '<math><mi>ε</mi><mo>=</mo></math>');
  const caption = note(ctx);
  const say = () => {
    const s = split();
    ctx.announce(s.ok
      ? T(`a = ${A + 1}, b = ${B + 1}, ε = ${fq(s.eps)}, λ = ${fq(frac(lambdaK(), K))}`, `a = ${A + 1}, b = ${B + 1}, ε = ${fq(s.eps)}, λ = ${fq(frac(lambdaK(), K))}`)
      : T('Keine zwei Ergebnisse mit positivem Gewicht gewählt: q = r = p.', 'No two outcomes of positive weight chosen: q = r = p.'));
  };

  // ── geometry and pointer ──────────────────────────────────────
  interface Panel { x0: number; x1: number; slot: number }
  let G = { panels: {} as Record<'m' | 'q' | 'r', Panel>, y0: 0, y1: 0, top: 1, sx0: 0, sx1: 0, sy: 0 };
  const panelAt = (x: number, y: number): { panel: 'q' | 'r' | 'm'; i: number } | null => {
    if (y < G.y1 - 1.5 * plate.fs || y > G.y0 + 2 * plate.fs) return null;
    for (const key of ['m', 'q', 'r'] as const) {
      const p = G.panels[key];
      if (p && x >= p.x0 && x <= p.x1) { const i = Math.floor((x - p.x0) / p.slot); if (i >= 0 && i < 6) return { panel: key, i }; }
    }
    return null;
  };
  const kAt = (x: number) => Math.max(0, Math.min(K, Math.round(K * (1 - (x - G.sx0) / (G.sx1 - G.sx0)))));
  const dragging = pointer(plate.svg, {
    down: (x, y) => {
      if (Math.abs(y - G.sy) < 1.6 * plate.fs && x > G.sx0 - plate.fs && x < G.sx1 + plate.fs) { setLambda(kAt(x)); ctx.invalidate(); return true; }
      const h = panelAt(x, y);
      if (h && (h.panel === 'q' || h.panel === 'r')) {
        const a = PRESETS[preset].a;
        if (a[h.i] > 0) {
          if (h.panel === 'q') { if (h.i === B) B = A; A = h.i; } else { if (h.i === A) A = B; B = h.i; }
          sA.set(A + 1); sB.set(B + 1); say(); ctx.invalidate();
        } else ctx.announce(T(`${pName}(${h.i + 1}) = 0: dieses Ergebnis kann nicht a oder b sein.`, `${pName}(${h.i + 1}) = 0: this outcome cannot be a or b.`));
      }
      return false;
    },
    move: (x) => { const k = kAt(x); if (k !== lambdaK()) { setLambda(k); ctx.invalidate(); } },
    up: () => { say(); ctx.invalidate(); },
    hover: (x, y) => { const h = panelAt(x, y); if (JSON.stringify(h) !== JSON.stringify(hover)) { hover = h; ctx.invalidate(); } },
    leave: () => { if (hover) { hover = null; ctx.invalidate(); } },
  });

  // ── drawing ───────────────────────────────────────────────────
  const paint = (ease: boolean) => {
    const fs = plate.begin(ease);
    const k = ctx.tokens;
    const { W, H } = plate;
    const ink = k.color('plate-ink'), muted = k.color('plate-muted'), rule = k.color('plate-rule'), state = k.color('state');
    const base = PRESETS[preset].a;
    const s = split();
    const lk = lambdaK();
    const lambda = frac(lk, K);
    const m = mixture(s.q, s.r, lk, K);
    const pw = weights(base), qw = weights(s.q), rw = weights(s.r), mw = weights(m);
    const isP = mw.every((x, i) => fcmp(x, pw[i]) === 0);
    const vals = [...pw, ...qw, ...rw].map((x) => Number(x.num) / Number(x.den));
    const top = Math.max(1 / 3, ...vals) * 1.08;

    // three panels in the order of the equation m = lambda q + (1 - lambda) r
    const y1 = 2.7 * fs, y0 = H * 0.66;
    const gap = 3.6 * fs, xL = 2.8 * fs, xR = W - 0.6 * fs;
    const pwid = (xR - xL - 2 * gap) / 3;
    const Y = (v: number) => y0 - (v / top) * (y0 - y1);
    const panels: Record<'m' | 'q' | 'r', Panel> = {
      m: { x0: xL, x1: xL + pwid, slot: pwid / 6 },
      q: { x0: xL + pwid + gap, x1: xL + 2 * pwid + gap, slot: pwid / 6 },
      r: { x0: xL + 2 * pwid + 2 * gap, x1: xR, slot: pwid / 6 },
    };
    // grid marks of the figure: 1/12, 1/6, 1/3 (and 1 when a value reaches it)
    // marks closer than 1.6 label heights to the one below are left out
    const marks: Fraction[] = [];
    for (const q of [frac(1, 12), frac(1, 6), frac(1, 3), ...(top > 1 ? [frac(1)] : top > 0.55 ? [frac(1, 2)] : [])]) {
      const prev = marks.length ? Number(marks[marks.length - 1].num) / Number(marks[marks.length - 1].den) : 0;
      if (Y(prev) - Y(Number(q.num) / Number(q.den)) >= 1.6 * fs) marks.push(q);
    }
    for (const q of marks) {
      const v = Number(q.num) / Number(q.den);
      for (const key of ['m', 'q', 'r'] as const) plate.line(`grid-${key}-${fq(q)}`, panels[key].x0, Y(v), panels[key].x1, Y(v), rule, k.stroke('hair'));
      plate.fraction(`tick-${fq(q)}`, xL - 0.45 * fs, Y(v), q, { anchor: 'end', fill: muted, size: fs * 0.85 });
    }
    plate.text('tick-0', xL - 0.45 * fs, Y(0), '0', { anchor: 'end', fill: muted, baseline: 'middle', size: fs * 0.9 });
    const draw = (key: 'm' | 'q' | 'r', w: Fraction[], name: string) => {
      const P = panels[key];
      plate.line(`axis-${key}`, P.x0, y0, P.x1, y0, ink, k.stroke('thin'));
      const bw = P.slot * 0.6;
      for (let i = 0; i < 6; i++) {
        const cx = P.x0 + (i + 0.5) * P.slot;
        const v = Number(w[i].num) / Number(w[i].den);
        const changed = fcmp(w[i], pw[i]) !== 0;
        const on = hover?.panel === key && hover.i === i;
        plate.rect(`bar-${key}-${i}`, cx - bw / 2, Y(v), bw, y0 - Y(v), {
          fill: changed && key !== 'm' ? plate.hatchFill : state, 'fill-opacity': changed && key !== 'm' ? 1 : on ? 0.3 : 0.16,
          stroke: state, 'stroke-width': k.stroke(on ? 'dynamics' : 'state'),
        });
        const role = key === 'q' && i === A && s.ok ? 'a' : key === 'r' && i === B && s.ok ? 'b' : '';
        plate.text(`lab-${key}-${i}`, cx, y0 + 1.25 * fs, LABELS[i], { size: fs * 0.9, weight: role ? '600' : 'normal' });
        plate.text(`role-${key}-${i}`, cx, y0 + 2.45 * fs, it(role), { size: fs * 1.05, fill: role ? ink : 'transparent', math: true });
        if (key !== 'm') plate.rect(`hit-${key}-${i}`, P.x0 + i * P.slot, y1 - fs, P.slot, y0 - y1 + 3 * fs, { fill: 'transparent', class: 'c01-hit' }, 'handles', false);
      }
      plate.text(`name-${key}`, (P.x0 + P.x1) / 2, y1 - 1.25 * fs, name, { math: true, size: fs * 1.12 });
    };
    draw('m', mw, isP ? `${it('λq')} + (1 − ${it('λ')})${it('r')} = ${it(pName)}` : `${it('λq')} + (1 − ${it('λ')})${it('r')}`);
    draw('q', qw, it('q'));
    draw('r', rw, it('r'));
    // p as a thin outline over the mixture panel: m meets it at lambda = 1/2
    {
      const P = panels.m, bw = P.slot * 0.6;
      for (let i = 0; i < 6; i++) {
        const cx = P.x0 + (i + 0.5) * P.slot, v = Number(pw[i].num) / Number(pw[i].den);
        plate.line(`ghost-${i}`, cx - bw * 0.72, Y(v), cx + bw * 0.72, Y(v), ink, k.stroke('regular'), { 'stroke-dasharray': '2 2' }, 'marks');
      }
    }
    const mid = (y0 + y1) / 2;
    plate.text('op-eq', panels.m.x1 + gap * 0.22, mid, '=', { math: true, size: fs * 1.3, baseline: 'middle' });
    plate.fraction('op-l', panels.q.x0 - gap * 0.36, mid, lambda, { size: fs * 1.05 });
    plate.text('op-plus', panels.q.x1 + gap * 0.2, mid, '+', { math: true, size: fs * 1.3, baseline: 'middle' });
    plate.fraction('op-1l', panels.r.x0 - gap * 0.36, mid, frac(K - lk, K), { size: fs * 1.05 });
    G = { panels, y0, y1, top, sx0: 0, sx1: 0, sy: 0 };

    // the segment from q to r with the mixture on it
    const narrow = W < 480;
    const sy = H - 2.0 * fs, sx0 = W * (narrow ? 0.12 : 0.2), sx1 = W * (narrow ? 0.88 : 0.8);
    G.sx0 = sx0; G.sx1 = sx1; G.sy = sy;
    plate.line('seg', sx0, sy, sx1, sy, state, k.stroke('state'), {}, 'data');
    plate.line('seg-half', (sx0 + sx1) / 2, sy - 0.55 * fs, (sx0 + sx1) / 2, sy + 0.55 * fs, ink, k.stroke('thin'), {}, 'data');
    plate.text('seg-p', (sx0 + sx1) / 2, sy + 1.45 * fs, s.ok ? `${it(pName)}  (${it('λ')} = ½)` : '', { size: fs, fill: muted, math: true });
    plate.circle('seg-q', sx0, sy, 0.3 * fs, { fill: state }, 'marks');
    plate.circle('seg-r', sx1, sy, 0.3 * fs, { fill: state }, 'marks');
    plate.text('seg-qn', sx0 - 0.9 * fs, sy, it('q'), { math: true, anchor: 'end', baseline: 'middle', size: fs * 1.15 });
    plate.text('seg-rn', sx1 + 0.9 * fs, sy, it('r'), { math: true, anchor: 'start', baseline: 'middle', size: fs * 1.15 });
    const mx = sx0 + (1 - lk / K) * (sx1 - sx0);
    plate.circle('seg-m', mx, sy, 0.48 * fs, { fill: k.color('plate'), stroke: state, 'stroke-width': k.stroke('state'), class: 'c01-grab' }, 'handles');
    plate.fraction('seg-l', mx, sy - 1.55 * fs, lambda, { prefix: `${it('λ')} = `, size: fs * 0.95 });
    if (!narrow) plate.text('seg-name', W * 0.04, sy, T('Mischung:', 'mixture:'), { anchor: 'start', baseline: 'middle', fill: muted, size: fs * 0.9 });

    if (hover) {
      const h = hover;
      const w = h.panel === 'm' ? mw : h.panel === 'q' ? qw : rw;
      const P = panels[h.panel];
      const v = Number(w[h.i].num) / Number(w[h.i].den);
      const nm = h.panel === 'm' ? 'm' : h.panel;
      const lines = [`${nm}(${LABELS[h.i]}) = ${fq(w[h.i])}`, `${pName}(${LABELS[h.i]}) = ${fq(pw[h.i])}`];
      if (h.panel !== 'm') lines.push(PRESETS[preset].a[h.i] > 0 ? T(`Klick: ${h.panel === 'q' ? 'a' : 'b'} = ${LABELS[h.i]}`, `click: ${h.panel === 'q' ? 'a' : 'b'} = ${LABELS[h.i]}`) : T('Gewicht 0: nicht wählbar', 'weight 0: not selectable'));
      plate.tip(P.x0 + (h.i + 0.5) * P.slot, Y(v), lines);
    }
    plate.end();

    outEps.set(s.ok ? fq(s.eps) : '—');
    const point = pointWeightIndex(base);
    caption.innerHTML = !s.ok
      ? (point >= 0
        ? T(`${Psym.mathml} ist das Punktgewicht auf ${point + 1}: Es gibt keine zwei Ergebnisse mit positivem Gewicht, und aus ${Psym.mathml} = λq + (1−λ)r mit 0 &lt; λ &lt; 1 folgt q = r = ${Psym.mathml} (Proposition, Teil 4). ${Psym.mathml} ist keine echte Mischung.`,
          `${Psym.mathml} is the point weight on ${point + 1}: there are no two outcomes of positive weight, and ${Psym.mathml} = λq + (1−λ)r with 0 &lt; λ &lt; 1 forces q = r = ${Psym.mathml} (proposition, part 4). ${Psym.mathml} is not a proper mixture.`)
        : T('Wählen Sie zwei verschiedene Ergebnisse a und b mit positivem Gewicht.', 'Choose two different outcomes a and b of positive weight.'))
      : T(`ε = min(${pName}(${A + 1}), ${pName}(${B + 1})) = ${mq(s.eps)}. q nimmt ε von ${B + 1} nach ${A + 1}, r von ${A + 1} nach ${B + 1} (schraffiert). Beide sind Gewichte, q ≠ r, und bei λ = ½ ist die Mischung genau ${Psym.mathml} (gepunktete Striche): ${Psym.mathml} ist eine echte Mischung, also kein Punktgewicht.${isP ? '' : ` Jetzt: λ = ${mq(lambda)}.`}`,
        `ε = min(${pName}(${A + 1}), ${pName}(${B + 1})) = ${mq(s.eps)}. q moves ε from ${B + 1} to ${A + 1}, r from ${A + 1} to ${B + 1} (hatched). Both are weights, q ≠ r, and at λ = ½ the mixture is exactly ${Psym.mathml} (dotted marks): ${Psym.mathml} is a proper mixture, hence not a point weight.${isP ? '' : ` Now: λ = ${mq(lambda)}.`}`);
  };

  return {
    render(_frame, time) {
      const clock = time !== lastTime && lastTime >= 0;
      lastTime = time; now = time;
      lam.set(lambdaK());
      paint(!ctx.deterministic && !ctx.reducedMotion && !dragging() && !clock);
    },
    destroy() { plate.svg.remove(); },
    info: () => { const s = split(); return { preset: PRESETS[preset].key, a: A + 1, b: B + 1, lambda: `${lambdaK()}/${K}`, q: s.q.join(','), r: s.r.join(','), proper: s.ok }; },
  };
}
