// c01.demo.indikator: a yes-no measurement and its expectation value (figure
// c01.fig.indikator, c01.eq.indikator-def, c01.eq.indikator). (a) The indicator function
// chi_S of an event S, dashed like every measurement. (b) The weight p(x) (outlines) and the
// products p(x) chi_S(x) (hatched): chi_S keeps only the bars over S, and their heights add
// up to E[chi_S] = P[S]. The reader clicks outcomes to put them into S or take them out.
//
// Weights: the loaded die of c01.eq.gezinkt (default, with S = {2, 4, 6} as in the figure),
// the fair die, and the experiment with three outcomes of c01.ex.drei-ergebnisse,
// p = (1/2, 1/4, 1/4). For the latter the demo also shows table c01.tab.ereignisse: all
// 2^3 = 8 events with chi_S(1), chi_S(2), chi_S(3) and P[S] = E[chi_S]; a click on a row
// selects that event. "Komplement" replaces S by X \ S: chi_{X\S} = 1 - chi_S and
// P[X\S] = 1 - P[S] (c01.eq.indikator-regeln, c01.prop.wahrscheinlichkeit).
//
// Every number shown is computed by web/src/kernels/prob.ts (indicator, indicatorTerms,
// probability, expectation, allEvents, weights) or is an input (the integer numerators of
// a weight over its denominator). Parameters: preset = loaded | fair | three.
import type { DemoContext, DemoInstance, DemoMeta } from '../demo/types';
import { allEvents, expectation, indicator, indicatorTerms, probability, weights, type Fraction } from '../kernels/prob';
import { Plate, choice, fq, it, mq, note, pointer, type TextOpts } from './c01/kit';
import { rich, type Seg } from './c01/segments';

/** a word in the label face, or [symbols, 'm'] set in math italic, or [symbol, 's'] as a subscript */
type Part = string | [string, 'm' | 's'];

export const meta: DemoMeta = { animated: true, aspect: 1.75, surface: 'plate' };

const STEP = 1.2;   // seconds per event while the clock runs: a presentation choice

interface Preset { key: string; de: string; en: string; a: number[]; labels: string[]; S: number[]; common: boolean }
// common: the sum is written over the denominator of the numerators, as in the figure (2/12 + 2/12 + 3/12)
const PRESETS: Preset[] = [
  { key: 'loaded', de: 'gezinkter Würfel', en: 'loaded die', a: [1, 2, 2, 2, 2, 3], labels: ['1', '2', '3', '4', '5', '6'], S: [1, 3, 5], common: true },
  { key: 'fair', de: 'fairer Würfel', en: 'fair die', a: [1, 1, 1, 1, 1, 1], labels: ['1', '2', '3', '4', '5', '6'], S: [1, 3, 5], common: true },
  { key: 'three', de: 'drei Ergebnisse', en: 'three outcomes', a: [2, 1, 1], labels: ['1', '2', '3'], S: [1, 2], common: false },
];

export function mount(stage: HTMLElement, ctx: DemoContext): DemoInstance {
  const plate = new Plate(stage, ctx);
  const T = ctx.text;
  const P = ctx.symbol('sym.probability-weight'), Pr = ctx.symbol('sym.probability'), E = ctx.symbol('sym.expectation');
  const CHI = ctx.symbol('sym.indicator');
  const chi = CHI.unicode.charAt(0);

  // ── state ─────────────────────────────────────────────────────
  let pi = Math.max(0, PRESETS.findIndex((p) => p.key === (ctx.params.preset ?? 'loaded')));
  const events = PRESETS.map((p) => new Set(p.S));       // the event of each weight, kept when switching
  let lastStep = 0;                                        // clock step of the last render
  let hover = -1;                                          // hovered outcome (index)
  let hoverRow = -1;                                       // hovered table row
  let geom = { cols: [] as Array<[number, number]>, top: 0, bottom: 0, rows: [] as Array<[number, number]>, tx0: 0, tx1: 0 };

  const pre = () => PRESETS[pi];
  const S = () => [...events[pi]].sort((p, q) => p - q);
  const setS = (s: number[]) => { events[pi] = new Set(s); mark(); };
  const toggle = (i: number) => { const n = new Set(events[pi]); if (n.has(i)) n.delete(i); else n.add(i); events[pi] = n; mark(); };
  const setText = (s: number[]) => (s.length === 0 ? '∅' : `{${s.map((i) => pre().labels[i]).join(', ')}}`);

  // ── controls ──────────────────────────────────────────────────
  choice(ctx, PRESETS.map((p) => T(p.de, p.en)), pi, (i) => { pi = i; hover = -1; hoverRow = -1; mark(); say(); });
  // all events in the order of table c01.tab.ereignisse (kernel allEvents): the keyboard way through them
  const eventIndex = () => { const cur = S().join(','); return allEvents(pre().a.length).findIndex((e) => e.join(',') === cur); };
  const evSlider = ctx.ui.slider({
    label: T('Ereignis S, alle Teilmengen der Reihe nach', 'event S, all subsets in turn'), labelHtml: '<math><mi>S</mi></math>',
    min: 0, max: 63, step: 1, value: 0, primary: true,
    format: () => setText(S()),
    onInput: (v) => { const all = allEvents(pre().a.length); setS(all[Math.min(v, all.length - 1)]); say(); },
  });
  const toggles = [0, 1, 2, 3, 4, 5].map((i) => {
    const b = ctx.ui.button('', () => { toggle(i); say(); });
    return b;
  });
  // the slider's range follows the outcome set (2^n events); SliderSpec has a fixed max, so the input is adjusted
  const evInput = [...(stage.parentElement?.querySelectorAll('.tpcd-controls input[type=range]') ?? [])].pop() as HTMLInputElement | undefined;
  const mark = () => { if (evInput) evInput.max = String(2 ** pre().a.length - 1); evSlider.set(eventIndex()); markButtons(); };
  const markButtons = () => toggles.forEach((b, i) => {
    const shown = i < pre().a.length;
    b.style.display = shown ? '' : 'none';
    const on = events[pi].has(i);
    b.setAttribute('aria-pressed', String(on));
    b.setAttribute('aria-label', T(`Ergebnis ${i + 1} in S`, `outcome ${i + 1} in S`));
    b.classList.toggle('c01-pressed', on);
    b.textContent = `${on ? '■' : '□'} ${i + 1}`;
  });
  mark();
  ctx.ui.button(T('Komplement X∖S', 'complement X∖S'), () => {
    const s = events[pi];
    setS(pre().a.map((_, i) => i).filter((i) => !s.has(i)));
    say();
  });
  const chiS = `<math><msub><mi>χ</mi><mi>S</mi></msub></math>`;
  const outP = ctx.ui.readout(T('Erwartungswert der Indikatorfunktion gleich Wahrscheinlichkeit von S', 'expectation value of the indicator function equals the probability of S'),
    `${E.mathml}<math><mo>[</mo></math>${chiS}<math><mo>]</mo><mo>=</mo></math>${Pr.mathml}<math><mo>[</mo><mi>S</mi><mo>]</mo></math>`);
  const outC = ctx.ui.readout(T('Wahrscheinlichkeit des Komplements', 'probability of the complement'),
    `${Pr.mathml}<math><mo>[</mo><mi>X</mi><mo>∖</mo><mi>S</mi><mo>]</mo></math>`);
  const caption = note(ctx);

  const say = () => {
    const p = probability(pre().a, S());
    ctx.announce(T(`S = ${setText(S())}: E[χ_S] = P[S] = ${fq(p)}`, `S = ${setText(S())}: E[χ_S] = P[S] = ${fq(p)}`));
  };

  // ── pointer ───────────────────────────────────────────────────
  const colAt = (x: number, y: number) => {
    if (y < geom.top || y > geom.bottom) return -1;
    return geom.cols.findIndex(([a, b]) => x >= a && x < b) % pre().a.length;
  };
  const rowAt = (x: number, y: number) => (x >= geom.tx0 && x <= geom.tx1 ? geom.rows.findIndex(([a, b]) => y >= a && y < b) : -1);
  const dragging = pointer(plate.svg, {
    down: (x, y) => {
      const i = colAt(x, y);
      if (i >= 0) { toggle(i); say(); ctx.invalidate(); return false; }
      const r = rowAt(x, y);
      if (r >= 0) { setS(allEvents(3)[r]); say(); ctx.invalidate(); }
      return false;
    },
    hover: (x, y) => {
      const i = colAt(x, y), r = rowAt(x, y);
      if (i !== hover || r !== hoverRow) { hover = i; hoverRow = r; ctx.invalidate(); }
    },
    leave: () => { if (hover !== -1 || hoverRow !== -1) { hover = -1; hoverRow = -1; ctx.invalidate(); } },
  });

  const R = (key: string, x: number, y: number, parts: Part[], o: TextOpts = {}) => {
    const size = o.size ?? plate.fs;
    const segs: Seg[] = parts.map((p) => (typeof p === 'string' ? ['t', p] : [p[1], it(p[0])]));
    // rich() sets the alphabetic baseline; 0.34 em lower centres a line on y
    return { w: rich(plate, ctx, key, x, o.baseline === 'middle' ? y + 0.34 * size : y, segs, { anchor: o.anchor, size, fill: o.fill, layer: o.layer, weight: o.weight }) };
  };
  // chi_S, with subscript S, in math italic
  const CS: Part[] = [[chi, 'm'], ['S', 's']];

  // ── drawing ───────────────────────────────────────────────────
  const paint = (ease: boolean) => {
    const fs = plate.begin(ease);
    const k = ctx.tokens;
    const { W, H } = plate;
    const ink = k.color('plate-ink'), muted = k.color('plate-muted'), rule = k.color('plate-rule'), state = k.color('state'), effect = k.color('effect');
    const pr = pre();
    const n = pr.a.length;
    const s = S();
    const pw = weights(pr.a);
    const ch = indicator(s, n);
    const terms = indicatorTerms(pr.a, s);
    const pS = probability(pr.a, s);
    const eS = expectation(pr.a, ch);
    const table = pr.key === 'three';
    const D = pr.a.reduce((x, y) => x + y, 0);

    // panel extents; on a narrow plate the three-outcome case leaves out panel (a): the table
    // lists the values of chi_S itself, and gets the room
    const compact = table && W < 520;
    const aL = 3.0 * fs, aR = table ? W * 0.21 : W * 0.37;
    const bL = compact ? 3.0 * fs : aR + 4.2 * fs, bR = compact ? W * 0.4 : table ? W * 0.55 : W - 1.0 * fs;
    const y0 = H - 3.6 * fs, y1 = 5.4 * fs;
    geom.top = y1 - 1.2 * fs; geom.bottom = y0 + 2.0 * fs;
    geom.cols = [];
    const slotA = (aR - aL) / n, slotB = (bR - bL) / n;
    const bw = Math.min(slotA, slotB) * 0.56;

    // (a) chi_S: value 1 on S, 0 elsewhere, dashed like a measurement
    if (!compact) drawA();
    function drawA() {
    const YA = (v: number) => y0 - v * (y0 - y1);
    plate.line('a-grid-1', aL, YA(1), aR, YA(1), rule, k.stroke('hair'));
    plate.line('a-axis-x', aL, y0, aR, y0, ink, k.stroke('thin'));
    plate.line('a-axis-y', aL, y0, aL, y1 - 0.9 * fs, ink, k.stroke('thin'));
    plate.text('a-0', aL - 0.45 * fs, YA(0), '0', { anchor: 'end', baseline: 'middle', fill: muted });
    plate.text('a-1', aL - 0.45 * fs, YA(1), '1', { anchor: 'end', baseline: 'middle', fill: muted });
    R('a-name', aL, y1 - 1.5 * fs, [...CS, ['(x)', 'm']]);
    for (let i = 0; i < n; i++) {
      const cx = aL + (i + 0.5) * slotA;
      const h = YA(ch[i]);
      const on = i === hover;
      plate.path(`a-chi-${i}`, [[cx - bw / 2, y0], [cx - bw / 2, h], [cx + bw / 2, h], [cx + bw / 2, y0]], {
        stroke: effect, 'stroke-width': k.stroke(on ? 'dynamics' : 'effect'), 'stroke-dasharray': k.dash('effect').join(' '),
      });
      plate.text(`a-lab-${i}`, cx, y0 + 1.25 * fs, pr.labels[i], { weight: ch[i] ? '600' : 'normal' });
      geom.cols.push([aL + i * slotA, aL + (i + 1) * slotA]);
      plate.rect(`a-hit-${i}`, aL + i * slotA, geom.top, slotA, geom.bottom - geom.top, { fill: 'transparent', class: 'c01-hit' }, 'handles', false);
    }
    R('a-title', (aL + aR) / 2, H - 0.55 * fs, ['(a) ', [`S = ${setText(s)}`, 'm']], { fill: muted });
    }

    // (b) p(x) outlined, p(x) chi_S(x) hatched
    const top = Math.max(...pw.map((q) => Number(q.num) / Number(q.den))) * 1.18;
    const YB = (v: number) => y0 - (v / top) * (y0 - y1);
    const marks = new Map<string, Fraction>();
    for (const q of pw) if (q.num > 0n) marks.set(fq(q), q);
    for (const [lab, q] of marks) {
      const v = Number(q.num) / Number(q.den);
      plate.line(`b-grid-${lab}`, bL, YB(v), bR, YB(v), rule, k.stroke('hair'));
      plate.fraction(`b-tick-${lab}`, bL - 0.45 * fs, YB(v), q, { anchor: 'end', fill: muted, size: fs * 0.9 });
    }
    plate.text('b-0', bL - 0.45 * fs, YB(0), '0', { anchor: 'end', baseline: 'middle', fill: muted });
    plate.line('b-axis-x', bL, y0, bR, y0, ink, k.stroke('thin'));
    plate.line('b-axis-y', bL, y0, bL, y1 - 0.9 * fs, ink, k.stroke('thin'));
    R('b-name', bL, y1 - 1.5 * fs, [[`${P.unicode}(x)`, 'm']]);
    for (let i = 0; i < n; i++) {
      const cx = bL + (i + 0.5) * slotB;
      const v = Number(pw[i].num) / Number(pw[i].den);
      const t = Number(terms[i].num) / Number(terms[i].den);
      const on = i === hover;
      plate.rect(`b-prod-${i}`, cx - bw / 2, YB(t), bw, y0 - YB(t), { fill: plate.hatchFill });
      plate.rect(`b-p-${i}`, cx - bw / 2, YB(v), bw, y0 - YB(v), { fill: 'none', stroke: state, 'stroke-width': k.stroke(on ? 'dynamics' : 'state') }, 'marks');
      plate.text(`b-lab-${i}`, cx, y0 + 1.25 * fs, pr.labels[i], { weight: ch[i] ? '600' : 'normal' });
      geom.cols.push([bL + i * slotB, bL + (i + 1) * slotB]);
      plate.rect(`b-hit-${i}`, bL + i * slotB, geom.top, slotB, geom.bottom - geom.top, { fill: 'transparent', class: 'c01-hit' }, 'handles', false);
    }
    R('b-title', (bL + bR) / 2, H - 0.55 * fs, ['(b) ', [`${P.unicode}(x) `, 'm'], ...CS, ['(x)', 'm']], { fill: muted });

    // the sum: E[chi_S] = P[S] = terms = total
    const eqY = 1.7 * fs;
    let ex = table ? 1.0 * fs : bL - 2.0 * fs;
    ex += R('eq-head', ex, eqY, [[`${E.unicode}[`, 'm'], ...CS, [`] = ${Pr.unicode}[S] = `, 'm']], { anchor: 'start', baseline: 'middle' }).w + 0.15 * fs;
    let first = true;
    s.forEach((i) => {
      const q = pr.common ? { num: BigInt(pr.a[i]), den: BigInt(D) } : terms[i];
      ex += plate.fraction(`eq-t-${i}`, ex, eqY, q, { anchor: 'start', prefix: first ? '' : '+ ' }) + 0.15 * fs;
      first = false;
    });
    plate.fraction('eq-total', ex, eqY, pS, { anchor: 'start', prefix: s.length === 0 ? '' : '= ', weight: '600' });

    // the table of all eight events (three outcomes)
    geom.rows = []; geom.tx0 = 0; geom.tx1 = 0;
    if (table) {
      const all = allEvents(3);
      const tx0 = compact ? W * 0.45 : W * 0.6, tx1 = W - 0.6 * fs;
      const rh = Math.min((compact ? 1.75 : 1.55) * fs, (H - 3.2 * fs) / 9.2);
      const ty = Math.max((H - 9 * rh) / 2, 3.0 * fs);
      const cw = (tx1 - tx0);
      // column widths from the measured header and widest entry; the slack is shared out evenly
      const hs0 = fs * 0.92;
      const fullP = plate.measure(`${Pr.unicode}[S] = ${E.unicode}[χS]`, hs0, undefined, true);
      const want = [plate.measure('{1, 2, 3}', hs0, '700', true), ...[0, 1, 2].map(() => plate.measure('χS(3)', hs0, undefined, true)), fullP].map((w) => w + 0.9 * fs);
      let total = want.reduce((a, b) => a + b, 0);
      const shortP = total > cw;
      if (shortP) { want[4] = plate.measure(`${Pr.unicode}[S]`, hs0, undefined, true) + 0.9 * fs; total = want.reduce((a, b) => a + b, 0); }
      const scale = Math.min(1, cw / total);
      const slack = Math.max(0, cw - total) / 5;
      const cols: number[] = [];
      let cx0 = tx0;
      for (const w of want) { cols.push(cx0 + (w * scale + slack) / 2); cx0 += w * scale + slack; }
      geom.tx0 = tx0; geom.tx1 = tx1;
      plate.line('t-top', tx0, ty, tx1, ty, ink, k.stroke('regular'), {}, 'grid', false);
      plate.line('t-mid', tx0, ty + rh, tx1, ty + rh, ink, k.stroke('thin'), {}, 'grid', false);
      plate.line('t-bot', tx0, ty + 9 * rh, tx1, ty + 9 * rh, ink, k.stroke('regular'), {}, 'grid', false);
      const hy = ty + rh / 2;
      const ho: TextOpts = { baseline: 'middle', math: true, size: hs0 * Math.max(0.75, scale), layer: 'labels' };
      plate.text('t-h-S', cols[0], hy, it('S'), ho);
      for (let j = 0; j < 3; j++) R(`t-h-chi-${j}`, cols[1 + j], hy, [...CS, [`(${j + 1})`, 'm']], ho);
      if (shortP) plate.text('t-h-P', cols[4], hy, `${Pr.unicode}[${it('S')}]`, ho);
      else R('t-h-P', cols[4], hy, [[`${Pr.unicode}[S] = ${E.unicode}[`, 'm'], ...CS, [']', 'm']], ho);
      const cur = all.findIndex((e) => e.join() === s.join());
      all.forEach((ev, r) => {
        const ry = ty + (r + 1) * rh;
        geom.rows.push([ry, ry + rh]);
        const isCur = r === cur;
        if (isCur) {
          // the current event: a heavy frame and a hatched tab at its left, like the hatched products in (b)
          plate.rect('t-cur', tx0 + 0.1 * fs, ry + 0.08 * rh, cw - 0.2 * fs, rh * 0.84, { fill: 'none', stroke: ink, 'stroke-width': k.stroke('state'), rx: 2 }, 'back');
          plate.rect('t-tab', tx0 + 0.1 * fs, ry + 0.08 * rh, 0.7 * fs, rh * 0.84, { fill: plate.hatchFill, stroke: ink, 'stroke-width': k.stroke('thin') }, 'back');
        }
        if (r === hoverRow && !isCur) plate.rect('t-hov', tx0 + 0.1 * fs, ry + 0.08 * rh, cw - 0.2 * fs, rh * 0.84, { fill: 'none', stroke: muted, 'stroke-width': k.stroke('thin'), rx: 2 }, 'back', false);
        const o: TextOpts = { baseline: 'middle', math: true, size: Math.min(fs, rh * 0.68) * Math.max(0.8, scale), weight: isCur ? '700' : 'normal' };
        const cy = ry + rh / 2;
        plate.text(`t-${r}-S`, cols[0], cy, ev.length === 0 ? '∅' : `{${ev.map((i) => i + 1).join(', ')}}`, o);
        const ind = indicator(ev, 3);
        for (let j = 0; j < 3; j++) plate.text(`t-${r}-c${j}`, cols[1 + j], cy, String(ind[j]), o);
        plate.text(`t-${r}-P`, cols[4], cy, fq(probability(pr.a, ev)), o);
        plate.rect(`t-hit-${r}`, tx0, ry, cw, rh, { fill: 'transparent', class: 'c01-hit' }, 'handles', false);
      });
    }

    if (hover >= 0) {
      plate.tip(bL + (hover + 0.5) * slotB, YB(Number(pw[hover].num) / Number(pw[hover].den)), [
        `${CHI.unicode}(${pr.labels[hover]}) = ${ch[hover]}`,
        `${P.unicode}(${pr.labels[hover]}) = ${fq(pw[hover])}`,
        `${P.unicode}(${pr.labels[hover]}) ${CHI.unicode}(${pr.labels[hover]}) = ${fq(terms[hover])}`,
      ]);
    }
    plate.end();

    const comp = pr.a.map((_, i) => i).filter((i) => !events[pi].has(i));
    outP.set(`= ${fq(eS)}`);
    outC.set(`= ${fq(probability(pr.a, comp))} = 1 − ${fq(pS)}`);
    caption.innerHTML = T(
      `Klicken Sie Ergebnisse an (oder benutzen Sie die Knöpfe ■/□), um sie in <math><mi>S</mi></math> aufzunehmen oder herauszunehmen. Die Indikatorfunktion lässt nur die Balken über <math><mi>S</mi></math> übrig; ihre Höhen ergeben zusammen ${mq(pS)}.${table ? ' Rechts alle acht Ereignisse von <math><mi>X</mi><mo>=</mo><mo>{</mo><mn>1</mn><mo>,</mo><mn>2</mn><mo>,</mo><mn>3</mn><mo>}</mo></math>; ein Klick auf eine Zeile wählt sie.' : ''} Abspielen geht alle Ereignisse in der Reihenfolge der Tabelle durch.`,
      `Click outcomes (or use the ■/□ buttons) to put them into <math><mi>S</mi></math> or take them out. The indicator function keeps only the bars over <math><mi>S</mi></math>; their heights add up to ${mq(pS)}.${table ? ' On the right all eight events of <math><mi>X</mi><mo>=</mo><mo>{</mo><mn>1</mn><mo>,</mo><mn>2</mn><mo>,</mo><mn>3</mn><mo>}</mo></math>; a click on a row selects it.' : ''} Play walks through all events in the order of the table.`);
  };

  return {
    render(_frame, time) {
      // play walks through all events in table order, one every STEP seconds, starting from the
      // reader's current event; the clock only moves it while it runs (frame 0 is the figure)
      const st = Math.floor(time / STEP);
      if (st !== lastStep) {
        const all = allEvents(pre().a.length);
        const m = all.length;
        setS(all[(((eventIndex() + st - lastStep) % m) + m) % m]);
        lastStep = st;
      }
      // the steps are jumps between states, so they are eased like a click
      paint(!ctx.deterministic && !ctx.reducedMotion && !dragging());
    },
    destroy() { plate.svg.remove(); },
    info: () => ({ preset: pre().key, event: S().map((i) => i + 1).join(','), probability: fq(probability(pre().a, S())) }),
  };
}
